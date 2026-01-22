import axios, { AxiosInstance, AxiosError } from 'axios';
import { getErrorMessage, isNetworkError } from './error-handler';

const API_BASE_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : 'https://imam-malik-monitoring.onrender.com/api';

let toastCallback: ((message: string, type: 'error' | 'success' | 'info' | 'warning') => void) | null = null;

export const setToastCallback = (callback: typeof toastCallback) => {
  toastCallback = callback;
};

const showToast = (message: string, type: 'error' | 'success' | 'info' | 'warning' = 'error') => {
  if (toastCallback) {
    toastCallback(message, type);
  }
};

class ApiClient {
    private client: AxiosInstance;

    constructor() {
        this.client = axios.create({
            baseURL: API_BASE_URL,
            headers: {
                'Content-Type': 'application/json',
            },
            timeout: 10000,
        });

        // Request interceptor to add auth token
        this.client.interceptors.request.use(
            (config) => {
                let token = localStorage.getItem('accessToken');

                // Fallback: Try to get from persisted auth store if loose key is missing
                if (!token) {
                    try {
                        const authStorage = localStorage.getItem('auth-storage');
                        if (authStorage) {
                            const parsed = JSON.parse(authStorage);
                            if (parsed.state?.accessToken) {
                                token = parsed.state.accessToken;
                                // Restore loose keys to keep them in sync
                                localStorage.setItem('accessToken', token as string);
                                if (parsed.state.refreshToken) {
                                    localStorage.setItem('refreshToken', parsed.state.refreshToken);
                                }
                            }
                        }
                    } catch (e) {
                        // Ignore parse errors
                    }
                }

                if (token) {
                    config.headers.set('Authorization', `Bearer ${token}`);
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        // Response interceptor to handle errors and token refresh
        this.client.interceptors.response.use(
            (response) => response,
            async (error: AxiosError) => {
                const originalRequest = error.config as any;

                if (isNetworkError(error)) {
                    showToast('Unable to connect to the server. Please check your internet connection.', 'error');
                    return Promise.reject(error);
                }

                if (error.response?.status === 401 && !originalRequest._retry) {
                    originalRequest._retry = true;

                    try {
                        let refreshToken = localStorage.getItem('refreshToken');

                        // Fallback: Try to get from persisted auth store if loose key is missing
                        if (!refreshToken) {
                            try {
                                const authStorage = localStorage.getItem('auth-storage');
                                if (authStorage) {
                                    const parsed = JSON.parse(authStorage);
                                    if (parsed.state?.refreshToken) {
                                        refreshToken = parsed.state.refreshToken;
                                    }
                                }
                            } catch (e) {
                                // Ignore parse errors
                            }
                        }

                        if (refreshToken) {
                            const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
                                refreshToken,
                            });

                            const { accessToken, refreshToken: newRefreshToken } = response.data;
                            localStorage.setItem('accessToken', accessToken);
                            localStorage.setItem('refreshToken', newRefreshToken);

                            originalRequest.headers = originalRequest.headers || {};
                            if (originalRequest.headers.set) {
                                originalRequest.headers.set('Authorization', `Bearer ${accessToken}`);
                            } else {
                                originalRequest.headers['Authorization'] = `Bearer ${accessToken}`;
                            }

                            return this.client(originalRequest);
                        }
                    } catch (refreshError) {
                        localStorage.removeItem('accessToken');
                        localStorage.removeItem('refreshToken');
                        localStorage.removeItem('user');
                        showToast('Your session has expired. Please log in again.', 'error');
                        window.location.href = '/login';
                        return Promise.reject(refreshError);
                    }
                }

                const message = getErrorMessage(error);
                showToast(message, 'error');
                return Promise.reject(error);
            }
        );
    }

    // Auth endpoints
    async login(email: string, password: string) {
        const response = await this.client.post('/auth/login', { email, password });
        return response.data;
    }

    async register(data: any) {
        const response = await this.client.post('/auth/register', data);
        return response.data;
    }

    async getCurrentUser() {
        const response = await this.client.get('/auth/me');
        return response.data;
    }

    async changePassword(oldPassword: string, newPassword: string) {
        const response = await this.client.post('/auth/change-password', {
            oldPassword,
            newPassword,
        });
        return response.data;
    }

    // Progress endpoints
    async createProgressLog(data: any) {
        const response = await this.client.post('/progress', data);
        return response.data;
    }

    async getProgressLog(id: string) {
        const response = await this.client.get(`/progress/${id}`);
        return response.data;
    }

    async getStudentProgressLogs(studentId: string, filters?: any) {
        const response = await this.client.get(`/progress/student/${studentId}`, {
            params: filters,
        });
        return response.data;
    }

    async getStudentProgressTrends(studentId: string, termId?: string) {
        const response = await this.client.get(`/progress/student/${studentId}/trends`, {
            params: { termId },
        });
        return response.data;
    }

    async updateProgressLog(id: string, data: any) {
        const response = await this.client.put(`/progress/${id}`, data);
        return response.data;
    }

    async deleteProgressLog(id: string) {
        const response = await this.client.delete(`/progress/${id}`);
        return response.data;
    }

    async getTeacherProgressLogs(filters?: any) {
        const response = await this.client.get('/progress/teacher/my-logs', {
            params: filters,
        });
        return response.data;
    }

    async getSkillDomains() {
        const response = await this.client.get('/progress/domains');
        return response.data;
    }

    async getTerms() {
        const response = await this.client.get('/progress/terms');
        return response.data;
    }

    async createSkillDomain(data: any) {
        const response = await this.client.post('/progress/domains', data);
        return response.data;
    }

    async updateSkillDomain(id: string, data: any) {
        const response = await this.client.put(`/progress/domains/${id}`, data);
        return response.data;
    }

    async createTerm(data: any) {
        const response = await this.client.post('/progress/terms', data);
        return response.data;
    }

    async deleteSkillDomain(id: string) {
        await this.client.delete(`/progress/domains/${id}`);
    }

    async deleteTerm(id: string) {
        await this.client.delete(`/progress/terms/${id}`);
    }

    async updateTerm(id: string, data: any) {
        const response = await this.client.put(`/progress/terms/${id}`, data);
        return response.data;
    }

    // User Management
    // User Management
    async getUsers(role?: string) {
        const response = await this.client.get('/users', { params: { role } });
        return response.data;
    }

    async getUser(id: string) {
        const response = await this.client.get(`/users/${id}`);
        return response.data;
    }

    async updateUser(id: string, data: any) {
        const response = await this.client.put(`/users/${id}`, data);
        return response.data;
    }

    // Class Management
    async getClasses() {
        const response = await this.client.get('/classes');
        return response.data;
    }

    async getClass(id: string) {
        const response = await this.client.get(`/classes/${id}`);
        return response.data;
    }

    async createClass(data: any) {
        const response = await this.client.post('/classes', data);
        return response.data;
    }

    // Student Management
    async createStudent(data: any) {
        const response = await this.client.post('/students', data);
        return response.data;
    }

    async getStudentById(id: string) {
        const response = await this.client.get(`/students/${id}`);
        return response.data;
    }

    async linkStudentParent(studentId: string, parentId: string) {
        const response = await this.client.post(`/students/${studentId}/parents`, { parentId });
        return response.data;
    }

    async unlinkStudentParent(studentId: string, parentId: string) {
        const response = await this.client.delete(`/students/${studentId}/parents/${parentId}`);
        return response.data;
    }

    async getTeacherStudents() {
        const response = await this.client.get('/students/teacher/my-students');
        return response.data;
    }

    // Document Management
    async uploadStudentDocument(studentId: string, file: File, category: string, name?: string) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('category', category);
        if (name) formData.append('name', name);

        const response = await this.client.post(`/documents/student/${studentId}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }

    async getStudentDocuments(studentId: string) {
        const response = await this.client.get(`/documents/student/${studentId}`);
        return response.data;
    }

    async deleteDocument(documentId: string) {
        const response = await this.client.delete(`/documents/${documentId}`);
        return response.data;
    }

    // Reporting
    async generateReport(studentId: string, termId: string, data: any) {
        const response = await this.client.post(`/reports/generate/${studentId}/${termId}`, data);
        return response.data;
    }

    async getStudentReports(studentId: string) {
        const response = await this.client.get(`/reports/student/${studentId}`);
        return response.data;
    }

    async getReportById(id: string) {
        const response = await this.client.get(`/reports/${id}`);
        return response.data;
    }

    // Engagement & Portfolios
    async uploadPortfolioItem(studentId: string, data: { title: string, description?: string, type: string, image?: File }) {
        const formData = new FormData();
        formData.append('studentId', studentId);
        formData.append('title', data.title);
        if (data.description) formData.append('description', data.description);
        formData.append('type', data.type);
        formData.append('subDir', 'portfolios');
        if (data.image) formData.append('image', data.image);

        const response = await this.client.post('/engagement/portfolio', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    }

    async getStudentPortfolio(studentId: string) {
        const response = await this.client.get(`/engagement/portfolio/${studentId}`);
        return response.data;
    }

    async deletePortfolioItem(id: string) {
        const response = await this.client.delete(`/engagement/portfolio/${id}`);
        return response.data;
    }

    // Badges
    async awardBadge(studentId: string, badgeId: string) {
        const response = await this.client.post('/engagement/badges/award', { studentId, badgeId });
        return response.data;
    }

    async getStudentBadges(studentId: string) {
        const response = await this.client.get(`/engagement/badges/student/${studentId}`);
        return response.data;
    }

    async getAllBadges() {
        const response = await this.client.get('/engagement/badges');
        return response.data;
    }

    // Attendance
    async recordAttendance(date: string, records: { studentId: string, status: string, notes?: string }[]) {
        const response = await this.client.post('/attendance', { date, records });
        return response.data;
    }

    async getStudentAttendance(studentId: string, startDate?: string, endDate?: string) {
        const response = await this.client.get(`/attendance/student/${studentId}`, {
            params: { startDate, endDate },
        });
        return response.data;
    }

    async getClassAttendance(classId: string, date: string) {
        const response = await this.client.get(`/attendance/class/${classId}`, {
            params: { date },
        });
        return response.data;
    }

    async updateAttendanceRecord(id: string, status: string, notes?: string) {
        const response = await this.client.patch(`/attendance/${id}`, { status, notes });
        return response.data;
    }

    // Generic request method for custom endpoints
    async request(method: string, url: string, data?: any, config?: any) {
        const response = await this.client.request({
            method,
            url,
            data,
            ...config,
        });
        return response.data;
    }
}

export const api = new ApiClient();
export default api;
