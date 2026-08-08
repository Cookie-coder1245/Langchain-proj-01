export default function Strengths({ items }) {
  if (!items?.length) return null;
  return (
    <section aria-labelledby="strengths-heading">
      <h3 id="strengths-heading" className="text-xs tracking-[0.15em] uppercase text-chalk-dim mb-3">
        Strengths
      </h3>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2.5 text-sm text-chalk leading-relaxed">
            <span className="text-amber shrink-0" aria-hidden="true">
              ✓
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
