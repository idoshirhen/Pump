import { readFile, writeFile } from 'node:fs/promises';

const sourcePath = new URL('../assets/index-native-preview.js', import.meta.url);
const outputPath = new URL('../assets/index-personalized-v2.js', import.meta.url);
const onboardingHelpersPath = new URL('./onboarding-personalization-helpers.js', import.meta.url);
const catalogHelpersPath = new URL('./pump-catalog-helpers.js', import.meta.url);
let bundle = await readFile(sourcePath, 'utf8');
const onboardingHelpers = await readFile(onboardingHelpersPath, 'utf8');
const catalogHelpers = await readFile(catalogHelpersPath, 'utf8');

const helpers = String.raw`
function pumpPreferenceList(e){return Array.isArray(e)?e:[]}function pumpPersonalization(e){let t=e&&e.personalization&&typeof e.personalization===\`object\`&&!Array.isArray(e.personalization)?{...e.personalization}:{};if(!t.foodStyle){let e=String(e?.diet||\`\`);/טבעונ/i.test(e)?t.foodStyle=\`vegan\`:/צמחונ/i.test(e)&&(t.foodStyle=\`vegetarian\`)}return t}function pumpHasTag(e,t){return pumpPreferenceList(e.tags).includes(t)}function pumpFoodAllowed(e,t){let n=pumpPreferenceList(t.avoid);return!(t.foodStyle===\`vegan\`&&!pumpHasTag(e,\`vegan\`))&&!(t.foodStyle===\`vegetarian\`&&(pumpHasTag(e,\`meat\`)||pumpHasTag(e,\`fish\`)))&&!n.some(t=>pumpHasTag(e,t))}function pumpFoodScore(e,t){let n=0,r=pumpPreferenceList(t.proteins);return r.some(t=>pumpHasTag(e,t))&&(n+=6),t.prep===\`quick\`&&(pumpHasTag(e,\`quick\`)?n+=3:n-=2),t.budget===\`budget\`&&(pumpHasTag(e,\`budget\`)?n+=3:n-=2),n}function pumpRecipe(e,t,n,r){return{title:e,detail:t,protein:\`כ־\${n} גרם חלבון\`,proteinGrams:n,tags:r}}function pumpPickFood(e,t,n){let r=e.filter(e=>pumpFoodAllowed(e,t)).sort((e,n)=>pumpFoodScore(n,t)-pumpFoodScore(e,t)),i=[],a=new Set;for(let e of r)if(!a.has(e.title)&&(a.add(e.title),i.push(e)),i.length===n)break;return i}function pumpFoodFallback(t,n){let r=[pumpRecipe(\`קערת אורז, עדשים וירקות\`,\`אורז, עדשים מתובלות, ירקות וטחינה. בדקו את רכיבי המוצר בפועל.\`,24,[\`vegan\`,\`plant\`,\`quick\`,\`budget\`]),pumpRecipe(\`תפוח אדמה אפוי, שעועית וסלט\`,\`תפוח אדמה, שעועית, סלט גדול וטחינה.\`,22,[\`vegan\`,\`plant\`,\`quick\`,\`budget\`]),pumpRecipe(\`אורז, חומוס וירקות\`,\`אורז, חומוס, ירקות חתוכים וטחינה.\`,20,[\`vegan\`,\`plant\`,\`quick\`,\`budget\`]),pumpRecipe(\`שייק חלבון צמחי ופרי\`,\`אבקת חלבון צמחית, פרי ומשקה צמחי שמתאים לך.\`,25,[\`vegan\`,\`plant\`,\`soy\`,\`quick\`])];return pumpPickFood(r,t,n)}function pumpMealRecipes(e){return e===\`breakfast\`?[pumpRecipe(\`חביתה, קוטג׳ וסלט\`,\`2 ביצים, קוטג׳, סלט ו־2 פרוסות לחם מלא.\`,32,[\`vegetarian\`,\`eggs\`,\`dairy\`,\`gluten\`,\`quick\`,\`budget\`]),pumpRecipe(\`כריך טונה ישראלי\`,\`לחמנייה מלאה, טונה במים, ירקות ומעט טחינה.\`,31,[\`fish\`,\`gluten\`,\`quick\`,\`budget\`]),pumpRecipe(\`סקיר עם שיבולת שועל ופרי\`,\`סקיר או יוגורט PRO, שיבולת שועל, פרי וקינמון.\`,28,[\`dairy\`,\`gluten\`,\`quick\`]),pumpRecipe(\`כריך טופו וטחינה\`,\`לחם מלא, טופו צרוב, טחינה וירקות.\`,27,[\`vegan\`,\`plant\`,\`soy\`,\`gluten\`,\`quick\`,\`budget\`]),pumpRecipe(\`דייסת שיבולת שועל עם משקה סויה\`,\`שיבולת שועל, משקה סויה, בננה ואבקת חלבון צמחית.\`,25,[\`vegan\`,\`plant\`,\`soy\`,\`gluten\`,\`quick\`,\`budget\`])]:e===\`lunch\`?[pumpRecipe(\`עוף, אורז וסלט\`,\`חזה עוף, אורז מבושל, סלט וכף טחינה.\`,42,[\`meat\`,\`chicken\`,\`quick\`,\`budget\`]),pumpRecipe(\`קציצות בקר ותפוחי אדמה\`,\`קציצות בקר רזות, תפוח אדמה אפוי וסלט.\`,37,[\`meat\`,\`beef\`,\`budget\`]),pumpRecipe(\`פסטה עם טונה ורוטב עגבניות\`,\`פסטה, טונה במים, רוטב עגבניות וירקות.\`,34,[\`fish\`,\`gluten\`,\`quick\`,\`budget\`]),pumpRecipe(\`קערת אורז, טופו וטחינה\`,\`אורז, טופו, סלט גדול וטחינה.\`,32,[\`vegan\`,\`plant\`,\`soy\`,\`quick\`,\`budget\`]),pumpRecipe(\`מג׳דרה, סלט וטחינה\`,\`אורז ועדשים, סלט קצוץ וטחינה.\`,25,[\`vegan\`,\`plant\`,\`quick\`,\`budget\`]),pumpRecipe(\`פסטת עדשים ובולגרית\`,\`פסטת עדשים, רוטב עגבניות, בולגרית וסלט.\`,31,[\`vegetarian\`,\`dairy\`,\`gluten\`])]:[pumpRecipe(\`פיתה עם עוף, סלט וטחינה\`,\`פיתה מלאה, עוף מתובל, ירקות וטחינה.\`,38,[\`meat\`,\`chicken\`,\`gluten\`,\`quick\`]),pumpRecipe(\`סלמון, תפוח אדמה וירקות\`,\`סלמון, תפוח אדמה אפוי וירקות.\`,35,[\`fish\`]),pumpRecipe(\`טוסט קוטג׳, ביצה וסלט\`,\`לחם מלא, קוטג׳, ביצה וסלט גדול.\`,30,[\`vegetarian\`,\`dairy\`,\`eggs\`,\`gluten\`,\`quick\`,\`budget\`]),pumpRecipe(\`טופו מוקפץ עם אורז וירקות\`,\`טופו, אורז וירקות מוקפצים.\`,30,[\`vegan\`,\`plant\`,\`soy\`,\`quick\`]),pumpRecipe(\`סלט עדשים, אורז וטחינה\`,\`עדשים, אורז, ירקות וטחינה.\`,24,[\`vegan\`,\`plant\`,\`quick\`,\`budget\`]),pumpRecipe(\`שקשוקה, סלט ולחם\`,\`ביצים ברוטב עגבניות, סלט ופרוסות לחם מלא.\`,28,[\`vegetarian\`,\`eggs\`,\`gluten\`,\`quick\`,\`budget\`])]}function pumpMealOptions(e,t,n){let r=pumpPickFood(pumpMealRecipes(e),t,3),i=pumpFoodFallback(t,3);for(let e of i)r.length<3&&!r.some(t=>t.title===e.title)&&r.push(e);return r.slice(0,3).map(e=>({...e,calories:n}))}function pumpPersonalizedMenu(e,t){let n=pumpPersonalization(e),r=Object.keys(n).length;if(!r)return Ma(e,t);let i=e.goal===\`gain\`||e.goal===\`event\`&&e.targetWeight>e.startWeight,a=e.mealPattern===\`two\`?2:3,o=Math.round(t.calories/a/50)*50,s=[{timing:\`בוקר\`,label:i?\`פתיחה שעוזרת להגיע ליעד האנרגיה\`:\`פתיחה משביעה ליום יציב\`,options:pumpMealOptions(\`breakfast\`,n,o)},{timing:\`צהריים\`,label:\`ארוחה עיקרית לפי ההעדפות שלך\`,options:pumpMealOptions(\`lunch\`,n,o)},{timing:\`ערב\`,label:\`סוגרים את היום בלי להסתבך\`,options:pumpMealOptions(\`dinner\`,n,o)}],c=[];n.foodStyle===\`vegan\`?c.push(\`טבעוני\`):n.foodStyle===\`vegetarian\`&&c.push(\`צמחוני\`),pumpPreferenceList(n.avoid).length&&c.push(\`ללא מרכיבים שסימנת\`),n.prep===\`quick\`&&c.push(\`מהיר להכנה\`),n.budget===\`budget\`&&c.push(\`חסכוני\`);let l={...Ma(e,t),meals:a===2?[s[0],{...s[1],timing:\`ארוחה עיקרית\`,label:\`ארוחה עיקרית שמותאמת לשגרה שלך\`}]:s,note:c.length?\`האפשרויות נבחרו לפי: \${c.join(\` · \`)}. ברגישות או אלרגיה חשוב תמיד לבדוק רכיבים בפועל.\`:\`התפריט נבנה לפי ההעדפות שסימנת.\`};return l}function pumpSnackRecipes(e){return e===0?[pumpRecipe(\`פרי וסקיר / יוגורט PRO\`,\`פרי אחד עם סקיר או יוגורט חלבון.\`,18,[\`dairy\`,\`quick\`]),pumpRecipe(\`מעדן חלבון ופרי\`,\`מעדן חלבון עם פרי טרי.\`,20,[\`dairy\`,\`quick\`]),pumpRecipe(\`יוגורט סויה, פרי ושיבולת שועל\`,\`יוגורט סויה, פרי ושיבולת שועל שמתאימה לך.\`,18,[\`vegan\`,\`plant\`,\`soy\`,\`gluten\`,\`quick\`,\`budget\`]),pumpRecipe(\`קרקרים, חומוס וירקות\`,\`קרקרים שמתאימים לך, חומוס וירקות חתוכים.\`,14,[\`vegan\`,\`plant\`,\`gluten\`,\`quick\`,\`budget\`]),pumpRecipe(\`ביצה קשה, פרי וירקות\`,\`ביצה קשה, פרי וירקות חתוכים.\`,14,[\`vegetarian\`,\`eggs\`,\`quick\`,\`budget\`])]:[pumpRecipe(\`כריך קטן עם חלבון\`,\`2 פרוסות לחם מלא עם קוטג׳, טונה או ביצה וירקות.\`,20,[\`dairy\`,\`eggs\`,\`fish\`,\`gluten\`,\`quick\`]),pumpRecipe(\`שייק חלבון ובננה\`,\`שייק חלבון עם בננה — נוח ליום עמוס או אחרי אימון.\`,25,[\`dairy\`,\`quick\`]),pumpRecipe(\`שייק חלבון צמחי ובננה\`,\`אבקת חלבון צמחית, בננה ומשקה צמחי שמתאים לך.\`,25,[\`vegan\`,\`plant\`,\`soy\`,\`quick\`]),pumpRecipe(\`אורז, חומוס וטחינה\`,\`אורז מוכן, חומוס וטחינה.\`,16,[\`vegan\`,\`plant\`,\`quick\`,\`budget\`]),pumpRecipe(\`קוטג׳, קרקרים וירקות\`,\`קוטג׳, קרקרים מלאים וירקות.\`,22,[\`dairy\`,\`gluten\`,\`quick\`,\`budget\`])]}function pumpPersonalizedSnacks(e,t){let n=pumpPersonalization(e),r=e=>pumpPickFood(pumpSnackRecipes(e),n,3).concat(pumpFoodFallback(n,3)).filter((e,t,n)=>n.findIndex(t=>t.title===e.title)===t).slice(0,3).map(e=>({...e,calories:t[e===void 0?0:0]}));let i=(e,n)=>{let r=pumpPickFood(pumpSnackRecipes(e),n,3),i=pumpFoodFallback(n,3);for(let e of i)r.length<3&&!r.some(t=>t.title===e.title)&&r.push(e);return r.slice(0,3)};return[{timing:\`ארוחת ביניים 1\`,label:\`שומרים על שובע בין הארוחות\`,options:i(0,n).map(e=>({...e,calories:t[0]}))},{timing:\`ארוחת ביניים 2\`,label:\`סוגרים את הפער עד לארוחה הבאה\`,options:i(1,n).map(e=>({...e,calories:t[1]}))}]}function pumpPersonalizedTargets(e){let t=ja(e),n=e.goal===\`gain\`||e.goal===\`event\`&&e.targetWeight>e.startWeight,r=n?e.trainingLevel===\`experienced\`?1.8:1.7:1.8;(e.activity===\`medium\`||Number(e.trainingDays)>=4)&&(r=Math.min(2,r+.1));return{...t,protein:Math.round(e.startWeight*r)}}function pumpWorkoutSets(e,t){if(t.sessionMinutes===\`20\`)return\`2 סטים של 8–12\`;if(t.sessionMinutes===\`45\`)return e.trainingLevel===\`beginner\`?\`3 סטים של 8–10\`:\`3–4 סטים של 8–12\`;return e.trainingLevel===\`beginner\`?\`2 סטים של 8–10\`:e.trainingLevel===\`returning\`?\`3 סטים של 8–12\`:\`3–4 סטים של 6–12\`}function pumpEquipment(e,t){let n=pumpPreferenceList(t.equipment);return{gym:n.includes(\`gym\`)||e.trainingPlace===\`gym\`,dumbbells:n.includes(\`dumbbells\`),bands:n.includes(\`bands\`),bodyweight:n.includes(\`bodyweight\`)||!n.length}}function pumpTrainingItem(e,t,n,r){return{name:e,detail:t,why:n,alternative:r}}function pumpTrainingExercise(e,t,n){let r=pumpEquipment(e,t),i=t.limitation||\`none\`,a=pumpWorkoutSets(e,t)+\` · מנוחה 60–90 שנ׳\`,o=i===\`none\`?\`\`:\` רק בטווח שלא מעורר כאב.\`;if(n===\`lower\`){if(i===\`knee\`)return pumpTrainingItem(r.gym?\`ישבן · היפ תראסט במכונה\`:r.dumbbells?\`ישבן · הרמת אגן עם משקולת\`:\`ישבן · הרמת אגן בשכיבה\`,a,\`דגש על ישבן בלי לכפות כיפוף עמוק בברך.\`+o,\`חלופה: כיווץ ישבן בעמידה או מנוחה אם יש כאב\`);if(i===\`back\`)return pumpTrainingItem(r.gym?\`רגליים · לחיצת רגליים בטווח נוח\`:r.dumbbells?\`רגליים · ישיבה וקימה מכיסא עם משקולת קלה\`:\`רגליים · ישיבה וקימה מכיסא\`,a,\`תנועה נשלטת לרגליים עם גב ניטרלי.\`+o,\`חלופה: הרמת אגן בשכיבה\`);return pumpTrainingItem(r.gym?\`רגליים · לחיצת רגליים במכונה\`:r.dumbbells?\`רגליים · סקוואט גביע\`:r.bands?\`רגליים · סקוואט עם גומייה\`:\`רגליים · ישיבה וקימה מכיסא\`,a,\`מחזק את הרגליים והישבן בתנועה יציבה.\`,r.gym?\`חלופה: מכונת פשיטת ברך קלה\`:\`חלופה: לאנג׳ לאחור בטווח נוח\`)}if(n===\`glutes\`)return pumpTrainingItem(r.gym?\`ישבן · היפ תראסט במכונה\`:r.dumbbells?\`ישבן · הרמת אגן עם משקולת\`:r.bands?\`ישבן · הליכת צד עם גומייה\`:\`ישבן · הרמת אגן בשכיבה\`,a,\`מחזק את הישבן והחלק האחורי של הרגליים.\`+o,\`חלופה: גשר ישבן עם עצירה למעלה\`);if(n===\`push\`){if(i===\`shoulder\`)return pumpTrainingItem(\`חזה · לחיצה מול קיר בטווח נוח\`,a,\`עבודה עדינה ללא הרמה מעל הראש.\`+o,\`חלופה: הפסקה ופנייה לבדיקה אם יש כאב\`);return pumpTrainingItem(r.gym?\`חזה · לחיצת חזה במכונה\`:r.dumbbells?\`חזה · לחיצת חזה עם משקולות\`:r.bands?\`חזה · לחיצה עם גומייה\`:\`חזה · שכיבות סמיכה בשיפוע\`,a,\`מחזק את החזה והיד האחורית.\`,r.gym?\`חלופה: לחיצת חזה בכבלים\`:\`חלופה: שכיבות סמיכה עם הידיים על שולחן\`)}if(n===\`pull\`){if(i===\`shoulder\`)return pumpTrainingItem(r.bands?\`גב · משיכת גומייה קלה לגוף\`:\`גב · כיווץ שכמות בישיבה\`,a,\`דגש על יציבה ושכמות בלי למשוך לטווח כואב.\`+o,\`חלופה: הפסקה ופנייה לבדיקה אם יש כאב\`);return pumpTrainingItem(r.gym?\`גב · פולי עליון או חתירה במכונה\`:r.dumbbells?\`גב · חתירה ביד אחת עם משקולת\`:r.bands?\`גב · חתירה עם גומייה\`:\`גב · Y-T-W בשכיבה\`,a,\`מחזק את הגב העליון ומשפר יציבה.\`,r.gym?\`חלופה: חתירה בכבל\`:\`חלופה: משיכת גומייה בישיבה\`)}if(n===\`shoulder\`){if(i===\`shoulder\`)return pumpTrainingItem(\`יציבה · קירוב שכמות עדין\`,\`2 סטים של 10–12 · מנוחה 60 שנ׳\`,\`שומרים על כתף רגועה ולא מתאמנים דרך כאב.\`,\`חלופה: מנוחה ופנייה לפיזיותרפיסט/ית אם הכאב נמשך\`);return pumpTrainingItem(r.gym?\`כתפיים · הרחקות לצדדים בכבל\`:r.dumbbells?\`כתפיים · הרחקות לצדדים עם משקולות\`:r.bands?\`כתפיים · הרחקות לצדדים עם גומייה\`:\`כתפיים · הרחקות ידיים ללא משקל\`,a,\`מחזק את הכתפיים בשליטה.\`,\`חלופה: לחיצת כתפיים קלה\`)}if(n===\`arms\`)return pumpTrainingItem(r.gym?\`ידיים · כפיפת מרפקים בכבל\`:r.dumbbells?\`ידיים · כפיפת מרפקים עם משקולות\`:r.bands?\`ידיים · כפיפת מרפקים עם גומייה\`:\`ידיים · כפיפת מרפקים עם בקבוקי מים\`,a,\`דגש על הידיים בלי להאריך את האימון.\`,\`חלופה: פשיטת מרפקים עם גומייה\`);return pumpTrainingItem(\`ליבה · דד־באג\`,t.sessionMinutes===\`20\`?\`2 סטים של 6–8 לכל צד\`:\`2–3 סטים של 8–10 לכל צד\`,\`מחזק את הליבה בלי להעמיס על הגב התחתון.\`,\`חלופה: פלאנק על ברכיים\`)}function pumpTrainingRoles(e){return e===\`upper\`?[[\`push\`,\`pull\`,\`shoulder\`,\`core\`],[\`pull\`,\`push\`,\`arms\`,\`lower\`]]:e===\`lower\`?[[\`lower\`,\`glutes\`,\`core\`,\`pull\`],[\`lower\`,\`glutes\`,\`lower\`,\`core\`]]:e===\`glutes\`?[[\`glutes\`,\`lower\`,\`pull\`,\`core\`],[\`glutes\`,\`lower\`,\`push\`,\`core\`]]:e===\`core\`?[[\`lower\`,\`push\`,\`core\`,\`core\`],[\`glutes\`,\`pull\`,\`core\`,\`core\`]]:[[\`lower\`,\`push\`,\`pull\`,\`core\`],[\`glutes\`,\`pull\`,\`shoulder\`,\`core\`]]}function pumpFocusTitle(e){return e===\`upper\`?\`פלג גוף עליון עם בסיס מאוזן\`:e===\`lower\`?\`רגליים וישבן עם בסיס עליון\`:e===\`glutes\`?\`ישבן ורגליים עם איזון מלא\`:e===\`core\`?\`ליבה חזקה עם אימון גוף מלא\`:\`גוף מלא: רגליים, חזה וגב\`}function pumpWeeklyPlan(e){let t=Number(e.trainingDays)||0;if(!t)return[\`השבוע: 3 הליכות של 10–20 דקות\`,\`מטרת פתיחה: לבחור שעה קבועה אחת לתנועה\`,\`אין צורך להיכנס לאימון מלא עדיין\`];let n=[];for(let e=0;e<t;e++)n.push(\`יום \${e+1}: אימון \${e%2?\`B\`:\`A\`}\`);return n}function pumpPersonalizedTraining(e){let t=pumpPersonalization(e);if(!Object.keys(t).length)return Na(e);let n=t.trainingFocus||\`balanced\`,r=pumpTrainingRoles(n),i=t.limitation&&t.limitation!==\`none\`?\` בהתאמה למגבלה שסימנת — לא ממשיכים דרך כאב.\`:\`\`,a=pumpFocusTitle(n),o=e.goal===\`gain\`?\`מעלים משקל או חזרות רק כשהטכניקה נשארת נקייה.\`:e.goal===\`lose\`?\`המטרה היא כוח ועקביות, לא אימוני ענישה.\`:\`מתקדמים בהדרגה ובקצב שאפשר לשמור.\`;return{a:{label:\`אימון A\`,title:a,focus:\`אימון שנבנה לפי הדגש והציוד שלך\`,description:o+i,exercises:r[0].map(n=>pumpTrainingExercise(e,t,n))},b:{label:\`אימון B\`,title:a,focus:\`משלימים את קבוצות השריר החשובות\`,description:o+i,exercises:r[1].map(n=>pumpTrainingExercise(e,t,n))},location:pumpEquipment(e,t).gym&&e.trainingPlace!==\`home\`?\`חדר כושר או ציוד ביתי שסימנת\`:e.trainingPlace===\`gym\`?\`חדר כושר\`:\`בית\`,weekly:pumpWeeklyPlan(e)}}
`.replaceAll(String.fromCharCode(92, 96), String.fromCharCode(96));

