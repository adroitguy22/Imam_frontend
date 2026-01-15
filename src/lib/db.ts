import Dexie, { Table } from 'dexie';

export interface OfflineAction {
    id?: number;
    type: 'CREATE_PROGRESS' | 'UPDATE_PROGRESS' | 'UPLOAD_DOCUMENT';
    data: any;
    studentId?: string;
    timestamp: number;
    status: 'PENDING' | 'SYNCING' | 'FAILED';
    error?: string;
}

export class LocalDB extends Dexie {
    students!: Table<any>;
    classes!: Table<any>;
    progressLogs!: Table<any>;
    skillDomains!: Table<any>;
    terms!: Table<any>;
    syncQueue!: Table<OfflineAction>;

    constructor() {
        super('ImamMalikOfflineDB');
        this.version(2).stores({
            students: 'id, studentId, classId',
            classes: 'id, name',
            progressLogs: 'id, studentId, assessmentDate',
            skillDomains: 'id, name, category',
            terms: 'id, name, academicYear',
            syncQueue: '++id, type, status, timestamp'
        });
    }

    async clearAll() {
        await Promise.all([
            this.students.clear(),
            this.classes.clear(),
            this.progressLogs.clear(),
            this.skillDomains.clear(),
            this.terms.clear(),
            this.syncQueue.clear()
        ]);
    }
}

export const db = new LocalDB();
