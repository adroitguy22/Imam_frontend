import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Plus,
    BookOpen,
    Users as UsersIcon,
    Calendar,
    Layers,
    Search,
    MoreVertical,
    ExternalLink,
    Edit,
    Trash
} from 'lucide-react';
import api from '../../lib/api';
import { DashboardLayout } from '../../components/DashboardLayout';
import { CreateClassModal } from '../../components/CreateClassModal';
import { EditClassModal } from '../../components/EditClassModal';

export const ClassManagement = () => {
    const navigate = useNavigate();
    const [classes, setClasses] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedClass, setSelectedClass] = useState<any>(null);

    useEffect(() => {
        fetchClasses();
    }, []);

    const fetchClasses = async () => {
        setIsLoading(true);
        try {
            const data = await api.getClasses();
            setClasses(data);
        } catch (err) {
            console.error('Failed to fetch classes', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateClass = () => {
        setIsCreateModalOpen(true);
    };

    const handleEditClass = (cls: any) => {
        setSelectedClass(cls);
        setIsEditModalOpen(true);
    };

    const handleDeleteClass = async (id: string) => {
        if (confirm('Are you sure you want to delete this class? This cannot be undone.')) {
            try {
                await api.deleteClass(id);
                fetchClasses();
            } catch (err) {
                console.error('Failed to delete class', err);
            }
        }
    };

    const filteredClasses = classes.filter(cls =>
        cls.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cls.level.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (cls.teachers && cls.teachers.some((t: any) =>
            t.teacher?.user && `${t.teacher.user.firstName} ${t.teacher.user.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()))
        )
    );

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <button
                    onClick={() => navigate('/admin/dashboard')}
                    className="flex items-center space-x-2 text-gray-500 hover:text-gray-900 transition-colors"
                >
                    <ArrowLeft size={20} />
                    <span>Back to Dashboard</span>
                </button>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Class Management</h1>
                        <p className="text-gray-500">Organize students and assign teachers to classes.</p>
                    </div>
                    <button
                        onClick={handleCreateClass}
                        className="btn btn-primary flex items-center space-x-2"
                    >
                        <Plus size={20} />
                        <span>Create New Class</span>
                    </button>
                </div>

                {/* Filters */}
                <div className="card">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by class name, level or teacher..."
                            className="w-full pl-10 p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Classes Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {isLoading ? (
                        Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="card animate-pulse h-48 bg-gray-50 border-none"></div>
                        ))
                    ) : filteredClasses.map((cls) => (
                        <div key={cls.id} className="card hover:shadow-md transition-all group border-t-4 border-t-primary-500">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-primary-600 transition-colors">{cls.name}</h3>
                                    <p className="text-sm text-gray-500 flex items-center space-x-1 mt-1">
                                        <Layers size={14} />
                                        <span>Level: {cls.level}</span>
                                    </p>
                                </div>
                                <div className="relative group/menu">
                                    <button
                                        onClick={(e) => e.stopPropagation()}
                                        className="p-1 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all"
                                    >
                                        <MoreVertical size={20} />
                                    </button>

                                    <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-1 z-10 hidden group-hover/menu:block">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleEditClass(cls);
                                            }}
                                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                                        >
                                            <Edit size={16} className="text-blue-500" />
                                            <span>Edit Class</span>
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteClass(cls.id);
                                            }}
                                            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2 border-t border-gray-50"
                                        >
                                            <Trash size={16} />
                                            <span>Delete Class</span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="space-y-2 py-2 px-3 bg-gray-50 rounded-lg">
                                    <div className="flex items-center space-x-2 text-xs font-semibold text-gray-500 mb-1">
                                        <BookOpen size={14} className="text-primary-500" />
                                        <span>Teachers:</span>
                                    </div>
                                    {cls.teachers && cls.teachers.length > 0 ? (
                                        cls.teachers.map((t: any) => (
                                            <div key={t.id} className="flex justify-between items-center text-sm">
                                                <span className="text-gray-600 italic text-xs">{t.role}:</span>
                                                <span className="font-bold text-gray-900">
                                                    {t.teacher?.user?.firstName} {t.teacher?.user?.lastName}
                                                </span>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-sm font-medium text-gray-400 italic text-center py-1">Unassigned</div>
                                    )}
                                </div>

                                <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                                        <UsersIcon size={16} className="text-blue-500" />
                                        <span>Students:</span>
                                    </div>
                                    <span className="text-sm font-bold text-gray-900">{cls._count?.students || 0} / {cls.capacity}</span>
                                </div>

                                <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                                        <Calendar size={16} className="text-orange-500" />
                                        <span>Year:</span>
                                    </div>
                                    <span className="text-sm font-bold text-gray-900">{cls.academicYear}</span>
                                </div>
                            </div>

                            <button
                                onClick={() => navigate(`/admin/classes/${cls.id}`)}
                                className="w-full mt-6 py-2 flex items-center justify-center space-x-2 text-sm font-bold text-primary-600 hover:bg-primary-50 rounded-lg transition-colors border border-primary-100"
                            >
                                <ExternalLink size={16} />
                                <span>View Class Details</span>
                            </button>
                        </div>
                    ))}
                </div>

                {!isLoading && filteredClasses.length === 0 && (
                    <div className="p-12 text-center text-gray-500 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                        <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-lg font-medium">No classes found.</p>
                        <p className="text-sm">Try adjusting your search or create a new class.</p>
                    </div>
                )}
            </div>

            <CreateClassModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={() => {
                    fetchClasses();
                }}
            />

            <EditClassModal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setSelectedClass(null);
                }}
                onSuccess={() => {
                    fetchClasses();
                }}
                classData={selectedClass}
            />
        </DashboardLayout>
    );
};
