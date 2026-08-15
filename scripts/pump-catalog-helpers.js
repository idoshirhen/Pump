function pumpIngredient(name, amount, unit = 'גרם', scalable = true) {
  return { name, amount, unit, scalable };
}

function pumpCatalogEntry(id, slots, title, tags, family, calories, protein, carbs, fat, ingredients) {
  return { id, slots, title, tags, family, calories, protein, carbs, fat, ingredients };
}

// A curated, deliberately finite catalogue. Every item has ingredients, a base
// portion and macro estimates; the engine below adjusts the portion to the
// user's meal target instead of attaching an arbitrary calorie value afterwards.
const pumpMealCatalog = [
  // Breakfast — 18 meals
  pumpCatalogEntry('omelet-cottage-salad', ['breakfast'], 'חביתה, קוטג׳ וסלט', ['vegetarian', 'eggs', 'dairy', 'cottage', 'bread', 'gluten', 'quick', 'budget'], 'eggs', 430, 34, 32, 18, [pumpIngredient('ביצים', 2, 'יח׳'), pumpIngredient('קוטג׳ 5%', 150), pumpIngredient('לחם מלא', 2, 'פרוסות'), pumpIngredient('סלט ירקות', 1, 'קערה', false)]),
  pumpCatalogEntry('shakshuka-bread', ['breakfast'], 'שקשוקה, סלט ולחם מלא', ['vegetarian', 'eggs', 'bread', 'gluten', 'quick', 'budget'], 'eggs', 410, 27, 42, 16, [pumpIngredient('ביצים', 2, 'יח׳'), pumpIngredient('רוטב שקשוקה', 250), pumpIngredient('לחם מלא', 2, 'פרוסות'), pumpIngredient('סלט ירקות', 1, 'קערה', false)]),
  pumpCatalogEntry('tuna-sandwich', ['breakfast'], 'כריך טונה ישראלי', ['fish', 'tuna', 'bread', 'gluten', 'quick', 'budget'], 'tuna', 420, 32, 45, 12, [pumpIngredient('טונה במים מסוננת', 120), pumpIngredient('לחם מלא', 2, 'פרוסות'), pumpIngredient('טחינה', 15), pumpIngredient('ירקות', 1, 'קערה', false)]),
  pumpCatalogEntry('skyr-oats-fruit', ['breakfast'], 'סקיר, שיבולת שועל ופרי', ['vegetarian', 'dairy', 'yogurt', 'oats', 'gluten', 'fruit', 'quick'], 'dairy', 390, 30, 53, 7, [pumpIngredient('סקיר או יוגורט PRO', 200), pumpIngredient('שיבולת שועל', 45), pumpIngredient('פרי טרי', 1, 'יח׳'), pumpIngredient('קינמון', 1, 'קורט', false)]),
  pumpCatalogEntry('protein-yogurt-bowl', ['breakfast'], 'קערת יוגורט חלבון, גרנולה ופרי', ['vegetarian', 'dairy', 'yogurt', 'gluten', 'fruit', 'quick'], 'dairy', 420, 32, 55, 9, [pumpIngredient('יוגורט חלבון', 200), pumpIngredient('גרנולה', 40), pumpIngredient('פרי טרי', 1, 'יח׳'), pumpIngredient('זרעים', 10)]),
  pumpCatalogEntry('cottage-pita-vegetables', ['breakfast'], 'פיתה מלאה עם קוטג׳ וירקות', ['vegetarian', 'dairy', 'cottage', 'bread', 'gluten', 'quick', 'budget'], 'dairy', 430, 29, 48, 13, [pumpIngredient('פיתה מלאה', 1, 'יח׳'), pumpIngredient('קוטג׳ 5%', 180), pumpIngredient('ירקות', 1, 'קערה', false), pumpIngredient('זעתר', 1, 'קורט', false)]),
  pumpCatalogEntry('toast-cheese-egg', ['breakfast'], 'טוסט גבינה, ביצה וסלט', ['vegetarian', 'dairy', 'eggs', 'bread', 'gluten', 'quick'], 'eggs', 440, 31, 39, 18, [pumpIngredient('לחם מלא', 2, 'פרוסות'), pumpIngredient('גבינה צהובה 9%', 40), pumpIngredient('ביצה', 1, 'יח׳'), pumpIngredient('סלט ירקות', 1, 'קערה', false)]),
  pumpCatalogEntry('overnight-oats', ['breakfast'], 'לילה של שיבולת שועל ויוגורט', ['vegetarian', 'dairy', 'yogurt', 'oats', 'gluten', 'fruit', 'quick'], 'dairy', 400, 27, 56, 8, [pumpIngredient('שיבולת שועל', 55), pumpIngredient('יוגורט עשיר בחלבון', 180), pumpIngredient('חלב', 100), pumpIngredient('פרי יער או בננה', 100)]),
  pumpCatalogEntry('egg-avocado-wrap', ['breakfast'], 'טורטייה עם ביצים, אבוקדו וסלט', ['vegetarian', 'eggs', 'bread', 'gluten', 'quick'], 'eggs', 460, 28, 42, 21, [pumpIngredient('טורטייה מחיטה מלאה', 1, 'יח׳'), pumpIngredient('ביצים', 2, 'יח׳'), pumpIngredient('אבוקדו', 50), pumpIngredient('ירקות', 1, 'קערה', false)]),
  pumpCatalogEntry('tuna-rice-cakes', ['breakfast'], 'טונה, פריכיות אורז וירקות', ['fish', 'tuna', 'rice', 'quick', 'budget'], 'tuna', 360, 30, 39, 8, [pumpIngredient('טונה במים מסוננת', 120), pumpIngredient('פריכיות אורז', 5, 'יח׳'), pumpIngredient('טחינה', 10), pumpIngredient('ירקות', 1, 'קערה', false)]),
  pumpCatalogEntry('tofu-tahini-sandwich', ['breakfast'], 'כריך טופו וטחינה', ['vegan', 'plant', 'tofu', 'soy', 'tahini', 'bread', 'gluten', 'quick', 'budget'], 'tofu', 430, 28, 44, 17, [pumpIngredient('טופו צרוב', 160), pumpIngredient('לחם מלא', 2, 'פרוסות'), pumpIngredient('טחינה', 18), pumpIngredient('ירקות', 1, 'קערה', false)]),
  pumpCatalogEntry('pea-protein-oats', ['breakfast'], 'דייסת שיבולת שועל וחלבון אפונה', ['vegan', 'plant', 'oats', 'gluten', 'fruit', 'quick', 'budget'], 'plant', 410, 29, 57, 8, [pumpIngredient('שיבולת שועל', 55), pumpIngredient('אבקת חלבון אפונה', 30), pumpIngredient('משקה שיבולת שועל', 220), pumpIngredient('בננה', 1, 'יח׳')]),
  pumpCatalogEntry('chickpea-pancake', ['breakfast'], 'פנקייק חומוס, ירקות וטחינה', ['vegan', 'plant', 'legumes', 'tahini', 'quick', 'budget'], 'legumes', 400, 23, 48, 14, [pumpIngredient('קמח חומוס', 70), pumpIngredient('טחינה', 18), pumpIngredient('ירקות קצוצים', 180), pumpIngredient('שמן זית', 5)]),
  pumpCatalogEntry('hummus-sweet-potato', ['breakfast'], 'חומוס, בטטה וירקות', ['vegan', 'plant', 'legumes', 'potato', 'quick', 'budget'], 'legumes', 420, 20, 63, 11, [pumpIngredient('חומוס', 150), pumpIngredient('בטטה אפויה', 220), pumpIngredient('ירקות', 1, 'קערה', false), pumpIngredient('לימון ופטרוזיליה', 1, 'מנה', false)]),
  pumpCatalogEntry('quinoa-fruit-protein', ['breakfast'], 'קינואה מתוקה, פרי וחלבון אפונה', ['vegan', 'plant', 'rice', 'fruit', 'quick'], 'plant', 410, 27, 60, 7, [pumpIngredient('קינואה מבושלת', 170), pumpIngredient('אבקת חלבון אפונה', 25), pumpIngredient('פרי טרי', 1, 'יח׳'), pumpIngredient('משקה צמחי', 150)]),
  pumpCatalogEntry('rice-cakes-hummus', ['breakfast'], 'פריכיות, חומוס ועגבניות', ['vegan', 'plant', 'legumes', 'rice', 'quick', 'budget'], 'legumes', 340, 17, 49, 8, [pumpIngredient('פריכיות אורז', 6, 'יח׳'), pumpIngredient('חומוס', 120), pumpIngredient('עגבניות ומלפפון', 1, 'קערה', false), pumpIngredient('זעתר', 1, 'קורט', false)]),
  pumpCatalogEntry('oats-nuts-yogurt', ['breakfast'], 'יוגורט, שיבולת שועל ואגוזים', ['vegetarian', 'dairy', 'yogurt', 'oats', 'gluten', 'nuts', 'fruit', 'quick'], 'dairy', 450, 27, 48, 17, [pumpIngredient('יוגורט עשיר בחלבון', 200), pumpIngredient('שיבולת שועל', 40), pumpIngredient('אגוזים', 20), pumpIngredient('פרי טרי', 1, 'יח׳')]),
  pumpCatalogEntry('protein-smoothie', ['breakfast'], 'שייק חלבון, בננה ושיבולת שועל', ['vegetarian', 'dairy', 'yogurt', 'oats', 'gluten', 'fruit', 'quick'], 'dairy', 390, 31, 51, 6, [pumpIngredient('אבקת חלבון', 30), pumpIngredient('חלב או יוגורט', 250), pumpIngredient('בננה', 1, 'יח׳'), pumpIngredient('שיבולת שועל', 30)]),
  pumpCatalogEntry('egg-potato-bowl', ['breakfast'], 'קערת ביצים, תפוח אדמה וירקות', ['vegetarian', 'eggs', 'potato', 'quick', 'budget'], 'eggs', 410, 25, 45, 16, [pumpIngredient('ביצים', 2, 'יח׳'), pumpIngredient('תפוח אדמה אפוי', 230), pumpIngredient('ירקות', 1, 'קערה', false), pumpIngredient('טחינה', 12)]),

  // Lunch — 26 meals
  pumpCatalogEntry('chicken-rice-tahini', ['lunch'], 'עוף, אורז, סלט וטחינה', ['meat', 'chicken', 'rice', 'tahini', 'quick', 'budget'], 'chicken', 610, 49, 67, 17, [pumpIngredient('חזה עוף מבושל', 170), pumpIngredient('אורז מבושל', 200), pumpIngredient('טחינה', 18), pumpIngredient('סלט ירקות', 1, 'קערה', false)]),
  pumpCatalogEntry('chicken-potato-tray', ['lunch'], 'עוף, תפוחי אדמה וירקות בתבנית', ['meat', 'chicken', 'potato', 'quick', 'budget'], 'chicken', 580, 48, 57, 16, [pumpIngredient('חזה עוף מבושל', 180), pumpIngredient('תפוחי אדמה אפויים', 280), pumpIngredient('ירקות צלויים', 220), pumpIngredient('שמן זית', 8)]),
  pumpCatalogEntry('chicken-shawarma-pita', ['lunch'], 'פיתה שווארמה עוף וטחינה', ['meat', 'chicken', 'bread', 'gluten', 'tahini', 'quick'], 'chicken', 620, 46, 63, 20, [pumpIngredient('עוף מתובל', 180), pumpIngredient('פיתה מלאה', 1, 'יח׳'), pumpIngredient('טחינה', 20), pumpIngredient('סלט קצוץ', 1, 'קערה', false)]),
  pumpCatalogEntry('chicken-pasta', ['lunch'], 'פסטה עם עוף ורוטב עגבניות', ['meat', 'chicken', 'pasta', 'gluten', 'quick', 'budget'], 'chicken', 630, 51, 72, 13, [pumpIngredient('חזה עוף מבושל', 170), pumpIngredient('פסטה מבושלת', 230), pumpIngredient('רוטב עגבניות', 150), pumpIngredient('ירקות', 150)]),
  pumpCatalogEntry('turkey-meatballs-rice', ['lunch'], 'קציצות הודו, אורז וסלט', ['meat', 'chicken', 'rice', 'budget'], 'chicken', 590, 45, 65, 16, [pumpIngredient('קציצות הודו', 190), pumpIngredient('אורז מבושל', 200), pumpIngredient('סלט ירקות', 1, 'קערה', false), pumpIngredient('טחינה', 15)]),
  pumpCatalogEntry('beef-meatballs-potato', ['lunch'], 'קציצות בקר ותפוחי אדמה', ['meat', 'beef', 'potato', 'budget'], 'beef', 610, 42, 55, 24, [pumpIngredient('קציצות בקר רזות', 180), pumpIngredient('תפוחי אדמה אפויים', 280), pumpIngredient('סלט ירקות', 1, 'קערה', false), pumpIngredient('טחינה', 12)]),
  pumpCatalogEntry('beef-burger-rice', ['lunch'], 'המבורגר בקר, אורז וסלט', ['meat', 'beef', 'rice', 'quick'], 'beef', 650, 45, 65, 23, [pumpIngredient('קציצת בקר רזה', 180), pumpIngredient('אורז מבושל', 200), pumpIngredient('סלט ירקות', 1, 'קערה', false), pumpIngredient('טחינה', 15)]),
  pumpCatalogEntry('beef-chili-rice', ['lunch'], 'צ׳ילי בקר ושעועית עם אורז', ['meat', 'beef', 'legumes', 'rice', 'budget'], 'beef', 640, 46, 73, 18, [pumpIngredient('בקר טחון רזה', 150), pumpIngredient('שעועית מבושלת', 130), pumpIngredient('אורז מבושל', 170), pumpIngredient('רוטב עגבניות', 140)]),
  pumpCatalogEntry('salmon-potato', ['lunch'], 'סלמון, תפוח אדמה וירקות', ['fish', 'salmon', 'potato'], 'fish', 590, 41, 49, 25, [pumpIngredient('סלמון אפוי', 170), pumpIngredient('תפוח אדמה אפוי', 270), pumpIngredient('ירקות צלויים', 220), pumpIngredient('לימון', 1, 'מנה', false)]),
  pumpCatalogEntry('white-fish-couscous', ['lunch'], 'דג לבן, קוסקוס וסלט', ['fish', 'couscous', 'gluten', 'quick', 'budget'], 'fish', 570, 43, 68, 12, [pumpIngredient('דג לבן אפוי', 190), pumpIngredient('קוסקוס מבושל', 220), pumpIngredient('סלט ירקות', 1, 'קערה', false), pumpIngredient('טחינה', 12)]),
  pumpCatalogEntry('tuna-pasta-tomato', ['lunch'], 'פסטה עם טונה ורוטב עגבניות', ['fish', 'tuna', 'pasta', 'gluten', 'quick', 'budget'], 'tuna', 570, 42, 71, 10, [pumpIngredient('טונה במים מסוננת', 140), pumpIngredient('פסטה מבושלת', 230), pumpIngredient('רוטב עגבניות', 170), pumpIngredient('ירקות', 150)]),
  pumpCatalogEntry('tuna-rice-salad', ['lunch'], 'סלט אורז, טונה וירקות', ['fish', 'tuna', 'rice', 'quick', 'budget'], 'tuna', 540, 39, 62, 12, [pumpIngredient('טונה במים מסוננת', 140), pumpIngredient('אורז מבושל', 190), pumpIngredient('ירקות קצוצים', 250), pumpIngredient('טחינה', 15)]),
  pumpCatalogEntry('shakshuka-chickpeas-rice', ['lunch'], 'שקשוקה, חומוס ואורז', ['vegetarian', 'eggs', 'legumes', 'rice', 'quick', 'budget'], 'eggs', 560, 31, 74, 15, [pumpIngredient('ביצים', 2, 'יח׳'), pumpIngredient('חומוס מבושל', 120), pumpIngredient('אורז מבושל', 160), pumpIngredient('רוטב שקשוקה', 220)]),
  pumpCatalogEntry('omelet-potato-cottage', ['lunch'], 'חביתה, תפוח אדמה וקוטג׳', ['vegetarian', 'eggs', 'dairy', 'cottage', 'potato', 'quick', 'budget'], 'eggs', 560, 39, 56, 20, [pumpIngredient('ביצים', 2, 'יח׳'), pumpIngredient('קוטג׳ 5%', 160), pumpIngredient('תפוח אדמה אפוי', 260), pumpIngredient('סלט ירקות', 1, 'קערה', false)]),
  pumpCatalogEntry('tofu-stir-rice', ['lunch'], 'טופו מוקפץ עם אורז וירקות', ['vegan', 'plant', 'tofu', 'soy', 'rice', 'quick', 'budget'], 'tofu', 560, 34, 66, 17, [pumpIngredient('טופו', 200), pumpIngredient('אורז מבושל', 200), pumpIngredient('ירקות מוקפצים', 250), pumpIngredient('שמן שומשום', 7)]),
  pumpCatalogEntry('tofu-curry-quinoa', ['lunch'], 'קארי טופו, קינואה וירקות', ['vegan', 'plant', 'tofu', 'soy', 'rice'], 'tofu', 590, 34, 67, 20, [pumpIngredient('טופו', 200), pumpIngredient('קינואה מבושלת', 200), pumpIngredient('ירקות', 240), pumpIngredient('חלב קוקוס קל', 70)]),
  pumpCatalogEntry('vegan-shawarma-pita', ['lunch'], 'שווארמה טבעונית בפיתה', ['vegan', 'plant', 'soy', 'bread', 'gluten', 'tahini', 'quick'], 'tofu', 600, 32, 70, 20, [pumpIngredient('תחליף עוף על בסיס סויה', 180), pumpIngredient('פיתה מלאה', 1, 'יח׳'), pumpIngredient('טחינה', 20), pumpIngredient('סלט קצוץ', 1, 'קערה', false)]),
  pumpCatalogEntry('mejadra-tahini', ['lunch'], 'מג׳דרה, סלט וטחינה', ['vegan', 'plant', 'legumes', 'rice', 'tahini', 'quick', 'budget'], 'legumes', 560, 24, 85, 14, [pumpIngredient('מג׳דרה מבושלת', 330), pumpIngredient('טחינה', 22), pumpIngredient('סלט ירקות', 1, 'קערה', false), pumpIngredient('לימון', 1, 'מנה', false)]),
  pumpCatalogEntry('lentil-pasta-feta', ['lunch'], 'פסטת עדשים, בולגרית וסלט', ['vegetarian', 'plant', 'legumes', 'dairy', 'pasta', 'gluten'], 'legumes', 590, 37, 74, 15, [pumpIngredient('פסטת עדשים מבושלת', 240), pumpIngredient('גבינה בולגרית 5%', 60), pumpIngredient('רוטב עגבניות', 160), pumpIngredient('סלט ירקות', 1, 'קערה', false)]),
  pumpCatalogEntry('chickpea-curry-rice', ['lunch'], 'קארי חומוס, אורז וירקות', ['vegan', 'plant', 'legumes', 'rice', 'quick', 'budget'], 'legumes', 570, 22, 88, 13, [pumpIngredient('חומוס מבושל', 190), pumpIngredient('אורז מבושל', 190), pumpIngredient('ירקות', 230), pumpIngredient('קרם קוקוס קל', 55)]),
  pumpCatalogEntry('bean-chili-rice', ['lunch'], 'צ׳ילי שעועית ואורז', ['vegan', 'plant', 'legumes', 'rice', 'quick', 'budget'], 'legumes', 550, 24, 89, 9, [pumpIngredient('שעועית מבושלת', 230), pumpIngredient('אורז מבושל', 190), pumpIngredient('רוטב עגבניות', 180), pumpIngredient('תירס', 60)]),
  pumpCatalogEntry('quinoa-lentil-bowl', ['lunch'], 'קערת קינואה, עדשים וטחינה', ['vegan', 'plant', 'legumes', 'rice', 'tahini', 'quick'], 'legumes', 550, 25, 72, 16, [pumpIngredient('קינואה מבושלת', 200), pumpIngredient('עדשים מבושלות', 180), pumpIngredient('טחינה', 20), pumpIngredient('ירקות', 250)]),
  pumpCatalogEntry('roasted-chickpea-bowl', ['lunch'], 'קערת ירקות צלויים וחומוס', ['vegan', 'plant', 'legumes', 'tahini', 'budget'], 'legumes', 520, 22, 67, 16, [pumpIngredient('חומוס מבושל', 200), pumpIngredient('ירקות צלויים', 300), pumpIngredient('בורגול מבושל', 150), pumpIngredient('טחינה', 18)]),
  pumpCatalogEntry('baked-falafel-pita', ['lunch'], 'פלאפל אפוי, פיתה וסלט', ['vegan', 'plant', 'legumes', 'bread', 'gluten', 'tahini', 'quick', 'budget'], 'legumes', 590, 24, 81, 17, [pumpIngredient('פלאפל אפוי', 170), pumpIngredient('פיתה מלאה', 1, 'יח׳'), pumpIngredient('טחינה', 18), pumpIngredient('סלט קצוץ', 1, 'קערה', false)]),
  pumpCatalogEntry('tempeh-rice-bowl', ['lunch'], 'טמפה, אורז וירקות', ['vegan', 'plant', 'soy', 'rice'], 'tofu', 590, 35, 65, 19, [pumpIngredient('טמפה', 180), pumpIngredient('אורז מבושל', 190), pumpIngredient('ירקות מוקפצים', 250), pumpIngredient('רוטב סויה', 10)]),
  pumpCatalogEntry('salmon-sushi-bowl', ['lunch'], 'קערת סושי עם סלמון', ['fish', 'salmon', 'rice'], 'fish', 600, 39, 68, 20, [pumpIngredient('סלמון מבושל', 150), pumpIngredient('אורז סושי מבושל', 210), pumpIngredient('אבוקדו', 55), pumpIngredient('מלפפון וגזר', 180)]),

  // Dinner — 22 meals
  pumpCatalogEntry('chicken-salad-wrap', ['dinner'], 'טורטיית עוף, סלט וטחינה', ['meat', 'chicken', 'bread', 'gluten', 'tahini', 'quick'], 'chicken', 520, 42, 48, 16, [pumpIngredient('עוף מבושל', 160), pumpIngredient('טורטייה מחיטה מלאה', 1, 'יח׳'), pumpIngredient('טחינה', 15), pumpIngredient('סלט קצוץ', 1, 'קערה', false)]),
  pumpCatalogEntry('chicken-vegetable-stir', ['dinner'], 'עוף מוקפץ, אורז וירקות', ['meat', 'chicken', 'rice', 'quick', 'budget'], 'chicken', 540, 45, 58, 13, [pumpIngredient('חזה עוף', 170), pumpIngredient('אורז מבושל', 170), pumpIngredient('ירקות מוקפצים', 260), pumpIngredient('שמן שומשום', 6)]),
  pumpCatalogEntry('chicken-pita-salad', ['dinner'], 'פיתה עוף, סלט וטחינה', ['meat', 'chicken', 'bread', 'gluten', 'tahini', 'quick'], 'chicken', 540, 43, 51, 17, [pumpIngredient('עוף מתובל', 170), pumpIngredient('פיתה מלאה קטנה', 1, 'יח׳'), pumpIngredient('טחינה', 16), pumpIngredient('סלט ירקות', 1, 'קערה', false)]),
  pumpCatalogEntry('tuna-toast-salad', ['dinner'], 'טוסט טונה, גבינה וסלט', ['fish', 'tuna', 'dairy', 'bread', 'gluten', 'quick'], 'tuna', 490, 39, 44, 16, [pumpIngredient('טונה במים', 120), pumpIngredient('לחם מלא', 2, 'פרוסות'), pumpIngredient('גבינה צהובה 9%', 35), pumpIngredient('סלט ירקות', 1, 'קערה', false)]),
  pumpCatalogEntry('salmon-potato-dinner', ['dinner'], 'סלמון, תפוח אדמה וסלט', ['fish', 'salmon', 'potato'], 'fish', 530, 38, 44, 23, [pumpIngredient('סלמון אפוי', 160), pumpIngredient('תפוח אדמה אפוי', 230), pumpIngredient('סלט ירקות', 1, 'קערה', false), pumpIngredient('לימון', 1, 'מנה', false)]),
  pumpCatalogEntry('egg-toast-cottage', ['dinner'], 'טוסט, ביצים וקוטג׳', ['vegetarian', 'eggs', 'dairy', 'cottage', 'bread', 'gluten', 'quick', 'budget'], 'eggs', 500, 38, 43, 19, [pumpIngredient('ביצים', 2, 'יח׳'), pumpIngredient('קוטג׳ 5%', 130), pumpIngredient('לחם מלא', 2, 'פרוסות'), pumpIngredient('ירקות', 1, 'קערה', false)]),
  pumpCatalogEntry('cottage-salad-pita', ['dinner'], 'קוטג׳, פיתה מלאה וסלט גדול', ['vegetarian', 'dairy', 'cottage', 'bread', 'gluten', 'quick', 'budget'], 'dairy', 480, 34, 50, 14, [pumpIngredient('קוטג׳ 5%', 200), pumpIngredient('פיתה מלאה קטנה', 1, 'יח׳'), pumpIngredient('סלט גדול', 1, 'קערה', false), pumpIngredient('טחינה', 10)]),
  pumpCatalogEntry('shakshuka-dinner', ['dinner'], 'שקשוקה, גבינה ולחם', ['vegetarian', 'eggs', 'dairy', 'bread', 'gluten', 'quick'], 'eggs', 480, 32, 42, 19, [pumpIngredient('ביצים', 2, 'יח׳'), pumpIngredient('רוטב שקשוקה', 260), pumpIngredient('גבינה בולגרית 5%', 45), pumpIngredient('לחם מלא', 2, 'פרוסות')]),
  pumpCatalogEntry('turkey-pita-dinner', ['dinner'], 'קציצות הודו בפיתה עם סלט', ['meat', 'chicken', 'bread', 'gluten', 'quick'], 'chicken', 530, 42, 55, 14, [pumpIngredient('קציצות הודו', 180), pumpIngredient('פיתה מלאה קטנה', 1, 'יח׳'), pumpIngredient('סלט קצוץ', 1, 'קערה', false), pumpIngredient('טחינה', 12)]),
  pumpCatalogEntry('beef-salad-potato', ['dinner'], 'בקר רזה, תפוח אדמה וסלט', ['meat', 'beef', 'potato'], 'beef', 560, 43, 43, 23, [pumpIngredient('בקר רזה', 170), pumpIngredient('תפוח אדמה אפוי', 220), pumpIngredient('סלט גדול', 1, 'קערה', false), pumpIngredient('טחינה', 12)]),
  pumpCatalogEntry('tofu-stir-dinner', ['dinner'], 'טופו מוקפץ עם אורז וירקות', ['vegan', 'plant', 'tofu', 'soy', 'rice', 'quick'], 'tofu', 500, 31, 54, 16, [pumpIngredient('טופו', 190), pumpIngredient('אורז מבושל', 160), pumpIngredient('ירקות מוקפצים', 280), pumpIngredient('שמן שומשום', 6)]),
  pumpCatalogEntry('tofu-chili-bowl', ['dinner'], 'צ׳ילי טופו, שעועית ואורז', ['vegan', 'plant', 'tofu', 'soy', 'legumes', 'rice', 'budget'], 'tofu', 530, 33, 67, 14, [pumpIngredient('טופו מפורר', 150), pumpIngredient('שעועית מבושלת', 140), pumpIngredient('אורז מבושל', 150), pumpIngredient('רוטב עגבניות', 160)]),
  pumpCatalogEntry('lentil-salad-tahini', ['dinner'], 'סלט עדשים, אורז וטחינה', ['vegan', 'plant', 'legumes', 'rice', 'tahini', 'quick', 'budget'], 'legumes', 500, 23, 63, 15, [pumpIngredient('עדשים מבושלות', 200), pumpIngredient('אורז מבושל', 150), pumpIngredient('טחינה', 18), pumpIngredient('ירקות קצוצים', 260)]),
  pumpCatalogEntry('bean-soup-bread', ['dinner'], 'מרק שעועית, לחם מלא וסלט', ['vegan', 'plant', 'legumes', 'bread', 'gluten', 'budget'], 'legumes', 470, 22, 72, 8, [pumpIngredient('מרק שעועית', 450), pumpIngredient('לחם מלא', 2, 'פרוסות'), pumpIngredient('סלט ירקות', 1, 'קערה', false), pumpIngredient('טחינה', 10)]),
  pumpCatalogEntry('lentil-pasta-dinner', ['dinner'], 'פסטת עדשים ורוטב עגבניות', ['vegan', 'plant', 'legumes', 'pasta', 'gluten', 'quick', 'budget'], 'legumes', 500, 28, 72, 8, [pumpIngredient('פסטת עדשים מבושלת', 230), pumpIngredient('רוטב עגבניות', 180), pumpIngredient('ירקות', 180), pumpIngredient('שמרי בירה', 10)]),
  pumpCatalogEntry('stuffed-potato-beans', ['dinner'], 'תפוח אדמה ממולא שעועית וסלט', ['vegan', 'plant', 'legumes', 'potato', 'quick', 'budget'], 'legumes', 480, 21, 72, 9, [pumpIngredient('תפוח אדמה אפוי', 330), pumpIngredient('שעועית מבושלת', 160), pumpIngredient('סלט קצוץ', 1, 'קערה', false), pumpIngredient('טחינה', 12)]),
  pumpCatalogEntry('hummus-rice-bowl', ['dinner'], 'קערת חומוס, אורז וירקות', ['vegan', 'plant', 'legumes', 'rice', 'tahini', 'quick', 'budget'], 'legumes', 490, 20, 70, 13, [pumpIngredient('חומוס', 190), pumpIngredient('אורז מבושל', 150), pumpIngredient('טחינה', 12), pumpIngredient('ירקות', 260)]),
  pumpCatalogEntry('chickpea-salad-potato', ['dinner'], 'סלט חומוס, תפוח אדמה וטחינה', ['vegan', 'plant', 'legumes', 'potato', 'tahini', 'quick', 'budget'], 'legumes', 490, 20, 65, 15, [pumpIngredient('חומוס מבושל', 190), pumpIngredient('תפוח אדמה אפוי', 230), pumpIngredient('טחינה', 18), pumpIngredient('ירקות קצוצים', 250)]),
  pumpCatalogEntry('tuna-rice-wrap', ['dinner'], 'טורטיית טונה, אורז וירקות', ['fish', 'tuna', 'rice', 'bread', 'gluten', 'quick'], 'tuna', 520, 39, 58, 13, [pumpIngredient('טונה במים', 130), pumpIngredient('טורטייה מחיטה מלאה', 1, 'יח׳'), pumpIngredient('אורז מבושל', 90), pumpIngredient('ירקות', 180)]),
  pumpCatalogEntry('yogurt-omelet-plate', ['dinner'], 'חביתה, יוגורט ותפוח אדמה', ['vegetarian', 'eggs', 'dairy', 'yogurt', 'potato', 'quick', 'budget'], 'eggs', 470, 34, 42, 17, [pumpIngredient('ביצים', 2, 'יח׳'), pumpIngredient('יוגורט עשיר בחלבון', 160), pumpIngredient('תפוח אדמה אפוי', 210), pumpIngredient('ירקות', 1, 'קערה', false)]),
  pumpCatalogEntry('halloumi-quinoa-salad', ['dinner'], 'סלט קינואה וגבינה מלוחה', ['vegetarian', 'dairy', 'rice', 'quick'], 'dairy', 500, 28, 55, 18, [pumpIngredient('קינואה מבושלת', 190), pumpIngredient('גבינה מלוחה 5%', 70), pumpIngredient('ירקות קצוצים', 280), pumpIngredient('שמן זית', 8)]),
  pumpCatalogEntry('salmon-pasta-dinner', ['dinner'], 'פסטה וסלמון ברוטב עגבניות', ['fish', 'salmon', 'pasta', 'gluten'], 'fish', 560, 38, 61, 19, [pumpIngredient('סלמון אפוי', 150), pumpIngredient('פסטה מבושלת', 190), pumpIngredient('רוטב עגבניות', 180), pumpIngredient('ירקות', 160)]),

  // Snacks — 20 meals
  pumpCatalogEntry('skyr-fruit-snack', ['snack'], 'סקיר או יוגורט PRO עם פרי', ['vegetarian', 'dairy', 'yogurt', 'fruit', 'quick'], 'dairy', 190, 19, 24, 2, [pumpIngredient('סקיר או יוגורט PRO', 170), pumpIngredient('פרי טרי', 1, 'יח׳')]),
  pumpCatalogEntry('protein-pudding-fruit', ['snack'], 'מעדן חלבון ופרי', ['vegetarian', 'dairy', 'yogurt', 'fruit', 'quick'], 'dairy', 190, 20, 25, 2, [pumpIngredient('מעדן חלבון', 1, 'יח׳'), pumpIngredient('פרי טרי', 1, 'יח׳')]),
  pumpCatalogEntry('cottage-crackers-snack', ['snack'], 'קוטג׳, קרקרים וירקות', ['vegetarian', 'dairy', 'cottage', 'gluten', 'quick', 'budget'], 'dairy', 230, 23, 25, 8, [pumpIngredient('קוטג׳ 5%', 150), pumpIngredient('קרקרים מלאים', 4, 'יח׳'), pumpIngredient('ירקות', 1, 'קערה', false)]),
  pumpCatalogEntry('egg-fruit-snack', ['snack'], 'ביצה קשה, פרי וירקות', ['vegetarian', 'eggs', 'fruit', 'quick', 'budget'], 'eggs', 180, 12, 18, 8, [pumpIngredient('ביצה קשה', 1, 'יח׳'), pumpIngredient('פרי טרי', 1, 'יח׳'), pumpIngredient('ירקות', 1, 'קערה', false)]),
  pumpCatalogEntry('tuna-mini-sandwich', ['snack'], 'כריך טונה קטן', ['fish', 'tuna', 'bread', 'gluten', 'quick', 'budget'], 'tuna', 240, 22, 28, 6, [pumpIngredient('טונה במים', 90), pumpIngredient('לחם מלא', 2, 'פרוסות'), pumpIngredient('ירקות', 1, 'קערה', false)]),
  pumpCatalogEntry('protein-shake-banana', ['snack'], 'שייק חלבון ובננה', ['vegetarian', 'dairy', 'fruit', 'quick'], 'dairy', 240, 25, 31, 3, [pumpIngredient('אבקת חלבון', 30), pumpIngredient('חלב או משקה חלבוני', 200), pumpIngredient('בננה', 1, 'יח׳')]),
  pumpCatalogEntry('hummus-crackers-snack', ['snack'], 'חומוס, קרקרים וירקות', ['vegan', 'plant', 'legumes', 'gluten', 'quick', 'budget'], 'legumes', 220, 10, 31, 8, [pumpIngredient('חומוס', 100), pumpIngredient('קרקרים מלאים', 4, 'יח׳'), pumpIngredient('ירקות', 1, 'קערה', false)]),
  pumpCatalogEntry('apple-peanut-butter', ['snack'], 'תפוח וחמאת בוטנים', ['vegan', 'plant', 'nuts', 'fruit', 'quick', 'budget'], 'nuts', 230, 7, 28, 12, [pumpIngredient('תפוח', 1, 'יח׳'), pumpIngredient('חמאת בוטנים', 25)]),
  pumpCatalogEntry('soy-yogurt-fruit', ['snack'], 'יוגורט סויה, פרי ושיבולת שועל', ['vegan', 'plant', 'soy', 'oats', 'gluten', 'fruit', 'quick'], 'tofu', 220, 15, 31, 7, [pumpIngredient('יוגורט סויה', 200), pumpIngredient('שיבולת שועל', 25), pumpIngredient('פרי טרי', 1, 'יח׳')]),
  pumpCatalogEntry('pea-protein-shake', ['snack'], 'שייק חלבון אפונה ופרי', ['vegan', 'plant', 'fruit', 'quick'], 'plant', 210, 23, 26, 3, [pumpIngredient('אבקת חלבון אפונה', 30), pumpIngredient('משקה צמחי', 220), pumpIngredient('פרי טרי', 1, 'יח׳')]),
  pumpCatalogEntry('rice-cakes-hummus-snack', ['snack'], 'פריכיות אורז, חומוס וירקות', ['vegan', 'plant', 'legumes', 'rice', 'quick', 'budget'], 'legumes', 210, 9, 34, 6, [pumpIngredient('פריכיות אורז', 5, 'יח׳'), pumpIngredient('חומוס', 90), pumpIngredient('ירקות', 1, 'קערה', false)]),
  pumpCatalogEntry('chickpeas-fruit-snack', ['snack'], 'גרגירי חומוס מתובלים ופרי', ['vegan', 'plant', 'legumes', 'fruit', 'quick', 'budget'], 'legumes', 200, 10, 36, 3, [pumpIngredient('גרגירי חומוס קלויים', 90), pumpIngredient('פרי טרי', 1, 'יח׳')]),
  pumpCatalogEntry('oat-protein-bites', ['snack'], 'כדורי שיבולת שועל וחלבון', ['vegetarian', 'dairy', 'oats', 'gluten', 'nuts', 'quick'], 'dairy', 230, 17, 26, 9, [pumpIngredient('שיבולת שועל', 35), pumpIngredient('אבקת חלבון', 20), pumpIngredient('חמאת בוטנים', 15)]),
  pumpCatalogEntry('cheese-grapes-snack', ['snack'], 'גבינה, ענבים וקרקרים', ['vegetarian', 'dairy', 'gluten', 'fruit', 'quick'], 'dairy', 230, 18, 29, 7, [pumpIngredient('גבינה 5%', 120), pumpIngredient('ענבים או פרי', 120), pumpIngredient('קרקרים מלאים', 3, 'יח׳')]),
  pumpCatalogEntry('edamame-rice-snack', ['snack'], 'אדממה ופריכיות אורז', ['vegan', 'plant', 'soy', 'rice', 'quick', 'budget'], 'tofu', 210, 16, 25, 7, [pumpIngredient('אדממה מבושלת', 130), pumpIngredient('פריכיות אורז', 4, 'יח׳')]),
  pumpCatalogEntry('tuna-rice-cakes-snack', ['snack'], 'טונה ופריכיות אורז', ['fish', 'tuna', 'rice', 'quick', 'budget'], 'tuna', 220, 21, 24, 6, [pumpIngredient('טונה במים', 100), pumpIngredient('פריכיות אורז', 4, 'יח׳'), pumpIngredient('ירקות', 1, 'קערה', false)]),
  pumpCatalogEntry('cottage-fruit-snack', ['snack'], 'קוטג׳, פרי וקינמון', ['vegetarian', 'dairy', 'cottage', 'fruit', 'quick', 'budget'], 'dairy', 210, 22, 25, 5, [pumpIngredient('קוטג׳ 5%', 160), pumpIngredient('פרי טרי', 1, 'יח׳'), pumpIngredient('קינמון', 1, 'קורט', false)]),
  pumpCatalogEntry('yogurt-muesli-snack', ['snack'], 'יוגורט, מוזלי ופרי', ['vegetarian', 'dairy', 'yogurt', 'gluten', 'fruit', 'quick'], 'dairy', 230, 19, 34, 5, [pumpIngredient('יוגורט עשיר בחלבון', 170), pumpIngredient('מוזלי', 30), pumpIngredient('פרי טרי', 1, 'יח׳')]),
  pumpCatalogEntry('tofu-bites-snack', ['snack'], 'קוביות טופו, ירקות וטחינה', ['vegan', 'plant', 'tofu', 'soy', 'tahini', 'quick'], 'tofu', 220, 18, 12, 13, [pumpIngredient('טופו צרוב', 150), pumpIngredient('טחינה', 12), pumpIngredient('ירקות', 1, 'קערה', false)]),
  pumpCatalogEntry('dates-tahini-snack', ['snack'], 'תמרים, טחינה ופריכיות', ['vegan', 'plant', 'tahini', 'rice', 'quick', 'budget'], 'plant', 230, 6, 43, 6, [pumpIngredient('תמרים', 3, 'יח׳'), pumpIngredient('טחינה', 18), pumpIngredient('פריכיות אורז', 3, 'יח׳')]),
];

