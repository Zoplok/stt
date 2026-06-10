import { AssemblyAI } from "assemblyai";
import type { TranscriptionOptions, TranscriptionResult, SubtitleSegment, WordTimestamp } from "@/types";
import { BaseSTTProvider } from "./stt-provider";

export class AssemblyAIProvider extends BaseSTTProvider {
  name = "assemblyai";

  isAvailable(): boolean {
    return !!process.env.ASSEMBLYAI_API_KEY;
  }

  async transcribe(audioUrl: string, options: TranscriptionOptions): Promise<TranscriptionResult> {
    const client = new AssemblyAI({ apiKey: process.env.ASSEMBLYAI_API_KEY! });

    const transcript = await client.transcripts.transcribe({
      audio_url: audioUrl,
      language_code: options.language !== "auto" ? (options.language as string) : undefined,
      speaker_labels: options.diarization ?? false,
      punctuate: options.punctuation ?? true,
      word_boost: [],
    });

    if (transcript.status === "error") {
      throw new Error(`AssemblyAI error: ${transcript.error}`);
    }

    const utterances = transcript.utterances ?? [];
    const words = transcript.words ?? [];

    const segments: Omit<SubtitleSegment, "id" | "trackId" | "createdAt" | "updatedAt">[] =
      utterances.length > 0
        ? utterances.map((utt, index) => {
            const segWords: WordTimestamp[] | undefined = options.wordTimestamps
              ? utt.words?.map((w) => ({
                  word: w.text,
                  start: w.start / 1000,
                  end: w.end / 1000,
                  confidence: w.confidence,
                }))
              : undefined;

            return {
              index,
              startTime: utt.start / 1000,
              endTime: utt.end / 1000,
              text: utt.text,
              words: segWords,
              speaker: utt.speaker ? `Speaker ${utt.speaker}` : null,
              confidence: utt.confidence ?? null,
              style: null,
            };
          })
        : words.reduce<Omit<SubtitleSegment, "id" | "trackId" | "createdAt" | "updatedAt">[]>(
            (acc, word) => {
              const last = acc.at(-1);
              const wStart = word.start / 1000;
              const wEnd = word.end / 1000;
              if (!last || wStart - last.endTime > 1.5 || last.text.split(" ").length >= 12) {
                acc.push({
                  index: acc.length,
                  startTime: wStart,
                  endTime: wEnd,
                  text: word.text,
                  words: options.wordTimestamps
                    ? [{ word: word.text, start: wStart, end: wEnd, confidence: word.confidence }]
                    : undefined,
                  speaker: null,
                  confidence: word.confidence ?? null,
                  style: null,
                });
              } else {
                last.endTime = wEnd;
                last.text += ` ${word.text}`;
                if (options.wordTimestamps && last.words) {
                  last.words.push({ word: word.text, start: wStart, end: wEnd, confidence: word.confidence });
                }
              }
              return acc;
            },
            []
          );

    const durationMs = transcript.audio_duration ?? 0;
    const avgConfidence =
      segments.reduce((sum, s) => sum + (s.confidence ?? 0), 0) / Math.max(segments.length, 1);

    return {
      segments,
      language: transcript.language_code ?? options.language ?? "en",
      confidence: avgConfidence,
      duration: durationMs,
    };
  }
}
