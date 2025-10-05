export async function downloadResumePdfServer(
  sections: Array<{ title: string; content: string }>,
  profile?: {
    name?: string;
    email?: string;
    phone?: string;
    location?: string;
    title?: string;
    links?: { linkedin?: string; github?: string; website?: string };
  },
  fileName = "resume.pdf"
) {
  const response = await fetch("/api/export-resume-pdf", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sections, profile, fileName }),
  });

  if (!response.ok) {
    let message = "Failed to export PDF.";
    try {
      const payload = await response.json();
      if (payload?.error) message = String(payload.error);
    } catch {}
    throw new Error(message);
  }
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/pdf")) {
    // Try to read json error if pdf not returned
    try {
      const payload = await response.json();
      throw new Error(String(payload?.error || "Server did not return a PDF."));
    } catch {
      throw new Error("Server did not return a PDF.");
    }
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}
