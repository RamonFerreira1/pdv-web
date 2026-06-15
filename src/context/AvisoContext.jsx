import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const AvisoContext = createContext();

const ICONS = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const STYLES = {
  success: 'bg-darkCard border-primaryGreen/60 text-white',
  error: 'bg-darkCard border-red-500/60 text-white',
  warning: 'bg-darkCard border-amber-500/60 text-white',
  info: 'bg-darkCard border-blue-500/60 text-white',
};

const ICON_COLORS = {
  success: 'text-primaryGreen',
  error: 'text-red-400',
  warning: 'text-amber-400',
  info: 'text-blue-400',
};

function ToastItem({ toast, onDismiss }) {
  const Icon = ICONS[toast.type] || ICONS.info;

  return (
    <div
      className={`flex items-start gap-3 px-4 py-3 rounded-xl border shadow-2xl backdrop-blur-sm min-w-[280px] max-w-sm animate-slide-in ${STYLES[toast.type]}`}
    >
      <Icon size={20} className={`shrink-0 mt-0.5 ${ICON_COLORS[toast.type]}`} />
      <p className="text-sm flex-1 leading-snug">{toast.message}</p>
      <button
        onClick={() => onDismiss(toast.id)}
        className="text-slate-500 hover:text-white transition-colors shrink-0 mt-0.5"
      >
        <X size={16} />
      </button>
    </div>
  );
}

function ToastContainer({ toasts, onDismiss }) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 items-end">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}

export function AvisoProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const mostrarAviso = useCallback((message, type = 'success', duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev.slice(-4), { id, message, type }]); // max 5 toasts
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  return (
    <AvisoContext.Provider value={{ mostrarAviso }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </AvisoContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(AvisoContext);
  if (!ctx) throw new Error('useToast must be used within AvisoProvider');
  return ctx;
}
//A 