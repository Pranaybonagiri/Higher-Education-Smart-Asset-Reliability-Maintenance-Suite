import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  BarChart3,
  Download,
  FileText,
  Calendar,
  DollarSign,
  Clock,
  ShieldCheck,
  TrendingDown,
  Printer,
  CheckCircle,
  FileSpreadsheet,
} from 'lucide-react';

export default function ReportsAnalyticsPage() {
  const [data, setData] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [dateRange, setDateRange] = useState('Last30Days');

  const fetchReportsData = async () => {
    try {
      setLoading(true);
      const [analyticsRes, historyRes] = await Promise.all([
        api.get('/reports/analytics'),
        api.get('/reports/history'),
      ]);

      if (analyticsRes.data.success) {
        setData(analyticsRes.data.data);
      }
      if (historyRes.data.success) {
        setHistory(historyRes.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load reports data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportsData();
  }, [dateRange]);

  const handleCsvExport = async () => {
    try {
      setExporting(true);
      const res = await api.post(
        '/reports/export',
        { format: 'csv', reportType: 'AssetHealth_Detailed', dateRange },
        { responseType: 'blob' }
      );

      // Create download link
      const blob = new Blob([res.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Campus_Asset_Reliability_${Date.now()}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      fetchReportsData();
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setExporting(false);
    }
  };

  const handlePrintPdf = () => {
    window.print();
  };

  if (loading || !data) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white">
        <div className="flex flex-col items-center gap-2 text-slate-400">
          <div className="h-6 w-6 border-2 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
          <span className="text-xs">Compiling university reliability reports...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between no-print">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 sm:text-2xl">
            Reports & Higher Education Downtime Analytics
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Operational impact analysis, avoided classroom disruptions, MTBF/MTTR metrics, and compliance exports.
          </p>
        </div>

        {/* Date Selector & Export Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-xs focus:outline-none"
          >
            <option value="Last30Days">Last 30 Days</option>
            <option value="LastQuarter">Current Semester (Q1)</option>
            <option value="AcademicYear">Academic Year 2025-2026</option>
          </select>

          <button
            onClick={handleCsvExport}
            disabled={exporting}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-xs transition"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600" />
            <span>{exporting ? 'Exporting...' : 'Export CSV'}</span>
          </button>

          <button
            onClick={handlePrintPdf}
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700 transition"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Print / Save PDF</span>
          </button>
        </div>
      </div>

      {/* KPI Cards: University Savings & Uptime */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-400">Campus Equipment Uptime</span>
          <div className="mt-2 text-2xl font-black text-emerald-600">
            {data.kpis?.overallAvailabilityPercent}%
          </div>
          <div className="mt-1 text-[11px] text-slate-500">Target &ge;99.0% SLA</div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-400">Avoided Downtime</span>
          <div className="mt-2 text-2xl font-black text-indigo-600">
            {data.kpis?.annualAvoidedDowntimeHours} hrs
          </div>
          <div className="mt-1 text-[11px] text-slate-500">Lectures & experiments saved</div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-400">Avoided Emergency Costs</span>
          <div className="mt-2 text-2xl font-black text-emerald-600">
            ${data.kpis?.totalCostSavingsUsd?.toLocaleString()}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">AI Predictive vs Emergency Repair</div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-400">Active Work Orders</span>
          <div className="mt-2 text-2xl font-black text-slate-900">{data.kpis?.openOrders}</div>
          <div className="mt-1 text-[11px] text-slate-500">{data.kpis?.criticalAssets} Critical assets</div>
        </div>
      </div>

      {/* Charts Row 1: MTBF vs MTTR and Monthly Costs */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">MTBF & MTTR Reliability Trends</h3>
              <p className="text-xs text-slate-400">Mean Time Between Failures (hrs) vs Mean Time to Repair (hrs)</p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.reliabilityTrends} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '11px' }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Line type="monotone" dataKey="mtbfHours" stroke="#6366f1" strokeWidth={2.5} name="MTBF (Hours)" />
                <Line type="monotone" dataKey="mttrHours" stroke="#10b981" strokeWidth={2.5} name="MTTR (Hours)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Monthly Downtime Hours & Expenditures</h3>
              <p className="text-xs text-slate-400">Correlating reduced emergency downtime with operational spend</p>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.reliabilityTrends} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '11px' }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Bar dataKey="downtimeHours" fill="#f43f5e" radius={[4, 4, 0, 0]} name="Downtime (Hours)" />
                <Bar dataKey="costUsd" fill="#0ea5e9" radius={[4, 4, 0, 0]} name="Maintenance Cost ($)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Departmental Operational Impact Table */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-1">Downtime & Academic Impact by Faculty</h3>
        <p className="text-xs text-slate-400 mb-4">Teaching lecture hours preserved and cost savings per faculty</p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Academic Department / Zone</th>
                <th className="px-4 py-3">Scheduled Servicing</th>
                <th className="px-4 py-3">Unscheduled Downtime</th>
                <th className="px-4 py-3">Lecture Hours Interrupted</th>
                <th className="px-4 py-3 text-right">Avoided Cost ($)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.departmentImpact?.map((dept, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80">
                  <td className="px-4 py-3 font-bold text-slate-900">{dept.department}</td>
                  <td className="px-4 py-3 text-slate-600">{dept.scheduledDowntime} hrs</td>
                  <td className="px-4 py-3 font-semibold text-rose-600">{dept.unscheduledDowntime} hrs</td>
                  <td className="px-4 py-3">
                    {dept.affectedLectureHours === 0 ? (
                      <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                        0 hrs (Preserved)
                      </span>
                    ) : (
                      <span className="rounded bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                        {dept.affectedLectureHours} hrs
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-emerald-600">
                    +${dept.avoidedCost?.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Generated Report Export History */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs no-print">
        <h3 className="text-sm font-bold text-slate-900 mb-1">Generated Report Export Archive</h3>
        <p className="text-xs text-slate-400 mb-3">Download past scheduled audit and compliance files</p>

        <div className="divide-y divide-slate-100 text-xs">
          {history.map((rep) => (
            <div key={rep.id} className="flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-indigo-600 shrink-0" />
                <div>
                  <div className="font-bold text-slate-800">{rep.title}</div>
                  <div className="text-[11px] text-slate-400">
                    Format: {rep.format} &bull; Generated by {rep.generatedBy} on{' '}
                    {new Date(rep.generatedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <span className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-bold text-slate-700">
                {rep.fileSize}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

