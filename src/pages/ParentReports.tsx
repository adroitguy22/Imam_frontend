import { useEffect, useState } from 'react';
import {
    FileText,
    Calendar,
    Eye,
    Filter,
    RefreshCw,
    FileWarning,
    User
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/Toast';
import api from '../lib/api';
import { DashboardLayout } from '../components/DashboardLayout';

interface Report {
    id: string;
    summary: string;
    publishedAt: string;
    term: {
        name: string;
        academicYear: string;
    };
    student: {
        id: string;
        user: {
            firstName: string;
            lastName: string;
        };
    };
}

export const ParentReports = () => {
    const navigate = useNavigate();
    const { showError, showSuccess } = useToast();
    const [reports, setReports] = useState<Report[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [filterTerm, setFilterTerm] = useState<string>('all');

    const fetchReports = async (showLoading = true) => {
        try {
            if (showLoading) setIsLoading(true);
            const data = await api.getParentReports();
            setReports(Array.isArray(data) ? data : []);
        } catch (error: any) {
            console.error('Failed to fetch reports:', error);
            showError('Unable to load reports. Please try again.');
        } finally {
            if (showLoading) setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await fetchReports(false);
        showSuccess('Reports refreshed successfully');
    };

    useEffect(() => {
        fetchReports();
    }, []);

    // Get unique terms for filter
    const uniqueTerms = Array.from(new Set(reports.map(r => r.term?.name))).filter(Boolean);
    const filteredReports = filterTerm === 'all'
        ? reports
        : reports.filter(r => r.term?.name === filterTerm);

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-NG', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getStudentName = (report: Report) => {
        const firstName = report.student?.user?.firstName || '';
        const lastName = report.student?.user?.lastName || '';
        return (firstName + ' ' + lastName).trim() || 'Student';
    };

    const handleViewReport = (report: Report) => {
        navigate(`/student/${report.student.id}`, { state: { activeTab: 'reports' } });
    };

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
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900">Progress Reports</h1>
                        <p className="text-gray-500 font-medium tracking-tight">View published reports for your children.</p>
                    </div>
                    <button
                        onClick={handleRefresh}
                        disabled={isRefreshing}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                        <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} />
                        <span>Refresh</span>
                    </button>
                </div>

                {/* Stats Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="card bg-gradient-to-br from-blue-600 to-blue-700 text-white border-none shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-100 text-xs font-bold uppercase tracking-widest">Total Reports</p>
                                <h3 className="text-3xl font-black mt-1">{reports.length}</h3>
                            </div>
                            <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl">
                                <FileText size={24} />
                            </div>
                        </div>
                    </div>
                    <div className="card bg-white border-none shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Terms</p>
                                <h3 className="text-3xl font-black text-gray-900 mt-1">{uniqueTerms.length}</h3>
                            </div>
                            <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
                                <Calendar size={24} />
                            </div>
                        </div>
                    </div>
                    <div className="card bg-white border-none shadow-lg">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Children</p>
                                <h3 className="text-3xl font-black text-gray-900 mt-1">
                                    {Array.from(new Set(reports.map(r => r.student?.id))).length}
                                </h3>
                            </div>
                            <div className="p-3 bg-green-50 text-green-600 rounded-2xl">
                                <User size={24} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filter */}
                {uniqueTerms.length > 0 && (
                    <div className="flex items-center gap-3">
                        <Filter size={18} className="text-gray-400" />
                        <select
                            value={filterTerm}
                            onChange={(e) => setFilterTerm(e.target.value)}
                            className="px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="all">All Terms</option>
                            {uniqueTerms.map(term => (
                                <option key={term} value={term}>{term}</option>
                            ))}
                        </select>
                        <span className="text-sm text-gray-500">
                            Showing {filteredReports.length} of {reports.length} reports
                        </span>
                    </div>
                )}

                {/* Empty State */}
                {!reports || reports.length === 0 ? (
                    <div className="card text-center py-16 bg-gray-50 border-dashed border-2">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <FileWarning size={40} className="text-gray-400" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">No Reports Available</h2>
                        <p className="text-gray-600 max-w-md mx-auto">
                            No progress reports have been published for your children yet. Reports will appear here once teachers generate them.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredReports.filter(r => r?.id).map((report) => (
                            <div
                                key={report.id}
                                className="card hover:shadow-lg transition-all duration-200 group"
                            >
                                {/* Report Header */}
                                <div className="p-5 border-b border-gray-100">
                                    <div className="flex items-start justify-between mb-3">
                                        <span className="text-xs font-black uppercase text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                                            {report.term?.name || 'Term Report'}
                                        </span>
                                        <span className="text-xs font-bold text-gray-400 flex items-center gap-1">
                                            <Calendar size={12} />
                                            {formatDate(report.publishedAt)}
                                        </span>
                                    </div>
                                    <h3 className="font-bold text-gray-900 mb-1">
                                        {getStudentName(report)}'s Report
                                    </h3>
                                    <p className="text-xs text-gray-500">{report.term?.academicYear || ''}</p>
                                </div>

                                {/* Summary Preview */}
                                <div className="p-5">
                                    <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                                        {report.summary || 'No summary available for this report.'}
                                    </p>

                                    {/* Actions */}
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleViewReport(report)}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
                                        >
                                            <Eye size={16} />
                                            View Report
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};
