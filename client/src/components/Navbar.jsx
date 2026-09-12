import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  Bell,
  Search,
  Shield,
  User,
  LogOut,
  ChevronDown,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Building,
} from 'lucide-react';

export default function Navbar({ onToggleSidebar }) {
  const { user, logout, demoLogin } = useAuth();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);
  const notifRef = useRef(null);
  const userRef = useRef(null);
  const roleRef = useRef(null);

  const roles = [
    { role: 'MaintenanceAdmin', label: 'Maintenance Admin', user: 'Dr. Marcus Vance' },
    { role: 'Technician', label: 'Field Technician', user: 'Elena Rostova' },
    { role: 'OperationsManager', label: 'Operations Manager', user: 'Devon Bradley' },
    { role: 'Vendor', label: 'Vendor / Contractor', user: 'Klaus Lindqvist' },
    { role: 'AcademicDeptHead', label: 'Academic Dept Head', user: 'Prof. Alistair Chen' },
  ];

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications?limit=5');
      if (res.data.success) {
        setNotifications(res.data.data.notifications || []);
        setUnreadCount(res.data.data.unreadCount || 0);
      }
    } catch (err) {
      console.warn('Could not load notifications:', err.message);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000);
    return () => clearInterval(interval);
  }, []);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifMenu(false);
      if (userRef.current && !userRef.current.contains(e.target)) setShowUserMenu(false);
      if (roleRef.current && !roleRef.current.contains(e.target)) setShowRoleSwitcher(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRoleSwitch = async (roleName) => {
    await demoLogin(roleName);
    setShowRoleSwitcher(false);
    fetchNotifications();
    navigate('/assets');
  };

  const markAllRead = async () => {
    try {
      await api.patch('/notifications/mark-all');
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'MaintenanceAdmin':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'OperationsManager':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Technician':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Vendor':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'AcademicDeptHead':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6">
      {/* Brand & Campus Info */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 lg:hidden"
          aria-label="Toggle navigation"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <Link to="/assets" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-700 to-indigo-500 text-white shadow-md shadow-indigo-500/20">
            <Building className="h-5 w-5" />
          </div>
          <div>
            <span className="text-base font-extrabold tracking-tight text-slate-900">
              HE<span className="text-indigo-600">-SARMS</span>
            </span>
            <span className="hidden text-xs text-slate-400 sm:inline-block sm:ml-2">
              University Asset Reliability Suite
            </span>
          </div>
        </Link>
      </div>

      {/* Global AI Status & Actions */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Gemini AI Engine Active Pill */}
        <div className="hidden md:flex items-center gap-1.5 rounded-full border border-indigo-100 bg-indigo-50/70 px-3 py-1 text-xs font-semibold text-indigo-700">
          <Sparkles className="h-3.5 w-3.5 animate-pulse text-indigo-600" />
          <span>Gemini 1.5 Flash Active</span>
        </div>

        {/* Demo Role Switcher Dropdown */}
        <div className="relative" ref={roleRef}>
          <button
            onClick={() => setShowRoleSwitcher(!showRoleSwitcher)}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50/80 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 transition"
            title="Fast Demo Persona Switcher"
          >
            <Shield className="h-3.5 w-3.5 text-indigo-600" />
            <span className="hidden sm:inline">Role:</span>
            <span className={`rounded px-1.5 py-0.5 text-[11px] font-semibold border ${getRoleBadgeColor(user?.role)}`}>
              {user?.role || 'Guest'}
            </span>
            <ChevronDown className="h-3 w-3 text-slate-400" />
          </button>

          {showRoleSwitcher && (
            <div className="absolute right-0 mt-2 w-64 rounded-xl border border-slate-200 bg-white p-2 shadow-xl z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-2 py-1.5 text-xs font-bold text-slate-400 uppercase tracking-wider">
                Switch Evaluation Role
              </div>
              {roles.map((r) => (
                <button
                  key={r.role}
                  onClick={() => handleRoleSwitch(r.role)}
                  className={`flex w-full flex-col rounded-lg px-3 py-2 text-left text-xs transition ${
                    user?.role === r.role ? 'bg-indigo-50 text-indigo-900 font-semibold' : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{r.label}</span>
                    {user?.role === r.role && <span className="h-1.5 w-1.5 rounded-full bg-indigo-600"></span>}
                  </div>
                  <span className="text-[11px] text-slate-400 font-normal">{r.user}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition"
            aria-label="View notifications"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifMenu && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-slate-200 bg-white shadow-2xl z-50 overflow-hidden animate-in fade-in">
              <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-3">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-indigo-600" />
                  <span className="text-sm font-bold text-slate-800">Campus Alerts</span>
                  {unreadCount > 0 && (
                    <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-semibold text-indigo-700">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400">
                    No active notifications
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n._id}
                      className={`p-3.5 text-xs transition ${n.isRead ? 'bg-white' : 'bg-indigo-50/40'}`}
                    >
                      <div className="flex items-start gap-2.5">
                        {n.severity === 'Critical' ? (
                          <AlertTriangle className="h-4 w-4 text-rose-500 mt-0.5 shrink-0" />
                        ) : n.severity === 'Warning' ? (
                          <Clock className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                        ) : (
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                        )}
                        <div className="flex-1">
                          <p className="font-semibold text-slate-800">{n.title}</p>
                          <p className="mt-0.5 text-slate-600 text-[11px] leading-relaxed">{n.message}</p>
                          <div className="mt-1 flex items-center justify-between text-[10px] text-slate-400">
                            <span>{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            {n.link && (
                              <Link
                                to={n.link}
                                onClick={() => setShowNotifMenu(false)}
                                className="font-semibold text-indigo-600 hover:underline"
                              >
                                View Record &rarr;
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="border-t border-slate-100 bg-slate-50 p-2.5 text-center">
                <Link
                  to="/notifications"
                  onClick={() => setShowNotifMenu(false)}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                >
                  Open Full Notification Center &rarr;
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="relative" ref={userRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 rounded-lg p-1 text-left hover:bg-slate-100 transition"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white shadow-sm">
              {user?.name ? user.name.charAt(0) : 'U'}
            </div>
            <div className="hidden xl:block text-xs">
              <div className="font-semibold text-slate-800 leading-tight">{user?.name}</div>
              <div className="text-[11px] text-slate-400">{user?.department}</div>
            </div>
            <ChevronDown className="hidden xl:block h-3.5 w-3.5 text-slate-400" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white p-2 shadow-xl z-50">
              <div className="border-b border-slate-100 px-3 py-2 text-xs">
                <p className="font-bold text-slate-900">{user?.name}</p>
                <p className="text-slate-500 text-[11px] truncate">{user?.email}</p>
              </div>
              <div className="py-1">
                <Link
                  to="/users"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-slate-700 hover:bg-slate-50"
                >
                  <User className="h-3.5 w-3.5 text-slate-400" />
                  User & Role Permissions
                </Link>
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    logout();
                    navigate('/login');
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50"
                >
                  <LogOut className="h-3.5 w-3.5 text-rose-500" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

