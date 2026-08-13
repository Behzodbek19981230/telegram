import { SwitchCamera } from 'lucide-react';

export function CameraFlipButton({ onClick, className = '' }) {
  return (
    <button
      type="button"
      className={`video-note-flip-btn ${className}`.trim()}
      onClick={onClick}
      aria-label="Kamerani almashtirish"
    >
      <SwitchCamera size={22} strokeWidth={2} />
    </button>
  );
}
