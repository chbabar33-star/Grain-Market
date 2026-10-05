/**
 * Mandi ERP - Godown Transfer Screen (Points 10, 18, 25)
 * Strict Godown Transfer Rules:
 * - Transfer Slip No Auto
 * - From Godown -> To Godown (strictly within the same active Business)
 * - Item, First Weight, Bags, Expense, Remarks
 * - Status Pending/Approved: Approval updates stock (From Minus, To Plus)
 */

import React, { useState, useMemo } from 'react';
import {
  ArrowRightLeft,
  Warehouse,
  Save,
  Printer,
  RotateCcw,
  X,
  FileCheck
} from 'lucide-react';
import { useMandi } from '../context/MandiContext';
import { Voucher } from '../types';
import { formatPKR } from '../utils/numberToWords';

interface GodownTransferProps {
  onSuccess: (voucher: Voucher) => void;
  onClose: () => void;
  onPrintRequested: (voucher: Voucher, design: 'a4-standard' | 'thermal-80mm') => void;
}

export const GodownTransfer: React.FC<GodownTransferProps> = ({
  onSuccess,
  onClose,
  onPrintRequested
}) => {
  const {
    currentBusiness,
    items,
    godowns,
    addVoucher,
    godownStock
  } = useMandi();

  const [voucherNo, setVoucherNo] = useState(`TRN-${Math.floor(1000 + Math.random() * 9000)}`);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  const [itemId, setItemId] = useState(items[0]?.id || '');
  const [fromGodownId, setFromGodownId] = useState(godowns[0]?.id || '');
  const [toGodownId, setToGodownId] = useState(godowns[1]?.id || godowns[0]?.id || '');
  
  const [firstWeight, setFirstWeight] = useState<number>(4000);
  const [bags, setBags] = useState<number>(80);
  const [ratePer40Kg, setRatePer40Kg] = useState<number>(3900);
  const [transferExpense, setTransferExpense] = useState<number>(2000);
  const [vehicleNo, setVehicleNo] = useState('');
  const [remarks, setRemarks] = useState('');

  // Source Godown Available Stock
  const sourceStock = useMemo(() => {
    return godownStock[fromGodownId]?.[itemId] || { firstWeight: 0, bags: 0 };
  }, [godownStock, fromGodownId, itemId]);

  const baseAmount = useMemo(() => {
    return (firstWeight / 40) * ratePer40Kg;
  }, [firstWeight, ratePer40Kg]);

  const totalAmount = useMemo(() => {
    return baseAmount + transferExpense;
  }, [baseAmount, transferExpense]);

  const handleSave = (printAfter: boolean = false) => {
    if (fromGodownId === toGodownId) {
      alert('Source Godown (From) and Destination Godown (To) must be different!');
      return;
    }
    if (firstWeight <= 0) {
      alert('Transfer weight must be greater than zero.');
      return;
    }

    const selectedItem = items.find(i => i.id === itemId) || items[0];
    const fromGodown = godowns.find(g => g.id === fromGodownId) || godowns[0];
    const toGodown = godowns.find(g => g.id === toGodownId) || godowns[1] || godowns[0];

    const newVoucher = addVoucher({
      voucherNo,
      type: 'TRANSFER',
      date,
      time,
      partyId: 'internal-transfer',
      partyName: `Transfer: ${fromGodown.name} -> ${toGodown.name}`,
      partyNameUrdu: `منتقلی: ${fromGodown.nameUrdu} تا ${toGodown.nameUrdu}`,
      itemId: selectedItem.id,
      itemName: selectedItem.name,
      itemNameUrdu: selectedItem.nameUrdu,
      godownId: fromGodown.id,
      godownName: fromGodown.name,
      toGodownId: toGodown.id,
      toGodownName: toGodown.name,
      grossWeight: firstWeight + 3000,
      tareWeight: 3000,
      firstWeight,
      bardanaKg: bags,
      moistureKg: 0,
      otherDeductionsKg: 0,
      netWeight: firstWeight - bags,
      bags,
      ratePer40Kg,
      baseAmount,
      expenses: [
        {
          expenseId: 'exp-transfer',
          name: 'Transfer Freight & Handling',
          nameUrdu: 'منتقلی کرایہ و ہینڈلنگ',
          amount: transferExpense,
          type: 'Direct'
        }
      ],
      totalExpenses: transferExpense,
      totalAmount,
      avgCostPer40Kg: ratePer40Kg,
      costPer40Kg: ratePer40Kg,
      status: 'Pending', // Pending approval commits to stock ledger
      vehicleNo,
      remarks: remarks || `Stock transfer between ${currentBusiness.name} warehouses`
    });

    onSuccess(newVoucher);
    if (printAfter) {
      onPrintRequested(newVoucher, 'a4-standard');
    }
  };

  return (
    <div className="space-y-4 pb-24">
      {/* HEADER BANNER */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-purple-50 text-purple-700">
              <ArrowRightLeft className="w-5 h-5" />
            </span>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Godown Stock Transfer (گودام منتقلی سلپ)
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Internal transfer between warehouses of {currentBusiness.name}. Cross-business transfers are prohibited.
          </p>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* WAREHOUSE TRANSFER PAIR */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
            <Warehouse className="w-4 h-4 text-purple-700" />
            <span>Warehouses & Commodity Selection</span>
          </h2>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Transfer Date</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Transfer Slip #</label>
              <input
                type="text"
                value={voucherNo}
                readOnly
                className="w-full px-2.5 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-xs font-mono font-bold"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">Commodity / Item (جنس)</label>
            <select
              value={itemId}
              onChange={e => setItemId(e.target.value)}
              className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-urdu"
            >
              {items.map(i => (
                <option key={i.id} value={i.id}>
                  {i.name} ({i.nameUrdu})
                </option>
              ))}
            </select>
          </div>

          {/* FROM GODOWN */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <label className="block text-xs font-bold text-rose-800">
              From Godown (جہاں سے اسٹاک نکلے گا - منفی ہوگا)
            </label>
            <select
              value={fromGodownId}
              onChange={e => setFromGodownId(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-urdu font-medium"
            >
              {godowns.map(g => (
                <option key={g.id} value={g.id}>
                  {g.name} ({g.nameUrdu})
                </option>
              ))}
            </select>
            <div className="text-[11px] text-slate-600 flex justify-between">
              <span>Current Stock at Source:</span>
              <span className="font-mono font-bold text-slate-900">
                {sourceStock.firstWeight.toLocaleString()} KG ({sourceStock.bags} Bags)
              </span>
            </div>
          </div>

          {/* TO GODOWN */}
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2">
            <label className="block text-xs font-bold text-emerald-800">
              To Godown (جہاں اسٹاک جائے گا - جمع ہوگا)
            </label>
            <select
              value={toGodownId}
              onChange={e => setToGodownId(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-white border border-emerald-300 rounded-lg text-xs font-urdu font-medium"
            >
              {godowns.map(g => (
                <option key={g.id} value={g.id}>
                  {g.name} ({g.nameUrdu})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* WEIGHT & TRANSFER DETAILS */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
            Transfer Quantities & Expenses
          </h2>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-800 mb-1">
                First Weight to Shift / وزن (KG)
              </label>
              <input
                type="number"
                value={firstWeight || ''}
                onChange={e => setFirstWeight(Number(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-mono font-bold text-purple-900"
              />
              <div className="text-[10px] text-slate-400 mt-1">
                = {(firstWeight / 40).toFixed(2)} Maunds (من)
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-800 mb-1">
                Bags to Shift / بوریاں
              </label>
              <input
                type="number"
                value={bags || ''}
                onChange={e => setBags(Number(e.target.value) || 0)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-mono font-bold text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Shifting Freight / Expense (کرایہ منتقلی PKR)
              </label>
              <input
                type="number"
                value={transferExpense || ''}
                onChange={e => setTransferExpense(Number(e.target.value) || 0)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-semibold"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Vehicle # / ٹرک نمبر
              </label>
              <input
                type="text"
                placeholder="e.g. FSD-4901"
                value={vehicleNo}
                onChange={e => setVehicleNo(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">Remarks / نوٹ</label>
            <input
              type="text"
              placeholder="e.g. Shifting for bulk loading rake..."
              value={remarks}
              onChange={e => setRemarks(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-urdu"
            />
          </div>

          <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-purple-950 text-xs space-y-1">
            <div className="font-bold flex items-center justify-between">
              <span>Transfer Valuation (بک ویلیو):</span>
              <span className="font-mono text-sm">{formatPKR(totalAmount)}</span>
            </div>
            <p className="text-[11px] text-purple-800">
              * Note: Transfer vouchers are saved in <strong>Pending</strong> state. Upon Manager Approval in the Action Centre, the stock will deduct from {fromGodownId} and credit to {toGodownId}.
            </p>
          </div>
        </div>
      </div>

      {/* FIXED BOTTOM BAR */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t-2 border-slate-200 shadow-2xl p-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="text-xs font-mono font-bold text-slate-700">
            Shifting: {firstWeight.toLocaleString()} KG | {bags} Bags
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSave(false)}
              className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>محفوظ کریں / Save Transfer</span>
            </button>

            <button
              onClick={() => handleSave(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Save & Print Slip</span>
            </button>

            <button
              onClick={onClose}
              className="px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
