import React from 'react';
import { useApp } from '../../context/AuthContext';
import { Printer, X, CheckCircle2, ShieldCheck, Download } from 'lucide-react';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  receiptData: {
    receiptNo: string;
    transactionRef: string;
    title: string;
    memberName: string;
    memberNumber: string;
    amount: number;
    date: string;
    type: string;
    paymentMethod: string;
    recordedBy: string;
    notes?: string;
    principalPortion?: number;
    interestPortion?: number;
  } | null;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ isOpen, onClose, receiptData }) => {
  const { formatRwf, t } = useApp();

  if (!isOpen || !receiptData) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col">
        {/* Modal Controls */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-2 text-emerald-900 font-semibold text-sm">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Official Transaction Voucher
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-800 text-white rounded-lg hover:bg-emerald-700 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              Print Receipt
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Body */}
        <div id="printable-receipt" className="p-8 text-slate-800 space-y-6 bg-white">
          {/* Header */}
          <div className="text-center pb-4 border-b border-dashed border-slate-300">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-900 text-amber-400 mb-2 font-bold text-xl">
              H
            </div>
            <h2 className="text-lg font-bold text-slate-900 uppercase tracking-tight">
              Hindurubuzima Saving Group
            </h2>
            <p className="text-xs text-slate-500">
              Community Savings & Credit Association (Ibimina) · Gisozi Sector, Gasabo District, Kigali
            </p>
            <div className="mt-3 flex items-center justify-center gap-3 text-xs text-slate-600">
              <span className="font-mono font-medium">Receipt: {receiptData.receiptNo}</span>
              <span>·</span>
              <span className="font-mono">{receiptData.transactionRef}</span>
            </div>
          </div>

          {/* Amount Showcase */}
          <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-200/60 text-center">
            <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider block">
              Verified Amount Received
            </span>
            <span className="text-2xl font-bold text-emerald-950 font-mono tabular-nums">
              {formatRwf(receiptData.amount)}
            </span>
            <span className="text-[11px] text-emerald-700 block mt-1">
              Payment via: {receiptData.paymentMethod.toUpperCase()}
            </span>
          </div>

          {/* Metadata Grid */}
          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Member Name:</span>
              <span className="font-semibold text-slate-900">{receiptData.memberName}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Member Number:</span>
              <span className="font-mono font-semibold text-slate-900">{receiptData.memberNumber}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Transaction Category:</span>
              <span className="font-medium text-slate-900">{receiptData.type}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Transaction Date:</span>
              <span className="font-mono text-slate-900">{receiptData.date}</span>
            </div>

            {receiptData.principalPortion !== undefined && (
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Principal Credited:</span>
                <span className="font-mono text-slate-900">{formatRwf(receiptData.principalPortion)}</span>
              </div>
            )}

            {receiptData.interestPortion !== undefined && (
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Interest Credited:</span>
                <span className="font-mono text-slate-900">{formatRwf(receiptData.interestPortion)}</span>
              </div>
            )}

            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Authorized Officer:</span>
              <span className="font-medium text-slate-900">{receiptData.recordedBy}</span>
            </div>

            {receiptData.notes && (
              <div className="pt-1">
                <span className="text-slate-500 block mb-0.5">Remarks:</span>
                <span className="text-slate-700 italic text-[11px]">{receiptData.notes}</span>
              </div>
            )}
          </div>

          {/* Footer & Verification Seal */}
          <div className="pt-4 border-t border-dashed border-slate-300 text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-800">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified Immutable Ledger Record
            </div>
            <p className="text-[10px] text-slate-400">
              This electronic receipt was generated from the Hindurubuzima Saving Group database. Valid without handwritten signature under cooperative statute.
            </p>
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Close Receipt
          </button>
        </div>
      </div>
    </div>
  );
};
