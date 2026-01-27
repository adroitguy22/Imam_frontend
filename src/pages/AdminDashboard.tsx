import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users,
    BookOpen,
    Settings,
    Shield,
    UserPlus,
    PlusCircle,
    Activity,
    Calendar
} from 'lucide-react';
import api from '../lib/api';
import { DashboardLayout } from '../components/DashboardLayout';

export const AdminDashboard = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalStudents: 0,
        totalClasses: 0,
        totalLogs: 0
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                // Since we don't have a specific admin stats endpoint, 
                // we'll use a mocked response for now or several small calls
                // For this demo, let's assume we have a way to get counts
                // or just show what we have.
                const [_, students] = await Promise.all([
                    api.getTeacherStudents(), // Reusing for now
                    api.getTeacherStudents(),
                ]);

                setStats({
                    totalUsers: 15,
                    totalStudents: students.length || 1,
                    totalClasses: 2,
                    totalLogs: 5
                });
            } catch (err) {
                console.error('Failed to fetch admin stats', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStats();
    }, []);

    const statCards = [
        { label: 'Total Users', value: stats.totalUsers, icon: <Users size={24} className="text-blue-600" />, bgColor: 'bg-blue-50' },
        { label: 'Total Students', value: stats.totalStudents, icon: <Users size={24} className="text-green-600" />, bgColor: 'bg-green-50' },
        { label: 'Classes', value: stats.totalClasses, icon: <BookOpen size={24} className="text-purple-600" />, bgColor: 'bg-purple-50' },
        { label: 'Active Progress Logs', value: stats.totalLogs, icon: <Activity size={24} className="text-orange-600" />, bgColor: 'bg-orange-50' },
    ];

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                        <p className="text-gray-500">Manage the Imam Malik Academy monitoring system.</p>
                    </div>
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={() => navigate('/admin/settings')}
                            className="btn bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                        >
                            <Calendar size={18} />
                            <span>Term Settings</span>
                        </button>
                        <button
                            onClick={() => navigate('/admin/users')}
                            className="btn btn-primary flex items-center space-x-2"
                        >
                            <UserPlus size={18} />
                            <span>Add User</span>
                        </button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {statCards.map((stat, i) => (
                        <div key={i} className="card flex items-center space-x-4">
                            <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                                {stat.icon}
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Quick Actions */}
                <div className="space-y-4">
                    <h2 className="text-lg font-bold text-gray-900">Quick Management</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <button
                            onClick={() => navigate('/admin/users')}
                            className="card hover:shadow-md transition-shadow flex items-center space-x-4 text-left group"
                        >
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                <Shield size={24} />
                            </div>
                            <div>
                                <p className="font-bold text-gray-900 text-sm">Role Permissions</p>
                                <p className="text-xs text-gray-500 italic">Configure access levels</p>
                            </div>
                        </button>

                        <button
                            onClick={() => navigate('/admin/settings')}
                            className="card hover:shadow-md transition-shadow flex items-center space-x-4 text-left group"
                        >
                            <div className="p-3 bg-green-50 text-green-600 rounded-lg group-hover:bg-green-600 group-hover:text-white transition-colors">
                                <PlusCircle size={24} />
                            </div>
                            <div>
                                <p className="font-bold text-gray-900 text-sm">Skill Domains</p>
                                <p className="text-xs text-gray-500 italic">Manage assessment areas</p>
                            </div>
                        </button>

                        <button
                            onClick={() => navigate('/admin/classes')}
                            className="card hover:shadow-md transition-shadow flex items-center space-x-4 text-left group"
                        >
                            <div className="p-3 bg-purple-50 text-purple-600 rounded-lg group-hover:bg-purple-600 group-hover:text-white transition-colors">
                                <BookOpen size={24} />
                            </div>
                            <div>
                                <p className="font-bold text-gray-900 text-sm">Class Groups</p>
                                <p className="text-xs text-gray-500 italic">Organize student groups</p>
                            </div>
                        </button>

                        <button className="card hover:shadow-md transition-shadow flex items-center space-x-4 text-left group">
                            <div className="p-3 bg-gray-50 text-gray-600 rounded-lg group-hover:bg-gray-800 group-hover:text-white transition-colors">
                                <Settings size={24} />
                            </div>
                            <div>
                                <p className="font-bold text-gray-900 text-sm">System Logs</p>
                                <p className="text-xs text-gray-500 italic">View audit history</p>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};
