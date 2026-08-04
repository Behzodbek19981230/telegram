import { http } from './http.js';

export function fetchMe() {
  return http.get('/users/me').then((res) => res.data.user);
}

export function fetchUsers() {
  return http.get('/users').then((res) => res.data.users);
}
