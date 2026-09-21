import { useEffect, useMemo, useState } from 'react';
import Stat from '../ui/Stat.jsx';
import ExerciseDemo from '../training/components/ExerciseDemo.jsx';
import { planDailyNutrition } from '../nutrition/engine/day-planner.js';
import { alternativesForExercise, EXERCISE_BY_ID } from '../training/data/exercise-catalog.js';
import { signOut } from '../services/auth.js';

const SLOT_LABELS = { breakfast: 'ארוחת בוקר', lunch: 'ארוחת צהריים', dinner: 'ארוחת ערב', snack: 'נשנוש' };
const mealMeta = (value) => typeof value === 'string' ? { status: value } : (value ?? {});

function resolveMealEntry(entry, nutrition, mealState, eligibleMeals) {
  const meta = mealMeta(mealState?.[entry.slot]);
  if (!meta.replacementSeed) return entry;
  try {
    const replanned = planDailyNutrition(nutrition.target, {
      diet: nutrition.diet,
      seed: meta.replacementSeed,
      candidateFilter: (template) => Boolean(eligibleMeals?.[template.slot]?.includes(template.id)),
    });
    return replanned.meals.find((meal) => meal.slot === entry.slot) ?? entry;
  } catch {
    return entry;
  }
}

function consumedNutrition(plan, daily) {
  if (plan.nutrition.status !== 'ready') return { calories: 0, protein: 0 };
  const meals = plan.nutrition.meals.map((entry) => resolveMealEntry(entry, plan.nutrition, daily?.meals, plan.audit.nutritionCoverage));
  const eaten = meals.filter((entry) => mealMeta(daily?.meals?.[entry.slot]).status === 'eaten');
  return [...eaten.map((entry) => entry.meal.totals), ...(daily?.manualFoods ?? [])].reduce((sum, item) => ({
    calories: sum.calories + Number(item.calories ?? 0),
    protein: sum.protein + Number(item.protein ?? 0),
  }), { calories: 0, protein: 0 });
}

export function TodayScreen({ plan, daily, go }) {
  const { profile, targets, nutrition, training } = plan;
  const workout = training.plan.sessions[0];
  const weightDelta = Math.abs(profile.targetWeightKg - profile.weightKg).toFixed(1);
  const eaten = Object.values(daily?.meals ?? {}).filter((value) => mealMeta(value).status === 'eaten').length;
  const consumed = consumedNutrition(plan, daily);
  return <main className="screen">
    <section className="hero-card"><p className="eyebrow">התוכנית שלך להיום</p><h1>ממשיכים ליעד.</h1><p>{profile.goal === 'gain' ? `נשארו ${weightDelta} ק״ג ליעד` : 'התוכנית מחושבת לפי הפרופיל שלך'}</p></section>
    <section className="stats-grid">
      <Stat label="נאכלו היום" value={`${Math.round(consumed.calories)} / ${Math.round(targets.calories)} קל׳`} sub="קלוריות" />
      <Stat label="חלבון" value={`${Math.round(consumed.protein)} / ${Math.round(targets.protein)} ג׳`} sub="היום" />
      <Stat label="ארוחות" value={`${eaten}/4`} sub="סומנו כאכלתי" />
      <Stat label="אימון" value={daily?.workout?.completed ? 'בוצע' : `${training.sessionMinutes} דק׳`} sub={daily?.workout?.completed ? 'היום' : 'מתוכנן'} />
    </section>
    <button className="section-card action-card card-button" onClick={() => go('nutrition')}><div><p className="eyebrow">תזונה</p><h2>{nutrition.status === 'ready' ? 'התפריט היומי מוכן' : 'נדרשת התאמה'}</h2></div><span className="arrow">←</span></button>
    <section className="section-card"><div className="section-title-row"><div><p className="eyebrow">האימון הבא</p><h2>{workout.id}</h2></div><button className="text-button" onClick={() => go('training')}>לכל האימון</button></div><div className="mini-exercises">{workout.exercises.slice(0, 3).map((item) => <span key={item.exerciseId}>{item.names.he}</span>)}</div></section>
    <div className="quick-actions"><button onClick={() => go('camera')}>צילום אוכל</button><button onClick={() => go('camera')}>הוספה ידנית</button></div>
  </main>;
}

