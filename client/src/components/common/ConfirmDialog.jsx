export function ConfirmDialog({ title, message, actions, onCancel }) {
  return (
    <div className="confirm-dialog-backdrop" onClick={onCancel}>
      <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
        {title && <h3 className="confirm-dialog__title">{title}</h3>}
        {message && <p className="confirm-dialog__message">{message}</p>}
        <div className="confirm-dialog__actions">
          {actions.map((action) => (
            <button
              key={action.label}
              type="button"
              className={`confirm-dialog__btn confirm-dialog__btn--${action.variant || 'default'}`}
              onClick={action.onClick}
            >
              {action.label}
            </button>
          ))}
          <button type="button" className="confirm-dialog__btn confirm-dialog__btn--cancel" onClick={onCancel}>
            Bekor qilish
          </button>
        </div>
      </div>
    </div>
  );
}
