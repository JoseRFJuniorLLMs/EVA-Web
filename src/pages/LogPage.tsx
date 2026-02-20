import { useState, useEffect, useRef, useCallback } from 'react';
import { Terminal, Wifi, WifiOff, Trash2, Pause, Play, Filter, Volume2, VolumeX, Palette } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface LogEntry {
  id: number;
  raw: string;
  timestamp: string;
  level: string;
  message: string;
}

interface Theme {
  name: string;
  bg: string;
  headerBg: string;
  headerBorder: string;
  text: string;
  textMuted: string;
  timestamp: string;
  btnBg: string;
  btnBorder: string;
  btnText: string;
  badgeOk: string;
  badgeOkText: string;
  badgeErr: string;
  badgeErrText: string;
  selectBg: string;
  selectText: string;
  hover: string;
  levels: Record<string, string>;
  levelBg: Record<string, string>;
}

const THEMES: Record<string, Theme> = {
  github: {
    name: 'GitHub Dark',
    bg: '#0d1117',
    headerBg: '#161b22',
    headerBorder: '#30363d',
    text: '#e6edf3',
    textMuted: '#7d8590',
    timestamp: '#7d8590',
    btnBg: '#21262d',
    btnBorder: '#30363d',
    btnText: '#7d8590',
    badgeOk: 'bg-emerald-900/50 border border-emerald-800',
    badgeOkText: 'text-emerald-400',
    badgeErr: 'bg-red-900/50 border border-red-800',
    badgeErrText: 'text-red-400',
    selectBg: '#21262d',
    selectText: '#e6edf3',
    hover: 'hover:bg-[#1c2128]',
    levels: { debug: '#7d8590', info: '#3fb950', warn: '#d29922', warning: '#d29922', error: '#f85149', fatal: '#ff7b72' },
    levelBg: { debug: '', info: '', warn: 'rgba(187,128,9,0.1)', warning: 'rgba(187,128,9,0.1)', error: 'rgba(248,81,73,0.1)', fatal: 'rgba(248,81,73,0.15)' },
  },
  dracula: {
    name: 'Dracula',
    bg: '#282a36',
    headerBg: '#21222c',
    headerBorder: '#44475a',
    text: '#f8f8f2',
    textMuted: '#6272a4',
    timestamp: '#6272a4',
    btnBg: '#44475a',
    btnBorder: '#6272a4',
    btnText: '#bd93f9',
    badgeOk: 'bg-[#50fa7b]/10 border border-[#50fa7b]/30',
    badgeOkText: 'text-[#50fa7b]',
    badgeErr: 'bg-[#ff5555]/10 border border-[#ff5555]/30',
    badgeErrText: 'text-[#ff5555]',
    selectBg: '#44475a',
    selectText: '#f8f8f2',
    hover: 'hover:bg-[#44475a]/50',
    levels: { debug: '#6272a4', info: '#50fa7b', warn: '#f1fa8c', warning: '#f1fa8c', error: '#ff5555', fatal: '#ff79c6' },
    levelBg: { debug: '', info: '', warn: 'rgba(241,250,140,0.08)', warning: 'rgba(241,250,140,0.08)', error: 'rgba(255,85,85,0.1)', fatal: 'rgba(255,121,198,0.12)' },
  },
  monokai: {
    name: 'Monokai',
    bg: '#272822',
    headerBg: '#1e1f1c',
    headerBorder: '#3e3d32',
    text: '#f8f8f2',
    textMuted: '#75715e',
    timestamp: '#75715e',
    btnBg: '#3e3d32',
    btnBorder: '#575751',
    btnText: '#a6e22e',
    badgeOk: 'bg-[#a6e22e]/10 border border-[#a6e22e]/30',
    badgeOkText: 'text-[#a6e22e]',
    badgeErr: 'bg-[#f92672]/10 border border-[#f92672]/30',
    badgeErrText: 'text-[#f92672]',
    selectBg: '#3e3d32',
    selectText: '#f8f8f2',
    hover: 'hover:bg-[#3e3d32]/60',
    levels: { debug: '#75715e', info: '#a6e22e', warn: '#e6db74', warning: '#e6db74', error: '#f92672', fatal: '#fd971f' },
    levelBg: { debug: '', info: '', warn: 'rgba(230,219,116,0.08)', warning: 'rgba(230,219,116,0.08)', error: 'rgba(249,38,114,0.1)', fatal: 'rgba(253,151,31,0.12)' },
  },
  solarized: {
    name: 'Solarized',
    bg: '#002b36',
    headerBg: '#073642',
    headerBorder: '#586e75',
    text: '#93a1a1',
    textMuted: '#586e75',
    timestamp: '#586e75',
    btnBg: '#073642',
    btnBorder: '#586e75',
    btnText: '#2aa198',
    badgeOk: 'bg-[#2aa198]/10 border border-[#2aa198]/30',
    badgeOkText: 'text-[#2aa198]',
    badgeErr: 'bg-[#dc322f]/10 border border-[#dc322f]/30',
    badgeErrText: 'text-[#dc322f]',
    selectBg: '#073642',
    selectText: '#93a1a1',
    hover: 'hover:bg-[#073642]/80',
    levels: { debug: '#586e75', info: '#2aa198', warn: '#b58900', warning: '#b58900', error: '#dc322f', fatal: '#cb4b16' },
    levelBg: { debug: '', info: '', warn: 'rgba(181,137,0,0.1)', warning: 'rgba(181,137,0,0.1)', error: 'rgba(220,50,47,0.1)', fatal: 'rgba(203,75,22,0.12)' },
  },
  matrix: {
    name: 'Matrix',
    bg: '#0a0a0a',
    headerBg: '#0f0f0f',
    headerBorder: '#1a3a1a',
    text: '#00ff41',
    textMuted: '#00802080',
    timestamp: '#006620',
    btnBg: '#0f1a0f',
    btnBorder: '#1a3a1a',
    btnText: '#00ff41',
    badgeOk: 'bg-[#00ff41]/10 border border-[#00ff41]/30',
    badgeOkText: 'text-[#00ff41]',
    badgeErr: 'bg-[#ff0040]/10 border border-[#ff0040]/30',
    badgeErrText: 'text-[#ff0040]',
    selectBg: '#0f1a0f',
    selectText: '#00ff41',
    hover: 'hover:bg-[#0a1f0a]',
    levels: { debug: '#004d00', info: '#00ff41', warn: '#ccff00', warning: '#ccff00', error: '#ff0040', fatal: '#ff0000' },
    levelBg: { debug: '', info: '', warn: 'rgba(204,255,0,0.05)', warning: 'rgba(204,255,0,0.05)', error: 'rgba(255,0,64,0.08)', fatal: 'rgba(255,0,0,0.1)' },
  },
  light: {
    name: 'Light',
    bg: '#ffffff',
    headerBg: '#f6f8fa',
    headerBorder: '#d1d5db',
    text: '#1f2937',
    textMuted: '#6b7280',
    timestamp: '#9ca3af',
    btnBg: '#f3f4f6',
    btnBorder: '#d1d5db',
    btnText: '#374151',
    badgeOk: 'bg-emerald-100 border border-emerald-300',
    badgeOkText: 'text-emerald-700',
    badgeErr: 'bg-red-100 border border-red-300',
    badgeErrText: 'text-red-700',
    selectBg: '#f3f4f6',
    selectText: '#1f2937',
    hover: 'hover:bg-gray-100',
    levels: { debug: '#9ca3af', info: '#059669', warn: '#d97706', warning: '#d97706', error: '#dc2626', fatal: '#be123c' },
    levelBg: { debug: '', info: '', warn: 'rgba(217,119,6,0.08)', warning: 'rgba(217,119,6,0.08)', error: 'rgba(220,38,38,0.08)', fatal: 'rgba(190,18,60,0.1)' },
  },
};

