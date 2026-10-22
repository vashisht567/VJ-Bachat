import React from 'react';
import { formatINR } from '../utils/storage';
import { Language, translations } from '../utils/translations';
import { TrendingDown, TrendingUp, Wallet, ReceiptText, ArrowUpRight, Edit3, HandCoins, Fuel, GraduationCap } from 'lucide-react';

interface FinancialSummaryBarProps {
  totalInflow: number;
  totalExpense: number;
  remainingBalance: number;
  lang: Language;
  onOpenBill: () => void;
  onOpenManageIncome: () => void;
  onOpenUdhar: () => void;
  milkTotal: number;
  vegTotal: number;
  autoTotal: number;
  kiranaTotal: number;
  petrolTotal: number;
  feesTotal: number;
  udharPendingTotal: number;
  salaryCycleDay: number;
  autoCategoryName: string;
  milkCategoryName: string;
  onSelectCategoryFilter?: (catId: string) => void;
}

export const FinancialSummaryBar: React.FC<FinancialSummaryBarProps> = ({
  totalInflow,
  totalExpense,
  remainingBalance,
  lang,
  onOpenBill,
  onOpenManageIncome,
  onOpenUdhar,
  milkTotal,
  vegTotal,
  autoTotal,
  kiranaTotal,
  petrolTotal,
  feesTotal,
  udharPendingTotal,
  salaryCycleDay = 10,
  autoCategoryName,
  milkCategoryName,
  onSelectCategoryFilter,
}) => {
  const t = translations[lang];
  const isSurplus = remainingBalance >= 0;

  return (
    <div className="bg-white border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        {/* Main 3 Metrics Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* 1. Money In / Inflows (Clickable to set exact income) */}
          <div
            onClick={onOpenManageIncome}
            className="bg-stone-50 hover:bg-emerald-50/50 border border-stone-200/80 hover:border-emerald-300 rounded-xl p-4 flex items-center justify-between cursor-pointer transition-all group"
            title="क्लिक करके अपनी कुल आमदनी / बजट तय करें"
          >
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-semibold text-stone-600 uppercase tracking-wider">
                  {t.startingBalance}
                </p>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded opacity-80 group-hover:opacity-100">
                  {lang === 'hi' ? 'बदलें' : 'Edit'}
                </span>
              </div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-emerald-900 tabular-nums">
                  {formatINR(totalInflow)}
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-1 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                <span>{salaryCycleDay} तारीख से सैलरी चक्र</span>
              </p>
            </div>
            <div className="p-2 text-emerald-700 bg-white group-hover:bg-emerald-100 rounded-lg transition-colors border border-stone-200 group-hover:border-emerald-300">
              <Edit3 className="w-4 h-4" />
            </div>
          </div>

          {/* 2. Total Spent */}
          <div className="bg-stone-50 border border-stone-200/80 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-stone-600 uppercase tracking-wider">
                {t.totalSpent}
              </p>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-rose-700 tabular-nums">
                  {formatINR(totalExpense)}
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-1 flex items-center gap-1">
                <TrendingDown className="w-3.5 h-3.5 text-rose-600" />
                <span>{lang === 'hi' ? 'महीने का कुल खर्च' : 'All Expenses'}</span>
              </p>
            </div>
            <button
              onClick={onOpenBill}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-950 bg-amber-400 hover:bg-amber-500 rounded-lg transition-colors shadow-xs"
            >
              <ReceiptText className="w-3.5 h-3.5" />
              <span>{lang === 'hi' ? 'पक्का बिल देखें' : 'View Bill'}</span>
            </button>
          </div>

          {/* 3. Remaining Balance */}
          <div className="bg-stone-50 border border-stone-200/80 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-stone-600 uppercase tracking-wider">
                {t.remainingCash}
              </p>
              <div className="mt-1 flex items-baseline gap-2">
                <span
                  className={`text-2xl sm:text-3xl font-extrabold tracking-tight tabular-nums ${
                    isSurplus ? 'text-emerald-700' : 'text-red-700'
                  }`}
                >
                  {formatINR(remainingBalance)}
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-1 flex items-center gap-1">
                <Wallet className="w-3.5 h-3.5 text-stone-600" />
                <span>{isSurplus ? t.surplus : t.deficit}</span>
              </p>
            </div>
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                isSurplus
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  : 'bg-red-100 text-red-800 border border-red-200'
              }`}
            >
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Quick Highlights Strip: DUDH, KIRANA, PETROL, FEES, SABZI, AUTO, UDHAR */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-3 border-t border-stone-100 text-xs sm:text-sm">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-stone-500 font-semibold">{lang === 'hi' ? 'मुख्य हिसाब:' : 'Core Heads:'}</span>

            {/* Milk */}
            <div
              onClick={() => onSelectCategoryFilter && onSelectCategoryFilter('dudh')}
              className="flex items-center gap-1.5 bg-amber-50 border border-amber-200/80 rounded-lg px-2.5 py-1 text-stone-800 cursor-pointer hover:bg-amber-100 transition-colors"
            >
              <span className="font-semibold text-amber-900">🥛 दूध:</span>
              <span className="font-bold tabular-nums text-amber-950">{formatINR(milkTotal)}</span>
            </div>

            {/* Kirana */}
            <div
              onClick={() => onSelectCategoryFilter && onSelectCategoryFilter('kirana')}
              className="flex items-center gap-1.5 bg-indigo-50 border border-indigo-200/80 rounded-lg px-2.5 py-1 text-stone-800 cursor-pointer hover:bg-indigo-100 transition-colors"
            >
              <span className="font-semibold text-indigo-900">🛒 किराना:</span>
              <span className="font-bold tabular-nums text-indigo-950">{formatINR(kiranaTotal)}</span>
            </div>

            {/* Petrol */}
            <div
              onClick={() => onSelectCategoryFilter && onSelectCategoryFilter('petrol')}
              className="flex items-center gap-1.5 bg-rose-50 border border-rose-200/80 rounded-lg px-2.5 py-1 text-stone-800 cursor-pointer hover:bg-rose-100 transition-colors"
            >
              <span className="font-semibold text-rose-900">⛽ पेट्रोल:</span>
              <span className="font-bold tabular-nums text-rose-950">{formatINR(petrolTotal)}</span>
            </div>

            {/* School Fees */}
            <div
              onClick={() => onSelectCategoryFilter && onSelectCategoryFilter('school_fees')}
              className="flex items-center gap-1.5 bg-purple-50 border border-purple-200/80 rounded-lg px-2.5 py-1 text-stone-800 cursor-pointer hover:bg-purple-100 transition-colors"
            >
              <span className="font-semibold text-purple-900">🎓 स्कूल फीस:</span>
              <span className="font-bold tabular-nums text-purple-950">{formatINR(feesTotal)}</span>
            </div>

            {/* Sabzi */}
            <div
              onClick={() => onSelectCategoryFilter && onSelectCategoryFilter('sabzi')}
              className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200/80 rounded-lg px-2.5 py-1 text-stone-800 cursor-pointer hover:bg-emerald-100 transition-colors"
            >
              <span className="font-semibold text-emerald-900">🥦 सब्ज़ी:</span>
              <span className="font-bold tabular-nums text-emerald-950">{formatINR(vegTotal)}</span>
            </div>

            {/* Auto */}
            <div
              onClick={() => onSelectCategoryFilter && onSelectCategoryFilter('auto')}
              className="flex items-center gap-1.5 bg-sky-50 border border-sky-200/80 rounded-lg px-2.5 py-1 text-stone-800 cursor-pointer hover:bg-sky-100 transition-colors"
            >
              <span className="font-semibold text-sky-900">🚖 गाड़ी:</span>
              <span className="font-bold tabular-nums text-sky-950">{formatINR(autoTotal)}</span>
            </div>

            {/* Udhar (Lent Money Pending) */}
            <div
              onClick={onOpenUdhar}
              className="flex items-center gap-1.5 bg-red-50 border border-red-200/80 rounded-lg px-2.5 py-1 text-stone-800 cursor-pointer hover:bg-red-100 transition-colors"
              title="उधार खाता खोलें"
            >
              <span className="font-semibold text-red-900">🤝 बाकी उधार:</span>
              <span className="font-bold tabular-nums text-red-950">{formatINR(udharPendingTotal)}</span>
            </div>
          </div>

          <div className="text-stone-500 text-xs">
            💡 {salaryCycleDay} तारीख से सैलरी चक्र सक्रिय
          </div>
        </div>
      </div>
    </div>
  );
};
