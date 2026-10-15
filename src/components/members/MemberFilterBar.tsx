import React from 'react';
import { Search, X, Filter, ArrowUpDown, RotateCcw } from 'lucide-react';

export type MemberStatusFilter = 'all' | 'active' | 'suspended' | 'inactive';
export type MemberSortOption = 'name' | 'id_asc' | 'id_desc' | 'savings_desc' | 'loan_desc';

interface MemberFilterBarProps {
  searchTerm: string;
  onSearchChange: (val: string) => void;
  statusFilter: MemberStatusFilter;
  onStatusFilterChange: (status: MemberStatusFilter) => void;
  sortBy: MemberSortOption;
  onSortChange: (sort: MemberSortOption) => void;
  counts: {
    all: number;
    active: number;
    suspended: number;
    inactive: number;
  };
  totalCount: number;
  filteredCount: number;
  onResetFilters: () => void;
}

export const MemberFilterBar: React.FC<MemberFilterBarProps> = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  sortBy,
  onSortChange,
  counts,
  totalCount,
  filteredCount,
  onResetFilters
}) => {
  const isFiltered = searchTerm.trim().length > 0 || statusFilter !== 'all' || sortBy !== 'id_asc';

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-4 space-y-3.5">
      {/* Top Row: Search Input + Sort Selection */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search Input Box */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by full name or member ID (e.g. Jeanette or HSG-001)..."
            className="w-full pl-9 pr-9 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-700 focus:border-emerald-700 transition-all font-medium"
          />
          {searchTerm.length > 0 && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Sort:</span>
          </div>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as MemberSortOption)}
            className="py-1.5 px-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 font-medium focus:outline-none focus:border-emerald-700 cursor-pointer"
          >
            <option value="id_asc">Member ID (Ascending)</option>
            <option value="id_desc">Member ID (Descending)</option>
            <option value="name">Full Name (A–Z)</option>
            <option value="savings_desc">Total Savings (High to Low)</option>
            <option value="loan_desc">Outstanding Loan (High to Low)</option>
          </select>

          {isFiltered && (
            <button
              type="button"
              onClick={onResetFilters}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-lg transition-colors cursor-pointer"
              title="Reset search and filters"
            >
              <RotateCcw className="w-3 h-3 text-slate-500" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Bottom Row: Status Filter Buttons & Results Count */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
        {/* Status Filter Segmented Controls */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-medium text-slate-500 mr-1 hidden lg:inline">
            Status:
          </span>

          <button
            type="button"
            onClick={() => onStatusFilterChange('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
              statusFilter === 'all'
                ? 'bg-emerald-900 text-white font-semibold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span>All Members</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-mono tabular-nums ${
              statusFilter === 'all' ? 'bg-emerald-800 text-amber-300' : 'bg-slate-200 text-slate-700'
            }`}>
              {counts.all}
            </span>
          </button>

          <button
            type="button"
            onClick={() => onStatusFilterChange('active')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
              statusFilter === 'active'
                ? 'bg-emerald-700 text-white font-semibold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Active</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-mono tabular-nums ${
              statusFilter === 'active' ? 'bg-emerald-800 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {counts.active}
            </span>
          </button>

          <button
            type="button"
            onClick={() => onStatusFilterChange('suspended')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
              statusFilter === 'suspended'
                ? 'bg-amber-600 text-white font-semibold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            <span>Suspended</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-mono tabular-nums ${
              statusFilter === 'suspended' ? 'bg-amber-700 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {counts.suspended}
            </span>
          </button>

          <button
            type="button"
            onClick={() => onStatusFilterChange('inactive')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 shrink-0 ${
              statusFilter === 'inactive'
                ? 'bg-slate-700 text-white font-semibold shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-slate-400"></span>
            <span>Inactive</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-mono tabular-nums ${
              statusFilter === 'inactive' ? 'bg-slate-800 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {counts.inactive}
            </span>
          </button>
        </div>

        {/* Results Count Text */}
        <div className="text-xs text-slate-500 font-medium shrink-0">
          Showing <span className="font-bold text-slate-900 font-mono tabular-nums">{filteredCount}</span> of{' '}
          <span className="font-mono tabular-nums">{totalCount}</span> members
        </div>
      </div>
    </div>
  );
};
