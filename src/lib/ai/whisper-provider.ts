import OpenAI from "openai";
import type { TranscriptionOptions, TranscriptionResult, SubtitleSegment, WordTimestamp } from "@/types";
import { BaseSTTProvider } from "./stt-provider";

export class WhisperProvider extends BaseSTTProvider {
  name = "whisper";
  private client: OpenAI;

  constructor() {
    super();
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  isAvailable(): boolean {
    return !!process.env.OPENAI_API_KEY;
  }

  async transcribe(audioUrl: string, options: TranscriptionOptions): Promise<TranscriptionResult> {
    const response = await fetch(audioUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch audio: ${response.statusText}`);
    }

    const audioBlob = await response.blob();
    const audioFile = new File([audioBlob], "audio.wav", { type: "audio/wav" });

    const result = await this.client.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1",
      language: options.language !== "auto" ? options.language : undefined,
      response_format: "verbose_json",
      timestamp_granularities: options.wordTimestamps ? ["word", "segment"] : ["segment"],
    });

    type VerboseSeg = { start: number; end: number; text: string; avg_logprob?: number; words?: { word: string; start: number; end: number }[] };
    const segments: Omit<SubtitleSegment, "id" | "trackId" | "createdAt" | "updatedAt">[] =
      (result.segments as VerboseSeg[] | undefined)?.map((seg, index) => {
        const words: WordTimestamp[] | undefined = options.wordTimestamps
          ? seg.words?.map((w) => ({
              word: w.word,
              start: w.start,
              end: w.end,
              confidence: undefined,
            }))
          : undefined;

        return {
          index,
          startTime: seg.start,
          endTime: seg.end,
          text: seg.text.trim(),
          words,
          speaker: null,
          confidence: seg.avg_logprob != null ? Math.exp(seg.avg_logprob) : null,
          style: null,
        };
      }) ?? [];

    const duration = result.segments?.at(-1)?.end ?? 0;
    const avgConfidence =
      segments.reduce((sum, s) => sum + (s.confidence ?? 0), 0) / Math.max(segments.length, 1);

    return {
      segments,
      language: result.language ?? options.language ?? "en",
      confidence: avgConfidence,
      duration,
    };
  }
}
