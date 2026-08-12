import { useEffect, useRef } from 'react';

const EMOJIS = [
  '😀', '😂', '🥰', '😍', '🤩', '😎', '🥳', '😊', '🙂', '😉',
  '😘', '😋', '🤔', '😏', '🙄', '😴', '😢', '😭', '😤', '😡',
  '👍', '👎', '👏', '🙌', '👋', '🤝', '🙏', '💪', '❤️', '🔥',
  '✨', '🎉', '💯', '✅', '❌', '⭐', '💙', '💚', '💛', '💜',
  '🍕', '🍔', '☕', '🎂', '⚽', '🎮', '📱', '💻', '🚗', '✈️',
];

export function EmojiPicker({ onSelect, onClose }) {
  const panelRef = useRef(null);

  useEffect(() => {
    function handlePointerDown(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        onClose();
      }
    }
    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, [onClose]);

  return (
    <>
      <div className="emoji-picker__backdrop" onClick={onClose} />
      <div className="emoji-picker" ref={panelRef}>
        <div className="emoji-picker__grid">
          {EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              className="emoji-picker__item"
              onClick={() => onSelect(emoji)}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
