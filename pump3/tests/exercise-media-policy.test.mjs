import assert from 'node:assert/strict';
import { EXERCISES } from '../src/training/data/exercise-catalog.js';
import { exerciseMediaQuality, getExerciseMedia, getExerciseMediaAudit } from '../src/training/media/exerciseMedia.js';

const audit = getExerciseMediaAudit();
assert.equal(audit.length, EXERCISES.length, 'every canonical exercise must have a media audit row');
assert.equal(new Set(audit.map((row) => row.exerciseId)).size, EXERCISES.length);

for (const row of audit) {
  for (const sex of ['female','male']) {
    const quality = row[sex];
    assert.ok(['approved','review','replace','missing'].includes(quality), `${row.exerciseId}/${sex} invalid media quality`);
    const production = getExerciseMedia(row.exerciseId, sex);
    if (quality === 'approved') assert.ok(production, `${row.exerciseId}/${sex} approved media should render`);
    else assert.equal(production, null, `${row.exerciseId}/${sex} unapproved media must not leak to production`);
  }
}

assert.equal(exerciseMediaQuality('band-chest-press','female'), 'missing');
assert.equal(getExerciseMedia('band-chest-press','female',{ allowUnapproved: true }), null);
assert.equal(exerciseMediaQuality('seated-scapular-retraction','male'), 'replace');
assert.equal(exerciseMediaQuality('gentle-scapular-retraction','male'), 'replace');

const review = getExerciseMedia('squat','male',{ allowUnapproved: true });
assert.ok(review);
assert.equal(review.quality, 'review');
assert.equal(review.src, '/Pump/assets/exercises-male/squat.webp');
assert.match(review.altEn, /Squat/);

console.log('PUMP 3 exercise media policy checks passed');
