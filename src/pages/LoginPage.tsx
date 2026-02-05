import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useToast } from '../components/Toast';
import { useTranslation } from '../i18n';
import { Lock, Mail, Languages, ChevronDown } from 'lucide-react';
import logo from '../assets/logo.jpeg';

const languageNames = {
  en: 'English',
  ar: 'عربي',
  ha: 'Hausa'
};

const languageNativeNames = {
  en: 'English',
  ar: 'العربية',
  ha: 'Hausanci'
};

export const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [langMenuOpen, setLangMenuOpen] = useState(false);
    const { login, isLoading, error, clearError } = useAuthStore();
    const { showError } = useToast();
    const { t, language, setLanguage, isRTL } = useTranslation();
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

    const languages = ['en', 'ar', 'ha'] as const;

    const getAcademyName = () => {
        if (language === 'ha') return 'Imam Malik Academy Nigeria';
        if (language === 'ar') return 'أكاديمية الإمام مالك نيجيريا';
        return 'Imam Malik Academy Nigeria';
    };

    const getSystemName = () => {
        if (language === 'ha') return 'Tsarin Binnewan Dalibai Imam Malik';
        if (language === 'ar') return 'نظام تتبع تقدم الطلاب';
        return 'Student Progress Tracking System';
    };

    return (
        <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-secondary-50 px-4 ${isRTL ? 'rtl' : 'ltr'}`}>
            <div className="max-w-md w-full">
                {/* Language Toggle */}
                <div className="flex justify-end mb-4">
                    <div className="relative">
                        <button
                            onClick={() => setLangMenuOpen(!langMenuOpen)}
                            className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow text-gray-700"
                        >
                            <Languages size={18} />
                            <span className="text-sm font-medium">{languageNames[language]}</span>
                            <ChevronDown size={14} className={`transition-transform ${langMenuOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {langMenuOpen && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setLangMenuOpen(false)} />
                                <div className={`absolute ${isRTL ? 'left-0' : 'right-0'} mt-2 w-36 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20`}>
                                    {languages.map((lang) => (
                                        <button
                                            key={lang}
                                            onClick={() => {
                                                setLanguage(lang);
                                                setLangMenuOpen(false);
                                            }}
                                            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors ${
                                                language === lang ? 'bg-primary-50 text-primary-700' : 'text-gray-700'
                                            }`}
                                        >
                                            {languageNativeNames[lang]}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-4 overflow-hidden">
                        <img src={logo} alt="Imam Malik Academy" className="w-full h-full object-cover" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {t('welcomeBack')}
                    </h1>
                    <p className="text-gray-600">
                        {getAcademyName()}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                        {getSystemName()}
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
                                {t('emailAddress')}
                            </label>
                            <div className="relative">
                                <div className={`absolute inset-y-0 ${isRTL ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none`}>
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className={`input ${isRTL ? 'pr-10 text-right' : 'pl-10'}`}
                                    placeholder={isRTL ? 'example@email.com' : 'you@example.com'}
                                    required
                                    autoComplete="email"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                                {t('password')}
                            </label>
                            <div className="relative">
                                <div className={`absolute inset-y-0 ${isRTL ? 'right-0 pr-3' : 'left-0 pl-3'} flex items-center pointer-events-none`}>
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className={`input ${isRTL ? 'pr-10 text-right' : 'pl-10'}`}
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
                            {isLoading ? t('loggingIn') : t('signIn')}
                        </button>

                        <div className="text-center mt-4">
                            <span className="text-gray-600">{language === 'ha' ? 'Ba ka da akaunta? ' : language === 'ar' ? 'ليس لديك حساب؟ ' : "Don't have an account? "}</span>
                            <button
                                type="button"
                                onClick={() => navigate('/signup')}
                                className="text-primary-600 hover:text-primary-700 font-semibold"
                            >
                                {t('signUp')}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <p className="text-center text-sm text-gray-500 mt-8">
                    © 2026 {language === 'ha' ? 'Imam Malik Academy Nigeria. Dukan karewa mai mulki.' : language === 'ar' ? 'أكاديمية الإمام مالك نيجيريا. جميع الحقوق محفوظة.' : 'Imam Malik Academy Nigeria. All rights reserved.'}
                </p>
            </div>
        </div>
    );
};
