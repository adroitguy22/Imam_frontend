import { useState, useEffect } from 'react';
import {
    File,
    FileText,
    Image as ImageIcon,
    Trash2,
    Download,
    Plus,
    X,
    UploadCloud,
    AlertCircle,
    Loader2
} from 'lucide-react';
import api from '../lib/api';

interface Document {
    id: string;
    studentId: string;
    name: string;
    fileUrl: string;
    fileType: string;
    fileSize: number;
    category: string;
    createdAt: string;
}

interface DocumentManagerProps {
    studentId: string;
    canUpload?: boolean;
    canDelete?: boolean;
}

export const DocumentManager = ({ studentId, canUpload = true, canDelete = true }: DocumentManagerProps) => {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);

    // Form state
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [category, setCategory] = useState('ADMISSION');
    const [customName, setCustomName] = useState('');

    useEffect(() => {
        fetchDocuments();
    }, [studentId]);

    const fetchDocuments = async () => {
        setIsLoading(true);
        try {
            const data = await api.getStudentDocuments(studentId);
            setDocuments(data);
        } catch (err) {
            console.error('Failed to fetch documents', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFile) return;

        setIsUploading(true);
        setUploadError(null);

        try {
            await api.uploadStudentDocument(studentId, selectedFile, category, customName);
            setShowUploadModal(false);
            setSelectedFile(null);
            setCustomName('');
            fetchDocuments();
        } catch (err: any) {
            setUploadError(err.response?.data?.error || 'Failed to upload document');
        } finally {
            setIsUploading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this document?')) return;

        try {
            await api.deleteDocument(id);
            setDocuments(documents.filter(doc => doc.id !== id));
        } catch (err) {
            console.error('Failed to delete document', err);
            alert('Failed to delete document');
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const getFileIcon = (type: string) => {
        switch (type.toUpperCase()) {
            case 'PDF': return <FileText className="text-red-500" size={24} />;
            case 'JPG':
            case 'JPEG':
            case 'PNG': return <ImageIcon className="text-blue-500" size={24} />;
            default: return <File className="text-gray-500" size={24} />;
        }
    };

    const API_URL = import.meta.env.VITE_API_URL || 'https://imam-malik-monitoring.onrender.com';

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">Student Documents</h3>
                {canUpload && (
                    <button
                        onClick={() => setShowUploadModal(true)}
                        className="btn btn-primary flex items-center space-x-2 text-sm"
                    >
                        <Plus size={16} />
                        <span>Upload Document</span>
                    </button>
                )}
            </div>

            {isLoading ? (
                <div className="flex justify-center p-8">
                    <Loader2 className="animate-spin text-primary-600" size={32} />
                </div>
            ) : documents.length === 0 ? (
                <div className="card text-center p-12 bg-gray-50 border-dashed border-2">
                    <UploadCloud className="mx-auto text-gray-300 mb-2" size={48} />
                    <p className="text-gray-500">No documents uploaded yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {documents.map((doc) => (
                        <div key={doc.id} className="card p-4 flex items-start space-x-4 hover:shadow-md transition-shadow">
                            <div className="p-2 bg-gray-50 rounded-lg">
                                {getFileIcon(doc.fileType)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-gray-900 truncate" title={doc.name}>
                                    {doc.name}
                                </p>
                                <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                                    <span className="bg-gray-100 px-1.5 py-0.5 rounded uppercase">{doc.category}</span>
                                    <span>•</span>
                                    <span>{formatFileSize(doc.fileSize)}</span>
                                </div>
                                <div className="flex items-center space-x-3 mt-3">
                                    <a
                                        href={`${API_URL}/${doc.fileUrl}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-xs font-medium text-primary-600 hover:text-primary-700 flex items-center space-x-1"
                                    >
                                        <Download size={14} />
                                        <span>Download</span>
                                    </a>
                                    {canDelete && (
                                        <button
                                            onClick={() => handleDelete(doc.id)}
                                            className="text-xs font-medium text-red-600 hover:text-red-700 flex items-center space-x-1"
                                        >
                                            <Trash2 size={14} />
                                            <span>Delete</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Upload Modal */}
            {showUploadModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-900">Upload Document</h2>
                            <button onClick={() => setShowUploadModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleUpload} className="p-6 space-y-4">
                            {uploadError && (
                                <div className="bg-red-50 text-red-700 p-3 rounded-lg flex items-start space-x-2 text-sm">
                                    <AlertCircle size={18} className="shrink-0" />
                                    <span>{uploadError}</span>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Select File</label>
                                <input
                                    type="file"
                                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 cursor-pointer"
                                    required
                                />
                                <p className="text-[10px] text-gray-500 mt-1">Supported: PDF, JPEG, PNG, DOCX (Max 10MB)</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Display Name (Optional)</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Birth Certificate"
                                    className="input text-sm"
                                    value={customName}
                                    onChange={(e) => setCustomName(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                <select
                                    className="input text-sm"
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    required
                                >
                                    <option value="ADMISSION">Admission Form</option>
                                    <option value="BIRTH_CERTIFICATE">Birth Certificate</option>
                                    <option value="MEDICAL">Medical Record</option>
                                    <option value="ACADEMIC">Previous Academic Result</option>
                                    <option value="OTHER">Other</option>
                                </select>
                            </div>

                            <div className="pt-4 flex space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setShowUploadModal(false)}
                                    className="btn btn-secondary flex-1"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isUploading || !selectedFile}
                                    className="btn btn-primary flex-1 flex items-center justify-center space-x-2"
                                >
                                    {isUploading ? (
                                        <>
                                            <Loader2 className="animate-spin" size={18} />
                                            <span>Uploading...</span>
                                        </>
                                    ) : (
                                        <span>Upload</span>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
