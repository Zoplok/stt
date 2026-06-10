import { DefaultDeepgramClient } from "@deepgram/sdk";
import type {
  ListenV1ResponseResultsUtterancesItem,
  ListenV1Response,
} from "@deepgram/sdk";
import type { TranscriptionOptions, TranscriptionResult, SubtitleSegment, WordTimestamp } from "@/types";
import { BaseSTTProvider } from "./stt-provider";

type DGWord = ListenV1ResponseResultsUtterancesItem.Words.Item;

export class DeepgramProvider extends BaseSTTProvider {
  name = "deepgram";

  isAvailable(): boolean {
    return !!process.env.DEEPGRAM_API_KEY;
  }

  async transcribe(audioUrl: string, options: TranscriptionOptions): Promise<TranscriptionResult> {
    const client = new DefaultDeepgramClient({ apiKey: process.env.DEEPGRAM_API_KEY });

    const result = await client.listen.v1.media.transcribeUrl({
      url: audioUrl,
      model: "nova-3",
      language: options.language !== "auto" ? (options.language as string) : undefined,
      diarize: options.diarization ?? false,
      punctuate: options.punctuation ?? true,
      utterances: true,
      smart_format: true,
    });

    const data = (result as ListenV1Response | null);
    if (!data?.results) throw new Error("Deepgram returned no result");

    const utterances = data.results?.utterances ?? [];
    const channels = data.results?.channels ?? [];
    const rawWords: DGWord[] = channels[0]?.alternatives?.[0]?.words ?? [];

    const segments: Omit<SubtitleSegment, "id" | "trackId" | "createdAt" | "updatedAt">[] =
      utterances.length > 0
        ? utterances.map((utt, index) => {
            const segWords: WordTimestamp[] | undefined = options.wordTimestamps
              ? utt.words?.map((w) => ({
                  word: w.punctuated_word ?? w.word ?? "",
                  start: w.start ?? 0,
                  end: w.end ?? 0,
                  confidence: w.confidence,
                }))
              : undefined;

            return {
              index,
              startTime: utt.start ?? 0,
              endTime: utt.end ?? 0,
              text: utt.transcript ?? "",
              words: segWords,
              speaker: utt.speaker != null ? `Speaker ${utt.speaker}` : null,
              confidence: utt.confidence ?? null,
              style: null,
            };
          })
        : rawWords.reduce<Omit<SubtitleSegment, "id" | "trackId" | "createdAt" | "updatedAt">[]>(
            (acc, word) => {
              const last = acc.at(-1);
              const wStart = word.start ?? 0;
              const wEnd = word.end ?? 0;
              const wText = word.punctuated_word ?? word.word ?? "";
              if (!last || wStart - last.endTime > 1.5 || last.text.split(" ").length >= 12) {
                acc.push({
                  index: acc.length,
                  startTime: wStart,
                  endTime: wEnd,
                  text: wText,
                  words: options.wordTimestamps
                    ? [{ word: word.word ?? "", start: wStart, end: wEnd, confidence: word.confidence }]
                    : undefined,
                  speaker: null,
                  confidence: word.confidence ?? null,
                  style: null,
                });
              } else {
                last.endTime = wEnd;
                last.text += ` ${wText}`;
                if (options.wordTimestamps && last.words) {
                  last.words.push({ word: word.word ?? "", start: wStart, end: wEnd, confidence: word.confidence });
                }
              }
              return acc;
            },
            []
          );

    const duration = data.metadata?.duration ?? segments.at(-1)?.endTime ?? 0;
    const avgConfidence =
      segments.reduce((sum, s) => sum + (s.confidence ?? 0), 0) / Math.max(segments.length, 1);

    return {
      segments,
      language: options.language ?? "en",
      confidence: avgConfidence,
      duration,
    };
  }
}
