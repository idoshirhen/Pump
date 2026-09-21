import { useMemo, useState } from 'react';
import { buildPersonalizedPlan } from './personalization/engine.js';
import { DEMO_PROFILE } from './demo-profile.js';
import ExerciseDemo from './training/components/ExerciseDemo.jsx';

const NAV = [
  ['today', 'היום'],
  ['nutrition', 'תזונה'],
  ['training', 'כושר'],
  ['progress', 'שקילות'],
];

const SLOT_LABELS = {
  breakfast: 'ארוחת בוקר',
  lunch: 'ארוחת צהריים',
  dinner: 'ארוחת ערב',
  snack: 'נשנוש',
};

function Stat({ label, value, sub }) {
  return <div className="stat-card"><span>{label}</span><strong>{value}</strong>{sub && <small>{sub}</small>}</div>;
}

function Header({ profile }) {
  return (
    <header className="topbar">
      <div className="brand" aria-label="PUMP"><span className="brand-mark">♥</span><b>PUMP</b></div>
      <div className="profile-chip"><span className="profile-dot" />{profile.id === 'pump3-demo-user' ? 'מצב פיתוח' : 'פרופיל'}</div>
    </header>
  );
}

function BottomNav({ active, onChange }) {
  return (
    <nav className="bottom-nav" aria-label="ניווט ראשי">
      {NAV.map(([id, label]) => (
        <button key={id} className={active === id ? 'active' : ''} onClick={() => onChange(id)}>{label}</button>
      ))}
    </nav>
  );
}

function Today({ plan, go }) {
  const { profile, targets, nutrition, training } = plan;
  const workout = training.plan.sessions[0];
  const weightDelta = Math.abs(profile.targetWeightKg - profile.weightKg).toFixed(1);
  return (
    <main className="screen">
      <section className="hero-card">
        <p className="eyebrow">התוכנית שלך להיום</p>
        <h1>ממשיכים ליעד.</h1>
        <p>{profile.goal === 'gain' ? `נשארו ${weightDelta} ק״ג ליעד` : 'התוכנית מחושבת לפי הפרופיל שלך'}</p>
      </section>

      <section className="stats-grid">
        <Stat label="קלוריות" value={`${Math.round(targets.calories)}`} sub="יעד יומי" />
        <Stat label="חלבון" value={`${Math.round(targets.protein)} ג׳`} sub="יעד יומי" />
        <Stat label="אימונים" value={`${training.daysPerWeek}`} sub="בשבוע" />
        <Stat label="משך" value={`${training.sessionMinutes} דק׳`} sub="לאימון" />
      </section>

      <section className="section-card action-card" onClick={() => go('nutrition')} role="button" tabIndex={0}>
        <div><p className="eyebrow">תזונה</p><h2>{nutrition.status === 'ready' ? 'התפריט היומי מוכן' : 'נדרשת התאמה'}</h2></div>
        <span className="arrow">←</span>
      </section>

      <section className="section-card">
        <div className="section-title-row"><div><p className="eyebrow">האימון הבא</p><h2>{workout.id}</h2></div><button className="text-button" onClick={() => go('training')}>לכל האימון</button></div>
        <div className="mini-exercises">
          {workout.exercises.slice(0, 3).map((item) => <span key={item.exerciseId}>{item.names.he}</span>)}
        </div>
      </section>
    </main>
  );
}

