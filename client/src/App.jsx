/**
 * Main Application Component
 * React Router setup with protected routes
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect, createContext, useContext } from 'react';
import authService from './services/authService';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import AdminRegister from './pages/AdminRegister';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
import CriminalManagement from './pages/CriminalManagement';
import ClaimsManagement from './pages/ClaimsManagement';
import FaceDetection from './pages/FaceDetection';
import UserProfile from './pages/UserProfile';
import Portfolio from './pages/Portfolio';
import NotFound from './pages/NotFound';

// Components
import Layout from './components/common/Layout';
import { Toaster } from './components/ui/toaster';

// Auth Context
export const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

// Protected Route Component
const ProtectedRoute = ({ children, adminOnly = false }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (adminOnly && user.role !== 'admin') {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

function App() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check if user is logged in
        const initAuth = async () => {
            const token = authService.getToken();
            if (token) {
                try {
                    const response = await authService.getCurrentUser();
                    if (response.success) {
                        setUser(response.data.user);
                    }
                } catch (error) {
                    // Token invalid, clear session
                    authService.logout();
                }
            }
            setLoading(false);
        };

        // Load user from storage initially
        const storedUser = authService.getUser();
        if (storedUser) {
            setUser(storedUser);
        }

        initAuth();
    }, []);

    const login = (userData) => {
        setUser(userData);
    };

    const logout = () => {
        setUser(null);
        authService.logout();
    };

    const authValue = {
        user,
        loading,
        login,
        logout,
        isAdmin: user?.role === 'admin',
    };

    return (
        <AuthContext.Provider value={authValue}>
            <Router>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<Portfolio />} />
                    <Route path="/login" element={
                        user ? <Navigate to={user.role === 'admin' ? '/admin' : '/dashboard'} replace /> : <Login />
                    } />
                    <Route path="/register" element={
                        user ? <Navigate to="/dashboard" replace /> : <Register />
                    } />
                    <Route path="/admin/register" element={
                        user ? <Navigate to="/admin" replace /> : <AdminRegister />
                    } />

                    {/* Admin Routes */}
                    <Route path="/admin" element={
                        <ProtectedRoute adminOnly>
                            <Layout>
                                <AdminDashboard />
                            </Layout>
                        </ProtectedRoute>
                    } />
                    <Route path="/admin/criminals" element={
                        <ProtectedRoute adminOnly>
                            <Layout>
                                <CriminalManagement />
                            </Layout>
                        </ProtectedRoute>
                    } />
                    <Route path="/admin/claims" element={
                        <ProtectedRoute adminOnly>
                            <Layout>
                                <ClaimsManagement />
                            </Layout>
                        </ProtectedRoute>
                    } />
                    <Route path="/admin/detection" element={
                        <ProtectedRoute adminOnly>
                            <Layout>
                                <FaceDetection />
                            </Layout>
                        </ProtectedRoute>
                    } />

                    {/* User Routes */}
                    <Route path="/dashboard" element={
                        <ProtectedRoute>
                            <Layout>
                                <UserDashboard />
                            </Layout>
                        </ProtectedRoute>
                    } />
                    <Route path="/profile" element={
                        <ProtectedRoute>
                            <Layout>
                                <UserProfile />
                            </Layout>
                        </ProtectedRoute>
                    } />
                    <Route path="/detection" element={
                        <ProtectedRoute>
                            <Layout>
                                <FaceDetection />
                            </Layout>
                        </ProtectedRoute>
                    } />

                    {/* Default redirect */}
                    <Route path="/" element={
                        <Navigate to={user?.role === 'admin' ? '/admin' : '/dashboard'} replace />
                    } />

                    {/* 404 */}
                    <Route path="*" element={<NotFound />} />
                </Routes>
            </Router>
            <Toaster />
        </AuthContext.Provider>
    );
}

export default App;
