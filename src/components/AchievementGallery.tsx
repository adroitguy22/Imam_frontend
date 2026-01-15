import { useState, useEffect } from 'react';
import {
    Award,
    X,
    AlertCircle,
    Loader2,
    Calendar,
    Star,
    Book,
    Heart,
    Zap,
    Trophy
} from 'lucide-react';
import api from '../lib/api';

interface Badge {
    id: string;
    name: string;
    description: string;
    icon: string;
    criteria: string;
}

interface StudentBadge {
    id: string;
    badge: Badge;
    awardedAt: string;
    teacher: {
        user: {
            firstName: string;
            lastName: string;
        }
    };
}

interface AchievementGalleryProps {
    studentId: string;
    canAward?: boolean;
}

export const AchievementGallery = ({ studentId, canAward = true }: AchievementGalleryProps) => {
    const [earnedBadges, setEarnedBadges] = useState<StudentBadge[]>([]);
    const [allBadges, setAllBadges] = useState<Badge[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showAwardModal, setShowAwardModal] = useState(false);
    const [isAwarding, setIsAwarding] = useState(false);
    const [awardError, setAwardError] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
    }, [studentId]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [earned, all] = await Promise.all([
                api.getStudentBadges(studentId),
                api.getAllBadges()
            ]);
            setEarnedBadges(earned);
            setAllBadges(all);
        } catch (err) {
            console.error('Failed to fetch badges', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAwardBadge = async (badgeId: string) => {
        setIsAwarding(true);
        setAwardError(null);
        try {
            await api.awardBadge(studentId, badgeId);
            setShowAwardModal(false);
            fetchData();
        } catch (err: any) {
            setAwardError(err.response?.data?.error || 'Failed to award badge');
        } finally {
            setIsAwarding(false);
        }
    };

    const getBadgeIcon = (iconName: string, size = 24) => {
        switch (iconName.toLowerCase()) {
            case 'star': return <Star size={size} />;
            case 'book': return <Book size={size} />;
            case 'heart': return <Heart size={size} />;
            case 'zap': return <Zap size={size} />;
            case 'trophy': return <Trophy size={size} />;
            default: return <Award size={size} />;
        }
    };

    const isBadgeEarned = (badgeId: string) => {
        return earnedBadges.some(eb => eb.badge.id === badgeId);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-bold text-gray-900">Achievements</h3>
                    <p className="text-sm text-gray-500">Badges earned for special effort and behavior</p>
                </div>
                {canAward && (
                    <button
                        onClick={() => setShowAwardModal(true)}
                        className="btn bg-amber-500 hover:bg-amber-600 text-white flex items-center space-x-2 text-sm shadow-sm"
                    >
                        <Award size={16} />
                        <span>Award Badge</span>
                    </button>
                )}
            </div>

            {isLoading ? (
                <div className="flex justify-center p-12">
                    <Loader2 className="animate-spin text-amber-500" size={40} />
                </div>
            ) : earnedBadges.length === 0 ? (
                <div className="card text-center p-16 bg-amber-50/30 border-dashed border-2 border-amber-100">
                    <Trophy className="mx-auto text-amber-200 mb-4" size={64} />
                    <h4 className="text-lg font-medium text-gray-900">No Badges Yet</h4>
                    <p className="text-gray-500 max-w-xs mx-auto mt-2">
                        Recognize the student's hard work by awarding their first achievement badge.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {earnedBadges.map((eb) => (
                        <div key={eb.id} className="group relative bg-white rounded-2xl p-4 border border-amber-50 shadow-sm hover:shadow-md transition-all text-center">
                            <div className="w-16 h-16 mx-auto bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                                {getBadgeIcon(eb.badge.icon, 32)}
                            </div>
                            <h4 className="font-bold text-gray-900 text-sm">{eb.badge.name}</h4>
                            <div className="mt-2 text-[10px] text-gray-400 flex items-center justify-center">
                                <Calendar size={10} className="mr-1" />
                                {new Date(eb.awardedAt).toLocaleDateString()}
                            </div>

                            {/* Hover Details */}
                            <div className="absolute inset-0 bg-white/95 backdrop-blur-sm rounded-2xl p-4 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-center items-center z-10 border border-amber-100">
                                <p className="text-xs font-bold text-amber-700">{eb.badge.name}</p>
                                <p className="text-[10px] text-gray-600 mt-1 line-clamp-3">{eb.badge.description}</p>
                                <p className="text-[9px] font-medium text-gray-400 mt-2">
                                    By Teacher {eb.teacher.user.firstName}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Award Modal */}
            {showAwardModal && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
                        <div className="p-6 bg-amber-500 flex items-center justify-between text-white">
                            <div>
                                <h2 className="text-xl font-bold">Award Achievement</h2>
                                <p className="text-amber-100 text-xs">Recognize and motivate the student</p>
                            </div>
                            <button onClick={() => setShowAwardModal(false)} className="p-2 hover:bg-amber-400 rounded-full transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-8">
                            {awardError && (
                                <div className="bg-red-50 text-red-700 p-4 rounded-xl flex items-start space-x-3 text-sm border border-red-100 mb-6">
                                    <AlertCircle size={20} className="shrink-0" />
                                    <span>{awardError}</span>
                                </div>
                            )}

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                {allBadges.map((badge) => {
                                    const earned = isBadgeEarned(badge.id);
                                    return (
                                        <div
                                            key={badge.id}
                                            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start space-x-4 ${(earned || isAwarding)
                                                ? 'bg-gray-50 border-gray-100 opacity-60 pointer-events-none'
                                                : 'border-amber-50 hover:border-amber-300 hover:bg-amber-50/30'
                                                }`}
                                            onClick={() => !(earned || isAwarding) && handleAwardBadge(badge.id)}
                                        >
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${earned ? 'bg-gray-200 text-gray-400' : 'bg-amber-100 text-amber-600'}`}>
                                                {getBadgeIcon(badge.icon)}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between">
                                                    <h4 className="font-bold text-gray-900 text-sm">{badge.name}</h4>
                                                    {earned && <span className="text-[10px] font-bold text-gray-400 italic">EARNED</span>}
                                                </div>
                                                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{badge.description}</p>
                                                <p className="text-[10px] font-medium text-amber-600 mt-2 italic">"{badge.criteria}"</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="mt-8 flex justify-end">
                                <button
                                    onClick={() => setShowAwardModal(false)}
                                    className="btn btn-secondary px-8"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
