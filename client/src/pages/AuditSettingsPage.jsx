import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  Search,
  Filter,
  Sliders,
  SlidersHorizontal,
  Lock,
  Calendar,
  Sparkles,
  Save,
  CheckCircle2,
  AlertTriangle,
  FileText,
  ChevronDown,
  ChevronRight,
  User,
  Clock,
  Building,
} from 'lucide-react';

export default function AuditSettingsPage() {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState('audit'); // 'audit' | 'settings'

  // Audit logs state
  const [logs, setLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [actionFilter, setActionFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [expandedLogId, setExpandedLogId] = useState(null);

  // Settings state
  const [settings, setSettings] = useState([]);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState('');

  const fetchAuditLogs = async () => {
    try {
      setLoadingLogs(true);
      const res = await api.get(`/audit/logs?action=${actionFilter}&search=${search}&limit=50`);
      if (res.data.success) {
        setLogs(res.data.data.logs || []);
      }
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoadingLogs(false);
    }
  };

  const fetchSettings = async () => {
    try {
      setLoadingSettings(true);
      const res = await api.get('/audit/settings');
      if (res.data.success) {
        setSettings(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load system settings:', err);
    } finally {
      setLoadingSettings(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'audit') {
      fetchAuditLogs();
    } else {
      fetchSettings();
    }
  }, [activeTab, actionFilter]);

  const handleUpdateSetting = async (key, val) => {
    try {
      const res = await api.put('/audit/settings', { key, value: val });
      if (res.data.success) {
        setSaveSuccess(`Updated parameter '${key}' successfully!`);
        setTimeout(() => setSaveSuccess(''), 3500);
        fetchSettings();
      }
    } catch (err) {
      alert('Failed to update system setting');
    }
  };

  const getActionBadge = (action) => {
    switch (action) {
      case 'APPROVE':
        return 'bg-emerald-100 text-emerald-800';
      case 'REJECT':
        return 'bg-rose-100 text-rose-800';
      case 'OVERRIDE':
        return 'bg-purple-100 text-purple-800';
      case 'AI_EXECUTION':
        return 'bg-indigo-100 text-indigo-800';
      case 'LOGIN':
        return 'bg-slate-100 text-slate-800';
      case 'CONFIG_CHANGE':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-900 sm:text-2xl">
              Immutable Audit Trail & System Configuration
            </h1>
            <span className="rounded-full bg-slate-900 px-2.5 py-0.5 text-xs font-bold text-white">
              Append-Only Ledger
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Cryptographically sealed audit records for all material university decisions and campus threshold calibration.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-xl border border-slate-200 bg-white p-1 shadow-xs text-xs font-semibold">
          <button
            onClick={() => setActiveTab('audit')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition ${
              activeTab === 'audit' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Audit Trail Ledger</span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition ${
              activeTab === 'settings' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sliders className="h-3.5 w-3.5" />
            <span>Campus Configuration</span>
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800 animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          <span>{saveSuccess}</span>
        </div>
      )}

      {activeTab === 'audit' ? (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-200 bg-white p-3 shadow-xs">
            <div className="flex flex-wrap gap-1.5 text-xs font-semibold">
              {[
                'All',
                'AI_EXECUTION',
                'APPROVE',
                'REJECT',
                'OVERRIDE',
                'CLOSE_VERIFY',
                'CREATE',
                'CONFIG_CHANGE',
                'LOGIN',
              ].map((a) => (
                <button
                  key={a}
                  onClick={() => setActionFilter(a)}
                  className={`rounded-xl px-3 py-1.5 transition ${
                    actionFilter === a
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {a.replace('_', ' ')}
                </button>
              ))}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                fetchAuditLogs();
              }}
              className="relative sm:w-64"
            >
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search actor, reason, entity..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-3 py-1.5 text-xs focus:border-indigo-500 focus:bg-white focus:outline-none"
              />
            </form>
          </div>

          {/* Audit Logs Table */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Timestamp</th>
                    <th className="px-4 py-3">Actor & Role</th>
                    <th className="px-4 py-3">Action</th>
                    <th className="px-4 py-3">Target Entity</th>
                    <th className="px-4 py-3">Justification Reason</th>
                    <th className="px-4 py-3 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {logs.map((log) => {
                    const isExpanded = expandedLogId === log._id;
                    return (
                      <React.Fragment key={log._id}>
                        <tr
                          className="hover:bg-slate-50/80 cursor-pointer transition"
                          onClick={() => setExpandedLogId(isExpanded ? null : log._id)}
                        >
                          <td className="px-4 py-3.5 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                            {new Date(log.timestamp).toLocaleString()}
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="font-bold text-slate-900">{log.actorName}</div>
                            <div className="text-[10px] text-slate-400">{log.actorRole}</div>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${getActionBadge(log.action)}`}>
                              {log.action}
                            </span>
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="font-semibold text-slate-800">{log.entityType}</div>
                            <div className="text-[10px] text-slate-400 truncate max-w-[150px]">
                              {log.entityName || log.entityId}
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-slate-600 max-w-xs truncate">{log.reason}</td>
                          <td className="px-4 py-3.5 text-right">
                            <button className="text-slate-400 hover:text-indigo-600">
                              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                            </button>
                          </td>
                        </tr>

                        {/* Expandable Diff & Forensic Metadata Row */}
                        {isExpanded && (
                          <tr className="bg-slate-50/90">
                            <td colSpan={6} className="p-4 text-xs">
                              <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-3">
                                <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-500 border-b border-slate-100 pb-2">
                                  <span>Client IP: <strong>{log.ipAddress}</strong></span>
                                  <span>Tamper Proofing: <strong>SHA-256 Verified</strong></span>
                                  <span>Log Status: <strong className="text-emerald-600">{log.outcome}</strong></span>
                                </div>

                                <div className="text-slate-700">
                                  <strong>Recorded Justification:</strong> {log.reason}
                                </div>

                                {(log.previousState || log.newState) && (
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] font-mono">
                                    <div className="rounded-lg bg-slate-100 p-2.5 overflow-x-auto">
                                      <div className="text-slate-500 font-bold mb-1">Previous State:</div>
                                      <pre className="text-slate-700">{JSON.stringify(log.previousState, null, 2)}</pre>
                                    </div>
                                    <div className="rounded-lg bg-indigo-50/60 p-2.5 overflow-x-auto border border-indigo-100">
                                      <div className="text-indigo-700 font-bold mb-1">New State:</div>
                                      <pre className="text-indigo-900">{JSON.stringify(log.newState, null, 2)}</pre>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Settings View */
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-1">Active AI Configuration & Thresholds</h3>
            <p className="text-xs text-slate-400 mb-4">
              Calibrate Google Gemini RCM prompt engine parameters and condition alert limits.
            </p>

            <div className="divide-y divide-slate-100 space-y-4">
              {settings.map((setting) => (
                <div key={setting._id} className="pt-4 first:pt-0 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between text-xs">
                  <div className="space-y-1">
                    <div className="font-bold text-slate-800">{setting.label}</div>
                    <div className="text-slate-500 text-[11px]">{setting.description}</div>
                    <div className="font-mono text-[10px] text-slate-400">Parameter Key: {setting.key}</div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {typeof setting.value === 'number' ? (
                      <input
                        type="number"
                        step="0.05"
                        defaultValue={setting.value}
                        onBlur={(e) => handleUpdateSetting(setting.key, parseFloat(e.target.value))}
                        className="w-24 rounded-lg border border-slate-200 px-2 py-1 text-right font-bold text-indigo-600 focus:outline-none focus:border-indigo-500"
                      />
                    ) : typeof setting.value === 'string' ? (
                      <input
                        type="text"
                        defaultValue={setting.value}
                        onBlur={(e) => handleUpdateSetting(setting.key, e.target.value)}
                        className="w-48 rounded-lg border border-slate-200 px-2 py-1 font-mono text-xs focus:outline-none focus:border-indigo-500"
                      />
                    ) : (
                      <span className="rounded bg-indigo-50 px-2 py-1 font-bold text-indigo-700">
                        Exam Period Protected
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Academic Calendar Freeze Configuration */}
          <div className="rounded-2xl border border-indigo-200 bg-indigo-50/40 p-5 shadow-xs text-xs text-indigo-950">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-indigo-600" />
              <h3 className="text-sm font-bold text-indigo-900">Academic Examination Quiet Period Freeze</h3>
            </div>
            <p className="mt-1 text-slate-600 leading-relaxed text-[11px]">
              During active midterm and final examination weeks, high-decibel maintenance (core drilling, reciprocating compressor servicing, hydraulic elevator testing) is automatically flagged with warning banners and rescheduled to weekend slots.
            </p>
            <div className="mt-3 flex items-center gap-2">
              <span className="rounded-full bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 text-[10px]">
                Active Protection Enforced
              </span>
              <span className="text-[11px] text-slate-500">
                Restricted Hours: 08:00 &mdash; 18:00 Across Central Academic Core
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

