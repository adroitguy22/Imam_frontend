import { useEffect, useState } from 'react';
import {
    Users,
    Wallet,
    CheckCircle,
    AlertTriangle,
    FileText,
    TrendingUp,
    Star,
    MessageCircle,
    Eye,
    RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/Toast';
import api from '../lib/api';
import { DashboardLayout } from '../components/DashboardLayout';

interface Child {
    id: string;
    studentId: string;
    user: {
        firstName: string;
        lastName: string;
    };
    class?: {
        name: string;
    };
    activeTermName: string;
    fees: Array<{
        amount: number;
        status: string;
    }>;
}

export const ParentChildren = () => {
    const navigate = useNavigate();
    const { showError, showSuccess } = useToast();
    const [children, setChildren] = useState<Child[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const fetchChildren = async (showLoading = true) => {
        try {
            if (showLoading) setIsLoading(true);
            const data = await api.getParentChildren();
            setChildren(Array.isArray(data) ? data : []);
        } catch (error: any) {
            console.error('Failed to fetch children:', error);
            showError('Unable to load children. Please try again.');
        } finally {
            if (showLoading) setIsLoading(false);
            setIsRefreshing(false);
        }
    };

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await fetchChildren(false);
        showSuccess('Data refreshed successfully');
    };

    useEffect(() => {
        fetchChildren();
    }, []);

    const getChildInitials = (child: Child) => {
        const firstInitial = child.user?.firstName?.[0] || '';
        const lastInitial = child.user?.lastName?.[0] || '';
        return (firstInitial + lastInitial || 'S').toUpperCase();
    };

    const getChildName = (child: Child) => {
        return `${child.user?.firstName || ''} ${child.user?.lastName || ''}`.trim() || 'Student';
    };

    const getOutstandingFees = (child: Child) => {
        if (!Array.isArray(child.fees)) return 0;
        return child.fees.reduce((acc, fee) => fee?.status === 'PENDING' ? acc + (fee?.amount || 0) : acc, 0);
    };

    const getTotalFees = (child: Child) => {
        if (!Array.isArray(child.fees)) return 0;
        return child.fees.reduce((acc, fee) => acc + (fee?.amount || 0), 0);
    };

    const getPaidFees = (child: Child) => {
        if (!Array.isArray(child.fees)) return 0;
        return child.fees.reduce((acc, fee) => fee?.status === 'PAID' ? acc + (fee?.amount || 0) : acc, 0);
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
                        <h1 className="text-3xl font-black text-gray-900">My Children</h1>
                        <p className="text-gray-500 font-medium tracking-tight">View and manage your children's academic progress and fees.</p>
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

                {/* Empty State */}
                {!children || children.length === 0 ? (
                    <div className="card text-center py-16 bg-blue-50 border-blue-200">
                        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Users size={40} className="text-blue-600" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">No Children Linked</h2>
                        <p className="text-gray-600 mb-6 max-w-md mx-auto">
                            Your account is not yet linked to any students. Please contact the school administration to link your children to your account.
                        </p>
                        <div className="inline-flex items-center gap-2 text-sm text-blue-700 bg-blue-100 px-6 py-3 rounded-lg">
                            <Users size={18} />
                            Contact school office for assistance
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {children.map((child) => {
                            const outstanding = getOutstandingFees(child);
                            const total = getTotalFees(child);
                            const paid = getPaidFees(child);

                            return (
                                <div
                                    key={child.id}
                                    className="card hover:shadow-lg transition-all duration-200 border-l-4 border-l-primary-500"
                                >
                                    {/* Child Header */}
                                    <div className="flex items-start justify-between p-6 border-b border-gray-100">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 text-white rounded-2xl flex items-center justify-center text-xl font-bold shadow-lg">
                                                {getChildInitials(child)}
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-900">{getChildName(child)}</h3>
                                                <p className="text-sm text-gray-500">{child.studentId || ''}</p>
                                                <p className="text-sm text-gray-500">{child.class?.name || 'No class assigned'}</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => navigate(`/student/${child.id}`)}
                                            className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                            title="View Full Profile"
                                        >
                                            <Eye size={20} />
                                        </button>
                                    </div>

                                    {/* Stats Grid */}
                                    <div className="grid grid-cols-3 gap-4 p-6">
                                        {/* Fee Status */}
                                        <div className="text-center">
                                            <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mx-auto mb-2">
                                                <AlertTriangle size={20} className="text-red-600" />
                                            </div>
                                            <p className="text-xs font-bold text-gray-400 uppercase">Outstanding</p>
                                            <p className="text-lg font-bold text-red-600">
                                                ₦{outstanding.toLocaleString()}
                                            </p>
                                        </div>

                                        {/* Paid Fees */}
                                        <div className="text-center border-x border-gray-100">
                                            <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center mx-auto mb-2">
                                                <CheckCircle size={20} className="text-green-600" />
                                            </div>
                                            <p className="text-xs font-bold text-gray-400 uppercase">Paid</p>
                                            <p className="text-lg font-bold text-green-600">
                                                ₦{paid.toLocaleString()}
                                            </p>
                                        </div>

                                        {/* Total Fees */}
                                        <div className="text-center">
                                            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-2">
                                                <Wallet size={20} className="text-blue-600" />
                                            </div>
                                            <p className="text-xs font-bold text-gray-400 uppercase">Total</p>
                                            <p className="text-lg font-bold text-blue-600">
                                                ₦{total.toLocaleString()}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Quick Actions */}
                                    <div className="bg-gray-50 px-6 py-4 rounded-b-2xl">
                                        <p className="text-xs font-bold text-gray-400 uppercase mb-3">Quick Actions</p>
                                        <div className="grid grid-cols-4 gap-2">
                                            <button
                                                onClick={() => navigate(`/student/${child.id}`, { state: { activeTab: 'progress' } })}
                                                className="flex flex-col items-center gap-1 p-3 bg-white rounded-xl hover:bg-primary-50 hover:text-primary-600 transition-colors group"
                                            >
                                                <TrendingUp size={18} className="text-primary-600 group-hover:scale-110 transition-transform" />
                                                <span className="text-xs font-medium">Progress</span>
                                            </button>
                                            <button
                                                onClick={() => navigate(`/student/${child.id}`, { state: { activeTab: 'achievements' } })}
                                                className="flex flex-col items-center gap-1 p-3 bg-white rounded-xl hover:bg-orange-50 hover:text-orange-600 transition-colors group"
                                            >
                                                <Star size={18} className="text-orange-600 group-hover:scale-110 transition-transform" />
                                                <span className="text-xs font-medium">Level</span>
                                            </button>
                                            <button
                                                onClick={() => navigate(`/student/${child.id}`, { state: { activeTab: 'reports' } })}
                                                className="flex flex-col items-center gap-1 p-3 bg-white rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-colors group"
                                            >
                                                <FileText size={18} className="text-blue-600 group-hover:scale-110 transition-transform" />
                                                <span className="text-xs font-medium">Reports</span>
                                            </button>
                                            <button
                                                onClick={() => navigate(`/messaging`)}
                                                className="flex flex-col items-center gap-1 p-3 bg-white rounded-xl hover:bg-green-50 hover:text-green-600 transition-colors group"
                                            >
                                                <MessageCircle size={18} className="text-green-600 group-hover:scale-110 transition-transform" />
                                                <span className="text-xs font-medium">Message</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};
