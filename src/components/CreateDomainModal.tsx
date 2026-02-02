import React, { useState, useEffect } from 'react';
import { Target, AlertCircle } from 'lucide-react';
import { Modal } from './Modal';
import api from '../lib/api';
import { clsx } from 'clsx';

interface CreateDomainModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (domain: any) => void;
}

const CATEGORIES = [
    { id: 'ACADEMIC', label: 'Academic' },
    { id: 'COGNITIVE', label: 'Cognitive' },
    { id: 'COMMUNICATION', label: 'Communication' },
    { id: 'CHARACTER', label: 'Character' },
];

export const CreateDomainModal: React.FC<CreateDomainModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        name: '',
        category: 'COGNITIVE',
        description: '',
        assessmentCriteria: 'Criteria for levels 1-5',
        levelDescriptions: '[]'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            setFormData({
                name: '',
                category: 'COGNITIVE',
                description: '',
                assessmentCriteria: 'Criteria for levels 1-5',
                levelDescriptions: '[]'
            });
            setError(null);
        }
    }, [isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const domain = await api.createSkillDomain({
                ...formData,
                description: formData.description || `Description for ${formData.name}`
            });
            onSuccess(domain);
            onClose();
        } catch (err: any) {
            console.error('Failed to create domain', err);
            setError(err.response?.data?.error || 'Failed to create domain. Please check inputs.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Add Skill Domain" maxWidth="lg">
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 border border-red-100">
                        <AlertCircle size={20} />
                        <span className="text-sm font-medium">{error}</span>
                    </div>
                )}

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Domain Name</label>
                        <input
                            type="text"
                            name="name"
                            required
                            placeholder="e.g. Reading Fluency"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
                        <div className="grid grid-cols-2 gap-2">
                            {CATEGORIES.map((cat) => (
                                <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, category: cat.id }))}
                                    className={clsx(
                                        "px-3 py-2 rounded-xl border-2 text-xs font-bold transition-all",
                                        formData.category === cat.id
                                            ? "border-primary-500 bg-primary-50 text-primary-700"
                                            : "border-gray-100 text-gray-400 hover:border-gray-200"
                                    )}
                                >
                                    {cat.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">Description (Optional)</label>
                        <textarea
                            name="description"
                            rows={3}
                            placeholder="Briefly describe what this domain assesses..."
                            value={formData.description}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 transition-all text-sm"
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
                            <Target size={20} />
                        )}
                        Create Domain
                    </button>
                </div>
            </form>
        </Modal>
    );
};
