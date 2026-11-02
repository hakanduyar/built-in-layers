"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState, type CSSProperties, type ReactNode } from "react";
import styles from "./SignalIndexMonitor.module.css";

type RecordPlate = { slug: string; title: string; plate?: string; alt?: string };

export function SignalIndexMonitor({
  records,
  children,
}: {
  records: RecordPlate[];
  children: ReactNode;
}) {
  const [selection, select] = useState<string | null>(null);
  const focus = records.findIndex((record) => record.slug === selection);
  const active = records[focus];

  const [expanded, setExpanded] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const enlarge = useRef<HTMLButtonElement>(null);

  function step(offset: number) {
    const next = records[(focus + offset + records.length) % records.length];
    if (next) select(next.slug);
  }

  // The register stays server-rendered. Follow its existing rows without
  // adding another focus stop or altering how their case links navigate.
  function followRow(target: EventTarget | null) {
    if (!(target instanceof Element)) return;
    const slug = target.closest<HTMLElement>("[data-system-entry]")?.dataset.systemEntry;
    if (slug) select(slug);
  }

  return (
    <div
      className={styles.layout}
      onPointerOver={(event) => {
        if (event.pointerType !== "touch") followRow(event.target);
      }}
      onFocus={(event) => followRow(event.target)}
    >
      <div className={styles.instrument} role="group" aria-label="Project contact sheet">
        <div className={styles.aperture} aria-hidden="true">
          {records.map((record, index) => {
            const locked = index === focus;
            const distance = focus < 0 ? 0 : Math.abs(index - focus);
            return (
              <div
                key={record.slug}
                className={styles.strip}
                data-locked={locked}
                style={
                  {
                    flexGrow: focus < 0 ? 1 : locked ? 1 : 0,
                    "--travel": (index < focus ? -1 : 1) * (24 / Math.max(1, distance)) + "px",
                    "--settle": 470 + distance * 70 + "ms",
                  } as CSSProperties
                }
              >
                <span
                  className={styles.plate}
                  data-travel={focus >= 0 && !locked}
                  style={{ backgroundImage: record.plate ? `url("${record.plate}")` : undefined }}
                />
                {locked && <span className={styles.slip} />}
              </div>
            );
          })}
          {active && (
            <span key={active.slug} className={styles.caption}>
              {String(focus + 1).padStart(2, "0")} / {active.title}
            </span>
          )}
        </div>
        <div className={styles.targets} role="toolbar" aria-label="Select a project plate">
          {records.map((record, index) => (
            <button
              key={record.slug}
              type="button"
              tabIndex={index === Math.max(0, focus) ? 0 : -1}
              onKeyDown={(event) => {
                const destinations: Record<string, number> = {
                  ArrowRight: (index + 1) % records.length,
                  ArrowLeft: (index + records.length - 1) % records.length,
                  Home: 0,
                  End: records.length - 1,
                };
                const next = destinations[event.key];
                if (typeof next !== "number") return;
                event.stopPropagation();
                event.preventDefault();
                event.currentTarget.parentElement?.querySelectorAll("button")[next]?.focus();
              }}
              aria-pressed={selection === record.slug}
              aria-label={`Preview ${record.title}`}
              onFocus={() => select(record.slug)}
              onPointerEnter={(event) => {
                if (event.pointerType !== "touch") select(record.slug);
              }}
              onClick={() => select(record.slug)}
            >
              {String(index + 1).padStart(2, "0")}
            </button>
          ))}
        </div>
        <div className={styles.foot}>
          {active ? (
            <Link href={`/work/${active.slug}`} className="max-lg:inline-block max-lg:touch-link">
              Open {active.title} <span aria-hidden="true">↗</span>
            </Link>
          ) : (
            <span>Project contact sheet</span>
          )}
          {records.length > 0 && (
            <button
              type="button"
              ref={enlarge}
              aria-haspopup="dialog"
              aria-expanded={expanded}
              className={styles.enlarge}
              onClick={() => {
                if (!active && records[0]) select(records[0].slug);
                setExpanded(true);
                dialog.current?.showModal();
              }}
            >
              Enlarge <span aria-hidden="true">⛶</span>
            </button>
          )}
        </div>
        <dialog
          ref={dialog}
          className={styles.screen}
          aria-label="Project plate viewer"
          onClose={() => {
            setExpanded(false);
            select(null);
            enlarge.current?.focus({ preventScroll: true });
          }}
          onKeyDown={(event) => {
            if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
            event.preventDefault();
            event.stopPropagation();
            step(event.key === "ArrowRight" ? 1 : -1);
          }}
        >
          <div className={styles.screenBody}>
            <header className={styles.screenBar}>
              <span aria-live="polite">
                {active ? String(focus + 1).padStart(2, "0") + " / " + active.title : ""}
              </span>
              <button type="button" autoFocus onClick={() => dialog.current?.close()}>
                Close ×
              </button>
            </header>
            <div className={styles.screenPlate}>
              {expanded && active?.plate && (
                <Image
                  src={active.plate}
                  alt={active.alt ?? active.title}
                  fill
                  sizes="100vw"
                  unoptimized
                />
              )}
            </div>
            <div className={styles.screenBar}>
              <div className={styles.steps}>
                <button type="button" onClick={() => step(-1)}>
                  ← Previous
                </button>
                <button type="button" onClick={() => step(1)}>
                  Next →
                </button>
              </div>
              {active && (
                <Link
                  href={`/work/${active.slug}`}
                  className="max-lg:inline-block max-lg:touch-link"
                >
                  Open case ↗
                </Link>
              )}
            </div>
          </div>
        </dialog>
      </div>
      <div className={styles.register}>{children}</div>
    </div>
  );
}
