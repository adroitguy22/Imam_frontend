import { useState, useEffect } from 'react';
import {
    FileText,
    Download,
    Plus,
    X,
    ClipboardCheck,
    AlertCircle,
    Loader2,
    Calendar,
    User,
    ChevronRight,
    Send
} from 'lucide-react';
import api from '../lib/api';

interface Report {
    id: string;
    studentId: string;
    termId: string;
    generatedBy: string;
    generatedAt: string;
    reportType: string;
    summary: string;
    pdfUrl: string;
    isPublished: boolean;
    term: {
        name: string;
        academicYear: string;
    };
}

interface ReportManagerProps {
    studentId: string;
    canGenerate?: boolean;
}

export const ReportManager = ({ studentId, canGenerate = false }: ReportManagerProps) => {
    const [reports, setReports] = useState<Report[]>([]);
    const [terms, setTerms] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const [showGenerateModal, setShowGenerateModal] = useState(false);
    const [generateError, setGenerateError] = useState<string | null>(null);

    // Form state
    const [selectedTermId, setSelectedTermId] = useState('');
    const [overallComment, setOverallComment] = useState('');
    const [summary, setSummary] = useState('');
    const [recommendations, setRecommendations] = useState<string[]>(['']);

    useEffect(() => {
        fetchReports();
        if (canGenerate) {
            fetchTerms();
        }
    }, [studentId]);

    const fetchReports = async () => {
        setIsLoading(true);
        try {
            const data = await api.getStudentReports(studentId);
            setReports(data);
        } catch (err) {
            console.error('Failed to fetch reports', err);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchTerms = async () => {
        try {
            const data = await api.getTerms();
            setTerms(data);
            if (data.length > 0) {
                setSelectedTermId(data[0].id);
            }
        } catch (err) {
            console.error('Failed to fetch terms', err);
        }
    };

    const handleGenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsGenerating(true);
        setGenerateError(null);

        try {
            await api.generateReport(studentId, selectedTermId, {
                summary,
                overallComment,
                recommendations: recommendations.filter(r => r.trim() !== ''),
            });
            setShowGenerateModal(false);
            setSummary('');
            setOverallComment('');
            setRecommendations(['']);
            fetchReports();
        } catch (err: any) {
            setGenerateError(err.response?.data?.error || 'Failed to generate report');
        } finally {
            setIsGenerating(false);
        }
    };

    const API_URL = import.meta.env.VITE_API_URL || 'https://imam-malik-monitoring.onrender.com';

    const addRecommendation = () => setRecommendations([...recommendations, '']);
    const updateRecommendation = (index: number, val: string) => {
        const newRecs = [...recommendations];
        newRecs[index] = val;
        setRecommendations(newRecs);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold text-gray-900">Academic Reports</h3>
                    <p className="text-xs text-gray-500">Official term progress reports and declarations.</p>
                </div>
                {canGenerate && (
                    <button
                        onClick={() => setShowGenerateModal(true)}
                        className="btn btn-primary flex items-center space-x-2 text-sm"
                    >
                        <Plus size={16} />
                        <span>Generate New Report</span>
                    </button>
                )}
            </div>

            {isLoading ? (
                <div className="flex justify-center p-8">
                    <Loader2 className="animate-spin text-primary-600" size={32} />
                </div>
            ) : reports.length === 0 ? (
                <div className="card text-center p-12 bg-gray-50 border-dashed border-2">
                    <FileText className="mx-auto text-gray-300 mb-2" size={48} />
                    <p className="text-gray-500">No reports generated for this student yet.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {reports.map((report) => (
                        <div key={report.id} className="card p-0 overflow-hidden hover:shadow-md transition-shadow group">
                            <div className="flex flex-col md:flex-row md:items-center">
                                <div className="p-4 md:p-6 bg-primary-50 flex items-center justify-center md:w-24">
                                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-primary-600">
                                        <ClipboardCheck size={28} />
                                    </div>
                                </div>
                                <div className="p-4 md:p-6 flex-1 border-t md:border-t-0 md:border-l border-gray-100">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="font-bold text-gray-900">{report.term.name} Report</h4>
                                                <span className="text-[10px] font-bold text-primary-700 bg-primary-100 px-2 py-0.5 rounded-full uppercase">
                                                    {report.term.academicYear}
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                                                <span className="flex items-center gap-1">
                                                    <Calendar size={12} />
                                                    Issued: {new Date(report.generatedAt).toLocaleDateString()}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <User size={12} />
                                                    Type: {report.reportType}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <a
                                                href={`${API_URL}/${report.pdfUrl}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="btn btn-primary text-xs flex items-center space-x-2 py-2"
                                            >
                                                <Download size={14} />
                                                <span>Download PDF</span>
                                            </a>
                                            <button className="p-2 text-gray-400 hover:text-gray-600 md:hidden">
                                                <ChevronRight size={20} />
                                            </button>
                                        </div>
                                    </div>
                                    {report.summary && (
                                        <p className="text-sm text-gray-600 mt-3 line-clamp-2 italic">
                                            "{report.summary}"
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Generate Modal */}
            {showGenerateModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Generate Academic Report</h2>
                                <p className="text-xs text-gray-500">Generate a PDF report based on latest progress logs.</p>
                            </div>
                            <button onClick={() => setShowGenerateModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleGenerate} className="p-6 space-y-4 overflow-y-auto flex-1">
                            {generateError && (
                                <div className="bg-red-50 text-red-700 p-3 rounded-lg flex items-start space-x-2 text-sm">
                                    <AlertCircle size={18} className="shrink-0" />
                                    <span>{generateError}</span>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Select Academic Term</label>
                                    <select
                                        className="input text-sm"
                                        value={selectedTermId}
                                        onChange={(e) => setSelectedTermId(e.target.value)}
                                        required
                                    >
                                        {terms.map(term => (
                                            <option key={term.id} value={term.id}>{term.name} ({term.academicYear})</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Executive Summary</label>
                                <textarea
                                    placeholder="Brief overview of student's performance this term..."
                                    className="input text-sm min-h-[80px]"
                                    value={summary}
                                    onChange={(e) => setSummary(e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Overall Teacher Comment</label>
                                <textarea
                                    placeholder="Personal message to parents/guardians..."
                                    className="input text-sm min-h-[80px]"
                                    value={overallComment}
                                    onChange={(e) => setOverallComment(e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1 flex items-center justify-between">
                                    <span>Recommendations</span>
                                    <button
                                        type="button"
                                        onClick={addRecommendation}
                                        className="text-primary-600 text-xs hover:underline flex items-center gap-1"
                                    >
                                        <Plus size={12} /> Add More
                                    </button>
                                </label>
                                <div className="space-y-2">
                                    {recommendations.map((rec, idx) => (
                                        <input
                                            key={idx}
                                            type="text"
                                            placeholder={`Recommendation #${idx + 1}`}
                                            className="input text-sm"
                                            value={rec}
                                            onChange={(e) => updateRecommendation(idx, e.target.value)}
                                        />
                                    ))}
                                </div>
                            </div>
                        </form>

                        <div className="p-6 border-t border-gray-100 flex space-x-3">
                            <button
                                type="button"
                                onClick={() => setShowGenerateModal(false)}
                                className="btn btn-secondary flex-1"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleGenerate}
                                disabled={isGenerating || !selectedTermId}
                                className="btn btn-primary flex-1 flex items-center justify-center space-x-2"
                            >
                                {isGenerating ? (
                                    <>
                                        <Loader2 className="animate-spin" size={18} />
                                        <span>Generating PDF...</span>
                                    </>
                                ) : (
                                    <>
                                        <Send size={18} />
                                        <span>Generate & Publish</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
