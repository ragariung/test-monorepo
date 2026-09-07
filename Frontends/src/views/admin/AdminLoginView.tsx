import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, Key, ArrowRight, UserCheck, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Button } from '../../components/common/Button';

/**
 * Local-only demo directory for the quick-login shortcuts below. Not sourced
 * from the real staffList in context, because that list requires an
 * authenticated session to fetch (GET /admin/users) - a chicken-and-egg
 * problem on the login page itself. See Docs/DUMMY_ACCESS.md for the
 * authoritative, kept-in-sync list of seeded demo accounts.
 */
const DEMO_ACCOUNTS = [
  { email: 'admin@praxis.co.id', name: 'PRAXIS Admin', role: 'Admin', department: 'System Administration' },
  { email: 'bambang.soedirman@praxis.co.id', name: 'Bambang Soedirman', role: 'Underwriter Manager', department: 'Underwriting & Risk Governance' },
  { email: 'sarah.wijaya@praxis.co.id', name: 'Sarah Wijaya', role: 'Senior Underwriter', department: 'Life & Medical Assessment' },
  { email: 'bobby.pratama@praxis.co.id', name: 'Bobby Pratama', role: 'Senior Underwriter', department: 'Wealth & Legacy Solutions' },
  { email: 'rangga.pradipta@praxis.co.id', name: 'Rangga Pradipta', role: 'Underwriter', department: 'Life & Medical Assessment' },
  { email: 'dewi.anggraeni@praxis.co.id', name: 'Dewi Anggraeni', role: 'Tele-Consultant', department: 'Digital Lead Qualification' },
  { email: 'citra.aditama@praxis.co.id', name: 'Citra Aditama', role: 'Auditor (read-only)', department: 'Compliance & Internal Audit' },
];
const DEMO_PASSWORD = 'praxis123';

export const AdminLoginView: React.FC = () => {
  const { login, navigate } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const attemptLogin = async (loginEmail: string, loginPassword: string) => {
    setError('');
    setIsSubmitting(true);
    try {
      await login(loginEmail, loginPassword);
    } catch {
      setError('Email atau kata sandi salah.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormLogin = (e: React.FormEvent) => {
    e.preventDefault();
    attemptLogin(email, password);
  };

  const handleQuickLogin = (account: (typeof DEMO_ACCOUNTS)[number]) => {
    setEmail(account.email);
    setPassword(DEMO_PASSWORD);
    attemptLogin(account.email, DEMO_PASSWORD);
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col justify-center items-center p-4 sm:p-6 font-sans text-[#111827]">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Lockup (Simple, utilitarian, no marketing fluff) */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-[#0F4C5C] text-white flex items-center justify-center mx-auto shadow-soft border border-[#0F4C5C]/20">
            <ShieldCheck className="w-8 h-8 text-emerald-400" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#111827]">
            PRAXIS Internal Portal
          </h1>
          <p className="text-xs text-gray-500">
            Sistem Administrasi Underwriting & Manajemen Aplikasi Polis
          </p>
        </div>

        {/* Utilitarian Login Card */}
        <div className="bg-white rounded-[28px] border border-gray-100 shadow-soft p-7 sm:p-8 space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-gray-100 text-xs text-gray-500 font-bold">
            <Lock className="w-3.5 h-3.5 text-[#0F4C5C]" />
            <span>Autentikasi Karyawan & Underwriter Berwenang</span>
          </div>

          <form onSubmit={handleFormLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="staff-email" className="block text-xs font-bold text-[#111827]">
                Email Internal (@praxis.co.id)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="staff-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-[#F8FAFB] border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F4C5C] focus:bg-white text-[#111827] transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <label htmlFor="staff-pwd" className="font-bold text-[#111827]">
                  Kata Sandi
                </label>
                <span className="text-gray-400 text-[11px]">SSO / 2FA Terintegrasi</span>
              </div>
              <div className="relative">
                <Key className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="staff-pwd"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 text-xs bg-[#F8FAFB] border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F4C5C] focus:bg-white text-[#111827] transition-all"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-3.5 py-2.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button
              id="admin-login-submit"
              type="submit"
              variant="accent"
              size="md"
              className="w-full justify-center mt-2 rounded-xl"
              icon={<ArrowRight className="w-4 h-4" />}
              iconPosition="right"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Memproses...' : 'Masuk ke Portal Internal'}
            </Button>
          </form>

          {/* Quick Demo Role Picker for Easy Evaluation */}
          <div className="pt-4 border-t border-gray-100 space-y-3">
            <div className="flex items-center justify-between text-[11px] text-gray-400 font-bold uppercase tracking-wider">
              <span>Akses Demo Cepat:</span>
              <span className="text-[10px] text-[#0F4C5C] font-semibold">Klik untuk langsung login</span>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {DEMO_ACCOUNTS.map((account) => (
                <button
                  key={account.email}
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => handleQuickLogin(account)}
                  className="w-full text-left p-3 rounded-2xl border border-gray-100 hover:border-[#0F4C5C]/30 bg-[#F8FAFB] hover:bg-[#E6F0F1]/40 transition-all flex items-center justify-between group cursor-pointer disabled:opacity-50 disabled:cursor-wait"
                >
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold text-[#111827] group-hover:text-[#0F4C5C]">
                      {account.name}
                    </div>
                    <div className="text-[11px] text-gray-400">
                      {account.role} • {account.department}
                    </div>
                  </div>
                  <UserCheck className="w-4 h-4 text-gray-400 group-hover:text-[#0F4C5C] shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Back to public website */}
        <div className="text-center">
          <button
            onClick={() => navigate('/')}
            className="text-xs text-gray-500 hover:text-[#0F4C5C] underline transition-colors cursor-pointer font-medium"
          >
            ← Kembali ke Halaman Publik PRAXIS Insurance
          </button>
        </div>
      </div>
    </div>
  );
};
