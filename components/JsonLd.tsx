// Renders a schema.org JSON-LD payload as an inline <script> tag. This is
// the one place that does the dangerouslySetInnerHTML dance, so every page
// emitting structured data (breadcrumbs, FAQs, HowTo steps, site-level
// Organization/WebSite) goes through the same reusable component instead of
// duplicating the same three lines everywhere. `data` should be built with
// one of the helpers in lib/structured-data.ts.
export default function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
