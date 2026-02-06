import { useState, useEffect } from 'react';
import {
    Megaphone,
    Plus,
    Trash2,
    Calendar,
    Loader2,
    X,
    AlertTriangle
} from 'lucide-react';
import api from '../../lib/api';
import { DashboardLayout } from '../../components/DashboardLayout';
import { Modal } from '../../components/Modal';
import { useToast } from '../../components/Toast';

export const AnnouncementManagement = () => {
    const { showSuccess, showError } = useToast();
    const [announcements, setAnnouncements] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [announcementToDelete, setAnnouncementToDelete] = useState<any>(null);

    // New Announcement State
    const [newAnn, setNewAnn] = useState({
        title: '',
        content: '',
        priority: 'NORMAL',
        expiresAt: ''
    });

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const fetchAnnouncements = async () => {
        setIsLoading(true);
        try {
            const data = await api.getAnnouncements();
            setAnnouncements(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Failed to fetch announcements', err);
            showError('Failed to fetch announcements');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.createAnnouncement({
                ...newAnn,
                expiresAt: newAnn.expiresAt ? new Date(newAnn.expiresAt) : undefined
            });
            setIsAdding(false);
            setNewAnn({ title: '', content: '', priority: 'NORMAL', expiresAt: '' });
            fetchAnnouncements();
            showSuccess('Announcement posted successfully');
        } catch (err) {
            showError('Failed to create announcement');
        }
    };

    const openDeleteModal = (announcement: any) => {
        setAnnouncementToDelete(announcement);
        setDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setDeleteModalOpen(false);
        setAnnouncementToDelete(null);
    };

    const handleDelete = async () => {
        if (!announcementToDelete) return;

        setDeletingId(announcementToDelete.id);
        closeDeleteModal();

        try {
            await api.deleteAnnouncement(announcementToDelete.id);
            // Remove from local state immediately for better UX
            setAnnouncements(prev => prev.filter(ann => ann.id !== announcementToDelete.id));
            showSuccess('Announcement deleted successfully');
        } catch (err) {
            console.error('Failed to delete announcement:', err);
            showError('Failed to delete announcement. Please try again.');
            // Refetch to restore state if delete failed
            fetchAnnouncements();
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">School Announcements</h1>
                        <p className="text-gray-500">Communicate important updates to all parents.</p>
                    </div>
                    <button
                        onClick={() => setIsAdding(true)}
                        className="btn btn-primary flex items-center gap-2"
                    >
                        <Plus size={20} />
                        <span>Post Announcement</span>
                    </button>
                </div>

                {isAdding && (
                    <div className="card border-2 border-primary-100 animate-in fade-in slide-in-from-top-4">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold">New Announcement</h3>
                            <button onClick={() => setIsAdding(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Title</label>
                                    <input
                                        required
                                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                                        placeholder="e.g. Eid Break Notice"
                                        value={newAnn.title}
                                        onChange={e => setNewAnn({ ...newAnn, title: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Priority</label>
                                    <select
                                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                                        value={newAnn.priority}
                                        onChange={e => setNewAnn({ ...newAnn, priority: e.target.value })}
                                    >
                                        <option value="LOW">Low</option>
                                        <option value="NORMAL">Normal</option>
                                        <option value="HIGH">High</option>
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Message Content</label>
                                <textarea
                                    required
                                    rows={4}
                                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                                    placeholder="Write your announcement details here..."
                                    value={newAnn.content}
                                    onChange={e => setNewAnn({ ...newAnn, content: e.target.value })}
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button type="button" onClick={() => setIsAdding(false)} className="btn bg-gray-100 text-gray-600 border-none">Cancel</button>
                                <button type="submit" className="btn btn-primary">Post Now</button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="grid grid-cols-1 gap-4">
                    {isLoading ? (
                        <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary-600" size={48} /></div>
                    ) : announcements.length > 0 ? (
                        announcements.map(ann => {
                            const isDeleting = deletingId === ann.id;
                            return (
                            <div key={ann.id} className={`card group hover:shadow-lg transition-all border-l-4 overflow-hidden relative ${isDeleting ? 'opacity-50 pointer-events-none' : ''}`} style={{ borderLeftColor: ann.priority === 'HIGH' ? '#ef4444' : ann.priority === 'MEDIUM' ? '#f97316' : '#3b82f6' }}>
                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${ann.priority === 'HIGH' ? 'bg-red-100 text-red-700' :
                                                ann.priority === 'MEDIUM' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                                                }`}>
                                                {ann.priority}
                                            </span>
                                            <span className="text-xs text-gray-400 font-medium flex items-center gap-1">
                                                <Calendar size={12} />
                                                {new Date(ann.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-primary-600 transition-colors uppercase tracking-tight">{ann.title}</h3>
                                        <p className="text-gray-600 mt-2 text-sm leading-relaxed whitespace-pre-wrap">{ann.content}</p>
                                    </div>
                                    <div className="flex md:flex-col gap-2">
                                        <button
                                            onClick={() => openDeleteModal(ann)}
                                            disabled={isDeleting}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                            title="Delete Announcement"
                                        >
                                            {isDeleting ? (
                                                <Loader2 size={20} className="animate-spin text-red-500" />
                                            ) : (
                                                <Trash2 size={20} />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )})
                    ) : (
                        <div className="text-center py-24 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                            <Megaphone className="mx-auto text-gray-300 mb-4" size={64} />
                            <p className="text-xl font-bold text-gray-400 uppercase tracking-widest">No announcements posted yet</p>
                        </div>
                    )}
                </div>

                {/* Delete Confirmation Modal */}
                <Modal
                    isOpen={deleteModalOpen}
                    onClose={closeDeleteModal}
                    title="Delete Announcement"
                    maxWidth="sm"
                >
                    <div className="p-6">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                                <AlertTriangle className="text-red-600" size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">Delete Announcement?</h3>
                                <p className="text-sm text-gray-500 mt-1">This action cannot be undone.</p>
                            </div>
                        </div>

                        {announcementToDelete && (
                            <div className="bg-gray-50 rounded-xl p-4 mb-6">
                                <p className="text-xs font-bold text-gray-400 uppercase mb-1">Announcement to be deleted</p>
                                <p className="font-semibold text-gray-900">{announcementToDelete.title}</p>
                                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{announcementToDelete.content}</p>
                            </div>
                        )}

                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={closeDeleteModal}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium flex items-center gap-2"
                            >
                                <Trash2 size={18} />
                                Delete
                            </button>
                        </div>
                    </div>
                </Modal>
            </div>
        </DashboardLayout>
    );
};
