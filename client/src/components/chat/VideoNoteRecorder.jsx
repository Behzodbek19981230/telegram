import { useEffect, useRef, useState } from 'react';
import { X, Send } from 'lucide-react';
import { useMediaRecorder } from '../../hooks/useMediaRecorder.js';
import { formatDuration } from '../../utils/formatTime.js';

const NOTE_SIZE = 220;
const MAX_DURATION = 60;

export function VideoNoteRecorder({ onRecorded, disabled }) {
  const [isOpen, setIsOpen] = useState(false);
  const { isRecording, durationSec, previewStream, start, stop, cancel } = useMediaRecorder({
    audio: true,
    video: { width: 480, height: 480, facingMode: 'user' },
  });
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) videoRef.current.srcObject = previewStream;
  }, [previewStream]);

  useEffect(() => {
    if (isRecording && durationSec >= MAX_DURATION) {
      handleStop();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [durationSec, isRecording]);

  async function handleOpen() {
    if (disabled) return;
    setIsOpen(true);
    try {
      await start();
    } catch {
      alert('Kameraga ruxsat berilmadi');
      setIsOpen(false);
    }
  }

  async function handleStop() {
    const result = await stop();
    setIsOpen(false);
    if (result && result.durationSec > 0.5) onRecorded(result);
  }

  function handleCancel() {
    cancel();
    setIsOpen(false);
  }

  return (
    <>
      <button type="button" className="composer__mic" onClick={handleOpen} disabled={disabled} aria-label="Dumaloq video xabar">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8">
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="3.2" fill="currentColor" stroke="none" />
        </svg>
      </button>

      {isOpen && (
        <div className="video-note-overlay">
          <div className="video-note-circle" style={{ width: NOTE_SIZE, height: NOTE_SIZE }}>
            <video ref={videoRef} autoPlay playsInline muted />
          </div>
          <div className="video-note-time">{formatDuration(durationSec)}</div>
          <div className="video-note-controls">
            <button type="button" className="video-note-controls__cancel" onClick={handleCancel} aria-label="Yozishni bekor qilish">
              <X size={20} strokeWidth={2} />
            </button>
            <button type="button" className="video-note-controls__send" onClick={handleStop} aria-label="Yuborish">
              <Send size={20} strokeWidth={2} />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
