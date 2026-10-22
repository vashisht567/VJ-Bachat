import React, { useState } from 'react';
import { UdharEntry } from '../types/hisaab';
import { formatINR } from '../utils/storage';
import { Language, translations } from '../utils/translations';
import { X, HandCoins, Plus, CheckCircle, Clock, Trash2, Share2 } from 'lucide-react';

interface UdharKhataModalProps {
  isOpen: boolean;
  onClose: () => void;
  udhars: UdharEntry[];
  onAddUdhar: (udhar: Omit<UdharEntry, 'id' | 'timestamp'>) => void;
  onToggleUdharStatus: (id: string) => void;
  onDeleteUdhar: (id: string) => void;
  lang: Language;
}

export const UdharKhataModal: React.FC<UdharKhataModalProps> = ({
  isOpen,
  onClose,
  udhars,
  onAddUdhar,
  onToggleUdharStatus,
  onDeleteUdhar,
  lang,
}) => {
  const t = translations[lang];

  const [filter, setFilter] = useState<'all' | 'pending' | 'returned'>('all');
  const [showAddForm, setShowAddForm] = useState(false);

  // New Udhar Form State
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [personName, setPersonName] = useState('');
  const [relation, setRelation] = useState<'दोस्त' | 'पड़ोसी' | 'रिश्तेदार' | 'अन्य'>('दोस्त');
  const [amount, setAmount] = useState<number | ''>('');
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const totalGiven = udhars.reduce((sum, u) => sum + u.amount, 0);
  const totalPending = udhars.filter((u) => u.status === 'pending').reduce((sum, u) => sum + u.amount, 0);
  const totalReturned = udhars.filter((u) => u.status === 'returned').reduce((sum, u) => sum + u.amount, 0);

  const filteredUdhars = udhars.filter((u) => {
    if (filter === 'pending') return u.status === 'pending';
    if (filter === 'returned') return u.status === 'returned';
    return true;
  });

  const handleAddNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!personName.trim() || !amount || Number(amount) <= 0) return;

    onAddUdhar({
      date,
      personName: personName.trim(),
      relation,
      amount: Number(amount),
      status: 'pending',
      notes: notes.trim() || undefined,
    });

    setPersonName('');
    setAmount('');
    setNotes('');
    setShowAddForm(false);
  };

  const handleSendReminder = (u: UdharEntry) => {
    const text = `नमस्ते ${u.personName} जी, घर के हिसाब के अनुसार ${u.date} को ₹${u.amount} का उधार बाकी है। कृपया सुविधानुसार भेजने का कष्ट करें। धन्यवाद!`;
    const encoded = encodeURIComponent(text);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/65 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-stone-200 shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50 rounded-t-2xl">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-700 flex items-center justify-center">
              <HandCoins className="w-5 h-5 text-rose-700" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-stone-900">
                {lang === 'hi' ? 'उधार खाता (दोस्त व पड़ोसियों का हिसाब)' : 'Lent Money & Loan Khata'}
              </h3>
              <p className="text-xs text-stone-500">
                {lang === 'hi'
                  ? 'किस दोस्त या पड़ोसी को कितना उधार दिया और कितना वापस आया'
                  : 'Track money lent to friends, neighbors and relatives'}
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

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          {/* Top 3 Stats: Total Lent, Pending, Returned */}
          <div className="grid grid-cols-3 gap-2.5 sm:gap-3 text-center">
            <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl">
              <span className="text-[11px] font-semibold text-stone-500 uppercase block">
                कुल दिया उधार
              </span>
              <span className="text-base sm:text-xl font-bold text-stone-900 tabular-nums">
                {formatINR(totalGiven)}
              </span>
            </div>
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
              <span className="text-[11px] font-semibold text-red-700 uppercase block">
                अभी बाकी है
              </span>
              <span className="text-base sm:text-xl font-bold text-red-800 tabular-nums">
                {formatINR(totalPending)}
              </span>
            </div>
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
              <span className="text-[11px] font-semibold text-emerald-700 uppercase block">
                वापस मिल गया
              </span>
              <span className="text-base sm:text-xl font-bold text-emerald-800 tabular-nums">
                {formatINR(totalReturned)}
              </span>
            </div>
          </div>

          {/* Action Bar: Filter Pills & Add Button */}
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-stone-100">
            <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-lg text-xs font-semibold">
              <button
                onClick={() => setFilter('all')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  filter === 'all' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600'
                }`}
              >
                सभी ({udhars.length})
              </button>
              <button
                onClick={() => setFilter('pending')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  filter === 'pending' ? 'bg-white text-red-700 shadow-xs' : 'text-stone-600'
                }`}
              >
                बाकी ({udhars.filter((u) => u.status === 'pending').length})
              </button>
              <button
                onClick={() => setFilter('returned')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  filter === 'returned' ? 'bg-white text-emerald-700 shadow-xs' : 'text-stone-600'
                }`}
              >
                वापस मिले ({udhars.filter((u) => u.status === 'returned').length})
              </button>
            </div>

            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-stone-900 hover:bg-stone-800 text-white rounded-lg shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{showAddForm ? 'बंद करें' : '+ नया उधार दर्ज करें'}</span>
            </button>
          </div>

          {/* Add New Udhar Form */}
          {showAddForm && (
            <form onSubmit={handleAddNew} className="p-4 border-2 border-dashed border-rose-300 rounded-xl bg-rose-50/40 space-y-3">
              <h4 className="text-xs font-bold text-rose-950 uppercase">
                उधार की जानकारी भरें (Lend Money)
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-stone-700 block mb-1">
                    किसको उधार दिया (नाम) *
                  </label>
                  <input
                    type="text"
                    required
                    value={personName}
                    onChange={(e) => setPersonName(e.target.value)}
                    placeholder="जैसे: रमेश, शर्मा जी पड़ोसी"
                    className="w-full text-xs sm:text-sm p-2 border border-stone-300 rounded-lg bg-white focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-stone-700 block mb-1">
                    संबंध / रिश्ता
                  </label>
                  <div className="grid grid-cols-4 gap-1">
                    {(['दोस्त', 'पड़ोसी', 'रिश्तेदार', 'अन्य'] as const).map((rel) => (
                      <button
                        type="button"
                        key={rel}
                        onClick={() => setRelation(rel)}
                        className={`py-1.5 text-[11px] font-bold rounded-lg border transition-all ${
                          relation === rel
                            ? 'bg-rose-600 text-white border-rose-700 shadow-xs'
                            : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-100'
                        }`}
                      >
                        {rel}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-stone-700 block mb-1">
                    रकम (₹ Amount) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-2 text-stone-500 font-bold text-sm">₹</span>
                    <input
                      type="number"
                      required
                      min="1"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value === '' ? '' : parseFloat(e.target.value))}
                      placeholder="1000"
                      className="w-full text-sm font-bold pl-7 p-2 border border-stone-300 rounded-lg bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-stone-700 block mb-1">
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
              </div>

              <div>
                <label className="text-[11px] font-semibold text-stone-700 block mb-1">
                  टिप्पणी / कारण (Notes)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="जैसे: दवा के लिए दिए, महीने के अंत तक वापस करेंगे..."
                  className="w-full text-xs p-2 border border-stone-300 rounded-lg bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3 py-1.5 text-xs text-stone-600 hover:bg-stone-200 rounded-lg"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold bg-rose-700 hover:bg-rose-800 text-white rounded-lg shadow-xs"
                >
                  उधार खाता में जोड़ें
                </button>
              </div>
            </form>
          )}

          {/* List of Udhar Entries */}
          <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
            {filteredUdhars.length === 0 ? (
              <div className="text-center py-12 text-stone-400">
                <p className="text-sm font-medium">कोई उधार रिकॉर्ड नहीं है</p>
                <p className="text-xs mt-1">ऊपर दिए बटन से नया उधार दर्ज करें</p>
              </div>
            ) : (
              filteredUdhars.map((item) => (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    item.status === 'returned'
                      ? 'bg-emerald-50/40 border-emerald-200'
                      : 'bg-stone-50 border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-stone-900 text-sm">
                          {item.personName}
                        </span>
                        <span className="text-[10px] bg-stone-200 text-stone-800 font-semibold px-2 py-0.5 rounded">
                          {item.relation}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 ${
                            item.status === 'returned'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {item.status === 'returned' ? (
                            <>
                              <CheckCircle className="w-3 h-3 text-emerald-600" /> वापस मिल गया
                            </>
                          ) : (
                            <>
                              <Clock className="w-3 h-3 text-red-600" /> बाकी है
                            </>
                          )}
                        </span>
                      </div>

                      <p className="text-xs text-stone-500 mt-1">
                        📅 दिया तिथि: {item.date} {item.notes && `· ${item.notes}`}
                      </p>
                    </div>

                    <div className="flex flex-col items-end shrink-0">
                      <span className="text-base font-extrabold text-stone-900 tabular-nums">
                        {formatINR(item.amount)}
                      </span>

                      <div className="flex items-center gap-1.5 mt-2">
                        {/* Toggle Status */}
                        <button
                          onClick={() => onToggleUdharStatus(item.id)}
                          className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border transition-all ${
                            item.status === 'returned'
                              ? 'bg-stone-100 border-stone-300 text-stone-700 hover:bg-stone-200'
                              : 'bg-emerald-600 border-emerald-700 text-white hover:bg-emerald-700 shadow-xs'
                          }`}
                          title="स्थिति बदलें"
                        >
                          {item.status === 'returned' ? 'बाकी करें' : 'वापस मिला'}
                        </button>

                        {/* WhatsApp reminder if pending */}
                        {item.status === 'pending' && (
                          <button
                            onClick={() => handleSendReminder(item)}
                            className="p-1.5 text-stone-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="व्हाट्सएप पर याद दिलाएं"
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Delete */}
                        <button
                          onClick={() => onDeleteUdhar(item.id)}
                          className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="हटाएं"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200 bg-stone-50 rounded-b-2xl flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs sm:text-sm font-semibold bg-stone-900 text-white rounded-xl hover:bg-stone-800"
          >
            पूर्ण (Done)
          </button>
        </div>
      </div>
    </div>
  );
};