const safeHelpers = helpers
  .replace(
    'if(!t.foodStyle){let e=String(e?.diet||``);/טבעונ/i.test(e)?t.foodStyle=`vegan`:/צמחונ/i.test(e)&&(t.foodStyle=`vegetarian`)}',
    'if(!t.foodStyle){let n=String(e?.diet||``);/טבעונ/i.test(n)?t.foodStyle=`vegan`:/צמחונ/i.test(n)&&(t.foodStyle=`vegetarian`)}',
  )
  .replace(
    /note:c\.length\?[\s\S]*?:`התפריט נבנה לפי ההעדפות שסימנת\.`}/,
    'note:c.length?"האפשרויות נבחרו לפי: "+c.join(" · ")+". ברגישות או אלרגיה חשוב תמיד לבדוק רכיבים בפועל.":"התפריט נבנה לפי ההעדפות שסימנת."}',
  )
  .replace('protein:`כ־\\${n} גרם חלבון`', 'protein:"כ־"+n+" גרם חלבון"')
  .replace('n.push(`יום \\${e+1}: אימון \\${e%2?`B`:`A`}`)', 'n.push("יום "+(e+1)+": אימון "+(e%2?"B":"A"))')
  .replace(
    'location:pumpEquipment(e,t).gym&&e.trainingPlace!==`home`?`חדר כושר או ציוד ביתי שסימנת`:e.trainingPlace===`gym`?`חדר כושר`:`בית`,weekly:pumpWeeklyPlan(e)}}',
    'location:pumpEquipment(e,t).gym?`חדר כושר או ציוד ביתי שסימנת`:`בית`,weekly:pumpWeeklyPlan(e),progression:e.goal===`gain`?`מעלים עומס רק אחרי שהטכניקה נשארת יציבה.`:e.goal===`lose`?`שומרים על כוח ועקביות לאורך השבוע.`:`מתקדמים בהדרגה ובקצב שנוח לך.`}}',
  );

