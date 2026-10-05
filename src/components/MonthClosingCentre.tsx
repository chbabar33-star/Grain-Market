/**
 * Mandi ERP - Month & Period Closing Centre (ماہانہ و موسمی کلوزنگ و محفوظ ریکارڈ سینٹر)
 * Allows commission agents to close single months OR multi-month periods (like 01 Aug 2026 to 30 Sep 2026),
 * lock transactions, roll-forward balances, and preserve isolated records (Vouchers, Khatas, Stock, Bardana, and P&L).
 */

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
  Trash2,
  Scale,
  Receipt,
  Building2,
  ArrowRight,
  Filter,
  Check,
  X,
  FileText,
  Clock,
  UserCheck,
  ShieldCheck,
  CalendarCheck,
  Layers,
  Sparkles
} from 'lucide-react';
import { useMandi } from '../context/MandiContext';
import { MonthClosingRecord, Voucher } from '../types';
import { formatPKR } from '../utils/numberToWords';
import {
  getAvailableMonthKeys,
  formatMonthName,
  getMonthDateRange,
  getMonthKey,
  formatPeriodDateRange
} from '../utils/monthClosing';
import { exportReportToExcel } from '../utils/excelExport';
import { AugSepPeriodWorkspace } from './AugSepPeriodWorkspace';

