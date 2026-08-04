import { useCallback, useRef, useState } from 'react';

function pickSupportedMimeType(candidates) {
  for (const type of candidates) {
    if (window.MediaRecorder?.isTypeSupported(type)) return type;
  }
  return undefined;
}

export function useMediaRecorder({ audio = true, video = false } = {}) {
  const [isRecording, setIsRecording] = useState(false);
  const [durationSec, setDurationSec] = useState(0);
  const [previewStream, setPreviewStream] = useState(null);

  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);
  const startTimeRef = useRef(0);
  const timerRef = useRef(null);

  const start = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio, video });
    streamRef.current = stream;
    setPreviewStream(stream);
    chunksRef.current = [];

    const mimeType = video
      ? pickSupportedMimeType(['video/webm;codecs=vp8,opus', 'video/webm'])
      : pickSupportedMimeType(['audio/webm;codecs=opus', 'audio/webm']);

    const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
    recorderRef.current = recorder;

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };

    recorder.start();
    setIsRecording(true);
    startTimeRef.current = Date.now();
    setDurationSec(0);
    timerRef.current = setInterval(() => {
      setDurationSec((Date.now() - startTimeRef.current) / 1000);
    }, 200);
  }, [audio, video]);

  const teardown = useCallback(() => {
    clearInterval(timerRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setPreviewStream(null);
    setIsRecording(false);
  }, []);

  const stop = useCallback(() => {
    return new Promise((resolve) => {
      const recorder = recorderRef.current;
      if (!recorder || recorder.state === 'inactive') {
        teardown();
        return resolve(null);
      }

      recorder.onstop = () => {
        const finalDuration = (Date.now() - startTimeRef.current) / 1000;
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType });
        teardown();
        resolve({ blob, mimeType: recorder.mimeType, durationSec: finalDuration });
      };
      recorder.stop();
    });
  }, [teardown]);

  const cancel = useCallback(() => {
    const recorder = recorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      recorder.onstop = null;
      recorder.stop();
    }
    teardown();
  }, [teardown]);

  return { isRecording, durationSec, previewStream, start, stop, cancel };
}