function pumpCatalogPreferences(profile) {
  const raw = pumpPersonalization(profile);
  return {
    foodStyle: raw.foodStyle || 'regular',
    avoid: pumpPreferenceList(raw.avoid),
    proteins: pumpPreferenceList(raw.proteins),
    favorites: pumpPreferenceList(raw.favorites),
    dislikes: pumpPreferenceList(raw.dislikes),
    prep: raw.prep || 'quick',
    budget: raw.budget || 'regular',
  };
}

function pumpCatalogFeedbackEntry(profile, recipeId) {
  const feedback = pumpPreferenceList(profile?.mealFeedback);
  return feedback.find((item) => item && item.recipeId === recipeId) || null;
}

function pumpCatalogFeedback(profile, recipeId) {
  return pumpCatalogFeedbackEntry(profile, recipeId)?.feedback || '';
}

function pumpCatalogSelectionFeedback(profile, recipeId, date) {
  const entry = pumpCatalogFeedbackEntry(profile, recipeId);
  if (!entry) return '';
  const updatedDate = typeof entry.updatedAt === 'string' ? entry.updatedAt.slice(0, 10) : '';
  return updatedDate && updatedDate === String(date || '') ? '' : entry.feedback;
}

function pumpCatalogAllowed(recipe, preferences, profile, date) {
  if (!pumpFoodAllowed(recipe, preferences)) return false;
  if (preferences.dislikes.some((tag) => pumpHasTag(recipe, tag))) return false;
  return pumpCatalogSelectionFeedback(profile, recipe.id, date) !== 'not_for_me';
}

