import React, { useState, useEffect } from 'react';
import { Language } from '../utils/translations';
import { X, Smartphone, Download, CheckCircle, ArrowDownToLine, Share, PlusSquare } from 'lucide-react';

interface InstallAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDownloadBackup: () => void;
  lang: Language;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({
  isOpen,
  onClose,
  onDownloadBackup,
  lang,
}) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if running standalone
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;
    setIsInstalled(isStandalone);

    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const [helperNotice, setHelperNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setDeferredPrompt(null);
      }
    } else {
      setHelperNotice('मोबाइल में ऐप इंस्टॉल करने के लिए नीचे दिए गए स्टेप्स देखें: ब्राउज़र के ऊपर 3 डॉट्स (⋮) दबाएं और "Install app" या "Add to Home Screen" चुनें।');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/65 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-stone-200 shadow-2xl w-full max-w-lg max-h-[92vh] flex flex-col my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50 rounded-t-2xl">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-700 flex items-center justify-center font-bold">
              <Smartphone className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-stone-900">
                फ़ोन में App इंस्टॉल करें (APK / Android App)
              </h3>
              <p className="text-xs text-stone-500">
                सीधे अपने मोबाइल में एक असली ऐप की तरह चलाएं
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
        <div className="p-4 sm:p-6 space-y-4 text-stone-800">
          {/* Main 1-Click Install Button */}
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-center space-y-2.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-stone-950 flex items-center justify-center mx-auto font-bold shadow-sm">
              <ArrowDownToLine className="w-6 h-6" />
            </div>

            <h4 className="text-base font-extrabold text-amber-950">
              घर का हिसाब ऐप इंस्टॉल करें
            </h4>

            <p className="text-xs text-amber-900 max-w-sm mx-auto">
              यह ऐप आपके फ़ोन के होम स्क्रीन पर असली ऐप (APK) की तरह इंस्टॉल हो जाएगी और बिना इंटरनेट के भी पूरा हिसाब रखेगी।
            </p>

            <button
              onClick={handleInstallClick}
              className="w-full py-3 px-4 bg-stone-900 hover:bg-stone-800 text-white font-extrabold rounded-xl shadow-md text-sm transition-all flex items-center justify-center gap-2"
            >
              <Smartphone className="w-4 h-4 text-amber-400" />
              <span>{isInstalled ? '✓ ऐप पहले से इंस्टॉल है' : '📲 अभी मोबाइल में इंस्टॉल करें'}</span>
            </button>

            {helperNotice && (
              <div className="p-2.5 bg-amber-100/80 border border-amber-300 rounded-lg text-xs text-amber-900 font-medium animate-in fade-in">
                {helperNotice}
              </div>
            )}
          </div>

          {/* Android Chrome Instructions */}
          <div className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl space-y-2 text-xs">
            <span className="font-bold text-stone-900 block uppercase tracking-wide">
              📱 एंड्रॉइड मोबाइल में आसान तरीका:
            </span>
            <ol className="list-decimal pl-4 space-y-1.5 text-stone-600 font-medium">
              <li>
                अपने मोबाइल में Chrome ब्राउज़र के सबसे ऊपर दाएँ कोने में <strong>तीन बिंदु (⋮)</strong> दबाएं।
              </li>
              <li>
                मेनू में <strong>"Install app"</strong> या <strong>"Add to Home Screen (होम स्क्रीन में जोड़ें)"</strong> पर क्लिक करें।
              </li>
              <li>
                आपके फ़ोन के मुख्य स्क्रीन पर <strong>"घर का हिसाब"</strong> ऐप का आइकॉन आ जाएगा!
              </li>
            </ol>
          </div>

          {/* Backup Download Button */}
          <div className="pt-2 border-t border-stone-200 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-stone-800 block">
                डाटा बैकअप फाइल (JSON)
              </span>
              <span className="text-[11px] text-stone-500">
                अपने पूरे हिसाब का बैकअप अपने फ़ोन में सेव करें
              </span>
            </div>

            <button
              onClick={onDownloadBackup}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-white border border-stone-300 hover:bg-stone-50 text-stone-800 rounded-xl shadow-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-stone-600" />
              <span>बैकअप डाउनलोड</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200 bg-stone-50 rounded-b-2xl flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs sm:text-sm font-semibold bg-stone-900 text-white rounded-xl hover:bg-stone-800"
          >
            समझ गया (OK)
          </button>
        </div>
      </div>
    </div>
  );
};
