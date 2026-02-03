import { useState, useEffect } from 'react';
import api from '../lib/api';
import { useAuthStore } from '../stores/authStore';
import {
    BookOpen,
    Plus,
    Calendar,
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Star,
    TrendingUp,
    Users,
    Filter,
    Search,
    Edit,
    Trash2,
    Eye,
    ChevronDown,
    ChevronUp
} from 'lucide-react';

interface Lesson {
    id: string;
    title: string;
    description: string;
    date: string;
    startTime: string;
    endTime: string;
    duration: number;
    status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED' | 'POSTPONED';
    objectives: string;
    materials?: string;
    activities?: string;
    assessment?: string;
    homework?: string;
    effectiveness?: number;
    notes?: string;
    studentEngagement?: 'LOW' | 'MEDIUM' | 'HIGH';
    challenges?: string;
    improvements?: string;
    subject: { name: string; code: string };
    class: { name: string; level: string };
}

interface LessonStats {
    totalLessons: number;
    completedLessons: number;
    scheduledLessons: number;
    avgEffectiveness: number;
    engagement: { LOW: number; MEDIUM: number; HIGH: number };
    completionRate: number;
}

export const Lessons = () => {
    const { user } = useAuthStore();
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [stats, setStats] = useState<LessonStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
    const [filterStatus, setFilterStatus] = useState<string>('ALL');
    const [searchQuery, setSearchQuery] = useState('');

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        subjectId: '',
        classId: '',
        date: '',
        startTime: '',
        endTime: '',
        duration: 40,
        objectives: '',
        materials: '',
        activities: '',
        assessment: '',
        homework: ''
    });

    useEffect(() => {
        fetchLessons();
        fetchStats();
    }, [filterStatus]);

    const fetchLessons = async () => {
        try {
            const params = filterStatus !== 'ALL' ? { status: filterStatus } : {};
            const data = await api.getLessonPlans(params);
            setLessons(data);
        } catch (error) {
            console.error('Failed to fetch lessons:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const data = await api.getLessonPlanStats();
            setStats(data);
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.createLessonPlan(formData);
            setShowCreateModal(false);
            resetForm();
            fetchLessons();
        } catch (error) {
            console.error('Failed to create lesson:', error);
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            description: '',
            subjectId: '',
            classId: '',
            date: '',
            startTime: '',
            endTime: '',
            duration: 40,
            objectives: '',
            materials: '',
            activities: '',
            assessment: '',
            homework: ''
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'COMPLETED': return 'bg-green-100 text-green-700';
            case 'SCHEDULED': return 'bg-blue-100 text-blue-700';
            case 'CANCELLED': return 'bg-red-100 text-red-700';
            case 'POSTPONED': return 'bg-yellow-100 text-yellow-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'COMPLETED': return <CheckCircle2 size={16} />;
            case 'SCHEDULED': return <Calendar size={16} />;
            case 'CANCELLED': return <XCircle size={16} />;
            case 'POSTPONED': return <AlertCircle size={16} />;
            default: return null;
        }
    };

    const filteredLessons = lessons.filter(lesson =>
        lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lesson.subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        lesson.class.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <BookOpen className="text-primary-600" />
                        Lesson Management
                    </h1>
                    <p className="text-gray-600 mt-2">Plan and track your lessons effectively</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="btn btn-primary flex items-center gap-2"
                >
                    <Plus size={20} />
                    New Lesson
                </button>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="card bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-600 text-sm font-medium">Total Lessons</p>
                                <p className="text-3xl font-bold text-blue-900">{stats.totalLessons}</p>
                            </div>
                            <BookOpen size={32} className="text-blue-400" />
                        </div>
                    </div>

                    <div className="card bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-green-600 text-sm font-medium">Completed</p>
                                <p className="text-3xl font-bold text-green-900">{stats.completedLessons}</p>
                            </div>
                            <CheckCircle2 size={32} className="text-green-400" />
                        </div>
                    </div>

                    <div className="card bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-purple-600 text-sm font-medium">Avg Effectiveness</p>
                                <div className="flex items-center gap-1">
                                    <p className="text-3xl font-bold text-purple-900">{stats.avgEffectiveness}</p>
                                    <Star size={20} className="text-yellow-500 fill-yellow-500" />
                                </div>
                            </div>
                            <TrendingUp size={32} className="text-purple-400" />
                        </div>
                    </div>

                    <div className="card bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-orange-600 text-sm font-medium">Completion Rate</p>
                                <p className="text-3xl font-bold text-orange-900">{stats.completionRate}%</p>
                            </div>
                            <Users size={32} className="text-orange-400" />
                        </div>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="card mb-6">
                <div className="flex flex-wrap gap-4 items-center">
                    <div className="flex items-center gap-2">
                        <Filter size={18} className="text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">Filter:</span>
                    </div>

                    <div className="flex gap-2">
                        {['ALL', 'SCHEDULED', 'COMPLETED', 'CANCELLED', 'POSTPONED'].map(status => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                    filterStatus === status
                                        ? 'bg-primary-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                {status.charAt(0) + status.slice(1).toLowerCase()}
                            </button>
                        ))}
                    </div>

                    <div className="flex-1 ml-auto">
                        <div className="relative">
                            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search lessons..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Lessons List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                        <p className="mt-2 text-gray-600">Loading lessons...</p>
                    </div>
                ) : filteredLessons.length === 0 ? (
                    <div className="text-center py-12">
                        <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500">No lessons found. Create your first lesson to get started!</p>
                    </div>
                ) : (
                    filteredLessons.map((lesson) => (
                        <div key={lesson.id} className="card hover:shadow-lg transition-shadow">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-start gap-4">
                                        <div className="flex flex-col items-center gap-2">
                                            <div className={`p-2 rounded-lg ${getStatusColor(lesson.status)}`}>
                                                {getStatusIcon(lesson.status)}
                                            </div>
                                            <span className={`text-xs font-medium px-2 py-1 rounded-full ${getStatusColor(lesson.status)}`}>
                                                {lesson.status}
                                            </span>
                                        </div>

                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold text-gray-900">{lesson.title}</h3>
                                            <p className="text-gray-600 text-sm mt-1">{lesson.description || 'No description'}</p>

                                            <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-600">
                                                <div className="flex items-center gap-1">
                                                    <BookOpen size={16} />
                                                    <span>{lesson.subject.name}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Users size={16} />
                                                    <span>{lesson.class.name}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Calendar size={16} />
                                                    <span>{new Date(lesson.date).toLocaleDateString()}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Clock size={16} />
                                                    <span>{lesson.startTime} - {lesson.endTime}</span>
                                                </div>
                                            </div>

                                            {lesson.status === 'COMPLETED' && lesson.effectiveness && (
                                                <div className="flex items-center gap-1 mt-2">
                                                    <Star size={16} className="text-yellow-500 fill-yellow-500" />
                                                    <span className="text-sm font-medium">Effectiveness: {lesson.effectiveness}/5</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-2 ml-4">
                                    <button
                                        onClick={() => {
                                            setSelectedLesson(lesson);
                                            setShowViewModal(true);
                                        }}
                                        className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                                        title="View details"
                                    >
                                        <Eye size={18} />
                                    </button>
                                    <button
                                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        title="Edit lesson"
                                    >
                                        <Edit size={18} />
                                    </button>
                                    <button
                                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Delete lesson"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Create Lesson Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-xl font-bold text-gray-900">Create New Lesson</h2>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Title <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                        placeholder="Lesson title"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Date <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Start Time <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="time"
                                        required
                                        value={formData.startTime}
                                        onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        End Time <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="time"
                                        required
                                        value={formData.endTime}
                                        onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Duration (minutes)
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.duration}
                                        onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                        min="10"
                                        max="180"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Subject <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        required
                                        value={formData.subjectId}
                                        onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                    >
                                        <option value="">Select subject</option>
                                        <option value="math">Mathematics</option>
                                        <option value="eng">English</option>
                                        <option value="sci">Science</option>
                                        <option value="soc">Social Studies</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Class <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        required
                                        value={formData.classId}
                                        onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                                        className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                    >
                                        <option value="">Select class</option>
                                        <option value="jss1">JSS 1</option>
                                        <option value="jss2">JSS 2</option>
                                        <option value="jss3">JSS 3</option>
                                        <option value="ss1">SS 1</option>
                                        <option value="ss2">SS 2</option>
                                        <option value="ss3">SS 3</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Objectives <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    required
                                    value={formData.objectives}
                                    onChange={(e) => setFormData({ ...formData, objectives: e.target.value })}
                                    rows={3}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                    placeholder="By the end of this lesson, students should be able to..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={2}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                    placeholder="Brief description of the lesson..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Materials</label>
                                <textarea
                                    value={formData.materials}
                                    onChange={(e) => setFormData({ ...formData, materials: e.target.value })}
                                    rows={2}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                    placeholder="Required materials and resources..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Activities</label>
                                <textarea
                                    value={formData.activities}
                                    onChange={(e) => setFormData({ ...formData, activities: e.target.value })}
                                    rows={2}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                    placeholder="Teaching activities and exercises..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Assessment</label>
                                <textarea
                                    value={formData.assessment}
                                    onChange={(e) => setFormData({ ...formData, assessment: e.target.value })}
                                    rows={2}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                    placeholder="How will you assess understanding?"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Homework</label>
                                <textarea
                                    value={formData.homework}
                                    onChange={(e) => setFormData({ ...formData, homework: e.target.value })}
                                    rows={2}
                                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                    placeholder="Homework assignment..."
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowCreateModal(false);
                                        resetForm();
                                    }}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                                >
                                    Create Lesson
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* View Lesson Modal */}
            {showViewModal && selectedLesson && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-200 flex justify-between items-start">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">{selectedLesson.title}</h2>
                                <p className="text-gray-600 mt-1">{selectedLesson.subject.name} • {selectedLesson.class.name}</p>
                            </div>
                            <button
                                onClick={() => setShowViewModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <XCircle size={24} />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center gap-2">
                                    <Calendar size={18} className="text-gray-500" />
                                    <div>
                                        <p className="text-xs text-gray-500">Date</p>
                                        <p className="font-medium">{new Date(selectedLesson.date).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock size={18} className="text-gray-500" />
                                    <div>
                                        <p className="text-xs text-gray-500">Time</p>
                                        <p className="font-medium">{selectedLesson.startTime} - {selectedLesson.endTime}</p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="font-semibold text-gray-900 mb-2">Objectives</h3>
                                <p className="text-gray-700 whitespace-pre-wrap">{selectedLesson.objectives}</p>
                            </div>

                            {selectedLesson.description && (
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                                    <p className="text-gray-700">{selectedLesson.description}</p>
                                </div>
                            )}

                            {selectedLesson.materials && (
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-2">Materials</h3>
                                    <p className="text-gray-700 whitespace-pre-wrap">{selectedLesson.materials}</p>
                                </div>
                            )}

                            {selectedLesson.activities && (
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-2">Activities</h3>
                                    <p className="text-gray-700 whitespace-pre-wrap">{selectedLesson.activities}</p>
                                </div>
                            )}

                            {selectedLesson.assessment && (
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-2">Assessment</h3>
                                    <p className="text-gray-700 whitespace-pre-wrap">{selectedLesson.assessment}</p>
                                </div>
                            )}

                            {selectedLesson.homework && (
                                <div>
                                    <h3 className="font-semibold text-gray-900 mb-2">Homework</h3>
                                    <p className="text-gray-700 whitespace-pre-wrap">{selectedLesson.homework}</p>
                                </div>
                            )}

                            {selectedLesson.status === 'COMPLETED' && (
                                <>
                                    {selectedLesson.effectiveness && (
                                        <div className="bg-blue-50 p-4 rounded-lg">
                                            <h3 className="font-semibold text-blue-900 mb-2">Effectiveness Rating</h3>
                                            <div className="flex items-center gap-1">
                                                {[1, 2, 3, 4, 5].map(star => (
                                                    <Star
                                                        key={star}
                                                        size={20}
                                                        className={star <= selectedLesson.effectiveness! ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {selectedLesson.notes && (
                                        <div>
                                            <h3 className="font-semibold text-gray-900 mb-2">Teacher Notes</h3>
                                            <p className="text-gray-700 whitespace-pre-wrap">{selectedLesson.notes}</p>
                                        </div>
                                    )}

                                    {selectedLesson.studentEngagement && (
                                        <div>
                                            <h3 className="font-semibold text-gray-900 mb-2">Student Engagement</h3>
                                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                                selectedLesson.studentEngagement === 'HIGH' ? 'bg-green-100 text-green-700' :
                                                selectedLesson.studentEngagement === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-red-100 text-red-700'
                                            }`}>
                                                {selectedLesson.studentEngagement}
                                            </span>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
