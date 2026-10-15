import React, { useState } from 'react';
import { useApp } from '../../context/AuthContext';
import { Loan, LoanRepayment, PaymentMethod } from '../../types';
import { 
  Receipt, 
  Plus, 
  Search, 
  Printer, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  X,
  CreditCard
} from 'lucide-react';

interface RepaymentsViewProps {
  onOpenReceipt: (data: any) => void;
  presetLoan?: Loan | null;
  onClearPresetLoan?: () => void;
}

export const RepaymentsView: React.FC<RepaymentsViewProps> = ({ 
  onOpenReceipt, 
  presetLoan,
  onClearPresetLoan 
}) => {
  const { 
    repayments, 
    loans, 
    addRepayment, 
    formatRwf, 
    t, 
    currentUser 
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(Boolean(presetLoan));

  // Active loans that have outstanding balances
  const repayableLoans = loans.filter(l => l.status === 'disbursed' && l.outstandingBalance > 0);

  // Form state
  const [selectedLoanId, setSelectedLoanId] = useState(presetLoan?.id || repayableLoans[0]?.id || '');
  const [amount, setAmount] = useState<number>(50000);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('momo');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  const currentSelectedLoan = loans.find(l => l.id === selectedLoanId);

  // Pro-rate principal vs interest roughly: e.g. 90% principal, 10% interest or based on loan interest rate
  const interestPortion = Math.round(amount * 0.08);
  const principalPortion = amount - interestPortion;

  const filteredRepayments = repayments.filter(r => 
    r.repaymentRef.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.loanNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalRepaymentsReceived = repayments.reduce((sum, r) => sum + r.amount, 0);
  const totalPrincipalRecovered = repayments.reduce((sum, r) => sum + r.principalPortion, 0);
  const totalInterestEarned = repayments.reduce((sum, r) => sum + r.interestPortion, 0);

  const handleRecordRepayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSelectedLoan || amount <= 0) return;

    const newRepayment = addRepayment({
      loanId: currentSelectedLoan.id,
      loanNumber: currentSelectedLoan.loanNumber,
      memberId: currentSelectedLoan.memberId,
      memberName: currentSelectedLoan.memberName,
      amount: Number(amount),
      principalPortion,
      interestPortion,
      paymentDate,
      paymentMethod,
      recordedBy: `${currentUser.displayName} (${currentUser.role})`,
      notes
    });

    setIsRecordModalOpen(false);
    if (onClearPresetLoan) onClearPresetLoan();

    // Trigger receipt voucher
    onOpenReceipt({
      receiptNo: newRepayment.receiptNo,
      transactionRef: newRepayment.repaymentRef,
      title: 'Loan Repayment Voucher',
      memberName: newRepayment.memberName,
      memberNumber: currentSelectedLoan.memberId,
      amount: newRepayment.amount,
      principalPortion: newRepayment.principalPortion,
      interestPortion: newRepayment.interestPortion,
      date: newRepayment.paymentDate,
      type: `LOAN REPAYMENT [${newRepayment.loanNumber}]`,
      paymentMethod: newRepayment.paymentMethod,
      recordedBy: newRepayment.recordedBy,
      notes: newRepayment.notes
    });
  };

  const handleExportCsv = () => {
    const headers = ['Repayment Ref', 'Receipt No', 'Loan Number', 'Borrower', 'Total Amount', 'Principal Portion', 'Interest Portion', 'Date', 'Recorded By'];
    const rows = filteredRepayments.map(r => [
      r.repaymentRef,
      r.receiptNo,
      r.loanNumber,
      `"${r.memberName}"`,
      r.amount,
      r.principalPortion,
      r.interestPortion,
      r.paymentDate,
      `"${r.recordedBy}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Hindurubuzima_Loan_Repayments_${new Date().toISOString().split('T')[0]}.csv`);
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
            <Receipt className="w-5 h-5 text-blue-700" />
            {t.repayments} & Loan Recovery Ledger
          </h1>
          <p className="text-xs text-slate-500">
            Installment repayments, interest dividend distributions, and real-time outstanding loan amortizations.
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
              onClick={() => setIsRecordModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg shadow-2xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              {t.recordRepayment}
            </button>
          )}
        </div>
      </div>

      {/* KPI Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 block mb-1">Total Loan Repayments Collected</span>
          <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {formatRwf(totalRepaymentsReceived)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Total cash flowed back into fund</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 block mb-1">Principal Recovered</span>
          <div className="text-2xl font-bold text-blue-900 font-mono tabular-nums">
            {formatRwf(totalPrincipalRecovered)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Re-credited to group lending pool</div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs text-slate-500 block mb-1">Interest Income Earned</span>
          <div className="text-2xl font-bold text-emerald-900 font-mono tabular-nums">
            {formatRwf(totalInterestEarned)}
          </div>
          <div className="text-[11px] text-emerald-700 mt-1">Cooperative annual dividend profit</div>
        </div>
      </div>

      {/* Repayments Ledger Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by repayment ref, loan number, or member..."
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
                <th className="py-3 px-4 font-semibold">Repayment Ref</th>
                <th className="py-3 px-4 font-semibold">Loan Number</th>
                <th className="py-3 px-4 font-semibold">Borrower</th>
                <th className="py-3 px-4 font-semibold text-right">Total Installment</th>
                <th className="py-3 px-4 font-semibold text-right">Principal</th>
                <th className="py-3 px-4 font-semibold text-right">Interest</th>
                <th className="py-3 px-4 font-semibold">Payment Date</th>
                <th className="py-3 px-4 font-semibold">Payment Method</th>
                <th className="py-3 px-4 font-semibold text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRepayments.map(r => (
                <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono font-semibold text-slate-900 text-[11px]">
                    {r.repaymentRef}
                  </td>
                  <td className="py-3 px-4 font-mono text-[11px] text-blue-800 font-medium">
                    {r.loanNumber}
                  </td>
                  <td className="py-3 px-4 font-medium text-slate-900">
                    {r.memberName}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 tabular-nums">
                    {formatRwf(r.amount)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-600 tabular-nums">
                    {formatRwf(r.principalPortion)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-emerald-800 font-semibold tabular-nums">
                    {formatRwf(r.interestPortion)}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">
                    {r.paymentDate}
                  </td>
                  <td className="py-3 px-4 uppercase font-mono text-[11px] text-slate-600">
                    {r.paymentMethod}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => onOpenReceipt({
                        receiptNo: r.receiptNo,
                        transactionRef: r.repaymentRef,
                        title: 'Loan Repayment Voucher',
                        memberName: r.memberName,
                        memberNumber: r.memberId,
                        amount: r.amount,
                        principalPortion: r.principalPortion,
                        interestPortion: r.interestPortion,
                        date: r.paymentDate,
                        type: `LOAN REPAYMENT [${r.loanNumber}]`,
                        paymentMethod: r.paymentMethod,
                        recordedBy: r.recordedBy,
                        notes: r.notes
                      })}
                      className="px-2.5 py-1 text-xs font-semibold text-blue-800 hover:bg-blue-50 rounded border border-blue-300 transition-colors cursor-pointer inline-flex items-center gap-1"
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

      {/* Record Repayment Modal */}
      {isRecordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-blue-700" />
                Record Loan Repayment Installment
              </h2>
              <button
                onClick={() => {
                  setIsRecordModalOpen(false);
                  if (onClearPresetLoan) onClearPresetLoan();
                }}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRecordRepayment} className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Select Active Loan *</label>
                <select
                  required
                  value={selectedLoanId}
                  onChange={(e) => setSelectedLoanId(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-emerald-700"
                >
                  {repayableLoans.map(l => (
                    <option key={l.id} value={l.id}>
                      {l.loanNumber} · {l.memberName} (Balance: {formatRwf(l.outstandingBalance)})
                    </option>
                  ))}
                </select>
              </div>

              {currentSelectedLoan && (
                <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl space-y-1 text-[11px] text-blue-950">
                  <div className="flex justify-between">
                    <span>Borrower:</span>
                    <span className="font-semibold">{currentSelectedLoan.memberName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Original Principal:</span>
                    <span className="font-mono">{formatRwf(currentSelectedLoan.requestedAmount)}</span>
                  </div>
                  <div className="flex justify-between font-bold border-t border-blue-200 pt-1">
                    <span>Current Outstanding Debt:</span>
                    <span className="font-mono text-amber-900">{formatRwf(currentSelectedLoan.outstandingBalance)}</span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Repayment Amount (RWF) *</label>
                  <input
                    type="number"
                    required
                    min={1000}
                    step={1000}
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold"
                  />
                </div>
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
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Payment Date</label>
                  <input
                    type="date"
                    required
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Interest Split Preview</label>
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-[11px] text-slate-700 flex justify-between">
                    <span>Interest: {formatRwf(interestPortion)}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Remarks / Bank Voucher Number</label>
                <input
                  type="text"
                  placeholder="e.g. 2nd installment paid via MoMo Ref: 8921849102"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsRecordModalOpen(false);
                    if (onClearPresetLoan) onClearPresetLoan();
                  }}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-700 hover:bg-blue-600 text-white rounded-lg font-semibold shadow-xs"
                >
                  Record & Print Voucher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
