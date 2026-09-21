import assert from 'node:assert/strict';
import { EXERCISES } from '../src/training/data/exercise-catalog.js';
import { exerciseMediaQuality, getExerciseMedia, getExerciseMediaAudit, MEDIA_POLICY, LEGACY_AVAILABLE } from '../src/training/media/exerciseMedia.js';

const audit = getExerciseMediaAudit();
assert.equal(audit.length, EXERCISES.length, 'every canonical exercise must have a media audit row');
assert.equal(new Set(audit.map((row) => row.exerciseId)).size, EXERCISES.length);
assert.equal(MEDIA_POLICY.productionRequires, 'approved');
assert.equal(MEDIA_POLICY.legacyDefault, 'replace');
assert.equal(MEDIA_POLICY.missingFallback, 'text-instructions');

for (const row of audit) {
  for (const sex of ['female','male']) {
    const quality = row[sex];
    assert.ok(['approved','replace','missing'].includes(quality), `${row.exerciseId}/${sex} invalid media quality`);
    const production = getExerciseMedia(row.exerciseId, sex);
    if (quality === 'approved') assert.ok(production, `${row.exerciseId}/${sex} approved media should render`);
    else assert.equal(production, null, `${row.exerciseId}/${sex} unapproved media must not leak to production`);
  }
}

assert.equal(exerciseMediaQuality('band-chest-press','female'), 'missing');
assert.equal(getExerciseMedia('band-chest-press','female',{ allowUnapproved: true }), null);
assert.equal(exerciseMediaQuality('seated-scapular-retraction','male'), 'replace');
assert.equal(exerciseMediaQuality('gentle-scapular-retraction','male'), 'replace');
assert.equal(exerciseMediaQuality('squat','male'), 'replace');

const legacyPreview = getExerciseMedia('squat','male',{ allowUnapproved: true });
assert.ok(legacyPreview);
assert.equal(legacyPreview.quality, 'replace');
assert.equal(legacyPreview.sourceKind, 'legacy-ai-frame-sequence');
assert.equal(legacyPreview.src, '/Pump/assets/exercises-male/squat.webp');
assert.match(legacyPreview.altEn, /Squat/);

for (const id of LEGACY_AVAILABLE) {
  for (const sex of ['female','male']) {
    if (id === 'band-chest-press' && sex === 'female') continue;
    assert.notEqual(exerciseMediaQuality(id, sex), 'approved', `${id}/${sex} legacy asset must stay quarantined`);
  }
}

console.log('PUMP 3 exercise media policy checks passed: legacy AI WebPs are quarantined from production');
