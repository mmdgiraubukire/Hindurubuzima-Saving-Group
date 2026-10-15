import React, { useState } from 'react';
import { useApp } from '../../context/AuthContext';
import { 
  FileText, 
  Printer, 
  Download, 
  Calendar, 
  ShieldCheck, 
  PieChart, 
  ArrowUpRight,
  Receipt,
  Users
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { 
    members, 
    contributions, 
    loans, 
    repayments, 
    expenses, 
    formatRwf, 
    t, 
    currentUser 
  } = useApp();

  const [activeReportTab, setActiveReportTab] = useState<'balance_sheet' | 'contributions' | 'loans' | 'dividends'>('balance_sheet');

  // Key Aggregations
  const totalContributions = contributions.reduce((acc, c) => acc + c.amount, 0);
  const totalRepayments = repayments.reduce((acc, r) => acc + r.amount, 0);
  const totalDisbursed = loans
    .filter(l => l.status === 'disbursed' || l.status === 'closed')
    .reduce((acc, l) => acc + (l.approvedAmount || l.requestedAmount), 0);
  const totalOutstanding = loans
    .filter(l => l.status === 'disbursed')
    .reduce((acc, l) => acc + l.outstandingBalance, 0);
  const totalInterestEarned = repayments.reduce((acc, r) => acc + r.interestPortion, 0);
  const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
  
  const cashInSafeAndBank = (totalContributions + totalRepayments) - (totalDisbursed + totalExpenses);
  const totalAssets = cashInSafeAndBank + totalOutstanding;
  const totalMemberEquity = totalContributions + totalInterestEarned - totalExpenses;

  const handlePrint = () => {
    window.print();
  };

  const handleExportCsv = () => {
    let headers: string[] = [];
    let rows: (string | number)[][] = [];
    let reportName = 'Hindurubuzima_Financial_Report';

    if (activeReportTab === 'balance_sheet') {
      headers = ['Category', 'Item Description', 'Amount (RWF)'];
      rows = [
        ['Current Assets', 'Liquid Cash in Safe & Bank of Kigali Account', cashInSafeAndBank],
        ['Current Assets', 'Outstanding Loan Principal Portfolio', totalOutstanding],
        ['Total Assets', 'Gross Assets Available', totalAssets],
        ['Member Equity', 'Cumulative Member Savings Deposits', totalContributions],
        ['Member Equity', 'Retained Interest Earnings Net of Expenses', totalInterestEarned - totalExpenses],
        ['Total Liabilities & Equity', 'Sum of Member Equity & Reserves', totalMemberEquity]
      ];
      reportName = 'Balance_Sheet_Summary';
    } else if (activeReportTab === 'contributions') {
      headers = ['Transaction Ref', 'Member Name', 'Member No', 'Fund Type', 'Amount (RWF)', 'Date', 'Recorded By'];
      rows = contributions.map(c => [c.transactionRef, `"${c.memberName}"`, c.memberNumber, c.type, c.amount, c.date, `"${c.recordedBy}"`]);
      reportName = 'Contributions_Ledger_Report';
    } else if (activeReportTab === 'loans') {
      headers = ['Loan Number', 'Borrower', 'Principal (RWF)', 'Total Payable (RWF)', 'Outstanding (RWF)', 'Interest Rate', 'Status'];
      rows = loans.map(l => [l.loanNumber, `"${l.memberName}"`, l.requestedAmount, l.totalPayable, l.outstandingBalance, `${l.interestRatePercent}%`, l.status]);
      reportName = 'Loans_Portfolio_Report';
    } else {
      headers = ['Member Number', 'Full Name', 'Total Savings (RWF)', 'Shares', 'Estimated Dividend Payout (RWF)'];
      const totalSavingsAll = members.reduce((sum, m) => sum + m.totalSavings, 0);
      const netProfit = Math.max(0, totalInterestEarned - totalExpenses);
      rows = members.map(m => {
        const shareRatio = totalSavingsAll > 0 ? (m.totalSavings / totalSavingsAll) : 0;
        const estimatedDividend = Math.round(netProfit * shareRatio);
        return [m.memberNumber, `"${m.fullName}"`, m.totalSavings, m.sharesCount, estimatedDividend];
      });
      reportName = 'Annual_Dividend_Shareout_Report';
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${reportName}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-800" />
            {t.reports} & Audit Statements
          </h1>
          <p className="text-xs text-slate-500">
            Certified financial statements, cash balance reconciliations, and member dividend share-out schedules in compliance with Rwandan cooperative norms.
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
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg shadow-2xs transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            {t.printReport}
          </button>
        </div>
      </div>

      {/* Report Segmented Tabs */}
      <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {[
          { id: 'balance_sheet', label: 'Financial Position (Balance Sheet)' },
          { id: 'contributions', label: 'Contributions Audit' },
          { id: 'loans', label: 'Loan Portfolio & Risk' },
          { id: 'dividends', label: 'Year-End Dividend Share-Out' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveReportTab(tab.id as any)}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
              activeReportTab === tab.id
                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Printable Report Paper Sheet */}
      <div id="printable-financial-statement" className="bg-white rounded-2xl border border-slate-200 p-8 shadow-2xs space-y-6">
        {/* Official Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-900 text-amber-400 flex items-center justify-center font-bold text-xl">
              H
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 uppercase tracking-tight">
                Hindurubuzima Saving Group
              </h2>
              <p className="text-xs text-slate-500">
                Official Financial Statement · Gisozi Sector, Gasabo District, Kigali
              </p>
            </div>
          </div>

          <div className="text-right text-xs text-slate-500 font-mono">
            <div>Report As Of: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
            <div className="text-emerald-800 font-semibold">Currency: Rwandan Francs (RWF)</div>
          </div>
        </div>

        {/* Tab 1: Balance Sheet */}
        {activeReportTab === 'balance_sheet' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                1. Group Assets (Umutungo w'Itsinda)
              </h3>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-4 font-semibold">Asset Description</th>
                      <th className="py-2.5 px-4 font-semibold text-right">Amount (RWF)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="py-2.5 px-4 font-medium text-slate-800">
                        Liquid Cash in Safe Box & Bank of Kigali Checking Account
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono font-bold text-emerald-900 tabular-nums">
                        {formatRwf(cashInSafeAndBank)}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-medium text-slate-800">
                        Outstanding Micro-Loan Principal Portfolio (Unrecovered Assets)
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono font-bold text-amber-900 tabular-nums">
                        {formatRwf(totalOutstanding)}
                      </td>
                    </tr>
                    <tr className="bg-emerald-50/50 font-bold border-t border-slate-200">
                      <td className="py-2.5 px-4 text-emerald-950">TOTAL GROUP ASSETS</td>
                      <td className="py-2.5 px-4 text-right font-mono text-emerald-950 text-sm tabular-nums">
                        {formatRwf(totalAssets)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                2. Member Equity & Retained Cooperative Reserves
              </h3>
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-4 font-semibold">Equity / Reserve Classification</th>
                      <th className="py-2.5 px-4 font-semibold text-right">Amount (RWF)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="py-2.5 px-4 font-medium text-slate-800">
                        Cumulative Member Verified Savings & Share Capital
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono font-semibold text-slate-900 tabular-nums">
                        {formatRwf(totalContributions)}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-medium text-slate-800">
                        Net Interest Earnings (Total Interest Earned {formatRwf(totalInterestEarned)} - Operational Outlays {formatRwf(totalExpenses)})
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono font-semibold text-emerald-800 tabular-nums">
                        {formatRwf(Math.max(0, totalInterestEarned - totalExpenses))}
                      </td>
                    </tr>
                    <tr className="bg-slate-100/70 font-bold border-t border-slate-200">
                      <td className="py-2.5 px-4 text-slate-950">TOTAL LIABILITIES & MEMBER EQUITY</td>
                      <td className="py-2.5 px-4 text-right font-mono text-slate-950 text-sm tabular-nums">
                        {formatRwf(totalMemberEquity)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Contributions Audit */}
        {activeReportTab === 'contributions' && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Complete Historical Member Contributions Ledger ({contributions.length} Records)
            </h3>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-4 font-semibold">Reference</th>
                    <th className="py-2.5 px-4 font-semibold">Member</th>
                    <th className="py-2.5 px-4 font-semibold">Category</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Amount (RWF)</th>
                    <th className="py-2.5 px-4 font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {contributions.map(c => (
                    <tr key={c.id}>
                      <td className="py-2.5 px-4 font-mono text-slate-700">{c.transactionRef}</td>
                      <td className="py-2.5 px-4 font-medium text-slate-900">{c.memberName}</td>
                      <td className="py-2.5 px-4 capitalize text-slate-600">{c.type.replace('_', ' ')}</td>
                      <td className="py-2.5 px-4 text-right font-mono font-bold text-emerald-800 tabular-nums">
                        +{formatRwf(c.amount)}
                      </td>
                      <td className="py-2.5 px-4 font-mono text-slate-500">{c.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Loan Portfolio Risk */}
        {activeReportTab === 'loans' && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Comprehensive Loan Portfolio & Credit Risk Amortization
            </h3>
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-4 font-semibold">Loan No</th>
                    <th className="py-2.5 px-4 font-semibold">Borrower</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Principal</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Outstanding</th>
                    <th className="py-2.5 px-4 font-semibold">Interest Term</th>
                    <th className="py-2.5 px-4 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loans.map(l => (
                    <tr key={l.id}>
                      <td className="py-2.5 px-4 font-mono font-semibold text-slate-900">{l.loanNumber}</td>
                      <td className="py-2.5 px-4 font-medium text-slate-800">{l.memberName}</td>
                      <td className="py-2.5 px-4 text-right font-mono tabular-nums">{formatRwf(l.requestedAmount)}</td>
                      <td className="py-2.5 px-4 text-right font-mono font-bold text-amber-800 tabular-nums">{formatRwf(l.outstandingBalance)}</td>
                      <td className="py-2.5 px-4 font-mono text-slate-600">{l.interestRatePercent}% / mo ({l.durationMonths}m)</td>
                      <td className="py-2.5 px-4 capitalize font-semibold">{l.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: Year-End Dividend Share-Out Estimator */}
        {activeReportTab === 'dividends' && (
          <div className="space-y-4">
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 space-y-1 text-xs">
              <span className="font-bold text-emerald-950 block">Year-End Shareout Mechanism (Gusangira Inyungu)</span>
              <p className="text-emerald-800">
                Net cooperative profit is apportioned to active members strictly in proportion to their accumulated verified savings balance.
              </p>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-4 font-semibold">Member</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Savings Balance</th>
                    <th className="py-2.5 px-4 font-semibold text-center">Share Proportion</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Estimated Dividend (RWF)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(() => {
                    const totalSavingsAll = members.reduce((sum, m) => sum + m.totalSavings, 0);
                    const netProfit = Math.max(0, totalInterestEarned - totalExpenses);

                    return members.map(m => {
                      const shareRatio = totalSavingsAll > 0 ? (m.totalSavings / totalSavingsAll) : 0;
                      const estimatedDividend = Math.round(netProfit * shareRatio);

                      return (
                        <tr key={m.id}>
                          <td className="py-2.5 px-4">
                            <span className="font-semibold text-slate-900 block">{m.fullName}</span>
                            <span className="font-mono text-slate-400 text-[10px]">{m.memberNumber}</span>
                          </td>
                          <td className="py-2.5 px-4 text-right font-mono font-semibold tabular-nums text-slate-900">
                            {formatRwf(m.totalSavings)}
                          </td>
                          <td className="py-2.5 px-4 text-center font-mono text-slate-600">
                            {(shareRatio * 100).toFixed(1)}%
                          </td>
                          <td className="py-2.5 px-4 text-right font-mono font-bold text-emerald-800 tabular-nums">
                            +{formatRwf(estimatedDividend)}
                          </td>
                        </tr>
                      );
                    });
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Certification Signoff Strip */}
        <div className="pt-8 border-t border-dashed border-slate-300 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center text-xs">
          <div>
            <div className="font-semibold text-slate-900">Jeanette Mukamana</div>
            <div className="text-[11px] text-slate-500">Group Chairperson</div>
            <div className="mt-4 pt-2 border-t border-slate-200 text-[10px] text-slate-400 font-mono">Sign & Date</div>
          </div>
          <div>
            <div className="font-semibold text-slate-900">Emmanuel Nshimiyimana</div>
            <div className="text-[11px] text-slate-500">Treasurer</div>
            <div className="mt-4 pt-2 border-t border-slate-200 text-[10px] text-slate-400 font-mono">Sign & Date</div>
          </div>
          <div>
            <div className="font-semibold text-slate-900">Claudine Uwimana</div>
            <div className="text-[11px] text-slate-500">Secretary</div>
            <div className="mt-4 pt-2 border-t border-slate-200 text-[10px] text-slate-400 font-mono">Sign & Date</div>
          </div>
        </div>
      </div>
    </div>
  );
};
