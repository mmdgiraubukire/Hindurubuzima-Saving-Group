import React, { useState } from 'react';
import { useApp } from '../../context/AuthContext';
import { Loan, LoanStatus } from '../../types';
import { 
  HandCoins, 
  Plus, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ShieldCheck, 
  FileText, 
  AlertTriangle, 
  Download,
  Filter,
  X,
  Printer
} from 'lucide-react';

interface LoansViewProps {
  onOpenRepayModalForLoan: (loan: Loan) => void;
}

export const LoansView: React.FC<LoansViewProps> = ({ onOpenRepayModalForLoan }) => {
  const { 
    loans, 
    members, 
    applyForLoan, 
    updateLoanStatus, 
    formatRwf, 
    t, 
    currentUser 
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [selectedAgreementLoan, setSelectedAgreementLoan] = useState<Loan | null>(null);

  // Form state
  const [memberId, setMemberId] = useState(members[0]?.id || '');
  const [requestedAmount, setRequestedAmount] = useState<number>(300000);
  const [purpose, setPurpose] = useState('');
  const [interestRatePercent, setInterestRatePercent] = useState<number>(4.0);
  const [durationMonths, setDurationMonths] = useState<number>(4);
  const [guarantorMemberId, setGuarantorMemberId] = useState(members[1]?.id || '');

  const filteredLoans = loans.filter(l => {
    const matchesSearch = 
      l.loanNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.purpose.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || l.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const selectedMemberObj = members.find(m => m.id === memberId);
  const maxEligibleLoan = selectedMemberObj ? selectedMemberObj.totalSavings * 3 : 0;
  const isEligible = requestedAmount <= maxEligibleLoan && selectedMemberObj?.status === 'active';

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMemberObj || requestedAmount <= 0) return;

    const guarantorObj = members.find(m => m.id === guarantorMemberId);

    applyForLoan({
      memberId: selectedMemberObj.id,
      memberName: selectedMemberObj.fullName,
      requestedAmount: Number(requestedAmount),
      approvedAmount: Number(requestedAmount),
      purpose,
      interestRatePercent: Number(interestRatePercent),
      durationMonths: Number(durationMonths),
      guarantorMemberId: guarantorObj?.id,
      guarantorName: guarantorObj?.fullName
    });

    setIsApplyModalOpen(false);
    setPurpose('');
  };

  const isOfficer = ['chairperson', 'treasurer', 'super_admin'].includes(currentUser.role);

  return (
    <div className="space-y-6">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <HandCoins className="w-5 h-5 text-amber-600" />
            {t.loans} & Micro-Credit Portfolio
          </h1>
          <p className="text-xs text-slate-500">
            Community micro-loans for agricultural development, commerce, tuition, and family emergencies with transparent interest calculations.
          </p>
        </div>

        <button
          onClick={() => setIsApplyModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg shadow-2xs transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          {t.applyForLoan}
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by loan number, borrower, or purpose..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-emerald-700"
          />
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
          {['all', 'pending', 'approved', 'disbursed', 'closed'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer capitalize ${
                statusFilter === st 
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Loans Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-semibold">Loan Number</th>
                <th className="py-3 px-4 font-semibold">Borrower</th>
                <th className="py-3 px-4 font-semibold">Purpose & Terms</th>
                <th className="py-3 px-4 font-semibold text-right">Principal</th>
                <th className="py-3 px-4 font-semibold text-right">Total Payable</th>
                <th className="py-3 px-4 font-semibold text-right">Outstanding</th>
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLoans.map(loan => (
                <tr key={loan.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4">
                    <span className="font-mono font-bold text-slate-900 text-[11px] block">{loan.loanNumber}</span>
                    <span className="font-mono text-[10px] text-slate-400">Due: {loan.dueDate || 'Pending'}</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900">{loan.memberName}</div>
                    {loan.guarantorName && (
                      <div className="text-[10px] text-slate-500">Guarantor: {loan.guarantorName}</div>
                    )}
                  </td>
                  <td className="py-3 px-4 max-w-xs">
                    <p className="text-slate-700 truncate">{loan.purpose}</p>
                    <span className="text-[10px] font-mono text-emerald-800">
                      {loan.interestRatePercent}% monthly · {loan.durationMonths} months
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-semibold tabular-nums text-slate-900">
                    {formatRwf(loan.requestedAmount)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-700">
                    {formatRwf(loan.totalPayable)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold tabular-nums">
                    {loan.outstandingBalance > 0 ? (
                      <span className="text-amber-700">{formatRwf(loan.outstandingBalance)}</span>
                    ) : (
                      <span className="text-emerald-700">0 RWF</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium capitalize ${
                      loan.status === 'disbursed'
                        ? 'bg-blue-50 text-blue-800 border border-blue-200'
                        : loan.status === 'pending'
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : loan.status === 'approved'
                        ? 'bg-teal-50 text-teal-800 border border-teal-200'
                        : loan.status === 'closed'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-rose-50 text-rose-800 border border-rose-200'
                    }`}>
                      {loan.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Officer Workflow Actions */}
                      {isOfficer && loan.status === 'pending' && (
                        <>
                          <button
                            onClick={() => updateLoanStatus(loan.id, 'approved')}
                            className="px-2 py-1 text-[11px] font-semibold bg-emerald-800 hover:bg-emerald-700 text-white rounded cursor-pointer"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => updateLoanStatus(loan.id, 'rejected', 'Bylaw savings ratio threshold not reached')}
                            className="px-2 py-1 text-[11px] font-semibold bg-slate-200 hover:bg-slate-300 text-slate-800 rounded cursor-pointer"
                          >
                            Reject
                          </button>
                        </>
                      )}

                      {isOfficer && loan.status === 'approved' && (
                        <button
                          onClick={() => updateLoanStatus(loan.id, 'disbursed')}
                          className="px-2 py-1 text-[11px] font-semibold bg-blue-700 hover:bg-blue-600 text-white rounded cursor-pointer"
                        >
                          Disburse
                        </button>
                      )}

                      {loan.status === 'disbursed' && (
                        <button
                          onClick={() => onOpenRepayModalForLoan(loan)}
                          className="px-2 py-1 text-[11px] font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 rounded cursor-pointer"
                        >
                          Repay
                        </button>
                      )}

                      <button
                        onClick={() => setSelectedAgreementLoan(loan)}
                        className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded cursor-pointer"
                        title="View Agreement"
                      >
                        <FileText className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Loan Application Modal */}
      {isApplyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <HandCoins className="w-4 h-4 text-amber-600" />
                Submit Loan Application
              </h2>
              <button
                onClick={() => setIsApplyModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleApplySubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Borrower (Member) *</label>
                <select
                  required
                  value={memberId}
                  onChange={(e) => setMemberId(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-emerald-700"
                >
                  {members.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.fullName} ({m.memberNumber}) - Savings: {formatRwf(m.totalSavings)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Eligibility Check Callout */}
              {selectedMemberObj && (
                <div className={`p-3 rounded-xl border text-[11px] ${
                  isEligible 
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
                    : 'bg-amber-50 border-amber-200 text-amber-900'
                }`}>
                  <div className="font-semibold flex items-center gap-1.5">
                    {isEligible ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />}
                    Eligibility Rule (Max 3x Accumulated Savings)
                  </div>
                  <div className="mt-1">
                    Current Savings: <span className="font-mono font-bold">{formatRwf(selectedMemberObj.totalSavings)}</span> · Maximum Allowed Principal: <span className="font-mono font-bold">{formatRwf(maxEligibleLoan)}</span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Requested Principal (RWF) *</label>
                  <input
                    type="number"
                    required
                    min={10000}
                    step={10000}
                    value={requestedAmount}
                    onChange={(e) => setRequestedAmount(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Repayment Term (Months)</label>
                  <select
                    value={durationMonths}
                    onChange={(e) => setDurationMonths(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                  >
                    {[1, 2, 3, 4, 5, 6, 9, 12].map(m => (
                      <option key={m} value={m}>{m} Months</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Monthly Interest Rate (%)</label>
                  <input
                    type="number"
                    step={0.5}
                    min={1}
                    max={10}
                    value={interestRatePercent}
                    onChange={(e) => setInterestRatePercent(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Guarantor Member</label>
                  <select
                    value={guarantorMemberId}
                    onChange={(e) => setGuarantorMemberId(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                  >
                    {members.filter(m => m.id !== memberId).map(m => (
                      <option key={m.id} value={m.id}>{m.fullName} ({m.memberNumber})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Purpose of Loan *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="e.g. Purchase of certified fertilizer seeds and greenhouse expansion in Bugesera"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-emerald-700"
                />
              </div>

              {/* Repayment Calculation Preview */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">Calculated Interest:</span>
                  <span className="font-mono font-semibold text-slate-800">
                    {formatRwf(requestedAmount * (interestRatePercent / 100) * durationMonths)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-900 font-bold border-t border-slate-200 pt-1">
                  <span>Total Repayable:</span>
                  <span className="font-mono text-emerald-900">
                    {formatRwf(requestedAmount + (requestedAmount * (interestRatePercent / 100) * durationMonths))}
                  </span>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsApplyModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-lg font-semibold shadow-xs"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Loan Agreement Modal */}
      {selectedAgreementLoan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-emerald-800" />
                Community Loan Agreement
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1 px-3 py-1 text-xs bg-emerald-800 text-white rounded hover:bg-emerald-700"
                >
                  <Printer className="w-3 h-3" />
                  Print
                </button>
                <button
                  onClick={() => setSelectedAgreementLoan(null)}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4 text-xs text-slate-800">
              <div className="text-center pb-3 border-b border-slate-200">
                <h3 className="font-bold text-slate-900 text-base">HINDURUBUZIMA SAVING GROUP</h3>
                <p className="text-[11px] text-slate-500">Official Credit Agreement · Reference {selectedAgreementLoan.loanNumber}</p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Borrower:</span>
                  <span className="font-bold text-slate-900">{selectedAgreementLoan.memberName}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Loan Principal:</span>
                  <span className="font-mono font-bold text-emerald-900">{formatRwf(selectedAgreementLoan.requestedAmount)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Interest Rate:</span>
                  <span className="font-mono">{selectedAgreementLoan.interestRatePercent}% / month</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Duration:</span>
                  <span>{selectedAgreementLoan.durationMonths} months</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Total Repayable:</span>
                  <span className="font-mono font-bold text-slate-900">{formatRwf(selectedAgreementLoan.totalPayable)}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Guarantor:</span>
                  <span>{selectedAgreementLoan.guarantorName || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-100">
                  <span className="text-slate-500">Approving Officer:</span>
                  <span>{selectedAgreementLoan.approvedBy || 'Pending Executive Committee'}</span>
                </div>
                <div className="pt-2">
                  <span className="text-slate-500 block mb-0.5">Purpose:</span>
                  <p className="italic bg-slate-50 p-2.5 rounded border border-slate-200">{selectedAgreementLoan.purpose}</p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 text-[10px] text-slate-400 leading-relaxed">
                By entering this agreement, the borrower commits to honoring monthly installments. Late payments incur penalties per Hindurubuzima bylaws.
              </div>
            </div>

            <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedAgreementLoan(null)}
                className="px-4 py-1.5 text-xs font-semibold bg-white border border-slate-300 rounded hover:bg-slate-100"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
