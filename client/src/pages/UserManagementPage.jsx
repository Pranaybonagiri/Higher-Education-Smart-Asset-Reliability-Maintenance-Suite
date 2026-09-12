import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  UserPlus,
  Shield,
  Key,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  Lock,
  Building,
  Check,
  X,
} from 'lucide-react';

export default function UserManagementPage() {
  const { user } = useAuth();

  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('directory'); // 'directory' | 'matrix'

  // Add User Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: 'Password123!',
    role: 'Technician',
    department: 'Central Facilities & Mechanical Maintenance',
    specialization: 'HVAC & Electromechanical',
    phone: '+1 (555) 012-3456',
  });
  const [creating, setCreating] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/users?role=${roleFilter}&search=${search}`);
      if (res.data.success) {
        setUsersList(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchUsers();
  };

  const handleToggleStatus = async (targetUser) => {
    const newStatus = targetUser.status === 'Active' ? 'Suspended' : 'Active';
    try {
      await api.put(`/users/${targetUser._id}`, { status: newStatus });
      setUsersList((prev) =>
        prev.map((u) => (u._id === targetUser._id ? { ...u, status: newStatus } : u))
      );
    } catch (err) {
      alert('Failed to update user status');
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      setCreating(true);
      const res = await api.post('/users', formData);
      if (res.data.success) {
        setShowAddModal(false);
        setFormData({
          name: '',
          email: '',
          password: 'Password123!',
          role: 'Technician',
          department: 'Central Facilities & Mechanical Maintenance',
          specialization: 'HVAC & Electromechanical',
          phone: '+1 (555) 012-3456',
        });
        fetchUsers();
      }
    } catch (err) {
      alert(err.response?.data?.error?.message || 'Failed to create user');
    } finally {
      setCreating(false);
    }
  };

  const getRoleBadge = (role) => {
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

  const permissionMatrix = [
    { module: 'Asset Registry & CRUD', admin: true, ops: true, tech: 'Read Only', vendor: 'Contracted', chair: 'Dept Only' },
    { module: 'Telemetry Deep Dive & Charts', admin: true, ops: true, tech: true, vendor: 'Partial', chair: true },
    { module: 'Work Order Creation & Dispatch', admin: true, ops: true, tech: false, vendor: false, chair: 'Request Only' },
    { module: 'Inspection Checklist & Field Photos', admin: true, ops: true, tech: true, vendor: true, chair: false },
    { module: 'Closure Verification Sign-off', admin: true, ops: true, tech: false, vendor: false, chair: false },
    { module: 'AI Failure Risk & RUL Engine', admin: true, ops: true, tech: 'View Only', vendor: false, chair: 'Summary' },
    { module: 'AI Recommendation HITL Decision', admin: true, ops: true, tech: false, vendor: false, chair: false },
    { module: 'Audit Logs & University Settings', admin: true, ops: 'View Logs', tech: false, vendor: false, chair: false },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-slate-900 sm:text-2xl">
              User & Role-Based Access Control (RBAC)
            </h1>
            <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-bold text-purple-800">
              Least-Privilege Security
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Manage university personnel, contractors, and academic authority boundaries across campus facilities.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-indigo-600/20 hover:bg-indigo-700 transition"
        >
          <UserPlus className="h-4 w-4" />
          <span>Add Campus Personnel</span>
        </button>
      </div>

      {/* Tabs Switcher */}
      <div className="flex gap-4 border-b border-slate-200 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('directory')}
          className={`flex items-center gap-2 border-b-2 pb-3 transition ${
            activeTab === 'directory'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Personnel Directory ({usersList.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('matrix')}
          className={`flex items-center gap-2 border-b-2 pb-3 transition ${
            activeTab === 'matrix'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Shield className="h-4 w-4" />
          <span>RBAC Permissions Matrix</span>
        </button>
      </div>

      {activeTab === 'directory' ? (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-slate-200 bg-white p-3 shadow-xs">
            <div className="flex flex-wrap gap-1.5 text-xs font-semibold">
              {['All', 'MaintenanceAdmin', 'Technician', 'OperationsManager', 'Vendor', 'AcademicDeptHead'].map((r) => (
                <button
                  key={r}
                  onClick={() => setRoleFilter(r)}
                  className={`rounded-xl px-3 py-1.5 transition ${
                    roleFilter === r ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {r === 'All'
                    ? 'All Personnel'
                    : r === 'MaintenanceAdmin'
                    ? 'Admins'
                    : r === 'OperationsManager'
                    ? 'Operations'
                    : r === 'AcademicDeptHead'
                    ? 'Dept Heads'
                    : r}
                </button>
              ))}
            </div>

            <form onSubmit={handleSearchSubmit} className="relative sm:w-64">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search personnel..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-3 py-1.5 text-xs focus:border-indigo-500 focus:bg-white focus:outline-none"
              />
            </form>
          </div>

          {/* Users Table */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Personnel Name & Email</th>
                    <th className="px-4 py-3">Role Authority</th>
                    <th className="px-4 py-3">Department & Specialization</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Last Active</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {usersList.map((u) => (
                    <tr key={u._id} className="hover:bg-slate-50/80 transition">
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-slate-900">{u.name}</div>
                        <div className="text-[11px] text-slate-400">{u.email}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`rounded-md border px-2 py-0.5 text-[10px] font-bold ${getRoleBadge(u.role)}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="text-slate-800 font-medium">{u.department}</div>
                        <div className="text-[10px] text-slate-400">{u.specialization}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                            u.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {u.status}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-slate-500">
                        {new Date(u.lastLogin || u.updatedAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <button
                          onClick={() => handleToggleStatus(u)}
                          className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition ${
                            u.status === 'Active'
                              ? 'border border-rose-200 text-rose-700 hover:bg-rose-50'
                              : 'border border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                          }`}
                        >
                          {u.status === 'Active' ? 'Suspend' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Permission Matrix View */
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="mb-4">
            <h3 className="text-sm font-bold text-slate-900">Least-Privilege Role Authorization Matrix</h3>
            <p className="text-xs text-slate-400">Enforced by backend Express JWT & requireRole middleware</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Platform Capability</th>
                  <th className="px-4 py-3 text-center">Maintenance Admin</th>
                  <th className="px-4 py-3 text-center">Operations Mgr</th>
                  <th className="px-4 py-3 text-center">Technician</th>
                  <th className="px-4 py-3 text-center">Vendor</th>
                  <th className="px-4 py-3 text-center">Dept Head</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {permissionMatrix.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/80">
                    <td className="px-4 py-3 font-semibold text-slate-800">{row.module}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="font-bold text-emerald-600">Full Access</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="font-bold text-emerald-600">{row.ops === true ? 'Full Access' : row.ops}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {row.tech === true ? (
                        <span className="font-bold text-emerald-600">Authorized</span>
                      ) : row.tech === false ? (
                        <span className="text-slate-300">&mdash;</span>
                      ) : (
                        <span className="font-bold text-indigo-600">{row.tech}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {row.vendor === true ? (
                        <span className="font-bold text-emerald-600">Authorized</span>
                      ) : row.vendor === false ? (
                        <span className="text-slate-300">&mdash;</span>
                      ) : (
                        <span className="font-bold text-amber-600">{row.vendor}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {row.chair === true ? (
                        <span className="font-bold text-emerald-600">Authorized</span>
                      ) : row.chair === false ? (
                        <span className="text-slate-300">&mdash;</span>
                      ) : (
                        <span className="font-bold text-indigo-600">{row.chair}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">Register Campus Personnel</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Dr. Arthur Miller"
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700">University Email</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="amiller@campus.edu"
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700">Assigned Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2"
                >
                  <option value="Technician">Technician</option>
                  <option value="OperationsManager">Operations Manager</option>
                  <option value="MaintenanceAdmin">Maintenance Admin</option>
                  <option value="Vendor">Vendor / Contractor</option>
                  <option value="AcademicDeptHead">Academic Dept Head</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700">Department</label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700">Specialization / Certification</label>
                <input
                  type="text"
                  value={formData.specialization}
                  onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-slate-200 p-2"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl px-3 py-1.5 font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="rounded-xl bg-indigo-600 px-4 py-1.5 font-bold text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  {creating ? 'Saving...' : 'Register User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

