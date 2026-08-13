import { useRef, useState } from 'react';
import { resolveMediaUrl } from '../../config/api.js';
import { VideoNoteLightbox } from './VideoNoteLightbox.jsx';

const SIZE = 200;

export function MessageBubbleVideoNote({ message }) {
  const src = resolveMediaUrl(message.mediaUrl);
  const videoRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  function openLightbox() {
    videoRef.current?.pause();
    setIsPlaying(false);
    setIsOpen(true);
  }

  return (
    <>
      <div className="bubble-video-note" style={{ width: SIZE, height: SIZE }} onClick={openLightbox}>
        <video
          ref={videoRef}
          src={src}
          playsInline
          preload="metadata"
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

      {isOpen && <VideoNoteLightbox mediaUrl={message.mediaUrl} onClose={() => setIsOpen(false)} />}
    </>
  );
}
