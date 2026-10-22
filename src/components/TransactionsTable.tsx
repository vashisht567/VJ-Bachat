import React, { useState, useMemo } from 'react';
import { ExpenseEntry, Category } from '../types/hisaab';
import { formatINR } from '../utils/storage';
import { Language, translations } from '../utils/translations';
import { Search, Filter, Trash2, Edit2, Download, Plus } from 'lucide-react';

interface TransactionsTableProps {
  expenses: ExpenseEntry[];
  categories: Category[];
  onEditExpense: (expense: ExpenseEntry) => void;
  onDeleteExpense: (id: string) => void;
  onOpenAddModal: () => void;
  lang: Language;
}

export const TransactionsTable: React.FC<TransactionsTableProps> = ({
  expenses,
  categories,
  onEditExpense,
  onDeleteExpense,
  onOpenAddModal,
  lang,
}) => {
  const t = translations[lang];

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [selectedModeFilter, setSelectedModeFilter] = useState<string>('all');

  const categoryMap = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);

  // Filtered and sorted expenses (newest first)
  const filtered = useMemo(() => {
    return expenses
      .filter((exp) => {
        // Category filter
        if (selectedCategoryFilter !== 'all' && exp.categoryId !== selectedCategoryFilter) {
          return false;
        }
        // Mode filter
        if (selectedModeFilter !== 'all' && exp.paymentMode !== selectedModeFilter) {
          return false;
        }
        // Search text
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesCat = exp.categoryName.toLowerCase().includes(q);
          const matchesRec = exp.recipient?.toLowerCase().includes(q);
          const matchesNotes = exp.notes?.toLowerCase().includes(q);
          const matchesDate = exp.date.includes(q);
          return matchesCat || matchesRec || matchesNotes || matchesDate;
        }
        return true;
      })
      .sort((a, b) => b.date.localeCompare(a.date) || b.timestamp - a.timestamp);
  }, [expenses, selectedCategoryFilter, selectedModeFilter, searchQuery]);

  // Export CSV Handler
  const handleExportCSV = () => {
    const headers = ['Date', 'Category', 'Quantity', 'Rate', 'Amount (INR)', 'Recipient', 'Payment Mode', 'Notes'];
    const rows = filtered.map((e) => [
      e.date,
      `"${e.categoryName}"`,
      e.quantity || '',
      e.rate || '',
      e.amount,
      `"${e.recipient || ''}"`,
      e.paymentMode,
      `"${e.notes || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ghar_ka_hisaab_expenses.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalFilteredAmount = filtered.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="bg-white border border-stone-200 rounded-2xl shadow-xs overflow-hidden">
        {/* Controls Bar */}
        <div className="p-4 sm:p-5 border-b border-stone-200 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-stone-50/60">
          <div className="flex flex-wrap items-center gap-2 flex-1">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[200px]">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.searchEntries}
                className="w-full text-xs sm:text-sm pl-9 pr-3 py-2 border border-stone-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategoryFilter}
              onChange={(e) => setSelectedCategoryFilter(e.target.value)}
              className="text-xs sm:text-sm py-2 px-3 border border-stone-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="all">{t.allCategories}</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nameHi}
                </option>
              ))}
            </select>

            {/* Mode Filter */}
            <select
              value={selectedModeFilter}
              onChange={(e) => setSelectedModeFilter(e.target.value)}
              className="text-xs sm:text-sm py-2 px-3 border border-stone-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="all">{lang === 'hi' ? 'सभी माध्यम' : 'All Modes'}</option>
              <option value="Cash">नकद (Cash)</option>
              <option value="UPI">UPI / GPay</option>
              <option value="Udhar">उधार (Due)</option>
              <option value="Card">कार्ड</option>
            </select>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-stone-700 bg-white border border-stone-300 hover:bg-stone-50 rounded-xl transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-stone-600" />
              <span>CSV निर्यात</span>
            </button>

            <button
              onClick={onOpenAddModal}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold bg-stone-900 hover:bg-stone-800 text-white rounded-xl shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t.addExpense}</span>
            </button>
          </div>
        </div>

        {/* Results stats strip */}
        <div className="px-5 py-2.5 bg-stone-100/70 border-b border-stone-200 text-xs flex items-center justify-between text-stone-600">
          <span>
            {filtered.length} {lang === 'hi' ? 'लेन-देन' : 'entries'}
          </span>
          <span className="font-bold text-stone-900">
            {lang === 'hi' ? 'दिखाई गई कुल रकम:' : 'Filtered Total:'}{' '}
            <span className="text-rose-700 tabular-nums">{formatINR(totalFilteredAmount)}</span>
          </span>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-stone-50 text-stone-700 border-b border-stone-200 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">{t.date}</th>
                <th className="py-3 px-4">{t.category}</th>
                <th className="py-3 px-4">{t.recipient}</th>
                <th className="py-3 px-4">{t.paymentMode}</th>
                <th className="py-3 px-4">{t.notes}</th>
                <th className="py-3 px-4 text-right">{t.amount}</th>
                <th className="py-3 px-4 text-center">क्रियाएँ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-stone-400">
                    {lang === 'hi' ? 'कोई लेन-देन नहीं मिला' : 'No entries found'}
                  </td>
                </tr>
              ) : (
                filtered.map((exp) => {
                  const cat = categoryMap.get(exp.categoryId);
                  return (
                    <tr key={exp.id} className="hover:bg-stone-50/70 transition-colors">
                      <td className="py-3 px-4 font-medium text-stone-900 whitespace-nowrap">
                        {exp.date}
                      </td>
                      <td className="py-3 px-4 font-semibold text-stone-900">
                        {exp.itemName || cat?.nameHi || exp.categoryName}
                        {exp.quantity && (
                          <span className="text-stone-400 font-normal text-xs ml-1">
                            ({exp.quantity} {exp.unit || ''})
                          </span>
                        )}
                        {exp.isChutti && (
                          <span className="ml-1.5 text-[10px] text-red-600 bg-red-50 border border-red-200 px-1 py-0.5 rounded">
                            नागा / छुट्टी
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-stone-700 font-medium">
                        {exp.recipient}
                      </td>
                      <td className="py-3 px-4 text-stone-600">
                        <span className="px-2 py-0.5 rounded bg-stone-100 text-stone-700 text-xs font-medium">
                          {exp.paymentMode}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-stone-500 max-w-xs truncate">
                        {exp.notes || '—'}
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-stone-900 tabular-nums whitespace-nowrap">
                        {exp.isChutti ? (
                          <span className="text-stone-400 line-through">₹0</span>
                        ) : (
                          formatINR(exp.amount)
                        )}
                      </td>
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => onEditExpense(exp)}
                            className="p-1.5 text-stone-400 hover:text-amber-700 hover:bg-stone-100 rounded-lg transition-colors"
                            title={t.edit}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteExpense(exp.id)}
                            className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title={t.delete}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
