import React, { useState } from 'react';
import { Category } from '../types/hisaab';
import { Language, translations } from '../utils/translations';
import { X, Plus, Edit2, Trash2, Check, RefreshCw } from 'lucide-react';

interface CategoryManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onSaveCategories: (categories: Category[]) => void;
  lang: Language;
}

export const CategoryManagerModal: React.FC<CategoryManagerModalProps> = ({
  isOpen,
  onClose,
  categories,
  onSaveCategories,
  lang,
}) => {
  const t = translations[lang];

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNameHi, setEditNameHi] = useState('');
  const [editNameEn, setEditNameEn] = useState('');
  const [editUnit, setEditUnit] = useState('');
  const [editRate, setEditRate] = useState<number | ''>('');
  const [editRecipient, setEditRecipient] = useState('');

  // New category form
  const [showAddForm, setShowAddForm] = useState(false);
  const [newNameHi, setNewNameHi] = useState('');
  const [newNameEn, setNewNameEn] = useState('');
  const [newUnit, setNewUnit] = useState('');
  const [newRate, setNewRate] = useState<number | ''>('');
  const [newRecipient, setNewRecipient] = useState('');

  if (!isOpen) return null;

  const handleStartEdit = (cat: Category) => {
    setEditingId(cat.id);
    setEditNameHi(cat.nameHi);
    setEditNameEn(cat.name);
    setEditUnit(cat.unit || '');
    setEditRate(cat.defaultRate || '');
    setEditRecipient(cat.defaultRecipient || '');
  };

  const handleSaveEdit = (catId: string) => {
    const updated = categories.map((cat) => {
      if (cat.id === catId) {
        return {
          ...cat,
          nameHi: editNameHi.trim() || cat.nameHi,
          name: editNameEn.trim() || cat.name,
          unit: editUnit.trim() || undefined,
          defaultRate: editRate === '' ? undefined : Number(editRate),
          defaultRecipient: editRecipient.trim() || undefined,
        };
      }
      return cat;
    });
    onSaveCategories(updated);
    setEditingId(null);
  };

  const handleDelete = (catId: string) => {
    if (categories.length <= 1) return;
    const updated = categories.filter((c) => c.id !== catId);
    onSaveCategories(updated);
  };

  const handleAddNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNameHi.trim() && !newNameEn.trim()) return;

    const newId = `custom_${Date.now()}`;
    const newCat: Category = {
      id: newId,
      nameHi: newNameHi.trim() || newNameEn.trim(),
      name: newNameEn.trim() || newNameHi.trim(),
      icon: 'Tag',
      color: 'stone',
      unit: newUnit.trim() || undefined,
      defaultRate: newRate === '' ? undefined : Number(newRate),
      defaultRecipient: newRecipient.trim() || undefined,
      isCustom: true,
    };

    onSaveCategories([...categories, newCat]);
    setNewNameHi('');
    setNewNameEn('');
    setNewUnit('');
    setNewRate('');
    setNewRecipient('');
    setShowAddForm(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 flex items-center justify-between bg-stone-50 rounded-t-2xl">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-stone-900">
              {lang === 'hi' ? 'खर्च के नाम व श्रेणियां बदलें' : 'Customize Expense Heads'}
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              {lang === 'hi'
                ? 'अपनी सुविधानुसार ऑटो को गाड़ी/कार, या दूध को डेयरी का नाम दें'
                : 'Rename Auto to Car/Petrol or customize your milk/dairy names'}
            </p>
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
          {/* Quick instructions pill */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
            💡 <span className="font-semibold">{lang === 'hi' ? 'सुझाव:' : 'Tip:'}</span>{' '}
            {lang === 'hi'
              ? 'आप किसी भी खर्च का नाम बदल सकते हैं (जैसे: ऑटो की जगह "मेरी कार / पेट्रोल" या "बाइक", दूध की जगह "डेयरी दूध")।'
              : 'You can rename Auto to "My Car / Petrol" or customize milk vendor to match your exact home setup.'}
          </div>

          {/* List of Categories */}
          <div className="space-y-3">
            {categories.map((cat) => {
              const isEditing = editingId === cat.id;

              return (
                <div
                  key={cat.id}
                  className="p-3.5 border border-stone-200 rounded-xl bg-stone-50/70 hover:bg-white hover:border-stone-300 transition-all"
                >
                  {isEditing ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        <div>
                          <label className="text-[11px] font-semibold text-stone-600 block mb-1">
                            नाम (हिंदी / Hinglish)
                          </label>
                          <input
                            type="text"
                            value={editNameHi}
                            onChange={(e) => setEditNameHi(e.target.value)}
                            className="w-full text-xs sm:text-sm p-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                            placeholder="जैसे: मेरी गाड़ी / पेट्रोल"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-stone-600 block mb-1">
                            Name (English)
                          </label>
                          <input
                            type="text"
                            value={editNameEn}
                            onChange={(e) => setEditNameEn(e.target.value)}
                            className="w-full text-xs sm:text-sm p-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                            placeholder="e.g. Car / Petrol"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        <div>
                          <label className="text-[11px] font-semibold text-stone-600 block mb-1">
                            इकाई (Unit)
                          </label>
                          <input
                            type="text"
                            value={editUnit}
                            onChange={(e) => setEditUnit(e.target.value)}
                            className="w-full text-xs sm:text-sm p-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                            placeholder="लीटर / चक्कर / बिल"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-stone-600 block mb-1">
                            रोज़ाना की दर (₹ Rate)
                          </label>
                          <input
                            type="number"
                            value={editRate}
                            onChange={(e) => setEditRate(e.target.value === '' ? '' : Number(e.target.value))}
                            className="w-full text-xs sm:text-sm p-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                            placeholder="₹ दर"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-stone-600 block mb-1">
                            दुकानदार / किसको दिए
                          </label>
                          <input
                            type="text"
                            value={editRecipient}
                            onChange={(e) => setEditRecipient(e.target.value)}
                            className="w-full text-xs sm:text-sm p-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                            placeholder="जैसे: पेट्रोल पंप"
                          />
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="px-3 py-1.5 text-xs font-medium text-stone-600 hover:bg-stone-200 rounded-lg"
                        >
                          {t.cancel}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(cat.id)}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-xs"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>सुरक्षित करें</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-stone-900 text-sm">
                            {cat.nameHi}
                          </span>
                          <span className="text-xs text-stone-400">({cat.name})</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500 mt-1">
                          {cat.unit && <span>इकाई: {cat.unit}</span>}
                          {cat.defaultRate && <span>दर: ₹{cat.defaultRate}</span>}
                          {cat.defaultRecipient && <span>दुकानदार: {cat.defaultRecipient}</span>}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => handleStartEdit(cat)}
                          className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg transition-colors border border-stone-300"
                        >
                          <Edit2 className="w-3 h-3 text-stone-600" />
                          <span>{t.edit}</span>
                        </button>

                        {cat.isCustom && (
                          <button
                            onClick={() => handleDelete(cat.id)}
                            className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title={t.delete}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Add New Category Section */}
          {showAddForm ? (
            <form onSubmit={handleAddNew} className="p-4 border-2 border-dashed border-amber-300 rounded-xl bg-amber-50/40 space-y-3">
              <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wide">
                नया खर्च वर्ग जोड़ें (Create New Head)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-semibold text-stone-600 block mb-1">
                    नाम (हिंदी) *
                  </label>
                  <input
                    type="text"
                    required
                    value={newNameHi}
                    onChange={(e) => setNewNameHi(e.target.value)}
                    placeholder="जैसे: बच्चों की ट्यूशन फीस"
                    className="w-full text-xs p-2 border border-stone-300 rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-stone-600 block mb-1">
                    Name (English)
                  </label>
                  <input
                    type="text"
                    value={newNameEn}
                    onChange={(e) => setNewNameEn(e.target.value)}
                    placeholder="e.g. Tuition Fees"
                    className="w-full text-xs p-2 border border-stone-300 rounded-lg bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="text-[11px] font-semibold text-stone-600 block mb-1">
                    इकाई (Unit)
                  </label>
                  <input
                    type="text"
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    placeholder="महीना / क्लास / बिल"
                    className="w-full text-xs p-2 border border-stone-300 rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-stone-600 block mb-1">
                    दर / तय रकम (₹)
                  </label>
                  <input
                    type="number"
                    value={newRate}
                    onChange={(e) => setNewRate(e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder="₹ 1500"
                    className="w-full text-xs p-2 border border-stone-300 rounded-lg bg-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-stone-600 block mb-1">
                    दुकानदार / प्राप्तकर्ता
                  </label>
                  <input
                    type="text"
                    value={newRecipient}
                    onChange={(e) => setNewRecipient(e.target.value)}
                    placeholder="सर / कोचिंग"
                    className="w-full text-xs p-2 border border-stone-300 rounded-lg bg-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3 py-1.5 text-xs text-stone-600 hover:bg-stone-200 rounded-lg"
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  className="px-3.5 py-1.5 text-xs font-semibold bg-stone-900 text-white rounded-lg hover:bg-stone-800"
                >
                  जोड़ें
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full py-2.5 border-2 border-dashed border-stone-300 hover:border-amber-400 rounded-xl text-stone-700 hover:text-amber-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>{t.addCategory}</span>
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-200 bg-stone-50 rounded-b-2xl flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs sm:text-sm font-semibold bg-stone-900 text-white rounded-xl hover:bg-stone-800 transition-colors"
          >
            पूर्ण (Done)
          </button>
        </div>
      </div>
    </div>
  );
};