function replaceOnce(needle, replacement, label) {
  const occurrences = bundle.split(needle).length - 1;
  if (occurrences !== 1) throw new Error(`${label}: expected one anchor, found ${occurrences}.`);
  bundle = bundle.replace(needle, replacement);
}

replaceOnce(
  'ka={name:``,sex:`female`,age:27,height:165,startWeight:70,targetWeight:62,activity:`light`,diet:``,goal:`lose`,pace:`steady`,trainingLevel:`beginner`,trainingPlace:`home`,trainingDays:3,mealPattern:`three`,sleep:`sixToSeven`,mainChallenge:`consistency`,weekendEating:!1,needsMedicalClearance:!1};',
  'ka={name:``,sex:`female`,age:27,height:165,startWeight:70,targetWeight:62,activity:`light`,diet:``,goal:`lose`,pace:`steady`,trainingLevel:`beginner`,trainingPlace:`home`,trainingDays:3,mealPattern:`three`,sleep:`sixToSeven`,mainChallenge:`consistency`,weekendEating:!1,needsMedicalClearance:!1,personalization:{foodStyle:`regular`,avoid:[],proteins:[],favorites:[],dislikes:[],prep:`quick`,budget:`regular`,equipment:[`bodyweight`],trainingFocus:`balanced`,limitation:`none`,sessionMinutes:`30`}};',
  'onboarding preference defaults',
);

