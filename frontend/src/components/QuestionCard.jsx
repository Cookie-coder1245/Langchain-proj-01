import AnswerEditor from "./AnswerEditor";

export default function QuestionCard({ data, answer, onAnswerChange, onSubmit, isEvaluating }) {
  const { role, topic, difficulty, question, expected_points: expectedPoints } = data;

  return (
    <div className="chalkboard chalk-texture chalk-border rounded-xl p-6 sm:p-10">
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs tracking-[0.15em] uppercase text-chalk-dim mb-6">
        <span>{role}</span>
        <span aria-hidden="true">·</span>
        <span>{topic}</span>
        <span aria-hidden="true">·</span>
        <span className="text-amber">{difficulty}</span>
      </div>

      <h2 className="font-display text-3xl sm:text-4xl leading-snug text-chalk mb-6">{question}</h2>

      {expectedPoints?.length > 0 && (
        <details className="mb-8 group">
          <summary className="cursor-pointer text-xs tracking-[0.15em] uppercase text-chalk-dim select-none hover:text-chalk transition-colors">
            What a strong answer covers
          </summary>
          <ul className="mt-3 space-y-1.5 text-sm text-chalk-dim">
            {expectedPoints.map((point, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-amber-dim shrink-0" aria-hidden="true">
                  •
                </span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </details>
      )}

      <AnswerEditor value={answer} onChange={onAnswerChange} onSubmit={onSubmit} isEvaluating={isEvaluating} />
    </div>
  );
}
