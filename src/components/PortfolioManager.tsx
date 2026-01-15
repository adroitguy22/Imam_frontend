import { useState, useEffect } from 'react';
import {
    Image as ImageIcon,
    FileText,
    Trash2,
    Plus,
    X,
    UploadCloud,
    AlertCircle,
    Loader2,
    Calendar,
    Type
} from 'lucide-react';
import api from '../lib/api';

interface PortfolioItem {
    id: string;
    studentId: string;
    title: string;
    description: string;
    imageUrl: string;
    type: 'PHOTO' | 'NOTE' | 'WORK';
    createdAt: string;
}

interface PortfolioManagerProps {
    studentId: string;
    canUpload?: boolean;
    canDelete?: boolean;
}

export const PortfolioManager = ({ studentId, canUpload = true, canDelete = true }: PortfolioManagerProps) => {
    const [items, setItems] = useState<PortfolioItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);

    // Form state
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState<'PHOTO' | 'NOTE' | 'WORK'>('PHOTO');

    useEffect(() => {
        fetchPortfolio();
    }, [studentId]);

    const fetchPortfolio = async () => {
        setIsLoading(true);
        try {
            const data = await api.getStudentPortfolio(studentId);
            setItems(data);
        } catch (err) {
            console.error('Failed to fetch portfolio', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (type !== 'NOTE' && !selectedFile) return;

        setIsUploading(true);
        setUploadError(null);

        try {
            await api.uploadPortfolioItem(studentId, {
                title,
                description,
                type,
                image: selectedFile || undefined
            });
            setShowUploadModal(false);
            resetForm();
            fetchPortfolio();
        } catch (err: any) {
            setUploadError(err.response?.data?.error || 'Failed to upload portfolio item');
        } finally {
            setIsUploading(false);
        }
    };

    const resetForm = () => {
        setSelectedFile(null);
        setTitle('');
        setDescription('');
        setType('PHOTO');
        setUploadError(null);
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this piece of work?')) return;

        try {
            await api.deletePortfolioItem(id);
            setItems(items.filter(item => item.id !== id));
        } catch (err) {
            console.error('Failed to delete portfolio item', err);
            alert('Failed to delete item');
        }
    };

    const API_URL = import.meta.env.VITE_API_URL || 'https://imam-malik-monitoring.onrender.com';

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-bold text-gray-900">Learning Journey</h3>
                    <p className="text-sm text-gray-500">Visual gallery of student accomplishments and work</p>
                </div>
                {canUpload && (
                    <button
                        onClick={() => setShowUploadModal(true)}
                        className="btn btn-primary flex items-center space-x-2 text-sm shadow-sm"
                    >
                        <Plus size={16} />
                        <span>Add Work</span>
                    </button>
                )}
            </div>

            {isLoading ? (
                <div className="flex justify-center p-12">
                    <Loader2 className="animate-spin text-primary-600" size={40} />
                </div>
            ) : items.length === 0 ? (
                <div className="card text-center p-16 bg-gray-50 border-dashed border-2">
                    <ImageIcon className="mx-auto text-gray-300 mb-4" size={64} />
                    <h4 className="text-lg font-medium text-gray-900">Captured Moments</h4>
                    <p className="text-gray-500 max-w-xs mx-auto mt-2">
                        Start building the student's portfolio by uploading photos of their work or special moments.
                    </p>
                    {canUpload && (
                        <button
                            onClick={() => setShowUploadModal(true)}
                            className="mt-6 text-primary-600 font-bold hover:underline"
                        >
                            Upload the first item
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {items.map((item) => (
                        <div key={item.id} className="group bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                            {item.imageUrl && (
                                <div className="aspect-video w-full overflow-hidden relative">
                                    <img
                                        src={`${API_URL}/${item.imageUrl}`}
                                        alt={item.title}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {canDelete && (
                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                className="p-2 bg-white/90 text-red-600 rounded-full shadow-lg hover:bg-red-50"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                    </div>
                                    <div className="absolute bottom-2 left-2">
                                        <span className="px-2 py-1 bg-black/50 backdrop-blur-md text-white text-[10px] font-bold rounded-lg uppercase tracking-wider">
                                            {item.type}
                                        </span>
                                    </div>
                                </div>
                            )}
                            <div className="p-4">
                                <h4 className="font-bold text-gray-900 group-hover:text-primary-600 transition-colors">
                                    {item.title}
                                </h4>
                                <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                    {item.description}
                                </p>
                                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
                                    <div className="flex items-center text-xs text-gray-400">
                                        <Calendar size={12} className="mr-1" />
                                        {new Date(item.createdAt).toLocaleDateString()}
                                    </div>
                                    {!item.imageUrl && canDelete && (
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="text-red-500 hover:text-red-700 p-1"
                                        >
                                            <Trash2 size={14} />
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
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
                        <div className="p-6 bg-primary-600 flex items-center justify-between text-white">
                            <div>
                                <h2 className="text-xl font-bold">Add to Learning Journey</h2>
                                <p className="text-primary-100 text-xs">Capture a student's progress</p>
                            </div>
                            <button onClick={() => setShowUploadModal(false)} className="p-2 hover:bg-primary-500 rounded-full transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleUpload} className="p-8 space-y-6">
                            {uploadError && (
                                <div className="bg-red-50 text-red-700 p-4 rounded-xl flex items-start space-x-3 text-sm border border-red-100">
                                    <AlertCircle size={20} className="shrink-0" />
                                    <span>{uploadError}</span>
                                </div>
                            )}

                            <div className="grid grid-cols-3 gap-3">
                                {(['PHOTO', 'WORK', 'NOTE'] as const).map((t) => (
                                    <button
                                        key={t}
                                        type="button"
                                        onClick={() => setType(t)}
                                        className={`flex flex-col items-center justify-center p-3 rounded-2xl border-2 transition-all ${type === t
                                            ? 'border-primary-600 bg-primary-50 text-primary-700'
                                            : 'border-gray-100 text-gray-500 hover:border-gray-200'
                                            }`}
                                    >
                                        {t === 'PHOTO' && <ImageIcon size={20} />}
                                        {t === 'WORK' && <FileText size={20} />}
                                        {t === 'NOTE' && <Type size={20} />}
                                        <span className="text-[10px] font-bold mt-1">{t}</span>
                                    </button>
                                ))}
                            </div>

                            {type !== 'NOTE' && (
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Upload File</label>
                                    <div className={`relative border-2 border-dashed rounded-2xl p-6 text-center transition-colors ${selectedFile ? 'border-primary-300 bg-primary-50' : 'border-gray-200 hover:border-primary-300'}`}>
                                        <input
                                            type="file"
                                            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                            accept="image/*"
                                            required
                                        />
                                        <div className="space-y-2">
                                            {selectedFile ? (
                                                <div className="text-primary-700 font-medium">
                                                    {selectedFile.name}
                                                    <p className="text-xs text-primary-500">Click to change</p>
                                                </div>
                                            ) : (
                                                <>
                                                    <UploadCloud className="mx-auto text-gray-400" size={32} />
                                                    <p className="text-sm text-gray-500">Drop an image here or click to browse</p>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Title</label>
                                    <input
                                        type="text"
                                        placeholder="Briefly name this work..."
                                        className="input bg-gray-50 border-gray-100 focus:bg-white"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-1">Description / Observation</label>
                                    <textarea
                                        placeholder="What did the student achieve? Any specific observations?"
                                        className="input bg-gray-50 border-gray-100 focus:bg-white min-h-[100px] resize-none"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="pt-2 flex space-x-4">
                                <button
                                    type="button"
                                    onClick={() => setShowUploadModal(false)}
                                    className="btn btn-secondary flex-1 py-3"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isUploading || (type !== 'NOTE' && !selectedFile)}
                                    className="btn btn-primary flex-1 py-3 flex items-center justify-center space-x-2 shadow-lg shadow-primary-200"
                                >
                                    {isUploading ? (
                                        <>
                                            <Loader2 className="animate-spin" size={18} />
                                            <span>Processing...</span>
                                        </>
                                    ) : (
                                        <span>Post to Journey</span>
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
