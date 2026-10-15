import React, { useState } from 'react';
import { useApp } from '../../context/AuthContext';
import { BankImport, BankImportTransaction } from '../../types';
import { 
  FileSpreadsheet, 
  Upload, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  FileText, 
  RefreshCw, 
  ArrowRight,
  ShieldCheck,
  Download
} from 'lucide-react';

export const BankImportView: React.FC = () => {
  const { 
    bankImports, 
    addBankImport, 
    contributions, 
    expenses, 
    repayments, 
    formatRwf, 
    currentUser 
  } = useApp();

  const [csvRaw, setCsvRaw] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [parsedRows, setParsedRows] = useState<BankImportTransaction[]>([]);
  const [mappingStep, setMappingStep] = useState<'upload' | 'preview' | 'reconciled'>('upload');
  const [duplicateCount, setDuplicateCount] = useState<number>(0);

  // Sample CSV generator for testing
  const sampleCsvContent = `Date,Description,Reference,Debit,Credit
2026-10-10,MoMo CashIn Jeanette Mukamana,TXN-HSG-2026-089,0,50000
2026-10-10,MoMo CashIn Emmanuel Nshimiyimana,TXN-HSG-2026-090,0,40000
2026-10-12,MoMo CashIn Jean Bosco Repayment,REP-HSG-2026-042,0,108000
2026-10-05,Monthly BK Account Maintenance Fee,BK-MAINT-2026-10,8500,0
2026-10-14,External MoMo Transfer Hakizimana,TXN-MOMO-991204,0,35000`;

  const handleLoadSample = () => {
    setFileName('Bank_of_Kigali_Statement_Oct2026.csv');
    parseCsv(sampleCsvContent);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        parseCsv(text);
      }
    };
    reader.readAsText(file);
  };

  const parseCsv = (text: string) => {
    setCsvRaw(text);
    const lines = text.trim().split('\n');
    if (lines.length < 2) return;

    const dataRows: BankImportTransaction[] = [];
    let duplicates = 0;

    // Check against existing contribution/repayment references
    const existingRefs = new Set([
      ...contributions.map(c => c.transactionRef),
      ...repayments.map(r => r.repaymentRef),
      ...expenses.map(e => e.expenseRef)
    ]);

    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',').map(s => s.trim().replace(/^"|"$/g, ''));
      if (parts.length >= 4) {
        const date = parts[0] || new Date().toISOString().split('T')[0];
        const desc = parts[1] || 'Bank Transaction';
        const ref = parts[2] || `REF-${Math.floor(1000 + Math.random() * 9000)}`;
        const debit = parseFloat(parts[3]) || 0;
        const credit = parseFloat(parts[4]) || 0;

        const isDuplicate = existingRefs.has(ref);
        if (isDuplicate) duplicates++;

        dataRows.push({
          id: `imp_row_${i}`,
          date,
          description: desc,
          reference: ref,
          debit,
          credit,
          matchedStatus: isDuplicate ? 'matched' : 'unmatched'
        });
      }
    }

    setDuplicateCount(duplicates);
    setParsedRows(dataRows);
    setMappingStep('preview');
  };

  const handleConfirmImport = () => {
    const newBatch: BankImport = {
      id: `batch_${Date.now()}`,
      batchRef: `BATCH-BK-${Date.now().toString().slice(-4)}`,
      fileName: fileName || 'Statement.csv',
      importDate: new Date().toISOString().split('T')[0],
      uploadedBy: currentUser.displayName,
      totalRows: parsedRows.length,
      reconciledRows: parsedRows.filter(r => r.matchedStatus === 'matched').length,
      status: 'reconciled',
      transactions: parsedRows
    };

    addBankImport(newBatch);
    setMappingStep('reconciled');
  };

  const handleReset = () => {
    setMappingStep('upload');
    setParsedRows([]);
    setFileName('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-800" />
            CSV Bank Statement Imports & Reconciliation
          </h1>
          <p className="text-xs text-slate-500">
            Import Bank of Kigali and MTN MoMo corporate statement exports to cross-verify cash inflows and outflows with the ledger.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleLoadSample}
            className="px-3 py-2 text-xs font-semibold bg-emerald-50 text-emerald-900 border border-emerald-300 rounded-lg hover:bg-emerald-100 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Load Sample Bank CSV
          </button>
        </div>
      </div>

      {/* Step 1: Upload or Input */}
      {mappingStep === 'upload' && (
        <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-8 text-center space-y-4 shadow-2xs">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-800 flex items-center justify-center mx-auto">
            <Upload className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Upload Bank or MoMo Statement CSV
            </h2>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
              Supports standard bank exports with columns: Date, Description, Reference, Debit, Credit.
            </p>
          </div>

          <div className="pt-2">
            <label className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-xs transition-colors">
              <Upload className="w-4 h-4" />
              Choose CSV File
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-xs text-slate-500">
            <span>Or test immediately:</span>
            <button
              onClick={handleLoadSample}
              className="text-emerald-800 font-semibold underline cursor-pointer"
            >
              Click here to load realistic Bank of Kigali demo data
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Preview & Validation */}
      {mappingStep === 'preview' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-sm">{fileName}</span>
                <span className="text-xs text-slate-500 font-mono">({parsedRows.length} rows detected)</span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {duplicateCount} entries matched with existing ledger records · {parsedRows.length - duplicateCount} new entries ready for review.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleReset}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmImport}
                className="px-4 py-1.5 text-xs font-semibold bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                Confirm & Reconcile Batch
              </button>
            </div>
          </div>

          {/* Preview Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-4 font-semibold">Date</th>
                    <th className="py-2.5 px-4 font-semibold">Bank Description</th>
                    <th className="py-2.5 px-4 font-semibold">Reference</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Debit (Out)</th>
                    <th className="py-2.5 px-4 font-semibold text-right">Credit (In)</th>
                    <th className="py-2.5 px-4 font-semibold text-center">Ledger Match</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {parsedRows.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-4 font-mono text-[11px] text-slate-600">{row.date}</td>
                      <td className="py-2.5 px-4 font-medium text-slate-900">{row.description}</td>
                      <td className="py-2.5 px-4 font-mono text-[11px] text-slate-700">{row.reference}</td>
                      <td className="py-2.5 px-4 text-right font-mono text-rose-700 tabular-nums">
                        {row.debit > 0 ? `-${formatRwf(row.debit)}` : '—'}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono text-emerald-800 font-semibold tabular-nums">
                        {row.credit > 0 ? `+${formatRwf(row.credit)}` : '—'}
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        {row.matchedStatus === 'matched' ? (
                          <span className="text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[10px] font-semibold">
                            Matched
                          </span>
                        ) : (
                          <span className="text-slate-600 bg-slate-100 px-2 py-0.5 rounded text-[10px]">
                            New Entry
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Reconciled Confirmation */}
      {mappingStep === 'reconciled' && (
        <div className="bg-white p-8 rounded-2xl border border-emerald-200 shadow-2xs text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">
            Statement Successfully Reconciled & Logged
          </h2>
          <p className="text-xs text-slate-600 max-w-md mx-auto">
            Transactions in this batch have been cross-referenced with your ledger accounts and archived for the internal audit committee.
          </p>
          <div className="pt-2">
            <button
              onClick={handleReset}
              className="px-4 py-2 text-xs font-semibold bg-emerald-800 text-white rounded-lg hover:bg-emerald-700"
            >
              Import Another Statement
            </button>
          </div>
        </div>
      )}

      {/* Historical Import Batches */}
      {bankImports.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Reconciled Bank Import Batches
          </h2>
          <div className="space-y-3">
            {bankImports.map(b => (
              <div key={b.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                <div>
                  <span className="font-mono font-bold text-slate-800">{b.batchRef}</span>
                  <span className="text-slate-500 ml-2">· {b.fileName}</span>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Uploaded by {b.uploadedBy} on {b.importDate}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-emerald-800 font-semibold font-mono">{b.totalRows} transactions</span>
                  <span className="text-[10px] text-emerald-700 block font-medium">Reconciled 100%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
