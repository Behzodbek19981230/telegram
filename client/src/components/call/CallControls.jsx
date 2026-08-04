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
        {isMuted ? (
          <svg viewBox="0 0 24 24" width="22" height="22" fill="#fff">
            <path d="M19 11h-1.7a5.3 5.3 0 0 1-.6 2.3l1.2 1.2A7.3 7.3 0 0 0 19 11zM4.3 3 3 4.3l5 5V11a4 4 0 0 0 6.1 3.4l1.2 1.2A5.9 5.9 0 0 1 12 17a5.3 5.3 0 0 1-5.3-5.3H5a7 7 0 0 0 6 6.9V21h2v-2.1a7 7 0 0 0 2.6-.8l3.1 3.1 1.3-1.3L4.3 3zM12 14a2 2 0 0 0 2-2v-.2l-2.8-2.8V12a2 2 0 0 0 .8 2z" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" width="22" height="22" fill="#fff">
            <path d="M12 15a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3z" />
            <path d="M19 11a7 7 0 0 1-14 0H3a9 9 0 0 0 8 8.9V22h2v-2.1A9 9 0 0 0 21 11h-2z" />
          </svg>
        )}
      </button>

      {callType === 'video' && (
        <button
          type="button"
          className={`call-controls__btn ${isCameraOff ? 'call-controls__btn--active' : ''}`}
          onClick={toggleCamera}
          aria-label={isCameraOff ? 'Kamerani yoqish' : 'Kamerani o‘chirish'}
        >
          {isCameraOff ? (
            <svg viewBox="0 0 24 24" width="22" height="22" fill="#fff">
              <path d="M4.3 3 3 4.3l3 3v9.2A1.5 1.5 0 0 0 4.5 18H15l2.7 2.7 1.3-1.3L4.3 3zM17 10.5V15l4-2v-6l-4 2V8.5a1.5 1.5 0 0 0-1.5-1.5H8.4l1.7 1.7H15.5a1 1 0 0 1 1 1v.8z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" width="22" height="22" fill="#fff">
              <path d="M17 10.5V8.5A1.5 1.5 0 0 0 15.5 7h-11A1.5 1.5 0 0 0 3 8.5v7A1.5 1.5 0 0 0 4.5 17h11a1.5 1.5 0 0 0 1.5-1.5v-2l4 2v-6l-4 2z" />
            </svg>
          )}
        </button>
      )}

      <button type="button" className="call-controls__btn call-controls__btn--end" onClick={endCall} aria-label="Tugatish">
        <svg viewBox="0 0 24 24" width="24" height="24" fill="#fff" style={{ transform: 'rotate(135deg)' }}>
          <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
        </svg>
      </button>
    </div>
  );
}
