import { useRef, useState } from 'react';

export function AttachMenu({ onFileSelected, disabled }) {
  const [open, setOpen] = useState(false);
  const mediaInputRef = useRef(null);
  const fileInputRef = useRef(null);

  function handleChange(e) {
    const file = e.target.files[0];
    e.target.value = '';
    setOpen(false);
    if (file) onFileSelected(file);
  }

  return (
    <div className="attach-menu">
      <button
        type="button"
        className="composer__attach"
        onClick={() => setOpen((v) => !v)}
        disabled={disabled}
        aria-label="Biriktirish"
      >
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M16.8 6.7v10a4.3 4.3 0 0 1-8.6 0v-11a2.7 2.7 0 0 1 5.4 0v10a1.1 1.1 0 0 1-2.2 0v-9" strokeLinecap="round" />
        </svg>
      </button>

      {open && (
        <>
          <div className="attach-menu__backdrop" onClick={() => setOpen(false)} />
          <div className="attach-menu__popup">
            <button type="button" onClick={() => mediaInputRef.current?.click()}>
              <span className="attach-menu__icon">🖼️</span> Rasm yoki video
            </button>
            <button type="button" onClick={() => fileInputRef.current?.click()}>
              <span className="attach-menu__icon">📎</span> Fayl
            </button>
          </div>
        </>
      )}

      <input ref={mediaInputRef} type="file" accept="image/*,video/*" hidden onChange={handleChange} />
      <input ref={fileInputRef} type="file" hidden onChange={handleChange} />
    </div>
  );
}
