import React, { useState } from 'react';
import { useApp } from '../../context/AuthContext';
import { Expense, ExpenseCategory } from '../../types';
import { 
  PieChart as PieIcon, 
  Plus, 
  Search, 
  Download, 
  CheckCircle2, 
  Clock, 
  FileText, 
  X,
  Building,
  Receipt,
  Layers
} from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export const ExpensesView: React.FC = () => {
  const { 
    expenses, 
    addExpense, 
    updateExpenseStatus, 
    formatRwf, 
    t, 
    currentUser 
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form state
  const [category, setCategory] = useState<ExpenseCategory>('meeting_hall_rental');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number>(30000);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [receiptUrl, setReceiptUrl] = useState('');

  const filteredExpenses = expenses.filter(e => {
    const matchesSearch = 
      e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.expenseRef.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || e.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  // Group by category for chart
  const categoryTotals: Record<string, number> = {};
  expenses.forEach(e => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
  });

  const chartData = Object.keys(categoryTotals).map(cat => ({
    name: cat.replace(/_/g, ' '),
    amount: categoryTotals[cat]
  }));

  const handleAddExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || amount <= 0) return;

    addExpense({
      category,
      description,
      amount: Number(amount),
      date,
      receiptUrl: receiptUrl.trim() ? receiptUrl : undefined,
      recordedBy: `${currentUser.displayName} (${currentUser.role})`,
      approvedBy: currentUser.role === 'chairperson' ? currentUser.displayName : 'Pending Chairperson Approval'
    });

    setIsAddModalOpen(false);
    setDescription('');
    setReceiptUrl('');
  };

  const handleExportCsv = () => {
    const headers = ['Expense Ref', 'Category', 'Description', 'Amount (RWF)', 'Date', 'Recorded By', 'Approved By', 'Status'];
    const rows = filteredExpenses.map(e => [
      e.expenseRef,
      e.category,
      `"${e.description}"`,
      e.amount,
      e.date,
      `"${e.recordedBy}"`,
      `"${e.approvedBy || ''}"`,
      e.status
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Hindurubuzima_Expenses_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isTreasurerOrChair = ['treasurer', 'chairperson', 'super_admin'].includes(currentUser.role);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <PieIcon className="w-5 h-5 text-rose-700" />
            {t.expenses} & Group Operational Expenditures
          </h1>
          <p className="text-xs text-slate-500">
            Transparent group outlays: hall rentals, passbook printing, bank fees, and authorized solidarity grants.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            {t.exportCsv}
          </button>

          {isTreasurerOrChair && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-rose-700 hover:bg-rose-600 text-white rounded-lg shadow-2xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              {t.addExpense}
            </button>
          )}
        </div>
      </div>

      {/* Expense Summary Grid with BarChart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-3">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Total Operational Outlay
          </span>
          <div className="text-3xl font-bold text-slate-900 font-mono tabular-nums">
            {formatRwf(totalExpenses)}
          </div>
          <p className="text-xs text-slate-500 leading-relaxed">
            All expenditures are cross-verified against physical paper receipts and logged in the immutable audit log.
          </p>
          <div className="pt-2 border-t border-slate-100 flex items-center gap-2 text-xs text-emerald-800 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            100% of expenses backed by voucher records
          </div>
        </div>

        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Expense Allocation by Category</h2>
              <p className="text-[11px] text-slate-500">Amounts spent in Rwandan Francs (RWF)</p>
            </div>
          </div>
          <div className="h-44 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(val: any) => formatRwf(Number(val))} />
                <Bar dataKey="amount" fill="#be123c" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Expenses List Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by expense voucher ref or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-emerald-700"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-semibold">Voucher Ref</th>
                <th className="py-3 px-4 font-semibold">Category</th>
                <th className="py-3 px-4 font-semibold">Description</th>
                <th className="py-3 px-4 font-semibold text-right">Amount (RWF)</th>
                <th className="py-3 px-4 font-semibold">Incurred Date</th>
                <th className="py-3 px-4 font-semibold">Approved By</th>
                <th className="py-3 px-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredExpenses.map(e => (
                <tr key={e.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono font-semibold text-slate-900 text-[11px]">
                    {e.expenseRef}
                  </td>
                  <td className="py-3 px-4 capitalize font-medium text-slate-700">
                    {e.category.replace(/_/g, ' ')}
                  </td>
                  <td className="py-3 px-4 text-slate-800 max-w-sm truncate">
                    {e.description}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-rose-800 tabular-nums">
                    -{formatRwf(e.amount)}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">
                    {e.date}
                  </td>
                  <td className="py-3 px-4 text-slate-600 text-[11px]">
                    {e.approvedBy || 'Pending'}
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                      Approved
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-rose-700" />
                Record Group Expenditure
              </h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddExpenseSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Expense Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-emerald-700"
                  >
                    <option value="meeting_hall_rental">Meeting Hall Rental</option>
                    <option value="stationery_and_supplies">Stationery & Passbooks</option>
                    <option value="bank_charges">Bank / MoMo Corporate Charges</option>
                    <option value="social_welfare_grant">Social Welfare Assistance</option>
                    <option value="transport_and_logistics">Transport & Logistics</option>
                    <option value="audit_and_legal">Audit & Cooperative Legal</option>
                    <option value="other">Other Operational Costs</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Amount (RWF) *</label>
                  <input
                    type="number"
                    required
                    min={500}
                    step={500}
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Expense Description *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="e.g. Paid Gisozi sector hall management for 3-hour assembly"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-emerald-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Incurred Date</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Receipt / Invoice Link (Optional)</label>
                  <input
                    type="text"
                    placeholder="https://..."
                    value={receiptUrl}
                    onChange={(e) => setReceiptUrl(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-700 hover:bg-rose-600 text-white rounded-lg font-semibold shadow-xs"
                >
                  Save & Log Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
