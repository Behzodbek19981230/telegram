import { http } from './http.js';

export function fetchChats() {
  return http.get('/chats').then((res) => res.data.chats);
}

export function createChat(otherUserId) {
  return http.post('/chats', { otherUserId }).then((res) => res.data.chat);
}

export function createGroupChat(name, memberIds) {
  return http.post('/chats/group', { name, memberIds }).then((res) => res.data.chat);
}

export function fetchMessages(chatId, cursor) {
  const params = cursor ? { cursor } : {};
  return http.get(`/chats/${chatId}/messages`, { params }).then((res) => res.data);
}

export function fetchChat(chatId) {
  return http.get(`/chats/${chatId}`).then((res) => res.data.chat);
}

export function addGroupMembers(chatId, memberIds) {
  return http.post(`/chats/${chatId}/members`, { memberIds }).then((res) => res.data.chat);
}
