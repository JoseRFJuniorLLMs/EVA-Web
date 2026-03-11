import { memo, useCallback } from 'react';
import { AlertTriangle } from 'lucide-react';

interface EvaSosProps {
  onSOS: () => void;
}

export const EvaSOS = memo(function EvaSOS({ onSOS }: EvaSosProps) {
  const handleClick = useCallback(() => {
    if (window.confirm('Tem certeza que deseja ativar o SOS de emergência?')) {
      onSOS();
    }
  }, [onSOS]);

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-24 right-4 z-50 w-14 h-14 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer"
      title="SOS - Emergência"
      aria-label="SOS - Emergência"
    >
      <AlertTriangle className="w-6 h-6" />
    </button>
  );
});
