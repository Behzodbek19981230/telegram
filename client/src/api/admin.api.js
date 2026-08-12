import { http } from './http.js';

export function fetchStats() {
  return http.get('/admin/stats').then((res) => res.data);
}

export function fetchAllUsers() {
  return http.get('/admin/users').then((res) => res.data.users);
}

export function fetchAllChats() {
  return http.get('/admin/chats').then((res) => res.data.chats);
}

export function fetchDeletedMessages() {
  return http.get('/admin/messages/deleted').then((res) => res.data.messages);
}

export function fetchDeletedChats() {
  return http.get('/admin/chats/deleted').then((res) => res.data.chats);
}

export function deleteMessagePermanently(id) {
  return http.delete(`/admin/messages/${id}`);
}

export function deleteChatPermanently(id) {
  return http.delete(`/admin/chats/${id}`);
}

export function purgeAllDeleted() {
  return http.post('/admin/purge-all').then((res) => res.data);
}
