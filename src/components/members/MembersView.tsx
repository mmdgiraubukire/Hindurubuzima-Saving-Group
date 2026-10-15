import React, { useState } from 'react';
import { useApp } from '../../context/AuthContext';
import { Member } from '../../types';
import { 
  Users, 
  UserPlus, 
  Search, 
  Download, 
  Phone, 
  MapPin, 
  PiggyBank, 
  HandCoins, 
  Edit3, 
  CheckCircle2, 
  X, 
  Filter, 
  ShieldAlert,
  ArrowUpRight,
  Receipt,
  UserX
} from 'lucide-react';
import { MemberFilterBar, MemberStatusFilter, MemberSortOption } from './MemberFilterBar';
import { MemberAnalyticsDashboard } from './MemberAnalyticsDashboard';

export const MembersView: React.FC = () => {
  const { 
    members, 
    addMember, 
    updateMember, 
    contributions, 
    loans, 
    repayments,
    formatRwf, 
    t, 
    currentUser 
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<MemberStatusFilter>('all');
  const [sortBy, setSortBy] = useState<MemberSortOption>('id_asc');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Status counts for filter chips
  const counts = {
    all: members.length,
    active: members.filter(m => m.status === 'active').length,
    suspended: members.filter(m => m.status === 'suspended').length,
    inactive: members.filter(m => m.status === 'inactive').length
  };

  // Add form state
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '+250 ',
    email: '',
    nationalId: '',
    address: 'Gasabo, Kigali',
    joinDate: new Date().toISOString().split('T')[0],
    monthlyPledgedSavings: 20000,
    emergencyContact: ''
  });

  // Robust search by name, member ID (HSG-xxx), phone, or address
  const filteredMembers = members.filter(m => {
    const term = searchTerm.trim().toLowerCase();
    const matchesSearch = 
      term === '' ||
      m.fullName.toLowerCase().includes(term) ||
      m.memberNumber.toLowerCase().includes(term) ||
      m.phone.toLowerCase().includes(term) ||
      m.address.toLowerCase().includes(term);

    const matchesStatus = statusFilter === 'all' || m.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Apply selected sort option
  const sortedAndFilteredMembers = [...filteredMembers].sort((a, b) => {
    switch (sortBy) {
      case 'id_asc':
        return a.memberNumber.localeCompare(b.memberNumber);
      case 'id_desc':
        return b.memberNumber.localeCompare(a.memberNumber);
      case 'name':
        return a.fullName.localeCompare(b.fullName);
      case 'savings_desc':
        return b.totalSavings - a.totalSavings;
      case 'loan_desc':
        return b.outstandingLoanBalance - a.outstandingLoanBalance;
      default:
        return 0;
    }
  });

  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setSortBy('id_asc');
  };

  const handleExportCsv = () => {
    const headers = ['Member Number', 'Full Name', 'Phone', 'Email', 'Address', 'Join Date', 'Status', 'Total Savings (RWF)', 'Total Loans (RWF)', 'Outstanding Balance (RWF)', 'Shares'];
    const rows = sortedAndFilteredMembers.map(m => [
      m.memberNumber,
      `"${m.fullName}"`,
      m.phone,
      m.email || '',
      `"${m.address}"`,
      m.joinDate,
      m.status,
      m.totalSavings,
      m.totalLoans,
      m.outstandingLoanBalance,
      m.sharesCount
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Hindurubuzima_Members_Roster_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCreateMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fullName.trim()) return;

    const nextNum = `HSG-${String(members.length + 1).padStart(3, '0')}`;
    addMember({
      memberNumber: nextNum,
      fullName: formData.fullName,
      phone: formData.phone,
      email: formData.email,
      nationalId: formData.nationalId,
      address: formData.address,
      joinDate: formData.joinDate,
      status: 'active',
      monthlyPledgedSavings: Number(formData.monthlyPledgedSavings),
      emergencyContact: formData.emergencyContact
    });

    setIsAddModalOpen(false);
    setFormData({
      fullName: '',
      phone: '+250 ',
      email: '',
      nationalId: '',
      address: 'Gasabo, Kigali',
      joinDate: new Date().toISOString().split('T')[0],
      monthlyPledgedSavings: 20000,
      emergencyContact: ''
    });
  };

  const handleUpdateMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember) return;
    updateMember(selectedMember.id, selectedMember);
    setIsEditModalOpen(false);
  };

  // Officer check
  const isOfficer = ['chairperson', 'secretary', 'treasurer', 'super_admin'].includes(currentUser.role);

  return (
    <div className="space-y-6">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-800" />
            {t.members} Roster & Directory
          </h1>
          <p className="text-xs text-slate-500">
            Registered members of Hindurubuzima Saving Group with verified share capital and loan portfolios.
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

          {isOfficer && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg shadow-2xs transition-colors cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              {t.addMember}
            </button>
          )}
        </div>
      </div>

      {/* Member Analytics & Performance Dashboard */}
      <MemberAnalyticsDashboard
        members={members}
        contributions={contributions}
        loans={loans}
        repayments={repayments}
        formatRwf={formatRwf}
      />

      {/* Robust Search and Filtering Component */}
      <MemberFilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        sortBy={sortBy}
        onSortChange={setSortBy}
        counts={counts}
        totalCount={members.length}
        filteredCount={sortedAndFilteredMembers.length}
        onResetFilters={handleResetFilters}
      />

      {/* Member Roster Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 font-semibold">Member</th>
                <th className="py-3 px-4 font-semibold">Phone & Location</th>
                <th className="py-3 px-4 font-semibold text-right">Total Savings</th>
                <th className="py-3 px-4 font-semibold text-right">Outstanding Loan</th>
                <th className="py-3 px-4 font-semibold text-center">Shares</th>
                <th className="py-3 px-4 font-semibold text-center">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedAndFilteredMembers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center max-w-sm mx-auto space-y-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
                        <UserX className="w-5 h-5" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-slate-800">No members found</p>
                        <p className="text-xs text-slate-500">
                          {searchTerm.trim() 
                            ? `No members matching "${searchTerm}" with status "${statusFilter}".` 
                            : `No members currently marked as "${statusFilter}".`}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleResetFilters}
                        className="px-3.5 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer"
                      >
                        Clear Search & Filters
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                sortedAndFilteredMembers.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-800 text-white font-bold flex items-center justify-center text-xs">
                        {m.fullName.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">{m.fullName}</div>
                        <div className="text-[11px] font-mono text-slate-500">{m.memberNumber} · Joined {m.joinDate}</div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="text-slate-800 font-mono text-[11px] flex items-center gap-1.5">
                      <Phone className="w-3 h-3 text-slate-400" />
                      {m.phone}
                    </div>
                    <div className="text-slate-500 text-[11px] flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {m.address}
                    </div>
                  </td>

                  <td className="py-3 px-4 text-right font-mono font-bold text-emerald-900 tabular-nums">
                    {formatRwf(m.totalSavings)}
                  </td>

                  <td className="py-3 px-4 text-right font-mono tabular-nums">
                    {m.outstandingLoanBalance > 0 ? (
                      <span className="font-bold text-amber-700">{formatRwf(m.outstandingLoanBalance)}</span>
                    ) : (
                      <span className="text-slate-400">0 RWF</span>
                    )}
                  </td>

                  <td className="py-3 px-4 text-center font-mono font-semibold text-slate-700">
                    {m.sharesCount}
                  </td>

                  <td className="py-3 px-4 text-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${
                      m.status === 'active' 
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                        : m.status === 'suspended'
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : 'bg-slate-100 text-slate-600 border border-slate-200'
                    }`}>
                      {m.status}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setSelectedMember(m)}
                        className="px-2.5 py-1 text-xs font-semibold text-emerald-800 hover:bg-emerald-50 rounded border border-emerald-300 transition-colors cursor-pointer"
                      >
                        Passbook
                      </button>

                      {isOfficer && (
                        <button
                          onClick={() => {
                            setSelectedMember(m);
                            setIsEditModalOpen(true);
                          }}
                          className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                          title="Edit Member"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Member Passbook / Statement Detail Modal */}
      {selectedMember && !isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-800 text-white font-bold flex items-center justify-center text-sm">
                  {selectedMember.fullName.charAt(0)}
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">{selectedMember.fullName}</h2>
                  <p className="text-xs text-slate-500 font-mono">
                    Member ID: {selectedMember.memberNumber} · Joined: {selectedMember.joinDate}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedMember(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Financial Summary */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                <span className="text-[11px] text-emerald-800 font-medium block">Accumulated Savings</span>
                <span className="text-lg font-bold text-emerald-950 font-mono tabular-nums">
                  {formatRwf(selectedMember.totalSavings)}
                </span>
              </div>
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                <span className="text-[11px] text-amber-800 font-medium block">Current Loan Debt</span>
                <span className="text-lg font-bold text-amber-950 font-mono tabular-nums">
                  {formatRwf(selectedMember.outstandingLoanBalance)}
                </span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[11px] text-slate-600 font-medium block">Cooperative Shares</span>
                <span className="text-lg font-bold text-slate-900 font-mono tabular-nums">
                  {selectedMember.sharesCount} shares
                </span>
              </div>
            </div>

            {/* Member Details */}
            <div className="bg-slate-50 p-4 rounded-xl space-y-2 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-500">Phone:</span>
                  <div className="font-mono font-medium text-slate-800">{selectedMember.phone}</div>
                </div>
                <div>
                  <span className="text-slate-500">National ID:</span>
                  <div className="font-mono font-medium text-slate-800">{selectedMember.nationalId || 'N/A'}</div>
                </div>
                <div>
                  <span className="text-slate-500">Residence / Sector:</span>
                  <div className="font-medium text-slate-800">{selectedMember.address}</div>
                </div>
                <div>
                  <span className="text-slate-500">Monthly Pledged Savings:</span>
                  <div className="font-mono font-medium text-emerald-800">{formatRwf(selectedMember.monthlyPledgedSavings)}</div>
                </div>
              </div>
            </div>

            {/* Contribution History for this member */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Recent Contributions & Savings History
              </h3>
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="py-2 px-3 font-semibold">Ref</th>
                      <th className="py-2 px-3 font-semibold">Type</th>
                      <th className="py-2 px-3 font-semibold text-right">Amount</th>
                      <th className="py-2 px-3 font-semibold">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {contributions.filter(c => c.memberId === selectedMember.id).map(c => (
                      <tr key={c.id}>
                        <td className="py-2 px-3 font-mono text-[11px] text-slate-700">{c.transactionRef}</td>
                        <td className="py-2 px-3 capitalize">{c.type.replace('_', ' ')}</td>
                        <td className="py-2 px-3 text-right font-mono font-semibold text-emerald-800 tabular-nums">
                          +{formatRwf(c.amount)}
                        </td>
                        <td className="py-2 px-3 font-mono text-slate-500 text-[11px]">{c.date}</td>
                      </tr>
                    ))}
                    {contributions.filter(c => c.memberId === selectedMember.id).length === 0 && (
                      <tr>
                        <td colSpan={4} className="py-4 text-center text-slate-400">No contributions recorded yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Active & Historical Loans for this member */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Loan Applications & Borrowing Record
              </h3>
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="py-2 px-3 font-semibold">Loan No</th>
                      <th className="py-2 px-3 font-semibold">Purpose</th>
                      <th className="py-2 px-3 font-semibold text-right">Principal</th>
                      <th className="py-2 px-3 font-semibold text-right">Outstanding</th>
                      <th className="py-2 px-3 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {loans.filter(l => l.memberId === selectedMember.id).map(l => (
                      <tr key={l.id}>
                        <td className="py-2 px-3 font-mono text-[11px] font-semibold text-slate-800">{l.loanNumber}</td>
                        <td className="py-2 px-3 truncate max-w-xs">{l.purpose}</td>
                        <td className="py-2 px-3 text-right font-mono tabular-nums">{formatRwf(l.requestedAmount)}</td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-amber-700 tabular-nums">{formatRwf(l.outstandingBalance)}</td>
                        <td className="py-2 px-3 capitalize font-medium">{l.status}</td>
                      </tr>
                    ))}
                    {loans.filter(l => l.memberId === selectedMember.id).length === 0 && (
                      <tr>
                        <td colSpan={5} className="py-4 text-center text-slate-400">No loan records for this member.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedMember(null)}
                className="px-4 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                Close Passbook
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-emerald-800" />
                Register New Group Member
              </h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateMember} className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Full Legal Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Marie Chantal Uwamahoro"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-emerald-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Phone Number (MoMo) *</label>
                  <input
                    type="text"
                    required
                    placeholder="+250 788 000 000"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-emerald-700 font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">National ID (16 Digits)</label>
                  <input
                    type="text"
                    maxLength={16}
                    placeholder="1199..."
                    value={formData.nationalId}
                    onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-emerald-700 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Email Address (Optional)</label>
                <input
                  type="email"
                  placeholder="member@gmail.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-emerald-700"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Residential Address (District, Sector, Cell)</label>
                <input
                  type="text"
                  placeholder="e.g. Gasabo, Gisozi, Musezero"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-emerald-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Monthly Pledged Savings (RWF)</label>
                  <input
                    type="number"
                    step={1000}
                    value={formData.monthlyPledgedSavings}
                    onChange={(e) => setFormData({ ...formData, monthlyPledgedSavings: Number(e.target.value) })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-emerald-700 font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Date Joined</label>
                  <input
                    type="date"
                    value={formData.joinDate}
                    onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-emerald-700"
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
                  className="px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg font-semibold shadow-xs"
                >
                  Register Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Member Modal */}
      {isEditModalOpen && selectedMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-emerald-800" />
                Edit Member: {selectedMember.fullName} ({selectedMember.memberNumber})
              </h2>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateMemberSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={selectedMember.fullName}
                  onChange={(e) => setSelectedMember({ ...selectedMember, fullName: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Phone</label>
                  <input
                    type="text"
                    required
                    value={selectedMember.phone}
                    onChange={(e) => setSelectedMember({ ...selectedMember, phone: e.target.value })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Status</label>
                  <select
                    value={selectedMember.status}
                    onChange={(e) => setSelectedMember({ ...selectedMember, status: e.target.value as any })}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                  >
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Residential Address</label>
                <input
                  type="text"
                  value={selectedMember.address}
                  onChange={(e) => setSelectedMember({ ...selectedMember, address: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Emergency Contact</label>
                <input
                  type="text"
                  value={selectedMember.emergencyContact || ''}
                  onChange={(e) => setSelectedMember({ ...selectedMember, emergencyContact: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg font-semibold shadow-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
