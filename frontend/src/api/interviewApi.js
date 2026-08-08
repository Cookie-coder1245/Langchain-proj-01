const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

class ApiError extends Error {
  constructor(message) {
    super(message);
    this.name = "ApiError";
  }
}

async function request(path, options) {
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
  } catch {
    throw new ApiError(
      "We can't reach the interview server. Check your connection and that the backend is running."
    );
  }

  if (!response.ok) {
    let detail = null;
    try {
      const body = await response.json();
      detail = body?.detail;
    } catch {
      /* response wasn't JSON — fall through to generic message */
    }
    throw new ApiError(detail || "Something went wrong on our end. Please try again.");
  }

  return response.json();
}

export function generateQuestion({ role, topic, difficulty }) {
  return request("/generate-question", {
    method: "POST",
    body: JSON.stringify({ role, topic, difficulty }),
  });
}

export function evaluateAnswer({ role, topic, difficulty, question, answer }) {
  return request("/evaluate", {
    method: "POST",
    body: JSON.stringify({ role, topic, difficulty, question, answer }),
  });
}

export { ApiError };