const nativeMealsStart = 'function pumpNativeMeals(e,t){';
const nativeMealsEnd = '}function Na(e)';
const nativeMealsStartIndex = bundle.indexOf(nativeMealsStart);
const nativeMealsEndIndex = bundle.indexOf(nativeMealsEnd, nativeMealsStartIndex);
if (nativeMealsStartIndex < 0 || nativeMealsEndIndex < 0) throw new Error('Could not find the native meal builder.');
const nativeMeals = `function pumpNativeMeals(e,t,n){let r=null;try{let i=JSON.parse(localStorage.getItem(\`pump-meal-structure-v1\`)||\`{}\`).plan?.snacks,a=Number(i);Number.isFinite(a)&&a>0&&(r=Math.floor(a))}catch{}return pumpCatalogDailyMenu(e,t,n,r)}`;
bundle = `${bundle.slice(0, nativeMealsStartIndex)}${safeHelpers}${catalogHelpers}${onboardingHelpers}${nativeMeals}function Na(e)${bundle.slice(nativeMealsEndIndex + nativeMealsEnd.length)}`;

replaceOnce(
  'if(!u?.onboardingDone){let e=[`מטרה`,`נתונים`,`קצב`,`אימונים`,`שגרה`,`מסלול`]',
  'if(!u?.onboardingDone){let e=[`מטרה`,`נתונים`,`קצב`,`אימונים`,`שגרה`,`תזונה`,`דיוק`,`מסלול`]',
  'onboarding step labels',
);
replaceOnce(
  'children:[`שלב `,oe+1,` מתוך 6`]',
  'children:[`שלב `,oe+1,` מתוך 8`]',
  'onboarding step count',
);
replaceOnce(
  ']}),oe===5&&(0,V.jsxs)(V.Fragment,{children:[(0,V.jsx)(`p`,{className:`kicker`,children:`זו התוכנית שלך`})',
  ']}),oe===5&&pumpOnboardingFoodStep(w,T),oe===6&&pumpOnboardingTrainingStep(w,T),oe===7&&(0,V.jsxs)(V.Fragment,{children:[(0,V.jsx)(`p`,{className:`kicker`,children:`זו התוכנית שלך`})',
  'onboarding personalized steps',
);
replaceOnce(
  'let{error:t}=await e.from(`profiles`).upsert({',
  'let{error:n}=await e.from(`user_personalization`).upsert({user_id:s.id,preferences:pumpOnboardingPreferences(w)},{onConflict:`user_id`});if(n)throw n;let{error:t}=await e.from(`profiles`).upsert({',
  'onboarding preference persistence',
);
replaceOnce(
  'onClick:()=>{if(oe===5){Ke();return}Ge()&&se(oe+1)},children:[oe===5?ie?`בונים את המסלול…`:`אישור המסלול`:`המשך`,',
  'onClick:()=>{if(oe===7){Ke();return}Ge()&&se(oe+1)},children:[oe===7?ie?`בונים את המסלול…`:`אישור המסלול`:`המשך`,',
  'onboarding completion step',
);

