<#
.SYNOPSIS
  Non-destructive observer for the autonomous pipeline.

.DESCRIPTION
  Reports pipeline state so an interrupted session can be resumed without the
  owner reconstructing context: git position, frozen-boundary integrity,
  expected return artifacts, and Codex quota availability.

  It deliberately does NOT act on the repository. It never merges, force
  pushes, resets, rebases, cleans, stashes, or deletes anything, and it holds
  no secrets. Advancing a stage is a judgement call made by the orchestrating
  agent after reading a real return artifact -- not something a polling script
  should ever do on its own.

.PARAMETER CheckQuota
  Additionally spend one cheap Codex call to test whether quota has returned.
  Off by default: quota probes cost tokens and must not be run in a tight loop.

.EXAMPLE
  pwsh .ai/orchestrator/pipeline-watchdog.ps1
  pwsh .ai/orchestrator/pipeline-watchdog.ps1 -CheckQuota
#>
[CmdletBinding()]
param(
    [switch]$CheckQuota
)

$ErrorActionPreference = 'Stop'
$repo = Resolve-Path (Join-Path $PSScriptRoot '..\..')
Set-Location $repo

$statePath = Join-Path $PSScriptRoot 'state.json'
if (-not (Test-Path $statePath)) { throw "Missing $statePath" }
$state = Get-Content $statePath -Raw | ConvertFrom-Json

function Write-Section($title) { Write-Host ''; Write-Host "== $title" }

Write-Section 'PIPELINE'
Write-Host ("stage    : {0} / {1}" -f $state.current_stage, $state.current_substage)
Write-Host ("order    : {0}" -f ($state.pipeline -join ' -> '))

Write-Section 'GIT'
$branch = (git branch --show-current).Trim()
$head = (git rev-parse HEAD).Trim()
git fetch origin --quiet
$originRef = "origin/$branch"
$origin = (git rev-parse $originRef 2>$null)
$dirty = git status --porcelain

Write-Host ("branch   : {0}" -f $branch)
Write-Host ("HEAD     : {0}" -f $head)
Write-Host ("origin   : {0}" -f $origin)
Write-Host ("in sync  : {0}" -f ($(if ($head -eq $origin) { 'yes' } else { 'NO -- unpushed or behind' })))
Write-Host ("frozen   : {0}" -f (git rev-parse $state.frozen_branch).Trim())
Write-Host ("main     : {0}" -f (git rev-parse main).Trim())

# Anything dirty other than the known intentional untracked bundle is worth surfacing.
$unexpected = $dirty | Where-Object { $_ -notmatch 'codex-gate-checkpoint\.bundle' }
if ($unexpected) {
    Write-Host 'tree     : UNCOMMITTED WORK PRESENT' -ForegroundColor Yellow
    $unexpected | ForEach-Object { Write-Host "           $_" }
} else {
    Write-Host 'tree     : clean (except the intentional V12 recovery bundle)'
}

Write-Section 'FROZEN BOUNDARY'
$base = $state.frozen_base
$moved = @()
foreach ($f in (git ls-tree -r --name-only HEAD | Select-String -Pattern '^(lib/spatial/|components/spatial/|components/sections/)').Line) {
    $a = (git rev-parse "${base}:$f" 2>$null)
    $b = (git rev-parse "HEAD:$f" 2>$null)
    if ($a -ne $b) { $moved += $f }
}
if ($moved.Count -eq 0) {
    Write-Host 'all frozen blobs unchanged'
} else {
    Write-Host "MOVED ($($moved.Count)):" -ForegroundColor Red
    $moved | ForEach-Object { Write-Host "  $_" }
}

Write-Section 'RETURN ARTIFACTS'
foreach ($pair in @(
    @{ n = 'codex architecture'; p = $state.codex.architecture_review.return },
    @{ n = 'codex slice review'; p = $state.codex.slice_re_review.return },
    @{ n = 'fable'; p = $state.fable.return }
)) {
    $exists = Test-Path $pair.p
    Write-Host ("{0,-20} {1,-9} {2}" -f $pair.n, $(if ($exists) { 'present' } else { 'absent' }), $pair.p)
}

if ($CheckQuota) {
    Write-Section 'CODEX QUOTA (one probe, not a loop)'
    $out = & codex exec -m $state.codex.model -c 'model_reasoning_effort="xhigh"' `
        -s read-only --ephemeral --skip-git-repo-check 'Reply with exactly: QUOTA_OK' 2>&1 | Out-String
    if ($out -match 'usage limit') {
        $when = [regex]::Match($out, 'try again at ([^\.]+)').Groups[1].Value
        Write-Host "PAUSED_FOR_QUOTA -- resets at $when" -ForegroundColor Yellow
        Write-Host 'Resume the SAME session id; do not restart from zero.'
    } elseif ($out -match 'QUOTA_OK') {
        Write-Host 'AVAILABLE'
    } else {
        Write-Host 'INDETERMINATE -- inspect manually:'
        Write-Host ($out.Trim() -split "`n" | Select-Object -Last 5)
    }
}

Write-Host ''
Write-Host 'Observation only. No repository state was changed.'
