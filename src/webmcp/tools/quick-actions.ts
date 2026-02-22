/**
 * WebMCP Tools - Quick Actions
 *
 * Ações rápidas que enviam comandos de voz/texto para a EVA.
 * Requer sessão ativa (eva_start_session deve ser chamado antes).
 */

import type { WebMCPTool } from '../adapter';

export const quickActionTools: WebMCPTool[] = [
  {
    name: 'web_search',
    description: 'Pesquisa na web através da EVA. Requer sessão ativa.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Termo de busca' },
      },
      required: ['query'],
    },
    execute: async (args) => {
      if (!window.__evaSession) throw new Error('Sessão EVA não ativa');
      window.__evaSession.sendTextMessage(`pesquise na web sobre ${args.query}`);
      return { success: true, command: `pesquise na web sobre ${args.query}` };
    },
  },
  {
    name: 'send_email_command',
    description: 'Solicita à EVA que envie um email. Requer sessão ativa.',
    inputSchema: {
      type: 'object',
      properties: {
        recipient: { type: 'string', description: 'Destinatário do email' },
        subject: { type: 'string', description: 'Assunto (opcional)' },
        body: { type: 'string', description: 'Corpo do email (opcional)' },
      },
      required: ['recipient'],
    },
    execute: async (args) => {
      if (!window.__evaSession) throw new Error('Sessão EVA não ativa');
      let cmd = `envie um email para ${args.recipient}`;
      if (args.subject) cmd += ` com assunto ${args.subject}`;
      if (args.body) cmd += ` dizendo ${args.body}`;
      window.__evaSession.sendTextMessage(cmd);
      return { success: true, command: cmd };
    },
  },
  {
    name: 'send_whatsapp_command',
    description: 'Solicita à EVA que envie uma mensagem WhatsApp. Requer sessão ativa.',
    inputSchema: {
      type: 'object',
      properties: {
        contact: { type: 'string', description: 'Nome ou número do contato' },
        message: { type: 'string', description: 'Mensagem a enviar' },
      },
      required: ['contact', 'message'],
    },
    execute: async (args) => {
      if (!window.__evaSession) throw new Error('Sessão EVA não ativa');
      const cmd = `envie whatsapp para ${args.contact} dizendo ${args.message}`;
      window.__evaSession.sendTextMessage(cmd);
      return { success: true, command: cmd };
    },
  },
  {
    name: 'play_music_command',
    description: 'Solicita à EVA que toque uma música. Requer sessão ativa.',
    inputSchema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Nome da música ou artista' },
      },
      required: ['query'],
    },
    execute: async (args) => {
      if (!window.__evaSession) throw new Error('Sessão EVA não ativa');
      window.__evaSession.sendTextMessage(`toque a música ${args.query}`);
      return { success: true, command: `toque a música ${args.query}` };
    },
  },
  {
    name: 'set_alarm_command',
    description: 'Define um alarme via EVA. Requer sessão ativa.',
    inputSchema: {
      type: 'object',
      properties: {
        time: { type: 'string', description: 'Horário do alarme (ex: 14:30, daqui 10 minutos)' },
        label: { type: 'string', description: 'Descrição do alarme (opcional)' },
      },
      required: ['time'],
    },
    execute: async (args) => {
      if (!window.__evaSession) throw new Error('Sessão EVA não ativa');
      let cmd = `defina um alarme para ${args.time}`;
      if (args.label) cmd += ` ${args.label}`;
      window.__evaSession.sendTextMessage(cmd);
      return { success: true, command: cmd };
    },
  },
  {
    name: 'emergency_sos',
    description: 'Aciona protocolo de emergência via EVA. Requer sessão ativa.',
    inputSchema: { type: 'object', properties: {} },
    execute: async () => {
      if (!window.__evaSession) throw new Error('Sessão EVA não ativa');
      window.__evaSession.sendTextMessage('emergência');
      return { success: true, command: 'emergência' };
    },
  },
  {
    name: 'start_meditation_command',
    description: 'Inicia meditação guiada via EVA. Requer sessão ativa.',
    inputSchema: { type: 'object', properties: {} },
    execute: async () => {
      if (!window.__evaSession) throw new Error('Sessão EVA não ativa');
      window.__evaSession.sendTextMessage('inicie meditação guiada');
      return { success: true, command: 'inicie meditação guiada' };
    },
  },
  {
    name: 'eva_command',
    description: 'Envia qualquer comando de texto livre para a EVA. Use para ações que não têm tool específico. Requer sessão ativa.',
    inputSchema: {
      type: 'object',
      properties: {
        command: { type: 'string', description: 'Comando em linguagem natural para a EVA' },
      },
      required: ['command'],
    },
    execute: async (args) => {
      if (!window.__evaSession) throw new Error('Sessão EVA não ativa');
      window.__evaSession.sendTextMessage(args.command as string);
      return { success: true, command: args.command };
    },
  },
];
