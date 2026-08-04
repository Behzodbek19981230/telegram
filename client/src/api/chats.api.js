import { http } from './http.js';

export function fetchChats() {
  return http.get('/chats').then((res) => res.data.chats);
}

export function createChat(otherUserId) {
  return http.post('/chats', { otherUserId }).then((res) => res.data.chat);
}

export function fetchMessages(chatId, cursor) {
  const params = cursor ? { cursor } : {};
  return http.get(`/chats/${chatId}/messages`, { params }).then((res) => res.data);
}
