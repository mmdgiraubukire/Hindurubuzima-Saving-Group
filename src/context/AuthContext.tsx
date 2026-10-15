import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  UserRole, 
  UserProfile, 
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
import { 
  INITIAL_MEMBERS, 
  INITIAL_CONTRIBUTIONS, 
  INITIAL_LOANS, 
  INITIAL_REPAYMENTS, 
  INITIAL_EXPENSES, 
  INITIAL_BUDGETS, 
  INITIAL_SAVINGS_GOALS, 
  INITIAL_MEETINGS, 
  INITIAL_ANNOUNCEMENTS, 
  INITIAL_AUDIT_LOGS 
} from '../services/dataService';
import { 
  auth, 
  db, 
  testConnection, 
  handleFirestoreError, 
  OperationType 
} from '../firebase/config';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut as firebaseSignOut 
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc 
} from 'firebase/firestore';
import { Language, translations } from '../translations/i18n';

export type ActiveTab = 
  | 'dashboard' 
  | 'members' 
  | 'savings' 
  | 'contributions' 
  | 'loans' 
  | 'repayments' 
  | 'expenses' 
  | 'budgets' 
  | 'savingsGoals' 
  | 'bankImports' 
  | 'reports' 
  | 'meetings' 
  | 'announcements' 
  | 'auditLogs'
  | 'settings';

interface AppContextType {
  currentUser: UserProfile;
  setCurrentUserRole: (role: UserRole) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations.en;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  formatRwf: (val: number) => string;
  isFirebaseConnected: boolean;
  
  // Data state
  members: Member[];
  contributions: Contribution[];
  loans: Loan[];
  repayments: LoanRepayment[];
  expenses: Expense[];
  budgets: Budget[];
  savingsGoals: SavingsGoal[];
  meetings: Meeting[];
  announcements: Announcement[];
  auditLogs: AuditLog[];
  bankImports: BankImport[];

  // Mutations
  addMember: (m: Omit<Member, 'id' | 'totalSavings' | 'totalLoans' | 'outstandingLoanBalance' | 'sharesCount'>) => void;
  updateMember: (id: string, m: Partial<Member>) => void;
  addContribution: (c: Omit<Contribution, 'id' | 'transactionRef' | 'receiptNo' | 'createdAt' | 'status'>) => Contribution;
  applyForLoan: (l: Omit<Loan, 'id' | 'loanNumber' | 'status' | 'totalPayable' | 'outstandingBalance' | 'createdAt'>) => Loan;
  updateLoanStatus: (loanId: string, status: Loan['status'], notes?: string) => void;
  addRepayment: (r: Omit<LoanRepayment, 'id' | 'repaymentRef' | 'receiptNo' | 'status'>) => LoanRepayment;
  addExpense: (e: Omit<Expense, 'id' | 'expenseRef' | 'status'>) => Expense;
  updateExpenseStatus: (expenseId: string, status: Expense['status']) => void;
  addSavingsGoal: (g: Omit<SavingsGoal, 'id' | 'currentAmount' | 'status'>) => void;
  updateSavingsGoal: (id: string, currentAmount: number) => void;
  addMeeting: (m: Omit<Meeting, 'id' | 'meetingNumber'>) => void;
  addAnnouncement: (a: Omit<Announcement, 'id' | 'date'>) => void;
  addBankImport: (b: BankImport) => void;

  // Auth methods
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  demoLoginAs: (role: UserRole) => void;
}

const DEFAULT_USER: UserProfile = {
  uid: 'usr_chairperson',
  email: 'TwagiramunguMichel15@gmail.com',
  displayName: 'Michel Twagiramungu',
  role: 'chairperson',
  phone: '+250 788 500 123',
  memberId: 'mem_01',
  createdAt: new Date().toISOString()
};

