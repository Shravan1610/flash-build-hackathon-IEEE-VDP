import type {
  GeminiOcrOptions,
  PosterOcrInput,
  PosterOcrResult,
  PosterOcrUsage,
} from "../types/ocr";

const DEFAULT_GEMINI_API_BASE_URL =
  process.env.GEMINI_API_BASE_URL ?? "https://generativelanguage.googleapis.com/v1beta";

const DEFAULT_GEMINI_OCR_MODEL =
  process.env.GEMINI_OCR_MODEL ?? "gemini-3.1-flash-lite-preview";

const DEFAULT_GENERATE_CONTENT_API = "streamGenerateContent";

export const DEFAULT_POSTER_OCR_PROMPT = [
  "You are an OCR engine for event posters.",
  "Extract all visible text from the uploaded file.",
  "Preserve line breaks when they help readability.",
  "Do not summarize, classify, or infer missing words.",
  "Return plain text only.",
].join(" ");

interface GeminiInlineDataPart {
  inlineData: {
    mimeType: string;
    data: string;
  };
}

interface GeminiTextPart {
  text: string;
}

interface GeminiCandidate {
  content?: {
    parts?: Array<GeminiTextPart>;
  };
}

interface GeminiUsageMetadata {
  promptTokenCount?: number;
  candidatesTokenCount?: number;
  totalTokenCount?: number;
}

interface GeminiGenerateContentChunk {
  candidates?: GeminiCandidate[];
  usageMetadata?: GeminiUsageMetadata;
}

export async function extractPosterTextWithGemini(
  input: PosterOcrInput,
  options: GeminiOcrOptions = {},
): Promise<PosterOcrResult> {
  if (!input.bytes.length) {
    throw new Error("Cannot run OCR on an empty file.");
  }

  const apiKey = options.apiKey ?? process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error("Missing GEMINI_API_KEY for Gemini OCR.");
  }

  const model = options.model ?? DEFAULT_GEMINI_OCR_MODEL;
  const apiBaseUrl = options.apiBaseUrl ?? DEFAULT_GEMINI_API_BASE_URL;
  const generateContentApi = options.generateContentApi ?? DEFAULT_GENERATE_CONTENT_API;
  const prompt = options.prompt ?? DEFAULT_POSTER_OCR_PROMPT;

  const requestBody = {
    contents: [
      {
        role: "user",
        parts: [
          { text: prompt },
          createInlineDataPart(input),
        ],
      },
    ],
    generationConfig: {
      temperature: 0,
      thinkingConfig: {
        thinkingLevel: "MINIMAL",
      },
    },
  };

  const url = new URL(`${apiBaseUrl}/models/${encodeURIComponent(model)}:${generateContentApi}`);
  url.searchParams.set("key", apiKey);

  const response = await fetch(url.toString(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorBody = await response.text();

    throw new Error(
      `Gemini OCR request failed (${response.status} ${response.statusText}): ${errorBody}`,
    );
  }

  const responseText = await response.text();
  const chunks = parseGeminiResponse(responseText);
  const rawText = collectCandidateText(chunks);
  const usage = collectUsage(chunks);
  const warnings: string[] = [];

  if (!rawText.trim()) {
    warnings.push("Gemini returned an empty OCR transcript.");
  }

  return {
    rawText,
    model,
    prompt,
    usage,
    warnings,
  };
}

function createInlineDataPart(input: PosterOcrInput): GeminiInlineDataPart {
  return {
    inlineData: {
      mimeType: input.mimeType,
      data: uint8ArrayToBase64(input.bytes),
    },
  };
}

function parseGeminiResponse(responseText: string): GeminiGenerateContentChunk[] {
  const trimmed = responseText.trim();

  if (!trimmed) {
    return [];
  }

  const parsed = JSON.parse(trimmed) as GeminiGenerateContentChunk | GeminiGenerateContentChunk[];

  return Array.isArray(parsed) ? parsed : [parsed];
}

function collectCandidateText(chunks: GeminiGenerateContentChunk[]): string {
  return chunks
    .flatMap((chunk) => chunk.candidates ?? [])
    .flatMap((candidate) => candidate.content?.parts ?? [])
    .map((part) => part.text ?? "")
    .join("")
    .trim();
}

function collectUsage(chunks: GeminiGenerateContentChunk[]): PosterOcrUsage | undefined {
  const usage = [...chunks].reverse().find((chunk) => chunk.usageMetadata)?.usageMetadata;

  if (!usage) {
    return undefined;
  }

  return {
    promptTokenCount: usage.promptTokenCount,
    candidatesTokenCount: usage.candidatesTokenCount,
    totalTokenCount: usage.totalTokenCount,
  };
}

function uint8ArrayToBase64(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString("base64");
}
