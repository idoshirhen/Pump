import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const destination = resolve(root, 'android/app/src/main/assets');

await rm(destination, { recursive: true, force: true });
await mkdir(destination, { recursive: true });

let html = await readFile(resolve(root, 'index.html'), 'utf8');
html = html.replaceAll('/Pump/', './');
await writeFile(resolve(destination, 'index.html'), html, 'utf8');

await cp(resolve(root, 'assets'), resolve(destination, 'assets'), { recursive: true });
for (const file of ['pump-logo.png', 'pump-logo-main.png', 'pump-logo-favicon.png', 'pump-logo-transparent.png', 'pump logo.png', 'pump-logo-black.png', 'pump-logo-heart-dumbbell.png']) {
    await cp(resolve(root, file), resolve(destination, file));
}

console.log('Android web assets synchronized.');
