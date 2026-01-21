/**
 * Custom hook for toast notifications
 */

import { useState, useCallback } from 'react';

const TOAST_TIMEOUT = 5000;

export function useToast() {
    const [toasts, setToasts] = useState([]);

    const toast = useCallback(({ title, description, variant = 'default' }) => {
        const id = Date.now();
        const newToast = { id, title, description, variant };

        setToasts((prev) => [...prev, newToast]);

        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, TOAST_TIMEOUT);

        return id;
    }, []);

    const dismiss = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return { toasts, toast, dismiss };
}

// Export singleton-like toast function for use outside components
let toastFn = null;

export const setToastFunction = (fn) => {
    toastFn = fn;
};

export const showToast = (options) => {
    if (toastFn) {
        toastFn(options);
    }
};