export const MonthClosingCentre: React.FC = () => {
  const {
    currentBusiness,
    vouchers,
    parties,
    items,
    bardanaMasters,
    currentUser,
    monthClosingRecords,
    closeMonth,
    reopenMonth,
    exportMonthArchiveFile,
    deleteMonthArchive,
    activeMonthFilter,
    setActiveMonthFilter
  } = useMandi();

  // Primary Section Tab: "01 Aug 2026 to 30 Sep 2026" (Multi-Month Period) vs Custom Range vs Single Month vs Archives
  const [mainViewTab, setMainViewTab] = useState<'01_aug_30_sep' | 'custom_range' | 'single_month' | 'archives'>('01_aug_30_sep');

  // In-place sub-tabs for the 01 Aug to 30 Sep period view
  const [periodInspectTab, setPeriodInspectTab] = useState<'vouchers' | 'parties' | 'stock' | 'bardana' | 'pnl'>('vouchers');
  const [periodVoucherFilter, setPeriodVoucherFilter] = useState<'ALL' | 'PURCHASE' | 'SALE' | 'EXPENSE' | 'TRANSFER'>('ALL');
  const [periodVoucherSearch, setPeriodVoucherSearch] = useState('');

  // Mode Tab for Closing Wizard: Multi-Month Range vs Single Month
  const [closingModeTab, setClosingModeTab] = useState<'custom_range' | 'single_month'>('custom_range');

  // Custom Multi-Month Period Range State (defaults to 01 Aug 2026 to 30 Sep 2026)
  const [rangeStartDate, setRangeStartDate] = useState('2026-08-01');
  const [rangeEndDate, setRangeEndDate] = useState('2026-09-30');
  const [rangePreset, setRangePreset] = useState<'01_aug_30_sep' | '01_jul_30_sep' | '01_apr_30_jun' | '01_jun_31_jul' | 'custom'>('01_aug_30_sep');

  const availableMonths = useMemo(() => {
    return getAvailableMonthKeys(vouchers);
  }, [vouchers]);

  // Selected single month to close in wizard
  const [selectedMonthToClose, setSelectedMonthToClose] = useState<string>(() => {
    return availableMonths[0] || getMonthKey();
  });

  const [closingNotes, setClosingNotes] = useState('');
  const [isClosing, setIsClosing] = useState(false);
  const [confirmPendingWarning, setConfirmPendingWarning] = useState(false);
  const [statusFeedback, setStatusFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Saved Archives Filter Tab
  const [archivesFilterTab, setArchivesFilterTab] = useState<'all' | '01_aug_30_sep' | 'custom_ranges' | 'single_months'>('all');

  // Inspection modal state
  const [inspectingRecord, setInspectingRecord] = useState<MonthClosingRecord | null>(null);
  const [inspectTab, setInspectTab] = useState<'vouchers' | 'parties' | 'stock' | 'bardana' | 'pnl'>('vouchers');

  // Printing certificate state
  const [printingRecord, setPrintingRecord] = useState<MonthClosingRecord | null>(null);

  // Reopen prompt state
  const [reopeningRecord, setReopeningRecord] = useState<MonthClosingRecord | null>(null);
  const [reopenReason, setReopenReason] = useState('');

  // Business-specific closed records
  const currentBusinessClosings = useMemo(() => {
    return monthClosingRecords.filter(r => r.businessId === currentBusiness.id);
  }, [monthClosingRecords, currentBusiness.id]);

  // Filtered archives according to selected tab
  const filteredArchives = useMemo(() => {
    if (archivesFilterTab === '01_aug_30_sep') {
      return currentBusinessClosings.filter(r =>
        (r.startDate === '2026-08-01' && r.endDate === '2026-09-30') ||
        r.monthName.includes('01 Aug 2026 to 30 Sep 2026') ||
        r.monthKey.includes('2026-08-01_to_2026-09-30')
      );
    }
    if (archivesFilterTab === 'custom_ranges') {
      return currentBusinessClosings.filter(r => r.closingType === 'custom_range' || r.monthKey.includes('_to_'));
    }
    if (archivesFilterTab === 'single_months') {
      return currentBusinessClosings.filter(r => r.closingType !== 'custom_range' && !r.monthKey.includes('_to_'));
    }
    return currentBusinessClosings;
  }, [currentBusinessClosings, archivesFilterTab]);

  // Formatted date range label for the multi-month picker
  const formattedRangeLabel = useMemo(() => {
    return formatPeriodDateRange(rangeStartDate, rangeEndDate);
  }, [rangeStartDate, rangeEndDate]);

  // Duration in days & months
  const rangeDurationSummary = useMemo(() => {
    const s = new Date(rangeStartDate);
    const e = new Date(rangeEndDate);
    const diffTime = Math.abs(e.getTime() - s.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    const monthsApprox = (diffDays / 30.5).toFixed(1);
    return `${diffDays} Days (≈ ${monthsApprox} Months)`;
  }, [rangeStartDate, rangeEndDate]);

  // Handle Preset selection
  const handleSelectPreset = (preset: '01_aug_30_sep' | '01_jul_30_sep' | '01_apr_30_jun' | '01_jun_31_jul' | 'custom') => {
    setRangePreset(preset);
    if (preset === '01_aug_30_sep') {
      setRangeStartDate('2026-08-01');
      setRangeEndDate('2026-09-30');
    } else if (preset === '01_jul_30_sep') {
      setRangeStartDate('2026-07-01');
      setRangeEndDate('2026-09-30');
    } else if (preset === '01_apr_30_jun') {
      setRangeStartDate('2026-04-01');
      setRangeEndDate('2026-06-30');
    } else if (preset === '01_jun_31_jul') {
      setRangeStartDate('2026-06-01');
      setRangeEndDate('2026-07-31');
    }
  };

  // Pre-closing audit calculation for MULTI-MONTH CUSTOM RANGE (like 01 Aug 2026 to 30 Sep 2026)
  const preClosingRangeAudit = useMemo(() => {
    const rangeVouchers = vouchers.filter(
      v => v.businessId === currentBusiness.id && !v.isDeleted && v.date >= rangeStartDate && v.date <= rangeEndDate
    );

    const pendingVouchers = rangeVouchers.filter(v => v.status === 'Pending');
    const approvedVouchers = rangeVouchers.filter(v => v.status === 'Approved');

    let totalPurchaseFirstWeight = 0;
    let totalPurchaseAmount = 0;
    let totalSalesFirstWeight = 0;
    let totalSalesAmount = 0;
    let totalExpenses = 0;

    approvedVouchers.forEach(v => {
      if (v.type === 'PURCHASE') {
        totalPurchaseFirstWeight += v.firstWeight;
        totalPurchaseAmount += v.totalAmount;
        totalExpenses += v.totalExpenses;
      } else if (v.type === 'SALE') {
        totalSalesFirstWeight += v.firstWeight;
        totalSalesAmount += v.totalAmount;
        totalExpenses += v.totalExpenses;
      } else if (v.type === 'EXPENSE') {
        totalExpenses += v.totalAmount;
      }
    });

    const rangeKey = `${rangeStartDate}_to_${rangeEndDate}`;
    const isAlreadyClosed = currentBusinessClosings.some(
      r => ((r.startDate === rangeStartDate && r.endDate === rangeEndDate) || r.monthKey === rangeKey) && r.isLocked
    );

    return {
      totalVouchers: rangeVouchers.length,
      pendingCount: pendingVouchers.length,
      approvedCount: approvedVouchers.length,
      totalPurchaseFirstWeight,
      totalPurchaseAmount,
      totalSalesFirstWeight,
      totalSalesAmount,
      totalExpenses,
      estimatedProfit: totalSalesAmount - totalPurchaseAmount - totalExpenses,
      isAlreadyClosed
    };
  }, [vouchers, currentBusiness.id, rangeStartDate, rangeEndDate, currentBusinessClosings]);

  // Pre-closing audit calculation for SINGLE MONTH
  const preClosingAudit = useMemo(() => {
    const monthVouchers = vouchers.filter(
      v => v.businessId === currentBusiness.id && !v.isDeleted && v.date.startsWith(selectedMonthToClose)
    );

    const pendingVouchers = monthVouchers.filter(v => v.status === 'Pending');
    const approvedVouchers = monthVouchers.filter(v => v.status === 'Approved');

    let totalPurchaseFirstWeight = 0;
    let totalPurchaseAmount = 0;
    let totalSalesFirstWeight = 0;
    let totalSalesAmount = 0;
    let totalExpenses = 0;

    approvedVouchers.forEach(v => {
      if (v.type === 'PURCHASE') {
        totalPurchaseFirstWeight += v.firstWeight;
        totalPurchaseAmount += v.totalAmount;
        totalExpenses += v.totalExpenses;
      } else if (v.type === 'SALE') {
        totalSalesFirstWeight += v.firstWeight;
        totalSalesAmount += v.totalAmount;
        totalExpenses += v.totalExpenses;
      } else if (v.type === 'EXPENSE') {
        totalExpenses += v.totalAmount;
      }
    });

    const isAlreadyClosed = currentBusinessClosings.some(
      r => r.monthKey === selectedMonthToClose && r.isLocked
    );

    return {
      totalVouchers: monthVouchers.length,
      pendingCount: pendingVouchers.length,
      approvedCount: approvedVouchers.length,
      totalPurchaseFirstWeight,
      totalPurchaseAmount,
      totalSalesFirstWeight,
      totalSalesAmount,
      totalExpenses,
      estimatedProfit: totalSalesAmount - totalPurchaseAmount - totalExpenses,
      isAlreadyClosed
    };
  }, [vouchers, currentBusiness.id, selectedMonthToClose, currentBusinessClosings]);

  // Dedicated Record & Vouchers for 01 Aug 2026 to 30 Sep 2026 (Not a single month)
  const augSepRecord = useMemo(() => {
    return currentBusinessClosings.find(
      r => (r.startDate === '2026-08-01' && r.endDate === '2026-09-30') ||
           r.monthKey === '2026-08-01_to_2026-09-30' ||
           r.monthName.includes('01 Aug 2026 to 30 Sep 2026')
    );
  }, [currentBusinessClosings]);

  const augSepLiveVouchers = useMemo(() => {
    return vouchers.filter(
      v => v.businessId === currentBusiness.id && !v.isDeleted && v.date >= '2026-08-01' && v.date <= '2026-09-30'
    );
  }, [vouchers, currentBusiness.id]);

  // Display vouchers for 01 Aug to 30 Sep period
  const augSepDisplayVouchers = useMemo(() => {
    if (augSepRecord && augSepRecord.vouchers && augSepRecord.vouchers.length > 0) {
      return augSepRecord.vouchers;
    }
    return augSepLiveVouchers;
  }, [augSepRecord, augSepLiveVouchers]);

  // Filtered vouchers for the 01 Aug to 30 Sep sub-tab
  const filteredAugSepVouchers = useMemo(() => {
    return augSepDisplayVouchers.filter(v => {
      if (periodVoucherFilter !== 'ALL' && v.type !== periodVoucherFilter) return false;
      if (periodVoucherSearch.trim()) {
        const q = periodVoucherSearch.toLowerCase();
        return (
          v.voucherNo.toLowerCase().includes(q) ||
          v.partyName.toLowerCase().includes(q) ||
          (v.itemName && v.itemName.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [augSepDisplayVouchers, periodVoucherFilter, periodVoucherSearch]);

  const handleExportAugSepExcel = () => {
    const dataToExport = augSepDisplayVouchers.map((v, i) => ({
      srNo: i + 1,
      voucherNo: v.voucherNo,
      date: v.date,
      type: v.type,
      party: v.partyName,
      item: v.itemName || '-',
      firstWeight: v.firstWeight || 0,
      netWeight: v.netWeight || 0,
      bags: v.bags || 0,
      rate: v.ratePer40Kg || 0,
      totalAmount: v.totalAmount,
      status: v.status
    }));

    exportReportToExcel({
      business: currentBusiness,
      reportName: 'Period_Closing_01_Aug_2026_to_30_Sep_2026',
      dateRangeStr: '01/08/2026 to 30/09/2026 (2 Months Kharif Season)',
      columns: [
        { headerEn: 'Sr #', key: 'srNo' },
        { headerEn: 'Voucher #', key: 'voucherNo' },
        { headerEn: 'Date', key: 'date' },
        { headerEn: 'Type', headerUrdu: 'قسم', key: 'type' },
        { headerEn: 'Party Name', headerUrdu: 'پارٹی نام', key: 'party' },
        { headerEn: 'Commodity', headerUrdu: 'جنس', key: 'item' },
        { headerEn: 'First Wt (KG)', headerUrdu: 'پہلا وزن', key: 'firstWeight', format: 'weight' },
        { headerEn: 'Bags', headerUrdu: 'بوریاں', key: 'bags', format: 'number' },
        { headerEn: 'Rate / 40KG', headerUrdu: 'ریٹ', key: 'rate', format: 'currency' },
        { headerEn: 'Total Amount (Rs.)', headerUrdu: 'کل رقم', key: 'totalAmount', format: 'currency' },
        { headerEn: 'Status', key: 'status' }
      ],
      data: dataToExport,
      grandTotalRow: {
        srNo: 'TOTAL',
        firstWeight: augSepRecord?.totalPurchaseWeightKg || 0,
        totalAmount: augSepRecord?.totalSalesAmount || 0
      }
    });
  };

  // Execute closing for MULTI-MONTH RANGE
  const handleExecuteRangeClosing = () => {
    if (!rangeStartDate || !rangeEndDate) {
      setStatusFeedback({ type: 'error', message: 'Please select valid Start and End dates for the period.' });
      return;
    }
    if (rangeStartDate > rangeEndDate) {
      setStatusFeedback({ type: 'error', message: 'Start date cannot be after End date.' });
      return;
    }

    if (preClosingRangeAudit.isAlreadyClosed) {
      setStatusFeedback({ type: 'error', message: `Period ${formattedRangeLabel.en} is already closed and locked!` });
      return;
    }

    if (preClosingRangeAudit.pendingCount > 0 && !confirmPendingWarning) {
      setStatusFeedback({
        type: 'error',
        message: `Warning: There are ${preClosingRangeAudit.pendingCount} unapproved pending vouchers between ${rangeStartDate} and ${rangeEndDate}. Please review and check the confirmation box below to proceed.`
      });
      return;
    }

    setIsClosing(true);
    setStatusFeedback(null);

    const periodNameObj = formatPeriodDateRange(rangeStartDate, rangeEndDate);

    try {
      const res = closeMonth({
        startDate: rangeStartDate,
        endDate: rangeEndDate,
        periodName: periodNameObj.en,
        periodNameUrdu: periodNameObj.urdu,
        closingType: 'custom_range',
        notes: closingNotes
      });

      if (res.success) {
        setStatusFeedback({ type: 'success', message: res.message });
        setClosingNotes('');
        setConfirmPendingWarning(false);
      } else {
        setStatusFeedback({ type: 'error', message: res.message });
      }
    } catch (e: any) {
      setStatusFeedback({ type: 'error', message: e.message || 'Error executing period closing.' });
    } finally {
      setIsClosing(false);
    }
  };

  // Execute closing for SINGLE MONTH
  const handleExecuteSingleMonthClosing = () => {
    if (preClosingAudit.isAlreadyClosed) {
      setStatusFeedback({ type: 'error', message: `Month ${selectedMonthToClose} is already closed and locked!` });
      return;
    }

    if (preClosingAudit.pendingCount > 0 && !confirmPendingWarning) {
      setStatusFeedback({
        type: 'error',
        message: `Warning: There are ${preClosingAudit.pendingCount} unapproved pending vouchers in ${selectedMonthToClose}. Please review and check the confirmation box below to proceed.`
      });
      return;
    }

    setIsClosing(true);
    setStatusFeedback(null);

    try {
      const res = closeMonth({
        monthKey: selectedMonthToClose,
        closingType: 'single_month',
        notes: closingNotes
      });

      if (res.success) {
        setStatusFeedback({ type: 'success', message: res.message });
        setClosingNotes('');
        setConfirmPendingWarning(false);
      } else {
        setStatusFeedback({ type: 'error', message: res.message });
      }
    } catch (e: any) {
      setStatusFeedback({ type: 'error', message: e.message || 'Error executing month closing.' });
    } finally {
      setIsClosing(false);
    }
  };

  const handleExecuteReopen = () => {
    if (!reopeningRecord) return;
    if (!reopenReason.trim()) {
      setStatusFeedback({ type: 'error', message: 'Please state a reason for unlocking this closed period (e.g. Audit correction).' });
      return;
    }

    const res = reopenMonth(reopeningRecord.monthKey, reopenReason.trim());
    if (res.success) {
      setStatusFeedback({ type: 'success', message: res.message });
      setReopeningRecord(null);
      setReopenReason('');
    } else {
      setStatusFeedback({ type: 'error', message: res.message });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white rounded-2xl p-5 sm:p-7 shadow-xl border border-slate-800 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-xs font-bold border border-emerald-500/30">
                Period Accounting & Lock
              </span>
              <span className="text-xs text-slate-300">
                Firm: <strong className="text-white">{currentBusiness.name}</strong> ({currentBusiness.nameUrdu})
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2.5">
              <CalendarCheck className="w-6 h-6 text-emerald-400" />
              <span>Month & Seasonal Period Closing Centre (ماہانہ و پیریڈ کلوزنگ)</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-urdu">
              سنگل مہینہ یا ملٹی منتھ رینج (جیسے 01 اگست تا 30 ستمبر 2026) کا حساب کتاب علیحدہ محفوظ کریں۔ کھاتوں اور گودام سٹاک کے اختتامی بقایاجات خودکار طور پر اگلے پیریڈ منتقل ہو جاتے ہیں۔
            </p>
            <p className="text-xs text-emerald-200 leading-relaxed">
              Supports both Single Month closings and Multi-Month seasonal custom ranges (e.g. 01 Aug 2026 to 30 Sep 2026). Transactions within the selected period are snapshot-isolated and archived.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
            <div className="bg-white/10 backdrop-blur-xs rounded-xl p-3 border border-white/10 text-center sm:text-left">
              <div className="text-[10px] text-emerald-300 uppercase font-semibold">Active Filter</div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5 mt-0.5">
                <Filter className="w-3.5 h-3.5 text-emerald-400" />
                <span>
                  {activeMonthFilter === 'all'
                    ? 'All Records (تمام ریکارڈ)'
                    : activeMonthFilter === '2026-08-01_to_2026-09-30'
                    ? '01 Aug 2026 to 30 Sep 2026 (Selected Period)'
                    : activeMonthFilter}
                </span>
              </div>
              {activeMonthFilter !== 'all' && (
                <button
                  onClick={() => setActiveMonthFilter('all')}
                  className="mt-1 text-[10px] text-emerald-300 underline hover:text-white"
                >
                  Clear Filter (تمام دیکھیں)
                </button>
              )}
            </div>
          </div>
        </div>

        {/* FEEDBACK ALERT */}
        {statusFeedback && (
          <div
            className={`mt-4 p-3 rounded-xl border text-xs flex items-center justify-between gap-3 ${
              statusFeedback.type === 'success'
                ? 'bg-emerald-900/90 text-emerald-100 border-emerald-500'
                : 'bg-rose-900/90 text-rose-100 border-rose-500'
            }`}
          >
            <div className="flex items-center gap-2">
              {statusFeedback.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-300 shrink-0" />
              )}
              <span>{statusFeedback.message}</span>
            </div>
            <button
              onClick={() => setStatusFeedback(null)}
              className="text-white/70 hover:text-white p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* PRIMARY SECTION TABS: "01 Aug 2026 to 30 Sep 2026" (NOT A SINGLE MONTH) */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl p-2 border border-slate-200 shadow-xs">
        <div className="flex flex-wrap gap-2">
          {/* TAB 1: 01 Aug 2026 to 30 Sep 2026 (The Requested Multi-Month Tab) */}
          <button
            type="button"
            onClick={() => {
              setMainViewTab('01_aug_30_sep');
              setClosingModeTab('custom_range');
              handleSelectPreset('01_aug_30_sep');
            }}
            className={`flex-1 min-w-[220px] py-2.5 px-4 rounded-xl font-bold text-xs transition flex items-center justify-between border ${
              mainViewTab === '01_aug_30_sep'
                ? 'bg-gradient-to-r from-emerald-800 to-emerald-950 text-white border-emerald-900 shadow-md ring-2 ring-emerald-500/30'
                : 'bg-emerald-50/70 hover:bg-emerald-100/80 text-emerald-950 border-emerald-300'
            }`}
          >
            <div className="flex items-center gap-2.5 text-left">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <div className="font-extrabold flex items-center gap-1.5 text-xs sm:text-sm">
                  <span>01 Aug 2026 to 30 Sep 2026</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                    mainViewTab === '01_aug_30_sep' ? 'bg-emerald-700 text-emerald-100' : 'bg-emerald-200 text-emerald-900'
                  }`}>
                    2 Months
                  </span>
                </div>
                <div className={`text-[10px] font-normal ${mainViewTab === '01_aug_30_sep' ? 'text-emerald-200' : 'text-emerald-700'}`}>
                  Multi-Month Period · <span className="font-urdu">نہ صرف ایک مہینہ</span>
                </div>
              </div>
            </div>
            <span className="text-[11px] font-urdu font-bold hidden md:inline opacity-90">خریف سیزن</span>
          </button>

          {/* TAB 2: Custom Multi-Month Range */}
          <button
            type="button"
            onClick={() => {
              setMainViewTab('custom_range');
              setClosingModeTab('custom_range');
            }}
            className={`flex-1 min-w-[160px] py-2.5 px-3 rounded-xl font-bold text-xs transition flex items-center gap-2 border ${
              mainViewTab === 'custom_range'
                ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            <Calendar className="w-4 h-4 text-emerald-500 shrink-0" />
            <div className="text-left">
              <div>Custom Multi-Month</div>
              <div className="text-[10px] opacity-75 font-normal">Any 2-3 Months Season</div>
            </div>
          </button>

          {/* TAB 3: Single Month Closing */}
          <button
            type="button"
            onClick={() => {
              setMainViewTab('single_month');
              setClosingModeTab('single_month');
            }}
            className={`flex-1 min-w-[150px] py-2.5 px-3 rounded-xl font-bold text-xs transition flex items-center gap-2 border ${
              mainViewTab === 'single_month'
                ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            <CalendarCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <div className="text-left">
              <div>Single Month Close</div>
              <div className="text-[10px] opacity-75 font-normal font-urdu">سنگل ۳۰ دن کا مہینہ</div>
            </div>
          </button>

          {/* TAB 4: Saved Archives */}
          <button
            type="button"
            onClick={() => setMainViewTab('archives')}
            className={`flex-1 min-w-[150px] py-2.5 px-3 rounded-xl font-bold text-xs transition flex items-center justify-between border ${
              mainViewTab === 'archives'
                ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
            }`}
          >
            <div className="flex items-center gap-2 text-left">
              <FolderArchive className="w-4 h-4 text-emerald-500 shrink-0" />
              <div>
                <div>Saved Archives</div>
                <div className="text-[10px] opacity-75 font-normal">Audit Snapshots</div>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-800 text-[10px] font-mono font-bold">
              {currentBusinessClosings.length}
            </span>
          </button>
        </div>
      </div>

      {/* DEDICATED VIEW 1: 01 Aug 2026 to 30 Sep 2026 (MULTI-MONTH KHARIF PERIOD) */}
      {mainViewTab === '01_aug_30_sep' && (
        <AugSepPeriodWorkspace
          business={currentBusiness}
          record={augSepRecord}
          liveVouchers={augSepLiveVouchers}
          parties={parties.filter(p => p.businessId === currentBusiness.id)}
          items={items.filter(i => i.businessId === currentBusiness.id)}
          bardanaMasters={bardanaMasters.filter(b => b.businessId === currentBusiness.id)}
          activeMonthFilter={activeMonthFilter}
          onSetActiveFilter={setActiveMonthFilter}
          onPrintCertificate={rec => setPrintingRecord(rec)}
          onExportJson={mKey => exportMonthArchiveFile(mKey)}
          onExportExcel={handleExportAugSepExcel}
          onUnlock={rec => setReopeningRecord(rec)}
          onRelock={() => {
            if (augSepRecord) {
              closeMonth({
                monthKey: augSepRecord.monthKey,
                startDate: augSepRecord.startDate,
                endDate: augSepRecord.endDate,
                notes: 'Re-locked after audit adjustments'
              });
            }
          }}
          onCloseWizardRequest={() => {
            setMainViewTab('custom_range');
            setClosingModeTab('custom_range');
            handleSelectPreset('01_aug_30_sep');
          }}
        />
      )}

      {/* DEDICATED VIEW 2, 3 & 4: 2-COLUMN WORKSPACE (CUSTOM RANGE / SINGLE MONTH / ARCHIVES) */}
      {mainViewTab !== '01_aug_30_sep' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: CLOSING WIZARD & VERIFICATION (5 COLS) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            
            {/* WIZARD CARD HEADER */}
            <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">Close & Finalize Period</h2>
                  <div className="text-[11px] text-slate-500 font-urdu">ماہانہ و پیریڈ کلوزنگ و لاکنگ وزرڈ</div>
                </div>
              </div>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
                Period Lock
              </span>
            </div>

            {/* TAB SELECTOR: MULTI-MONTH RANGE (01 Aug 2026 to 30 Sep 2026) vs SINGLE MONTH */}
            <div className="p-4 pb-0 bg-slate-50/50">
              <div className="flex border border-slate-200 rounded-xl bg-slate-100 p-1 text-xs font-bold gap-1 shadow-inner">
                <button
                  type="button"
                  onClick={() => setClosingModeTab('custom_range')}
                  className={`flex-1 py-2 px-2.5 rounded-lg transition flex items-center justify-center gap-1.5 ${
                    closingModeTab === 'custom_range'
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                  }`}
                >
                  <Calendar className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                  <span>Custom Range</span>
                  <span className="text-[10px] bg-emerald-950 text-emerald-200 px-1.5 py-0.2 rounded font-mono hidden sm:inline">
                    01 Aug to 30 Sep
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setClosingModeTab('single_month')}
                  className={`flex-1 py-2 px-2.5 rounded-lg transition flex items-center justify-center gap-1.5 ${
                    closingModeTab === 'single_month'
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                  }`}
                >
                  <CalendarCheck className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                  <span>Single Month</span>
                  <span className="font-urdu text-[11px] opacity-80">(ماہانہ)</span>
                </button>
              </div>
            </div>

            <div className="p-5 space-y-5">
              
              {/* ========================================================================= */}
              {/* TAB 1: MULTI-MONTH RANGE CLOSING (e.g. 01 Aug 2026 to 30 Sep 2026) */}
              {/* ========================================================================= */}
              {closingModeTab === 'custom_range' && (
                <div className="space-y-4">
                  
                  {/* PRESET CHIPS */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center justify-between">
                      <span>Choose Range / سیزن رینج منتخب کریں:</span>
                      <span className="text-[10px] text-emerald-700 font-bold font-urdu">نہ صرف ایک مہینہ</span>
                    </label>
                    
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleSelectPreset('01_aug_30_sep')}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 border ${
                          rangePreset === '01_aug_30_sep'
                            ? 'bg-emerald-800 text-white border-emerald-900 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-300'
                        }`}
                      >
                        <Sparkles className="w-3 h-3 text-amber-400" />
                        <span>01 Aug 2026 to 30 Sep 2026 (2 Months)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSelectPreset('01_jul_30_sep')}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition border ${
                          rangePreset === '01_jul_30_sep'
                            ? 'bg-emerald-800 text-white border-emerald-900 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-300'
                        }`}
                      >
                        <span>01 Jul to 30 Sep (Q3 / خریف)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSelectPreset('01_apr_30_jun')}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition border ${
                          rangePreset === '01_apr_30_jun'
                            ? 'bg-emerald-800 text-white border-emerald-900 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-300'
                        }`}
                      >
                        <span>01 Apr to 30 Jun (Q2 / ربیع)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSelectPreset('custom')}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition border ${
                          rangePreset === 'custom'
                            ? 'bg-emerald-800 text-white border-emerald-900 shadow-xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-300'
                        }`}
                      >
                        <span>Custom Dates (کسٹم رینج)</span>
                      </button>
                    </div>
                  </div>

                  {/* START & END DATE INPUTS */}
                  <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        Start Date (ابتدائی تاریخ):
                      </label>
                      <input
                        type="date"
                        value={rangeStartDate}
                        onChange={e => {
                          setRangeStartDate(e.target.value);
                          setRangePreset('custom');
                        }}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">
                        End Date (اختتامی تاریخ):
                      </label>
                      <input
                        type="date"
                        value={rangeEndDate}
                        onChange={e => {
                          setRangeEndDate(e.target.value);
                          setRangePreset('custom');
                        }}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>

                  {/* PERIOD SUMMARY BADGE */}
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-emerald-950 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{formattedRangeLabel.en}</span>
                      </div>
                      <div className="text-[11px] font-urdu text-emerald-800 font-semibold mt-0.5">
                        {formattedRangeLabel.urdu}
                      </div>
                    </div>
                    <span className="text-[11px] font-mono font-bold bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-full border border-emerald-300">
                      {rangeDurationSummary}
                    </span>
                  </div>

                  {/* STATUS WARNING IF PERIOD ALREADY CLOSED */}
                  {preClosingRangeAudit.isAlreadyClosed ? (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 space-y-1.5">
                      <div className="font-bold flex items-center gap-1.5">
                        <Lock className="w-4 h-4 text-amber-700" />
                        <span>This multi-month period ({formattedRangeLabel.en}) is already closed & locked!</span>
                      </div>
                      <p className="text-[11px] leading-relaxed">
                        To inspect transactions or modify vouchers in this period, use the <em>Inspect Data</em> or <em>Unlock</em> option in the archives list.
                      </p>
                    </div>
                  ) : (
                    /* PRE-CLOSING RECONCILIATION SUMMARY FOR RANGE */
                    <div className="space-y-3">
                      <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                        <span>Period Reconciliation Summary:</span>
                        {preClosingRangeAudit.pendingCount > 0 ? (
                          <span className="text-[10px] text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full font-bold">
                            {preClosingRangeAudit.pendingCount} Pending Vouchers
                          </span>
                        ) : (
                          <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-bold">
                            Ready to Close Period
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="p-2.5 rounded-xl border border-slate-100 bg-slate-50">
                          <div className="text-[10px] text-slate-500 font-medium">Purchases (First Wt)</div>
                          <div className="font-bold text-slate-900 mt-0.5">{formatPKR(preClosingRangeAudit.totalPurchaseAmount)}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{preClosingRangeAudit.totalPurchaseFirstWeight.toLocaleString()} KG</div>
                        </div>

                        <div className="p-2.5 rounded-xl border border-slate-100 bg-slate-50">
                          <div className="text-[10px] text-slate-500 font-medium">Sales Turnover</div>
                          <div className="font-bold text-slate-900 mt-0.5">{formatPKR(preClosingRangeAudit.totalSalesAmount)}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{preClosingRangeAudit.totalSalesFirstWeight.toLocaleString()} KG</div>
                        </div>

                        <div className="p-2.5 rounded-xl border border-slate-100 bg-slate-50">
                          <div className="text-[10px] text-slate-500 font-medium">Direct/Indirect Expenses</div>
                          <div className="font-bold text-rose-700 mt-0.5">{formatPKR(preClosingRangeAudit.totalExpenses)}</div>
                          <div className="text-[10px] text-slate-400">Total period expenses</div>
                        </div>

                        <div className="p-2.5 rounded-xl border border-emerald-100 bg-emerald-50">
                          <div className="text-[10px] text-emerald-700 font-medium">Est. Net Period Profit</div>
                          <div className="font-bold text-emerald-950 mt-0.5">{formatPKR(preClosingRangeAudit.estimatedProfit)}</div>
                          <div className="text-[10px] text-emerald-700 font-urdu">پیریڈ کا خالص منافع</div>
                        </div>
                      </div>

                      {preClosingRangeAudit.totalVouchers === 0 && (
                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500 text-center">
                          No vouchers recorded between {rangeStartDate} and {rangeEndDate} for this firm.
                        </div>
                      )}
                    </div>
                  )}

                  {/* Closing Notes */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Closing Remarks & Seasonal Audit Notes (اختیاری ریمارکس):
                    </label>
                    <textarea
                      value={closingNotes}
                      onChange={e => setClosingNotes(e.target.value)}
                      placeholder={`e.g. Multi-month seasonal closing for ${formattedRangeLabel.en} after full farmer khata settlement...`}
                      rows={2}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  {/* Pending Vouchers Warning & Confirmation */}
                  {preClosingRangeAudit.pendingCount > 0 && !preClosingRangeAudit.isAlreadyClosed && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-2">
                      <div className="flex items-center gap-1.5 font-bold">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>Warning: {preClosingRangeAudit.pendingCount} Pending Vouchers in this Period</span>
                      </div>
                      <p className="text-[11px] text-amber-800 leading-relaxed font-urdu">
                        توجہ فرمائیں: اس پیریڈ میں {preClosingRangeAudit.pendingCount} غیر منظور شدہ واؤچرز موجود ہیں۔ پیریڈ کلوز کرنے پر یہ کھاتوں اور اسٹاک میں شامل نہیں ہوں گے۔
                      </p>
                      <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-800 pt-1">
                        <input
                          type="checkbox"
                          checked={confirmPendingWarning}
                          onChange={e => setConfirmPendingWarning(e.target.checked)}
                          className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                        />
                        <span>I understand & confirm closing with unapproved vouchers</span>
                      </label>
                    </div>
                  )}

                  {/* ACTION BUTTON FOR MULTI-MONTH RANGE */}
                  <button
                    onClick={handleExecuteRangeClosing}
                    disabled={isClosing || preClosingRangeAudit.isAlreadyClosed}
                    className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold transition shadow-md flex items-center justify-center gap-2 active:scale-95"
                  >
                    <Lock className="w-4 h-4" />
                    <span>
                      {isClosing
                        ? 'Closing & Archiving Period Data...'
                        : `Finalize & Lock Period: ${formattedRangeLabel.en} (پیریڈ کلوز و لاک کریں)`}
                    </span>
                  </button>

                </div>
              )}

              {/* ========================================================================= */}
              {/* TAB 2: SINGLE MONTH CLOSING */}
              {/* ========================================================================= */}
              {closingModeTab === 'single_month' && (
                <div className="space-y-4">
                  {/* Month Selection */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Select Single Month to Close (کلوز کرنے کا مہینہ منتخب کریں):
                    </label>
                    <select
                      value={selectedMonthToClose}
                      onChange={e => setSelectedMonthToClose(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500"
                    >
                      {availableMonths.map(mKey => {
                        const { en, urdu } = formatMonthName(mKey);
                        const isClosed = currentBusinessClosings.some(r => r.monthKey === mKey && r.isLocked);
                        return (
                          <option key={mKey} value={mKey}>
                            {en} ({urdu}) {isClosed ? '🔒 [CLOSED & LOCKED]' : '🟢 [OPEN]'}
                          </option>
                        );
                      })}
                    </select>
                    <div className="text-[11px] text-slate-400 mt-1">
                      Period Range: {getMonthDateRange(selectedMonthToClose).start} to {getMonthDateRange(selectedMonthToClose).end}
                    </div>
                  </div>

                  {/* Status Warning if Already Closed */}
                  {preClosingAudit.isAlreadyClosed ? (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 space-y-1.5">
                      <div className="font-bold flex items-center gap-1.5">
                        <Lock className="w-4 h-4 text-amber-700" />
                        <span>This month is already finalized & locked!</span>
                      </div>
                      <p className="text-[11px] leading-relaxed">
                        Transactions in <strong>{selectedMonthToClose}</strong> are archived separately. To modify vouchers in this period, use the <em>Unlock Month</em> option in the archives list.
                      </p>
                    </div>
                  ) : (
                    /* PRE-CLOSING RECONCILIATION SUMMARY */
                    <div className="space-y-3">
                      <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                        <span>Reconciliation Summary (حساب کی پڑتال):</span>
                        {preClosingAudit.pendingCount > 0 ? (
                          <span className="text-[10px] text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full font-bold">
                            {preClosingAudit.pendingCount} Pending Vouchers
                          </span>
                        ) : (
                          <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full font-bold">
                            Ready to Close
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="p-2.5 rounded-xl border border-slate-100 bg-slate-50">
                          <div className="text-[10px] text-slate-500 font-medium">Approved Purchases</div>
                          <div className="font-bold text-slate-900 mt-0.5">{formatPKR(preClosingAudit.totalPurchaseAmount)}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{preClosingAudit.totalPurchaseFirstWeight.toLocaleString()} KG</div>
                        </div>

                        <div className="p-2.5 rounded-xl border border-slate-100 bg-slate-50">
                          <div className="text-[10px] text-slate-500 font-medium">Approved Sales</div>
                          <div className="font-bold text-slate-900 mt-0.5">{formatPKR(preClosingAudit.totalSalesAmount)}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{preClosingAudit.totalSalesFirstWeight.toLocaleString()} KG</div>
                        </div>

                        <div className="p-2.5 rounded-xl border border-slate-100 bg-slate-50">
                          <div className="text-[10px] text-slate-500 font-medium">Direct/Indirect Expenses</div>
                          <div className="font-bold text-rose-700 mt-0.5">{formatPKR(preClosingAudit.totalExpenses)}</div>
                          <div className="text-[10px] text-slate-400">Shop overheads</div>
                        </div>

                        <div className="p-2.5 rounded-xl border border-emerald-100 bg-emerald-50">
                          <div className="text-[10px] text-emerald-700 font-medium">Est. Net Month Profit</div>
                          <div className="font-bold text-emerald-950 mt-0.5">{formatPKR(preClosingAudit.estimatedProfit)}</div>
                          <div className="text-[10px] text-emerald-700 font-urdu">ماہانہ خالص منافع</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Closing Notes */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Closing Remarks & Notes (اختیاری ریمارکس):
                    </label>
                    <textarea
                      value={closingNotes}
                      onChange={e => setClosingNotes(e.target.value)}
                      placeholder="e.g. Month finalized after physical weighbridge reconciliation..."
                      rows={2}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  {/* Pending Vouchers Warning & Confirmation */}
                  {preClosingAudit.pendingCount > 0 && !preClosingAudit.isAlreadyClosed && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-2">
                      <div className="flex items-center gap-1.5 font-bold">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>Warning: {preClosingAudit.pendingCount} Pending Vouchers in this Month</span>
                      </div>
                      <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-800 pt-1">
                        <input
                          type="checkbox"
                          checked={confirmPendingWarning}
                          onChange={e => setConfirmPendingWarning(e.target.checked)}
                          className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                        />
                        <span>I understand & confirm closing with unapproved vouchers</span>
                      </label>
                    </div>
                  )}

                  {/* ACTION BUTTON FOR SINGLE MONTH */}
                  <button
                    onClick={handleExecuteSingleMonthClosing}
                    disabled={isClosing || preClosingAudit.isAlreadyClosed}
                    className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold transition shadow-md flex items-center justify-center gap-2 active:scale-95"
                  >
                    <Lock className="w-4 h-4" />
                    <span>
                      {isClosing
                        ? 'Closing & Archiving Data...'
                        : `Finalize & Lock ${formatMonthName(selectedMonthToClose).en} (ماہانہ کھاتہ بند و لاک کریں)`}
                    </span>
                  </button>
                </div>
              )}

              {/* EXPLANATORY CARD */}
              <div className="text-[11px] text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1">
                <div className="font-semibold text-slate-700">What happens after closing a period or month?</div>
                <ul className="list-disc list-inside space-y-0.5 text-slate-600">
                  <li>Vouchers within the selected range (e.g. 01 Aug to 30 Sep) are locked against modification.</li>
                  <li>All Khatas, stock positions, and P&L statements are snapshot-archived.</li>
                  <li>Closing balances are automatically carried forward as opening balances for the next cycle.</li>
                  <li>You can filter, inspect, print certificates, and export JSON packages at any time.</li>
                </ul>
              </div>

            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: SAVED PERIOD & MONTH ARCHIVES (7 COLS) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            
            {/* ARCHIVES CARD HEADER */}
            <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/70 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <FolderArchive className="w-4 h-4 text-emerald-600" />
                    <span>Saved Period & Month Archives (محفوظ شدہ ریکارڈز)</span>
                  </h2>
                  <div className="text-[11px] text-slate-500 font-urdu">
                    ہر پیریڈ و مہینے کا مکمل آڈٹ، کھاتہ، واؤچرز اور نفع و نقصان کی علیحدہ محفوظ فائلیں
                  </div>
                </div>

                <div className="text-xs text-slate-500 font-semibold font-mono">
                  {currentBusinessClosings.length} Total Saved Archives
                </div>
              </div>

              {/* ARCHIVE FILTER TABS */}
              <div className="flex border border-slate-200 rounded-xl bg-white p-1 text-xs font-bold gap-1 overflow-x-auto scrollbar-none">
                <button
                  onClick={() => setArchivesFilterTab('all')}
                  className={`py-1.5 px-3 rounded-lg transition whitespace-nowrap ${
                    archivesFilterTab === 'all'
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  All Archives ({currentBusinessClosings.length})
                </button>

                {/* THE REQUESTED TAB: 01 Aug 2026 to 30 Sep 2026 */}
                <button
                  onClick={() => {
                    setArchivesFilterTab('01_aug_30_sep');
                    setActiveMonthFilter('2026-08-01_to_2026-09-30');
                  }}
                  className={`py-1.5 px-3 rounded-lg transition whitespace-nowrap flex items-center gap-1.5 ${
                    archivesFilterTab === '01_aug_30_sep'
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>01 Aug 2026 to 30 Sep 2026</span>
                  <span className="text-[9px] bg-emerald-700 text-emerald-100 px-1 rounded">2 Mo</span>
                </button>

                <button
                  onClick={() => setArchivesFilterTab('custom_ranges')}
                  className={`py-1.5 px-3 rounded-lg transition whitespace-nowrap ${
                    archivesFilterTab === 'custom_ranges'
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  Multi-Month Ranges
                </button>

                <button
                  onClick={() => setArchivesFilterTab('single_months')}
                  className={`py-1.5 px-3 rounded-lg transition whitespace-nowrap ${
                    archivesFilterTab === 'single_months'
                      ? 'bg-emerald-800 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  Single Months
                </button>
              </div>
            </div>

            {/* ARCHIVES LIST */}
            <div className="p-4 sm:p-6 space-y-4">
              {filteredArchives.length === 0 ? (
                <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-2xl space-y-3">
                  <FolderArchive className="w-10 h-10 text-slate-300 mx-auto" />
                  <div className="text-sm font-bold text-slate-700">No Archives Matching Filter</div>
                  <div className="text-xs text-slate-500 font-urdu max-w-sm mx-auto">
                    اس فلٹر کے مطابق کوئی ریکارڈ نہیں ملا۔ کلوزنگ وزرڈ سے نیا پیریڈ کلوز کریں۔
                  </div>
                  {archivesFilterTab !== 'all' && (
                    <button
                      onClick={() => setArchivesFilterTab('all')}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition"
                    >
                      Show All Archives (تمام ریکارڈ دیکھیں)
                    </button>
                  )}
                </div>
              ) : (
                filteredArchives.map(rec => {
                  const isRange = rec.closingType === 'custom_range' || rec.monthKey.includes('_to_');
                  const isFiltered = activeMonthFilter === rec.monthKey;

                  return (
                    <div
                      key={rec.id}
                      className={`border rounded-2xl p-4 sm:p-5 transition-all shadow-2xs space-y-3 ${
                        isFiltered
                          ? 'border-emerald-500 bg-emerald-50/30 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      {/* CARD HEADER */}
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                              {rec.monthName}
                            </h3>
                            <span className="font-urdu text-sm font-semibold text-emerald-800">
                              ({rec.monthNameUrdu})
                            </span>
                            
                            {isRange ? (
                              <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold border border-blue-200">
                                Multi-Month Range
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">
                                Single Month
                              </span>
                            )}

                            {rec.isLocked ? (
                              <span className="px-2 py-0.5 rounded-full bg-slate-900 text-white text-[10px] font-bold flex items-center gap-1">
                                <Lock className="w-3 h-3 text-emerald-400" />
                                <span>Locked</span>
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold flex items-center gap-1">
                                <Unlock className="w-3 h-3 text-amber-600" />
                                <span>Unlocked (Reopened)</span>
                              </span>
                            )}
                          </div>

                          <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                            <span>Period: <strong>{rec.startDate}</strong> to <strong>{rec.endDate}</strong></span>
                            <span>•</span>
                            <span>Closed by: <strong>{rec.closedBy}</strong></span>
                            <span>•</span>
                            <span>Date: {new Date(rec.closedAt).toLocaleDateString()}</span>
                          </div>
                        </div>

                        {/* FILTER TOGGLE BUTTON */}
                        <button
                          onClick={() => {
                            if (isFiltered) setActiveMonthFilter('all');
                            else setActiveMonthFilter(rec.monthKey);
                          }}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                            isFiltered
                              ? 'bg-emerald-700 text-white'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          }`}
                          title="Isolate all vouchers in ERP to this exact period"
                        >
                          <Filter className="w-3.5 h-3.5" />
                          <span>{isFiltered ? 'Active Filter ✓' : 'Filter by Period'}</span>
                        </button>
                      </div>

                      {/* SUMMARY METRIC STRIP */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-xs">
                        <div className="bg-slate-50 p-2 rounded-xl">
                          <div className="text-[10px] text-slate-400">Total Vouchers</div>
                          <div className="font-bold text-slate-800 font-mono">{rec.totalVouchersCount}</div>
                        </div>

                        <div className="bg-slate-50 p-2 rounded-xl">
                          <div className="text-[10px] text-slate-400">Purchases (First Wt)</div>
                          <div className="font-bold text-slate-800 font-mono truncate">{formatPKR(rec.totalPurchaseAmount)}</div>
                        </div>

                        <div className="bg-slate-50 p-2 rounded-xl">
                          <div className="text-[10px] text-slate-400">Sales Turnover</div>
                          <div className="font-bold text-slate-800 font-mono truncate">{formatPKR(rec.totalSalesAmount)}</div>
                        </div>

                        <div className="bg-emerald-50 p-2 rounded-xl border border-emerald-100">
                          <div className="text-[10px] text-emerald-700 font-medium">Net Mandi Profit</div>
                          <div className="font-bold text-emerald-950 font-mono truncate">{formatPKR(rec.netMandiProfit)}</div>
                        </div>
                      </div>

                      {rec.notes && (
                        <div className="text-[11px] text-slate-600 bg-slate-50/70 p-2 rounded-lg italic">
                          "{rec.notes}"
                        </div>
                      )}

                      {/* ACTION BUTTONS ON CLOSED ARCHIVE */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            onClick={() => {
                              setInspectingRecord(rec);
                              setInspectTab('vouchers');
                            }}
                            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition active:scale-95"
                          >
                            <Eye className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Inspect Data (پیریڈ تفصیل)</span>
                          </button>

                          <button
                            onClick={() => exportMonthArchiveFile(rec.monthKey)}
                            className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                            title="Download isolated JSON Package"
                          >
                            <Download className="w-3.5 h-3.5 text-emerald-600" />
                            <span>JSON File</span>
                          </button>

                          <button
                            onClick={() => setPrintingRecord(rec)}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                          >
                            <Printer className="w-3.5 h-3.5 text-slate-500" />
                            <span>Certificate (سرٹیفکیٹ)</span>
                          </button>
                        </div>

                        {rec.isLocked ? (
                          <button
                            onClick={() => setReopeningRecord(rec)}
                            className="px-2.5 py-1.5 text-amber-700 hover:bg-amber-50 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                            title="Unlock this period for authorized edits"
                          >
                            <Unlock className="w-3.5 h-3.5" />
                            <span>Unlock</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              closeMonth({
                                monthKey: rec.monthKey,
                                startDate: rec.startDate,
                                endDate: rec.endDate,
                                notes: 'Re-locked after audit adjustments'
                              });
                            }}
                            className="px-2.5 py-1.5 text-emerald-700 hover:bg-emerald-50 rounded-lg text-xs font-bold flex items-center gap-1 transition"
                          >
                            <Lock className="w-3.5 h-3.5" />
                            <span>Re-Lock Period</span>
                          </button>
                        )}
                      </div>

                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

      </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: INSPECT SEPARATE PERIOD / MONTH DATA (ماہانہ تفصیل و علیحدہ کھاتہ جات) */}
      {/* ========================================================================= */}
      {inspectingRecord && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-5xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[90vh] flex flex-col">
            
            {/* MODAL HEADER */}
            <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base sm:text-lg">
                    {inspectingRecord.monthName} ({inspectingRecord.monthNameUrdu}) Isolated Archive
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-xs font-bold">
                    {inspectingRecord.isLocked ? '🔒 LOCKED ARCHIVE' : '🔓 OPEN'}
                  </span>
                </div>
                <div className="text-xs text-slate-400 mt-0.5">
                  Period: {inspectingRecord.startDate} to {inspectingRecord.endDate} · Closed at: {new Date(inspectingRecord.closedAt).toLocaleString()}
                </div>
              </div>
              <button
                onClick={() => setInspectingRecord(null)}
                className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* MODAL NAVIGATION TABS */}
            <div className="flex border-b border-slate-200 bg-slate-50 px-4 sm:px-6 overflow-x-auto scrollbar-none text-xs">
              <button
                onClick={() => setInspectTab('vouchers')}
                className={`py-3 px-3 font-semibold border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
                  inspectTab === 'vouchers'
                    ? 'border-emerald-600 text-emerald-800 bg-white'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Receipt className="w-4 h-4 text-emerald-600" />
                <span>Vouchers ({inspectingRecord.vouchers.length})</span>
                <span className="font-urdu text-[11px] text-slate-400">(واؤچرز)</span>
              </button>

              <button
                onClick={() => setInspectTab('parties')}
                className={`py-3 px-3 font-semibold border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
                  inspectTab === 'parties'
                    ? 'border-emerald-600 text-emerald-800 bg-white'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Building2 className="w-4 h-4 text-blue-600" />
                <span>Party Information ({inspectingRecord.partySummaries.length})</span>
                <span className="font-urdu text-[11px] text-slate-400">(پارٹی معلومات)</span>
              </button>

              <button
                onClick={() => setInspectTab('stock')}
                className={`py-3 px-3 font-semibold border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
                  inspectTab === 'stock'
                    ? 'border-emerald-600 text-emerald-800 bg-white'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Scale className="w-4 h-4 text-amber-600" />
                <span>Commodity Stock Closing ({inspectingRecord.stockSummaries.length})</span>
                <span className="font-urdu text-[11px] text-slate-400">(سٹاک)</span>
              </button>

              <button
                onClick={() => setInspectTab('bardana')}
                className={`py-3 px-3 font-semibold border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
                  inspectTab === 'bardana'
                    ? 'border-emerald-600 text-emerald-800 bg-white'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <FolderArchive className="w-4 h-4 text-purple-600" />
                <span>Bardana Balance ({inspectingRecord.bardanaSummaries.length})</span>
                <span className="font-urdu text-[11px] text-slate-400">(باردانہ)</span>
              </button>

              <button
                onClick={() => setInspectTab('pnl')}
                className={`py-3 px-3 font-semibold border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
                  inspectTab === 'pnl'
                    ? 'border-emerald-600 text-emerald-800 bg-white'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileText className="w-4 h-4 text-teal-600" />
                <span>P&L Trading Summary</span>
                <span className="font-urdu text-[11px] text-slate-400">(نفع و نقصان)</span>
              </button>
            </div>

            {/* TAB CONTENTS CONTAINER */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1">
              
              {/* 1. VOUCHERS TAB */}
              {inspectTab === 'vouchers' && (
                <div className="space-y-3">
                  <div className="text-xs text-slate-500 flex justify-between items-center">
                    <span>Archived vouchers recorded during {inspectingRecord.monthName}:</span>
                    <span className="font-bold">{inspectingRecord.vouchers.length} vouchers</span>
                  </div>

                  <div className="overflow-x-auto border border-slate-200 rounded-xl">
                    <table className="w-full text-left text-xs text-slate-700">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                        <tr>
                          <th className="p-2.5">Voucher #</th>
                          <th className="p-2.5">Type</th>
                          <th className="p-2.5">Date</th>
                          <th className="p-2.5">Party</th>
                          <th className="p-2.5">Commodity</th>
                          <th className="p-2.5 text-right">First Wt</th>
                          <th className="p-2.5 text-right">Bags</th>
                          <th className="p-2.5 text-right">Amount (PKR)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {inspectingRecord.vouchers.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="p-6 text-center text-slate-400">
                              No vouchers stored in this archive snapshot.
                            </td>
                          </tr>
                        ) : (
                          inspectingRecord.vouchers.map(v => (
                            <tr key={v.id} className="hover:bg-slate-50">
                              <td className="p-2.5 font-mono font-bold">{v.voucherNo}</td>
                              <td className="p-2.5">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  v.type === 'PURCHASE' ? 'bg-emerald-100 text-emerald-800' :
                                  v.type === 'SALE' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-800'
                                }`}>
                                  {v.type}
                                </span>
                              </td>
                              <td className="p-2.5 font-mono">{v.date}</td>
                              <td className="p-2.5">{v.partyName}</td>
                              <td className="p-2.5">{v.itemName}</td>
                              <td className="p-2.5 text-right font-mono">{v.firstWeight?.toLocaleString() || '-'} KG</td>
                              <td className="p-2.5 text-right font-mono">{v.bags || '-'}</td>
                              <td className="p-2.5 text-right font-mono font-bold">{v.totalAmount ? formatPKR(v.totalAmount) : '-'}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 2. PARTIES TAB */}
              {inspectTab === 'parties' && (
                <div className="space-y-3">
                  <div className="text-xs text-slate-500">
                    Snapshot of Party opening, movement, and closing balances for {inspectingRecord.monthName}:
                  </div>

                  <div className="overflow-x-auto border border-slate-200 rounded-xl">
                    <table className="w-full text-left text-xs text-slate-700">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                        <tr>
                          <th className="p-2.5">Party Name</th>
                          <th className="p-2.5">Type</th>
                          <th className="p-2.5 text-right">Opening Balance</th>
                          <th className="p-2.5 text-right text-emerald-700">Debits (Sales)</th>
                          <th className="p-2.5 text-right text-rose-700">Credits (Purchases)</th>
                          <th className="p-2.5 text-right font-bold bg-slate-100">Carried Forward Balance</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {inspectingRecord.partySummaries.map(p => (
                          <tr key={p.partyId} className="hover:bg-slate-50">
                            <td className="p-2.5">
                              <div className="font-bold">{p.partyName}</div>
                              <div className="font-urdu text-xs text-slate-500">{p.partyNameUrdu}</div>
                            </td>
                            <td className="p-2.5 text-slate-500">{p.type}</td>
                            <td className="p-2.5 text-right font-mono">{formatPKR(p.openingBalance)}</td>
                            <td className="p-2.5 text-right font-mono text-emerald-700">+{formatPKR(p.totalDebits)}</td>
                            <td className="p-2.5 text-right font-mono text-rose-700">-{formatPKR(p.totalCredits)}</td>
                            <td className="p-2.5 text-right font-mono font-bold bg-slate-50">
                              <span className={p.closingBalance >= 0 ? 'text-emerald-700' : 'text-rose-700'}>
                                {formatPKR(p.closingBalance)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 3. STOCK TAB */}
              {inspectTab === 'stock' && (
                <div className="space-y-3">
                  <div className="text-xs text-slate-500">
                    Preserved commodity stock valuation locked strictly to First-Weight Costing:
                  </div>

                  <div className="overflow-x-auto border border-slate-200 rounded-xl">
                    <table className="w-full text-left text-xs text-slate-700">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase text-[10px]">
                        <tr>
                          <th className="p-2.5">Commodity / جنس</th>
                          <th className="p-2.5 text-right">Opening Wt</th>
                          <th className="p-2.5 text-right text-emerald-700">Purchased Wt</th>
                          <th className="p-2.5 text-right text-rose-700">Sold Wt</th>
                          <th className="p-2.5 text-right font-bold bg-slate-100">Closing First Wt</th>
                          <th className="p-2.5 text-right font-bold bg-slate-100">Closing Bags</th>
                          <th className="p-2.5 text-right font-bold">Avg Cost / 40KG</th>
                          <th className="p-2.5 text-right font-bold text-emerald-800">Closing Value</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {inspectingRecord.stockSummaries.map(s => (
                          <tr key={s.itemId} className="hover:bg-slate-50">
                            <td className="p-2.5">
                              <div className="font-bold">{s.itemName}</div>
                              <div className="font-urdu text-xs text-slate-500">{s.itemNameUrdu}</div>
                            </td>
                            <td className="p-2.5 text-right font-mono">{s.openingFirstWeight?.toLocaleString() || 0} KG</td>
                            <td className="p-2.5 text-right font-mono text-emerald-700">+{s.purchasedFirstWeight?.toLocaleString() || 0} KG</td>
                            <td className="p-2.5 text-right font-mono text-rose-700">-{s.soldFirstWeight?.toLocaleString() || 0} KG</td>
                            <td className="p-2.5 text-right font-mono font-bold bg-slate-50">{s.closingFirstWeight?.toLocaleString() || 0} KG</td>
                            <td className="p-2.5 text-right font-mono font-bold bg-slate-50">{s.closingBags}</td>
                            <td className="p-2.5 text-right font-mono">Rs. {s.avgCostPer40Kg?.toFixed(2) || '-'}</td>
                            <td className="p-2.5 text-right font-mono font-bold text-emerald-800">{formatPKR(s.closingValue)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* 4. BARDANA TAB */}
              {inspectTab === 'bardana' && (
                <div className="space-y-3">
                  <div className="text-xs text-slate-500">
                    Gunny bag / Bardana register closing position:
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {inspectingRecord.bardanaSummaries.map(b => (
                      <div key={b.bardanaId} className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1.5 text-xs">
                        <div className="font-bold text-slate-900">{b.bardanaName}</div>
                        <div className="grid grid-cols-2 gap-1 pt-1 border-t border-slate-200 text-[11px]">
                          <div>Opening: <strong className="font-mono">{b.openingBags}</strong></div>
                          <div>Inward: <strong className="font-mono text-emerald-700">+{b.inwardBags}</strong></div>
                          <div>Issued: <strong className="font-mono text-rose-700">-{b.outwardBags}</strong></div>
                          <div>Closing: <strong className="font-mono font-bold text-slate-900">{b.closingBags}</strong></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 5. P&L TAB */}
              {inspectTab === 'pnl' && (
                <div className="max-w-xl mx-auto space-y-4 text-xs">
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                    <div className="text-xs font-bold text-slate-800 uppercase tracking-wider">Trading & P&L Snapshot:</div>
                    
                    <div className="space-y-1.5 pt-2 border-t border-slate-200">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Sales Turnover:</span>
                        <span className="font-mono font-bold text-slate-900">{formatPKR(inspectingRecord.pnlSummary.salesValue)}</span>
                      </div>
                      <div className="flex justify-between text-rose-700">
                        <span>Cost of Goods Sold (First Weight Basis):</span>
                        <span className="font-mono font-bold">-{formatPKR(inspectingRecord.pnlSummary.costOfGoodsSold)}</span>
                      </div>
                      <div className="flex justify-between font-bold pt-1 border-t border-slate-200 text-slate-900">
                        <span>Gross Trading Profit:</span>
                        <span className="font-mono">{formatPKR(inspectingRecord.pnlSummary.grossTradingProfit)}</span>
                      </div>
                      <div className="flex justify-between text-rose-700">
                        <span>Direct Expenses (Labour, Transport):</span>
                        <span className="font-mono">-{formatPKR(inspectingRecord.pnlSummary.totalDirectExpenses)}</span>
                      </div>
                      <div className="flex justify-between text-rose-700">
                        <span>Indirect / Shop Overheads:</span>
                        <span className="font-mono">-{formatPKR(inspectingRecord.pnlSummary.totalIndirectExpenses)}</span>
                      </div>
                      <div className="flex justify-between text-base font-black pt-2 border-t-2 border-slate-300 text-emerald-900 bg-emerald-50 p-2 rounded-lg">
                        <span>Net Mandi Profit (خالص منافع):</span>
                        <span className="font-mono">{formatPKR(inspectingRecord.pnlSummary.netProfit)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: PRINT OFFICIAL CERTIFICATE */}
      {/* ========================================================================= */}
      {printingRecord && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto p-6 sm:p-8 space-y-6">
            
            <div className="flex items-center justify-between no-print border-b border-slate-200 pb-3">
              <span className="font-bold text-sm text-slate-900">Official Period Closing Certificate</span>
              <div className="flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-1.5 bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Certificate</span>
                </button>
                <button
                  onClick={() => setPrintingRecord(null)}
                  className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold"
                >
                  Close
                </button>
              </div>
            </div>

            {/* PRINTABLE BODY */}
            <div className="border-4 border-double border-slate-800 p-6 sm:p-8 space-y-6 text-slate-900">
              
              {/* Header */}
              <div className="text-center space-y-1 border-b-2 border-slate-900 pb-4">
                <div className="text-xl font-black uppercase tracking-tight">{currentBusiness.name}</div>
                <div className="font-urdu text-base font-bold text-emerald-900">{currentBusiness.nameUrdu}</div>
                <div className="text-xs text-slate-600">{currentBusiness.address} · NTN: {currentBusiness.ntn}</div>
                <div className="text-xs font-bold text-slate-700 uppercase tracking-widest pt-2">
                  OFFICIAL PERIOD CLOSING & AUDIT CERTIFICATE
                </div>
                <div className="font-urdu text-xs font-semibold text-slate-800">
                  ماہانہ و موسمی حساب کتاب، سٹاک اور کھاتہ کلوزنگ سرٹیفکیٹ
                </div>
              </div>

              {/* Period Details */}
              <div className="grid grid-cols-2 gap-4 text-xs border-b border-slate-200 pb-3">
                <div>
                  <div><strong>Period / مدت:</strong> {printingRecord.monthName} ({printingRecord.monthNameUrdu})</div>
                  <div><strong>Date Range:</strong> {printingRecord.startDate} to {printingRecord.endDate}</div>
                  <div><strong>Total Vouchers:</strong> {printingRecord.totalVouchersCount} transactions</div>
                </div>
                <div>
                  <div><strong>Closed By:</strong> {printingRecord.closedBy}</div>
                  <div><strong>Closing Timestamp:</strong> {new Date(printingRecord.closedAt).toLocaleString()}</div>
                  <div><strong>Status:</strong> <span className="font-bold text-emerald-800">🔒 LOCKED & AUDITED</span></div>
                </div>
              </div>

              {/* Financial Summary */}
              <div className="space-y-2 text-xs">
                <div className="font-bold uppercase tracking-wider text-slate-800">Period Performance Summary:</div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 border border-slate-300 rounded">
                    <span className="text-slate-500">Gross Purchases:</span>
                    <div className="font-bold font-mono text-sm">{formatPKR(printingRecord.totalPurchaseAmount)}</div>
                    <div className="text-[10px] text-slate-400">{printingRecord.totalPurchaseWeightKg.toLocaleString()} KG First Weight</div>
                  </div>
                  <div className="p-2 border border-slate-300 rounded">
                    <span className="text-slate-500">Gross Sales Turnover:</span>
                    <div className="font-bold font-mono text-sm">{formatPKR(printingRecord.totalSalesAmount)}</div>
                    <div className="text-[10px] text-slate-400">{printingRecord.totalSalesWeightKg.toLocaleString()} KG First Weight</div>
                  </div>
                  <div className="p-2 border border-slate-300 rounded">
                    <span className="text-slate-500">Direct & Indirect Expenses:</span>
                    <div className="font-bold font-mono text-sm text-rose-800">{formatPKR(printingRecord.totalExpensesAmount)}</div>
                    <div className="text-[10px] text-slate-400">Total period expenses</div>
                  </div>
                  <div className="p-2 border-2 border-emerald-700 bg-emerald-50 rounded">
                    <span className="text-emerald-800 font-bold">Net Mandi Profit:</span>
                    <div className="font-black font-mono text-sm text-emerald-950">{formatPKR(printingRecord.netMandiProfit)}</div>
                    <div className="font-urdu text-[10px] text-emerald-700 font-semibold">خالص پیریڈ منافع</div>
                  </div>
                </div>
              </div>

              {/* Signatures */}
              <div className="flex items-end justify-between pt-10 border-t border-slate-300 text-xs">
                <div className="text-center space-y-1">
                  <div className="w-36 border-b border-slate-900"></div>
                  <div className="font-bold">Prepared by (منشی)</div>
                  <div className="text-[10px] text-slate-500">{printingRecord.closedBy}</div>
                </div>
                <div className="text-center space-y-1">
                  <div className="w-36 border-b border-slate-900"></div>
                  <div className="font-bold">Authorized Signature</div>
                  <div className="font-urdu text-[11px] text-slate-600">دستخط چوہدری / مالک</div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: REOPEN / UNLOCK PROMPT */}
      {/* ========================================================================= */}
      {reopeningRecord && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-in fade-in">
            <div className="flex items-center gap-2.5 text-amber-700">
              <Unlock className="w-6 h-6" />
              <h3 className="font-bold text-base text-slate-900">
                Unlock {reopeningRecord.monthName} ({reopeningRecord.monthNameUrdu})?
              </h3>
            </div>
            
            <p className="text-xs text-slate-600 leading-relaxed">
              Unlocking will allow authorized modifications to vouchers in this period ({reopeningRecord.startDate} to {reopeningRecord.endDate}). All alterations will be tracked in the immutable audit log.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Reason for Reopening (وجہ برائے آڈٹ نوٹ):
              </label>
              <input
                type="text"
                value={reopenReason}
                onChange={e => setReopenReason(e.target.value)}
                placeholder="e.g. Adjusting late weight ticket correction..."
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-800 focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setReopeningRecord(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteReopen}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-xs"
              >
                Confirm Unlock Period
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
