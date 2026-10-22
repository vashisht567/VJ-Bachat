import React, { useState } from 'react';
import { UserProfile } from '../types/hisaab';
import { getSavedUsers, saveUserProfile, deleteUserProfile } from '../utils/storage';
import { signInWithGoogle, signOutUser, auth } from '../utils/firebase';
import { Language } from '../utils/translations';
import { X, User, Plus, Check, ShieldCheck, LogOut, ArrowRight, Sparkles } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onSelectUser: (user: UserProfile) => void;
  lang: Language;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSelectUser,
  lang,
}) => {
  const [users, setUsers] = useState<UserProfile[]>(() => getSavedUsers());
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Form states for new user
  const [name, setName] = useState('');
  const [phoneOrEmail, setPhoneOrEmail] = useState('');
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSwitchUser = (selected: UserProfile) => {
    onSelectUser(selected);
    onClose();
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleLoading(true);
      setErrorMsg(null);
      const fbUser = await signInWithGoogle();
      if (fbUser) {
        const gUser: UserProfile = {
          id: fbUser.uid,
          name: fbUser.displayName || 'Google Account',
          phoneOrEmail: fbUser.email || undefined,
          role: 'owner',
          createdAt: Date.now(),
        };
        saveUserProfile(gUser);
        const updated = getSavedUsers();
        setUsers(updated);
        onSelectUser(gUser);
        onClose();
      }
    } catch (err: any) {
      console.warn('Google sign in error:', err);
      // Fallback friendly message
      setErrorMsg('Google Sign-in विंडो बंद हो गई या रद्द की गई। आप नीचे दिए गए आईडी विकल्प से भी लॉगिन कर सकते हैं।');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleCreateNewUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('कृपया अपना नाम दर्ज करें');
      return;
    }

    const cleanName = name.trim();
    const cleanId = `user_${Date.now()}`;
    const newUser: UserProfile = {
      id: cleanId,
      name: cleanName,
      phoneOrEmail: phoneOrEmail.trim() || undefined,
      pin: pin.trim() || '1234',
      role: 'member',
      createdAt: Date.now(),
    };

    saveUserProfile(newUser);
    const updatedList = getSavedUsers();
    setUsers(updatedList);
    onSelectUser(newUser);
    setName('');
    setPhoneOrEmail('');
    setPin('');
    setIsAddingNew(false);
    onClose();
  };

  const handleDeleteUser = (userId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (users.length <= 1) {
      setErrorMsg('कम से कम एक खाता होना आवश्यक है');
      return;
    }
    deleteUserProfile(userId);
    const updated = getSavedUsers();
    setUsers(updated);
    if (currentUser.id === userId) {
      onSelectUser(updated[0]);
    }
  };

  const handleLogout = async () => {
    try {
      await signOutUser();
    } catch (e) {
      // Ignore
    }
    const all = getSavedUsers();
    const defaultOne = all.find((u) => u.id === 'vj_owner') || all[0];
    onSelectUser(defaultOne);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/65 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-stone-200 shadow-2xl w-full max-w-md max-h-[92vh] flex flex-col my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Header with VJ Bachat Piggy Bank Logo */}
        <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <img
              src="/assets/aistudio/file_000000003a8882088b578c6fc0259415_0adcefd9.png"
              alt="VJ Bachat Logo"
              className="w-10 h-10 rounded-xl object-contain shadow-xs border border-stone-200"
            />
            <div>
              <h3 className="text-base sm:text-lg font-black text-stone-900 tracking-tight">
                VJ Bachat - यूजर लॉगिन
              </h3>
              <p className="text-xs text-stone-500">
                प्रत्येक यूजर का अपना अलग और सुरक्षित हिसाब खाता
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
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto">
          {/* Active User Highlight */}
          <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-amber-500 text-stone-950 font-bold flex items-center justify-center text-sm shadow-xs">
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <span className="text-[11px] font-semibold text-amber-800 uppercase tracking-wide block">
                  वर्तमान सक्रिय खाता (Active User)
                </span>
                <span className="text-sm font-extrabold text-stone-900">
                  {currentUser.name}
                </span>
                {currentUser.phoneOrEmail && (
                  <span className="text-[11px] text-stone-500 block">
                    {currentUser.phoneOrEmail}
                  </span>
                )}
              </div>
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
              <ShieldCheck className="w-3.5 h-3.5" />
              लॉगिन है
            </span>
          </div>

          {/* 1-Tap Google Sign-In Option */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading}
            className="w-full py-2.5 px-3 bg-white hover:bg-stone-50 border border-stone-300 hover:border-stone-400 text-stone-800 font-bold rounded-xl text-xs sm:text-sm shadow-xs transition-all flex items-center justify-center gap-2.5"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{isGoogleLoading ? 'लॉगिन हो रहा है...' : 'Google खाते से लॉगिन करें'}</span>
          </button>

          {errorMsg && (
            <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 font-medium">
              {errorMsg}
            </div>
          )}

          {/* List of Registered Accounts on this device */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between text-xs font-bold text-stone-700 px-1">
              <span>डिवाइस में मौजूद खाते ({users.length}):</span>
              {!isAddingNew && (
                <button
                  onClick={() => setIsAddingNew(true)}
                  className="text-amber-700 hover:text-amber-800 flex items-center gap-1 text-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ नया खाता जोड़ें</span>
                </button>
              )}
            </div>

            <div className="space-y-1.5 max-h-56 overflow-y-auto">
              {users.map((u) => {
                const isActive = u.id === currentUser.id;
                return (
                  <div
                    key={u.id}
                    onClick={() => handleSwitchUser(u)}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      isActive
                        ? 'bg-stone-900 text-white border-stone-900 shadow-sm'
                        : 'bg-white hover:bg-stone-50 border-stone-200 text-stone-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                          isActive
                            ? 'bg-amber-400 text-stone-950'
                            : 'bg-stone-100 text-stone-700 border border-stone-200'
                        }`}
                      >
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs sm:text-sm font-bold">
                            {u.name}
                          </span>
                          {u.id === 'vj_owner' && (
                            <span className="text-[10px] bg-amber-500/20 text-amber-600 px-1.5 py-0.2 rounded font-semibold">
                              मुख्य
                            </span>
                          )}
                        </div>
                        <span className={`text-[11px] ${isActive ? 'text-stone-300' : 'text-stone-500'}`}>
                          {u.phoneOrEmail || `ID: ${u.id.slice(-6)}`}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isActive ? (
                        <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                          <Check className="w-4 h-4" />
                          सक्रिय
                        </span>
                      ) : (
                        <button
                          type="button"
                          className="text-xs font-semibold px-2.5 py-1 bg-stone-100 hover:bg-stone-200 rounded-lg text-stone-700 flex items-center gap-1"
                        >
                          <span>लॉगिन करें</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* New User Account Form */}
          {isAddingNew && (
            <form
              onSubmit={handleCreateNewUser}
              className="p-3.5 bg-stone-50 border border-stone-200 rounded-xl space-y-3 animate-in fade-in"
            >
              <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                <span className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-amber-600" />
                  नया खाता (New User ID)
                </span>
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="text-stone-400 hover:text-stone-600 text-xs"
                >
                  रद्द करें
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  यूजर का नाम (Full Name) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="उदा. रमेश जोशी, भाई, दुकान"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setErrorMsg(null);
                  }}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    मोबाइल / ईमेल (वैकल्पिक)
                  </label>
                  <input
                    type="text"
                    placeholder="मोबाइल या ईमेल"
                    value={phoneOrEmail}
                    onChange={(e) => setPhoneOrEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    4-अंकों का पिन (वैकल्पिक)
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    placeholder="1234"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold rounded-lg text-xs shadow-xs transition-colors"
              >
                ✓ नया खाता बनाएं व लॉगिन करें
              </button>
            </form>
          )}

          {/* Privacy Guarantee Note */}
          <div className="p-3 bg-stone-100 rounded-xl text-[11px] text-stone-600 space-y-1">
            <span className="font-bold text-stone-800 block">
              🔒 100% डेटा प्राइवेसी और अलगाव:
            </span>
            <p>
              एक यूजर का दर्ज किया गया कोई भी खर्च, दूध का हिसाब या उधार किसी दूसरे यूजर के खाते में कभी नहीं दिखेगा।
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200 bg-stone-50 rounded-b-2xl flex items-center justify-between">
          <button
            onClick={handleLogout}
            className="text-xs font-semibold text-stone-500 hover:text-stone-800 flex items-center gap-1 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>लॉगआउट</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs sm:text-sm font-semibold bg-stone-900 text-white rounded-xl hover:bg-stone-800 transition-colors"
          >
            बंद करें (Done)
          </button>
        </div>
      </div>
    </div>
  );
};
