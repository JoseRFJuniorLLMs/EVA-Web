/**
 * WebMCP Tools - Autenticação
 *
 * Login, logout e informações do usuário.
 */

import type { WebMCPTool } from '../adapter';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';

export const authTools: WebMCPTool[] = [
  {
    name: 'get_current_user',
    description: 'Retorna informações do usuário logado (nome, email, role, clinic).',
    inputSchema: { type: 'object', properties: {} },
    readOnly: true,
    execute: async () => {
      const userStr = localStorage.getItem(USER_KEY);
      if (!userStr) return { authenticated: false };
      try {
        const user = JSON.parse(userStr);
        return { authenticated: true, user };
      } catch {
        return { authenticated: false };
      }
    },
  },
  {
    name: 'login',
    description: 'Autentica um usuário com email e senha.',
    inputSchema: {
      type: 'object',
      properties: {
        email: { type: 'string', description: 'Email do usuário' },
        password: { type: 'string', description: 'Senha do usuário' },
      },
      required: ['email', 'password'],
    },
    execute: async (args) => {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: args.email, password: args.password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Login falhou');

      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      window.dispatchEvent(new Event('auth:changed'));
      return { success: true, user: data.user };
    },
  },
  {
    name: 'logout',
    description: 'Desloga o usuário atual.',
    inputSchema: { type: 'object', properties: {} },
    execute: async () => {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      window.dispatchEvent(new Event('auth:changed'));
      return { success: true };
    },
  },
];
