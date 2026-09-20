import { foodFromIsraelMohRow } from './israel-moh-source.js';

// First reviewed PUMP 3 canonical foods. These rows were pulled directly from
// the Israeli Ministry of Health National Nutrition Database DataStore resource
// c3cb0630-0650-46c1-a068-82d575c094b2. Only semantically safe matches are
// promoted here; fuzzy/brand-specific matches stay out until manually reviewed.
const rows = Object.freeze({
  sesameOil: {
    Code: 4448,
    shmmitzrach: 'שמן שומשום',
    english_name: 'Oil, sesame',
    protein: 0,
    total_fat: 100,
    carbohydrates: 0,
    food_energy: 884,
    tarich_idkun: '',
  },
  oliveOil: {
    Code: 4443,
    shmmitzrach: 'שמן זית',
    english_name: 'Oil, olive',
    protein: 0,
    total_fat: 100,
    carbohydrates: 0,
    food_energy: 884,
    tarich_idkun: '',
  },
  peanutButter: {
    Code: 1858,
    shmmitzrach: 'חמאת בוטנים',
    english_name: 'Peanut butter',
    protein: 25.1,
    total_fat: 50.4,
    carbohydrates: 13.6,
    food_energy: 588,
    tarich_idkun: '',
  },
  wholeEgg: {
    Code: 1561,
    shmmitzrach: 'ביצה שלמה בלי קליפה',
    english_name: 'Egg, whole, raw',
    protein: 12.6,
    total_fat: 9.5,
    carbohydrates: 0.7,
    food_energy: 143,
    tarich_idkun: '',
  },
  hardBoiledEgg: {
    Code: 1564,
    shmmitzrach: 'ביצה קשה שלמה, ללא קליפה, עם מלח',
    english_name: 'Egg, hard-boiled,wihout shell, added salt',
    protein: 12.5,
    total_fat: 10.6,
    carbohydrates: 1.1,
    food_energy: 154,
    tarich_idkun: '26/04/2020 13:23:28:057',
  },
  bakedSalmon: {
    Code: 1298,
    shmmitzrach: 'דג סלמון אפוי ללא תוספת שומן בבישול',
    english_name: 'Fish, salmon, baked, fat not added ',
    protein: 26.5,
    total_fat: 5.7,
    carbohydrates: 0,
    food_energy: 164,
    tarich_idkun: '',
  },
  cookedCouscous: {
    Code: 10127,
    shmmitzrach: 'קוסקוס מבושל ללא שמן עם מלח',
    english_name: 'Couscous, whole wheat, cooked with salt, fat not added',
    protein: 5.9,
    total_fat: 0.3,
    carbohydrates: 33.7,
    food_energy: 175,
    tarich_idkun: '06/04/2020 14:23:26:227',
  },
});

export const OFFICIAL_FOODS_V1 = Object.freeze([
  foodFromIsraelMohRow(rows.sesameOil, { id: 'sesame-oil', state: 'ready', aliases: ['שמן שומשום'] }),
  foodFromIsraelMohRow(rows.oliveOil, { id: 'olive-oil', state: 'ready', aliases: ['שמן זית'] }),
  foodFromIsraelMohRow(rows.peanutButter, { id: 'peanut-butter', state: 'ready', aliases: ['חמאת בוטנים'] }),
  foodFromIsraelMohRow(rows.wholeEgg, { id: 'whole-egg', state: 'raw', aliases: ['ביצה', 'ביצים'] }),
  foodFromIsraelMohRow(rows.hardBoiledEgg, { id: 'hard-boiled-egg', state: 'cooked', aliases: ['ביצה קשה', 'ביצים קשות'] }),
  foodFromIsraelMohRow(rows.bakedSalmon, { id: 'salmon-baked', state: 'baked', aliases: ['סלמון אפוי'] }),
  foodFromIsraelMohRow(rows.cookedCouscous, { id: 'couscous-cooked', state: 'cooked', aliases: ['קוסקוס מבושל'] }),
]);

export const OFFICIAL_FOOD_BY_LEGACY_ALIAS = Object.freeze(Object.fromEntries(
  OFFICIAL_FOODS_V1.flatMap((food) => [food.name, ...(food.aliases ?? [])].map((alias) => [alias, food.id])),
));
