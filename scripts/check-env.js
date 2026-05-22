import fs from 'fs';
import path from 'path';

const REQUIRED_ENV_VARS = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'VITE_COHERE_KEY',
  'VITE_OPENAI_API_KEY'
];

function checkEnv() {
  const envPath = path.resolve(process.cwd(), '.env');
  
  if (!fs.existsSync(envPath)) {
    console.warn('⚠️  .env file not found. Ensure environment variables are set in your hosting provider.');
    return;
  }

  const envContent = fs.readFileSync(envPath, 'utf-8');
  let missingVars = [];

  REQUIRED_ENV_VARS.forEach(varName => {
    if (!envContent.includes(varName) && !process.env[varName]) {
      missingVars.push(varName);
    }
  });

  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:');
    missingVars.forEach(v => console.error(`   - ${v}`));
    console.error('Please add them to your .env file or deployment environment.');
    process.exit(1);
  } else {
    console.log('✅ All required environment variables are present.');
  }
}

checkEnv();
