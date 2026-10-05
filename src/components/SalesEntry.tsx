/**
 * Mandi ERP - Sales Entry Screen (Points 4, 6, 9, 25)
 * Strict Weighbridge System:
 * - Gross Weight, Tare Weight -> First Weight = Gross - Tare
 * - Bags Count
 * - Rate / 40KG -> Sales Value = (First Weight / 40) * Rate
 * - Sales Expenses (Loading, Palai)
 * - Fixed Bottom Action Bar with Big Colorful Bilingual Buttons & Live Totals!
 */

import React, { useState, useMemo } from 'react';
import {
  Scale,
  DollarSign,
  Plus,
  Trash2,
  Save,
  Printer,
  MessageSquare,
  RotateCcw,
  X,
  FileCheck,
  TrendingUp,
  Package
} from 'lucide-react';
import { useMandi } from '../context/MandiContext';
import { Voucher, VoucherExpenseItem, DocumentAttachment } from '../types';
import { formatPKR, numberToWordsEnglish, numberToWordsUrdu } from '../utils/numberToWords';
import { DocumentAttachmentsManager } from './DocumentAttachmentsManager';


interface SalesEntryProps {
  onSuccess: (voucher: Voucher) => void;
  onClose: () => void;
  onPrintRequested: (voucher: Voucher, design: 'a4-standard' | 'thermal-80mm') => void;
  onWhatsAppRequested: (voucher: Voucher) => void;
}

