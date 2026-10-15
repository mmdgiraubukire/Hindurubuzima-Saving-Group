import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  onSnapshot 
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/config';
import { 
  Member, 
  Contribution, 
  Loan, 
  LoanRepayment, 
  Expense, 
  Budget, 
  SavingsGoal, 
  Meeting, 
  Announcement, 
  AuditLog, 
  BankImport 
} from '../types';

export const INITIAL_MEMBERS: Member[] = [
  {
    id: 'mem_01',
    memberNumber: 'HSG-001',
    fullName: 'Jeanette Mukamana',
    phone: '+250 788 412 901',
    email: 'j.mukamana@hindurubuzima.rw',
    nationalId: '1198570023451098',
    address: 'Gasabo, Gisozi, Musezero',
    joinDate: '2023-01-15',
    status: 'active',
    totalSavings: 850000,
    totalLoans: 500000,
    outstandingLoanBalance: 0,
    sharesCount: 170,
    monthlyPledgedSavings: 25000,
    emergencyContact: 'Pierre Mukamana (+250 788 111 222)'
  },
  {
    id: 'mem_02',
    memberNumber: 'HSG-002',
    fullName: 'Emmanuel Nshimiyimana',
    phone: '+250 783 621 044',
    email: 'e.nshimiyimana@hindurubuzima.rw',
    nationalId: '1198880019284723',
    address: 'Kicukiro, Niboye, Gatare',
    joinDate: '2023-01-15',
    status: 'active',
    totalSavings: 720000,
    totalLoans: 400000,
    outstandingLoanBalance: 0,
    sharesCount: 144,
    monthlyPledgedSavings: 20000,
    emergencyContact: 'Marie Nshimiyimana (+250 782 333 444)'
  },
  {
    id: 'mem_03',
    memberNumber: 'HSG-003',
    fullName: 'Claudine Uwimana',
    phone: '+250 789 104 552',
    email: 'c.uwimana@hindurubuzima.rw',
    nationalId: '1199270038472910',
    address: 'Nyarugenge, Nyamirambo, Rwezamenyo',
    joinDate: '2023-02-01',
    status: 'active',
    totalSavings: 640000,
    totalLoans: 600000,
    outstandingLoanBalance: 180000,
    sharesCount: 128,
    monthlyPledgedSavings: 20000,
    emergencyContact: 'Alice Uwimana (+250 785 555 666)'
  },
  {
    id: 'mem_04',
    memberNumber: 'HSG-004',
    fullName: 'Jean Bosco Hakizimana',
    phone: '+250 788 776 219',
    email: 'j.hakizimana@gmail.com',
    nationalId: '1198680048291029',
    address: 'Gasabo, Kimironko, Kibagabaga',
    joinDate: '2023-03-10',
    status: 'active',
    totalSavings: 510000,
    totalLoans: 800000,
    outstandingLoanBalance: 450000,
    sharesCount: 102,
    monthlyPledgedSavings: 15000,
    emergencyContact: 'Flora Hakizimana (+250 788 999 000)'
  },
  {
    id: 'mem_05',
    memberNumber: 'HSG-005',
    fullName: 'Alphonsine Mukandayisenga',
    phone: '+250 781 992 314',
    email: 'alphonsine.m@yahoo.fr',
    nationalId: '1199070059182736',
    address: 'Gasabo, Kacyiru, Kamatamu',
    joinDate: '2023-04-01',
    status: 'active',
    totalSavings: 590000,
    totalLoans: 350000,
    outstandingLoanBalance: 120000,
    sharesCount: 118,
    monthlyPledgedSavings: 20000
  },
  {
    id: 'mem_06',
    memberNumber: 'HSG-006',
    fullName: 'Patrick Habimana',
    phone: '+250 782 554 190',
    email: 'p.habimana@gmail.com',
    nationalId: '1199380029384726',
    address: 'Kicukiro, Gikondo, Kanserege',
    joinDate: '2023-05-15',
    status: 'active',
    totalSavings: 420000,
    totalLoans: 500000,
    outstandingLoanBalance: 320000,
    sharesCount: 84,
    monthlyPledgedSavings: 15000
  },
  {
    id: 'mem_07',
    memberNumber: 'HSG-007',
    fullName: 'Diane Ingabire',
    phone: '+250 784 332 871',
    email: 'diane.ingabire@gmail.com',
    nationalId: '1199570048291039',
    address: 'Nyarugenge, Muhima, Tetero',
    joinDate: '2023-06-01',
    status: 'active',
    totalSavings: 480000,
    totalLoans: 300000,
    outstandingLoanBalance: 0,
    sharesCount: 96,
    monthlyPledgedSavings: 15000
  },
  {
    id: 'mem_08',
    memberNumber: 'HSG-008',
    fullName: 'Eric Twahirwa',
    phone: '+250 788 129 450',
    email: 'eric.twahirwa@gmail.com',
    nationalId: '1198480039281745',
    address: 'Gasabo, Remera, Rukiri',
    joinDate: '2023-07-20',
    status: 'active',
    totalSavings: 640000,
    totalLoans: 700000,
    outstandingLoanBalance: 410000,
    sharesCount: 128,
    monthlyPledgedSavings: 20000
  }
];