export function NutritionScreen({ nutrition, eligibleMeals, mealState = {}, onMealStatus, onReplaceMeal, onFeedback }) {
  if (nutrition.status !== 'ready') return <main className="screen"><section className="section-card"><h1>אין כרגע כיסוי תזונתי בטוח</h1><p>המערכת לא תמציא ארוחה שלא עומדת בהגבלות שלך.</p></section></main>;
  return <main className="screen">
    <div className="screen-heading"><p className="eyebrow">תזונה</p><h1>התפריט שלך</h1><p>הכמויות מחושבות מהמרכיבים בפועל.</p></div>
    <section className="nutrition-summary"><Stat label="יעד" value={`${Math.round(nutrition.target.calories)} קל׳`} /><Stat label="חלבון" value={`${Math.round(nutrition.target.protein)} ג׳`} /></section>
    <div className="meal-list">{nutrition.meals.map((entry) => {
      const meta = mealMeta(mealState[entry.slot]);
      const shown = resolveMealEntry(entry, nutrition, mealState, eligibleMeals);
      const eaten = meta.status === 'eaten';
      return <article className={`meal-card${eaten ? ' is-complete' : ''}`} key={entry.slot}>
        <div className="meal-top"><span>{SLOT_LABELS[entry.slot]}</span><strong>{Math.round(shown.meal.totals.calories)} קל׳</strong></div>
        <h2>{shown.template.title}</h2>
        <p>{Math.round(shown.meal.totals.protein)} ג׳ חלבון · {Math.round(shown.meal.totals.carbs)} ג׳ פחמימה · {Math.round(shown.meal.totals.fat)} ג׳ שומן</p>
        <div className="meal-items">{shown.meal.items.map((item) => <span key={`${entry.slot}-${item.foodId}`}>{Math.round(item.grams)} ג׳</span>)}</div>
        <div className="meal-actions"><button className={`primary-action${eaten ? ' complete' : ''}`} onClick={() => onMealStatus?.(entry.slot, eaten ? 'planned' : 'eaten')}>{eaten ? '✓ נאכל' : 'אכלתי'}</button><button className="secondary-action" onClick={() => onReplaceMeal?.(entry.slot)}>החלפה</button></div>
        <div className="feedback-row"><button className={meta.feedback === 'like' ? 'active' : ''} onClick={() => onFeedback?.(entry.slot, 'like', shown.template.id)}>אהבתי</button><button className={meta.feedback === 'dislike' ? 'active' : ''} onClick={() => onFeedback?.(entry.slot, 'dislike', shown.template.id)}>פחות מתאים</button></div>
      </article>;
    })}</div>
  </main>;
}

function RestTimer({ seconds }) {
  const [left, setLeft] = useState(0);
  useEffect(() => {
    if (left <= 0) return undefined;
    const id = setInterval(() => setLeft((value) => Math.max(0, value - 1)), 1000);
    return () => clearInterval(id);
  }, [left]);
  return <button className={`timer-button${left ? ' running' : ''}`} onClick={() => setLeft(left ? 0 : seconds)}>{left ? `מנוחה ${left} שנ׳` : `טיימר ${seconds} שנ׳`}</button>;
}

