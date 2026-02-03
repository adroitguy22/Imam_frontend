import { DashboardLayout } from '../components/DashboardLayout';
import { BarChart2 } from 'lucide-react';

export const Analytics = () => {
    return (
        <DashboardLayout>
            <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
                <div className="p-4 bg-green-100 rounded-full text-green-600">
                    <BarChart2 size={48} />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">Analytics & Insights</h1>
                <p className="text-gray-500 text-center max-w-md">
                    Student performance trends and automated insights are being prepared.
                    Monitor class-wide and individual progress over time.
                </p>
                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 w-full max-w-lg mt-8">
                    <div className="flex items-center justify-between mb-4">
                        <div className="h-4 w-1/3 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-4 w-1/4 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                    <div className="space-y-3">
                        <div className="h-2 w-full bg-gray-100 rounded"></div>
                        <div className="h-2 w-full bg-gray-100 rounded"></div>
                        <div className="h-2 w-full bg-gray-100 rounded"></div>
                        <div className="h-2 w-2/3 bg-gray-100 rounded"></div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};
