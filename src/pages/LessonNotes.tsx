import { useState } from 'react';
import api from '../lib/api';
import {
    FileText,
    Download,
    Eye,
    Loader2,
    Plus,
    Trash2,
    BookOpen,
    Clock,
    Target,
    Lightbulb
} from 'lucide-react';

interface Objective {
    id: string;
    text: string;
}

interface KeyPoint {
    id: string;
    text: string;
}

export const LessonNotes = () => {
    const [topic, setTopic] = useState('');
    const [subject, setSubject] = useState('');
    const [classLevel, setClassLevel] = useState('');
    const [duration, setDuration] = useState('40 minutes');
    const [objectives, setObjectives] = useState<Objective[]>([]);
    const [keyPoints, setKeyPoints] = useState<KeyPoint[]>([]);
    const [additionalNotes, setAdditionalNotes] = useState('');
    const [newObjective, setNewObjective] = useState('');
    const [newKeyPoint, setNewKeyPoint] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isPreviewing, setIsPreviewing] = useState(false);
    const [previewContent, setPreviewContent] = useState('');
    const [showPreview, setShowPreview] = useState(false);
    const [error, setError] = useState('');

    const addObjective = () => {
        if (newObjective.trim()) {
            setObjectives([...objectives, { id: Date.now().toString(), text: newObjective.trim() }]);
            setNewObjective('');
        }
    };

    const removeObjective = (id: string) => {
        setObjectives(objectives.filter(obj => obj.id !== id));
    };

    const addKeyPoint = () => {
        if (newKeyPoint.trim()) {
            setKeyPoints([...keyPoints, { id: Date.now().toString(), text: newKeyPoint.trim() }]);
            setNewKeyPoint('');
        }
    };

    const removeKeyPoint = (id: string) => {
        setKeyPoints(keyPoints.filter(kp => kp.id !== id));
    };

    const handlePreview = async () => {
        if (!topic || !subject || !classLevel) {
            setError('Please fill in the required fields: Topic, Subject, and Class Level');
            return;
        }

        setIsPreviewing(true);
        setError('');
        setShowPreview(true);

        try {
            const response = await api.previewLessonNotes({
                topic,
                subject,
                classLevel,
                duration,
                objectives: objectives.map(o => o.text),
                keyPoints: keyPoints.map(kp => kp.text),
                additionalNotes: additionalNotes.trim() || undefined
            });
            setPreviewContent(response.content);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to generate preview');
            setShowPreview(false);
        } finally {
            setIsPreviewing(false);
        }
    };

    const handleDownload = async () => {
        if (!topic || !subject || !classLevel) {
            setError('Please fill in the required fields: Topic, Subject, and Class Level');
            return;
        }

        setIsGenerating(true);
        setError('');

        try {
            const pdfBuffer = await api.generateLessonNotes({
                topic,
                subject,
                classLevel,
                duration,
                objectives: objectives.map(o => o.text),
                keyPoints: keyPoints.map(kp => kp.text),
                additionalNotes: additionalNotes.trim() || undefined
            });

            // Create blob and download
            const blob = new Blob([pdfBuffer], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Lesson_Note_${topic.replace(/\s+/g, '_')}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to generate lesson notes');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Lesson Notes Generator</h1>
                <p className="text-gray-600 mt-2">Generate comprehensive lesson notes using AI</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Form Section */}
                <div className="space-y-6">
                    {/* Basic Information */}
                    <div className="card">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <BookOpen size={20} className="text-primary-600" />
                            Basic Information
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Topic <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                    placeholder="e.g., Photosynthesis"
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Subject <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                >
                                    <option value="">Select a subject</option>
                                    <option value="Mathematics">Mathematics</option>
                                    <option value="English">English</option>
                                    <option value="Physics">Physics</option>
                                    <option value="Chemistry">Chemistry</option>
                                    <option value="Biology">Biology</option>
                                    <option value="Economics">Economics</option>
                                    <option value="Geography">Geography</option>
                                    <option value="History">History</option>
                                    <option value="Islamic Studies">Islamic Studies</option>
                                    <option value="Arabic">Arabic</option>
                                    <option value="Computer Science">Computer Science</option>
                                    <option value="Physical Education">Physical Education</option>
                                    <option value="Art">Art</option>
                                    <option value="Music">Music</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Class Level <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={classLevel}
                                    onChange={(e) => setClassLevel(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                >
                                    <option value="">Select class level</option>
                                    <option value="JSS 1">JSS 1</option>
                                    <option value="JSS 2">JSS 2</option>
                                    <option value="JSS 3">JSS 3</option>
                                    <option value="SS 1">SS 1</option>
                                    <option value="SS 2">SS 2</option>
                                    <option value="SS 3">SS 3</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                                    <Clock size={16} />
                                    Duration
                                </label>
                                <select
                                    value={duration}
                                    onChange={(e) => setDuration(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                >
                                    <option value="30 minutes">30 minutes</option>
                                    <option value="40 minutes">40 minutes</option>
                                    <option value="45 minutes">45 minutes</option>
                                    <option value="60 minutes">60 minutes</option>
                                    <option value="90 minutes">90 minutes</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Learning Objectives */}
                    <div className="card">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Target size={20} className="text-primary-600" />
                            Learning Objectives
                        </h2>

                        <div className="space-y-3">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newObjective}
                                    onChange={(e) => setNewObjective(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && addObjective()}
                                    placeholder="Add a learning objective..."
                                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                />
                                <button
                                    onClick={addObjective}
                                    className="p-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                                >
                                    <Plus size={20} />
                                </button>
                            </div>

                            {objectives.length > 0 && (
                                <div className="space-y-2">
                                    {objectives.map((obj) => (
                                        <div
                                            key={obj.id}
                                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                        >
                                            <span className="text-sm text-gray-700">{obj.text}</span>
                                            <button
                                                onClick={() => removeObjective(obj.id)}
                                                className="text-red-500 hover:text-red-700 transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Key Points */}
                    <div className="card">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Lightbulb size={20} className="text-primary-600" />
                            Key Points to Cover
                        </h2>

                        <div className="space-y-3">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newKeyPoint}
                                    onChange={(e) => setNewKeyPoint(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && addKeyPoint()}
                                    placeholder="Add a key point..."
                                    className="flex-1 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                />
                                <button
                                    onClick={addKeyPoint}
                                    className="p-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                                >
                                    <Plus size={20} />
                                </button>
                            </div>

                            {keyPoints.length > 0 && (
                                <div className="space-y-2">
                                    {keyPoints.map((kp) => (
                                        <div
                                            key={kp.id}
                                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                        >
                                            <span className="text-sm text-gray-700">{kp.text}</span>
                                            <button
                                                onClick={() => removeKeyPoint(kp.id)}
                                                className="text-red-500 hover:text-red-700 transition-colors"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Additional Notes */}
                    <div className="card">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4">Additional Notes</h2>
                        <textarea
                            value={additionalNotes}
                            onChange={(e) => setAdditionalNotes(e.target.value)}
                            placeholder="Any additional information or special instructions..."
                            rows={4}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                        />
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
                                    Generating...
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
                                    Generating...
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
                                <p className="text-center">Fill in the form and click "Preview" to see your lesson notes</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
