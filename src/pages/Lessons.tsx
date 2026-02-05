import { useState, useEffect } from 'react';
import api from '../lib/api';
import { useToast } from '../components/Toast';
import { DashboardLayout } from '../components/DashboardLayout';
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
    RefreshCw,
    MessageCircle,
    Send
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

// AI Chatbox Component
const AIChatbox = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([
        { role: 'assistant', content: 'Assalamu alaikum! I am the Imam Malik Academy Assistant. How can I help you today with your teaching?' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { showError } = useToast();

    const sendMessage = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setIsLoading(true);

        try {
            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer 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',
                    'HTTP-Referer': 'https://imam-malik-academy.com',
                    'X-Title': 'Imam Malik Academy'
                },
                body: JSON.stringify({
                    model: 'meta-llama/llama-3.1-70b-instruct',
                    messages: [
                        {
                            role: 'system',
                            content: `You are the Imam Malik Academy Assistant, a helpful AI assistant for teachers at Imam Malik Academy Nigeria. You help with:

1. Lesson planning and teaching strategies
2. Classroom management tips
3. Student engagement ideas
4. Assessment methods
5. Nigerian curriculum guidance (NERDC)
6. Islamic education integration where appropriate

Be friendly, professional, and concise. Provide practical, actionable advice. Keep responses under 150 words when possible.`
                        },
                        ...messages.map(m => ({ role: m.role, content: m.content })),
                        { role: 'user', content: userMessage }
                    ],
                    max_tokens: 500
                })
            });

            const data = await response.json();
            const aiMessage = data.choices?.[0]?.message?.content || 'Sorry, I could not generate a response. Please try again.';

            setMessages(prev => [...prev, { role: 'assistant', content: aiMessage }]);
        } catch (error) {
            console.error('AI Error:', error);
            showError('Failed to get AI response');
            setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <>
            {/* Floating Button */}
            <button
                onClick={() => setIsOpen(true)}
                className={`fixed bottom-6 right-6 z-40 bg-primary-600 text-white p-4 rounded-full shadow-lg hover:bg-primary-700 transition-all ${isOpen ? 'scale-0' : 'scale-100'}`}
            >
                <MessageCircle size={24} />
            </button>

            {/* Chatbox */}
            {isOpen && (
                <div className="fixed bottom-6 right-6 z-40 w-96 h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">
                    {/* Header */}
                    <div className="bg-primary-600 text-white p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                <span className="text-lg">🕌</span>
                            </div>
                            <div>
                                <h3 className="font-semibold">Imam Malik Academy</h3>
                                <p className="text-xs text-white/80">AI Teaching Assistant</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="text-white/80 hover:text-white transition-colors"
                        >
                            <XCircle size={20} />
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                                        msg.role === 'user'
                                            ? 'bg-primary-600 text-white'
                                            : 'bg-white text-gray-800 border border-gray-200'
                                    }`}
                                >
                                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-white border border-gray-200 rounded-2xl px-4 py-2">
                                    <div className="flex gap-1">
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input */}
                    <div className="p-4 bg-white border-t border-gray-200">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Ask about teaching strategies..."
                                className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                                disabled={isLoading}
                            />
                            <button
                                onClick={sendMessage}
                                disabled={!input.trim() || isLoading}
                                className="bg-primary-600 text-white px-4 py-2 rounded-full hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <Send size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export const Lessons = () => {
    const { showError, showSuccess } = useToast();
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
            showError('Unable to load lessons. Please try again.');
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

    const handleEditLesson = (lesson: Lesson) => {
        // Pre-fill the form with lesson data
        setFormData({
            title: lesson.title,
            description: lesson.description || '',
            subjectId: lesson.subject?.code || '',
            classId: lesson.class?.name?.toLowerCase().replace(/\s/g, '') || '',
            date: lesson.date?.split('T')[0] || '',
            startTime: lesson.startTime || '',
            endTime: lesson.endTime || '',
            duration: lesson.duration || 40,
            objectives: lesson.objectives || '',
            materials: lesson.materials || '',
            activities: lesson.activities || '',
            assessment: lesson.assessment || '',
            homework: lesson.homework || ''
        });
        setSelectedLesson(lesson);
        setShowCreateModal(true);
    };

    const handleDeleteLesson = async (lessonId: string) => {
        if (!confirm('Are you sure you want to delete this lesson?')) return;

        try {
            await api.deleteLessonPlan(lessonId);
            showSuccess('Lesson deleted successfully');
            fetchLessons();
            fetchStats();
        } catch (error) {
            console.error('Failed to delete lesson:', error);
            showError('Unable to delete lesson. Please try again.');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (selectedLesson) {
                // Update existing lesson
                await api.updateLessonPlan(selectedLesson.id, formData);
                showSuccess('Lesson updated successfully');
            } else {
                // Create new lesson
                await api.createLessonPlan(formData);
                showSuccess('Lesson created successfully');
            }
            setShowCreateModal(false);
            setSelectedLesson(null);
            resetForm();
            fetchLessons();
            fetchStats();
        } catch (error) {
            console.error('Failed to save lesson:', error);
            showError('Unable to save lesson. Please try again.');
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
        setSelectedLesson(null);
    };

    const handleCloseModal = () => {
        setShowCreateModal(false);
        setSelectedLesson(null);
        resetForm();
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
        (lesson.subject?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (lesson.class?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto">
            {/* AI Chatbox Floating Button */}
            <AIChatbox />

            {/* Header */}
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                        <BookOpen className="text-primary-600" />
                        Lesson Management
                    </h1>
                    <p className="text-gray-600 mt-2">Plan and track your lessons effectively</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => {
                            fetchLessons();
                            fetchStats();
                            showSuccess('Lessons refreshed');
                        }}
                        className="btn bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                        <RefreshCw size={18} />
                        Refresh
                    </button>
                    <button
                        onClick={() => {
                            setSelectedLesson(null);
                            resetForm();
                            setShowCreateModal(true);
                        }}
                        className="btn btn-primary flex items-center gap-2"
                    >
                        <Plus size={20} />
                        New Lesson
                    </button>
                </div>
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
                                                    <span>{lesson.subject?.name || 'N/A'}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Users size={16} />
                                                    <span>{lesson.class?.name || 'N/A'}</span>
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
                                        onClick={() => handleEditLesson(lesson)}
                                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        title="Edit lesson"
                                    >
                                        <Edit size={18} />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteLesson(lesson.id)}
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
                            <h2 className="text-xl font-bold text-gray-900">{selectedLesson ? 'Edit Lesson' : 'Create New Lesson'}</h2>
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
                                    onClick={handleCloseModal}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                                >
                                    {selectedLesson ? 'Update Lesson' : 'Create Lesson'}
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
                                <p className="text-gray-600 mt-1">{selectedLesson.subject?.name || 'N/A'} • {selectedLesson.class?.name || 'N/A'}</p>
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
        </DashboardLayout>
    );
};
