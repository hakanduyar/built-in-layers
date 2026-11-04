"use client";

import { useEffect, useRef, useState } from "react";
import type { MotionValue } from "motion/react";
import { projectTour, ramp, signalPhase, type TourProject } from "@/lib/spatial/signalPhase";
import { scrollAtComposition } from "@/lib/spatial/passageScroll";
import { sceneFocusProgress } from "@/lib/spatial/sceneRoute";
import { CameraComparison, type CameraMode } from "./CameraComparison";
import { DepthCorridor } from "./DepthCorridor";
import styles from "./SignalPassage.module.css";

export type SignalFrame = { title: string; src: string; details: string[] };

type PassageProps = { progress: MotionValue<number>; frames: SignalFrame[]; mobile: boolean };

export function SignalPassage({ progress, frames, mobile }: PassageProps) {
  const [leg, setLeg] = useState(-1);
  const [mode, setMode] = useState<CameraMode | null>(null);
  const positioned = useRef(false);
  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get("camera");
    if (requested !== "guided" && requested !== "look") return;
    const spacer = document.querySelector<HTMLElement>("[data-route-spacer]");
    if (!spacer || positioned.current) return;
    const id = requestAnimationFrame(() => {
      setMode(requested);
      const start = sceneFocusProgress("software-factory", mobile);
      const end = sceneFocusProgress("kivilcim", mobile);
      const at = scrollAtComposition(start + (end - start) * 0.46, mobile);
      window.scrollTo({
        top:
          spacer.getBoundingClientRect().top + scrollY + (spacer.clientHeight - innerHeight) * at,
        behavior: "instant",
      });
      positioned.current = true;
    });
    return () => cancelAnimationFrame(id);
  }, [mobile]);
  function switchMode(next: CameraMode) {
    const url = new URL(window.location.href);
    url.searchParams.set("camera", next);
    window.history.replaceState(window.history.state, "", url);
    setMode(next);
  }
  useEffect(() => {
    const select = (value: number) => {
      const index = projectTour.findIndex((from, i) => {
        const to = projectTour[i + 1];
        if (!to) return false;
        const t = signalPhase(value, mobile, from, to);
        return t > -0.08 && t < 1.04;
      });
      setLeg(index);
    };
    select(progress.get());
    return progress.on("change", select);
  }, [mobile, progress]);
  const from = projectTour[leg];
  const to = projectTour[leg + 1];
  const destination = frames[leg + 1];
  if (!from || !to || !destination) return null;
  return (
    <Exposure
      key={from}
      {...{ progress, frames, mobile, leg, from, to, destination, mode, switchMode }}
    />
  );
}

