/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuthProvider, useApp } from './context/AuthContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { DashboardView } from './components/dashboard/DashboardView';
import { MembersView } from './components/members/MembersView';
import { SavingsView } from './components/savings/SavingsView';
import { LoansView } from './components/loans/LoansView';
import { RepaymentsView } from './components/repayments/RepaymentsView';
import { ExpensesView } from './components/expenses/ExpensesView';
import { BudgetsGoalsView } from './components/budgets/BudgetsGoalsView';
import { BankImportView } from './components/bank/BankImportView';
import { ReportsView } from './components/reports/ReportsView';
import { MeetingsView } from './components/meetings/MeetingsView';
import { AnnouncementsView } from './components/announcements/AnnouncementsView';
import { AuditView } from './components/audit/AuditView';
import { SettingsView } from './components/settings/SettingsView';
import { ReceiptModal } from './components/common/ReceiptModal';
import { Loan } from './types';

const MainContent: React.FC = () => {
  const { activeTab, setActiveTab } = useApp();
  const [receiptData, setReceiptData] = useState<any>(null);
  const [presetLoanForRepay, setPresetLoanForRepay] = useState<Loan | null>(null);

  const handleOpenReceipt = (data: any) => {
    setReceiptData(data);
  };

  const handleCloseReceipt = () => {
    setReceiptData(null);
  };

  const handleOpenRepayModalForLoan = (loan: Loan) => {
    setPresetLoanForRepay(loan);
    setActiveTab('repayments');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800">
      {/* Top Bar Header */}
      <Header />

      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar />

        {/* Dynamic Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'dashboard' && (
              <DashboardView
                onOpenRecordContribution={() => setActiveTab('contributions')}
                onOpenApplyLoan={() => setActiveTab('loans')}
                onOpenRecordRepayment={() => setActiveTab('repayments')}
              />
            )}

            {activeTab === 'members' && <MembersView />}

            {(activeTab === 'savings' || activeTab === 'contributions') && (
              <SavingsView onOpenReceipt={handleOpenReceipt} />
            )}

            {activeTab === 'loans' && (
              <LoansView onOpenRepayModalForLoan={handleOpenRepayModalForLoan} />
            )}

            {activeTab === 'repayments' && (
              <RepaymentsView 
                onOpenReceipt={handleOpenReceipt}
                presetLoan={presetLoanForRepay}
                onClearPresetLoan={() => setPresetLoanForRepay(null)}
              />
            )}

            {activeTab === 'expenses' && <ExpensesView />}

            {(activeTab === 'budgets' || activeTab === 'savingsGoals') && (
              <BudgetsGoalsView />
            )}

            {activeTab === 'bankImports' && <BankImportView />}

            {activeTab === 'reports' && <ReportsView />}

            {activeTab === 'meetings' && <MeetingsView />}

            {activeTab === 'announcements' && <AnnouncementsView />}

            {activeTab === 'auditLogs' && <AuditView />}

            {activeTab === 'settings' && <SettingsView />}
          </div>
        </main>
      </div>

      {/* Global Receipt Modal */}
      <ReceiptModal
        isOpen={Boolean(receiptData)}
        onClose={handleCloseReceipt}
        receiptData={receiptData}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainContent />
    </AuthProvider>
  );
}
