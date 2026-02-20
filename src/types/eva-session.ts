export type SessionMode = 'voice' | 'screen' | 'camera';
export type SessionStatus = 'idle' | 'connecting' | 'active' | 'error';

export interface ChatMessage {
  text: string;
  from: 'user' | 'eva';
}

export interface SpeakerInfo {
  name: string;
  confidence: number;
  emotion: string;
  pitchHz: number;
  energy: number;
  stressLevel: number;
  isNew: boolean;
}

export interface GoogleStatus {
  connected: boolean;
  email: string;
}

export interface IdosoData {
  id: number;
  nome: string;
}