// Error beep: two descending tones
function playErrorBeep() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    osc.type = 'sine';
    gain.gain.value = 0.15;
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.3);
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.frequency.value = 660;
    osc2.type = 'sine';
    gain2.gain.value = 0.15;
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.55);
    osc2.start(ctx.currentTime + 0.15);
    osc2.stop(ctx.currentTime + 0.55);
    osc2.onended = () => ctx.close();
  } catch { /* audio not available */ }
}

// User connected: two ascending friendly tones
function playUserBeep() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 523;
    osc.type = 'sine';
    gain.gain.value = 0.12;
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.2);
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.frequency.value = 784;
    osc2.type = 'sine';
    gain2.gain.value = 0.12;
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
    osc2.start(ctx.currentTime + 0.12);
    osc2.stop(ctx.currentTime + 0.4);
    osc2.onended = () => ctx.close();
  } catch { /* audio not available */ }
}

const USER_CONNECTED_PATTERNS = ['Browser voice session started', 'WebSocket conectado', 'voice session started'];

function parseLine(raw: string, id: number): LogEntry {
  let timestamp = '';
  let level = 'info';
  let message = raw;

  const jsonStart = raw.indexOf('{');
  if (jsonStart !== -1) {
    try {
      const json = JSON.parse(raw.substring(jsonStart));
      timestamp = json.time || json.timestamp || '';
      level = String(json.level || 'info');
      message = json.message || json.msg || raw.substring(jsonStart);
      if (json.component) message = `[${json.component}] ${message}`;
      if (json.error) message += ` | error=${json.error}`;
    } catch {
      // Not JSON, use as-is
    }
  }

  if (!timestamp) {
    const tsMatch = raw.match(/^(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{4})/);
    if (tsMatch) {
      timestamp = tsMatch[1];
      message = raw.substring(tsMatch[0].length).replace(/^\s+\S+\s+\S+\s+/, '');
    }
  }

  if (level === 'info') {
    const lower = raw.toLowerCase();
    if (lower.includes('"level":"error"') || lower.includes('erro') || lower.includes('\u274c')) level = 'error';
    else if (lower.includes('"level":"warn"') || lower.includes('\u26a0')) level = 'warn';
    else if (lower.includes('"level":"debug"') || lower.includes('debug')) level = 'debug';
    else if (lower.includes('"level":"fatal"') || lower.includes('fatal') || lower.includes('panic')) level = 'fatal';
  }

  if (timestamp) {
    try {
      const d = new Date(timestamp);
      if (!isNaN(d.getTime())) {
        timestamp = d.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
      }
    } catch { /* keep original */ }
  }

  return { id, raw, timestamp, level: String(level), message };
}

