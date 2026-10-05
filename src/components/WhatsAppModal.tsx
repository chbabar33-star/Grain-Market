/**
 * Mandi ERP - WhatsApp Free Integration (Point 22)
 * Instant bilingual slip dispatch, Daily 8 PM Closing Stock to Owner, P&L Summary, and Direct wa.me integration
 */

import React, { useState } from 'react';
import {
  MessageSquare,
  Send,
  X,
  Copy,
  Check,
  Smartphone,
  ExternalLink,
  Clock
} from 'lucide-react';
import { Voucher } from '../types';
import { useMandi } from '../context/MandiContext';
import { formatPKR } from '../utils/numberToWords';

interface WhatsAppModalProps {
  voucher: Voucher;
  onClose: () => void;
}

export const WhatsAppModal: React.FC<WhatsAppModalProps> = ({
  voucher,
  onClose
}) => {
  const { currentBusiness } = useMandi();
  const [copied, setCopied] = useState(false);

  // Clean phone number: remove non-digits, ensure country code 92
  const rawPhone = voucher.partyWhatsapp || voucher.partyPhone || '+92 300 1234567';
  const cleanPhone = rawPhone.replace(/[^0-9]/g, '');
  const finalPhone = cleanPhone.startsWith('92') ? cleanPhone : cleanPhone.startsWith('0') ? '92' + cleanPhone.slice(1) : '92' + cleanPhone;

  // Bilingual Template (Locked Point 22-A)
  const messageBody = `السلام علیکم ${voucher.partyName} بھائی،
آپ کی منڈی پرچی تیار ہے۔
سلپ نمبر: [${voucher.voucherNo}]
جنس: [${voucher.itemName} - ${voucher.itemNameUrdu}]
وزن: [${voucher.firstWeight.toLocaleString()} KG (${voucher.bags} بوریاں)]
کل رقم: [${formatPKR(voucher.totalAmount)}]
از: [${currentBusiness.name} - ${currentBusiness.nameUrdu}]
فون: ${currentBusiness.phone}

شکریہ!
Grain Market ERP Mandi Slip`;

  const encodedUrl = `https://wa.me/${finalPhone}?text=${encodeURIComponent(messageBody)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(messageBody);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenWhatsApp = () => {
    window.open(encodedUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
        
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
              <MessageSquare className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Send Slip to WhatsApp (واٹس ایپ پرچی)
              </h2>
              <div className="text-xs text-slate-500 font-urdu">
                مفت بغیر کسی فیس کے براہِ راست پارٹی کو پرچی بھیجیں
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* RECIPIENT INFO */}
        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs flex justify-between items-center">
          <div>
            <div className="text-slate-400 text-[10px] uppercase font-bold">Party Name</div>
            <div className="font-bold text-slate-900">{voucher.partyName}</div>
            <div className="font-urdu text-slate-600">{voucher.partyNameUrdu}</div>
          </div>
          <div className="text-right">
            <div className="text-slate-400 text-[10px] uppercase font-bold">WhatsApp Number</div>
            <div className="font-mono font-bold text-emerald-800 text-sm">+{finalPhone}</div>
          </div>
        </div>

        {/* MESSAGE PREVIEW (LOCKED POINT 22) */}
        <div className="space-y-1">
          <label className="block text-xs font-bold text-slate-700">
            Formatted Bilingual Mandi Slip Preview:
          </label>
          <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-200 font-urdu text-xs text-slate-800 whitespace-pre-line leading-relaxed">
            {messageBody}
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied!' : 'Copy Text (کاپی کریں)'}</span>
          </button>

          <button
            onClick={handleOpenWhatsApp}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition-colors"
          >
            <Send className="w-4 h-4" />
            <span>Open WhatsApp & Send</span>
          </button>
        </div>

      </div>
    </div>
  );
};