export const INITIAL_CONTRIBUTIONS: Contribution[] = [
  {
    id: 'c_01',
    transactionRef: 'TXN-HSG-2026-089',
    memberId: 'mem_01',
    memberNumber: 'HSG-001',
    memberName: 'Jeanette Mukamana',
    amount: 50000,
    type: 'regular_savings',
    date: '2026-10-10',
    paymentMethod: 'momo',
    recordedBy: 'Emmanuel Nshimiyimana (Treasurer)',
    receiptNo: 'RC-2026-1089',
    notes: 'October monthly savings + welfare contribution',
    status: 'verified',
    createdAt: '2026-10-10T09:30:00Z'
  },
  {
    id: 'c_02',
    transactionRef: 'TXN-HSG-2026-090',
    memberId: 'mem_02',
    memberNumber: 'HSG-002',
    memberName: 'Emmanuel Nshimiyimana',
    amount: 40000,
    type: 'regular_savings',
    date: '2026-10-10',
    paymentMethod: 'momo',
    recordedBy: 'Claudine Uwimana (Secretary)',
    receiptNo: 'RC-2026-1090',
    status: 'verified',
    createdAt: '2026-10-10T09:35:00Z'
  },
  {
    id: 'c_03',
    transactionRef: 'TXN-HSG-2026-091',
    memberId: 'mem_03',
    memberNumber: 'HSG-003',
    memberName: 'Claudine Uwimana',
    amount: 30000,
    type: 'regular_savings',
    date: '2026-10-10',
    paymentMethod: 'cash_at_meeting',
    recordedBy: 'Emmanuel Nshimiyimana (Treasurer)',
    receiptNo: 'RC-2026-1091',
    status: 'verified',
    createdAt: '2026-10-10T10:15:00Z'
  },
  {
    id: 'c_04',
    transactionRef: 'TXN-HSG-2026-092',
    memberId: 'mem_04',
    memberNumber: 'HSG-004',
    memberName: 'Jean Bosco Hakizimana',
    amount: 35000,
    type: 'regular_savings',
    date: '2026-10-10',
    paymentMethod: 'momo',
    recordedBy: 'Emmanuel Nshimiyimana (Treasurer)',
    receiptNo: 'RC-2026-1092',
    status: 'verified',
    createdAt: '2026-10-10T10:45:00Z'
  },
  {
    id: 'c_05',
    transactionRef: 'TXN-HSG-2026-093',
    memberId: 'mem_05',
    memberNumber: 'HSG-005',
    memberName: 'Alphonsine Mukandayisenga',
    amount: 25000,
    type: 'share_purchase',
    date: '2026-10-12',
    paymentMethod: 'momo',
    recordedBy: 'Emmanuel Nshimiyimana (Treasurer)',
    receiptNo: 'RC-2026-1093',
    notes: 'Purchase of 5 additional cooperative shares',
    status: 'verified',
    createdAt: '2026-10-12T14:20:00Z'
  },
  {
    id: 'c_06',
    transactionRef: 'TXN-HSG-2026-094',
    memberId: 'mem_06',
    memberNumber: 'HSG-006',
    memberName: 'Patrick Habimana',
    amount: 20000,
    type: 'emergency_fund',
    date: '2026-10-13',
    paymentMethod: 'cash_at_meeting',
    recordedBy: 'Emmanuel Nshimiyimana (Treasurer)',
    receiptNo: 'RC-2026-1094',
    status: 'verified',
    createdAt: '2026-10-13T11:00:00Z'
  }
];