function getWsUrl(): string {
  const proto = location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${proto}//${location.host}/ws/logs`;
}

export function LogPage() {
  const { t } = useLanguage();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [connected, setConnected] = useState(false);
  const [paused, setPaused] = useState(false);
  const [filter, setFilter] = useState('all');
  const [soundOn, setSoundOn] = useState(true);
  const [themeKey, setThemeKey] = useState(() => localStorage.getItem('log-theme') || 'github');
  const [showThemes, setShowThemes] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const idRef = useRef(0);
  const reconnectRef = useRef<ReturnType<typeof setTimeout>>();
  const soundOnRef = useRef(true);

  const theme = THEMES[themeKey] || THEMES.github;

  const MAX_LINES = 5000;

  useEffect(() => { soundOnRef.current = soundOn; }, [soundOn]);
  useEffect(() => { localStorage.setItem('log-theme', themeKey); }, [themeKey]);

  const addLine = useCallback((raw: string) => {
    const entry = parseLine(raw, ++idRef.current);
    if (soundOnRef.current) {
      if (entry.level === 'error' || entry.level === 'fatal') {
        playErrorBeep();
      } else if (USER_CONNECTED_PATTERNS.some(p => entry.message.includes(p))) {
        playUserBeep();
      }
    }
    setLogs(prev => {
      const next = [...prev, entry];
      return next.length > MAX_LINES ? next.slice(next.length - MAX_LINES) : next;
    });
  }, []);

  const connect = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) return;

    const ws = new WebSocket(getWsUrl());
    wsRef.current = ws;

    ws.onopen = () => { setConnected(true); };

    ws.onmessage = (event: MessageEvent) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === 'log' && msg.data) {
          addLine(msg.data);
        }
      } catch {
        addLine(event.data);
      }
    };

    ws.onclose = () => {
      setConnected(false);
      wsRef.current = null;
      reconnectRef.current = setTimeout(connect, 3000);
    };

    ws.onerror = () => { setConnected(false); };
  }, [addLine]);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
      if (wsRef.current) { wsRef.current.close(); wsRef.current = null; }
    };
  }, [connect]);

  useEffect(() => {
    if (!paused && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs, paused]);

  const filtered = filter === 'all' ? logs : logs.filter(l => l.level === filter);

  return (
    <div className="flex flex-col h-screen" style={{ backgroundColor: theme.bg }}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ backgroundColor: theme.headerBg, borderBottom: `1px solid ${theme.headerBorder}` }}
      >
        <div className="flex items-center gap-3">
          <Terminal className="w-5 h-5" style={{ color: theme.levels.info }} />
          <h1 className="text-lg font-bold" style={{ color: theme.text }}>EVA-Mind Logs</h1>
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
            connected ? `${theme.badgeOk} ${theme.badgeOkText}` : `${theme.badgeErr} ${theme.badgeErrText}`
          }`}>
            {connected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            {connected ? t('log.connected') : t('log.disconnected')}
          </span>
          <span className="text-xs" style={{ color: theme.textMuted }}>{filtered.length} {t('log.lines')}</span>
        </div>
        <div className="flex items-center gap-2">
          {/* Filter */}
          <div className="flex items-center gap-1.5 rounded-lg px-2 py-1" style={{ backgroundColor: theme.btnBg, border: `1px solid ${theme.btnBorder}` }}>
            <Filter className="w-3.5 h-3.5" style={{ color: theme.btnText }} />
            <select
              value={filter}
              onChange={e => setFilter(e.target.value)}
              className="bg-transparent text-sm outline-none cursor-pointer"
              style={{ color: theme.selectText }}
            >
              <option value="all" style={{ backgroundColor: theme.selectBg }}>{t('common.all')}</option>
              <option value="debug" style={{ backgroundColor: theme.selectBg }}>Debug</option>
              <option value="info" style={{ backgroundColor: theme.selectBg }}>Info</option>
              <option value="warn" style={{ backgroundColor: theme.selectBg }}>Warn</option>
              <option value="error" style={{ backgroundColor: theme.selectBg }}>Error</option>
              <option value="fatal" style={{ backgroundColor: theme.selectBg }}>Fatal</option>
            </select>
          </div>
          {/* Theme picker */}
          <div className="relative">
            <button
              onClick={() => setShowThemes(!showThemes)}
              className="p-2 rounded-lg transition-colors cursor-pointer"
              style={{ backgroundColor: theme.btnBg, border: `1px solid ${theme.btnBorder}`, color: theme.btnText }}
              title="Theme"
            >
              <Palette className="w-4 h-4" />
            </button>
            {showThemes && (
              <div
                className="absolute right-0 top-full mt-1 rounded-lg shadow-xl z-50 py-1 min-w-[160px]"
                style={{ backgroundColor: theme.headerBg, border: `1px solid ${theme.headerBorder}` }}
              >
                {Object.entries(THEMES).map(([key, th]) => (
                  <button
                    key={key}
                    onClick={() => { setThemeKey(key); setShowThemes(false); }}
                    className="w-full text-left px-3 py-2 text-sm flex items-center gap-2 cursor-pointer transition-opacity hover:opacity-80"
                    style={{ color: themeKey === key ? th.levels.info : theme.textMuted }}
                  >
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: th.bg, border: `2px solid ${th.levels.info}` }} />
                    {th.name}
                    {themeKey === key && <span className="ml-auto text-xs">&#10003;</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
          {/* Sound toggle */}
          <button
            onClick={() => setSoundOn(!soundOn)}
            className="p-2 rounded-lg transition-colors cursor-pointer"
            style={{
              backgroundColor: soundOn ? undefined : theme.btnBg,
              border: `1px solid ${soundOn ? theme.levels.info + '50' : theme.btnBorder}`,
              color: soundOn ? theme.levels.info : theme.btnText,
            }}
            title={soundOn ? 'Mute sounds' : 'Enable sounds'}
          >
            {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
          {/* Pause */}
          <button
            onClick={() => setPaused(!paused)}
            className="p-2 rounded-lg transition-colors cursor-pointer"
            style={{
              backgroundColor: paused ? undefined : theme.btnBg,
              border: `1px solid ${paused ? theme.levels.warn + '50' : theme.btnBorder}`,
              color: paused ? theme.levels.warn : theme.btnText,
            }}
            title={paused ? t('log.resumeScroll') : t('log.pauseScroll')}
          >
            {paused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          </button>
          {/* Clear */}
          <button
            onClick={() => setLogs([])}
            className="p-2 rounded-lg transition-colors cursor-pointer"
            style={{ backgroundColor: theme.btnBg, border: `1px solid ${theme.btnBorder}`, color: theme.btnText }}
            title={t('log.clearLogs')}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Log Terminal */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto font-mono text-xs leading-5"
      >
        {filtered.length === 0 ? (
          <div className="flex items-center justify-center h-full" style={{ color: theme.textMuted }}>
            {connected ? t('log.waiting') : t('log.connecting')}
          </div>
        ) : (
          <div className="p-3">
            {filtered.map(entry => (
              <div
                key={entry.id}
                className={`px-2 py-0.5 rounded ${theme.hover}`}
                style={{ backgroundColor: theme.levelBg[entry.level] || 'transparent' }}
              >
                {entry.timestamp && (
                  <span className="mr-2" style={{ color: theme.timestamp }}>{entry.timestamp}</span>
                )}
                <span className="uppercase mr-2 font-bold" style={{ color: theme.levels[entry.level] || theme.textMuted }}>
                  {String(entry.level || 'info').padEnd(5)}
                </span>
                <span style={{ color: theme.text }}>{entry.message}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
