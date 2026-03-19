import { createGroq } from '@ai-sdk/groq';

let groqClient: ReturnType<typeof createGroq> | null = null;

export function getGroqClient() {
  if (groqClient) {
    return groqClient;
  }

  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error('GROQ_API_KEY is not set');
  }

  groqClient = createGroq({ apiKey });
  return groqClient;
}
