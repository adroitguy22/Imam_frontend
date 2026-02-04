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
    AlertTriangle,
    MessageCircle,
    RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/Toast';
import api from '../lib/api';
import { DashboardLayout } from '../components/DashboardLayout';

export const ParentDashboard = () => {
    const navigate = useNavigate();
    const { showError, showSuccess } = useToast();
    const [children, setChildren] = useState<any[]>([]);
    const [announcements, setAnnouncements] = useState<any[]>([]);
    const [reports, setReports] = useState<any[]>([]);
    const [feeSummary, setFeeSummary] = useState({ total: 0, paid: 0, pending: 0 });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch each resource independently to handle failures gracefully
                const [studentsData, announcementsData, summaryData, reportsData] = await Promise.allSettled([
                    api.getParentChildren(),
                    api.getAnnouncements(),
                    api.getFees({ summary: 'true' }),
                    api.getParentReports()
                ]);

                // Handle each result independently with validation
                setChildren(studentsData.status === 'fulfilled' && Array.isArray(studentsData.value) ? studentsData.value : []);
                setAnnouncements(announcementsData.status === 'fulfilled' && Array.isArray(announcementsData.value) ? announcementsData.value : []);
                setFeeSummary(summaryData.status === 'fulfilled' && summaryData.value ? summaryData.value : { total: 0, paid: 0, pending: 0 });
                setReports(reportsData.status === 'fulfilled' && Array.isArray(reportsData.value) ? reportsData.value : []);

                // Show error toasts for any failed requests
                const errors: string[] = [];
                if (studentsData.status === 'rejected') {
                    console.error('Failed to fetch children:', studentsData.reason);
                    errors.push('children data');
                }
                if (announcementsData.status === 'rejected') {
                    console.error('Failed to fetch announcements:', announcementsData.reason);
                    errors.push('announcements');
                }
                if (summaryData.status === 'rejected') {
                    console.error('Failed to fetch fee summary:', summaryData.reason);
                    errors.push('fee summary');
                }
                if (reportsData.status === 'rejected') {
                    console.error('Failed to fetch reports:', reportsData.reason);
                    errors.push('reports');
                }

                if (errors.length > 0) {
                    showError(`Could not load: ${errors.join(', ')}. Please check your connection.`);
                }
            } catch (err) {
                console.error('Failed to fetch dashboard data', err);
                showError('Unable to load dashboard. Please try refreshing the page.');
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
                    <button
                        onClick={() => window.location.reload()}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <RefreshCw size={18} />
                        <span>Refresh</span>
                    </button>
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
                        {!children || children.length === 0 ? (
                            <div className="card text-center py-12 bg-blue-50 border-blue-200">
                                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Shield size={32} className="text-blue-600" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-2">No Children Linked Yet</h3>
                                <p className="text-gray-600 mb-4">
                                    Your account is not yet linked to any students. Please contact the school administration to link your children to your account.
                                </p>
                                <div className="inline-flex items-center gap-2 text-sm text-blue-700 bg-blue-100 px-4 py-2 rounded-lg">
                                    <Shield size={16} />
                                    Contact school office for assistance
                                </div>
                            </div>
                        ) : (
                            children.map((child) => {
                                // Skip invalid child entries
                                if (!child || !child.id) return null;

                                const childName = child.user?.firstName && child.user?.lastName
                                    ? `${child.user.firstName} ${child.user.lastName}`
                                    : 'Student';

                                const initials = child.user?.firstName?.[0] && child.user?.lastName?.[0]
                                    ? `${child.user.firstName[0]}${child.user.lastName[0]}`
                                    : 'S';

                                return (
                                <div
                                    key={child.id}
                                    onClick={() => navigate(`/student/${child.id}`)}
                                    className="card hover:shadow-md transition-shadow group cursor-pointer border-l-4 border-l-primary-500"
                                >
                                    <div className="flex items-center justify-between p-2">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-16 h-16 bg-primary-100 text-primary-700 rounded-2xl flex items-center justify-center text-xl font-bold">
                                                {initials}
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                                                    {childName}
                                                </h3>
                                                <p className="text-sm text-gray-500">{child.studentId || ''} • {child.class?.name || 'No class assigned'}</p>
                                            </div>
                                        </div>
                                        <div className="flex space-x-2">
                                            <div className="hidden md:flex flex-col items-end px-4 border-r border-gray-100">
                                                <span className="text-xs font-bold text-gray-400 uppercase">Current Term</span>
                                                <span className="text-sm font-bold text-gray-900 italic">{child.activeTermName || 'N/A'}</span>
                                            </div>
                                            <div className="hidden sm:flex flex-col items-end px-4 border-r border-gray-100">
                                                <span className="text-xs font-bold text-gray-400 uppercase">Fee Status</span>
                                                {(() => {
                                                    const outstanding = Array.isArray(child.fees)
                                                        ? child.fees.reduce((acc: number, f: any) => f?.status === 'PENDING' ? acc + (f?.amount || 0) : acc, 0)
                                                        : 0;
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
                            );
                            }).filter(Boolean)
                        )}
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
                            {announcements && announcements.length > 0 ? announcements.map((ann) => {
                                if (!ann || !ann.id) return null;
                                return (
                                <div key={ann.id} className={`card p-5 border-l-4 ${ann.priority === 'HIGH' ? 'border-l-red-500 bg-red-50/30' :
                                    ann.priority === 'MEDIUM' ? 'border-l-orange-500' : 'border-l-blue-500'
                                    }`}>
                                    <div className="flex items-center justify-between mb-3">
                                        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${ann.priority === 'HIGH' ? 'bg-red-100 text-red-700' :
                                            ann.priority === 'MEDIUM' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                                            }`}>
                                            {ann.priority || 'NORMAL'} Priority
                                        </span>
                                        <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                                            <Clock size={10} />
                                            {ann.createdAt ? new Date(ann.createdAt).toLocaleDateString() : 'N/A'}
                                        </span>
                                    </div>
                                    <h4 className="font-bold text-gray-900 mb-1">{ann.title || 'Announcement'}</h4>
                                    <p className="text-sm text-gray-600 leading-relaxed mb-4">{ann.content || ''}</p>
                                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                                        <span className="text-[10px] font-bold text-gray-400 capitalize">Shared by Academy Office</span>
                                    </div>
                                </div>
                            )}) : (
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
                                {reports && reports.length > 0 ? reports.slice(0, 3).map((report: any) => {
                                    if (!report || !report.id) return null;
                                    return (
                                    <div
                                        key={report.id}
                                        onClick={() => report.student?.id && navigate(`/student/${report.student.id}`, { state: { activeTab: 'reports' } })}
                                        className="card p-4 hover:bg-gray-50 cursor-pointer transition-colors border-l-4 border-l-blue-500"
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-[10px] font-black uppercase text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                                                {report.term?.name || 'Term Report'}
                                            </span>
                                            <span className="text-[10px] font-bold text-gray-400">
                                                {report.publishedAt ? new Date(report.publishedAt).toLocaleDateString() : 'N/A'}
                                            </span>
                                        </div>
                                        <h4 className="font-bold text-gray-900 text-sm mb-1">
                                            {report.student?.user?.firstName ? `${report.student.user.firstName}'s Report` : 'Student Report'}
                                        </h4>
                                        <p className="text-xs text-gray-500 line-clamp-1">{report.summary || 'No summary available'}</p>
                                    </div>
                                );}) : (
                                    <div className="card text-center py-8 bg-gray-50 border-dashed border-2">
                                        <FileText className="mx-auto text-gray-300 mb-2" size={24} />
                                        <p className="text-gray-500 text-xs font-medium">No reports published yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Support Box */}
                        <div
                            onClick={() => navigate('/messaging')}
                            className="bg-primary-600 rounded-2xl p-6 text-white relative overflow-hidden group cursor-pointer hover:shadow-lg transition-all hover:bg-primary-700"
                        >
                            <div className="relative z-10 space-y-2">
                                <h3 className="font-bold">Need Help?</h3>
                                <p className="text-xs text-primary-100">Contact the academy administration for any queries.</p>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigate('/messaging');
                                    }}
                                    className="bg-white text-primary-600 text-xs font-bold py-2 px-4 rounded-lg mt-2 flex items-center gap-2 hover:bg-primary-50 transition-colors"
                                >
                                    <MessageCircle size={14} />
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
