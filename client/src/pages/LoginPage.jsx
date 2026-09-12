import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  Building2,
  Lock,
  Mail,
  Eye,
  EyeOff,
  Shield,
  Sparkles,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  HelpCircle,
  X,
} from 'lucide-react';

export default function LoginPage() {
  const { login, demoLogin } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('admin@campus.edu');
  const [password, setPassword] = useState('Password123!');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [loading, setLoading] = useState(false);
  const [demoLoadingRole, setDemoLoadingRole] = useState(null);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Forgot password modal
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStatus, setForgotStatus] = useState('');

  const demoAccounts = [
    {
      role: 'MaintenanceAdmin',
      name: 'Dr. Marcus Vance',
      email: 'admin@campus.edu',
      desc: 'Full campus asset authority, RBAC & settings',
      color: 'border-purple-200 hover:border-purple-400 bg-purple-50/50',
      badge: 'Admin',
    },
    {
      role: 'Technician',
      name: 'Elena Rostova',
      email: 'tech@campus.edu',
      desc: 'Work order execution, checklist & evidence',
      color: 'border-emerald-200 hover:border-emerald-400 bg-emerald-50/50',
      badge: 'Technician',
    },
    {
      role: 'OperationsManager',
      name: 'Devon Bradley',
      email: 'ops@campus.edu',
      desc: 'Dispatching, AI recommendations & verification',
      color: 'border-blue-200 hover:border-blue-400 bg-blue-50/50',
      badge: 'Operations',
    },
    {
      role: 'Vendor',
      name: 'Klaus Lindqvist',
      email: 'vendor@campus.edu',
      desc: 'Siemens Precision contractor SLAs',
      color: 'border-amber-200 hover:border-amber-400 bg-amber-50/50',
      badge: 'Vendor',
    },
    {
      role: 'AcademicDeptHead',
      name: 'Prof. Alistair Chen',
      email: 'depthead@campus.edu',
      desc: 'Research bio-lab and student impact view',
      color: 'border-indigo-200 hover:border-indigo-400 bg-indigo-50/50',
      badge: 'Faculty Chair',
    },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!email || !password) {
      setError('Please fill in both university email and password.');
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
      setSuccessMsg('Authentication successful! Redirecting to campus dashboard...');
      setTimeout(() => navigate('/assets'), 500);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Invalid credentials or server offline.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (role) => {
    setError('');
    setDemoLoadingRole(role);
    try {
      await demoLogin(role);
      navigate('/assets');
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to authenticate demo user.');
    } finally {
      setDemoLoadingRole(null);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotEmail) return;
    try {
      setForgotStatus('sending');
      const res = await api.post('/auth/forgot-password', { email: forgotEmail });
      setForgotStatus('sent');
      setTimeout(() => {
        setShowForgotModal(false);
        setForgotStatus('');
        setForgotEmail('');
      }, 3500);
    } catch (err) {
      setForgotStatus('error');
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-900 text-slate-100">
      {/* Left Column: Brand & Hero Showcase */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 relative overflow-hidden border-r border-slate-800">
        {/* Background decorative glowing circles */}
        <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-600/30">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <div className="text-xl font-black tracking-tight text-white">
                HE<span className="text-indigo-400">-SARMS</span>
              </div>
              <div className="text-xs text-indigo-300 font-medium">
                Higher Education Smart Asset Reliability & Maintenance Suite
              </div>
            </div>
          </div>

          <div className="mt-16 max-w-lg">
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/10 px-3.5 py-1 text-xs font-semibold text-indigo-300 backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
              Powered by Google Gemini Generative AI
            </div>
            <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl leading-tight">
              Predict failures before lectures and research stop.
            </h1>
            <p className="mt-4 text-sm text-slate-400 leading-relaxed">
              Autonomous condition monitoring, Remaining Useful Life (RUL) estimation, and complete lifecycle maintenance management across classrooms, biomedical research laboratories, libraries, student hostels, and HPC learning clusters.
            </p>

            <div className="mt-8 grid grid-cols-2 gap-4">
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur">
                <div className="text-2xl font-bold text-indigo-400">94.6%</div>
                <div className="text-xs text-slate-400 mt-1">AI Prediction Accuracy</div>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur">
                <div className="text-2xl font-bold text-emerald-400">17.8 Days</div>
                <div className="text-xs text-slate-400 mt-1">Mean Early Warning Lead Time</div>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-slate-500 border-t border-slate-800/80 pt-6">
          Compliant with University Facilities Safety, FERPA privacy standards, and ISO 10816 Mechanical Reliability.
        </div>
      </div>

      {/* Right Column: Sign In & 1-Click Role Switcher */}
      <div className="flex w-full lg:w-1/2 flex-col justify-center px-6 py-12 sm:px-12 xl:px-16 bg-white text-slate-900">
        <div className="mx-auto w-full max-w-md">
          {/* Mobile Logo */}
          <div className="flex items-center gap-2.5 lg:hidden mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white">
              <Building2 className="h-5 w-5" />
            </div>
            <span className="text-lg font-black text-slate-900">
              HE<span className="text-indigo-600">-SARMS</span>
            </span>
          </div>

          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
              Sign in to University Portal
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Enter your university credentials or select an instant demo persona below.
            </p>
          </div>

          {/* Feedback alerts */}
          {error && (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-700">
              <CheckCircle className="h-4 w-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Standard Form */}
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700">University Email</label>
              <div className="relative mt-1">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@campus.edu"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-9 pr-4 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-700">Password</label>
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-xs font-medium text-indigo-600 hover:text-indigo-800"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative mt-1">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-9 pr-10 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-3.5 w-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span>Remember this terminal</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/20 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition disabled:opacity-50"
            >
              {loading ? (
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick 1-Click Evaluation Persona Switcher */}
          <div className="mt-8 border-t border-slate-200 pt-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                1-Click Demo Evaluation Roles
              </span>
              <span className="text-[11px] text-slate-400">Password: Password123!</span>
            </div>
            <div className="mt-3 grid grid-cols-1 gap-2">
              {demoAccounts.map((demo) => (
                <button
                  key={demo.role}
                  onClick={() => handleQuickLogin(demo.role)}
                  disabled={demoLoadingRole === demo.role}
                  className={`flex items-center justify-between rounded-xl border p-2.5 text-left transition ${demo.color}`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white shadow-xs font-bold text-xs text-slate-700 border border-slate-200">
                      {demo.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                        <span>{demo.name}</span>
                        <span className="rounded bg-white/80 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600 border border-slate-200">
                          {demo.badge}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">{demo.desc}</div>
                    </div>
                  </div>
                  <div>
                    {demoLoadingRole === demo.role ? (
                      <div className="h-3.5 w-3.5 border-2 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin" />
                    ) : (
                      <span className="text-[11px] font-semibold text-indigo-600">Login &rarr;</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl text-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">Reset Password</h3>
              <button onClick={() => setShowForgotModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-3 text-xs text-slate-500 leading-relaxed">
              Enter your registered university email address. A one-time recovery token and reset dispatch will be registered in the campus audit log.
            </p>

            {forgotStatus === 'sent' && (
              <div className="mt-3 rounded-lg bg-emerald-50 p-2.5 text-xs text-emerald-700 border border-emerald-200">
                Verification link dispatched! Demo accounts use password <code className="font-mono font-bold">Password123!</code>.
              </div>
            )}

            <form onSubmit={handleForgotPassword} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700">University Email</label>
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="admin@campus.edu"
                  required
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="rounded-lg px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={forgotStatus === 'sending'}
                  className="rounded-lg bg-indigo-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  {forgotStatus === 'sending' ? 'Sending...' : 'Send Reset Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

