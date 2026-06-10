import OpenAI from "openai";
import type { SubtitleSegment, ChapterMarker } from "@/types";

function getClient(): OpenAI {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured");
  }
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

function buildTranscriptText(segments: Pick<SubtitleSegment, "startTime" | "text">[]): string {
  return segments
    .map((s) => {
      const m = Math.floor(s.startTime / 60);
      const sec = Math.floor(s.startTime % 60);
      return `[${m}:${String(sec).padStart(2, "0")}] ${s.text}`;
    })
    .join("\n");
}

export async function generateSummary(
  segments: Pick<SubtitleSegment, "startTime" | "text">[]
): Promise<string> {
  const client = getClient();
  const transcript = buildTranscriptText(segments);

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "You are a professional content summarizer. Given a transcript with timestamps, produce a concise, engaging summary in 3-5 sentences. Capture the key points and main topic.",
      },
      { role: "user", content: `Transcript:\n${transcript}` },
    ],
    max_tokens: 400,
    temperature: 0.4,
  });

  return response.choices[0]?.message?.content?.trim() ?? "";
}

export async function generateChapters(
  segments: Pick<SubtitleSegment, "startTime" | "text">[],
  totalDuration: number
): Promise<ChapterMarker[]> {
  const client = getClient();
  const transcript = buildTranscriptText(segments);

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `You are a video chapter generator. Given a transcript with timestamps, identify 5-10 logical chapter breaks.
Return a JSON array of objects: [{"time": <seconds as number>, "title": "<short title>", "description": "<one sentence>"}].
Only return the JSON array, no other text.`,
      },
      {
        role: "user",
        content: `Total duration: ${Math.floor(totalDuration)}s\nTranscript:\n${transcript}`,
      },
    ],
    max_tokens: 800,
    temperature: 0.3,
    response_format: { type: "json_object" },
  });

  const text = response.choices[0]?.message?.content?.trim() ?? "{}";
  try {
    const parsed = JSON.parse(text) as { chapters?: ChapterMarker[] } | ChapterMarker[];
    const chapters = Array.isArray(parsed) ? parsed : (parsed.chapters ?? []);
    return chapters.filter(
      (c): c is ChapterMarker =>
        typeof c.time === "number" && typeof c.title === "string"
    );
  } catch {
    return [];
  }
}

export async function translateSubtitles(
  segments: Pick<SubtitleSegment, "index" | "text">[],
  targetLanguage: string,
  sourceLanguage = "auto"
): Promise<{ index: number; text: string }[]> {
  const client = getClient();

  const chunks: typeof segments[] = [];
  for (let i = 0; i < segments.length; i += 50) {
    chunks.push(segments.slice(i, i + 50));
  }

  const results: { index: number; text: string }[] = [];

  for (const chunk of chunks) {
    const payload = JSON.stringify(chunk.map((s) => ({ index: s.index, text: s.text })));

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a professional subtitle translator. Translate from ${sourceLanguage === "auto" ? "the detected language" : sourceLanguage} to ${targetLanguage}.
Preserve timing, tone, and natural speech patterns. Return a JSON array: [{"index": <number>, "text": "<translated>"}].
Only return the JSON array.`,
        },
        { role: "user", content: payload },
      ],
      max_tokens: 2000,
      temperature: 0.2,
    });

    const text = response.choices[0]?.message?.content?.trim() ?? "[]";
    try {
      const parsed = JSON.parse(text) as { index: number; text: string }[];
      results.push(...parsed);
    } catch {
      results.push(...chunk.map((s) => ({ index: s.index, text: s.text })));
    }
  }

  return results;
}

export async function improveSubtitles(
  segments: Pick<SubtitleSegment, "index" | "text">[]
): Promise<{ index: number; text: string }[]> {
  const client = getClient();

  const chunks: typeof segments[] = [];
  for (let i = 0; i < segments.length; i += 40) {
    chunks.push(segments.slice(i, i + 40));
  }

  const results: { index: number; text: string }[] = [];

  for (const chunk of chunks) {
    const payload = JSON.stringify(chunk.map((s) => ({ index: s.index, text: s.text })));

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a professional subtitle editor. Fix grammar, punctuation, and readability while preserving the original meaning and speech style.
Return a JSON array: [{"index": <number>, "text": "<improved>"}]. Only return the JSON array.`,
        },
        { role: "user", content: payload },
      ],
      max_tokens: 2000,
      temperature: 0.2,
    });

    const text = response.choices[0]?.message?.content?.trim() ?? "[]";
    try {
      const parsed = JSON.parse(text) as { index: number; text: string }[];
      results.push(...parsed);
    } catch {
      results.push(...chunk.map((s) => ({ index: s.index, text: s.text })));
    }
  }

  return results;
}

export async function generateKeywordsAndHashtags(
  segments: Pick<SubtitleSegment, "startTime" | "text">[]
): Promise<{ keywords: string[]; hashtags: string[]; description: string }> {
  const client = getClient();
  const transcript = buildTranscriptText(segments.slice(0, 100));

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `Generate SEO metadata for this video transcript. Return JSON:
{"keywords": ["<keyword>", ...], "hashtags": ["#<tag>", ...], "description": "<YouTube description 2-3 sentences>"}`,
      },
      { role: "user", content: `Transcript:\n${transcript}` },
    ],
    max_tokens: 600,
    temperature: 0.4,
    response_format: { type: "json_object" },
  });

  const text = response.choices[0]?.message?.content?.trim() ?? "{}";
  try {
    return JSON.parse(text) as { keywords: string[]; hashtags: string[]; description: string };
  } catch {
    return { keywords: [], hashtags: [], description: "" };
  }
}
