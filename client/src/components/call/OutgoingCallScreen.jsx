import { useCall } from '../../hooks/useCall.js';
import { Avatar } from '../common/Avatar.jsx';

export function OutgoingCallScreen() {
  const { otherUser, callType, endCall } = useCall();
  if (!otherUser) return null;

  return (
    <div className="call-overlay call-overlay--outgoing">
      <div className="call-overlay__user">
        <Avatar userId={otherUser.id} name={otherUser.displayName} size={110} />
        <h2>{otherUser.displayName}</h2>
        <p>{callType === 'video' ? 'Video qo‘ng‘iroq qilinmoqda...' : 'Chaqirilmoqda...'}</p>
      </div>
      <button className="call-btn call-btn--reject call-btn--center" onClick={endCall} aria-label="Bekor qilish">
        <svg viewBox="0 0 24 24" width="28" height="28" fill="#fff" style={{ transform: 'rotate(135deg)' }}>
          <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
        </svg>
      </button>
    </div>
  );
}
