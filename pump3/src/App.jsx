import { useEffect, useMemo, useState } from 'react';
import { buildPersonalizedPlan } from './personalization/engine.js';
import { DEMO_PROFILE } from './demo-profile.js';
import { Header, BottomNav } from './app/AppChrome.jsx';
import { TodayScreen, NutritionScreen, TrainingScreen, ProgressScreen, FoodCaptureScreen, AccountScreen } from './app/screens.jsx';
import AuthScreen from './app/AuthScreen.jsx';
import OnboardingScreen from './app/OnboardingScreen.jsx';
import { useSession } from './app/useSession.js';
import { usePumpProfile } from './app/usePumpProfile.js';
import { useDailyState } from './app/useDailyState.js';
import { useMealFeedback } from './app/useMealFeedback.js';

function BootScreen({ title = 'טוען את PUMP…', detail = 'בודק את החשבון והתוכנית שלך.' }) {
  return <main className="boot-screen"><div className="boot-card"><div className="auth-logo"><span>♥</span><b>PUMP</b></div><h1>{title}</h1><p>{detail}</p><div className="boot-pulse" /></div></main>;
}

function ConnectedApp({ inputProfile, userId = null, mode = 'connected' }) {
  const [active, setActive] = useState('today');
  const dateKey = new Date().toISOString().slice(0, 10);
  const persisted = useDailyState(userId, dateKey);
  const mealFeedback = useMealFeedback(userId);
  const profileWithFeedback = useMemo(() => ({ ...inputProfile, mealFeedback: mealFeedback.items }), [inputProfile, mealFeedback.items]);
  const plan = useMemo(() => buildPersonalizedPlan(profileWithFeedback, { dateKey }), [profileWithFeedback, dateKey]);
  const daily = userId ? persisted : {
    status: 'ready', meals: {}, workout: {}, manualFoods: [], weights: [], saving: false,
    setMealStatus: async () => {}, replaceMeal: async () => {}, setMealFeedback: async () => {},
    completeWorkout: async () => {}, toggleExercise: async () => {}, replaceExercise: async () => {},
    addManualFood: async () => {}, removeManualFood: async () => {}, addWeight: async () => {},
  };

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.querySelector('.screen')?.scrollTo?.(0, 0);
  }, [active]);

  if (userId && (daily.status === 'loading' || mealFeedback.status === 'loading')) {
    return <BootScreen title="טוען את היום שלך…" detail="מסנכרן ארוחות, העדפות, אימון ושקילות." />;
  }
  if (userId && daily.status === 'error' && !daily.meals) return <BootScreen title="לא הצלחנו לטעון את נתוני היום" detail={daily.error?.message || 'נסה שוב בעוד רגע.'} />;
  if (userId && mealFeedback.status === 'error') return <BootScreen title="לא הצלחנו לטעון את העדפות האוכל" detail={mealFeedback.error?.message || 'נסה שוב בעוד רגע.'} />;

  const handleMealFeedback = async (slot, uiFeedback, recipeId) => {
    const persistentFeedback = uiFeedback === 'like' ? 'liked' : 'not_for_me';
    await Promise.all([
      daily.setMealFeedback(slot, uiFeedback),
      userId ? mealFeedback.setFeedback(recipeId, persistentFeedback) : Promise.resolve(),
    ]);
  };

  let content;
  if (active === 'nutrition') content = <NutritionScreen nutrition={plan.nutrition} eligibleMeals={plan.audit.nutritionCoverage} mealState={daily.meals} onMealStatus={daily.setMealStatus} onReplaceMeal={daily.replaceMeal} onFeedback={handleMealFeedback} />;
  else if (active === 'training') content = <TrainingScreen training={plan.training} sex={plan.profile.sex} workoutState={daily.workout} onCompleteWorkout={daily.completeWorkout} onToggleExercise={daily.toggleExercise} onReplaceExercise={daily.replaceExercise} />;
  else if (active === 'progress') content = <ProgressScreen profile={plan.profile} weights={daily.weights} onAddWeight={daily.addWeight} />;
  else if (active === 'camera') content = <FoodCaptureScreen items={daily.manualFoods} onAddFood={daily.addManualFood} onRemoveFood={daily.removeManualFood} saving={daily.saving} />;
  else if (active === 'account') content = <AccountScreen profile={plan.profile} connected={Boolean(userId)} />;
  else content = <TodayScreen plan={plan} daily={daily} go={setActive} />;

  const globalError = daily.error || mealFeedback.error;
  return <div className="app-shell" data-runtime={mode}><Header profile={plan.profile} />{globalError && <div className="global-error" role="alert">השמירה האחרונה נכשלה. הנתונים המקומיים מוצגים, נסה שוב.</div>}{content}<BottomNav active={active} onChange={setActive} /></div>;
}

function AuthenticatedApp({ session }) {
  const userId = session.user.id;
  const profileState = usePumpProfile(userId);
  if (profileState.status === 'loading' || profileState.status === 'idle') return <BootScreen />;
  if (profileState.status === 'saving') return <BootScreen title="שומר את התוכנית…" detail="מייצר את הפרופיל האישי שלך." />;
  if (profileState.status === 'error') return <BootScreen title="לא הצלחנו לטעון את הפרופיל" detail={profileState.error?.message || 'נסה לרענן את האפליקציה.'} />;
  if (profileState.status === 'missing' || !profileState.record?.onboardingComplete) return <OnboardingScreen userId={userId} onSave={profileState.save} saving={profileState.status === 'saving'} error={profileState.error} />;
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
