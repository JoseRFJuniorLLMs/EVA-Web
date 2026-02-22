/**
 * WebMCP Tools - Ações de UI
 *
 * Navegação, notificações, fullscreen e outras ações de interface.
 */

import type { WebMCPTool } from '../adapter';

const ALLOWED_ROUTES = [
  '/dashboard', '/detection', '/patients', '/samples', '/zoom',
  '/microscopy', '/tuberculose', '/esquistossomose', '/doenca-sono',
  '/anemia-falciforme', '/epidemio/mapa', '/galeria', '/reports',
  '/clinics', '/users', '/settings', '/profile', '/comunicacoes', '/eva',
];

export const uiActionTools: WebMCPTool[] = [
  {
    name: 'navigate_to_page',
    description: `Navega para uma página do app. Rotas disponíveis: ${ALLOWED_ROUTES.join(', ')}`,
    inputSchema: {
      type: 'object',
      properties: {
        route: { type: 'string', enum: ALLOWED_ROUTES, description: 'Rota de destino' },
      },
      required: ['route'],
    },
    execute: async (args) => {
      const route = args.route as string;
      if (!ALLOWED_ROUTES.includes(route)) {
        return { error: `Rota "${route}" não permitida` };
      }
      window.location.hash = route;
      return { success: true, navigatedTo: route };
    },
  },
  {
    name: 'open_external_url',
    description: 'Abre uma URL externa em nova aba do navegador.',
    inputSchema: {
      type: 'object',
      properties: {
        url: { type: 'string', description: 'URL para abrir' },
        title: { type: 'string', description: 'Título opcional' },
      },
      required: ['url'],
    },
    execute: async (args) => {
      window.open(args.url as string, '_blank', 'noopener,noreferrer');
      return { success: true, url: args.url };
    },
  },
  {
    name: 'show_notification',
    description: 'Mostra uma notificação toast na tela.',
    inputSchema: {
      type: 'object',
      properties: {
        message: { type: 'string', description: 'Mensagem da notificação' },
        type: { type: 'string', enum: ['info', 'success', 'warning', 'error'], description: 'Tipo da notificação' },
      },
      required: ['message'],
    },
    execute: async (args) => {
      // Dispatch custom event que o app pode ouvir
      window.dispatchEvent(new CustomEvent('webmcp:notification', {
        detail: { message: args.message, type: args.type || 'info' },
      }));
      return { success: true, message: args.message };
    },
  },
  {
    name: 'toggle_fullscreen',
    description: 'Alterna o modo tela cheia do aplicativo.',
    inputSchema: { type: 'object', properties: {} },
    execute: async () => {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        return { success: true, fullscreen: true };
      } else {
        await document.exitFullscreen();
        return { success: true, fullscreen: false };
      }
    },
  },
  {
    name: 'scroll_to_element',
    description: 'Rola a página até um elemento específico (por ID ou seletor CSS).',
    inputSchema: {
      type: 'object',
      properties: {
        target: { type: 'string', description: 'ID do elemento ou seletor CSS' },
      },
      required: ['target'],
    },
    execute: async (args) => {
      const target = args.target as string;
      const el = document.getElementById(target) || document.querySelector(target);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return { success: true, target };
      }
      return { error: `Elemento "${target}" não encontrado` };
    },
  },
];
