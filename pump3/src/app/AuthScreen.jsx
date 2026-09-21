import { useState } from 'react';
import { signInWithPassword, signUpWithPassword } from '../services/auth.js';

export default function AuthScreen() {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');

  async function submit(event) {
    event.preventDefault();
    setStatus('loading');
    setMessage('');
    try {
      if (mode === 'login') {
        await signInWithPassword(email.trim(), password);
        setStatus('success');
      } else {
        const result = await signUpWithPassword(email.trim(), password);
        setStatus('success');
        setMessage(result.session ? 'החשבון נוצר והתחברת.' : 'החשבון נוצר. בדוק את המייל לאישור ההרשמה.');
      }
    } catch (error) {
      setStatus('error');
      setMessage(error?.message || 'לא הצלחנו לבצע את הפעולה.');
    }
  }

  return (
    <main className="auth-screen">
      <section className="auth-card">
        <div className="auth-logo"><span>♥</span><b>PUMP</b></div>
        <p className="eyebrow">PUMP 3</p>
        <h1>{mode === 'login' ? 'מתחברים וממשיכים.' : 'פותחים חשבון.'}</h1>
        <p>ההתחברות מסתיימת לפני שהאפליקציה מחליטה לאיזה מסך להיכנס — בלי הבהוב של שאלון.</p>
        <form onSubmit={submit} className="auth-form">
          <label>אימייל<input required type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} /></label>
          <label>סיסמה<input required minLength={6} type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} value={password} onChange={(e) => setPassword(e.target.value)} /></label>
          <button className="primary-button" disabled={status === 'loading'}>{status === 'loading' ? 'רגע…' : mode === 'login' ? 'התחברות' : 'הרשמה'}</button>
        </form>
        {message && <div className={`form-message ${status === 'error' ? 'error' : ''}`}>{message}</div>}
        <button className="text-button auth-switch" onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setMessage(''); }}>
          {mode === 'login' ? 'אין חשבון? הרשמה' : 'כבר יש חשבון? התחברות'}
        </button>
      </section>
    </main>
  );
}
