import { useState } from 'react';
import { AttachMenu } from './AttachMenu.jsx';
import { VoiceRecorderButton } from './VoiceRecorderButton.jsx';
import { VideoNoteRecorder } from './VideoNoteRecorder.jsx';

export function Composer({ onSendText, onSendFile, onSendVoice, onSendVideoNote, onTyping, onStopTyping }) {
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
    <form className="composer" onSubmit={handleSubmit}>
      <AttachMenu disabled={isSending} onFileSelected={(file) => withSending(() => onSendFile(file))} />
      <input
        type="text"
        className="composer__input"
        placeholder="Xabar"
        value={text}
        onChange={handleChange}
        disabled={isSending}
      />
      {hasText ? (
        <button type="submit" className="composer__send" aria-label="Yuborish">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M2 21l21-9L2 3v7l15 2-15 2z" />
          </svg>
        </button>
      ) : (
        <>
          <VideoNoteRecorder
            disabled={isSending}
            onRecorded={(result) => withSending(() => onSendVideoNote(result))}
          />
          <VoiceRecorderButton
            disabled={isSending}
            onRecorded={(result) => withSending(() => onSendVoice(result))}
          />
        </>
      )}
    </form>
  );
}
