import { http } from './http.js';

export function fetchMe() {
  return http.get('/users/me').then((res) => res.data.user);
}

export function fetchUsers() {
  return http.get('/users').then((res) => res.data.users);
}

export function updateProfile(data) {
  return http.patch('/users/me', data).then((res) => res.data.user);
}