replaceOnce(
  'let[i,a,o,s,l]=await Promise.all([',
  'let[i,a,o,s,l,personalRow,feedbackRows]=await Promise.all([',
  'preferences query variables',
);
replaceOnce(
  'e.from(`checkins`).select(`date, mood`).eq(`user_id`,r.id).order(`date`,{ascending:!1}).limit(1).maybeSingle()]);if(i.error||a.error||o.error||s.error||l.error)',
  'e.from(`checkins`).select(`date, mood`).eq(`user_id`,r.id).order(`date`,{ascending:!1}).limit(1).maybeSingle(),e.from(`user_personalization`).select(`preferences`).eq(`user_id`,r.id).maybeSingle(),e.from(`user_meal_feedback`).select(`recipe_id, feedback, updated_at`).eq(`user_id`,r.id)]);if(i.error||a.error||o.error||s.error||l.error||personalRow.error||feedbackRows.error)',
  'preferences query',
);
replaceOnce(
  'throw i.error??a.error??o.error??s.error??l.error;let u=i.data,f=u?{name:',
  'throw i.error??a.error??o.error??s.error??l.error??personalRow.error??feedbackRows.error;let u=i.data,f=u?{id:r.id,name:',
  'preferences query error',
);
replaceOnce(
  'needsMedicalClearance:!!u.needs_medical_clearance,onboardingDone:u.onboarding_done}:null;',
  'needsMedicalClearance:!!u.needs_medical_clearance,onboardingDone:u.onboarding_done,personalization:personalRow.data?.preferences??{},mealFeedback:(feedbackRows.data??[]).map(e=>({recipeId:e.recipe_id,feedback:e.feedback,updatedAt:e.updated_at}))}:null;',
  'preferences profile mapping',
);
replaceOnce(
  '},[e,M]);(0,l.useEffect)(()=>{let e=window.setTimeout(()=>{Ne().catch(()=>j(`לא הצלחנו לטעון את החשבון. נסו לרענן.`)).finally(()=>i(!1))},0);',
  '},[e,M]);(0,l.useEffect)(()=>{let e=()=>{Ne().catch(()=>j(`לא הצלחנו לעדכן את ההתאמה האישית.`))};return window.addEventListener(`pump-personalization:updated`,e),()=>window.removeEventListener(`pump-personalization:updated`,e)},[Ne]),(0,l.useEffect)(()=>{let e=window.setTimeout(()=>{Ne().catch(()=>j(`לא הצלחנו לטעון את החשבון. נסו לרענן.`)).finally(()=>i(!1))},0);',
  'preference update event',
);
replaceOnce(
  'let Pe=(0,l.useMemo)(()=>u?ja(u):null,[u])',
  'let Pe=(0,l.useMemo)(()=>u?pumpPersonalizedTargets(u):null,[u])',
  'personalized targets',
);
replaceOnce(
  'ct=pumpNativeMeals(u,Pe),lt=Na(u)',
  'ct=pumpNativeMeals(u,Pe,M),lt=pumpPersonalizedTraining(u)',
  'personalized training',
);

replaceOnce(
  'function Ge(){return oe===1&&(!w.name.trim()||w.age<13||w.height<100||w.startWeight<25)?(j(`מלא/י שם, גיל, גובה ומשקל תקינים כדי שנוכל לחשב מסלול.`),!1):oe===2&&(w.goal===`lose`&&w.targetWeight>=w.startWeight||w.goal===`gain`&&w.targetWeight<=w.startWeight||w.goal===`event`&&w.targetWeight===w.startWeight)?(j(w.goal===`lose`?`במסלול ירידה, משקל היעד צריך להיות נמוך מהמשקל הנוכחי.`:w.goal===`gain`?`במסלול עלייה, משקל היעד צריך להיות גבוה מהמשקל הנוכחי.`:`בהכנה לאירוע, משקל היעד צריך להיות שונה מהמשקל הנוכחי.`),!1):!0}',
  'function Ge(){return oe===1&&(!w.name.trim()||w.age<18||w.height<100||w.startWeight<25)?(j(w.age<18?`PUMP לא בונה מסלול קלורי אוטומטי למתחת לגיל 18. חשוב לפנות לאיש/אשת מקצוע.`:`מלא/י שם, גיל, גובה ומשקל תקינים כדי שנוכל לחשב מסלול.`),!1):oe===2&&(w.goal===`lose`&&w.targetWeight>=w.startWeight||w.goal===`gain`&&w.targetWeight<=w.startWeight||w.goal===`event`&&w.targetWeight===w.startWeight)?(j(w.goal===`lose`?`במסלול ירידה, משקל היעד צריך להיות נמוך מהמשקל הנוכחי.`:w.goal===`gain`?`במסלול עלייה, משקל היעד צריך להיות גבוה מהמשקל הנוכחי.`:`בהכנה לאירוע, משקל היעד צריך להיות שונה מהמשקל הנוכחי.`),!1):oe===4&&w.needsMedicalClearance?(j(`במצב רפואי, היריון/הנקה או היסטוריה של הפרעת אכילה PUMP לא בונה יעד אוטומטי. חשוב להמשיך עם דיאטן/ית או רופא/ה מוסמכ/ת.`),!1):!0}',
  'automatic-plan safety gate',
);

