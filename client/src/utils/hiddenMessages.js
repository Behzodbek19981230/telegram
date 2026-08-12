const PREFIX = 'tg_hidden_';

function storageKey(userId, chatId) {
  return `${PREFIX}${userId}_${chatId}`;
}

function readSet(userId, chatId) {
  if (!userId || !chatId) return new Set();
  try {
    const raw = localStorage.getItem(storageKey(userId, chatId));
    if (!raw) return new Set();
    return new Set(JSON.parse(raw));
  } catch {
    return new Set();
  }
}

function writeSet(userId, chatId, set) {
  if (!userId || !chatId) return;
  localStorage.setItem(storageKey(userId, chatId), JSON.stringify([...set]));
}

export function hideMessagesLocally(userId, chatId, messageIds) {
  const set = readSet(userId, chatId);
  messageIds.forEach((id) => set.add(id));
  writeSet(userId, chatId, set);
}

export function filterHiddenMessages(userId, chatId, messages) {
  const hidden = readSet(userId, chatId);
  if (hidden.size === 0) return messages;
  return messages.filter((m) => !hidden.has(m.id));
}
