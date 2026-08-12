import { Phone, PhoneOff } from 'lucide-react';
import { useCall } from '../../hooks/useCall.js';
import { Avatar } from '../common/Avatar.jsx';

export function IncomingCallModal() {
  const { otherUser, callType, acceptCall, rejectCall } = useCall();
  if (!otherUser) return null;

  return (
    <div className="call-overlay call-overlay--incoming">
      <div className="call-overlay__user">
        <Avatar userId={otherUser.id} name={otherUser.displayName} avatarUrl={otherUser.avatarUrl} size={104} />
        <h2>{otherUser.displayName}</h2>
        <p>{callType === 'video' ? 'Video qo‘ng‘iroq qilyapti...' : 'Ovozli qo‘ng‘iroq qilyapti...'}</p>
      </div>
      <div className="call-overlay__actions">
        <button className="call-btn call-btn--reject" onClick={rejectCall} aria-label="Rad etish">
          <PhoneOff size={26} strokeWidth={2} />
        </button>
        <button className="call-btn call-btn--accept" onClick={acceptCall} aria-label="Qabul qilish">
          <Phone size={26} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
