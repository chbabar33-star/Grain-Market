import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Lock,
  Unlock,
  CheckCircle2,
  AlertTriangle,
  FolderArchive,
  Download,
  Printer,
  Eye,
  FileSpreadsheet,
  Scale,
  Receipt,
  Building2,
  FileText,
  Filter,
  Sparkles,
  ArrowRight,
  Search
} from 'lucide-react';
import { Business, MonthClosingRecord, Voucher, Party, Item, BardanaMaster } from '../types';
import { formatPKR } from '../utils/numberToWords';

interface AugSepPeriodWorkspaceProps {
  business: Business;
  record?: MonthClosingRecord;
  liveVouchers: Voucher[];
  parties: Party[];
  items: Item[];
  bardanaMasters: BardanaMaster[];
  activeMonthFilter: string;
  onSetActiveFilter: (filter: string) => void;
  onPrintCertificate: (rec: MonthClosingRecord) => void;
  onExportJson: (monthKey: string) => void;
  onExportExcel: () => void;
  onUnlock: (rec: MonthClosingRecord) => void;
  onRelock: () => void;
  onCloseWizardRequest: () => void;
}

export const AugSepPeriodWorkspace: React.FC<AugSepPeriodWorkspaceProps> = ({
  business,
  record,
  liveVouchers,
  parties,
  items,
  bardanaMasters,
  activeMonthFilter,
  onSetActiveFilter,
  onPrintCertificate,
  onExportJson,
  onExportExcel,
  onUnlock,
  onRelock,
  onCloseWizardRequest
}) => {
  const [inspectTab, setInspectTab] = useState<'vouchers' | 'parties' | 'stock' | 'bardana' | 'pnl'>('vouchers');
  const [voucherFilterType, setVoucherFilterType] = useState<string>('ALL');
  const [voucherSearch, setVoucherSearch] = useState('');

  // Fallback vouchers if snapshot is empty
  const displayVouchers = useMemo(() => {
    if (record && record.vouchers && record.vouchers.length > 0) {
      return record.vouchers;
    }
    return liveVouchers;
  }, [record, liveVouchers]);

  // Filtered vouchers
  const filteredVouchers = useMemo(() => {
    return displayVouchers.filter(v => {
      if (voucherFilterType !== 'ALL' && v.type !== voucherFilterType) return false;
      if (voucherSearch.trim()) {
        const q = voucherSearch.toLowerCase();
        return (
          v.voucherNo.toLowerCase().includes(q) ||
          v.partyName.toLowerCase().includes(q) ||
          (v.itemName && v.itemName.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [displayVouchers, voucherFilterType, voucherSearch]);

  const isFilteredInERP = activeMonthFilter === '2026-08-01_to_2026-09-30';

  // Metrics (use locked record if available, else derive from vouchers)
  const metrics = useMemo(() => {
    if (record) {
      return {
        vouchersCount: record.totalVouchersCount,
        purchaseWeight: record.totalPurchaseWeightKg,
        purchaseAmount: record.totalPurchaseAmount,
        salesWeight: record.totalSalesWeightKg,
        salesAmount: record.totalSalesAmount,
        expensesAmount: record.totalExpensesAmount,
        netProfit: record.netMandiProfit,
        isLocked: record.isLocked
      };
    }

    let pWeight = 0, pAmount = 0, sWeight = 0, sAmount = 0, exp = 0;
    liveVouchers.forEach(v => {
      if (v.status !== 'Approved') return;
      if (v.type === 'PURCHASE') {
        pWeight += v.firstWeight;
        pAmount += v.totalAmount;
        exp += v.totalExpenses;
      } else if (v.type === 'SALE') {
        sWeight += v.firstWeight;
        sAmount += v.totalAmount;
        exp += v.totalExpenses;
      } else if (v.type === 'EXPENSE') {
        exp += v.totalAmount;
      }
    });

    return {
      vouchersCount: liveVouchers.length,
      purchaseWeight: pWeight,
      purchaseAmount: pAmount,
      salesWeight: sWeight,
      salesAmount: sAmount,
      expensesAmount: exp,
      netProfit: sAmount - pAmount - exp,
      isLocked: false
    };
  }, [record, liveVouchers]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* 1. HERO PERIOD BANNER */}
      <div className="bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-950 text-white rounded-2xl p-5 sm:p-6 border border-emerald-800 shadow-xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 relative z-10">
          
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-bold text-xs border border-amber-400/40 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Multi-Month Seasonal Period (نہ صرف ایک مہینہ)</span>
              </span>
              
              <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-emerald-200 text-xs font-mono font-bold">
                61 Days · 2 Full Months (Aug & Sep 2026)
              </span>

              {metrics.isLocked ? (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30 flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  <span>🔒 LOCKED & ARCHIVED</span>
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>🟢 OPEN FOR CLOSING</span>
                </span>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex flex-wrap items-center gap-2">
              <span>01 Aug 2026 to 30 Sep 2026</span>
              <span className="text-emerald-400 font-urdu text-lg sm:text-xl font-bold">
                (۰۱ اگست ۲۰۲۶ تا ۳۰ ستمبر ۲۰۲۶)
              </span>
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-urdu">
              یہ دو ماہ (اگست اور ستمبر ۲۰۲۶) کا مکمل خریف سیزن پیریڈ اکاؤنٹنگ ہے، جس میں تمام خریدو فروخت، وزن، کھاتہ جات اور اجناس کے کلوزنگ بیلنسز یکجا و محفوظ ہیں۔
            </p>

            <p className="text-xs text-emerald-200/90 leading-relaxed">
              Consolidated 2-month Kharif cycle closing covering Basmati Paddy arrivals, Wheat Lok-1 stock movements, Bardana inventory, and Party Khatas. Not a single 30-day month.
            </p>
          </div>

          {/* QUICK ACTION BUTTONS */}
          <div className="flex flex-wrap lg:flex-col gap-2 shrink-0 w-full sm:w-auto">
            {/* Filter Toggle */}
            <button
              onClick={() => onSetActiveFilter(isFilteredInERP ? 'all' : '2026-08-01_to_2026-09-30')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 border shadow-xs ${
                isFilteredInERP
                  ? 'bg-amber-400 text-slate-950 border-amber-300 hover:bg-amber-300'
                  : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
              }`}
            >
              <Filter className="w-4 h-4" />
              <span>{isFilteredInERP ? 'Filter Active (فلٹر ختم کریں)' : 'Filter Entire ERP to this 2-Mo Period'}</span>
            </button>

            {/* Print Certificate */}
            {record && (
              <button
                onClick={() => onPrintCertificate(record)}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs"
              >
                <Printer className="w-4 h-4" />
                <span>Print Official Certificate (سرٹیفکیٹ)</span>
              </button>
            )}

            {/* Export Excel */}
            <button
              onClick={onExportExcel}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-300 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 border border-slate-700"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Export 2-Month Excel</span>
            </button>

            {/* Download JSON */}
            {record && (
              <button
                onClick={() => onExportJson(record.monthKey)}
                className="px-3.5 py-2 bg-white/5 hover:bg-white/10 text-slate-200 rounded-xl text-xs font-semibold transition flex items-center justify-center gap-2 border border-white/10"
              >
                <Download className="w-4 h-4" />
                <span>Download JSON Archive</span>
              </button>
            )}

            {/* Unlock / Lock */}
            {record && record.isLocked ? (
              <button
                onClick={() => onUnlock(record)}
                className="px-3.5 py-2 text-amber-300 hover:text-white hover:bg-amber-900/40 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border border-amber-500/30"
              >
                <Unlock className="w-3.5 h-3.5" />
                <span>Unlock Period</span>
              </button>
            ) : (
              <button
                onClick={onRelock}
                className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Lock / Finalize Period</span>
              </button>
            )}
          </div>

        </div>
      </div>

      {/* 2. MULTI-MONTH KPI CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[10px] text-slate-500 font-semibold uppercase">Sales Turnover</div>
          <div className="text-base sm:text-lg font-black text-slate-900 mt-1 truncate">
            {formatPKR(metrics.salesAmount)}
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
            {metrics.salesWeight.toLocaleString()} KG (1,550 Mnds)
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[10px] text-slate-500 font-semibold uppercase">Inward Purchases</div>
          <div className="text-base sm:text-lg font-black text-slate-900 mt-1 truncate">
            {formatPKR(metrics.purchaseAmount)}
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
            {metrics.purchaseWeight.toLocaleString()} KG First Wt
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[10px] text-slate-500 font-semibold uppercase">Direct Expenses</div>
          <div className="text-base sm:text-lg font-black text-rose-700 mt-1 truncate">
            {formatPKR(metrics.expensesAmount)}
          </div>
          <div className="text-[10px] text-rose-500 font-urdu mt-0.5">
            مزدوری و ٹرانسپورٹ
          </div>
        </div>

        <div className="bg-emerald-50/80 p-3.5 rounded-2xl border border-emerald-200 shadow-xs">
          <div className="text-[10px] text-emerald-800 font-bold uppercase">Net Mandi Profit</div>
          <div className="text-base sm:text-lg font-black text-emerald-950 mt-1 truncate">
            {formatPKR(metrics.netProfit)}
          </div>
          <div className="text-[10px] text-emerald-700 font-urdu font-bold mt-0.5">
            ۲ ماہ کا خالص منافع
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[10px] text-slate-500 font-semibold uppercase">Wheat Lok-1 Stock</div>
          <div className="text-base sm:text-lg font-black text-slate-900 mt-1 truncate">
            23,000 KG
          </div>
          <div className="text-[10px] text-emerald-600 font-semibold mt-0.5">
            460 Bags (Rs. 2.24M)
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="text-[10px] text-slate-500 font-semibold uppercase">Bardana Jute Bags</div>
          <div className="text-base sm:text-lg font-black text-slate-900 mt-1 truncate">
            1,560 Bags
          </div>
          <div className="text-[10px] text-purple-600 font-urdu mt-0.5">
            پٹ سن بوری بقایا
          </div>
        </div>
      </div>

      {/* 3. IN-PLACE MULTI-MONTH TABBED SUB-VIEWS */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        
        {/* SUB-TABS NAVIGATION */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 sm:px-6 overflow-x-auto scrollbar-none text-xs">
          <button
            onClick={() => setInspectTab('vouchers')}
            className={`py-3 px-3.5 font-bold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition ${
              inspectTab === 'vouchers'
                ? 'border-emerald-600 text-emerald-900 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Receipt className="w-4 h-4 text-emerald-600" />
            <span>01 Aug - 30 Sep Vouchers ({displayVouchers.length})</span>
            <span className="font-urdu text-[11px] opacity-75">(واؤچرز رجسٹر)</span>
          </button>

          <button
            onClick={() => setInspectTab('parties')}
            className={`py-3 px-3.5 font-bold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition ${
              inspectTab === 'parties'
                ? 'border-emerald-600 text-emerald-900 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-4 h-4 text-blue-600" />
            <span>Party Khatas & Ledgers ({record?.partySummaries?.length || parties.length})</span>
            <span className="font-urdu text-[11px] opacity-75">(کھاتہ جات)</span>
          </button>

          <button
            onClick={() => setInspectTab('stock')}
            className={`py-3 px-3.5 font-bold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition ${
              inspectTab === 'stock'
                ? 'border-emerald-600 text-emerald-900 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Scale className="w-4 h-4 text-amber-600" />
            <span>Commodity Stock Closing ({record?.stockSummaries?.length || items.length})</span>
            <span className="font-urdu text-[11px] opacity-75">(اجناس اسٹاک)</span>
          </button>

          <button
            onClick={() => setInspectTab('bardana')}
            className={`py-3 px-3.5 font-bold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition ${
              inspectTab === 'bardana'
                ? 'border-emerald-600 text-emerald-900 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FolderArchive className="w-4 h-4 text-purple-600" />
            <span>Bardana Balance ({record?.bardanaSummaries?.length || bardanaMasters.length})</span>
            <span className="font-urdu text-[11px] opacity-75">(باردانہ رجسٹر)</span>
          </button>

          <button
            onClick={() => setInspectTab('pnl')}
            className={`py-3 px-3.5 font-bold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition ${
              inspectTab === 'pnl'
                ? 'border-emerald-600 text-emerald-900 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4 text-teal-600" />
            <span>2-Month P&L Trading Summary</span>
            <span className="font-urdu text-[11px] opacity-75">(نفع و نقصان)</span>
          </button>
        </div>

        {/* TAB CONTENTS */}
        <div className="p-4 sm:p-6">
          
          {/* 1. VOUCHERS SUB-TAB */}
          {inspectTab === 'vouchers' && (
            <div className="space-y-4">
              
              {/* FILTERS & SEARCH BAR */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div className="flex flex-wrap gap-1.5">
                  {(['ALL', 'PURCHASE', 'SALE', 'EXPENSE', 'TRANSFER'] as const).map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setVoucherFilterType(type)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                        voucherFilterType === type
                          ? 'bg-emerald-800 text-white shadow-xs'
                          : 'bg-white text-slate-600 hover:bg-slate-200/60 border border-slate-200'
                      }`}
                    >
                      {type === 'ALL' ? 'All Types (تمام)' : type}
                    </button>
                  ))}
                </div>

                <div className="relative w-full sm:w-64">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={voucherSearch}
                    onChange={e => setVoucherSearch(e.target.value)}
                    placeholder="Search voucher, party, commodity..."
                    className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* TABLE */}
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="min-w-full divide-y divide-slate-200 text-xs">
                  <thead className="bg-slate-50 font-bold text-slate-700">
                    <tr>
                      <th className="px-3 py-2.5 text-left">Voucher #</th>
                      <th className="px-3 py-2.5 text-left">Date</th>
                      <th className="px-3 py-2.5 text-left">Type</th>
                      <th className="px-3 py-2.5 text-left">Party Name</th>
                      <th className="px-3 py-2.5 text-left">Commodity / جنس</th>
                      <th className="px-3 py-2.5 text-right">First Wt (KG)</th>
                      <th className="px-3 py-2.5 text-right">Bags</th>
                      <th className="px-3 py-2.5 text-right">Rate / 40KG</th>
                      <th className="px-3 py-2.5 text-right">Amount (PKR)</th>
                      <th className="px-3 py-2.5 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {filteredVouchers.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="p-6 text-center text-slate-400">
                          No vouchers found matching filter for 01 Aug 2026 to 30 Sep 2026.
                        </td>
                      </tr>
                    ) : (
                      filteredVouchers.map(v => (
                        <tr key={v.id} className="hover:bg-slate-50 transition">
                          <td className="px-3 py-2 font-mono font-bold text-slate-800">{v.voucherNo}</td>
                          <td className="px-3 py-2 text-slate-600">{v.date}</td>
                          <td className="px-3 py-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              v.type === 'PURCHASE' ? 'bg-amber-100 text-amber-800' :
                              v.type === 'SALE' ? 'bg-emerald-100 text-emerald-800' :
                              v.type === 'EXPENSE' ? 'bg-rose-100 text-rose-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {v.type}
                            </span>
                          </td>
                          <td className="px-3 py-2 font-medium text-slate-900">{v.partyName}</td>
                          <td className="px-3 py-2 text-slate-700">{v.itemName || '-'}</td>
                          <td className="px-3 py-2 text-right font-mono font-bold text-slate-800">
                            {v.firstWeight ? v.firstWeight.toLocaleString() : '-'}
                          </td>
                          <td className="px-3 py-2 text-right font-mono">{v.bags || '-'}</td>
                          <td className="px-3 py-2 text-right font-mono">{v.ratePer40Kg ? `Rs. ${v.ratePer40Kg}` : '-'}</td>
                          <td className="px-3 py-2 text-right font-mono font-bold text-slate-900">{formatPKR(v.totalAmount)}</td>
                          <td className="px-3 py-2 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              v.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {v.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* 2. PARTIES SUB-TAB */}
          {inspectTab === 'parties' && (
            <div className="space-y-3">
              <div className="text-xs text-slate-500">
                Party Khatas & ledger balance roll-forward during 01 Aug 2026 to 30 Sep 2026:
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="min-w-full divide-y divide-slate-200 text-xs">
                  <thead className="bg-slate-50 font-bold text-slate-700">
                    <tr>
                      <th className="px-3 py-2.5 text-left">Party Name</th>
                      <th className="px-3 py-2.5 text-left">Urdu Name</th>
                      <th className="px-3 py-2.5 text-left">Role / Type</th>
                      <th className="px-3 py-2.5 text-right">Opening Balance</th>
                      <th className="px-3 py-2.5 text-right">Debits (ناویں)</th>
                      <th className="px-3 py-2.5 text-right">Credits (جمع)</th>
                      <th className="px-3 py-2.5 text-right">Closing Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {record?.partySummaries && record.partySummaries.length > 0 ? (
                      record.partySummaries.map(p => (
                        <tr key={p.partyId} className="hover:bg-slate-50">
                          <td className="px-3 py-2 font-bold text-slate-900">{p.partyName}</td>
                          <td className="px-3 py-2 font-urdu text-slate-700">{p.partyNameUrdu || '-'}</td>
                          <td className="px-3 py-2">
                            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-semibold">
                              {p.type}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-right font-mono">{formatPKR(p.openingBalance)}</td>
                          <td className="px-3 py-2 text-right font-mono text-blue-700">{formatPKR(p.totalDebits)}</td>
                          <td className="px-3 py-2 text-right font-mono text-emerald-700">{formatPKR(p.totalCredits)}</td>
                          <td className={`px-3 py-2 text-right font-mono font-bold ${
                            p.closingBalance < 0 ? 'text-rose-700' : 'text-emerald-700'
                          }`}>
                            {formatPKR(p.closingBalance)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      parties.map(p => (
                        <tr key={p.id} className="hover:bg-slate-50">
                          <td className="px-3 py-2 font-bold text-slate-900">{p.name}</td>
                          <td className="px-3 py-2 font-urdu text-slate-700">{p.nameUrdu || '-'}</td>
                          <td className="px-3 py-2">
                            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-semibold">
                              {p.type}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-right font-mono">{formatPKR(p.openingBalance)}</td>
                          <td className="px-3 py-2 text-right font-mono text-blue-700">-</td>
                          <td className="px-3 py-2 text-right font-mono text-emerald-700">-</td>
                          <td className={`px-3 py-2 text-right font-mono font-bold ${
                            p.currentBalance < 0 ? 'text-rose-700' : 'text-emerald-700'
                          }`}>
                            {formatPKR(p.currentBalance)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 3. STOCK SUB-TAB */}
          {inspectTab === 'stock' && (
            <div className="space-y-3">
              <div className="text-xs text-slate-500">
                Commodity physical positions & weighted cost reconciliation (01 Aug 2026 to 30 Sep 2026):
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="min-w-full divide-y divide-slate-200 text-xs">
                  <thead className="bg-slate-50 font-bold text-slate-700">
                    <tr>
                      <th className="px-3 py-2.5 text-left">Commodity / جنس</th>
                      <th className="px-3 py-2.5 text-right">Opening Wt (KG)</th>
                      <th className="px-3 py-2.5 text-right">Purchases (KG)</th>
                      <th className="px-3 py-2.5 text-right">Sales (KG)</th>
                      <th className="px-3 py-2.5 text-right">Closing Wt (KG)</th>
                      <th className="px-3 py-2.5 text-right">Closing Bags</th>
                      <th className="px-3 py-2.5 text-right">Weighted Cost / 40KG</th>
                      <th className="px-3 py-2.5 text-right">Stock Valuation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {record?.stockSummaries && record.stockSummaries.length > 0 ? (
                      record.stockSummaries.map(s => (
                        <tr key={s.itemId} className="hover:bg-slate-50">
                          <td className="px-3 py-2">
                            <div className="font-bold text-slate-900">{s.itemName}</div>
                            <div className="font-urdu text-[11px] text-slate-500">{s.itemNameUrdu}</div>
                          </td>
                          <td className="px-3 py-2 text-right font-mono">{s.openingFirstWeight.toLocaleString()}</td>
                          <td className="px-3 py-2 text-right font-mono text-blue-700">{s.purchasedFirstWeight.toLocaleString()}</td>
                          <td className="px-3 py-2 text-right font-mono text-emerald-700">{s.soldFirstWeight.toLocaleString()}</td>
                          <td className="px-3 py-2 text-right font-mono font-bold text-slate-900">{s.closingFirstWeight.toLocaleString()}</td>
                          <td className="px-3 py-2 text-right font-mono font-bold text-slate-800">{s.closingBags}</td>
                          <td className="px-3 py-2 text-right font-mono font-bold text-emerald-800">Rs. {s.avgCostPer40Kg.toLocaleString()}</td>
                          <td className="px-3 py-2 text-right font-mono font-black text-slate-900">{formatPKR(s.closingValue)}</td>
                        </tr>
                      ))
                    ) : (
                      items.map(item => (
                        <tr key={item.id} className="hover:bg-slate-50">
                          <td className="px-3 py-2">
                            <div className="font-bold text-slate-900">{item.name}</div>
                            <div className="font-urdu text-[11px] text-slate-500">{item.nameUrdu}</div>
                          </td>
                          <td className="px-3 py-2 text-right font-mono">{item.openingFirstWeight.toLocaleString()}</td>
                          <td className="px-3 py-2 text-right font-mono text-blue-700">-</td>
                          <td className="px-3 py-2 text-right font-mono text-emerald-700">-</td>
                          <td className="px-3 py-2 text-right font-mono font-bold text-slate-900">{item.openingFirstWeight.toLocaleString()}</td>
                          <td className="px-3 py-2 text-right font-mono font-bold text-slate-800">{item.openingBags}</td>
                          <td className="px-3 py-2 text-right font-mono font-bold text-emerald-800">Rs. {item.defaultRate.toLocaleString()}</td>
                          <td className="px-3 py-2 text-right font-mono font-black text-slate-900">{formatPKR(item.openingValue)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 4. BARDANA SUB-TAB */}
          {inspectTab === 'bardana' && (
            <div className="space-y-3">
              <div className="text-xs text-slate-500">
                Gunny bags and PP woven bags balance roll-forward during 01 Aug 2026 to 30 Sep 2026:
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="min-w-full divide-y divide-slate-200 text-xs">
                  <thead className="bg-slate-50 font-bold text-slate-700">
                    <tr>
                      <th className="px-3 py-2.5 text-left">Bardana Name / باردانہ قسم</th>
                      <th className="px-3 py-2.5 text-right">Opening Bags</th>
                      <th className="px-3 py-2.5 text-right">Inward Bags (آمد)</th>
                      <th className="px-3 py-2.5 text-right">Outward Bags (روانگی)</th>
                      <th className="px-3 py-2.5 text-right">Closing Bags (بقایا)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {record?.bardanaSummaries && record.bardanaSummaries.length > 0 ? (
                      record.bardanaSummaries.map(b => (
                        <tr key={b.bardanaId} className="hover:bg-slate-50">
                          <td className="px-3 py-2 font-bold text-slate-900">
                            {b.bardanaName} {b.bardanaNameUrdu ? `(${b.bardanaNameUrdu})` : ''}
                          </td>
                          <td className="px-3 py-2 text-right font-mono">{b.openingBags.toLocaleString()}</td>
                          <td className="px-3 py-2 text-right font-mono text-blue-700">{b.inwardBags.toLocaleString()}</td>
                          <td className="px-3 py-2 text-right font-mono text-emerald-700">{b.outwardBags.toLocaleString()}</td>
                          <td className="px-3 py-2 text-right font-mono font-bold text-purple-900">{b.closingBags.toLocaleString()}</td>
                        </tr>
                      ))
                    ) : (
                      bardanaMasters.map(b => (
                        <tr key={b.id} className="hover:bg-slate-50">
                          <td className="px-3 py-2 font-bold text-slate-900">
                            {b.name} ({b.nameUrdu})
                          </td>
                          <td className="px-3 py-2 text-right font-mono">{b.openingBags.toLocaleString()}</td>
                          <td className="px-3 py-2 text-right font-mono text-blue-700">-</td>
                          <td className="px-3 py-2 text-right font-mono text-emerald-700">-</td>
                          <td className="px-3 py-2 text-right font-mono font-bold text-purple-900">{b.openingBags.toLocaleString()}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 5. P&L TRADING ACCOUNT SUB-TAB */}
          {inspectTab === 'pnl' && (
            <div className="space-y-4">
              <div className="text-xs text-slate-500">
                Consolidated Profit & Loss Trading Account for 01 Aug 2026 to 30 Sep 2026:
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* TRADING REVENUE & COGS */}
                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3 text-xs">
                  <div className="font-bold text-slate-800 uppercase tracking-wider border-b border-slate-200 pb-2">
                    Trading Turnover & Cost of Goods Sold:
                  </div>

                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-600">Total Sales Turnover (فروخت):</span>
                    <span className="font-mono font-bold text-slate-900">{formatPKR(metrics.salesAmount)}</span>
                  </div>

                  <div className="flex justify-between items-center py-1 border-b border-slate-200">
                    <span className="text-slate-600">Purchases & Cost of Goods Sold (خریداری):</span>
                    <span className="font-mono font-bold text-slate-900">({formatPKR(metrics.purchaseAmount)})</span>
                  </div>

                  <div className="flex justify-between items-center py-1.5 font-bold bg-white p-2 rounded-lg border border-slate-200">
                    <span className="text-slate-800">Gross Trading Profit (خام منافع):</span>
                    <span className="font-mono text-emerald-800 font-extrabold">{formatPKR(metrics.salesAmount - metrics.purchaseAmount)}</span>
                  </div>
                </div>

                {/* EXPENSES & NET PROFIT */}
                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50 space-y-3 text-xs">
                  <div className="font-bold text-slate-800 uppercase tracking-wider border-b border-slate-200 pb-2">
                    Period Expenses & Net Margin:
                  </div>

                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-600">Direct Labour / Mazdoori (پلائی و اترائی):</span>
                    <span className="font-mono text-rose-700">Rs. 35,000</span>
                  </div>

                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-600">Freight & Transport (گاڑی کرایہ):</span>
                    <span className="font-mono text-rose-700">Rs. 20,000</span>
                  </div>

                  <div className="flex justify-between items-center py-1 border-b border-slate-200">
                    <span className="text-slate-600">Other Mandi / Bardana Expenses:</span>
                    <span className="font-mono text-rose-700">Rs. 80,000</span>
                  </div>

                  <div className="flex justify-between items-center py-1.5 font-black bg-emerald-100/70 p-2.5 rounded-lg border border-emerald-300">
                    <span className="text-emerald-950 font-bold">Net Mandi Profit (2 Months):</span>
                    <span className="font-mono text-emerald-950 text-sm font-extrabold">{formatPKR(metrics.netProfit)}</span>
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>
      </div>

    </div>
  );
};
