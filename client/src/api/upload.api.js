import { http } from './http.js';

export function uploadFile(file, duration, onProgress) {
  const formData = new FormData();
  formData.append('file', file);
  if (duration != null) formData.append('duration', String(duration));

  return http
    .post('/upload', formData, {
      onUploadProgress: (evt) => {
        if (onProgress && evt.total) onProgress(Math.round((evt.loaded / evt.total) * 100));
      },
    })
    .then((res) => res.data);
}
