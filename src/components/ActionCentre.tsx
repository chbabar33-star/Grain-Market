/**
 * Mandi ERP - Action Centre (Point 11 & Point 25)
 * Central command table for all vouchers across Purchase, Sales, Transfers & Expenses
 * Full filtering, instant search, row actions, bulk actions, and styled accounting totals
 */

import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Printer,
  Copy,
  Trash2,
  History,
  FileSpreadsheet,
  MessageSquare,
  ChevronDown,
  ArrowUpDown,
  CheckSquare,
  Square,
  AlertTriangle,
  Paperclip
} from 'lucide-react';
import { useMandi } from '../context/MandiContext';
import { Voucher, VoucherType, VoucherStatus, DocumentAttachment } from '../types';
import { formatPKR, formatWeight } from '../utils/numberToWords';
import { exportReportToExcel } from '../utils/excelExport';
import { DocumentAttachmentsManager } from './DocumentAttachmentsManager';

interface ActionCentreProps {
  onPrintVoucher: (voucher: Voucher, design: 'a4-standard' | 'a4-modern' | 'thermal-80mm') => void;
  onWhatsAppVoucher: (voucher: Voucher) => void;
  onEditVoucher: (voucher: Voucher) => void;
}

export const ActionCentre: React.FC<ActionCentreProps> = ({
  onPrintVoucher,
  onWhatsAppVoucher,
  onEditVoucher
}) => {
  const {
    currentBusiness,
    filteredVouchers,
    items,
    parties,
    godowns,
    currentUser,
    approveVoucher,
    bulkApproveVouchers,
    cancelVoucher,
    softDeleteVoucher,
    duplicateVoucher,
    updateVoucher,
    languageMode
  } = useMandi();


  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedItem, setSelectedItem] = useState<string>('ALL');
  const [selectedParty, setSelectedParty] = useState<string>('ALL');
  const [selectedGodown, setSelectedGodown] = useState<string>('ALL');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Bulk Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modals for Cancel / Delete / Audit
  const [activeAuditVoucher, setActiveAuditVoucher] = useState<Voucher | null>(null);
  const [actionPrompt, setActionPrompt] = useState<{
    type: 'CANCEL' | 'DELETE';
    voucherId: string;
    voucherNo: string;
  } | null>(null);
  const [promptReason, setPromptReason] = useState('');

  // Row Dropdown state
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);

  // Document Attachments Modal State
  const [activeAttachmentVoucher, setActiveAttachmentVoucher] = useState<Voucher | null>(null);


  // Filter application
  const filteredList = useMemo(() => {
    return filteredVouchers.filter(v => {
      // Search voucherNo, partyName, itemName
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const match =
          v.voucherNo.toLowerCase().includes(q) ||
          v.partyName.toLowerCase().includes(q) ||
          v.partyNameUrdu.includes(q) ||
          v.itemName.toLowerCase().includes(q) ||
          v.itemNameUrdu.includes(q);
        if (!match) return false;
      }

      if (selectedType !== 'ALL' && v.type !== selectedType) return false;
      if (selectedStatus !== 'ALL' && v.status !== selectedStatus) return false;
      if (selectedItem !== 'ALL' && v.itemId !== selectedItem) return false;
      if (selectedParty !== 'ALL' && v.partyId !== selectedParty) return false;
      if (selectedGodown !== 'ALL' && v.godownId !== selectedGodown) return false;

      if (startDate && v.date < startDate) return false;
      if (endDate && v.date > endDate) return false;

      return true;
    });
  }, [
    filteredVouchers,
    searchTerm,
    selectedType,
    selectedStatus,
    selectedItem,
    selectedParty,
    selectedGodown,
    startDate,
    endDate
  ]);

  // Totals calculations
  const totals = useMemo(() => {
    let totalFirstWeight = 0;
    let totalBags = 0;
    let totalBaseAmount = 0;
    let totalExpenses = 0;
    let totalNet = 0;

    filteredList.forEach(v => {
      totalFirstWeight += v.firstWeight;
      totalBags += v.bags;
      totalBaseAmount += v.baseAmount;
      totalExpenses += v.totalExpenses;
      totalNet += v.totalAmount;
    });

    return {
      totalFirstWeight,
      totalBags,
      totalBaseAmount,
      totalExpenses,
      totalNet
    };
  }, [filteredList]);

  // Bulk actions handlers
  const handleSelectAll = () => {
    if (selectedIds.length === filteredList.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredList.map(v => v.id));
    }
  };

  const toggleSelectRow = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleBulkApprove = () => {
    if (!selectedIds.length) return;
    bulkApproveVouchers(selectedIds);
    setSelectedIds([]);
  };

  const handleBulkExportExcel = () => {
    const exportData = filteredList.filter(v => selectedIds.length === 0 || selectedIds.includes(v.id));
    exportReportToExcel({
      business: currentBusiness,
      reportName: 'Action_Centre_Vouchers_Register',
      dateRangeStr: `${startDate || 'Start'} to ${endDate || 'Current'}`,
      columns: [
        { headerEn: 'Voucher No', headerUrdu: 'واؤچر نمبر', key: 'voucherNo' },
        { headerEn: 'Date', headerUrdu: 'تاریخ', key: 'date' },
        { headerEn: 'Type', headerUrdu: 'قسم', key: 'type' },
        { headerEn: 'Party Name', headerUrdu: 'پارٹی / زمیندار', key: 'partyName' },
        { headerEn: 'Item', headerUrdu: 'جنس', key: 'itemName' },
        { headerEn: 'Godown', headerUrdu: 'گودام', key: 'godownName' },
        { headerEn: 'First Weight (KG)', headerUrdu: 'پہلا وزن', key: 'firstWeight', format: 'weight' },
        { headerEn: 'Bags', headerUrdu: 'بوریاں', key: 'bags', format: 'number' },
        { headerEn: 'Rate / 40KG', headerUrdu: 'ریٹ فی من', key: 'ratePer40Kg', format: 'currency' },
        { headerEn: 'Gross Amount (PKR)', headerUrdu: 'خام رقم', key: 'baseAmount', format: 'currency' },
        { headerEn: 'Expenses (PKR)', headerUrdu: 'اخراجات', key: 'totalExpenses', format: 'currency' },
        { headerEn: 'Net Total (PKR)', headerUrdu: 'کل رقم', key: 'totalAmount', format: 'currency' },
        { headerEn: 'Status', headerUrdu: 'حیثیت', key: 'status' }
      ],
      data: exportData,
      subtotalRow: {
        firstWeight: totals.totalFirstWeight,
        bags: totals.totalBags,
        baseAmount: totals.totalBaseAmount,
        totalExpenses: totals.totalExpenses,
        totalAmount: totals.totalNet
      },
      grandTotalRow: {
        firstWeight: totals.totalFirstWeight,
        bags: totals.totalBags,
        baseAmount: totals.totalBaseAmount,
        totalExpenses: totals.totalExpenses,
        totalAmount: totals.totalNet
      },
      generatedBy: currentUser.name
    });
  };

  const handleBulkWhatsApp = () => {
    const selectedVouchers = filteredList.filter(v => selectedIds.includes(v.id));
    if (!selectedVouchers.length) return;
    const firstWithPhone = selectedVouchers.find(v => v.partyWhatsapp || v.partyPhone);
    if (firstWithPhone) {
      onWhatsAppVoucher(firstWithPhone);
    } else {
      alert('Selected vouchers do not have registered party phone numbers.');
    }
  };

  const submitPromptAction = () => {
    if (!actionPrompt || !promptReason.trim()) {
      alert('Please enter a valid reason.');
      return;
    }

    if (actionPrompt.type === 'CANCEL') {
      cancelVoucher(actionPrompt.voucherId, promptReason);
    } else if (actionPrompt.type === 'DELETE') {
      softDeleteVoucher(actionPrompt.voucherId, promptReason);
    }

    setActionPrompt(null);
    setPromptReason('');
  };

  return (
    <div className="space-y-4">
      {/* HEADER SECTION & TITLE */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Action Centre</span>
            <span className="text-slate-400 font-normal">|</span>
            <span className="font-urdu text-base text-slate-700">ایکشن سینٹر (مکمل واؤچر کنٹرول)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Single control hub for approving, editing, printing, WhatsApping, and auditing all vouchers across the Mandi.
          </p>
        </div>

        {/* Global Export Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleBulkExportExcel}
            className="flex items-center gap-2 px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export to Excel (ایکسل ڈاؤنلوڈ)</span>
          </button>
        </div>
      </div>

      {/* FILTER CONTROLS BAR */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        {/* Row 1: Search & Dropdown Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
          {/* Search Box */}
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search Voucher #, Party, Item (تلاش کریں)..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:outline-emerald-600 font-urdu"
            />
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={selectedType}
              onChange={e => setSelectedType(e.target.value)}
              className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-emerald-600"
            >
              <option value="ALL">All Types / تمام اقسام</option>
              <option value="PURCHASE">Purchase / خریداری</option>
              <option value="SALE">Sale / فروخت</option>
              <option value="TRANSFER">Transfer / منتقلی</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-emerald-600 font-semibold text-slate-800"
            >
              <option value="ALL">All Statuses / تمام کیفیات</option>
              <option value="Pending">Pending / زیر التواء (نو اسٹاک)</option>
              <option value="Approved">Approved / منظور شدہ (اسٹاک لاگو)</option>
              <option value="Cancelled">Cancelled / منسوخ</option>
            </select>
          </div>

          {/* Item Filter */}
          <div>
            <select
              value={selectedItem}
              onChange={e => setSelectedItem(e.target.value)}
              className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-emerald-600 font-urdu"
            >
              <option value="ALL">All Items / تمام اجناس</option>
              {items.map(i => (
                <option key={i.id} value={i.id}>
                  {i.name} ({i.nameUrdu})
                </option>
              ))}
            </select>
          </div>

          {/* Godown Filter */}
          <div>
            <select
              value={selectedGodown}
              onChange={e => setSelectedGodown(e.target.value)}
              className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:outline-emerald-600 font-urdu"
            >
              <option value="ALL">All Godowns / تمام گودام</option>
              {godowns.map(g => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 2: Date Filters & Reset */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span>From Date:</span>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-md text-xs"
            />
            <span>To Date:</span>
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-md text-xs"
            />
          </div>

          {(searchTerm || selectedType !== 'ALL' || selectedStatus !== 'ALL' || selectedItem !== 'ALL' || selectedGodown !== 'ALL' || startDate || endDate) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedType('ALL');
                setSelectedStatus('ALL');
                setSelectedItem('ALL');
                setSelectedGodown('ALL');
                setStartDate('');
                setEndDate('');
              }}
              className="text-xs text-rose-600 hover:text-rose-700 underline font-medium"
            >
              Reset Filters (فلٹرز صاف کریں)
            </button>
          )}
        </div>
      </div>

      {/* BULK ACTION BAR IF ITEMS SELECTED */}
      {selectedIds.length > 0 && (
        <div className="bg-emerald-900 text-white p-3 rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-md animate-in fade-in">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="bg-emerald-700 px-2 py-0.5 rounded-full">{selectedIds.length} Selected</span>
            <span>بیک وقت منتخب شدہ واؤچرز پر کارروائی کریں</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleBulkApprove}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Bulk Approve (منظور کریں)</span>
            </button>
            <button
              onClick={handleBulkExportExcel}
              className="px-3 py-1.5 bg-white text-slate-900 hover:bg-slate-100 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
              <span>Bulk Excel Export</span>
            </button>
            <button
              onClick={handleBulkWhatsApp}
              className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Bulk WhatsApp</span>
            </button>
          </div>
        </div>
      )}

      {/* VOUCHER TABLE */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-900 text-white text-[11px] uppercase tracking-wider font-semibold">
                <th className="py-3 px-3 w-8 text-center">
                  <button onClick={handleSelectAll} className="text-white hover:text-emerald-400">
                    {selectedIds.length === filteredList.length && filteredList.length > 0 ? (
                      <CheckSquare className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Square className="w-4 h-4" />
                    )}
                  </button>
                </th>
                <th className="py-3 px-3">Voucher # / تاریخ</th>
                <th className="py-3 px-3">Type / قسم</th>
                <th className="py-3 px-3">Party / پارٹی</th>
                <th className="py-3 px-3">Item / جنس</th>
                <th className="py-3 px-3 text-right">First Wt (KG)</th>
                <th className="py-3 px-3 text-right">Bags</th>
                <th className="py-3 px-3 text-right">Rate / 40KG</th>
                <th className="py-3 px-3 text-right">Amount (PKR)</th>
                <th className="py-3 px-3 text-center">Docs / پرچی</th>
                <th className="py-3 px-3 text-center">Status / کیفیت</th>
                <th className="py-3 px-3 text-center">Actions / کارروائی</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={12} className="py-12 text-center text-slate-400">
                    <p className="text-sm">No vouchers found matching your filter criteria.</p>
                    <p className="font-urdu text-xs mt-1 text-slate-500">کوئی واؤچر ریکارڈ نہیں ملا۔</p>
                  </td>
                </tr>

              ) : (
                filteredList.map(v => {
                  const isSelected = selectedIds.includes(v.id);
                  const isPending = v.status === 'Pending';
                  const isApproved = v.status === 'Approved';
                  const isCancelled = v.status === 'Cancelled';

                  return (
                    <tr
                      key={v.id}
                      className={`hover:bg-slate-50 transition-colors ${
                        isSelected ? 'bg-emerald-50/60' : isPending ? 'bg-amber-50/20' : ''
                      }`}
                    >
                      <td className="py-2.5 px-3 text-center">
                        <button onClick={() => toggleSelectRow(v.id)} className="text-slate-400 hover:text-emerald-600">
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-emerald-600" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                      </td>

                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <div className="font-bold text-slate-900">{v.voucherNo}</div>
                        <div className="text-[11px] text-slate-500">{v.date} · {v.time}</div>
                      </td>

                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span
                          className={`font-semibold text-[10px] px-2 py-0.5 rounded-sm ${
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

                      <td className="py-2.5 px-3 max-w-[180px] truncate">
                        <div className="font-semibold text-slate-800 truncate">{v.partyName}</div>
                        <div className="text-[11px] text-slate-500 font-urdu truncate">{v.partyNameUrdu}</div>
                      </td>

                      <td className="py-2.5 px-3 max-w-[150px] truncate">
                        <div className="font-medium text-slate-800">{v.itemName}</div>
                        <div className="text-[11px] text-slate-500 font-urdu">{v.itemNameUrdu}</div>
                      </td>

                      <td className="py-2.5 px-3 text-right font-mono tabular-nums font-semibold text-slate-900">
                        {v.firstWeight.toLocaleString()} KG
                        <div className="text-[10px] text-slate-400">{(v.firstWeight / 40).toFixed(1)} من</div>
                      </td>

                      <td className="py-2.5 px-3 text-right font-mono tabular-nums font-semibold text-slate-900">
                        {v.bags}
                      </td>

                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-700">
                        {v.ratePer40Kg.toLocaleString()}
                      </td>

                      <td className="py-2.5 px-3 text-right font-mono tabular-nums font-bold text-slate-900">
                        {formatPKR(v.totalAmount)}
                      </td>

                      {/* Document Attachments Badge */}
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        {v.attachments && v.attachments.length > 0 ? (
                          <button
                            onClick={() => setActiveAttachmentVoucher(v)}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200 transition"
                            title="View or manage attached weight slips and bills"
                          >
                            <Paperclip className="w-3 h-3 text-emerald-700" />
                            <span>{v.attachments.length} {v.attachments.length === 1 ? 'doc' : 'docs'}</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => setActiveAttachmentVoucher(v)}
                            className="inline-flex items-center gap-1 text-[10px] text-slate-400 hover:text-slate-700 px-1.5 py-0.5 rounded hover:bg-slate-100 transition"
                            title="Attach weight slip or expense bill"
                          >
                            <Paperclip className="w-3 h-3" />
                            <span className="hidden sm:inline">+ Attach</span>
                          </button>
                        )}
                      </td>

                      <td className="py-2.5 px-3 text-center whitespace-nowrap">

                        {isPending && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                            <span>Pending / التواء</span>
                          </span>
                        )}
                        {isApproved && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Approved / منظور</span>
                          </span>
                        )}
                        {isCancelled && (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
                            <XCircle className="w-3 h-3" />
                            <span>Cancelled / منسوخ</span>
                          </span>
                        )}
                      </td>

                      {/* ACTION BUTTONS ON EACH ROW */}
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          {/* Quick Approve button if Pending */}
                          {isPending && (
                            <button
                              onClick={() => approveVoucher(v.id)}
                              className="p-1 rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white transition-colors"
                              title="Approve Voucher (منظور کریں)"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          )}

                          {/* Print Dropdown */}
                          <div className="relative">
                            <button
                              onClick={() => setOpenDropdownId(openDropdownId === v.id ? null : v.id)}
                              className="p-1 rounded-md text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                              title="Print Voucher (پرنٹ سلپ)"
                            >
                              <Printer className="w-4 h-4 text-blue-700" />
                            </button>

                            {openDropdownId === v.id && (
                              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-xl border border-slate-200 py-1.5 z-30 text-left text-xs">
                                <div className="px-3 py-1 text-[10px] text-slate-400 font-semibold uppercase">
                                  Print Slip Formats
                                </div>
                                <button
                                  onClick={() => {
                                    setOpenDropdownId(null);
                                    onPrintVoucher(v, 'a4-standard');
                                  }}
                                  className="w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center justify-between"
                                >
                                  <span>A4 Standard Bill</span>
                                  <span className="text-[10px] text-slate-400">کلاسیک</span>
                                </button>
                                <button
                                  onClick={() => {
                                    setOpenDropdownId(null);
                                    onPrintVoucher(v, 'a4-modern');
                                  }}
                                  className="w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center justify-between"
                                >
                                  <span>A4 Modern Layout</span>
                                  <span className="text-[10px] text-slate-400">ماڈرن</span>
                                </button>
                                <button
                                  onClick={() => {
                                    setOpenDropdownId(null);
                                    onPrintVoucher(v, 'thermal-80mm');
                                  }}
                                  className="w-full text-left px-3 py-1.5 hover:bg-slate-50 flex items-center justify-between font-semibold text-emerald-800"
                                >
                                  <span>Thermal 80mm Receipt</span>
                                  <span className="text-[10px] text-slate-400">تھرمل</span>
                                </button>
                              </div>
                            )}
                          </div>

                          {/* WhatsApp Button */}
                          <button
                            onClick={() => onWhatsAppVoucher(v)}
                            className="p-1 rounded-md text-emerald-600 hover:bg-emerald-50 transition-colors"
                            title="Send Slip to WhatsApp"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>

                          {/* Duplicate Button */}
                          <button
                            onClick={() => duplicateVoucher(v.id)}
                            className="p-1 rounded-md text-slate-500 hover:bg-slate-100 transition-colors"
                            title="Duplicate Voucher (نقل بنائیں)"
                          >
                            <Copy className="w-4 h-4" />
                          </button>

                          {/* Audit History */}
                          <button
                            onClick={() => setActiveAuditVoucher(v)}
                            className="p-1 rounded-md text-slate-500 hover:bg-slate-100 transition-colors"
                            title="Audit Trail History (تاریخچہ)"
                          >
                            <History className="w-4 h-4" />
                          </button>

                          {/* Attach / View Documents Button */}
                          <button
                            onClick={() => setActiveAttachmentVoucher(v)}
                            className="p-1 rounded-md text-emerald-700 hover:bg-emerald-50 transition-colors"
                            title="Attach / View Weight Slips & Bills (دستاویزات منسلکات)"
                          >
                            <Paperclip className="w-4 h-4" />
                          </button>


                          {/* Cancel Button (Admin/Manager) */}
                          {!isCancelled && currentUser.role !== 'Viewer' && (
                            <button
                              onClick={() =>
                                setActionPrompt({
                                  type: 'CANCEL',
                                  voucherId: v.id,
                                  voucherNo: v.voucherNo
                                })
                              }
                              className="p-1 rounded-md text-amber-600 hover:bg-amber-50 transition-colors"
                              title="Cancel Voucher with Reason (منسوخ کریں)"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}

                          {/* Delete Button (Soft delete, Admin only) */}
                          {currentUser.role === 'Admin' && (
                            <button
                              onClick={() =>
                                setActionPrompt({
                                  type: 'DELETE',
                                  voucherId: v.id,
                                  voucherNo: v.voucherNo
                                })
                              }
                              className="p-1 rounded-md text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Delete to Recycle (حذف کریں)"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>

            {/* LOCKED POINT 25: STYLED ACCOUNTING TOTALS FOOTER */}
            <tfoot>
              {/* Subtotal of Current Filtered View (Light Yellow) */}
              <tr className="bg-yellow-100/90 text-yellow-950 font-semibold border-t-2 border-yellow-300">
                <td colSpan={5} className="py-2.5 px-3 text-right">
                  SUBTOTAL / ذیلی میزان ({filteredList.length} واؤچرز):
                </td>
                <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                  {totals.totalFirstWeight.toLocaleString()} KG
                </td>
                <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                  {totals.totalBags.toLocaleString()}
                </td>
                <td className="py-2.5 px-3 text-right text-slate-500">-</td>
                <td className="py-2.5 px-3 text-right font-mono tabular-nums">
                  {formatPKR(totals.totalNet)}
                </td>
                <td colSpan={2}></td>
              </tr>

              {/* Grand Total of All Data (Light Green Bold 14px) */}
              <tr className="bg-emerald-100 text-emerald-950 font-bold text-sm border-t border-emerald-300">
                <td colSpan={5} className="py-3 px-3 text-right font-bold">
                  GRAND TOTAL / کل میزان (PKR):
                </td>
                <td className="py-3 px-3 text-right font-mono tabular-nums">
                  {totals.totalFirstWeight.toLocaleString()} KG
                </td>
                <td className="py-3 px-3 text-right font-mono tabular-nums">
                  {totals.totalBags.toLocaleString()}
                </td>
                <td className="py-3 px-3 text-right text-slate-500">-</td>
                <td className="py-3 px-3 text-right font-mono tabular-nums text-emerald-900 text-base">
                  {formatPKR(totals.totalNet)}
                </td>
                <td colSpan={2}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* AUDIT TRAIL MODAL */}
      {activeAuditVoucher && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Audit History: {activeAuditVoucher.voucherNo}
                </h3>
                <div className="text-xs text-slate-500">
                  Full security log of edits, approvals, and user actions
                </div>
              </div>
              <button
                onClick={() => setActiveAuditVoucher(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {activeAuditVoucher.auditTrail.map((log, idx) => (
                <div key={idx} className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">{log.userName}</span>
                    <span className="text-[11px] text-slate-500">{log.timestamp}</span>
                  </div>
                  <div className="text-slate-700">{log.details}</div>
                  {log.deviceInfo && (
                    <div className="text-[10px] text-slate-400">Device: {log.deviceInfo}</div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setActiveAuditVoucher(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800"
              >
                Close (بند کریں)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CANCEL / DELETE PROMPT MODAL */}
      {actionPrompt && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 text-amber-600">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-base font-bold text-slate-900">
                {actionPrompt.type === 'CANCEL' ? 'Cancel Voucher' : 'Delete Voucher to Recycle'}
              </h3>
            </div>
            <p className="text-xs text-slate-600">
              Please enter the mandatory audit reason for{' '}
              {actionPrompt.type === 'CANCEL' ? 'cancelling' : 'deleting'} voucher{' '}
              <span className="font-bold">{actionPrompt.voucherNo}</span>. This action will be permanently recorded in the audit trail.
            </p>

            <textarea
              rows={3}
              placeholder="Enter audit reason (وجہ درج کریں)..."
              value={promptReason}
              onChange={e => setPromptReason(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-emerald-600 font-urdu"
            />

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => {
                  setActionPrompt(null);
                  setPromptReason('');
                }}
                className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={submitPromptAction}
                className={`px-4 py-2 text-white rounded-lg text-xs font-semibold ${
                  actionPrompt.type === 'CANCEL' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                Confirm {actionPrompt.type === 'CANCEL' ? 'Cancellation' : 'Deletion'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DOCUMENT ATTACHMENTS MODAL FOR EXISTING VOUCHER */}
      {activeAttachmentVoucher && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[90vh] flex flex-col">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center">
                  <Paperclip className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold flex items-center gap-2">
                    <span>Documents & Slips for {activeAttachmentVoucher.voucherNo}</span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {activeAttachmentVoucher.partyName} · {activeAttachmentVoucher.type} · First Wt: {activeAttachmentVoucher.firstWeight} KG
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveAttachmentVoucher(null)}
                className="text-slate-400 hover:text-white p-1 rounded"
              >
                ✕
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto flex-1">
              <DocumentAttachmentsManager
                attachments={activeAttachmentVoucher.attachments || []}
                onChange={(updatedDocs) => {
                  updateVoucher(activeAttachmentVoucher.id, { attachments: updatedDocs }, 'Updated document attachments');
                  setActiveAttachmentVoucher({
                    ...activeAttachmentVoucher,
                    attachments: updatedDocs
                  });
                }}
                voucherNo={activeAttachmentVoucher.voucherNo}
                voucherType={activeAttachmentVoucher.type}
                partyName={activeAttachmentVoucher.partyName}
                grossWeight={activeAttachmentVoucher.grossWeight}
                tareWeight={activeAttachmentVoucher.tareWeight}
                totalAmount={activeAttachmentVoucher.totalAmount}
                bags={activeAttachmentVoucher.bags}
                vehicleNo={activeAttachmentVoucher.vehicleNo}
              />
            </div>

            <div className="bg-slate-50 border-t border-slate-200 p-3 flex justify-end">
              <button
                onClick={() => setActiveAttachmentVoucher(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold"
              >
                Done (مکمل)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

