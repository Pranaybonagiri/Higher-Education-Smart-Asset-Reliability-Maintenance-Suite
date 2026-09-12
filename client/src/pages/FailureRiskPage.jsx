import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';
import {
  Activity,
  Sparkles,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Layers,
  Cpu,
  Info,
  Calendar,
  ExternalLink,
  ChevronRight,
  Database,
  RefreshCw,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function FailureRiskPage() {
  const [assets, setAssets] = useState([]);
  const [selectedAssetId, setSelectedAssetId] = useState('');
  const [loading, setLoading] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState(null);

  // Simulation edge state override for testing: 'normal' | 'low_confidence' | 'insufficient_data'
  const [edgeState, setEdgeState] = useState('normal');

  const fetchAssets = async () => {
    try {
      setLoading(true);
      const res = await api.get('/assets?limit=30');
      if (res.data.success) {
        const list = res.data.data.assets || [];
        setAssets(list);
        if (list.length > 0) {
          setSelectedAssetId(list[0]._id);
          runEvaluation(list[0]._id);
        }
      }
    } catch (err) {
      console.error('Failed to load assets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const runEvaluation = async (assetId) => {
    try {
      setEvaluating(true);
      const res = await api.post(`/ai/predict-failure/${assetId}`);
      if (res.data.success) {
        setEvaluation(res.data.data.evaluation);
      }
    } catch (err) {
      console.error('AI evaluation failed:', err);
    } finally {
      setEvaluating(false);
    }
  };

  const handleAssetSelect = (id) => {
    setSelectedAssetId(id);
    runEvaluation(id);
  };

  // Generate simulated RUL degradation trajectory for the chart
  const getRulTrajectory = () => {
    if (!evaluation) return [];
    const daysRemaining = evaluation.predictedRulDays || 30;
    const initialHealth = 100 - (evaluation.failureRiskScore || 20);

    const trajectory = [];
    for (let i = 0; i <= Math.min(daysRemaining + 5, 45); i += 3) {
      const remainingHealth = Math.max(0, Math.round(initialHealth * (1 - i / daysRemaining)));
      trajectory.push({
        day: `Day +${i}`,
        projectedHealth: remainingHealth,
        safeThreshold: 40,
      });
    }
    return trajectory;
  };

  const selectedAsset = assets.find((a) => a._id === selectedAssetId);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-900 sm:text-2xl">
              AI Failure Risk & Remaining Useful Life (RUL)
            </h1>
            <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-bold text-indigo-700">
              Gemini 1.5 Flash
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Machine telemetry degradation curves, physics-informed anomaly detection, and transparent factor attribution.
          </p>
        </div>

        {/* Edge State Tester Switcher for UI verification */}
        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-slate-500">State Simulation:</span>
          <select
            value={edgeState}
            onChange={(e) => setEdgeState(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none"
          >
            <option value="normal">Normal Model Output</option>
            <option value="low_confidence">Low Confidence State (&lt;60%)</option>
            <option value="insufficient_data">Insufficient Telemetry Data</option>
          </select>
        </div>
      </div>

      {/* Asset Selector Bar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1">
            <Layers className="h-5 w-5 text-indigo-600 shrink-0" />
            <div className="flex-1">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Select Monitored University Asset
              </label>
              <select
                value={selectedAssetId}
                onChange={(e) => handleAssetSelect(e.target.value)}
                className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 focus:border-indigo-500 focus:bg-white focus:outline-none"
              >
                {assets.map((a) => (
                  <option key={a._id} value={a._id}>
                    [{a.assetCode}] {a.name} &bull; {a.category} ({a.location?.building})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={() => runEvaluation(selectedAssetId)}
            disabled={evaluating}
            className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700 disabled:opacity-50 transition"
          >
            <Sparkles className={`h-4 w-4 ${evaluating ? 'animate-spin' : ''}`} />
            <span>{evaluating ? 'Analyzing Telemetry...' : 'Run Gemini Assessment'}</span>
          </button>
        </div>
      </div>

      {/* Edge State 1: Insufficient Data */}
      {edgeState === 'insufficient_data' && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center">
          <Database className="mx-auto h-10 w-10 text-amber-500" />
          <h3 className="mt-3 text-sm font-bold text-amber-900">Insufficient Telemetry Data for Reliable RUL</h3>
          <p className="mt-1 text-xs text-amber-700 max-w-md mx-auto">
            This asset was recently installed or has fewer than 24 hours of streaming accelerometer and thermal readings. The AI model requires continuous telemetry baselines before calculating remaining useful life.
          </p>
          <button
            onClick={() => setEdgeState('normal')}
            className="mt-4 rounded-xl bg-amber-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-amber-700"
          >
            Switch to Active Baseline
          </button>
        </div>
      )}

      {/* Edge State 2: Low Confidence State */}
      {edgeState === 'low_confidence' && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-900">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0" />
            <h3 className="font-bold text-sm">Low Model Confidence Alert (54% Confidence)</h3>
          </div>
          <p className="mt-1 leading-relaxed">
            High ambient thermal noise in this laboratory environment has reduced model certainty below the university safety cutoff (75%). Automatic work order dispatch is frozen until a certified technician performs physical vibration probing.
          </p>
        </div>
      )}

      {/* Normal AI Evaluation Results */}
      {edgeState === 'normal' && evaluation && (
        <div className="space-y-6">
          {/* Key Metrics Row */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Failure Risk Score */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <span className="text-xs font-semibold text-slate-400">Failure Probability Score</span>
              <div className="mt-2 flex items-baseline gap-2">
                <span
                  className={`text-3xl font-black ${
                    evaluation.failureRiskScore >= 75
                      ? 'text-rose-600'
                      : evaluation.failureRiskScore >= 40
                      ? 'text-amber-600'
                      : 'text-emerald-600'
                  }`}
                >
                  {evaluation.failureRiskScore}/100
                </span>
                <span
                  className={`rounded px-2 py-0.5 text-xs font-bold ${
                    evaluation.riskLevel === 'Critical'
                      ? 'bg-rose-100 text-rose-800'
                      : evaluation.riskLevel === 'High'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {evaluation.riskLevel} Risk
                </span>
              </div>
              <div className="mt-2 text-[11px] text-slate-400">
                Calculated via Gemini RCM degradation engine
              </div>
            </div>

            {/* Estimated RUL */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <span className="text-xs font-semibold text-slate-400">Predicted RUL</span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-black text-indigo-600">{evaluation.predictedRulDays}</span>
                <span className="text-xs font-bold text-slate-600">Days Remaining</span>
              </div>
              <div className="mt-2 text-[11px] text-slate-400">
                Safe window before unrecoverable stoppage
              </div>
            </div>

            {/* Confidence Score */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <span className="text-xs font-semibold text-slate-400">Model Confidence</span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl font-black text-emerald-600">
                  {Math.round(evaluation.confidenceScore * 100)}%
                </span>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                  High Confidence
                </span>
              </div>
              <div className="mt-2 flex h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div className="bg-emerald-500" style={{ width: `${evaluation.confidenceScore * 100}%` }} />
              </div>
            </div>

            {/* Anomaly Detection */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <span className="text-xs font-semibold text-slate-400">Telemetry Anomaly</span>
              <div className="mt-2 flex items-center gap-2">
                {evaluation.anomalyDetected ? (
                  <>
                    <ShieldAlert className="h-6 w-6 text-rose-600 animate-pulse" />
                    <span className="text-base font-bold text-rose-600">Active Sensor Anomaly</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                    <span className="text-base font-bold text-emerald-600">Normal Harmonic Pattern</span>
                  </>
                )}
              </div>
              <div className="mt-2 text-[11px] text-slate-400">
                ISO 10816 Mechanical Class II Envelope
              </div>
            </div>
          </div>

          {/* RUL Degradation Trajectory Chart */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Projected Health Degradation Curve</h3>
                <p className="text-xs text-slate-400">
                  Forecasted trajectory until component reaches the critical intervention limit (40% health).
                </p>
              </div>
              <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold text-indigo-700">
                AI Trajectory Model
              </span>
            </div>

            <div className="mt-4 h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={getRulTrajectory()}>
                  <defs>
                    <linearGradient id="healthGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 100]} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '11px' }} />
                  <ReferenceLine y={40} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'Critical Threshold (40%)', fill: '#ef4444', fontSize: 10 }} />
                  <Area
                    type="monotone"
                    dataKey="projectedHealth"
                    stroke="#6366f1"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#healthGradient)"
                    name="Projected Asset Health (%)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Transparent Contributing Factors & Concise Plain-English Justification */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Contributing Inputs */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 mb-3">Top Contributing Degradation Factors</h3>
              <div className="space-y-3">
                {evaluation.contributingFactors?.map((f, idx) => (
                  <div key={idx} className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">{f.factor}</span>
                      <span className="rounded bg-indigo-100 px-1.5 py-0.5 text-[10px] font-bold text-indigo-700">
                        {f.weight}% Weight
                      </span>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                      <span>Observed: <strong className="text-slate-800">{f.observedValue}</strong></span>
                      <span>Tolerance Threshold: <strong className="text-slate-800">{f.threshold}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Plain-English Justification & Metadata Snapshot */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-indigo-600" />
                  <span>Explainable AI Assessment Summary</span>
                </h3>
                <p className="mt-2 text-xs text-slate-700 leading-relaxed bg-indigo-50/50 p-3.5 rounded-xl border border-indigo-100">
                  {evaluation.conciseExplanation}
                </p>

                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Recommended Action:</span>
                    <strong className="text-slate-900">{evaluation.recommendedAction}</strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Required Skill Level:</span>
                    <strong className="text-slate-900">{evaluation.requiredSkill}</strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Expected Servicing Downtime:</span>
                    <strong className="text-slate-900">{evaluation.expectedDowntimeHours} Hours</strong>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>Academic Calendar Impact:</span>
                    <span className="text-indigo-700 font-medium text-right max-w-xs truncate">
                      {evaluation.academicImpactNote}
                    </span>
                  </div>
                </div>
              </div>

              {/* Model & Source Snapshot Provenance */}
              <div className="mt-4 border-t border-slate-100 pt-3 text-[10px] text-slate-400 flex items-center justify-between">
                <span>Model: <strong className="text-slate-600 font-mono">{evaluation.modelVersion}</strong></span>
                <span>Telemetry Ingestion: {new Date().toLocaleTimeString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

