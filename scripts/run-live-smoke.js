import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const liveUrl = 'https://iron-mark.github.io/Hackathon-Smart-Profile-Management-System/';
const liveBasePath = '/Hackathon-Smart-Profile-Management-System/';
const smokeSpecs = [
  'tests/deep-links.spec.ts',
  'tests/seo.spec.ts',
  'tests/public-demo-responsive.spec.ts',
];

const command = join(
  process.cwd(),
  'node_modules',
  'playwright',
  'cli.js'
);

if (!existsSync(command)) {
  console.error('Playwright is not installed. Run npm ci before live smoke checks.');
  process.exit(1);
}

const result = spawnSync(
  process.execPath,
  [command, 'test', ...smokeSpecs, '--reporter=line'],
  {
    stdio: 'inherit',
    env: {
      ...process.env,
      PLAYWRIGHT_BASE_URL: liveUrl,
      PLAYWRIGHT_BASE_PATH: liveBasePath,
    },
  }
);

if (result.error) {
  console.error(result.error.message);
}

process.exit(result.status ?? 1);
