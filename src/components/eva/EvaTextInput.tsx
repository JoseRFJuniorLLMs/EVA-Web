import { useState, useRef, KeyboardEvent } from 'react';
import { Send, Paperclip } from 'lucide-react';

interface EvaTextInputProps {
  onSend: (text: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function EvaTextInput({ onSend, disabled, placeholder = 'Digite ou fale...' }: EvaTextInputProps) {
  const [text, setText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setText('');
    inputRef.current?.focus();
  };

  const handleKey = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-white border-t border-gray-200">
      <input
        ref={inputRef}
        type="text"
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={handleKey}
        placeholder={placeholder}
        disabled={disabled}
        className="flex-1 px-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20 disabled:opacity-50"
      />
      <button
        onClick={handleSend}
        disabled={disabled || !text.trim()}
        className="p-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        <Send className="w-4 h-4" />
      </button>
    </div>
  );
}
