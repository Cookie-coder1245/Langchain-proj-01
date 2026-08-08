import ScoreCard from "./ScoreCard";
import Strengths from "./Strengths";
import Weaknesses from "./Weaknesses";

export default function EvaluationResult({ evaluation, setup, onTryAnother, onStartOver }) {
  const { score, strengths, weaknesses, feedback } = evaluation;

  return (
    <div className="chalkboard chalk-texture chalk-border rounded-xl p-6 sm:p-10">
      <ScoreCard score={score} role={setup.role} topic={setup.topic} difficulty={setup.difficulty} />

      <div className="grid gap-8 sm:grid-cols-2 mt-10">
        <Strengths items={strengths} />
        <Weaknesses items={weaknesses} />
      </div>

      <div className="mt-10">
        <h3 className="text-xs tracking-[0.15em] uppercase text-chalk-dim mb-3">AI feedback</h3>
        <p className="chalk-border-solid rounded-md p-4 text-sm text-chalk leading-relaxed bg-black/10">
          {feedback}
        </p>
      </div>

      <div className="mt-10 flex flex-col sm:flex-row gap-3">
        <button
          type="button"
          onClick={onTryAnother}
          className="px-8 py-3 rounded-md bg-amber text-rail font-semibold tracking-wide hover:bg-amber-dim transition-colors"
        >
          Try another question
        </button>
        <button
          type="button"
          onClick={onStartOver}
          className="px-8 py-3 rounded-md border border-white/15 text-chalk-dim hover:text-chalk hover:border-white/30 transition-colors"
        >
          Start over
        </button>
      </div>
    </div>
  );
}
