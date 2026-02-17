/**
 * Notification Center Component
 * Bell icon with unread count and notification list modal
 */

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Bell, Check, Trash2, X, MessageSquare, Shield, AlertTriangle, FileText, Clock } from 'lucide-react';
import notificationService from '../../services/notificationService';
import { formatDateTime } from '../../lib/utils';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';

export default function NotificationCenter() {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const [selectedNotification, setSelectedNotification] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchNotifications();
        // Refresh every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchNotifications = async () => {
        try {
            const res = await notificationService.getNotifications();
            if (res.success) {
                setNotifications(res.data.notifications);
                setUnreadCount(res.data.unreadCount);
            }
        } catch (error) {
            console.error('Failed to fetch notifications', error);
        }
    };

    const handleRead = async (id) => {
        try {
            await notificationService.markAsRead(id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: 1 } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Failed to mark notification as read', error);
        }
    };

    const handleNotificationClick = (notification) => {
        setSelectedNotification(notification);
        if (!notification.is_read) {
            handleRead(notification.id);
        }
    };

    const handleReadAll = async () => {
        try {
            await notificationService.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, is_read: 1 })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Failed to mark all as read', error);
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'claim_new': return <FileText className="h-4 w-4 text-blue-500" />;
            case 'claim_reply': return <MessageSquare className="h-4 w-4 text-green-500" />;
            case 'record_added': return <Shield className="h-4 w-4 text-red-500" />;
            default: return <AlertTriangle className="h-4 w-4 text-amber-500" />;
        }
    };

    return (
        <div className="relative">
            {/* Bell Icon */}
            <button
                onClick={() => setShowModal(!showModal)}
                className={showModal ? "relative p-2 text-blue-500 hover:text-blue-600 bg-slate-100 hover:bg-slate-100 rounded-full transition-all duration-200":"relative p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-full transition-all duration-200"}
                title="Notifications"
            >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {/* Notification List Dropdown */}
            {showModal && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 z-50 animate-in fade-in slide-in-from-top-2">
                    <Card className="bg-white border-slate-200 shadow-2xl overflow-hidden">
                        <CardHeader className="p-4 border-b flex flex-row items-center justify-between">
                            <CardTitle className="text-base font-semibold">Notifications</CardTitle>
                            <div className="flex gap-2">
                                {unreadCount > 0 && (
                                    <button
                                        onClick={handleReadAll}
                                        className="text-xs text-blue-600 hover:text-blue-700 hover:underline"
                                    >
                                        Mark all as read
                                    </button>
                                )}
                                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0 max-h-[400px] overflow-y-auto">
                            {notifications.length > 0 ? (
                                <div className="divide-y divide-slate-100">
                                    {notifications.map((n) => (
                                        <div
                                            key={n.id}
                                            className={`p-4 flex gap-4 hover:bg-slate-50 transition-colors cursor-pointer border-l-4 ${!n.is_read ? 'bg-blue-50/40 border-blue-500' : 'border-transparent'}`}
                                            onClick={() => handleNotificationClick(n)}
                                        >
                                            <div className="mt-1 flex-shrink-0">
                                                {getTypeIcon(n.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm ${!n.is_read ? 'font-semibold text-slate-900' : 'text-slate-600'}`}>
                                                    {n.title}
                                                </p>
                                                <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                                                    {n.message}
                                                </p>
                                                <p className="text-[10px] text-slate-400 mt-1">
                                                    {formatDateTime(n.created_at)}
                                                </p>
                                            </div>
                                            {!n.is_read && (
                                                <div className="h-2 w-2 rounded-full bg-blue-500 mt-2 self-start"></div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-8 text-center text-slate-400 font-medium">
                                    <Bell className="h-10 w-10 mx-auto mb-2 opacity-20" />
                                    <p className="text-sm">No notifications yet</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Notification Detail Modal - Using Portal for true centering */}
            {selectedNotification && createPortal(
                <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
                    {/* Full screen backdrop */}
                    <div
                        className="fixed inset-0 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300"
                        onClick={() => setSelectedNotification(null)}
                    ></div>

                    {/* Truly centered Modal Content */}
                    <Card className="w-full max-w-lg bg-white border-0 shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden relative z-[100000]">
                        <CardHeader className="flex flex-row items-center justify-between border-b p-4 bg-slate-50/50">
                            <div className="flex items-center gap-3">
                                {getTypeIcon(selectedNotification.type)}
                                <CardTitle className="text-lg font-bold text-slate-900">{selectedNotification.title}</CardTitle>
                            </div>
                            <button
                                onClick={() => setSelectedNotification(null)}
                                className="p-2 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="space-y-4">
                                <div>
                                    <Badge variant="outline" className="mb-2 capitalize">
                                        {selectedNotification.type.replace('_', ' ')}
                                    </Badge>
                                    <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                                        {selectedNotification.message}
                                    </p>
                                </div>
                                <div className="pt-4 border-t flex justify-between items-center text-xs text-slate-400">
                                    <span className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {formatDateTime(selectedNotification.created_at)}
                                    </span>
                                </div>
                                <div className="pt-2">
                                    <Button
                                        className="w-full h-11 text-base font-semibold shadow-lg shadow-blue-500/20"
                                        onClick={() => setSelectedNotification(null)}
                                    >
                                        Close
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>,
                document.body
            )}
        </div>
    );
}