function pumpCatalogScore(recipe, preferences, profile, date) {
  let score = pumpFoodScore(recipe, preferences);
  for (const tag of preferences.favorites) if (pumpHasTag(recipe, tag)) score += 6;
  const feedback = pumpCatalogSelectionFeedback(profile, recipe.id, date);
  if (feedback === 'liked') score += 18;
  if (feedback === 'too_expensive') score += preferences.budget === 'budget' ? -8 : -3;
  if (feedback === 'too_slow') score += preferences.prep === 'quick' ? -8 : -3;
  if (feedback === 'still_hungry') score += 1;
  return score;
}

function pumpCatalogHash(value) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function pumpCatalogDayNumber(date) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(date || ''));
  if (match) return Math.floor(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])) / 86400000);
  return Math.floor(Date.now() / 86400000);
}

function pumpCatalogSource(recipe) {
  for (const tag of ['chicken', 'beef', 'tuna', 'salmon', 'fish', 'eggs', 'tofu', 'legumes', 'dairy', 'plant', 'nuts']) {
    if (pumpHasTag(recipe, tag)) return tag;
  }
  return recipe.family;
}

function pumpCatalogFallback(slot) {
  const title = slot === 'snack' ? 'פריכיות אורז, חומוס וירקות' : 'אורז, עדשים וירקות';
  const calories = slot === 'snack' ? 210 : 520;
  const protein = slot === 'snack' ? 10 : 24;
  return pumpCatalogEntry(`fallback-${slot}`, [slot], title, ['vegan', 'plant', 'legumes', 'rice', 'quick', 'budget'], 'legumes', calories, protein, slot === 'snack' ? 34 : 78, slot === 'snack' ? 6 : 10, slot === 'snack'
    ? [pumpIngredient('פריכיות אורז', 5, 'יח׳'), pumpIngredient('חומוס', 90), pumpIngredient('ירקות', 1, 'קערה', false)]
    : [pumpIngredient('אורז מבושל', 190), pumpIngredient('עדשים מבושלות', 190), pumpIngredient('ירקות', 280), pumpIngredient('טחינה', 12)]);
}

