import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    User,
    Calendar,
    BookOpen,
    Activity,
    ClipboardList,
    Mail,
    Phone,
    AlertCircle,
    Loader2
} from 'lucide-react';
import api from '../lib/api';
import { DashboardLayout } from '../components/DashboardLayout';
import { DocumentManager } from '../components/DocumentManager';
import { ReportManager } from '../components/ReportManager';
import { PortfolioManager } from '../components/PortfolioManager';
import { AchievementGallery } from '../components/AchievementGallery';
import { useAuthStore } from '../stores/authStore';

export const StudentProfile = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user: currentUser } = useAuthStore();
    const [student, setStudent] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        if (id) {
            fetchStudentDetails();
        }
    }, [id]);

    const fetchStudentDetails = async () => {
        setIsLoading(true);
        try {
            const data = await api.getStudentById(id!);
            setStudent(data);
        } catch (err) {
            console.error('Failed to fetch student details', err);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="flex flex-col items-center justify-center min-h-[60vh]">
                    <Loader2 className="animate-spin text-primary-600 mb-4" size={48} />
                    <p className="text-gray-500 font-medium">Loading student profile...</p>
                </div>
            </DashboardLayout>
        );
    }

    if (!student) {
        return (
            <DashboardLayout>
                <div className="max-w-md mx-auto mt-12 text-center">
                    <div className="bg-red-50 text-red-700 p-8 rounded-2xl">
                        <AlertCircle className="mx-auto mb-4" size={48} />
                        <h2 className="text-xl font-bold mb-2">Student Not Found</h2>
                        <p className="mb-6">The student you are looking for does not exist or you don't have permission to view their profile.</p>
                        <button onClick={() => navigate(-1)} className="btn btn-primary">
                            Go Back
                        </button>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    const { user } = student;
    const studentName = `${user.firstName} ${user.lastName}`;

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center space-x-2 text-gray-500 hover:text-gray-900 transition-colors"
                >
                    <ArrowLeft size={20} />
                    <span>Back</span>
                </button>

                {/* Header Card */}
                <div className="card p-0 overflow-hidden border-none shadow-lg bg-gradient-to-r from-primary-600 to-primary-700 text-white">
                    <div className="p-8 md:p-10 flex flex-col md:flex-row items-center md:items-start gap-6">
                        <div className="w-24 h-24 md:w-32 md:h-32 bg-white/20 backdrop-blur-md border-4 border-white/30 rounded-full flex items-center justify-center text-4xl font-bold shadow-xl">
                            {user.firstName[0]}{user.lastName[0]}
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <h1 className="text-3xl md:text-4xl font-black mb-2">{studentName}</h1>
                            <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-4">
                                <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-bold tracking-wider uppercase">
                                    {student.class?.name || 'Unassigned Class'}
                                </span>
                                <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-xs font-bold tracking-wider uppercase">
                                    ID: {student.studentId}
                                </span>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase ${student.isActive ? 'bg-green-400/30 text-green-100' : 'bg-red-400/30 text-red-100'}`}>
                                    {student.isActive ? 'Active Student' : 'Inactive'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Tabs Navigation */}
                    <div className="bg-white/10 backdrop-blur-md px-8 flex overflow-x-auto border-t border-white/10 scrollbar-hide">
                        {['overview', 'portfolio', 'achievements', 'attendance', 'progress', 'reports', 'documents', 'info'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-6 py-4 text-sm font-bold uppercase tracking-widest transition-all relative whitespace-nowrap ${activeTab === tab ? 'text-white' : 'text-primary-100 hover:text-white'
                                    }`}
                            >
                                {tab}
                                {activeTab === tab && (
                                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-white rounded-t-full shadow-[0_0_10px_rgba(255,255,255,0.5)]"></div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tab Content */}
                <div className="grid grid-cols-1 gap-6">
                    {activeTab === 'overview' && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-2 space-y-6">
                                <div className="card">
                                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                        <Activity className="text-primary-600" size={20} />
                                        Recent Activity
                                    </h3>
                                    <div className="space-y-4">
                                        <p className="text-gray-500 italic text-sm">No recent progress logs found.</p>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-6">
                                <div className="card">
                                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                        <User className="text-primary-600" size={20} />
                                        Quick Info
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Gender</span>
                                            <span className="font-bold text-gray-900">{student.gender}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Age</span>
                                            <span className="font-bold text-gray-900">
                                                {new Date().getFullYear() - new Date(student.dateOfBirth).getFullYear()} years
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500">Enrollment</span>
                                            <span className="font-bold text-gray-900">
                                                {new Date(student.enrollmentDate).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'portfolio' && (
                        <PortfolioManager
                            studentId={student.id}
                            canUpload={currentUser?.role === 'ADMIN' || currentUser?.role === 'TEACHER'}
                            canDelete={currentUser?.role === 'ADMIN'}
                        />
                    )}

                    {activeTab === 'achievements' && (
                        <AchievementGallery
                            studentId={student.id}
                            canAward={currentUser?.role === 'ADMIN' || currentUser?.role === 'TEACHER'}
                        />
                    )}

                    {activeTab === 'attendance' && (
                        <AttendanceView studentId={student.id} />
                    )}

                    {activeTab === 'progress' && (
                        <div className="card">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold flex items-center gap-2">
                                    <ClipboardList className="text-primary-600" size={20} />
                                    Academic Progress
                                </h3>
                                {currentUser?.role !== 'PARENT' && (
                                    <button
                                        onClick={() => navigate('/teacher/log-progress', { state: { studentId: student.id } })}
                                        className="btn btn-primary text-sm"
                                    >
                                        Add Progress Log
                                    </button>
                                )}
                            </div>
                            <p className="text-gray-500 text-center py-12">Select "Overview" or check specific skill domains in the progress section.</p>
                        </div>
                    )}

                    {activeTab === 'reports' && (
                        <ReportManager
                            studentId={student.id}
                            canGenerate={currentUser?.role === 'ADMIN' || currentUser?.role === 'TEACHER'}
                        />
                    )}

                    {activeTab === 'documents' && (
                        <DocumentManager
                            studentId={student.id}
                            canUpload={currentUser?.role === 'ADMIN' || currentUser?.role === 'TEACHER'}
                            canDelete={currentUser?.role === 'ADMIN'}
                        />
                    )}

                    {activeTab === 'info' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="card">
                                <h3 className="text-lg font-bold mb-4">Personal Details</h3>
                                <div className="space-y-4">
                                    <div className="flex items-start space-x-3">
                                        <Calendar className="text-gray-400 mt-0.5" size={18} />
                                        <div>
                                            <p className="text-xs text-gray-500">Date of Birth</p>
                                            <p className="font-medium text-gray-900">
                                                {new Date(student.dateOfBirth).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-3">
                                        <Mail className="text-gray-400 mt-0.5" size={18} />
                                        <div>
                                            <p className="text-xs text-gray-500">Email Address</p>
                                            <p className="font-medium text-gray-900">{user.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-3">
                                        <Phone className="text-gray-400 mt-0.5" size={18} />
                                        <div>
                                            <p className="text-xs text-gray-500">Phone</p>
                                            <p className="font-medium text-gray-900">{user.phoneNumber || 'Not provided'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="card">
                                <h3 className="text-lg font-bold mb-4">Guardians / Parents</h3>
                                <div className="space-y-4">
                                    {student.parents?.length > 0 ? student.parents.map((parent: any) => (
                                        <div key={parent.id} className="p-3 bg-gray-50 rounded-lg flex items-center justify-between">
                                            <div>
                                                <p className="font-bold text-gray-900">{parent.user.firstName} {parent.user.lastName}</p>
                                                <p className="text-xs text-gray-500">{parent.user.email}</p>
                                            </div>
                                            <span className="text-[10px] font-bold text-primary-600 bg-primary-100 px-2 py-0.5 rounded-full uppercase">
                                                {parent.relationship || 'Guardian'}
                                            </span>
                                        </div>
                                    )) : (
                                        <p className="text-gray-500 text-sm italic">No parents linked yet.</p>
                                    )}
                                </div>
                            </div>

                            <div className="md:col-span-2 card">
                                <h3 className="text-lg font-bold mb-4">Medical & Special Info</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <p className="text-sm font-bold text-gray-900 mb-1 flex items-center gap-2">
                                            <AlertCircle className="text-yellow-500" size={16} />
                                            Medical Information
                                        </p>
                                        <div className="p-3 bg-gray-50 rounded-lg min-h-[80px]">
                                            <p className="text-sm text-gray-600">{student.medicalInfo || 'No medical info provided.'}</p>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900 mb-1 flex items-center gap-2">
                                            <BookOpen className="text-primary-500" size={16} />
                                            Special Needs / Learning Support
                                        </p>
                                        <div className="p-3 bg-gray-50 rounded-lg min-h-[80px]">
                                            <p className="text-sm text-gray-600">{student.specialNeeds || 'No special needs recorded.'}</p>
                                        </div>
                                    </div>
                                    <div className="md:col-span-2">
                                        <p className="text-sm font-bold text-gray-900 mb-1">General Notes</p>
                                        <div className="p-3 bg-gray-50 rounded-lg">
                                            <p className="text-sm text-gray-600">{student.notes || 'No general notes.'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

const AttendanceView = ({ studentId }: { studentId: string }) => {
    const [attendance, setAttendance] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAttendance = async () => {
            try {
                const data = await api.getStudentAttendance(studentId);
                setAttendance(data);
            } catch (err) {
                console.error('Failed to fetch attendance', err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchAttendance();
    }, [studentId]);

    if (isLoading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary-600" /></div>;

    const stats = {
        present: attendance.filter(a => a.status === 'PRESENT').length,
        late: attendance.filter(a => a.status === 'LATE').length,
        absent: attendance.filter(a => a.status === 'ABSENT').length,
        total: attendance.length
    };

    const attendanceRate = stats.total > 0 ? Math.round(((stats.present + stats.late) / stats.total) * 100) : 0;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="card p-4 text-center">
                    <p className="text-xs text-gray-500 uppercase font-bold">Attendance Rate</p>
                    <p className="text-2xl font-black text-primary-600">{attendanceRate}%</p>
                </div>
                <div className="card p-4 text-center border-l-4 border-l-green-500">
                    <p className="text-xs text-gray-500 uppercase font-bold">Present</p>
                    <p className="text-2xl font-black text-green-600">{stats.present}</p>
                </div>
                <div className="card p-4 text-center border-l-4 border-l-amber-500">
                    <p className="text-xs text-gray-500 uppercase font-bold">Late</p>
                    <p className="text-2xl font-black text-amber-600">{stats.late}</p>
                </div>
                <div className="card p-4 text-center border-l-4 border-l-red-500">
                    <p className="text-xs text-gray-500 uppercase font-bold">Absent</p>
                    <p className="text-2xl font-black text-red-600">{stats.absent}</p>
                </div>
            </div>

            <div className="card overflow-hidden">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                            <th className="px-6 py-3">Date</th>
                            <th className="px-6 py-3">Status</th>
                            <th className="px-6 py-3">Notes</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {attendance.length === 0 ? (
                            <tr>
                                <td colSpan={3} className="px-6 py-8 text-center text-gray-500 italic">No attendance records found.</td>
                            </tr>
                        ) : (
                            attendance.map((record) => (
                                <tr key={record.id} className="text-sm">
                                    <td className="px-6 py-4 font-medium">{new Date(record.date).toLocaleDateString()}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${record.status === 'PRESENT' ? 'bg-green-100 text-green-700' :
                                                record.status === 'LATE' ? 'bg-amber-100 text-amber-700' :
                                                    'bg-red-100 text-red-700'
                                            }`}>
                                            {record.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">{record.notes || '-'}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
