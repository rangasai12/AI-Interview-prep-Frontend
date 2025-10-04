export interface ParsedResumeSection {
  id: string;
  title: string;
  content: string;
}

interface ParseResumeOptions {
  file?: File;
  text?: string;
}

interface ParseResumeResponse {
  sections: ParsedResumeSection[];
}

export async function parseResumeWithGemini(options: ParseResumeOptions): Promise<ParseResumeResponse> {
  const formData = new FormData();

  if (options.file) {
    formData.append("file", options.file);
  }

  if (options.text) {
    formData.append("text", options.text);
  }

  if (!options.file && !options.text) {
    throw new Error("Resume content is required.");
  }

  const response = await fetch("/api/parse-resume", {
    method: "POST",
    body: formData,
  });

  let payload: unknown;

  try {
    payload = await response.json();
  } catch (error) {
    throw new Error("The resume parser returned an unexpected response.");
  }

  if (!response.ok) {
    const message = typeof payload === "object" && payload !== null && "error" in payload
      ? String((payload as { error: unknown }).error)
      : "Failed to parse resume.";
    throw new Error(message);
  }

  if (!payload || typeof payload !== "object" || !Array.isArray((payload as { sections?: unknown }).sections)) {
    throw new Error("Invalid data returned from the resume parser.");
  }

  return payload as ParseResumeResponse;
}
