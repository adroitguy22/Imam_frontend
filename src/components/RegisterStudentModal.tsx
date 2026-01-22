import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import api from '../lib/api';

interface RegisterStudentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    teacherClasses: { id: string; name: string }[];
}

export const RegisterStudentModal: React.FC<RegisterStudentModalProps> = ({ isOpen, onClose, onSuccess, teacherClasses }) => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        studentId: '',
        dateOfBirth: '',
        gender: 'MALE',
        classId: '',
        enrollmentDate: new Date().toISOString().split('T')[0],
        password: '', // Teacher sets initial password
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Reset form when modal opens
    useEffect(() => {
        if (isOpen) {
            setFormData({
                firstName: '',
                lastName: '',
                email: '',
                studentId: '',
                dateOfBirth: '',
                gender: 'MALE',
                classId: teacherClasses.length > 0 ? teacherClasses[0].id : '',
                enrollmentDate: new Date().toISOString().split('T')[0],
                password: 'Student123!', // Default suggestion
            });
            setError(null);
        }
    }, [isOpen, teacherClasses]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.classId) {
            setError('Please select a class.');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await api.createStudent({
                ...formData,
                dateOfBirth: new Date(formData.dateOfBirth).toISOString(),
                enrollmentDate: new Date(formData.enrollmentDate).toISOString(),
            });
            onSuccess();
            onClose();
        } catch (err: any) {
            console.error('Failed to register student', err);
            setError(err.response?.data?.error || 'Failed to register student. Please check inputs.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">Register New Student</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {error && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-lg flex items-center gap-2">
                            <AlertCircle size={20} />
                            <span>{error}</span>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Personal Details */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-gray-900 border-b pb-2">Personal Details</h3>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                                <input
                                    type="text"
                                    name="firstName"
                                    required
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                                <input
                                    type="text"
                                    name="lastName"
                                    required
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                                <input
                                    type="date"
                                    name="dateOfBirth"
                                    required
                                    value={formData.dateOfBirth}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                                <select
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                >
                                    <option value="MALE">Male</option>
                                    <option value="FEMALE">Female</option>
                                </select>
                            </div>
                        </div>

                        {/* Account & Academic Details */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-gray-900 border-b pb-2">Account & Academic</h3>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                <input
                                    type="email"
                                    name="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Student ID</label>
                                <input
                                    type="text"
                                    name="studentId"
                                    required
                                    placeholder="e.g. STU-2024-001"
                                    value={formData.studentId}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
                                <select
                                    name="classId"
                                    required
                                    value={formData.classId}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                >
                                    <option value="">Select Class</option>
                                    {teacherClasses.map((cls) => (
                                        <option key={cls.id} value={cls.id}>
                                            {cls.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Initial Password</label>
                                <input
                                    type="text"
                                    name="password"
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <Save size={20} />
                            )}
                            Register Student
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
