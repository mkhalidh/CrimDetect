/**
 * Layout Component
 * Main layout with sidebar and header
 */

import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../App';
import { cn } from '../../lib/utils';
import {
    LayoutDashboard,
    Users,
    FileText,
    Camera,
    User,
    LogOut,
    Menu,
    X,
    Shield,
    Bell,
} from 'lucide-react';
import { Button } from '../ui/button';
import NotificationCenter from './NotificationCenter';

const adminNavItems = [
    { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/criminals', label: 'Criminals', icon: Users },
    { path: '/admin/claims', label: 'Claims', icon: FileText },
    { path: '/admin/detection', label: 'Face Detection', icon: Camera },
];

const userNavItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/profile', label: 'Profile', icon: User },
    { path: '/detection', label: 'Face Detection', icon: Camera },
];

export default function Layout({ children }) {
    const { user, logout, isAdmin } = useAuth();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const navItems = isAdmin ? adminNavItems : userNavItems;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
            {/* Mobile Menu Button */}
            <div className="lg:hidden fixed top-4 left-4 z-50">
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="bg-white shadow-md"
                >
                    {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
            </div>

            {/* Sidebar */}
            <aside
                className={cn(
                    'fixed top-0 left-0 z-40 h-screen transition-all duration-300 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 shadow-xl',
                    sidebarOpen ? 'w-64' : 'w-20',
                    mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
                )}
            >
                {/* Logo */}
                <div className="h-16 flex items-center justify-center border-b border-slate-200 dark:border-slate-700 px-4">
                    <Link to={isAdmin ? '/admin' : '/dashboard'} className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
                            <Shield className="h-6 w-6 text-white" />
                        </div>
                        {sidebarOpen && (
                            <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                CrimDetect
                            </span>
                        )}
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="p-4 space-y-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={cn(
                                    'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
                                    isActive
                                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25'
                                        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                                )}
                            >
                                <Icon className="h-5 w-5 flex-shrink-0" />
                                {sidebarOpen && <span className="font-medium">{item.label}</span>}
                            </Link>
                        );
                    })}
                </nav>

                {/* Toggle Button */}
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 bg-white border border-slate-200 rounded-full items-center justify-center shadow-md hover:bg-slate-50 transition-colors"
                >
                    <Menu className="h-3 w-3 text-slate-500" />
                </button>

                {/* User Info */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200 dark:border-slate-700">
                    <div className={cn('flex items-center gap-3', !sidebarOpen && 'justify-center')}>
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                            {user?.name?.charAt(0).toUpperCase()}
                        </div>
                        {sidebarOpen && (
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-slate-900 dark:text-white truncate">
                                    {user?.name}
                                </p>
                                <p className="text-xs text-slate-500 capitalize">{user?.role}</p>
                            </div>
                        )}
                    </div>
                    <Button
                        variant="ghost"
                        className={cn('mt-4 w-full text-red-600 hover:text-red-700 hover:bg-red-50', !sidebarOpen && 'px-0')}
                        onClick={logout}
                    >
                        <LogOut className="h-5 w-5" />
                        {sidebarOpen && <span className="ml-2">Logout</span>}
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <div
                className={cn(
                    'transition-all duration-300',
                    sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'
                )}
            >
                {/* Header */}
                <header className="h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 sticky top-0 z-30 px-4 lg:px-8 flex items-center justify-between">
                    <div className="flex items-center gap-4 ml-12 lg:ml-0">
                        <h1 className="text-xl font-semibold text-slate-900 dark:text-white">
                            {isAdmin ? 'Admin Panel' : 'User Dashboard'}
                        </h1>
                    </div>
                    <div className="flex items-center gap-4">
                        <NotificationCenter />
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-4 lg:p-8">
                    {children}
                </main>
            </div>

            {/* Mobile Overlay */}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 lg:hidden"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}
        </div>
    );
}
