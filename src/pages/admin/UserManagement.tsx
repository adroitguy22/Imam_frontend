import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Search,
    UserPlus,
    MoreVertical,
    Shield,
    CheckCircle,
    XCircle,
    Mail
} from 'lucide-react';
import api from '../../lib/api';
import { DashboardLayout } from '../../components/DashboardLayout';

export const UserManagement = () => {
    const navigate = useNavigate();
    const [users, setUsers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('ALL');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const data = await api.getUsers();
            setUsers(data);
        } catch (err) {
            console.error('Failed to fetch users', err);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch =
            user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;

        return matchesSearch && matchesRole;
    });

    const toggleUserStatus = async (user: any) => {
        try {
            await api.updateUser(user.id, { isActive: !user.isActive });
            fetchUsers();
        } catch (err) {
            console.error('Failed to update user status', err);
        }
    };

    const handleCreateUser = async () => {
        try {
            const firstName = prompt('Enter First Name:');
            if (!firstName) return;

            const lastName = prompt('Enter Last Name:');
            if (!lastName) return;

            const email = prompt('Enter Email:');
            if (!email) return;

            const password = prompt('Enter Temporary Password (min 6 chars):', '123456');
            if (!password) return;

            const role = prompt('Enter Role (ADMIN, TEACHER, PARENT, STUDENT):', 'TEACHER');
            if (!role) return;

            const newUser = await api.register({
                firstName,
                lastName,
                email,
                password,
                role: role.toUpperCase()
            });

            if (newUser) {
                alert('User created successfully!');
                fetchUsers();
            }
        } catch (error: any) {
            console.error('Failed to create user', error);
            alert(error.response?.data?.error || 'Failed to create user');
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <button
                    onClick={() => navigate('/admin/dashboard')}
                    className="flex items-center space-x-2 text-gray-500 hover:text-gray-900 transition-colors"
                >
                    <ArrowLeft size={20} />
                    <span>Back to Dashboard</span>
                </button>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                        <p className="text-gray-500">Manage accounts for teachers, parents, and students.</p>
                    </div>
                    <button
                        onClick={handleCreateUser}
                        className="btn btn-primary flex items-center space-x-2"
                    >
                        <UserPlus size={20} />
                        <span>Create New User</span>
                    </button>
                </div>

                {/* Filters & Search */}
                <div className="card flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            className="w-full pl-10 p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={fetchUsers}
                            className="p-2.5 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
                        >
                            <MoreVertical size={20} className="text-gray-400" />
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-6">
                        {['ALL', 'TEACHER', 'PARENT', 'STUDENT'].map((role) => (
                            <button
                                key={role}
                                onClick={() => setRoleFilter(role)}
                                className={`
                                    whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors
                                    ${roleFilter === role
                                        ? 'border-primary-500 text-primary-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                                `}
                            >
                                {role === 'ALL' ? 'All Users' : role.charAt(0) + role.slice(1).toLowerCase() + 's'}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Users Table */}
                <div className="card overflow-hidden p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">User</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Role</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Last Login</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {isLoading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td colSpan={5} className="px-6 py-8">
                                                <div className="h-4 bg-gray-100 rounded w-full"></div>
                                            </td>
                                        </tr>
                                    ))
                                ) : filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 bg-primary-100 text-primary-700 rounded-full flex items-center justify-center font-bold">
                                                    {user.firstName[0]}{user.lastName[0]}
                                                </div>
                                                <div>
                                                    <p
                                                        className={`font-bold text-gray-900 ${user.role === 'STUDENT' ? 'hover:text-primary-600 cursor-pointer underline decoration-primary-200 underline-offset-4' : ''}`}
                                                        onClick={() => user.role === 'STUDENT' && user.student?.id && navigate(`/student/${user.student.id}`)}
                                                    >
                                                        {user.firstName} {user.lastName}
                                                    </p>
                                                    <p className="text-xs text-gray-500 flex items-center space-x-1">
                                                        <Mail size={12} />
                                                        <span>{user.email}</span>
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
                                                user.role === 'TEACHER' ? 'bg-blue-100 text-blue-700' :
                                                    user.role === 'PARENT' ? 'bg-green-100 text-green-700' :
                                                        'bg-orange-100 text-orange-700'
                                                }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-1">
                                                {user.isActive ? (
                                                    <CheckCircle className="text-green-500" size={16} />
                                                ) : (
                                                    <XCircle className="text-red-400" size={16} />
                                                )}
                                                <span className={`text-sm ${user.isActive ? 'text-green-700 font-medium' : 'text-gray-400'}`}>
                                                    {user.isActive ? 'Active' : 'Locked'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">
                                            {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : 'Never'}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end space-x-2">
                                                <button
                                                    onClick={() => toggleUserStatus(user)}
                                                    className="p-1.5 text-gray-400 hover:text-primary-600 transition-colors"
                                                    title={user.isActive ? "Deactivate User" : "Activate User"}
                                                >
                                                    <Shield size={18} />
                                                </button>
                                                <button
                                                    onClick={() => navigate(`/admin/users/${user.id}`)}
                                                    className="p-1.5 text-gray-400 hover:text-gray-900"
                                                >
                                                    <MoreVertical size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {!isLoading && filteredUsers.length === 0 && (
                        <div className="p-12 text-center text-gray-500">
                            <p>No users found matching your criteria.</p>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};
