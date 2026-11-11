import { cp, copyFile, mkdir, rm } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const www = resolve(root, 'www');
await rm(www, { recursive: true, force: true });
await mkdir(www, { recursive: true });
for (const file of ['index.html', 'manifest.webmanifest', 'sw.js']) {
  await copyFile(resolve(root, file), resolve(www, file));
}
await cp(resolve(root, 'assets'), resolve(www, 'assets'), { recursive: true });
console.log('Nihongo Path web assets prepared in www/');
