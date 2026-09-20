import { readFile, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve } from 'node:path';

const manifestPath = resolve('pump3/src/training/data/exercise-manifest.json');
const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
const variants = [
  { sex: 'female', dir: resolve('assets/exercises') },
  { sex: 'male', dir: resolve('assets/exercises-male') },
];

const failures = [];
const warnings = [];
const rows = [];

function animationFrameCount(buffer) {
  const text = buffer.toString('latin1');
  return (text.match(/ANMF/g) || []).length;
}

for (const variant of variants) {
  const hashes = new Map();
  for (const exercise of manifest) {
    if (!exercise.media?.[variant.sex]) continue;
    const path = resolve(variant.dir, `${exercise.id}.webp`);
    try {
      const info = await stat(path);
      const buffer = await readFile(path);
      const header = buffer.subarray(0, 12).toString('latin1');
      const isWebP = header.startsWith('RIFF') && header.endsWith('WEBP');
      const frames = animationFrameCount(buffer);
      const hash = createHash('sha256').update(buffer).digest('hex');
      rows.push({ sex: variant.sex, id: exercise.id, bytes: info.size, frames, hash: hash.slice(0, 12) });
      if (!isWebP) failures.push(`${variant.sex}/${exercise.id}: file is not a valid RIFF/WEBP container`);
      if (frames < 2) warnings.push(`${variant.sex}/${exercise.id}: only ${frames || 1} detected frame(s); inspect visually`);
      const previous = hashes.get(hash);
      if (previous) failures.push(`${variant.sex}: ${previous} and ${exercise.id} are byte-for-byte identical`);
      else hashes.set(hash, exercise.id);
    } catch (error) {
      if (error?.code === 'ENOENT') failures.push(`${variant.sex}/${exercise.id}: missing ${exercise.id}.webp`);
      else throw error;
    }
  }
}

console.table(rows.map(({ sex, id, bytes, frames, hash }) => ({ sex, id, bytes, frames, hash })));
if (warnings.length) {
  console.log('\nWarnings:');
  warnings.forEach((warning) => console.log(`- ${warning}`));
}
if (failures.length) {
  console.error('\nExercise media audit FAILED:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exitCode = 1;
} else {
  console.log(`\nExercise media audit passed for ${rows.length} required files.`);
}