const AuthContext = createContext<AppContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('hsg_current_user');
    return saved ? JSON.parse(saved) : DEFAULT_USER;
  });
  const [language, setLanguage] = useState<Language>('en');
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [isFirebaseConnected, setIsFirebaseConnected] = useState<boolean>(true);

  // Entities initialized from local storage or defaults
  const [members, setMembers] = useState<Member[]>(() => {
    const saved = localStorage.getItem('hsg_members');
    return saved ? JSON.parse(saved) : INITIAL_MEMBERS;
  });

  const [contributions, setContributions] = useState<Contribution[]>(() => {
    const saved = localStorage.getItem('hsg_contributions');
    return saved ? JSON.parse(saved) : INITIAL_CONTRIBUTIONS;
  });

  const [loans, setLoans] = useState<Loan[]>(() => {
    const saved = localStorage.getItem('hsg_loans');
    return saved ? JSON.parse(saved) : INITIAL_LOANS;
  });

  const [repayments, setRepayments] = useState<LoanRepayment[]>(() => {
    const saved = localStorage.getItem('hsg_repayments');
    return saved ? JSON.parse(saved) : INITIAL_REPAYMENTS;
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem('hsg_expenses');
    return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
  });

  const [budgets, setBudgets] = useState<Budget[]>(() => {
    const saved = localStorage.getItem('hsg_budgets');
    return saved ? JSON.parse(saved) : INITIAL_BUDGETS;
  });

  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(() => {
    const saved = localStorage.getItem('hsg_savings_goals');
    return saved ? JSON.parse(saved) : INITIAL_SAVINGS_GOALS;
  });

  const [meetings, setMeetings] = useState<Meeting[]>(() => {
    const saved = localStorage.getItem('hsg_meetings');
    return saved ? JSON.parse(saved) : INITIAL_MEETINGS;
  });

  const [announcements, setAnnouncements] = useState<Announcement[]>(() => {
    const saved = localStorage.getItem('hsg_announcements');
    return saved ? JSON.parse(saved) : INITIAL_ANNOUNCEMENTS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('hsg_audit_logs');
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  const [bankImports, setBankImports] = useState<BankImport[]>(() => {
    const saved = localStorage.getItem('hsg_bank_imports');
    return saved ? JSON.parse(saved) : [];
  });

  // Test Firebase connection on boot as mandated
  useEffect(() => {
    testConnection().then(connected => {
      setIsFirebaseConnected(connected);
    });

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Sync user profile to Firestore
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists()) {
            const data = docSnap.data() as UserProfile;
            setCurrentUser(data);
          } else {
            const newProfile: UserProfile = {
              uid: user.uid,
              email: user.email || 'user@hindurubuzima.rw',
              displayName: user.displayName || 'Group Member',
              role: user.email === 'TwagiramunguMichel15@gmail.com' ? 'super_admin' : 'member',
              createdAt: new Date().toISOString()
            };
            await setDoc(userDocRef, newProfile);
            setCurrentUser(newProfile);
          }
        } catch (err) {
          console.warn('Firestore profile sync error (using cached profile):', err);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Save changes to localStorage for offline robustness
  useEffect(() => {
    localStorage.setItem('hsg_current_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('hsg_members', JSON.stringify(members));
  }, [members]);

  useEffect(() => {
    localStorage.setItem('hsg_contributions', JSON.stringify(contributions));
  }, [contributions]);

  useEffect(() => {
    localStorage.setItem('hsg_loans', JSON.stringify(loans));
  }, [loans]);

  useEffect(() => {
    localStorage.setItem('hsg_repayments', JSON.stringify(repayments));
  }, [repayments]);

  useEffect(() => {
    localStorage.setItem('hsg_expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('hsg_budgets', JSON.stringify(budgets));
  }, [budgets]);

  useEffect(() => {
    localStorage.setItem('hsg_savings_goals', JSON.stringify(savingsGoals));
  }, [savingsGoals]);

  useEffect(() => {
    localStorage.setItem('hsg_meetings', JSON.stringify(meetings));
  }, [meetings]);

  useEffect(() => {
    localStorage.setItem('hsg_announcements', JSON.stringify(announcements));
  }, [announcements]);

  useEffect(() => {
    localStorage.setItem('hsg_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem('hsg_bank_imports', JSON.stringify(bankImports));
  }, [bankImports]);

  const t = translations[language];

  const formatRwf = (val: number): string => {
    return new Intl.NumberFormat('en-RW', {
      style: 'decimal',
      maximumFractionDigits: 0
    }).format(val) + ' ' + t.currency;
  };

  const addAuditEntry = (action: string, entityType: string, entityId: string, details: string) => {
    const entry: AuditLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      action,
      performedBy: currentUser.displayName,
      entityType,
      entityId,
      timestamp: new Date().toISOString(),
      details
    };
    setAuditLogs(prev => [entry, ...prev]);

    // Optional sync to Firestore auditLogs
    try {
      setDoc(doc(db, 'auditLogs', entry.id), entry).catch(() => {});
    } catch {
      // Non-blocking
    }
  };

  const setCurrentUserRole = (role: UserRole) => {
    setCurrentUser(prev => ({
      ...prev,
      role
    }));
    addAuditEntry('ROLE_SWITCH', 'users', currentUser.uid, `Switched interface persona to ${role}`);
  };

  const demoLoginAs = (role: UserRole) => {
    let name = 'Group Member';
    let email = 'member@hindurubuzima.rw';
    let memId = 'mem_04';

    if (role === 'chairperson') {
      name = 'Jeanette Mukamana';
      email = 'j.mukamana@hindurubuzima.rw';
      memId = 'mem_01';
    } else if (role === 'treasurer') {
      name = 'Emmanuel Nshimiyimana';
      email = 'e.nshimiyimana@hindurubuzima.rw';
      memId = 'mem_02';
    } else if (role === 'secretary') {
      name = 'Claudine Uwimana';
      email = 'c.uwimana@hindurubuzima.rw';
      memId = 'mem_03';
    } else if (role === 'super_admin') {
      name = 'Michel Twagiramungu';
      email = 'TwagiramunguMichel15@gmail.com';
      memId = 'mem_01';
    }

    const updated: UserProfile = {
      uid: `usr_${role}`,
      displayName: name,
      email,
      role,
      memberId: memId,
      createdAt: new Date().toISOString()
    };
    setCurrentUser(updated);
    addAuditEntry('DEMO_AUTH_SWITCH', 'users', updated.uid, `Switched persona to ${role} (${name})`);
  };

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const res = await signInWithPopup(auth, provider);
      const user = res.user;
      const profile: UserProfile = {
        uid: user.uid,
        email: user.email || 'user@hindurubuzima.rw',
        displayName: user.displayName || 'Authorized Member',
        role: user.email === 'TwagiramunguMichel15@gmail.com' ? 'super_admin' : 'chairperson',
        createdAt: new Date().toISOString()
      };
      setCurrentUser(profile);
      try {
        await setDoc(doc(db, 'users', user.uid), profile);
      } catch (err) {
        console.warn('User profile sync to firestore:', err);
      }
    } catch (err) {
      console.error('Google Sign In error:', err);
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (err) {
      console.warn('Sign out warning:', err);
    }
    demoLoginAs('member');
  };

  // Add Member
  const addMember = (m: Omit<Member, 'id' | 'totalSavings' | 'totalLoans' | 'outstandingLoanBalance' | 'sharesCount'>) => {
    const id = `mem_${Date.now()}`;
    const newMember: Member = {
      ...m,
      id,
      totalSavings: 0,
      totalLoans: 0,
      outstandingLoanBalance: 0,
      sharesCount: 0
    };
    setMembers(prev => [newMember, ...prev]);
    addAuditEntry('REGISTER_MEMBER', 'members', id, `Registered new member ${newMember.fullName} (${newMember.memberNumber})`);
    try {
      setDoc(doc(db, 'members', id), newMember).catch(() => {});
    } catch {}
  };

  const updateMember = (id: string, m: Partial<Member>) => {
    setMembers(prev => prev.map(item => item.id === id ? { ...item, ...m } : item));
    addAuditEntry('UPDATE_MEMBER', 'members', id, `Updated member profile details`);
    try {
      setDoc(doc(db, 'members', id), m, { merge: true }).catch(() => {});
    } catch {}
  };

  // Record Contribution
  const addContribution = (c: Omit<Contribution, 'id' | 'transactionRef' | 'receiptNo' | 'createdAt' | 'status'>): Contribution => {
    const id = `c_${Date.now()}`;
    const transactionRef = `TXN-HSG-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    const receiptNo = `RC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newContrib: Contribution = {
      ...c,
      id,
      transactionRef,
      receiptNo,
      status: 'verified',
      createdAt: new Date().toISOString()
    };

    setContributions(prev => [newContrib, ...prev]);

    // Update member's accumulated savings
    setMembers(prev => prev.map(m => {
      if (m.id === c.memberId) {
        const extraShares = c.type === 'share_purchase' ? Math.floor(c.amount / 5000) : 0;
        return {
          ...m,
          totalSavings: m.totalSavings + c.amount,
          sharesCount: m.sharesCount + extraShares
        };
      }
      return m;
    }));

    addAuditEntry(
      'RECORD_CONTRIBUTION',
      'contributions',
      id,
      `Recorded ${newContrib.amount} RWF (${newContrib.type}) from ${newContrib.memberName} [Ref: ${transactionRef}]`
    );

    try {
      setDoc(doc(db, 'contributions', id), newContrib).catch(() => {});
    } catch {}

    return newContrib;
  };

  // Apply Loan
  const applyForLoan = (l: Omit<Loan, 'id' | 'loanNumber' | 'status' | 'totalPayable' | 'outstandingBalance' | 'createdAt'>): Loan => {
    const id = `ln_${Date.now()}`;
    const loanNumber = `LN-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    const interest = (l.requestedAmount * (l.interestRatePercent / 100) * l.durationMonths);
    const totalPayable = l.requestedAmount + interest;

    const newLoan: Loan = {
      ...l,
      id,
      loanNumber,
      status: 'pending',
      totalPayable,
      outstandingBalance: totalPayable,
      createdAt: new Date().toISOString()
    };

    setLoans(prev => [newLoan, ...prev]);
    addAuditEntry(
      'APPLY_LOAN',
      'loans',
      id,
      `Submitted loan application for ${newLoan.requestedAmount} RWF by ${newLoan.memberName} [${loanNumber}]`
    );

    try {
      setDoc(doc(db, 'loans', id), newLoan).catch(() => {});
    } catch {}

    return newLoan;
  };

  // Update Loan Status
  const updateLoanStatus = (loanId: string, status: Loan['status'], notes?: string) => {
    setLoans(prev => prev.map(loan => {
      if (loan.id === loanId) {
        const updated: Loan = {
          ...loan,
          status,
          approvedBy: status === 'approved' || status === 'disbursed' ? currentUser.displayName : loan.approvedBy,
          disbursementDate: status === 'disbursed' ? new Date().toISOString().split('T')[0] : loan.disbursementDate,
          dueDate: status === 'disbursed' 
            ? new Date(Date.now() + loan.durationMonths * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] 
            : loan.dueDate,
          rejectionReason: status === 'rejected' ? notes : undefined
        };

        if (status === 'disbursed') {
          // Increment member's total loans
          setMembers(mPrev => mPrev.map(m => m.id === loan.memberId ? {
            ...m,
            totalLoans: m.totalLoans + (loan.approvedAmount || loan.requestedAmount),
            outstandingLoanBalance: m.outstandingLoanBalance + loan.totalPayable
          } : m));
        }

        return updated;
      }
      return loan;
    }));

    addAuditEntry('UPDATE_LOAN_STATUS', 'loans', loanId, `Updated loan ${loanId} state to ${status}`);
    try {
      setDoc(doc(db, 'loans', loanId), { status, approvedBy: currentUser.displayName }, { merge: true }).catch(() => {});
    } catch {}
  };

  // Record Repayment
  const addRepayment = (r: Omit<LoanRepayment, 'id' | 'repaymentRef' | 'receiptNo' | 'status'>): LoanRepayment => {
    const id = `rep_${Date.now()}`;
    const repaymentRef = `REP-HSG-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    const receiptNo = `RP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newRepayment: LoanRepayment = {
      ...r,
      id,
      repaymentRef,
      receiptNo,
      status: 'verified'
    };

    setRepayments(prev => [newRepayment, ...prev]);

    // Update loan outstanding balance and close if paid off
    setLoans(prev => prev.map(loan => {
      if (loan.id === r.loanId) {
        const newBal = Math.max(0, loan.outstandingBalance - r.amount);
        return {
          ...loan,
          outstandingBalance: newBal,
          status: newBal === 0 ? 'closed' : loan.status
        };
      }
      return loan;
    }));

    // Update member's outstanding balance
    setMembers(prev => prev.map(m => {
      if (m.id === r.memberId) {
        return {
          ...m,
          outstandingLoanBalance: Math.max(0, m.outstandingLoanBalance - r.amount)
        };
      }
      return m;
    }));

    addAuditEntry(
      'RECORD_REPAYMENT',
      'loanRepayments',
      id,
      `Recorded repayment of ${r.amount} RWF for Loan ${r.loanNumber} from ${r.memberName}`
    );

    try {
      setDoc(doc(db, 'loanRepayments', id), newRepayment).catch(() => {});
    } catch {}

    return newRepayment;
  };

  // Add Expense
  const addExpense = (e: Omit<Expense, 'id' | 'expenseRef' | 'status'>): Expense => {
    const id = `exp_${Date.now()}`;
    const expenseRef = `EXP-HSG-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

    const newExpense: Expense = {
      ...e,
      id,
      expenseRef,
      status: 'approved'
    };

    setExpenses(prev => [newExpense, ...prev]);

    // Update budget spent amount
    setBudgets(prev => prev.map(b => {
      if (b.category === e.category) {
        return { ...b, spentAmount: b.spentAmount + e.amount };
      }
      return b;
    }));

    addAuditEntry(
      'RECORD_EXPENSE',
      'expenses',
      id,
      `Recorded group expense of ${e.amount} RWF for ${e.category} (${e.description})`
    );

    try {
      setDoc(doc(db, 'expenses', id), newExpense).catch(() => {});
    } catch {}

    return newExpense;
  };

  const updateExpenseStatus = (expenseId: string, status: Expense['status']) => {
    setExpenses(prev => prev.map(exp => exp.id === expenseId ? { ...exp, status } : exp));
    addAuditEntry('UPDATE_EXPENSE_STATUS', 'expenses', expenseId, `Expense status updated to ${status}`);
  };

  // Add Savings Goal
  const addSavingsGoal = (g: Omit<SavingsGoal, 'id' | 'currentAmount' | 'status'>) => {
    const id = `sg_${Date.now()}`;
    const newGoal: SavingsGoal = {
      ...g,
      id,
      currentAmount: 0,
      status: 'active'
    };
    setSavingsGoals(prev => [newGoal, ...prev]);
    addAuditEntry('CREATE_SAVINGS_GOAL', 'savingsGoals', id, `Created goal: ${g.title} (${g.targetAmount} RWF)`);
  };

  const updateSavingsGoal = (id: string, currentAmount: number) => {
    setSavingsGoals(prev => prev.map(g => {
      if (g.id === id) {
        const achieved = currentAmount >= g.targetAmount;
        return {
          ...g,
          currentAmount,
          status: achieved ? 'achieved' : g.status
        };
      }
      return g;
    }));
  };

  // Meetings
  const addMeeting = (m: Omit<Meeting, 'id' | 'meetingNumber'>) => {
    const id = `mtg_${Date.now()}`;
    const meetingNumber = `MTG-${new Date().getFullYear()}-${Math.floor(10 + Math.random() * 90)}`;
    const newMeeting: Meeting = { ...m, id, meetingNumber };
    setMeetings(prev => [newMeeting, ...prev]);
    addAuditEntry('SCHEDULE_MEETING', 'meetings', id, `Scheduled meeting: ${m.title} at ${m.location}`);
  };

  // Announcements
  const addAnnouncement = (a: Omit<Announcement, 'id' | 'date'>) => {
    const id = `ann_${Date.now()}`;
    const date = new Date().toISOString().split('T')[0];
    const newAnn: Announcement = { ...a, id, date };
    setAnnouncements(prev => [newAnn, ...prev]);
    addAuditEntry('POST_ANNOUNCEMENT', 'announcements', id, `Posted announcement: ${a.title}`);
  };

  // Bank Imports
  const addBankImport = (b: BankImport) => {
    setBankImports(prev => [b, ...prev]);
    addAuditEntry('IMPORT_BANK_STATEMENT', 'bankImports', b.id, `Imported statement ${b.fileName} with ${b.totalRows} transactions`);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        setCurrentUserRole,
        language,
        setLanguage,
        t,
        activeTab,
        setActiveTab,
        formatRwf,
        isFirebaseConnected,
        members,
        contributions,
        loans,
        repayments,
        expenses,
        budgets,
        savingsGoals,
        meetings,
        announcements,
        auditLogs,
        bankImports,
        addMember,
        updateMember,
        addContribution,
        applyForLoan,
        updateLoanStatus,
        addRepayment,
        addExpense,
        updateExpenseStatus,
        addSavingsGoal,
        updateSavingsGoal,
        addMeeting,
        addAnnouncement,
        addBankImport,
        signInWithGoogle,
        signOut,
        demoLoginAs
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useApp must be used within an AuthProvider');
  }
  return context;
};
