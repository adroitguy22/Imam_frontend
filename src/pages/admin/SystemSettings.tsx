import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Calendar,
    Target,
    Save,
    Plus,
    Trash2,
    CheckCircle,
    HelpCircle,
    AlertCircle
} from 'lucide-react';
import api from '../../lib/api';
import { DashboardLayout } from '../../components/DashboardLayout';

export const SystemSettings = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'TERMS' | 'DOMAINS'>('TERMS');
    const [terms, setTerms] = useState<any[]>([]);
    const [domains, setDomains] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [termsData, domainsData] = await Promise.all([
                api.getTerms(),
                api.getSkillDomains(),
            ]);
            setTerms(termsData);
            setDomains(domainsData);
        } catch (err) {
            console.error('Failed to fetch settings', err);
        } finally {
            setIsLoading(false);
        }
    };

    const showMessage = (type: 'success' | 'error', text: string) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 3000);
    };

    const handleAddDomain = async () => {
        try {
            const name = prompt('Enter Domain Name (e.g. Cognitive Skills):');
            if (!name) return;

            const category = prompt('Enter Category (ACADEMIC, COGNITIVE, COMMUNICATION, CHARACTER):', 'COGNITIVE');
            if (!category) return;

            const domain = await api.createSkillDomain({
                name,
                category,
                description: `Description for ${name}`,
                assessmentCriteria: 'Criteria for levels 1-5',
                levelDescriptions: '[]'
            });

            setDomains([...domains, domain]);
            showMessage('success', 'Skill domain created successfully!');
        } catch (error: any) {
            showMessage('error', error.response?.data?.error || 'Failed to create domain');
        }
    };

    const handleAddTerm = async () => {
        try {
            const name = prompt('Enter Term Name (e.g. First Term 2025):');
            if (!name) return;

            const academicYear = prompt('Enter Academic Year (e.g. 2024/2025):', '2024/2025');
            if (!academicYear) return;

            const term = await api.createTerm({
                name,
                academicYear,
                startDate: new Date().toISOString().split('T')[0],
                endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                isActive: false
            });

            setTerms([...terms, term]);
            showMessage('success', 'Academic term created successfully!');
        } catch (error: any) {
            showMessage('error', error.response?.data?.error || 'Failed to create term');
        }
    };

    const handleUpdateDomain = async (id: string, domainData: any) => {
        setIsLoading(true);
        try {
            const updated = await api.updateSkillDomain(id, domainData);
            setDomains(domains.map(d => d.id === id ? updated : d));
            showMessage('success', 'Domain updated successfully!');
        } catch (error: any) {
            showMessage('error', error.response?.data?.error || 'Failed to update domain');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteTerm = async (id: string) => {
        if (!confirm('Are you sure you want to delete this term? This action cannot be undone.')) return;
        setIsLoading(true);
        try {
            await api.deleteTerm(id);
            setTerms(terms.filter(t => t.id !== id));
            showMessage('success', 'Term deleted successfully!');
        } catch (error: any) {
            showMessage('error', error.response?.data?.error || 'Failed to delete term');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteDomain = async (id: string) => {
        if (!confirm('Are you sure you want to delete this domain? This will affect all associated progress logs.')) return;
        setIsLoading(true);
        try {
            await api.deleteSkillDomain(id);
            setDomains(domains.filter(d => d.id !== id));
            showMessage('success', 'Domain deleted successfully!');
        } catch (error: any) {
            showMessage('error', error.response?.data?.error || 'Failed to delete domain');
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleTermStatus = async (term: any) => {
        setIsLoading(true);
        try {
            const updated = await api.updateTerm(term.id, { isActive: !term.isActive });
            setTerms(terms.map(t => t.id === term.id ? updated : t));
            showMessage('success', `Term ${updated.isActive ? 'activated' : 'deactivated'} successfully!`);
        } catch (error: any) {
            showMessage('error', error.response?.data?.error || 'Failed to update term status');
        } finally {
            setIsLoading(false);
        }
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

    return (
        <DashboardLayout>
            <div className="max-w-5xl mx-auto space-y-6">
                <button
                    onClick={() => navigate('/admin/dashboard')}
                    className="flex items-center space-x-2 text-gray-500 hover:text-gray-900 transition-colors"
                >
                    <ArrowLeft size={20} />
                    <span>Back to Dashboard</span>
                </button>

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
                        <p className="text-gray-500">Configure academic terms and assessment domains.</p>
                    </div>
                    <button className="btn btn-primary flex items-center space-x-2">
                        <Save size={20} />
                        <span>Save All Changes</span>
                    </button>
                </div>

                {message && (
                    <div className={`p-4 rounded-xl flex items-center space-x-3 border-l-4 ${message.type === 'success' ? 'bg-green-50 border-green-500 text-green-800' : 'bg-red-50 border-red-500 text-red-800'
                        }`}>
                        {message.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                        <span className="text-sm font-medium">{message.text}</span>
                    </div>
                )}

                {/* Tabs */}
                <div className="flex space-x-4 border-b border-gray-100">
                    <button
                        onClick={() => setActiveTab('TERMS')}
                        className={`pb-4 px-2 text-sm font-bold transition-all relative ${activeTab === 'TERMS' ? 'text-primary-600' : 'text-gray-400 hover:text-gray-600'
                            }`}
                    >
                        Academic Terms
                        {activeTab === 'TERMS' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary-600 rounded-t-full"></div>}
                    </button>
                    <button
                        onClick={() => setActiveTab('DOMAINS')}
                        className={`pb-4 px-2 text-sm font-bold transition-all relative ${activeTab === 'DOMAINS' ? 'text-primary-600' : 'text-gray-400 hover:text-gray-600'
                            }`}
                    >
                        Skill Domains
                        {activeTab === 'DOMAINS' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary-600 rounded-t-full"></div>}
                    </button>
                </div>

                {activeTab === 'TERMS' ? (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
                                <Calendar size={20} className="text-blue-500" />
                                <span>Academic Phases</span>
                            </h2>
                            <button
                                onClick={handleAddTerm}
                                className="btn bg-blue-50 text-blue-600 border-none hover:bg-blue-100 flex items-center space-x-2 text-xs"
                            >
                                <Plus size={16} />
                                <span>Add Term</span>
                            </button>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            {terms.map((term) => (
                                <div key={term.id} className="card flex items-center justify-between group">
                                    <div className="flex items-center space-x-4">
                                        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                                            <Calendar size={24} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900">{term.name}</p>
                                            <p className="text-sm text-gray-500">{term.academicYear} • {new Date(term.startDate).toLocaleDateString()} - {new Date(term.endDate).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-3 uppercase tracking-wider">
                                        <button
                                            onClick={() => handleToggleTermStatus(term)}
                                            className={`px-2 py-1 text-[10px] font-bold rounded transition-colors ${term.isActive ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                                                }`}
                                        >
                                            {term.isActive ? 'Current Active' : 'Inactive'}
                                        </button>
                                        <button
                                            onClick={() => handleDeleteTerm(term.id)}
                                            className="p-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h2 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
                                <Target size={20} className="text-green-500" />
                                <span>Assessment Domains</span>
                            </h2>
                            <button
                                onClick={handleAddDomain}
                                className="btn bg-green-50 text-green-600 border-none hover:bg-green-100 flex items-center space-x-2 text-xs"
                            >
                                <Plus size={16} />
                                <span>Add Domain</span>
                            </button>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            {domains.map((domain) => (
                                <div key={domain.id} className="card space-y-4">
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-10 h-10 bg-green-100 text-green-700 rounded-lg flex items-center justify-center font-bold">
                                                {domain.name[0]}
                                            </div>
                                            <h3 className="font-bold text-gray-900 text-lg uppercase tracking-tight">{domain.name}</h3>
                                        </div>
                                        <div className="flex space-x-2">
                                            <button
                                                onClick={() => {
                                                    const criteria = (document.getElementById(`criteria-${domain.id}`) as HTMLTextAreaElement).value;
                                                    const tasks = (document.getElementById(`tasks-${domain.id}`) as HTMLTextAreaElement).value;
                                                    const date = (document.getElementById(`date-${domain.id}`) as HTMLInputElement).value;
                                                    const result = (document.getElementById(`result-${domain.id}`) as HTMLTextAreaElement).value;

                                                    handleUpdateDomain(domain.id, {
                                                        assessmentCriteria: criteria,
                                                        tasks,
                                                        targetDate: date,
                                                        expectedResult: result
                                                    });
                                                }}
                                                className="p-2 text-gray-400 hover:text-blue-600"
                                            >
                                                <Save size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteDomain(domain.id)}
                                                className="p-2 text-gray-400 hover:text-red-500"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-400 uppercase">Assessment Criteria</label>
                                            <textarea
                                                id={`criteria-${domain.id}`}
                                                className="w-full p-3 bg-gray-50 border border-gray-100 rounded-lg text-sm"
                                                rows={3}
                                                defaultValue={domain.assessmentCriteria}
                                            ></textarea>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-400 uppercase">Tasks</label>
                                            <textarea
                                                id={`tasks-${domain.id}`}
                                                className="w-full p-3 bg-gray-50 border border-gray-100 rounded-lg text-sm"
                                                rows={3}
                                                placeholder="List major tasks..."
                                                defaultValue={domain.tasks}
                                            ></textarea>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-400 uppercase">Target Date</label>
                                            <input
                                                id={`date-${domain.id}`}
                                                type="date"
                                                className="w-full p-3 bg-gray-50 border border-gray-100 rounded-lg text-sm"
                                                defaultValue={domain.targetDate ? new Date(domain.targetDate).toISOString().split('T')[0] : ''}
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-400 uppercase">Expected Result</label>
                                            <textarea
                                                id={`result-${domain.id}`}
                                                className="w-full p-3 bg-gray-50 border border-gray-100 rounded-lg text-sm"
                                                rows={3}
                                                placeholder="Outcome expectations..."
                                                defaultValue={domain.expectedResult}
                                            ></textarea>
                                        </div>
                                    </div>
                                    <div className="space-y-1 text-xs text-gray-500 italic p-3 bg-gray-50 rounded-lg">
                                        <p className="flex items-center space-x-1 mb-2 NOT_ITALIC text-gray-700 font-bold">
                                            <HelpCircle size={14} />
                                            <span>Example Expectations</span>
                                        </p>
                                        <p>Used to provide teachers with guidance on what to look for when assessing levels (1-5).</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};
