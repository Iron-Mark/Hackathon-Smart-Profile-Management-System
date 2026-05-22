export function validateEnv() {
  const requiredVars = [
    'VITE_SUPABASE_URL',
    'VITE_SUPABASE_ANON_KEY',
    'VITE_OPENAI_API_KEY'
  ];

  const missing = requiredVars.filter(
    (key) => !import.meta.env[key]
  );

  if (missing.length > 0) {
    console.warn(
      `⚠️ WARNING: Missing required environment variables: ${missing.join(', ')}. Some features may not work properly.`
    );
  } else {
    console.log("✅ Environment validation passed.");
  }
}
