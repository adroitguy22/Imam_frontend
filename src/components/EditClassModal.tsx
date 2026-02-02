import React, { useState, useEffect } from 'react';
import { Save, AlertCircle, Plus, Trash2, User } from 'lucide-react';
import { Modal } from './Modal';
import api from '../lib/api';

interface EditClassModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    classData: any;
}

export const EditClassModal: React.FC<EditClassModalProps> = ({ isOpen, onClose, onSuccess, classData }) => {
    const [formData, setFormData] = useState({
        name: '',
        level: '',
        academicYear: '',
        capacity: 30,
    });
    const [teachers, setTeachers] = useState<any[]>([]);
    const [selectedTeachers, setSelectedTeachers] = useState<{ teacherId: string, role: string }[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && classData) {
            setFormData({
                name: classData.name || '',
                level: classData.level || '',
                academicYear: classData.academicYear || '',
                capacity: classData.capacity || 30,
            });

            if (classData.teachers) {
                setSelectedTeachers(classData.teachers.map((t: any) => ({
                    teacherId: t.teacherId,
                    role: t.role
                })));
            } else {
                setSelectedTeachers([]);
            }

            fetchTeachers();
            setError(null);
        }
    }, [isOpen, classData]);

    const fetchTeachers = async () => {
        try {
            const data = await api.getUsers('TEACHER');
            setTeachers(data);
        } catch (err) {
            console.error('Failed to fetch teachers', err);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'capacity' ? parseInt(value) || 0 : value
        }));
    };

    const handleTeacherChange = (index: number, teacherId: string) => {
        const updated = [...selectedTeachers];
        updated[index].teacherId = teacherId;
        setSelectedTeachers(updated);
    };

    const handleRoleChange = (index: number, role: string) => {
        const updated = [...selectedTeachers];
        updated[index].role = role;
        setSelectedTeachers(updated);
    };

    const addTeacherRow = () => {
        setSelectedTeachers([...selectedTeachers, { teacherId: '', role: '' }]);
    };

    const removeTeacherRow = (index: number) => {
        setSelectedTeachers(selectedTeachers.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const teacherAssignments = selectedTeachers.filter(t => t.teacherId && t.role);

            await api.updateClass(classData.id, {
                ...formData,
                teacherAssignments
            });
            onSuccess();
            onClose();
        } catch (err: any) {
            console.error('Failed to update class', err);
            setError(err.response?.data?.error || 'Failed to update class');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Edit Class" maxWidth="2xl">
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 border border-red-100">
                        <AlertCircle size={20} />
                        <span className="text-sm font-medium">{error}</span>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Class Information</h3>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Class Name</label>
                            <input
                                type="text"
                                name="name"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 transition-all font-medium text-gray-900"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Level</label>
                            <input
                                type="text"
                                name="level"
                                required
                                value={formData.level}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 transition-all font-medium text-gray-900"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Academic Year</label>
                                <input
                                    type="text"
                                    name="academicYear"
                                    required
                                    value={formData.academicYear}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 transition-all font-medium text-gray-900"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Capacity</label>
                                <input
                                    type="number"
                                    name="capacity"
                                    required
                                    min="1"
                                    value={formData.capacity}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 transition-all font-medium text-gray-900"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Teacher Assignments</h3>
                            <button
                                type="button"
                                onClick={addTeacherRow}
                                className="text-primary-600 hover:text-primary-700 text-xs font-bold flex items-center gap-1"
                            >
                                <Plus size={14} />
                                Add More
                            </button>
                        </div>

                        <div className="space-y-3">
                            {selectedTeachers.map((assignment, index) => (
                                <div key={index} className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-2 relative group">
                                    <button
                                        type="button"
                                        onClick={() => removeTeacherRow(index)}
                                        className="absolute -right-2 -top-2 p-1 bg-white shadow-sm border border-gray-100 rounded-full text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                    <div className="flex items-center gap-2 mb-1">
                                        <User size={14} className="text-gray-400" />
                                        <select
                                            value={assignment.role}
                                            onChange={(e) => handleRoleChange(index, e.target.value)}
                                            className="text-xs font-bold bg-transparent border-none focus:ring-0 p-0 text-gray-600 placeholder-gray-400 w-full outline-none"
                                        >
                                            <option value="">Select Role</option>
                                            <option value="Islamiyyah Teacher">Islamiyyah Teacher</option>
                                            <option value="Conventional Teacher">Conventional Teacher</option>
                                        </select>
                                    </div>
                                    <select
                                        value={assignment.teacherId}
                                        onChange={(e) => handleTeacherChange(index, e.target.value)}
                                        className="w-full text-sm px-3 py-1.5 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none font-medium"
                                    >
                                        <option value="">Select Teacher</option>
                                        {teachers.map((t) => (
                                            <option key={t.id} value={t.teacher?.id}>
                                                {t.firstName} {t.lastName}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            ))}
                        </div>
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
                            <Save size={20} />
                        )}
                        Update Class
                    </button>
                </div>
            </form>
        </Modal>
    );
};
