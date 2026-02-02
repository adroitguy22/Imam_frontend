import { useEffect, useState } from 'react';
import {
    FileText,
    Star,
    ChevronRight,
    TrendingUp,
    Shield,
    Megaphone,
    Wallet,
    CheckCircle,
    Clock,
    AlertTriangle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { DashboardLayout } from '../components/DashboardLayout';

export const ParentDashboard = () => {
    const navigate = useNavigate();
    const [children, setChildren] = useState<any[]>([]);
    const [announcements, setAnnouncements] = useState<any[]>([]);
    const [reports, setReports] = useState<any[]>([]);
    const [feeSummary, setFeeSummary] = useState({ total: 0, paid: 0, pending: 0 });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [studentsData, announcementsData, summaryData, reportsData] = await Promise.all([
                    api.getParentChildren(),
                    api.getAnnouncements(),
                    api.getFees({ summary: 'true' }),
                    api.getParentReports()
                ]);
                setChildren(studentsData);
                setAnnouncements(announcementsData);
                setFeeSummary(summaryData);
                setReports(reportsData);
            } catch (err) {
                console.error('Failed to fetch dashboard data', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
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
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900">Parent Dashboard</h1>
                        <p className="text-gray-500 font-medium tracking-tight">Track your children's learning journey and academy stays.</p>
                    </div>
                </div>

                {/* Financial Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="card bg-gradient-to-br from-primary-600 to-primary-700 text-white border-none shadow-xl shadow-primary-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-primary-100 text-xs font-bold uppercase tracking-widest">Total Fees</p>
                                <h3 className="text-3xl font-black mt-1">₦{feeSummary.total.toLocaleString()}</h3>
                            </div>
                            <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl">
                                <Wallet size={24} />
                            </div>
                        </div>
                    </div>
                    <div className="card bg-white border-none shadow-lg border-l-4 border-l-green-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Paid Already</p>
                                <h3 className="text-3xl font-black text-gray-900 mt-1">₦{feeSummary.paid.toLocaleString()}</h3>
                            </div>
                            <div className="p-3 bg-green-50 text-green-600 rounded-2xl">
                                <CheckCircle size={24} />
                            </div>
                        </div>
                    </div>
                    <div className="card bg-white border-none shadow-lg border-l-4 border-l-red-500">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Outstanding</p>
                                <h3 className="text-3xl font-black text-red-600 mt-1">₦{feeSummary.pending.toLocaleString()}</h3>
                            </div>
                            <div className="p-3 bg-red-50 text-red-600 rounded-2xl">
                                <AlertTriangle size={24} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Children Selection / Summary */}
                    <div className="lg:col-span-2 space-y-6">
                        <h2 className="text-lg font-bold text-gray-900">My Children</h2>
                        {children.map((child) => (
                            <div
                                key={child.id}
                                onClick={() => navigate(`/student/${child.id}`)}
                                className="card hover:shadow-md transition-shadow group cursor-pointer border-l-4 border-l-primary-500"
                            >
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
                                            <span className="text-sm font-bold text-gray-900 italic">{child.activeTermName}</span>
                                        </div>
                                        <div className="hidden sm:flex flex-col items-end px-4 border-r border-gray-100">
                                            <span className="text-xs font-bold text-gray-400 uppercase">Fee Status</span>
                                            {(() => {
                                                const outstanding = child.fees?.reduce((acc: number, f: any) => f.status === 'PENDING' ? acc + f.amount : acc, 0) || 0;
                                                return outstanding > 0 ? (
                                                    <span className="text-sm font-bold text-red-600">₦{outstanding.toLocaleString()} Owed</span>
                                                ) : (
                                                    <span className="text-sm font-bold text-green-600">Fees Paid</span>
                                                );
                                            })()}
                                        </div>
                                        <button className="p-2 text-gray-400 group-hover:text-primary-600">
                                            <ChevronRight size={24} />
                                        </button>
                                    </div>
                                </div>

                                {/* Mini Stats for Child */}
                                <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-50">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(`/student/${child.id}`, { state: { activeTab: 'progress' } });
                                        }}
                                        className="text-center group/stat hover:bg-gray-50 p-2 rounded-xl transition-colors"
                                    >
                                        <div className="flex items-center justify-center space-x-1 text-primary-600 mb-1 group-hover/stat:scale-110 transition-transform">
                                            <TrendingUp size={16} />
                                            <span className="text-xs font-bold">Progress</span>
                                        </div>
                                        <p className="text-lg font-bold">View</p>
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(`/student/${child.id}`, { state: { activeTab: 'achievements' } });
                                        }}
                                        className="text-center border-x border-gray-50 group/stat hover:bg-gray-50 p-2 rounded-xl transition-colors"
                                    >
                                        <div className="flex items-center justify-center space-x-1 text-orange-600 mb-1 group-hover/stat:scale-110 transition-transform">
                                            <Star size={16} />
                                            <span className="text-xs font-bold">Level</span>
                                        </div>
                                        <p className="text-lg font-bold">View</p>
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(`/student/${child.id}`, { state: { activeTab: 'reports' } });
                                        }}
                                        className="text-center group/stat hover:bg-gray-50 p-2 rounded-xl transition-colors"
                                    >
                                        <div className="flex items-center justify-center space-x-1 text-blue-600 mb-1 group-hover/stat:scale-110 transition-transform">
                                            <FileText size={16} />
                                            <span className="text-xs font-bold">Reports</span>
                                        </div>
                                        <p className="text-lg font-bold">View</p>
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(`/student/${child.id}`, { state: { activeTab: 'fees' } });
                                        }}
                                        className="text-center group/stat hover:bg-gray-50 p-2 rounded-xl transition-colors"
                                    >
                                        <div className="flex items-center justify-center space-x-1 text-red-600 mb-1 group-hover/stat:scale-110 transition-transform">
                                            <Wallet size={16} />
                                            <span className="text-xs font-bold">Fees</span>
                                        </div>
                                        <p className="text-lg font-bold">View</p>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Right Sidebar - Announcements & Communications */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between px-1">
                            <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                                <Megaphone className="text-primary-600" size={20} />
                                School Updates
                            </h2>
                        </div>

                        <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-200">
                            {announcements.length > 0 ? announcements.map((ann) => (
                                <div key={ann.id} className={`card p-5 border-l-4 ${ann.priority === 'HIGH' ? 'border-l-red-500 bg-red-50/30' :
                                    ann.priority === 'MEDIUM' ? 'border-l-orange-500' : 'border-l-blue-500'
                                    }`}>
                                    <div className="flex items-center justify-between mb-3">
                                        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${ann.priority === 'HIGH' ? 'bg-red-100 text-red-700' :
                                            ann.priority === 'MEDIUM' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                                            }`}>
                                            {ann.priority} Priority
                                        </span>
                                        <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                                            <Clock size={10} />
                                            {new Date(ann.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <h4 className="font-bold text-gray-900 mb-1">{ann.title}</h4>
                                    <p className="text-sm text-gray-600 leading-relaxed mb-4">{ann.content}</p>
                                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                                        <span className="text-[10px] font-bold text-gray-400 capitalize">Shared by Academy Office</span>
                                    </div>
                                </div>
                            )) : (
                                <div className="card text-center py-10 bg-gray-50 border-dashed border-2">
                                    <Megaphone className="mx-auto text-gray-300 mb-3" size={32} />
                                    <p className="text-gray-500 text-sm font-medium">No new announcements today.</p>
                                </div>
                            )}
                        </div>

                        {/* Recent Reports Section */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between px-1">
                                <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                                    <FileText className="text-blue-600" size={20} />
                                    Recent Reports
                                </h2>
                            </div>
                            <div className="space-y-3">
                                {reports.length > 0 ? (reports as any[]).slice(0, 3).map((report: any) => (
                                    <div
                                        key={report.id}
                                        onClick={() => navigate(`/student/${report.student.id}`, { state: { activeTab: 'reports' } })}
                                        className="card p-4 hover:bg-gray-50 cursor-pointer transition-colors border-l-4 border-l-blue-500"
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                                                {report.term.name}
                                            </span>
                                            <span className="text-[10px] font-bold text-gray-400">
                                                {new Date(report.publishedAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <h4 className="font-bold text-gray-900 text-sm mb-1">{report.student.user.firstName}'s Report</h4>
                                        <p className="text-xs text-gray-500 line-clamp-1">{report.summary}</p>
                                    </div>
                                )) : (
                                    <div className="card text-center py-8 bg-gray-50 border-dashed border-2">
                                        <FileText className="mx-auto text-gray-300 mb-2" size={24} />
                                        <p className="text-gray-500 text-xs font-medium">No reports published yet.</p>
                                    </div>
                                )}
                            </div>
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
