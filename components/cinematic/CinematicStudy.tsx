"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import ProjectAtlas from "./ProjectAtlas";
import styles from "./study.module.css";

type Cut = "a" | "b";
type Language = "en" | "tr";
type Props = { cut: Cut; lang: Language };

const copy = {
  en: {
    exhibition: "A study in motion",
    title: ["The opening", "move."],
    deck: "One player makes a move. The other waits. Two cuts of the same moment, seen from opposite sides of the board.",
    film: "Chess film",

    back: "Portfolio home",
    edition: "Film edition",
    angle: ["A · The reply", "B · The absence"],
    play: "Play film",
    pause: "Pause film",
    sound: "Sound",
    on: "on",
    off: "off",
    still: "Chess pieces on a board, from the opening move film.",
    unavailable: "Film playback is unavailable. The still is shown.",
    works: "Explore the projects",
  },
  tr: {
    exhibition: "Hareket üzerine bir çalışma",
    title: ["Açılış", "hamlesi."],
    deck: "Biri hamlesini yapıyor, diğeri bekliyor. Aynı anın iki kurgusunu tahtanın iki tarafından izle.",
    film: "Satranç filmi",

    back: "Portföy ana sayfası",
    edition: "Film seçimi",
    angle: ["A · Karşı hamle", "B · Yokluk"],
    play: "Filmi oynat",
    pause: "Filmi duraklat",
    sound: "Ses",
    on: "açık",
    off: "kapalı",
    still: "Açılış hamlesi filminden satranç tahtası ve taşlar.",
    unavailable: "Film oynatılamıyor. Film karesi gösteriliyor.",
    works: "Projeleri keşfet",
  },
};

type PlaybackPreferences = {
  intent: boolean | null;
  setIntent: (value: boolean) => void;
  sound: boolean;
  setSound: (value: boolean) => void;
};

function Film({ cut, lang, intent, setIntent, sound, setSound }: Props & PlaybackPreferences) {
  const words = copy[lang];
  const viewport = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const audio = useRef<HTMLAudioElement>(null);
  const [visible, setVisible] = useState(false);
  const [reduce, setReduce] = useState(true);
  const [error, setError] = useState(false);
  const [playing, setPlaying] = useState(false);
  const base = "/cinematic/chess-" + cut;
  const active = visible && !error && (intent ?? !reduce);

  useEffect(() => {
    const el = viewport.current;
    if (!el) return;
    const preference = matchMedia("(prefers-reduced-motion: reduce)");
    const motion = () => setReduce(preference.matches);
    let inFrame = false;
    const update = () => setVisible(inFrame && !document.hidden);
    const observer = new IntersectionObserver(
      ([entry]) => {
        inFrame = entry?.isIntersecting ?? false;
        update();
      },
      { threshold: 0.05 },
    );
    observer.observe(el);
    motion();
    preference.addEventListener("change", motion);
    document.addEventListener("visibilitychange", update);
    return () => {
      observer.disconnect();
      preference.removeEventListener("change", motion);
      document.removeEventListener("visibilitychange", update);
    };
  }, []);

  useEffect(() => {
    const player = video.current;
    if (!player) return;
    if (active) {
      if (!player.hasAttribute("src")) player.src = base + ".mp4";
      void player.play().catch(() => setPlaying(false));
    } else {
      player.pause();
    }
  }, [active, base]);

  useEffect(() => {
    const track = audio.current;
    const picture = video.current;
    if (!track || !picture) return;
    if (sound && playing && active) {
      let listening = true;
      const synchronize = () => {
        if (Number.isFinite(track.duration) && track.duration > 0) {
          const position = picture.currentTime % track.duration;
          if (Math.abs(track.currentTime - position) > 0.2) track.currentTime = position;
        }
      };
      synchronize();
      track.addEventListener("loadedmetadata", synchronize);
      picture.addEventListener("timeupdate", synchronize);
      void track.play().catch(() => {
        if (listening) setSound(false);
      });
      return () => {
        listening = false;
        track.removeEventListener("loadedmetadata", synchronize);
        picture.removeEventListener("timeupdate", synchronize);
        track.pause();
      };
    } else {
      track.pause();
    }
  }, [active, sound, playing, setSound]);

  return (
    <figure id="film" className={styles.figure}>
      <div ref={viewport} className={styles.screen}>
        <video
          ref={video}
          aria-label={words.still}
          poster={base + ".webp"}
          muted
          loop
          playsInline
          preload="none"
          onPlaying={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onError={() => setError(true)}
        />
        <span aria-hidden="true" className={styles.frameTag}>
          FIG. 01 / {cut.toUpperCase()}
        </span>
      </div>
      <figcaption className={styles.transport}>
        <span>
          {words.film} / {cut.toUpperCase()}
        </span>
        <div>
          <button
            disabled={error}
            onClick={() => {
              if (!playing && active && video.current)
                void video.current.play().catch(() => setPlaying(false));
              setIntent(!playing);
            }}
          >
            {playing ? words.pause : words.play}
          </button>
          <button aria-pressed={sound} disabled={error} onClick={() => setSound(!sound)}>
            {words.sound} {sound ? words.on : words.off}
          </button>
        </div>
      </figcaption>
      {error && <p role="status">{words.unavailable}</p>}
      <audio
        ref={audio}
        src={sound ? "/cinematic/chess-sound.wav" : undefined}
        preload="none"
        loop
      />
    </figure>
  );
}

export function CinematicStudy({ cut, lang }: Props) {
  const [intent, setIntent] = useState<boolean | null>(null);
  const [sound, setSound] = useState(false);
  const words = copy[lang];
  const href = (nextCut: Cut, nextLang: Language) =>
    "/cinematic?cut=" + nextCut + "&lang=" + nextLang;

  return (
    <article lang={lang} className={styles.study} data-cut={cut}>
      <div className={styles.rail}>
        <Link href="/">← {words.back}</Link>
        <span>HD / Built in Layers</span>
        <nav aria-label={lang === "en" ? "Language" : "Dil"}>
          {(["en", "tr"] as const).map((language) => (
            <Link
              key={language}
              href={href(cut, language)}
              scroll={false}
              lang={language}
              aria-current={lang === language ? "page" : undefined}
            >
              {language.toUpperCase()}
            </Link>
          ))}
        </nav>
      </div>
      <div className={styles.spread}>
        <header className={styles.story}>
          <p className={styles.folio}>
            <i aria-hidden="true" />
            {words.exhibition}
          </p>
          <h1>
            {words.title[0]}
            <br />
            <em>{words.title[1]}</em>
          </h1>
          <p className={styles.deck}>{words.deck}</p>
          <a className={styles.atlasLink} href="#atlas">
            {words.works} <span aria-hidden="true">↓</span>
          </a>
        </header>
        <div className={styles.projection}>
          <nav className={styles.cuts} aria-label={words.edition}>
            <span>{words.edition}</span>
            {(["a", "b"] as const).map((variant, index) => (
              <Link
                key={variant}
                href={href(variant, lang)}
                scroll={false}
                aria-current={cut === variant ? "page" : undefined}
              >
                {words.angle[index]}
              </Link>
            ))}
          </nav>
          <Film
            key={cut}
            cut={cut}
            lang={lang}
            intent={intent}
            setIntent={setIntent}
            sound={sound}
            setSound={setSound}
          />
        </div>
      </div>
      <div id="atlas" className={styles.atlas}>
        <ProjectAtlas lang={lang} />
      </div>
    </article>
  );
}
