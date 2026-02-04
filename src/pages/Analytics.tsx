import { useState, useEffect } from 'react';
import {
    BarChart2,
    TrendingUp,
    Users,
    Award,
    Calendar,
    CheckCircle,
    XCircle,
    Clock,
    RefreshCw,
    Filter
} from 'lucide-react';
import { useToast } from '../components/Toast';
import api from '../lib/api';
import { DashboardLayout } from '../components/DashboardLayout';

interface Student {
    id: string;
    user: {
        firstName: string;
        lastName: string;
    };
    class: {
        name: string;
    };
}

interface ProgressLog {
    id: string;
    currentLevel: number;
    skillDomain: {
        name: string;
    };
    student: {
        user: {
            firstName: string;
        };
    };
    assessmentDate: string;
}

export const Analytics = () => {
    const { showError, showSuccess } = useToast();
    const [isLoading, setIsLoading] = useState(true);
    const [students, setStudents] = useState<Student[]>([]);
    const [progressLogs, setProgressLogs] = useState<ProgressLog[]>([]);
    const [selectedPeriod, setSelectedPeriod] = useState('all');

    useEffect(() => {
        fetchAnalyticsData();
    }, [selectedPeriod]);

    const fetchAnalyticsData = async () => {
        setIsLoading(true);
        try {
            const [studentsData, logsData] = await Promise.all([
                api.getTeacherStudents(),
                api.getTeacherProgressLogs()
            ]);
            setStudents(studentsData);
            setProgressLogs(logsData);
        } catch (error) {
            console.error('Failed to fetch analytics data:', error);
            showError('Unable to load analytics data');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRefresh = async () => {
        await fetchAnalyticsData();
        showSuccess('Analytics refreshed');
    };

    // Calculate analytics
    const totalStudents = students.length;
    const totalAssessments = progressLogs.length;
    const avgPerformance = progressLogs.length > 0
        ? Math.round(progressLogs.reduce((sum, log) => sum + log.currentLevel, 0) / progressLogs.length)
        : 0;

    // Get top performers
    const studentPerformance = students.map(student => {
        const studentLogs = progressLogs.filter(log => log.student?.user?.firstName === student.user.firstName);
        const avgLevel = studentLogs.length > 0
            ? studentLogs.reduce((sum, log) => sum + log.currentLevel, 0) / studentLogs.length
            : 0;
        return { ...student, avgLevel, assessmentCount: studentLogs.length };
    }).sort((a, b) => b.avgLevel - a.avgLevel);

    const topPerformers = studentPerformance.slice(0, 5);

    // Skill domain breakdown
    const domainBreakdown = progressLogs.reduce((acc, log) => {
        const domain = log.skillDomain?.name || 'Unknown';
        if (!acc[domain]) {
            acc[domain] = { total: 0, count: 0 };
        }
        acc[domain].total += log.currentLevel;
        acc[domain].count += 1;
        return acc;
    }, {} as Record<string, { total: number; count: number }>);

    const domainStats = Object.entries(domainBreakdown).map(([name, data]) => ({
        name,
        avg: Math.round(data.total / data.count),
        count: data.count
    })).sort((a, b) => b.avg - a.avg);

    // Performance distribution
    const performanceDistribution = {
        excellent: progressLogs.filter(log => log.currentLevel >= 8).length,
        good: progressLogs.filter(log => log.currentLevel >= 6 && log.currentLevel < 8).length,
        fair: progressLogs.filter(log => log.currentLevel >= 4 && log.currentLevel < 6).length,
        needsImprovement: progressLogs.filter(log => log.currentLevel < 4).length
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
                        <h1 className="text-3xl font-black text-gray-900">Analytics & Insights</h1>
                        <p className="text-gray-500 font-medium tracking-tight">Track student performance and class progress</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <select
                            value={selectedPeriod}
                            onChange={(e) => setSelectedPeriod(e.target.value)}
                            className="px-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        >
                            <option value="all">All Time</option>
                            <option value="term">This Term</option>
                            <option value="month">This Month</option>
                            <option value="week">This Week</option>
                        </select>
                        <button
                            onClick={handleRefresh}
                            className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <RefreshCw size={18} />
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="card bg-gradient-to-br from-blue-600 to-blue-700 text-white border-none shadow-xl">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-100 text-xs font-bold uppercase tracking-widest">Total Students</p>
                                <h3 className="text-3xl font-black mt-1">{totalStudents}</h3>
                            </div>
                            <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl">
                                <Users size={24} />
                            </div>
                        </div>
                    </div>

                    <div className="card bg-gradient-to-br from-green-600 to-green-700 text-white border-none shadow-xl">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-green-100 text-xs font-bold uppercase tracking-widest">Assessments</p>
                                <h3 className="text-3xl font-black mt-1">{totalAssessments}</h3>
                            </div>
                            <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl">
                                <Calendar size={24} />
                            </div>
                        </div>
                    </div>

                    <div className="card bg-gradient-to-br from-purple-600 to-purple-700 text-white border-none shadow-xl">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-purple-100 text-xs font-bold uppercase tracking-widest">Avg Performance</p>
                                <h3 className="text-3xl font-black mt-1">{avgPerformance}/10</h3>
                            </div>
                            <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl">
                                <TrendingUp size={24} />
                            </div>
                        </div>
                    </div>

                    <div className="card bg-gradient-to-br from-orange-600 to-orange-700 text-white border-none shadow-xl">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-orange-100 text-xs font-bold uppercase tracking-widest">Top Performers</p>
                                <h3 className="text-3xl font-black mt-1">{topPerformers.filter(p => p.avgLevel >= 7).length}</h3>
                            </div>
                            <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl">
                                <Award size={24} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Top Performers */}
                    <div className="card">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-gray-900">Top Performers</h2>
                            <Award className="text-yellow-500" size={20} />
                        </div>
                        {topPerformers.length > 0 ? (
                            <div className="space-y-3">
                                {topPerformers.map((student, index) => (
                                    <div
                                        key={student.id}
                                        className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                                                index === 0 ? 'bg-yellow-400 text-yellow-900' :
                                                index === 1 ? 'bg-gray-300 text-gray-700' :
                                                index === 2 ? 'bg-orange-300 text-orange-800' :
                                                'bg-gray-200 text-gray-600'
                                            }`}>
                                                {index + 1}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-900">
                                                    {student.user.firstName} {student.user.lastName}
                                                </p>
                                                <p className="text-xs text-gray-500">{student.class?.name || 'No class'}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-primary-600">{student.avgLevel.toFixed(1)}/10</p>
                                            <p className="text-xs text-gray-500">{student.assessmentCount} assessments</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-center py-8">No performance data available</p>
                        )}
                    </div>

                    {/* Performance Distribution */}
                    <div className="card">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-gray-900">Performance Distribution</h2>
                            <BarChart2 className="text-blue-600" size={20} />
                        </div>
                        {totalAssessments > 0 ? (
                            <div className="space-y-4">
                                {[
                                    { label: 'Excellent (8-10)', value: performanceDistribution.excellent, color: 'bg-green-500', icon: <CheckCircle size={16} /> },
                                    { label: 'Good (6-7)', value: performanceDistribution.good, color: 'bg-blue-500', icon: <TrendingUp size={16} /> },
                                    { label: 'Fair (4-5)', value: performanceDistribution.fair, color: 'bg-yellow-500', icon: <Clock size={16} /> },
                                    { label: 'Needs Improvement (1-3)', value: performanceDistribution.needsImprovement, color: 'bg-red-500', icon: <XCircle size={16} /> }
                                ].map((stat) => {
                                    const percentage = totalAssessments > 0 ? (stat.value / totalAssessments) * 100 : 0;
                                    return (
                                        <div key={stat.label}>
                                            <div className="flex items-center justify-between mb-1">
                                                <div className="flex items-center gap-2">
                                                    <span className={`p-1 rounded ${stat.color} text-white`}>{stat.icon}</span>
                                                    <span className="text-sm font-medium text-gray-700">{stat.label}</span>
                                                </div>
                                                <span className="text-sm font-bold text-gray-900">{stat.value} ({percentage.toFixed(0)}%)</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className={`${stat.color} h-2 rounded-full transition-all duration-500`}
                                                    style={{ width: `${percentage}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-gray-500 text-center py-8">No assessment data available</p>
                        )}
                    </div>
                </div>

                {/* Skill Domain Breakdown */}
                <div className="card">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-gray-900">Skill Domain Performance</h2>
                        <Filter className="text-purple-600" size={20} />
                    </div>
                    {domainStats.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {domainStats.map((domain) => (
                                <div key={domain.name} className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                                    <h3 className="font-semibold text-gray-900 mb-2">{domain.name}</h3>
                                    <div className="flex items-end justify-between">
                                        <div>
                                            <p className="text-3xl font-black text-primary-600">{domain.avg}/10</p>
                                            <p className="text-xs text-gray-500">{domain.count} assessments</p>
                                        </div>
                                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm">
                                            <span className="text-2xl">
                                                {domain.avg >= 8 ? '🌟' : domain.avg >= 6 ? '👍' : domain.avg >= 4 ? '📈' : '💪'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                                        <div
                                            className="bg-primary-600 h-2 rounded-full"
                                            style={{ width: `${domain.avg * 10}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center py-8">No domain data available</p>
                    )}
                </div>

                {/* Students Needing Attention */}
                <div className="card bg-orange-50 border-orange-200">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-orange-900">Students Needing Attention</h2>
                        <Clock className="text-orange-600" size={20} />
                    </div>
                    {studentPerformance.filter(s => s.avgLevel > 0 && s.avgLevel < 5).length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {studentPerformance
                                .filter(s => s.avgLevel > 0 && s.avgLevel < 5)
                                .slice(0, 6)
                                .map((student) => (
                                    <div
                                        key={student.id}
                                        className="p-4 bg-white rounded-xl border border-orange-200 flex items-center justify-between"
                                    >
                                        <div>
                                            <p className="font-semibold text-gray-900">
                                                {student.user.firstName} {student.user.lastName}
                                            </p>
                                            <p className="text-sm text-orange-600 font-medium">Avg: {student.avgLevel.toFixed(1)}/10</p>
                                        </div>
                                        <button
                                            onClick={() => window.location.href = `/student/${student.id}`}
                                            className="text-xs bg-orange-100 text-orange-700 px-3 py-1 rounded-lg hover:bg-orange-200 transition-colors"
                                        >
                                            View Progress
                                        </button>
                                    </div>
                                ))}
                        </div>
                    ) : (
                        <p className="text-orange-700 text-center py-4">All students are performing well! 🎉</p>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};
