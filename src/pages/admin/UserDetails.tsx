import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, Shield, CheckCircle, XCircle } from 'lucide-react';
import api from '../../lib/api';
import { DashboardLayout } from '../../components/DashboardLayout';

export const UserDetails = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchUserDetails = async () => {
            if (!id) return;
            try {
                const data = await api.getUser(id);
                setUser(data);
                // If it's a student, redirect to student profile. This page is for staff/parents.
                if (data.role === 'STUDENT' && data.student) {
                    navigate(`/student/${data.student.id}`, { replace: true });
                }
            } catch (err) {
                console.error('Failed to fetch user details', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserDetails();
    }, [id, navigate]);

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </div>
            </DashboardLayout>
        );
    }

    if (!user) {
        return (
            <DashboardLayout>
                <div className="flex flex-col items-center justify-center h-full">
                    <h2 className="text-xl font-bold text-gray-900">User Not Found</h2>
                    <button onClick={() => navigate('/admin/users')} className="mt-4 btn btn-primary">Go Back</button>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <button
                    onClick={() => navigate('/admin/users')}
                    className="flex items-center space-x-2 text-gray-500 hover:text-gray-900 transition-colors"
                >
                    <ArrowLeft size={20} />
                    <span>Back to Users</span>
                </button>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 md:p-8 border-b border-gray-100 flex flex-col md:flex-row gap-6 items-start">
                        <div className="w-24 h-24 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center text-3xl font-bold">
                            {user.firstName[0]}{user.lastName[0]}
                        </div>
                        <div className="flex-1">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <h1 className="text-2xl font-bold text-gray-900">{user.firstName} {user.lastName}</h1>
                                    <div className="flex items-center space-x-2 mt-2">
                                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
                                            user.role === 'TEACHER' ? 'bg-blue-100 text-blue-700' :
                                                'bg-green-100 text-green-700'
                                            }`}>
                                            {user.role}
                                        </span>
                                        <span className={`flex items-center space-x-1 px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${user.isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                                            }`}>
                                            {user.isActive ? <CheckCircle size={12} /> : <XCircle size={12} />}
                                            <span>{user.isActive ? 'Active' : 'Inactive'}</span>
                                        </span>
                                    </div>
                                </div>

                                <div className="flex space-x-3">
                                    <button className="btn bg-white border border-gray-200 text-gray-700 hover:bg-gray-50">
                                        Reset Password
                                    </button>
                                    <button className="btn btn-primary">
                                        Edit Profile
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
                                <div className="flex items-center space-x-3 text-gray-600">
                                    <Mail size={20} className="text-gray-400" />
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase font-bold">Email</p>
                                        <p className="font-medium">{user.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3 text-gray-600">
                                    <Phone size={20} className="text-gray-400" />
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase font-bold">Phone</p>
                                        <p className="font-medium">{user.phoneNumber || 'Not provided'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-3 text-gray-600">
                                    <Shield size={20} className="text-gray-400" />
                                    <div>
                                        <p className="text-xs text-gray-400 uppercase font-bold">Account Created</p>
                                        <p className="font-medium">{new Date(user.createdAt).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>


                </div>
            </div>
        </DashboardLayout>
    );
};
