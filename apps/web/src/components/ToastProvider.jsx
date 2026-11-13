import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import Toast from './Toast.jsx';

const ToastContext = createContext(null);
const DEFAULT_DURATION = 5000;
const MAX_TOASTS = 3;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());
  const nextId = useRef(1);

  const dismiss = useCallback((id) => {
    clearTimeout(timers.current.get(id));
    timers.current.delete(id);
    setToasts((items) => items.filter((toast) => toast.id !== id));
  }, []);

  // show({ message, actionLabel, onAction, duration }) returns the toast id.
  const show = useCallback(
    ({ duration = DEFAULT_DURATION, ...toast }) => {
      const id = nextId.current++;
      setToasts((items) => [...items, { ...toast, id }].slice(-MAX_TOASTS));
      timers.current.set(
        id,
        setTimeout(() => dismiss(id), duration),
      );
      return id;
    },
    [dismiss],
  );

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach((timer) => clearTimeout(timer));
  }, []);

  const value = useMemo(() => ({ show, dismiss }), [show, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-stack" aria-live="polite">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            actionLabel={toast.actionLabel}
            onAction={() => {
              dismiss(toast.id);
              toast.onAction?.();
            }}
            onDismiss={() => dismiss(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used inside a ToastProvider');
  return context;
}
