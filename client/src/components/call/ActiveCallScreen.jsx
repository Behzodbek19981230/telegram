import { useEffect, useRef, useState } from 'react';
import { useCall } from '../../hooks/useCall.js';
import { Avatar } from '../common/Avatar.jsx';
import { CallControls } from './CallControls.jsx';
import { formatDuration } from '../../utils/formatTime.js';

export function ActiveCallScreen() {
  const { otherUser, callType, localStream, remoteStream, callStartedAt } = useCall();
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (localVideoRef.current) localVideoRef.current.srcObject = localStream;
  }, [localStream]);

  useEffect(() => {
    if (callType === 'video' && remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream;
    if (callType === 'audio' && remoteAudioRef.current) remoteAudioRef.current.srcObject = remoteStream;
  }, [remoteStream, callType]);

  useEffect(() => {
    if (!callStartedAt) return;
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - callStartedAt) / 1000)), 1000);
    return () => clearInterval(id);
  }, [callStartedAt]);

  if (!otherUser) return null;

  return (
    <div className="call-overlay call-overlay--active">
      {callType === 'video' ? (
        <>
          <video ref={remoteVideoRef} className="call-remote-video" autoPlay playsInline />
          <video ref={localVideoRef} className="call-local-video" autoPlay playsInline muted />
        </>
      ) : (
        <div className="call-overlay__user">
          <Avatar userId={otherUser.id} name={otherUser.displayName} avatarUrl={otherUser.avatarUrl} size={110} />
        </div>
      )}

      <div className="call-overlay__header">
        <h2>{otherUser.displayName}</h2>
        <p>{formatDuration(elapsed)}</p>
      </div>

      {callType === 'audio' && <audio ref={remoteAudioRef} autoPlay />}

      <CallControls />
    </div>
  );
}
