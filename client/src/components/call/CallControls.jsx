import { Mic, MicOff, Video, VideoOff, PhoneOff } from 'lucide-react';
import { useCall } from '../../hooks/useCall.js';

export function CallControls() {
  const { callType, isMuted, isCameraOff, toggleMute, toggleCamera, endCall } = useCall();

  return (
    <div className="call-controls">
      <button
        type="button"
        className={`call-controls__btn ${isMuted ? 'call-controls__btn--active' : ''}`}
        onClick={toggleMute}
        aria-label={isMuted ? 'Mikrofonni yoqish' : 'Mikrofonni o‘chirish'}
      >
        {isMuted ? <MicOff size={22} strokeWidth={2} /> : <Mic size={22} strokeWidth={2} />}
      </button>

      {callType === 'video' && (
        <button
          type="button"
          className={`call-controls__btn ${isCameraOff ? 'call-controls__btn--active' : ''}`}
          onClick={toggleCamera}
          aria-label={isCameraOff ? 'Kamerani yoqish' : 'Kamerani o‘chirish'}
        >
          {isCameraOff ? <VideoOff size={22} strokeWidth={2} /> : <Video size={22} strokeWidth={2} />}
        </button>
      )}

      <button type="button" className="call-controls__btn call-controls__btn--end" onClick={endCall} aria-label="Tugatish">
        <PhoneOff size={22} strokeWidth={2} />
      </button>
    </div>
  );
}
