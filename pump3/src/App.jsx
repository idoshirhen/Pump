import { useMemo, useState } from 'react';
import { buildPersonalizedPlan } from './personalization/engine.js';
import { DEMO_PROFILE } from './demo-profile.js';
import { Header, BottomNav } from './app/AppChrome.jsx';
import { TodayScreen, NutritionScreen, TrainingScreen, ProgressScreen } from './app/screens.jsx';

export default function App() {
  const [active, setActive] = useState('today');
  const dateKey = new Date().toISOString().slice(0, 10);
  const plan = useMemo(() => buildPersonalizedPlan(DEMO_PROFILE, { dateKey }), [dateKey]);

  let content;
  if (active === 'nutrition') content = <NutritionScreen nutrition={plan.nutrition} />;
  else if (active === 'training') content = <TrainingScreen training={plan.training} sex={plan.profile.sex} />;
  else if (active === 'progress') content = <ProgressScreen profile={plan.profile} />;
  else content = <TodayScreen plan={plan} go={setActive} />;

  return (
    <div className="app-shell">
      <Header profile={plan.profile} />
      {content}
      <BottomNav active={active} onChange={setActive} />
    </div>
  );
}
