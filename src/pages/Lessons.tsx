import { DashboardLayout } from '../components/DashboardLayout';
import { BookOpen } from 'lucide-react';

export const Lessons = () => {
    return (
        <DashboardLayout>
            <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
                <div className="p-4 bg-primary-100 rounded-full text-primary-600">
                    <BookOpen size={48} />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">Lessons Management</h1>
                <p className="text-gray-500 text-center max-w-md">
                    Planning and tracking for curriculum lessons is coming soon.
                    This feature will allow you to organize your teaching materials and schedule.
                </p>
                <div className="flex space-x-4 pt-4">
                    <button className="btn btn-primary">Request Access</button>
                    <button className="btn bg-white border border-gray-200 text-gray-700">Learn More</button>
                </div>
            </div>
        </DashboardLayout>
    );
};