export function TrainingScreen({ training, sex, workoutState = {}, onCompleteWorkout, onToggleExercise, onReplaceExercise }) {
  const [sessionIndex, setSessionIndex] = useState(0);
  const session = training.plan.sessions[sessionIndex];
  const completed = workoutState.completed && workoutState.sessionId === session.id;
  const progress = workoutState.progress ?? {};
  const replacements = workoutState.replacements ?? {};
  return <main className="screen">
    <div className="screen-heading"><p className="eyebrow">כושר</p><h1>תוכנית האימונים</h1><p>{training.daysPerWeek} ימים · {training.sessionMinutes} דקות · {training.level}</p></div>
    <div className="session-tabs">{training.plan.sessions.map((item, index) => <button key={`${item.id}-${index}`} onClick={() => setSessionIndex(index)} className={index === sessionIndex ? 'active' : ''}>אימון {index + 1}</button>)}</div>
    <section className="workout-card"><div className="section-title-row"><div><p className="eyebrow">אימון {sessionIndex + 1}</p><h2>{session.id}</h2></div><span>{session.exercises.length} תרגילים</span></div><div className="exercise-list">{session.exercises.map((original, index) => {
      const key = `${session.id}:${original.exerciseId}`;
      const replacementId = replacements[key];
      const replacement = replacementId ? EXERCISE_BY_ID[replacementId] : null;
      const item = replacement ? { ...original, exerciseId: replacement.id, names: replacement.names } : original;
      const done = Boolean(progress[key]);
      const alternatives = alternativesForExercise(original.exerciseId, training.plan.prescription);
      return <article className={`exercise-row expanded${done ? ' is-complete' : ''}`} key={original.exerciseId}><div className="exercise-number">{done ? '✓' : index + 1}</div><ExerciseDemo exerciseId={item.exerciseId} sex={sex} language="he" compact /><div className="exercise-copy"><h3>{item.names.he}</h3><p>{item.prescription.sets} סטים · {item.prescription.mode === 'seconds' ? `${item.prescription.secondsRange?.[0]}–${item.prescription.secondsRange?.[1]} שנ׳` : `${item.prescription.repRange?.[0]}–${item.prescription.repRange?.[1]} חזרות`}</p><small>מנוחה {item.prescription.restSeconds} שנ׳</small><div className="exercise-actions"><button onClick={() => onToggleExercise?.(session.id, original.exerciseId)}>{done ? 'בטל השלמה' : 'סיימתי תרגיל'}</button><RestTimer seconds={item.prescription.restSeconds} />{alternatives[0] && <button onClick={() => onReplaceExercise?.(session.id, original.exerciseId, alternatives[0].id)}>החלף תרגיל</button>}</div></div></article>;
    })}</div><button className={`primary-action workout-complete${completed ? ' complete' : ''}`} disabled={completed} onClick={() => onCompleteWorkout?.(session.id)}>{completed ? '✓ האימון הושלם' : 'סיימתי את האימון'}</button></section>
  </main>;
}

export function ProgressScreen({ profile, weights = [], onAddWeight }) {
  const [value, setValue] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const latest = weights[0]?.weightKg ?? profile.weightKg;
  const submit = async (event) => {
    event.preventDefault();
    if (!value) return;
    setSaving(true); setError('');
    try { await onAddWeight?.(value); setValue(''); } catch (err) { setError(err?.message || 'השמירה נכשלה'); } finally { setSaving(false); }
  };
  return <main className="screen"><div className="screen-heading"><p className="eyebrow">שקילות</p><h1>התקדמות</h1><p>היסטוריית השקילות נשמרת בחשבון.</p></div><section className="weight-hero"><span>משקל אחרון</span><strong>{latest} ק״ג</strong><small>יעד: {profile.targetWeightKg} ק״ג</small></section><form className="section-card weight-form" onSubmit={submit}><h2>עדכון שקילה</h2><div className="weight-input-row"><input inputMode="decimal" type="number" step="0.1" min="20.1" max="399.9" value={value} onChange={(event) => setValue(event.target.value)} placeholder="משקל בק״ג" /><button className="primary-action" disabled={saving}>{saving ? 'שומר…' : 'שמור'}</button></div>{error && <p className="form-message error">{error}</p>}</form><section className="section-card muted-card"><h2>היסטוריה</h2>{weights.length ? <div className="weight-history">{weights.map((row) => <div key={row.date}><span>{row.date}</span><strong>{row.weightKg} ק״ג</strong></div>)}</div> : <p>עדיין אין שקילות שמורות.</p>}</section></main>;
}

