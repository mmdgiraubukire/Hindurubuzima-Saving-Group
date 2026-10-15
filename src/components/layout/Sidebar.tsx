import React from 'react';
import { useApp, ActiveTab } from '../../context/AuthContext';
import { 
  LayoutDashboard, 
  Users, 
  PiggyBank, 
  ArrowDownRight, 
  HandCoins, 
  Receipt, 
  PieChart, 
  Target, 
  FileSpreadsheet, 
  FileText, 
  CalendarDays, 
  Megaphone, 
  History,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';

interface SidebarItem {
  id: ActiveTab;
  label: string;
  icon: React.ElementType;
  rolesAllowed?: string[];
  badge?: number;
}

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, t, currentUser, loans, announcements } = useApp();

  const pendingLoansCount = loans.filter(l => l.status === 'pending').length;
  const urgentAnnouncementsCount = announcements.filter(a => a.priority === 'urgent').length;

  const navItems: SidebarItem[] = [
    { id: 'dashboard', label: t.dashboard, icon: LayoutDashboard },
    { id: 'members', label: t.members, icon: Users },
    { id: 'savings', label: t.savings, icon: PiggyBank },
    { id: 'contributions', label: t.contributions, icon: ArrowDownRight },
    { id: 'loans', label: t.loans, icon: HandCoins, badge: pendingLoansCount > 0 ? pendingLoansCount : undefined },
    { id: 'repayments', label: t.repayments, icon: Receipt },
    { id: 'expenses', label: t.expenses, icon: PieChart },
    { id: 'budgets', label: t.budgets, icon: Target },
    { id: 'savingsGoals', label: t.savingsGoals, icon: PiggyBank },
    { id: 'bankImports', label: t.bankImports, icon: FileSpreadsheet },
    { id: 'reports', label: t.reports, icon: FileText },
    { id: 'meetings', label: t.meetings, icon: CalendarDays },
    { id: 'announcements', label: t.announcements, icon: Megaphone, badge: urgentAnnouncementsCount > 0 ? urgentAnnouncementsCount : undefined },
    { id: 'auditLogs', label: t.auditLogs, icon: History }
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shrink-0 min-h-[calc(100vh-61px)] border-r border-slate-800">
      {/* Group Info Badge */}
      <div className="p-4 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-800/60 border border-emerald-600/30 flex items-center justify-center text-amber-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-white tracking-wide">
              Hindurubuzima Group
            </div>
            <div className="text-[11px] text-emerald-400 font-medium">
              Active Savings Cycle 2026
            </div>
          </div>
        </div>
      </div>

      {/* Nav Link List */}
      <div className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
        <div className="text-[10px] font-semibold text-slate-400 px-3 py-1 uppercase tracking-wider">
          Financial Management
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer group ${
                isActive 
                  ? 'bg-emerald-800 text-white font-semibold shadow-xs' 
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-400 group-hover:text-slate-200'}`} />
                <span className="truncate">{item.label}</span>
              </div>
              
              {item.badge !== undefined && (
                <span className={`px-1.5 py-0.5 text-[10px] rounded-md font-bold ${
                  isActive ? 'bg-amber-400 text-slate-950' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Legal / Cooperative Identity */}
      <div className="p-4 border-t border-slate-800 text-[11px] text-slate-400 flex flex-col gap-1">
        <div className="flex items-center justify-between text-slate-300 font-medium">
          <span>Kigali, Rwanda</span>
          <span className="text-emerald-400 font-mono">Frw</span>
        </div>
        <p className="text-[10px] text-slate-400 leading-tight">
          Licensed under RCA Cooperative Framework
        </p>
      </div>
    </aside>
  );
};
