import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Calendar as CalendarIcon,
  CheckSquare,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  User,
  Wrench,
  Camera,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Filter,
  FileCheck,
  Building,
  Upload,
  Save,
  X,
} from 'lucide-react';

export default function MaintenanceCalendarPage() {
  const { user } = useAuth();

  const [workOrders, setWorkOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeView, setActiveView] = useState('queue'); // 'queue' | 'calendar'

  // Active checklist modal state
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [checklist, setChecklist] = useState([]);
  const [technicianNotes, setTechnicianNotes] = useState('');
  const [evidenceCaption, setEvidenceCaption] = useState('');
  const [aiSummaryLoading, setAiSummaryLoading] = useState(false);
  const [aiSummary, setAiSummary] = useState('');
  const [savingChecklist, setSavingChecklist] = useState(false);

  const fetchWorkOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/work-orders?limit=50');
      if (res.data.success) {
        setWorkOrders(res.data.data.workOrders || []);
      }
    } catch (err) {
      console.error('Failed to fetch work orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkOrders();
  }, []);

  const openChecklistModal = (order) => {
    setSelectedOrder(order);
    setChecklist(
      order.checklist?.length > 0
        ? order.checklist
        : [
            { step: 1, task: 'Disconnect power & apply Lockout/Tagout (LOTO)', isCompleted: false, passFail: 'Pending', meterReading: '', notes: '' },
            { step: 2, task: 'Inspect physical seals and baseline vibration reading', isCompleted: false, passFail: 'Pending', meterReading: '', notes: '' },
            { step: 3, task: 'Execute planned component servicing or filter swap', isCompleted: false, passFail: 'Pending', meterReading: '', notes: '' },
            { step: 4, task: 'Perform 15-minute test run and log post-repair harmonics', isCompleted: false, passFail: 'Pending', meterReading: '', notes: '' },
          ]
    );
    setTechnicianNotes(order.description || '');
    setAiSummary(order.aiGeneratedSummary || '');
  };

  const handleChecklistToggle = (idx, field, value) => {
    const updated = [...checklist];
    updated[idx][field] = value;
    if (field === 'passFail' && value === 'Pass') {
      updated[idx].isCompleted = true;
    }
    setChecklist(updated);
  };

  const handleAiSummarize = async () => {
    if (!technicianNotes) return;
    try {
      setAiSummaryLoading(true);
      const res = await api.post('/ai/summarize-notes', {
        notes: technicianNotes,
        assetName: selectedOrder?.assetId?.name || 'Campus Equipment',
      });
      if (res.data.success) {
        setAiSummary(res.data.data.summary);
      }
    } catch (err) {
      console.error('AI summarization failed:', err);
    } finally {
      setAiSummaryLoading(false);
    }
  };

  const handleSaveChecklist = async () => {
    try {
      setSavingChecklist(true);
      const newEvidence = evidenceCaption
        ? [
            ...(selectedOrder.evidence || []),
            {
              url: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=800&auto=format&fit=crop&q=60',
              caption: evidenceCaption,
              type: 'image',
              uploadedAt: new Date(),
            },
          ]
        : selectedOrder.evidence;

      await api.patch(`/work-orders/${selectedOrder._id}/checklist`, {
        checklist,
        notes: technicianNotes,
        evidence: newEvidence,
      });

      // Advance status to Pending_Verification if all steps passed
      const allPassed = checklist.every((c) => c.passFail === 'Pass');
      if (allPassed && selectedOrder.status === 'In_Progress') {
        await api.patch(`/work-orders/${selectedOrder._id}/status`, {
          status: 'Pending_Verification',
          reason: 'All checklist steps completed and verified by technician.',
        });
      }

      fetchWorkOrders();
      setSelectedOrder(null);
    } catch (err) {
      console.error('Error saving checklist:', err);
    } finally {
      setSavingChecklist(false);
    }
  };

  const scheduledOrders = workOrders.filter((w) => w.status === 'Scheduled' || w.status === 'In_Progress');
  const criticalOrders = workOrders.filter((w) => w.priority === 'P1-Critical');

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 sm:text-2xl">
            Maintenance Calendar & Technician Queue
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Preventive schedules, assigned technician queues, and field inspection checklists.
          </p>
        </div>

        <div className="flex rounded-xl border border-slate-200 bg-white p-1 shadow-xs text-xs font-semibold">
          <button
            onClick={() => setActiveView('queue')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition ${
              activeView === 'queue' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CheckSquare className="h-3.5 w-3.5" />
            <span>Technician Queue ({scheduledOrders.length})</span>
          </button>
          <button
            onClick={() => setActiveView('calendar')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 transition ${
              activeView === 'calendar' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CalendarIcon className="h-3.5 w-3.5" />
            <span>Calendar View</span>
          </button>
        </div>
      </div>

      {/* Quick Summary Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-4">
          <div className="flex items-center justify-between text-rose-800">
            <span className="text-xs font-bold uppercase tracking-wider">Critical Interventions</span>
            <AlertTriangle className="h-4 w-4 text-rose-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-rose-700">{criticalOrders.length}</div>
          <div className="text-[11px] text-rose-600 mt-0.5">High risk to active lab sessions or building HVAC</div>
        </div>

        <div className="rounded-2xl border border-indigo-200 bg-indigo-50/50 p-4">
          <div className="flex items-center justify-between text-indigo-800">
            <span className="text-xs font-bold uppercase tracking-wider">Scheduled Active Jobs</span>
            <Clock className="h-4 w-4 text-indigo-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-indigo-700">{scheduledOrders.length}</div>
          <div className="text-[11px] text-indigo-600 mt-0.5">Assigned to campus electromechanical specialists</div>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4">
          <div className="flex items-center justify-between text-emerald-800">
            <span className="text-xs font-bold uppercase tracking-wider">Estimated Downtime</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-black text-emerald-700">11.5 Hours</div>
          <div className="text-[11px] text-emerald-600 mt-0.5">Planned outside student lecture quiet windows</div>
        </div>
      </div>

      {/* Main Content Area */}
      {activeView === 'queue' ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Active Field Technician Work Queue</h2>
              <p className="text-xs text-slate-400">Click on any work order to open the live inspection checklist & evidence logger.</p>
            </div>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
              Role Filter: {user?.role || 'All'}
            </span>
          </div>

          <div className="mt-4 divide-y divide-slate-100">
            {workOrders.map((order) => {
              const isCrit = order.priority === 'P1-Critical';
              return (
                <div
                  key={order._id}
                  className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between hover:bg-slate-50/80 rounded-xl px-3 transition"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-200/60 px-2 py-0.5 rounded">
                        {order.orderCode}
                      </span>
                      <span
                        className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                          isCrit ? 'bg-rose-100 text-rose-800 animate-pulse' : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {order.priority}
                      </span>
                      <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                        {order.status.replace('_', ' ')}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900">{order.title}</h3>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <div className="flex items-center gap-1">
                        <Building className="h-3.5 w-3.5 text-slate-400" />
                        <span>{order.assetId?.name || 'Asset'} ({order.assetId?.location?.building})</span>
                      </div>
                      <span>&bull;</span>
                      <div className="flex items-center gap-1">
                        <User className="h-3.5 w-3.5 text-slate-400" />
                        <span>{order.assignedTechnicianName}</span>
                      </div>
                      <span>&bull;</span>
                      <span>Est Downtime: {order.estimatedDowntimeHours}h</span>
                    </div>

                    {order.academicImpact?.affectedCourses?.length > 0 && (
                      <div className="text-[11px] text-amber-700 font-medium">
                        Academic Impact: {order.academicImpact.affectedCourses.join(', ')}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => openChecklistModal(order)}
                      className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 transition"
                    >
                      <FileCheck className="h-3.5 w-3.5" />
                      <span>Inspection Checklist</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Calendar View Simulator */
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="text-sm font-bold text-slate-900">Campus Preventive Maintenance Schedule</h2>
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <span className="flex items-center gap-1.5 font-bold">
                <span className="h-2 w-2 rounded-full bg-rose-500"></span> Critical
              </span>
              <span className="flex items-center gap-1.5 font-bold">
                <span className="h-2 w-2 rounded-full bg-indigo-500"></span> High / Preventive
              </span>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {workOrders.map((wo) => (
              <div
                key={wo._id}
                onClick={() => openChecklistModal(wo)}
                className="cursor-pointer rounded-xl border border-slate-200 p-3 hover:border-indigo-400 hover:shadow-xs transition bg-slate-50/50"
              >
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-mono font-bold text-indigo-600">{wo.orderCode}</span>
                  <span className="text-slate-400">
                    {new Date(wo.scheduledDate || wo.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <h4 className="mt-1.5 text-xs font-bold text-slate-800 line-clamp-2">{wo.title}</h4>
                <div className="mt-2 text-[11px] text-slate-500 truncate">{wo.assetId?.name}</div>
                <div className="mt-2 flex items-center justify-between text-[10px] font-semibold text-slate-600">
                  <span>{wo.assignedTechnicianName}</span>
                  <span className="rounded bg-indigo-100 px-1.5 py-0.2 text-indigo-800">{wo.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Interactive Mobile-Friendly Inspection Checklist Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl text-slate-900 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="font-mono text-xs font-bold text-indigo-600">{selectedOrder.orderCode}</span>
                <h3 className="font-bold text-slate-900 text-sm mt-0.5">{selectedOrder.title}</h3>
                <div className="text-xs text-slate-400">
                  {selectedOrder.assetId?.name} &bull; {selectedOrder.requiredSkill}
                </div>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="rounded-lg p-1 text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Checklist Tasks */}
            <div className="mt-4 space-y-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Standard Operating Procedure Checklist
              </h4>
              <div className="divide-y divide-slate-100 rounded-xl border border-slate-200">
                {checklist.map((item, idx) => (
                  <div key={idx} className="p-3.5 text-xs space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-semibold text-slate-800">
                        Step {item.step || idx + 1}: {item.task}
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleChecklistToggle(idx, 'passFail', 'Pass')}
                          className={`rounded px-2 py-1 text-[11px] font-bold transition ${
                            item.passFail === 'Pass'
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          Pass
                        </button>
                        <button
                          type="button"
                          onClick={() => handleChecklistToggle(idx, 'passFail', 'Fail')}
                          className={`rounded px-2 py-1 text-[11px] font-bold transition ${
                            item.passFail === 'Fail'
                              ? 'bg-rose-600 text-white shadow-xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          Fail
                        </button>
                      </div>
                    </div>

                    {/* Meter reading input */}
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Observed meter / sensor reading (e.g. 0.18 mm/s, 42°C)"
                        value={item.meterReading || ''}
                        onChange={(e) => handleChecklistToggle(idx, 'meterReading', e.target.value)}
                        className="w-full rounded-lg border border-slate-200 px-2.5 py-1 text-[11px] placeholder:text-slate-400 focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Field Notes & AI Summarizer */}
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800">Field Repair & Observation Notes</label>
                <button
                  type="button"
                  onClick={handleAiSummarize}
                  disabled={aiSummaryLoading || !technicianNotes}
                  className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 disabled:opacity-50"
                >
                  <Sparkles className={`h-3.5 w-3.5 ${aiSummaryLoading ? 'animate-spin' : ''}`} />
                  <span>{aiSummaryLoading ? 'Generating...' : 'Gemini Summarize'}</span>
                </button>
              </div>

              <textarea
                rows={3}
                value={technicianNotes}
                onChange={(e) => setTechnicianNotes(e.target.value)}
                placeholder="Describe observations, replaced components, root cause found..."
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-800 focus:border-indigo-500 focus:outline-none"
              />

              {aiSummary && (
                <div className="rounded-xl border border-indigo-200 bg-indigo-50/60 p-3 text-xs text-indigo-900">
                  <div className="font-bold flex items-center gap-1.5 text-indigo-800">
                    <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                    <span>Gemini AI Standardized CMMS Incident Summary:</span>
                  </div>
                  <p className="mt-1 leading-relaxed text-[11px]">{aiSummary}</p>
                </div>
              )}
            </div>

            {/* Evidence Photo Upload simulation */}
            <div className="mt-4 space-y-2">
              <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Camera className="h-3.5 w-3.5 text-slate-500" />
                <span>Mobile Evidence Photo / Spectrogram</span>
              </label>
              <input
                type="text"
                value={evidenceCaption}
                onChange={(e) => setEvidenceCaption(e.target.value)}
                placeholder="Evidence description: e.g. Post-lubrication thermal thermography check"
                className="w-full rounded-xl border border-slate-200 p-2 text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Modal Actions */}
            <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveChecklist}
                disabled={savingChecklist}
                className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700 disabled:opacity-50"
              >
                <Save className="h-3.5 w-3.5" />
                <span>{savingChecklist ? 'Saving...' : 'Save Inspection & Progress'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

