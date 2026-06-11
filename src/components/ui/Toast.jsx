import React, { useEffect, useState, useCallback } from 'react';

let toastQueue = [];
let listeners = [];

const notify = (listeners) => listeners.forEach(fn => fn([...toastQueue]));

export const toast = {
  success: (msg) => addToast(msg, 'success'),
  error: (msg) => addToast(msg, 'error'),
  info: (msg) => addToast(msg, 'info'),
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

const iconMap = {
  success: (
    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
    </svg>
  ),
  error: (
    <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  info: (
    <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 100 20A10 10 0 0012 2z" />
    </svg>
  ),
};

const colorMap = {
  success: 'border-green-200 bg-green-50',
  error: 'border-red-200 bg-red-50',
  info: 'border-blue-200 bg-blue-50',
};

const ToastContainer = () => {
  const [toasts, setToasts] = useState([]);

  const handler = useCallback((list) => setToasts(list), []);

  useEffect(() => {
    listeners.push(handler);
    return () => { listeners = listeners.filter(l => l !== handler); };
  }, [handler]);

  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-3 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg text-sm font-medium text-secondary animate-fade-in ${colorMap[t.type]}`}
        >
          {iconMap[t.type]}
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