function pumpCatalogOrder(recipes, profile, slot, date) {
  const preferences = pumpCatalogPreferences(profile);
  const sorted = [...recipes].sort((left, right) => {
    const byScore = pumpCatalogScore(right, preferences, profile, date) - pumpCatalogScore(left, preferences, profile, date);
    return byScore || left.id.localeCompare(right.id, 'he');
  });
  if (!sorted.length) return sorted;
  const identity = profile?.id || profile?.name || 'pump';
  const offset = (pumpCatalogHash(`${identity}|${slot}`) + pumpCatalogDayNumber(date)) % sorted.length;
  return [...sorted.slice(offset), ...sorted.slice(0, offset)];
}

function pumpCatalogAmount(ingredient, scale) {
  let amount = ingredient.scalable === false ? ingredient.amount : ingredient.amount * scale;
  if (ingredient.unit === 'יח׳' || ingredient.unit === 'פרוסות' || ingredient.unit === 'כף') amount = Math.max(1, Math.round(amount * 2) / 2);
  else if (ingredient.unit === 'גרם') amount = Math.max(5, Math.round(amount / (amount >= 100 ? 10 : 5)) * (amount >= 100 ? 10 : 5));
  else amount = Math.max(1, Math.round(amount));
  return `${amount} ${ingredient.unit} ${ingredient.name}`;
}

