import { Mic, Send, X } from 'lucide-react';
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
        <button type="button" className="voice-recording__cancel" onClick={cancel} aria-label="Yozishni bekor qilish">
          <X size={16} strokeWidth={2} />
        </button>
        <span className="voice-recording__dot" />
        <span className="voice-recording__time">{formatDuration(durationSec)}</span>
        <button type="button" className="composer__mic composer__mic--active" onClick={handleToggle} aria-label="Yuborish">
          <Send size={19} strokeWidth={2} />
        </button>
      </div>
    );
  }

  return (
    <button type="button" className="composer__mic" onClick={handleToggle} disabled={disabled} aria-label="Ovozli xabar">
      <Mic size={22} strokeWidth={1.9} />
    </button>
  );
}
