import { useState, useCallback } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useEvaSession } from '../hooks/useEvaSession';
import { EvaLoginScreen } from '../components/eva/EvaLoginScreen';
import { EvaHeader } from '../components/eva/EvaHeader';
import { EvaIdleView } from '../components/eva/EvaIdleView';
import { EvaSessionView } from '../components/eva/EvaSessionView';
import type { GoogleStatus } from '../types/eva-session';

export function EvaPage() {
  const { t } = useLanguage();

  // Authentication state (managed at page level since it gates everything)
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [cpf, setCpf] = useState('');
  const [googleStatus, setGoogleStatus] = useState<GoogleStatus | null>(null);

  // Session (all session/audio/video/WS state lives in this hook)
  const session = useEvaSession(cpf, t);

  const handleAuthenticated = useCallback((rawCpf: string, gStatus: GoogleStatus | null) => {
    setCpf(rawCpf);
    setGoogleStatus(gStatus);
    setIsAuthenticated(true);
  }, []);

  const handleLogout = useCallback(() => {
    session.stopSession();
    setIsAuthenticated(false);
    setCpf('');
    setGoogleStatus(null);
  }, [session]);

  if (!isAuthenticated) {
    return <EvaLoginScreen onAuthenticated={handleAuthenticated} />;
  }

  const isActive = session.sessionStatus === 'active' || session.sessionStatus === 'connecting';

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)]">
      {/* Hidden video/canvas for capture */}
      <video ref={session.videoRef} autoPlay playsInline muted className="absolute w-px h-px opacity-0 pointer-events-none" />
      <canvas ref={session.canvasRef} className="absolute w-px h-px opacity-0 pointer-events-none" />

      <EvaHeader
        cpf={cpf}
        googleStatus={googleStatus}
        sessionStatus={session.sessionStatus}
        activeMode={session.activeMode}
        isSpeaking={session.isSpeaking}
        onStop={session.stopSession}
        onLogout={handleLogout}
        t={t}
      />

      {!isActive && session.sessionStatus !== 'error' ? (
        <div className="flex-1 overflow-y-auto py-6">
          <EvaIdleView
            isAuthenticated={isAuthenticated}
            showVideoOptions={session.showVideoOptions}
            onStartSession={session.startSession}
            onSetShowVideoOptions={session.setShowVideoOptions}
            t={t}
          />
        </div>
      ) : (
        <EvaSessionView
          messages={session.messages}
          subtitleText={session.subtitleText}
          speakerInfo={session.speakerInfo}
          activeMode={session.activeMode}
          isSpeaking={session.isSpeaking}
          sessionStatus={session.sessionStatus}
          toolEvents={session.toolEvents}
          activeMusic={session.activeMusic}
          activeTimer={session.activeTimer}
          waveCanvasRef={session.waveCanvasRef}
          onSendText={session.sendTextMessage}
          onDismissEvent={session.dismissEvent}
          onSwitchMode={session.switchMode}
          t={t}
        />
      )}
    </div>
  );
}
