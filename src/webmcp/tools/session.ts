/**
 * WebMCP Tools - Sessão EVA
 *
 * Expõe controle de sessão EVA para agentes de IA.
 * Usa bridge global para acessar funções do React hooks.
 */

import type { WebMCPTool } from '../adapter';

/** Bridge global que os React hooks registram seus métodos */
export interface EvaSessionBridge {
  startSession: (mode: 'voice' | 'screen' | 'camera') => Promise<void>;
  stopSession: () => void;
  sendTextMessage: (text: string) => void;
  switchMode: (mode: 'voice' | 'screen' | 'camera') => Promise<void>;
  getStatus: () => { activeMode: string | null; sessionStatus: string; isSpeaking: boolean };
}

declare global {
  interface Window {
    __evaSession?: EvaSessionBridge;
  }
}

function getSession(): EvaSessionBridge {
  if (!window.__evaSession) throw new Error('Sessão EVA não inicializada. O app precisa estar carregado.');
  return window.__evaSession;
}

export const sessionTools: WebMCPTool[] = [
  {
    name: 'eva_start_session',
    description: 'Inicia uma sessão com a EVA. Modos disponíveis: voice (voz), screen (compartilhamento de tela), camera (câmera).',
    inputSchema: {
      type: 'object',
      properties: {
        mode: { type: 'string', enum: ['voice', 'screen', 'camera'], description: 'Modo da sessão' },
      },
      required: ['mode'],
    },
    execute: async (args) => {
      const session = getSession();
      await session.startSession(args.mode as 'voice' | 'screen' | 'camera');
      return { success: true, mode: args.mode };
    },
  },
  {
    name: 'eva_stop_session',
    description: 'Encerra a sessão ativa com a EVA.',
    inputSchema: { type: 'object', properties: {} },
    execute: async () => {
      const session = getSession();
      session.stopSession();
      return { success: true };
    },
  },
  {
    name: 'eva_send_text',
    description: 'Envia uma mensagem de texto para a EVA durante uma sessão ativa.',
    inputSchema: {
      type: 'object',
      properties: {
        text: { type: 'string', description: 'Texto a enviar para a EVA' },
      },
      required: ['text'],
    },
    execute: async (args) => {
      const session = getSession();
      session.sendTextMessage(args.text as string);
      return { success: true, sent: args.text };
    },
  },
  {
    name: 'eva_switch_mode',
    description: 'Alterna o modo da sessão EVA ativa (voice, screen, camera).',
    inputSchema: {
      type: 'object',
      properties: {
        mode: { type: 'string', enum: ['voice', 'screen', 'camera'], description: 'Novo modo' },
      },
      required: ['mode'],
    },
    execute: async (args) => {
      const session = getSession();
      await session.switchMode(args.mode as 'voice' | 'screen' | 'camera');
      return { success: true, newMode: args.mode };
    },
  },
  {
    name: 'eva_session_status',
    description: 'Retorna o status atual da sessão EVA (modo ativo, status, se está falando).',
    inputSchema: { type: 'object', properties: {} },
    readOnly: true,
    execute: async () => {
      const session = getSession();
      return session.getStatus();
    },
  },
];
