import { useEffect, useRef } from 'react';
import { Mic, Camera } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useMediaRecorder } from '../../hooks/useMediaRecorder.js';
import { formatDuration } from '../../utils/formatTime.js';

const LONG_PRESS_MS = 220;

function SendIcon() {
	return (
		<svg viewBox='0 0 24 24' width='20' height='20' fill='currentColor'>
			<path d='M2.01 21 23 12 2.01 3 2 10l15 2-15 2z' />
		</svg>
	);
}

function RecordingBar({ durationSec, onCancel, onSend }) {
	return (
		<div className='voice-recording'>
			<button type='button' className='voice-recording__cancel' onClick={onCancel} aria-label='Bekor qilish'>
				✕
			</button>
			<span className='voice-recording__dot' />
			<span className='voice-recording__time'>{formatDuration(durationSec)}</span>
			<button type='button' className='voice-recording__send' onClick={onSend} aria-label='Yuborish'>
				<SendIcon />
			</button>
		</div>
	);
}

export function HoldToRecordButton({
	disabled,
	mode,
	onModeToggle,
	onRecordingChange,
	onRecordedVoice,
	onRecordedVideo,
}) {
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
		onRecordingChange?.(isRecording ? (isVideoRecording ? 'video' : 'audio') : null);
	}, [isRecording, isVideoRecording, onRecordingChange]);

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

	function cancelRecording() {
		clearTimeout(longPressTimerRef.current);
		if (isAudioRecording) audioRecorder.cancel();
		if (isVideoRecording) videoRecorder.cancel();
	}

	function handlePointerDown(e) {
		if (disabled || isRecording) return;
		e.preventDefault();
		suppressClickRef.current = false;
		clearTimeout(longPressTimerRef.current);
		longPressTimerRef.current = setTimeout(startRecording, LONG_PRESS_MS);
	}

	function handlePointerUp() {
		clearTimeout(longPressTimerRef.current);
		// Audio: qo‘yib yuborish = yuborish. Video: yozish davom etadi, faqat tugma orqali yuboriladi.
		if (isAudioRecording) {
			stopAndSend();
		}
	}

	function handleClick() {
		if (disabled || isRecording) return;
		if (suppressClickRef.current) {
			suppressClickRef.current = false;
			return;
		}
		onModeToggle();
	}

	const frame = document.querySelector('.mobile-frame');

	if (isVideoRecording) {
		return (
			<>
				{frame &&
					createPortal(
						<div className='video-note-overlay video-note-overlay--hold'>
							<div className='video-note-circle' style={{ width: 220, height: 220 }}>
								<video ref={videoPreviewRef} autoPlay playsInline muted />
							</div>
							<div className='video-note-time'>{formatDuration(videoRecorder.durationSec)}</div>
						</div>,
						frame,
					)}
				<RecordingBar durationSec={videoRecorder.durationSec} onCancel={cancelRecording} onSend={stopAndSend} />
			</>
		);
	}

	if (isAudioRecording) {
		return <RecordingBar durationSec={audioRecorder.durationSec} onCancel={cancelRecording} onSend={stopAndSend} />;
	}

	const Icon = mode === 'audio' ? Mic : Camera;

	return (
		<button
			type='button'
			className={`composer__mic composer__record-toggle ${mode === 'video' ? 'composer__record-toggle--video' : ''}`}
			disabled={disabled}
			aria-label={mode === 'video' ? 'Video xabar. Bosib turing' : 'Audio. Bosib turing'}
			onPointerDown={handlePointerDown}
			onPointerUp={handlePointerUp}
			onPointerCancel={handlePointerUp}
			onPointerLeave={isAudioRecording ? undefined : handlePointerUp}
			onClick={handleClick}
		>
			<Icon size={21} strokeWidth={2} />
		</button>
	);
}
