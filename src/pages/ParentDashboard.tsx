import { useEffect, useState } from 'react';
import {
    FileText,
    Star,
    ChevronRight,
    TrendingUp,
    MessageSquare,
    Shield
} from 'lucide-react';
import api from '../lib/api';
import { DashboardLayout } from '../components/DashboardLayout';

export const ParentDashboard = () => {
    const [children, setChildren] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchChildren = async () => {
            try {
                // Mocking parent's children for now since we don't have a direct parent/children endpoint implementation
                // But we can simulate finding students where parentId matches
                const students = await api.request('GET', '/api/students/teacher/my-students'); // Temporary reuse
                setChildren(students);
            } catch (err) {
                console.error('Failed to fetch children', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchChildren();
    }, []);

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
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Parent Dashboard</h1>
                    <p className="text-gray-500">Track your children's learning journey and academic progress.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Children Selection / Summary */}
                    <div className="lg:col-span-2 space-y-6">
                        <h2 className="text-lg font-bold text-gray-900">My Children</h2>
                        {children.map((child) => (
                            <div key={child.id} className="card hover:shadow-md transition-shadow group cursor-pointer border-l-4 border-l-primary-500">
                                <div className="flex items-center justify-between p-2">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-16 h-16 bg-primary-100 text-primary-700 rounded-2xl flex items-center justify-center text-xl font-bold">
                                            {child.user.firstName[0]}{child.user.lastName[0]}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                                                {child.user.firstName} {child.user.lastName}
                                            </h3>
                                            <p className="text-sm text-gray-500">{child.studentId} • {child.class.name}</p>
                                        </div>
                                    </div>
                                    <div className="flex space-x-2">
                                        <div className="hidden md:flex flex-col items-end px-4 border-r border-gray-100">
                                            <span className="text-xs font-bold text-gray-400 uppercase">Current Term</span>
                                            <span className="text-sm font-bold text-gray-900 italic">First Term</span>
                                        </div>
                                        <button className="p-2 text-gray-400 group-hover:text-primary-600">
                                            <ChevronRight size={24} />
                                        </button>
                                    </div>
                                </div>

                                {/* Mini Stats for Child */}
                                <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-50">
                                    <div className="text-center">
                                        <div className="flex items-center justify-center space-x-1 text-primary-600 mb-1">
                                            <TrendingUp size={16} />
                                            <span className="text-xs font-bold">Progress</span>
                                        </div>
                                        <p className="text-lg font-bold">Good</p>
                                    </div>
                                    <div className="text-center border-x border-gray-50">
                                        <div className="flex items-center justify-center space-x-1 text-orange-600 mb-1">
                                            <Star size={16} />
                                            <span className="text-xs font-bold">Level</span>
                                        </div>
                                        <p className="text-lg font-bold">3.5 / 5</p>
                                    </div>
                                    <div className="text-center">
                                        <div className="flex items-center justify-center space-x-1 text-blue-600 mb-1">
                                            <FileText size={16} />
                                            <span className="text-xs font-bold">Reports</span>
                                        </div>
                                        <p className="text-lg font-bold">1 Ready</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Right Sidebar - Recent Updates & Notifications */}
                    <div className="space-y-6">
                        <h2 className="text-lg font-bold text-gray-900">Recent Updates</h2>
                        <div className="card space-y-6">
                            <div className="flex space-x-3">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg h-fit">
                                    <MessageSquare size={18} />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Teacher's Note</p>
                                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">"Zaid showed great improvement in Arabic reading today..."</p>
                                    <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase">2 hours ago</p>
                                </div>
                            </div>

                            <div className="flex space-x-3">
                                <div className="p-2 bg-green-50 text-green-600 rounded-lg h-fit">
                                    <FileText size={18} />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-900">Termly Report Ready</p>
                                    <p className="text-xs text-gray-500 mt-1">First term draft is available for review.</p>
                                    <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase">Yesterday</p>
                                </div>
                            </div>

                            <button className="w-full py-2 text-sm font-semibold text-primary-600 hover:text-primary-700 transition-colors border-t border-gray-50 pt-4">
                                View All Notifications
                            </button>
                        </div>

                        {/* Support Box */}
                        <div className="bg-primary-600 rounded-2xl p-6 text-white relative overflow-hidden group cursor-pointer hover:shadow-lg transition-all">
                            <div className="relative z-10 space-y-2">
                                <h3 className="font-bold">Need Help?</h3>
                                <p className="text-xs text-primary-100">Contact the academy administration for any queries.</p>
                                <button className="bg-white text-primary-600 text-xs font-bold py-2 px-4 rounded-lg mt-2">
                                    Contact Support
                                </button>
                            </div>
                            <Shield className="absolute -bottom-4 -right-4 w-24 h-24 text-primary-500 opacity-20 transform -rotate-12 group-hover:scale-110 transition-transform" />
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};
