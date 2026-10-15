import React, { useState } from 'react';
import { useApp } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { 
  Building2, 
  Globe, 
  UserCheck, 
  ChevronDown, 
  ShieldCheck, 
  Sparkles,
  LogOut
} from 'lucide-react';

export const Header: React.FC = () => {
  const { 
    currentUser, 
    setCurrentUserRole, 
    language, 
    setLanguage, 
    t, 
    setActiveTab, 
    activeTab, 
    signOut, 
    signInWithGoogle,
    demoLoginAs 
  } = useApp();

  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

  const roles: { id: UserRole; label: string; desc: string }[] = [
    { id: 'chairperson', label: t.chairperson, desc: 'Full group oversight, approvals & assemblies' },
    { id: 'treasurer', label: t.treasurer, desc: 'Contributions, loans, bank reconciliation' },
    { id: 'secretary', label: t.secretary, desc: 'Meeting minutes, member registry, circulars' },
    { id: 'super_admin', label: t.super_admin, desc: 'Platform configuration & security rules' },
    { id: 'member', label: t.member, desc: 'Personal savings passbook, loan status & statements' }
  ];

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-8 px-6 py-3.5 bg-white border-b border-slate-200 shadow-xs">
      {/* Zone 1: Brand Wordmark (Single element) */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-9 h-9 rounded-lg bg-emerald-900 text-amber-400 flex items-center justify-center font-bold text-lg shadow-xs">
          H
        </div>
        <div className="flex flex-col">
          <span 
            onClick={() => setActiveTab('dashboard')} 
            className="text-base font-bold tracking-tight text-slate-900 whitespace-nowrap cursor-pointer hover:text-emerald-800 transition-colors"
          >
            Hindurubuzima Saving Group
          </span>
          <span className="text-xs text-slate-500 whitespace-nowrap hidden sm:inline">
            Gisozi, Gasabo · Rwanda Cooperative Registry
          </span>
        </div>
      </div>

      {/* Zone 2: Concise Single-Line Navigation Links */}
      <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-600">
        <button 
          onClick={() => setActiveTab('dashboard')}
          className={`hover:text-emerald-800 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'dashboard' ? 'text-emerald-800 font-semibold' : ''
          }`}
        >
          {t.dashboard}
        </button>
        <button 
          onClick={() => setActiveTab('members')}
          className={`hover:text-emerald-800 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'members' ? 'text-emerald-800 font-semibold' : ''
          }`}
        >
          {t.members}
        </button>
        <button 
          onClick={() => setActiveTab('contributions')}
          className={`hover:text-emerald-800 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'contributions' ? 'text-emerald-800 font-semibold' : ''
          }`}
        >
          {t.contributions}
        </button>
        <button 
          onClick={() => setActiveTab('loans')}
          className={`hover:text-emerald-800 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'loans' ? 'text-emerald-800 font-semibold' : ''
          }`}
        >
          {t.loans}
        </button>
        <button 
          onClick={() => setActiveTab('reports')}
          className={`hover:text-emerald-800 transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'reports' ? 'text-emerald-800 font-semibold' : ''
          }`}
        >
          {t.reports}
        </button>
      </nav>

      {/* Zone 3: Primary Action & User Persona Controls */}
      <div className="flex items-center gap-3 shrink-0">
        {/* Language Switcher */}
        <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
          <button
            onClick={() => setLanguage('en')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              language === 'en' ? 'bg-white text-emerald-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            EN
          </button>
          <button
            onClick={() => setLanguage('rw')}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              language === 'rw' ? 'bg-white text-emerald-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            RW
          </button>
        </div>

        {/* Role Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 transition-colors cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
            <span className="hidden sm:inline text-slate-500">Role:</span>
            <span className="font-semibold text-emerald-900">{t[currentUser.role] || currentUser.role}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
          </button>

          {isRoleDropdownOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50">
              <div className="px-3 py-1.5 border-b border-slate-100">
                <p className="text-xs font-semibold text-slate-800">Switch Role Persona</p>
                <p className="text-[11px] text-slate-500">Test access control for all 5 roles</p>
              </div>
              {roles.map(r => (
                <button
                  key={r.id}
                  onClick={() => {
                    demoLoginAs(r.id);
                    setIsRoleDropdownOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs flex flex-col gap-0.5 hover:bg-slate-50 cursor-pointer ${
                    currentUser.role === r.id ? 'bg-emerald-50 text-emerald-900 font-semibold' : 'text-slate-700'
                  }`}
                >
                  <span className="font-medium">{r.label}</span>
                  <span className="text-[10px] text-slate-500 font-normal">{r.desc}</span>
                </button>
              ))}
              <div className="border-t border-slate-100 mt-1 pt-1">
                <button
                  onClick={() => {
                    signInWithGoogle();
                    setIsRoleDropdownOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-emerald-700 hover:bg-emerald-50 font-medium flex items-center gap-2 cursor-pointer"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  Sign In with Google Account
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Current User Pill / Info */}
        <div className="hidden md:flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-emerald-800 text-white flex items-center justify-center text-xs font-bold">
            {currentUser.displayName.charAt(0)}
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs font-semibold text-slate-800 leading-tight">
              {currentUser.displayName}
            </span>
            <span className="text-[10px] text-slate-500 leading-tight">
              {currentUser.email}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
