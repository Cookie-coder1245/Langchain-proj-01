export default function Weaknesses({ items }) {
  if (!items?.length) return null;
  return (
    <section aria-labelledby="weaknesses-heading">
      <h3 id="weaknesses-heading" className="text-xs tracking-[0.15em] uppercase text-chalk-dim mb-3">
        Areas to improve
      </h3>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2.5 text-sm text-chalk leading-relaxed">
            <span className="text-coral shrink-0" aria-hidden="true">
              ✕
            </span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
