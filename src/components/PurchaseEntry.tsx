/**
 * Mandi ERP - Purchase Entry Screen (Points 1, 2, 3, 4, 17, 25)
 * Strict Weighbridge System:
 * - Gross Weight, Tare Weight -> First Weight = Gross - Tare (Costing Basis)
 * - Deductions: Bardana KG, Moisture KG, Other Deductions KG -> Net Weight = First Weight - Deductions
 * - Bags Count
 * - Rate / 40KG -> Base Amount = (First Weight / 40) * Rate
 * - Expenses List with Allocation
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
  Truck,
  Package
} from 'lucide-react';
import { useMandi } from '../context/MandiContext';
import { Voucher, VoucherExpenseItem, DocumentAttachment } from '../types';
import { formatPKR, formatWeight, numberToWordsEnglish, numberToWordsUrdu } from '../utils/numberToWords';
import { DocumentAttachmentsManager } from './DocumentAttachmentsManager';


interface PurchaseEntryProps {
  onSuccess: (voucher: Voucher) => void;
  onClose: () => void;
  onPrintRequested: (voucher: Voucher, design: 'a4-standard' | 'thermal-80mm') => void;
  onWhatsAppRequested: (voucher: Voucher) => void;
}

export const PurchaseEntry: React.FC<PurchaseEntryProps> = ({
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
    currentUser
  } = useMandi();

  // Basic Details
  const [voucherNo, setVoucherNo] = useState(`PUR-${Math.floor(1000 + Math.random() * 9000)}`);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  const [partyId, setPartyId] = useState(parties[0]?.id || '');
  const [itemId, setItemId] = useState(items[0]?.id || '');
  const [godownId, setGodownId] = useState(godowns[0]?.id || '');
  const [bardanaId, setBardanaId] = useState(bardanaMasters[0]?.id || 'bard-1');
  const [vehicleNo, setVehicleNo] = useState('');
  const [biltyNo, setBiltyNo] = useState('');
  const [remarks, setRemarks] = useState('');

  // Weighbridge & Deductions (Locked System)
  const [grossWeight, setGrossWeight] = useState<number>(14000);
  const [tareWeight, setTareWeight] = useState<number>(4000);
  const [bardanaKg, setBardanaKg] = useState<number>(100);
  const [moistureKg, setMoistureKg] = useState<number>(50);
  const [otherDeductionsKg, setOtherDeductionsKg] = useState<number>(0);
  const [bags, setBags] = useState<number>(200);
  const [ratePer40Kg, setRatePer40Kg] = useState<number>(3900);

  // Dynamic Expenses List
  const [voucherExpenses, setVoucherExpenses] = useState<VoucherExpenseItem[]>([
    {
      expenseId: expenses[0]?.id || 'exp-1',
      name: 'Labour / Mazdoori (Loading & Unloading)',
      nameUrdu: 'مزدوری (پلائی و اترائی)',
      amount: 5000,
      type: 'Direct'
    },
    {
      expenseId: expenses[1]?.id || 'exp-2',
      name: 'Freight / Transport (Karaya)',
      nameUrdu: 'کرایہ گاڑی / ٹرانسپورٹ',
      amount: 7500,
      type: 'Direct'
    }
  ]);

  // Document Attachments (Weight Slip, Expenses Bill, Gate Pass)
  const [attachments, setAttachments] = useState<DocumentAttachment[]>([]);

  // LIVE CALCULATIONS (LOCKED FORMULAS)

  const firstWeight = useMemo(() => {
    return Math.max(0, grossWeight - tareWeight);
  }, [grossWeight, tareWeight]);

  const totalDeductions = useMemo(() => {
    return bardanaKg + moistureKg + otherDeductionsKg;
  }, [bardanaKg, moistureKg, otherDeductionsKg]);

  const netWeight = useMemo(() => {
    return Math.max(0, firstWeight - totalDeductions);
  }, [firstWeight, totalDeductions]);

  // STRICT MANDI FORMULA:
  // 1. Purchase Value = (Net Weight / 40) * Rate per 40-kg
  const baseAmount = useMemo(() => {
    if (netWeight <= 0 || ratePer40Kg <= 0) return 0;
    return (netWeight / 40) * ratePer40Kg;
  }, [netWeight, ratePer40Kg]);

  const totalExpenses = useMemo(() => {
    return voucherExpenses.reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0);
  }, [voucherExpenses]);

  const totalAmount = useMemo(() => {
    return baseAmount + totalExpenses;
  }, [baseAmount, totalExpenses]);

  // STRICT USER LOCKED FORMULA:
  // 1. Purchase Value = (Net Weight / 40) * Rate per 40-kg
  // 2. Average Purchase Cost = (Purchase Value / First Weight) * 40 strictly!
  const purchaseAvgPer40Kg = useMemo(() => {
    if (firstWeight <= 0) return 0;
    return (baseAmount / firstWeight) * 40;
  }, [baseAmount, firstWeight]);

  // Landed Cost including direct expenses:
  const landedCostPer40Kg = useMemo(() => {
    if (firstWeight <= 0) return 0;
    return (totalAmount / firstWeight) * 40;
  }, [totalAmount, firstWeight]);

  // Handlers for Expenses
  const handleAddExpense = () => {
    setVoucherExpenses(prev => [
      ...prev,
      {
        expenseId: `custom-${Date.now()}`,
        name: 'Market Committee / Arhat',
        nameUrdu: 'مارکیٹ کمیٹی فیس / آڑھت',
        amount: 2000,
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

  // Reset form
  const handleReset = () => {
    setVoucherNo(`PUR-${Math.floor(1000 + Math.random() * 9000)}`);
    setGrossWeight(0);
    setTareWeight(0);
    setBardanaKg(0);
    setMoistureKg(0);
    setOtherDeductionsKg(0);
    setBags(0);
    setRatePer40Kg(3900);
    setVoucherExpenses([]);
    setVehicleNo('');
    setRemarks('');
    setAttachments([]);
  };

  // Submit Logic
  const handleSave = (actionType: 'save' | 'save_print_a4' | 'save_print_thermal' | 'save_whatsapp') => {
    if (firstWeight <= 0) {
      alert('First Weight must be greater than zero! (Gross Weight - Tare Weight)');
      return;
    }
    if (ratePer40Kg <= 0) {
      alert('Please enter a valid Rate per 40KG.');
      return;
    }

    const selectedPartyObj = parties.find(p => p.id === partyId) || parties[0];
    const selectedItemObj = items.find(i => i.id === itemId) || items[0];
    const selectedGodownObj = godowns.find(g => g.id === godownId) || godowns[0];
    const selectedBardanaObj = bardanaMasters.find(b => b.id === bardanaId) || bardanaMasters[0];

    const newVoucher = addVoucher({
      voucherNo,
      type: 'PURCHASE',
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
      avgCostPer40Kg: purchaseAvgPer40Kg,
      costPer40Kg: purchaseAvgPer40Kg,
      landedCostPer40Kg,
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
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-700">
              <Scale className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Purchase Entry (خریداری بل و کانٹا پرچی)
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Strict Mandi Rule: Costing & Averages are calculated on First Weight (Gross - Tare).
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
        {/* LEFT COLUMN: VOUCHER & PARTY DETAILS */}
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center justify-between border-b border-slate-100 pb-2">
              <span>Basic Voucher Info</span>
              <span className="font-urdu font-normal text-slate-500">بنیادی معلومات</span>
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Date / تاریخ
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Time / وقت
                </label>
                <input
                  type="text"
                  value={time}
                  onChange={e => setTime(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Supplier / Party (زمیندار یا بیوپاری)
              </label>
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
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Commodity / Item (جنس)
              </label>
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

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Receiving Godown (گودام)
              </label>
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
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Vehicle # / گاڑی نمبر
                </label>
                <input
                  type="text"
                  placeholder="e.g. LES-4912"
                  value={vehicleNo}
                  onChange={e => setVehicleNo(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Bilty # / بلٹی نمبر
                </label>
                <input
                  type="text"
                  placeholder="e.g. BL-841"
                  value={biltyNo}
                  onChange={e => setBiltyNo(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Remarks / تفصیل
              </label>
              <input
                type="text"
                placeholder="Weighbridge notes, lab moisture test results..."
                value={remarks}
                onChange={e => setRemarks(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-urdu"
              />
            </div>
          </div>
        </div>

        {/* MIDDLE COLUMN: WEIGHBRIDGE & FIRST WEIGHT COSTING */}
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="flex items-center gap-1.5 text-blue-800">
                <Scale className="w-4 h-4" />
                <span>Weighbridge & Deductions</span>
              </span>
              <span className="font-urdu font-normal text-slate-500">وزن کانٹا و کٹوتی</span>
            </h2>

            {/* Gross & Tare */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-800 mb-1">
                  Gross Weight / مجموعی وزن (KG)
                </label>
                <input
                  type="number"
                  value={grossWeight || ''}
                  onChange={e => setGrossWeight(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-mono font-bold text-slate-900 focus:bg-white focus:outline-blue-600"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-800 mb-1">
                  Tare Weight / خالی وزن (KG)
                </label>
                <input
                  type="number"
                  value={tareWeight || ''}
                  onChange={e => setTareWeight(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-mono font-bold text-slate-900 focus:bg-white focus:outline-blue-600"
                />
              </div>
            </div>

            {/* FIRST WEIGHT HIGHLIGHT CARD (LOCKED) */}
            <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-950">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-blue-800">
                    First Weight = Gross - Tare
                  </div>
                  <div className="font-urdu text-xs text-blue-900">پہلا وزن (لاگت اسی وزن پر ہے)</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-mono font-extrabold text-blue-950">
                    {firstWeight.toLocaleString()} KG
                  </div>
                  <div className="text-[11px] font-mono text-blue-800 font-semibold">
                    {(firstWeight / 40).toFixed(2)} Maunds (من)
                  </div>
                </div>
              </div>
            </div>

            {/* DEDUCTIONS */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              <div>
                <label className="block text-[10px] font-semibold text-slate-600 mb-1">
                  Bardana / باردانہ (KG)
                </label>
                <input
                  type="number"
                  value={bardanaKg || ''}
                  onChange={e => setBardanaKg(Number(e.target.value) || 0)}
                  className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-600 mb-1">
                  Moisture / نمی (KG)
                </label>
                <input
                  type="number"
                  value={moistureKg || ''}
                  onChange={e => setMoistureKg(Number(e.target.value) || 0)}
                  className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-600 mb-1">
                  Other / دیگر (KG)
                </label>
                <input
                  type="number"
                  value={otherDeductionsKg || ''}
                  onChange={e => setOtherDeductionsKg(Number(e.target.value) || 0)}
                  className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                />
              </div>
            </div>

            {/* Net Weight Display */}
            <div className="flex items-center justify-between px-3 py-2 bg-slate-100 rounded-lg text-xs">
              <span className="font-semibold text-slate-700">Net Weight / خالص وزن:</span>
              <span className="font-mono font-bold text-slate-900">
                {netWeight.toLocaleString()} KG ({(netWeight / 40).toFixed(2)} من)
              </span>
            </div>

            {/* BARBARA / BARDANA TRACKER (SEPARATE MASTER - STRICT ZERO WEIGHT IMPACT) */}
            <div className="p-3.5 rounded-xl bg-purple-50/80 border border-purple-200 text-purple-950 space-y-2.5">
              <div className="flex items-center justify-between text-xs font-bold text-purple-900 border-b border-purple-200 pb-1.5">
                <span className="flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-purple-700" />
                  <span>Barbara Tracker (Separate Master)</span>
                </span>
                <span className="font-urdu text-[11px] text-purple-800">باردانہ ماسٹر و وصولی</span>
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
                    No. of Bags Received / موصولہ بوریاں
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

              {/* USER LOCKED INSTRUCTION NOTICE */}
              <div className="p-2 rounded-lg bg-white border border-purple-100 text-[11px] text-purple-900 space-y-0.5">
                <div className="font-bold flex items-center gap-1 text-purple-950">
                  <span className="inline-block w-2 h-2 rounded-full bg-purple-600"></span>
                  <span>Strict Mandi Rule: These figures have NO impact on weight!</span>
                </div>
                <div className="text-[10px] text-purple-700 font-urdu leading-tight">
                  وصول شدہ بوریوں کی تعداد کا وزن پر کوئی اثر نہیں ہوتا۔ یہ صرف باردانہ رجسٹر میں نوٹ کی جائیں گی۔
                </div>
              </div>
            </div>

            {/* Rate / 40KG */}
            <div>
              <label className="block text-[11px] font-bold text-slate-800 mb-1">
                Rate / 40KG (ریٹ فی من PKR)
              </label>
              <input
                type="number"
                value={ratePer40Kg || ''}
                onChange={e => setRatePer40Kg(Number(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-mono font-bold text-emerald-800 focus:bg-white focus:outline-emerald-600"
              />
            </div>

            {/* Purchase Value Summary */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">Purchase Value / خریداری مالیت:</span>
                <span className="font-mono font-bold text-slate-900">{formatPKR(baseAmount)}</span>
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                Formula: ({netWeight.toLocaleString()} KG Net Wt / 40) × Rs. {ratePer40Kg}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: EXPENSES & FINAL COSTING */}
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Direct Expenses (براہ راست اخراجات)
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

            {/* Expenses List */}
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {voucherExpenses.length === 0 ? (
                <div className="py-4 text-center text-xs text-slate-400">
                  No expenses added. Click '+ Add Expense' above.
                </div>
              ) : (
                voucherExpenses.map((exp, idx) => (
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
                ))
              )}
            </div>

            {/* COSTING SUMMARY CARD (LOCKED USER FORMULAS) */}
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-2.5">
              <div className="flex items-center justify-between text-xs pb-1 border-b border-emerald-200/60">
                <div>
                  <span className="font-bold text-emerald-950">Purchase Value / خریداری مالیت:</span>
                  <div className="text-[10px] text-emerald-700 font-mono">(Net Wt {netWeight.toLocaleString()} KG ÷ 40) × Rs. {ratePer40Kg.toLocaleString()}</div>
                </div>
                <span className="font-mono text-sm font-black text-emerald-900">{formatPKR(baseAmount)}</span>
              </div>

              <div className="flex items-center justify-between text-xs pb-1 border-b border-emerald-200/60 bg-blue-50/60 -mx-2 px-2 py-1.5 rounded-lg border border-blue-200">
                <div>
                  <span className="font-bold text-blue-950">Average Purchase Cost / فی من اوسط لاگت خرید:</span>
                  <div className="text-[10px] text-blue-700 font-mono">(Purchase Value ÷ First Wt {firstWeight.toLocaleString()} KG) × 40</div>
                </div>
                <span className="font-mono text-sm font-black text-blue-900">
                  Rs. {purchaseAvgPer40Kg.toFixed(2)} / 40KG
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span>Direct Expenses / اخراجات:</span>
                <span className="font-mono font-bold">{formatPKR(totalExpenses)}</span>
              </div>

              <div className="border-t border-emerald-300 pt-1.5 flex items-center justify-between">
                <span className="font-bold text-xs uppercase text-slate-800">Total Landed Amount / کل رقم:</span>
                <span className="font-mono text-base font-extrabold text-emerald-900">
                  {formatPKR(totalAmount)}
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-600">
                <span>Landed Cost with Expenses / کل لاگت فی من:</span>
                <span className="font-mono font-bold text-slate-900">
                  Rs. {landedCostPer40Kg.toFixed(2)} / 40KG
                </span>
              </div>
            </div>

            {/* AMOUNT IN WORDS (LOCKED POINT) */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
              <div className="font-semibold text-slate-500 text-[10px] uppercase">Amount in Words:</div>
              <div className="font-medium text-slate-800">{numberToWordsEnglish(totalAmount)}</div>
              <div className="font-urdu text-emerald-800 text-sm">{numberToWordsUrdu(totalAmount)}</div>
            </div>
          </div>
        </div>
      </div>

      {/* DOCUMENT ATTACHMENTS (WEIGHT SLIP, EXPENSES BILL, GATE PASS) */}
      <DocumentAttachmentsManager
        attachments={attachments}
        onChange={setAttachments}
        voucherNo={voucherNo}
        voucherType="PURCHASE"
        partyName={parties.find(p => p.id === partyId)?.name || 'Farmer'}
        grossWeight={grossWeight}
        tareWeight={tareWeight}
        totalAmount={totalAmount}
        bags={bags}
        vehicleNo={vehicleNo}
      />

      {/* LOCKED POINT 25: FIXED BOTTOM ACTION BAR ALWAYS VISIBLE */}

      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t-2 border-slate-200 shadow-2xl p-3">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          
          {/* LIVE TOTALS WHILE TYPING */}
          <div className="flex items-center gap-4 text-xs font-mono font-bold">
            <div className="flex items-center gap-1.5 text-slate-700">
              <span className="text-slate-400 font-sans font-normal">First Wt:</span>
              <span className="bg-blue-100 text-blue-900 px-2 py-0.5 rounded">
                {firstWeight.toLocaleString()} KG
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-700">
              <span className="text-slate-400 font-sans font-normal">Bags:</span>
              <span className="bg-slate-200 text-slate-900 px-2 py-0.5 rounded">{bags}</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-700">
              <span className="text-slate-400 font-sans font-normal">Total Amount:</span>
              <span className="bg-emerald-100 text-emerald-900 px-2.5 py-0.5 rounded text-sm">
                {formatPKR(totalAmount)}
              </span>
            </div>
          </div>

          {/* BIG COLORFUL BILINGUAL ACTION BUTTONS (POINT 25-A) */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Save (Green) */}
            <button
              onClick={() => handleSave('save')}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>محفوظ کریں / Save</span>
            </button>

            {/* Save & Print A4 (Blue) */}
            <button
              onClick={() => handleSave('save_print_a4')}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Save & Print A4</span>
            </button>

            {/* Save & Print Thermal (Blue-slate) */}
            <button
              onClick={() => handleSave('save_print_thermal')}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
            >
              <FileCheck className="w-4 h-4" />
              <span>Save & Thermal 80mm</span>
            </button>

            {/* Save & WhatsApp (Green) */}
            <button
              onClick={() => handleSave('save_whatsapp')}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Save & WhatsApp</span>
            </button>

            {/* Reset (Orange) */}
            <button
              onClick={handleReset}
              className="flex items-center gap-1 px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>ری سیٹ / Reset</span>
            </button>

            {/* Close (Red) */}
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
