import { useState } from 'react';
import { X, Send, Smile } from 'lucide-react';
import { AttachMenu } from './AttachMenu.jsx';
import { HoldToRecordButton } from './HoldToRecordButton.jsx';
import { EmojiPicker } from './EmojiPicker.jsx';
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
  const [recordMode, setRecordMode] = useState('audio');
  const [recordingType, setRecordingType] = useState(null);
  const [emojiOpen, setEmojiOpen] = useState(false);

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

  function insertEmoji(emoji) {
    setText((prev) => prev + emoji);
    setEmojiOpen(false);
    onTyping();
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
  const isRecording = recordingType !== null;

  return (
    <div className={`composer-wrap ${isRecording ? 'composer-wrap--recording' : ''}`}>
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

      {emojiOpen && !isRecording && (
        <EmojiPicker onSelect={insertEmoji} onClose={() => setEmojiOpen(false)} />
      )}

      <form className={`composer ${isRecording ? 'composer--recording' : ''}`} onSubmit={handleSubmit}>
        {!isRecording && (
          <>
            <AttachMenu disabled={isSending} onFileSelected={(file) => withSending(() => onSendFile(file))} />
            <div className="composer__input-wrap">
              <button
                type="button"
                className="composer__emoji"
                onClick={() => setEmojiOpen((v) => !v)}
                disabled={isSending}
                aria-label="Emoji"
              >
                <Smile size={22} strokeWidth={1.8} />
              </button>
              <input
                type="text"
                className="composer__input"
                placeholder="Xabar"
                value={text}
                onChange={handleChange}
                disabled={isSending}
              />
            </div>
          </>
        )}

        {hasText && !isRecording ? (
          <button type="submit" className="composer__send" disabled={isSending} aria-label="Yuborish">
            <Send size={19} strokeWidth={2} />
          </button>
        ) : (
          <HoldToRecordButton
            disabled={isSending}
            mode={recordMode}
            onModeToggle={() => setRecordMode((prev) => (prev === 'audio' ? 'video' : 'audio'))}
            onRecordingChange={setRecordingType}
            onRecordedVoice={(result) => withSending(() => onSendVoice(result))}
            onRecordedVideo={(result) => withSending(() => onSendVideoNote(result))}
          />
        )}
      </form>
    </div>
  );
}
