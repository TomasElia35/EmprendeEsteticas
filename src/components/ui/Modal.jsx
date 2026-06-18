import React, { useEffect } from 'react';
import Icon from '../../components/ui/Icon';

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeMap = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0"
        onClick={onClose}
      />
      {/* Panel */}
      <div className={`relative bg-white rounded-3xl shadow-modal w-full ${sizeMap[size]} max-h-[90vh] flex flex-col animate-fade-in`}>
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-primary-100 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-secondary">{title}</h2>
          <button
            onClick={onClose}
            className="btn-ghost p-1"
          >
            <Icon name="x" className="w-5 h-5 text-primary-500" />
          </button>
        </div>
        {/* Body */}
        <div className="overflow-y-auto flex-1 px-6 py-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
