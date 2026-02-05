import { useState } from 'react';
import { useToast } from '../components/Toast';
import api from '../lib/api';
import {
    FileText,
    Download,
    Eye,
    Loader2,
    Sparkles,
    BookOpen,
    ChevronDown,
    ChevronUp,
    Check,
    X
} from 'lucide-react';
import { DashboardLayout } from '../components/DashboardLayout';

type FormSection = 'basic' | 'objectives' | 'options';

interface LessonFormData {
    topic: string;
    subject: string;
    classLevel: string;
    duration: string;
    learningObjectives: string;
    specialInstructions: string;
    includePractical: boolean;
    includeAssessment: boolean;
}

const subjects = [
    'English Language', 'Mathematics', 'Basic Science', 'Basic Technology',
    'Social Studies', 'Civic Education', 'Physical and Health Education',
    'Business Studies', 'Home Economics', 'Agricultural Science',
    'Computer Studies', 'French', 'Nigerian Languages', 'Christian Religious Studies',
    'Islamic Religious Studies', 'Cultural and Creative Arts', 'Music',
    'Physics', 'Chemistry', 'Biology', 'Economics', 'Geography',
    'Literature in English', 'Government', 'History', 'Further Mathematics'
];

const classLevels = [
    'JSS 1', 'JSS 2', 'JSS 3',
    'SS 1', 'SS 2', 'SS 3',
    'Primary 1', 'Primary 2', 'Primary 3', 'Primary 4', 'Primary 5', 'Primary 6',
    'Nursery 1', 'Nursery 2', 'Kindergarten'
];

const durations = [
    '30 minutes', '40 minutes', '45 minutes', '60 minutes',
    '80 minutes (Double Period)', '90 minutes', '2 hours'
];

