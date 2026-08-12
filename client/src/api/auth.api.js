import { http } from './http.js';

export function loginWithCredentials({ username, password }) {
  return http.post('/auth/login', { username, password }).then((res) => res.data);
}

export function registerWithCredentials({ username, password, firstName, lastName, phone }) {
  return http.post('/auth/register', { username, password, firstName, lastName, phone }).then((res) => res.data);
}
