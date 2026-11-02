"use client";

import Image from "next/image";
import { flushSync } from "react-dom";
import Link from "next/link";
import { useSyncExternalStore, type MouseEvent } from "react";
import cover from "./cover.module.css";
import styles from "./atlas.module.css";

type Language = "en" | "tr";

// Curated public plates from content/work/<slug>/index.mdx, in its published order.
// Only the fields printed in this exhibition are shipped to the browser.
const plates = [
  {
    slug: "software-factory",
    title: "Software Factory",
    image: "factory-loop-diagram.svg",
    label: ["Delivery loop", "Teslim döngüsü"],
    text: [
      "An orchestration core that routes work through test, review, and human-approval gates.",
      "İşi test, inceleme ve insan onayından geçiren bir orkestrasyon çekirdeği.",
    ],
    imageLabel: ["Verified system diagram", "Doğrulanmış sistem şeması"],
  },
  {
    slug: "kivilcim",
    title: "Kıvılcım",
    image: "focus-lifecycle.svg",
    label: ["Focus lifecycle", "Odak oturumunun aşamaları"],
    text: [
      "A local-first system for planning, focus, and personal growth.",
      "Planlama, odaklanma ve kişisel gelişim için verileri önce cihazda tutan bir sistem.",
    ],
    imageLabel: ["Verified state diagram", "Doğrulanmış durum şeması"],
  },
  {
    slug: "jointledger",
    title: "JointLedger",
    image: "book-data-model-diagram.svg",
    label: ["Book data model", "Defter veri modeli"],
    text: [
      "Personal accounts. Shared financial life. One coordinated system.",
      "Kişisel hesapları ve ortak finansal yaşamı bir arada düzenleyen bir sistem.",
    ],
    imageLabel: ["Verified architecture diagram", "Doğrulanmış mimari şema"],
  },
  {
    slug: "dropspot",
    title: "DropSpot",
    image: "browse-drops.webp",
    label: ["Browsing drops", "Ürünleri keşfetme"],
    text: [
      "A fair claim and waitlist system for limited-stock product drops.",
      "Sınırlı stokla satışa çıkan ürünler için adil bir talep ve bekleme listesi sistemi.",
    ],
    imageLabel: ["Product screenshot", "Ürün ekran görüntüsü"],
  },
  {
    slug: "professional-systems",
    title: "Professional Systems",
    image: "professional-systems-overview.svg",
    label: ["Systems overview", "Sistemlere genel bakış"],
    text: [
      "Designing usable interfaces within complex technical and organizational constraints.",
      "Karmaşık teknik ve kurumsal kısıtlar altında kullanılabilir arayüzler tasarlamak.",
    ],
    imageLabel: ["Editorial illustration", "Editoryal illüstrasyon"],
  },
] as const;

const imagePath = (plate: (typeof plates)[number]) =>
  "/images/projects/" + plate.slug + "/" + plate.image;
const plateNumber = (index: number) => String(index + 1).padStart(2, "0");
const fragment = (slug: string) => "#atlas-" + slug;

function selectedPlate() {
  const match = plates.findIndex((plate) => fragment(plate.slug) === window.location.hash);
  return match < 0 ? 0 : match;
}
function subscribe(notify: () => void) {
  window.addEventListener("hashchange", notify);
  return () => window.removeEventListener("hashchange", notify);
}
const firstPlate = () => 0;

async function enterPlate(event: MouseEvent<HTMLAnchorElement>, slug: string) {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey)
    return;
  const target = document.getElementById("atlas-" + slug);
  const origin = event.currentTarget.querySelector("img");
  const destination = document.querySelector<HTMLElement>('[data-plate-image="' + slug + '"]');
  if (
    !target ||
    !origin ||
    !destination ||
    !document.startViewTransition ||
    matchMedia("(prefers-reduced-motion: reduce)").matches ||
    document.documentElement.hasAttribute("data-atlas-jump")
  )
    return;
  event.preventDefault();
  document.documentElement.setAttribute("data-atlas-jump", "");
  origin.style.viewTransitionName = "atlas-plate";
  try {
    const transition = document.startViewTransition(() => {
      origin.style.viewTransitionName = "";
      destination.style.viewTransitionName = "atlas-plate";
      flushSync(() => {
        window.location.hash = fragment(slug);
        window.dispatchEvent(new HashChangeEvent("hashchange"));
      });
      target.focus({ preventScroll: true });
      target.scrollIntoView({ block: "start", behavior: "instant" });
    });
    await transition.finished;
  } finally {
    origin.style.viewTransitionName = "";
    destination.style.viewTransitionName = "";
    document.documentElement.removeAttribute("data-atlas-jump");
  }
}