export const INITIAL_LOANS: Loan[] = [
  {
    id: 'ln_01',
    loanNumber: 'LN-2026-014',
    memberId: 'mem_04',
    memberName: 'Jean Bosco Hakizimana',
    requestedAmount: 600000,
    approvedAmount: 600000,
    purpose: 'Procurement of organic fertilizer & seedling trays for greenhouse tomato farm',
    interestRatePercent: 4.0,
    durationMonths: 6,
    guarantorMemberId: 'mem_01',
    guarantorName: 'Jeanette Mukamana',
    status: 'disbursed',
    totalPayable: 648000,
    outstandingBalance: 450000,
    disbursementDate: '2026-08-15',
    dueDate: '2027-02-15',
    approvedBy: 'Jeanette Mukamana (Chairperson)',
    createdAt: '2026-08-10T12:00:00Z'
  },
  {
    id: 'ln_02',
    loanNumber: 'LN-2026-015',
    memberId: 'mem_03',
    memberName: 'Claudine Uwimana',
    requestedAmount: 300000,
    approvedAmount: 300000,
    purpose: 'Inventory replenishment for tailoring textiles ahead of wedding season',
    interestRatePercent: 4.0,
    durationMonths: 4,
    guarantorMemberId: 'mem_02',
    guarantorName: 'Emmanuel Nshimiyimana',
    status: 'disbursed',
    totalPayable: 324000,
    outstandingBalance: 180000,
    disbursementDate: '2026-08-20',
    dueDate: '2026-12-20',
    approvedBy: 'Jeanette Mukamana (Chairperson)',
    createdAt: '2026-08-18T15:30:00Z'
  },
  {
    id: 'ln_03',
    loanNumber: 'LN-2026-016',
    memberId: 'mem_06',
    memberName: 'Patrick Habimana',
    requestedAmount: 400000,
    approvedAmount: 400000,
    purpose: 'Motorcycle comprehensive insurance and engine maintenance overhaul',
    interestRatePercent: 4.5,
    durationMonths: 5,
    guarantorMemberId: 'mem_08',
    guarantorName: 'Eric Twahirwa',
    status: 'disbursed',
    totalPayable: 436000,
    outstandingBalance: 320000,
    disbursementDate: '2026-09-05',
    dueDate: '2027-02-05',
    approvedBy: 'Jeanette Mukamana (Chairperson)',
    createdAt: '2026-09-02T10:15:00Z'
  },
  {
    id: 'ln_04',
    loanNumber: 'LN-2026-017',
    memberId: 'mem_08',
    memberName: 'Eric Twahirwa',
    requestedAmount: 500000,
    approvedAmount: 500000,
    purpose: 'Bulk purchase of Irish potatoes from Musanze for Kigali wholesale distribution',
    interestRatePercent: 4.0,
    durationMonths: 4,
    guarantorMemberId: 'mem_04',
    guarantorName: 'Jean Bosco Hakizimana',
    status: 'disbursed',
    totalPayable: 540000,
    outstandingBalance: 410000,
    disbursementDate: '2026-09-15',
    dueDate: '2027-01-15',
    approvedBy: 'Jeanette Mukamana (Chairperson)',
    createdAt: '2026-09-12T08:00:00Z'
  },
  {
    id: 'ln_05',
    loanNumber: 'LN-2026-018',
    memberId: 'mem_05',
    memberName: 'Alphonsine Mukandayisenga',
    requestedAmount: 350000,
    purpose: 'School fees for children and bookstore stock',
    interestRatePercent: 4.0,
    durationMonths: 3,
    guarantorMemberId: 'mem_07',
    guarantorName: 'Diane Ingabire',
    status: 'pending',
    totalPayable: 378000,
    outstandingBalance: 378000,
    createdAt: '2026-10-13T16:00:00Z'
  }
];

