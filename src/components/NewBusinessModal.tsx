/**
 * Mandi ERP - New Business Profile Setup Modal (Point 19)
 * Supports unlimited isolated businesses: NAZAR SOON CORPORATION, Ali Traders, etc.
 */

import React, { useState } from 'react';
import { Building2, X, PlusCircle } from 'lucide-react';
import { useMandi } from '../context/MandiContext';

interface NewBusinessModalProps {
  onClose: () => void;
}

export const NewBusinessModal: React.FC<NewBusinessModalProps> = ({ onClose }) => {
  const { addBusiness } = useMandi();

  const [name, setName] = useState('');
  const [nameUrdu, setNameUrdu] = useState('');
  const [address, setAddress] = useState('');
  const [addressUrdu, setAddressUrdu] = useState('');
  const [phone, setPhone] = useState('');
  const [ntn, setNtn] = useState('');
  const [proprietor, setProprietor] = useState('');
  const [proprietorUrdu, setProprietorUrdu] = useState('');
  const [logoText, setLogoText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addBusiness({
      name,
      nameUrdu: nameUrdu || name,
      address,
      addressUrdu: addressUrdu || address,
      phone,
      ntn,
      proprietor,
      proprietorUrdu: proprietorUrdu || proprietor,
      logoText: logoText || name.slice(0, 3).toUpperCase()
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
              <Building2 className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Register New Mandi Business
              </h2>
              <div className="text-xs text-slate-500 font-urdu">
                نیا غلہ منڈی یا آڑھت ادارہ شامل کریں
              </div>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Business Name (English)
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Ali Traders & Commission"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Urdu Name (اردو نام)
              </label>
              <input
                type="text"
                required
                placeholder="مثال: علی ٹریڈرز اینڈ کمیشن ایجنٹس"
                value={nameUrdu}
                onChange={e => setNameUrdu(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-urdu"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Proprietor / Malak
              </label>
              <input
                type="text"
                placeholder="e.g. Haji Ali Ahmad"
                value={proprietor}
                onChange={e => setProprietor(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Proprietor Urdu (مالک / آڑھتی)
              </label>
              <input
                type="text"
                placeholder="مثال: حاجی علی احمد"
                value={proprietorUrdu}
                onChange={e => setProprietorUrdu(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-urdu"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                placeholder="+92 300 0000000"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                NTN Number
              </label>
              <input
                type="text"
                placeholder="e.g. 4829103-2"
                value={ntn}
                onChange={e => setNtn(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Logo Monogram
              </label>
              <input
                type="text"
                placeholder="e.g. AT"
                maxLength={4}
                value={logoText}
                onChange={e => setLogoText(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold uppercase"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">
              Shop / Yard Address
            </label>
            <input
              type="text"
              placeholder="e.g. Shop # 22, Grain Market Yard"
              value={address}
              onChange={e => setAddress(e.target.value)}
              className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
            >
              Create Business Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
