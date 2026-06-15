import fs from 'fs';
import path from 'path';

const OPTIONAL_AI_ENV_VARS = ['VITE_OPENAI_API_KEY'];
const OPTIONAL_AUTH_ENV_VARS = ['VITE_CLERK_PUBLISHABLE_KEY'];

function readEnvValue(varName) {
  if (process.env[varName]) return process.env[varName];
  for (const envFile of ['.env.local', '.env', '.env.example']) {
    const envPath = path.resolve(process.cwd(), envFile);
    if (!fs.existsSync(envPath)) continue;

    const envContent = fs.readFileSync(envPath, 'utf-8');
    const match = envContent.match(new RegExp(`^${varName}=(.*)$`, 'm'));
    if (match?.[1]) return match[1].trim().replace(/^['"]|['"]$/g, '');
  }
  return undefined;
}

function checkEnv() {
  const missingOptionalAiVars = OPTIONAL_AI_ENV_VARS.filter(
    (key) => !readEnvValue(key)
  );
  const missingOptionalAuthVars = OPTIONAL_AUTH_ENV_VARS.filter(
    (key) => !readEnvValue(key)
  );

  console.log('Demo-only backend enabled. Remote backend credentials are not required for the showcase flow.');

  if (missingOptionalAuthVars.length > 0) {
    console.warn(`Optional Clerk showcase auth not configured: ${missingOptionalAuthVars.join(', ')}. Seeded demo auth will be used.`);
  }

  if (missingOptionalAiVars.length > 0) {
    console.warn(`Optional AI integration not configured: ${missingOptionalAiVars.join(', ')}. Demo AI fallbacks will be used.`);
  }
}

checkEnv();
