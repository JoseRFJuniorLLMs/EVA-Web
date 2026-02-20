import { useRef, useCallback } from 'react';
import type { SessionMode } from '../types/eva-session';

export function useVideoCapture() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoStreamRef = useRef<MediaStream | null>(null);
  const frameIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const captureAndSendFrame = useCallback((sendFrame: (base64: string) => void) => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    if (video.videoWidth === 0 || video.videoHeight === 0) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const maxSize = 768;
    let w = video.videoWidth, h = video.videoHeight;
    if (w > maxSize || h > maxSize) { const scale = maxSize / Math.max(w, h); w = Math.round(w * scale); h = Math.round(h * scale); }
    canvas.width = w; canvas.height = h;
    ctx.drawImage(video, 0, 0, w, h);
    const base64 = canvas.toDataURL('image/jpeg', 0.7).split(',')[1];
    sendFrame(base64);
  }, []);

  const stopVideoCapture = useCallback(() => {
    if (frameIntervalRef.current) { clearInterval(frameIntervalRef.current); frameIntervalRef.current = null; }
    if (videoStreamRef.current) { videoStreamRef.current.getTracks().forEach(t => t.stop()); videoStreamRef.current = null; }
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  const startVideoCapture = useCallback(async (
    mode: 'screen' | 'camera',
    sendFrame: (base64: string) => void,
    onScreenEnd?: () => void
  ): Promise<boolean> => {
    try {
      let stream: MediaStream;
      if (mode === 'screen') {
        stream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
        if (onScreenEnd) stream.getVideoTracks()[0].onended = onScreenEnd;
      } else {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      }
      videoStreamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      frameIntervalRef.current = setInterval(() => captureAndSendFrame(sendFrame), 1000);
      return true;
    } catch {
      return false;
    }
  }, [captureAndSendFrame]);

  const switchVideoMode = useCallback(async (
    newMode: SessionMode,
    sendFrame: (base64: string) => void,
    onScreenEnd?: () => void
  ): Promise<boolean> => {
    stopVideoCapture();
    if (newMode === 'voice') return true;
    return startVideoCapture(newMode, sendFrame, onScreenEnd);
  }, [stopVideoCapture, startVideoCapture]);

  return {
    videoRef,
    canvasRef,
    startVideoCapture,
    stopVideoCapture,
    switchVideoMode,
    startFrameCapture: (sendFrame: (base64: string) => void) => {
      if (!frameIntervalRef.current) {
        frameIntervalRef.current = setInterval(() => captureAndSendFrame(sendFrame), 1000);
      }
    },
  };
}
