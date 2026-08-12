import axios from 'axios';
import { getApiBaseUrl } from '../config/api.js';

export const http = axios.create({ baseURL: getApiBaseUrl() });

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