function pumpCatalogScale(recipe, targetCalories, profile) {
  const requested = Number(targetCalories) || recipe.calories;
  const scale = Math.max(0.72, Math.min(1.45, requested / recipe.calories));
  const calories = Math.round(recipe.calories * scale / 10) * 10;
  const proteinGrams = Math.max(1, Math.round(recipe.protein * scale));
  const feedback = pumpCatalogFeedback(profile, recipe.id);
  return {
    ...recipe,
    calories,
    proteinGrams,
    protein: `כ־${proteinGrams} גרם חלבון`,
    detail: `כמות מוצעת: ${recipe.ingredients.map((ingredient) => pumpCatalogAmount(ingredient, scale)).join(' · ')}`,
    feedback,
  };
}

function pumpCatalogOptions(slot, profile, targetCalories, date, usedSources, rotationKey = slot) {
  const preferences = pumpCatalogPreferences(profile);
  const permitted = pumpMealCatalog.filter((recipe) => recipe.slots.includes(slot) && pumpCatalogAllowed(recipe, preferences, profile, date));
  const favorites = permitted.filter((recipe) => preferences.favorites.some((tag) => pumpHasTag(recipe, tag)));
  const pool = favorites.length >= 3 ? favorites : permitted;
  const ordered = pumpCatalogOrder(pool.length ? pool : [pumpCatalogFallback(slot)], profile, rotationKey, date);
  const first = ordered.find((recipe) => !usedSources?.has(pumpCatalogSource(recipe))) || ordered[0];
  if (usedSources && first) usedSources.add(pumpCatalogSource(first));
  const selected = [first, ...ordered.filter((recipe) => recipe.id !== first?.id)].slice(0, 3);
  return selected.map((recipe) => pumpCatalogScale(recipe, targetCalories, profile));
}

