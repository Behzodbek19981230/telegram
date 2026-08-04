import { useCall } from '../../hooks/useCall.js';
import { Avatar } from '../common/Avatar.jsx';

export function IncomingCallModal() {
  const { otherUser, callType, acceptCall, rejectCall } = useCall();
  if (!otherUser) return null;

  return (
    <div className="call-overlay call-overlay--incoming">
      <div className="call-overlay__user">
        <Avatar userId={otherUser.id} name={otherUser.displayName} size={104} />
        <h2>{otherUser.displayName}</h2>
        <p>{callType === 'video' ? 'Video qo‘ng‘iroq qilyapti...' : 'Ovozli qo‘ng‘iroq qilyapti...'}</p>
      </div>
      <div className="call-overlay__actions">
        <button className="call-btn call-btn--reject" onClick={rejectCall} aria-label="Rad etish">
          <svg viewBox="0 0 24 24" width="28" height="28" fill="#fff" style={{ transform: 'rotate(135deg)' }}>
            <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
          </svg>
        </button>
        <button className="call-btn call-btn--accept" onClick={acceptCall} aria-label="Qabul qilish">
          <svg viewBox="0 0 24 24" width="26" height="26" fill="#fff">
            <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
