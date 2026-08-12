import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Pencil, X, Camera, QrCode } from 'lucide-react';
import { BackButton } from '../components/common/BackButton.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { Avatar } from '../components/common/Avatar.jsx';
import { updateProfile } from '../api/users.api.js';
import { uploadFile } from '../api/upload.api.js';

function formatPhone(phone) {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('998')) {
    return `+${digits.slice(0, 3)} ${digits.slice(3, 5)} ${digits.slice(5, 8)} ${digits.slice(8, 10)} ${digits.slice(10)}`;
  }
  return phone.startsWith('+') ? phone : `+${phone}`;
}

function formatBirthday(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age -= 1;
  const formatted = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return `${formatted} (${age} years old)`;
}

function toDateInputValue(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
}

export function ProfilePage() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    username: user?.username || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    birthday: toDateInputValue(user?.birthday),
  });

  function openEdit() {
    setForm({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      username: user?.username || '',
      phone: user?.phone || '',
      bio: user?.bio || '',
      birthday: toDateInputValue(user?.birthday),
    });
    setError('');
    setIsEditing(true);
  }

  async function handleAvatarChange(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !file.type.startsWith('image/')) return;

    setIsSaving(true);
    setError('');
    try {
      const { url } = await uploadFile(file);
      const updated = await updateProfile({ avatarUrl: url });
      setUser(updated);
    } catch (err) {
      setError(err.response?.data?.error || 'Avatar yuklashda xatolik');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSave(e) {
    e.preventDefault();
    setIsSaving(true);
    setError('');
    try {
      const updated = await updateProfile({
        firstName: form.firstName,
        lastName: form.lastName,
        username: form.username,
        phone: form.phone || null,
        bio: form.bio || null,
        birthday: form.birthday || null,
      });
      setUser(updated);
      setIsEditing(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Saqlashda xatolik');
    } finally {
      setIsSaving(false);
    }
  }

  const displayName = user?.displayName || user?.username || 'User';
  const statusText = user?.isOnline ? 'online' : 'offline';

  return (
    <div className="page profile-page">
      <header className="profile-header">
        {isEditing ? (
          <button type="button" className="icon-button" onClick={() => setIsEditing(false)} aria-label="Bekor qilish">
            <X size={22} strokeWidth={2} />
          </button>
        ) : (
          <BackButton to="/settings" />
        )}
        <span className="profile-header__spacer" />
        {!isEditing && (
          <button type="button" className="icon-button" onClick={openEdit} aria-label="Tahrirlash">
            <Pencil size={20} strokeWidth={2} />
          </button>
        )}
        <button type="button" className="icon-button" onClick={() => navigate('/settings')} aria-label="Yopish">
          <X size={22} strokeWidth={2} />
        </button>
      </header>

      <div className="page-body profile-body">
        <div className="profile-hero">
          <button
            type="button"
            className="profile-avatar-btn"
            onClick={() => fileInputRef.current?.click()}
            disabled={isSaving}
            aria-label="Avatar yuklash"
          >
            <Avatar userId={user?.id} name={displayName} avatarUrl={user?.avatarUrl} size={120} />
            <span className="profile-avatar-btn__camera">
              <Camera size={16} strokeWidth={2} />
            </span>
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleAvatarChange} />

          <div className="profile-hero__name">
            <h1>{displayName}</h1>
            {user?.isAdmin && <span className="profile-hero__badge">★</span>}
          </div>
          <p className={`profile-hero__status ${user?.isOnline ? 'profile-hero__status--online' : ''}`}>{statusText}</p>
        </div>

        {isEditing ? (
          <form className="profile-form" onSubmit={handleSave}>
            <label className="profile-field">
              <span className="profile-field__label">Ism</span>
              <input value={form.firstName} onChange={(e) => setForm((f) => ({ ...f, firstName: e.target.value }))} />
            </label>
            <label className="profile-field">
              <span className="profile-field__label">Familiya</span>
              <input value={form.lastName} onChange={(e) => setForm((f) => ({ ...f, lastName: e.target.value }))} />
            </label>
            <label className="profile-field">
              <span className="profile-field__label">Username</span>
              <input value={form.username} onChange={(e) => setForm((f) => ({ ...f, username: e.target.value }))} />
            </label>
            <label className="profile-field">
              <span className="profile-field__label">Telefon</span>
              <input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="+998..." />
            </label>
            <label className="profile-field">
              <span className="profile-field__label">Tug‘ilgan kun</span>
              <input type="date" value={form.birthday} onChange={(e) => setForm((f) => ({ ...f, birthday: e.target.value }))} />
            </label>
            <label className="profile-field">
              <span className="profile-field__label">Bio</span>
              <textarea
                value={form.bio}
                onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                rows={3}
                placeholder="O‘zingiz haqingizda..."
              />
            </label>
            {error && <p className="profile-error">{error}</p>}
            <button type="submit" className="profile-save-btn" disabled={isSaving}>
              {isSaving ? 'Saqlanmoqda...' : 'Saqlash'}
            </button>
          </form>
        ) : (
          <div className="profile-info-list">
            {user?.phone && (
              <div className="profile-info-item">
                <span className="profile-info-item__value">{formatPhone(user.phone)}</span>
                <span className="profile-info-item__label">Mobile</span>
              </div>
            )}
            <div className="profile-info-item profile-info-item--username">
              <div className="profile-info-item__row">
                <span className="profile-info-item__value profile-info-item__value--link">@{user?.username}</span>
                <button type="button" className="profile-qr-btn" aria-label="QR kod">
                  <QrCode size={18} strokeWidth={2} />
                </button>
              </div>
              <span className="profile-info-item__label">Username</span>
            </div>
            {user?.bio && (
              <div className="profile-info-item">
                <span className="profile-info-item__value">{user.bio}</span>
                <span className="profile-info-item__label">Bio</span>
              </div>
            )}
            {user?.birthday && (
              <div className="profile-info-item">
                <span className="profile-info-item__value">{formatBirthday(user.birthday)}</span>
                <span className="profile-info-item__label">Birthday</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
