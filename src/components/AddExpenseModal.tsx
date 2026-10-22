import React, { useState, useEffect } from 'react';
import { Category, ExpenseEntry, PaymentMode } from '../types/hisaab';
import { Language, translations } from '../utils/translations';
import { X, Check, Calculator, ShoppingCart, Milk, Fuel, GraduationCap, Car, ShoppingBag, HandCoins } from 'lucide-react';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string; // YYYY-MM-DD
  categories: Category[];
  editingExpense?: ExpenseEntry | null;
  defaultMilkLitre?: number;
  defaultMilkRate?: number;
  onSaveExpense: (expense: Omit<ExpenseEntry, 'id' | 'timestamp'> & { id?: string }) => void;
  lang: Language;
}

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  isOpen,
  onClose,
  selectedDate,
  categories,
  editingExpense,
  defaultMilkLitre = 1.5,
  defaultMilkRate = 66,
  onSaveExpense,
  lang,
}) => {
  const t = translations[lang];

  const [date, setDate] = useState(selectedDate);
  const [categoryId, setCategoryId] = useState('kirana');
  const [itemName, setItemName] = useState(''); // Specific item name typed by user
  const [amount, setAmount] = useState<number | ''>('');
  const [quantity, setQuantity] = useState<number | ''>('');
  const [rate, setRate] = useState<number | ''>('');
  const [recipient, setRecipient] = useState('');
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('Cash');
  const [notes, setNotes] = useState('');
  const [isChutti, setIsChutti] = useState(false);

  // Sync state when editing or opening
  useEffect(() => {
    if (editingExpense) {
      setDate(editingExpense.date);
      setCategoryId(editingExpense.categoryId);
      setItemName(editingExpense.itemName || editingExpense.categoryName);
      setAmount(editingExpense.amount);
      setQuantity(editingExpense.quantity || '');
      setRate(editingExpense.rate || '');
      setRecipient(editingExpense.recipient || '');
      setPaymentMode(editingExpense.paymentMode || 'Cash');
      setNotes(editingExpense.notes || '');
      setIsChutti(!!editingExpense.isChutti);
    } else {
      setDate(selectedDate);
      const defaultCat = categories.find((c) => c.id === 'kirana') || categories[0];
      if (defaultCat) {
        setCategoryId(defaultCat.id);
        setItemName(defaultCat.nameHi);
        setRate(defaultCat.defaultRate || '');
        setRecipient(defaultCat.defaultRecipient || 'शर्मा जी किराना');
        setAmount(defaultCat.defaultRate || '');
        setQuantity(1);
      }
      setIsChutti(false);
      setNotes('');
    }
  }, [editingExpense, selectedDate, categories, isOpen]);

  if (!isOpen) return null;

  const currentCategory = categories.find((c) => c.id === categoryId) || categories[0];

  const handleCategorySelect = (cat: Category) => {
    setCategoryId(cat.id);
    setItemName(cat.nameHi);
    setRecipient(cat.defaultRecipient || '');

    if (cat.id === 'dudh') {
      const q = defaultMilkLitre;
      const r = defaultMilkRate;
      setQuantity(q);
      setRate(r);
      setAmount(Math.round(q * r));
      setItemName('दूध (डेयरी)');
    } else if (cat.id === 'petrol') {
      setQuantity(5);
      setRate(100);
      setAmount(500);
      setItemName('गाड़ी का पेट्रोल');
      setRecipient('पेट्रोल पंप');
    } else if (cat.id === 'school_fees') {
      setAmount(2500);
      setQuantity(1);
      setItemName('बच्चों की स्कूल फीस');
      setRecipient('स्कूल / कोचिंग');
    } else if (cat.id === 'udhar_given') {
      setAmount(1000);
      setItemName('दोस्त को उधार');
      setRecipient('दोस्त / पड़ोसी');
    } else if (cat.defaultRate) {
      setQuantity(1);
      setRate(cat.defaultRate);
      setAmount(cat.defaultRate);
    }
  };

  // Dedicated Milk Litre Selector Handler
  const handleSelectMilkLitre = (litre: number) => {
    setQuantity(litre);
    const r = rate !== '' ? Number(rate) : defaultMilkRate;
    setRate(r);
    setAmount(Math.round(litre * r));
    setItemName(`${litre} लीटर दूध`);
  };

  const handleQuantityChange = (val: number | '') => {
    setQuantity(val);
    if (val !== '' && rate !== '') {
      setAmount(Math.round(Number(val) * Number(rate)));
    }
  };

  const handleRateChange = (val: number | '') => {
    setRate(val);
    if (quantity !== '' && val !== '') {
      setAmount(Math.round(Number(quantity) * Number(val)));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalAmount = isChutti ? 0 : Number(amount) || 0;
    const finalItemName = itemName.trim() || currentCategory?.nameHi || 'खर्च';

    onSaveExpense({
      id: editingExpense ? editingExpense.id : undefined,
      date,
      categoryId,
      categoryName: finalItemName,
      itemName: finalItemName,
      amount: finalAmount,
      quantity: quantity === '' ? undefined : Number(quantity),
      unit: currentCategory?.unit,
      rate: rate === '' ? undefined : Number(rate),
      recipient: recipient.trim() || currentCategory?.defaultRecipient || 'दुकानदार',
      paymentMode,
      notes: notes.trim() || undefined,
      isChutti,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/65 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-stone-200 shadow-2xl w-full max-w-lg max-h-[94vh] flex flex-col my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50 rounded-t-2xl">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-700 flex items-center justify-center font-bold">
              <Calculator className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-stone-900">
                {editingExpense ? 'खर्च का विवरण बदलें' : 'नया खर्च जोड़ें (दूध, पेट्रोल, फीस, किराना)'}
              </h3>
              <p className="text-xs text-stone-500">
                सामान का नाम व दूध का लीटर आसानी से सेट करें
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto space-y-4">
          {/* 1. Date Picker */}
          <div>
            <label className="text-xs font-semibold text-stone-700 block mb-1">
              तारीख *
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full text-sm p-2.5 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none bg-stone-50/50"
            />
          </div>

          {/* 2. Primary Category Quick Pick Cards */}
          <div>
            <label className="text-xs font-semibold text-stone-700 block mb-1.5">
              खर्च श्रेणी चुनें *
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-2">
              {/* Milk */}
              <button
                type="button"
                onClick={() => handleCategorySelect(categories.find((c) => c.id === 'dudh') || categories[0])}
                className={`p-2 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                  categoryId === 'dudh'
                    ? 'bg-amber-600 text-white border-amber-700 shadow-sm'
                    : 'bg-stone-50 border-stone-200 hover:bg-stone-100 text-stone-800'
                }`}
              >
                <span className="text-lg">🥛</span>
                <span className="text-[11px] font-bold">दूध व डेयरी</span>
              </button>

              {/* Kirana */}
              <button
                type="button"
                onClick={() => handleCategorySelect(categories.find((c) => c.id === 'kirana') || categories[0])}
                className={`p-2 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                  categoryId === 'kirana'
                    ? 'bg-indigo-600 text-white border-indigo-700 shadow-sm'
                    : 'bg-stone-50 border-stone-200 hover:bg-stone-100 text-stone-800'
                }`}
              >
                <span className="text-lg">🛒</span>
                <span className="text-[11px] font-bold">किराना व राशन</span>
              </button>

              {/* Petrol */}
              <button
                type="button"
                onClick={() => handleCategorySelect(categories.find((c) => c.id === 'petrol') || categories[0])}
                className={`p-2 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                  categoryId === 'petrol'
                    ? 'bg-rose-600 text-white border-rose-700 shadow-sm'
                    : 'bg-stone-50 border-stone-200 hover:bg-stone-100 text-stone-800'
                }`}
              >
                <span className="text-lg">⛽</span>
                <span className="text-[11px] font-bold">गाड़ी पेट्रोल</span>
              </button>

              {/* School Fees */}
              <button
                type="button"
                onClick={() => handleCategorySelect(categories.find((c) => c.id === 'school_fees') || categories[0])}
                className={`p-2 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                  categoryId === 'school_fees'
                    ? 'bg-purple-600 text-white border-purple-700 shadow-sm'
                    : 'bg-stone-50 border-stone-200 hover:bg-stone-100 text-stone-800'
                }`}
              >
                <span className="text-lg">🎓</span>
                <span className="text-[11px] font-bold">स्कूल फीस</span>
              </button>

              {/* Sabzi */}
              <button
                type="button"
                onClick={() => handleCategorySelect(categories.find((c) => c.id === 'sabzi') || categories[0])}
                className={`p-2 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                  categoryId === 'sabzi'
                    ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                    : 'bg-stone-50 border-stone-200 hover:bg-stone-100 text-stone-800'
                }`}
              >
                <span className="text-lg">🥦</span>
                <span className="text-[11px] font-bold">सब्ज़ी-मंडी</span>
              </button>

              {/* Auto */}
              <button
                type="button"
                onClick={() => handleCategorySelect(categories.find((c) => c.id === 'auto') || categories[0])}
                className={`p-2 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                  categoryId === 'auto'
                    ? 'bg-sky-600 text-white border-sky-700 shadow-sm'
                    : 'bg-stone-50 border-stone-200 hover:bg-stone-100 text-stone-800'
                }`}
              >
                <span className="text-lg">🚖</span>
                <span className="text-[11px] font-bold">गाड़ी/ऑटो</span>
              </button>

              {/* Udhar */}
              <button
                type="button"
                onClick={() => handleCategorySelect(categories.find((c) => c.id === 'udhar_given') || categories[0])}
                className={`p-2 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                  categoryId === 'udhar_given'
                    ? 'bg-red-600 text-white border-red-700 shadow-sm'
                    : 'bg-stone-50 border-stone-200 hover:bg-stone-100 text-stone-800'
                }`}
              >
                <span className="text-lg">🤝</span>
                <span className="text-[11px] font-bold">दिया उधार</span>
              </button>

              {/* Others */}
              <button
                type="button"
                onClick={() => handleCategorySelect(categories.find((c) => c.id === 'misc') || categories[0])}
                className={`p-2 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                  categoryId === 'misc'
                    ? 'bg-stone-900 text-white border-stone-950 shadow-sm'
                    : 'bg-stone-50 border-stone-200 hover:bg-stone-100 text-stone-800'
                }`}
              >
                <span className="text-lg">🏷️</span>
                <span className="text-[11px] font-bold">अन्य खर्च</span>
              </button>
            </div>
          </div>

          {/* 3. Custom Item Name Input (Directly fixes: "aur bhi koi item add kar raha hun to uska naam barabar nahi aa raha") */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-stone-800">
                सामान / खर्च का नाम (Item Name) *
              </label>
              <span className="text-[11px] text-stone-400">अपनी मर्ज़ी से कोई भी नाम लिखें</span>
            </div>
            <input
              type="text"
              required
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              placeholder="जैसे: कार पेट्रोल, रोहन की स्कूल फीस, 1.5L दूध, गैस सिलेंडर..."
              className="w-full text-sm font-semibold p-2.5 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white text-stone-900 shadow-xs"
            />
          </div>

          {/* 4. DEDICATED MILK LITRE SELECTOR (Directly fixes: "Main Dudh ka litre barabar set nahin kar paoge theek Karen") */}
          {categoryId === 'dudh' && (
            <div className="p-3.5 bg-amber-50/80 border border-amber-300 rounded-xl space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-950 flex items-center gap-1.5">
                  <span>🥛</span> दूध का लीटर चुनें (Select Milk Litres)
                </span>
                <span className="text-xs font-extrabold text-amber-900 tabular-nums">
                  {quantity || 1.5} लीटर = ₹{amount || 99}
                </span>
              </div>

              {/* 1-Tap Litre Buttons */}
              <div className="grid grid-cols-5 gap-1.5">
                {[0.5, 1, 1.5, 2, 2.5].map((ltr) => (
                  <button
                    type="button"
                    key={ltr}
                    onClick={() => handleSelectMilkLitre(ltr)}
                    className={`py-2 text-xs font-extrabold rounded-lg border transition-all ${
                      quantity === ltr && !isChutti
                        ? 'bg-amber-600 text-white border-amber-700 shadow-sm'
                        : 'bg-white border-amber-200 text-amber-900 hover:bg-amber-100'
                    }`}
                  >
                    {ltr} L
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                <div>
                  <label className="text-[11px] font-semibold text-amber-900 block mb-0.5">
                    भाव (₹ प्रति लीटर)
                  </label>
                  <input
                    type="number"
                    value={rate}
                    onChange={(e) => handleRateChange(e.target.value === '' ? '' : parseFloat(e.target.value))}
                    className="w-full p-2 border border-amber-300 rounded-lg bg-white font-bold"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-amber-900 block mb-0.5">
                    कस्टम लीटर
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={quantity}
                    onChange={(e) => handleQuantityChange(e.target.value === '' ? '' : parseFloat(e.target.value))}
                    className="w-full p-2 border border-amber-300 rounded-lg bg-white font-bold"
                  />
                </div>
              </div>

              {/* Naaga Checkbox */}
              <div className="pt-2 border-t border-amber-200 flex items-center justify-between">
                <span className="text-xs font-semibold text-amber-900">आज दूध नहीं लिया (नागा/छुट्टी)?</span>
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isChutti}
                    onChange={(e) => setIsChutti(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                  />
                  <span className="text-xs font-bold text-red-700">नागा दर्ज करें</span>
                </label>
              </div>
            </div>
          )}

          {/* 5. Total Amount Input */}
          {!isChutti && (
            <div>
              <label className="text-xs font-bold text-stone-800 block mb-1">
                कुल रकम (₹ Amount) *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-stone-600 font-bold text-base">₹</span>
                <input
                  type="number"
                  required
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value === '' ? '' : parseFloat(e.target.value))}
                  placeholder="रकम दर्ज करें"
                  className="w-full text-lg font-extrabold pl-8 p-2.5 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none tabular-nums bg-white text-stone-900 shadow-xs"
                />
              </div>
            </div>
          )}

          {/* 6. Recipient ("किसको दिए") */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-stone-700">
                किसको दिए (दुकानदार / व्यक्ति / दोस्त का नाम) *
              </label>
            </div>
            <input
              type="text"
              required
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="जैसे: शर्मा जी किराना, पेट्रोल पंप, रमेश दोस्त, स्कूल..."
              className="w-full text-sm p-2.5 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />

            {/* Quick recipient chips */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {['शर्मा जी किराना', 'पेट्रोल पंप', 'रामू दूधवाला', 'सब्ज़ी मंडी', 'ऑटो वाले भैया', 'स्कूल फीस'].map((name) => (
                <button
                  type="button"
                  key={name}
                  onClick={() => setRecipient(name)}
                  className="text-[11px] px-2 py-0.5 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium"
                >
                  +{name}
                </button>
              ))}
            </div>
          </div>

          {/* 7. Payment Mode */}
          <div>
            <label className="text-xs font-semibold text-stone-700 block mb-1">
              {t.paymentMode}
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['Cash', 'UPI', 'Card', 'Udhar'] as PaymentMode[]).map((mode) => (
                <button
                  type="button"
                  key={mode}
                  onClick={() => setPaymentMode(mode)}
                  className={`py-2 text-xs font-bold rounded-lg border text-center transition-all ${
                    paymentMode === mode
                      ? 'bg-amber-500 text-stone-950 border-amber-600 shadow-xs'
                      : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  {mode === 'Cash'
                    ? 'नकद'
                    : mode === 'UPI'
                    ? 'UPI / GPay'
                    : mode === 'Card'
                    ? 'कार्ड'
                    : 'उधार'}
                </button>
              ))}
            </div>
          </div>

          {/* 8. Notes */}
          <div>
            <label className="text-xs font-semibold text-stone-700 block mb-1">
              अतिरिक्त विवरण (Notes)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="कोई भी अतिरिक्त विवरण..."
              className="w-full text-xs sm:text-sm p-2.5 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          {/* Submit Action */}
          <div className="pt-3 border-t border-stone-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-stone-600 hover:bg-stone-100 rounded-xl"
            >
              रद्द करें
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2.5 text-xs sm:text-sm font-extrabold bg-stone-900 hover:bg-stone-800 text-white rounded-xl shadow-xs transition-colors"
            >
              <Check className="w-4 h-4" />
              <span>खर्च सुरक्षित करें (Save)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
