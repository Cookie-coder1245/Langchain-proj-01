export default function AnswerEditor({ value, onChange, onSubmit, isEvaluating }) {
  const isValid = value.trim().length > 0 && !isEvaluating;

  function handleSubmit(e) {
    e.preventDefault();
    if (!isValid) return;
    onSubmit();
  }

  return (
    <form onSubmit={handleSubmit}>
      <label htmlFor="answer" className="block text-xs tracking-[0.15em] uppercase text-chalk-dim mb-2">
        Your answer
      </label>
      <textarea
        id="answer"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={8}
        placeholder="Walk through your answer here…"
        className="w-full bg-black/15 chalk-border-solid rounded-md px-4 py-3 text-chalk placeholder:text-chalk-dim/60 focus:border-amber transition-colors resize-y leading-relaxed"
      />

      <button
        type="submit"
        disabled={!isValid}
        className="mt-6 w-full sm:w-auto px-8 py-3 rounded-md bg-amber text-rail font-semibold tracking-wide disabled:opacity-40 disabled:cursor-not-allowed hover:bg-amber-dim transition-colors"
      >
        {isEvaluating ? "Analyzing your answer…" : "Submit answer"}
      </button>
    </form>
  );
}
