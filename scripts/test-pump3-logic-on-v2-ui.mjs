import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const source = await readFile(new URL('../assets/pump-nutrition-accuracy-v1.js', import.meta.url), 'utf8');

const document = {
  readyState: 'complete',
  documentElement: {},
  querySelectorAll: () => [],
  addEventListener: () => {},
};
const window = {
  fetch: async () => ({ ok: true }),
  setInterval: () => 0,
};
window.window = window;

class MutationObserver {
  observe() {}
}

const context = vm.createContext({
  window,
  document,
  MutationObserver,
  requestAnimationFrame: (fn) => fn(),
  console,
  Object,
  Map,
  Number,
  String,
  Math,
  RegExp,
  JSON,
});
vm.runInContext(source, context);

const logic = window.PUMP3NutritionLogic;
assert.ok(logic, 'PUMP 3 nutrition logic hook must be available');
assert.equal(logic.version, '3.0-on-v2-ui');

function near(actual, expected, tolerance = 0.01) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} should be near ${expected}`);
}

// PUMP 3 canonical source-backed rows.
let row = logic.nutritionFor('סלמון אפוי', 100, 'גרם');
near(row.calories, 164); near(row.protein, 26.5);
row = logic.nutritionFor('טונה במים', 100, 'גרם');
near(row.calories, 86); near(row.protein, 19.4);
row = logic.nutritionFor('קוטג׳ 5%', 100, 'גרם');
near(row.calories, 95); near(row.protein, 11);
row = logic.nutritionFor('גבינה צהובה 9%', 100, 'גרם');
near(row.calories, 196); near(row.protein, 27.6);
row = logic.nutritionFor('קוסקוס מבושל', 100, 'גרם');
near(row.calories, 175); near(row.protein, 5.9);
row = logic.nutritionFor('קינואה מבושלת', 100, 'גרם');
near(row.calories, 140); near(row.protein, 5.4);
row = logic.nutritionFor('חזה עוף', 100, 'גרם');
near(row.calories, 165); near(row.protein, 31.02);
row = logic.nutritionFor('אורז מבושל', 100, 'גרם');
near(row.calories, 130); near(row.protein, 2.69);
row = logic.nutritionFor('סלט ירקות', 100, 'גרם');
near(row.calories, 17); near(row.protein, 0.8);

console.log('PUMP 3 logic-on-PUMP-2-UI nutrition checks passed');
