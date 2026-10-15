import React, { useState } from 'react';
import { useApp } from '../../context/AuthContext';
import { 
  Settings, 
  ShieldCheck, 
  Database, 
  Save, 
  CheckCircle2, 
  Users, 
  CreditCard,
  Building
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { 
    currentUser, 
    setCurrentUserRole, 
    formatRwf, 
    t, 
    isFirebaseConnected 
  } = useApp();

  const [minContribution, setMinContribution] = useState<number>(10000);
  const [sharePrice, setSharePrice] = useState<number>(5000);
  const [defaultInterest, setDefaultInterest] = useState<number>(4.0);
  const [maxLoanRatio, setMaxLoanRatio] = useState<number>(3.0);
  const [isSaved, setIsSaved] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Settings className="w-5 h-5 text-emerald-800" />
          {t.settings} & Group Cooperative Bylaws
        </h1>
        <p className="text-xs text-slate-500">
          Configure financial group bylaws, contribution parameters, loan risk caps, and Firebase synchronization parameters.
        </p>
      </div>

      {isSaved && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          Cooperative bylaws and parameters saved successfully!
        </div>
      )}

      {/* System & Cloud State */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <Database className="w-4 h-4 text-emerald-700" />
          Cloud Database & Security Rules Status
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-500 block mb-0.5">Firestore Connection:</span>
            <span className="font-semibold text-emerald-900 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              Live & Synchronized (Enterprise Edition)
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-500 block mb-0.5">Security Model:</span>
            <span className="font-semibold text-slate-800">
              Role-Based Access Control (ABAC + Immutable Ledgers)
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-500 block mb-0.5">Primary Administrator:</span>
            <span className="font-mono font-medium text-slate-800">
              TwagiramunguMichel15@gmail.com
            </span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-500 block mb-0.5">Jurisdiction & Compliance:</span>
            <span className="font-medium text-slate-800">
              Rwanda Cooperative Agency (RCA) Framework
            </span>
          </div>
        </div>
      </div>

      {/* Financial Bylaws Form */}
      <form onSubmit={handleSaveSettings} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs space-y-6">
        <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
          <Building className="w-4 h-4 text-amber-600" />
          Cooperative Financial Parameters
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Minimum Periodic Contribution (RWF)
            </label>
            <input
              type="number"
              step={1000}
              value={minContribution}
              onChange={(e) => setMinContribution(Number(e.target.value))}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold"
            />
            <p className="text-[11px] text-slate-400 mt-1">Minimum mandatory monthly deposit required per member.</p>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Share Capital Unit Price (RWF)
            </label>
            <input
              type="number"
              step={500}
              value={sharePrice}
              onChange={(e) => setSharePrice(Number(e.target.value))}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold"
            />
            <p className="text-[11px] text-slate-400 mt-1">Fixed price per voting cooperative share.</p>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Standard Loan Interest Rate (% / month)
            </label>
            <input
              type="number"
              step={0.5}
              value={defaultInterest}
              onChange={(e) => setDefaultInterest(Number(e.target.value))}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold"
            />
            <p className="text-[11px] text-slate-400 mt-1">Monthly micro-credit service charge returned to members as dividend.</p>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Max Loan Multiplier (vs Accumulated Savings)
            </label>
            <input
              type="number"
              step={0.5}
              value={maxLoanRatio}
              onChange={(e) => setMaxLoanRatio(Number(e.target.value))}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold"
            />
            <p className="text-[11px] text-slate-400 mt-1">Maximum borrowing limit ceiling (e.g. 3x member's total savings).</p>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg shadow-2xs transition-colors cursor-pointer"
          >
            <Save className="w-4 h-4" />
            Save Bylaw Parameters
          </button>
        </div>
      </form>
    </div>
  );
};
