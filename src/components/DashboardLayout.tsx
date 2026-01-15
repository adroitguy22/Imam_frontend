import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
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
    User
} from 'lucide-react';
import { SyncStatus } from './SyncStatus';

interface SidebarItemProps {
    icon: React.ReactNode;
    label: string;
    href: string;
    active: boolean;
    onClick?: () => void;
}

const SidebarItem = ({ icon, label, href, active, onClick }: SidebarItemProps) => (
    <Link
        to={href}
        onClick={onClick}
        className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${active
            ? 'bg-primary-50 text-primary-700'
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
    >
        {icon}
        <span className="font-medium">{label}</span>
    </Link>
);

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { user, logout } = useAuthStore();
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const role = user?.role.toLowerCase();

    const teacherLinks = [
        { icon: <Home size={20} />, label: 'Dashboard', href: '/teacher/dashboard' },
        { icon: <Users size={20} />, label: 'My Students', href: '/teacher/students' },
        { icon: <BookOpen size={20} />, label: 'Lessons', href: '/teacher/lessons' },
        { icon: <CheckCircle size={20} />, label: 'Attendance', href: '/teacher/attendance' },
        { icon: <BarChart2 size={20} />, label: 'Analytics', href: '/teacher/analytics' },
    ];

    const parentLinks = [
        { icon: <Home size={20} />, label: 'Dashboard', href: '/parent/dashboard' },
        { icon: <Users size={20} />, label: 'My Children', href: '/parent/children' },
        { icon: <BarChart2 size={20} />, label: 'Progress Reports', href: '/parent/reports' },
    ];

    const adminLinks = [
        { icon: <Home size={20} />, label: 'Dashboard', href: '/admin/dashboard' },
        { icon: <Users size={20} />, label: 'User Management', href: '/admin/users' },
        { icon: <BookOpen size={20} />, label: 'Class Management', href: '/admin/classes' },
        { icon: <Settings size={20} />, label: 'System Settings', href: '/admin/settings' },
    ];

    const links = role === 'teacher' ? teacherLinks : role === 'parent' ? parentLinks : adminLinks;

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
        fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 z-30 transition-transform duration-300 transform
        lg:translate-x-0 lg:static lg:inset-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
                <div className="h-full flex flex-col">
                    <div className="p-6 flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
                            <BookOpen className="text-white" size={24} />
                        </div>
                        <span className="text-xl font-bold text-gray-900">StudentApp</span>
                    </div>

                    <nav className="flex-1 px-4 space-y-1">
                        {links.map((link) => (
                            <SidebarItem
                                key={link.href}
                                {...link}
                                active={location.pathname === link.href}
                                onClick={() => setIsSidebarOpen(false)}
                            />
                        ))}
                    </nav>

                    <div className="p-4 border-t border-gray-200">
                        <button
                            onClick={handleLogout}
                            className="flex items-center space-x-3 w-full px-4 py-3 text-gray-600 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors"
                        >
                            <LogOut size={20} />
                            <span className="font-medium">Sign Out</span>
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

                    <div className="flex items-center space-x-4 ml-auto">
                        <SyncStatus />
                        <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg relative">
                            <Bell size={20} />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>
                        <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
                            <div className="hidden md:block text-right">
                                <p className="text-sm font-semibold text-gray-900">{user?.firstName} {user?.lastName}</p>
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
