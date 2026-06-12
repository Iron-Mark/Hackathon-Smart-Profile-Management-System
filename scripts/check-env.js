import fs from 'fs';
import path from 'path';

const REQUIRED_BACKEND_ENV_VARS = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY'
];

const OPTIONAL_ENV_VARS = ['VITE_OPENAI_API_KEY'];

function readEnvValue(envContent, varName) {
  if (process.env[varName]) return process.env[varName];
  const match = envContent.match(new RegExp(`^${varName}=(.*)$`, 'm'));
  return match?.[1]?.trim().replace(/^['"]|['"]$/g, '');
}

function checkEnv() {
  const envPaths = [
    path.resolve(process.cwd(), '.env.local'),
    path.resolve(process.cwd(), '.env')
  ];
  const envPath = envPaths.find((candidate) => fs.existsSync(candidate));
  
  const envContent = envPath ? fs.readFileSync(envPath, 'utf-8') : '';
  const demoMode = readEnvValue(envContent, 'VITE_DEMO_MODE') === 'true';
  const missingBackendVars = REQUIRED_BACKEND_ENV_VARS.filter(
    (key) => !readEnvValue(envContent, key)
  );
  const missingOptionalVars = OPTIONAL_ENV_VARS.filter(
    (key) => !readEnvValue(envContent, key)
  );

  if (demoMode || (!envPath && missingBackendVars.length === REQUIRED_BACKEND_ENV_VARS.length)) {
    console.log('Local demo mode enabled. Supabase/OpenAI credentials are not required for the demo flow.');
    if (missingOptionalVars.length > 0) {
      console.warn(`Optional AI integration not configured: ${missingOptionalVars.join(', ')}. Demo AI fallbacks will be used.`);
    }
    return;
  }

  if (missingBackendVars.length > 0) {
    console.error('❌ Missing required environment variables:');
    missingBackendVars.forEach(v => console.error(`   - ${v}`));
    console.error('Set VITE_DEMO_MODE=true for local demo mode, or add Supabase values to .env.local, .env, or your deployment environment.');
    process.exit(1);
  }

  if (missingOptionalVars.length > 0) {
    console.warn(`Optional AI integration not configured: ${missingOptionalVars.join(', ')}. AI fallbacks will be used.`);
  }

  console.log('✅ Required backend environment variables are present.');
}

checkEnv();
