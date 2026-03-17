import { X } from 'lucide-react';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';

interface Sd_ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
}

export const Sd_Modal = ({ isOpen, onClose, title, description, children }: Sd_ModalProps) => {
  // Закрытие по Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      // Убираем жесткий overflow: hidden, так как он вызывает баг прыгающего скроллбара
      // document.body.style.overflow = 'hidden'; 
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      // document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
      />

      {/* Modal Window */}
      <div
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-[0.98] duration-200 ease-out"
      >
        {/* Header */}
        <div className="p-6 md:p-8 pb-4 md:pb-6 flex items-start justify-between bg-white relative">
          <div className="space-y-1 pr-10 sm:pr-0">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">{title}</h2>
            {description && <p className="text-sm md:text-base text-gray-500 font-medium leading-snug">{description}</p>}
          </div>
          <button
            onClick={onClose}
            className="absolute top-6 right-6 sm:static p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
            type="button"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8 pt-2 md:pt-4 bg-white overflow-y-auto max-h-[75vh] sd_custom-scroll">
          {children}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};
