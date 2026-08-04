import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';

export function LoginPage() {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    if (!username.trim()) return;

    setIsSubmitting(true);
    setError('');
    try {
      await login(username);
      navigate('/chats', { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Kirishda xatolik yuz berdi');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-logo">
        <svg viewBox="0 0 24 24" width="72" height="72" fill="currentColor">
          <path d="M12 0a12 12 0 1 0 0 24 12 12 0 0 0 0-24Zm5.57 8.16-1.9 8.95c-.14.63-.52.78-1.05.49l-2.9-2.14-1.4 1.35c-.16.16-.29.29-.6.29l.21-3 5.5-4.97c.24-.21-.05-.33-.37-.12l-6.8 4.28-2.93-.92c-.64-.2-.65-.64.13-.94l11.44-4.41c.53-.19 1 .13.83.94Z" />
        </svg>
      </div>
      <h1>Telegram Clone</h1>
      <p className="login-subtitle">Ismingizni kiriting va suhbatlashishni boshlang</p>

      <form className="login-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Ismingiz"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          maxLength={40}
          autoFocus
        />
        {error && <p className="login-error">{error}</p>}
        <button type="submit" disabled={isSubmitting || !username.trim()}>
          {isSubmitting ? 'Kirilmoqda...' : 'Davom etish'}
        </button>
      </form>
    </div>
  );
}
