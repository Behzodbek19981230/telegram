import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { resolveMediaUrl } from '../../config/api.js';

export function VideoNoteLightbox({ mediaUrl, onClose }) {
  const src = resolveMediaUrl(mediaUrl);
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.play().catch(() => {});
    return () => video.pause();
  }, [src]);

  function togglePlay(e) {
    e?.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) video.play();
    else video.pause();
  }

  const frame = document.querySelector('.mobile-frame');

  const content = (
    <div className="video-note-lightbox" onClick={onClose} role="dialog" aria-modal="true" aria-label="Video xabar">
      <button
        type="button"
        className="video-note-lightbox__close"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        aria-label="Yopish"
      >
        <X size={22} strokeWidth={2} />
      </button>
      <div className="video-note-lightbox__circle" onClick={(e) => e.stopPropagation()}>
        <video
          ref={videoRef}
          src={src}
          playsInline
          onClick={togglePlay}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
        />
        {!isPlaying && (
          <button type="button" className="video-note-lightbox__play" onClick={togglePlay} aria-label="Ijro etish">
            <svg viewBox="0 0 24 24" width="36" height="36" fill="#fff">
              <path d="M8 5v14l11-7z" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );

  return frame ? createPortal(content, frame) : content;
}
