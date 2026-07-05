import { useState, useCallback } from 'react';

let toastId = 0;

export default function Toast({ notifications, removeToast }) {
  if (!notifications.length) return null;

  return (
    <div className="toast-container" aria-live="polite" aria-label="Notifications">
      {notifications.map((n) => (
        <div
          key={n.id}
          className={`toast toast-${n.type}`}
          role="alert"
        >
          <span className="toast-msg">{n.message}</span>
          <button
            className="toast-close"
            onClick={() => removeToast(n.id)}
            aria-label="Fermer"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}

export function useToast() {
  const [notifications, setNotifications] = useState([]);

  const addToast = useCallback((message, type = 'success', duration = 4000) => {
    const id = ++toastId;
    setNotifications((prev) => [...prev, { id, message, type }]);
    if (duration > 0) {
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  return { notifications, addToast, removeToast };
}
