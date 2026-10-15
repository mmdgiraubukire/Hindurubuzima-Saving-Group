import React, { useState } from 'react';
import { useApp } from '../../context/AuthContext';
import { Contribution, ContributionType, PaymentMethod } from '../../types';
import { 
  PiggyBank, 
  ArrowDownRight, 
  Plus, 
  Search, 
  Download, 
  Printer, 
  CheckCircle2, 
  AlertCircle, 
  Calendar,
  Filter,
  X,
  Receipt as ReceiptIcon
} from 'lucide-react';

interface SavingsViewProps {
  onOpenReceipt: (data: any) => void;
}

export const SavingsView: React.FC<SavingsViewProps> = ({ onOpenReceipt }) => {
  const { 
    contributions, 
    members, 
    addContribution, 
    formatRwf, 
    t, 
    currentUser 
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);

  // Form state
  const [memberId, setMemberId] = useState(members[0]?.id || '');
  const [amount, setAmount] = useState<number>(20000);
  const [type, setType] = useState<ContributionType>('regular_savings');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('momo');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  const filteredContributions = contributions.filter(c => {
    const matchesSearch = 
      c.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.transactionRef.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.receiptNo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || c.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const totalRegularSavings = contributions
    .filter(c => c.type === 'regular_savings')
    .reduce((sum, c) => sum + c.amount, 0);

  const totalEmergencyFund = contributions
    .filter(c => c.type === 'emergency_fund')
    .reduce((sum, c) => sum + c.amount, 0);

  const totalShareCapital = contributions
    .filter(c => c.type === 'share_purchase')
    .reduce((sum, c) => sum + c.amount, 0);

  const totalWelfareFund = contributions
    .filter(c => c.type === 'social_welfare')
    .reduce((sum, c) => sum + c.amount, 0);

  const handleRecordDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedMember = members.find(m => m.id === memberId);
    if (!selectedMember || amount <= 0) return;

    const newContrib = addContribution({
      memberId: selectedMember.id,
      memberNumber: selectedMember.memberNumber,
      memberName: selectedMember.fullName,
      amount: Number(amount),
      type,
      paymentMethod,
      date,
      recordedBy: `${currentUser.displayName} (${currentUser.role})`,
      notes
    });

    setIsDepositModalOpen(false);
    
    // Automatically open receipt
    onOpenReceipt({
      receiptNo: newContrib.receiptNo,
      transactionRef: newContrib.transactionRef,
      title: 'Contribution Receipt',
      memberName: newContrib.memberName,
      memberNumber: newContrib.memberNumber,
      amount: newContrib.amount,
      date: newContrib.date,
      type: newContrib.type.replace('_', ' ').toUpperCase(),
      paymentMethod: newContrib.paymentMethod,
      recordedBy: newContrib.recordedBy,
      notes: newContrib.notes
    });

    // Reset
    setNotes('');
  };

  const handleExportCsv = () => {
    const headers = ['Transaction Ref', 'Receipt No', 'Member ID', 'Member Name', 'Category', 'Amount (RWF)', 'Payment Method', 'Date', 'Officer', 'Status'];
    const rows = filteredContributions.map(c => [
      c.transactionRef,
      c.receiptNo,
      c.memberNumber,
      `"${c.memberName}"`,
      c.type,
      c.amount,
      c.paymentMethod,
      c.date,
      `"${c.recordedBy}"`,
      c.status
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Hindurubuzima_Savings_Ledger_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isTreasurerOrChair = ['treasurer', 'chairperson', 'super_admin'].includes(currentUser.role);

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <PiggyBank className="w-5 h-5 text-emerald-800" />
            {t.savings} & Member Contributions Ledger
          </h1>
          <p className="text-xs text-slate-500">
            Immutable financial ledger of individual member deposits, emergency welfare pools, and cooperative share capital.
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
              onClick={() => setIsDepositModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg shadow-2xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              {t.recordContribution}
            </button>
          )}
        </div>
      </div>

      {/* 4 Financial Savings Breakdown Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 block mb-1">Regular Monthly Savings</span>
          <div className="text-xl font-bold text-emerald-950 font-mono tabular-nums">
            {formatRwf(totalRegularSavings)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Core member deposits</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 block mb-1">Emergency Solidarity Fund</span>
          <div className="text-xl font-bold text-teal-900 font-mono tabular-nums">
            {formatRwf(totalEmergencyFund)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Hospitalization & crisis pool</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 block mb-1">Cooperative Share Capital</span>
          <div className="text-xl font-bold text-amber-900 font-mono tabular-nums">
            {formatRwf(totalShareCapital)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Valued @ 5,000 RWF / share</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 block mb-1">Social Welfare Grants</span>
          <div className="text-xl font-bold text-slate-900 font-mono tabular-nums">
            {formatRwf(totalWelfareFund)}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Community benevolence pool</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by transaction reference, receipt number, or member name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-emerald-700"
          />
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
          {[
            { id: 'all', label: 'All Funds' },
            { id: 'regular_savings', label: 'Regular' },
            { id: 'emergency_fund', label: 'Emergency' },
            { id: 'share_purchase', label: 'Shares' },
            { id: 'social_welfare', label: 'Welfare' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setTypeFilter(f.id)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                typeFilter === f.id 
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-semibold">Reference & Receipt</th>
                <th className="py-3 px-4 font-semibold">Member</th>
                <th className="py-3 px-4 font-semibold">Fund Type</th>
                <th className="py-3 px-4 font-semibold text-right">Amount (RWF)</th>
                <th className="py-3 px-4 font-semibold">Payment Method</th>
                <th className="py-3 px-4 font-semibold">Date</th>
                <th className="py-3 px-4 font-semibold">Recorded By</th>
                <th className="py-3 px-4 font-semibold text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredContributions.map(c => (
                <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-mono font-semibold text-slate-900 text-[11px]">{c.transactionRef}</div>
                    <div className="font-mono text-slate-400 text-[10px]">{c.receiptNo}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-medium text-slate-900">{c.memberName}</div>
                    <div className="font-mono text-slate-500 text-[10px]">{c.memberNumber}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="capitalize text-slate-700">
                      {c.type.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-emerald-900 tabular-nums">
                    +{formatRwf(c.amount)}
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-[11px] font-mono text-slate-600 uppercase">
                      {c.paymentMethod.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">
                    {c.date}
                  </td>
                  <td className="py-3 px-4 text-slate-600 text-[11px]">
                    {c.recordedBy}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => onOpenReceipt({
                        receiptNo: c.receiptNo,
                        transactionRef: c.transactionRef,
                        title: 'Contribution Deposit Voucher',
                        memberName: c.memberName,
                        memberNumber: c.memberNumber,
                        amount: c.amount,
                        date: c.date,
                        type: c.type.replace('_', ' ').toUpperCase(),
                        paymentMethod: c.paymentMethod,
                        recordedBy: c.recordedBy,
                        notes: c.notes
                      })}
                      className="px-2.5 py-1 text-xs font-semibold text-emerald-800 hover:bg-emerald-50 rounded border border-emerald-300 transition-colors cursor-pointer inline-flex items-center gap-1"
                    >
                      <Printer className="w-3 h-3" />
                      Receipt
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Deposit Modal */}
      {isDepositModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-800" />
                Record Member Contribution Deposit
              </h2>
              <button
                onClick={() => setIsDepositModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRecordDeposit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Select Member *</label>
                <select
                  required
                  value={memberId}
                  onChange={(e) => setMemberId(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-emerald-700"
                >
                  {members.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.fullName} ({m.memberNumber}) - Balance: {formatRwf(m.totalSavings)}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Amount (RWF) *</label>
                  <input
                    type="number"
                    required
                    min={100}
                    step={500}
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-emerald-700 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Contribution Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as ContributionType)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-emerald-700"
                  >
                    <option value="regular_savings">Regular Monthly Savings</option>
                    <option value="emergency_fund">Emergency Welfare Pool</option>
                    <option value="share_purchase">Cooperative Share Purchase</option>
                    <option value="social_welfare">Social Welfare Grant</option>
                    <option value="late_fee">Late / Penalty Fee</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                  >
                    <option value="momo">MTN Mobile Money / MoMo</option>
                    <option value="cash_at_meeting">Cash Handed at Assembly</option>
                    <option value="bank_transfer">Bank of Kigali / Cogebanque</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Deposit Date</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Notes / Transaction Reference Remark</label>
                <input
                  type="text"
                  placeholder="e.g. October monthly cycle contribution paid via MoMo"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsDepositModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg font-semibold shadow-xs"
                >
                  Record & Generate Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
