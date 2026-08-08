export default function ErrorMessage({ message, onRetry }) {
  return (
    <div
      role="alert"
      className="chalk-border rounded-lg p-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 bg-coral/5"
    >
      <p className="text-coral text-sm leading-relaxed flex-1">{message}</p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="shrink-0 px-4 py-2 text-sm rounded-md border border-coral/50 text-coral hover:bg-coral/10 transition-colors"
        >
          Try again
        </button>
      )}
    </div>
  );
}
