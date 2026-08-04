import { createContext, useCallback, useEffect, useRef, useState } from 'react';
import { useSocket } from '../hooks/useSocket.js';
import { createPeerConnection } from '../utils/rtc.js';
import { IncomingCallModal } from '../components/call/IncomingCallModal.jsx';
import { OutgoingCallScreen } from '../components/call/OutgoingCallScreen.jsx';
import { ActiveCallScreen } from '../components/call/ActiveCallScreen.jsx';

export const CallContext = createContext(null);

const IDLE_STATE = {
  status: 'idle',
  callId: null,
  chatId: null,
  callType: null,
  otherUser: null,
  isCaller: false,
};

async function flushCandidates(pc, queueRef) {
  const queued = queueRef.current;
  queueRef.current = [];
  for (const candidate of queued) {
    try {
      await pc.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (err) {
      console.error('addIceCandidate failed', err);
    }
  }
}

export function CallProvider({ children }) {
  const socket = useSocket();
  const [state, setState] = useState(IDLE_STATE);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [callStartedAt, setCallStartedAt] = useState(null);

  const stateRef = useRef(state);
  const pcRef = useRef(null);
  const localStreamRef = useRef(null);
  const pendingCandidatesRef = useRef([]);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const cleanup = useCallback(() => {
    pcRef.current?.close();
    pcRef.current = null;
    pendingCandidatesRef.current = [];
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current = null;
    setLocalStream(null);
    setRemoteStream(null);
    setIsMuted(false);
    setIsCameraOff(false);
    setCallStartedAt(null);
    setState(IDLE_STATE);
  }, []);

  const ensurePeerConnection = useCallback(() => {
    if (pcRef.current) return pcRef.current;
    const pc = createPeerConnection();

    pc.onicecandidate = (event) => {
      if (event.candidate && stateRef.current.callId) {
        socket.emit('call:signal', {
          callId: stateRef.current.callId,
          kind: 'ice-candidate',
          data: event.candidate,
        });
      }
    };

    pc.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
    };

    pcRef.current = pc;
    return pc;
  }, [socket]);

  useEffect(() => {
    if (!socket) return;

    async function handleIncoming({ callId, chatId, callType, fromUser }) {
      if (stateRef.current.status !== 'idle') {
        socket.emit('call:reject', { callId, reason: 'busy' });
        return;
      }
      setState({ status: 'incoming', callId, chatId, callType, otherUser: fromUser, isCaller: false });
    }

    async function handleAccepted({ callId }) {
      if (stateRef.current.callId !== callId) return;
      try {
        const pc = ensurePeerConnection();
        localStreamRef.current?.getTracks().forEach((track) => pc.addTrack(track, localStreamRef.current));
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socket.emit('call:signal', { callId, kind: 'offer', data: offer });
        setState((prev) => ({ ...prev, status: 'active' }));
        setCallStartedAt(Date.now());
      } catch (err) {
        console.error('call accept handling failed', err);
        cleanup();
      }
    }

    function handleRejected({ callId }) {
      if (stateRef.current.callId !== callId) return;
      cleanup();
    }

    function handleCancelled({ callId }) {
      if (stateRef.current.callId !== callId) return;
      cleanup();
    }

    function handleEnded({ callId }) {
      if (stateRef.current.callId !== callId) return;
      cleanup();
    }

    async function handleSignal({ callId, kind, data }) {
      if (stateRef.current.callId !== callId) return;
      const pc = ensurePeerConnection();

      try {
        if (kind === 'offer') {
          await pc.setRemoteDescription(new RTCSessionDescription(data));
          await flushCandidates(pc, pendingCandidatesRef);
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          socket.emit('call:signal', { callId, kind: 'answer', data: answer });
        } else if (kind === 'answer') {
          await pc.setRemoteDescription(new RTCSessionDescription(data));
          await flushCandidates(pc, pendingCandidatesRef);
        } else if (kind === 'ice-candidate') {
          if (pc.remoteDescription && pc.remoteDescription.type) {
            await pc.addIceCandidate(new RTCIceCandidate(data));
          } else {
            pendingCandidatesRef.current.push(data);
          }
        }
      } catch (err) {
        console.error('call signal handling failed', err);
      }
    }

    socket.on('call:incoming', handleIncoming);
    socket.on('call:accepted', handleAccepted);
    socket.on('call:rejected', handleRejected);
    socket.on('call:cancelled', handleCancelled);
    socket.on('call:ended', handleEnded);
    socket.on('call:signal', handleSignal);

    return () => {
      socket.off('call:incoming', handleIncoming);
      socket.off('call:accepted', handleAccepted);
      socket.off('call:rejected', handleRejected);
      socket.off('call:cancelled', handleCancelled);
      socket.off('call:ended', handleEnded);
      socket.off('call:signal', handleSignal);
    };
  }, [socket, ensurePeerConnection, cleanup]);

  useEffect(() => {
    if (!socket) cleanup();
  }, [socket, cleanup]);

  const startCall = useCallback(
    async (chatId, otherUser, callType) => {
      if (!socket || stateRef.current.status !== 'idle') return;
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: callType === 'video',
        });
        localStreamRef.current = stream;
        setLocalStream(stream);

        socket.emit('call:invite', { chatId, toUserId: otherUser.id, callType }, (ack) => {
          if (!ack?.ok) {
            cleanup();
            return;
          }
          setState({ status: 'outgoing', callId: ack.callId, chatId, callType, otherUser, isCaller: true });
        });
      } catch (err) {
        console.error('startCall failed', err);
        alert('Kamera/mikrofonga ruxsat berilmadi');
      }
    },
    [socket, cleanup]
  );

  const acceptCall = useCallback(async () => {
    const current = stateRef.current;
    if (current.status !== 'incoming' || !socket) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: current.callType === 'video',
      });
      localStreamRef.current = stream;
      setLocalStream(stream);

      const pc = ensurePeerConnection();
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      socket.emit('call:accept', { callId: current.callId });
      setState((prev) => ({ ...prev, status: 'active' }));
      setCallStartedAt(Date.now());
    } catch (err) {
      console.error('acceptCall failed', err);
      socket.emit('call:reject', { callId: current.callId, reason: 'no-media' });
      cleanup();
    }
  }, [socket, ensurePeerConnection, cleanup]);

  const rejectCall = useCallback(() => {
    const current = stateRef.current;
    if (current.status !== 'incoming' || !socket) return;
    socket.emit('call:reject', { callId: current.callId });
    cleanup();
  }, [socket, cleanup]);

  const endCall = useCallback(() => {
    const current = stateRef.current;
    if (!socket || current.status === 'idle') return;
    if (current.status === 'outgoing') {
      socket.emit('call:cancel', { callId: current.callId });
    } else {
      socket.emit('call:end', { callId: current.callId });
    }
    cleanup();
  }, [socket, cleanup]);

  const toggleMute = useCallback(() => {
    const track = localStreamRef.current?.getAudioTracks()[0];
    if (!track) return;
    track.enabled = !track.enabled;
    setIsMuted(!track.enabled);
  }, []);

  const toggleCamera = useCallback(() => {
    const track = localStreamRef.current?.getVideoTracks()[0];
    if (!track) return;
    track.enabled = !track.enabled;
    setIsCameraOff(!track.enabled);
  }, []);

  const value = {
    status: state.status,
    callType: state.callType,
    otherUser: state.otherUser,
    isCaller: state.isCaller,
    localStream,
    remoteStream,
    isMuted,
    isCameraOff,
    callStartedAt,
    startCall,
    acceptCall,
    rejectCall,
    endCall,
    toggleMute,
    toggleCamera,
  };

  return (
    <CallContext.Provider value={value}>
      {children}
      {state.status === 'incoming' && <IncomingCallModal />}
      {state.status === 'outgoing' && <OutgoingCallScreen />}
      {state.status === 'active' && <ActiveCallScreen />}
    </CallContext.Provider>
  );
}