replaceOnce(
  '}catch(e){j(e instanceof Error?e.message:`לא הצלחנו להסיר את הארוחה.`)}}async function et(t)',
  '}catch(e){j(e instanceof Error?e.message:`לא הצלחנו להסיר את הארוחה.`)}}async function Ct(t,n){if(!s)return;try{let{error:r}=await e.from(`user_meal_feedback`).upsert({user_id:s.id,recipe_id:t,feedback:n,updated_at:new Date().toISOString()},{onConflict:`user_id,recipe_id`});if(r)throw r;await Ne(),j({liked:`נשמור את המנה הזאת גבוה יותר בהמלצות.`,not_for_me:`לא נציע את המנה הזאת שוב.`,too_expensive:`נעדיף חלופות נגישות יותר.`,too_slow:`נעדיף חלופות מהירות יותר.`,still_hungry:`נסמן שהמנה לא הייתה משביעה מספיק.`}[n]??`המשוב נשמר.`)}catch(e){j(e instanceof Error?e.message:`לא הצלחנו לשמור את המשוב.`)}}async function et(t)',
  'meal feedback persistence',
);

replaceOnce(
  's===`done`?(0,V.jsx)(`button`,{className:`meal-toggle done`,onClick:()=>void Qe(t,o),children:`✓ נאכל היום — ביטול`}):(0,V.jsxs)(`div`,{className:`meal-buttons`,children:[(0,V.jsx)(`button`,{className:`meal-swap`,onClick:()=>void Xe(t,e.options.length),children:`↻ החלפה`}),(0,V.jsx)(`button`,{className:`meal-toggle`,onClick:()=>void Ze(a,t,i),children:`✓ אכלתי`})]})',
  's===`done`?(0,V.jsxs)(V.Fragment,{children:[(0,V.jsx)(`button`,{className:`meal-toggle done`,onClick:()=>void Qe(t,o),children:`✓ נאכל היום — ביטול`}),(0,V.jsxs)(`div`,{className:`meal-feedback`,children:[(0,V.jsx)(`small`,{children:`איך היתה הארוחה?` }),(0,V.jsx)(`div`,{children:[[`liked`,`אהבתי`],[`not_for_me`,`לא בשבילי`],[`too_expensive`,`יקר לי`],[`too_slow`,`לקח זמן`],[`still_hungry`,`נשארתי רעב/ה`]].map(([n,r])=>(0,V.jsx)(`button`,{type:`button`,className:a.feedback===n?`active`:`` ,onClick:()=>void Ct(a.id??a.title,n),children:r},n))})]})]}):(0,V.jsxs)(`div`,{className:`meal-buttons`,children:[(0,V.jsx)(`button`,{className:`meal-swap`,onClick:()=>void Xe(t,e.options.length),children:`↻ החלפה`}),(0,V.jsx)(`button`,{className:`meal-toggle`,onClick:()=>void Ze(a,t,i),children:`✓ אכלתי`})]})',
  'meal feedback controls',
);

replaceOnce(
  'function ja(e){let g=e.goal===`gain`||e.goal===`event`&&e.targetWeight>e.startWeight,t=10*e.startWeight+6.25*e.height-5*e.age+(e.sex===`male`?5:-161),n={low:1.2,light:1.375,medium:1.55}[e.activity],r=g?e.pace===`steady`?250:350:e.pace===`steady`?-350:-500,i=Math.max(1200,Math.round((t*n+r)/50)*50),a=g&&e.trainingLevel===`experienced`?1.8:1.6,o=g?e.pace===`steady`?`כ־0.2 ק״ג בשבוע`:`כ־0.3 ק״ג בשבוע`:e.pace===`steady`?`כ־0.25 ק״ג בשבוע`:`כ־0.5 ק״ג בשבוע`,s=e.goal===`event`?`הכנה לאירוע`:g?`עלייה במשקל`:`ירידה במשקל`,c=e.trainingDays===0?`מתחילים מתנועה יומיומית קלה`:`${e.trainingDays} אימונים בשבוע, ${e.trainingPlace===`gym`?`בחדר כושר`:e.trainingPlace===`home`?`בבית`:`בבית ובחדר כושר`}`;return{calories:i,protein:Math.round(e.startWeight*a),weeklyChange:o,goalLabel:s,training:c}}',
  'function ja(e){let g=e.goal===`gain`||e.goal===`event`&&e.targetWeight>e.startWeight,t=10*e.startWeight+6.25*e.height-5*e.age+(e.sex===`male`?5:-161),n={low:1.2,light:1.375,medium:1.55}[e.activity],r=g?e.pace===`steady`?250:350:e.pace===`steady`?-350:-500,i=Math.max(1200,Math.round((t*n+r)/50)*50),a=g&&e.trainingLevel===`experienced`?1.8:1.6,o=g?e.pace===`steady`?`כ־0.2 ק״ג בשבוע`:`כ־0.3 ק״ג בשבוע`:e.pace===`steady`?`כ־0.25 ק״ג בשבוע`:`כ־0.5 ק״ג בשבוע`,s=e.goal===`event`?`הכנה לאירוע`:g?`עלייה במשקל`:`ירידה במשקל`,c=e.trainingDays===0?`מתחילים מתנועה יומיומית קלה`:`${e.trainingDays} אימונים בשבוע, ${e.trainingPlace===`gym`?`בחדר כושר`:e.trainingPlace===`home`?`בבית`:`בבית ובחדר כושר`}`,l=Math.abs(Number(e.targetWeight)-Number(e.startWeight)),u=g?(e.pace===`steady`?[.15,.3]:[.25,.4]):(e.pace===`steady`?[.25,.45]:[.45,.65]),d=Math.max(1,Math.ceil(l/u[1]/4.345)),f=Math.max(d,Math.ceil(l/u[0]/4.345)),p=`כ־${d}${d===f?``:`–${f}`} ${f===1?`חודש`:`חודשים`}`;return{calories:i,protein:Math.round(e.startWeight*a),weeklyChange:o,goalLabel:s,training:c,goalEta:p}}',
  'goal ETA',
);

replaceOnce(
  'value:w.age,onChange:e=>T({...w,age:Number(e.target.value)})',
  'value:w.age??``,onChange:e=>T({...w,age:e.target.value===``?null:Number(e.target.value)})',
  'blank age input',
);
replaceOnce(
  'value:w.height,onChange:e=>T({...w,height:Number(e.target.value)})',
  'value:w.height??``,onChange:e=>T({...w,height:e.target.value===``?null:Number(e.target.value)})',
  'blank height input',
);
replaceOnce(
  'value:w.startWeight,onChange:e=>T({...w,startWeight:Number(e.target.value)})',
  'value:w.startWeight??``,onChange:e=>T({...w,startWeight:e.target.value===``?null:Number(e.target.value)})',
  'blank start weight input',
);
replaceOnce(
  'value:w.targetWeight,onChange:e=>T({...w,targetWeight:Number(e.target.value)})',
  'value:w.targetWeight??``,onChange:e=>T({...w,targetWeight:e.target.value===``?null:Number(e.target.value)})',
  'blank target weight input',
);
replaceOnce(
  'function Ge(){return oe===1&&(!w.name.trim()||w.age<18||w.height<100||w.startWeight<25)?',
  'function Ge(){return oe===1&&(!w.name.trim()||!Number.isFinite(w.age)||!Number.isFinite(w.height)||!Number.isFinite(w.startWeight)||w.age<18||w.height<100||w.startWeight<25)?',
  'blank numeric validation',
);
replaceOnce(
  'oe===2&&(w.goal===`lose`&&w.targetWeight>=w.startWeight||w.goal===`gain`&&w.targetWeight<=w.startWeight||w.goal===`event`&&w.targetWeight===w.startWeight)?',
  'oe===2&&(!Number.isFinite(w.targetWeight)||w.goal===`lose`&&w.targetWeight>=w.startWeight||w.goal===`gain`&&w.targetWeight<=w.startWeight||w.goal===`event`&&w.targetWeight===w.startWeight)?',
  'blank target validation',
);

