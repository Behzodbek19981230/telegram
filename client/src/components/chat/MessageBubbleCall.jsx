import { Phone, PhoneIncoming, PhoneMissed, Video } from 'lucide-react';
import { formatCallDetails } from '../../utils/formatCallMessage.js';

function CallIcon({ isVideo, variant }) {
  const size = 18;
  const strokeWidth = 2;

  if (variant === 'danger') {
    return isVideo ? <Video size={size} strokeWidth={strokeWidth} /> : <PhoneMissed size={size} strokeWidth={strokeWidth} />;
  }
  if (variant === 'success') {
    return isVideo ? <Video size={size} strokeWidth={strokeWidth} /> : <PhoneIncoming size={size} strokeWidth={strokeWidth} />;
  }
  return isVideo ? <Video size={size} strokeWidth={strokeWidth} /> : <Phone size={size} strokeWidth={strokeWidth} />;
}

export function MessageBubbleCall({ message, isOwn }) {
  const { title, subtitle, variant, isVideo } = formatCallDetails(message, { isOwn });

  return (
    <div className={`call-log call-log--${variant}`}>
      <span className="call-log__icon">
        <CallIcon isVideo={isVideo} variant={variant} />
      </span>
      <div className="call-log__body">
        <span className="call-log__title">{title}</span>
        <span className="call-log__subtitle">{subtitle}</span>
      </div>
    </div>
  );
}
