import { useState } from 'react';
import Stat from '../ui/Stat.jsx';
import ExerciseDemo from '../training/components/ExerciseDemo.jsx';

const SLOT_LABELS = { breakfast: 'ארוחת בוקר', lunch: 'ארוחת צהריים', dinner: 'ארוחת ערב', snack: 'נשנוש' };

export function TodayScreen({ plan, daily, go }) {
  const { profile, targets, nutrition, training } = plan;
  const workout = training.plan.sessions[0];
  const weightDelta = Math.abs(profile.targetWeightKg - profile.weightKg).toFixed(1);
  const eaten = Object.values(daily?.meals ?? {}).filter((value) => value === 'eaten').length;
  return <main className="screen">
    <section className="hero-card"><p className="eyebrow">התוכנית שלך להיום</p><h1>ממשיכים ליעד.</h1><p>{profile.goal === 'gain' ? `נשארו ${weightDelta} ק״ג ליעד` : 'התוכנית מחושבת לפי הפרופיל שלך'}</p></section>
    <section className="stats-grid">
      <Stat label="קלוריות" value={`${Math.round(targets.calories)}`} sub="יעד יומי" />
      <Stat label="חלבון" value={`${Math.round(targets.protein)} ג׳`} sub="יעד יומי" />
      <Stat label="ארוחות" value={`${eaten}/4`} sub="סומנו כאכלתי" />
      <Stat label="אימון" value={daily?.workout?.completed ? 'בוצע' : `${training.sessionMinutes} דק׳`} sub={daily?.workout?.completed ? 'היום' : 'מתוכנן'} />
    </section>
    <button className="section-card action-card card-button" onClick={() => go('nutrition')}><div><p className="eyebrow">תזונה</p><h2>{nutrition.status === 'ready' ? 'התפריט היומי מוכן' : 'נדרשת התאמה'}</h2></div><span className="arrow">←</span></button>
    <section className="section-card"><div className="section-title-row"><div><p className="eyebrow">האימון הבא</p><h2>{workout.id}</h2></div><button className="text-button" onClick={() => go('training')}>לכל האימון</button></div><div className="mini-exercises">{workout.exercises.slice(0, 3).map((item) => <span key={item.exerciseId}>{item.names.he}</span>)}</div></section>
  </main>;
}

export function NutritionScreen({ nutrition, mealState = {}, onMealStatus }) {
  if (nutrition.status !== 'ready') return <main className="screen"><section className="section-card"><h1>אין כרגע כיסוי תזונתי בטוח</h1><p>המערכת לא תמציא ארוחה שלא עומדת בהגבלות שלך.</p></section></main>;
  return <main className="screen">
    <div className="screen-heading"><p className="eyebrow">תזונה</p><h1>התפריט שלך</h1><p>הכמויות מחושבות מהמרכיבים בפועל.</p></div>
    <section className="nutrition-summary"><Stat label="יעד" value={`${Math.round(nutrition.target.calories)} קל׳`} /><Stat label="חלבון" value={`${Math.round(nutrition.target.protein)} ג׳`} /></section>
    <div className="meal-list">{nutrition.meals.map((entry) => {
      const eaten = mealState[entry.slot] === 'eaten';
      return <article className={`meal-card${eaten ? ' is-complete' : ''}`} key={entry.slot}>
        <div className="meal-top"><span>{SLOT_LABELS[entry.slot]}</span><strong>{Math.round(entry.meal.totals.calories)} קל׳</strong></div>
        <h2>{entry.template.title}</h2>
        <p>{Math.round(entry.meal.totals.protein)} ג׳ חלבון · {Math.round(entry.meal.totals.carbs)} ג׳ פחמימה · {Math.round(entry.meal.totals.fat)} ג׳ שומן</p>
        <div className="meal-items">{entry.meal.items.map((item) => <span key={`${entry.slot}-${item.foodId}`}>{Math.round(item.grams)} ג׳</span>)}</div>
        <button className={`primary-action${eaten ? ' complete' : ''}`} onClick={() => onMealStatus?.(entry.slot, eaten ? 'planned' : 'eaten')}>{eaten ? '✓ נאכל' : 'אכלתי'}</button>
      </article>;
    })}</div>
  </main>;
}

