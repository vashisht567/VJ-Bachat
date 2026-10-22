import React, { useState, useEffect, useRef } from 'react';
import { Category, ExpenseEntry, PaymentMode } from '../types/hisaab';
import { parseSpokenHisaab, ParsedVoiceResult } from '../utils/voiceParser';
import { Language, translations } from '../utils/translations';
import { Mic, MicOff, Plus, Check, Sparkles, Volume2 } from 'lucide-react';

interface QuickAddAndVoiceProps {
  categories: Category[];
  selectedDate: string; // YYYY-MM-DD
  onAddExpense: (expense: Omit<ExpenseEntry, 'id' | 'timestamp'>) => void;
  onOpenAddModal: () => void;
  onOpenAddIncome: () => void;
  lang: Language;
}

export const QuickAddAndVoice: React.FC<QuickAddAndVoiceProps> = ({
  categories,
  selectedDate,
  onAddExpense,
  onOpenAddModal,
  onOpenAddIncome,
  lang,
}) => {
  const t = translations[lang];
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [parsedResult, setParsedResult] = useState<ParsedVoiceResult | null>(null);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  const milkCategory = categories.find((c) => c.id === 'dudh');
  const vegCategory = categories.find((c) => c.id === 'sabzi');
  const autoCategory = categories.find((c) => c.id === 'auto');

  useEffect(() => {
    // Check Web Speech API availability
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';

      recognition.onstart = () => {
        setIsListening(true);
        setVoiceError(null);
      };

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        setTranscript(currentTranscript);
        const parsed = parseSpokenHisaab(currentTranscript, categories);
        setParsedResult(parsed);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setVoiceError('कृपया माइक्रोफ़ोन की अनुमति (Permission) दें');
        } else {
          setVoiceError('आवाज़ साफ़ सुनाई नहीं दी, कृपया दोबारा बोलें');
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [categories, lang]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setTranscript('');
      setParsedResult(null);
      setVoiceError(null);
      try {
        recognitionRef.current?.start();
      } catch (e) {
        console.warn('Could not start recognition:', e);
        setVoiceError('माइक शुरू नहीं हो सका। कृपया टेक्स्ट या क्विक बटन इस्तेमाल करें।');
      }
    }
  };

  const handleApplyVoiceResult = () => {
    if (!parsedResult || !parsedResult.amount) return;

    const catId = parsedResult.categoryId || 'misc';
    const cat = categories.find((c) => c.id === catId);

    onAddExpense({
      date: selectedDate,
      categoryId: catId,
      categoryName: cat?.nameHi || cat?.name || parsedResult.categoryName || 'विविध खर्च',
      amount: parsedResult.amount,
      quantity: parsedResult.quantity,
      unit: parsedResult.unit || cat?.unit,
      rate: cat?.defaultRate,
      recipient: parsedResult.recipient || cat?.defaultRecipient || 'दुकानदार',
      paymentMode: 'Cash' as PaymentMode,
      notes: parsedResult.notes || 'बोल कर जोड़ा गया हिसाब',
    });

    setTranscript('');
    setParsedResult(null);
  };

  // Quick 1-tap add handlers
  const handleQuickAddMilk = () => {
    const rate = milkCategory?.defaultRate || 66;
    const qty = 1.5;
    onAddExpense({
      date: selectedDate,
      categoryId: 'dudh',
      categoryName: milkCategory?.nameHi || 'दूध व डेयरी',
      amount: Math.round(rate * qty),
      quantity: qty,
      unit: 'लीटर',
      rate: rate,
      recipient: milkCategory?.defaultRecipient || 'रामू दूधवाला',
      paymentMode: 'Udhar',
      notes: `${qty} लीटर रोज़ाना दूध`,
    });
  };

  const handleQuickAddVeg = () => {
    const rate = vegCategory?.defaultRate || 150;
    onAddExpense({
      date: selectedDate,
      categoryId: 'sabzi',
      categoryName: vegCategory?.nameHi || 'सब्ज़ी व फल',
      amount: rate,
      quantity: 1,
      unit: 'दिन',
      rate: rate,
      recipient: vegCategory?.defaultRecipient || 'सब्ज़ी मंडी',
      paymentMode: 'UPI',
      notes: 'ताज़ा हरी सब्ज़ी मंडी',
    });
  };

  const handleQuickAddAuto = () => {
    const rate = autoCategory?.defaultRate || 70;
    onAddExpense({
      date: selectedDate,
      categoryId: 'auto',
      categoryName: autoCategory?.nameHi || autoCategory?.name || 'ऑटो / गाड़ी किराया',
      amount: rate,
      quantity: 1,
      unit: 'चक्कर',
      rate: rate,
      recipient: autoCategory?.defaultRecipient || 'ऑटो किराया',
      paymentMode: 'Cash',
      notes: 'दैनिक आवागमन किराया',
    });
  };

  // Format date display
  const [y, m, d] = selectedDate.split('-');
  const dateObj = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
  const dateLabel = dateObj.toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-US', {
    day: 'numeric',
    month: 'short',
    weekday: 'short',
  });

  return (
    <div className="bg-stone-100/80 border-b border-stone-200 py-3.5 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Left Side: Voice Assistant & Date Indicator */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Active Selected Date Badge */}
          <div className="bg-stone-900 text-stone-100 text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shrink-0">
            <span>📅 {dateLabel}</span>
          </div>

          {/* Voice Mic Button */}
          <button
            onClick={toggleListening}
            className={`flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
              isListening
                ? 'bg-rose-600 text-white animate-pulse ring-2 ring-rose-400'
                : 'bg-white text-stone-800 border border-stone-300 hover:bg-stone-50 hover:border-stone-400 shadow-xs'
            }`}
            title={t.voiceInput}
          >
            {isListening ? (
              <>
                <MicOff className="w-4 h-4 text-white" />
                <span>{t.stopListening}</span>
              </>
            ) : (
              <>
                <Mic className="w-4 h-4 text-amber-600" />
                <span>{t.voiceInput}</span>
              </>
            )}
          </button>

          {/* Example prompt hint */}
          {!isListening && !transcript && (
            <span className="hidden lg:inline-block text-xs text-stone-500">
              💡 {lang === 'hi' ? 'बोलें: "दूध 99 रुपये" या "ऑटो 60 रुपये"' : 'Speak: "Milk 99 rupees" or "Auto 60"'}
            </span>
          )}
        </div>

        {/* Right Side: 1-Tap Quick Action Presets */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Milk */}
          <button
            onClick={handleQuickAddMilk}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-amber-50 text-amber-900 border border-amber-200/80 rounded-lg hover:bg-amber-100 transition-colors shadow-xs"
            title={`${selectedDate} को 1.5 लीटर दूध जोड़ें`}
          >
            <span>🥛 +1.5L दूध (₹{Math.round((milkCategory?.defaultRate || 66) * 1.5)})</span>
          </button>

          {/* Quick Sabzi */}
          <button
            onClick={handleQuickAddVeg}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-emerald-50 text-emerald-900 border border-emerald-200/80 rounded-lg hover:bg-emerald-100 transition-colors shadow-xs"
            title={`${selectedDate} को सब्ज़ी खर्च जोड़ें`}
          >
            <span>🥦 +सब्ज़ी (₹{vegCategory?.defaultRate || 150})</span>
          </button>

          {/* Quick Auto / Gaadi */}
          <button
            onClick={handleQuickAddAuto}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-sky-50 text-sky-900 border border-sky-200/80 rounded-lg hover:bg-sky-100 transition-colors shadow-xs"
            title={`${selectedDate} को गाड़ी/ऑटो खर्च जोड़ें`}
          >
            <span>🚖 +{autoCategory?.nameHi || 'गाड़ी'} (₹{autoCategory?.defaultRate || 70})</span>
          </button>

          {/* Quick Kirana Preset */}
          <button
            onClick={() => {
              const cat = categories.find((c) => c.id === 'kirana');
              onAddExpense({
                date: selectedDate,
                categoryId: 'kirana',
                categoryName: cat?.nameHi || 'किराना व राशन',
                amount: 500,
                quantity: 1,
                unit: 'बिल',
                rate: 500,
                recipient: cat?.defaultRecipient || 'शर्मा जी किराना स्टोर',
                paymentMode: 'UPI',
                notes: 'दैनिक किराना व राशन',
              });
            }}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-indigo-50 text-indigo-900 border border-indigo-200/80 rounded-lg hover:bg-indigo-100 transition-colors shadow-xs"
            title={`${selectedDate} को किराना खर्च जोड़ें`}
          >
            <span>🛒 +किराना (₹500)</span>
          </button>

          {/* Full Add Modal */}
          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1 px-3.5 py-1.5 text-xs font-semibold bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t.addExpense}</span>
          </button>
        </div>
      </div>

      {/* Voice Recognition Live Overlay Strip */}
      {(isListening || transcript || voiceError) && (
        <div className="max-w-7xl mx-auto mt-2.5 p-3 bg-white border border-stone-300 rounded-xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-2.5 text-xs sm:text-sm">
            <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <Volume2 className="w-4 h-4 animate-bounce" />
            </div>
            <div>
              {voiceError ? (
                <span className="text-rose-600 font-medium">{voiceError}</span>
              ) : transcript ? (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-stone-600 font-medium italic">"{transcript}"</span>
                  {parsedResult && parsedResult.amount && (
                    <span className="bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded text-xs flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-emerald-600" />
                      {parsedResult.categoryName || 'खर्च'}: ₹{parsedResult.amount}
                      {parsedResult.recipient && ` (${parsedResult.recipient})`}
                    </span>
                  )}
                </div>
              ) : (
                <span className="text-stone-500 font-medium">{t.listening}</span>
              )}
            </div>
          </div>

          {parsedResult && parsedResult.amount && (
            <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
              <button
                onClick={handleApplyVoiceResult}
                className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-xs transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
                <span>जोड़ें (₹{parsedResult.amount})</span>
              </button>
              <button
                onClick={() => {
                  setTranscript('');
                  setParsedResult(null);
                }}
                className="px-2.5 py-1 text-xs font-medium text-stone-500 hover:text-stone-800"
              >
                रद्द करें
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
