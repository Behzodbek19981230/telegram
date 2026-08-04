import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchChats } from '../api/chats.api.js';
import { uploadFile } from '../api/upload.api.js';
import { useMessages } from '../hooks/useMessages.js';
import { useTyping } from '../hooks/useTyping.js';
import { usePresence, withPresence } from '../hooks/usePresence.js';
import { useAuth } from '../hooks/useAuth.js';
import { ChatHeader } from '../components/chat/ChatHeader.jsx';
import { MessageList } from '../components/chat/MessageList.jsx';
import { Composer } from '../components/chat/Composer.jsx';
import { Spinner } from '../components/common/Spinner.jsx';

export function ChatPage() {
  const { chatId } = useParams();
  const { user } = useAuth();
  const [chatMeta, setChatMeta] = useState(null);
  const presenceMap = usePresence();
  const { messages, isLoading, hasMore, loadMore, sendMessage, markRead } = useMessages(chatId);
  const { isOtherTyping, notifyTyping, stopTyping } = useTyping(chatId);

  useEffect(() => {
    let cancelled = false;
    fetchChats().then((chats) => {
      if (cancelled) return;
      setChatMeta(chats.find((c) => c.id === chatId) || null);
    });
    return () => {
      cancelled = true;
    };
  }, [chatId]);

  const otherUser = useMemo(
    () => (chatMeta ? withPresence(chatMeta.otherUser, presenceMap) : null),
    [chatMeta, presenceMap]
  );

  useEffect(() => {
    if (isLoading) return;
    const unreadIds = messages
      .filter((m) => m.senderId !== user.id && m.status !== 'READ' && !m.pending)
      .map((m) => m.id);
    if (unreadIds.length > 0) markRead(unreadIds);
  }, [messages, isLoading, user, markRead]);

  function handleSendText(text) {
    sendMessage({ type: 'TEXT', content: text });
  }

  async function handleSendFile(file) {
    const mediaType = file.type.startsWith('image/')
      ? 'IMAGE'
      : file.type.startsWith('video/')
        ? 'VIDEO'
        : 'FILE';
    const { url } = await uploadFile(file, null);
    sendMessage({
      type: mediaType,
      mediaUrl: url,
      content: mediaType === 'FILE' ? file.name : null,
    });
  }

  async function handleSendVoice({ blob, durationSec }) {
    const file = new File([blob], `voice-${Date.now()}.webm`, { type: blob.type });
    const { url } = await uploadFile(file, durationSec);
    sendMessage({ type: 'VOICE', mediaUrl: url, mediaDuration: Math.round(durationSec) });
  }

  async function handleSendVideoNote({ blob, durationSec }) {
    const file = new File([blob], `video-note-${Date.now()}.webm`, { type: blob.type });
    const { url } = await uploadFile(file, durationSec);
    sendMessage({ type: 'VIDEO_NOTE', mediaUrl: url, mediaDuration: Math.round(durationSec) });
  }

  if (!otherUser) {
    return (
      <div className="page chat-page screen-center">
        <Spinner size={32} />
      </div>
    );
  }

  return (
    <div className="page chat-page">
      <ChatHeader otherUser={otherUser} chatId={chatId} isOtherTyping={isOtherTyping} />
      {isLoading ? (
        <div className="page-body screen-center">
          <Spinner />
        </div>
      ) : (
        <MessageList
          messages={messages}
          currentUserId={user.id}
          isOtherTyping={isOtherTyping}
          hasMore={hasMore}
          onLoadMore={loadMore}
        />
      )}
      <Composer
        onSendText={handleSendText}
        onSendFile={handleSendFile}
        onSendVoice={handleSendVoice}
        onSendVideoNote={handleSendVideoNote}
        onTyping={notifyTyping}
        onStopTyping={stopTyping}
      />
    </div>
  );
}
