import { foodFromIsraelMohRow } from './israel-moh-source.js';

// Manually reviewed MOH rows promoted only where the returned food is the same
// food/preparation represented by the legacy PUMP label. Values are per 100 g.
const rows = Object.freeze({
  olives: { Code: 4278, shmmitzrach: 'זיתים, לפנ', english_name: 'Olives', protein: 0.9, total_fat: 12.1, carbohydrates: 2.3, food_energy: 124, tarich_idkun: '' },
  zaatar: { Code: 4171, shmmitzrach: 'זעתר-אזוב, מיובש, טחון', english_name: 'Hyssop, dried, ground', protein: 12.7, total_fat: 7, carbohydrates: 20.3, food_energy: 271, tarich_idkun: '' },
  lemon: { Code: 3116, shmmitzrach: 'לימון עם קליפה וגרעינים', english_name: 'Lemon, whole', protein: 0.6, total_fat: 0.2, carbohydrates: 4.9, food_energy: 15, tarich_idkun: '' },
  proteinYogurt: { Code: 9707, shmmitzrach: 'יוגורט, דנונה פרו, עשיר בחלבון, 2.9% שומן, שטראוס', english_name: 'Yogurt, Danone Pro, high protein, 2.9% fat', protein: 8, total_fat: 2.9, carbohydrates: 4, food_energy: 74, tarich_idkun: '' },
  naturalYogurt: { Code: 8957, shmmitzrach: 'יוגורט טבעי, 2.8% שומן , מולר', english_name: 'Yogurt, natural, 2.8% fat, Muller', protein: 5.4, total_fat: 2.8, carbohydrates: 6.3, food_energy: 72, tarich_idkun: '' },
  sesamePaste: { Code: 8367, shmmitzrach: 'טחינה ירוקה, טחינה ירוקה חריפה בלאדי', english_name: 'Tahini, prepared', protein: 9.2, total_fat: 24.2, carbohydrates: 10, food_energy: 296, tarich_idkun: '' },
  stirFryVegetables: { Code: 4142, shmmitzrach: 'ירקות מוקפצים, בצל, פלפל וגזר ברוטב סויה ושמן קנולה', english_name: 'Stir-fried vegetables with soy sauce and canola oil', protein: 1.1, total_fat: 5.7, carbohydrates: 6.4, food_energy: 86, tarich_idkun: '' },
  ptitim: { Code: 2629, shmmitzrach: 'פתיתים מבושלים עם רוטב עגבניות מרסק עגבניות ושמן קנולה', english_name: 'Israeli couscous, cooked with tomato sauce and canola oil', protein: 4.2, total_fat: 1.2, carbohydrates: 27.2, food_energy: 139, tarich_idkun: '' },
});

export const OFFICIAL_FOODS_V9 = Object.freeze([
  foodFromIsraelMohRow(rows.olives, { id: 'olives-ready', state: 'ready', aliases: ['זיתים'] }),
  foodFromIsraelMohRow(rows.zaatar, { id: 'zaatar-dried', state: 'dried', aliases: ['זעתר'] }),
  foodFromIsraelMohRow(rows.lemon, { id: 'lemon-whole', state: 'raw', aliases: ['לימון'] }),
  foodFromIsraelMohRow(rows.proteinYogurt, { id: 'protein-yogurt-2-9', state: 'ready', aliases: ['יוגורט עשיר בחלבון'] }),
  foodFromIsraelMohRow(rows.naturalYogurt, { id: 'natural-yogurt-2-8', state: 'ready', aliases: ['יוגורט טבעי'] }),
  foodFromIsraelMohRow(rows.sesamePaste, { id: 'tahini-prepared', state: 'prepared', aliases: ['טחינה'] }),
  foodFromIsraelMohRow(rows.stirFryVegetables, { id: 'vegetables-stir-fried', state: 'cooked', aliases: ['ירקות מוקפצים'] }),
  foodFromIsraelMohRow(rows.ptitim, { id: 'ptitim-cooked-tomato', state: 'cooked', aliases: ['פתיתים מבושלים'] }),
]);
