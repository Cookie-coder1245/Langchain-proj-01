import { useState, useCallback } from "react";
import Navbar from "../components/Navbar";
import InterviewSetup from "../components/InterviewSetup";
import QuestionCard from "../components/QuestionCard";
import EvaluationResult from "../components/EvaluationResult";
import LoadingState from "../components/LoadingState";
import ErrorMessage from "../components/ErrorMessage";
import { generateQuestion, evaluateAnswer, ApiError } from "../api/interviewApi";

const STAGE = {
  SETUP: "setup",
  QUESTION: "question",
  RESULT: "result",
};

export default function InterviewPage() {
  const [stage, setStage] = useState(STAGE.SETUP);
  const [setup, setSetup] = useState(null);
  const [questionData, setQuestionData] = useState(null);
  const [answer, setAnswer] = useState("");
  const [evaluation, setEvaluation] = useState(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [error, setError] = useState(null);
  const [lastAction, setLastAction] = useState(null);

  const handleGenerate = useCallback(async (setupPayload) => {
    if (isGenerating) return;
    setError(null);
    setIsGenerating(true);
    setSetup(setupPayload);
    setLastAction(() => () => handleGenerate(setupPayload));
    try {
      const data = await generateQuestion(setupPayload);
      setQuestionData(data);
      setAnswer("");
      setStage(STAGE.QUESTION);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "We couldn't generate your question right now. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  }, [isGenerating]);

  const handleEvaluate = useCallback(async () => {
    if (isEvaluating || !questionData) return;
    setError(null);
    setIsEvaluating(true);
    setLastAction(() => handleEvaluate);
    try {
      const result = await evaluateAnswer({
        role: questionData.role,
        topic: questionData.topic,
        difficulty: questionData.difficulty,
        question: questionData.question,
        answer,
      });
      setEvaluation(result);
      setStage(STAGE.RESULT);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "We couldn't evaluate your answer right now. Please try again.");
    } finally {
      setIsEvaluating(false);
    }
  }, [isEvaluating, questionData, answer]);

  function handleTryAnother() {
    setEvaluation(null);
    setError(null);
    handleGenerate(setup);
  }

  function handleStartOver() {
    setStage(STAGE.SETUP);
    setSetup(null);
    setQuestionData(null);
    setAnswer("");
    setEvaluation(null);
    setError(null);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar stage={stage} />

      <main className="flex-1 max-w-4xl w-full mx-auto px-5 sm:px-8 py-8 sm:py-14">
        {error && (
          <div className="mb-6">
            <ErrorMessage message={error} onRetry={lastAction} />
          </div>
        )}

        {stage === STAGE.SETUP && !isGenerating && (
          <InterviewSetup onSubmit={handleGenerate} isGenerating={isGenerating} />
        )}

        {stage === STAGE.SETUP && isGenerating && <LoadingState label="Generating your question…" />}

        {stage === STAGE.QUESTION && questionData && !isEvaluating && (
          <QuestionCard
            data={questionData}
            answer={answer}
            onAnswerChange={setAnswer}
            onSubmit={handleEvaluate}
            isEvaluating={isEvaluating}
          />
        )}

        {stage === STAGE.QUESTION && isEvaluating && <LoadingState label="Analyzing your answer…" />}

        {stage === STAGE.RESULT && evaluation && setup && (
          <EvaluationResult
            evaluation={evaluation}
            setup={setup}
            onTryAnother={handleTryAnother}
            onStartOver={handleStartOver}
          />
        )}
      </main>

      <footer className="text-center text-xs text-chalk-dim/60 pb-6">Viva — practice out loud, improve on paper.</footer>
    </div>
  );
}
