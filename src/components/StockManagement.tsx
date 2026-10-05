/**
 * ERP Mandi Stock Management System (غلہ منڈی اسٹاک مینجمنٹ سسٹم)
 * Complete real-time Mandi inventory, godown allocation, bardana tracking,
 * stock movement registers, physical audit & reconciliation, and first-weight costing.
 */

import React, { useState, useMemo } from 'react';
import {
  Boxes,
  Package,
  Building2,
  Scale,
  DollarSign,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  ArrowLeftRight,
  Download,
  Printer,
  Search,
  Filter,
  CheckCircle2,
  Layers,
  HardDriveDownload,
  Plus,
  MinusCircle,
  Truck,
  History,
  FileSpreadsheet,
  ClipboardCheck,
  RotateCcw,
  Check,
  X,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { useMandi } from '../context/MandiContext';
import { formatPKR, formatWeight } from '../utils/numberToWords';
import { exportReportToExcel } from '../utils/excelExport';

interface StockManagementProps {
  onNavigateToPurchase?: () => void;
  onNavigateToSales?: () => void;
  onNavigateToTransfer?: () => void;
  onNavigateToReports?: () => void;
}

export const StockManagement: React.FC<StockManagementProps> = ({
  onNavigateToPurchase,
  onNavigateToSales,
  onNavigateToTransfer,
  onNavigateToReports
}) => {
  const {
    currentBusiness,
    stockSummary,
    godownStock,
    items,
    updateItem,
    godowns,
    bardanaSummary,
    vouchers
  } = useMandi();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGodownFilter, setSelectedGodownFilter] = useState('ALL');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [viewTab, setViewTab] = useState<'commodity' | 'ledger' | 'godowns' | 'audit' | 'bardana' | 'alerts'>('commodity');

  // Ledger Filter State
  const [ledgerItemFilter, setLedgerItemFilter] = useState<string>('ALL');
  const [ledgerTypeFilter, setLedgerTypeFilter] = useState<'ALL' | 'PURCHASE' | 'SALE' | 'TRANSFER'>('ALL');

  // Physical Audit Form State
  const [auditItemId, setAuditItemId] = useState<string>(items[0]?.id || '');
  const [auditGodownId, setAuditGodownId] = useState<string>(godowns[0]?.id || '');
  const [auditPhysicalBags, setAuditPhysicalBags] = useState<string>('');
  const [auditPhysicalWeight, setAuditPhysicalWeight] = useState<string>('');
  const [auditReason, setAuditReason] = useState<string>('Moisture Evaporation (سوکھ / نمی کا خاتمہ)');
  const [auditNotes, setAuditNotes] = useState<string>('');
  const [auditSuccessMsg, setAuditSuccessMsg] = useState<string>('');
  const [auditHistory, setAuditHistory] = useState<Array<{
    id: string;
    date: string;
    itemName: string;
    godownName: string;
    varianceBags: number;
    varianceWeightKg: number;
    reason: string;
    notes?: string;
  }>>([
    {
      id: 'aud-1',
      date: '2026-09-28',
      itemName: 'Wheat Lok-1 (گندم)',
      godownName: 'Main Mandi Godown # 1',
      varianceBags: 0,
      varianceWeightKg: -120,
      reason: 'Natural Moisture Evaporation (سوکھ / نمی کمی)',
      notes: 'Storage yard sunshine weight loss verified'
    }
  ]);

  // Market Rate Custom Overrides (For live profit/loss comparison against first-weight cost)
  const [marketRates, setMarketRates] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    items.forEach(it => {
      initial[it.id] = it.defaultRate || 3800;
    });
    return initial;
  });

  const handleUpdateMarketRate = (itemId: string, newRate: number) => {
    setMarketRates(prev => ({
      ...prev,
      [itemId]: newRate
    }));
  };

  // Categories list
  const categories = useMemo(() => {
    const set = new Set<string>();
    items.forEach(it => {
      if (it.category) set.add(it.category);
    });
    return Array.from(set);
  }, [items]);

  // Filtered Stock Summary
  const filteredStock = useMemo(() => {
    return stockSummary.filter(item => {
      const it = items.find(i => i.id === item.itemId);
      const matchesSearch =
        item.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.itemNameUrdu.includes(searchQuery);
      const matchesCategory =
        selectedCategory === 'ALL' || (it && it.category === selectedCategory);
      return matchesSearch && matchesCategory;
    });
  }, [stockSummary, items, searchQuery, selectedCategory]);

  // Overall Totals
  const totals = useMemo(() => {
    const totalBags = stockSummary.reduce((sum, s) => sum + (s.closingBags || 0), 0);
    const totalWeightKg = stockSummary.reduce((sum, s) => sum + (s.closingFirstWeight || 0), 0);
    const totalWeightMaunds = totalWeightKg / 40;
    const totalValuePkr = stockSummary.reduce((sum, s) => sum + (s.closingValue || 0), 0);
    const totalItemsCount = stockSummary.length;
    
    // Low stock items (below reorder level or 50 bags)
    const lowStockItems = stockSummary.filter(s => {
      const it = items.find(i => i.id === s.itemId);
      const reorderBags = it?.reorderLevelBags ?? 50;
      return s.closingBags <= reorderBags;
    });

    // Market Value vs First-Weight Cost calculation
    const totalMarketValuePkr = stockSummary.reduce((sum, s) => {
      const mRate = marketRates[s.itemId] || s.avgCostPer40Kg;
      return sum + (s.closingFirstWeight / 40) * mRate;
    }, 0);

    const unrealizedGainLossPkr = totalMarketValuePkr - totalValuePkr;

    return {
      totalBags,
      totalWeightKg,
      totalWeightMaunds,
      totalValuePkr,
      totalMarketValuePkr,
      unrealizedGainLossPkr,
      totalItemsCount,
      lowStockCount: lowStockItems.length,
      lowStockItems
    };
  }, [stockSummary, items, marketRates]);

  // Stock Movement Ledger Rows (Inward, Outward, Transfer)
  const movementLedger = useMemo(() => {
    const relevantVouchers = vouchers
      .filter(v => v.businessId === currentBusiness.id && v.status === 'Approved' && !v.isDeleted)
      .filter(v => {
        const matchesItem = ledgerItemFilter === 'ALL' || v.itemId === ledgerItemFilter;
        const matchesType = ledgerTypeFilter === 'ALL' || v.type === ledgerTypeFilter;
        return matchesItem && matchesType;
      })
      .sort((a, b) => new Date(a.date + ' ' + a.time).getTime() - new Date(b.date + ' ' + b.time).getTime());

    // Calculate running balances
    let runningBags = 0;
    let runningWeight = 0;

    return relevantVouchers.map(v => {
      const isIncoming = v.type === 'PURCHASE';
      const isOutgoing = v.type === 'SALE';
      const isTransfer = v.type === 'TRANSFER';

      const bagChange = isIncoming ? v.bags : isOutgoing ? -v.bags : 0;
      const weightChange = isIncoming ? v.firstWeight : isOutgoing ? -v.firstWeight : 0;

      runningBags += bagChange;
      runningWeight += weightChange;

      return {
        ...v,
        bagChange,
        weightChange,
        runningBags,
        runningWeight
      };
    }).reverse(); // Most recent first for viewing
  }, [vouchers, currentBusiness.id, ledgerItemFilter, ledgerTypeFilter]);

  // Handle Stock Physical Audit Submission
  const handleApplyAuditAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!auditItemId || !auditPhysicalBags) return;

    const targetStock = stockSummary.find(s => s.itemId === auditItemId);
    const targetItem = items.find(i => i.id === auditItemId);
    const targetGodown = godowns.find(g => g.id === auditGodownId);

    const enteredBags = parseFloat(auditPhysicalBags) || 0;
    const currentBags = targetStock?.closingBags || 0;
    const diffBags = enteredBags - currentBags;

    const enteredWeight = auditPhysicalWeight ? parseFloat(auditPhysicalWeight) : enteredBags * 50;
    const currentWeight = targetStock?.closingFirstWeight || 0;
    const diffWeight = enteredWeight - currentWeight;

    // Record in local audit history
    const newAuditRecord = {
      id: 'aud-' + Date.now(),
      date: new Date().toISOString().slice(0, 10),
      itemName: targetItem?.name || 'Commodity',
      godownName: targetGodown?.name || 'Godown',
      varianceBags: diffBags,
      varianceWeightKg: diffWeight,
      reason: auditReason,
      notes: auditNotes || 'Physical inventory audit adjustment'
    };

    setAuditHistory(prev => [newAuditRecord, ...prev]);

    // Update item's opening balance by the difference so closing matches physical count
    if (targetItem) {
      updateItem(targetItem.id, {
        openingBags: Math.max(0, targetItem.openingBags + diffBags),
        openingFirstWeight: Math.max(0, targetItem.openingFirstWeight + diffWeight)
      });
    }

    setAuditSuccessMsg(`Stock reconciled successfully! Adjusted ${diffBags >= 0 ? '+' : ''}${diffBags} bags (${diffWeight >= 0 ? '+' : ''}${diffWeight.toFixed(1)} KG) for ${targetItem?.name}.`);
    setAuditPhysicalBags('');
    setAuditPhysicalWeight('');
    setAuditNotes('');

    setTimeout(() => {
      setAuditSuccessMsg('');
    }, 4500);
  };

  const handleExportStockExcel = () => {
    exportReportToExcel({
      business: currentBusiness,
      reportName: 'ERP_Mandi_Stock_Management_Position',
      dateRangeStr: new Date().toLocaleDateString('en-GB'),
      columns: [
        { headerEn: 'Commodity', headerUrdu: 'جنس', key: 'itemName' },
        { headerEn: 'Urdu Name', headerUrdu: 'نام اردو', key: 'itemNameUrdu' },
        { headerEn: 'Opening Bags', headerUrdu: 'ابتدائی بوریاں', key: 'openingBags', format: 'number' },
        { headerEn: 'Opening Net Wt (KG)', headerUrdu: 'ابتدائی وزن', key: 'openingFirstWeight', format: 'weight' },
        { headerEn: 'Inward Bags', headerUrdu: 'آمد بوریاں', key: 'purchaseBags', format: 'number' },
        { headerEn: 'Inward Net Wt (KG)', headerUrdu: 'آمد وزن', key: 'purchaseFirstWeight', format: 'weight' },
        { headerEn: 'Outward Bags', headerUrdu: 'روانگی بوریاں', key: 'soldBags', format: 'number' },
        { headerEn: 'Outward Net Wt (KG)', headerUrdu: 'روانگی وزن', key: 'soldFirstWeight', format: 'weight' },
        { headerEn: 'Closing Bags', headerUrdu: 'موجود بوریاں', key: 'closingBags', format: 'number' },
        { headerEn: 'Closing Net Wt (KG)', headerUrdu: 'موجود وزن', key: 'closingFirstWeight', format: 'weight' },
        { headerEn: 'Avg Cost / 40KG', headerUrdu: 'لاگت فی من', key: 'avgCostPer40Kg', format: 'currency' },
        { headerEn: 'Stock Value (PKR)', headerUrdu: 'کل مالیت', key: 'closingValue', format: 'currency' }
      ],
      data: filteredStock,
      grandTotalRow: {
        itemName: 'GRAND TOTAL / کل میزان:',
        closingBags: totals.totalBags,
        closingFirstWeight: totals.totalWeightKg,
        closingValue: totals.totalValuePkr
      }
    });
  };

  const handlePrintStock = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER & TOP ACTIONS */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-800 text-white flex items-center justify-center font-bold shadow-md">
              <Boxes className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  ERP Mandi Stock Management System
                </h1>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
                  First-Weight Costing Locked
                </span>
              </div>
              <p className="font-urdu text-sm text-slate-600 font-semibold mt-0.5">
                غلہ منڈی اجناس اسٹاک، آمد و روانگی روزنامچہ، گودام پوزیشن و باردانہ کنٹرول
              </p>
            </div>
          </div>
        </div>

        {/* TOP ACTION BUTTONS */}
        <div className="flex flex-wrap items-center gap-2">
          {onNavigateToPurchase && (
            <button
              onClick={onNavigateToPurchase}
              className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs active:scale-95"
              title="Record Inward Grain Purchase (آمد پرچی)"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Purchase Inward (آمد)</span>
            </button>
          )}

          {onNavigateToSales && (
            <button
              onClick={onNavigateToSales}
              className="px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs active:scale-95"
              title="Record Outward Grain Sale (روانگی پرچی)"
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Sales Outward (روانگی)</span>
            </button>
          )}

          {onNavigateToTransfer && (
            <button
              onClick={onNavigateToTransfer}
              className="px-3.5 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs active:scale-95"
              title="Transfer Stock Between Godowns (گودام منتقلی)"
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              <span>Godown Transfer (منتقلی)</span>
            </button>
          )}

          <button
            onClick={handleExportStockExcel}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold transition flex items-center gap-1.5 shadow-xs"
            title="Download Excel Spreadsheet of Live Mandi Stock"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Excel Sheet</span>
          </button>

          <button
            onClick={handlePrintStock}
            className="p-2 border border-slate-300 rounded-xl hover:bg-slate-100 text-slate-700 transition"
            title="Print Mandi Stock Position Slip"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* TOTAL STOCK VALUE (FIRST-WEIGHT) */}
        <div className="bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 text-white p-4 sm:p-5 rounded-2xl shadow-md border border-emerald-700/40 relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-emerald-300 font-semibold mb-1">
            <span>Total Stock Valuation (Cost)</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black tracking-tight text-white font-mono">
            {formatPKR(totals.totalValuePkr)}
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-emerald-800/60 text-[11px]">
            <span className="text-emerald-300/80 font-urdu">لاگت اول وزن</span>
            <span className={`font-mono font-bold ${totals.unrealizedGainLossPkr >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              Market: {totals.unrealizedGainLossPkr >= 0 ? '+' : ''}{formatPKR(totals.unrealizedGainLossPkr)}
            </span>
          </div>
        </div>

        {/* TOTAL BAGS */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-2xs border border-slate-200">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold mb-1">
            <span>Total Available Bags</span>
            <Package className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {totals.totalBags.toLocaleString()} <span className="text-xs font-normal text-slate-500">Bags (بوریاں)</span>
          </div>
          <div className="text-[11px] font-urdu text-slate-500 mt-2 pt-2 border-t border-slate-100">
            کل موجود بوریاں و توڑے
          </div>
        </div>

        {/* TOTAL NET WEIGHT */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-2xs border border-slate-200">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold mb-1">
            <span>Total Net Weight</span>
            <Scale className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
            {totals.totalWeightKg.toLocaleString()} <span className="text-xs font-normal text-slate-500">KG</span>
          </div>
          <div className="text-[11px] text-emerald-700 font-bold mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
            <span>≈ {totals.totalWeightMaunds.toFixed(1)} Maunds</span>
            <span className="font-urdu font-semibold">({totals.totalWeightMaunds.toFixed(0)} من چالیس کلو)</span>
          </div>
        </div>

        {/* ACTIVE COMMODITIES & ALERTS */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl shadow-2xs border border-slate-200 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-500 font-bold mb-1">
            <span>Commodities & Reorder</span>
            <Boxes className="w-4 h-4 text-purple-600" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-black text-slate-900 font-mono">
                {totals.totalItemsCount}
              </div>
              <div className="text-[10px] text-slate-400">Active Grains (اجناس)</div>
            </div>
            {totals.lowStockCount > 0 ? (
              <button
                onClick={() => setViewTab('alerts')}
                className="px-2.5 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-xl text-xs font-bold border border-rose-200 flex items-center gap-1 transition"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                <span>{totals.lowStockCount} Low Stock</span>
              </button>
            ) : (
              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Optimal</span>
              </span>
            )}
          </div>
          <div className="text-[11px] text-slate-500 font-urdu mt-2 pt-2 border-t border-slate-100">
            کم اسٹاک الرٹس و احتیاطی پیمانہ
          </div>
        </div>
      </div>

      {/* 6 CORE VIEW TABS */}
      <div className="flex border-b border-slate-200 bg-white rounded-2xl p-1 shadow-2xs gap-1 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setViewTab('commodity')}
          className={`flex-1 min-w-[130px] py-2.5 px-3 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 ${
            viewTab === 'commodity'
              ? 'bg-emerald-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Boxes className="w-4 h-4 text-emerald-400" />
          <span>Commodity Stock</span>
          <span className="font-urdu text-[11px] opacity-80">(اجناس کا اسٹاک)</span>
        </button>

        <button
          onClick={() => setViewTab('ledger')}
          className={`flex-1 min-w-[140px] py-2.5 px-3 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 ${
            viewTab === 'ledger'
              ? 'bg-emerald-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <History className="w-4 h-4 text-blue-400" />
          <span>Movement Register</span>
          <span className="font-urdu text-[11px] opacity-80">(آمد و روانگی رجسٹر)</span>
        </button>

        <button
          onClick={() => setViewTab('godowns')}
          className={`flex-1 min-w-[130px] py-2.5 px-3 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 ${
            viewTab === 'godowns'
              ? 'bg-emerald-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Building2 className="w-4 h-4 text-amber-400" />
          <span>Godown Allocation</span>
          <span className="font-urdu text-[11px] opacity-80">(گودام پوزیشن)</span>
        </button>

        <button
          onClick={() => setViewTab('audit')}
          className={`flex-1 min-w-[140px] py-2.5 px-3 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 ${
            viewTab === 'audit'
              ? 'bg-emerald-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <ClipboardCheck className="w-4 h-4 text-purple-400" />
          <span>Physical Audit & Adjust</span>
          <span className="font-urdu text-[11px] opacity-80">(سوکھ و درستی)</span>
        </button>

        <button
          onClick={() => setViewTab('bardana')}
          className={`flex-1 min-w-[120px] py-2.5 px-3 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 ${
            viewTab === 'bardana'
              ? 'bg-emerald-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <Package className="w-4 h-4 text-teal-400" />
          <span>Bardana Register</span>
          <span className="font-urdu text-[11px] opacity-80">(باردانہ رجسٹر)</span>
        </button>

        <button
          onClick={() => setViewTab('alerts')}
          className={`flex-1 min-w-[110px] py-2.5 px-3 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 ${
            viewTab === 'alerts'
              ? 'bg-emerald-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-rose-400" />
          <span>Reorder Alerts</span>
          {totals.lowStockCount > 0 && (
            <span className="bg-rose-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
              {totals.lowStockCount}
            </span>
          )}
        </button>
      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: LIVE COMMODITY STOCK POSITION TABLE */}
      {/* ========================================================================= */}
      {viewTab === 'commodity' && (
        <div className="space-y-4">
          
          {/* FILTER BAR */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 flex-1 max-w-sm">
              <div className="relative w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search commodity (گندم، چاول، کپاس...)"
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-semibold">Category:</span>
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium"
              >
                <option value="ALL">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white text-[11px] uppercase tracking-wider">
                    <th className="py-3 px-4">Commodity / جنس</th>
                    <th className="py-3 px-3 text-right">Opening (ابتدائی)</th>
                    <th className="py-3 px-3 text-right text-emerald-300">Purchased In (آمد)</th>
                    <th className="py-3 px-3 text-right text-rose-300">Sold Out (روانگی)</th>
                    <th className="py-3 px-3 text-right font-bold text-white bg-slate-800">Closing Bags</th>
                    <th className="py-3 px-3 text-right font-bold text-white bg-slate-800">Closing Net Wt</th>
                    <th className="py-3 px-3 text-right font-bold text-amber-300">Avg Cost / 40KG</th>
                    <th className="py-3 px-3 text-right font-bold text-cyan-300">Market Rate</th>
                    <th className="py-3 px-4 text-right font-bold text-emerald-300">Stock Value (PKR)</th>
                    <th className="py-3 px-3 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredStock.map(s => {
                    const it = items.find(i => i.id === s.itemId);
                    const isLow = s.closingBags <= (it?.reorderLevelBags ?? 50);
                    const mRate = marketRates[s.itemId] || it?.defaultRate || 3800;
                    const diffRate = mRate - s.avgCostPer40Kg;

                    return (
                      <tr key={s.itemId} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900 text-sm">{s.itemName}</div>
                          <div className="font-urdu text-xs text-slate-500 font-semibold">{s.itemNameUrdu}</div>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-medium">
                              {it?.category || 'Grains'}
                            </span>
                            {isLow && (
                              <span className="text-[10px] bg-rose-100 text-rose-700 px-1.5 py-0.2 rounded font-bold">
                                Low Stock
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Opening */}
                        <td className="py-3 px-3 text-right font-mono text-slate-600">
                          <div>{s.openingBags} bags</div>
                          <div className="text-[10px] text-slate-400">{s.openingFirstWeight.toLocaleString()} KG</div>
                        </td>

                        {/* Purchased */}
                        <td className="py-3 px-3 text-right font-mono text-emerald-700 bg-emerald-50/40">
                          <div>+{s.purchaseBags} bags</div>
                          <div className="text-[10px] text-emerald-600">+{s.purchaseFirstWeight.toLocaleString()} KG</div>
                        </td>

                        {/* Sold */}
                        <td className="py-3 px-3 text-right font-mono text-rose-700 bg-rose-50/40">
                          <div>-{s.soldBags} bags</div>
                          <div className="text-[10px] text-rose-600">-{s.soldFirstWeight.toLocaleString()} KG</div>
                        </td>

                        {/* Closing Bags */}
                        <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 bg-slate-50 text-sm">
                          {s.closingBags} <span className="text-[10px] font-normal text-slate-500">بوریاں</span>
                        </td>

                        {/* Closing Net Weight */}
                        <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 bg-slate-50">
                          <div>{s.closingFirstWeight.toLocaleString()} KG</div>
                          <div className="text-[10px] text-emerald-700">{(s.closingFirstWeight / 40).toFixed(1)} من</div>
                        </td>

                        {/* Avg Cost Per 40KG */}
                        <td className="py-3 px-3 text-right font-mono font-bold text-amber-900">
                          Rs. {s.avgCostPer40Kg.toFixed(2)}
                        </td>

                        {/* Market Rate comparison */}
                        <td className="py-3 px-3 text-right font-mono text-cyan-900">
                          <div className="flex items-center justify-end gap-1">
                            <span>Rs.</span>
                            <input
                              type="number"
                              value={mRate}
                              onChange={e => handleUpdateMarketRate(s.itemId, parseFloat(e.target.value) || 0)}
                              className="w-16 px-1 py-0.5 border border-slate-200 rounded text-right font-mono text-xs focus:ring-1 focus:ring-emerald-500"
                              title="Click to edit current market rate for variance analysis"
                            />
                          </div>
                          <div className={`text-[10px] font-bold ${diffRate >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                            {diffRate >= 0 ? '+' : ''}{diffRate.toFixed(0)} diff
                          </div>
                        </td>

                        {/* Total Closing Value */}
                        <td className="py-3 px-4 text-right font-mono font-bold text-emerald-900 text-sm">
                          {formatPKR(s.closingValue)}
                        </td>

                        {/* Action buttons */}
                        <td className="py-3 px-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            {onNavigateToPurchase && (
                              <button
                                onClick={onNavigateToPurchase}
                                className="p-1 hover:bg-emerald-100 text-emerald-700 rounded transition"
                                title="Purchase Inward for this item"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button
                              onClick={() => {
                                setLedgerItemFilter(s.itemId);
                                setViewTab('ledger');
                              }}
                              className="p-1 hover:bg-blue-100 text-blue-700 rounded transition"
                              title="View Movement Register for this item"
                            >
                              <History className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-emerald-950 text-white font-bold text-xs">
                    <td className="py-3 px-4 uppercase tracking-wider">Grand Total (میزان کل)</td>
                    <td className="py-3 px-3 text-right font-mono">-</td>
                    <td className="py-3 px-3 text-right font-mono text-emerald-300">
                      +{stockSummary.reduce((sum, s) => sum + s.purchaseBags, 0)} bags
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-rose-300">
                      -{stockSummary.reduce((sum, s) => sum + s.soldBags, 0)} bags
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-white text-sm">
                      {totals.totalBags.toLocaleString()} bags
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-white">
                      {totals.totalWeightKg.toLocaleString()} KG
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-amber-300">-</td>
                    <td className="py-3 px-3 text-right font-mono text-cyan-300">-</td>
                    <td className="py-3 px-4 text-right font-mono text-emerald-300 text-sm">
                      {formatPKR(totals.totalValuePkr)}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: STOCK MOVEMENT REGISTER (INWARD & OUTWARD LEDGER) */}
      {/* ========================================================================= */}
      {viewTab === 'ledger' && (
        <div className="space-y-4">
          {/* FILTER BAR */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <span className="text-slate-500 font-semibold mr-1.5">Filter Commodity:</span>
                <select
                  value={ledgerItemFilter}
                  onChange={e => setLedgerItemFilter(e.target.value)}
                  className="p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold"
                >
                  <option value="ALL">All Commodities (تمام اجناس)</option>
                  {items.map(it => (
                    <option key={it.id} value={it.id}>{it.name} ({it.nameUrdu})</option>
                  ))}
                </select>
              </div>

              <div>
                <span className="text-slate-500 font-semibold mr-1.5">Transaction Type:</span>
                <select
                  value={ledgerTypeFilter}
                  onChange={e => setLedgerTypeFilter(e.target.value as any)}
                  className="p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold"
                >
                  <option value="ALL">All Transactions (تمام ٹرانزیکشنز)</option>
                  <option value="PURCHASE">Purchase Inward (آمد)</option>
                  <option value="SALE">Sales Outward (روانگی)</option>
                  <option value="TRANSFER">Godown Transfer (منتقلی)</option>
                </select>
              </div>
            </div>

            <div className="text-xs text-slate-500 font-medium">
              Showing <strong>{movementLedger.length}</strong> recorded movements
            </div>
          </div>

          {/* LEDGER TABLE */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white text-[11px] uppercase tracking-wider">
                    <th className="py-3 px-3">Date & Time</th>
                    <th className="py-3 px-3">Type</th>
                    <th className="py-3 px-3">Voucher #</th>
                    <th className="py-3 px-3">Commodity / جنس</th>
                    <th className="py-3 px-3">Party Name</th>
                    <th className="py-3 px-3">Godown</th>
                    <th className="py-3 px-3 text-right">Bags In/Out</th>
                    <th className="py-3 px-3 text-right">Net Wt (KG)</th>
                    <th className="py-3 px-3 text-right">Rate / 40KG</th>
                    <th className="py-3 px-4 text-right">Total Amount (PKR)</th>
                    <th className="py-3 px-3 text-right bg-slate-800 text-white">Running Stock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {movementLedger.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="py-8 text-center text-slate-400">
                        No movement records found for the selected filter.
                      </td>
                    </tr>
                  ) : (
                    movementLedger.map(m => {
                      const isPurchase = m.type === 'PURCHASE';
                      const isSale = m.type === 'SALE';
                      const isTransfer = m.type === 'TRANSFER';

                      return (
                        <tr key={m.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-2.5 px-3 font-mono text-slate-600 whitespace-nowrap">
                            <div>{m.date}</div>
                            <div className="text-[10px] text-slate-400">{m.time}</div>
                          </td>

                          <td className="py-2.5 px-3 whitespace-nowrap">
                            {isPurchase && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                Inward (آمد)
                              </span>
                            )}
                            {isSale && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-300">
                                Outward (روانگی)
                              </span>
                            )}
                            {isTransfer && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                                Transfer (منتقلی)
                              </span>
                            )}
                          </td>

                          <td className="py-2.5 px-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                            {m.voucherNo}
                          </td>

                          <td className="py-2.5 px-3">
                            <div className="font-bold text-slate-900">{m.itemName}</div>
                            <div className="text-[11px] font-urdu text-slate-500">{m.itemNameUrdu}</div>
                          </td>

                          <td className="py-2.5 px-3">
                            <div className="font-semibold text-slate-800">{m.partyName}</div>
                            <div className="text-[11px] font-urdu text-slate-500">{m.partyNameUrdu}</div>
                          </td>

                          <td className="py-2.5 px-3 text-slate-600">
                            <div>{m.godownName}</div>
                            {m.toGodownName && (
                              <div className="text-[10px] text-amber-700 flex items-center gap-1 font-bold">
                                <span>&rarr; {m.toGodownName}</span>
                              </div>
                            )}
                          </td>

                          <td className={`py-2.5 px-3 text-right font-mono font-bold whitespace-nowrap ${
                            m.bagChange > 0 ? 'text-emerald-700' : m.bagChange < 0 ? 'text-rose-700' : 'text-slate-600'
                          }`}>
                            {m.bagChange > 0 ? `+${m.bagChange}` : m.bagChange} bags
                          </td>

                          <td className={`py-2.5 px-3 text-right font-mono font-bold whitespace-nowrap ${
                            m.weightChange > 0 ? 'text-emerald-700' : m.weightChange < 0 ? 'text-rose-700' : 'text-slate-600'
                          }`}>
                            {m.weightChange > 0 ? `+${m.weightChange.toLocaleString()}` : m.weightChange.toLocaleString()} KG
                          </td>

                          <td className="py-2.5 px-3 text-right font-mono text-slate-700">
                            Rs. {m.ratePer40Kg?.toFixed(2) || '-'}
                          </td>

                          <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900">
                            {m.totalAmount ? formatPKR(m.totalAmount) : '-'}
                          </td>

                          <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 bg-slate-50">
                            <div>{m.runningBags} bags</div>
                            <div className="text-[10px] text-slate-500">{m.runningWeight.toLocaleString()} KG</div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 3: GODOWN ALLOCATION & CAPACITY UTILIZATION */}
      {/* ========================================================================= */}
      {viewTab === 'godowns' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {godowns.map(g => {
              const stockData = godownStock[g.id] || {};
              const totalBagsInGodown = Object.values(stockData).reduce((sum, st) => sum + (st?.bags || 0), 0);
              const totalKgInGodown = Object.values(stockData).reduce((sum, st) => sum + (st?.firstWeight || 0), 0);
              const capacity = g.capacityBags || 3000;
              const percentUsed = Math.min(100, Math.round((totalBagsInGodown / capacity) * 100));
              const availableBags = Math.max(0, capacity - totalBagsInGodown);

              return (
                <div key={g.id} className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-4 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center font-bold">
                          <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-slate-900 text-sm">{g.name}</h3>
                          <div className="font-urdu text-xs text-slate-500">{g.nameUrdu}</div>
                        </div>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        percentUsed > 85 ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {percentUsed}% Filled
                      </span>
                    </div>

                    {/* Capacity Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] text-slate-500">
                        <span>Capacity: {capacity.toLocaleString()} Bags</span>
                        <span>Available: {availableBags.toLocaleString()} Bags</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${
                            percentUsed > 85 ? 'bg-rose-500' : percentUsed > 60 ? 'bg-amber-500' : 'bg-emerald-600'
                          }`}
                          style={{ width: `${percentUsed}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <div className="text-[10px] text-slate-500 uppercase font-semibold">Total Bags</div>
                        <div className="text-base font-bold font-mono text-slate-900">{totalBagsInGodown}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-slate-500 uppercase font-semibold">Total Weight</div>
                        <div className="text-base font-bold font-mono text-slate-900">{totalKgInGodown.toLocaleString()} KG</div>
                      </div>
                    </div>

                    {/* Commodity breakdown inside godown */}
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <div className="text-[11px] font-bold text-slate-600 uppercase">Items Stored in Godown:</div>
                      <div className="space-y-1 text-xs max-h-36 overflow-y-auto">
                        {Object.keys(stockData).length === 0 ? (
                          <div className="text-slate-400 italic py-1">No commodities stored yet</div>
                        ) : (
                          Object.entries(stockData).map(([itemId, st]) => {
                            const it = items.find(i => i.id === itemId);
                            return (
                              <div key={itemId} className="flex items-center justify-between py-1 border-b border-slate-50">
                                <span className="font-medium text-slate-800">{it?.name || itemId}</span>
                                <span className="font-mono font-bold text-emerald-800">
                                  {st.bags} bags ({st.firstWeight.toLocaleString()} KG)
                                </span>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Transfer Action */}
                  {onNavigateToTransfer && (
                    <button
                      onClick={onNavigateToTransfer}
                      className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5"
                    >
                      <ArrowLeftRight className="w-3.5 h-3.5 text-amber-700" />
                      <span>Transfer Stock From Here</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 4: PHYSICAL AUDIT & RECONCILIATION */}
      {/* ========================================================================= */}
      {viewTab === 'audit' && (
        <div className="space-y-6">
          
          {/* AUDIT FORM */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <ClipboardCheck className="w-5 h-5 text-emerald-700" />
                  <span>Physical Inventory Audit & Grain Moisture Adjustment</span>
                </h2>
                <p className="text-xs text-slate-500 font-urdu mt-0.5">
                  اسٹاک فزیکل آڈٹ، قدرتی سوکھ / نمی کمی، اور بوریوں کی جانچ پڑتال
                </p>
              </div>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                Mandi Standard
              </span>
            </div>

            {auditSuccessMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{auditSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleApplyAuditAdjustment} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              
              {/* Select Commodity */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">Commodity / جنس:</label>
                <select
                  value={auditItemId}
                  onChange={e => setAuditItemId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                  required
                >
                  {items.map(it => (
                    <option key={it.id} value={it.id}>{it.name} ({it.nameUrdu})</option>
                  ))}
                </select>
              </div>

              {/* Select Godown */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">Godown / گودام:</label>
                <select
                  value={auditGodownId}
                  onChange={e => setAuditGodownId(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                  required
                >
                  {godowns.map(g => (
                    <option key={g.id} value={g.id}>{g.name} ({g.nameUrdu})</option>
                  ))}
                </select>
              </div>

              {/* Physical Counted Bags */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">Physical Counted Bags:</label>
                <input
                  type="number"
                  value={auditPhysicalBags}
                  onChange={e => setAuditPhysicalBags(e.target.value)}
                  placeholder={`Current: ${stockSummary.find(s => s.itemId === auditItemId)?.closingBags || 0} bags`}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-slate-900"
                  required
                />
              </div>

              {/* Physical Counted Weight (KG) */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">Physical Net Weight (KG):</label>
                <input
                  type="number"
                  value={auditPhysicalWeight}
                  onChange={e => setAuditPhysicalWeight(e.target.value)}
                  placeholder={`Current: ${stockSummary.find(s => s.itemId === auditItemId)?.closingFirstWeight.toLocaleString() || 0} KG`}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-slate-900"
                />
              </div>

              {/* Reason */}
              <div className="sm:col-span-2">
                <label className="block text-slate-700 font-bold mb-1">Audit / Adjustment Reason (وجہ):</label>
                <select
                  value={auditReason}
                  onChange={e => setAuditReason(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                >
                  <option value="Natural Moisture Evaporation (سوکھ / نمی کا خاتمہ)">Natural Moisture Evaporation (سوکھ / نمی کا خاتمہ)</option>
                  <option value="Karda & Foreign Matter Deduction (چھانٹی و گرد)">Karda & Foreign Matter Deduction (چھانٹی و گرد)</option>
                  <option value="Bag Spillage & Damage (بوری پھٹ گئی / لیکیج)">Bag Spillage & Damage (بوری پھٹ گئی / لیکیج)</option>
                  <option value="Scale & Weighbridge Calibration Variance (کانٹا فرق)">Scale & Weighbridge Calibration Variance (کانٹا فرق)</option>
                  <option value="Physical Bag Recount Correction (درستی شمار)">Physical Bag Recount Correction (درستی شمار)</option>
                </select>
              </div>

              {/* Notes */}
              <div className="sm:col-span-2">
                <label className="block text-slate-700 font-bold mb-1">Inspection Notes / ریمارکس:</label>
                <input
                  type="text"
                  value={auditNotes}
                  onChange={e => setAuditNotes(e.target.value)}
                  placeholder="e.g. Yard audit verified by Munshi and storekeeper"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              {/* Submit Button */}
              <div className="sm:col-span-2 lg:col-span-4 flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs shadow-xs transition flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Reconcile & Apply Stock Adjustment (اسٹاک ایڈجسٹمنٹ لاگو کریں)</span>
                </button>
              </div>
            </form>
          </div>

          {/* AUDIT LOG TABLE */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden p-5 space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <History className="w-4 h-4 text-slate-500" />
              <span>Audit & Reconciliation History (سابقہ آڈٹ لاگ)</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 text-[10px] uppercase font-bold">
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Commodity</th>
                    <th className="py-2.5 px-3">Godown</th>
                    <th className="py-2.5 px-3 text-right">Variance Bags</th>
                    <th className="py-2.5 px-3 text-right">Variance Weight</th>
                    <th className="py-2.5 px-3">Reason</th>
                    <th className="py-2.5 px-3">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {auditHistory.map(a => (
                    <tr key={a.id} className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-mono text-slate-600">{a.date}</td>
                      <td className="py-2 px-3 font-bold text-slate-900">{a.itemName}</td>
                      <td className="py-2 px-3 text-slate-700">{a.godownName}</td>
                      <td className={`py-2 px-3 text-right font-mono font-bold ${
                        a.varianceBags >= 0 ? 'text-emerald-700' : 'text-rose-700'
                      }`}>
                        {a.varianceBags >= 0 ? `+${a.varianceBags}` : a.varianceBags}
                      </td>
                      <td className={`py-2 px-3 text-right font-mono font-bold ${
                        a.varianceWeightKg >= 0 ? 'text-emerald-700' : 'text-rose-700'
                      }`}>
                        {a.varianceWeightKg >= 0 ? `+${a.varianceWeightKg}` : a.varianceWeightKg} KG
                      </td>
                      <td className="py-2 px-3 text-slate-700">{a.reason}</td>
                      <td className="py-2 px-3 text-slate-500 italic">{a.notes || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 5: BARDANA BAGS INVENTORY */}
      {/* ========================================================================= */}
      {viewTab === 'bardana' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Bardana & Gunny Bag Inventory (باردانہ رجسٹر)</h2>
              <p className="text-xs text-slate-500 font-urdu">پٹ سن و پلاسٹک توڑوں کا باقاعدہ حساب</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {bardanaSummary.map(b => (
              <div key={b.bardanaId} className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">{b.name}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                    {b.category}
                  </span>
                </div>
                <div className="font-urdu text-xs text-slate-600">{b.nameUrdu}</div>
                <div className="pt-2 border-t border-slate-200 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400">Opening:</span>
                    <div className="font-mono font-bold">{b.openingBags}</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-emerald-600">Inward:</span>
                    <div className="font-mono font-bold text-emerald-700">+{b.receivedBags}</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-rose-600">Issued:</span>
                    <div className="font-mono font-bold text-rose-700">-{b.issuedBags}</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-800 font-bold">Closing:</span>
                    <div className="font-mono font-black text-slate-900 text-sm">{b.closingBags}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 6: LOW STOCK & REORDER ALERTS */}
      {/* ========================================================================= */}
      {viewTab === 'alerts' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
                <span>Low Stock & Reorder Alert Center (کم اسٹاک انتباہ و دوبارہ خریداری)</span>
              </h2>
              <p className="text-xs text-slate-500 font-urdu mt-0.5">
                جن اجناس کا اسٹاک خطرناک حد تک کم ہے، فوری خریداری کے لیے الرٹس
              </p>
            </div>
            <span className="px-2.5 py-1 bg-rose-100 text-rose-800 rounded-xl text-xs font-bold border border-rose-200">
              {totals.lowStockCount} Commodities Need Reorder
            </span>
          </div>

          {totals.lowStockCount === 0 ? (
            <div className="p-8 text-center bg-emerald-50 rounded-2xl border border-emerald-200 space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
              <div className="text-sm font-bold text-emerald-950">All Commodity Stock Levels are Optimal!</div>
              <div className="text-xs text-emerald-700 font-urdu">تمام اجناس کا اسٹاک تسلی بخش اور محفوظ حد کے اندر ہے</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {totals.lowStockItems.map(s => {
                const it = items.find(i => i.id === s.itemId);
                const reorderLevel = it?.reorderLevelBags ?? 50;

                return (
                  <div key={s.itemId} className="p-4 bg-rose-50/50 border border-rose-200 rounded-2xl flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                        <span>{s.itemName}</span>
                        <span className="text-[10px] bg-rose-200 text-rose-900 px-2 py-0.5 rounded-full font-bold">
                          Urgent
                        </span>
                      </div>
                      <div className="font-urdu text-xs text-slate-600">{s.itemNameUrdu}</div>
                      <div className="text-xs text-slate-600 pt-1">
                        Current: <strong className="text-rose-700 font-mono">{s.closingBags} bags</strong> | Minimum Reorder: <strong className="font-mono">{reorderLevel} bags</strong>
                      </div>
                    </div>

                    {onNavigateToPurchase && (
                      <button
                        onClick={onNavigateToPurchase}
                        className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center gap-1.5 shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Order Now</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
