function requireEnv(key: string): string {
  const val = process.env[key];
  if (!val) throw new Error(`Missing required environment variable: ${key}`);
  return val;
}

function optionalEnv(key: string, fallback = ""): string {
  return process.env[key] ?? fallback;
}

export const env = {
  DATABASE_URL: optionalEnv("DATABASE_URL"),
  REDIS_URL: optionalEnv("REDIS_URL", "redis://localhost:6379"),

  CLERK_SECRET_KEY: optionalEnv("CLERK_SECRET_KEY"),
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: optionalEnv("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"),

  OPENAI_API_KEY: optionalEnv("OPENAI_API_KEY"),
  DEEPGRAM_API_KEY: optionalEnv("DEEPGRAM_API_KEY"),
  ASSEMBLYAI_API_KEY: optionalEnv("ASSEMBLYAI_API_KEY"),

  UPLOADTHING_TOKEN: optionalEnv("UPLOADTHING_TOKEN"),

  AWS_ACCESS_KEY_ID: optionalEnv("AWS_ACCESS_KEY_ID"),
  AWS_SECRET_ACCESS_KEY: optionalEnv("AWS_SECRET_ACCESS_KEY"),
  AWS_REGION: optionalEnv("AWS_REGION", "us-east-1"),
  AWS_S3_BUCKET: optionalEnv("AWS_S3_BUCKET"),

  NEXT_PUBLIC_APP_URL: optionalEnv("NEXT_PUBLIC_APP_URL", "http://localhost:3000"),
  NODE_ENV: optionalEnv("NODE_ENV", "development"),
} as const;
