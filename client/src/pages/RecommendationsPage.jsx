import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  SlidersHorizontal,
  Clock,
  Wrench,
  Package,
  Building,
  AlertTriangle,
  FileCheck,
  ShieldCheck,
  User,
  X,
  ExternalLink,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function RecommendationsPage() {
  const { user } = useAuth();

  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [urgencyFilter, setUrgencyFilter] = useState('All');

  // Modal states
  const [activeModal, setActiveModal] = useState(null); // 'reject' | 'override' | null
  const [selectedRec, setSelectedRec] = useState(null);
  const [reason, setReason] = useState('');
  const [overrideData, setOverrideData] = useState({
    priority: 'P2-High',
    downtimeHours: 2.0,
    requiredSkill: 'Certified Facilities Tech',
    assignedTechnician: 'Elena Rostova',
  });
  const [submittingAction, setSubmittingAction] = useState(false);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/ai/recommendations?status=${statusFilter}&urgency=${urgencyFilter}`);
      if (res.data.success) {
        setRecommendations(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [statusFilter, urgencyFilter]);

  const handleAction = async (recId, actionType, customReason, customOverride) => {
    try {
      setSubmittingAction(true);
      await api.post(`/ai/recommendations/${recId}/action`, {
        action: actionType,
        reason: customReason || 'Approved as recommended by AI predictive model.',
        overrideData: customOverride || null,
      });

      setActiveModal(null);
      setSelectedRec(null);
      setReason('');
      fetchRecommendations();
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to process recommendation action');
    } finally {
      setSubmittingAction(false);
    }
  };

  const openModal = (type, rec) => {
    setSelectedRec(rec);
    setActiveModal(type);
    setReason('');
    if (type === 'override') {
      setOverrideData({
        priority: rec.urgency === 'Immediate' ? 'P1-Critical' : 'P2-High',
        downtimeHours: rec.expectedDowntimeHours || 2.0,
        requiredSkill: rec.requiredSkill || 'General Tech',
        assignedTechnician: 'Elena Rostova',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-900 sm:text-2xl">
              AI Predictive Maintenance Recommendations
            </h1>
            <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-bold text-indigo-700">
              Human-in-the-Loop
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Provisional AI suggestions requiring authorized facility manager approval, rejection, or override.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-xs">
        <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
          {['All', 'Pending_Review', 'Approved', 'Rejected', 'Overridden'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`rounded-xl px-3 py-1.5 transition ${
                statusFilter === st
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-slate-500">Urgency:</span>
          <select
            value={urgencyFilter}
            onChange={(e) => setUrgencyFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-2.5 py-1 text-xs text-slate-700 focus:outline-none"
          >
            <option value="All">All Urgencies</option>
            <option value="Immediate">Immediate</option>
            <option value="Within_7_Days">Within 7 Days</option>
            <option value="Next_Cycle">Next Cycle</option>
          </select>
        </div>
      </div>

      {/* Recommendations Cards List */}
      {loading ? (
        <div className="flex h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white">
          <div className="h-6 w-6 border-2 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
        </div>
      ) : recommendations.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center">
          <Sparkles className="h-10 w-10 text-slate-300" />
          <h3 className="mt-3 text-sm font-bold text-slate-800">No recommendations in this view</h3>
          <p className="mt-1 text-xs text-slate-400">All machine condition advisories have been addressed.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {recommendations.map((rec) => {
            const isPending = rec.status === 'Pending_Review';
            const isApproved = rec.status === 'Approved';
            const isRejected = rec.status === 'Rejected';
            const isOverridden = rec.status === 'Overridden';

            return (
              <div
                key={rec._id}
                className={`rounded-2xl border bg-white p-5 shadow-xs transition ${
                  isPending
                    ? 'border-indigo-200 ring-1 ring-indigo-500/10'
                    : isApproved
                    ? 'border-emerald-200'
                    : isRejected
                    ? 'border-rose-200 bg-rose-50/20'
                    : 'border-purple-200'
                }`}
              >
                {/* Header row: Code, Asset, Status Pill */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                      {rec.recommendationCode}
                    </span>
                    <span className="text-xs font-bold text-slate-800">
                      {rec.assetId?.name} ({rec.assetId?.assetCode})
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                        rec.urgency === 'Immediate'
                          ? 'bg-rose-100 text-rose-800 animate-pulse'
                          : rec.urgency === 'Within_7_Days'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {rec.urgency.replace('_', ' ')}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                        isPending
                          ? 'bg-indigo-100 text-indigo-800'
                          : isApproved
                          ? 'bg-emerald-100 text-emerald-800'
                          : isRejected
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}
                    >
                      {rec.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                {/* AI Recommendation Details */}
                <div className="mt-3">
                  <h3 className="text-sm font-bold text-slate-900">{rec.suggestedAction}</h3>
                  <p className="mt-1 text-xs text-slate-600 leading-relaxed">{rec.explanation}</p>

                  <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 rounded-xl bg-slate-50 p-3 text-xs">
                    <div>
                      <span className="text-slate-400 text-[11px]">Predicted RUL:</span>
                      <div className="font-bold text-indigo-700">{rec.rulEstimateDays} Days Remaining</div>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[11px]">Model Confidence:</span>
                      <div className="font-bold text-emerald-700">{Math.round(rec.confidence * 100)}% Certitude</div>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[11px]">Required Skill:</span>
                      <div className="font-bold text-slate-800 truncate">{rec.requiredSkill}</div>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[11px]">Est. Downtime:</span>
                      <div className="font-bold text-slate-800">{rec.expectedDowntimeHours} Hours</div>
                    </div>
                  </div>

                  {rec.academicImpactNote && (
                    <div className="mt-3 text-xs text-indigo-800 font-medium bg-indigo-50/60 p-2.5 rounded-xl border border-indigo-100">
                      <strong>Operational / Academic Impact:</strong> {rec.academicImpactNote}
                    </div>
                  )}

                  {/* Review Audit History if already processed */}
                  {rec.reviewDetails?.reviewedBy && (
                    <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
                      <div className="flex items-center justify-between font-bold text-slate-800">
                        <span>Decision Record: {rec.reviewDetails.actionTaken}</span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(rec.reviewDetails.reviewedAt).toLocaleString()}
                        </span>
                      </div>
                      <div className="mt-1 text-[11px]">
                        Reviewer: <strong>{rec.reviewDetails.reviewedBy}</strong> ({rec.reviewDetails.reviewerRole})
                      </div>
                      <div className="mt-1 text-[11px] italic">"{rec.reviewDetails.reason}"</div>
                      {rec.generatedWorkOrderId && (
                        <div className="mt-2 font-mono text-[11px] text-indigo-600 font-bold">
                          Linked Work Order: {rec.generatedWorkOrderId.orderCode}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* HITL Action Buttons (Active for Pending_Review) */}
                {isPending && (
                  <div className="mt-5 flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 pt-3">
                    <button
                      onClick={() => openModal('reject', rec)}
                      className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50/80 px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100 transition"
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      <span>Reject Recommendation</span>
                    </button>

                    <button
                      onClick={() => openModal('override', rec)}
                      className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                    >
                      <SlidersHorizontal className="h-3.5 w-3.5" />
                      <span>Override & Adjust</span>
                    </button>

                    <button
                      onClick={() => handleAction(rec._id, 'Approve')}
                      className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Approve & Dispatch Work Order</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Reject Modal with Mandatory Reason */}
      {activeModal === 'reject' && selectedRec && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">Reject AI Recommendation</h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="mt-3 text-xs text-slate-500">
              A mandatory justification reason is required to maintain reliability audit records and retrain future model versions.
            </p>

            <div className="mt-4 space-y-3 text-xs">
              <label className="font-semibold text-slate-700">Rejection Reason</label>
              <textarea
                rows={3}
                required
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Physical vibration check showed false harmonic due to adjacent pump vibration."
                className="w-full rounded-xl border border-slate-200 p-2.5 focus:border-rose-500 focus:outline-none"
              />
            </div>

            <div className="mt-4 flex justify-end gap-2 border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!reason || submittingAction}
                onClick={() => handleAction(selectedRec._id, 'Reject', reason)}
                className="rounded-xl bg-rose-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-rose-700 disabled:opacity-50"
              >
                {submittingAction ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Override Modal with Parameter Adjustments */}
      {activeModal === 'override' && selectedRec && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">Override AI Parameters</h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700">Adjust Priority</label>
                <select
                  value={overrideData.priority}
                  onChange={(e) => setOverrideData({ ...overrideData, priority: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2"
                >
                  <option value="P1-Critical">P1-Critical</option>
                  <option value="P2-High">P2-High</option>
                  <option value="P3-Medium">P3-Medium</option>
                  <option value="P4-Low">P4-Low</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700">Adjust Downtime Window (Hours)</label>
                <input
                  type="number"
                  step="0.5"
                  value={overrideData.downtimeHours}
                  onChange={(e) => setOverrideData({ ...overrideData, downtimeHours: parseFloat(e.target.value) })}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700">Assign Technician</label>
                <input
                  type="text"
                  value={overrideData.assignedTechnician}
                  onChange={(e) => setOverrideData({ ...overrideData, assignedTechnician: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700">Mandatory Override Justification</label>
                <textarea
                  rows={2}
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Rescheduling downtime to Sunday 6 AM to prevent chemistry class disruption."
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="mt-4 flex justify-end gap-2 border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!reason || submittingAction}
                onClick={() => handleAction(selectedRec._id, 'Override', reason, overrideData)}
                className="rounded-xl bg-indigo-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {submittingAction ? 'Applying...' : 'Apply Override & Dispatch'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

