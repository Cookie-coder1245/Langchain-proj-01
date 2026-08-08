import ScoreGauge from "./ScoreGauge";

export default function ScoreCard({ score, role, topic, difficulty }) {
  return (
    <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
      <ScoreGauge score={score} />
      <div className="text-center sm:text-left">
        <p className="text-xs tracking-[0.15em] uppercase text-chalk-dim mb-1">Your score</p>
        <p className="font-display text-2xl text-chalk mb-2">
          {role} · {topic}
        </p>
        <span className="inline-block text-xs px-3 py-1 rounded-full border border-amber/40 text-amber tracking-wide">
          {difficulty}
        </span>
      </div>
    </div>
  );
}
