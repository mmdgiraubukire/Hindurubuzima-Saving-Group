import React, { useState } from 'react';
import { useApp } from '../../context/AuthContext';
import { SavingsGoal } from '../../types';
import { 
  Target, 
  PiggyBank, 
  Plus, 
  TrendingUp, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  X,
  PieChart
} from 'lucide-react';

export const BudgetsGoalsView: React.FC = () => {
  const { 
    savingsGoals, 
    budgets, 
    expenses, 
    addSavingsGoal, 
    updateSavingsGoal, 
    formatRwf, 
    t, 
    currentUser 
  } = useApp();

  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<SavingsGoal['category']>('cooperative_investment');
  const [targetAmount, setTargetAmount] = useState<number>(5000000);
  const [targetDate, setTargetDate] = useState('2027-06-30');
  const [description, setDescription] = useState('');

  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || targetAmount <= 0) return;

    addSavingsGoal({
      title,
      category,
      targetAmount: Number(targetAmount),
      targetDate,
      createdBy: currentUser.displayName,
      description
    });

    setIsGoalModalOpen(false);
    setTitle('');
    setDescription('');
  };

  const isOfficer = ['chairperson', 'treasurer', 'super_admin'].includes(currentUser.role);

  return (
    <div className="space-y-8">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Target className="w-5 h-5 text-emerald-800" />
            {t.budgets} & Strategic Savings Goals
          </h1>
          <p className="text-xs text-slate-500">
            Cooperative milestone goals, capital development targets, and operational expense budget ceilings.
          </p>
        </div>

        {isOfficer && (
          <button
            onClick={() => setIsGoalModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg shadow-2xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Create Savings Goal
          </button>
        )}
      </div>

      {/* Group Savings Goals Showcase Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Active Community Investment & Savings Goals
          </h2>
          <span className="text-xs text-slate-500">Tracked toward year-end shareout</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {savingsGoals.map(goal => {
            const pct = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));
            const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);

            return (
              <div key={goal.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-emerald-800 capitalize bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                      {goal.category.replace(/_/g, ' ')}
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-900">{pct}%</span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base leading-snug">
                    {goal.title}
                  </h3>

                  <p className="text-xs text-slate-500 line-clamp-2">
                    {goal.description || 'Community funded strategic cooperative capital development target.'}
                  </p>
                </div>

                <div className="space-y-3 pt-3 border-t border-slate-100">
                  {/* Progress Bar */}
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className={`h-2.5 rounded-full transition-all duration-700 ${
                        pct >= 100 ? 'bg-emerald-600' : 'bg-emerald-700'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-xs">
                    <div>
                      <span className="text-[11px] text-slate-400 block">Accumulated:</span>
                      <span className="font-mono font-bold text-slate-900">{formatRwf(goal.currentAmount)}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] text-slate-400 block">Target:</span>
                      <span className="font-mono font-semibold text-slate-700">{formatRwf(goal.targetAmount)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                    <span className="flex items-center gap-1 font-mono">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      Target: {goal.targetDate}
                    </span>
                    <span className="font-medium text-emerald-800">
                      {remaining === 0 ? 'Goal Achieved!' : `${formatRwf(remaining)} remaining`}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Budget vs Actual Comparison Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs space-y-4 p-6">
        <div>
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Fiscal Period Budget Allocation vs Actual Utilization
          </h2>
          <p className="text-xs text-slate-500">
            Monitoring approved spending caps to prevent budget deficits in cooperative administration.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-semibold">Budget Category</th>
                <th className="py-3 px-4 font-semibold">Fiscal Period</th>
                <th className="py-3 px-4 font-semibold text-right">Allocated Ceiling</th>
                <th className="py-3 px-4 font-semibold text-right">Actual Spent</th>
                <th className="py-3 px-4 font-semibold text-right">Available Margin</th>
                <th className="py-3 px-4 font-semibold text-center">Utilization</th>
                <th className="py-3 px-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {budgets.map(b => {
                const utilPct = Math.round((b.spentAmount / b.allocatedAmount) * 100);
                const margin = b.allocatedAmount - b.spentAmount;
                const isNearLimit = utilPct >= 80;

                return (
                  <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900 capitalize">
                      {b.category.replace(/_/g, ' ')}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500">
                      {b.fiscalPeriod}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 tabular-nums">
                      {formatRwf(b.allocatedAmount)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-rose-800 font-semibold">
                      {formatRwf(b.spentAmount)}
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-emerald-900 font-semibold">
                      {formatRwf(margin)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="font-mono font-bold">{utilPct}%</span>
                    </td>
                    <td className="py-3 px-4">
                      {isNearLimit ? (
                        <span className="text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-[11px] font-semibold flex items-center gap-1 w-fit">
                          <AlertTriangle className="w-3 h-3 text-amber-600" />
                          Near Ceiling
                        </span>
                      ) : (
                        <span className="text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px] font-medium flex items-center gap-1 w-fit">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Healthy
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Savings Goal Modal */}
      {isGoalModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-800" />
                Define New Savings Goal
              </h2>
              <button
                onClick={() => setIsGoalModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddGoal} className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Goal Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Modern Grain Warehouse Construction"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-emerald-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                  >
                    <option value="cooperative_investment">Cooperative Investment</option>
                    <option value="annual_dividend_payout">Annual Dividend Payout</option>
                    <option value="emergency_pool">Emergency Reserve Pool</option>
                    <option value="equipment_fund">Equipment Fund</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Target Amount (RWF) *</label>
                  <input
                    type="number"
                    required
                    min={100000}
                    step={100000}
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Target Maturity Date</label>
                <input
                  type="date"
                  required
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Detailed Description & Member Pledges</label>
                <textarea
                  rows={2}
                  placeholder="Explain the project scope and expected returns for members"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsGoalModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg font-semibold shadow-xs"
                >
                  Create Goal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