export function AtlasCover({ lang }: { lang: Language }) {
  const tr = lang === "tr";
  return (
    <section className={cover.cover} aria-labelledby="cover-title">
      <div className={cover.margin}>
        <span>{tr ? "Seçilmiş işler" : "Selected works"} · 01—05</span>
        <nav aria-label={tr ? "Filme git" : "Jump to film"}>
          {(["a", "b"] as const).map((cut) => (
            <Link key={cut} href={"/cinematic?cut=" + cut + "&lang=" + lang + "#film"}>
              {tr ? "Filmi izle" : "Watch film"} {cut.toUpperCase()} ↓
            </Link>
          ))}
        </nav>
      </div>
      <div className={cover.field}>
        <svg
          className={cover.traces}
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path d="M8 20 H40 L49 10 H79 L86 17 V40 L70 53 H39 L27 67 V87 H49 L65 71 H94" />
          <path d="M16 38 V12 H61 L69 20 V85 H81" />
        </svg>
        <header className={cover.title}>
          <p>{tr ? "Portföy atlası" : "Portfolio atlas"}</p>
          <h1 id="cover-title">
            {tr ? "Katman" : "Built in"}
            <br />
            <em>{tr ? "katman." : "layers."}</em>
          </h1>
          <span>
            {tr
              ? "Beş projenin arayüzlerini ve altında çalışan sistemleri inceleyin."
              : "Explore the interfaces and the systems beneath them, across five projects."}
          </span>
        </header>
        {plates.map((plate, index) => (
          <a
            key={plate.slug}
            href={fragment(plate.slug)}
            className={cover.sheet}
            data-order={index}
            aria-label={(tr ? "Projeye yaklaş: " : "Enter plate: ") + plate.title}
            onClick={(event) => void enterPlate(event, plate.slug)}
          >
            <div className={cover.matte}>
              <Image unoptimized src={imagePath(plate)} width={640} height={400} alt="" />
            </div>
            <div className={cover.caption}>
              <small>{plateNumber(index)}</small>
              <span>{plate.title}</span>
              <b aria-hidden="true">↗︎</b>
            </div>
          </a>
        ))}
      </div>
      <div className={cover.foot}>
        <span>{tr ? "Bir proje seçin" : "Select a project"} ↗</span>
        <span>Hakan Duyar / Portfolio</span>
      </div>
    </section>
  );
}
export default function ProjectAtlas({ lang }: { lang: Language }) {
  const index = useSyncExternalStore(subscribe, selectedPlate, firstPlate);
  const local = lang === "tr" ? 1 : 0;
  const selected = plates[index] ?? plates[0];
  const title = lang === "tr" ? "Proje atlası" : "Project atlas";
  return (
    <section className={styles.atlas} aria-labelledby="atlas-heading">
      <div className={styles.inner}>
        <header className={styles.head}>
          <p className={styles.register}>
            {lang === "tr" ? "02 / Seçilmiş işler" : "02 / Selected work"}
          </p>
          <h2 id="atlas-heading">
            {title}
            <i>.</i>
          </h2>
          <span className={styles.counter} aria-hidden="true">
            {plateNumber(index)} / {plateNumber(plates.length - 1)}
          </span>
        </header>
        <div className={styles.gallery}>
          <nav className={styles.index} aria-label={title}>
            {plates.map((plate, i) => (
              <a
                key={plate.slug}
                id={"atlas-" + plate.slug}
                href={fragment(plate.slug)}
                aria-label={(lang === "tr" ? "Önizle: " : "Preview: ") + plate.title}
                aria-current={i === index ? "true" : undefined}
              >
                <Image
                  className={styles.thumb}
                  src={imagePath(plate)}
                  width={72}
                  height={44}
                  alt=""
                />
                <small>{plateNumber(i)}</small>
                <span>{plate.title}</span>
                <b aria-hidden="true">↗︎</b>
              </a>
            ))}
          </nav>
          <div className={styles.stage} aria-live="polite">
            <div className={styles.aperture}>
              <div
                className={styles.track}
                style={{ transform: "translateX(-" + index * 100 + "%)" }}
              >
                {plates.map((plate, i) => (
                  <div key={plate.slug} className={styles.frame} aria-hidden={index !== i}>
                    <Image
                      data-plate-image={plate.slug}
                      unoptimized
                      src={imagePath(plate)}
                      width={1600}
                      height={1000}
                      alt={plate.label[local]}
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className={styles.legend}>
              <span>{selected.label[local]}</span>
              <span>{selected.imageLabel[local]}</span>
            </div>
            <div className={styles.detail}>
              <div>
                <h3>{selected.title}</h3>
                <p>{selected.text[local]}</p>
              </div>
              <Link href={"/work/" + selected.slug}>
                {lang === "tr" ? "Projeyi aç" : "Open project"} <span aria-hidden="true">↗</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
