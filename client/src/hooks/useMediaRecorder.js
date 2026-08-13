import { useCallback, useRef, useState } from 'react';

function pickSupportedMimeType(candidates) {
  for (const type of candidates) {
    if (window.MediaRecorder?.isTypeSupported(type)) return type;
  }
  return undefined;
}

function getVideoMimeType() {
  return pickSupportedMimeType(['video/webm;codecs=vp8,opus', 'video/webm']);
}

function getAudioMimeType() {
  return pickSupportedMimeType(['audio/webm;codecs=opus', 'audio/webm']);
}

export function useMediaRecorder({ audio = true, video = false } = {}) {
  const [isRecording, setIsRecording] = useState(false);
  const [durationSec, setDurationSec] = useState(0);
  const [previewStream, setPreviewStream] = useState(null);
  const [facingMode, setFacingMode] = useState('user');

  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const streamRef = useRef(null);
  const startTimeRef = useRef(0);
  const timerRef = useRef(null);
  const facingModeRef = useRef('user');

  const hasVideo = Boolean(video);

  const getVideoConstraints = useCallback(
    (mode = facingModeRef.current) => {
      if (!hasVideo) return false;
      const base = typeof video === 'object' ? { ...video } : { width: 480, height: 480 };
      return { ...base, facingMode: mode };
    },
    [hasVideo, video]
  );

  const attachRecorder = useCallback(
    (stream) => {
      const mimeType = hasVideo ? getVideoMimeType() : getAudioMimeType();
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      recorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.start();
    },
    [hasVideo]
  );

  const start = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio,
      video: getVideoConstraints(),
    });
    streamRef.current = stream;
    setPreviewStream(stream);
    chunksRef.current = [];
    attachRecorder(stream);

    setIsRecording(true);
    startTimeRef.current = Date.now();
    setDurationSec(0);
    timerRef.current = setInterval(() => {
      setDurationSec((Date.now() - startTimeRef.current) / 1000);
    }, 200);
  }, [audio, attachRecorder, getVideoConstraints]);

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
        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || (hasVideo ? 'video/webm' : 'audio/webm'),
        });
        teardown();
        resolve({ blob, mimeType: recorder.mimeType, durationSec: finalDuration });
      };
      recorder.stop();
    });
  }, [hasVideo, teardown]);

  const cancel = useCallback(() => {
    const recorder = recorderRef.current;
    if (recorder && recorder.state !== 'inactive') {
      recorder.onstop = null;
      recorder.stop();
    }
    teardown();
  }, [teardown]);

  const flipCamera = useCallback(async () => {
    if (!hasVideo) return;

    const nextFacing = facingModeRef.current === 'user' ? 'environment' : 'user';

    if (!isRecording || !streamRef.current) {
      facingModeRef.current = nextFacing;
      setFacingMode(nextFacing);
      return;
    }

    const recorder = recorderRef.current;
    if (recorder && recorder.state === 'recording') {
      await new Promise((resolve) => {
        recorder.onstop = resolve;
        recorder.stop();
      });
    }

    streamRef.current.getTracks().forEach((t) => t.stop());

    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        audio,
        video: getVideoConstraints(nextFacing),
      });
      facingModeRef.current = nextFacing;
      setFacingMode(nextFacing);
      streamRef.current = newStream;
      setPreviewStream(newStream);
      attachRecorder(newStream);
    } catch {
      try {
        const fallbackStream = await navigator.mediaDevices.getUserMedia({
          audio,
          video: getVideoConstraints(facingModeRef.current),
        });
        streamRef.current = fallbackStream;
        setPreviewStream(fallbackStream);
        attachRecorder(fallbackStream);
      } catch {
        cancel();
      }
      throw new Error('Kamerani almashtirib bo‘lmadi');
    }
  }, [audio, attachRecorder, cancel, getVideoConstraints, hasVideo, isRecording]);

  return {
    isRecording,
    durationSec,
    previewStream,
    facingMode,
    start,
    stop,
    cancel,
    flipCamera,
  };
}