export const INITIAL_REPAYMENTS: LoanRepayment[] = [
  {
    id: 'rep_01',
    repaymentRef: 'REP-HSG-2026-041',
    loanId: 'ln_01',
    loanNumber: 'LN-2026-014',
    memberId: 'mem_04',
    memberName: 'Jean Bosco Hakizimana',
    amount: 108000,
    principalPortion: 100000,
    interestPortion: 8000,
    paymentDate: '2026-09-15',
    paymentMethod: 'momo',
    receiptNo: 'RP-2026-0941',
    recordedBy: 'Emmanuel Nshimiyimana',
    status: 'verified'
  },
  {
    id: 'rep_02',
    repaymentRef: 'REP-HSG-2026-042',
    loanId: 'ln_01',
    loanNumber: 'LN-2026-014',
    memberId: 'mem_04',
    memberName: 'Jean Bosco Hakizimana',
    amount: 108000,
    principalPortion: 100000,
    interestPortion: 8000,
    paymentDate: '2026-10-12',
    paymentMethod: 'momo',
    receiptNo: 'RP-2026-1042',
    recordedBy: 'Emmanuel Nshimiyimana',
    status: 'verified'
  },
  {
    id: 'rep_03',
    repaymentRef: 'REP-HSG-2026-043',
    loanId: 'ln_02',
    loanNumber: 'LN-2026-015',
    memberId: 'mem_03',
    memberName: 'Claudine Uwimana',
    amount: 81000,
    principalPortion: 75000,
    interestPortion: 6000,
    paymentDate: '2026-09-20',
    paymentMethod: 'cash_at_meeting',
    receiptNo: 'RP-2026-0943',
    recordedBy: 'Emmanuel Nshimiyimana',
    status: 'verified'
  },
  {
    id: 'rep_04',
    repaymentRef: 'REP-HSG-2026-044',
    loanId: 'ln_02',
    loanNumber: 'LN-2026-015',
    memberId: 'mem_03',
    memberName: 'Claudine Uwimana',
    amount: 81000,
    principalPortion: 75000,
    interestPortion: 6000,
    paymentDate: '2026-10-10',
    paymentMethod: 'momo',
    receiptNo: 'RP-2026-1044',
    recordedBy: 'Emmanuel Nshimiyimana',
    status: 'verified'
  }
];

export const INITIAL_EXPENSES: Expense[] = [
  {
    id: 'exp_01',
    expenseRef: 'EXP-HSG-2026-011',
    category: 'meeting_hall_rental',
    description: 'Community meeting hall rental fee for quarterly general assembly at Gisozi Sector',
    amount: 45000,
    date: '2026-09-28',
    recordedBy: 'Emmanuel Nshimiyimana (Treasurer)',
    approvedBy: 'Jeanette Mukamana (Chairperson)',
    status: 'approved'
  },
  {
    id: 'exp_02',
    expenseRef: 'EXP-HSG-2026-012',
    category: 'stationery_and_supplies',
    description: 'Official printed hardcover ledger books, stamp ink, and member savings passbooks',
    amount: 32000,
    date: '2026-10-02',
    recordedBy: 'Claudine Uwimana (Secretary)',
    approvedBy: 'Jeanette Mukamana (Chairperson)',
    status: 'approved'
  },
  {
    id: 'exp_03',
    expenseRef: 'EXP-HSG-2026-013',
    category: 'bank_charges',
    description: 'Monthly Bank of Kigali account maintenance and MoMo corporate disbursement fees',
    amount: 8500,
    date: '2026-10-05',
    recordedBy: 'Emmanuel Nshimiyimana (Treasurer)',
    approvedBy: 'Jeanette Mukamana (Chairperson)',
    status: 'approved'
  },
  {
    id: 'exp_04',
    expenseRef: 'EXP-HSG-2026-014',
    category: 'social_welfare_grant',
    description: 'Emergency solidarity bereavement grant to Hakizimana family as per group bylaws',
    amount: 75000,
    date: '2026-10-08',
    recordedBy: 'Emmanuel Nshimiyimana (Treasurer)',
    approvedBy: 'Jeanette Mukamana (Chairperson)',
    status: 'approved'
  }
];

export const INITIAL_BUDGETS: Budget[] = [
  { id: 'b_01', category: 'meeting_hall_rental', allocatedAmount: 200000, spentAmount: 45000, fiscalPeriod: '2026-Q4' },
  { id: 'b_02', category: 'stationery_and_supplies', allocatedAmount: 100000, spentAmount: 32000, fiscalPeriod: '2026-Q4' },
  { id: 'b_03', category: 'social_welfare_grant', allocatedAmount: 300000, spentAmount: 75000, fiscalPeriod: '2026-Q4' },
  { id: 'b_04', category: 'bank_charges', allocatedAmount: 50000, spentAmount: 8500, fiscalPeriod: '2026-Q4' },
  { id: 'b_05', category: 'transport_and_logistics', allocatedAmount: 80000, spentAmount: 12000, fiscalPeriod: '2026-Q4' }
];

