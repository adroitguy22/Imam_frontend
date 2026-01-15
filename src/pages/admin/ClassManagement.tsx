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
    ExternalLink
} from 'lucide-react';
import api from '../../lib/api';
import { DashboardLayout } from '../../components/DashboardLayout';

export const ClassManagement = () => {
    const navigate = useNavigate();
    const [classes, setClasses] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

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

    const handleCreateClass = async () => {
        try {
            const name = prompt('Enter Class Name (e.g. Primary 3A):');
            if (!name) return;

            const level = prompt('Enter Level (e.g. Primary 3):');
            if (!level) return;

            const academicYear = prompt('Enter Academic Year (e.g. 2024/2025):', '2024/2025');
            if (!academicYear) return;

            const capacity = parseInt(prompt('Enter Capacity:', '30') || '30');

            // Fetch teachers to let admin pick one (simplified for now: asking for teacher list)
            const teachers = await api.getUsers('TEACHER');
            if (teachers.length === 0) {
                if (!confirm('No teachers found. Create class without an assigned teacher?')) return;
            }

            let teacherId = null;
            if (teachers.length > 0) {
                const teacherOptions = teachers.map((t: any, i: number) => `${i + 1}. ${t.firstName} ${t.lastName}`).join('\n');
                const selection = prompt(`Select Teacher (enter number):\n${teacherOptions}\n(Leave empty for unassigned)`);
                if (selection) {
                    const index = parseInt(selection) - 1;
                    if (teachers[index]) {
                        if (teachers[index].teacher?.id) {
                            teacherId = teachers[index].teacher.id;
                        } else {
                            alert('Warning: This user has the TEACHER role but is missing a specialized Teacher profile. Assignment might fail.');
                            teacherId = teachers[index].id; // Fallback to user ID which will likely fail on backend due to FK, but at least we're aware.
                        }
                    }
                }
            }

            const newClass = await api.createClass({
                name,
                level,
                academicYear,
                capacity,
                teacherId
            });

            if (newClass) {
                alert('Class created successfully!');
                fetchClasses();
            }
        } catch (error: any) {
            console.error('Failed to create class', error);
            alert(error.response?.data?.error || 'Failed to create class');
        }
    };

    const filteredClasses = classes.filter(cls =>
        cls.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cls.level.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (cls.teacher?.user && `${cls.teacher.user.firstName} ${cls.teacher.user.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()))
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
                                <button className="p-1 text-gray-400 hover:text-gray-900">
                                    <MoreVertical size={20} />
                                </button>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                                        <BookOpen size={16} className="text-primary-500" />
                                        <span>Teacher:</span>
                                    </div>
                                    <span className="text-sm font-bold text-gray-900">
                                        {cls.teacher?.user ? `${cls.teacher.user.firstName} ${cls.teacher.user.lastName}` : 'Unassigned'}
                                    </span>
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

                            <button className="w-full mt-6 py-2 flex items-center justify-center space-x-2 text-sm font-bold text-primary-600 hover:bg-primary-50 rounded-lg transition-colors border border-primary-100">
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
        </DashboardLayout>
    );
};
