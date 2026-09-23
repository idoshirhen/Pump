const AMBIGUOUS = [
  { re: /^חומוס$/i, code: 'hummus-vs-chickpeas', note: 'Must choose hummus spread or cooked chickpeas.' },
  { re: /^ירקות$/i, code: 'generic-vegetables', note: 'Must be replaced by a defined salad/vegetable composition.' },
  { re: /^פרי טרי$/i, code: 'generic-fruit', note: 'Must choose a specific fruit or an explicit fruit option set.' },
  { re: /^אגוזים$/i, code: 'generic-nuts', note: 'Must choose a nut type or an explicit nut mix.' },
  { re: /^דג לבן$/i, code: 'generic-white-fish', note: 'Must choose species and preparation state.' },
  { re: /^גבינה 5%$/i, code: 'generic-cheese', note: 'Must choose a specific cheese type/product definition.' },
  { re: /^תחליף עוף/i, code: 'brand-dependent-substitute', note: 'Processed substitute requires a defined product/source row.' },
  { re: /פרגיות או חזה עוף/i, code: 'two-foods-one-label', note: 'Split into chicken thigh and chicken breast options.' },
  { re: /ענבים או פרי/i, code: 'alternative-foods-one-label', note: 'Split grapes and other fruit into separate options.' },
];

const STATE_SENSITIVE = /אורז|פסטה|פתיתים|קוסקוס|בורגול|קינואה|עדשים|שעועית|חומוס|תפוחי? אדמה|בטטה|עוף|בקר|דג|סלמון|טופו/i;
const EXPLICIT_STATE = /מבושל|מבושלת|מבושלים|אפוי|אפויה|אפויים|בתנור|צרוב|מסוננת|מוכן|מתובל|טחון|קשות|קשה|קלויים|צלוי|צלויה/i;

export function classifyLegacyFoodLabel(label) {
  const name = String(label ?? '').trim();
  if (!name) return { label: name, status: 'blocked', reason: 'empty-label' };

  const ambiguity = AMBIGUOUS.find((rule) => rule.re.test(name));
  if (ambiguity) {
    return { label: name, status: 'blocked', reason: ambiguity.code, note: ambiguity.note };
  }

  if (STATE_SENSITIVE.test(name) && !EXPLICIT_STATE.test(name)) {
    return {
      label: name,
      status: 'needs-state',
      reason: 'preparation-state-required',
      note: 'Resolve raw/cooked/baked/etc. before matching an official source row.',
    };
  }

  return {
    label: name,
    status: 'ready-for-source-match',
    reason: 'canonical-source-row-still-required',
  };
}

export function summarizeLegacyFoodLabels(labels) {
  const classified = [...new Set(labels.map((value) => String(value).trim()).filter(Boolean))]
    .map(classifyLegacyFoodLabel);
  return {
    total: classified.length,
    ready: classified.filter((item) => item.status === 'ready-for-source-match'),
    needsState: classified.filter((item) => item.status === 'needs-state'),
    blocked: classified.filter((item) => item.status === 'blocked'),
    all: classified,
  };
}
