import { useState } from 'react';
import { X, Send } from 'lucide-react';
import { AttachMenu } from './AttachMenu.jsx';
import { HoldToRecordButton } from './HoldToRecordButton.jsx';
import { formatLastMessage } from '../../utils/formatLastMessage.js';

export function Composer({
  onSendText,
  onSendFile,
  onSendVoice,
  onSendVideoNote,
  onTyping,
  onStopTyping,
  replyingTo,
  onCancelReply,
}) {
  const [text, setText] = useState('');
  const [isSending, setIsSending] = useState(false);

  function handleChange(e) {
    setText(e.target.value);
    if (e.target.value.trim()) onTyping();
    else onStopTyping();
  }

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    onSendText(trimmed);
    setText('');
    onStopTyping();
  }

  async function withSending(task) {
    setIsSending(true);
    try {
      await task();
    } catch {
      alert('Yuborishda xatolik yuz berdi');
    } finally {
      setIsSending(false);
    }
  }

  const hasText = text.trim().length > 0;

  return (
    <div className="composer-wrap">
      {replyingTo && (
        <div className="reply-preview">
          <div className="reply-preview__body">
            <span className="reply-preview__name">{replyingTo.sender?.displayName || 'Siz'}</span>
            <span className="reply-preview__text">{formatLastMessage(replyingTo)}</span>
          </div>
          <button type="button" className="reply-preview__cancel" onClick={onCancelReply} aria-label="Javobni bekor qilish">
            <X size={16} strokeWidth={2} />
          </button>
        </div>
      )}

      <form className="composer" onSubmit={handleSubmit}>
        <AttachMenu disabled={isSending} onFileSelected={(file) => withSending(() => onSendFile(file))} />
        <div className="composer__input-wrap">
          <input
            type="text"
            className="composer__input"
            placeholder="Xabar"
            value={text}
            onChange={handleChange}
            disabled={isSending}
          />
        </div>
        {hasText ? (
          <button type="submit" className="composer__send" aria-label="Yuborish">
            <Send size={19} strokeWidth={2} />
          </button>
        ) : (
          <HoldToRecordButton
            disabled={isSending}
            onRecordedVoice={(result) => withSending(() => onSendVoice(result))}
            onRecordedVideo={(result) => withSending(() => onSendVideoNote(result))}
          />
        )}
      </form>
    </div>
  );
}
