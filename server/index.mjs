import "dotenv/config";
import express from "express";
import cors from "cors";
import multer from "multer";
import path from "node:path";
import fs from "node:fs/promises";
import pdfParse from "pdf-parse/lib/pdf-parse.js";
import mammoth from "mammoth";
import { GoogleGenerativeAI } from "@google/generative-ai";

const uploadDir = path.join(process.cwd(), "tmp");
await fs.mkdir(uploadDir, { recursive: true });

const app = express();
const upload = multer({ dest: uploadDir });

app.use(cors());
app.use(express.json({ limit: "1mb" }));

const PORT = Number(process.env.API_PORT ?? process.env.PORT ?? 4000);
const MODEL_ID = process.env.GEMINI_MODEL ?? "gemini-2.5-pro";
const MAX_RESUME_CHARS = 20000;

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.post("/api/parse-resume", upload.single("file"), async (req, res) => {
  try {
    const resumeText = await getResumeText(req);
    const sections = await generateSections(resumeText);
    res.json({ sections });
  } catch (error) {
    console.error("Resume parsing failed", error);
    const status = typeof error?.status === "number" ? error.status : 500;
    const message = error instanceof Error && error.message
      ? error.message
      : "Failed to parse resume.";
    res.status(status).json({ error: message });
  } finally {
    if (req.file) {
      await fs.unlink(req.file.path).catch(() => undefined);
    }
  }
});

app.listen(PORT, () => {
  console.log(`Resume parser server running on port ${PORT}`);
});

async function getResumeText(req) {
  const rawText = typeof req.body?.text === "string" ? req.body.text.trim() : "";
  let resumeText = rawText;

  if (!resumeText && req.file) {
    resumeText = (await extractTextFromFile(req.file)).trim();
  }

  if (!resumeText) {
    throw createHttpError(400, "No resume content provided.");
  }

  if (resumeText.length > MAX_RESUME_CHARS) {
    resumeText = resumeText.slice(0, MAX_RESUME_CHARS);
  }

  return resumeText;
}

async function extractTextFromFile(file) {
  const buffer = await fs.readFile(file.path);
  const lowerName = file.originalname.toLowerCase();
  const mimetype = file.mimetype;

  if (mimetype === "application/pdf" || lowerName.endsWith(".pdf")) {
    const pdf = await pdfParse(buffer);
    return pdf.text;
  }

  if (
    mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    lowerName.endsWith(".docx")
  ) {
    const result = await mammoth.extractRawText({ buffer });
    return result.value;
  }

  return buffer.toString("utf8");
}

async function generateSections(resumeText) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw createHttpError(500, "GEMINI_API_KEY environment variable is not set.");
  }

  const client = new GoogleGenerativeAI(apiKey);
  const model = client.getGenerativeModel({ model: MODEL_ID });

  const prompt = [
    "You are a resume parsing assistant.",
    "Analyze the resume text and return structured JSON with sections.",
    "Use this exact format: {\"sections\":[{\"title\":\"Title\",\"content\":\"Content\"}]}.",
    "Use title case for section titles.",
    "Preserve bullet points as newline separated lines.",
    "Include sections only if content is available.",
    "Resume text:",
    `"""${resumeText}"""`
  ].join("\n");

  const result = await model.generateContent({
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }],
      },
    ],
  });

  const raw = result.response.text();
  const jsonText = extractJson(raw);

  let parsed;
  try {
    parsed = JSON.parse(jsonText);
  } catch (error) {
    console.error("Failed to parse Gemini response", jsonText);
    throw createHttpError(502, "Gemini returned an unreadable response.");
  }

  return normalizeSections(parsed.sections);
}

function normalizeSections(sections) {
  if (!Array.isArray(sections)) {
    throw createHttpError(502, "Gemini response did not include sections.");
  }

  const normalized = sections
    .map((section, index) => {
      const title = typeof section?.title === "string" ? section.title.trim() : "";
      const content = typeof section?.content === "string" ? section.content.trim() : "";

      if (!content) {
        return null;
      }

      return {
        id: createSectionId(title, index),
        title: title || `Section ${index + 1}`,
        content,
      };
    })
    .filter((section) => section !== null);

  if (!normalized.length) {
    throw createHttpError(502, "Gemini did not return any usable sections.");
  }

  return normalized;
}

function extractJson(rawText) {
  if (typeof rawText !== "string") {
    throw createHttpError(502, "Gemini returned an empty response.");
  }

  const match = rawText.match(/```json\s*([\s\S]*?)```/i);
  const jsonString = match ? match[1] : rawText;
  return jsonString.trim();
}

function createSectionId(title, index) {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  return slug || `section-${index + 1}`;
}

function createHttpError(status, message) {
  const error = new Error(message);
  error.status = status;
  return error;
}
