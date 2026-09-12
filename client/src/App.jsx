import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Components
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

// 12 Required Application Pages
import LoginPage from './pages/LoginPage';
import AssetRegistryPage from './pages/AssetRegistryPage';
import AssetDetailPage from './pages/AssetDetailPage';
import MaintenanceCalendarPage from './pages/MaintenanceCalendarPage';
import MaintenancePlanningPage from './pages/MaintenancePlanningPage';
import FailureRiskPage from './pages/FailureRiskPage';
import RecommendationsPage from './pages/RecommendationsPage';
import ModelPerformancePage from './pages/ModelPerformancePage';
import ReportsAnalyticsPage from './pages/ReportsAnalyticsPage';
import NotificationsPage from './pages/NotificationsPage';
import UserManagementPage from './pages/UserManagementPage';
import AuditSettingsPage from './pages/AuditSettingsPage';

// Protected Route Wrapper with Navigation Layout
function ProtectedLayout() {
  const { isAuthenticated, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 border-3 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
          <span className="text-xs font-semibold text-slate-500">Authenticating with Campus Directory...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-1 flex-col min-w-0">
        <Navbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Routes>
            <Route path="/" element={<Navigate to="/assets" replace />} />
            <Route path="/assets" element={<AssetRegistryPage />} />
            <Route path="/assets/:id" element={<AssetDetailPage />} />
            <Route path="/calendar" element={<MaintenanceCalendarPage />} />
            <Route path="/planning" element={<MaintenancePlanningPage />} />
            <Route path="/failure-risk" element={<FailureRiskPage />} />
            <Route path="/recommendations" element={<RecommendationsPage />} />
            <Route path="/model-performance" element={<ModelPerformancePage />} />
            <Route path="/reports" element={<ReportsAnalyticsPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/users" element={<UserManagementPage />} />
            <Route path="/settings" element={<AuditSettingsPage />} />
            <Route path="*" element={<Navigate to="/assets" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/*" element={<ProtectedLayout />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

