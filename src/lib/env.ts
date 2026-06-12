import { isDemoSupabaseEnabled } from '@/client/demoSupabase';

export function validateEnv() {
  if (isDemoSupabaseEnabled()) {
    console.info('Local demo mode enabled. Supabase credentials are not required.');
    if (!import.meta.env.VITE_OPENAI_API_KEY) {
      console.info('OpenAI key not configured. Demo AI fallbacks will be used.');
    }
    return;
  }

  const requiredVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY'
  ];

  const missing = requiredVars.filter(
    (key) => !import.meta.env[key]
  );

  if (missing.length > 0) {
    console.warn(
      `Missing required backend environment variables: ${missing.join(', ')}. Enable VITE_DEMO_MODE=true for local demo mode.`
    );
    return;
  }

  if (!import.meta.env.VITE_OPENAI_API_KEY) {
    console.info('OpenAI key not configured. AI fallbacks will be used.');
  }
}
