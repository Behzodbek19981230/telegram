import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { fetchChats } from '../api/chats.api.js';
import { uploadFile } from '../api/upload.api.js';
import { useMessages } from '../hooks/useMessages.js';
import { useTyping } from '../hooks/useTyping.js';
import { useMessageSelection } from '../hooks/useMessageSelection.js';
import { usePresence, withPresence } from '../hooks/usePresence.js';
import { useAuth } from '../hooks/useAuth.js';
import { useSocket } from '../hooks/useSocket.js';
import { ChatHeader } from '../components/chat/ChatHeader.jsx';
import { SelectionToolbar } from '../components/chat/SelectionToolbar.jsx';
import { MessageList } from '../components/chat/MessageList.jsx';
import { Composer } from '../components/chat/Composer.jsx';
import { ForwardDialog } from '../components/chat/ForwardDialog.jsx';
import { DeleteMessagesDialog } from '../components/chat/DeleteMessagesDialog.jsx';
import { ConfirmDialog } from '../components/common/ConfirmDialog.jsx';
import { Spinner } from '../components/common/Spinner.jsx';

function isOwnMessage(message, userId) {
  if (!message || !userId) return false;
  return message.senderId === userId || message.sender?.id === userId;
}

export function ChatPage() {
  const { chatId } = useParams();
  const { user } = useAuth();
  const socket = useSocket();
  const navigate = useNavigate();
  const [chatMeta, setChatMeta] = useState(null);
  const presenceMap = usePresence();
  const { messages, isLoading, hasMore, loadMore, sendMessage, deleteMessages, markRead } = useMessages(chatId);
  const { typingUserIds, notifyTyping, stopTyping } = useTyping(chatId);
  const { selectedIds, toggle, select, clear: clearSelection, isSelecting } = useMessageSelection();
  const [replyingTo, setReplyingTo] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null);
  const [isForwarding, setIsForwarding] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

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

  useEffect(() => {
    if (!socket) return;
    function handleCleared({ chatId: cId, alsoDeleteChat }) {
      if (cId === chatId && alsoDeleteChat) navigate('/chats', { replace: true });
    }
    socket.on('chat:cleared', handleCleared);
    return () => socket.off('chat:cleared', handleCleared);
  }, [socket, chatId, navigate]);

  const isGroup = chatMeta?.type === 'GROUP';

  const chat = useMemo(() => {
    if (!chatMeta) return null;
    if (chatMeta.type === 'DIRECT') {
      return { ...chatMeta, otherUser: withPresence(chatMeta.otherUser, presenceMap) };
    }
    return chatMeta;
  }, [chatMeta, presenceMap]);

  const typingText = useMemo(() => {
    if (typingUserIds.length === 0) return '';
    if (!isGroup) return 'yozmoqda...';

    const names = typingUserIds
      .map((id) => chatMeta?.members?.find((m) => m.id === id)?.displayName)
      .filter(Boolean);

    if (names.length === 0) return 'yozmoqda...';
    if (names.length === 1) return `${names[0]} yozmoqda...`;
    return `${names.length} kishi yozmoqda...`;
  }, [typingUserIds, isGroup, chatMeta]);

  useEffect(() => {
    if (isLoading) return;
    const hasUnread = messages.some((m) => m.senderId !== user.id && m.status !== 'READ' && !m.pending);
    if (hasUnread) markRead();
  }, [messages, isLoading, user, markRead]);

  function withReply(fields) {
    return replyingTo ? { ...fields, replyToId: replyingTo.id, replyTo: replyingTo } : fields;
  }

  function handleSendText(text) {
    sendMessage(withReply({ type: 'TEXT', content: text }));
    setReplyingTo(null);
  }

  async function handleSendFile(file) {
    const mediaType = file.type.startsWith('image/')
      ? 'IMAGE'
      : file.type.startsWith('video/')
        ? 'VIDEO'
        : 'FILE';
    const { url } = await uploadFile(file, null);
    sendMessage(withReply({ type: mediaType, mediaUrl: url, content: mediaType === 'FILE' ? file.name : null }));
    setReplyingTo(null);
  }

  async function handleSendVoice({ blob, durationSec }) {
    const file = new File([blob], `voice-${Date.now()}.webm`, { type: blob.type });
    const { url } = await uploadFile(file, durationSec);
    sendMessage(withReply({ type: 'VOICE', mediaUrl: url, mediaDuration: Math.round(durationSec) }));
    setReplyingTo(null);
  }

  async function handleSendVideoNote({ blob, durationSec }) {
    const file = new File([blob], `video-note-${Date.now()}.webm`, { type: blob.type });
    const { url } = await uploadFile(file, durationSec);
    sendMessage(withReply({ type: 'VIDEO_NOTE', mediaUrl: url, mediaDuration: Math.round(durationSec) }));
    setReplyingTo(null);
  }

  function handleReplySelected() {
    const id = [...selectedIds][0];
    const message = messages.find((m) => m.id === id);
    if (message) setReplyingTo(message);
    clearSelection();
  }

  function handleForwardTo(targetChatId) {
    socket?.emit('message:forward', { targetChatId, messageIds: [...selectedIds] }, () => {});
    setIsForwarding(false);
    clearSelection();
  }

  function handleDeleteSelected() {
    setShowDeleteDialog(true);
  }

  function handleConfirmDelete({ forEveryone }) {
    const ids = [...selectedIds];
    const ownIds = [];
    const otherIds = [];

    for (const id of ids) {
      const message = messages.find((m) => m.id === id);
      if (isOwnMessage(message, user.id)) ownIds.push(id);
      else otherIds.push(id);
    }

    if (forEveryone && ownIds.length > 0) {
      deleteMessages(ownIds, { forEveryone: true });
    }

    const localOnlyIds = forEveryone ? otherIds : ids;
    if (localOnlyIds.length > 0) {
      deleteMessages(localOnlyIds, { forEveryone: false });
    }

    clearSelection();
    setShowDeleteDialog(false);
  }

  const hasOwnSelected = useMemo(() => {
    if (selectedIds.size === 0) return false;
    return [...selectedIds].some((id) => isOwnMessage(messages.find((m) => m.id === id), user.id));
  }, [selectedIds, messages, user.id]);

  const deletePeerName = useMemo(() => {
    if (!chat) return '';
    if (chat.type === 'GROUP') return 'barcha a\'zolar';
    return chat.otherUser?.displayName || chat.otherUser?.username || 'suhbatdosh';
  }, [chat]);

  function handleClearHistory() {
    setConfirmAction({
      title: 'Tarixni tozalash',
      message: 'Suhbat tarixi tozalanadi. Suhbatni ham ro‘yxatdan olib tashlaysizmi?',
      actions: [
        {
          label: 'Faqat tarixni tozalash',
          onClick: () => {
            socket?.emit('chat:clear', { chatId, alsoDeleteChat: false });
            setConfirmAction(null);
          },
        },
        {
          label: 'Tarix va suhbatni o‘chirish',
          variant: 'danger',
          onClick: () => {
            socket?.emit('chat:clear', { chatId, alsoDeleteChat: true });
            setConfirmAction(null);
          },
        },
      ],
    });
  }

  function handleDeleteChat() {
    setConfirmAction({
      title: 'Suhbatni o‘chirish',
      message: 'Suhbat va uning barcha xabarlari o‘chiriladi.',
      actions: [
        {
          label: 'O‘chirish',
          variant: 'danger',
          onClick: () => {
            socket?.emit('chat:clear', { chatId, alsoDeleteChat: true });
            setConfirmAction(null);
          },
        },
      ],
    });
  }

  if (!chat) {
    return (
      <div className="page chat-page screen-center">
        <Spinner size={32} />
      </div>
    );
  }

  return (
    <div className="page chat-page">
      {isSelecting ? (
        <SelectionToolbar
          count={selectedIds.size}
          onCancel={clearSelection}
          onForward={() => setIsForwarding(true)}
          onReply={handleReplySelected}
          onDelete={handleDeleteSelected}
        />
      ) : (
        <ChatHeader
          chat={chat}
          typingText={typingText}
          onClearHistory={handleClearHistory}
          onDeleteChat={handleDeleteChat}
        />
      )}
      {isLoading ? (
        <div className="page-body screen-center">
          <Spinner />
        </div>
      ) : (
        <MessageList
          messages={messages}
          currentUserId={user.id}
          isGroup={isGroup}
          isSomeoneTyping={typingUserIds.length > 0}
          hasMore={hasMore}
          onLoadMore={loadMore}
          isSelectionMode={isSelecting}
          selectedIds={selectedIds}
          onLongPress={select}
          onToggleSelect={toggle}
        />
      )}
      <Composer
        onSendText={handleSendText}
        onSendFile={handleSendFile}
        onSendVoice={handleSendVoice}
        onSendVideoNote={handleSendVideoNote}
        onTyping={notifyTyping}
        onStopTyping={stopTyping}
        replyingTo={replyingTo}
        onCancelReply={() => setReplyingTo(null)}
      />

      {isForwarding && <ForwardDialog onSelect={handleForwardTo} onClose={() => setIsForwarding(false)} />}
      {showDeleteDialog && (
        <DeleteMessagesDialog
          key={[...selectedIds].join(',')}
          count={selectedIds.size}
          peerName={deletePeerName}
          showAlsoDeleteForPeer={!isGroup || hasOwnSelected}
          onCancel={() => setShowDeleteDialog(false)}
          onConfirm={handleConfirmDelete}
        />
      )}
      {confirmAction && <ConfirmDialog {...confirmAction} onCancel={() => setConfirmAction(null)} />}
    </div>
  );
}
