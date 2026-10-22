import React, { useState } from 'react';
import { MonthlyHisaab } from '../types/hisaab';
import { Language, translations } from '../utils/translations';
import { X, Settings, Check, Calendar, Milk, Download, Smartphone } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  monthlyData: MonthlyHisaab;
  onUpdateSettings: (settings: {
    salaryCycleDay: number;
    defaultMilkLitre: number;
    defaultMilkRate: number;
  }) => void;
  onExportBackup: () => void;
  lang: Language;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  monthlyData,
  onUpdateSettings,
  onExportBackup,
  lang,
}) => {
  const [salaryDay, setSalaryDay] = useState<number>(monthlyData.salaryCycleDay || 10);
  const [milkLitre, setMilkLitre] = useState<number>(monthlyData.defaultMilkLitre || 1.5);
  const [milkRate, setMilkRate] = useState<number>(monthlyData.defaultMilkRate || 66);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings({
      salaryCycleDay: Number(salaryDay),
      defaultMilkLitre: Number(milkLitre),
      defaultMilkRate: Number(milkRate),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/65 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-stone-200 shadow-2xl w-full max-w-lg max-h-[92vh] flex flex-col my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50 rounded-t-2xl">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-700 flex items-center justify-center">
              <Settings className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-stone-900">
                {lang === 'hi' ? 'सैलरी साइकिल व दूध सेटिंग्स' : 'Salary Cycle & Milk Settings'}
              </h3>
              <p className="text-xs text-stone-500">
                {lang === 'hi' ? 'सैलरी की तारीख, दूध का लीटर और ऐप सेटिंग्स' : 'Configure salary day and milk litres'}
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
        <form onSubmit={handleSave} className="p-4 sm:p-6 overflow-y-auto space-y-5">
          {/* 1. Salary Cycle Setting (10th to 9th next month) */}
          <div className="p-4 bg-sky-50/70 border border-sky-200 rounded-2xl space-y-2.5">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-sky-700" />
              <h4 className="text-xs font-bold text-sky-950 uppercase tracking-wide">
                सैलरी आने की तारीख (Salary Cycle Day)
              </h4>
            </div>

            <p className="text-xs text-sky-800">
              जिस तारीख को आपकी तनख्वाह आती है, ऐप उसी तारीख से अगले महीने की उस तारीख तक का पूरा हिसाब बिल बनाएगा।
            </p>

            {/* Quick preset buttons for 1st, 7th, 10th, 15th, 20th */}
            <div className="grid grid-cols-5 gap-1.5 pt-1">
              {[1, 7, 10, 15, 20].map((d) => (
                <button
                  type="button"
                  key={d}
                  onClick={() => setSalaryDay(d)}
                  className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                    salaryDay === d
                      ? 'bg-sky-600 text-white border-sky-700 shadow-xs'
                      : 'bg-white border-sky-200 text-sky-900 hover:bg-sky-100'
                  }`}
                >
                  {d} तारीख
                </button>
              ))}
            </div>

            <div className="mt-2 text-xs text-stone-600 bg-white p-2.5 rounded-xl border border-sky-200">
              💡 <strong>बिलिंग चक्र:</strong> हर महीने की <strong>{salaryDay} तारीख</strong> से अगले महीने की <strong>{salaryDay - 1 === 0 ? 30 : salaryDay - 1} तारीख</strong> तक।
            </div>
          </div>

          {/* 2. Milk Litre & Rate Selector */}
          <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-3">
            <div className="flex items-center gap-2">
              <Milk className="w-4 h-4 text-amber-700" />
              <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wide">
                रोज़ाना का दूध (Daily Milk Litres & Rate)
              </h4>
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1.5">
                रोज़ाना कितना लीटर दूध आता है?
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {[0.5, 1, 1.5, 2, 2.5].map((ltr) => (
                  <button
                    type="button"
                    key={ltr}
                    onClick={() => setMilkLitre(ltr)}
                    className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                      milkLitre === ltr
                        ? 'bg-amber-600 text-white border-amber-700 shadow-xs'
                        : 'bg-white border-amber-200 text-amber-900 hover:bg-amber-100'
                    }`}
                  >
                    {ltr} L
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-[11px] font-semibold text-stone-700 block mb-1">
                  कस्टम लीटर
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={milkLitre}
                  onChange={(e) => setMilkLitre(parseFloat(e.target.value) || 0)}
                  className="w-full text-xs sm:text-sm p-2 border border-stone-300 rounded-lg bg-white"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-stone-700 block mb-1">
                  भाव (₹ प्रति लीटर)
                </label>
                <input
                  type="number"
                  value={milkRate}
                  onChange={(e) => setMilkRate(parseFloat(e.target.value) || 0)}
                  className="w-full text-xs sm:text-sm p-2 border border-stone-300 rounded-lg bg-white font-bold"
                />
              </div>
            </div>

            <div className="text-xs text-amber-900 font-bold bg-white p-2.5 rounded-xl border border-amber-200 flex items-center justify-between">
              <span>दैनिक दूध का तय खर्च:</span>
              <span className="text-base tabular-nums">
                ₹{Math.round(milkLitre * milkRate)} / दिन ({milkLitre} लीटर)
              </span>
            </div>
          </div>

          {/* 3. Mobile App & Backup Section */}
          <div className="p-4 bg-stone-50 border border-stone-200 rounded-2xl space-y-2.5">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-stone-700" />
              <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wide">
                मोबाइल ऐप व बैकअप (Mobile App / Backup)
              </h4>
            </div>

            <p className="text-xs text-stone-600">
              इस ऐप को सीधे अपने फ़ोन में इंस्टॉल कर सकते हैं। यह बिना इंटरनेट के भी पूरी तरह काम करता है।
            </p>

            <div className="flex items-center justify-between gap-2 pt-1">
              <button
                type="button"
                onClick={onExportBackup}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-stone-800 bg-white border border-stone-300 rounded-xl hover:bg-stone-100 transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-stone-600" />
                <span>डाटा बैकअप डाउनलोड (JSON)</span>
              </button>

              <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                ✓ ऑफलाइन सपोर्ट सक्रिय
              </span>
            </div>
          </div>

          {/* Save Button */}
          <div className="pt-2 border-t border-stone-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-stone-600 hover:bg-stone-100 rounded-xl"
            >
              रद्द करें
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2.5 text-xs sm:text-sm font-bold bg-stone-900 hover:bg-stone-800 text-white rounded-xl shadow-xs transition-colors"
            >
              <Check className="w-4 h-4" />
              <span>सेटिंग्स सुरक्षित करें</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
