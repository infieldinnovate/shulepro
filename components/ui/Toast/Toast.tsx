"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { Info, CheckCircle2, AlertTriangle, XCircle, X } from "lucide-react";
import clsx from "clsx";
import styles from "./Toast.module.scss";

// ============================================================
// Toast — ToastProvider + useToast hook + Toast viewport
// Usage:
//   <ToastProvider>
//     <SomeComponent />
//   </ToastProvider>
//   const toast = useToast();
//   toast.show({ title: "Saved", variant: "success" });
// ============================================================

export type ToastVariant = "info" | "success" | "warning" | "error";

export interface ToastOptions {
  variant?: ToastVariant;
  title: ReactNode;
  description?: ReactNode;
  /** Auto-dismiss duration in ms. 0 keeps it open. Default 4000. */
  duration?: number;
  icon?: ReactNode | false;
}

export interface ToastRecord extends Required<Omit<ToastOptions, "description" | "icon">> {
  id: number;
  description?: ReactNode;
  icon?: ReactNode | false;
}

export interface ToastContextValue {
  show: (options: ToastOptions) => number;
  dismiss: (id: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const DEFAULT_DURATION = 4000;

const DEFAULT_ICONS: Record<ToastVariant, ReactNode> = {
  info: <Info aria-hidden="true" />,
  success: <CheckCircle2 aria-hidden="true" />,
  warning: <AlertTriangle aria-hidden="true" />,
  error: <XCircle aria-hidden="true" />,
};

export interface ToastProviderProps {
  children: ReactNode;
  /** Stack position. Currently both modes collapse to top-center on mobile. */
  position?: "top-center" | "bottom-right";
  /** Max simultaneous toasts. Older ones are removed first. */
  maxToasts?: number;
}

export function ToastProvider({
  children,
  position = "bottom-right",
  maxToasts = 5,
}: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastRecord[]>([]);
  const [mounted, setMounted] = useState(false);
  const idRef = useRef(0);
  const timers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => {
    setMounted(true);
    const currentTimers = timers.current;
    return () => {
      currentTimers.forEach((t) => clearTimeout(t));
      currentTimers.clear();
    };
  }, []);

  const dismiss = useCallback((id: number) => {
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (options: ToastOptions): number => {
      const id = idRef.current++;
      const variant = options.variant ?? "info";
      const duration = options.duration ?? DEFAULT_DURATION;
      const record: ToastRecord = {
        id,
        variant,
        title: options.title,
        description: options.description,
        duration,
        icon: options.icon,
      };

      setToasts((prev) => {
        const next = [...prev, record];
        if (next.length > maxToasts) {
          const removed = next.splice(0, next.length - maxToasts);
          removed.forEach((r) => {
            const t = timers.current.get(r.id);
            if (t) {
              clearTimeout(t);
              timers.current.delete(r.id);
            }
          });
        }
        return next;
      });

      if (duration > 0) {
        const timer = setTimeout(() => dismiss(id), duration);
        timers.current.set(id, timer);
      }

      return id;
    },
    [dismiss, maxToasts],
  );

  const contextValue = useMemo<ToastContextValue>(
    () => ({ show, dismiss }),
    [show, dismiss],
  );

  const positionClass =
    position === "bottom-right" ? styles.bottomRight : styles.topCenter;

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      {mounted &&
        createPortal(
          <div
            className={clsx(styles.region, positionClass)}
            role="region"
            aria-label="Notifications"
            aria-live="polite"
          >
            {toasts.map((toast) => (
              <ToastItem key={toast.id} toast={toast} onDismiss={dismiss} />
            ))}
          </div>,
          document.body,
        )}
    </ToastContext.Provider>
  );
}

interface ToastItemProps {
  toast: ToastRecord;
  onDismiss: (id: number) => void;
}

function ToastItem({ toast, onDismiss }: ToastItemProps) {
  const role = toast.variant === "error" ? "alert" : "status";
  const icon =
    toast.icon === false
      ? null
      : toast.icon ?? DEFAULT_ICONS[toast.variant];

  return (
    <div
      role={role}
      className={clsx(styles.toast, styles[toast.variant])}
    >
      {icon && <span className={styles.icon}>{icon}</span>}
      <div className={styles.content}>
        <span className={styles.title}>{toast.title}</span>
        {toast.description && (
          <span className={styles.description}>{toast.description}</span>
        )}
      </div>
      <button
        type="button"
        className={styles.closeButton}
        aria-label="Dismiss notification"
        onClick={() => onDismiss(toast.id)}
      >
        <X aria-hidden="true" />
      </button>
    </div>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within a ToastProvider.");
  }
  return ctx;
}
