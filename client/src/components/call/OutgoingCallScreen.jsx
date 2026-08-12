import { PhoneOff } from 'lucide-react';
import { useCall } from '../../hooks/useCall.js';
import { Avatar } from '../common/Avatar.jsx';

export function OutgoingCallScreen() {
  const { otherUser, callType, endCall } = useCall();
  if (!otherUser) return null;

  return (
    <div className="call-overlay call-overlay--outgoing">
      <div className="call-overlay__user">
        <Avatar userId={otherUser.id} name={otherUser.displayName} avatarUrl={otherUser.avatarUrl} size={110} />
        <h2>{otherUser.displayName}</h2>
        <p>{callType === 'video' ? 'Video qo‘ng‘iroq qilinmoqda...' : 'Chaqirilmoqda...'}</p>
      </div>
      <button className="call-btn call-btn--reject call-btn--center" onClick={endCall} aria-label="Qo‘ng‘iroqni bekor qilish">
        <PhoneOff size={26} strokeWidth={2} />
      </button>
    </div>
  );
}