function Exposure({
  progress,
  frames,
  mobile,
  leg,
  from,
  to,
  destination,
  mode,
  switchMode,
}: PassageProps & {
  leg: number;
  from: TourProject;
  to: TourProject;
  destination: SignalFrame;
  mode: CameraMode | null;
  switchMode: (mode: CameraMode) => void;
}) {
  const stage = useRef<HTMLDivElement>(null);
  const landing = useRef<HTMLImageElement>(null);
  const departure = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const field = stage.current;
    const lock = landing.current;
    if (!field || !lock || !destination) return;
    const target = document.querySelector<HTMLImageElement>(
      `[data-scene="${to}"] [data-project-ground-source] img[src="${destination.src}"]`,
    );
    const source = document.querySelector<HTMLImageElement>(
      `[data-scene="${from}"] [data-project-ground-source] img`,
    );
    const outgoing = departure.current;
    if (!target || !source || !outgoing) return;
    let raf = 0;
    let previousPhase: number | null = null;
    function paint() {
      raf = 0;
      if (!field || !lock || !target || !source || !outgoing) return;
      const t = signalPhase(progress.get(), mobile, from, to);
      const crossed = previousPhase !== null && previousPhase < 0.44 !== t < 0.44;
      previousPhase = t;
      field.hidden = t <= 0 || t >= 1;
      if (field.hidden) {
        target.style.removeProperty("opacity");
        source.style.removeProperty("opacity");
        return;
      }
      // Reveal the original plate only after the traveling copy registers
      // with it. Otherwise the same screenshot ghosts through the zoom.
      target.style.opacity = String(t < 0.68 ? 1 : ramp(0.97, 1, t));
      const w = field.clientWidth;
      const h = field.clientHeight;
      const settle = ramp(0.68, 0.97, t);
      const reveal = ramp(0.49, 0.81, t);
      const retreat = ramp(0, 0.34, t);
      const sourceRect = source.getBoundingClientRect();
      const shrink = 1 - retreat * 0.86;
      const sx =
        sourceRect.left + (w * 0.5 - sourceRect.left - (sourceRect.width * shrink) / 2) * retreat;
      const sy =
        sourceRect.top + (h * 0.46 - sourceRect.top - (sourceRect.height * shrink) / 2) * retreat;
      outgoing.style.transform = `translate3d(${sx}px,${sy}px,0)`;
      outgoing.style.width = `${sourceRect.width * shrink}px`;
      outgoing.style.height = `${sourceRect.height * shrink}px`;
      outgoing.style.opacity = String(1 - ramp(0.24, 0.4, t));
      const sourceMask = source.parentElement?.getBoundingClientRect();
      if (sourceMask && source.parentElement?.style.getPropertyValue("--detail-ar")) {
        const edges = [
          sourceMask.top - sourceRect.top,
          sourceRect.right - sourceMask.right,
          sourceRect.bottom - sourceMask.bottom,
          sourceMask.left - sourceRect.left,
        ];
        outgoing.style.clipPath = `inset(${edges.map((edge) => Math.max(0, edge) * shrink + "px").join(" ")})`;
      } else outgoing.style.clipPath = "";

      source.style.opacity = String(1 - ramp(0, 0.21, t));

      const rect = t >= 0.68 ? target.getBoundingClientRect() : null;
      const mix = (a: number, b: number) => a + (b - a) * settle;
      const width = w * (0.035 + (leg === 2 ? 0.845 : 0.665) * reveal);
      const height = h * (0.025 + (leg === 2 ? 0.775 : 0.605) * reveal);
      const center = 0.59 - 0.09 * reveal;
      const x = w * (leg === 1 ? 1 - center : center) - width / 2;
      lock.style.opacity = String(ramp(0.43, 0.58, t));
      const y = h * (0.49 - 0.04 * reveal) - height / 2;
      lock.style.transform = `translate3d(${mix(x, rect?.left ?? x)}px,${mix(y, rect?.top ?? y)}px,0)`;
      lock.style.width = `${mix(width, rect?.width ?? width)}px`;
      lock.style.height = `${mix(height, rect?.height ?? height)}px`;
      if (rect && target.parentElement?.style.getPropertyValue("--detail-ar")) {
        const mask = target.parentElement.getBoundingClientRect();
        const inset = [
          mask.top - rect.top,
          rect.right - mask.right,
          rect.bottom - mask.bottom,
          mask.left - rect.left,
        ];
        lock.style.clipPath = `inset(${inset.map((edge) => Math.max(0, edge) * settle + "px").join(" ")})`;
      } else {
        lock.style.clipPath = "";
      }
      // The eye moves into the archive, then eases back onto the incoming plate.
      // All three axes are derived from position, so reversing scroll retraces the shot.
      const arc = Math.sin(t * Math.PI);
      field.style.setProperty("--dolly", String(arc * arc));
      field.style.setProperty("--rise", String(Math.sin(t * Math.PI * 2) * arc));
      field.style.setProperty("--travel", String(t));
      field.style.setProperty("--enter", String(ramp(0, 0.21, t) * (1 - ramp(0.97, 1, t))));
      field.style.setProperty("--paper", String(ramp(0.02, 0.29, t) * (1 - ramp(0.69, 0.97, t))));
      field.style.setProperty("--ink", String(1 - ramp(0.62, 0.81, t)));
      field.style.setProperty("--color", String(1 - reveal));
      if (crossed && t > 0.26 && t < 0.59) field.dataset.signalPulse = "";
    }
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(paint);
    };
    paint();
    const stop = progress.on("change", schedule);
    window.addEventListener("resize", schedule);
    return () => {
      stop();
      target.style.removeProperty("opacity");
      source.style.removeProperty("opacity");
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", schedule);
    };
  }, [destination, from, leg, mobile, progress, to]);

  return (
    <>
      <div ref={stage} data-signal-passage={to} className={styles.stage} aria-hidden="true" hidden>
        <div className={styles.paper} />
        <DepthCorridor {...{ progress, mobile, from, to, frames }} />
        {/* eslint-disable-next-line @next/next/no-img-element -- retreat from original evidence */}
        <img
          ref={departure}
          className={styles.landing}
          src={frames[leg]?.src}
          alt=""
          draggable={false}
        />
        {/* eslint-disable-next-line @next/next/no-img-element -- match the incoming scene's original image */}
        <img
          data-signal-landing=""
          ref={landing}
          className={styles.landing}
          src={destination.src}
          alt=""
          draggable={false}
        />
        <div
          className={styles.register}
          onAnimationEnd={() => {
            if (stage.current) delete stage.current.dataset.signalPulse;
          }}
        >
          <i />0{leg + 1}—0{leg + 2}
          <span>{destination.title}</span>
          <i />
        </div>
        <div className={styles.slip} />
      </div>
      {mode && <CameraComparison key={mode} stage={stage} mode={mode} switchMode={switchMode} />}
    </>
  );
}