replaceOnce(
  'catch(e){re(e instanceof Error?e.message:`משהו השתבש.`)}finally{ae(!1)}}}function Ge()',
  'catch(e){let t=e instanceof Error?e.message:`משהו השתבש.`;re(/email not confirmed|email_not_confirmed/i.test(t)?`המייל עדיין לא אומת. פתח/י את קישור האימות שנשלח אליך ואז נסה/י שוב.`:t)}finally{ae(!1)}}}function Ge()',
  'Hebrew email confirmation error',
);

replaceOnce(
  '[ke,Ae]=(0,l.useState)({}),[je,j]=(0,l.useState)(``)',
  '[ke,Ae]=(0,l.useState)({}),[WeDone,setWorkoutDone]=(0,l.useState)(null),[je,j]=(0,l.useState)(``)',
  'workout completion state',
);
replaceOnce(
  'let[i,a,o,s,l,personalRow,feedbackRows]=await Promise.all([',
  'let[i,a,o,s,l,personalRow,feedbackRows,workoutRow]=await Promise.all([',
  'workout completion query variables',
);
replaceOnce(
  'e.from(`user_meal_feedback`).select(`recipe_id, feedback, updated_at`).eq(`user_id`,r.id)]);if(i.error||a.error||o.error||s.error||l.error||personalRow.error||feedbackRows.error)',
  'e.from(`user_meal_feedback`).select(`recipe_id, feedback, updated_at`).eq(`user_id`,r.id),e.from(`workout_completions`).select(`date, workout_key, completed_at`).eq(`user_id`,r.id).eq(`date`,M).maybeSingle()]);if(i.error||a.error||o.error||s.error||l.error||personalRow.error||feedbackRows.error||workoutRow.error)',
  'workout completion query',
);
replaceOnce(
  'throw i.error??a.error??o.error??s.error??l.error??personalRow.error??feedbackRows.error;let u=i.data',
  'throw i.error??a.error??o.error??s.error??l.error??personalRow.error??feedbackRows.error??workoutRow.error;let u=i.data',
  'workout completion query error',
);
replaceOnce(
  'y(l.data??null),f&&T(f)',
  'y(l.data??null),setWorkoutDone(workoutRow.data??null),f&&T(f)',
  'workout completion state mapping',
);
replaceOnce(
  'h([]),_([]),D([]),le(0),Ae({}),e&&j(`יום חדש התחיל',
  'h([]),_([]),D([]),le(0),Ae({}),setWorkoutDone(null),e&&j(`יום חדש התחיל',
  'workout completion daily reset',
);
replaceOnce(
  '},[M]);let Pe=(0,l.useMemo)(()=>u?pumpPersonalizedTargets(u):null,[u])',
  '},[M]),(0,l.useEffect)(()=>{window.scrollTo(0,0),document.documentElement.scrollTo(0,0),document.body.scrollTo(0,0)},[b,oe]);let Pe=(0,l.useMemo)(()=>u?pumpPersonalizedTargets(u):null,[u])',
  'reset scroll on navigation',
);
replaceOnce(
  'async function Je(){if(s)try{let{error:t}=await e.from(`checkins`).upsert({user_id:s.id,date:M,mood:he},{onConflict:`user_id,date`});if(t)throw t;await Ne(),O(!1),j(`צ׳ק־אין נשמר. ממשיכים מחר.`)}catch(e){j(e instanceof Error?e.message:`לא הצלחנו לשמור.`)}}async function Ye',
  'async function Je(){if(s)try{let{error:t}=await e.from(`checkins`).upsert({user_id:s.id,date:M,mood:he},{onConflict:`user_id,date`});if(t)throw t;await Ne(),O(!1),j(`צ׳ק־אין נשמר. ממשיכים מחר.`)}catch(e){j(e instanceof Error?e.message:`לא הצלחנו לשמור.`)}}async function markWorkoutDone(t){if(!s)return;try{let{error:n}=await e.from(`workout_completions`).upsert({user_id:s.id,date:M,workout_key:t,completed_at:new Date().toISOString()},{onConflict:`user_id,date`});if(n)throw n;await Ne(),j(`האימון סומן להיום. כל הכבוד על העקביות.`)}catch(e){j(e instanceof Error?e.message:`לא הצלחנו לשמור את האימון.`)}}async function Ye',
  'workout completion persistence',
);
replaceOnce(
  'Ve=v?.date===M,He=m.reduce((e,t)=>e+t.calories,0)',
  'Ve=v?.date===M,workoutCompleted=WeDone?.date===M,He=m.reduce((e,t)=>e+t.calories,0)',
  'workout completion status',
);
replaceOnce(
  'ft=+(m.length>0)+ +!!E.includes(`train`)+ +!!Ve',
  'ft=+(m.length>0)+ +!!workoutCompleted+ +!!Ve',
  'workout completion score',
);
replaceOnce(
  'let t=e.id===`checkin`?Ve:e.id===`meal`?m.length>0:E.includes(e.id);return',
  'let t=e.id===`checkin`?Ve:e.id===`meal`?m.length>0:e.id===`train`?workoutCompleted:E.includes(e.id);return',
  'workout completion task state',
);
replaceOnce(
  '(e.id!==`meal`&&D(t?E.filter(t=>t!==e.id):[...E,e.id]),x(e.id===`meal`?`food`:`training`))',
  '(e.id!==`meal`&&e.id!==`train`&&D(t?E.filter(t=>t!==e.id):[...E,e.id]),x(e.id===`meal`?`food`:`training`))',
  'workout completion task click',
);
replaceOnce(
  ']},e.label))]}),(0,V.jsxs)(`section`,{className:`training-tip`',
  ']},e.label)),(0,V.jsx)(`button`,{className:workoutCompleted?`workout-complete done`:`workout-complete`,disabled:workoutCompleted,onClick:()=>void markWorkoutDone(`movement`),children:workoutCompleted?`✓ אימון סומן להיום`:`סיימתי אימון היום`})]}),(0,V.jsxs)(`section`,{className:`training-tip`',
  'workout completion button',
);

