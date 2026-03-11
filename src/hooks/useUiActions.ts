import { useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

// Valid app routes that EVA can navigate to
const ALLOWED_ROUTES = new Set([
  '/dashboard', '/detection', '/patients', '/samples', '/zoom',
  '/microscopy', '/tuberculose', '/esquistossomose', '/doenca-sono',
  '/anemia-falciforme', '/epidemio/mapa', '/galeria', '/reports',
  '/clinics', '/users', '/settings', '/profile', '/comunicacoes', '/eva',
]);

// Allowed URL protocols for open_url
const SAFE_PROTOCOLS = new Set(['http:', 'https:']);

export interface UiAction {
  action: string;
  target?: string;
  url?: string;
  title?: string;
  message?: string;
  mode?: 'voice' | 'screen' | 'camera';
}

interface UseUiActionsOptions {
  onSwitchMode?: (mode: 'voice' | 'screen' | 'camera') => void;
  onPlayMedia?: (url: string, type: 'audio' | 'video') => void;
}

export function useUiActions(options: UseUiActionsOptions = {}) {
  const navigate = useNavigate();
  // Use ref to avoid options identity in dependency array
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const executeAction = useCallback((action: UiAction) => {
    const opts = optionsRef.current;
    switch (action.action) {
      case 'navigate': {
        const route = action.target;
        if (route && ALLOWED_ROUTES.has(route)) {
          navigate(route);
          toast.info(`EVA navegou para ${route}`);
        }
        break;
      }

      case 'open_url': {
        if (action.url) {
          try {
            const parsed = new URL(action.url);
            if (!SAFE_PROTOCOLS.has(parsed.protocol)) break;
          } catch { break; }
          window.open(action.url, '_blank', 'noopener,noreferrer');
          toast.info(action.title || 'Página aberta');
        }
        break;
      }

      case 'switch_mode': {
        if (action.mode && opts.onSwitchMode) {
          opts.onSwitchMode(action.mode);
          toast.info(`Modo alterado para ${action.mode}`);
        }
        break;
      }

      case 'play_media': {
        if (action.url && opts.onPlayMedia) {
          const type = action.url.match(/\.(mp4|webm|ogg|mov)/) ? 'video' : 'audio';
          opts.onPlayMedia(action.url, type);
        }
        break;
      }

      case 'show_notification': {
        const msg = action.message || action.title || '';
        if (msg) toast.info(msg);
        break;
      }

      case 'scroll_to': {
        if (action.target) {
          const el = document.getElementById(action.target) || document.querySelector(action.target);
          el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        break;
      }

      case 'fullscreen': {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(() => {});
        } else {
          document.exitFullscreen().catch(() => {});
        }
        break;
      }

      default:
        console.warn('[UI_ACTION] Unknown action:', action.action);
    }
  }, [navigate]);

  return { executeAction };
}
