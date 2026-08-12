import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';

export function RegisterPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!username.trim()) return setError('Username shart');
    if (!password || password.length < 6) return setError('Password kamida 6 ta belgi bo‘lishi kerak');

    setIsSubmitting(true);
    try {
      await register({
        username: username.trim(),
        password,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim() || null,
      });
      navigate('/chats', { replace: true });
    } catch (err) {
      setError(err.response?.data?.error || 'Ro‘yxatdan o‘tishda xatolik yuz berdi');
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
      <p className="login-subtitle">Yangi hisob yarating</p>

      <form className="login-form" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          maxLength={40}
          autoFocus
          autoComplete="username"
        />
        <input
          type="password"
          placeholder="Password (kamida 6 ta belgi)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="new-password"
        />
        <input
          type="text"
          placeholder="First name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          autoComplete="given-name"
        />
        <input
          type="text"
          placeholder="Last name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          autoComplete="family-name"
        />
        <input
          type="text"
          placeholder="Phone (ixtiyoriy)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          autoComplete="tel"
        />

        {error && <p className="login-error">{error}</p>}

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Jarayon...' : 'Ro‘yxatdan o‘tish'}
        </button>
      </form>

      <p className="login-footer">
        Hisobingiz bormi?{' '}
        <Link to="/login" className="login-footer__link">Kirish</Link>
      </p>
    </div>
  );
}