function pumpCatalogPersonalizedMenu(profile, targets, date) {
  const preferences = pumpCatalogPreferences(profile);
  const isGain = profile.goal === 'gain' || profile.goal === 'event' && profile.targetWeight > profile.startWeight;
  const mealCount = profile.mealPattern === 'two' ? 2 : 3;
  const totalCalories = Number(targets?.calories) || 1500;
  const slots = mealCount === 2
    ? [
      { slot: 'breakfast', timing: 'בוקר', share: 0.44, label: isGain ? 'פתיחה שמקדמת את יעד האנרגיה' : 'פתיחה משביעה ליום יציב' },
      { slot: 'lunch', timing: 'ארוחה עיקרית', share: 0.56, label: 'ארוחה עיקרית שנבנתה לפי ההעדפות שלך' },
    ]
    : [
      { slot: 'breakfast', timing: 'בוקר', share: 0.27, label: isGain ? 'פתיחה שמקדמת את יעד האנרגיה' : 'פתיחה משביעה ליום יציב' },
      { slot: 'lunch', timing: 'צהריים', share: 0.40, label: 'הארוחה העיקרית לפי ההעדפות שלך' },
      { slot: 'dinner', timing: 'ערב', share: 0.33, label: 'סוגרים את היום בלי להסתבך' },
    ];
  const usedSources = new Set();
  const meals = slots.map((slot, index) => {
    const remainingShares = slots.slice(index).reduce((sum, item) => sum + item.share, 0);
    const previousCalories = slots.slice(0, index).reduce((sum, item) => sum + Math.round(totalCalories * item.share / 10) * 10, 0);
    const calories = index === slots.length - 1 ? Math.max(100, totalCalories - previousCalories) : Math.round(totalCalories * slot.share / 10) * 10;
    return { ...slot, options: pumpCatalogOptions(slot.slot, profile, calories, date, usedSources), remainingShares };
  });
  const choices = [];
  if (preferences.foodStyle === 'vegan') choices.push('טבעוני');
  else if (preferences.foodStyle === 'vegetarian') choices.push('צמחוני');
  if (preferences.avoid.length) choices.push('ללא רכיבים שסימנת');
  if (preferences.favorites.length) choices.push('מבוסס על דברים שאהבת');
  if (preferences.prep === 'quick') choices.push('מהיר להכנה');
  if (preferences.budget === 'budget') choices.push('חסכוני');
  const limited = meals.some((meal) => meal.options.length < 3);
  return {
    ...Ma(profile, targets),
    meals,
    note: `PUMP 2.1: הכמויות הן נקודת פתיחה לפי היעד שלך, והאפשרויות מתחלפות מיום ליום${choices.length ? ` · ${choices.join(' · ')}` : ''}. ${limited ? 'נשארו מעט חלופות בגלל ההגבלות שסימנת — חשוב לבדוק רכיבים בפועל.' : 'אפשר להחליף בין חלופות עם ערכים דומים.'}`,
  };
}

function pumpCatalogPersonalizedSnacks(profile, snackCalories, date) {
  const calories = Array.isArray(snackCalories) ? snackCalories : [180, 220];
  const usedSources = new Set();
  return [
    { timing: 'ארוחת ביניים 1', label: 'שומרים על שובע בין הארוחות', options: pumpCatalogOptions('snack', profile, calories[0], date, usedSources, 'snack-1') },
    { timing: 'ארוחת ביניים 2', label: 'סוגרים את הפער עד לארוחה הבאה', options: pumpCatalogOptions('snack', profile, calories[1], date, usedSources, 'snack-2') },
  ];
}
