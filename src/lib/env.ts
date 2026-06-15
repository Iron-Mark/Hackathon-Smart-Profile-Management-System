export function validateEnv() {
  console.info('Demo-only backend enabled. Browser-local demo storage is used.');
  if (!import.meta.env.VITE_OPENAI_API_KEY) {
    console.info('OpenAI key not configured. Demo AI fallbacks will be used.');
  }
}
