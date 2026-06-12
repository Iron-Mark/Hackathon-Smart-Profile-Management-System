import fs from 'fs';
import path from 'path';

const source = path.resolve(process.cwd(), 'dist', 'index.html');
const destination = path.resolve(process.cwd(), 'dist', '404.html');

if (!fs.existsSync(source)) {
  console.error(`Cannot create 404.html because ${source} does not exist.`);
  process.exit(1);
}

fs.copyFileSync(source, destination);
console.log('Created dist/404.html for static SPA hosting fallback.');
