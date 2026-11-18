import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext();

let toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = ++toastId;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  }, []);

  const toast = {
    success: (msg, dur) => addToast(msg, 'success', dur),
    error: (msg, dur) => addToast(msg, 'error', dur),
    warning: (msg, dur) => addToast(msg, 'warning', dur),
    info: (msg, dur) => addToast(msg, 'info', dur),
    confirm: (msg) => {
      return new Promise(resolve => {
        const id = ++toastId;
        setToasts(prev => [...prev, { id, message: msg, type: 'confirm', onConfirm: () => {
          setToasts(prev => prev.filter(t => t.id !== id));
          resolve(true);
        }, onCancel: () => {
          setToasts(prev => prev.filter(t => t.id !== id));
          resolve(false);
        }}]);
      });
    },
    prompt: (msg, defaultValue = '') => {
      return new Promise(resolve => {
        const id = ++toastId;
        setToasts(prev => [...prev, { id, message: msg, type: 'prompt', defaultValue, onConfirm: (val) => {
          setToasts(prev => prev.filter(t => t.id !== id));
          resolve(val);
        }, onCancel: () => {
          setToasts(prev => prev.filter(t => t.id !== id));
          resolve(null);
        }}]);
      });
    }
  };

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {toasts.map(t => (
          <ToastItem key={t.id} toast={t} onClose={() => removeToast(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastItem({ toast, onClose }) {
  const colors = {
    success: 'border-[var(--success-border)]/60 bg-[var(--success-bg)]',
    error: 'border-[var(--danger-border)]/60 bg-[var(--danger-bg)]',
    warning: 'border-[var(--warning-border)]/60 bg-[var(--warning-bg)]',
    info: 'border-[var(--accent-border)]/60 bg-[var(--accent-light)]',
    confirm: 'border-[var(--accent-border)]/60 bg-[var(--bg-header)]',
    prompt: 'border-[var(--accent-border)]/60 bg-[var(--bg-header)]',
  };

  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
    confirm: '?',
    prompt: '✎',
  };

  if (toast.type === 'confirm') {
    return (
      <div className={`pointer-events-auto rounded-xl border ${colors.confirm} backdrop-blur-md shadow-2xl p-4 animate-slide-in`}>
        <div className="flex items-start gap-3">
          <span className="text-lg">{icons.confirm}</span>
          <p className="text-[var(--text-primary)] text-sm flex-1">{toast.message}</p>
        </div>
        <div className="flex justify-end gap-2 mt-3">
          <button onClick={toast.onCancel} className="px-4 py-1.5 text-sm rounded-lg border border-[var(--border-primary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition">Cancel</button>
          <button onClick={toast.onConfirm} className="px-4 py-1.5 text-sm rounded-lg bg-[var(--accent)] text-[var(--text-primary)] hover:bg-[var(--accent-dark)] transition">Confirm</button>
        </div>
      </div>
    );
  }

  if (toast.type === 'prompt') {
    const [value, setValue] = useState(toast.defaultValue || '');
    return (
      <div className={`pointer-events-auto rounded-xl border ${colors.prompt} backdrop-blur-md shadow-2xl p-4 animate-slide-in`}>
        <p className="text-[var(--text-primary)] text-sm mb-3">{toast.message}</p>
        <input
          type="text"
          value={value}
          onChange={e => setValue(e.target.value)}
          className="w-full px-3 py-2 rounded-lg bg-[var(--bg-primary)] border border-[var(--border-primary)] text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--accent)] mb-3"
          autoFocus
          onKeyDown={e => { if (e.key === 'Enter') toast.onConfirm(value); }}
        />
        <div className="flex justify-end gap-2">
          <button onClick={toast.onCancel} className="px-4 py-1.5 text-sm rounded-lg border border-[var(--border-primary)] text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] transition">Cancel</button>
          <button onClick={() => toast.onConfirm(value)} className="px-4 py-1.5 text-sm rounded-lg bg-[var(--accent)] text-[var(--text-primary)] hover:bg-[var(--accent-dark)] transition">Submit</button>
        </div>
      </div>
    );
  }

  return (
    <div className={`pointer-events-auto rounded-xl border ${colors[toast.type]} backdrop-blur-md shadow-2xl p-4 animate-slide-in flex items-center gap-3`}>
      <span className="text-lg font-bold">{icons[toast.type]}</span>
      <p className="text-[var(--text-primary)] text-sm flex-1">{toast.message}</p>
      <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-lg leading-none">&times;</button>
    </div>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
