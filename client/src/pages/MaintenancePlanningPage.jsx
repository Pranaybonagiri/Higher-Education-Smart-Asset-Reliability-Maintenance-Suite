import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  KanbanSquare,
  Plus,
  Clock,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  User,
  Package,
  ShieldCheck,
  ChevronRight,
  ArrowRight,
  FileSignature,
  Building,
  RotateCcw,
  X,
} from 'lucide-react';

export default function MaintenancePlanningPage() {
  const { user } = useAuth();

  const [workOrders, setWorkOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Verification modal state
  const [verifyModalOrder, setVerifyModalOrder] = useState(null);
  const [verificationNotes, setVerificationNotes] = useState('Completed physical inspection and sensor telemetry verification. Restored to normal service envelope.');
  const [verificationOutcome, setVerificationOutcome] = useState('Approved');
  const [signerName, setSignerName] = useState(user?.name || 'Supervisor');
  const [signatureDone, setSignatureDone] = useState(false);
  const [submittingVerification, setSubmittingVerification] = useState(false);

  // New work order modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newAssetCode, setNewAssetCode] = useState('LAB-BIO-302');
  const [newPriority, setNewPriority] = useState('P2-High');
  const [newSkill, setNewSkill] = useState('HVAC Level 3 Specialist');
  const [newDowntime, setNewDowntime] = useState(2.5);
  const [creating, setCreating] = useState(false);

  const columns = [
    { id: 'Backlog', title: 'Backlog', color: 'border-slate-300 bg-slate-100 text-slate-700' },
    { id: 'Scheduled', title: 'Scheduled', color: 'border-indigo-300 bg-indigo-50 text-indigo-800' },
    { id: 'In_Progress', title: 'In Progress', color: 'border-amber-300 bg-amber-50 text-amber-800' },
    { id: 'Pending_Verification', title: 'Pending Verification', color: 'border-purple-300 bg-purple-50 text-purple-800' },
    { id: 'Closed', title: 'Closed & Verified', color: 'border-emerald-300 bg-emerald-50 text-emerald-800' },
  ];

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/work-orders?limit=60');
      if (res.data.success) {
        setWorkOrders(res.data.data.workOrders || []);
      }
    } catch (err) {
      console.error('Failed to load work orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus, reason) => {
    try {
      await api.patch(`/work-orders/${orderId}/status`, {
        status: newStatus,
        reason: reason || `Moved to ${newStatus} on maintenance planning board`,
      });
      fetchOrders();
    } catch (err) {
      console.error('Status update failed:', err);
    }
  };

  const handleVerifyClosure = async (e) => {
    e.preventDefault();
    if (!verifyModalOrder) return;
    try {
      setSubmittingVerification(true);
      await api.post(`/work-orders/${verifyModalOrder._id}/verify`, {
        verificationNotes,
        status: verificationOutcome,
        signatureDataUrl: 'data:image/svg+xml;utf8,<svg>Verified-Signature</svg>',
      });
      setVerifyModalOrder(null);
      fetchOrders();
    } catch (err) {
      console.error('Verification sign-off failed:', err);
    } finally {
      setSubmittingVerification(false);
    }
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    try {
      setCreating(true);
      // Find asset
      const assetsRes = await api.get(`/assets?search=${newAssetCode}`);
      const matchedAsset = assetsRes.data?.data?.assets?.[0];

      if (!matchedAsset) {
        alert('Could not find asset with code ' + newAssetCode);
        return;
      }

      await api.post('/work-orders', {
        title: newTitle,
        assetId: matchedAsset._id,
        priority: newPriority,
        requiredSkill: newSkill,
        estimatedDowntimeHours: parseFloat(newDowntime),
        status: 'Scheduled',
        assignedTechnicianName: 'Elena Rostova',
      });

      setShowCreateModal(false);
      setNewTitle('');
      fetchOrders();
    } catch (err) {
      console.error('Failed to create order:', err);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-900 sm:text-2xl">
              Maintenance Planning & Closure Verification Board
            </h1>
            <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-bold text-purple-800">
              Kanban Workflow
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Dispatch, parts reservation, technician skill matching, and material decision closure sign-off.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700 transition"
        >
          <Plus className="h-4 w-4" />
          <span>Create Work Order</span>
        </button>
      </div>

      {/* Kanban Board Container */}
      {loading ? (
        <div className="flex h-64 items-center justify-center rounded-2xl border border-slate-200 bg-white">
          <div className="h-6 w-6 border-2 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 xl:grid-cols-5 items-start">
          {columns.map((col) => {
            const colOrders = workOrders.filter((w) => w.status === col.id);
            return (
              <div
                key={col.id}
                className="flex flex-col rounded-2xl border border-slate-200 bg-slate-100/70 p-3 min-h-[500px]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between px-2 py-1.5 border-b border-slate-200/80 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-800">{col.title}</span>
                    <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-slate-600 shadow-xs">
                      {colOrders.length}
                    </span>
                  </div>
                </div>

                {/* Column Cards */}
                <div className="space-y-3">
                  {colOrders.length === 0 ? (
                    <div className="py-12 text-center text-xs text-slate-400">No jobs in {col.title}</div>
                  ) : (
                    colOrders.map((order) => {
                      const isCrit = order.priority === 'P1-Critical';
                      return (
                        <div
                          key={order._id}
                          className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs transition hover:shadow-md hover:border-indigo-300 flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="font-mono text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                                {order.orderCode}
                              </span>
                              <span
                                className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${
                                  isCrit ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-700'
                                }`}
                              >
                                {order.priority}
                              </span>
                            </div>

                            <h4 className="mt-2 text-xs font-bold text-slate-900 leading-snug">{order.title}</h4>
                            <p className="mt-1 text-[11px] text-slate-500 line-clamp-2">{order.description}</p>

                            <div className="mt-3 space-y-1 text-[10px] text-slate-500 border-t border-slate-100 pt-2">
                              <div className="flex items-center gap-1 text-slate-700 font-medium">
                                <Building className="h-3 w-3 text-slate-400 shrink-0" />
                                <span className="truncate">{order.assetId?.name}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <User className="h-3 w-3 text-slate-400 shrink-0" />
                                <span>{order.assignedTechnicianName}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Wrench className="h-3 w-3 text-slate-400 shrink-0" />
                                <span className="truncate">{order.requiredSkill}</span>
                              </div>
                            </div>
                          </div>

                          {/* Action Bar based on column */}
                          <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2 text-[10px]">
                            {col.id === 'Backlog' && (
                              <button
                                onClick={() => handleStatusChange(order._id, 'Scheduled')}
                                className="w-full rounded-lg bg-indigo-50 py-1 font-bold text-indigo-700 hover:bg-indigo-100 text-center"
                              >
                                Schedule &rarr;
                              </button>
                            )}
                            {col.id === 'Scheduled' && (
                              <button
                                onClick={() => handleStatusChange(order._id, 'In_Progress')}
                                className="w-full rounded-lg bg-amber-50 py-1 font-bold text-amber-800 hover:bg-amber-100 text-center"
                              >
                                Start Work &rarr;
                              </button>
                            )}
                            {col.id === 'In_Progress' && (
                              <button
                                onClick={() => handleStatusChange(order._id, 'Pending_Verification')}
                                className="w-full rounded-lg bg-purple-50 py-1 font-bold text-purple-800 hover:bg-purple-100 text-center"
                              >
                                Submit for Verification &rarr;
                              </button>
                            )}
                            {col.id === 'Pending_Verification' && (
                              <button
                                onClick={() => {
                                  setVerifyModalOrder(order);
                                  setVerificationOutcome('Approved');
                                }}
                                className="w-full rounded-lg bg-emerald-600 py-1 font-bold text-white hover:bg-emerald-700 text-center shadow-xs"
                              >
                                Verify & Close &rarr;
                              </button>
                            )}
                            {col.id === 'Closed' && (
                              <div className="flex items-center gap-1 text-emerald-600 font-bold mx-auto">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                <span>Signed & Verified</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Closure Verification Modal (Supervisor Sign-off with Diff and Reason capture) */}
      {verifyModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <FileSignature className="h-5 w-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-sm">Supervisor Closure Verification</h3>
              </div>
              <button onClick={() => setVerifyModalOrder(null)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-3 text-xs text-slate-600">
              <span className="font-bold text-slate-900">{verifyModalOrder.orderCode}:</span> {verifyModalOrder.title}
              <div className="mt-1 text-[11px] text-slate-400">
                Technician: {verifyModalOrder.assignedTechnicianName} &bull; Asset: {verifyModalOrder.assetId?.name}
              </div>
            </div>

            <form onSubmit={handleVerifyClosure} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700">Verification Outcome</label>
                <div className="mt-1 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setVerificationOutcome('Approved')}
                    className={`rounded-xl border p-2.5 text-xs font-bold transition text-center ${
                      verificationOutcome === 'Approved'
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-800'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    Approve & Close
                  </button>
                  <button
                    type="button"
                    onClick={() => setVerificationOutcome('Rejected')}
                    className={`rounded-xl border p-2.5 text-xs font-bold transition text-center ${
                      verificationOutcome === 'Rejected'
                        ? 'border-rose-500 bg-rose-50 text-rose-800'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    Reject (Require Remediation)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Mandatory Supervisor Sign-off Notes</label>
                <textarea
                  rows={3}
                  value={verificationNotes}
                  onChange={(e) => setVerificationNotes(e.target.value)}
                  required
                  placeholder="Record verification methodology, acoustic check, baseline restoration..."
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Digital Sign-off Actor</label>
                <input
                  type="text"
                  value={signerName}
                  onChange={(e) => setSignerName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2 text-xs"
                />
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-center cursor-pointer" onClick={() => setSignatureDone(true)}>
                <div className="font-mono text-sm text-indigo-600 italic font-bold tracking-wider">
                  {signatureDone ? `✓ Electronically Signed by ${signerName}` : 'Click here to apply electronic supervisor signature'}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setVerifyModalOrder(null)}
                  className="rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingVerification}
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  {submittingVerification ? 'Submitting...' : 'Commit Closure to Audit Log'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Work Order Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">Create Maintenance Work Order</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateOrder} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700">Work Order Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Cleanroom HVAC Chiller Annual Diagnostic"
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700">Asset Code</label>
                <select
                  value={newAssetCode}
                  onChange={(e) => setNewAssetCode(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2"
                >
                  <option value="LAB-BIO-302">LAB-BIO-302 (Bio-Refrigerated Centrifuge)</option>
                  <option value="LIB-MAIN-HVAC">LIB-MAIN-HVAC (Library Chilled Water Pump)</option>
                  <option value="AUD-ENG-101">AUD-ENG-101 (Auditorium 4K Projector)</option>
                  <option value="HST-NORTH-BLR">HST-NORTH-BLR (Hostel Gas Boiler)</option>
                  <option value="SYS-HPC-NODE7">SYS-HPC-NODE7 (Campus AI GPU Server)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-slate-700">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2"
                  >
                    <option value="P1-Critical">P1-Critical</option>
                    <option value="P2-High">P2-High</option>
                    <option value="P3-Medium">P3-Medium</option>
                    <option value="P4-Low">P4-Low</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700">Est. Downtime (Hours)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={newDowntime}
                    onChange={(e) => setNewDowntime(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 p-2"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700">Required Technician Skill</label>
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="rounded-xl px-3 py-1.5 font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="rounded-xl bg-indigo-600 px-4 py-1.5 font-bold text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  {creating ? 'Creating...' : 'Dispatch Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

