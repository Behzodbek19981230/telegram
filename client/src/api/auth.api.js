import { http } from './http.js';

export function login(username) {
  return http.post('/auth/login', { username }).then((res) => res.data);
}
