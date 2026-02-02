import React, { useState, useEffect } from 'react';
import { UserPlus, AlertCircle, ShoppingBag, Shield, Users, GraduationCap } from 'lucide-react';
import { Modal } from './Modal';
import api from '../lib/api';
import { clsx } from 'clsx';

interface CreateUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const ROLES = [
    { id: 'ADMIN', label: 'Administrator', icon: Shield, color: 'purple' },
    { id: 'TEACHER', label: 'Teacher', icon: Users, color: 'blue' },
    { id: 'PARENT', label: 'Parent', icon: ShoppingBag, color: 'green' },
    { id: 'STUDENT', label: 'Student', icon: GraduationCap, color: 'orange' },
];

export const CreateUserModal: React.FC<CreateUserModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        role: 'TEACHER',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            setFormData({
                firstName: '',
                lastName: '',
                email: '',
                password: '',
                role: 'TEACHER',
            });
            setError(null);
        }
    }, [isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            await api.register(formData);
            onSuccess();
            onClose();
        } catch (err: any) {
            console.error('Failed to create user', err);
            setError(err.response?.data?.error || 'Failed to create user. Please check inputs.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Create New User" maxWidth="xl">
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 border border-red-100">
                        <AlertCircle size={20} />
                        <span className="text-sm font-medium">{error}</span>
                    </div>
                )}

                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">User Role</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {ROLES.map((role) => (
                            <button
                                key={role.id}
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, role: role.id }))}
                                className={clsx(
                                    "flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all gap-2",
                                    formData.role === role.id
                                        ? "border-primary-500 bg-primary-50 text-primary-700 shadow-lg shadow-primary-100"
                                        : "border-gray-100 bg-white text-gray-500 hover:border-gray-200"
                                )}
                            >
                                <role.icon size={24} className={clsx(
                                    formData.role === role.id ? "text-primary-600" : "text-gray-400"
                                )} />
                                <span className="text-xs font-bold">{role.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Account Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">First Name</label>
                            <input
                                type="text"
                                name="firstName"
                                required
                                placeholder="E.g. Aisha"
                                value={formData.firstName}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Last Name</label>
                            <input
                                type="text"
                                name="lastName"
                                required
                                placeholder="E.g. Musa"
                                value={formData.lastName}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
                        <input
                            type="email"
                            name="email"
                            required
                            placeholder="user@imammalik.edu.ng"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Temporary Password</label>
                        <input
                            type="text"
                            name="password"
                            required
                            placeholder="Initial password (min 6 chars)"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-3 pt-6 border-t border-gray-100 mt-6">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2.5 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-8 py-2.5 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 shadow-lg shadow-primary-200 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <UserPlus size={20} />
                        )}
                        Create User
                    </button>
                </div>
            </form>
        </Modal>
    );
};
