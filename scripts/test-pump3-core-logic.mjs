import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const source = await readFile(new URL('../assets/pump3-core-logic-v1.js', import.meta.url), 'utf8');
const window = {};
vm.runInNewContext(source, { window, Object, Array, Number, Math, String });
const logic = window.PUMP3CoreLogic;
assert.ok(logic, 'core logic is exposed');
assert.equal(logic.version, '1.0');

const base = {
  sex: 'male', age: 33, height: 172, startWeight: 62, targetWeight: 65,
  activity: 'light', goal: 'gain', pace: 'steady', trainingDays: 5,
  trainingPlace: 'home', trainingLevel: 'beginner',
};
let target = logic.targets(base);
const expectedBmr = Math.round(10*62 + 6.25*172 - 5*33 + 5);
assert.equal(target.bmr, expectedBmr);
assert.equal(target.maintenance, Math.round(expectedBmr * 1.375));
assert.equal(target.calories, Math.round((target.maintenance * 1.10) / 10) * 10);
assert.equal(target.protein, 99.2, 'gain protein follows PUMP 3 1.6 g/kg rule');
assert.equal(target.adjustment, 0, 'sleep/weekend do not invent calorie deductions');

const sameButSleepWeekend = logic.targets({ ...base, sleep: 'underSix', weekendEating: true });
assert.equal(sameButSleepWeekend.calories, target.calories, 'sleep/weekend flags do not silently alter energy targets');

const lose = logic.targets({ ...base, goal: 'lose', targetWeight: 58, activity: 'high' });
assert.equal(lose.maintenance, Math.round(expectedBmr * 1.725));
assert.equal(lose.calories, Math.round((lose.maintenance * .85) / 10) * 10);
assert.equal(lose.protein, 111.6);

assert.equal(logic.maxExercises(20), 4);
assert.equal(logic.maxExercises(30), 5);
assert.equal(logic.maxExercises(45), 6);
assert.equal(logic.maxExercises(60), 7);

let plan = logic.training(base, { equipment: ['dumbbells'], trainingFocus: 'upper', limitation: 'none', sessionMinutes: '30' });
assert.equal(plan.a.exercises.length, 5);
assert.match(plan.a.exercises[0].detail, /^2 סטים של 8–12/);
assert.ok(plan.a.exercises.some((e) => /לחיצת חזה עם משקולות/.test(e.name)));

plan = logic.training({ ...base, trainingLevel: 'returning' }, { equipment: ['gym'], trainingFocus: 'balanced', limitation: 'knee', sessionMinutes: '45' });
assert.equal(plan.a.exercises.length, 6);
assert.match(plan.a.exercises[0].detail, /^3 סטים של 8–15/);
assert.equal(plan.a.exercises.some((e) => /סקוואט/.test(e.name)), false, 'knee limitation avoids deep-knee-flexion selection');

plan = logic.training({ ...base, trainingLevel: 'experienced' }, { equipment: ['dumbbells'], trainingFocus: 'upper', limitation: 'shoulder', sessionMinutes: '60' });
assert.equal(plan.a.exercises.length, 7);
assert.ok(plan.a.exercises.every((e) => !/לחיצת כתפיים/.test(e.name)), 'shoulder limitation avoids overhead-heavy work');
assert.ok(plan.a.exercises.some((e) => /לחיצה מול קיר/.test(e.name)), 'shoulder limitation substitutes a gentle press');
assert.ok(plan.a.exercises.some((e) => /3 סטים של 6–15/.test(e.detail)), 'advanced prescription follows PUMP 3 rule');

console.log('PUMP 3 core target/training logic checks passed');