function Nutrition({ nutrition }) {
  if (nutrition.status !== 'ready') {
    return <main className="screen"><section className="section-card"><h1>אין כרגע כיסוי תזונתי בטוח</h1><p>המערכת לא תמציא ארוחה שלא עומדת בהגבלות שלך.</p></section></main>;
  }
  return (
    <main className="screen">
      <div className="screen-heading"><p className="eyebrow">תזונה</p><h1>התפריט שלך</h1><p>הכמויות מחושבות מהמרכיבים בפועל.</p></div>
      <section className="nutrition-summary">
        <Stat label="יעד" value={`${Math.round(nutrition.target.calories)} קל׳`} />
        <Stat label="חלבון" value={`${Math.round(nutrition.target.protein)} ג׳`} />
      </section>
      <div className="meal-list">
        {nutrition.meals.map((entry) => (
          <article className="meal-card" key={entry.slot}>
            <div className="meal-top"><span>{SLOT_LABELS[entry.slot]}</span><strong>{Math.round(entry.meal.totals.calories)} קל׳</strong></div>
            <h2>{entry.template.title}</h2>
            <p>{Math.round(entry.meal.totals.protein)} ג׳ חלבון · {Math.round(entry.meal.totals.carbs)} ג׳ פחמימה · {Math.round(entry.meal.totals.fat)} ג׳ שומן</p>
            <div className="meal-items">{entry.meal.items.map((item) => <span key={`${entry.slot}-${item.foodId}`}>{Math.round(item.grams)} ג׳</span>)}</div>
          </article>
        ))}
      </div>
    </main>
  );
}

function Training({ training, sex }) {
  const [sessionIndex, setSessionIndex] = useState(0);
  const session = training.plan.sessions[sessionIndex];
  return (
    <main className="screen">
      <div className="screen-heading"><p className="eyebrow">כושר</p><h1>תוכנית האימונים</h1><p>{training.daysPerWeek} ימים · {training.sessionMinutes} דקות · {training.level}</p></div>
      <div className="session-tabs">
        {training.plan.sessions.map((item, index) => <button key={`${item.id}-${index}`} onClick={() => setSessionIndex(index)} className={index === sessionIndex ? 'active' : ''}>אימון {index + 1}</button>)}
      </div>
      <section className="workout-card">
        <div className="section-title-row"><div><p className="eyebrow">אימון {sessionIndex + 1}</p><h2>{session.id}</h2></div><span>{session.exercises.length} תרגילים</span></div>
        <div className="exercise-list">
          {session.exercises.map((item, index) => (
            <article className="exercise-row" key={item.exerciseId}>
              <div className="exercise-number">{index + 1}</div>
              <ExerciseDemo exerciseId={item.exerciseId} sex={sex} language="he" compact />
              <div className="exercise-copy">
                <h3>{item.names.he}</h3>
                <p>{item.prescription.sets} סטים · {item.prescription.mode === 'seconds' ? `${item.prescription.secondsRange?.[0]}–${item.prescription.secondsRange?.[1]} שנ׳` : `${item.prescription.repRange?.[0]}–${item.prescription.repRange?.[1]} חזרות`}</p>
                <small>מנוחה {item.prescription.restSeconds} שנ׳</small>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

function Progress({ profile }) {
  return (
    <main className="screen">
      <div className="screen-heading"><p className="eyebrow">שקילות</p><h1>התקדמות</h1><p>ב־PUMP 3 הנתונים יוצגו מהיסטוריית השקילות האמיתית.</p></div>
      <section className="weight-hero">
        <span>משקל נוכחי</span><strong>{profile.weightKg} ק״ג</strong><small>יעד: {profile.targetWeightKg} ק״ג</small>
      </section>
      <section className="section-card muted-card">
        <h2>שקילה שבועית</h2>
        <p>השקילה הבאה תיפתח ביום שהוגדר לחשבון. המסך בנוי כך שלא ימציא נקודות היסטוריה שאין במסד הנתונים.</p>
      </section>
    </main>
  );
}

export default function App() {
  const [active, setActive] = useState('today');
  const dateKey = new Date().toISOString().slice(0, 10);
  const plan = useMemo(() => buildPersonalizedPlan(DEMO_PROFILE, { dateKey }), [dateKey]);

  let content;
  if (active === 'nutrition') content = <Nutrition nutrition={plan.nutrition} />;
  else if (active === 'training') content = <Training training={plan.training} sex={plan.profile.sex} />;
  else if (active === 'progress') content = <Progress profile={plan.profile} />;
  else content = <Today plan={plan} go={setActive} />;

  return (
    <div className="app-shell">
      <Header profile={plan.profile} />
      {content}
      <BottomNav active={active} onChange={setActive} />
    </div>
  );
}
