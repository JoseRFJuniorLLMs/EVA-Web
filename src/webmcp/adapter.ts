/**
 * WebMCP Adapter - Bridge entre W3C navigator.modelContext e @mcp-b/webmcp-polyfill
 *
 * Detecta suporte nativo (Chrome 146+) e usa polyfill como fallback.
 * API unificada para registrar tools, prompts e resources.
 */

export interface WebMCPTool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  execute: (args: Record<string, unknown>) => Promise<unknown>;
  readOnly?: boolean;
}

export interface WebMCPPrompt {
  name: string;
  description: string;
  args: Array<{ name: string; description: string; required?: boolean }>;
  handler: (args: Record<string, string>) => string;
}

export interface WebMCPResource {
  name: string;
  description: string;
  uri: string;
  mimeType: string;
  handler: () => Promise<unknown>;
}

interface ModelContextTool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  execute: (args: Record<string, unknown>) => Promise<{ content: Array<{ type: string; text: string }> }>;
  annotations?: { readOnlyHint?: boolean; idempotentHint?: boolean };
}

declare global {
  interface Navigator {
    modelContext?: {
      registerTool(tool: ModelContextTool): void;
      unregisterTool(name: string): void;
      provideContext(options: { tools: ModelContextTool[] }): void;
      clearContext(): void;
    };
  }
}

class WebMCPBridge {
  private tools: Map<string, WebMCPTool> = new Map();
  private prompts: Map<string, WebMCPPrompt> = new Map();
  private resources: Map<string, WebMCPResource> = new Map();
  private _native = false;
  private _polyfillLoaded = false;
  private _initialized = false;

  get isNative(): boolean {
    return this._native;
  }

  get isInitialized(): boolean {
    return this._initialized;
  }

  get toolCount(): number {
    return this.tools.size;
  }

  async init(): Promise<void> {
    if (this._initialized) return;

    // Detecta API nativa do W3C
    this._native = typeof navigator !== 'undefined' && !!navigator.modelContext;

    if (!this._native) {
      try {
        // Variável impede análise estática do bundler - fallback gracioso se não instalado
        const polyfillModule = '@mcp-b/' + 'webmcp-polyfill';
        const mod = await (Function('m', 'return import(m)')(polyfillModule) as Promise<any>);
        mod.initializeWebMCPPolyfill();
        this._polyfillLoaded = true;
        this._native = !!navigator.modelContext;
      } catch {
        // Polyfill não disponível - funciona em modo standalone
        console.warn('[WebMCP] Polyfill não instalado. Instale com: npm i @mcp-b/webmcp-polyfill');
      }
    }

    this._initialized = true;
    console.log(`[WebMCP] Inicializado | Nativo: ${this._native} | Polyfill: ${this._polyfillLoaded}`);
  }

  registerTool(tool: WebMCPTool): void {
    this.tools.set(tool.name, tool);

    if (this._native && navigator.modelContext) {
      navigator.modelContext.registerTool({
        name: tool.name,
        description: tool.description,
        inputSchema: tool.inputSchema,
        annotations: {
          readOnlyHint: tool.readOnly ?? false,
          idempotentHint: tool.readOnly ?? false,
        },
        execute: async (args) => {
          try {
            const result = await tool.execute(args);
            return {
              content: [{ type: 'text', text: JSON.stringify(result) }],
            };
          } catch (err) {
            return {
              content: [{ type: 'text', text: JSON.stringify({ error: String(err) }) }],
            };
          }
        },
      });
    }
  }

  registerTools(tools: WebMCPTool[]): void {
    tools.forEach((t) => this.registerTool(t));
  }

  unregisterTool(name: string): void {
    this.tools.delete(name);
    if (this._native && navigator.modelContext) {
      try {
        navigator.modelContext.unregisterTool(name);
      } catch { /* ignore */ }
    }
  }

  registerPrompt(prompt: WebMCPPrompt): void {
    this.prompts.set(prompt.name, prompt);
  }

  registerResource(resource: WebMCPResource): void {
    this.resources.set(resource.name, resource);
  }

  /** Executa um tool localmente (para testes ou uso sem agente) */
  async callTool(name: string, args: Record<string, unknown> = {}): Promise<unknown> {
    const tool = this.tools.get(name);
    if (!tool) throw new Error(`[WebMCP] Tool "${name}" não encontrado`);
    return tool.execute(args);
  }

  /** Lista todos os tools registrados */
  listTools(): Array<{ name: string; description: string; readOnly: boolean }> {
    return Array.from(this.tools.values()).map((t) => ({
      name: t.name,
      description: t.description,
      readOnly: t.readOnly ?? false,
    }));
  }

  clearAll(): void {
    if (this._native && navigator.modelContext) {
      navigator.modelContext.clearContext();
    }
    this.tools.clear();
    this.prompts.clear();
    this.resources.clear();
  }
}

// Singleton global
export const webmcp = new WebMCPBridge();
