import type { STTProvider } from "./stt-provider";
import { WhisperProvider } from "./whisper-provider";
import { DeepgramProvider } from "./deepgram-provider";
import { AssemblyAIProvider } from "./assemblyai-provider";
import type { TranscriptionProvider } from "@/types";

const providers: Record<TranscriptionProvider, () => STTProvider> = {
  WHISPER: () => new WhisperProvider(),
  DEEPGRAM: () => new DeepgramProvider(),
  ASSEMBLYAI: () => new AssemblyAIProvider(),
};

export function getSTTProvider(name: TranscriptionProvider): STTProvider {
  const factory = providers[name];
  if (!factory) throw new Error(`Unknown STT provider: ${name}`);
  const provider = factory();
  if (!provider.isAvailable()) {
    throw new Error(`STT provider "${name}" is not configured (missing API key)`);
  }
  return provider;
}

export function getDefaultSTTProvider(): STTProvider {
  const order: TranscriptionProvider[] = ["WHISPER", "DEEPGRAM", "ASSEMBLYAI"];
  for (const name of order) {
    try {
      return getSTTProvider(name);
    } catch {
      continue;
    }
  }
  throw new Error("No STT provider is configured. Set OPENAI_API_KEY, DEEPGRAM_API_KEY, or ASSEMBLYAI_API_KEY.");
}
