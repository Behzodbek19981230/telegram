import { useState } from 'react';
import { Check } from 'lucide-react';

export function DeleteMessagesDialog({
  count,
  peerName,
  showAlsoDeleteForPeer = true,
  onCancel,
  onConfirm,
}) {
  const [alsoForPeer, setAlsoForPeer] = useState(false);

  const title =
    count === 1
      ? '1 ta xabarni o‘chirmoqchimisiz?'
      : `${count} ta xabarni o‘chirmoqchimisiz?`;

  function handleConfirm() {
    onConfirm({ forEveryone: showAlsoDeleteForPeer ? alsoForPeer : false });
  }

  return (
    <div className="delete-dialog-backdrop" onClick={onCancel}>
      <div className="delete-dialog" onClick={(e) => e.stopPropagation()}>
        <p className="delete-dialog__title">{title}</p>

        {showAlsoDeleteForPeer && peerName && (
          <label
            className="delete-dialog__checkbox-row"
            onClick={(e) => {
              e.preventDefault();
              setAlsoForPeer((prev) => !prev);
            }}
          >
            <input type="checkbox" checked={alsoForPeer} readOnly tabIndex={-1} />
            <span className="delete-dialog__checkbox-box">
              {alsoForPeer && <Check size={14} strokeWidth={3} />}
            </span>
            <span className="delete-dialog__checkbox-label">
              {peerName} uchun ham o‘chirish
            </span>
          </label>
        )}

        <div className="delete-dialog__actions">
          <button type="button" className="delete-dialog__btn" onClick={onCancel}>
            Bekor qilish
          </button>
          <button type="button" className="delete-dialog__btn delete-dialog__btn--primary" onClick={handleConfirm}>
            O‘chirish
          </button>
        </div>
      </div>
    </div>
  );
}
