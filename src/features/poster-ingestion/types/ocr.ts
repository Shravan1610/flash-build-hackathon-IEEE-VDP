export interface PosterOcrInput {
  bytes: Uint8Array;
  mimeType: string;
  fileName?: string;
}

export interface PosterOcrUsage {
  promptTokenCount?: number;
  candidatesTokenCount?: number;
  totalTokenCount?: number;
}

export interface PosterOcrResult {
  rawText: string;
  model: string;
  prompt: string;
  usage?: PosterOcrUsage;
  warnings: string[];
}

export interface GeminiOcrOptions {
  apiKey?: string;
  model?: string;
  apiBaseUrl?: string;
  generateContentApi?: "generateContent" | "streamGenerateContent";
  prompt?: string;
}
