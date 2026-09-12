import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  LayoutGrid,
  List,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Sparkles,
  Building,
  Wrench,
  Activity,
  Layers,
  ShieldAlert,
  ChevronRight,
  TrendingDown,
  RefreshCw,
} from 'lucide-react';

export default function AssetRegistryPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [assets, setAssets] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [criticality, setCriticality] = useState('All');
  const [status, setStatus] = useState('All');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  const categories = ['All', 'Classroom', 'Laboratory', 'Library', 'Hostel', 'Device', 'LearningSystem'];
  const criticalityTiers = ['All', 'Critical', 'High', 'Medium', 'Low'];
  const statusOptions = ['All', 'Operational', 'Degraded', 'In_Maintenance', 'Offline'];

  const fetchData = async () => {
    try {
      setLoading(true);
      const [assetsRes, statsRes] = await Promise.all([
        api.get(`/assets?category=${category}&criticality=${criticality}&status=${status}&search=${search}`),
        api.get('/assets/stats'),
      ]);

      if (assetsRes.data.success) {
        setAssets(assetsRes.data.data.assets || []);
      }
      if (statsRes.data.success) {
        setStats(statsRes.data.data);
      }
    } catch (err) {
      console.error('Failed to load asset data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [category, criticality, status]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchData();
  };

  const getHealthBadge = (score) => {
    if (score >= 80) {
      return { label: 'Optimal', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
    }
    if (score >= 50) {
      return { label: 'Warning', bg: 'bg-amber-50 text-amber-700 border-amber-200' };
    }
    return { label: 'Critical Risk', bg: 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse' };
  };

  const getStatusBadge = (st) => {
    switch (st) {
      case 'Operational':
        return 'bg-emerald-100 text-emerald-800';
      case 'Degraded':
        return 'bg-amber-100 text-amber-800';
      case 'In_Maintenance':
        return 'bg-blue-100 text-blue-800';
      case 'Offline':
        return 'bg-slate-200 text-slate-800';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Title */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-900 sm:text-2xl">
              Campus Asset Registry & Health Dashboard
            </h1>
            <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-bold text-indigo-700">
              MERN Stack
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Real-time condition telemetry, health distribution, and failure risks across university facilities.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setRefreshing(true);
              fetchData();
            }}
            disabled={refreshing}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs transition"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin text-indigo-600' : 'text-slate-400'}`} />
            <span>Refresh</span>
          </button>

          <Link
            to="/failure-risk"
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700 transition"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>AI Risk Analyzer</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Grid */}
      {stats && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Total Monitored Assets</span>
              <Layers className="h-4 w-4 text-indigo-600" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900">{stats.total}</span>
              <span className="text-[11px] font-medium text-emerald-600">6 Domain Sectors</span>
            </div>
            <div className="mt-2 text-[11px] text-slate-400">
              Classrooms, Labs, Libraries, Hostels, IT
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Healthy Assets (&ge;80)</span>
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-emerald-600">{stats.healthy}</span>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                {stats.healthyPercent}%
              </span>
            </div>
            <div className="mt-2 flex h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div className="bg-emerald-500" style={{ width: `${stats.healthyPercent}%` }} />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">Degraded / Warning</span>
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-amber-600">{stats.warning}</span>
              <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                {stats.warningPercent}%
              </span>
            </div>
            <div className="mt-2 flex h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
              <div className="bg-amber-500" style={{ width: `${stats.warningPercent}%` }} />
            </div>
          </div>

          <div className="rounded-2xl border border-rose-200 bg-rose-50/40 p-4 shadow-xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-700">Critical Failure Risks</span>
              <ShieldAlert className="h-4 w-4 text-rose-600 animate-pulse" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-rose-600">{stats.critical}</span>
              <span className="text-[11px] font-bold text-rose-800 bg-rose-100 px-1.5 py-0.5 rounded">
                {stats.anomalies} Telemetry Anomalies
              </span>
            </div>
            <div className="mt-2 text-[11px] text-rose-700 font-medium">
              Requires immediate inspection sign-off
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          {/* Category Tabs */}
          <div className="flex flex-wrap gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                  category === cat
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat === 'All' ? 'All Domains' : cat}
              </button>
            ))}
          </div>

          {/* Search & View Switcher */}
          <div className="flex items-center gap-2">
            <form onSubmit={handleSearchSubmit} className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search asset, code, owner..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-3 py-1.5 text-xs focus:border-indigo-500 focus:bg-white focus:outline-none"
              />
            </form>

            <div className="flex rounded-xl border border-slate-200 bg-slate-50 p-0.5">
              <button
                onClick={() => setViewMode('grid')}
                className={`rounded-lg p-1.5 transition ${
                  viewMode === 'grid' ? 'bg-white shadow-xs text-indigo-600' : 'text-slate-400 hover:text-slate-700'
                }`}
                title="Grid Cards View"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`rounded-lg p-1.5 transition ${
                  viewMode === 'table' ? 'bg-white shadow-xs text-indigo-600' : 'text-slate-400 hover:text-slate-700'
                }`}
                title="Table View"
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Secondary Filters */}
        <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-slate-100 pt-3 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <Filter className="h-3 w-3 text-slate-400" />
            <span className="font-semibold text-slate-700">Criticality:</span>
            <select
              value={criticality}
              onChange={(e) => setCriticality(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 focus:outline-none"
            >
              {criticalityTiers.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-700">Status:</span>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 focus:outline-none"
            >
              {statusOptions.map((s) => (
                <option key={s} value={s}>
                  {s.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>

          <div className="ml-auto text-[11px] text-slate-400">
            Showing <strong className="text-slate-700">{assets.length}</strong> university assets
          </div>
        </div>
      </div>

      {/* Content Rendering: Grid vs Table */}
      {loading ? (
        <div className="flex h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white">
          <div className="flex flex-col items-center gap-2 text-slate-400">
            <div className="h-6 w-6 border-2 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
            <span className="text-xs">Loading campus registry data...</span>
          </div>
        </div>
      ) : assets.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
          <Building className="h-10 w-10 text-slate-300" />
          <h3 className="mt-3 text-sm font-bold text-slate-800">No assets found</h3>
          <p className="mt-1 text-xs text-slate-400">Try adjusting your filters or search keywords.</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {assets.map((asset) => {
            const healthBadge = getHealthBadge(asset.healthScore);
            return (
              <div
                key={asset._id}
                className="group flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition-all hover:-translate-y-0.5 hover:shadow-md hover:border-indigo-300"
              >
                <div>
                  {/* Top Bar: Code & Health */}
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200/60 rounded px-2 py-0.5">
                      {asset.assetCode}
                    </span>
                    <span
                      className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${healthBadge.bg}`}
                    >
                      {healthBadge.label} ({asset.healthScore}/100)
                    </span>
                  </div>

                  {/* Asset Name & Type */}
                  <h3 className="mt-3 text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition">
                    <Link to={`/assets/${asset._id}`}>{asset.name}</Link>
                  </h3>
                  <div className="text-xs text-slate-400 mt-0.5">{asset.type}</div>

                  {/* Location & Department */}
                  <div className="mt-4 space-y-1.5 border-t border-slate-100 pt-3 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Building className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">
                        {asset.location?.building} &bull; {asset.location?.room}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <span className="h-1.5 w-1.5 rounded-full bg-slate-300 shrink-0" />
                      <span className="truncate">{asset.departmentOwner}</span>
                    </div>
                  </div>

                  {/* Telemetry preview */}
                  {asset.recentTelemetrySummary && (
                    <div className="mt-3 grid grid-cols-2 gap-2 rounded-xl bg-slate-50 p-2.5 text-[11px]">
                      <div>
                        <span className="text-slate-400">Vibration:</span>{' '}
                        <strong
                          className={
                            asset.recentTelemetrySummary.vibration > 0.35 ? 'text-rose-600' : 'text-slate-700'
                          }
                        >
                          {asset.recentTelemetrySummary.vibration} mm/s
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-400">Temp:</span>{' '}
                        <strong
                          className={
                            asset.recentTelemetrySummary.temperature > 50 ? 'text-rose-600' : 'text-slate-700'
                          }
                        >
                          {asset.recentTelemetrySummary.temperature}°C
                        </strong>
                      </div>
                    </div>
                  )}

                  {/* Anomaly banner if detected */}
                  {asset.failureRisk?.anomalyDetected && (
                    <div className="mt-3 flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-[11px] font-semibold text-rose-700">
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                      <span>RUL: {asset.failureRisk.predictedRulDays} days remaining</span>
                    </div>
                  )}
                </div>

                {/* Footer Actions */}
                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                  <span className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${getStatusBadge(asset.status)}`}>
                    {asset.status.replace('_', ' ')}
                  </span>
                  <Link
                    to={`/assets/${asset._id}`}
                    className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800"
                  >
                    <span>View Telemetry</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Dense Table View */
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Code / Asset Name</th>
                  <th className="px-4 py-3">Domain</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Criticality</th>
                  <th className="px-4 py-3">Health Score</th>
                  <th className="px-4 py-3">RUL Estimate</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {assets.map((asset) => {
                  const badge = getHealthBadge(asset.healthScore);
                  return (
                    <tr key={asset._id} className="hover:bg-slate-50/80 transition">
                      <td className="px-4 py-3.5">
                        <Link to={`/assets/${asset._id}`} className="font-bold text-slate-900 hover:text-indigo-600">
                          {asset.name}
                        </Link>
                        <div className="font-mono text-[10px] text-slate-400">{asset.assetCode}</div>
                      </td>
                      <td className="px-4 py-3.5 font-medium">{asset.category}</td>
                      <td className="px-4 py-3.5 text-slate-500">
                        {asset.location?.building} ({asset.location?.room})
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                            asset.criticality === 'Critical'
                              ? 'bg-rose-100 text-rose-800'
                              : asset.criticality === 'High'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {asset.criticality}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 rounded-full bg-slate-100 overflow-hidden">
                            <div
                              className={`h-full ${
                                asset.healthScore >= 80 ? 'bg-emerald-500' : asset.healthScore >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                              }`}
                              style={{ width: `${asset.healthScore}%` }}
                            />
                          </div>
                          <span className="font-bold">{asset.healthScore}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        {asset.failureRisk?.predictedRulDays ? (
                          <span
                            className={
                              asset.failureRisk.predictedRulDays < 15
                                ? 'font-bold text-rose-600'
                                : 'text-slate-600'
                            }
                          >
                            {asset.failureRisk.predictedRulDays} days
                          </span>
                        ) : (
                          <span className="text-slate-400">N/A</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${getStatusBadge(asset.status)}`}>
                          {asset.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <Link
                          to={`/assets/${asset._id}`}
                          className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-bold text-indigo-600 hover:bg-slate-50"
                        >
                          Inspect &rarr;
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

