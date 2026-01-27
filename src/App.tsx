import { useAuthStore } from './stores/authStore';
import { DashboardLayout } from './components/DashboardLayout';
import { TeacherDashboard } from './pages/TeacherDashboard';
import { LogProgress } from './pages/LogProgress';
import { LoginPage } from './pages/LoginPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';

import { AdminDashboard } from './pages/AdminDashboard';
import { ParentDashboard } from './pages/ParentDashboard';
import { UserManagement } from './pages/admin/UserManagement';
import { UserDetails } from './pages/admin/UserDetails';
import { ClassManagement } from './pages/admin/ClassManagement';
import { ClassDetails } from './pages/admin/ClassDetails';
import { SystemSettings } from './pages/admin/SystemSettings';
import { SignupPage } from './pages/SignupPage';
import { Messaging } from './pages/Messaging';
import { StudentProfile } from './pages/StudentProfile';
import { AttendanceRegister } from './pages/AttendanceRegister';
import ChatWidget from './components/ChatWidget';
import ChatMonitoring from './pages/admin/ChatMonitoring';

const StudentDashboard = () => (
  <DashboardLayout>
    <div className="max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">My Learning Journey</h1>
      <div className="card">
        <p className="text-gray-600">Track your progress and see your achievements!</p>
      </div>
    </div>
  </DashboardLayout>
);

const UnauthorizedPage = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="card max-w-md">
      <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
      <p className="text-gray-600 mb-4">You don't have permission to access this page.</p>
      <button
        onClick={() => useAuthStore.getState().logout()}
        className="btn btn-primary"
      >
        Return to Login
      </button>
    </div>
  </div>
);

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ErrorBoundary>
        <ChatWidget />
        <Routes>
          <Route
            path="/login"
            element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />}
          />

          <Route
            path="/signup"
            element={isAuthenticated ? <Navigate to="/" replace /> : <SignupPage />}
          />

          <Route
            path="/messaging"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'TEACHER', 'PARENT']}>
                <Messaging />
              </ProtectedRoute>
            }
          />

          <Route
            path="/"
            element={
              isAuthenticated ? (
                <Navigate to={`/${useAuthStore.getState().user?.role.toLowerCase()}/dashboard`} replace />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          <Route
            path="/teacher/dashboard"
            element={
              <ProtectedRoute allowedRoles={['TEACHER', 'ADMIN']}>
                <TeacherDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/teacher/log-progress"
            element={
              <ProtectedRoute allowedRoles={['TEACHER', 'ADMIN']}>
                <LogProgress />
              </ProtectedRoute>
            }
          />

          <Route
            path="/teacher/attendance"
            element={
              <ProtectedRoute allowedRoles={['TEACHER', 'ADMIN']}>
                <AttendanceRegister />
              </ProtectedRoute>
            }
          />

          <Route
            path="/parent/dashboard"
            element={
              <ProtectedRoute allowedRoles={['PARENT']}>
                <ParentDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/student/dashboard"
            element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/student/:id"
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'TEACHER', 'PARENT']}>
                <StudentProfile />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <UserManagement />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/users/:id"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <UserDetails />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/classes"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <ClassManagement />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/classes/:id"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <ClassDetails />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/settings"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <SystemSettings />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/chat"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <ChatMonitoring />
              </ProtectedRoute>
            }
          />

          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

export default App;
