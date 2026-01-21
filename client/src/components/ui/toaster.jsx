/**
 * Toaster Component
 * Displays toast notifications
 */

import { useToast, setToastFunction } from '../../hooks/useToast';
import { useEffect } from 'react';
import { cn } from '../../lib/utils';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const icons = {
    default: Info,
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
};

const variants = {
    default: 'bg-white border-gray-200 text-gray-900',
    success: 'bg-green-50 border-green-200 text-green-900',
    error: 'bg-red-50 border-red-200 text-red-900',
    warning: 'bg-amber-50 border-amber-200 text-amber-900',
};

export function Toaster() {
    const { toasts, toast, dismiss } = useToast();

    useEffect(() => {
        setToastFunction(toast);
    }, [toast]);

    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
            {toasts.map((t) => {
                const Icon = icons[t.variant] || icons.default;
                return (
                    <div
                        key={t.id}
                        className={cn(
                            'flex items-start gap-3 p-4 rounded-lg border shadow-lg animate-in min-w-[300px] max-w-[400px]',
                            variants[t.variant] || variants.default
                        )}
                    >
                        <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                            {t.title && (
                                <p className="font-semibold text-sm">{t.title}</p>
                            )}
                            {t.description && (
                                <p className="text-sm opacity-90 mt-1">{t.description}</p>
                            )}
                        </div>
                        <button
                            onClick={() => dismiss(t.id)}
                            className="flex-shrink-0 p-1 rounded hover:bg-black/5 transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                );
            })}
        </div>
    );
}
