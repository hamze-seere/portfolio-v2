/* Structured data. `<` is escaped so content can never close the script tag.
   type="application/ld+json" is data, not executable script, so CSP doesn't apply. */
export function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }} />
}
