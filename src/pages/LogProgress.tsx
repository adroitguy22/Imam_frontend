import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Save,
    Plus,
    X,
    AlertCircle,
    HelpCircle
} from 'lucide-react';
import api from '../lib/api';
import { db } from '../lib/db';
import syncService from '../lib/sync.service';
import { DashboardLayout } from '../components/DashboardLayout';

export const LogProgress = () => {
    const navigate = useNavigate();
    const [students, setStudents] = useState<any[]>([]);
    const [domains, setDomains] = useState<any[]>([]);
    const [terms, setTerms] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form state
    const [formData, setFormData] = useState({
        studentId: '',
        skillDomainId: '',
        termId: '',
        currentLevel: 3,
        qualitativeNotes: '',
        strengths: [] as string[],
        challenges: [] as string[],
        interventions: [] as string[],
        isBaseline: false,
    });

    const [newTag, setNewTag] = useState({
        strength: '',
        challenge: '',
        intervention: '',
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                // If offline, try to load from IndexedDB first
                if (!navigator.onLine) {
                    const localStudents = await db.students.toArray();
                    const localDomains = await db.skillDomains.toArray();
                    const localTerms = await db.terms.toArray();

                    if (localStudents.length > 0 && localDomains.length > 0 && localTerms.length > 0) {
                        setStudents(localStudents);
                        setDomains(localDomains);
                        setTerms(localTerms);
                        setFormData(prev => ({ ...prev, termId: localTerms[0].id }));
                        setIsLoading(false);
                        return; // Successfully loaded from cache
                    }
                }

                const [studentsData, domainsData, termsData] = await Promise.all([
                    api.request('GET', '/api/students/teacher/my-students'),
                    api.getSkillDomains(),
                    api.getTerms(),
                ]);

                setStudents(studentsData);
                setDomains(domainsData);
                setTerms(termsData);

                // Cache for next time
                await Promise.all([
                    db.students.clear(),
                    db.students.bulkAdd(studentsData),
                    db.skillDomains.clear(),
                    db.skillDomains.bulkAdd(domainsData),
                    db.terms.clear(),
                    db.terms.bulkAdd(termsData)
                ]);

                if (termsData.length > 0) {
                    setFormData(prev => ({ ...prev, termId: termsData[0].id }));
                }
            } catch (err) {
                console.error('Failed to fetch form data', err);

                // Fallback to local data on error (likely offline or network issue)
                const [localStudents, localDomains, localTerms] = await Promise.all([
                    db.students.toArray(),
                    db.skillDomains.toArray(),
                    db.terms.toArray()
                ]);

                if (localStudents.length > 0 && localDomains.length > 0 && localTerms.length > 0) {
                    setStudents(localStudents);
                    setDomains(localDomains);
                    setTerms(localTerms);
                    setFormData(prev => ({ ...prev, termId: localTerms[0].id }));
                } else {
                    setError('Failed to load required data and no offline cache available.');
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.studentId || !formData.skillDomainId || !formData.termId) {
            setError('Please fill in all required fields.');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            if (navigator.onLine) {
                await api.createProgressLog(formData);
            } else {
                await syncService.queueAction('CREATE_PROGRESS', formData);
                alert('You are offline. Your assessment has been saved locally and will be synced automatically when you are back online.');
            }
            navigate('/teacher/dashboard');
        } catch (err: any) {
            console.error('Failed to save log', err);
            // Even if it failed but we have internet, maybe it's a server error? 
            // Or maybe the internet is spotty.
            if (!navigator.onLine || err.code === 'ERR_NETWORK') {
                await syncService.queueAction('CREATE_PROGRESS', formData);
                alert('Network error. Your assessment has been saved locally and will be synced later.');
                navigate('/teacher/dashboard');
            } else {
                setError(err.response?.data?.error || 'Failed to save progress log.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const addTag = (type: 'strength' | 'challenge' | 'intervention') => {
        const value = newTag[type].trim();
        if (!value) return;

        const listName = (type + 's') as 'strengths' | 'challenges' | 'interventions';
        if (!formData[listName].includes(value)) {
            setFormData(prev => ({
                ...prev,
                [listName]: [...prev[listName], value]
            }));
        }
        setNewTag(prev => ({ ...prev, [type]: '' }));
    };

    const removeTag = (type: 'strengths' | 'challenges' | 'interventions', index: number) => {
        setFormData(prev => ({
            ...prev,
            [type]: prev[type].filter((_, i) => i !== index)
        }));
    };

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </div>
            </DashboardLayout>
        );
    }

    const selectedDomain = domains.find(d => d.id === formData.skillDomainId);
    const levels = [1, 2, 3, 4, 5];

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto space-y-6">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center space-x-2 text-gray-500 hover:text-gray-900 transition-colors"
                >
                    <ArrowLeft size={20} />
                    <span>Back</span>
                </button>

                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-900">Log Student Progress</h1>
                </div>

                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 flex items-center space-x-3">
                        <AlertCircle className="text-red-500" size={20} />
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="card grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Student *</label>
                            <select
                                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                                value={formData.studentId}
                                onChange={e => setFormData({ ...formData, studentId: e.target.value })}
                                required
                            >
                                <option value="">Select a student</option>
                                {students.map(s => (
                                    <option key={s.id} value={s.id}>{s.user.firstName} {s.user.lastName} ({s.studentId})</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Term *</label>
                            <select
                                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                                value={formData.termId}
                                onChange={e => setFormData({ ...formData, termId: e.target.value })}
                                required
                            >
                                {terms.map(t => (
                                    <option key={t.id} value={t.id}>{t.name} ({t.academicYear})</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Skill Domain *</label>
                            <select
                                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                                value={formData.skillDomainId}
                                onChange={e => setFormData({ ...formData, skillDomainId: e.target.value })}
                                required
                            >
                                <option value="">Select domain</option>
                                {domains.map(d => (
                                    <option key={d.id} value={d.id}>{d.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700 flex items-center justify-between">
                                Current Level *
                                <HelpCircle size={16} className="text-gray-400" />
                            </label>
                            <div className="flex items-center space-x-2">
                                {levels.map(l => (
                                    <button
                                        key={l}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, currentLevel: l })}
                                        className={`flex-1 py-2 rounded-lg font-bold border-2 transition-all ${formData.currentLevel === l
                                            ? 'bg-primary-600 border-primary-600 text-white'
                                            : 'bg-white border-gray-100 text-gray-400 hover:border-primary-200'
                                            }`}
                                    >
                                        {l}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {selectedDomain && (
                        <div className="bg-primary-50 rounded-xl p-4 border border-primary-100 italic text-sm text-primary-800">
                            <p><strong>Assessment Criteria:</strong> {selectedDomain.assessmentCriteria}</p>
                        </div>
                    )}

                    <div className="card space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Qualitative Notes *</label>
                            <textarea
                                rows={4}
                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                                placeholder="Describe your observations in detail..."
                                value={formData.qualitativeNotes}
                                onChange={e => setFormData({ ...formData, qualitativeNotes: e.target.value })}
                                required
                            ></textarea>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Strengths */}
                            <div className="space-y-3">
                                <label className="text-sm font-semibold text-gray-700">Strengths</label>
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="text"
                                        className="flex-1 p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                                        placeholder="Add a strength"
                                        value={newTag.strength}
                                        onChange={e => setNewTag({ ...newTag, strength: e.target.value })}
                                        onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addTag('strength'))}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => addTag('strength')}
                                        className="p-2 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200"
                                    >
                                        <Plus size={20} />
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {formData.strengths.map((s, i) => (
                                        <span key={i} className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full flex items-center space-x-2">
                                            <span>{s}</span>
                                            <X size={14} className="cursor-pointer" onClick={() => removeTag('strengths', i)} />
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Challenges */}
                            <div className="space-y-3">
                                <label className="text-sm font-semibold text-gray-700">Challenges</label>
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="text"
                                        className="flex-1 p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                                        placeholder="Add a challenge"
                                        value={newTag.challenge}
                                        onChange={e => setNewTag({ ...newTag, challenge: e.target.value })}
                                        onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addTag('challenge'))}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => addTag('challenge')}
                                        className="p-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200"
                                    >
                                        <Plus size={20} />
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {formData.challenges.map((c, i) => (
                                        <span key={i} className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded-full flex items-center space-x-2">
                                            <span>{c}</span>
                                            <X size={14} className="cursor-pointer" onClick={() => removeTag('challenges', i)} />
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3 pt-4 border-t border-gray-100">
                            <label className="text-sm font-semibold text-gray-700">Planned Interventions</label>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="text"
                                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                                    placeholder="What steps will be taken to help?"
                                    value={newTag.intervention}
                                    onChange={e => setNewTag({ ...newTag, intervention: e.target.value })}
                                    onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addTag('intervention'))}
                                />
                                <button
                                    type="button"
                                    onClick={() => addTag('intervention')}
                                    className="p-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200"
                                >
                                    <Plus size={20} />
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {formData.interventions.map((inv, i) => (
                                    <span key={i} className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-full flex items-center space-x-2">
                                        <span>{inv}</span>
                                        <X size={14} className="cursor-pointer" onClick={() => removeTag('interventions', i)} />
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-end space-x-4">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="btn bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="btn btn-primary flex items-center space-x-2 min-w-[140px] justify-center"
                        >
                            {isSubmitting ? (
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            ) : (
                                <>
                                    <Save size={20} />
                                    <span>Save Assessment</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
};
