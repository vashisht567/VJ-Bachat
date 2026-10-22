import React, { useState } from 'react';
import { ExpenseEntry, Category } from '../types/hisaab';
import { formatINR } from '../utils/storage';
import { Language, translations } from '../utils/translations';
import { Plus, Trash2, Edit2, Calendar as CalendarIcon, AlertCircle, ShoppingCart, Search, CheckCircle2, Fuel, GraduationCap, HandCoins } from 'lucide-react';

interface CalendarLedgerProps {
  currentMonth: string; // YYYY-MM
  selectedDate: string; // YYYY-MM-DD
  onSelectDate: (date: string) => void;
  expenses: ExpenseEntry[];
  categories: Category[];
  salaryCycleDay?: number;
  onOpenAddModal: () => void;
  onEditExpense: (expense: ExpenseEntry) => void;
  onDeleteExpense: (id: string) => void;
  onToggleMilkAbsent: (date: string) => void;
  activeFilter?: string;
  onFilterChange?: (catId: string) => void;
  lang: Language;
}

export const CalendarLedger: React.FC<CalendarLedgerProps> = ({
  currentMonth,
  selectedDate,
  onSelectDate,
  expenses,
  categories,
  salaryCycleDay = 10,
  onOpenAddModal,
  onEditExpense,
  onDeleteExpense,
  onToggleMilkAbsent,
  activeFilter = 'all',
  onFilterChange,
  lang,
}) => {
  const t = translations[lang];

  // Side panel view mode: 'day' (selected date) vs 'category' (e.g. Kirana or Petrol or all month)
  const [viewMode, setViewMode] = useState<'day' | 'category'>(activeFilter !== 'all' ? 'category' : 'day');
  const [selectedCatFilter, setSelectedCatFilter] = useState<string>(activeFilter !== 'all' ? activeFilter : 'kirana');

  const [yearStr, monthStr] = currentMonth.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10); // 1-12

  // Total days in this month
  const daysInMonth = new Date(year, month, 0).getDate();
  const firstDayWeekday = new Date(year, month - 1, 1).getDay();
  const startOffset = (firstDayWeekday + 6) % 7;

  // Group expenses by date
  const expensesByDate: { [dateStr: string]: ExpenseEntry[] } = {};
  const dayTotals: { [dateStr: string]: number } = {};

  expenses.forEach((item) => {
    if (!expensesByDate[item.date]) {
      expensesByDate[item.date] = [];
    }
    expensesByDate[item.date].push(item);
    dayTotals[item.date] = (dayTotals[item.date] || 0) + item.amount;
  });

  // Selected date entries
  const selectedDayExpenses = expensesByDate[selectedDate] || [];
  const selectedDayTotal = dayTotals[selectedDate] || 0;

  // Check milk status for selected day
  const selectedDayMilk = selectedDayExpenses.find((e) => e.categoryId === 'dudh');

  // Days of week labels
  const weekDays =
    lang === 'hi'
      ? ['सोम', 'मंगल', 'बुध', 'गुरु', 'शुक्र', 'शनि', 'रवि']
      : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  // Expenses for the category view
  const categoryExpenses = expenses
    .filter((e) => (selectedCatFilter === 'all' ? true : e.categoryId === selectedCatFilter))
    .sort((a, b) => b.date.localeCompare(a.date));

  const categoryExpensesTotal = categoryExpenses.reduce((sum, e) => sum + e.amount, 0);
  const selectedCategoryObj = categoryMap.get(selectedCatFilter);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side: Calendar Matrix (7 or 8 cols on lg) */}
        <div className="lg:col-span-7 xl:col-span-8 bg-white border border-stone-200 rounded-2xl p-4 sm:p-6 shadow-xs">
          {/* Calendar Header with category legend */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-stone-100">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-amber-600" />
              <h2 className="text-base sm:text-lg font-bold text-stone-900">
                {t.calendarView}
              </h2>
            </div>

            {/* Micro Category Filter/Legend Pills */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <button
                onClick={() => {
                  setViewMode('category');
                  setSelectedCatFilter('kirana');
                }}
                className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-900 font-semibold cursor-pointer"
              >
                <span>🛒 किराना</span>
              </button>
              <button
                onClick={() => {
                  setViewMode('category');
                  setSelectedCatFilter('dudh');
                }}
                className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 font-semibold cursor-pointer"
              >
                <span>🥛 दूध</span>
              </button>
              <button
                onClick={() => {
                  setViewMode('category');
                  setSelectedCatFilter('petrol');
                }}
                className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-900 font-semibold cursor-pointer"
              >
                <span>⛽ पेट्रोल</span>
              </button>
              <button
                onClick={() => {
                  setViewMode('category');
                  setSelectedCatFilter('school_fees');
                }}
                className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-900 font-semibold cursor-pointer"
              >
                <span>🎓 फीस</span>
              </button>
              <button
                onClick={() => {
                  setViewMode('category');
                  setSelectedCatFilter('sabzi');
                }}
                className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 font-semibold cursor-pointer"
              >
                <span>🥦 सब्ज़ी</span>
              </button>
            </div>
          </div>

          {/* Weekday Row */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 text-center">
            {weekDays.map((d, i) => (
              <div key={i} className="text-xs font-semibold text-stone-500 py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Calendar Grid (Days 1 to 31) */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {/* Empty slots for previous month offset */}
            {Array.from({ length: startOffset }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="min-h-[64px] sm:min-h-[82px] bg-stone-50/50 rounded-xl border border-dashed border-stone-200/50"
              />
            ))}

            {/* Month Days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dayStr = dayNum.toString().padStart(2, '0');
              const dateStr = `${currentMonth}-${dayStr}`;
              const isSelected = selectedDate === dateStr;
              const hasEntries = !!expensesByDate[dateStr]?.length;
              const dayTotal = dayTotals[dateStr] || 0;
              const dayItems = expensesByDate[dateStr] || [];

              const isSalaryDay = dayNum === salaryCycleDay;
              const hasMilk = dayItems.some((e) => e.categoryId === 'dudh' && !e.isChutti);
              const isMilkAbsent = dayItems.some((e) => e.categoryId === 'dudh' && e.isChutti);
              const hasVeg = dayItems.some((e) => e.categoryId === 'sabzi');
              const hasAuto = dayItems.some((e) => e.categoryId === 'auto');
              const hasKirana = dayItems.some((e) => e.categoryId === 'kirana');
              const hasPetrol = dayItems.some((e) => e.categoryId === 'petrol');
              const hasFees = dayItems.some((e) => e.categoryId === 'school_fees');
              const hasUdhar = dayItems.some((e) => e.categoryId === 'udhar_given' || e.isUdhar);

              return (
                <button
                  key={dateStr}
                  onClick={() => {
                    onSelectDate(dateStr);
                    setViewMode('day');
                  }}
                  className={`min-h-[68px] sm:min-h-[86px] p-1.5 sm:p-2 rounded-xl border text-left transition-all flex flex-col justify-between relative group ${
                    isSelected
                      ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-400 shadow-sm'
                      : hasEntries
                      ? 'bg-stone-50/70 border-stone-200 hover:border-amber-300 hover:bg-stone-100/80'
                      : 'bg-white border-stone-200/70 hover:border-stone-300'
                  }`}
                >
                  {/* Day Number and Daily Spend Indicator */}
                  <div className="flex items-center justify-between w-full">
                    <span
                      className={`text-xs sm:text-sm font-bold flex items-center gap-1 ${
                        isSelected
                          ? 'text-amber-950 font-extrabold'
                          : dayTotal > 0
                          ? 'text-stone-900'
                          : 'text-stone-400'
                      }`}
                    >
                      {dayNum}
                      {isSalaryDay && (
                        <span className="text-[9px] bg-emerald-600 text-white px-1 py-0.2 rounded font-extrabold" title="सैलरी का दिन">
                          💼
                        </span>
                      )}
                    </span>

                    {/* Spend indicator badge */}
                    {dayTotal > 0 && (
                      <span className="text-[10px] sm:text-xs font-bold text-rose-700 tabular-nums">
                        ₹{dayTotal}
                      </span>
                    )}
                  </div>

                  {/* Micro badges: Kirana, Milk, Petrol, Fees, Veg, Auto, Udhar */}
                  <div className="flex flex-wrap items-center gap-0.5 sm:gap-1 mt-1">
                    {hasMilk && (
                      <span className="text-[10px] bg-amber-100 text-amber-800 rounded px-1 leading-tight" title="दूध">
                        🥛
                      </span>
                    )}
                    {isMilkAbsent && (
                      <span className="text-[10px] bg-red-100 text-red-700 rounded px-1 leading-tight font-bold" title="दूध नागा">
                        ❌
                      </span>
                    )}
                    {hasKirana && (
                      <span className="text-[10px] bg-indigo-100 text-indigo-800 rounded px-1 leading-tight font-bold" title="किराना">
                        🛒
                      </span>
                    )}
                    {hasPetrol && (
                      <span className="text-[10px] bg-rose-100 text-rose-800 rounded px-1 leading-tight font-bold" title="पेट्रोल">
                        ⛽
                      </span>
                    )}
                    {hasFees && (
                      <span className="text-[10px] bg-purple-100 text-purple-800 rounded px-1 leading-tight font-bold" title="स्कूल फीस">
                        🎓
                      </span>
                    )}
                    {hasVeg && (
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 rounded px-1 leading-tight" title="सब्ज़ी">
                        🥦
                      </span>
                    )}
                    {hasAuto && (
                      <span className="text-[10px] bg-sky-100 text-sky-800 rounded px-1 leading-tight" title="गाड़ी/ऑटो">
                        🚖
                      </span>
                    )}
                    {hasUdhar && (
                      <span className="text-[10px] bg-red-100 text-red-800 rounded px-1 leading-tight font-bold" title="उधार दिया">
                        🤝
                      </span>
                    )}
                  </div>

                  {/* Day total count if multiple items */}
                  {dayItems.length > 2 && (
                    <div className="text-[9px] text-stone-400 text-right mt-auto">
                      +{dayItems.length} {lang === 'hi' ? 'खर्च' : 'items'}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <p className="mt-4 text-xs text-stone-500 text-center">
            💡 किसी भी तारीख पर क्लिक करके उस दिन का ब्यौरा देखें या ऊपर किराना/पेट्रोल/दूध पर क्लिक करके श्रेणीवार हिसाब देखें।
          </p>
        </div>

        {/* Right Side: Tabbed Detail Panel */}
        <div className="lg:col-span-5 xl:col-span-4 bg-white border border-stone-200 rounded-2xl p-4 sm:p-6 shadow-xs flex flex-col">
          {/* Top Mode Switcher */}
          <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-xl mb-3">
            <button
              onClick={() => setViewMode('day')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                viewMode === 'day'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              📅 {selectedDate.split('-')[2]} तारीख का हिसाब
            </button>
            <button
              onClick={() => setViewMode('category')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                viewMode === 'category'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              🔎 श्रेणीवार पूरा हिसाब
            </button>
          </div>

          {/* VIEW MODE 1: SELECTED DAY'S ITEMS */}
          {viewMode === 'day' ? (
            <>
              {/* Day Header */}
              <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                <div>
                  <span className="text-xs font-semibold text-amber-700 uppercase tracking-wide">
                    {lang === 'hi' ? 'दैनिक हिसाब' : 'Daily Log'}
                  </span>
                  <h3 className="text-lg font-bold text-stone-900">
                    {new Date(
                      parseInt(selectedDate.split('-')[0]),
                      parseInt(selectedDate.split('-')[1]) - 1,
                      parseInt(selectedDate.split('-')[2])
                    ).toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-US', {
                      day: 'numeric',
                      month: 'long',
                      weekday: 'short',
                    })}
                  </h3>
                </div>
                <div className="text-right">
                  <span className="text-xs text-stone-500 block">{t.totalSpent}</span>
                  <span className="text-xl font-bold text-rose-700 tabular-nums">
                    {formatINR(selectedDayTotal)}
                  </span>
                </div>
              </div>

              {/* Quick toggle for Milk Naaga / Absent */}
              <div className="my-3 flex items-center justify-between p-2.5 bg-amber-50/60 border border-amber-200/60 rounded-xl text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-base">🥛</span>
                  <div>
                    <span className="font-semibold text-stone-800">दूध का नागा / हाज़िरी</span>
                    <p className="text-[11px] text-stone-500">
                      {selectedDayMilk?.isChutti
                        ? 'आज छुट्टी दर्ज है (दूध नहीं लिया)'
                        : selectedDayMilk
                        ? `${selectedDayMilk.quantity || 1.5} लीटर दर्ज है`
                        : 'आज का दूध दर्ज नहीं है'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => onToggleMilkAbsent(selectedDate)}
                  className={`px-2.5 py-1 rounded-lg font-semibold text-xs transition-colors ${
                    selectedDayMilk?.isChutti
                      ? 'bg-amber-600 text-white hover:bg-amber-700'
                      : 'bg-white border border-stone-300 text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  {selectedDayMilk?.isChutti ? 'नागा हटाएं' : 'नागा दर्ज करें'}
                </button>
              </div>

              {/* Day Itemized List */}
              <div className="flex-1 overflow-y-auto space-y-2.5 my-2 max-h-[340px] pr-1">
                {selectedDayExpenses.length === 0 ? (
                  <div className="text-center py-10 text-stone-400">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-40 text-stone-400" />
                    <p className="text-sm font-medium">{t.noExpensesDay}</p>
                    <p className="text-xs mt-1 text-stone-400">
                      नीचे दिए बटन से इस तारीख पर खर्च जोड़ें
                    </p>
                  </div>
                ) : (
                  selectedDayExpenses.map((exp) => {
                    const isChutti = exp.isChutti;
                    // Exact custom name typed by user takes priority!
                    const displayName = exp.itemName || exp.categoryName;

                    return (
                      <div
                        key={exp.id}
                        className={`p-3 rounded-xl border transition-all ${
                          isChutti
                            ? 'bg-red-50/50 border-red-200 text-stone-600'
                            : exp.categoryId === 'kirana'
                            ? 'bg-indigo-50/40 border-indigo-200'
                            : exp.categoryId === 'petrol'
                            ? 'bg-rose-50/40 border-rose-200'
                            : exp.categoryId === 'school_fees'
                            ? 'bg-purple-50/40 border-purple-200'
                            : 'bg-stone-50 border-stone-200 hover:border-stone-300'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-stone-900 text-sm">
                                {exp.categoryId === 'kirana' && '🛒 '}
                                {exp.categoryId === 'petrol' && '⛽ '}
                                {exp.categoryId === 'school_fees' && '🎓 '}
                                {exp.categoryId === 'dudh' && '🥛 '}
                                {displayName}
                              </span>
                              {exp.quantity && exp.quantity > 0 && (
                                <span className="text-xs text-stone-500 font-normal">
                                  ({exp.quantity} {exp.unit || ''})
                                </span>
                              )}
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-stone-200 text-stone-700 font-medium">
                                {exp.paymentMode}
                              </span>
                            </div>

                            <p className="text-xs text-stone-600 mt-1">
                              <span className="text-stone-400">दिए: </span>
                              <span className="font-bold text-stone-800">{exp.recipient}</span>
                            </p>

                            {exp.notes && (
                              <p className="text-xs text-stone-500 italic mt-0.5 truncate">
                                {exp.notes}
                              </p>
                            )}
                          </div>

                          <div className="flex flex-col items-end shrink-0">
                            <span
                              className={`text-base font-bold tabular-nums ${
                                isChutti ? 'text-stone-400 line-through' : 'text-stone-900'
                              }`}
                            >
                              {isChutti ? '₹0' : formatINR(exp.amount)}
                            </span>

                            <div className="flex items-center gap-1 mt-1.5">
                              <button
                                onClick={() => onEditExpense(exp)}
                                className="p-1 text-stone-400 hover:text-amber-700 rounded transition-colors"
                                title={t.edit}
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => onDeleteExpense(exp.id)}
                                className="p-1 text-stone-400 hover:text-rose-600 rounded transition-colors"
                                title={t.delete}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Add Expense Button for This Date */}
              <div className="pt-3 border-t border-stone-200 mt-auto">
                <button
                  onClick={onOpenAddModal}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs sm:text-sm font-semibold transition-colors shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>
                    {lang === 'hi'
                      ? `${selectedDate.split('-')[2]} तारीख को नया खर्च जोड़ें`
                      : `Add Expense on Day ${selectedDate.split('-')[2]}`}
                  </span>
                </button>
              </div>
            </>
          ) : (
            /* VIEW MODE 2: CATEGORY-WISE AGGREGATION */
            <>
              {/* Category selector strip */}
              <div className="pb-3 border-b border-stone-200">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-stone-700 uppercase tracking-wide">
                    खर्च श्रेणी चुनें:
                  </h4>
                  <span className="text-xs font-bold text-indigo-700 tabular-nums">
                    कुल: {formatINR(categoryExpensesTotal)}
                  </span>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-6 gap-1">
                  <button
                    onClick={() => setSelectedCatFilter('kirana')}
                    className={`py-1.5 px-1.5 rounded-lg text-xs font-bold text-center transition-all ${
                      selectedCatFilter === 'kirana'
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-stone-100 hover:bg-stone-200 text-stone-800'
                    }`}
                  >
                    🛒 किराना
                  </button>
                  <button
                    onClick={() => setSelectedCatFilter('dudh')}
                    className={`py-1.5 px-1.5 rounded-lg text-xs font-bold text-center transition-all ${
                      selectedCatFilter === 'dudh'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-stone-100 hover:bg-stone-200 text-stone-800'
                    }`}
                  >
                    🥛 दूध
                  </button>
                  <button
                    onClick={() => setSelectedCatFilter('petrol')}
                    className={`py-1.5 px-1.5 rounded-lg text-xs font-bold text-center transition-all ${
                      selectedCatFilter === 'petrol'
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'bg-stone-100 hover:bg-stone-200 text-stone-800'
                    }`}
                  >
                    ⛽ पेट्रोल
                  </button>
                  <button
                    onClick={() => setSelectedCatFilter('school_fees')}
                    className={`py-1.5 px-1.5 rounded-lg text-xs font-bold text-center transition-all ${
                      selectedCatFilter === 'school_fees'
                        ? 'bg-purple-600 text-white shadow-xs'
                        : 'bg-stone-100 hover:bg-stone-200 text-stone-800'
                    }`}
                  >
                    🎓 फीस
                  </button>
                  <button
                    onClick={() => setSelectedCatFilter('sabzi')}
                    className={`py-1.5 px-1.5 rounded-lg text-xs font-bold text-center transition-all ${
                      selectedCatFilter === 'sabzi'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-stone-100 hover:bg-stone-200 text-stone-800'
                    }`}
                  >
                    🥦 सब्ज़ी
                  </button>
                  <button
                    onClick={() => setSelectedCatFilter('auto')}
                    className={`py-1.5 px-1.5 rounded-lg text-xs font-bold text-center transition-all ${
                      selectedCatFilter === 'auto'
                        ? 'bg-sky-600 text-white shadow-xs'
                        : 'bg-stone-100 hover:bg-stone-200 text-stone-800'
                    }`}
                  >
                    🚖 गाड़ी
                  </button>
                </div>
              </div>

              {/* Category Summary Headline */}
              <div className="my-2.5 p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-indigo-950 block">
                    {selectedCategoryObj?.nameHi || 'श्रेणी'} का कुल भुगतान
                  </span>
                  <span className="text-xs text-indigo-700">
                    {categoryExpenses.length} बार खरीदारी / खर्च
                  </span>
                </div>
                <span className="text-lg font-extrabold text-indigo-950 tabular-nums">
                  {formatINR(categoryExpensesTotal)}
                </span>
              </div>

              {/* Category Itemized Transactions */}
              <div className="flex-1 overflow-y-auto space-y-2 max-h-[310px] pr-1">
                {categoryExpenses.length === 0 ? (
                  <div className="text-center py-8 text-stone-400">
                    <p className="text-xs font-medium">इस महीने कोई खर्च दर्ज नहीं है</p>
                  </div>
                ) : (
                  categoryExpenses.map((exp) => (
                    <div
                      key={exp.id}
                      className="p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs hover:border-indigo-300 transition-all"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-stone-900">{exp.itemName || exp.recipient}</span>
                            <span className="text-[10px] bg-stone-200 text-stone-700 px-1.5 py-0.5 rounded">
                              {exp.paymentMode}
                            </span>
                          </div>
                          <p className="text-[11px] text-stone-500 mt-0.5">
                            📅 {exp.date} · दिए: {exp.recipient} {exp.notes && `· ${exp.notes}`}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-stone-900 text-sm tabular-nums">
                            {formatINR(exp.amount)}
                          </span>
                          <button
                            onClick={() => onEditExpense(exp)}
                            className="p-1 text-stone-400 hover:text-amber-700"
                            title="बदलें"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteExpense(exp.id)}
                            className="p-1 text-stone-400 hover:text-rose-600"
                            title="हटाएं"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Add Expense Button for This Category */}
              <div className="pt-3 border-t border-stone-200 mt-auto">
                <button
                  onClick={onOpenAddModal}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-indigo-700 hover:bg-indigo-800 text-white rounded-xl text-xs sm:text-sm font-semibold transition-colors shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>+ {selectedCategoryObj?.nameHi || 'खर्च'} जोड़ें</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
