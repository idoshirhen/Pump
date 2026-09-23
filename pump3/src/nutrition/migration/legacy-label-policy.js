export const LEGACY_ALIAS_REDIRECTS = Object.freeze({
  'ביצים קשות': 'ביצה קשה',
  'תפוחי אדמה אפויים': 'תפוח אדמה אפוי',
  'פיתה מלאה קטנה': 'פיתה מלאה',
  'טופו מפורר': 'טופו',
  'עוף מבושל': 'חזה עוף מבושל',
  'דג בתנור': 'דג לבן אפוי',
});

export const LEGACY_OPTION_SPLITS = Object.freeze({
  'פרגיות או חזה עוף': Object.freeze(['פרגיות בתנור', 'חזה עוף מבושל']),
  'ענבים או פרי': Object.freeze(['ענבים', 'תפוח']),
  'פרי טרי': Object.freeze(['תפוח', 'בננה', 'תפוז', 'אגס']),
  'אגוזים': Object.freeze(['שקדים טבעיים', 'אגוזי מלך']),
  'גבינה 5%': Object.freeze(['גבינה לבנה 5%', 'קוטג׳ 5%']),
});

export const LEGACY_PRODUCT_REQUIRED = Object.freeze([
  'תחליף עוף על בסיס סויה',
  'מעדן חלבון',
  'יוגורט עשיר בחלבון',
]);

export function classifyLegacyLabel(label) {
  if (LEGACY_ALIAS_REDIRECTS[label]) return { type: 'alias', target: LEGACY_ALIAS_REDIRECTS[label] };
  if (LEGACY_OPTION_SPLITS[label]) return { type: 'options', options: LEGACY_OPTION_SPLITS[label] };
  if (LEGACY_PRODUCT_REQUIRED.includes(label)) return { type: 'product-required' };
  return { type: 'canonical' };
}
