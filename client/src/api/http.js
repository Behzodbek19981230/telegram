import axios from 'axios';

export const http = axios.create({ baseURL: '/api' });

let authToken = null;

export function setAuthToken(token) {
  authToken = token;
}

http.interceptors.request.use((config) => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});
