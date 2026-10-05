/**
 * Sample Weighbridge Slip & Expense Receipts Generator
 * Provides realistic Pakistani Mandi SVG data URLs for instant offline demonstration
 */

import { DocumentAttachment, DocumentAttachmentType } from '../types';

export function createSampleWeightSlipSvg(voucherNo: string, vehicleNo: string, gross: number, tare: number, partyName: string): string {
  const first = gross - tare;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 700" width="500" height="700" style="background:#fffcf5;font-family:sans-serif;">
    <rect x="10" y="10" width="480" height="680" rx="8" fill="#fffcf5" stroke="#d1d5db" stroke-width="2" />
    <rect x="20" y="20" width="460" height="90" fill="#065f46" rx="6" />
    <text x="250" y="52" fill="#ffffff" font-size="18" font-weight="bold" text-anchor="middle">NEW SARGODHA GRAIN MARKET</text>
    <text x="250" y="75" fill="#a7f3d0" font-size="14" font-weight="bold" text-anchor="middle">غلہ منڈی کمپیوٹرائزڈ کانٹا پرچی (WEIGHBRIDGE SLIP)</text>
    <text x="250" y="95" fill="#fef08a" font-size="11" text-anchor="middle">Kanda Slip # ${voucherNo} · Ph: 0300-7112233</text>

    <!-- Details Grid -->
    <g transform="translate(30, 130)" font-size="12" fill="#1f2937">
      <text x="0" y="20" font-weight="bold">Date / تاریخ: <tspan font-weight="normal">${new Date().toISOString().slice(0, 10)}</tspan></text>
      <text x="280" y="20" font-weight="bold">Time / وقت: <tspan font-weight="normal">11:35 AM</tspan></text>
      <text x="0" y="50" font-weight="bold">Party / زمیندار: <tspan font-weight="normal">${partyName}</tspan></text>
      <text x="280" y="50" font-weight="bold">Vehicle # گاڑی نمبر: <tspan font-weight="normal">${vehicleNo || 'MN-8842'}</tspan></text>
      <line x1="0" y1="70" x2="440" y2="70" stroke="#cbd5e1" stroke-width="1" />
    </g>

    <!-- Weight Numbers -->
    <g transform="translate(30, 220)">
      <rect x="0" y="0" width="440" height="50" fill="#f1f5f9" rx="4" />
      <text x="20" y="32" font-size="13" font-weight="bold" fill="#334155">1. Gross Weight (پہلا وزن / بھری گاڑی):</text>
      <text x="420" y="33" font-size="16" font-family="monospace" font-weight="bold" fill="#0f172a" text-anchor="end">${gross.toLocaleString()} KG</text>

      <rect x="0" y="60" width="440" height="50" fill="#f1f5f9" rx="4" />
      <text x="20" y="92" font-size="13" font-weight="bold" fill="#334155">2. Tare Weight (خالی گاڑی کا وزن):</text>
      <text x="420" y="93" font-size="16" font-family="monospace" font-weight="bold" fill="#0f172a" text-anchor="end">${tare.toLocaleString()} KG</text>

      <rect x="0" y="120" width="440" height="60" fill="#ecfdf5" stroke="#10b981" stroke-width="1.5" rx="4" />
      <text x="20" y="156" font-size="14" font-weight="bold" fill="#065f46">3. First Weight (صافی لاگت وزن):</text>
      <text x="420" y="158" font-size="20" font-family="monospace" font-weight="bold" fill="#065f46" text-anchor="end">${first.toLocaleString()} KG</text>
    </g>

    <!-- Scale stamp & operator signature -->
    <g transform="translate(50, 480)">
      <circle cx="90" cy="50" r="45" fill="none" stroke="#2563eb" stroke-width="2" stroke-dasharray="4,2" />
      <text x="90" y="45" fill="#2563eb" font-size="10" font-weight="bold" text-anchor="middle">VERIFIED SCALE</text>
      <text x="90" y="60" fill="#2563eb" font-size="9" text-anchor="middle">حلال و سچائی</text>

      <line x1="280" y1="80" x2="390" y2="80" stroke="#475569" stroke-width="1.5" />
      <text x="335" y="95" fill="#475569" font-size="11" text-anchor="middle">Weighbridge Operator (کانٹا کلرک)</text>
    </g>

    <!-- Barcode at bottom -->
    <g transform="translate(100, 620)">
      <rect x="0" y="0" width="4" height="30" fill="#000" /><rect x="8" y="0" width="2" height="30" fill="#000" />
      <rect x="14" y="0" width="6" height="30" fill="#000" /><rect x="24" y="0" width="2" height="30" fill="#000" />
      <rect x="30" y="0" width="8" height="30" fill="#000" /><rect x="42" y="0" width="4" height="30" fill="#000" />
      <rect x="50" y="0" width="2" height="30" fill="#000" /><rect x="56" y="0" width="6" height="30" fill="#000" />
      <rect x="66" y="0" width="4" height="30" fill="#000" /><rect x="74" y="0" width="8" height="30" fill="#000" />
      <rect x="86" y="0" width="2" height="30" fill="#000" /><rect x="92" y="0" width="6" height="30" fill="#000" />
      <rect x="102" y="0" width="4" height="30" fill="#000" /><rect x="110" y="0" width="6" height="30" fill="#000" />
      <rect x="120" y="0" width="2" height="30" fill="#000" /><rect x="126" y="0" width="8" height="30" fill="#000" />
      <rect x="138" y="0" width="4" height="30" fill="#000" /><rect x="146" y="0" width="2" height="30" fill="#000" />
      <rect x="152" y="0" width="6" height="30" fill="#000" /><rect x="162" y="0" width="4" height="30" fill="#000" />
      <rect x="170" y="0" width="8" height="30" fill="#000" /><rect x="182" y="0" width="2" height="30" fill="#000" />
      <text x="150" y="45" font-size="10" font-family="monospace" fill="#64748b" text-anchor="middle">${voucherNo}-KANTA-VERIFIED</text>
    </g>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function createSampleExpenseBillSvg(voucherNo: string, amount: number, partyName: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 650" width="500" height="650" style="background:#fdfcf9;font-family:sans-serif;">
    <rect x="10" y="10" width="480" height="630" rx="6" fill="#fdfcf9" stroke="#cbd5e1" stroke-width="1.5" />
    <rect x="20" y="20" width="460" height="80" fill="#1e293b" rx="4" />
    <text x="250" y="50" fill="#ffffff" font-size="16" font-weight="bold" text-anchor="middle">MANDI LABOUR & FREIGHT UNION RECEIPT</text>
    <text x="250" y="72" fill="#94a3b8" font-size="13" text-anchor="middle">مزدوری، پلائی و ٹرانسپورٹ خرچ بل (EXPENSES RECEIPT)</text>
    <text x="250" y="90" fill="#38bdf8" font-size="10" text-anchor="middle">Ref: ${voucherNo} · Union Reg # 418/M</text>

    <g transform="translate(35, 125)" font-size="12" fill="#334155">
      <text x="0" y="20">Dated / بتاریخ: <tspan font-weight="bold">${new Date().toISOString().slice(0, 10)}</tspan></text>
      <text x="260" y="20">Bilty # بلٹی: <tspan font-weight="bold">BLT-9921</tspan></text>
      <text x="0" y="45">Account / کھاتہ: <tspan font-weight="bold">${partyName}</tspan></text>
      <text x="260" y="45">Payment: <tspan font-weight="bold" fill="#059669">PAID CASH (نقد وصول)</tspan></text>
      <line x1="0" y1="65" x2="430" y2="65" stroke="#e2e8f0" stroke-width="1" />
    </g>

    <!-- Expense Lines -->
    <g transform="translate(35, 210)" font-size="12">
      <rect x="0" y="0" width="430" height="30" fill="#f1f5f9" />
      <text x="10" y="20" font-weight="bold" fill="#475569">Description (تفصیل)</text>
      <text x="420" y="20" font-weight="bold" fill="#475569" text-anchor="end">Amount (روپے)</text>

      <text x="10" y="55" fill="#1e293b">1. Unloading & Mazdoori (پلائی و اترائی مزدوری)</text>
      <text x="420" y="55" font-family="monospace" font-weight="bold" text-anchor="end">Rs. ${(amount * 0.4).toFixed(0)}</text>

      <text x="10" y="85" fill="#1e293b">2. Truck Freight / Karaya Gaari (کرایہ گاڑی)</text>
      <text x="420" y="85" font-family="monospace" font-weight="bold" text-anchor="end">Rs. ${(amount * 0.6).toFixed(0)}</text>

      <line x1="0" y1="110" x2="430" y2="110" stroke="#cbd5e1" stroke-width="1" />

      <rect x="0" y="125" width="430" height="40" fill="#f8fafc" stroke="#94a3b8" rx="4" />
      <text x="10" y="150" font-size="13" font-weight="bold" fill="#0f172a">Total Paid (کل وصولی):</text>
      <text x="420" y="152" font-size="16" font-family="monospace" font-weight="bold" fill="#0f172a" text-anchor="end">Rs. ${amount.toLocaleString()}</text>
    </g>

    <!-- Signature and stamp -->
    <g transform="translate(60, 430)">
      <rect x="20" y="20" width="130" height="60" rx="4" fill="none" stroke="#dc2626" stroke-width="1.5" stroke-dasharray="3,3" />
      <text x="85" y="45" fill="#dc2626" font-size="11" font-weight="bold" text-anchor="middle">PAID & VERIFIED</text>
      <text x="85" y="65" fill="#dc2626" font-size="10" text-anchor="middle">مزدور یونین</text>

      <line x1="250" y1="65" x2="370" y2="65" stroke="#475569" stroke-width="1.5" />
      <text x="310" y="80" fill="#475569" font-size="11" text-anchor="middle">Receiver Signature (دستخط وصول کنندہ)</text>
    </g>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function createSampleSalesBillSvg(voucherNo: string, amount: number, buyerName: string, bags: number): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 680" width="500" height="680" style="background:#f8fafc;font-family:sans-serif;">
    <rect x="10" y="10" width="480" height="660" rx="8" fill="#ffffff" stroke="#94a3b8" stroke-width="2" />
    <rect x="20" y="20" width="460" height="90" fill="#0f766e" rx="6" />
    <text x="250" y="52" fill="#ffffff" font-size="18" font-weight="bold" text-anchor="middle">GRAIN TRADERS & COMMISSION AGENTS</text>
    <text x="250" y="75" fill="#ccfbf1" font-size="14" font-weight="bold" text-anchor="middle">فروخت بیجک و گیٹ پاس (SALES BILL & GATE PASS)</text>
    <text x="250" y="95" fill="#fef08a" font-size="11" text-anchor="middle">Invoice # ${voucherNo} · Authorized Dispatch</text>

    <g transform="translate(30, 130)" font-size="12" fill="#1e293b">
      <text x="0" y="20" font-weight="bold">Buyer / خریدار: <tspan font-weight="normal">${buyerName}</tspan></text>
      <text x="280" y="20" font-weight="bold">Date: <tspan font-weight="normal">${new Date().toISOString().slice(0, 10)}</tspan></text>
      <text x="0" y="50" font-weight="bold">Delivery From: <tspan font-weight="normal">Godown # 1, Gate 2</tspan></text>
      <text x="280" y="50" font-weight="bold">Dispatch Status: <tspan font-weight="bold" fill="#0f766e">CLEARED (روانہ)</tspan></text>
      <line x1="0" y1="70" x2="440" y2="70" stroke="#cbd5e1" stroke-width="1" />
    </g>

    <g transform="translate(30, 220)">
      <rect x="0" y="0" width="440" height="40" fill="#f1f5f9" />
      <text x="15" y="25" font-size="12" font-weight="bold" fill="#475569">Bags Dispatched (بوریاں):</text>
      <text x="420" y="25" font-size="16" font-family="monospace" font-weight="bold" fill="#0f172a" text-anchor="end">${bags} Bags</text>

      <rect x="0" y="55" width="440" height="50" fill="#f0fdfa" stroke="#0d9488" stroke-width="1" rx="4" />
      <text x="15" y="85" font-size="13" font-weight="bold" fill="#0f766e">Total Sales Invoice Value:</text>
      <text x="420" y="87" font-size="18" font-family="monospace" font-weight="bold" fill="#0f766e" text-anchor="end">Rs. ${amount.toLocaleString()}</text>
    </g>

    <g transform="translate(40, 390)">
      <rect x="0" y="0" width="420" height="90" fill="#f8fafc" stroke="#e2e8f0" rx="6" />
      <text x="15" y="25" font-size="11" font-weight="bold" fill="#64748b">Gate Clearance & Security Check (گیٹ کلیئرنس):</text>
      <text x="15" y="45" font-size="11" fill="#334155">Vehicle loaded under supervision of Mandi Incharge.</text>
      <text x="15" y="65" font-size="11" font-urdu fill="#0f766e">گاڑی تمام وزن و دستاویزات کی تصدیق کے بعد گیٹ سے پاس کی گئی ہے۔</text>
    </g>

    <g transform="translate(50, 520)">
      <line x1="20" y1="50" x2="160" y2="50" stroke="#475569" stroke-width="1.5" />
      <text x="90" y="70" fill="#475569" font-size="11" text-anchor="middle">Gate Officer (گیٹ انچارج)</text>

      <line x1="260" y1="50" x2="400" y2="50" stroke="#475569" stroke-width="1.5" />
      <text x="330" y="70" fill="#475569" font-size="11" text-anchor="middle">Buyer Receiver (خریدار وصول کنندہ)</text>
    </g>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
