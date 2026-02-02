import { useState, useEffect } from 'react';
import {
    Wallet,
    Plus,
    Trash2,
    Calendar,
    Loader2,
    X,
    CheckCircle,
    User,
    Search
} from 'lucide-react';
import api from '../../lib/api';
import { DashboardLayout } from '../../components/DashboardLayout';

export const FeeManagement = () => {
    const [students, setStudents] = useState<any[]>([]);
    const [selectedStudent, setSelectedStudent] = useState<any>(null);
    const [fees, setFees] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // New Fee State
    const [newFee, setNewFee] = useState({
        title: '',
        amount: '',
        dueDate: '',
        category: 'Tuition'
    });

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        setIsLoading(true);
        try {
            const data = await api.getStudents();
            setStudents(data);
        } catch (err) {
            console.error('Failed to fetch students', err);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchFees = async (studentId: string) => {
        try {
            const data = await api.getFees({ studentId });
            setFees(data);
        } catch (err) {
            console.error('Failed to fetch fees', err);
        }
    };

    const handleSelectStudent = (student: any) => {
        setSelectedStudent(student);
        fetchFees(student.id);
    };

    const handleCreateFee = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedStudent) return;
        try {
            await api.createFee({
                ...newFee,
                amount: parseFloat(newFee.amount),
                studentId: selectedStudent.id,
                dueDate: new Date(newFee.dueDate)
            });
            setIsAdding(false);
            setNewFee({ title: '', amount: '', dueDate: '', category: 'Tuition' });
            fetchFees(selectedStudent.id);
        } catch (err) {
            alert('Failed to create fee');
        }
    };

    const handleToggleStatus = async (fee: any) => {
        const newStatus = fee.status === 'PAID' ? 'PENDING' : 'PAID';
        try {
            await api.updateFee(fee.id, {
                status: newStatus,
                paidAt: newStatus === 'PAID' ? new Date() : null
            });
            fetchFees(selectedStudent.id);
        } catch (err) {
            alert('Failed to update status');
        }
    };

    const handleDeleteFee = async (id: string) => {
        if (!confirm('Are you sure you want to delete this fee record?')) return;
        try {
            await api.deleteFee(id);
            fetchFees(selectedStudent.id);
        } catch (err) {
            alert('Failed to delete fee');
        }
    };

    const filteredStudents = students.filter(s =>
        `${s.user.firstName} ${s.user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.studentId.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <DashboardLayout>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Student List */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="card">
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                            <User className="text-primary-600" size={20} />
                            Students
                        </h2>
                        <div className="relative mb-4">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-primary-500"
                                placeholder="Search by name or ID..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                            {isLoading ? (
                                <div className="flex justify-center py-10"><Loader2 className="animate-spin text-primary-600" /></div>
                            ) : filteredStudents.map(student => (
                                <button
                                    key={student.id}
                                    onClick={() => handleSelectStudent(student)}
                                    className={`w-full text-left p-3 rounded-xl transition-all border-l-4 ${selectedStudent?.id === student.id
                                            ? 'bg-primary-50 border-l-primary-600 shadow-sm'
                                            : 'hover:bg-gray-50 border-l-transparent'
                                        }`}
                                >
                                    <p className="font-bold text-gray-900">{student.user.firstName} {student.user.lastName}</p>
                                    <p className="text-xs text-gray-500">{student.studentId} • {student.class?.name}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right: Fee details */}
                <div className="lg:col-span-2 space-y-6">
                    {!selectedStudent ? (
                        <div className="card h-full flex flex-col items-center justify-center py-24 text-center">
                            <Wallet className="text-gray-200 mb-4" size={64} />
                            <p className="text-gray-500 font-medium">Select a student from the list to manage fees.</p>
                        </div>
                    ) : (
                        <>
                            <div className="card bg-primary-600 text-white border-none shadow-xl">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-primary-100 text-xs font-bold uppercase tracking-widest">Financial Records for</p>
                                        <h2 className="text-2xl font-black mt-1 uppercase tracking-tight">{selectedStudent.user.firstName} {selectedStudent.user.lastName}</h2>
                                        <p className="text-primary-100 mt-1">{selectedStudent.studentId} • {selectedStudent.class?.name}</p>
                                    </div>
                                    <button
                                        onClick={() => setIsAdding(true)}
                                        className="bg-white text-primary-600 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-primary-50 transition-colors"
                                    >
                                        <Plus size={18} />
                                        Assign Fee
                                    </button>
                                </div>
                            </div>

                            {isAdding && (
                                <div className="card animate-in fade-in slide-in-from-top-4 border-2 border-primary-100">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-bold">New Fee Entry</h3>
                                        <button onClick={() => setIsAdding(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
                                    </div>
                                    <form onSubmit={handleCreateFee} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="md:col-span-2 space-y-1">
                                            <label className="text-xs font-bold text-gray-500 uppercase">Description / Title</label>
                                            <input required className="input-field" placeholder="e.g. Second Term Tuition" value={newFee.title} onChange={e => setNewFee({ ...newFee, title: e.target.value })} />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-500 uppercase">Amount (₦)</label>
                                            <input required type="number" className="input-field" placeholder="0.00" value={newFee.amount} onChange={e => setNewFee({ ...newFee, amount: e.target.value })} />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-500 uppercase">Due Date</label>
                                            <input required type="date" className="input-field" value={newFee.dueDate} onChange={e => setNewFee({ ...newFee, dueDate: e.target.value })} />
                                        </div>
                                        <div className="md:col-span-2 flex justify-end gap-3 mt-4">
                                            <button type="button" onClick={() => setIsAdding(false)} className="btn bg-gray-100 text-gray-600 border-none">Cancel</button>
                                            <button type="submit" className="btn btn-primary px-8">Save Record</button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            <div className="card">
                                <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                                    <Calendar className="text-primary-600" size={20} />
                                    Fee History
                                </h3>
                                <div className="space-y-4">
                                    {fees.length > 0 ? fees.map(fee => (
                                        <div key={fee.id} className="p-4 bg-gray-50 rounded-2xl flex items-center justify-between group">
                                            <div className="flex items-center gap-4">
                                                <div className={`p-3 rounded-xl ${fee.status === 'PAID' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                                    <Wallet size={20} />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900">{fee.title}</p>
                                                    <p className="text-xs text-gray-500">Due: {new Date(fee.dueDate).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-6">
                                                <div className="text-right">
                                                    <p className="font-black text-gray-900">₦{fee.amount.toLocaleString()}</p>
                                                    <button
                                                        onClick={() => handleToggleStatus(fee)}
                                                        className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1 hover:underline ${fee.status === 'PAID' ? 'text-green-600' : 'text-red-600'}`}
                                                    >
                                                        {fee.status === 'PAID' ? <CheckCircle size={10} /> : <X size={10} />}
                                                        {fee.status}
                                                    </button>
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteFee(fee.id)}
                                                    className="p-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="text-center py-12 text-gray-400">
                                            <p>No fee records for this student.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};
