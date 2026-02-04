import { useState } from 'react';
import { useToast } from '../components/Toast';
import api from '../lib/api';
import {
    FileText,
    Download,
    Eye,
    Loader2,
    Sparkles,
    BookOpen
} from 'lucide-react';
import { DashboardLayout } from '../components/DashboardLayout';

export const LessonNotes = () => {
    const { showError, showSuccess } = useToast();
    const [prompt, setPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isPreviewing, setIsPreviewing] = useState(false);
    const [previewContent, setPreviewContent] = useState('');
    const [showPreview, setShowPreview] = useState(false);
    const [error, setError] = useState('');

    const handlePreview = async () => {
        if (!prompt.trim() || prompt.trim().length < 10) {
            const errorMsg = 'Please enter a detailed prompt (at least 10 characters)';
            setError(errorMsg);
            showError(errorMsg);
            return;
        }

        setIsPreviewing(true);
        setError('');
        setShowPreview(true);

        try {
            const response = await api.previewLessonNotes({ prompt: prompt.trim() });
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
        if (!prompt.trim() || prompt.trim().length < 10) {
            const errorMsg = 'Please enter a detailed prompt (at least 10 characters)';
            setError(errorMsg);
            showError(errorMsg);
            return;
        }

        setIsGenerating(true);
        setError('');

        try {
            const pdfBuffer = await api.generateLessonNotes({ prompt: prompt.trim() });

            // Create blob and download
            const blob = new Blob([pdfBuffer], { type: 'application/pdf' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Lesson_Note_${Date.now()}.pdf`;
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

    const examplePrompts = [
        "Create a lesson note on Photosynthesis for JSS 2 Basic Science class, 40 minutes duration. Include practical activities and assessment questions.",
        "Generate lesson notes on Quadratic Equations for SS 2 Mathematics, focusing on solving methods and real-life applications.",
        "Lesson note on The Nigerian Civil War for SS 3 History, covering causes, major events, and consequences."
    ];

    const useExample = (example: string) => {
        setPrompt(example);
        setError('');
    };

    return (
        <DashboardLayout>
            <div className="max-w-7xl mx-auto">
                <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                    <BookOpen className="text-primary-600" />
                    Lesson Notes Generator
                </h1>
                <p className="text-gray-600 mt-2">Generate comprehensive lesson notes using AI - simply describe what you need</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Input Section */}
                <div className="space-y-6">
                    {/* Main Prompt Input */}
                    <div className="card">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <Sparkles size={20} className="text-primary-600" />
                            Describe Your Lesson
                        </h2>

                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Describe the lesson you want to create notes for...

Example: Create a lesson note on Photosynthesis for JSS 2 Basic Science class, 40 minutes duration. Include practical activities where students observe plants, and end with a quiz to check understanding."
                            rows={10}
                            className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none text-sm"
                        />

                        {/* Example Prompts */}
                        <div className="mt-4">
                            <p className="text-sm font-medium text-gray-700 mb-2">Quick examples:</p>
                            <div className="space-y-2">
                                {examplePrompts.map((example, index) => (
                                    <button
                                        key={index}
                                        onClick={() => useExample(example)}
                                        className="w-full text-left p-3 text-sm bg-gray-50 hover:bg-primary-50 border border-gray-200 hover:border-primary-300 rounded-lg transition-colors truncate"
                                        title={example}
                                    >
                                        {example}
                                    </button>
                                ))}
                            </div>
                        </div>
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

                    {/* Tips */}
                    <div className="card bg-blue-50 border-blue-200">
                        <h3 className="font-semibold text-blue-900 mb-2">Tips for best results:</h3>
                        <ul className="text-sm text-blue-800 space-y-1">
                            <li>• Include the topic/subject clearly</li>
                            <li>• Specify the class level (JSS 1-3, SS 1-3)</li>
                            <li>• Mention duration if important</li>
                            <li>• Add any specific requirements (activities, assessment style, etc.)</li>
                        </ul>
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
                                <p className="text-center">Enter your lesson description and click "Preview" to see the generated lesson notes</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            </div>
            </DashboardLayout>
    );
};
