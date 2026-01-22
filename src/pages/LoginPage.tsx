import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useToast } from '../components/Toast';
import { Lock, Mail } from 'lucide-react';
import logo from '../assets/logo.jpeg';

export const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login, isLoading, error, clearError } = useAuthStore();
    const { showError } = useToast();
    const navigate = useNavigate();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        clearError();

        try {
            await login(email, password);
            const user = useAuthStore.getState().user;

            if (user?.role === 'TEACHER') {
                navigate('/teacher/dashboard');
            } else if (user?.role === 'PARENT') {
                navigate('/parent/dashboard');
            } else if (user?.role === 'STUDENT') {
                navigate('/student/dashboard');
            } else if (user?.role === 'ADMIN') {
                navigate('/admin/dashboard');
            }
        } catch (err) {
            if (error) {
                showError(error);
            }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50 px-4">
            <div className="max-w-md w-full">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-4 overflow-hidden">
                        <img src={logo} alt="Imam Malik Academy" className="w-full h-full object-cover" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Welcome Back
                    </h1>
                    <p className="text-gray-600">
                        Imam Malik Academy Nigeria
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                        Student Progress Tracking System
                    </p>
                </div>

                {/* Login Form */}
                <div className="card">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                Email Address
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="input pl-10"
                                    placeholder="you@example.com"
                                    required
                                    autoComplete="email"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="input pl-10"
                                    placeholder="••••••••"
                                    required
                                    autoComplete="current-password"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="btn btn-primary w-full py-3 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Signing in...' : 'Sign In'}
                        </button>

                        <div className="text-center mt-4">
                            <span className="text-gray-600">Don't have an account? </span>
                            <button
                                type="button"
                                onClick={() => navigate('/signup')}
                                className="text-primary-600 hover:text-primary-700 font-semibold"
                            >
                                Sign Up
                            </button>
                        </div>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            Default credentials for testing:
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            admin@imammalik.edu.ng / admin123
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-sm text-gray-500 mt-8">
                    © 2026 Imam Malik Academy Nigeria. All rights reserved.
                </p>
            </div>
        </div>
    );
};
