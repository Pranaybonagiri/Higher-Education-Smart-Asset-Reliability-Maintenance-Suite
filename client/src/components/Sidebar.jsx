import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Calendar,
  KanbanSquare,
  Activity,
  Lightbulb,
  Cpu,
  BarChart3,
  Bell,
  Users,
  ShieldCheck,
  Building2,
  CheckCircle,
  X,
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const { user } = useAuth();
  const location = useLocation();

  const navItems = [
    {
      group: 'ASSET OPERATIONS',
      items: [
        {
          name: 'Asset Registry & Health',
          path: '/assets',
          icon: LayoutDashboard,
          badge: '15 Active',
        },
        {
          name: 'Maintenance Calendar & Queue',
          path: '/calendar',
          icon: Calendar,
        },
        {
          name: 'Planning & Verification Board',
          path: '/planning',
          icon: KanbanSquare,
          badge: 'Kanban',
        },
      ],
    },
    {
      group: 'AI DECISION INTELLIGENCE',
      items: [
        {
          name: 'Failure Risk & RUL Curves',
          path: '/failure-risk',
          icon: Activity,
          highlight: true,
        },
        {
          name: 'Maintenance Recommendations',
          path: '/recommendations',
          icon: Lightbulb,
          badge: 'HITL Review',
        },
        {
          name: 'Reliability & Model Drift',
          path: '/model-performance',
          icon: Cpu,
        },
      ],
    },
    {
      group: 'FACILITIES INTELLIGENCE',
      items: [
        {
          name: 'Reports & Downtime Impact',
          path: '/reports',
          icon: BarChart3,
        },
        {
          name: 'Notification Center',
          path: '/notifications',
          icon: Bell,
        },
        {
          name: 'Users & RBAC Matrix',
          path: '/users',
          icon: Users,
        },
        {
          name: 'Audit Logs & Settings',
          path: '/settings',
          icon: ShieldCheck,
        },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-slate-900 text-slate-300 transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-0 max-lg:-translate-x-full'
        } flex flex-col justify-between`}
      >
        <div>
          {/* Mobile Header Bar */}
          <div className="flex h-16 items-center justify-between px-5 border-b border-slate-800 lg:hidden">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-indigo-400" />
              <span className="font-extrabold text-white">HE-SARMS</span>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* University Campus Tag */}
          <div className="p-4 border-b border-slate-800/80 bg-slate-950/40 hidden lg:block">
            <div className="text-[11px] font-semibold tracking-wider text-indigo-400 uppercase">
              University Domain
            </div>
            <div className="text-sm font-bold text-white mt-0.5">Central Campus Facilities</div>
            <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              6 Facility Zones Online
            </div>
          </div>

          {/* Navigation Links */}
          <div className="px-3 py-4 space-y-6 overflow-y-auto max-h-[calc(100vh-16rem)]">
            {navItems.map((group, gIdx) => (
              <div key={gIdx}>
                <div className="px-3 text-[10px] font-bold tracking-wider text-slate-500 uppercase">
                  {group.group}
                </div>
                <div className="mt-2 space-y-1">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive =
                      item.path === '/assets'
                        ? location.pathname === '/assets' || location.pathname.startsWith('/assets/')
                        : location.pathname === item.path;

                    return (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={onClose}
                        className={`group flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition-all ${
                          isActive
                            ? 'bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-600/30'
                            : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <Icon
                            className={`h-4 w-4 shrink-0 transition ${
                              isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-400'
                            }`}
                          />
                          <span className="truncate">{item.name}</span>
                        </div>
                        {item.badge && (
                          <span
                            className={`ml-2 rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${
                              isActive
                                ? 'bg-indigo-500/60 text-white'
                                : 'bg-slate-800 text-slate-400 group-hover:bg-slate-700'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </NavLink>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Info Pill */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60">
          <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3 text-xs">
            <div className="flex items-center justify-between text-slate-300">
              <span className="font-semibold text-white">Signed in as:</span>
              <span className="text-[11px] text-indigo-400 font-mono">{user?.role}</span>
            </div>
            <div className="text-[11px] text-slate-400 truncate mt-0.5">{user?.name}</div>
            <div className="mt-2 text-[10px] text-emerald-400 flex items-center gap-1">
              <CheckCircle className="h-3 w-3" /> All RBAC policies enforced
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

