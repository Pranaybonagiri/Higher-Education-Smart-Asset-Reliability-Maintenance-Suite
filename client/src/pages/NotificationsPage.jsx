import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Trash2,
  CheckCheck,
  Filter,
  ExternalLink,
  Shield,
  Sliders,
  Sparkles,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function NotificationsPage() {
  const { user } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('All');
  const [showPreferences, setShowPreferences] = useState(false);

  // Notification preferences simulation
  const [preferences, setPreferences] = useState({
    criticalTelemetry: true,
    aiPredictions: true,
    workOrderAssignments: true,
    academicFreezeAlerts: true,
  });

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/notifications?type=${filterType}&limit=50`);
      if (res.data.success) {
        setNotifications(res.data.data.notifications || []);
        setUnreadCount(res.data.data.unreadCount || 0);
      }
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [filterType]);

  const handleMarkRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/notifications/mark-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-900 sm:text-2xl">
              Campus Notifications & Alert Center
            </h1>
            {unreadCount > 0 && (
              <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-bold text-rose-800">
                {unreadCount} Unread
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Real-time critical failure triggers, work order dispatches, and supervisor verification notices.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs"
            >
              <CheckCheck className="h-4 w-4 text-indigo-600" />
              <span>Mark All as Read</span>
            </button>
          )}

          <button
            onClick={() => setShowPreferences(!showPreferences)}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs"
          >
            <Sliders className="h-4 w-4 text-slate-500" />
            <span>Notification Preferences</span>
          </button>
        </div>
      </div>

      {/* Preferences Panel Drawer */}
      {showPreferences && (
        <div className="rounded-2xl border border-indigo-200 bg-indigo-50/50 p-4 text-xs text-indigo-950 animate-in fade-in">
          <h3 className="font-bold text-sm mb-2 text-indigo-900">Role-Based Notification Dispatch Preferences</h3>
          <p className="text-slate-600 text-[11px] mb-3">
            Configure which events trigger real-time browser notifications and supervisor email dispatches.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <label className="flex items-center gap-2 p-2 rounded-xl bg-white border border-indigo-100 cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.criticalTelemetry}
                onChange={(e) => setPreferences({ ...preferences, criticalTelemetry: e.target.checked })}
                className="h-3.5 w-3.5 rounded text-indigo-600"
              />
              <span className="font-semibold text-slate-800">Critical Telemetry Spikes</span>
            </label>

            <label className="flex items-center gap-2 p-2 rounded-xl bg-white border border-indigo-100 cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.aiPredictions}
                onChange={(e) => setPreferences({ ...preferences, aiPredictions: e.target.checked })}
                className="h-3.5 w-3.5 rounded text-indigo-600"
              />
              <span className="font-semibold text-slate-800">Gemini RUL Warnings (&lt;14d)</span>
            </label>

            <label className="flex items-center gap-2 p-2 rounded-xl bg-white border border-indigo-100 cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.workOrderAssignments}
                onChange={(e) => setPreferences({ ...preferences, workOrderAssignments: e.target.checked })}
                className="h-3.5 w-3.5 rounded text-indigo-600"
              />
              <span className="font-semibold text-slate-800">Work Order Dispatches</span>
            </label>

            <label className="flex items-center gap-2 p-2 rounded-xl bg-white border border-indigo-100 cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.academicFreezeAlerts}
                onChange={(e) => setPreferences({ ...preferences, academicFreezeAlerts: e.target.checked })}
                className="h-3.5 w-3.5 rounded text-indigo-600"
              />
              <span className="font-semibold text-slate-800">Academic Quiet Windows</span>
            </label>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-1.5 rounded-2xl border border-slate-200 bg-white p-3 shadow-xs text-xs font-semibold">
        {['All', 'AI_PREDICTION', 'WORK_ORDER', 'APPROVAL', 'ALERT', 'SYSTEM'].map((t) => (
          <button
            key={t}
            onClick={() => setFilterType(t)}
            className={`rounded-xl px-3 py-1.5 transition ${
              filterType === t
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {t === 'All'
              ? 'All Notifications'
              : t === 'AI_PREDICTION'
              ? 'AI Predictions'
              : t === 'WORK_ORDER'
              ? 'Work Orders'
              : t}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="flex h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white">
          <div className="h-6 w-6 border-2 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
          <Bell className="h-10 w-10 text-slate-300" />
          <h3 className="mt-3 text-sm font-bold text-slate-800">No notifications in this filter</h3>
          <p className="mt-1 text-xs text-slate-400">All alerts have been acknowledged.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => {
            const isUnread = !notif.isRead;
            const isCrit = notif.severity === 'Critical';

            return (
              <div
                key={notif._id}
                className={`flex flex-col gap-3 rounded-2xl border p-4 shadow-xs transition sm:flex-row sm:items-center sm:justify-between ${
                  isUnread
                    ? 'border-indigo-200 bg-indigo-50/30'
                    : 'border-slate-200 bg-white'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 shrink-0">
                    {isCrit ? (
                      <AlertTriangle className="h-5 w-5 text-rose-600 animate-pulse" />
                    ) : notif.severity === 'Warning' ? (
                      <Clock className="h-5 w-5 text-amber-500" />
                    ) : (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">{notif.title}</span>
                      {isUnread && (
                        <span className="h-2 w-2 rounded-full bg-indigo-600 shrink-0"></span>
                      )}
                      <span className="rounded bg-slate-100 px-1.5 py-0.2 text-[10px] font-bold text-slate-600 uppercase">
                        {notif.type}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">{notif.message}</p>

                    <div className="text-[10px] text-slate-400">
                      Dispatched: {new Date(notif.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  {notif.link && (
                    <Link
                      to={notif.link}
                      className="flex items-center gap-1 rounded-lg bg-indigo-50 px-2.5 py-1.5 text-xs font-bold text-indigo-700 hover:bg-indigo-100"
                    >
                      <span>Open Record</span>
                      <ExternalLink className="h-3 w-3" />
                    </Link>
                  )}

                  {isUnread && (
                    <button
                      onClick={() => handleMarkRead(notif._id)}
                      className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      title="Mark as Read"
                    >
                      Mark Read
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(notif._id)}
                    className="rounded-lg p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                    title="Dismiss"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

