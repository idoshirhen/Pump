import { createSupabaseRestClient, getStoredSession } from '../data/supabaseRestClient.js';
import { createNutritionRepository } from '../data/nutritionRepository.js';
import { calculateNutritionTargets } from '../domain/targets.js';
import { mountPumpNutrition } from './nutritionRuntime.js';

const SUPABASE_URL = 'https://aebysqjymsjepvslidjl.supabase.co';
const SUPABASE_KEY = 'sb_publishable_DlOsq6M0Wrwl_9lIH1qvQQ_bKJxwgNg';
const authKey = 'sb-pump-auth-token';
const day = () => new Intl.DateTimeFormat('en-CA').format(new Date());

const writeSession = (session) => localStorage.setItem(authKey, JSON.stringify({ currentSession: session }));
const appSession = () => {
  try { const saved = JSON.parse(localStorage.getItem(authKey) || '{}').currentSession; if (saved?.access_token && saved?.user?.id) return saved; } catch (_) {}
  return getStoredSession();
};
const clearSessions = () => {
  const keys = [];
  for (let index = 0; index < localStorage.length; index += 1) { const key = localStorage.key(index); if (key?.includes('auth-token')) keys.push(key); }
  keys.forEach((key) => localStorage.removeItem(key));
};

async function authRequest(path, body) {
  const response = await fetch(`${SUPABASE_URL}/auth/v1/${path}`, { method: 'POST', headers: { apikey: SUPABASE_KEY, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const data = await response.json();
  if (!response.ok) throw new Error(data.msg || data.error_description || 'לא הצלחנו להתחבר.');
  return data;
}

function authScreen(root, onAuthenticated) {
  let signup = false;
  const render = () => {
    root.innerHTML = `<main class="pump-auth"><div class="pump-brand"><i>♥</i>PUMP</div><h1>${signup ? 'בואו נתחיל.' : 'חוזרים למסלול.'}</h1><p>${signup ? 'פותחים חשבון כדי לשמור את ההתקדמות שלך.' : 'התחברו כדי להמשיך בדיוק מאיפה שעצרתם.'}</p><form><input name="email" type="email" autocomplete="email" placeholder="אימייל" required><input name="password" type="password" autocomplete="current-password" placeholder="סיסמה" minlength="6" required><p class="pump-error" hidden></p><button class="pump-primary">${signup ? 'פתיחת חשבון' : 'כניסה'}</button></form><button class="pump-link">${signup ? 'כבר יש לי חשבון' : 'אין לי חשבון עדיין'}</button></main>`;
    root.querySelector('.pump-link').onclick = () => { signup = !signup; render(); };
    root.querySelector('form').onsubmit = async (event) => {
      event.preventDefault(); const form = new FormData(event.currentTarget); const error = root.querySelector('.pump-error');
      try { const data = await authRequest(signup ? 'signup' : 'token?grant_type=password', { email: form.get('email'), password: form.get('password') }); if (!data.access_token) throw new Error('בדקו את תיבת המייל לאישור החשבון ואז התחברו.'); writeSession(data); onAuthenticated(); } catch (reason) { error.hidden = false; error.textContent = reason.message; }
    };
  };
  render();
}

async function todayScreen(root, client) {
  root.innerHTML = '<p class="pump-loading">טוענים את היום שלך…</p>';
  const userId = client.userId();
  const [profiles, entries] = await Promise.all([client.request(`profiles?select=*&id=eq.${userId}`), client.request(`food_entries?select=calories,protein&user_id=eq.${userId}&date=eq.${day()}`)]);
  const profile = profiles[0]; if (!profile) throw new Error('לא נמצא פרופיל.');
  const target = calculateNutritionTargets(profile); const eaten = entries.reduce((sum, item) => sum + Number(item.calories), 0); const protein = entries.reduce((sum, item) => sum + Number(item.protein), 0);
  root.innerHTML = `<section class="pump-screen"><p class="kicker">היום שלך</p><h1>${profile.name || 'היי'},<br>ממשיכים בקצב שלך.</h1><p class="subtitle">יעד יומי ברור, בלי להסתבך.</p><div class="pump-today-grid"><article class="pump-stat"><small>נאכלו</small><b>${eaten} קל׳</b></article><article class="pump-stat"><small>נותרו</small><b>${Math.max(0,target.calories-eaten)} קל׳</b></article><article class="pump-stat"><small>חלבון</small><b>${protein}/${target.protein} ג׳</b></article><article class="pump-stat"><small>יעד יומי</small><b>${target.calories} קל׳</b></article></div></section>`;
}

export function startPumpApp(root) {
  const start = async () => {
    const session = appSession();
    if (!session) return authScreen(root, start);
    const client = createSupabaseRestClient({ url: SUPABASE_URL, publishableKey: SUPABASE_KEY, getSession: appSession });
    const repository = createNutritionRepository({ request: client.request });
    let screen = 'today';
    root.innerHTML = '<main class="pump-shell"><header class="pump-header"><div class="pump-brand"><i>♥</i>PUMP</div><button>התנתקות</button></header><div id="pump-screen"></div><nav class="pump-nav"><button data-screen="today">היום</button><button data-screen="food">תזונה</button><button data-screen="training">כושר</button><button data-screen="progress">מעקב</button></nav></main>';
    const outlet = root.querySelector('#pump-screen'); const nav = root.querySelector('.pump-nav');
    root.querySelector('.pump-header button').onclick = () => { clearSessions(); start(); };
    const show = async () => { nav.querySelectorAll('button').forEach((button) => button.classList.toggle('active', button.dataset.screen === screen)); try { if (screen === 'today') await todayScreen(outlet, client); else if (screen === 'food') await mountPumpNutrition({ root: outlet, notify: (message) => window.alert(message) }); else outlet.innerHTML = `<section class="pump-screen"><p class="kicker">${screen === 'training' ? 'כושר' : 'מעקב'}</p><h1>בונים את זה<br>בשלב הבא.</h1><p class="pump-placeholder">המסך החדש יתמקד קודם בתזונה כדי שהשינוי שביקשת יהיה יציב. אחר כך נחבר גם את אימונים ומעקב לאותה תשתית.</p></section>`; } catch (error) { outlet.innerHTML = `<p class="pump-error">${error.message}</p>`; } };
    nav.onclick = (event) => { const button = event.target.closest('[data-screen]'); if (!button) return; screen = button.dataset.screen; show(); }; show();
  };
  start();
}
