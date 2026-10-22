import React, { useState } from 'react';
import { ExpenseEntry, InflowEntry, Category, UdharEntry } from '../types/hisaab';
import { formatINR } from '../utils/storage';
import { Language, translations } from '../utils/translations';
import { Printer, Share2, X, FileText, Calendar, HandCoins, Fuel, GraduationCap } from 'lucide-react';

interface MonthlyBillModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMonth: string; // YYYY-MM
  expenses: ExpenseEntry[];
  inflows: InflowEntry[];
  udhars?: UdharEntry[];
  salaryCycleDay?: number;
  categories: Category[];
  lang: Language;
}

export const MonthlyBillModal: React.FC<MonthlyBillModalProps> = ({
  isOpen,
  onClose,
  currentMonth,
  expenses,
  inflows,
  udhars = [],
  salaryCycleDay = 10,
  categories,
  lang,
}) => {
  const t = translations[lang];

  const [yearStr, monthStr] = currentMonth.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const daysInMonth = new Date(year, month, 0).getDate();

  // Mode: 'calendar' (1 to cutoff) vs 'salary_cycle' (salaryCycleDay to next month)
  const [cycleMode, setCycleMode] = useState<'calendar' | 'salary_cycle'>('salary_cycle');
  const [cutoffDay, setCutoffDay] = useState<number>(Math.min(22, daysInMonth));
  const [householdName, setHouseholdName] = useState('घरेलू परिवार (Home Ledger)');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Filter expenses according to cycle mode
  let filteredExpenses = expenses;
  let periodLabel = '';

  if (cycleMode === 'salary_cycle') {
    // e.g. From 10th of current month onwards (or up to today)
    const startStr = `${currentMonth}-${salaryCycleDay.toString().padStart(2, '0')}`;
    filteredExpenses = expenses.filter((e) => e.date >= startStr);
    periodLabel = `${salaryDayLabel(salaryCycleDay)} से अगले माह तक (सैलरी साइकिल हिसाब)`;
  } else {
    const cutoffDateStr = `${currentMonth}-${cutoffDay.toString().padStart(2, '0')}`;
    filteredExpenses = expenses.filter((e) => e.date <= cutoffDateStr);
    periodLabel = `01 तारीख से ${cutoffDay} तारीख तक (${cutoffDay} दिन का हिसाब)`;
  }

  const filteredInflows = inflows;
  const totalExpense = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalInflow = filteredInflows.reduce((sum, i) => sum + i.amount, 0);
  const remainingBalance = totalInflow - totalExpense;

  // Udhar totals
  const totalUdharGiven = udhars.reduce((sum, u) => sum + u.amount, 0);
  const totalUdharPending = udhars.filter((u) => u.status === 'pending').reduce((sum, u) => sum + u.amount, 0);

  // Category map
  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  // Breakdown by Category
  const categoryStats: {
    [catId: string]: {
      name: string;
      nameHi: string;
      total: number;
      qty: number;
      count: number;
      unit?: string;
      absentDays?: number;
    };
  } = {};

  filteredExpenses.forEach((exp) => {
    const cat = categoryMap.get(exp.categoryId);
    const catId = exp.categoryId;
    const catName = cat?.name || exp.categoryName;
    const catNameHi = cat?.nameHi || exp.categoryName;

    if (!categoryStats[catId]) {
      categoryStats[catId] = {
        name: catName,
        nameHi: catNameHi,
        total: 0,
        qty: 0,
        count: 0,
        unit: exp.unit || cat?.unit,
        absentDays: 0,
      };
    }

    if (exp.isChutti) {
      categoryStats[catId].absentDays = (categoryStats[catId].absentDays || 0) + 1;
    } else {
      categoryStats[catId].total += exp.amount;
      categoryStats[catId].qty += exp.quantity || 0;
      categoryStats[catId].count += 1;
    }
  });

  // Highlight categories
  const milkData = categoryStats['dudh'] || { total: 0, qty: 0, count: 0, absentDays: 0, nameHi: 'दूध' };
  const kiranaData = categoryStats['kirana'] || { total: 0, count: 0, nameHi: 'किराना व राशन' };
  const petrolData = categoryStats['petrol'] || { total: 0, count: 0, nameHi: 'गाड़ी पेट्रोल' };
  const feesData = categoryStats['school_fees'] || { total: 0, count: 0, nameHi: 'स्कूल फीस' };
  const vegData = categoryStats['sabzi'] || { total: 0, count: 0, nameHi: 'सब्ज़ी-मंडी' };
  const autoData = categoryStats['auto'] || { total: 0, count: 0, nameHi: 'ऑटो / लोकल किराया' };

  // Recipient breakdown
  const recipientStats: { [name: string]: number } = {};
  filteredExpenses.forEach((exp) => {
    if (exp.amount > 0) {
      const rec = exp.recipient?.trim() || 'अन्य फुटकर';
      recipientStats[rec] = (recipientStats[rec] || 0) + exp.amount;
    }
  });

  // Payment Mode breakdown
  const paymentStats: { [mode: string]: number } = {
    Cash: 0,
    UPI: 0,
    Card: 0,
    Udhar: 0,
  };
  filteredExpenses.forEach((exp) => {
    if (paymentStats[exp.paymentMode] !== undefined) {
      paymentStats[exp.paymentMode] += exp.amount;
    }
  });

  function salaryDayLabel(day: number) {
    return `${day} ${new Date(year, month - 1, day).toLocaleDateString('hi-IN', { month: 'short' })}`;
  }

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsapp = () => {
    const summaryText = `*${householdName} - ${currentMonth} मासिक हिसाब*\n` +
      `📅 *अवधि:* ${periodLabel}\n\n` +
      `🥛 *दूध का कुल बिल:* ${formatINR(milkData.total)} (${milkData.qty} लीटर, ${milkData.absentDays || 0} नागा)\n` +
      `🛒 *किराना व राशन:* ${formatINR(kiranaData.total)}\n` +
      `⛽ *गाड़ी पेट्रोल:* ${formatINR(petrolData.total)}\n` +
      `🎓 *स्कूल/ट्यूशन फीस:* ${formatINR(feesData.total)}\n` +
      `🥦 *सब्ज़ी-मंडी:* ${formatINR(vegData.total)}\n` +
      `🚖 *ऑटो/लोकल यात्रा:* ${formatINR(autoData.total)}\n` +
      (totalUdharPending > 0 ? `🤝 *बाकी उधार (दोस्त/पड़ोसी):* ${formatINR(totalUdharPending)}\n` : '') +
      `------------------------\n` +
      `💰 *कुल आमदनी/बजट:* ${formatINR(totalInflow)}\n` +
      `💸 *कुल खर्च:* ${formatINR(totalExpense)}\n` +
      `💵 *बचा हुआ बैलेंस:* ${formatINR(remainingBalance)}\n\n` +
      `_Ghar Ka Hisaab App द्वारा प्रमाणित_`;

    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);

    const encoded = encodeURIComponent(summaryText);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/70 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-stone-200 shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Top Control Bar (Hidden in Print) */}
        <div className="no-print p-4 sm:p-5 border-b border-stone-200 flex flex-wrap items-center justify-between gap-3 bg-stone-50 rounded-t-2xl">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-700 flex items-center justify-center">
              <FileText className="w-4 h-4 text-amber-700" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-stone-900">
                {lang === 'hi' ? 'महीने का पक्का बिल (Hisaab Slip)' : 'Monthly Expense Bill'}
              </h3>
              <p className="text-xs text-stone-500">
                दूध, किराना, पेट्रोल, फीस, गाड़ी व उधार का संपूर्ण कैलकुलेटेड बिल
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Cycle Mode Switcher: Calendar Month vs Salary Cycle */}
            <div className="flex items-center gap-1 text-xs bg-white border border-stone-300 rounded-lg p-1">
              <button
                onClick={() => setCycleMode('salary_cycle')}
                className={`px-2.5 py-1 rounded-md font-bold transition-colors ${
                  cycleMode === 'salary_cycle'
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'text-stone-700 hover:bg-stone-100'
                }`}
                title={`सैलरी आने की ${salaryCycleDay} तारीख से चक्र`}
              >
                💼 {salaryCycleDay} तारीख सैलरी चक्र
              </button>
              <button
                onClick={() => setCycleMode('calendar')}
                className={`px-2.5 py-1 rounded-md font-bold transition-colors ${
                  cycleMode === 'calendar'
                    ? 'bg-amber-500 text-stone-950 shadow-xs'
                    : 'text-stone-700 hover:bg-stone-100'
                }`}
              >
                📅 1 से 31 तारीख
              </button>
            </div>

            <button
              onClick={handleShareWhatsapp}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-xs transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copied ? 'कॉपी हुआ!' : 'व्हाट्सएप'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-stone-900 hover:bg-stone-800 text-white rounded-lg shadow-xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>{lang === 'hi' ? 'प्रिंट / PDF' : 'Print / PDF'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Bill Slip Container */}
        <div id="printable-bill" className="p-6 sm:p-8 overflow-y-auto space-y-6 text-stone-900 bg-white">
          {/* Bill Slip Header */}
          <div className="border-b-2 border-stone-900 pb-5">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <img
                  src="/assets/aistudio/file_000000003a8882088b578c6fc0259415_0adcefd9.png"
                  alt="VJ Bachat Logo"
                  className="w-12 h-12 rounded-xl object-contain border border-amber-400 shadow-xs shrink-0"
                />
                <div>
                  <span className="text-xs font-black uppercase tracking-widest text-amber-700 block">
                    VJ Bachat · {lang === 'hi' ? 'घरेलू बचत व खर्च पर्ची' : 'HOUSEHOLD EXPENSE STATEMENT'}
                  </span>
                  <input
                    type="text"
                    value={householdName}
                    onChange={(e) => setHouseholdName(e.target.value)}
                    className="text-xl sm:text-2xl font-extrabold text-stone-900 border-b border-dashed border-stone-300 hover:border-stone-500 focus:outline-none focus:border-amber-500 bg-transparent py-0.5"
                    title="खाताधारक या घर का नाम बदलें"
                  />
                  <p className="text-xs text-stone-600 mt-0.5 font-medium">
                    माह: {currentMonth} · <span className="text-sky-800 font-bold">अवधि: {periodLabel}</span>
                  </p>
                </div>
              </div>

              <div className="sm:text-right text-xs text-stone-600 bg-stone-50 p-3 rounded-xl border border-stone-200">
                <p className="font-semibold text-stone-900">बिल क्रमांक: GK-{yearStr}{monthStr}-{cycleMode === 'salary_cycle' ? `S${salaryCycleDay}` : cutoffDay}</p>
                <p className="mt-0.5">तैयार तिथि: {new Date().toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-US')}</p>
                <p className="mt-0.5 font-bold text-emerald-700">स्थिति: हिसाब सत्यापित (Verified)</p>
              </div>
            </div>
          </div>

          {/* Core Highlights: Dudh, Kirana, Petrol, School Fees, Sabzi, Auto Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {/* 1. Dudh Hisaab */}
            <div className="p-2.5 bg-amber-50/80 border border-amber-200 rounded-xl">
              <span className="text-[11px] font-bold text-amber-900 block truncate">
                🥛 दूध
              </span>
              <span className="text-base font-extrabold text-amber-950 tabular-nums block mt-0.5">
                {formatINR(milkData.total)}
              </span>
              <p className="text-[10px] text-amber-700 mt-0.5">
                {milkData.qty}L ({milkData.absentDays || 0} नागा)
              </p>
            </div>

            {/* 2. Kirana */}
            <div className="p-2.5 bg-indigo-50/80 border border-indigo-200 rounded-xl">
              <span className="text-[11px] font-bold text-indigo-900 block truncate">
                🛒 किराना व राशन
              </span>
              <span className="text-base font-extrabold text-indigo-950 tabular-nums block mt-0.5">
                {formatINR(kiranaData.total)}
              </span>
              <p className="text-[10px] text-indigo-700 mt-0.5">
                {kiranaData.count} बार राशन
              </p>
            </div>

            {/* 3. Petrol */}
            <div className="p-2.5 bg-rose-50/80 border border-rose-200 rounded-xl">
              <span className="text-[11px] font-bold text-rose-900 block truncate">
                ⛽ गाड़ी पेट्रोल
              </span>
              <span className="text-base font-extrabold text-rose-950 tabular-nums block mt-0.5">
                {formatINR(petrolData.total)}
              </span>
              <p className="text-[10px] text-rose-700 mt-0.5">
                गाड़ी / कार ईंधन
              </p>
            </div>

            {/* 4. School Fees */}
            <div className="p-2.5 bg-purple-50/80 border border-purple-200 rounded-xl">
              <span className="text-[11px] font-bold text-purple-900 block truncate">
                🎓 स्कूल फीस
              </span>
              <span className="text-base font-extrabold text-purple-950 tabular-nums block mt-0.5">
                {formatINR(feesData.total)}
              </span>
              <p className="text-[10px] text-purple-700 mt-0.5">
                बच्चों की फीस
              </p>
            </div>

            {/* 5. Sabzi */}
            <div className="p-2.5 bg-emerald-50/80 border border-emerald-200 rounded-xl">
              <span className="text-[11px] font-bold text-emerald-900 block truncate">
                🥦 सब्ज़ी-मंडी
              </span>
              <span className="text-base font-extrabold text-emerald-950 tabular-nums block mt-0.5">
                {formatINR(vegData.total)}
              </span>
              <p className="text-[10px] text-emerald-700 mt-0.5">
                {vegData.count} बार खरीदारी
              </p>
            </div>

            {/* 6. Auto */}
            <div className="p-2.5 bg-sky-50/80 border border-sky-200 rounded-xl">
              <span className="text-[11px] font-bold text-sky-900 block truncate">
                🚖 ऑटो / किराया
              </span>
              <span className="text-base font-extrabold text-sky-950 tabular-nums block mt-0.5">
                {formatINR(autoData.total)}
              </span>
              <p className="text-[10px] text-sky-700 mt-0.5">
                {autoData.count} चक्कर
              </p>
            </div>
          </div>

          {/* Full Itemized Table of Categories */}
          <div>
            <h4 className="text-sm font-bold text-stone-900 uppercase tracking-wider mb-2.5">
              {lang === 'hi' ? 'खर्चों का वर्ग-वार विवरण (Category Breakdown)' : 'Category Summary'}
            </h4>
            <div className="border border-stone-300 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-stone-100 text-stone-700 border-b border-stone-300 font-bold">
                  <tr>
                    <th className="py-2.5 px-3">क्र. सं.</th>
                    <th className="py-2.5 px-3">खर्च का प्रकार (Head)</th>
                    <th className="py-2.5 px-3">मात्रा / विवरण</th>
                    <th className="py-2.5 px-3 text-right">कुल रकम (₹)</th>
                    <th className="py-2.5 px-3 text-right">% हिस्सा</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {Object.entries(categoryStats).map(([catId, stat], index) => {
                    const percentage = totalExpense > 0 ? ((stat.total / totalExpense) * 100).toFixed(1) : '0';
                    return (
                      <tr key={catId} className="hover:bg-stone-50/80">
                        <td className="py-2.5 px-3 text-stone-500">{index + 1}</td>
                        <td className="py-2.5 px-3 font-semibold text-stone-900">
                          {stat.nameHi || stat.name}
                        </td>
                        <td className="py-2.5 px-3 text-stone-600">
                          {stat.qty > 0 && `${stat.qty} ${stat.unit || ''} `}
                          ({stat.count} बार)
                          {stat.absentDays ? ` [${stat.absentDays} नागा]` : ''}
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-stone-900 tabular-nums">
                          {formatINR(stat.total)}
                        </td>
                        <td className="py-2.5 px-3 text-right text-stone-500 tabular-nums">
                          {percentage}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-stone-100/80 border-t-2 border-stone-400 font-bold text-stone-950">
                  <tr>
                    <td colSpan={3} className="py-3 px-3 text-right text-sm">
                      कुल खर्च (Total Expenditure):
                    </td>
                    <td className="py-3 px-3 text-right text-base text-rose-800 tabular-nums">
                      {formatINR(totalExpense)}
                    </td>
                    <td className="py-3 px-3 text-right text-stone-500">100%</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Section: Udhar & Lent Money Summary in the Bill */}
          {udhars.length > 0 && (
            <div className="p-4 bg-rose-50/50 border border-rose-200 rounded-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-950 uppercase tracking-wide flex items-center gap-1.5">
                  <HandCoins className="w-4 h-4 text-rose-700" />
                  <span>दोस्त व पड़ोसियों को दिया गया उधार खाता (Money Lent)</span>
                </span>
                <span className="text-xs font-bold text-rose-800 tabular-nums">
                  अभी बाकी: {formatINR(totalUdharPending)}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {udhars.map((u) => (
                  <div key={u.id} className="p-2 bg-white rounded-lg border border-rose-200 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-stone-900">{u.personName}</span>
                      <span className="text-stone-400 ml-1">({u.relation})</span>
                      <p className="text-[10px] text-stone-500">{u.date} {u.notes && `· ${u.notes}`}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold tabular-nums block">{formatINR(u.amount)}</span>
                      <span className={`text-[10px] font-bold ${u.status === 'returned' ? 'text-emerald-700' : 'text-red-700'}`}>
                        {u.status === 'returned' ? 'वापस मिला' : 'बाकी है'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Two-Column Detail: Recipients & Financial Reconciliation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Recipient breakdown ("किस-किस को दिए") */}
            <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl">
              <h5 className="text-xs font-bold text-stone-800 uppercase tracking-wider mb-2">
                {lang === 'hi' ? 'किस-किस को पैसे दिए (Recipients / Vendors)' : 'Vendor Breakdown'}
              </h5>
              <div className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
                {Object.entries(recipientStats).map(([name, amount]) => (
                  <div key={name} className="flex items-center justify-between text-xs py-1 border-b border-stone-200/60 last:border-0">
                    <span className="font-medium text-stone-700">{name}</span>
                    <span className="font-bold text-stone-900 tabular-nums">{formatINR(amount)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Inflow vs Outflow Final Balance */}
            <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl flex flex-col justify-between">
              <h5 className="text-xs font-bold text-stone-800 uppercase tracking-wider mb-2">
                {lang === 'hi' ? 'वित्तीय मिलान (Financial Balance)' : 'Financial Balance'}
              </h5>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between text-stone-600">
                  <span>मेरे पास कितने थे (Inflow/Salary):</span>
                  <span className="font-bold text-stone-900 tabular-nums">{formatINR(totalInflow)}</span>
                </div>
                <div className="flex items-center justify-between text-stone-600">
                  <span>कुल खर्च हुआ (Total Spent):</span>
                  <span className="font-bold text-rose-700 tabular-nums">(-) {formatINR(totalExpense)}</span>
                </div>
                <div className="pt-2 border-t border-stone-300 flex items-center justify-between text-sm font-bold">
                  <span className={remainingBalance >= 0 ? 'text-emerald-800' : 'text-red-700'}>
                    {remainingBalance >= 0 ? 'बचा हुआ बैलेंस (Savings):' : 'अतिरिक्त खर्च (Deficit):'}
                  </span>
                  <span className={`text-base tabular-nums ${remainingBalance >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                    {formatINR(remainingBalance)}
                  </span>
                </div>
              </div>

              {/* Payment modes breakdown */}
              <div className="mt-3 pt-2.5 border-t border-stone-200 flex items-center justify-between text-[11px] text-stone-500">
                <span>नकद (Cash): {formatINR(paymentStats['Cash'] || 0)}</span>
                <span>UPI/GPay: {formatINR(paymentStats['UPI'] || 0)}</span>
                <span>उधार (Due): {formatINR(paymentStats['Udhar'] || 0)}</span>
              </div>
            </div>
          </div>

          {/* Footer sign-off */}
          <div className="pt-4 border-t border-stone-300 text-center text-xs text-stone-500">
            <p>यह बिल घरेलू हिसाब-किताब के लिए सुरक्षित रूप से तैयार किया गया है।</p>
            <p className="mt-0.5 text-[10px] text-stone-400">Ghar Ka Hisaab · Made for Indian Households</p>
          </div>
        </div>
      </div>
    </div>
  );
};
