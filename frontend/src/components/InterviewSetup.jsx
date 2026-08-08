import { useState } from "react";

const DIFFICULTIES = ["Beginner", "Intermediate", "Advanced"];

export default function InterviewSetup({ onSubmit, isGenerating }) {
  const [role, setRole] = useState("");
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("Intermediate");
  const [touched, setTouched] = useState(false);

  const roleError = touched && role.trim().length < 2 ? "Enter a role (at least 2 characters)." : null;
  const topicError = touched && topic.trim().length < 2 ? "Enter a topic (at least 2 characters)." : null;
  const isValid = role.trim().length >= 2 && topic.trim().length >= 2 && !isGenerating;

  function handleSubmit(e) {
    e.preventDefault();
    setTouched(true);
    if (role.trim().length < 2 || topic.trim().length < 2) return;
    onSubmit({ role: role.trim(), topic: topic.trim(), difficulty });
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="chalkboard chalk-texture chalk-border rounded-xl p-6 sm:p-10">
      <h1 className="font-display text-4xl sm:text-5xl text-chalk mb-1">Step up to the board.</h1>
      <p className="text-chalk-dim text-sm mb-8">
        Set the role, topic, and difficulty — Viva will write your question.
      </p>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="sm:col-span-1">
          <label htmlFor="role" className="block text-xs tracking-[0.15em] uppercase text-chalk-dim mb-2">
            Role
          </label>
          <input
            id="role"
            type="text"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            placeholder="Python Backend Developer"
            aria-invalid={!!roleError}
            aria-describedby={roleError ? "role-error" : undefined}
            className="w-full bg-transparent chalk-border-solid rounded-md px-4 py-3 text-chalk placeholder:text-chalk-dim/60 focus:border-amber transition-colors"
          />
          {roleError && (
            <p id="role-error" className="text-coral text-xs mt-1.5">
              {roleError}
            </p>
          )}
        </div>

        <div className="sm:col-span-1">
          <label htmlFor="topic" className="block text-xs tracking-[0.15em] uppercase text-chalk-dim mb-2">
            Topic
          </label>
          <input
            id="topic"
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="FastAPI"
            aria-invalid={!!topicError}
            aria-describedby={topicError ? "topic-error" : undefined}
            className="w-full bg-transparent chalk-border-solid rounded-md px-4 py-3 text-chalk placeholder:text-chalk-dim/60 focus:border-amber transition-colors"
          />
          {topicError && (
            <p id="topic-error" className="text-coral text-xs mt-1.5">
              {topicError}
            </p>
          )}
        </div>

        <fieldset className="sm:col-span-2">
          <legend className="block text-xs tracking-[0.15em] uppercase text-chalk-dim mb-2">Difficulty</legend>
          <div className="flex flex-wrap gap-2" role="radiogroup">
            {DIFFICULTIES.map((level) => (
              <button
                key={level}
                type="button"
                role="radio"
                aria-checked={difficulty === level}
                onClick={() => setDifficulty(level)}
                className={`px-4 py-2 rounded-md text-sm border transition-colors ${
                  difficulty === level
                    ? "border-amber text-amber bg-amber/10"
                    : "border-white/15 text-chalk-dim hover:border-white/30 hover:text-chalk"
                }`}
              >
                {level}
              </button>
            ))}
          </div>
        </fieldset>
      </div>

      <button
        type="submit"
        disabled={!isValid}
        className="mt-9 w-full sm:w-auto px-8 py-3 rounded-md bg-amber text-rail font-semibold tracking-wide disabled:opacity-40 disabled:cursor-not-allowed hover:bg-amber-dim transition-colors"
      >
        {isGenerating ? "Generating question…" : "Generate question"}
      </button>
    </form>
  );
}
