import { create } from 'zustand';
import api from '../lib/api';

interface MessageState {
    unreadCount: number;
    fetchUnreadCount: () => Promise<void>;
    setUnreadCount: (count: number) => void;
    decrementUnreadCount: (amount?: number) => void;
}

export const useMessageStore = create<MessageState>((set, get) => ({
    unreadCount: 0,
    fetchUnreadCount: async () => {
        try {
            const { count } = await api.request('GET', '/messages/unread-count');
            set({ unreadCount: count });
        } catch (error) {
            console.error('Failed to fetch unread count:', error);
        }
    },
    setUnreadCount: (count: number) => set({ unreadCount: count }),
    decrementUnreadCount: (amount: number = 1) => {
        const currentCount = get().unreadCount;
        set({ unreadCount: Math.max(0, currentCount - amount) });
    }
}));
