import { useRef, useState } from 'react';
import { Paperclip, Image, File } from 'lucide-react';

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
    <div className="popup-menu">
      <button
        type="button"
        className="composer__attach"
        onClick={() => setOpen((v) => !v)}
        disabled={disabled}
        aria-label="Biriktirish"
      >
        <Paperclip size={21} strokeWidth={1.9} />
      </button>

      {open && (
        <>
          <div className="popup-menu__backdrop" onClick={() => setOpen(false)} />
          <div className="popup-menu__panel">
            <button type="button" onClick={() => mediaInputRef.current?.click()}>
              <span className="popup-menu__icon">
                <Image size={17} strokeWidth={1.8} />
              </span>
              Rasm yoki video
            </button>
            <button type="button" onClick={() => fileInputRef.current?.click()}>
              <span className="popup-menu__icon">
                <File size={17} strokeWidth={1.8} />
              </span>
              Fayl
            </button>
          </div>
        </>
      )}

      <input ref={mediaInputRef} type="file" accept="image/*,video/*" hidden onChange={handleChange} />
      <input ref={fileInputRef} type="file" hidden onChange={handleChange} />
    </div>
  );
}
