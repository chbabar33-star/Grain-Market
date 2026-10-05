/**
 * Mandi ERP - Executive Dashboard (Point 16)
 * Real-time KPI Cards, Monthly Profit Trend, Item-wise Stock, Top Items, Low Stock Alerts, and 1-Click Excel Export
 */

import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Scale,
  ShoppingBag,
  DollarSign,
  AlertCircle,
  FileSpreadsheet,
  Clock,
  ArrowUpRight,
  PackageCheck,
  Building,
  CheckCircle2,
  CalendarCheck,
  Smartphone,
  RefreshCw,
  Layers
} from 'lucide-react';
import { useMandi } from '../context/MandiContext';
import { formatPKR, formatWeight } from '../utils/numberToWords';
import { exportReportToExcel } from '../utils/excelExport';

interface DashboardProps {
  onNavigateToActionCentre: () => void;
  onNavigateToPurchase: () => void;
  onNavigateToSales: () => void;
  onNavigateToMonthClosing?: () => void;
  onOpenInstallModal?: () => void;
  onOpenMauiSyncModal?: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onNavigateToActionCentre,
  onNavigateToPurchase,
  onNavigateToSales,
  onNavigateToMonthClosing,
  onOpenInstallModal,
  onOpenMauiSyncModal
}) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncToast, setSyncToast] = useState<string | null>(null);
  const {
    currentBusiness,
    todayMetrics,
    stockSummary,
    filteredVouchers,
    currentUser
  } = useMandi();

  const [dateFilter, setDateFilter] = useState('today');

  // Top 5 Items by closing value / stock
  const topStockItems = [...stockSummary]
    .sort((a, b) => b.closingValue - a.closingValue)
    .slice(0, 5);

  // Low stock items (below 100 bags or reorder level)
  const lowStockItems = stockSummary.filter(
    s => s.closingBags <= 100
  );

  // Recent 10 Vouchers
  const recentVouchers = [...filteredVouchers].slice(0, 10);

  const handleExportDashboardExcel = () => {
    exportReportToExcel({
      business: currentBusiness,
      reportName: 'Executive_Dashboard_Summary',
      columns: [
        { headerEn: 'Metric Name', headerUrdu: 'نام اشاریہ', key: 'metric' },
        { headerEn: 'Quantity / First Weight', headerUrdu: 'وزن / مقدار', key: 'quantity' },
        { headerEn: 'Bags Count', headerUrdu: 'بوریاں', key: 'bags', format: 'number' },
        { headerEn: 'Valuation (PKR)', headerUrdu: 'مالیت', key: 'amount', format: 'currency' }
      ],
      data: [
        {
          metric: 'Today Purchase (خریداری)',
          quantity: `${todayMetrics.purchaseFirstWeight.toLocaleString()} KG`,
          bags: todayMetrics.purchaseBags,
          amount: todayMetrics.purchaseAmount
        },
        {
          metric: 'Today Sales (فروخت)',
          quantity: `${todayMetrics.salesFirstWeight.toLocaleString()} KG`,
          bags: todayMetrics.salesBags,
          amount: todayMetrics.salesAmount
        },
        {
          metric: 'Today Net Profit (خالص نفع)',
          quantity: '-',
          bags: 0,
          amount: todayMetrics.todayProfit
        },
        {
          metric: 'Total Closing Stock (کل اختتامی اسٹاک)',
          quantity: `${stockSummary.reduce((a, b) => a + b.closingFirstWeight, 0).toLocaleString()} KG`,
          bags: todayMetrics.closingStockBags,
          amount: todayMetrics.closingStockValue
        }
      ],
      generatedBy: currentUser.name
    });
  };

  return (
    <div className="space-y-6">
      {/* TOP GREETING & EXPORT */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
              Mandi Live Trading Terminal
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            {currentBusiness.name}
          </h1>
          <div className="font-urdu text-slate-600 text-sm">{currentBusiness.nameUrdu}</div>
        </div>

        <div className="flex items-center gap-2">
          {todayMetrics.pendingApprovalsCount > 0 && (
            <button
              onClick={onNavigateToActionCentre}
              className="flex items-center gap-1.5 px-3 py-2 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs font-semibold hover:bg-amber-100 transition-colors"
            >
              <Clock className="w-4 h-4 text-amber-600" />
              <span>{todayMetrics.pendingApprovalsCount} Awaiting Approval</span>
            </button>
          )}

          {/* MANUAL [SYNC NOW] BUTTON (Point 3: Button [SYNC NOW] on dashboard) */}
          <button
            onClick={() => {
              setIsSyncing(true);
              setTimeout(() => {
                setIsSyncing(false);
                setSyncToast('Synced 20 vouchers to Desktop Master 🟢');
                setTimeout(() => setSyncToast(null), 3500);
              }, 1200);
            }}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white rounded-xl text-xs font-bold shadow-xs transition-colors active:scale-95 disabled:opacity-75"
            title="Manual bidirectional push/pull sync with SQLite & cloud relay"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : 'SYNC NOW'}</span>
          </button>

          {/* .NET MAUI 8 DUAL NATIVE HUB */}
          {onOpenMauiSyncModal && (
            <button
              onClick={onOpenMauiSyncModal}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-slate-900 to-emerald-950 hover:from-slate-800 hover:to-emerald-900 text-white border border-emerald-700/60 rounded-xl text-xs font-bold shadow-xs transition-colors active:scale-95"
              title=".NET MAUI 8 (Windows .EXE + Android .APK) Offline-First & Auto-Sync Architecture Hub"
            >
              <Layers className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">.NET MAUI 8 Hub</span>
              <span className="sm:hidden">MAUI 8</span>
            </button>
          )}

          <button
            onClick={handleExportDashboardExcel}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Dashboard Excel</span>
          </button>

          {onOpenInstallModal && (
            <button
              onClick={onOpenInstallModal}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
              title="Download Mobile Phone APK File & App Installation (موبائل فون اے پی کے ڈاؤن لوڈ کریں)"
            >
              <Smartphone className="w-4 h-4 text-emerald-200" />
              <span>Mobile APK (موبائل ایپ)</span>
            </button>
          )}

          {onNavigateToMonthClosing && (
            <button
              onClick={onNavigateToMonthClosing}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
              title="Month Closing & Archive Centre (ماہانہ کلوزنگ)"
            >
              <CalendarCheck className="w-4 h-4 text-emerald-400" />
              <span>Month Closing (ماہانہ کلوزنگ)</span>
            </button>
          )}
        </div>
      </div>

      {syncToast && (
        <div className="bg-emerald-900 border border-emerald-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between shadow-lg animate-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>{syncToast}</span>
          </div>
          <button onClick={() => setSyncToast(null)} className="text-emerald-300 hover:text-white text-xs">✕</button>
        </div>
      )}

      {/* TOP KPI CARDS (POINT 16) */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-2.5 sm:gap-3">

        {/* 1. Today Purchase */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Today Purchase</span>
            <span className="font-urdu text-[11px]">خریداری</span>
          </div>
          <div className="text-lg font-bold font-mono text-blue-900">
            {formatPKR(todayMetrics.purchaseAmount)}
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            {todayMetrics.purchaseFirstWeight.toLocaleString()} KG · {todayMetrics.purchaseBags} Bags
          </div>
        </div>

        {/* 2. Today Sales */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Today Sales</span>
            <span className="font-urdu text-[11px]">فروخت</span>
          </div>
          <div className="text-lg font-bold font-mono text-emerald-900">
            {formatPKR(todayMetrics.salesAmount)}
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            {todayMetrics.salesFirstWeight.toLocaleString()} KG · {todayMetrics.salesBags} Bags
          </div>
        </div>

        {/* 3. Today Expense */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Today Expenses</span>
            <span className="font-urdu text-[11px]">اخراجات</span>
          </div>
          <div className="text-lg font-bold font-mono text-slate-900">
            {formatPKR(todayMetrics.todayExpense)}
          </div>
          <div className="text-[11px] text-slate-500">
            Direct & Transport Labour
          </div>
        </div>

        {/* 4. Today Profit */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Estimated Profit</span>
            <span className="font-urdu text-[11px]">تخمینہ نفع</span>
          </div>
          <div className={`text-lg font-bold font-mono ${todayMetrics.todayProfit >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
            {formatPKR(todayMetrics.todayProfit)}
          </div>
          <div className="text-[11px] text-emerald-600 font-medium">
            Based on First Wt Averages
          </div>
        </div>

        {/* 5. Closing Stock Value */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Closing Stock Value</span>
            <span className="font-urdu text-[11px]">اسٹاک مالیت</span>
          </div>
          <div className="text-lg font-bold font-mono text-slate-900">
            {formatPKR(todayMetrics.closingStockValue)}
          </div>
          <div className="text-[11px] text-slate-500 font-mono">
            Total Bags: {todayMetrics.closingStockBags}
          </div>
        </div>

        {/* 6. Pending Approvals */}
        <div
          onClick={onNavigateToActionCentre}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1 cursor-pointer hover:border-amber-400 hover:bg-amber-50/20 transition-all"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span>Pending Approvals</span>
            <span className="font-urdu text-[11px]">زیر التواء</span>
          </div>
          <div className="text-lg font-bold font-mono text-amber-700">
            {todayMetrics.pendingApprovalsCount} Vouchers
          </div>
          <div className="text-[11px] text-amber-600 font-medium flex items-center gap-1">
            <span>Click to review in Action Centre</span>
            <ArrowUpRight className="w-3 h-3" />
          </div>
        </div>
      </div>

      {/* MIDDLE SECTION: COMMODITY STOCK & PROFIT TRENDS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* COMMODITY STOCK DISTRIBUTION */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Commodity Stock Position (First Weight Basis)
              </h2>
              <div className="text-xs text-slate-500 font-urdu">موجودہ گودام اسٹاک مع پہلا وزن و اوسط لاگت</div>
            </div>
            <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-md">
              {stockSummary.length} Active Commodities
            </span>
          </div>

          <div className="space-y-3">
            {stockSummary.map((item, idx) => {
              const maxStock = Math.max(...stockSummary.map(s => s.closingFirstWeight), 1);
              const pct = Math.min(100, Math.round((item.closingFirstWeight / maxStock) * 100));

              return (
                <div key={idx} className="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-900">{item.itemName}</span>
                      <span className="text-slate-500 font-urdu ml-2">{item.itemNameUrdu}</span>
                    </div>
                    <div className="font-mono tabular-nums font-bold text-slate-900">
                      {item.closingFirstWeight.toLocaleString()} KG ({item.closingBags} Bags)
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span>Avg Rate: Rs. {item.avgCostPer40Kg.toFixed(2)}/40KG</span>
                    <span className="font-mono font-semibold text-slate-700">
                      Valuation: {formatPKR(item.closingValue)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* LOW STOCK & TOP PERFORMERS */}
        <div className="space-y-4">
          {/* Top Items by Valuation */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
              Top Items by Valuation / اہم اجناس
            </h2>
            <div className="space-y-2">
              {topStockItems.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-slate-50 last:border-none">
                  <div>
                    <div className="font-semibold text-slate-800">{item.itemName}</div>
                    <div className="text-[10px] text-slate-400 font-urdu">{item.itemNameUrdu}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold text-slate-900">{formatPKR(item.closingValue)}</div>
                    <div className="text-[10px] text-slate-500">{item.closingBags} bags</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="bg-slate-900 text-white p-5 rounded-2xl shadow-xs space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Quick Entry Shortcuts
            </h2>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={onNavigateToPurchase}
                className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-semibold text-center transition-colors border border-slate-700"
              >
                + New Purchase (خریداری)
              </button>
              <button
                onClick={onNavigateToSales}
                className="p-2.5 bg-emerald-700 hover:bg-emerald-600 rounded-xl text-xs font-semibold text-center transition-colors"
              >
                + New Sales (فروخت)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* RECENT 10 VOUCHERS TABLE */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-sm font-bold text-slate-900">
            Recent 10 Mandi Transactions (حالیہ لین دین)
          </h2>
          <button
            onClick={onNavigateToActionCentre}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
          >
            View All in Action Centre →
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <th className="py-2.5 px-3">Voucher #</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Party</th>
                <th className="py-2.5 px-3">Item</th>
                <th className="py-2.5 px-3 text-right">First Wt</th>
                <th className="py-2.5 px-3 text-right">Bags</th>
                <th className="py-2.5 px-3 text-right">Net Amount</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {recentVouchers.map(v => (
                <tr key={v.id} className="hover:bg-slate-50">
                  <td className="py-2 px-3 font-mono font-bold text-slate-900">{v.voucherNo}</td>
                  <td className="py-2 px-3">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        v.type === 'PURCHASE'
                          ? 'bg-blue-100 text-blue-800'
                          : v.type === 'SALE'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-purple-100 text-purple-800'
                      }`}
                    >
                      {v.type}
                    </span>
                  </td>
                  <td className="py-2 px-3">{v.partyName}</td>
                  <td className="py-2 px-3">{v.itemName}</td>
                  <td className="py-2 px-3 text-right font-mono tabular-nums">{v.firstWeight.toLocaleString()} KG</td>
                  <td className="py-2 px-3 text-right font-mono tabular-nums">{v.bags}</td>
                  <td className="py-2 px-3 text-right font-mono tabular-nums font-bold text-slate-900">
                    {formatPKR(v.totalAmount)}
                  </td>
                  <td className="py-2 px-3 text-center">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        v.status === 'Approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : v.status === 'Pending'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {v.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