export const SalesEntry: React.FC<SalesEntryProps> = ({
  onSuccess,
  onClose,
  onPrintRequested,
  onWhatsAppRequested
}) => {
  const {
    currentBusiness,
    items,
    parties,
    godowns,
    expenses,
    bardanaMasters,
    addVoucher,
    stockSummary
  } = useMandi();

  const [voucherNo, setVoucherNo] = useState(`SAL-${Math.floor(1000 + Math.random() * 9000)}`);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  const [partyId, setPartyId] = useState(parties[1]?.id || parties[0]?.id || '');
  const [itemId, setItemId] = useState(items[0]?.id || '');
  const [godownId, setGodownId] = useState(godowns[0]?.id || '');
  const [bardanaId, setBardanaId] = useState(bardanaMasters[0]?.id || 'bard-1');
  const [vehicleNo, setVehicleNo] = useState('');
  const [biltyNo, setBiltyNo] = useState('');
  const [remarks, setRemarks] = useState('');

  // Weighbridge Inputs
  const [grossWeight, setGrossWeight] = useState<number>(12000);
  const [tareWeight, setTareWeight] = useState<number>(4000);
  const [bardanaKg, setBardanaKg] = useState<number>(80);
  const [moistureKg, setMoistureKg] = useState<number>(0);
  const [otherDeductionsKg, setOtherDeductionsKg] = useState<number>(0);
  const [bags, setBags] = useState<number>(160);
  const [ratePer40Kg, setRatePer40Kg] = useState<number>(4200);

  // Sales Expenses List
  const [voucherExpenses, setVoucherExpenses] = useState<VoucherExpenseItem[]>([
    {
      expenseId: 'exp-loading',
      name: 'Loading Labour / Palai',
      nameUrdu: 'پلائی لوڈنگ مزدوری',
      amount: 4000,
      type: 'Direct'
    }
  ]);

  // Document Attachments (Sales Bill, Weight Slip, Expenses Bill, Gate Pass)
  const [attachments, setAttachments] = useState<DocumentAttachment[]>([]);

  // LIVE CALCULATIONS

  const firstWeight = useMemo(() => {
    return Math.max(0, grossWeight - tareWeight);
  }, [grossWeight, tareWeight]);

  const netWeight = useMemo(() => {
    return Math.max(0, firstWeight - (bardanaKg + moistureKg + otherDeductionsKg));
  }, [firstWeight, bardanaKg, moistureKg, otherDeductionsKg]);

  // STRICT MANDI FORMULA:
  // 1. Sales Value = (Net Weight / 40) * Rate per 40-kg
  const baseAmount = useMemo(() => {
    if (netWeight <= 0 || ratePer40Kg <= 0) return 0;
    return (netWeight / 40) * ratePer40Kg;
  }, [netWeight, ratePer40Kg]);

  const totalExpenses = useMemo(() => {
    return voucherExpenses.reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);
  }, [voucherExpenses]);

  // Total invoice billing amount
  const totalAmount = useMemo(() => {
    return baseAmount + totalExpenses;
  }, [baseAmount, totalExpenses]);

  // 2. Average Sales Cost / Rate = Sales Value / First Weight * 40
  const salesAvgPer40Kg = useMemo(() => {
    if (firstWeight <= 0) return 0;
    return (baseAmount / firstWeight) * 40;
  }, [baseAmount, firstWeight]);

  // Check available stock
  const currentItemStock = useMemo(() => {
    return stockSummary.find(s => s.itemId === itemId);
  }, [stockSummary, itemId]);

  const handleAddExpense = () => {
    setVoucherExpenses(prev => [
      ...prev,
      {
        expenseId: `custom-exp-${Date.now()}`,
        name: 'Market Tax / Commission',
        nameUrdu: 'مارکیٹ کمیٹی ٹیکس',
        amount: 1500,
        type: 'Direct'
      }
    ]);
  };

  const handleRemoveExpense = (index: number) => {
    setVoucherExpenses(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpdateExpenseAmount = (index: number, val: number) => {
    setVoucherExpenses(prev =>
      prev.map((exp, i) => (i === index ? { ...exp, amount: val } : exp))
    );
  };

  const handleReset = () => {
    setVoucherNo(`SAL-${Math.floor(1000 + Math.random() * 9000)}`);
    setGrossWeight(0);
    setTareWeight(0);
    setBardanaKg(0);
    setMoistureKg(0);
    setOtherDeductionsKg(0);
    setBags(0);
    setRatePer40Kg(4200);
    setVoucherExpenses([]);
    setVehicleNo('');
    setRemarks('');
    setAttachments([]);
  };

  const handleSave = (actionType: 'save' | 'save_print_a4' | 'save_print_thermal' | 'save_whatsapp') => {
    if (firstWeight <= 0) {
      alert('First Weight must be greater than zero! (Gross Weight - Tare Weight)');
      return;
    }
    if (ratePer40Kg <= 0) {
      alert('Please enter a valid selling rate per 40KG.');
      return;
    }

    const selectedPartyObj = parties.find(p => p.id === partyId) || parties[0];
    const selectedItemObj = items.find(i => i.id === itemId) || items[0];
    const selectedGodownObj = godowns.find(g => g.id === godownId) || godowns[0];
    const selectedBardanaObj = bardanaMasters.find(b => b.id === bardanaId) || bardanaMasters[0];

    const newVoucher = addVoucher({
      voucherNo,
      type: 'SALE',
      date,
      time,
      partyId: selectedPartyObj.id,
      partyName: selectedPartyObj.name,
      partyNameUrdu: selectedPartyObj.nameUrdu,
      partyPhone: selectedPartyObj.phone,
      partyWhatsapp: selectedPartyObj.whatsapp,
      itemId: selectedItemObj.id,
      itemName: selectedItemObj.name,
      itemNameUrdu: selectedItemObj.nameUrdu,
      godownId: selectedGodownObj.id,
      godownName: selectedGodownObj.name,
      grossWeight,
      tareWeight,
      firstWeight,
      bardanaKg,
      moistureKg,
      otherDeductionsKg,
      netWeight,
      bags,
      bardanaId: selectedBardanaObj?.id,
      bardanaName: selectedBardanaObj?.name,
      ratePer40Kg,
      baseAmount,
      expenses: voucherExpenses,
      totalExpenses,
      totalAmount,
      avgCostPer40Kg: salesAvgPer40Kg,
      costPer40Kg: salesAvgPer40Kg,
      status: 'Pending', // Pending by default per Point 12
      vehicleNo,
      biltyNo,
      remarks,
      attachments
    });


    onSuccess(newVoucher);

    if (actionType === 'save_print_a4') {
      onPrintRequested(newVoucher, 'a4-standard');
    } else if (actionType === 'save_print_thermal') {
      onPrintRequested(newVoucher, 'thermal-80mm');
    } else if (actionType === 'save_whatsapp') {
      onWhatsAppRequested(newVoucher);
    }
  };

  return (
    <div className="space-y-4 pb-24">
      {/* HEADER BANNER */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
              <TrendingUp className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Sales Entry (فروخت بل و آؤٹ ورڈ گیٹ پاس)
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Record grain dispatch to flour mills, feed mills, or traders with live weighbridge costing.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-xs text-slate-400">Voucher No:</span>
            <div className="font-mono font-bold text-slate-900">{voucherNo}</div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* COLUMN 1: GENERAL INFO */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center justify-between border-b border-slate-100 pb-2">
            <span>Customer & Dispatch Info</span>
            <span className="font-urdu font-normal text-slate-500">خریدار و ترسیل</span>
          </h2>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Date / تاریخ</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Time / وقت</label>
              <input
                type="text"
                value={time}
                onChange={e => setTime(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">Customer / Party (خریدار / مل)</label>
            <select
              value={partyId}
              onChange={e => setPartyId(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-urdu"
            >
              {parties.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.nameUrdu}) - {p.type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">Item to Dispatch (جنس)</label>
            <select
              value={itemId}
              onChange={e => setItemId(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-urdu"
            >
              {items.map(i => (
                <option key={i.id} value={i.id}>
                  {i.name} ({i.nameUrdu})
                </option>
              ))}
            </select>
          </div>

          {/* Current Stock Banner */}
          {currentItemStock && (
            <div className="p-2.5 rounded-lg bg-slate-100 text-xs flex items-center justify-between">
              <span className="text-slate-600">Available Stock:</span>
              <span className="font-mono font-bold text-slate-900">
                {currentItemStock.closingFirstWeight.toLocaleString()} KG ({currentItemStock.closingBags} Bags)
              </span>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">Dispatching Godown (گودام)</label>
            <select
              value={godownId}
              onChange={e => setGodownId(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-urdu"
            >
              {godowns.map(g => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Truck # / گاڑی نمبر</label>
              <input
                type="text"
                placeholder="e.g. TKP-901"
                value={vehicleNo}
                onChange={e => setVehicleNo(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Bilty # / بلٹی نمبر</label>
              <input
                type="text"
                placeholder="e.g. BL-1204"
                value={biltyNo}
                onChange={e => setBiltyNo(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
              />
            </div>
          </div>
        </div>

        {/* COLUMN 2: WEIGHBRIDGE & FIRST WEIGHT */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center justify-between border-b border-slate-100 pb-2">
            <span className="flex items-center gap-1.5 text-emerald-800">
              <Scale className="w-4 h-4" />
              <span>Weighbridge & First Weight</span>
            </span>
            <span className="font-urdu font-normal text-slate-500">وزن کانٹا</span>
          </h2>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-800 mb-1">Gross Wt / مجموعی (KG)</label>
              <input
                type="number"
                value={grossWeight || ''}
                onChange={e => setGrossWeight(Number(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-mono font-bold text-slate-900 focus:bg-white focus:outline-emerald-600"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-800 mb-1">Tare Wt / خالی وزن (KG)</label>
              <input
                type="number"
                value={tareWeight || ''}
                onChange={e => setTareWeight(Number(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-mono font-bold text-slate-900 focus:bg-white focus:outline-emerald-600"
              />
            </div>
          </div>

          {/* First Weight Display Card */}
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                  First Weight = Gross - Tare
                </div>
                <div className="font-urdu text-xs text-emerald-900">پہلا وزن (بلنگ اسی وزن پر)</div>
              </div>
              <div className="text-right">
                <div className="text-lg font-mono font-extrabold text-emerald-950">
                  {firstWeight.toLocaleString()} KG
                </div>
                <div className="text-[11px] font-mono text-emerald-800 font-semibold">
                  {(firstWeight / 40).toFixed(2)} Maunds (من)
                </div>
              </div>
            </div>
          </div>

          {/* Deductions */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            <div>
              <label className="block text-[10px] font-semibold text-slate-600 mb-1">Bardana (KG)</label>
              <input
                type="number"
                value={bardanaKg || ''}
                onChange={e => setBardanaKg(Number(e.target.value) || 0)}
                className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-600 mb-1">Moisture (KG)</label>
              <input
                type="number"
                value={moistureKg || ''}
                onChange={e => setMoistureKg(Number(e.target.value) || 0)}
                className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-[10px] font-semibold text-slate-600 mb-1">Other (KG)</label>
              <input
                type="number"
                value={otherDeductionsKg || ''}
                onChange={e => setOtherDeductionsKg(Number(e.target.value) || 0)}
                className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
              />
            </div>
          </div>

          {/* BARBARA / BARDANA TRACKER (SEPARATE MASTER - STRICT ZERO WEIGHT IMPACT & MINUS IN REGISTER) */}
          <div className="p-3.5 rounded-xl bg-purple-50/80 border border-purple-200 text-purple-950 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-purple-900 border-b border-purple-200 pb-1.5">
              <span className="flex items-center gap-1.5">
                <Package className="w-4 h-4 text-purple-700" />
                <span>Barbara Tracker (Separate Master)</span>
              </span>
              <span className="font-urdu text-[11px] text-purple-800">باردانہ ماسٹر و اخراج (منفی)</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-purple-900 mb-1">
                  Barbara Type / باردانہ قسم
                </label>
                <select
                  value={bardanaId}
                  onChange={e => setBardanaId(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-purple-200 rounded-lg text-xs font-urdu text-purple-950 focus:outline-purple-600 shadow-2xs"
                >
                  {bardanaMasters.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.nameUrdu})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-purple-900 mb-1">
                  No. of Bags Outward / خارج شدہ بوریاں
                </label>
                <input
                  type="number"
                  value={bags || ''}
                  onChange={e => setBags(Number(e.target.value) || 0)}
                  className="w-full px-3 py-1.5 bg-white border border-purple-300 rounded-lg text-sm font-mono font-bold text-purple-950 focus:bg-white focus:outline-purple-600 shadow-2xs"
                  placeholder="0"
                />
              </div>
            </div>

            {/* USER STRICT INSTRUCTION NOTICE */}
            <div className="p-2 rounded-lg bg-white border border-purple-100 text-[11px] text-purple-900 space-y-0.5">
              <div className="font-bold flex items-center gap-1 text-purple-950">
                <span className="inline-block w-2 h-2 rounded-full bg-rose-600"></span>
                <span>Strict Rule: Number of bags going out will MINUS in Barbara register!</span>
              </div>
              <div className="text-[10px] text-purple-700 font-urdu leading-tight">
                خارج شدہ بوریوں کا وزن پر کوئی اثر نہیں ہے۔ یہ باردانہ رجسٹر میں منفی (Minus) ہوں گی۔
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-800 mb-1">Selling Rate / 40KG (ریٹ فی من PKR)</label>
            <input
              type="number"
              value={ratePer40Kg || ''}
              onChange={e => setRatePer40Kg(Number(e.target.value) || 0)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-mono font-bold text-emerald-800 focus:bg-white focus:outline-emerald-600"
            />
          </div>

          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">Sales Value (فروخت مالیت):</span>
              <span className="font-mono font-bold text-slate-900">{formatPKR(baseAmount)}</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              Formula: ({netWeight.toLocaleString()} KG Net Wt / 40) × Rs. {ratePer40Kg}
            </div>
          </div>
        </div>

        {/* COLUMN 3: SALES EXPENSES & INVOICE */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Sales Expenses (فروخت اخراجات)
            </h2>
            <button
              type="button"
              onClick={handleAddExpense}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Expense</span>
            </button>
          </div>

          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
            {voucherExpenses.map((exp, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-slate-800 truncate">{exp.name}</div>
                  <div className="text-[10px] text-slate-400 font-urdu">{exp.nameUrdu}</div>
                </div>
                <div className="w-24">
                  <input
                    type="number"
                    value={exp.amount || ''}
                    onChange={e => handleUpdateExpenseAmount(idx, Number(e.target.value) || 0)}
                    placeholder="Rs."
                    className="w-full px-2 py-1 bg-white border border-slate-200 rounded text-xs font-mono font-bold text-right"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveExpense(idx)}
                  className="text-slate-400 hover:text-rose-600 p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* BILLING SUMMARY */}
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span>Sales Value (on Net Wt):</span>
              <span className="font-mono font-bold">{formatPKR(baseAmount)}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span>Sales Expenses (Billable):</span>
              <span className="font-mono font-bold">{formatPKR(totalExpenses)}</span>
            </div>
            <div className="border-t border-emerald-200/80 pt-1.5 flex items-center justify-between">
              <span className="font-bold text-xs uppercase">Net Invoice Total / کل رقم:</span>
              <span className="font-mono text-base font-extrabold text-emerald-900">
                {formatPKR(totalAmount)}
              </span>
            </div>
            <div className="border-t border-emerald-200/80 pt-1.5 flex items-center justify-between text-xs font-semibold">
              <span className="text-emerald-800">Average Sales Rate / اوسط ریٹ:</span>
              <span className="font-mono text-emerald-900 font-bold">
                Rs. {salesAvgPer40Kg.toFixed(2)} / 40KG
              </span>
            </div>
            <div className="text-[10px] text-emerald-700 font-mono">
              Avg Formula: (Sales Value Rs. {baseAmount.toFixed(0)} / First Wt {firstWeight.toLocaleString()} KG) × 40
            </div>
          </div>

          {/* Amount in words */}
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
            <div className="font-semibold text-slate-500 text-[10px] uppercase">Amount in Words:</div>
            <div className="font-medium text-slate-800">{numberToWordsEnglish(totalAmount)}</div>
            <div className="font-urdu text-emerald-800 text-sm">{numberToWordsUrdu(totalAmount)}</div>
          </div>
        </div>
      </div>

      {/* DOCUMENT ATTACHMENTS (SALES BILL, GATE PASS, WEIGHT SLIP) */}
      <DocumentAttachmentsManager
        attachments={attachments}
        onChange={setAttachments}
        voucherNo={voucherNo}
        voucherType="SALE"
        partyName={parties.find(p => p.id === partyId)?.name || 'Buyer'}
        grossWeight={grossWeight}
        tareWeight={tareWeight}
        totalAmount={totalAmount}
        bags={bags}
        vehicleNo={vehicleNo}
      />

      {/* LOCKED POINT 25: FIXED BOTTOM ACTION BAR */}

      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t-2 border-slate-200 shadow-2xl p-3">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          
          <div className="flex items-center gap-4 text-xs font-mono font-bold">
            <div className="flex items-center gap-1.5 text-slate-700">
              <span className="text-slate-400 font-sans font-normal">First Wt:</span>
              <span className="bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded">
                {firstWeight.toLocaleString()} KG
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-700">
              <span className="text-slate-400 font-sans font-normal">Bags:</span>
              <span className="bg-slate-200 text-slate-900 px-2 py-0.5 rounded">{bags}</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-700">
              <span className="text-slate-400 font-sans font-normal">Sales Amount:</span>
              <span className="bg-emerald-100 text-emerald-900 px-2.5 py-0.5 rounded text-sm">
                {formatPKR(totalAmount)}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleSave('save')}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>محفوظ کریں / Save</span>
            </button>

            <button
              onClick={() => handleSave('save_print_a4')}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Save & Print A4</span>
            </button>

            <button
              onClick={() => handleSave('save_print_thermal')}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
            >
              <FileCheck className="w-4 h-4" />
              <span>Save & Thermal 80mm</span>
            </button>

            <button
              onClick={() => handleSave('save_whatsapp')}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Save & WhatsApp</span>
            </button>

            <button
              onClick={handleReset}
              className="flex items-center gap-1 px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>ری سیٹ / Reset</span>
            </button>

            <button
              onClick={onClose}
              className="flex items-center gap-1 px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              <span>بند کریں / Close</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
