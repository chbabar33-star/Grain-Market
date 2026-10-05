/**
 * Mandi ERP - Printing System (Point 14)
 * 3 Locked Print Designs:
 * 1. A4 Standard (Traditional Pakistani Mandi Bill with double borders)
 * 2. A4 Modern (Contemporary clean corporate dispatch note)
 * 3. Thermal 80mm (Weighbridge receipt printer format with QR code)
 * Embedded QR Code verification, Bilingual Urdu Nastaleeq labels, and PKR Amount in words!
 */

import React, { useState } from 'react';
import {
  Printer,
  X,
  FileCheck,
  Check,
  QrCode,
  Building,
  Scale,
  Paperclip
} from 'lucide-react';
import { Voucher } from '../types';
import { useMandi } from '../context/MandiContext';
import { formatPKR, numberToWordsEnglish, numberToWordsUrdu } from '../utils/numberToWords';
import { generateQRCodeSVG } from '../utils/qrCode';

interface PrintModalProps {
  voucher: Voucher;
  initialDesign?: 'a4-standard' | 'a4-modern' | 'thermal-80mm';
  onClose: () => void;
}

export const PrintModal: React.FC<PrintModalProps> = ({
  voucher,
  initialDesign = 'a4-standard',
  onClose
}) => {
  const { currentBusiness } = useMandi();
  const [selectedDesign, setSelectedDesign] = useState<'a4-standard' | 'a4-modern' | 'thermal-80mm'>(initialDesign);
  const [includeUrdu, setIncludeUrdu] = useState(true);
  const [includeQR, setIncludeQR] = useState(true);

  // Generate QR code data payload
  const qrData = `VERIFIED: ${voucher.voucherNo} | ${voucher.type} | Date: ${voucher.date} | Party: ${voucher.partyName} | Amount: PKR ${voucher.totalAmount} | Business: ${currentBusiness.name} | NTN: ${currentBusiness.ntn}`;
  const qrSvg = generateQRCodeSVG(qrData, selectedDesign === 'thermal-80mm' ? 100 : 120);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[94vh] flex flex-col shadow-2xl border border-slate-200">
        
        {/* MODAL CONTROL HEADER (NO PRINT) */}
        <div className="no-print p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <span className="p-2 bg-blue-100 text-blue-800 rounded-lg">
              <Printer className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Print Voucher Slip: {voucher.voucherNo}
              </h2>
              <p className="text-xs text-slate-500 font-urdu">واؤچر پرنٹ فارمیٹس (اے ۴ و تھرمل ۸۰ ملی میٹر)</p>
            </div>
          </div>

          {/* DESIGN SELECTOR BUTTONS */}
          <div className="flex items-center gap-2">
            <div className="flex items-center p-1 bg-white rounded-lg border border-slate-200 shadow-2xs">
              <button
                onClick={() => setSelectedDesign('a4-standard')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                  selectedDesign === 'a4-standard' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                A4 Standard
              </button>
              <button
                onClick={() => setSelectedDesign('a4-modern')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                  selectedDesign === 'a4-modern' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                A4 Modern
              </button>
              <button
                onClick={() => setSelectedDesign('thermal-80mm')}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                  selectedDesign === 'thermal-80mm' ? 'bg-emerald-700 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Thermal 80mm
              </button>
            </div>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print Now</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PREVIEW CONTAINER */}
        <div className="p-4 sm:p-8 overflow-y-auto flex-1 bg-slate-100/50 flex justify-center">

          {/* 1. A4 STANDARD DESIGN (CLASSIC BORDERED MANDI INVOICE) */}
          {selectedDesign === 'a4-standard' && (
            <div className="bg-white border-2 border-slate-900 p-8 rounded shadow-md max-w-2xl w-full text-slate-900 font-sans space-y-4">
              
              {/* HEADER: LOGO, NAME, NTN, ADDRESS */}
              <div className="border-b-2 border-slate-900 pb-4 text-center space-y-1">
                <div className="text-xl font-black uppercase tracking-wider text-slate-900">
                  {currentBusiness.name}
                </div>
                <div className="font-urdu text-lg font-bold text-slate-800">
                  {currentBusiness.nameUrdu}
                </div>
                <div className="text-xs text-slate-600">
                  {currentBusiness.address} | Phone: {currentBusiness.phone}
                </div>
                <div className="text-xs font-semibold text-slate-800 font-mono">
                  NTN # {currentBusiness.ntn} | Proprietor: {currentBusiness.proprietor} ({currentBusiness.proprietorUrdu})
                </div>

                <div className="inline-block mt-2 border-y border-slate-900 px-6 py-0.5 text-xs font-bold tracking-widest uppercase">
                  {voucher.type === 'PURCHASE' ? 'PURCHASE INWARD WEIGHBRIDGE SLIP / خریداری بل' : 'SALES OUTWARD GATE PASS / فروخت بل'}
                </div>
              </div>

              {/* VOUCHER & PARTY DETAILS */}
              <div className="grid grid-cols-2 gap-4 text-xs border-b border-slate-300 pb-3">
                <div className="space-y-1">
                  <div>
                    <span className="font-bold">Slip No / واؤچر نمبر:</span>{' '}
                    <span className="font-mono font-bold">{voucher.voucherNo}</span>
                  </div>
                  <div>
                    <span className="font-bold">Date / تاریخ:</span>{' '}
                    <span>{voucher.date} · {voucher.time}</span>
                  </div>
                  <div>
                    <span className="font-bold">Godown / گودام:</span>{' '}
                    <span>{voucher.godownName}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div>
                    <span className="font-bold">Party / نام پارٹی:</span>{' '}
                    <span className="font-bold text-slate-900">{voucher.partyName}</span>
                  </div>
                  <div className="font-urdu text-xs text-slate-700">{voucher.partyNameUrdu}</div>
                  <div>
                    <span className="font-bold">Vehicle # / گاڑی:</span>{' '}
                    <span className="font-mono">{voucher.vehicleNo || 'Self / Tractor'}</span>
                  </div>
                </div>
              </div>

              {/* WEIGHBRIDGE TABLE (LOCKED POINT 14) */}
              <table className="w-full text-xs border border-slate-900 border-collapse">
                <thead>
                  <tr className="bg-slate-200 border-b border-slate-900 font-bold text-slate-900">
                    <th className="p-2 border-r border-slate-900">Item / جنس</th>
                    <th className="p-2 border-r border-slate-900 text-right">Gross Wt / مجموعی</th>
                    <th className="p-2 border-r border-slate-900 text-right">Tare Wt / خالی</th>
                    <th className="p-2 border-r border-slate-900 text-right bg-slate-300">First Wt / پہلا وزن</th>
                    <th className="p-2 border-r border-slate-900 text-right">Deductions / کٹوتی</th>
                    <th className="p-2 border-r border-slate-900 text-right">Net Wt / خالص</th>
                    <th className="p-2 border-r border-slate-900 text-right">Bags / بوریاں</th>
                    <th className="p-2 border-r border-slate-900 text-right">Rate/40KG</th>
                    <th className="p-2 text-right">Amount / رقم</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-900 font-medium text-slate-900">
                    <td className="p-2 border-r border-slate-900 font-bold">
                      {voucher.itemName}
                      <div className="font-urdu text-[11px] text-slate-600">{voucher.itemNameUrdu}</div>
                    </td>
                    <td className="p-2 border-r border-slate-900 text-right font-mono tabular-nums">
                      {voucher.grossWeight.toLocaleString()} KG
                    </td>
                    <td className="p-2 border-r border-slate-900 text-right font-mono tabular-nums">
                      {voucher.tareWeight.toLocaleString()} KG
                    </td>
                    <td className="p-2 border-r border-slate-900 text-right font-mono tabular-nums font-bold bg-slate-100">
                      {voucher.firstWeight.toLocaleString()} KG
                    </td>
                    <td className="p-2 border-r border-slate-900 text-right font-mono tabular-nums text-[11px]">
                      {voucher.bardanaKg + voucher.moistureKg + voucher.otherDeductionsKg} KG
                    </td>
                    <td className="p-2 border-r border-slate-900 text-right font-mono tabular-nums">
                      {voucher.netWeight.toLocaleString()} KG
                    </td>
                    <td className="p-2 border-r border-slate-900 text-right font-mono tabular-nums font-bold">
                      {voucher.bags}
                    </td>
                    <td className="p-2 border-r border-slate-900 text-right font-mono tabular-nums">
                      {voucher.ratePer40Kg.toLocaleString()}
                    </td>
                    <td className="p-2 text-right font-mono tabular-nums font-bold">
                      {formatPKR(voucher.baseAmount)}
                    </td>
                  </tr>

                  {/* EXPENSES BREAKDOWN */}
                  {voucher.expenses.map((exp, idx) => (
                    <tr key={idx} className="text-[11px] border-b border-slate-200 text-slate-700">
                      <td colSpan={8} className="p-1.5 border-r border-slate-900 text-right">
                        + {exp.name} ({exp.nameUrdu}):
                      </td>
                      <td className="p-1.5 text-right font-mono tabular-nums">
                        {formatPKR(exp.amount)}
                      </td>
                    </tr>
                  ))}

                  {/* AVERAGE COST ON FIRST WEIGHT (USER LOCKED FORMULA) */}
                  <tr className="bg-blue-50/70 border-b border-slate-900 text-xs font-semibold text-blue-950">
                    <td colSpan={6} className="p-2 border-r border-slate-900 text-right">
                      AVERAGE COST / اوسط ریٹ (Value / First Weight × 40):
                    </td>
                    <td colSpan={3} className="p-2 text-right font-mono font-bold text-blue-900">
                      Rs. {voucher.costPer40Kg.toFixed(2)} / 40KG
                    </td>
                  </tr>

                  {/* GRAND TOTAL ROW */}
                  <tr className="bg-slate-200 font-bold text-sm">
                    <td colSpan={6} className="p-2 border-r border-slate-900 text-right uppercase">
                      GRAND TOTAL / کل رقم (PKR):
                    </td>
                    <td className="p-2 border-r border-slate-900 text-right font-mono">
                      {voucher.bags} Bags
                    </td>
                    <td className="p-2 border-r border-slate-900 text-right">-</td>
                    <td className="p-2 text-right font-mono font-black text-slate-950">
                      {formatPKR(voucher.totalAmount)}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* AMOUNT IN WORDS (LOCKED POINT 14) */}
              <div className="bg-slate-50 border border-slate-300 p-2.5 rounded text-xs space-y-1">
                <div>
                  <span className="font-bold">Total Amount in Words:</span>{' '}
                  <span className="font-medium">{numberToWordsEnglish(voucher.totalAmount)}</span>
                </div>
                <div className="font-urdu text-sm font-semibold text-slate-900">
                  {numberToWordsUrdu(voucher.totalAmount)}
                </div>
              </div>

              {/* ATTACHED DOCUMENTS NOTICE */}
              {voucher.attachments && voucher.attachments.length > 0 && (
                <div className="bg-slate-50 border border-slate-300 p-2 rounded text-xs flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-medium text-slate-700">
                    <Paperclip className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>Attached Documents ({voucher.attachments.length}):</span>
                    <span className="font-bold text-slate-900">
                      {voucher.attachments.map(a => {
                        return a.type === 'weight_slip' ? 'Weight Slip (کانٹا پرچی)' :
                               a.type === 'expenses_bill' ? 'Expenses Bill (اخراجات بل)' :
                               a.type === 'sales_bill' ? 'Sales Bill (فروخت بل)' : a.name;
                      }).join(' • ')}
                    </span>
                  </div>
                  <div className="font-urdu text-[11px] text-emerald-800 font-semibold">
                    تصدیق شدہ منسلک پرچیاں
                  </div>
                </div>
              )}

              {/* FOOTER: QR CODE + SIGNATURES */}
              <div className="flex items-end justify-between pt-6 border-t border-slate-300">
                {/* QR Code Verification */}
                <div className="flex items-center gap-3">
                  <div
                    dangerouslySetInnerHTML={{ __html: qrSvg }}
                    className="w-20 h-20 border border-slate-200 p-1 bg-white"
                  />
                  <div className="text-[10px] text-slate-500 max-w-[140px] leading-tight">
                    Scan QR for digital verification of weighing ticket and Mandi ledger authenticity.
                  </div>
                </div>

                {/* Thanks note */}
                <div className="text-center">
                  <div className="font-urdu text-xs text-slate-700">شکریہ! آپ کے تعاون کا بہت شکریہ۔</div>
                  <div className="text-[10px] text-slate-400">Software by Grain Market ERP</div>
                </div>

                {/* Authorized Signatory */}
                <div className="text-center space-y-1">
                  <div className="w-36 border-b border-slate-900"></div>
                  <div className="text-xs font-bold text-slate-800">Authorized Signature</div>
                  <div className="font-urdu text-[11px] text-slate-600">دستخط مجاز / منشی</div>
                </div>
              </div>

            </div>
          )}

          {/* 2. A4 MODERN DESIGN */}
          {selectedDesign === 'a4-modern' && (
            <div className="bg-white border border-slate-200 p-8 rounded-2xl shadow-md max-w-2xl w-full text-slate-900 font-sans space-y-6">
              <div className="flex items-start justify-between border-b border-slate-100 pb-6">
                <div>
                  <span className="text-[10px] font-bold text-emerald-800 tracking-widest uppercase bg-emerald-50 px-2 py-0.5 rounded">
                    Official Mandi Dispatch Slip
                  </span>
                  <h1 className="text-2xl font-black text-slate-900 mt-2">{currentBusiness.name}</h1>
                  <div className="font-urdu text-sm text-slate-600">{currentBusiness.nameUrdu}</div>
                  <div className="text-xs text-slate-500 mt-1">{currentBusiness.address}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400">VOUCHER NUMBER</div>
                  <div className="text-xl font-mono font-black text-slate-900">{voucher.voucherNo}</div>
                  <div className="text-xs text-slate-500 mt-1">{voucher.date} · {voucher.time}</div>
                </div>
              </div>

              {/* Party Information Card */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex justify-between text-xs">
                <div>
                  <div className="text-slate-400 text-[10px] uppercase font-bold">Party / Recipient</div>
                  <div className="font-bold text-sm text-slate-900">{voucher.partyName}</div>
                  <div className="font-urdu text-slate-600">{voucher.partyNameUrdu}</div>
                </div>
                <div className="text-right">
                  <div className="text-slate-400 text-[10px] uppercase font-bold">Godown Warehouse</div>
                  <div className="font-bold text-slate-900">{voucher.godownName}</div>
                  <div className="text-slate-500">Vehicle: {voucher.vehicleNo || 'Trolley'}</div>
                </div>
              </div>

              {/* Items Card */}
              <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
                <div className="bg-slate-900 text-white p-2.5 font-bold flex justify-between">
                  <span>Commodity & First Weight Costing</span>
                  <span>Amount (PKR)</span>
                </div>
                <div className="p-4 space-y-2">
                  <div className="flex justify-between items-center text-sm font-bold">
                    <span>{voucher.itemName} ({voucher.bags} Bags)</span>
                    <span className="font-mono">{formatPKR(voucher.baseAmount)}</span>
                  </div>
                  <div className="text-xs text-slate-500 grid grid-cols-3 gap-2 py-2 border-y border-slate-100">
                    <div>Gross: <strong className="font-mono">{voucher.grossWeight} KG</strong></div>
                    <div>Tare: <strong className="font-mono">{voucher.tareWeight} KG</strong></div>
                    <div className="text-emerald-800 font-bold">First Wt: {voucher.firstWeight} KG</div>
                  </div>
                  <div className="flex justify-between items-center text-slate-600 text-xs">
                    <span>Rate: Rs. {voucher.ratePer40Kg}/40KG</span>
                    <span>Net Wt: {voucher.netWeight} KG</span>
                  </div>
                </div>
                <div className="bg-emerald-50 p-3 border-t border-emerald-100 flex justify-between items-center font-bold text-emerald-950">
                  <span>Total Amount (Base + Expenses):</span>
                  <span className="font-mono text-base font-extrabold">{formatPKR(voucher.totalAmount)}</span>
                </div>
              </div>

              {/* ATTACHED DOCUMENTS NOTICE */}
              {voucher.attachments && voucher.attachments.length > 0 && (
                <div className="bg-emerald-50/60 border border-emerald-200 p-2.5 rounded-xl text-xs flex items-center justify-between text-emerald-950">
                  <div className="flex items-center gap-2">
                    <Paperclip className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span><strong>Attached Documents ({voucher.attachments.length}):</strong> {voucher.attachments.map(a => a.name).join(', ')}</span>
                  </div>
                  <span className="font-urdu text-[11px] text-emerald-800 font-semibold">منسلک دستاویزات</span>
                </div>
              )}

              {/* Words & QR Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100 text-xs">
                <div className="space-y-1">
                  <div className="font-semibold text-slate-700">{numberToWordsEnglish(voucher.totalAmount)}</div>
                  <div className="font-urdu text-emerald-800">{numberToWordsUrdu(voucher.totalAmount)}</div>
                </div>
                <div
                  dangerouslySetInnerHTML={{ __html: qrSvg }}
                  className="w-16 h-16 border border-slate-200 p-0.5 bg-white"
                />
              </div>
            </div>
          )}

          {/* 3. THERMAL 80MM RECEIPT (POINT 14 & POINT 25) */}
          {selectedDesign === 'thermal-80mm' && (
            <div className="print-thermal bg-white border border-slate-300 p-4 rounded-lg shadow-md w-72 text-slate-900 font-mono text-[11px] space-y-3">
              <div className="text-center space-y-1 border-b border-dashed border-slate-400 pb-3">
                <div className="font-sans font-bold text-xs uppercase text-slate-900">
                  {currentBusiness.name}
                </div>
                <div className="font-urdu text-xs font-semibold text-slate-800">
                  {currentBusiness.nameUrdu}
                </div>
                <div className="text-[10px] text-slate-500 font-sans">
                  {currentBusiness.address} · Tel: {currentBusiness.phone}
                </div>
                <div className="text-[10px] font-bold">NTN: {currentBusiness.ntn}</div>
                <div className="font-bold border border-slate-800 py-0.5 uppercase text-[10px] mt-1">
                  {voucher.type} WEIGHBRIDGE TICKET
                </div>
              </div>

              <div className="space-y-1 border-b border-dashed border-slate-400 pb-2">
                <div className="flex justify-between">
                  <span>Voucher #:</span>
                  <span className="font-bold">{voucher.voucherNo}</span>
                </div>
                <div className="flex justify-between">
                  <span>Date/Time:</span>
                  <span>{voucher.date} {voucher.time}</span>
                </div>
                <div className="flex justify-between">
                  <span>Party:</span>
                  <span className="font-bold truncate max-w-[120px]">{voucher.partyName}</span>
                </div>
                <div className="font-urdu text-right text-[10px] text-slate-600">
                  {voucher.partyNameUrdu}
                </div>
                <div className="flex justify-between">
                  <span>Vehicle:</span>
                  <span>{voucher.vehicleNo || 'Local'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Godown:</span>
                  <span>{voucher.godownName}</span>
                </div>
              </div>

              {/* WEIGHBRIDGE METRICS */}
              <div className="space-y-1 border-b border-dashed border-slate-400 pb-2">
                <div className="font-bold uppercase text-[10px]">WEIGHT CALCULATION (KG):</div>
                <div className="flex justify-between">
                  <span>Gross Wt (مجموعی):</span>
                  <span>{voucher.grossWeight.toLocaleString()} KG</span>
                </div>
                <div className="flex justify-between">
                  <span>Tare Wt (خالی):</span>
                  <span>{voucher.tareWeight.toLocaleString()} KG</span>
                </div>
                <div className="flex justify-between font-bold text-xs bg-slate-100 px-1 py-0.5">
                  <span>First Wt (پہلا):</span>
                  <span>{voucher.firstWeight.toLocaleString()} KG</span>
                </div>
                <div className="flex justify-between text-[10px] text-slate-600">
                  <span>Deductions:</span>
                  <span>-{voucher.bardanaKg + voucher.moistureKg + voucher.otherDeductionsKg} KG</span>
                </div>
                <div className="flex justify-between">
                  <span>Net Wt (خالص):</span>
                  <span>{voucher.netWeight.toLocaleString()} KG</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Bags (بوریاں):</span>
                  <span>{voucher.bags}</span>
                </div>
              </div>

              {/* BILLING */}
              <div className="space-y-1 border-b border-dashed border-slate-400 pb-2">
                <div className="flex justify-between">
                  <span>Rate / 40KG:</span>
                  <span>Rs. {voucher.ratePer40Kg.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Value (on Net Wt):</span>
                  <span>{formatPKR(voucher.baseAmount)}</span>
                </div>
                {voucher.totalExpenses > 0 && (
                  <div className="flex justify-between">
                    <span>Expenses:</span>
                    <span>+{formatPKR(voucher.totalExpenses)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-xs pt-1 border-t border-slate-300">
                  <span>TOTAL BILL:</span>
                  <span>{formatPKR(voucher.totalAmount)}</span>
                </div>
                <div className="flex justify-between text-[10px] text-emerald-800 font-bold pt-0.5">
                  <span>Avg Cost (on First Wt):</span>
                  <span>Rs. {voucher.costPer40Kg.toFixed(2)}/40KG</span>
                </div>
              </div>

              {/* ATTACHED DOCUMENTS LINE */}
              {voucher.attachments && voucher.attachments.length > 0 && (
                <div className="text-[10px] border-b border-dashed border-slate-400 pb-1 text-slate-700 flex justify-between">
                  <span>Attached Slips/Bills:</span>
                  <span className="font-bold">{voucher.attachments.length} files attached</span>
                </div>
              )}

              {/* AMOUNT IN WORDS */}
              <div className="text-[10px] space-y-0.5">
                <div className="font-sans text-slate-700">{numberToWordsEnglish(voucher.totalAmount)}</div>
                <div className="font-urdu text-slate-900 text-xs">{numberToWordsUrdu(voucher.totalAmount)}</div>
              </div>

              {/* QR CODE FOR 80MM */}
              <div className="flex flex-col items-center justify-center pt-2">
                <div
                  dangerouslySetInnerHTML={{ __html: qrSvg }}
                  className="w-20 h-20 p-0.5 bg-white border border-slate-300"
                />
                <div className="text-[9px] text-slate-400 mt-1">Scan for Mandi Verification</div>
              </div>

              <div className="text-center pt-2 border-t border-dashed border-slate-400 font-urdu text-[11px]">
                شکریہ! آپ کے تعاون کا بہت شکریہ۔
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
