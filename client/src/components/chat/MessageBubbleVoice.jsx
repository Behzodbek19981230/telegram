import { useRef, useState } from 'react';
import { formatDuration } from '../../utils/formatTime.js';
import { resolveMediaUrl } from '../../config/api.js';

export function MessageBubbleVoice({ message }) {
  const src = resolveMediaUrl(message.mediaUrl);
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  function toggle() {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) audio.pause();
    else audio.play();
  }

  function handleTimeUpdate() {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    setProgress(audio.currentTime / audio.duration);
  }

  return (
    <div className="bubble-voice">
      <button type="button" className="bubble-voice__play" onClick={toggle} aria-label={isPlaying ? 'Pauza' : 'Ijro'}>
        {isPlaying ? (
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M6 5h4v14H6zM14 5h4v14h-4z" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>
      <div className="bubble-voice__track">
        <div className="bubble-voice__progress" style={{ width: `${progress * 100}%` }} />
      </div>
      <span className="bubble-voice__duration">{formatDuration(message.mediaDuration || 0)}</span>
      <audio
        ref={audioRef}
        src={src}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
        onTimeUpdate={handleTimeUpdate}
      />
    </div>
  );
}
