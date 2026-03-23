import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const slug = process.argv[2];
if (!slug || /[\\/]/.test(slug) || slug.includes('..')) {
  console.error('Usage: node scripts/generate-project-manifest.mjs <folder-name>');
  console.error('Example: proj-1, proj-4 (under public/wp-content/uploads/2024/Projects/)');
  process.exit(1);
}

const projDir = path.join(__dirname, '../public/wp-content/uploads/2024/Projects', slug);
const manifestPath = path.join(projDir, 'manifest.json');
const IMAGE_EXT = /\.(jpe?g|png|gif|webp|avif|svg)$/i;

if (!fs.existsSync(projDir)) {
  fs.mkdirSync(projDir, { recursive: true });
}

const names = fs
  .readdirSync(projDir)
  .filter((name) => IMAGE_EXT.test(name) && name.toLowerCase() !== 'manifest.json')
  .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

fs.writeFileSync(manifestPath, JSON.stringify(names, null, 2) + '\n', 'utf8');
console.log(`[${slug}] Wrote ${names.length} image(s) to manifest.json`);