export function TrainingScreen({ training, sex, workoutState = {}, onCompleteWorkout }) {
  const [sessionIndex, setSessionIndex] = useState(0);
  const session = training.plan.sessions[sessionIndex];
  const completed = workoutState.completed && workoutState.sessionId === session.id;
  return <main className="screen">
    <div className="screen-heading"><p className="eyebrow">כושר</p><h1>תוכנית האימונים</h1><p>{training.daysPerWeek} ימים · {training.sessionMinutes} דקות · {training.level}</p></div>
    <div className="session-tabs">{training.plan.sessions.map((item, index) => <button key={`${item.id}-${index}`} onClick={() => setSessionIndex(index)} className={index === sessionIndex ? 'active' : ''}>אימון {index + 1}</button>)}</div>
    <section className="workout-card"><div className="section-title-row"><div><p className="eyebrow">אימון {sessionIndex + 1}</p><h2>{session.id}</h2></div><span>{session.exercises.length} תרגילים</span></div>
      <div className="exercise-list">{session.exercises.map((item, index) => <article className="exercise-row" key={item.exerciseId}><div className="exercise-number">{index + 1}</div><ExerciseDemo exerciseId={item.exerciseId} sex={sex} language="he" compact /><div className="exercise-copy"><h3>{item.names.he}</h3><p>{item.prescription.sets} סטים · {item.prescription.mode === 'seconds' ? `${item.prescription.secondsRange?.[0]}–${item.prescription.secondsRange?.[1]} שנ׳` : `${item.prescription.repRange?.[0]}–${item.prescription.repRange?.[1]} חזרות`}</p><small>מנוחה {item.prescription.restSeconds} שנ׳</small></div></article>)}</div>
      <button className={`primary-action workout-complete${completed ? ' complete' : ''}`} disabled={completed} onClick={() => onCompleteWorkout?.(session.id)}>{completed ? '✓ האימון הושלם' : 'סיימתי את האימון'}</button>
    </section>
  </main>;
}

export function ProgressScreen({ profile, weights = [], onAddWeight }) {
  const [value, setValue] = useState('');
  const [saving, setSaving] = useState(false);
  const latest = weights[0]?.weightKg ?? profile.weightKg;
  const submit = async (event) => { event.preventDefault(); if (!value) return; setSaving(true); try { await onAddWeight?.(value); setValue(''); } finally { setSaving(false); } };
  return <main className="screen">
    <div className="screen-heading"><p className="eyebrow">שקילות</p><h1>התקדמות</h1><p>היסטוריית השקילות נשמרת בחשבון ולא נוצרת מנתוני דמה.</p></div>
    <section className="weight-hero"><span>משקל אחרון</span><strong>{latest} ק״ג</strong><small>יעד: {profile.targetWeightKg} ק״ג</small></section>
    <form className="section-card weight-form" onSubmit={submit}><h2>עדכון שקילה</h2><div className="weight-input-row"><input inputMode="decimal" type="number" step="0.1" min="20.1" max="399.9" value={value} onChange={(e) => setValue(e.target.value)} placeholder="משקל בק״ג" /><button className="primary-action" disabled={saving}>{saving ? 'שומר…' : 'שמור'}</button></div></form>
    <section className="section-card muted-card"><h2>היסטוריה</h2>{weights.length ? <div className="weight-history">{weights.map((row) => <div key={row.date}><span>{row.date}</span><strong>{row.weightKg} ק״ג</strong></div>)}</div> : <p>עדיין אין שקילות שמורות.</p>}</section>
  </main>;
}
