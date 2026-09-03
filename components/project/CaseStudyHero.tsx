import type { ReactNode } from "react";
import { Figure } from "@/components/ui/Figure";
import { MonoLabel } from "@/components/ui/MonoLabel";
import { TextLink } from "@/components/ui/TextLink";
import type { ProjectFrontmatter } from "@/lib/content/schemas";
import { representativeAsset } from "@/lib/spatial/systemPov";

type CaseStudyHeroProps = {
  project: ProjectFrontmatter;
};

// The same reader-facing translations Selected Systems uses for its record
// line (components/sections/SelectedSystems.tsx). Kept local rather than
// exported from that frozen homepage file: the two surfaces must say the same
// thing about the same field, and this is the whole vocabulary.
const VERIFICATION_LABEL: Record<ProjectFrontmatter["verificationStatus"], string> = {
  verified: "Verified against source",
  partial: "Partly verified",
  "requires-user": "Not yet verified",
  "do-not-publish": "Not published",
};

const PROVENANCE_LABEL: Record<ProjectFrontmatter["provenance"], string> = {
  personal: "Personal",
  professional: "Professional",
  internship: "Internship",
  fork: "Fork",
  learning: "Learning",
};

/** "active-development" -> "Active development". Display only. */
function humanise(value: string): string {
  const spaced = value.replace(/-/g, " ");
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

function RecordRow({ term, children }: { term: string; children: ReactNode }) {
  return (
    <div className="border-t border-line py-3">
      <dt className="font-mono text-mono-meta tracking-mono-label uppercase text-ink-muted">
        {term}
      </dt>
      <dd className="mt-1 font-display text-body text-ink">{children}</dd>
    </div>
  );
}

// IA section 1: Project hero.
//
// V13 (Fable gate, finding D). Measured on the production build at 1440x900:
// the hero was a 40px title (no larger than the `heading-l` section headings
// that followed it, and 24px smaller than the same project's title on the
// homepage), a 42rem column against a 1320px container, no
// evidence anywhere in the fold (the first figure sat ~3000px down inside a
// tab), and the two fields the content model requires of every featured
// project -- `contribution`, and `aiDisclosure` when `aiAssisted` -- rendered
// nowhere on the site. The composition now follows DESIGN_SYSTEM §4's
// asymmetry: title on columns 1-10 at display scale, the lead plate on 1-8
// with the record on 10-12 beside it, then the contribution on the reading
// column with the AI disclosure in the meta column. Every value is read off
// the validated frontmatter; nothing here is written per project.
export function CaseStudyHero({ project }: CaseStudyHeroProps) {
  // The same rule the spatial scene and its system annotation use to choose a
  // lead asset (lib/spatial/systemPov.ts), so the plate a reader arrives from
  // is the plate the destination opens with.
  const lead = representativeAsset(project);

  return (
    <header className="grid grid-cols-1 gap-x-6 lg:grid-cols-12">
      <div className="lg:col-span-10">
        <MonoLabel className="text-ink-muted">{project.categoryLabel}</MonoLabel>
        {/* Display scale, sentence case: the SpatialProjectScene precedent for
            project titles (D-017 keeps Kıvılcım's dotless ı out of uppercase). */}
        <h1 className="mt-4 font-display text-display-l tracking-display-l text-ink">
          {project.title}
        </h1>
      </div>

      <div className="mt-6 lg:col-span-8">
        <p className="max-w-[42rem] font-display text-body-l text-ink">{project.description}</p>
        {/* CONTENT_MODEL §9: upstream disclosure is mandatory in any rendering
            of a fork-provenance project, not just metadata. */}
        {project.upstream && (
          <p className="mt-4 max-w-[42rem] font-mono text-mono-meta tracking-mono-meta text-ink-muted">
            A fork of{" "}
            <TextLink href={project.upstream.url} external>
              {project.upstream.name}
            </TextLink>
            , not an original project built from scratch.
          </p>
        )}
      </div>

      {lead && (
        <div className="mt-12 lg:col-span-8">
          <Figure src={lead.src} alt={lead.alt} caption={lead.caption} priority />
        </div>
      )}

      {/* The record: the five facts Selected Systems carries for every
          system (DESIGN_SYSTEM §33.6), in the meta column. A field that does
          not exist produces no row -- never a guessed value. */}
      <dl className="mt-12 lg:col-span-3 lg:col-start-10">
        {/* The disclosure line above already links the upstream; the record
            names it without repeating the link. */}
        <RecordRow term="Provenance">
          {project.upstream
            ? `Fork of ${project.upstream.name}`
            : PROVENANCE_LABEL[project.provenance]}
        </RecordRow>
        {project.phase && <RecordRow term="Phase">{humanise(project.phase)}</RecordRow>}
        <RecordRow term="Record">{VERIFICATION_LABEL[project.verificationStatus]}</RecordRow>
        {project.tech.length > 0 && <RecordRow term="Stack">{project.tech.join(" · ")}</RecordRow>}
        {project.links.length > 0 && (
          <RecordRow term="Access">
            <ul className="flex flex-wrap gap-x-4 gap-y-1">
              {project.links.map((link) =>
                link.visibility === "public" ? (
                  <li key={link.url}>
                    <TextLink href={link.url} external>
                      {link.label}
                    </TextLink>
                  </li>
                ) : (
                  <li key={link.label} className="text-ink-muted">
                    {link.label}
                  </li>
                ),
              )}
            </ul>
          </RecordRow>
        )}
      </dl>

      {/* CLAUDE.md §11: every featured project states Hakan's specific
          contribution. The schema requires the field; this is where it is
          read. */}
      {project.contribution && (
        <div className="mt-12 lg:col-span-8">
          <h2 className="font-mono text-mono-label tracking-mono-label uppercase text-ink">
            Contribution
          </h2>
          <p className="mt-4 max-w-[42rem] font-display text-body-l text-ink">
            {project.contribution}
          </p>
        </div>
      )}

      {/* CONTENT_MODEL §2: `aiDisclosure` is required whenever `aiAssisted` is
          true -- and a required disclosure that is never rendered is not a
          disclosure. Only the case-study destination carries it; the /work
          listing deliberately does not. */}
      {project.aiAssisted && project.aiDisclosure && (
        <div className="mt-12 lg:col-span-3 lg:col-start-10">
          <h2 className="font-mono text-mono-label tracking-mono-label uppercase text-ink">
            AI assistance
          </h2>
          <p className="mt-4 font-display text-body text-ink-muted">{project.aiDisclosure}</p>
        </div>
      )}
    </header>
  );
}
