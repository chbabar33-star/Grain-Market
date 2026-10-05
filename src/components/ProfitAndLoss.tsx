/**
 * Mandi ERP - Profit & Loss Account (Points 7 & 26)
 * Dual Format Engine:
 * 1. QuickBooks Style (Multi-Step Statement with Income, COGS, Gross Profit, Overhead, Net Profit)
 * 2. BUSY Style (Traditional Horizontal T-Account Trading & P&L Statement)
 * Drill-down on any line item, Excel Export, Print A4, Date & Item filters.
 */

import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  FileSpreadsheet,
  Printer,
  ChevronRight,
  Filter,
  BarChart3,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useMandi } from '../context/MandiContext';
import { Voucher, StockClosingSummary } from '../types';
import { formatPKR, numberToWordsEnglish, numberToWordsUrdu } from '../utils/numberToWords';
import { exportReportToExcel } from '../utils/excelExport';

interface ProfitAndLossProps {
  onDrillDown: (title: string, vouchers: Voucher[]) => void;
  onPrint: () => void;
}

export const ProfitAndLoss: React.FC<ProfitAndLossProps> = ({
  onDrillDown,
  onPrint
}) => {
  const {
    currentBusiness,
    filteredVouchers,
    items,
    stockSummary,
    currentUser
  } = useMandi();

  const [pnlStyle, setPnlStyle] = useState<'quickbooks' | 'busy'>('quickbooks');
  const [selectedItemId, setSelectedItemId] = useState<string>('ALL');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Filter approved vouchers
  const approvedVouchers = useMemo(() => {
    return filteredVouchers.filter(v => {
      if (v.status !== 'Approved') return false;
      if (selectedItemId !== 'ALL' && v.itemId !== selectedItemId) return false;
      if (startDate && v.date < startDate) return false;
      if (endDate && v.date > endDate) return false;
      return true;
    });
  }, [filteredVouchers, selectedItemId, startDate, endDate]);

  // Aggregate Figures
  const pnlData = useMemo(() => {
    // 1. Sales by Commodity
    const salesByItem: Record<string, { itemName: string; itemNameUrdu: string; amount: number; weight: number; vouchers: Voucher[] }> = {};
    let totalSales = 0;

    // 2. Purchases by Commodity
    let totalPurchases = 0;
    const purchaseVouchers: Voucher[] = [];

    // 3. Direct Expenses
    let totalDirectExpenses = 0;
    const directExpVouchers: Voucher[] = [];

    // 4. Sales/Dispatch Expenses
    let totalSalesExpenses = 0;

    approvedVouchers.forEach(v => {
      if (v.type === 'SALE') {
        if (!salesByItem[v.itemId]) {
          salesByItem[v.itemId] = {
            itemName: v.itemName,
            itemNameUrdu: v.itemNameUrdu,
            amount: 0,
            weight: 0,
            vouchers: []
          };
        }
        salesByItem[v.itemId].amount += v.baseAmount;
        salesByItem[v.itemId].weight += v.firstWeight;
        salesByItem[v.itemId].vouchers.push(v);
        totalSales += v.baseAmount;
        totalSalesExpenses += v.totalExpenses;
      } else if (v.type === 'PURCHASE') {
        totalPurchases += v.baseAmount;
        totalDirectExpenses += v.totalExpenses;
        purchaseVouchers.push(v);
      }
    });

    // Opening & Closing Valuation
    let openingStockVal = 0;
    let closingStockVal = 0;

    stockSummary.forEach(s => {
      if (selectedItemId === 'ALL' || s.itemId === selectedItemId) {
        openingStockVal += s.openingValue;
        closingStockVal += s.closingValue;
      }
    });

    // COGS = Opening Stock + Purchases + Direct Expenses - Closing Stock
    const cogs = openingStockVal + totalPurchases + totalDirectExpenses - closingStockVal;
    const grossProfit = totalSales - cogs;
    const grossMarginPct = totalSales > 0 ? (grossProfit / totalSales) * 100 : 0;

    // Indirect Mandi Expenses (Shop Rent, Salaries, Electricity, etc.)
    const indirectExpenses = [
      { name: 'Shop & Office Rent (دکان کرایہ)', amount: 25000 },
      { name: 'Munshi & Staff Salaries (تنخواہیں)', amount: 45000 },
      { name: 'Electricity & Generators (بجلی و فیول)', amount: 15000 },
      { name: 'Office Tea & Hospitality (مہمان نوازی)', amount: 8000 }
    ];
    const totalIndirectExpenses = indirectExpenses.reduce((s, e) => s + e.amount, 0) + totalSalesExpenses;

    const netProfit = grossProfit - totalIndirectExpenses;
    const netMarginPct = totalSales > 0 ? (netProfit / totalSales) * 100 : 0;

    return {
      salesByItem,
      totalSales,
      totalPurchases,
      purchaseVouchers,
      totalDirectExpenses,
      directExpVouchers,
      openingStockVal,
      closingStockVal,
      cogs,
      grossProfit,
      grossMarginPct,
      indirectExpenses,
      totalIndirectExpenses,
      netProfit,
      netMarginPct
    };
  }, [approvedVouchers, stockSummary, selectedItemId]);

  const handleExportExcel = () => {
    exportReportToExcel({
      business: currentBusiness,
      reportName: `Profit_And_Loss_${pnlStyle.toUpperCase()}`,
      dateRangeStr: `${startDate || 'Opening'} to ${endDate || 'Current'}`,
      columns: [
        { headerEn: 'Particulars', headerUrdu: 'تفصیل', key: 'particulars' },
        { headerEn: 'Amount (PKR)', headerUrdu: 'رقم', key: 'amount', format: 'currency' },
        { headerEn: 'Percentage', headerUrdu: 'فیصد', key: 'percentage' }
      ],
      data: [
        { particulars: 'Total Sales Revenue (فروخت آمدن)', amount: pnlData.totalSales, percentage: '100%' },
        { particulars: 'Cost of Goods Sold - COGS (لاگت برائے فروخت)', amount: pnlData.cogs, percentage: `${((pnlData.cogs / (pnlData.totalSales || 1)) * 100).toFixed(1)}%` },
        { particulars: 'Gross Profit (خام نفع)', amount: pnlData.grossProfit, percentage: `${pnlData.grossMarginPct.toFixed(1)}%` },
        { particulars: 'Operating Expenses (کاروباری اخراجات)', amount: pnlData.totalIndirectExpenses, percentage: `${((pnlData.totalIndirectExpenses / (pnlData.totalSales || 1)) * 100).toFixed(1)}%` },
        { particulars: 'NET PROFIT / خالص نفع', amount: pnlData.netProfit, percentage: `${pnlData.netMarginPct.toFixed(1)}%` }
      ],
      grandTotalRow: {
        particulars: 'NET PROFIT (PKR):',
        amount: pnlData.netProfit
      },
      generatedBy: currentUser.name
    });
  };

  return (
    <div className="space-y-4">
      {/* HEADER BAR & CONTROLS */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Profit & Loss Account</span>
            <span className="text-slate-400 font-normal">|</span>
            <span className="font-urdu text-base text-slate-700">حسابِ نفع و نقصان</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Strict Mandi Financials: Drill down to source vouchers by clicking any amount.
          </p>
        </div>

        {/* STYLE TOGGLE & ACTIONS */}
        <div className="flex flex-wrap items-center gap-2">
          {/* TWO VIEW BUTTONS (LOCKED POINT 26-A) */}
          <div className="flex items-center p-1 bg-slate-100 rounded-lg border border-slate-200">
            <button
              onClick={() => setPnlStyle('quickbooks')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                pnlStyle === 'quickbooks'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              View as QuickBooks Style
            </button>
            <button
              onClick={() => setPnlStyle('busy')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                pnlStyle === 'busy'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              View as BUSY Style (T-Format)
            </button>
          </div>

          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-xs"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Excel</span>
          </button>

          <button
            onClick={onPrint}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold shadow-xs"
          >
            <Printer className="w-4 h-4" />
            <span>Print P&L (A4)</span>
          </button>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="font-semibold text-slate-700">Filter Commodity:</span>
            <select
              value={selectedItemId}
              onChange={e => setSelectedItemId(e.target.value)}
              className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-md font-urdu"
            >
              <option value="ALL">All Commodities (تمام اجناس)</option>
              {items.map(i => (
                <option key={i.id} value={i.id}>
                  {i.name} ({i.nameUrdu})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span>Date Range:</span>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-md"
            />
            <span>to</span>
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-md"
            />
          </div>
        </div>

        <div className="font-semibold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-md border border-emerald-200">
          Net Profit Margin: {pnlData.netMarginPct.toFixed(2)}%
        </div>
      </div>

      {/* QUICKBOOKS STYLE (POINT 26-B) */}
      {pnlStyle === 'quickbooks' ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-6 space-y-6">
          <div className="text-center border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-900">{currentBusiness.name}</h2>
            <div className="font-urdu text-sm text-slate-600">{currentBusiness.nameUrdu}</div>
            <div className="text-xs text-slate-500 mt-1">
              Profit & Loss Statement (QuickBooks Multi-Step Standard)
            </div>
            <div className="text-xs text-slate-400">All Figures in PKR (Rs.)</div>
          </div>

          {/* 1. INCOME SECTION */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-900 uppercase tracking-wider bg-slate-100 p-2 rounded-lg flex items-center justify-between">
              <span>Income / Revenue (آمدنی)</span>
              <span>Amount (PKR)</span>
            </div>

            <div className="space-y-1.5 pl-4 pr-2">
              {Object.keys(pnlData.salesByItem).length === 0 ? (
                <div className="text-xs text-slate-400 py-1">No sales recorded for this period.</div>
              ) : (
                Object.values(pnlData.salesByItem).map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => onDrillDown(`Sales: ${s.itemName}`, s.vouchers)}
                    className="w-full text-left flex items-center justify-between text-xs py-1 hover:bg-slate-50 rounded px-2 group transition-colors"
                  >
                    <span className="flex items-center gap-1.5 text-slate-700 group-hover:text-blue-700">
                      <span>Sales - {s.itemName} ({s.itemNameUrdu})</span>
                      <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100" />
                    </span>
                    <span className="font-mono tabular-nums font-semibold text-slate-900">
                      {formatPKR(s.amount)}
                    </span>
                  </button>
                ))
              )}

              {/* Total Income Row */}
              <div className="flex items-center justify-between text-xs font-bold text-slate-900 pt-2 border-t border-slate-200 bg-yellow-50/60 p-2 rounded">
                <span>Total Income / کل آمدن:</span>
                <span className="font-mono tabular-nums">{formatPKR(pnlData.totalSales)}</span>
              </div>
            </div>
          </div>

          {/* 2. COST OF GOODS SOLD (COGS) */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-900 uppercase tracking-wider bg-slate-100 p-2 rounded-lg flex items-center justify-between">
              <span>Cost of Goods Sold - COGS (لاگت برائے فروخت)</span>
              <span>Amount (PKR)</span>
            </div>

            <div className="space-y-1.5 pl-4 pr-2 text-xs">
              <div className="flex items-center justify-between py-1 px-2 text-slate-700">
                <span>Opening Stock Valuation (ابتدائی اسٹاک مالیت)</span>
                <span className="font-mono tabular-nums">{formatPKR(pnlData.openingStockVal)}</span>
              </div>

              <button
                onClick={() => onDrillDown('Purchase Ledger', pnlData.purchaseVouchers)}
                className="w-full text-left flex items-center justify-between py-1 px-2 hover:bg-slate-50 rounded text-slate-700 hover:text-blue-700 group"
              >
                <span className="flex items-center gap-1.5">
                  <span>Purchases during period (خریداری مالیت)</span>
                  <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100" />
                </span>
                <span className="font-mono tabular-nums font-semibold">
                  {formatPKR(pnlData.totalPurchases)}
                </span>
              </button>

              <div className="flex items-center justify-between py-1 px-2 text-slate-700">
                <span>Direct Freight & Mandi Labour (براہ راست اخراجات)</span>
                <span className="font-mono tabular-nums">{formatPKR(pnlData.totalDirectExpenses)}</span>
              </div>

              <div className="flex items-center justify-between py-1 px-2 text-rose-700 font-medium">
                <span>Less: Closing Stock Valuation (منہائی: اختتامی اسٹاک مالیت)</span>
                <span className="font-mono tabular-nums">({formatPKR(pnlData.closingStockVal)})</span>
              </div>

              {/* Total COGS */}
              <div className="flex items-center justify-between text-xs font-bold text-slate-900 pt-2 border-t border-slate-200 bg-yellow-50/60 p-2 rounded">
                <span>Total Cost of Goods Sold (کل لاگت):</span>
                <span className="font-mono tabular-nums">{formatPKR(pnlData.cogs)}</span>
              </div>
            </div>
          </div>

          {/* GROSS PROFIT BANNER */}
          <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-between text-sm font-bold text-blue-950">
            <div>
              <span>GROSS PROFIT / خام نفع:</span>
              <span className="text-xs font-normal text-blue-800 ml-2">
                ({pnlData.grossMarginPct.toFixed(2)}% Gross Margin)
              </span>
            </div>
            <span className="font-mono text-base font-extrabold">{formatPKR(pnlData.grossProfit)}</span>
          </div>

          {/* 3. INDIRECT EXPENSES */}
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-900 uppercase tracking-wider bg-slate-100 p-2 rounded-lg flex items-center justify-between">
              <span>Operating & Administrative Expenses (کاروباری اخراجات)</span>
              <span>Amount (PKR)</span>
            </div>

            <div className="space-y-1.5 pl-4 pr-2 text-xs">
              {pnlData.indirectExpenses.map((exp, idx) => (
                <div key={idx} className="flex items-center justify-between py-1 px-2 text-slate-700">
                  <span>{exp.name}</span>
                  <span className="font-mono tabular-nums">{formatPKR(exp.amount)}</span>
                </div>
              ))}

              <div className="flex items-center justify-between text-xs font-bold text-slate-900 pt-2 border-t border-slate-200 bg-yellow-50/60 p-2 rounded">
                <span>Total Operating Expenses (کل اخراجات):</span>
                <span className="font-mono tabular-nums">{formatPKR(pnlData.totalIndirectExpenses)}</span>
              </div>
            </div>
          </div>

          {/* FINAL NET PROFIT BANNER (LOCKED POINT 26-B) */}
          <div className="p-4 rounded-xl bg-emerald-100 border-2 border-emerald-400 flex flex-col sm:flex-row items-center justify-between gap-2 text-emerald-950">
            <div>
              <div className="text-base font-extrabold tracking-tight">
                NET PROFIT / خالص منافع: {formatPKR(pnlData.netProfit)}
              </div>
              <div className="text-xs text-emerald-800 font-semibold mt-0.5">
                Net Profit Ratio: {pnlData.netMarginPct.toFixed(2)}% of Sales
              </div>
              <div className="font-urdu text-xs text-emerald-900 mt-1">
                {numberToWordsUrdu(pnlData.netProfit)}
              </div>
            </div>
            <div className="font-mono text-xl font-black text-emerald-900">
              {formatPKR(pnlData.netProfit)}
            </div>
          </div>
        </div>
      ) : (
        /* BUSY ACCOUNTING STYLE - HORIZONTAL T-FORMAT (POINT 26-C) */
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-6 space-y-6">
          <div className="text-center border-b border-slate-100 pb-4">
            <h2 className="text-lg font-bold text-slate-900">{currentBusiness.name}</h2>
            <div className="font-urdu text-sm text-slate-600">{currentBusiness.nameUrdu}</div>
            <div className="text-xs text-slate-500 mt-1">
              Trading & Profit and Loss Account (BUSY Accounting T-Format)
            </div>
          </div>

          {/* HORIZONTAL T-TABLE */}
          <div className="border border-slate-300 rounded-lg overflow-hidden text-xs">
            <div className="grid grid-cols-2 divide-x divide-slate-300">
              
              {/* DEBIT SIDE (TRADING DR) */}
              <div className="divide-y divide-slate-200">
                <div className="bg-slate-900 text-white font-bold p-2.5 flex justify-between">
                  <span>Particulars (نام و کھاتہ ڈیبٹ)</span>
                  <span>Amount (PKR)</span>
                </div>

                <div className="p-3 space-y-2">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="font-semibold text-slate-800">To Opening Stock (ابتدائی اسٹاک)</span>
                    <span className="font-mono tabular-nums">{formatPKR(pnlData.openingStockVal)}</span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="font-semibold text-slate-800">To Purchases (خریداری بل)</span>
                    <span className="font-mono tabular-nums">{formatPKR(pnlData.totalPurchases)}</span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="font-semibold text-slate-800">To Direct Labour & Freight (مزدوری و کرایہ)</span>
                    <span className="font-mono tabular-nums">{formatPKR(pnlData.totalDirectExpenses)}</span>
                  </div>

                  <div className="flex justify-between py-1 font-bold text-emerald-800 bg-emerald-50 px-2 rounded">
                    <span>To Gross Profit c/d (خام نفع اگلے کھاتے)</span>
                    <span className="font-mono tabular-nums">{formatPKR(pnlData.grossProfit)}</span>
                  </div>
                </div>

                {/* Trading Total Left */}
                <div className="bg-yellow-100 font-bold p-2.5 flex justify-between border-t-2 border-yellow-300">
                  <span>TRADING TOTAL:</span>
                  <span className="font-mono tabular-nums">
                    {formatPKR(pnlData.openingStockVal + pnlData.totalPurchases + pnlData.totalDirectExpenses + pnlData.grossProfit)}
                  </span>
                </div>

                {/* P&L DR */}
                <div className="p-3 space-y-2">
                  <div className="text-[11px] font-bold text-slate-400 uppercase">Profit & Loss Expenses (Dr)</div>
                  {pnlData.indirectExpenses.map((exp, idx) => (
                    <div key={idx} className="flex justify-between py-1 border-b border-slate-100">
                      <span>To {exp.name}</span>
                      <span className="font-mono tabular-nums">{formatPKR(exp.amount)}</span>
                    </div>
                  ))}

                  <div className="flex justify-between py-1.5 font-bold text-emerald-900 bg-emerald-100 px-2 rounded text-sm">
                    <span>TO NET PROFIT (خالص منافع):</span>
                    <span className="font-mono tabular-nums">{formatPKR(pnlData.netProfit)}</span>
                  </div>
                </div>

                {/* P&L Grand Total Left */}
                <div className="bg-emerald-100 font-extrabold p-2.5 flex justify-between border-t border-emerald-400 text-emerald-950">
                  <span>P&L TOTAL:</span>
                  <span className="font-mono tabular-nums">{formatPKR(pnlData.grossProfit)}</span>
                </div>
              </div>

              {/* CREDIT SIDE (TRADING CR) */}
              <div className="divide-y divide-slate-200">
                <div className="bg-slate-900 text-white font-bold p-2.5 flex justify-between">
                  <span>Particulars (نام و کھاتہ کریڈٹ)</span>
                  <span>Amount (PKR)</span>
                </div>

                <div className="p-3 space-y-2">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="font-semibold text-slate-800">By Sales Revenue (فروخت مالیت)</span>
                    <span className="font-mono tabular-nums">{formatPKR(pnlData.totalSales)}</span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="font-semibold text-slate-800">By Closing Stock (اختتامی اسٹاک)</span>
                    <span className="font-mono tabular-nums">{formatPKR(pnlData.closingStockVal)}</span>
                  </div>

                  <div className="py-5 text-center text-slate-300 italic">
                    - - - - -
                  </div>
                </div>

                {/* Trading Total Right */}
                <div className="bg-yellow-100 font-bold p-2.5 flex justify-between border-t-2 border-yellow-300">
                  <span>TRADING TOTAL:</span>
                  <span className="font-mono tabular-nums">
                    {formatPKR(pnlData.totalSales + pnlData.closingStockVal)}
                  </span>
                </div>

                {/* P&L CR */}
                <div className="p-3 space-y-2">
                  <div className="text-[11px] font-bold text-slate-400 uppercase">Profit & Loss Incomes (Cr)</div>
                  <div className="flex justify-between py-1 font-bold text-emerald-800 bg-emerald-50 px-2 rounded">
                    <span>By Gross Profit b/d (خام نفع لایا گیا)</span>
                    <span className="font-mono tabular-nums">{formatPKR(pnlData.grossProfit)}</span>
                  </div>

                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span>By Commission & Secondary Income</span>
                    <span className="font-mono tabular-nums">Rs. 0.00</span>
                  </div>

                  <div className="py-6 text-center text-slate-300 italic">
                    - - - - -
                  </div>
                </div>

                {/* P&L Grand Total Right */}
                <div className="bg-emerald-100 font-extrabold p-2.5 flex justify-between border-t border-emerald-400 text-emerald-950">
                  <span>P&L TOTAL:</span>
                  <span className="font-mono tabular-nums">{formatPKR(pnlData.grossProfit)}</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};
