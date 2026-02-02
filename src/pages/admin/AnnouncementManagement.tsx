import { useState, useEffect } from 'react';
import {
    Megaphone,
    Plus,
    Trash2,
    Calendar,
    Loader2,
    X
} from 'lucide-react';
import api from '../../lib/api';
import { DashboardLayout } from '../../components/DashboardLayout';

export const AnnouncementManagement = () => {
    const [announcements, setAnnouncements] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);

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
            setAnnouncements(data);
        } catch (err) {
            console.error('Failed to fetch announcements', err);
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
        } catch (err) {
            alert('Failed to create announcement');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this announcement?')) return;
        try {
            await api.deleteAnnouncement(id);
            fetchAnnouncements();
        } catch (err) {
            alert('Failed to delete announcement');
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
                        announcements.map(ann => (
                            <div key={ann.id} className="card group hover:shadow-lg transition-all border-l-4 overflow-hidden relative" style={{ borderLeftColor: ann.priority === 'HIGH' ? '#ef4444' : ann.priority === 'MEDIUM' ? '#f97316' : '#3b82f6' }}>
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
                                            onClick={() => handleDelete(ann.id)}
                                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                            title="Delete Announcement"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-24 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                            <Megaphone className="mx-auto text-gray-300 mb-4" size={64} />
                            <p className="text-xl font-bold text-gray-400 uppercase tracking-widest">No announcements posted yet</p>
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};
