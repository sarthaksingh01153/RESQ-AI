'use client';
import * as React from 'react';
import * as ToastPrimitives from '@radix-ui/react-toast';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

const ToastProvider = ToastPrimitives.Provider;
const ToastViewport = React.forwardRef<React.ElementRef<typeof ToastPrimitives.Viewport>, React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport>>(
  ({ className, ...props }, ref) => (
    <ToastPrimitives.Viewport ref={ref} className={cn('fixed top-4 right-4 z-[100] flex max-h-screen w-full flex-col gap-2 p-4 sm:max-w-[380px]', className)} {...props} />
  )
);
ToastViewport.displayName = ToastPrimitives.Viewport.displayName;

const Toast = React.forwardRef<React.ElementRef<typeof ToastPrimitives.Root>, React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> & { variant?: 'default' | 'destructive' | 'success' }>(
  ({ className, variant = 'default', ...props }, ref) => (
    <ToastPrimitives.Root ref={ref} className={cn('group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-xl border p-4 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[state=closed]:animate-out data-[state=open]:animate-in data-[state=closed]:fade-out-80 data-[state=open]:slide-in-from-right-full', {
      'border-slate-700 bg-slate-900 text-slate-50': variant === 'default',
      'border-red-600/30 bg-red-900/20 text-red-300': variant === 'destructive',
      'border-green-600/30 bg-green-900/20 text-green-300': variant === 'success',
    }, className)} {...props} />
  )
);
Toast.displayName = ToastPrimitives.Root.displayName;

const ToastClose = React.forwardRef<React.ElementRef<typeof ToastPrimitives.Close>, React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close>>(
  ({ className, ...props }, ref) => (
    <ToastPrimitives.Close ref={ref} className={cn('absolute right-2 top-2 rounded-md p-1 opacity-0 transition-opacity group-hover:opacity-100', className)} {...props}>
      <X className="h-4 w-4" />
    </ToastPrimitives.Close>
  )
);
ToastClose.displayName = ToastPrimitives.Close.displayName;

const ToastTitle = React.forwardRef<React.ElementRef<typeof ToastPrimitives.Title>, React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title>>(
  ({ className, ...props }, ref) => <ToastPrimitives.Title ref={ref} className={cn('text-sm font-semibold', className)} {...props} />
);
ToastTitle.displayName = ToastPrimitives.Title.displayName;

const ToastDescription = React.forwardRef<React.ElementRef<typeof ToastPrimitives.Description>, React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description>>(
  ({ className, ...props }, ref) => <ToastPrimitives.Description ref={ref} className={cn('text-xs opacity-80', className)} {...props} />
);
ToastDescription.displayName = ToastPrimitives.Description.displayName;

// ── Global toast fn (set by Toaster) ──────────────────────────────────────────
export interface ToastOptions {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success';
}

let _addToast: ((t: ToastOptions) => void) | null = null;

export function _registerToaster(fn: ((t: ToastOptions) => void) | null) {
  _addToast = fn;
}

function fireToast(t: ToastOptions) {
  _addToast?.(t);
}

// ── useToast hook ──────────────────────────────────────────────────────────────
export function useToast() {
  return { toast: fireToast };
}

// ── Standalone toast fn (import directly) ─────────────────────────────────────
export const toast = fireToast;

export { ToastProvider, ToastViewport, Toast, ToastClose, ToastTitle, ToastDescription };
export type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>;