replaceOnce(
  'children:[He.toLocaleString(),` `,(0,V.jsx)(`em`,{children:`קל׳`})]}',
  'children:[He.toLocaleString(),` / `,Pe?.calories,` `,(0,V.jsx)(`em`,{children:`קל׳`})]}',
  'calorie target ratio',
);
replaceOnce(
  '(0,V.jsx)(`button`,{onClick:()=>Ee(!0),children:`+ הוספה ידנית`})',
  '(0,V.jsxs)(`div`,{className:`nutrition-target-actions`,children:[(0,V.jsx)(`button`,{onClick:()=>Ee(!0),children:`+ הוספה ידנית`}),(0,V.jsx)(`button`,{onClick:()=>x(`camera`),children:`◉ צילום אוכל`})]})',
  'camera button beside manual add',
);
replaceOnce(
  '(0,V.jsxs)(`div`,{className:`food-actions`,children:[(0,V.jsx)(`button`,{onClick:()=>x(`camera`),children:`◉ צילום אוכל`}),(0,V.jsxs)(`span`,{children:[`נותרו היום: `,pt.toLocaleString(),` קל׳`]})]})',
  '(0,V.jsxs)(`div`,{className:`food-actions`,children:[(0,V.jsxs)(`span`,{children:[`נותרו היום: `,pt.toLocaleString(),` קל׳`]})]})',
  'remove standalone camera action',
);
replaceOnce(
  '(0,V.jsxs)(`section`,{className:`nutrition-target`,children:[',
  '(0,V.jsxs)(`section`,{className:He>Pe?.calories?`nutrition-target over-target`:`nutrition-target`,children:[',
  'calorie over-target style',
);
replaceOnce(
  ']}),(0,V.jsxs)(`div`,{className:`food-actions`,children:[',
  ']}),He>Pe?.calories&&(0,V.jsxs)(`p`,{className:`calorie-overage`,children:[`חרגת היום בכ־${(He-Pe.calories).toLocaleString()} קל׳. זה לא מוחק את ההתקדמות — פשוט ממשיכים כרגיל בארוחה הבאה.`]}),(0,V.jsxs)(`div`,{className:`food-actions`,children:[',
  'calorie over-target message',
);

replaceOnce(
  'Pe?.goalLabel,` · `,Pe?.weeklyChange,` · `,Pe?.training',
  'Pe?.goalLabel,` · `,Pe?.weeklyChange,` · צפי יעד: `,Pe?.goalEta',
  'home goal ETA',
);
replaceOnce(
  '(0,V.jsxs)(`div`,{className:`daily-head`,children:[(0,V.jsxs)(`div`,{children:[(0,V.jsx)(`small`,{children:`המסגרת שלך להיום`}),(0,V.jsxs)(`b`,{children:[Pe?.calories.toLocaleString(),` `,(0,V.jsx)(`em`,{children:`קלוריות`})]})]}),(0,V.jsxs)(`div`,{className:`goal-ring`,style:{"--progress":`${Math.min(100,Math.round(He/(Pe?.calories||1)*100))}%`},children:[(0,V.jsx)(`strong`,{children:He}),(0,V.jsx)(`small`,{children:`נאכלו`})]})]})',
  '(0,V.jsxs)(`div`,{className:`daily-head`,children:[(0,V.jsxs)(`div`,{children:[(0,V.jsx)(`small`,{children:`נאכלו היום`}),(0,V.jsxs)(`b`,{children:[He.toLocaleString(),` / `,Pe?.calories,` `,(0,V.jsx)(`em`,{children:`קל׳`})]})]})]})',
  'simplify home calorie display',
);
replaceOnce(
  '(0,V.jsxs)(`div`,{className:`metrics`,children:[(0,V.jsxs)(`span`,{children:[(0,V.jsx)(`b`,{children:Ue}),` / `,Pe?.protein,(0,V.jsx)(`small`,{children:`חלבון`})]}),(0,V.jsxs)(`span`,{children:[(0,V.jsx)(`b`,{children:pt}),(0,V.jsx)(`small`,{children:`נותרו קל׳`})]}),(0,V.jsxs)(`span`,{children:[(0,V.jsx)(`b`,{children:ce}),` / 8`,(0,V.jsx)(`small`,{children:`כוסות מים`})]})]})',
  '(0,V.jsxs)(`div`,{className:`metrics`,children:[(0,V.jsxs)(`span`,{children:[(0,V.jsx)(`b`,{children:Ue}),` / `,Pe?.protein,(0,V.jsx)(`small`,{children:`חלבון`})]}),(0,V.jsxs)(`span`,{children:[(0,V.jsx)(`b`,{children:ce}),` / 8`,(0,V.jsx)(`small`,{children:`כוסות מים`})]})]})',
  'remove scattered home calorie remainder',
);

replaceOnce(
  ']}),(0,V.jsxs)(`section`,{className:`section-title`,children:[(0,V.jsxs)(`span`,{children:[(0,V.jsx)(`small`,{children:`להיום`})',
  ']}),(0,V.jsxs)(`section`,{className:`home-goal-card`,children:[(0,V.jsxs)(`header`,{children:[(0,V.jsxs)(`div`,{children:[(0,V.jsx)(`small`,{children:`היעד שלך`}),(0,V.jsxs)(`h2`,{children:[Pe?.goalLabel,` · `,u.targetWeight,` ק״ג`]})]}),(0,V.jsxs)(`b`,{children:[Le.toFixed(1),` ק״ג נשארו`]})]}),(0,V.jsxs)(`div`,{className:`home-goal-stats`,children:[(0,V.jsxs)(`span`,{children:[(0,V.jsx)(`small`,{children:`משקל נוכחי`}),(0,V.jsxs)(`b`,{children:[Fe,` ק״ג`]})]}),(0,V.jsxs)(`span`,{children:[(0,V.jsx)(`small`,{children:`צפי יעד`}),(0,V.jsx)(`b`,{children:Pe?.goalEta})]}),(0,V.jsxs)(`span`,{children:[(0,V.jsx)(`small`,{children:`אימון היום`}),(0,V.jsx)(`b`,{children:workoutCompleted?`בוצע ✓`:`טרם סומן`})]})]}),Be.length>0?(0,V.jsxs)(`svg`,{className:`home-weight-chart`,viewBox:`0 0 100 48`,preserveAspectRatio:`none`,role:`img`,"aria-label":`גרף שקילות`,children:[(0,V.jsx)(`polyline`,{points:Be.map(e=>`${e.x},${Math.max(6,Math.min(43,e.y*.58))}`).join(` `)}),Be.map(e=>(0,V.jsx)(`circle`,{cx:e.x,cy:Math.max(6,Math.min(43,e.y*.58)),r:`1.6`},e.date))]}):(0,V.jsx)(`p`,{className:`home-weight-empty`,children:`אחרי שתי שקילות יוצג כאן גרף המגמה שלך.`})]}),(0,V.jsxs)(`section`,{className:`section-title`,children:[(0,V.jsxs)(`span`,{children:[(0,V.jsx)(`small`,{children:`להיום`})',
  'home dashboard goal card',
);

// The source bundle is minified and contains one legacy trailing space. Keep the
// generated artifact clean without altering any JavaScript tokens.
await writeFile(outputPath, bundle.replace(/[ \t]+(?=\r?\n|$)/g, ''));
