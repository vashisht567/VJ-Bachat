import React from 'react';
import { UserProfile } from '../types/hisaab';
import { Language, translations } from '../utils/translations';
import { Calendar, ReceiptText, SlidersHorizontal, Languages, HandCoins, Settings, Smartphone, User } from 'lucide-react';

interface HeaderProps {
  currentMonth: string; // YYYY-MM
  onMonthChange: (month: string) => void;
  lang: Language;
  onToggleLang: () => void;
  activeTab: 'calendar' | 'bill' | 'transactions' | 'categories' | 'udhar';
  onSelectTab: (tab: 'calendar' | 'bill' | 'transactions' | 'categories' | 'udhar') => void;
  onOpenCategories: () => void;
  onOpenBill: () => void;
  onOpenUdhar: () => void;
  onOpenSettings: () => void;
  onOpenInstall: () => void;
  onOpenLogin: () => void;
  currentUser?: UserProfile;
  salaryCycleDay?: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentMonth,
  onMonthChange,
  lang,
  onToggleLang,
  activeTab,
  onSelectTab,
  onOpenCategories,
  onOpenBill,
  onOpenUdhar,
  onOpenSettings,
  onOpenInstall,
  onOpenLogin,
  currentUser,
  salaryCycleDay = 10,
}) => {
  const t = translations[lang];

  return (
    <header className="sticky top-0 z-30 bg-stone-900 text-stone-100 border-b border-stone-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Brand Wordmark with User's Uploaded Piggy Bank Logo */}
          <div className="flex items-center gap-2.5 shrink-0">
            <img
              src="/assets/aistudio/file_000000003a8882088b578c6fc0259415_0adcefd9.png"
              alt="VJ Bachat Logo"
              className="w-10 h-10 rounded-xl object-contain shadow-xs border border-amber-500/30 bg-stone-950"
            />
            <div>
              <span className="text-base sm:text-lg font-black tracking-tight text-white whitespace-nowrap">
                VJ Bachat
              </span>
              <span className="hidden sm:inline-block ml-2 text-[11px] text-amber-400 font-semibold bg-stone-800/90 border border-stone-700 px-1.5 py-0.5 rounded">
                💼 {salaryCycleDay}th सैलरी साइकिल
              </span>
            </div>
          </div>

          {/* Navigation Links / Tabs */}
          <nav className="hidden lg:flex items-center gap-1.5">
            <button
              onClick={() => onSelectTab('calendar')}
              className={`px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'calendar'
                  ? 'bg-amber-500 text-stone-950 shadow-sm'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                <span>{lang === 'hi' ? 'कैलेंडर हिसाब' : 'Calendar'}</span>
              </span>
            </button>

            <button
              onClick={() => {
                onSelectTab('bill');
                onOpenBill();
              }}
              className={`px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'bill'
                  ? 'bg-amber-500 text-stone-950 shadow-sm'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <ReceiptText className="w-4 h-4" />
                <span>{lang === 'hi' ? 'महीने का बिल' : 'Monthly Bill'}</span>
              </span>
            </button>

            <button
              onClick={onOpenUdhar}
              className="px-3 py-1.5 text-xs sm:text-sm font-semibold text-rose-300 hover:text-white hover:bg-stone-800 rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5"
            >
              <HandCoins className="w-4 h-4 text-rose-400" />
              <span>{lang === 'hi' ? 'उधार खाता' : 'Udhar Khata'}</span>
            </button>

            <button
              onClick={() => onSelectTab('transactions')}
              className={`px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'transactions'
                  ? 'bg-amber-500 text-stone-950 shadow-sm'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800'
              }`}
            >
              {lang === 'hi' ? 'सभी लेन-देन' : 'All Entries'}
            </button>

            <button
              onClick={() => {
                onSelectTab('categories');
                onOpenCategories();
              }}
              className={`px-3 py-1.5 text-xs sm:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap ${
                activeTab === 'categories'
                  ? 'bg-amber-500 text-stone-950 shadow-sm'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <SlidersHorizontal className="w-4 h-4" />
                <span>{lang === 'hi' ? 'खर्च के नाम' : 'Custom Heads'}</span>
              </span>
            </button>
          </nav>

          {/* Right Controls: User ID / Login, Settings, Install App, Month & Lang */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* User Profile / Login Switcher Button */}
            <button
              onClick={onOpenLogin}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg shadow-xs transition-colors"
              title="यूजर बदलें / लॉगिन करें"
            >
              <div className="w-5 h-5 rounded-full bg-amber-500 text-stone-950 flex items-center justify-center text-[10px] font-black">
                {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <span className="max-w-[80px] sm:max-w-[110px] truncate">
                {currentUser?.name || 'लॉगिन'}
              </span>
            </button>

            {/* Install APK / Mobile App button */}
            <button
              onClick={onOpenInstall}
              className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-lg shadow-xs transition-colors"
              title="फ़ोन में App इंस्टॉल करें (APK / PWA)"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>App इंस्टॉल</span>
            </button>

            {/* Settings button */}
            <button
              onClick={onOpenSettings}
              className="p-1.5 text-stone-300 hover:text-white bg-stone-800 hover:bg-stone-700 rounded-lg border border-stone-700 transition-colors"
              title="सैलरी साइकिल व दूध सेटिंग्स"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Month Picker dropdown */}
            <input
              type="month"
              value={currentMonth}
              onChange={(e) => e.target.value && onMonthChange(e.target.value)}
              className="bg-stone-800 border border-stone-700 text-stone-100 text-xs sm:text-sm rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer"
              title="महीना चुनें"
            />

            {/* Language Switcher */}
            <button
              onClick={onToggleLang}
              className="flex items-center gap-1 px-2 py-1.5 text-xs font-medium rounded-lg border border-stone-700 bg-stone-800 hover:bg-stone-700 text-stone-200 transition-colors"
            >
              <Languages className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">{lang === 'hi' ? 'EN' : 'हिंदी'}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
