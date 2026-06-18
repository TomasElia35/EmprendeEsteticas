import React, { useEffect, useState, useCallback } from 'react';
import Icon from '../../components/ui/Icon';

let toastQueue = [];
let listeners = [];

const notify = (listeners) => listeners.forEach(fn => fn([...toastQueue]));

export const toast = {
  success: (msg) => addToast(msg, 'success'),
  error: (msg) => addToast(msg, 'error'),
  info: (msg) => addToast(msg, 'info'),
  warning: (msg) => addToast(msg, 'warning'),
};

function addToast(message, type) {
  const id = Date.now();
  toastQueue = [...toastQueue, { id, message, type }];
  notify(listeners);
  setTimeout(() => {
    toastQueue = toastQueue.filter(t => t.id !== id);
    notify(listeners);
  }, 3500);
}

function dismissToast(id) {
  toastQueue = toastQueue.filter(t => t.id !== id);
  notify(listeners);
}

const typeConfig = {
  success: {
    border: 'border-emerald-200',
    dot: 'bg-emerald-500',
    text: 'text-emerald-800',
    icon: 'check-circle',
    iconClass: 'w-5 h-5 text-emerald-500',
  },
  error: {
    border: 'border-red-200',
    dot: 'bg-red-500',
    text: 'text-red-700',
    icon: 'x-circle',
    iconClass: 'w-5 h-5 text-red-500',
  },
  info: {
    border: 'border-primary-200',
    dot: 'bg-primary-500',
    text: 'text-primary-700',
    icon: 'info',
    iconClass: 'w-5 h-5 text-primary-500',
  },
  warning: {
    border: 'border-amber-200',
    dot: 'bg-amber-500',
    text: 'text-amber-700',
    icon: 'alert',
    iconClass: 'w-5 h-5 text-amber-500',
  },
};

const ToastContainer = () => {
  const [toasts, setToasts] = useState([]);

  const handler = useCallback((list) => setToasts(list), []);

  useEffect(() => {
    listeners.push(handler);
    return () => { listeners = listeners.filter(l => l !== handler); };
  }, [handler]);

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => {
        const config = typeConfig[t.type] || typeConfig.info;
        return (
          <div
            key={t.id}
            className={`pointer-events-auto bg-white rounded-xl shadow-modal border ${config.border} px-4 py-3 flex items-center gap-3 text-sm font-medium animate-fade-in`}
          >
            <Icon name={config.icon} className={config.iconClass} />
            <span className={config.text}>{t.message}</span>
            <button
              onClick={() => dismissToast(t.id)}
              className="ml-auto text-primary-400 hover:text-primary-600 transition-colors"
              aria-label="Dismiss"
            >
              <Icon name="x" className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default ToastContainer;
