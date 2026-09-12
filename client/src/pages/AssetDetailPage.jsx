import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import {
  Building,
  Activity,
  Wrench,
  Clock,
  ShieldAlert,
  Sparkles,
  ArrowLeft,
  Calendar,
  Layers,
  Package,
  FileText,
  AlertTriangle,
  CheckCircle,
  Plus,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';

export default function AssetDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [asset, setAsset] = useState(null);
  const [telemetry, setTelemetry] = useState([]);
  const [workOrders, setWorkOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiRunning, setAiRunning] = useState(false);
  const [aiResult, setAiResult] = useState(null);

  // Tab: 'telemetry' | 'components' | 'parts' | 'workorders' | 'evidence'
  const [activeTab, setActiveTab] = useState('telemetry');

  const fetchAssetDetails = async () => {
    try {
      setLoading(true);
      const [assetRes, telemetryRes] = await Promise.all([
        api.get(`/assets/${id}`),
        api.get(`/assets/${id}/telemetry`),
      ]);

      if (assetRes.data.success) {
        setAsset(assetRes.data.data.asset);
        setWorkOrders(assetRes.data.data.workOrders || []);
      }
      if (telemetryRes.data.success) {
        // Format timestamps for recharts
        const formatted = (telemetryRes.data.data.readings || []).map((r) => ({
          ...r,
          formattedTime: new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }));
        setTelemetry(formatted);
      }
    } catch (err) {
      console.error('Error fetching asset details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssetDetails();
  }, [id]);

  const triggerAIEvaluation = async () => {
    try {
      setAiRunning(true);
      const res = await api.post(`/ai/predict-failure/${id}`);
      if (res.data.success) {
        setAiResult(res.data.data.evaluation);
        fetchAssetDetails();
      }
    } catch (err) {
      console.error('AI evaluation failed:', err);
    } finally {
      setAiRunning(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-2 text-slate-400">
          <div className="h-7 w-7 border-2 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
          <span className="text-xs">Loading asset telemetry and history...</span>
        </div>
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
        <AlertTriangle className="mx-auto h-10 w-10 text-amber-500" />
        <h2 className="mt-3 text-base font-bold text-slate-900">Asset Record Not Found</h2>
        <Link to="/assets" className="mt-4 inline-block text-xs font-bold text-indigo-600 hover:underline">
          &larr; Return to Asset Registry
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back link & Top bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/assets"
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 transition"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                {asset.assetCode}
              </span>
              <span className="text-xs font-semibold text-slate-400">{asset.category} &bull; {asset.type}</span>
            </div>
            <h1 className="mt-1 text-xl font-extrabold text-slate-900 sm:text-2xl">{asset.name}</h1>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={triggerAIEvaluation}
            disabled={aiRunning}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-indigo-600/20 hover:from-indigo-700 hover:to-indigo-800 disabled:opacity-50 transition"
          >
            <Sparkles className={`h-3.5 w-3.5 ${aiRunning ? 'animate-spin' : ''}`} />
            <span>{aiRunning ? 'Evaluating with Gemini...' : 'Run On-Demand AI Assessment'}</span>
          </button>
        </div>
      </div>

      {/* AI Anomaly Result Banner (if just evaluated or existing alert) */}
      {(aiResult || asset.failureRisk?.anomalyDetected) && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50/70 p-4 text-xs text-rose-900 shadow-xs animate-in fade-in">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-3">
              <ShieldAlert className="h-5 w-5 text-rose-600 mt-0.5 shrink-0" />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-rose-900 text-sm">
                    AI Predictive Failure Alert: {aiResult?.riskLevel || asset.failureRisk?.level} Risk Detected
                  </h3>
                  <span className="rounded bg-rose-200/80 px-2 py-0.5 font-mono text-[10px] font-bold text-rose-900">
                    Confidence: {Math.round((aiResult?.confidenceScore || asset.failureRisk?.modelConfidence || 0.9) * 100)}%
                  </span>
                </div>
                <p className="mt-1 text-xs text-rose-800 leading-relaxed">
                  {aiResult?.conciseExplanation || asset.notes || 'Sensor harmonics identify critical bearing / thermal degradation.'}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] font-medium text-rose-700">
                  <span>Estimated RUL: <strong>{aiResult?.predictedRulDays || asset.failureRisk?.predictedRulDays} Days</strong></span>
                  <span>&bull;</span>
                  <span>Recommended Action: <strong>{aiResult?.recommendedAction || 'Replace bearing unit'}</strong></span>
                </div>
              </div>
            </div>
            <Link
              to="/recommendations"
              className="inline-flex items-center gap-1 self-start rounded-xl bg-rose-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-rose-700 shadow-xs"
            >
              <span>Review Recommendation</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* Metadata & Specs Grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400">Health Index</span>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span
              className={`text-xl font-black ${
                asset.healthScore >= 80 ? 'text-emerald-600' : asset.healthScore >= 50 ? 'text-amber-600' : 'text-rose-600'
              }`}
            >
              {asset.healthScore}/100
            </span>
          </div>
          <div className="mt-1 text-[10px] text-slate-500">Continuous Telemetry</div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400">Location</span>
          <div className="mt-1 text-xs font-bold text-slate-800 truncate">{asset.location?.building}</div>
          <div className="text-[10px] text-slate-500">{asset.location?.room}</div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400">Department Owner</span>
          <div className="mt-1 text-xs font-bold text-slate-800 truncate">{asset.departmentOwner}</div>
          <div className="text-[10px] text-slate-500">Custodian: {asset.custodian || 'Facilities'}</div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400">Cumulative Runtime</span>
          <div className="mt-1 text-xs font-bold text-slate-800">{asset.runtimeHours?.toLocaleString()} hrs</div>
          <div className="text-[10px] text-slate-500">Service Life Metric</div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400">Criticality Tier</span>
          <div className="mt-1">
            <span
              className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                asset.criticality === 'Critical'
                  ? 'bg-rose-100 text-rose-800'
                  : asset.criticality === 'High'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              {asset.criticality} Priority
            </span>
          </div>
          <div className="mt-1 text-[10px] text-slate-500">Impacts Academic Sched</div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-400">SLA & Vendor</span>
          <div className="mt-1 text-xs font-bold text-slate-800 truncate">{asset.vendor?.name || 'Siemens'}</div>
          <div className="text-[10px] text-slate-500">{asset.vendor?.slaHours || 24}h SLA tier</div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-slate-200">
        <div className="flex gap-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('telemetry')}
            className={`flex items-center gap-2 border-b-2 pb-3 transition ${
              activeTab === 'telemetry'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Activity className="h-4 w-4" />
            <span>IoT Sensor Telemetry ({telemetry.length} points)</span>
          </button>

          <button
            onClick={() => setActiveTab('components')}
            className={`flex items-center gap-2 border-b-2 pb-3 transition ${
              activeTab === 'components'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="h-4 w-4" />
            <span>Sub-Components ({asset.components?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('parts')}
            className={`flex items-center gap-2 border-b-2 pb-3 transition ${
              activeTab === 'parts'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Package className="h-4 w-4" />
            <span>Spare Parts Inventory ({asset.spareParts?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('workorders')}
            className={`flex items-center gap-2 border-b-2 pb-3 transition ${
              activeTab === 'workorders'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Wrench className="h-4 w-4" />
            <span>Work Orders ({workOrders.length})</span>
          </button>
        </div>
      </div>

      {/* Tab 1: IoT Sensor Telemetry Charts */}
      {activeTab === 'telemetry' && (
        <div className="space-y-6">
          {/* Chart 1: Vibration Velocity */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Mechanical Vibration Velocity (ISO 10816 Class II)
                </h3>
                <p className="text-xs text-slate-400">
                  Warning threshold: 0.35 mm/s RMS. Measured via triaxial piezoelectric accelerometer.
                </p>
              </div>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
                Units: mm/s RMS
              </span>
            </div>

            <div className="mt-4 h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={telemetry} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="formattedTime" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 'dataMax + 0.1']} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                  />
                  <ReferenceLine
                    y={0.35}
                    label={{ value: 'ISO 10816 Warning (0.35 mm/s)', fill: '#ef4444', fontSize: 10 }}
                    stroke="#ef4444"
                    strokeDasharray="4 4"
                  />
                  <Line
                    type="monotone"
                    dataKey="vibration"
                    stroke="#6366f1"
                    strokeWidth={2.5}
                    dot={{ r: 2, fill: '#6366f1' }}
                    activeDot={{ r: 5 }}
                    name="Vibration (mm/s)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Temperature & Power Draw Dual Chart */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900">Operating Temperature Gradient</h3>
              <p className="text-xs text-slate-400">Critical thermal ceiling: 50.0°C</p>
              <div className="mt-4 h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={telemetry}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="formattedTime" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} domain={[15, 75]} />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '11px' }} />
                    <ReferenceLine y={50} stroke="#f97316" strokeDasharray="3 3" label={{ value: 'Alert Limit 50°C', fill: '#f97316', fontSize: 9 }} />
                    <Line type="monotone" dataKey="temperature" stroke="#f43f5e" strokeWidth={2} dot={false} name="Temp (°C)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900">Acoustic Noise & Power Draw</h3>
              <p className="text-xs text-slate-400">Cavitation and motor current draw signatures</p>
              <div className="mt-4 h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={telemetry}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="formattedTime" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '11px' }} />
                    <Line type="monotone" dataKey="noiseDb" stroke="#0ea5e9" strokeWidth={2} dot={false} name="Noise (dB)" />
                    <Line type="monotone" dataKey="powerDrawKw" stroke="#10b981" strokeWidth={2} dot={false} name="Power (kW)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Sub-Components */}
      {activeTab === 'components' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-3">Critical Sub-Assembly Components</h3>
          {asset.components?.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {asset.components.map((comp, idx) => (
                <div key={idx} className="flex items-center justify-between py-3 text-xs">
                  <div>
                    <span className="font-bold text-slate-800">{comp.name}</span>
                    <div className="font-mono text-[10px] text-slate-400">{comp.partCode || 'OEM Standard'}</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                        comp.condition === 'Optimal'
                          ? 'bg-emerald-100 text-emerald-800'
                          : comp.condition === 'Fair'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-rose-100 text-rose-800 animate-pulse'
                      }`}
                    >
                      {comp.condition}
                    </span>
                    <span className="font-bold text-slate-700">{comp.healthScore}% health</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400">No modular sub-components registered.</p>
          )}
        </div>
      )}

      {/* Tab 3: Spare Parts */}
      {activeTab === 'parts' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-3">Linked Spare Parts in Campus Central Stores</h3>
          {asset.spareParts?.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {asset.spareParts.map((part, idx) => (
                <div key={idx} className="flex items-center justify-between py-3 text-xs">
                  <div>
                    <span className="font-bold text-slate-800">{part.name}</span>
                    <div className="font-mono text-[10px] text-slate-400">Part #{part.partCode}</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-slate-800">${part.costPerUnit} / unit</span>
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                        part.inStock <= part.reorderLevel
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {part.inStock} in stock (Reorder: {part.reorderLevel})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400">No spare parts catalog linked to this asset class.</p>
          )}
        </div>
      )}

      {/* Tab 4: Work Orders */}
      {activeTab === 'workorders' && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-900">Maintenance History & Active Work Orders</h3>
            <Link
              to="/planning"
              className="rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700 hover:bg-indigo-100"
            >
              Open Planning Board &rarr;
            </Link>
          </div>
          {workOrders.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {workOrders.map((wo) => (
                <div key={wo._id} className="py-3.5 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-indigo-600">{wo.orderCode}</span>
                      <span className="font-bold text-slate-900">{wo.title}</span>
                    </div>
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-700">
                      {wo.status}
                    </span>
                  </div>
                  <p className="mt-1 text-slate-500 leading-relaxed text-[11px]">{wo.description}</p>
                  <div className="mt-2 flex items-center gap-4 text-[10px] text-slate-400">
                    <span>Priority: <strong className="text-slate-700">{wo.priority}</strong></span>
                    <span>Assigned: <strong className="text-slate-700">{wo.assignedTechnicianName}</strong></span>
                    <span>Date: {new Date(wo.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400">No work orders recorded for this asset.</p>
          )}
        </div>
      )}
    </div>
  );
}