export const LessonNotes = () => {
    const { showError, showSuccess } = useToast();
    const [isGenerating, setIsGenerating] = useState(false);
    const [isPreviewing, setIsPreviewing] = useState(false);
    const [previewContent, setPreviewContent] = useState('');
    const [showPreview, setShowPreview] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState<LessonFormData>({
        topic: '',
        subject: '',
        classLevel: '',
        duration: '40 minutes',
        learningObjectives: '',
        specialInstructions: '',
        includePractical: true,
        includeAssessment: true
    });

    const [expandedSections, setExpandedSections] = useState<Record<FormSection, boolean>>({
        basic: true,
        objectives: false,
        options: true
    });

    const toggleSection = (section: FormSection) => {
        setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
    };

    const updateField = <K extends keyof LessonFormData>(field: K, value: LessonFormData[K]) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setError('');
    };

    const isFormValid = () => {
        return formData.topic.trim().length >= 3 &&
               formData.subject &&
               formData.classLevel;
    };

    const buildRequestData = () => {
        const data: any = {
            topic: formData.topic,
            subject: formData.subject,
            classLevel: formData.classLevel,
            duration: formData.duration,
            includePractical: formData.includePractical,
            includeAssessment: formData.includeAssessment
        };

        if (formData.learningObjectives.trim()) {
            data.learningObjectives = formData.learningObjectives.trim();
        }
        if (formData.specialInstructions.trim()) {
            data.specialInstructions = formData.specialInstructions.trim();
        }

        return data;
    };

    const handlePreview = async () => {
        if (!isFormValid()) {
            const errorMsg = 'Please fill in Topic, Subject, and Class Level';
            setError(errorMsg);
            showError(errorMsg);
            return;
        }

        setIsPreviewing(true);
        setError('');
        setShowPreview(true);

        try {
            const data = buildRequestData();
            const response = await api.previewLessonNotes(data);
            setPreviewContent(response.content);
            showSuccess('Preview generated successfully');
        } catch (err: any) {
            const errorMsg = err.response?.data?.error || 'Failed to generate preview';
            setError(errorMsg);
            showError(errorMsg);
            setShowPreview(false);
        } finally {
            setIsPreviewing(false);
        }
    };

    const handleDownload = async () => {
        if (!isFormValid()) {
            const errorMsg = 'Please fill in Topic, Subject, and Class Level';
            setError(errorMsg);
            showError(errorMsg);
            return;
        }

        setIsGenerating(true);
        setError('');

        try {
            const data = buildRequestData();
            const pdfBuffer = await api.generateLessonNotes(data);

            // Create blob and download
            const blob = new Blob([pdfBuffer], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const topicSlug = formData.topic.split(' ').slice(0, 3).join('_').replace(/[^a-zA-Z0-9_]/g, '');
            a.download = `Lesson_Note_${topicSlug}_${Date.now()}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            showSuccess('Lesson notes downloaded successfully');
        } catch (err: any) {
            const errorMsg = err.response?.data?.error || 'Failed to generate lesson notes';
            setError(errorMsg);
            showError(errorMsg);
        } finally {
            setIsGenerating(false);
        }
    };

    const clearForm = () => {
        setFormData({
            topic: '',
            subject: '',
            classLevel: '',
            duration: '40 minutes',
            learningObjectives: '',
            specialInstructions: '',
            includePractical: true,
            includeAssessment: true
        });
        setPreviewContent('');
        setShowPreview(false);
        setError('');
    };

    const SectionHeader = ({ title, section, required = false }: { title: string; section: FormSection; required?: boolean }) => (
        <button
            onClick={() => toggleSection(section)}
            className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
        >
            <span className="font-semibold text-gray-700 flex items-center gap-2">
                {title}
                {required && <span className="text-red-500">*</span>}
            </span>
            {expandedSections[section] ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
    );

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto">
                <div className="mb-6 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                            <BookOpen className="text-primary-600" />
                            Lesson Notes Generator
                        </h1>
                        <p className="text-gray-600 mt-2">Fill in the details below to generate comprehensive lesson notes</p>
                    </div>
                    <button
                        onClick={clearForm}
                        className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-2"
                    >
                        <X size={16} />
                        Clear Form
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Form Section */}
                    <div className="space-y-4">
                        {/* Basic Information */}
                        <div className="card overflow-hidden">
                            <SectionHeader title="Basic Information" section="basic" required />
                            {expandedSections.basic && (
                                <div className="p-4 space-y-4">
                                    {/* Topic */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Topic / Lesson Title <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.topic}
                                            onChange={(e) => updateField('topic', e.target.value)}
                                            placeholder="e.g., Photosynthesis, Quadratic Equations, The Nigerian Civil War"
                                            className="input w-full"
                                        />
                                    </div>

                                    {/* Subject */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Subject <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={formData.subject}
                                            onChange={(e) => updateField('subject', e.target.value)}
                                            className="input w-full"
                                        >
                                            <option value="">Select a subject</option>
                                            {subjects.map(s => (
                                                <option key={s} value={s}>{s}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Class Level */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Class Level <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={formData.classLevel}
                                            onChange={(e) => updateField('classLevel', e.target.value)}
                                            className="input w-full"
                                        >
                                            <option value="">Select class level</option>
                                            {classLevels.map(c => (
                                                <option key={c} value={c}>{c}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Duration */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Duration
                                        </label>
                                        <select
                                            value={formData.duration}
                                            onChange={(e) => updateField('duration', e.target.value)}
                                            className="input w-full"
                                        >
                                            {durations.map(d => (
                                                <option key={d} value={d}>{d}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Learning Objectives */}
                        <div className="card overflow-hidden">
                            <SectionHeader title="Learning Objectives (Optional)" section="objectives" />
                            {expandedSections.objectives && (
                                <div className="p-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Specific Learning Objectives
                                    </label>
                                    <textarea
                                        value={formData.learningObjectives}
                                        onChange={(e) => updateField('learningObjectives', e.target.value)}
                                        placeholder="Enter specific learning objectives you want to cover (one per line or comma-separated)&#10;&#10;Example:&#10;- Define photosynthesis and explain its importance&#10;- Identify the reactants and products&#10;- Describe the role of chlorophyll"
                                        rows={6}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none text-sm"
                                    />
                                    <p className="text-xs text-gray-500 mt-2">
                                        Leave empty for AI to generate appropriate objectives
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Options */}
                        <div className="card overflow-hidden">
                            <SectionHeader title="Additional Options" section="options" />
                            {expandedSections.options && (
                                <div className="p-4 space-y-4">
                                    {/* Toggles */}
                                    <div className="space-y-3">
                                        <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-6 rounded-full transition-colors ${formData.includePractical ? 'bg-primary-600' : 'bg-gray-300'}`}>
                                                    <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${formData.includePractical ? 'translate-x-5' : 'translate-x-0.5'}`} />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-700">Include Practical Activities</p>
                                                    <p className="text-xs text-gray-500">Hands-on exercises and experiments</p>
                                                </div>
                                            </div>
                                            <input
                                                type="checkbox"
                                                checked={formData.includePractical}
                                                onChange={(e) => updateField('includePractical', e.target.checked)}
                                                className="hidden"
                                            />
                                        </label>

                                        <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-6 rounded-full transition-colors ${formData.includeAssessment ? 'bg-primary-600' : 'bg-gray-300'}`}>
                                                    <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${formData.includeAssessment ? 'translate-x-5' : 'translate-x-0.5'}`} />
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-700">Include Assessment Questions</p>
                                                    <p className="text-xs text-gray-500">Questions with expected answers</p>
                                                </div>
                                            </div>
                                            <input
                                                type="checkbox"
                                                checked={formData.includeAssessment}
                                                onChange={(e) => updateField('includeAssessment', e.target.checked)}
                                                className="hidden"
                                            />
                                        </label>
                                    </div>

                                    {/* Special Instructions */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Special Instructions (Optional)
                                        </label>
                                        <textarea
                                            value={formData.specialInstructions}
                                            onChange={(e) => updateField('specialInstructions', e.target.value)}
                                            placeholder="Any additional requirements or special considerations...&#10;&#10;Examples:&#10;- Focus on problem-solving methods&#10;- Include real-life Nigerian examples&#10;- Emphasize Islamic perspectives where applicable"
                                            rows={4}
                                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none text-sm"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                                {error}
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-3">
                            <button
                                onClick={handlePreview}
                                disabled={isPreviewing || isGenerating}
                                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                            >
                                {isPreviewing ? (
                                    <>
                                        <Loader2 size={20} className="animate-spin" />
                                        Generating Preview...
                                    </>
                                ) : (
                                    <>
                                        <Eye size={20} />
                                        Preview
                                    </>
                                )}
                            </button>

                            <button
                                onClick={handleDownload}
                                disabled={isGenerating || isPreviewing}
                                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                            >
                                {isGenerating ? (
                                    <>
                                        <Loader2 size={20} className="animate-spin" />
                                        Generating PDF...
                                    </>
                                ) : (
                                    <>
                                        <Download size={20} />
                                        Download PDF
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Preview Section */}
                    <div className="lg:sticky lg:top-4 lg:self-start">
                        <div className="card bg-white min-h-[600px]">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <FileText size={20} className="text-primary-600" />
                                Preview
                            </h2>

                            {showPreview ? (
                                <div className="prose prose-sm max-w-none">
                                    <div className="whitespace-pre-wrap text-gray-700 leading-relaxed font-mono text-xs">
                                        {previewContent}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-96 text-gray-400">
                                    <FileText size={48} className="mb-4" />
                                    <p className="text-center px-8">Fill in the form and click "Preview" to see the generated lesson notes</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};
