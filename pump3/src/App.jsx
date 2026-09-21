import { useMemo, useState } from 'react';
import { buildPersonalizedPlan } from './personalization/engine.js';
import { DEMO_PROFILE } from './demo-profile.js';
import { Header, BottomNav } from './app/AppChrome.jsx';
import { TodayScreen, NutritionScreen, TrainingScreen, ProgressScreen } from './app/screens.jsx';
import AuthScreen from './app/AuthScreen.jsx';
import OnboardingScreen from './app/OnboardingScreen.jsx';
import { useSession } from './app/useSession.js';
import { usePumpProfile } from './app/usePumpProfile.js';
import { useDailyState } from './app/useDailyState.js';

function BootScreen({ title = 'טוען את PUMP…', detail = 'בודק את החשבון והתוכנית שלך.' }) {
  return <main className="boot-screen"><div className="boot-card"><div className="auth-logo"><span>♥</span><b>PUMP</b></div><h1>{title}</h1><p>{detail}</p><div className="boot-pulse" /></div></main>;
}

function ConnectedApp({ inputProfile, userId = null, mode = 'connected' }) {
  const [active, setActive] = useState('today');
  const dateKey = new Date().toISOString().slice(0, 10);
  const plan = useMemo(() => buildPersonalizedPlan(inputProfile, { dateKey }), [inputProfile, dateKey]);
  const persisted = useDailyState(userId, dateKey);
  const daily = userId ? persisted : { status: 'ready', meals: {}, workout: {}, weights: [], setMealStatus: async () => {}, completeWorkout: async () => {}, addWeight: async () => {} };

  if (userId && daily.status === 'loading') return <BootScreen title="טוען את היום שלך…" detail="מסנכרן ארוחות, אימון ושקילות." />;
  if (userId && daily.status === 'error') return <BootScreen title="לא הצלחנו לטעון את נתוני היום" detail={daily.error?.message || 'נסה שוב בעוד רגע.'} />;

  let content;
  if (active === 'nutrition') content = <NutritionScreen nutrition={plan.nutrition} mealState={daily.meals} onMealStatus={daily.setMealStatus} />;
  else if (active === 'training') content = <TrainingScreen training={plan.training} sex={plan.profile.sex} workoutState={daily.workout} onCompleteWorkout={daily.completeWorkout} />;
  else if (active === 'progress') content = <ProgressScreen profile={plan.profile} weights={daily.weights} onAddWeight={daily.addWeight} />;
  else content = <TodayScreen plan={plan} daily={daily} go={setActive} />;

  return (
    <div className="app-shell" data-runtime={mode}>
      <Header profile={plan.profile} />
      {content}
      <BottomNav active={active} onChange={setActive} />
    </div>
  );
}

function AuthenticatedApp({ session }) {
  const userId = session.user.id;
  const profileState = usePumpProfile(userId);

  if (profileState.status === 'loading' || profileState.status === 'idle') return <BootScreen />;
  if (profileState.status === 'saving') return <BootScreen title="שומר את התוכנית…" detail="מייצר את הפרופיל האישי שלך." />;
  if (profileState.status === 'error') return <BootScreen title="לא הצלחנו לטעון את הפרופיל" detail={profileState.error?.message || 'נסה לרענן את האפליקציה.'} />;
  if (profileState.status === 'missing' || !profileState.record?.onboardingComplete) {
    return <OnboardingScreen userId={userId} onSave={profileState.save} saving={profileState.status === 'saving'} error={profileState.error} />;
  }
  return <ConnectedApp inputProfile={profileState.record.profile} userId={userId} />;
}

export default function App() {
  const sessionState = useSession();
  if (sessionState.status === 'demo') return <ConnectedApp inputProfile={DEMO_PROFILE} mode="demo" />;
  if (sessionState.status === 'loading') return <BootScreen />;
  if (sessionState.status === 'anonymous') return <AuthScreen />;
  if (sessionState.status === 'error') return <BootScreen title="שגיאה בהתחברות" detail={sessionState.error?.message || 'לא הצלחנו לבדוק את מצב החשבון.'} />;
  return <AuthenticatedApp session={sessionState.session} />;
}
