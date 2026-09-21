import { useState } from 'react';

const initial = {
  sex: 'male', age: 30, heightCm: 170, weightKg: 70, targetWeightKg: 70,
  goal: 'maintain', activity: 'light', trainingLevel: 'beginner', trainingPlace: 'home', trainingDays: 3,
  personalization: {
    foodStyle: 'regular', equipment: ['bodyweight'], trainingFocus: 'balanced', limitation: 'none', sessionMinutes: 30,
  },
};

function number(value) {
  return Number(value);
}

export default function OnboardingScreen({ userId, onSave, saving = false, error = null }) {
  const [form, setForm] = useState(initial);
  const [step, setStep] = useState(0);

  function patch(values) { setForm((current) => ({ ...current, ...values })); }
  function patchPersonalization(values) { setForm((current) => ({ ...current, personalization: { ...current.personalization, ...values } })); }

  async function submit(event) {
    event.preventDefault();
    await onSave({ ...form, id: userId });
  }

  return (
    <main className="onboarding-screen">
      <form className="onboarding-card" onSubmit={submit}>
        <div className="onboarding-progress"><span style={{ width: `${((step + 1) / 3) * 100}%` }} /></div>
        <p className="eyebrow">שלב {step + 1} מתוך 3</p>
        {step === 0 && <>
          <h1>מתחילים מהבסיס.</h1><p>הנתונים האלה משמשים ישירות לחישוב היעדים שלך.</p>
          <div className="form-grid two">
            <label>מין<select value={form.sex} onChange={(e) => patch({ sex: e.target.value })}><option value="male">גבר</option><option value="female">אישה</option></select></label>
            <label>גיל<input type="number" min="16" max="90" value={form.age} onChange={(e) => patch({ age: number(e.target.value) })} /></label>
            <label>גובה בס״מ<input type="number" min="130" max="230" value={form.heightCm} onChange={(e) => patch({ heightCm: number(e.target.value) })} /></label>
            <label>משקל נוכחי<input type="number" min="35" max="300" step="0.1" value={form.weightKg} onChange={(e) => patch({ weightKg: number(e.target.value) })} /></label>
          </div>
        </>}
        {step === 1 && <>
          <h1>מה היעד שלך?</h1><p>המנוע יתאים קלוריות וחלבון לכיוון שבחרת.</p>
          <div className="choice-grid">
            {[['lose','ירידה'],['maintain','שמירה'],['gain','עלייה']].map(([value,label]) => <button type="button" key={value} className={`choice-button ${form.goal === value ? 'active' : ''}`} onClick={() => patch({ goal: value })}>{label}</button>)}
          </div>
          <label>משקל יעד<input type="number" min="35" max="300" step="0.1" value={form.targetWeightKg} onChange={(e) => patch({ targetWeightKg: number(e.target.value) })} /></label>
          <label>רמת פעילות<select value={form.activity} onChange={(e) => patch({ activity: e.target.value })}><option value="sedentary">מעט תנועה</option><option value="light">קלה</option><option value="medium">בינונית</option><option value="high">גבוהה</option></select></label>
          <label>סגנון תזונה<select value={form.personalization.foodStyle} onChange={(e) => patchPersonalization({ foodStyle: e.target.value })}><option value="regular">רגיל</option><option value="vegetarian">צמחוני</option><option value="vegan">טבעוני</option></select></label>
        </>}
        {step === 2 && <>
          <h1>איך אתה מתאמן?</h1><p>מכאן נבנית תוכנית האימונים עצמה.</p>
          <label>מקום אימון<select value={form.trainingPlace} onChange={(e) => patch({ trainingPlace: e.target.value })}><option value="home">בית</option><option value="gym">חדר כושר</option><option value="bodyweight">משקל גוף</option></select></label>
          <div className="form-grid two">
            <label>אימונים בשבוע<input type="number" min="2" max="6" value={form.trainingDays} onChange={(e) => patch({ trainingDays: number(e.target.value) })} /></label>
            <label>דקות לאימון<select value={form.personalization.sessionMinutes} onChange={(e) => patchPersonalization({ sessionMinutes: number(e.target.value) })}><option value="20">20</option><option value="30">30</option><option value="45">45</option><option value="60">60</option></select></label>
          </div>
          <label>רמה<select value={form.trainingLevel} onChange={(e) => patch({ trainingLevel: e.target.value })}><option value="beginner">מתחיל</option><option value="intermediate">בינוני</option><option value="advanced">מתקדם</option></select></label>
          <label>מגבלה<select value={form.personalization.limitation} onChange={(e) => patchPersonalization({ limitation: e.target.value })}><option value="none">ללא</option><option value="knee">ברך</option><option value="shoulder">כתף</option><option value="back">גב</option></select></label>
        </>}
        {error && <div className="form-message error">{error.message || 'שמירת הפרופיל נכשלה.'}</div>}
        <div className="onboarding-actions">
          {step > 0 && <button type="button" className="secondary-button" onClick={() => setStep(step - 1)}>חזרה</button>}
          {step < 2 ? <button type="button" className="primary-button" onClick={() => setStep(step + 1)}>המשך</button> : <button className="primary-button" disabled={saving}>{saving ? 'שומר…' : 'בנה לי תוכנית'}</button>}
        </div>
      </form>
    </main>
  );
}
