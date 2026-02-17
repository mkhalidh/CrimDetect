/**
 * Register Page
 * New user registration
 */

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../App';
import authService from '../services/authService';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/card';
import { showToast } from '../hooks/useToast';
import { Shield, Mail, Lock, User, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function Register() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const { name, email, password, confirmPassword, age, cnic } = formData;

        if (!name || !email || !password) {
            showToast({
                title: 'Validation Error',
                description: 'Please fill in all fields',
                variant: 'error',
            });
            return;
        }

        if (password !== confirmPassword) {
            showToast({
                title: 'Validation Error',
                description: 'Passwords do not match',
                variant: 'error',
            });
            return;
        }

        if (password.length < 6) {
            showToast({
                title: 'Validation Error',
                description: 'Password must be at least 6 characters',
                variant: 'error',
            });
            return;
        }

        setLoading(true);

        try {
            const response = await authService.register({ name, email, password, age, cnic });

            if (response.success) {
                login(response.data.user);
                showToast({
                    title: 'Registration Successful!',
                    description: `Welcome, ${response.data.user.name}!`,
                    variant: 'success',
                });
                navigate('/dashboard');
            }
        } catch (error) {
            showToast({
                title: 'Registration Failed',
                description: error.message || 'Could not create account',
                variant: 'error',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 p-4">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%239C92AC%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-50"></div>

            <div className="relative z-10 w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-2xl shadow-blue-500/30 mb-4">
                        <Shield className="h-8 w-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-white">CrimDetect</h1>
                    <p className="text-slate-400 mt-2">Criminal Face Detection System</p>
                </div>

                <Card className="bg-white/10 backdrop-blur-xl border-white/20">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl text-white text-center">Create Account</CardTitle>
                        <CardDescription className="text-slate-300 text-center">
                            Enter your details to get started
                        </CardDescription>
                    </CardHeader>

                    <form onSubmit={handleSubmit}>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-200">Full Name</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                    <Input
                                        type="text"
                                        name="name"
                                        placeholder="John Doe"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-slate-400 focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-200">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                    <Input
                                        type="email"
                                        name="email"
                                        placeholder="name@example.com"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-slate-400 focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-200">Age</label>
                                    <Input
                                        type="number"
                                        name="age"
                                        placeholder="Age"
                                        value={formData.age || ''}
                                        onChange={handleChange}
                                        className="bg-white/10 border-white/20 text-white placeholder:text-slate-400 focus:border-blue-500"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-200">CNIC</label>
                                    <Input
                                        type="text"
                                        name="cnic"
                                        placeholder="XXXXX-XXXXXXX-X"
                                        value={formData.cnic || ''}
                                        onChange={handleChange}
                                        className="bg-white/10 border-white/20 text-white placeholder:text-slate-400 focus:border-blue-500"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-200">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                    <Input
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="pl-10 pr-10 bg-white/10 border-white/20 text-white placeholder:text-slate-400 focus:border-blue-500"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-200">Confirm Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                    <Input
                                        type={showPassword ? 'text' : 'password'}
                                        name="confirmPassword"
                                        placeholder="••••••••"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-slate-400 focus:border-blue-500"
                                    />
                                </div>
                            </div>
                        </CardContent>

                        <CardFooter className="flex flex-col gap-4">
                            <Button
                                type="submit"
                                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25"
                                disabled={loading}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Creating account...
                                    </>
                                ) : (
                                    'Create Account'
                                )}
                            </Button>

                            <p className="text-center text-slate-300 text-sm">
                                Already have an account?{' '}
                                <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium">
                                    Sign in
                                </Link>
                            </p>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </div>
    );
}
