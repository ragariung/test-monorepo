import React, { ReactNode, useEffect, useRef, useState } from 'react';
import {
  ShieldCheck,
  LayoutDashboard,
  Inbox,
  Package,
  Sliders,
  Users,
  History,
  LogOut,
  ChevronRight,
  ChevronDown,
  Search,
  Bell,
  ExternalLink,
  Shield,
  UserCheck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface AdminLayoutProps {
  children: ReactNode;
  activeNav: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  children,
  activeNav,
  title,
  subtitle,
  action
}) => {
  const { currentPath, navigate, currentUser, logout, applications } = useApp();

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const userInitials = currentUser
    ? currentUser.name.split(' ').map((n) => n[0]).join('').substring(0, 2)
    : '??';

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { 
      id: 'applications', 
      label: 'Kotak Masuk Aplikasi', 
      path: '/admin/applications', 
      icon: Inbox,
      badge: applications.filter((a) => a.status === 'Submitted').length
    },
    { id: 'products', label: 'Katalog Produk (CMS)', path: '/admin/products', icon: Package },
    { 
      id: 'simulation-rules', 
      label: 'Aturan Simulasi & Tarif', 
      path: '/admin/products/praxis-jiwa-utama/simulation-rules', 
      icon: Sliders 
    },
    { id: 'organization', label: 'Organisasi & Hak Akses', path: '/admin/organization', icon: Users },
    { id: 'audit', label: 'Audit Trail Sistem', path: '/admin/audit', icon: History }
  ];

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex font-sans text-[#111827]">
      {/* Dense Utilitarian Sidebar */}
      <aside className="w-64 bg-[#0A2B33] text-slate-300 flex flex-col shrink-0 border-r border-[#082229]">
        {/* Sidebar Brand Header */}
        <div className="h-16 px-5 flex items-center justify-between border-b border-white/10 bg-[#071F25]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-white">
              <Shield className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-white">PRAXIS</span>
              <span className="ml-2 text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-white/10 text-emerald-300 border border-white/15">
                PORTAL
              </span>
            </div>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">v2.4</span>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Menu Operasional
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeNav === item.id || currentPath.startsWith(item.path);

            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer text-left ${
                  isActive
                    ? 'bg-[#0F4C5C] text-white font-bold shadow-soft'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#F27D26] text-white shadow-soft">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer Actions */}
        <div className="p-3.5 border-t border-white/10 space-y-1.5 bg-[#071F25]">
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Buka Situs Publik</span>
            </span>
            <span className="text-[10px] text-slate-400">/</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Dense Utility Topbar */}
        <header className="h-16 bg-white border-b border-gray-100 px-7 flex items-center justify-between shrink-0 shadow-soft">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="font-bold text-[#111827]">Admin Portal</span>
            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-gray-600 font-medium capitalize">{title}</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] font-bold text-[#0F4C5C] bg-[#E6F0F1] px-3 py-1 rounded-full">
              Sistem Underwriting Aktif • OJK Audit Ready
            </span>
            <div className="h-4 w-px bg-gray-200"></div>

            {/* Profile menu: click to reveal user info + logout */}
            <div className="relative" ref={profileMenuRef}>
              <button
                id="header-profile-menu-trigger"
                onClick={() => setIsProfileMenuOpen((open) => !open)}
                className="flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-full text-xs text-[#111827] hover:bg-gray-100 transition-colors cursor-pointer"
                aria-haspopup="true"
                aria-expanded={isProfileMenuOpen}
              >
                <div className="w-7 h-7 rounded-full bg-[#0F4C5C] text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                  {userInitials}
                </div>
                <span className="font-bold">{currentUser?.name || 'Staff'}</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-gray-400 transition-transform ${isProfileMenuOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {isProfileMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl border border-gray-100 shadow-soft-lg overflow-hidden z-50">
                  <div className="p-4 border-b border-gray-100 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#0F4C5C] text-white font-bold text-xs flex items-center justify-center shrink-0">
                      {userInitials}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-[#111827] truncate">{currentUser?.name || 'Staff'}</div>
                      <div className="text-[11px] text-gray-500 truncate">{currentUser?.role}</div>
                      {currentUser?.department && (
                        <div className="text-[10px] text-gray-400 truncate">{currentUser.department}</div>
                      )}
                    </div>
                  </div>
                  <button
                    id="header-logout-btn"
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2 px-4 py-3 text-xs text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer font-bold"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Keluar Sesi Portal</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content Container */}
        <main className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-[#111827]">{title}</h1>
              {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
            </div>
            {action && <div>{action}</div>}
          </div>

          {children}
        </main>
      </div>
    </div>
  );
};