export const INITIAL_SAVINGS_GOALS: SavingsGoal[] = [
  {
    id: 'sg_01',
    title: 'Cooperative Agricultural Land Acquisition in Bugesera',
    category: 'cooperative_investment',
    targetAmount: 8000000,
    currentAmount: 4250000,
    targetDate: '2027-06-30',
    status: 'active',
    createdBy: 'Jeanette Mukamana',
    description: 'Acquiring 2 hectares of fertile cooperative land for horticulture and shared grain warehousing.'
  },
  {
    id: 'sg_02',
    title: 'Annual Year-End Dividend & Share-Out Fund',
    category: 'annual_dividend_payout',
    targetAmount: 6000000,
    currentAmount: 4850000,
    targetDate: '2026-12-20',
    status: 'active',
    createdBy: 'Emmanuel Nshimiyimana',
    description: 'Accumulating member savings returns and accumulated interest earnings for distribution before festive holidays.'
  },
  {
    id: 'sg_03',
    title: 'Emergency Community Solidarity Reserve (Kugoboka)',
    category: 'emergency_pool',
    targetAmount: 2000000,
    currentAmount: 1450000,
    targetDate: '2026-11-30',
    status: 'active',
    createdBy: 'Claudine Uwimana',
    description: 'Instant zero-interest emergency solidarity fund for hospitalization and sudden family crises.'
  }
];

export const INITIAL_MEETINGS: Meeting[] = [
  {
    id: 'mtg_01',
    meetingNumber: 'MTG-2026-10',
    title: 'October Monthly Savings Assembly & Loan Review',
    date: '2026-10-25T14:00',
    location: 'Gisozi Community Center, Hall B',
    agenda: '1. Opening prayer & attendance\n2. Verification of monthly contributions and share purchases\n3. Consideration of 3 pending loan applications\n4. Review of Bugesera land acquisition progress\n5. Any Other Business (AOB)',
    attendanceCount: 28,
    totalCollectedAtMeeting: 680000,
    recordedBy: 'Claudine Uwimana (Secretary)'
  },
  {
    id: 'mtg_02',
    meetingNumber: 'MTG-2026-09',
    title: 'Quarterly Financial Audit and Bylaw Review',
    date: '2026-09-28T14:30',
    location: 'Gisozi Community Center',
    agenda: 'Presentation of Q3 financial statements by Treasurer, audit committee signoff, review of loan default mitigation protocols.',
    minutes: 'Meeting commenced at 14:35 chaired by Jeanette Mukamana. The Treasurer presented Q3 reports with 100% attendance. All members approved financial statements unanimously.',
    attendanceCount: 30,
    totalCollectedAtMeeting: 950000,
    recordedBy: 'Claudine Uwimana (Secretary)'
  }
];

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann_01',
    title: 'Contribution Deadline Reminder - October 2026 Cycle',
    content: 'Muraho banyamuryango, kindly ensure your monthly minimum savings (10,000 RWF) and welfare fund are submitted before October 25. MoMo Code: *182*8*1*892014# (Hindurubuzima).',
    priority: 'urgent',
    postedBy: 'Emmanuel Nshimiyimana (Treasurer)',
    date: '2026-10-14'
  },
  {
    id: 'ann_02',
    title: 'New Subsidized Agri-Equipment Loan Facility Available',
    content: 'The Executive Committee has approved an expanded loan ceiling up to 1,000,000 RWF for members investing in modern irrigation and greenhouse agricultural tools.',
    priority: 'normal',
    postedBy: 'Jeanette Mukamana (Chairperson)',
    date: '2026-10-11'
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log_01',
    action: 'RECORD_CONTRIBUTION',
    performedBy: 'Emmanuel Nshimiyimana',
    entityType: 'contributions',
    entityId: 'c_01',
    timestamp: '2026-10-10T09:30:00Z',
    details: 'Verified regular savings deposit of 50,000 RWF from Jeanette Mukamana (Ref: TXN-HSG-2026-089)'
  },
  {
    id: 'log_02',
    action: 'APPROVE_LOAN',
    performedBy: 'Jeanette Mukamana',
    entityType: 'loans',
    entityId: 'ln_01',
    timestamp: '2026-08-14T11:00:00Z',
    details: 'Approved agricultural micro-loan of 600,000 RWF for Jean Bosco Hakizimana at 4% monthly interest'
  },
  {
    id: 'log_03',
    action: 'DISBURSE_LOAN',
    performedBy: 'Emmanuel Nshimiyimana',
    entityType: 'loans',
    entityId: 'ln_01',
    timestamp: '2026-08-15T10:00:00Z',
    details: 'Disbursed 600,000 RWF via Bank of Kigali transfer to Jean Bosco Hakizimana'
  },
  {
    id: 'log_04',
    action: 'RECORD_EXPENSE',
    performedBy: 'Emmanuel Nshimiyimana',
    entityType: 'expenses',
    entityId: 'exp_01',
    timestamp: '2026-09-28T16:00:00Z',
    details: 'Logged hall rental payment of 45,000 RWF for Gisozi community center assembly'
  }
];
