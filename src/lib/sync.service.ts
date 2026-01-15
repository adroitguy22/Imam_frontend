import api from './api';
import { db, OfflineAction } from './db';

class SyncService {
    private isSyncing = false;

    constructor() {
        if (typeof window !== 'undefined') {
            window.addEventListener('online', () => this.sync());
        }
    }

    async queueAction(type: OfflineAction['type'], data: any, studentId?: string) {
        const action: OfflineAction = {
            type,
            data,
            studentId,
            timestamp: Date.now(),
            status: 'PENDING'
        };

        await db.syncQueue.add(action);

        if (navigator.onLine) {
            this.sync();
        }
    }

    async sync() {
        if (this.isSyncing || !navigator.onLine) return;

        const pendingActions = await db.syncQueue
            .where('status')
            .equals('PENDING')
            .toArray();

        if (pendingActions.length === 0) return;

        this.isSyncing = true;
        console.log(`Syncing ${pendingActions.length} actions...`);

        for (const action of pendingActions) {
            try {
                await db.syncQueue.update(action.id!, { status: 'SYNCING' });
                await this.processAction(action);
                await db.syncQueue.delete(action.id!);
            } catch (error: any) {
                console.error('Sync failed for action:', action, error);
                await db.syncQueue.update(action.id!, {
                    status: 'FAILED',
                    error: error.message || 'Unknown error'
                });
            }
        }

        this.isSyncing = false;
    }

    private async processAction(action: OfflineAction) {
        switch (action.type) {
            case 'CREATE_PROGRESS':
                await api.createProgressLog(action.data);
                break;
            case 'UPDATE_PROGRESS':
                await api.updateProgressLog(action.data.id, action.data);
                break;
            // Add other types as needed
            default:
                console.warn('Unknown action type:', action.type);
        }
    }

    // Helper to cache critical data for offline use
    async cacheAppData() {
        try {
            const [students, classes] = await Promise.all([
                api.request('GET', '/students'),
                api.getClasses()
            ]);

            await db.students.clear();
            await db.students.bulkAdd(students);

            await db.classes.clear();
            await db.classes.bulkAdd(classes);

            console.log('App data cached for offline use');
        } catch (error) {
            console.error('Failed to cache app data', error);
        }
    }
}

export const syncService = new SyncService();
export default syncService;
