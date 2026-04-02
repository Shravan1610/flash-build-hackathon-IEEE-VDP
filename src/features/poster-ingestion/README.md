# Poster Ingestion

## OCR provider
Poster OCR is implemented with the Gemini multimodal API in `server/gemini-ocr.ts`.

The OCR call is intentionally split from metadata parsing:
- OCR step: extract raw poster text only
- parsing step: normalize title, date, time, venue, and category afterward

## Environment variables
- `GEMINI_API_KEY` required
- `GEMINI_OCR_MODEL` optional, defaults to `gemini-3.1-flash-lite-preview`
- `GEMINI_API_BASE_URL` optional, defaults to `https://generativelanguage.googleapis.com/v1beta`

## Usage

```ts
import { extractPosterTextWithGemini } from "./server/gemini-ocr";

const result = await extractPosterTextWithGemini({
  bytes: fileBytes,
  mimeType: "image/png",
  fileName: "poster.png",
});

console.log(result.rawText);
```

## Notes
- Keep the OCR prompt narrow. OCR should not classify or "fix" poster content.
- The model ID should remain environment-driven because Google changes preview model identifiers more often than application code should.
