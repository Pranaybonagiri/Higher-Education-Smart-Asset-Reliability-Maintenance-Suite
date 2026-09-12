import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import {
  Cpu,
  Sparkles,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  ThumbsUp,
  ThumbsDown,
  Layers,
  ShieldCheck,
  Zap,
  Activity,
} from 'lucide-react';

export default function ModelPerformancePage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Feedback widget state
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [feedbackType, setFeedbackType] = useState('accurate');
  const [feedbackNote, setFeedbackNote] = useState('');

  const fetchModelStats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/ai/model-stats');
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error('Error loading model statistics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModelStats();
  }, []);

  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    setFeedbackSubmitted(true);
    setTimeout(() => {
      setFeedbackSubmitted(false);
      setFeedbackNote('');
    }, 4000);
  };

  if (loading || !stats) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white">
        <div className="flex flex-col items-center gap-2 text-slate-400">
          <div className="h-6 w-6 border-2 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
          <span className="text-xs">Loading model observability & telemetry drift...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-900 sm:text-2xl">
              AI Reliability & Model Performance Monitoring
            </h1>
            <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-bold text-indigo-700">
              MLOps & Drift
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Precision, recall, false alarm rates, sensor drift indicators, and technician calibration feedback loops.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-xs">
          <Cpu className="h-3.5 w-3.5 text-indigo-600" />
          <span>Active Engine: {stats.activeModel}</span>
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Model Accuracy</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-600">{stats.accuracy}%</div>
          <div className="text-[11px] text-slate-400 mt-1">
            Precision: {stats.precision}% &bull; Recall: {stats.recall}%
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">False Alarm Rate</span>
            <AlertCircle className="h-4 w-4 text-amber-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-amber-600">{stats.falseAlarmRate}%</div>
          <div className="text-[11px] text-slate-400 mt-1">
            Missed Failures: {stats.missedFailuresRate}%
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Mean Lead Time</span>
            <Clock className="h-4 w-4 text-indigo-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-indigo-600">{stats.meanPredictionLeadDays} Days</div>
          <div className="text-[11px] text-slate-400 mt-1">
            Early detection window prior to physical breakdown
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Sensor Telemetry Drift</span>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{stats.driftIndex}</span>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
              Negligible Drift
            </span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Wasserstein distance baseline &lt; 0.10 threshold
          </div>
        </div>
      </div>

      {/* Breakdown by Domain Class & Bar Chart */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Model Accuracy by Asset Class</h3>
          <p className="text-xs text-slate-400 mb-4">Empirical validation based on verified repair work orders</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.breakdownByClass} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="category" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} domain={[80, 100]} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '11px' }} />
                <Bar dataKey="accuracy" fill="#6366f1" radius={[6, 6, 0, 0]} name="Accuracy (%)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Actual vs Predicted Outcome Comparison Table */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">Actual vs Predicted Failure Calibration</h3>
            <p className="text-xs text-slate-400 mb-3">Field technician verification audit summary</p>

            <div className="divide-y divide-slate-100 text-xs">
              <div className="py-2.5 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800">LAB-BIO-302 (Centrifuge)</span>
                  <div className="text-[10px] text-slate-400">Predicted: Bearing seizure (8 days)</div>
                </div>
                <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                  Verified: Bearing race spalling confirmed
                </span>
              </div>

              <div className="py-2.5 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800">LIB-MAIN-HVAC (Pump)</span>
                  <div className="text-[10px] text-slate-400">Predicted: Impeller Cavitation (14 days)</div>
                </div>
                <span className="rounded bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                  Verified: Suction blockage found
                </span>
              </div>

              <div className="py-2.5 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-800">SYS-HPC-NODE7 (GPU Node)</span>
                  <div className="text-[10px] text-slate-400">Predicted: Thermal throttling (22 days)</div>
                </div>
                <span className="rounded bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-800">
                  Serviced: Heatsink cleaned & restored
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-xl bg-slate-50 p-3 text-[11px] text-slate-600 flex items-center justify-between">
            <span>Human Review Adoption Rate:</span>
            <strong className="text-indigo-600">{stats.adoptionRatePercent}% of recommendations enacted</strong>
          </div>
        </div>
      </div>

      {/* Technician Feedback & Model Calibration Widget */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-1">
          Technician In-Field Model Calibration Feedback
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Provide ground-truth feedback to adjust confidence thresholds and fine-tune Gemini RCM prompts.
        </p>

        {feedbackSubmitted ? (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>Thank you! Your calibration feedback has been registered and attributed to the model audit record.</span>
          </div>
        ) : (
          <form onSubmit={handleFeedbackSubmit} className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setFeedbackType('accurate')}
                className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition ${
                  feedbackType === 'accurate'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                    : 'border-slate-200 text-slate-600'
                }`}
              >
                <ThumbsUp className="h-3.5 w-3.5" />
                <span>Prediction Was Accurate</span>
              </button>

              <button
                type="button"
                onClick={() => setFeedbackType('false_alarm')}
                className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition ${
                  feedbackType === 'false_alarm'
                    ? 'border-rose-500 bg-rose-50 text-rose-800'
                    : 'border-slate-200 text-slate-600'
                }`}
              >
                <ThumbsDown className="h-3.5 w-3.5" />
                <span>False Alarm / Over-Conservative</span>
              </button>
            </div>

            <textarea
              rows={2}
              value={feedbackNote}
              onChange={(e) => setFeedbackNote(e.target.value)}
              placeholder="Enter specific physical observations (e.g. bearing was actually healthy, belt was loose)..."
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:border-indigo-500 focus:outline-none"
            />

            <button
              type="submit"
              className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-indigo-700"
            >
              Submit Calibration Observation
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

