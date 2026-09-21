// Explicit migration policy for every legacy ingredient that is not represented
// by a verified canonical food. PUMP 3 runtime meals are forbidden from using
// these labels. Ambiguous labels are split conceptually; recipe/product labels
// stay quarantined until a specific authoritative row or recipe composition is
// approved. This prevents legacy estimates from leaking back into the engine.
export const LEGACY_NUTRITION_POLICY = Object.freeze({
  'אגוזים': { action: 'split-required', note: 'Choose an explicit nut; generic nuts are not a nutrition item.' },
  'אדממה מבושלת': { action: 'quarantine', note: 'Requires a pinned cooked-edamame authoritative row.' },
  'בקר טחון רזה': { action: 'quarantine', note: 'Lean percentage and cooked/raw state must be explicit.' },
  'בקר רזה': { action: 'quarantine', note: 'Cut and cooked/raw state must be explicit.' },
  'גרגירי חומוס קלויים': { action: 'recipe-required', note: 'Roasting oil and final moisture materially change values.' },
  'דג בתנור': { action: 'split-required', note: 'Fish species must be explicit.' },
  'דג לבן אפוי': { action: 'split-required', note: 'White-fish species must be explicit.' },
  'חומוס': { action: 'split-required', options: ['chickpeas-cooked'], note: 'Legacy label mixed hummus spread and chickpeas; PUMP 3 uses explicit foods.' },
  'טורטייה מחיטה מלאה': { action: 'quarantine', note: 'Requires a specific verified tortilla definition.' },
  'ירקות צלויים': { action: 'recipe-required', note: 'Vegetable mix and added oil must be explicit.' },
  'לחם מלא': { action: 'quarantine', note: 'Bread varies materially; PUMP 3 will add a pinned verified product/generic row before use.' },
  'לחמנייה מלאה': { action: 'quarantine', note: 'Requires a specific verified roll definition.' },
  'מג׳דרה מבושלת': { action: 'recipe-required', note: 'Must be represented as rice/lentils/oil quantities, not one estimated label.' },
  'מוזלי': { action: 'quarantine', note: 'Brand/composition dependent.' },
  'מעדן חלבון': { action: 'quarantine', note: 'Brand/product dependent.' },
  'מרק שעועית': { action: 'recipe-required', note: 'Beans, liquid and oil quantities must be explicit.' },
  'עוף מבושל': { action: 'split-required', options: ['chicken-breast-roasted'], note: 'Cut and preparation must be explicit.' },
  'עוף מתובל': { action: 'recipe-required', note: 'Seasoning/coating/oil vary; use explicit chicken plus ingredients.' },
  'ענבים או פרי': { action: 'split-required', options: ['apple-raw', 'dates-dried-pitted'], note: 'Alternative foods may not share one nutrition line.' },
  'פול מבושל': { action: 'quarantine', note: 'Requires a pinned cooked-fava authoritative row without hidden oil.' },
  'פיתה מלאה': { action: 'quarantine', note: 'Requires a specific verified whole-wheat pita row.' },
  'פיתה מלאה קטנה': { action: 'quarantine', note: 'Size must be grams and product/type verified.' },
  'פלאפל אפוי': { action: 'recipe-required', note: 'Recipe and oil content must be explicit.' },
  'פסטת עדשים מבושלת': { action: 'quarantine', note: 'Brand/ingredient composition dependent.' },
  'פרגיות או חזה עוף': { action: 'split-required', options: ['chicken-breast-roasted'], note: 'Two different chicken cuts cannot share one nutrition line.' },
  'פרגיות בתנור': { action: 'quarantine', note: 'Thigh cut and preparation require a dedicated authoritative row.' },
  'פרי טרי': { action: 'split-required', options: ['apple-raw'], note: 'Fruit must be explicit.' },
  'פריכיות אורז': { action: 'quarantine', note: 'Requires a pinned verified rice-cake product/generic row.' },
  'קינמון': { action: 'quarantine', note: 'Legacy quantity was non-scalable seasoning; keep out until a clean spice row is pinned.' },
  'קציצות בקר רזות': { action: 'recipe-required', note: 'Meat percentage, binders and cooking method must be explicit.' },
  'קציצות הודו': { action: 'recipe-required', note: 'Recipe and cooking method materially change nutrition.' },
  'קציצות עדשים': { action: 'recipe-required', note: 'Recipe, oil and binders must be explicit.' },
  'קציצת בקר רזה': { action: 'recipe-required', note: 'Meat percentage and cooking method must be explicit.' },
  'קרקרים מלאים': { action: 'quarantine', note: 'Brand/product dependent.' },
  'רוטב שקשוקה': { action: 'recipe-required', note: 'Use explicit tomato sauce/oil/vegetables instead of an estimated sauce label.' },
  'שמרי בירה': { action: 'quarantine', note: 'Requires a pinned nutritional-yeast/brewer-yeast row.' },
  'שעועית מבושלת': { action: 'quarantine', note: 'Bean variety and preparation must be explicit.' },
  'תחליף עוף על בסיס סויה': { action: 'quarantine', note: 'Processed substitute is manufacturer-specific.' },
});

export const LEGACY_QUARANTINED_LABELS = Object.freeze(Object.keys(LEGACY_NUTRITION_POLICY));
