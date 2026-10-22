import React, { useState } from 'react';
import { InflowEntry } from '../types/hisaab';
import { formatINR } from '../utils/storage';
import { Language, translations } from '../utils/translations';
import { X, Check, Wallet, Trash2, Plus, ArrowRight } from 'lucide-react';

interface ManageIncomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMonth: string; // YYYY-MM
  inflows: InflowEntry[];
  totalInflow: number;
  onSetExactTotalIncome: (amount: number, sourceName?: string) => void;
  onAddInflow: (inflow: Omit<InflowEntry, 'id' | 'timestamp'>) => void;
  onDeleteInflow: (id: string) => void;
  lang: Language;
}

export const ManageIncomeModal: React.FC<ManageIncomeModalProps> = ({
  isOpen,
  onClose,
  currentMonth,
  inflows,
  totalInflow,
  onSetExactTotalIncome,
  onAddInflow,
  onDeleteInflow,
  lang,
}) => {
  const t = translations[lang];

  // Exact total income override input
  const [exactIncome, setExactIncome] = useState<number | ''>(totalInflow > 0 ? totalInflow : '');
  const [exactSource, setExactSource] = useState('मासिक वेतन व बजट (Monthly Income)');

  // Incremental add form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [date, setDate] = useState(`${currentMonth}-01`);
  const [addAmount, setAddAmount] = useState<number | ''>('');
  const [addSource, setAddSource] = useState('अतिरिक्त जमा / नकद (Additional Cash)');
  const [paymentMode, setPaymentMode] = useState<'Cash' | 'Bank' | 'UPI'>('Cash');

  if (!isOpen) return null;

  const handleApplyExactIncome = (e: React.FormEvent) => {
    e.preventDefault();
    if (exactIncome === '' || Number(exactIncome) < 0) return;
    onSetExactTotalIncome(Number(exactIncome), exactSource);
    onClose();
  };

  const handleAddNewInflow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addAmount || Number(addAmount) <= 0) return;

    onAddInflow({
      date,
      amount: Number(addAmount),
      source: addSource,
      paymentMode,
    });

    setAddAmount('');
    setShowAddForm(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xl w-full max-w-lg max-h-[92vh] flex flex-col my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50 rounded-t-2xl">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-800 flex items-center justify-center font-bold">
              <Wallet className="w-5 h-5 text-emerald-700" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-stone-900">
                {lang === 'hi' ? 'आमदनी व बजट सेट करें' : 'Manage Income & Budget'}
              </h3>
              <p className="text-xs text-stone-500">
                {lang === 'hi' ? 'जितनी रकम लिखेंगे, ठीक वही आमदनी दर्ज होगी' : 'Set your exact monthly income or budget'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto space-y-5">
          {/* Section 1: Exact Total Income Input (Solves 5000 -> 55000 problem) */}
          <div className="p-4 bg-emerald-50/80 border border-emerald-300/80 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-950 uppercase tracking-wide">
                🎯 {lang === 'hi' ? 'मेरी इस महीने की कुल आमदनी / बजट तय करें' : 'Set Exact Total Income'}
              </span>
              <span className="text-xs font-bold text-emerald-800 tabular-nums">
                {lang === 'hi' ? 'अभी दर्ज है:' : 'Current:'} {formatINR(totalInflow)}
              </span>
            </div>

            <form onSubmit={handleApplyExactIncome} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-emerald-900 block mb-1">
                  {lang === 'hi' ? 'कुल आमदनी (₹) दर्ज करें *' : 'Enter Total Income (₹) *'}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-emerald-700 font-bold text-base">₹</span>
                  <input
                    type="number"
                    required
                    min="0"
                    value={exactIncome}
                    onChange={(e) =>
                      setExactIncome(e.target.value === '' ? '' : parseFloat(e.target.value))
                    }
                    placeholder="जैसे 5000 या 25000"
                    className="w-full text-lg font-bold pl-8 p-2.5 bg-white border border-emerald-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none tabular-nums text-stone-900"
                  />
                </div>
                <p className="text-[11px] text-emerald-800 mt-1">
                  💡 {lang === 'hi'
                    ? 'अगर आप यहाँ 5,000 लिखेंगे, तो कुल आमदनी ठीक ₹5,000 हो जाएगी (पुराना डमी 50,000 हट जाएगा)।'
                    : 'Entering 5,000 here sets your total income to exactly ₹5,000.'}
                </p>
              </div>

              <div className="flex items-center justify-end">
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-bold bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl shadow-xs transition-colors"
                >
                  <Check className="w-4 h-4" />
                  <span>
                    {lang === 'hi'
                      ? `कुल आमदनी ₹${exactIncome || 0} सेट करें`
                      : `Set Total Income to ₹${exactIncome || 0}`}
                  </span>
                </button>
              </div>
            </form>
          </div>

          {/* Section 2: Existing Inflows List with Delete option */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wide">
                {lang === 'hi' ? 'दर्ज आमदनी की सूची' : 'Current Inflow Entries'} ({inflows.length})
              </h4>
              <button
                type="button"
                onClick={() => setShowAddForm(!showAddForm)}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{lang === 'hi' ? '+ अलग से जोड़ें' : '+ Add Entry'}</span>
              </button>
            </div>

            {inflows.length === 0 ? (
              <p className="text-xs text-stone-400 py-3 text-center border border-dashed rounded-xl">
                {lang === 'hi' ? 'कोई आमदनी दर्ज नहीं है' : 'No income entries found'}
              </p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {inflows.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 bg-stone-50 border border-stone-200 rounded-xl flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-stone-900">{item.source}</span>
                        <span className="text-[10px] bg-stone-200 text-stone-700 px-1.5 py-0.5 rounded">
                          {item.paymentMode}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500 mt-0.5">
                        {item.date} {item.notes && `· ${item.notes}`}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-emerald-800 tabular-nums">
                        {formatINR(item.amount)}
                      </span>
                      <button
                        type="button"
                        onClick={() => onDeleteInflow(item.id)}
                        className="p-1 text-stone-400 hover:text-rose-600 rounded transition-colors"
                        title="हटाएं"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 3: Add new entry form (expandable) */}
          {showAddForm && (
            <form onSubmit={handleAddNewInflow} className="p-3.5 border-2 border-dashed border-emerald-300 rounded-xl bg-emerald-50/40 space-y-3">
              <h5 className="text-xs font-bold text-emerald-950 uppercase">
                अतिरिक्त रकम जोड़ें (Add Inflow)
              </h5>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-semibold text-stone-600 block mb-1">
                    तारीख
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full text-xs p-2 border border-stone-300 rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-stone-600 block mb-1">
                    रकम (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={addAmount}
                    onChange={(e) =>
                      setAddAmount(e.target.value === '' ? '' : parseFloat(e.target.value))
                    }
                    placeholder="₹ रकम"
                    className="w-full text-xs p-2 border border-stone-300 rounded-lg bg-white font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-stone-600 block mb-1">
                  स्रोत (Source)
                </label>
                <input
                  type="text"
                  value={addSource}
                  onChange={(e) => setAddSource(e.target.value)}
                  placeholder="जैसे: ATM निकाला, किराया मिला"
                  className="w-full text-xs p-2 border border-stone-300 rounded-lg bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3 py-1 text-xs text-stone-600 hover:bg-stone-200 rounded-lg"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1 text-xs font-bold bg-emerald-700 text-white rounded-lg hover:bg-emerald-800"
                >
                  जोड़ें
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200 bg-stone-50 rounded-b-2xl flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs sm:text-sm font-semibold bg-stone-900 text-white rounded-xl hover:bg-stone-800 transition-colors"
          >
            पूर्ण (Done)
          </button>
        </div>
      </div>
    </div>
  );
};
