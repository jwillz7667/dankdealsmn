type JsonLdData = Record<string, unknown>;

/** Renders a JSON-LD <script>. Pass one object or an array of graph nodes. */
export function JsonLd({ data }: { data: JsonLdData | JsonLdData[] }) {
  return (
    <script
      type="application/ld+json"
      // JSON.stringify output is safe here; no user-controlled HTML is interpolated.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  );
}
