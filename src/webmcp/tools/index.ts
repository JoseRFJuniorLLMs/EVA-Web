/**
 * WebMCP Tools Registry - EVA-Web
 *
 * Inicializa o WebMCP e registra todos os tools disponíveis.
 */

import { webmcp } from '../adapter';
import { sessionTools } from './session';
import { uiActionTools } from './ui-actions';
import { authTools } from './auth';
import { quickActionTools } from './quick-actions';

export async function initWebMCP(): Promise<void> {
  await webmcp.init();

  // Registra todos os tools
  webmcp.registerTools(authTools);
  webmcp.registerTools(uiActionTools);
  webmcp.registerTools(sessionTools);
  webmcp.registerTools(quickActionTools);

  console.log(`[WebMCP] EVA-Web: ${webmcp.toolCount} tools registrados`);
  console.log('[WebMCP] Tools:', webmcp.listTools().map((t) => t.name).join(', '));
}

export { webmcp };
