import type { TranscriptionOptions, TranscriptionResult } from "@/types";

export interface STTProvider {
  name: string;
  transcribe(audioUrl: string, options: TranscriptionOptions): Promise<TranscriptionResult>;
  isAvailable(): boolean;
}

export abstract class BaseSTTProvider implements STTProvider {
  abstract name: string;
  abstract transcribe(audioUrl: string, options: TranscriptionOptions): Promise<TranscriptionResult>;

  isAvailable(): boolean {
    return true;
  }

  protected normalizeLanguage(lang?: string): string {
    return lang ?? "en";
  }
}
