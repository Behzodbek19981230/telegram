import { useEffect, useRef, useState } from 'react';
import { Mic, Video } from 'lucide-react';
import { useMediaRecorder } from '../../hooks/useMediaRecorder.js';
import { formatDuration } from '../../utils/formatTime.js';

const LONG_PRESS_MS = 220;

export function HoldToRecordButton({ disabled, onRecordedVoice, onRecordedVideo }) {
  const [mode, setMode] = useState('audio'); // audio | video
  const longPressTimerRef = useRef(null);
  const suppressClickRef = useRef(false);
  const videoPreviewRef = useRef(null);

  const audioRecorder = useMediaRecorder({ audio: true });
  const videoRecorder = useMediaRecorder({
    audio: true,
    video: { width: 480, height: 480, facingMode: 'user' },
  });

  const isAudioRecording = audioRecorder.isRecording;
  const isVideoRecording = videoRecorder.isRecording;
  const isRecording = isAudioRecording || isVideoRecording;

  useEffect(() => {
    if (videoPreviewRef.current) {
      videoPreviewRef.current.srcObject = videoRecorder.previewStream;
    }
  }, [videoRecorder.previewStream]);

  useEffect(() => {
    return () => {
      clearTimeout(longPressTimerRef.current);
      audioRecorder.cancel();
      videoRecorder.cancel();
    };
    // recorder objects are stable by hook usage; cleanup on unmount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function startRecording() {
    try {
      if (mode === 'video') {
        await videoRecorder.start();
      } else {
        await audioRecorder.start();
      }
      suppressClickRef.current = true;
    } catch {
      alert(mode === 'video' ? 'Kameraga ruxsat berilmadi' : 'Mikrofonga ruxsat berilmadi');
    }
  }

  async function stopAndSend() {
    if (isAudioRecording) {
      const result = await audioRecorder.stop();
      if (result && result.durationSec > 0.4) {
        onRecordedVoice(result);
      }
      return;
    }
    if (isVideoRecording) {
      const result = await videoRecorder.stop();
      if (result && result.durationSec > 0.5) {
        onRecordedVideo(result);
      }
    }
  }

  function handlePointerDown() {
    if (disabled || isRecording) return;
    suppressClickRef.current = false;
    clearTimeout(longPressTimerRef.current);
    longPressTimerRef.current = setTimeout(() => {
      startRecording();
    }, LONG_PRESS_MS);
  }

  function handlePointerUp() {
    clearTimeout(longPressTimerRef.current);
    if (isRecording) {
      stopAndSend();
    }
  }

  function handleClick() {
    if (disabled || isRecording) return;
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }
    setMode((prev) => (prev === 'audio' ? 'video' : 'audio'));
  }

  const Icon = mode === 'audio' ? Mic : Video;

  if (isAudioRecording) {
    return (
      <div className="voice-recording">
        <span className="voice-recording__dot" />
        <span className="voice-recording__time">{formatDuration(audioRecorder.durationSec)}</span>
        <button type="button" className="composer__mic composer__mic--active" aria-label="Yuborish">
          <Mic size={20} strokeWidth={2} />
        </button>
      </div>
    );
  }

  return (
    <>
      {isVideoRecording && (
        <div className="video-note-overlay video-note-overlay--hold">
          <div className="video-note-circle" style={{ width: 220, height: 220 }}>
            <video ref={videoPreviewRef} autoPlay playsInline muted />
          </div>
          <div className="video-note-time">{formatDuration(videoRecorder.durationSec)}</div>
          <p className="video-note-hint">Qo‘yib yuborsangiz yuboriladi</p>
        </div>
      )}

      <button
        type="button"
        className={`composer__mic composer__record-toggle ${mode === 'video' ? 'composer__record-toggle--video' : ''}`}
        disabled={disabled}
        aria-label={mode === 'video' ? 'Video rejim. Bosib turing' : 'Audio rejim. Bosib turing'}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onClick={handleClick}
      >
        <Icon size={21} strokeWidth={2} />
      </button>
    </>
  );
}

