import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Users,
    BarChart2,
    Clock,
    ArrowRight,
    PlusCircle,
    Search,
    Filter
} from 'lucide-react';
import api from '../lib/api';
import { DashboardLayout } from '../components/DashboardLayout';
import { RegisterStudentModal } from '../components/RegisterStudentModal';

interface Student {
    id: string;
    studentId: string;
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
    assessmentDate: string;
    currentLevel: number;
    skillDomain: {
        name: string;
    };
    student: {
        user: {
            firstName: string;
            lastName: string;
        };
    };
}

export const TeacherDashboard = () => {
    const [students, setStudents] = useState<Student[]>([]);
    const [recentLogs, setRecentLogs] = useState<ProgressLog[]>([]);
    const [classes, setClasses] = useState<{ id: string; name: string }[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
    const navigate = useNavigate();

    const fetchDashboardData = async () => {
        try {
            const [logs, studentsData, classesData] = await Promise.all([
                api.getTeacherProgressLogs(),
                api.getTeacherStudents(),
                api.getClasses() // Teachers can access this now
            ]);

            setRecentLogs(logs.slice(0, 5));
            setStudents(studentsData);
            setClasses(classesData);
        } catch (error) {
            console.error('Failed to fetch dashboard data', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const stats = [
        { label: 'Total Students', value: students.length, icon: <Users className="text-blue-600" />, bgColor: 'bg-blue-50' },
        { label: 'Assessments this Week', value: recentLogs.length, icon: <BarChart2 className="text-green-600" />, bgColor: 'bg-green-50' },
        { label: 'Pending Reviews', value: '12', icon: <Clock className="text-purple-600" />, bgColor: 'bg-purple-50' },
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
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Teacher Dashboard</h1>
                        <p className="text-gray-500">Welcome back! Here's what's happening with your students.</p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setIsRegisterModalOpen(true)}
                            className="btn bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                        >
                            <Users size={20} />
                            <span>Register Student</span>
                        </button>
                        <button
                            onClick={() => navigate('/teacher/log-progress')}
                            className="btn btn-primary flex items-center space-x-2"
                        >
                            <PlusCircle size={20} />
                            <span>New Assessment</span>
                        </button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {stats.map((stat, i) => (
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

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Student List */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold text-gray-900">My Students</h2>
                            <button
                                onClick={() => navigate('/teacher/students')}
                                className="text-sm text-primary-600 font-semibold hover:text-primary-700 flex items-center space-x-1"
                            >
                                <span>View All</span>
                                <ArrowRight size={16} />
                            </button>
                        </div>

                        <div className="card p-0 overflow-hidden">
                            <div className="p-4 border-b border-gray-100 flex items-center space-x-4">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                    <input
                                        type="text"
                                        placeholder="Search students..."
                                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-lg focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>
                                <button className="p-2 text-gray-400 hover:text-gray-600">
                                    <Filter size={20} />
                                </button>
                            </div>

                            <div className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
                                {students.length > 0 ? (
                                    students.map((student) => (
                                        <div
                                            key={student.id}
                                            className="p-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer transition-colors"
                                            onClick={() => navigate(`/teacher/students/${student.id}`)}
                                        >
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-bold">
                                                    {student.user.firstName[0]}{student.user.lastName[0]}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900">{student.user.firstName} {student.user.lastName}</p>
                                                    <p className="text-xs text-gray-500">{student.studentId} • {student.class?.name || 'No Class'}</p>
                                                </div>
                                            </div>
                                            <button className="text-gray-400 hover:text-primary-600">
                                                <ArrowRight size={20} />
                                            </button>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-8 text-center text-gray-500">
                                        No students found. Register one to get started!
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-bold text-gray-900">Recent Activity</h2>
                        <div className="card space-y-6">
                            {recentLogs.map((log) => (
                                <div key={log.id} className="flex space-x-3">
                                    <div className="w-2 h-2 mt-2 rounded-full bg-primary-500 shrink-0"></div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">
                                            Logged {log.skillDomain.name} for {log.student.user.firstName}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {new Date(log.assessmentDate).toLocaleDateString()} • Level {log.currentLevel}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            {recentLogs.length === 0 && (
                                <p className="text-sm text-gray-500 text-center py-4">No recent activity found.</p>
                            )}
                        </div>
                    </div>
                </div>

                <RegisterStudentModal
                    isOpen={isRegisterModalOpen}
                    onClose={() => setIsRegisterModalOpen(false)}
                    onSuccess={() => {
                        fetchDashboardData();
                    }}
                    teacherClasses={classes}
                />
            </div>
        </DashboardLayout>
    );
};
