import { useRef, useState } from 'react';
import { resolveMediaUrl } from '../../config/api.js';

const SIZE = 200;

export function MessageBubbleVideoNote({ message }) {
  const src = resolveMediaUrl(message.mediaUrl);
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  function toggle() {
    const video = videoRef.current;
    if (!video) return;
    if (isPlaying) video.pause();
    else video.play();
  }

  return (
    <div className="bubble-video-note" style={{ width: SIZE, height: SIZE }} onClick={toggle}>
      <video
        ref={videoRef}
        src={src}
        playsInline
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => setIsPlaying(false)}
      />
      {!isPlaying && (
        <div className="bubble-video-note__play">
          <svg viewBox="0 0 24 24" width="26" height="26" fill="#fff">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      )}
    </div>
  );
}
