import { useEffect, useRef, useState } from 'react';
import { EMOJI_CATEGORIES } from '../../data/emojiData.js';

export function EmojiPicker({ onSelect, onClose }) {
  const panelRef = useRef(null);
  const [activeId, setActiveId] = useState(EMOJI_CATEGORIES[0].id);

  const activeCategory = EMOJI_CATEGORIES.find((c) => c.id === activeId) ?? EMOJI_CATEGORIES[0];

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
        <div className="emoji-picker__tabs" role="tablist">
          {EMOJI_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              role="tab"
              aria-selected={activeId === cat.id}
              aria-label={cat.label}
              className={`emoji-picker__tab ${activeId === cat.id ? 'emoji-picker__tab--active' : ''}`}
              onClick={() => setActiveId(cat.id)}
            >
              {cat.icon}
            </button>
          ))}
        </div>

        <div className="emoji-picker__body" role="tabpanel">
          <div className="emoji-picker__grid">
            {activeCategory.emojis.map((emoji, i) => (
              <button
                key={`${activeCategory.id}-${emoji}-${i}`}
                type="button"
                className="emoji-picker__item"
                onClick={() => onSelect(emoji)}
                title={emoji}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
