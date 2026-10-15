import React, { useState } from 'react';
import { useApp } from '../../context/AuthContext';
import { 
  PiggyBank, 
  ArrowDownRight, 
  HandCoins, 
  Receipt, 
  Wallet, 
  PieChart as PieIcon, 
  Users, 
  Calendar, 
  ArrowUpRight, 
  AlertTriangle, 
  Plus, 
  TrendingUp, 
  FileText,
  Search,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

interface DashboardViewProps {
  onOpenRecordContribution: () => void;
  onOpenApplyLoan: () => void;
  onOpenRecordRepayment: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onOpenRecordContribution,
  onOpenApplyLoan,
  onOpenRecordRepayment
}) => {
  const { 
    members, 
    contributions, 
    loans, 
    repayments, 
    expenses, 
    meetings, 
    announcements, 
    savingsGoals,
    formatRwf, 
    t, 
    setActiveTab, 
    currentUser 
  } = useApp();

  const [timeframe, setTimeframe] = useState<'all' | '2026' | 'q4'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Financial KPI calculations
  const totalSavings = members.reduce((sum, m) => sum + m.totalSavings, 0);
  const totalContributions = contributions.reduce((sum, c) => sum + c.amount, 0);
  const totalDisbursedLoans = loans
    .filter(l => l.status === 'disbursed' || l.status === 'closed')
    .reduce((sum, l) => sum + (l.approvedAmount || l.requestedAmount), 0);
  const totalOutstandingLoans = loans
    .filter(l => l.status === 'disbursed')
    .reduce((sum, l) => sum + l.outstandingBalance, 0);
  const totalRepayments = repayments.reduce((sum, r) => sum + r.amount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  
  // Available Cash in Box = (Total verified contributions + repayments) - (Total loan principal disbursements + approved expenses)
  const availableCash = (totalContributions + totalRepayments) - (totalDisbursedLoans + totalExpenses);
  const activeMembersCount = members.filter(m => m.status === 'active').length;

  // Next meeting
  const nextMeeting = meetings[0];

  // Overdue loans calculation
  const pendingLoans = loans.filter(l => l.status === 'pending');
  const activeLoans = loans.filter(l => l.status === 'disbursed');

  // Chart data: Monthly Savings vs Loans Performance
  const monthlyData = [
    { month: 'Jun', savings: 2400000, loans: 1100000, repayments: 320000 },
    { month: 'Jul', savings: 3100000, loans: 1400000, repayments: 550000 },
    { month: 'Aug', savings: 3850000, loans: 1950000, repayments: 740000 },
    { month: 'Sep', savings: 4350000, loans: 2350000, repayments: 980000 },
    { month: 'Oct', savings: totalContributions, loans: totalDisbursedLoans, repayments: totalRepayments }
  ];

  // Fund Breakdown Pie
  const fundBreakdown = [
    { name: 'Regular Savings', value: 3400000, color: '#065f46' },
    { name: 'Emergency Welfare', value: 850000, color: '#0d9488' },
    { name: 'Share Capital', value: 600000, color: '#ca8a04' }
  ];

  // Recent 5 transactions across contributions and repayments
  const combinedTransactions = [
    ...contributions.map(c => ({
      id: c.id,
      ref: c.transactionRef,
      type: 'contribution',
      category: c.type.replace('_', ' '),
      name: c.memberName,
      amount: c.amount,
      date: c.date,
      status: c.status
    })),
    ...repayments.map(r => ({
      id: r.id,
      ref: r.repaymentRef,
      type: 'repayment',
      category: `Loan ${r.loanNumber}`,
      name: r.memberName,
      amount: r.amount,
      date: r.paymentDate,
      status: r.status
    }))
  ]
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  .filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    item.ref.toLowerCase().includes(searchTerm.toLowerCase())
  )
  .slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Top Banner / Hero with authentic imagery & Action Bar */}
      <div className="relative rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 text-white shadow-sm">
        <div className="absolute inset-0 opacity-25">
          <img
            src="/src/assets/images/hindurubuzima_hero_banner_1792046488068.jpg"
            alt="Hindurubuzima Community Savings Group Meeting"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="relative z-10 p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-r from-slate-950/90 via-slate-900/80 to-transparent">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-amber-400">
              <span>Ibimina byo Kwizigama no Kugurizanya</span>
              <span aria-hidden="true">·</span>
              <span>Rwanda Cooperative Agency</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
              {t.appName}
            </h1>
            <p className="text-xs md:text-sm text-slate-300">
              Transparent, tamper-proof collective savings, community micro-loans, and automated ledger accounting for our community members.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {(currentUser.role === 'treasurer' || currentUser.role === 'chairperson' || currentUser.role === 'super_admin') && (
              <button
                onClick={onOpenRecordContribution}
                className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow-sm transition-all cursor-pointer whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
                {t.recordContribution}
              </button>
            )}

            <button
              onClick={onOpenApplyLoan}
              className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg shadow-sm transition-all cursor-pointer whitespace-nowrap"
            >
              <HandCoins className="w-4 h-4" />
              {t.applyForLoan}
            </button>

            {(currentUser.role === 'treasurer' || currentUser.role === 'chairperson' || currentUser.role === 'super_admin') && (
              <button
                onClick={onOpenRecordRepayment}
                className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 rounded-lg transition-all cursor-pointer whitespace-nowrap"
              >
                <Receipt className="w-4 h-4" />
                {t.recordRepayment}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* KPI Cards Strip (High density, zero-pill, tabular numbers) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Group Savings */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">{t.totalGroupSavings}</span>
            <PiggyBank className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-2xl font-bold text-slate-900 tabular-nums">
            {formatRwf(totalSavings)}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1.5">
            <span className="text-emerald-700 font-semibold">+18.4%</span>
            <span>growth this quarter</span>
          </div>
        </div>

        {/* Card 2: Available Cash in Safe/Bank */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">{t.availableCash}</span>
            <Wallet className="w-4 h-4 text-teal-700" />
          </div>
          <div className="text-2xl font-bold text-emerald-900 tabular-nums">
            {formatRwf(availableCash)}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1.5">
            <span>Verified safe balance</span>
            <span aria-hidden="true">·</span>
            <span className="text-slate-700 font-medium">Liquid</span>
          </div>
        </div>

        {/* Card 3: Outstanding Loan Portfolio */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">{t.outstandingLoans}</span>
            <HandCoins className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-950 tabular-nums">
            {formatRwf(totalOutstandingLoans)}
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1.5">
            <span className="font-semibold text-slate-800">{activeLoans.length} active loans</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-700">98% recovery rate</span>
          </div>
        </div>

        {/* Card 4: Active Members & Assembly */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium">{t.activeMembers}</span>
            <Users className="w-4 h-4 text-slate-700" />
          </div>
          <div className="text-2xl font-bold text-slate-900 tabular-nums">
            {activeMembersCount} <span className="text-sm font-normal text-slate-500">members</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1.5">
            <span>Next: {nextMeeting ? new Date(nextMeeting.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : 'Scheduled'}</span>
            <span aria-hidden="true">·</span>
            <span className="text-emerald-700 font-medium">Gisozi</span>
          </div>
        </div>
      </div>

      {/* Secondary Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500">{t.totalContributions}</span>
            <div className="text-lg font-bold text-slate-900 tabular-nums">
              {formatRwf(totalContributions)}
            </div>
          </div>
          <ArrowDownRight className="w-5 h-5 text-emerald-700" />
        </div>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500">{t.totalRepayments}</span>
            <div className="text-lg font-bold text-slate-900 tabular-nums">
              {formatRwf(totalRepayments)}
            </div>
          </div>
          <Receipt className="w-5 h-5 text-blue-700" />
        </div>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500">{t.totalExpenses}</span>
            <div className="text-lg font-bold text-slate-900 tabular-nums">
              {formatRwf(totalExpenses)}
            </div>
          </div>
          <PieIcon className="w-5 h-5 text-rose-700" />
        </div>
      </div>

      {/* Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart: Financial Performance Trend */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Savings, Loans & Repayment Trends
              </h2>
              <p className="text-xs text-slate-500">
                Monthly cumulative capital flow in Rwandan Francs (RWF)
              </p>
            </div>
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
              <button 
                onClick={() => setTimeframe('all')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  timeframe === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Cycles
              </button>
              <button 
                onClick={() => setTimeframe('2026')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  timeframe === '2026' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                2026
              </button>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#065f46" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#065f46" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorLoans" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d97706" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#d97706" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis 
                  tick={{ fontSize: 11, fill: '#64748b' }} 
                  axisLine={false} 
                  tickLine={false} 
                  tickFormatter={(val) => `${(val / 1000000).toFixed(1)}M`} 
                />
                <Tooltip 
                  formatter={(val: any) => [formatRwf(Number(val)), '']} 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="savings" name="Total Savings" stroke="#065f46" strokeWidth={2} fillOpacity={1} fill="url(#colorSavings)" />
                <Area type="monotone" dataKey="loans" name="Disbursed Loans" stroke="#d97706" strokeWidth={2} fillOpacity={1} fill="url(#colorLoans)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-center gap-6 text-xs text-slate-600 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-700"></span>
              <span>Accumulated Savings</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-amber-600"></span>
              <span>Disbursed Loans</span>
            </div>
          </div>
        </div>

        {/* Side Chart: Savings Portfolio Distribution */}
        <div className="bg-white p-6 rounded-xl border border-slate-200/90 shadow-2xs space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Savings Fund Allocation
            </h2>
            <p className="text-xs text-slate-500">
              Distribution across mandatory and voluntary pools
            </p>
          </div>

          <div className="h-52 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={fundBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {fundBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(val: any) => formatRwf(Number(val))} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 text-xs">
            {fundBreakdown.map(item => (
              <div key={item.name} className="flex items-center justify-between py-1 border-b border-slate-100 last:border-0">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-700">{item.name}</span>
                </div>
                <span className="font-semibold text-slate-900 font-mono tabular-nums">{formatRwf(item.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Grid: Recent Transactions & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Financial Transactions Ledger */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Recent Financial Ledger Entries
              </h2>
              <p className="text-xs text-slate-500">
                Real-time verified deposits, contributions and loan repayments
              </p>
            </div>
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search reference or member..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-emerald-700"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 border-y border-slate-200">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Reference</th>
                  <th className="py-2.5 px-3 font-semibold">Member</th>
                  <th className="py-2.5 px-3 font-semibold">Category</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Amount (RWF)</th>
                  <th className="py-2.5 px-3 font-semibold">Date</th>
                  <th className="py-2.5 px-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {combinedTransactions.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-3 font-mono text-[11px] font-semibold text-slate-700">
                      {item.ref}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-slate-900">
                      {item.name}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 capitalize">
                      {item.category}
                    </td>
                    <td className={`py-2.5 px-3 text-right font-mono font-semibold tabular-nums ${
                      item.type === 'contribution' ? 'text-emerald-800' : 'text-blue-800'
                    }`}>
                      +{formatRwf(item.amount)}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">
                      {item.date}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Verified
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={() => setActiveTab('contributions')}
              className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 cursor-pointer"
            >
              View Full Transaction Ledger
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Actionable Alerts & Upcoming Assembly */}
        <div className="space-y-4">
          {/* Upcoming Assembly */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Upcoming Assembly
              </span>
              <Calendar className="w-4 h-4 text-emerald-700" />
            </div>

            {nextMeeting ? (
              <div className="space-y-2">
                <h3 className="text-sm font-bold text-slate-900">
                  {nextMeeting.title}
                </h3>
                <div className="text-xs text-slate-600 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{new Date(nextMeeting.date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400">Venue:</span>
                    <span className="font-medium text-slate-800">{nextMeeting.location}</span>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('meetings')}
                  className="w-full mt-2 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer"
                >
                  Review Agenda & Attendance
                </button>
              </div>
            ) : (
              <p className="text-xs text-slate-500">No meeting scheduled yet.</p>
            )}
          </div>

          {/* Pending Loans Alert */}
          {pendingLoans.length > 0 && (
            <div className="bg-amber-50/70 p-5 rounded-xl border border-amber-200 space-y-3">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>{pendingLoans.length} Loan Applications Require Review</span>
              </div>
              <p className="text-xs text-amber-800 leading-relaxed">
                New loan requests totaling {formatRwf(pendingLoans.reduce((acc, l) => acc + l.requestedAmount, 0))} submitted by members awaiting committee approval.
              </p>
              <button
                onClick={() => setActiveTab('loans')}
                className="w-full py-2 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors cursor-pointer"
              >
                Go to Loan Approval Queue
              </button>
            </div>
          )}

          {/* Savings Goals Spotlight */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/90 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Group Target Spotlight
              </span>
              <button
                onClick={() => setActiveTab('savingsGoals')}
                className="text-[11px] text-emerald-800 font-semibold hover:underline"
              >
                View all
              </button>
            </div>

            {savingsGoals.slice(0, 2).map(goal => {
              const pct = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
              return (
                <div key={goal.id} className="space-y-1.5 pt-2 border-t border-slate-100 first:border-0 first:pt-0">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-800 truncate pr-2">{goal.title}</span>
                    <span className="font-mono text-emerald-800 font-bold">{pct}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-emerald-700 h-2 rounded-full transition-all duration-500" 
                      style={{ width: `${pct}%` }} 
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                    <span>{formatRwf(goal.currentAmount)}</span>
                    <span>Target: {formatRwf(goal.targetAmount)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
