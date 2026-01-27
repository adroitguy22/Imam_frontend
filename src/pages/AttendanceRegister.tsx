import { useState, useEffect } from 'react';
import {
    CheckCircle,
    XCircle,
    Clock,
    Save,
    Users,
    Calendar,
    Loader2,
    AlertCircle,
    ArrowLeft
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../lib/api';

interface Student {
    id: string;
    firstName: string;
    lastName: string;
    user: {
        firstName: string;
        lastName: string;
    };
}

interface Class {
    id: string;
    name: string;
}

export const AttendanceRegister = () => {
    const [classes, setClasses] = useState<Class[]>([]);
    const [selectedClassId, setSelectedClassId] = useState<string>('');
    const [students, setStudents] = useState<Student[]>([]);
    const [attendance, setAttendance] = useState<Record<string, { status: string, notes: string }>>({});
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        fetchClasses();
    }, []);

    useEffect(() => {
        if (selectedClassId) {
            fetchStudents(selectedClassId);
        }
    }, [selectedClassId]);

    const fetchClasses = async () => {
        try {
            const data = await api.getClasses();
            // Filter classes where current user is teacher (or show all if admin)
            setClasses(data);
            if (data.length > 0) {
                setSelectedClassId(data[0].id);
            }
        } catch (err) {
            console.error('Failed to fetch classes', err);
            setError('Failed to load classes.');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchStudents = async (classId: string) => {
        setIsLoading(true);
        try {
            const data = await api.getClass(classId);
            setStudents(data.students);

            // Initialize attendance state
            const initialAttendance: Record<string, { status: string, notes: string }> = {};
            data.forEach((student: Student) => {
                initialAttendance[student.id] = { status: 'PRESENT', notes: '' };
            });
            setAttendance(initialAttendance);

            // Try to fetch existing attendance for this date
            try {
                const existing = await api.getClassAttendance(classId, date);
                if (existing.length > 0) {
                    const existingMap: Record<string, { status: string, notes: string }> = { ...initialAttendance };
                    existing.forEach((record: any) => {
                        existingMap[record.studentId] = { status: record.status, notes: record.notes || '' };
                    });
                    setAttendance(existingMap);
                }
            } catch (e) {
                // No existing attendance or error, keep initial
            }

        } catch (err) {
            console.error('Failed to fetch students', err);
            setError('Failed to load student list.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleStatusChange = (studentId: string, status: string) => {
        setAttendance(prev => ({
            ...prev,
            [studentId]: { ...prev[studentId], status }
        }));
        setSuccess(false);
    };

    const handleNotesChange = (studentId: string, notes: string) => {
        setAttendance(prev => ({
            ...prev,
            [studentId]: { ...prev[studentId], notes }
        }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        setError(null);
        setSuccess(false);

        try {
            const records = Object.entries(attendance).map(([studentId, data]) => ({
                studentId,
                status: data.status,
                notes: data.notes
            }));

            await api.recordAttendance(date, records);
            setSuccess(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to save attendance.');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading && classes.length === 0) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="animate-spin text-primary-600" size={40} />
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto space-y-6 pb-20">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                    <Link to="/teacher/dashboard" className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Attendance Register</h1>
                        <p className="text-sm text-gray-500">Mark daily presence for your class</p>
                    </div>
                </div>
                <div className="flex items-center space-x-3">
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="date"
                            className="input pl-10 text-sm py-2"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                        />
                    </div>
                    <select
                        className="input text-sm py-2 min-w-[150px]"
                        value={selectedClassId}
                        onChange={(e) => setSelectedClassId(e.target.value)}
                    >
                        {classes.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 text-red-700 p-4 rounded-xl flex items-start space-x-3 text-sm animate-in fade-in duration-300">
                    <AlertCircle size={20} className="shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {success && (
                <div className="bg-green-50 text-green-700 p-4 rounded-xl flex items-start space-x-3 text-sm animate-in fade-in duration-300">
                    <CheckCircle size={20} className="shrink-0" />
                    <span>Attendance saved successfully for {new Date(date).toLocaleDateString()}.</span>
                </div>
            )}

            {isLoading ? (
                <div className="flex justify-center p-12">
                    <Loader2 className="animate-spin text-primary-600" size={32} />
                </div>
            ) : students.length === 0 ? (
                <div className="card text-center p-16">
                    <Users className="mx-auto text-gray-300 mb-4" size={64} />
                    <h3 className="text-lg font-medium text-gray-900">No Students Found</h3>
                    <p className="text-gray-500">This class doesn't have any students enrolled yet.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Student</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-center">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Notes</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {students.map((student) => (
                                    <tr key={student.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-bold text-xs">
                                                    {student.user.firstName[0]}{student.user.lastName[0]}
                                                </div>
                                                <span className="font-semibold text-gray-900">
                                                    {student.user.firstName} {student.user.lastName}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center bg-gray-100 p-1 rounded-xl space-x-1">
                                                <button
                                                    onClick={() => handleStatusChange(student.id, 'PRESENT')}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1 transition-all ${attendance[student.id]?.status === 'PRESENT'
                                                        ? 'bg-green-500 text-white shadow-sm'
                                                        : 'text-gray-500 hover:text-gray-700'
                                                        }`}
                                                >
                                                    <CheckCircle size={14} />
                                                    <span className="hidden sm:inline">Present</span>
                                                </button>
                                                <button
                                                    onClick={() => handleStatusChange(student.id, 'LATE')}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1 transition-all ${attendance[student.id]?.status === 'LATE'
                                                        ? 'bg-amber-500 text-white shadow-sm'
                                                        : 'text-gray-500 hover:text-gray-700'
                                                        }`}
                                                >
                                                    <Clock size={14} />
                                                    <span className="hidden sm:inline">Late</span>
                                                </button>
                                                <button
                                                    onClick={() => handleStatusChange(student.id, 'ABSENT')}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center space-x-1 transition-all ${attendance[student.id]?.status === 'ABSENT'
                                                        ? 'bg-red-500 text-white shadow-sm'
                                                        : 'text-gray-500 hover:text-gray-700'
                                                        }`}
                                                >
                                                    <XCircle size={14} />
                                                    <span className="hidden sm:inline">Absent</span>
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <input
                                                type="text"
                                                placeholder="Optional notes..."
                                                className="w-full bg-transparent border-none text-sm text-gray-600 placeholder:text-gray-300 focus:ring-0"
                                                value={attendance[student.id]?.notes || ''}
                                                onChange={(e) => handleNotesChange(student.id, e.target.value)}
                                            />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="btn btn-primary px-10 py-3 flex items-center space-x-2 shadow-lg shadow-primary-200"
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="animate-spin" size={20} />
                                    <span>Saving Register...</span>
                                </>
                            ) : (
                                <>
                                    <Save size={20} />
                                    <span>Save Attendance</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