export function FoodCaptureScreen({ items = [], onAddFood, onRemoveFood, saving = false }) {
  const [image, setImage] = useState(null);
  const [form, setForm] = useState({ name: '', calories: '', protein: '', carbs: '', fat: '' });
  const [error, setError] = useState('');
  const preview = useMemo(() => image ? URL.createObjectURL(image) : null, [image]);
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);
  const add = async (event) => {
    event.preventDefault();
    if (!form.name || !form.calories) return;
    setError('');
    try {
      await onAddFood?.({ name: form.name, calories: Number(form.calories), protein: Number(form.protein || 0), carbs: Number(form.carbs || 0), fat: Number(form.fat || 0) });
      setForm({ name: '', calories: '', protein: '', carbs: '', fat: '' });
    } catch (err) { setError(err?.message || 'לא הצלחנו לשמור את האוכל'); }
  };
  return <main className="screen"><div className="screen-heading"><p className="eyebrow">צילום אוכל</p><h1>הוספת אוכל</h1><p>אפשר לצלם או לבחור תמונה, ואז לאשר את הערכים ידנית. אין ניחוש ערכים כשהניתוח האוטומטי אינו זמין.</p></div><section className="section-card camera-card"><label className="camera-picker">צלם / בחר תמונה<input type="file" accept="image/*" capture="environment" onChange={(event) => setImage(event.target.files?.[0] ?? null)} /></label>{preview && <img className="food-preview" src={preview} alt="תצוגה מקדימה של האוכל" />}</section><form className="section-card manual-food" onSubmit={add}><h2>הוספה ידנית</h2><input placeholder="שם המאכל" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /><div className="form-grid two"><input type="number" min="0" placeholder="קלוריות" value={form.calories} onChange={(event) => setForm({ ...form, calories: event.target.value })} /><input type="number" min="0" placeholder="חלבון (גרם)" value={form.protein} onChange={(event) => setForm({ ...form, protein: event.target.value })} /><input type="number" min="0" placeholder="פחמימה" value={form.carbs} onChange={(event) => setForm({ ...form, carbs: event.target.value })} /><input type="number" min="0" placeholder="שומן" value={form.fat} onChange={(event) => setForm({ ...form, fat: event.target.value })} /></div><button className="primary-action" disabled={saving}>{saving ? 'שומר…' : 'הוסף להיום'}</button>{error && <p className="form-message error">{error}</p>}</form>{items.length > 0 && <section className="section-card"><h2>נוסף היום</h2>{items.map((item) => <div className="manual-row" key={item.id}><span>{item.name}</span><strong>{Math.round(item.calories)} קל׳</strong><button className="text-button" onClick={() => onRemoveFood?.(item.id)}>הסר</button></div>)}</section>}</main>;
}

export function AccountScreen({ profile, connected = true }) {
  const [busy, setBusy] = useState(false);
  return <main className="screen"><div className="screen-heading"><p className="eyebrow">חשבון</p><h1>הגדרות</h1></div><section className="section-card account-grid"><div><span>מטרה</span><strong>{profile.goal}</strong></div><div><span>משקל יעד</span><strong>{profile.targetWeightKg} ק״ג</strong></div><div><span>אימונים</span><strong>{profile.trainingDays} בשבוע</strong></div><div><span>משך אימון</span><strong>{profile.sessionMinutes} דק׳</strong></div></section>{connected ? <button className="danger-action" disabled={busy} onClick={async () => { setBusy(true); try { await signOut(); } finally { setBusy(false); } }}>{busy ? 'מתנתק…' : 'התנתקות'}</button> : <section className="section-card"><p>במצב הדגמה אין חשבון מחובר.</p></section>}</main>;
}
