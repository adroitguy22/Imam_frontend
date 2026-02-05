import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useMessageStore } from '../stores/messageStore';
import { useTranslation } from '../i18n';
import { useEffect } from 'react';
import {
    Home,
    Users,
    BarChart2,
    LogOut,
    Menu,
    Bell,
    Settings,
    BookOpen,
    CheckCircle,
    User,
    MessageSquare,
    FileText
} from 'lucide-react';
import { SyncStatus } from './SyncStatus';
import { LanguageToggle } from './LanguageToggle';
import logo from '../assets/logo.jpeg';

interface SidebarItemProps {
    icon: React.ReactNode;
    label: string;
    href: string;
    active: boolean;
    onClick?: () => void;
    badge?: number;
}

const SidebarItem = ({ icon, label, href, active, onClick, badge }: SidebarItemProps) => {
    const { isRTL } = useTranslation();
    return (
        <Link
            to={href}
            onClick={onClick}
            className={`flex items-center ${isRTL ? 'space-x-reverse space-x-3' : 'space-x-3'} px-4 py-3 rounded-lg transition-colors relative ${active
                ? 'bg-primary-50 text-primary-700'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
        >
            {icon}
            <span className="font-medium">{label}</span>
            {badge !== undefined && badge > 0 && (
                <span className={`absolute ${isRTL ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 flex items-center justify-center min-w-[20px] h-[20px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full border-2 border-white`}>
                    {badge > 99 ? '99+' : badge}
                </span>
            )}
        </Link>
    );
};

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { user, logout } = useAuthStore();
    const { unreadCount, fetchUnreadCount } = useMessageStore();
    const { t, isRTL } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            fetchUnreadCount();
            // Poll for new messages every minute
            const interval = setInterval(fetchUnreadCount, 60000);
            return () => clearInterval(interval);
        }
    }, [user, fetchUnreadCount]);


    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const role = user?.role.toLowerCase();

    const teacherLinks = [
        { icon: <Home size={20} />, label: t('dashboard'), href: '/teacher/dashboard' },
        { icon: <BookOpen size={20} />, label: t('lessons'), href: '/teacher/lessons' },
        { icon: <FileText size={20} />, label: t('lessonNotes'), href: '/teacher/lesson-notes' },
        { icon: <CheckCircle size={20} />, label: t('attendance'), href: '/teacher/attendance' },
        { icon: <BarChart2 size={20} />, label: t('analytics'), href: '/teacher/analytics' },
        { icon: <MessageSquare size={20} />, label: t('messages'), href: '/messaging' },
    ];

    const parentLinks = [
        { icon: <Home size={20} />, label: t('dashboard'), href: '/parent/dashboard' },
        { icon: <Users size={20} />, label: t('students'), href: '/parent/children' },
        { icon: <BarChart2 size={20} />, label: t('reports'), href: '/parent/reports' },
        { icon: <MessageSquare size={20} />, label: t('messages'), href: '/messaging' },
    ];

    const adminLinks = [
        { icon: <Home size={20} />, label: t('dashboard'), href: '/admin/dashboard' },
        { icon: <Users size={20} />, label: t('userManagement'), href: '/admin/users' },
        { icon: <BookOpen size={20} />, label: t('classManagement'), href: '/admin/classes' },
        { icon: <Settings size={20} />, label: t('systemSettings'), href: '/admin/settings' },
        { icon: <MessageSquare size={20} />, label: t('messages'), href: '/messaging' },
    ];

    const links = role === 'teacher' ? teacherLinks : role === 'parent' ? parentLinks : adminLinks;

    return (
        <div className={`min-h-screen bg-gray-50 flex ${isRTL ? 'rtl' : 'ltr'}`}>
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
        fixed inset-y-0 ${isRTL ? 'right-0 border-l' : 'left-0 border-r'} border-gray-200 w-64 bg-white z-30 transition-transform duration-300 transform
        lg:translate-x-0 lg:static lg:inset-0
        ${isSidebarOpen ? 'translate-x-0' : (isRTL ? '-translate-x-full' : '-translate-x-full')}
      `}>
                <div className="h-full flex flex-col">
                    <div className={`p-6 flex items-center ${isRTL ? 'space-x-reverse space-x-3' : 'space-x-3'}`}>
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden">
                            <img src={logo} alt="Imam Malik Academy" className="w-full h-full object-cover" />
                        </div>
                        <span className="text-xl font-bold text-gray-900">{isRTL ? 'أكاديمية الإمام مالك' : 'Imam Malik Academy'}</span>
                    </div>

                    <nav className="flex-1 px-4 space-y-1">
                        {links.map((link) => (
                            <SidebarItem
                                key={link.href}
                                {...link}
                                active={location.pathname === link.href}
                                badge={link.label === t('messages') ? unreadCount : undefined}
                                onClick={() => setIsSidebarOpen(false)}
                            />
                        ))}
                    </nav>

                    <div className="p-4 border-t border-gray-200">
                        <button
                            onClick={handleLogout}
                            className={`flex items-center ${isRTL ? 'space-x-reverse space-x-3' : 'space-x-3'} w-full px-4 py-3 text-gray-600 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors`}
                        >
                            <LogOut size={20} />
                            <span className="font-medium">{t('logout')}</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Topbar */}
                <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 lg:px-8">
                    <button
                        className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                        onClick={() => setIsSidebarOpen(true)}
                    >
                        <Menu size={24} />
                    </button>

                    <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-4 mr-auto' : 'space-x-4 ml-auto'}`}>
                        <SyncStatus />
                        <LanguageToggle />
                        <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg relative">
                            <Bell size={20} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>
                        <div className={`flex items-center ${isRTL ? 'space-x-reverse space-x-3 pr-4 border-l' : 'space-x-3 pl-4 border-l'} border-gray-200`}>
                            <div className={`hidden md-block ${isRTL ? 'text-left' : 'text-right'}`}>
                                <p className="text-sm font-semibold text-gray-900">{user?.firstName || ''} {user?.lastName || ''}</p>
                                <p className="text-xs text-gray-500 capitalize">{role}</p>
                            </div>
                            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                                <User size={24} className="text-gray-500" />
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-4 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
};
