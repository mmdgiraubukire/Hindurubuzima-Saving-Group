export type UserRole = 'super_admin' | 'chairperson' | 'treasurer' | 'secretary' | 'member';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  phone?: string;
  memberId?: string;
  avatarUrl?: string;
  createdAt: string;
}

export interface Member {
  id: string;
  memberNumber: string; // e.g. HSG-001
  fullName: string;
  phone: string;
  email?: string;
  nationalId?: string; // Rwandan NID 16 digits
  address: string; // District, Sector, Cell
  joinDate: string;
  status: 'active' | 'suspended' | 'inactive';
  avatarUrl?: string;
  totalSavings: number;
  totalLoans: number;
  outstandingLoanBalance: number;
  sharesCount: number;
  monthlyPledgedSavings: number;
  emergencyContact?: string;
}

export type ContributionType = 
  | 'regular_savings'
  | 'emergency_fund'
  | 'social_welfare'
  | 'share_purchase'
  | 'late_fee';

export type PaymentMethod = 'momo' | 'cash_at_meeting' | 'bank_transfer';

export interface Contribution {
  id: string;
  transactionRef: string;
  memberId: string;
  memberNumber: string;
  memberName: string;
  amount: number;
  type: ContributionType;
  meetingId?: string;
  date: string;
  paymentMethod: PaymentMethod;
  recordedBy: string;
  receiptNo: string;
  notes?: string;
  status: 'verified' | 'pending' | 'flagged';
  createdAt: string;
}

export type LoanStatus = 'pending' | 'approved' | 'disbursed' | 'rejected' | 'closed';

export interface Loan {
  id: string;
  loanNumber: string;
  memberId: string;
  memberName: string;
  requestedAmount: number;
  approvedAmount?: number;
  purpose: string;
  interestRatePercent: number; // e.g., 5% monthly or per cycle
  durationMonths: number;
  guarantorMemberId?: string;
  guarantorName?: string;
  status: LoanStatus;
  totalPayable: number;
  outstandingBalance: number;
  disbursementDate?: string;
  dueDate?: string;
  approvedBy?: string;
  rejectionReason?: string;
  createdAt: string;
}

export interface LoanRepayment {
  id: string;
  repaymentRef: string;
  loanId: string;
  loanNumber: string;
  memberId: string;
  memberName: string;
  amount: number;
  principalPortion: number;
  interestPortion: number;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  receiptNo: string;
  recordedBy: string;
  status: 'verified' | 'pending';
  notes?: string;
}

export type ExpenseCategory = 
  | 'meeting_hall_rental'
  | 'stationery_and_supplies'
  | 'bank_charges'
  | 'social_welfare_grant'
  | 'transport_and_logistics'
  | 'audit_and_legal'
  | 'other';

export interface Expense {
  id: string;
  expenseRef: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  receiptUrl?: string;
  recordedBy: string;
  approvedBy?: string;
  date: string;
  status: 'approved' | 'pending' | 'rejected';
}

export interface Budget {
  id: string;
  category: string;
  allocatedAmount: number;
  spentAmount: number;
  fiscalPeriod: string;
}

export interface SavingsGoal {
  id: string;
  title: string;
  category: 'cooperative_investment' | 'emergency_pool' | 'annual_dividend_payout' | 'equipment_fund' | 'member_personal';
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  status: 'active' | 'achieved' | 'paused';
  createdBy: string;
  description?: string;
}

export interface Meeting {
  id: string;
  meetingNumber: string;
  title: string;
  date: string;
  location: string;
  agenda: string;
  minutes?: string;
  attendanceCount: number;
  totalCollectedAtMeeting?: number;
  recordedBy: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: 'normal' | 'urgent';
  postedBy: string;
  date: string;
}

export interface BankImportTransaction {
  id: string;
  date: string;
  description: string;
  reference: string;
  debit: number;
  credit: number;
  matchedStatus: 'unmatched' | 'matched' | 'duplicate';
  matchedEntityId?: string;
}

export interface BankImport {
  id: string;
  batchRef: string;
  fileName: string;
  importDate: string;
  uploadedBy: string;
  totalRows: number;
  reconciledRows: number;
  status: 'reconciled' | 'pending_review';
  transactions: BankImportTransaction[];
}

export interface AuditLog {
  id: string;
  action: string;
  performedBy: string;
  entityType: string;
  entityId: string;
  timestamp: string;
  details: string;
}
