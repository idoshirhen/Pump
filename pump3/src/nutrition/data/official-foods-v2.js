import { foodFromIsraelMohRow } from './israel-moh-source.js';

// Second manually-reviewed canonical batch. Every row below comes directly from
// the Israeli Ministry of Health National Nutrition Database. We only promote
// matches where the legacy PUMP label can be made semantically explicit.
const rows = Object.freeze({
  cottage5: { Code: 494, shmmitzrach: "גבינת קוטג' 5%  שומן, תנובה", english_name: 'Cheese, cow milk, cottage, 5% fat, Tnuva', protein: 11, total_fat: 5, carbohydrates: 1.5, food_energy: 95, tarich_idkun: '08/02/2020 14:39:59:293' },
  whiteCheese5: { Code: 532, shmmitzrach: 'גבינה לבנה 5% שומן, תנובה', english_name: 'Cheese, white, 5% fat, Tnuva', protein: 9, total_fat: 5, carbohydrates: 4.3, food_energy: 98, tarich_idkun: '' },
  vegetableSaladNoOil: { Code: 9704, shmmitzrach: 'סלט ירקות ישראלי ללא תוספת שמן', english_name: 'Salad, Israeli, no added oil', protein: 0.8, total_fat: 0.2, carbohydrates: 2.9, food_energy: 17, tarich_idkun: '' },
  yellowCheese9: { Code: 10011, shmmitzrach: 'FFQ-גבינה צהובה או מותכת 9% שומן או פחות', english_name: 'FFQ- Yellow or processed cheese, 9% fat or less', protein: 27.6, total_fat: 8.3, carbohydrates: 2.8, food_energy: 196, tarich_idkun: '' },
  oatsRaw: { Code: 8199, shmmitzrach: 'שיבולת שועל, קוואקר, רגיל ואינסטנט, לא מבושל', english_name: 'Oats, regular and instant, uncooked', protein: 13.1, total_fat: 6.5, carbohydrates: 57.6, food_energy: 379, tarich_idkun: '' },
  bulgarianCheese5: { Code: 9519, shmmitzrach: 'גבינה בולגרית, 5% שומן, מחלב בקר, כולל מעודנת, צוריאל', english_name: 'Bulgarian cheese, cow milk, 5% fat', protein: 13, total_fat: 5, carbohydrates: 5, food_energy: 117, tarich_idkun: '' },
  saltyCheese5: { Code: 10013, shmmitzrach: 'FFQ-גבינה מלוחה מכל סוג 5% שומן או פחות, כגון: צפתית או בולגרית', english_name: 'FFQ- Salty cheese, 5% fat or less', protein: 17.3, total_fat: 5, carbohydrates: 2.7, food_energy: 125, tarich_idkun: '' },
  driedDates: { Code: 3171, shmmitzrach: 'תמרים מיובשים, ללא גלעין', english_name: 'Dates, dried, pitted', protein: 2.5, total_fat: 0.4, carbohydrates: 67, food_energy: 282, tarich_idkun: '' },
  quinoaCookedNoFat: { Code: 2773, shmmitzrach: 'קינואה מבושלת ללא תוספת שומן', english_name: 'Quinoa, cooked, no added fat', protein: 5.4, total_fat: 2.3, carbohydrates: 21.7, food_energy: 140, tarich_idkun: '' },
  bulgurCookedNoFat: { Code: 9550, shmmitzrach: 'בורגול, מבושל עם מלח או משומר, ללא תוספת שומן בבישול', english_name: 'Bulgur, cooked with salt or canned, no added fat', protein: 3.1, total_fat: 0.2, carbohydrates: 14, food_energy: 83, tarich_idkun: '' },
  tomatoSauceNoOil: { Code: 9155, shmmitzrach: 'רוטב עגבניות מרסק עגבניות ללא שמן', english_name: 'Tomato sauce from tomato paste, no oil', protein: 1.5, total_fat: 0.4, carbohydrates: 9.6, food_energy: 48, tarich_idkun: '' },
  tunaCannedWater: { Code: 1360, shmmitzrach: 'דג טונה, משומר במים', english_name: 'Fish, tuna, canned in water', protein: 19.4, total_fat: 1, carbohydrates: 0, food_energy: 86, tarich_idkun: '' },
});

export const OFFICIAL_FOODS_V2 = Object.freeze([
  foodFromIsraelMohRow(rows.cottage5, { id: 'cottage-5', state: 'ready', aliases: ['קוטג׳ 5%', "קוטג' 5%"] }),
  foodFromIsraelMohRow(rows.whiteCheese5, { id: 'white-cheese-5', state: 'ready', aliases: ['גבינה לבנה 5%'] }),
  foodFromIsraelMohRow(rows.vegetableSaladNoOil, { id: 'israeli-salad-no-oil', state: 'prepared', aliases: ['סלט ירקות', 'סלט קצוץ', 'ירקות קצוצים'] }),
  foodFromIsraelMohRow(rows.yellowCheese9, { id: 'yellow-cheese-9', state: 'ready', aliases: ['גבינה צהובה 9%'] }),
  foodFromIsraelMohRow(rows.oatsRaw, { id: 'oats-raw', state: 'raw', aliases: ['שיבולת שועל'] }),
  foodFromIsraelMohRow(rows.bulgarianCheese5, { id: 'bulgarian-cheese-5', state: 'ready', aliases: ['גבינה בולגרית 5%'] }),
  foodFromIsraelMohRow(rows.saltyCheese5, { id: 'salty-cheese-5', state: 'ready', aliases: ['גבינה מלוחה 5%'] }),
  foodFromIsraelMohRow(rows.driedDates, { id: 'dates-dried-pitted', state: 'dried', aliases: ['תמרים'] }),
  foodFromIsraelMohRow(rows.quinoaCookedNoFat, { id: 'quinoa-cooked', state: 'cooked', aliases: ['קינואה מבושלת'] }),
  foodFromIsraelMohRow(rows.bulgurCookedNoFat, { id: 'bulgur-cooked', state: 'cooked', aliases: ['בורגול מבושל'] }),
  foodFromIsraelMohRow(rows.tomatoSauceNoOil, { id: 'tomato-sauce-no-oil', state: 'prepared', aliases: ['רוטב עגבניות'] }),
  foodFromIsraelMohRow(rows.tunaCannedWater, { id: 'tuna-canned-water', state: 'canned', aliases: ['טונה במים', 'טונה במים מסוננת'] }),
]);
