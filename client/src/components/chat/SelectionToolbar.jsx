export function SelectionToolbar({ count, onCancel, onForward, onReply, onDelete }) {
  return (
    <header className="selection-toolbar">
      <div className="selection-toolbar__actions-left">
        {count === 1 && (
          <button type="button" className="selection-toolbar__btn" onClick={onReply}>
            JAVOB
          </button>
        )}
        <button type="button" className="selection-toolbar__btn" onClick={onForward}>
          UZATISH {count}
        </button>
        <button type="button" className="selection-toolbar__btn" onClick={onDelete}>
          O‘CHIRISH {count}
        </button>
      </div>
      <button type="button" className="selection-toolbar__cancel" onClick={onCancel}>
        BEKOR QILISH
      </button>
    </header>
  );
}
