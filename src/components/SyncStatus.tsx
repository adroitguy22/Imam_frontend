import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { WifiOff, RefreshCcw, CheckCircle, AlertCircle } from 'lucide-react';
import { db } from '../lib/db';
import syncService from '../lib/sync.service';

export const SyncStatus = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const pendingCount = useLiveQuery(() => db.syncQueue.where('status').equals('PENDING').count()) || 0;
    const syncingCount = useLiveQuery(() => db.syncQueue.where('status').equals('SYNCING').count()) || 0;
    const failedCount = useLiveQuery(() => db.syncQueue.where('status').equals('FAILED').count()) || 0;

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            syncService.sync();
        };
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    if (!isOnline) {
        return (
            <div className="flex items-center space-x-2 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold animate-pulse">
                <WifiOff size={14} />
                <span>Offline Mode</span>
                {pendingCount > 0 && <span className="ml-1">({pendingCount} pending)</span>}
            </div>
        );
    }

    if (syncingCount > 0) {
        return (
            <div className="flex items-center space-x-2 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-bold">
                <RefreshCcw size={14} className="animate-spin" />
                <span>Syncing Data...</span>
            </div>
        );
    }

    if (failedCount > 0) {
        return (
            <button
                onClick={() => syncService.sync()}
                className="flex items-center space-x-2 px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold"
                title="Click to retry sync"
            >
                <AlertCircle size={14} />
                <span>{failedCount} Sync Failed</span>
            </button>
        );
    }

    if (pendingCount > 0) {
        return (
            <div className="flex items-center space-x-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
                <RefreshCcw size={14} />
                <span>Need Sync ({pendingCount})</span>
            </div>
        );
    }

    return (
        <div className="flex items-center space-x-2 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
            <CheckCircle size={14} />
            <span>Synced</span>
        </div>
    );
};
