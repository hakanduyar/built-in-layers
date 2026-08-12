type JsonLdProps = {
  data: object;
};

// Renders a single application/ld+json script tag. `data` is always a
// fully developer-controlled object built in lib/seo/metadata.ts (verified
// static fields only, e.g. buildPersonJsonLd()) — never MDX, request, or
// otherwise user-controlled input. React treats <script> as a raw-text
// element during server rendering, so a plain string child is emitted
// as-is rather than HTML-entity-escaped; no dangerouslySetInnerHTML needed.
export function JsonLd({ data }: JsonLdProps) {
  return <script type="application/ld+json">{JSON.stringify(data)}</script>;
}
