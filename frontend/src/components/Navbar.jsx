export default function Navbar({ stage }) {
  const steps = ["Setup", "Question", "Result"];
  const activeIndex = { setup: 0, question: 1, result: 2 }[stage] ?? 0;

  return (
    <header className="border-b border-white/10 bg-rail/60">
      <div className="max-w-4xl mx-auto px-5 sm:px-8 py-4 flex items-center justify-between gap-4">
        <div className="flex items-baseline gap-2">
          <span className="font-display text-3xl sm:text-4xl text-amber leading-none">Viva</span>
          <span className="hidden sm:inline text-[11px] tracking-[0.25em] text-chalk-dim uppercase">
            AI Technical Interviewer
          </span>
        </div>

        <ol className="flex items-center gap-2 sm:gap-3" aria-label="Interview progress">
          {steps.map((label, i) => (
            <li key={label} className="flex items-center gap-2 sm:gap-3">
              <span
                className={`flex items-center gap-1.5 text-xs sm:text-sm ${
                  i === activeIndex ? "text-amber" : i < activeIndex ? "text-chalk" : "text-chalk-dim"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    i === activeIndex ? "bg-amber" : i < activeIndex ? "bg-chalk" : "bg-chalk-dim/50"
                  }`}
                  aria-hidden="true"
                />
                <span className="hidden sm:inline">{label}</span>
              </span>
              {i < steps.length - 1 && <span className="text-chalk-dim/40" aria-hidden="true">—</span>}
            </li>
          ))}
        </ol>
      </div>
    </header>
  );
}
