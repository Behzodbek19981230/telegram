import { useMediaRecorder } from '../../hooks/useMediaRecorder.js';
import { formatDuration } from '../../utils/formatTime.js';

export function VoiceRecorderButton({ onRecorded, disabled }) {
  const { isRecording, durationSec, start, stop, cancel } = useMediaRecorder({ audio: true });

  async function handleToggle() {
    if (disabled) return;
    if (!isRecording) {
      try {
        await start();
      } catch {
        alert('Mikrofonga ruxsat berilmadi');
      }
      return;
    }

    const result = await stop();
    if (result && result.durationSec > 0.4) {
      onRecorded(result);
    }
  }

  if (isRecording) {
    return (
      <div className="voice-recording">
        <button type="button" className="voice-recording__cancel" onClick={cancel} aria-label="Bekor qilish">
          ✕
        </button>
        <span className="voice-recording__dot" />
        <span className="voice-recording__time">{formatDuration(durationSec)}</span>
        <button type="button" className="composer__mic composer__mic--active" onClick={handleToggle} aria-label="Yuborish">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M2 21l21-9L2 3v7l15 2-15 2z" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <button type="button" className="composer__mic" onClick={handleToggle} disabled={disabled} aria-label="Ovozli xabar">
      <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
        <path d="M12 15a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3z" />
        <path d="M19 11a7 7 0 0 1-14 0" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M12 18v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </button>
  );
}
