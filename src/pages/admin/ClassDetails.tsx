import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Calendar, User, ExternalLink } from 'lucide-react';
import api from '../../lib/api';
import { DashboardLayout } from '../../components/DashboardLayout';

export const ClassDetails = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [classData, setClassData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchClassDetails = async () => {
            if (!id) return;
            try {
                const data = await api.getClass(id);
                setClassData(data);
            } catch (err) {
                console.error('Failed to fetch class details', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchClassDetails();
    }, [id]);

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </div>
            </DashboardLayout>
        );
    }

    if (!classData) {
        return (
            <DashboardLayout>
                <div className="flex flex-col items-center justify-center h-full">
                    <h2 className="text-xl font-bold text-gray-900">Class Not Found</h2>
                    <button onClick={() => navigate('/admin/classes')} className="mt-4 btn btn-primary">Go Back</button>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <button
                    onClick={() => navigate('/admin/classes')}
                    className="flex items-center space-x-2 text-gray-500 hover:text-gray-900 transition-colors"
                >
                    <ArrowLeft size={20} />
                    <span>Back to Classes</span>
                </button>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{classData.name}</h1>
                            <p className="text-gray-500">{classData.level} - {classData.academicYear}</p>
                        </div>
                        <div className="flex items-center space-x-3">
                            <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium border border-green-100">
                                Active
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="p-4 bg-gray-50 rounded-lg flex items-center space-x-4">
                            <div className="p-3 bg-white rounded-lg shadow-sm text-primary-600">
                                <Users size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-medium">Students</p>
                                <p className="text-xl font-bold text-gray-900">{classData._count?.students || 0} / {classData.capacity}</p>
                            </div>
                        </div>

                        <div className="p-4 bg-gray-50 rounded-lg flex items-center space-x-4">
                            <div className="p-3 bg-white rounded-lg shadow-sm text-blue-600">
                                <User size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-medium">Teacher</p>
                                <p className="text-lg font-bold text-gray-900">
                                    {classData.teacher?.user
                                        ? `${classData.teacher.user.firstName} ${classData.teacher.user.lastName}`
                                        : 'Unassigned'}
                                </p>
                            </div>
                        </div>

                        <div className="p-4 bg-gray-50 rounded-lg flex items-center space-x-4">
                            <div className="p-3 bg-white rounded-lg shadow-sm text-purple-600">
                                <Calendar size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 font-medium">Academic Year</p>
                                <p className="text-lg font-bold text-gray-900">{classData.academicYear}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-100">
                        <h2 className="text-lg font-bold text-gray-900">Enrolled Students</h2>
                    </div>

                    {classData.students && classData.students.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Student Name</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Email</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase">Date of Birth</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {classData.students.map((student: any) => (
                                        <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-medium text-gray-900">
                                                    {student.user.firstName} {student.user.lastName}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-500 text-sm">
                                                {student.user.email}
                                            </td>
                                            <td className="px-6 py-4 text-gray-500 text-sm">
                                                {new Date(student.dateOfBirth).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => navigate(`/student/${student.id}`)}
                                                    className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center justify-end space-x-1"
                                                >
                                                    <span>View Profile</span>
                                                    <ExternalLink size={14} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="p-8 text-center text-gray-500">
                            No students enrolled in this class yet.
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};
