import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

// Valid app routes that EVA can navigate to
const ALLOWED_ROUTES = new Set([
  '/dashboard', '/detection', '/patients', '/samples', '/zoom',
  '/microscopy', '/tuberculose', '/esquistossomose', '/doenca-sono',
  '/anemia-falciforme', '/epidemio/mapa', '/galeria', '/reports',
  '/clinics', '/users', '/settings', '/profile', '/comunicacoes', '/eva',
]);

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

  const executeAction = useCallback((action: UiAction) => {
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
          window.open(action.url, '_blank', 'noopener,noreferrer');
          toast.info(action.title || 'Página aberta');
        }
        break;
      }

      case 'switch_mode': {
        if (action.mode && options.onSwitchMode) {
          options.onSwitchMode(action.mode);
          toast.info(`Modo alterado para ${action.mode}`);
        }
        break;
      }

      case 'play_media': {
        if (action.url && options.onPlayMedia) {
          const type = action.url.match(/\.(mp4|webm|ogg|mov)/) ? 'video' : 'audio';
          options.onPlayMedia(action.url, type);
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
  }, [navigate, options]);

  return { executeAction };
}
