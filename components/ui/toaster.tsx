'use client';
import { useEffect, useState } from 'react';
import { ToastProvider, ToastViewport, Toast, ToastTitle, ToastDescription, ToastClose, ToastOptions, _registerToaster } from './toast';

export { toast } from './toast';

export function Toaster() {
  const [toasts, setToasts] = useState<(ToastOptions & { id: string })[]>([]);

  useEffect(() => {
    _registerToaster((t) => {
      const id = Math.random().toString(36).slice(2);
      setToasts((p) => [...p, { ...t, id }]);
      setTimeout(() => setToasts((p) => p.filter((x) => x.id !== id)), 4500);
    });
    return () => { _registerToaster(null); };
  }, []);

  return (
    <ToastProvider>
      {toasts.map((t) => (
        <Toast key={t.id} variant={t.variant}>
          <div>
            <ToastTitle>{t.title}</ToastTitle>
            {t.description && <ToastDescription>{t.description}</ToastDescription>}
          </div>
          <ToastClose />
        </Toast>
      ))}
      <ToastViewport />
    </ToastProvider>
  );
}
