import { X, Reply, Forward, Trash2 } from 'lucide-react';

export function SelectionToolbar({ count, onCancel, onForward, onReply, onDelete }) {
  return (
    <header className="page-header selection-toolbar">
      <button className="icon-button" onClick={onCancel} aria-label="Bekor qilish">
        <X size={20} strokeWidth={2} />
      </button>
      <span className="selection-toolbar__count">{count} ta tanlandi</span>
      <div className="selection-toolbar__actions">
        {count === 1 && (
          <button className="icon-button" onClick={onReply} aria-label="Javob berish">
            <Reply size={20} strokeWidth={2} />
          </button>
        )}
        <button className="icon-button" onClick={onForward} aria-label="Uzatish">
          <Forward size={20} strokeWidth={2} />
        </button>
        <button className="icon-button" onClick={onDelete} aria-label="O‘chirish">
          <Trash2 size={20} strokeWidth={2} />
        </button>
      </div>
    </header>
  );
}
