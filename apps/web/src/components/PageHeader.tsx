/** Shared heading block for content/legal pages. */
export function PageHeader({ title, intro }: { title: string; intro?: string }) {
  return (
    <header className="page-head">
      <h1>{title}</h1>
      {intro && <p>{intro}</p>}
    </header>
  );
}
