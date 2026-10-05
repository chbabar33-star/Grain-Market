/**
 * Mandi ERP - Complete Reports Suite (Point 15 & Point 24 & Point 25)
 * All 9 Required Reports:
 * 1. Stock Ledger
 * 2. Closing Stock Register (with all Purchase From details in columns & Average Purchase Cost)
 * 3. Purchase Register (with complete weighbridge deductions, Net Wt, Purchase Value, & Average Purchase Cost)
 * 4. Sales Register
 * 5. Transfer Register
 * 6. Expense Register
 * 7. Party Information (Contact & Directory - Party Ledgers removed per requirement)
 * 8. Day Book
 * 9. Audit Trail
 * With Subtotal (Light Yellow) & Grand Total (Light Green Bold 14px), 1-Click Excel, and Print A4!
 */

import React, { useState, useMemo } from 'react';
import {
  FileText,
  FileSpreadsheet,
  Printer,
  Search,
  Filter,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  Boxes,
  Users,
  Calendar,
  ShieldCheck,
  Scale,
  DollarSign,
  Layers,
  ListFilter,
  Box,
  Phone,
  MessageSquare,
  MapPin,
  Building2,
  User
} from 'lucide-react';
import { useMandi } from '../context/MandiContext';
import { formatPKR, formatWeight } from '../utils/numberToWords';
import { exportReportToExcel } from '../utils/excelExport';

export type ReportType =
  | 'closing_stock'
  | 'purchase_register'
  | 'sales_register'
  | 'bardana_register'
  | 'stock_ledger'
  | 'transfer_register'
  | 'expense_register'
  | 'party_info'
  | 'day_book'
  | 'audit_trail';

export const Reports: React.FC = () => {
  const {
    currentBusiness,
    stockSummary,
    filteredVouchers,
    items,
    parties,
    godowns,
    bardanaMasters,
    bardanaMovements,
    bardanaSummary,
    currentUser
  } = useMandi();

  const [activeReport, setActiveReport] = useState<ReportType>('closing_stock');
  const [selectedItemId, setSelectedItemId] = useState<string>('ALL');
  const [selectedPartyId, setSelectedPartyId] = useState<string>('ALL');
  const [selectedGodownId, setSelectedGodownId] = useState<string>('ALL');
  const [selectedBardanaId, setSelectedBardanaId] = useState<string>('ALL');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  
  // Toggle for closing stock sub-views: commodity summary vs individual purchase lots
  const [closingStockViewMode, setClosingStockViewMode] = useState<'commodity_summary' | 'purchase_lots'>('commodity_summary');

  const reportTabs: { id: ReportType; labelEn: string; labelUrdu: string }[] = [
    { id: 'closing_stock', labelEn: 'Closing Stock Register', labelUrdu: 'اختتامی اسٹاک رجسٹر' },
    { id: 'purchase_register', labelEn: 'Purchase Register', labelUrdu: 'خریداری رجسٹر' },
    { id: 'sales_register', labelEn: 'Sales Register', labelUrdu: 'فروخت رجسٹر' },
    { id: 'bardana_register', labelEn: 'Barbara Register (Bags)', labelUrdu: 'باردانہ رجسٹر (بوریاں)' },
    { id: 'stock_ledger', labelEn: 'Stock Ledger', labelUrdu: 'اسٹاک لیجر' },
    { id: 'transfer_register', labelEn: 'Transfer Register', labelUrdu: 'منتقلی رجسٹر' },
    { id: 'expense_register', labelEn: 'Expense Register', labelUrdu: 'اخراجات رجسٹر' },
    { id: 'party_info', labelEn: 'Party Information', labelUrdu: 'پارٹی معلومات / کوائف' },
    { id: 'day_book', labelEn: 'Day Book', labelUrdu: 'روزنامچہ' },
    { id: 'audit_trail', labelEn: 'Audit Trail', labelUrdu: 'سیکیورٹی لاگ' }
  ];

  // 1. Filtered Closing Stock
  const filteredClosingStock = useMemo(() => {
    return stockSummary.filter(s => selectedItemId === 'ALL' || s.itemId === selectedItemId);
  }, [stockSummary, selectedItemId]);

  // 2. Filtered Vouchers for Registers
  const filteredRegisterVouchers = useMemo(() => {
    return filteredVouchers.filter(v => {
      if (selectedItemId !== 'ALL' && v.itemId !== selectedItemId) return false;
      if (selectedPartyId !== 'ALL' && v.partyId !== selectedPartyId) return false;
      if (selectedGodownId !== 'ALL' && v.godownId !== selectedGodownId) return false;
      if (startDate && v.date < startDate) return false;
      if (endDate && v.date > endDate) return false;
      return true;
    });
  }, [filteredVouchers, selectedItemId, selectedPartyId, selectedGodownId, startDate, endDate]);

  // Specific Purchase Vouchers list
  const purchaseVouchers = useMemo(() => {
    return filteredRegisterVouchers.filter(v => v.type === 'PURCHASE');
  }, [filteredRegisterVouchers]);

  // Approved Purchase Lots for Closing Stock
  const closingStockPurchaseLots = useMemo(() => {
    return filteredVouchers
      .filter(v => v.type === 'PURCHASE' && v.status === 'Approved' && (selectedItemId === 'ALL' || v.itemId === selectedItemId))
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [filteredVouchers, selectedItemId]);

  // 3. Party Information Filtering (Party Ledgers removed - only Party Information required)
  const [partySearchTerm, setPartySearchTerm] = useState('');
  const [partyTypeFilter, setPartyTypeFilter] = useState<'ALL' | 'Supplier' | 'Customer' | 'Both'>('ALL');

  const filteredPartiesList = useMemo(() => {
    return parties.filter(p => {
      if (partyTypeFilter !== 'ALL' && p.type !== partyTypeFilter && p.type !== 'Both') return false;
      if (partySearchTerm.trim()) {
        const q = partySearchTerm.toLowerCase();
        const matchesName = (p.name || '').toLowerCase().includes(q);
        const matchesUrdu = (p.nameUrdu || '').includes(q);
        const matchesPhone = (p.phone || '').toLowerCase().includes(q);
        const matchesAddress = (p.address || '').toLowerCase().includes(q);
        if (!matchesName && !matchesUrdu && !matchesPhone && !matchesAddress) return false;
      }
      return true;
    });
  }, [parties, partyTypeFilter, partySearchTerm]);

  // 4. Audit Trail entries
  const allAuditEntries = useMemo(() => {
    const list: any[] = [];
    filteredVouchers.forEach(v => {
      v.auditTrail.forEach(a => {
        list.push({
          voucherNo: v.voucherNo,
          type: v.type,
          ...a
        });
      });
    });
    return list.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }, [filteredVouchers]);

  // 5. Barbara Register Entries (Zero weight impact - Bag movements)
  const bardanaRegisterEntries = useMemo(() => {
    interface BardanaRow {
      id: string;
      date: string;
      voucherNo: string;
      movementType: string;
      isPositive: boolean;
      bardanaId: string;
      bardanaName: string;
      partyName: string;
      partyNameUrdu?: string;
      itemName?: string;
      godownName?: string;
      inwardBags: number;
      outwardBags: number;
      runningBalance: number;
      status: string;
      remarks: string;
    }

    const rows: Omit<BardanaRow, 'runningBalance'>[] = [];

    // From vouchers:
    filteredVouchers.forEach(v => {
      if (v.isDeleted) return;
      if (!v.bags || v.bags <= 0) return;
      if (selectedItemId !== 'ALL' && v.itemId !== selectedItemId) return;
      if (selectedPartyId !== 'ALL' && v.partyId !== selectedPartyId) return;
      if (selectedGodownId !== 'ALL' && v.godownId !== selectedGodownId) return;
      if (selectedBardanaId !== 'ALL' && v.bardanaId && v.bardanaId !== selectedBardanaId) return;
      if (startDate && v.date < startDate) return;
      if (endDate && v.date > endDate) return;

      const bardanaObj = bardanaMasters.find(b => b.id === v.bardanaId) || bardanaMasters[0];

      if (v.type === 'PURCHASE') {
        rows.push({
          id: `v-b-${v.id}`,
          date: v.date,
          voucherNo: v.voucherNo,
          movementType: 'Purchase Inward (+)',
          isPositive: true,
          bardanaId: bardanaObj?.id || 'bard-1',
          bardanaName: v.bardanaName || bardanaObj?.name || 'Standard Jute Bag',
          partyName: v.partyName,
          partyNameUrdu: v.partyNameUrdu,
          itemName: v.itemName,
          godownName: v.godownName,
          inwardBags: v.bags,
          outwardBags: 0,
          status: v.status,
          remarks: `Purchase Inward received (${v.bags} bags, zero impact on weight)`
        });
      } else if (v.type === 'SALE') {
        rows.push({
          id: `v-b-${v.id}`,
          date: v.date,
          voucherNo: v.voucherNo,
          movementType: 'Sales Outward (-)',
          isPositive: false,
          bardanaId: bardanaObj?.id || 'bard-1',
          bardanaName: v.bardanaName || bardanaObj?.name || 'Standard Jute Bag',
          partyName: v.partyName,
          partyNameUrdu: v.partyNameUrdu,
          itemName: v.itemName,
          godownName: v.godownName,
          inwardBags: 0,
          outwardBags: v.bags,
          status: v.status,
          remarks: `Sales Outward issued (-${v.bags} bags minused from Barbara register)`
        });
      }
    });

    // From manual movements (excluding voucher duplicates)
    const voucherNos = new Set(filteredVouchers.map(v => v.voucherNo));
    bardanaMovements.forEach(m => {
      if (voucherNos.has(m.voucherNo)) return;
      if (selectedPartyId !== 'ALL' && m.partyId && m.partyId !== selectedPartyId) return;
      if (selectedGodownId !== 'ALL' && m.godownId && m.godownId !== selectedGodownId) return;
      if (selectedBardanaId !== 'ALL' && m.bardanaId !== selectedBardanaId) return;
      if (startDate && m.date < startDate) return;
      if (endDate && m.date > endDate) return;

      const isInward = m.type === 'PURCHASE_INWARD' || m.type === 'MANUAL_RETURN';
      rows.push({
        id: m.id,
        date: m.date,
        voucherNo: m.voucherNo,
        movementType: isInward ? 'Manual Return (+)' : 'Manual Issue (-)',
        isPositive: isInward,
        bardanaId: m.bardanaId,
        bardanaName: m.bardanaName,
        partyName: m.partyName || 'Market Yard / عام منڈی',
        partyNameUrdu: m.partyNameUrdu,
        itemName: 'Bardana / باردانہ',
        godownName: m.godownName || '-',
        inwardBags: m.inwardBags || 0,
        outwardBags: m.outwardBags || 0,
        status: 'Approved',
        remarks: m.remarks || (isInward ? 'Manual Inward Bags' : 'Manual Outward Bags')
      });
    });

    rows.sort((a, b) => a.date.localeCompare(b.date));

    // Calculate initial opening bags for selected filter
    let baseOpening = 0;
    if (selectedBardanaId === 'ALL') {
      baseOpening = bardanaMasters.reduce((a, b) => a + (b.openingBags || 0), 0);
    } else {
      const match = bardanaMasters.find(b => b.id === selectedBardanaId);
      baseOpening = match ? match.openingBags : 0;
    }

    let running = baseOpening;
    return rows.map(r => {
      running = running + r.inwardBags - r.outwardBags;
      return {
        ...r,
        runningBalance: running
      };
    });
  }, [filteredVouchers, bardanaMovements, bardanaMasters, selectedItemId, selectedPartyId, selectedGodownId, selectedBardanaId, startDate, endDate]);

  // Handle Excel Export with full detailed columns
  const handleExportExcel = () => {
    if (activeReport === 'closing_stock') {
      const totOpenWt = filteredClosingStock.reduce((a, b) => a + b.openingFirstWeight, 0);
      const totOpenBags = filteredClosingStock.reduce((a, b) => a + b.openingBags, 0);
      const totOpenVal = filteredClosingStock.reduce((a, b) => a + b.openingValue, 0);

      const totPurchGross = filteredClosingStock.reduce((a, b) => a + b.purchaseGrossWeight, 0);
      const totPurchTare = filteredClosingStock.reduce((a, b) => a + b.purchaseTareWeight, 0);
      const totPurchFirst = filteredClosingStock.reduce((a, b) => a + b.purchaseFirstWeight, 0);
      const totPurchDed = filteredClosingStock.reduce((a, b) => a + b.purchaseDeductionsKg, 0);
      const totPurchNet = filteredClosingStock.reduce((a, b) => a + b.purchaseNetWeight, 0);
      const totPurchBags = filteredClosingStock.reduce((a, b) => a + b.purchaseBags, 0);
      const totPurchBaseVal = filteredClosingStock.reduce((a, b) => a + b.purchaseBaseValue, 0);
      const totPurchExp = filteredClosingStock.reduce((a, b) => a + b.purchaseExpenses, 0);
      const totPurchTotAmt = filteredClosingStock.reduce((a, b) => a + b.purchaseTotalAmount, 0);
      const overallPurchAvg = totPurchFirst > 0 ? (totPurchBaseVal / totPurchFirst) * 40 : 0;

      const totSoldFirst = filteredClosingStock.reduce((a, b) => a + b.soldFirstWeight, 0);
      const totSoldNet = filteredClosingStock.reduce((a, b) => a + b.soldNetWeight, 0);
      const totSoldBags = filteredClosingStock.reduce((a, b) => a + b.soldBags, 0);
      const totSoldVal = filteredClosingStock.reduce((a, b) => a + b.soldValue, 0);

      const totCloseFirst = filteredClosingStock.reduce((a, b) => a + b.closingFirstWeight, 0);
      const totCloseBags = filteredClosingStock.reduce((a, b) => a + b.closingBags, 0);
      const totCloseVal = filteredClosingStock.reduce((a, b) => a + b.closingValue, 0);
      const overallCloseAvg = totCloseFirst > 0 ? (totCloseVal / totCloseFirst) * 40 : 0;

      exportReportToExcel({
        business: currentBusiness,
        reportName: 'Closing_Stock_Register',
        dateRangeStr: `${startDate || 'Start'} to ${endDate || 'Current'}`,
        columns: [
          { headerEn: 'Commodity', headerUrdu: 'جنس', key: 'itemName' },
          { headerEn: 'Opening Wt (KG)', headerUrdu: 'ابتدائی وزن', key: 'openingFirstWeight', format: 'weight' },
          { headerEn: 'Opening Bags', headerUrdu: 'ابتدائی بوریاں', key: 'openingBags', format: 'number' },
          { headerEn: 'Opening Value (PKR)', headerUrdu: 'ابتدائی مالیت', key: 'openingValue', format: 'currency' },
          { headerEn: 'Opening Avg Cost / 40KG', headerUrdu: 'ابتدائی اوسط ریٹ', key: 'openingAvgCostPer40Kg', format: 'currency' },

          { headerEn: 'Purch Gross Wt (KG)', headerUrdu: 'خریداری مجموعی وزن', key: 'purchaseGrossWeight', format: 'weight' },
          { headerEn: 'Purch Tare Wt (KG)', headerUrdu: 'خریداری خالی وزن', key: 'purchaseTareWeight', format: 'weight' },
          { headerEn: 'Purch First Wt (KG)', headerUrdu: 'خریداری پہلا وزن', key: 'purchaseFirstWeight', format: 'weight' },
          { headerEn: 'Purch Deductions (KG)', headerUrdu: 'خریداری کٹوتی', key: 'purchaseDeductionsKg', format: 'weight' },
          { headerEn: 'Purch Net Wt (KG)', headerUrdu: 'خریداری صافی وزن', key: 'purchaseNetWeight', format: 'weight' },
          { headerEn: 'Purch Bags', headerUrdu: 'خریداری بوریاں', key: 'purchaseBags', format: 'number' },
          { headerEn: 'Purch Invoice Rate / 40KG', headerUrdu: 'خریداری ریٹ فی من', key: 'purchaseAvgRatePer40Kg', format: 'currency' },
          { headerEn: 'Purchase Value (PKR)', headerUrdu: 'خریداری مالیت', key: 'purchaseBaseValue', format: 'currency' },
          { headerEn: 'Purch Expenses (PKR)', headerUrdu: 'خریداری اخراجات', key: 'purchaseExpenses', format: 'currency' },
          { headerEn: 'Total Purch Amount (PKR)', headerUrdu: 'کل خریداری رقم', key: 'purchaseTotalAmount', format: 'currency' },
          { headerEn: 'Avg Purchase Cost / 40KG', headerUrdu: 'اوسط لاگت خرید فی من', key: 'purchaseAvgCostPer40Kg', format: 'currency' },

          { headerEn: 'Sold First Wt (KG)', headerUrdu: 'فروخت پہلا وزن', key: 'soldFirstWeight', format: 'weight' },
          { headerEn: 'Sold Net Wt (KG)', headerUrdu: 'فروخت صافی وزن', key: 'soldNetWeight', format: 'weight' },
          { headerEn: 'Sold Bags', headerUrdu: 'فروخت بوریاں', key: 'soldBags', format: 'number' },
          { headerEn: 'Sold Value (PKR)', headerUrdu: 'فروخت مالیت', key: 'soldValue', format: 'currency' },

          { headerEn: 'Closing First Wt (KG)', headerUrdu: 'اختتامی پہلا وزن', key: 'closingFirstWeight', format: 'weight' },
          { headerEn: 'Closing Bags', headerUrdu: 'اختتامی بوریاں', key: 'closingBags', format: 'number' },
          { headerEn: 'Closing Avg Purchase Cost', headerUrdu: 'اختتامی اوسط لاگت خرید', key: 'avgCostPer40Kg', format: 'currency' },
          { headerEn: 'Closing Value (PKR)', headerUrdu: 'اختتامی مالیت', key: 'closingValue', format: 'currency' }
        ],
        data: filteredClosingStock,
        subtotalRow: {
          itemName: 'SUBTOTAL / ذیلی میزان:',
          openingFirstWeight: totOpenWt,
          openingBags: totOpenBags,
          openingValue: totOpenVal,
          purchaseGrossWeight: totPurchGross,
          purchaseTareWeight: totPurchTare,
          purchaseFirstWeight: totPurchFirst,
          purchaseDeductionsKg: totPurchDed,
          purchaseNetWeight: totPurchNet,
          purchaseBags: totPurchBags,
          purchaseBaseValue: totPurchBaseVal,
          purchaseExpenses: totPurchExp,
          purchaseTotalAmount: totPurchTotAmt,
          purchaseAvgCostPer40Kg: overallPurchAvg,
          soldFirstWeight: totSoldFirst,
          soldNetWeight: totSoldNet,
          soldBags: totSoldBags,
          soldValue: totSoldVal,
          closingFirstWeight: totCloseFirst,
          closingBags: totCloseBags,
          avgCostPer40Kg: overallCloseAvg,
          closingValue: totCloseVal
        },
        grandTotalRow: {
          itemName: 'GRAND TOTAL / کل میزان (PKR):',
          openingFirstWeight: totOpenWt,
          openingBags: totOpenBags,
          openingValue: totOpenVal,
          purchaseGrossWeight: totPurchGross,
          purchaseTareWeight: totPurchTare,
          purchaseFirstWeight: totPurchFirst,
          purchaseDeductionsKg: totPurchDed,
          purchaseNetWeight: totPurchNet,
          purchaseBags: totPurchBags,
          purchaseBaseValue: totPurchBaseVal,
          purchaseExpenses: totPurchExp,
          purchaseTotalAmount: totPurchTotAmt,
          purchaseAvgCostPer40Kg: overallPurchAvg,
          soldFirstWeight: totSoldFirst,
          soldNetWeight: totSoldNet,
          soldBags: totSoldBags,
          soldValue: totSoldVal,
          closingFirstWeight: totCloseFirst,
          closingBags: totCloseBags,
          avgCostPer40Kg: overallCloseAvg,
          closingValue: totCloseVal
        },
        generatedBy: currentUser.name
      });
    } else if (activeReport === 'purchase_register') {
      // Detailed Purchase Register Excel Export
      const list = purchaseVouchers;
      const totGross = list.reduce((a, b) => a + (b.grossWeight || 0), 0);
      const totTare = list.reduce((a, b) => a + (b.tareWeight || 0), 0);
      const totFirst = list.reduce((a, b) => a + (b.firstWeight || 0), 0);
      const totDed = list.reduce((a, b) => a + ((b.bardanaKg || 0) + (b.moistureKg || 0) + (b.otherDeductionsKg || 0)), 0);
      const totNet = list.reduce((a, b) => a + (b.netWeight || 0), 0);
      const totBags = list.reduce((a, b) => a + (b.bags || 0), 0);
      const totPurchVal = list.reduce((a, b) => a + (b.baseAmount || 0), 0);
      const totExp = list.reduce((a, b) => a + (b.totalExpenses || 0), 0);
      const totAmt = list.reduce((a, b) => a + (b.totalAmount || 0), 0);
      const overallAvgCost = totFirst > 0 ? (totPurchVal / totFirst) * 40 : 0;
      const overallLandedCost = totFirst > 0 ? (totAmt / totFirst) * 40 : 0;

      const excelRows = list.map(v => ({
        ...v,
        totalDeductionsKg: (v.bardanaKg || 0) + (v.moistureKg || 0) + (v.otherDeductionsKg || 0),
        purchaseValue: v.baseAmount,
        avgPurchaseCost: v.avgCostPer40Kg || (v.firstWeight > 0 ? (v.baseAmount / v.firstWeight) * 40 : 0),
        landedCost: v.firstWeight > 0 ? (v.totalAmount / v.firstWeight) * 40 : 0
      }));

      exportReportToExcel({
        business: currentBusiness,
        reportName: 'Purchase_Register_Detailed',
        dateRangeStr: `${startDate || 'Start'} to ${endDate || 'Current'}`,
        columns: [
          { headerEn: 'Voucher No', headerUrdu: 'واؤچر نمبر', key: 'voucherNo' },
          { headerEn: 'Date', headerUrdu: 'تاریخ', key: 'date' },
          { headerEn: 'Time', headerUrdu: 'وقت', key: 'time' },
          { headerEn: 'Purchased From / Party', headerUrdu: 'پارٹی / خریدار', key: 'partyName' },
          { headerEn: 'Commodity', headerUrdu: 'جنس', key: 'itemName' },
          { headerEn: 'Godown', headerUrdu: 'گودام', key: 'godownName' },
          { headerEn: 'Gross Wt (KG)', headerUrdu: 'مجموعی وزن', key: 'grossWeight', format: 'weight' },
          { headerEn: 'Tare Wt (KG)', headerUrdu: 'خالی وزن', key: 'tareWeight', format: 'weight' },
          { headerEn: 'First Wt (KG)', headerUrdu: 'پہلا وزن', key: 'firstWeight', format: 'weight' },
          { headerEn: 'Bardana Ded (KG)', headerUrdu: 'باردانہ کٹوتی', key: 'bardanaKg', format: 'weight' },
          { headerEn: 'Moisture Ded (KG)', headerUrdu: 'نمی کٹوتی', key: 'moistureKg', format: 'weight' },
          { headerEn: 'Other Ded (KG)', headerUrdu: 'دیگر کٹوتی', key: 'otherDeductionsKg', format: 'weight' },
          { headerEn: 'Total Ded (KG)', headerUrdu: 'کل کٹوتی', key: 'totalDeductionsKg', format: 'weight' },
          { headerEn: 'Net Weight (KG)', headerUrdu: 'صافی وزن', key: 'netWeight', format: 'weight' },
          { headerEn: 'Bags', headerUrdu: 'تعداد بوریاں', key: 'bags', format: 'number' },
          { headerEn: 'Rate / 40KG (Rs.)', headerUrdu: 'ریٹ فی من', key: 'ratePer40Kg', format: 'currency' },
          { headerEn: 'Purchase Value (PKR)', headerUrdu: 'خریدار مالیت', key: 'purchaseValue', format: 'currency' },
          { headerEn: 'Expenses (PKR)', headerUrdu: 'اخراجات', key: 'totalExpenses', format: 'currency' },
          { headerEn: 'Total Amount (PKR)', headerUrdu: 'کل رقم', key: 'totalAmount', format: 'currency' },
          { headerEn: 'Avg Purchase Cost / 40KG', headerUrdu: 'اوسط لاگت خرید', key: 'avgPurchaseCost', format: 'currency' },
          { headerEn: 'Landed Cost / 40KG', headerUrdu: 'کل لاگت فی من', key: 'landedCost', format: 'currency' },
          { headerEn: 'Vehicle No', headerUrdu: 'گاڑی نمبر', key: 'vehicleNo' },
          { headerEn: 'Status', headerUrdu: 'حیثیت', key: 'status' }
        ],
        data: excelRows,
        subtotalRow: {
          voucherNo: 'SUBTOTAL / ذیلی میزان:',
          grossWeight: totGross,
          tareWeight: totTare,
          firstWeight: totFirst,
          totalDeductionsKg: totDed,
          netWeight: totNet,
          bags: totBags,
          purchaseValue: totPurchVal,
          totalExpenses: totExp,
          totalAmount: totAmt,
          avgPurchaseCost: overallAvgCost,
          landedCost: overallLandedCost
        },
        grandTotalRow: {
          voucherNo: 'GRAND TOTAL / کل میزان (PKR):',
          grossWeight: totGross,
          tareWeight: totTare,
          firstWeight: totFirst,
          totalDeductionsKg: totDed,
          netWeight: totNet,
          bags: totBags,
          purchaseValue: totPurchVal,
          totalExpenses: totExp,
          totalAmount: totAmt,
          avgPurchaseCost: overallAvgCost,
          landedCost: overallLandedCost
        },
        generatedBy: currentUser.name
      });
    } else if (activeReport === 'bardana_register') {
      const totIn = bardanaRegisterEntries.reduce((a, b) => a + b.inwardBags, 0);
      const totOut = bardanaRegisterEntries.reduce((a, b) => a + b.outwardBags, 0);
      const lastBal = bardanaRegisterEntries.length > 0 ? bardanaRegisterEntries[bardanaRegisterEntries.length - 1].runningBalance : 0;

      exportReportToExcel({
        business: currentBusiness,
        reportName: 'Barbara_Register_Bags',
        dateRangeStr: `${startDate || 'Start'} to ${endDate || 'Current'}`,
        columns: [
          { headerEn: 'Date', headerUrdu: 'تاریخ', key: 'date' },
          { headerEn: 'Voucher No', headerUrdu: 'واؤچر نمبر', key: 'voucherNo' },
          { headerEn: 'Movement Type', headerUrdu: 'نوعیت', key: 'movementType' },
          { headerEn: 'Barbara Bag Type', headerUrdu: 'باردانہ قسم', key: 'bardanaName' },
          { headerEn: 'Party Name', headerUrdu: 'پارٹی نام', key: 'partyName' },
          { headerEn: 'Commodity', headerUrdu: 'جنس', key: 'itemName' },
          { headerEn: 'Godown', headerUrdu: 'گودام', key: 'godownName' },
          { headerEn: 'Received Bags (+)', headerUrdu: 'آمد بوریاں (+)', key: 'inwardBags', format: 'number' },
          { headerEn: 'Issued Bags (-)', headerUrdu: 'اخراج بوریاں (-)', key: 'outwardBags', format: 'number' },
          { headerEn: 'Balance Bags', headerUrdu: 'بقایا بوریاں', key: 'runningBalance', format: 'number' },
          { headerEn: 'Status', headerUrdu: 'حیثیت', key: 'status' },
          { headerEn: 'Remarks', headerUrdu: 'تفصیل', key: 'remarks' }
        ],
        data: bardanaRegisterEntries,
        subtotalRow: {
          voucherNo: 'SUBTOTAL / ذیلی میزان:',
          inwardBags: totIn,
          outwardBags: totOut,
          runningBalance: lastBal
        },
        grandTotalRow: {
          voucherNo: 'GRAND TOTAL / کل میزان (Bags):',
          inwardBags: totIn,
          outwardBags: totOut,
          runningBalance: lastBal
        },
        generatedBy: currentUser.name
      });
    } else if (activeReport === 'party_info') {
      exportReportToExcel({
        business: currentBusiness,
        reportName: 'Party_Information_Directory',
        dateRangeStr: 'Active Directory (پارٹی کوائف)',
        columns: [
          { headerEn: 'Party Name', headerUrdu: 'پارٹی نام', key: 'name' },
          { headerEn: 'Urdu Name', headerUrdu: 'نام اردو', key: 'nameUrdu' },
          { headerEn: 'Type / Role', headerUrdu: 'قسم', key: 'type' },
          { headerEn: 'Phone Number', headerUrdu: 'فون نمبر', key: 'phone' },
          { headerEn: 'WhatsApp', headerUrdu: 'واٹس ایپ', key: 'whatsapp' },
          { headerEn: 'Address / Location', headerUrdu: 'پتہ / شہر', key: 'address' },
          { headerEn: 'Opening Balance (PKR)', headerUrdu: 'ابتدائی رقم', key: 'openingBalance', format: 'currency' }
        ],
        data: filteredPartiesList,
        generatedBy: currentUser.name
      });
    } else {
      // General Voucher Register Export
      const list = filteredRegisterVouchers;
      const totWeight = list.reduce((a, b) => a + b.firstWeight, 0);
      const totBags = list.reduce((a, b) => a + b.bags, 0);
      const totAmt = list.reduce((a, b) => a + b.totalAmount, 0);

      exportReportToExcel({
        business: currentBusiness,
        reportName: `${activeReport.toUpperCase()}_REPORT`,
        dateRangeStr: `${startDate || 'Start'} to ${endDate || 'Current'}`,
        columns: [
          { headerEn: 'Voucher No', headerUrdu: 'واؤچر نمبر', key: 'voucherNo' },
          { headerEn: 'Date', headerUrdu: 'تاریخ', key: 'date' },
          { headerEn: 'Party Name', headerUrdu: 'پارٹی', key: 'partyName' },
          { headerEn: 'Item', headerUrdu: 'جنس', key: 'itemName' },
          { headerEn: 'Godown', headerUrdu: 'گودام', key: 'godownName' },
          { headerEn: 'First Weight (KG)', headerUrdu: 'پہلا وزن', key: 'firstWeight', format: 'weight' },
          { headerEn: 'Bags', headerUrdu: 'بوریاں', key: 'bags', format: 'number' },
          { headerEn: 'Rate / 40KG', headerUrdu: 'ریٹ', key: 'ratePer40Kg', format: 'currency' },
          { headerEn: 'Total Amount (PKR)', headerUrdu: 'کل رقم', key: 'totalAmount', format: 'currency' },
          { headerEn: 'Status', headerUrdu: 'حیثیت', key: 'status' }
        ],
        data: list,
        grandTotalRow: {
          firstWeight: totWeight,
          bags: totBags,
          totalAmount: totAmt
        },
        generatedBy: currentUser.name
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* HEADER BAR */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Mandi Accounting & Stock Registers</span>
            <span className="text-slate-400 font-normal">|</span>
            <span className="font-urdu text-base text-slate-700">کھاتہ جات و اختتامی اسٹاک رجسٹرز</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Strict Mandi Costing: Purchase Value = (Net Wt / 40) × Rate · Average Purchase Cost = (Purchase Value / First Wt) × 40
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export Report Excel (ایکسل)</span>
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report A4 (پرنٹ)</span>
          </button>
        </div>
      </div>

      {/* FORMULA HIGHLIGHT BANNER */}
      <div className="bg-blue-50 border border-blue-200/90 rounded-xl p-3 text-xs flex flex-wrap items-center justify-between gap-2 text-blue-950">
        <div className="flex items-center gap-2">
          <Scale className="w-4 h-4 text-blue-700 shrink-0" />
          <span className="font-bold">LOCKED MANDI FORMULAS:</span>
          <span className="font-mono bg-white px-2 py-0.5 rounded border border-blue-200 text-blue-900">
            Purchase Value = (Net Weight / 40) × Rate per 40-KG
          </span>
          <span className="font-mono bg-white px-2 py-0.5 rounded border border-blue-200 text-blue-900">
            Average Purchase Cost = (Purchase Value / First Weight) × 40
          </span>
          <span className="font-mono bg-white px-2 py-0.5 rounded border border-blue-200 text-blue-900">
            Closing Value = (Closing First Wt / 40) × Closing Avg Cost
          </span>
        </div>
        <div className="font-urdu text-blue-900 font-semibold text-xs">
          خریداری مالیت = صافی وزن پر ریٹ · اوسط لاگت خرید = خریداری مالیت تقسیم پہلا وزن ضرب ۴۰
        </div>
      </div>

      {/* REPORT TYPE SELECTOR TABS */}
      <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-2xs overflow-x-auto">
        <div className="flex items-center gap-1 min-w-max">
          {reportTabs.map(tab => {
            const isActive = activeReport === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveReport(tab.id)}
                className={`px-3 py-2 rounded-lg text-xs font-semibold transition-colors flex flex-col items-center ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <span>{tab.labelEn}</span>
                <span className="font-urdu text-[10px] opacity-80 -mt-0.5">{tab.labelUrdu}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* FILTERS ACCORDING TO REPORT */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2.5">
          {activeReport === 'party_info' ? (
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  value={partySearchTerm}
                  onChange={e => setPartySearchTerm(e.target.value)}
                  placeholder="Search Party, Phone, City... (تلاش کریں)"
                  className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs w-48 sm:w-64 focus:outline-emerald-600 font-urdu"
                />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-slate-700">Filter Role:</span>
                <select
                  value={partyTypeFilter}
                  onChange={e => setPartyTypeFilter(e.target.value as any)}
                  className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md font-urdu font-medium text-xs"
                >
                  <option value="ALL">All Roles (تمام پارٹیاں)</option>
                  <option value="Supplier">Farmer Suppliers (کاشتکار / بیوپاری)</option>
                  <option value="Customer">Mill Customers (مل / خریدار)</option>
                  <option value="Both">Both (دونوں)</option>
                </select>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-slate-700">Item:</span>
                <select
                  value={selectedItemId}
                  onChange={e => setSelectedItemId(e.target.value)}
                  className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-md font-urdu"
                >
                  <option value="ALL">All Commodities / تمام اجناس</option>
                  {items.map(i => (
                    <option key={i.id} value={i.id}>
                      {i.name} ({i.nameUrdu})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-slate-700">Godown:</span>
                <select
                  value={selectedGodownId}
                  onChange={e => setSelectedGodownId(e.target.value)}
                  className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-md font-urdu"
                >
                  <option value="ALL">All Godowns / تمام گودام</option>
                  {godowns.map(g => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </div>

              {(activeReport === 'purchase_register' || activeReport === 'sales_register' || activeReport === 'bardana_register') && (
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-slate-700">Party:</span>
                  <select
                    value={selectedPartyId}
                    onChange={e => setSelectedPartyId(e.target.value)}
                    className="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-md font-urdu"
                  >
                    <option value="ALL">All Parties / تمام پارٹیاں</option>
                    {parties.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.nameUrdu})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {activeReport === 'bardana_register' && (
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-purple-900">Barbara Type:</span>
                  <select
                    value={selectedBardanaId}
                    onChange={e => setSelectedBardanaId(e.target.value)}
                    className="px-2.5 py-1 bg-purple-50 border border-purple-200 text-purple-950 rounded-md font-urdu"
                  >
                    <option value="ALL">All Barbara / تمام اقسام باردانہ</option>
                    {bardanaMasters.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.nameUrdu})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </>
          )}

          <div className="flex items-center gap-1.5 text-slate-600">
            <span>Date:</span>
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

        <span className="text-[11px] text-slate-500 font-mono">
          Currency: PKR (Rs.) · Business: {currentBusiness.name}
        </span>
      </div>

      {/* REPORT CONTENT VIEW */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        
        {/* ============================================================== */}
        {/* 1. CLOSING STOCK REGISTER WITH ALL PURCHASE DETAILS IN COLUMNS */}
        {/* ============================================================== */}
        {activeReport === 'closing_stock' && (
          <div className="space-y-4 p-4">
            
            {/* SUB-VIEW TOGGLE (COMMODITY REGISTER VS INWARD PURCHASE LOTS) */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-emerald-700" />
                  <span>Closing Stock Register</span>
                </span>
                <span className="font-urdu text-xs text-slate-500">اختتامی اسٹاک رجسٹر مع خریداری اوسط لاگت</span>
              </div>

              <div className="flex items-center p-1 bg-slate-100 rounded-lg text-xs font-semibold">
                <button
                  onClick={() => setClosingStockViewMode('commodity_summary')}
                  className={`px-3 py-1.5 rounded-md transition-colors ${
                    closingStockViewMode === 'commodity_summary'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Commodity Summary Register (بلحاظ جنس تمام کالمز)
                </button>
                <button
                  onClick={() => setClosingStockViewMode('purchase_lots')}
                  className={`px-3 py-1.5 rounded-md transition-colors ${
                    closingStockViewMode === 'purchase_lots'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Purchased From Lots Detail (تفصیل خریداری بلحاظ پارٹی)
                </button>
              </div>
            </div>

            {/* SUMMARY STATS TILES */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-[10px] font-bold text-slate-500 uppercase">Total Closing First Wt</div>
                <div className="text-base font-mono font-black text-slate-900 mt-0.5">
                  {filteredClosingStock.reduce((a, b) => a + b.closingFirstWeight, 0).toLocaleString()} KG
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  {(filteredClosingStock.reduce((a, b) => a + b.closingFirstWeight, 0) / 40).toFixed(1)} Maunds (من)
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-[10px] font-bold text-slate-500 uppercase">Total Closing Bags</div>
                <div className="text-base font-mono font-black text-slate-900 mt-0.5">
                  {filteredClosingStock.reduce((a, b) => a + b.closingBags, 0).toLocaleString()} Bags
                </div>
                <div className="text-[10px] text-slate-500 font-urdu">کل اختتامی بوریاں</div>
              </div>

              <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200">
                <div className="text-[10px] font-bold text-blue-800 uppercase">Purchased Inward Value</div>
                <div className="text-base font-mono font-black text-blue-950 mt-0.5">
                  {formatPKR(filteredClosingStock.reduce((a, b) => a + b.purchaseBaseValue, 0))}
                </div>
                <div className="text-[10px] text-blue-700 font-mono">
                  Net Wt: {filteredClosingStock.reduce((a, b) => a + b.purchaseNetWeight, 0).toLocaleString()} KG
                </div>
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                <div className="text-[10px] font-bold text-emerald-800 uppercase">Total Closing Stock Value</div>
                <div className="text-base font-mono font-black text-emerald-950 mt-0.5">
                  {formatPKR(filteredClosingStock.reduce((a, b) => a + b.closingValue, 0))}
                </div>
                <div className="text-[10px] text-emerald-700 font-urdu">کل اختتامی اسٹاک مالیت</div>
              </div>
            </div>

            {/* TAB 1: COMMODITY SUMMARY WITH ALL PURCHASE DETAILS IN COLUMNS */}
            {closingStockViewMode === 'commodity_summary' && (
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-xs text-left border-collapse min-w-[1400px]">
                  <thead>
                    {/* TOP GROUP HEADER ROW */}
                    <tr className="bg-slate-900 text-white font-bold text-[10px] uppercase tracking-wider text-center border-b border-slate-800">
                      <th className="py-2 px-3 border-r border-slate-800 text-left" rowSpan={2}>Commodity / جنس</th>
                      <th className="py-2 px-3 border-r border-slate-800 bg-slate-800" colSpan={4}>Opening Stock (ابتدائی اسٹاک)</th>
                      <th className="py-2 px-3 border-r border-blue-900 bg-blue-950 text-blue-100" colSpan={10}>
                        Purchased Inward Details In Columns (تمام خریداری تفصیلات بلحاظ کالمز)
                      </th>
                      <th className="py-2 px-3 border-r border-slate-800 bg-slate-800" colSpan={4}>Sales Outward (فروخت)</th>
                      <th className="py-2 px-3 bg-emerald-950 text-emerald-100" colSpan={4}>
                        Closing Stock Position (اختتامی اسٹاک مع اوسط لاگت)
                      </th>
                    </tr>

                    {/* SECOND ROW SUB-HEADERS */}
                    <tr className="bg-slate-800 text-slate-200 font-semibold text-[10px] uppercase border-b border-slate-700">
                      {/* Opening */}
                      <th className="py-2 px-2 text-right">First Wt (KG)</th>
                      <th className="py-2 px-2 text-right">Bags</th>
                      <th className="py-2 px-2 text-right">Value (PKR)</th>
                      <th className="py-2 px-2 text-right border-r border-slate-700">Avg Cost/40KG</th>

                      {/* Inward Purchases */}
                      <th className="py-2 px-2 text-right bg-blue-900/60 text-white">Gross Wt</th>
                      <th className="py-2 px-2 text-right bg-blue-900/60 text-white">Tare Wt</th>
                      <th className="py-2 px-2 text-right bg-blue-900/60 text-white font-bold">First Wt (KG)</th>
                      <th className="py-2 px-2 text-right bg-blue-900/60 text-white">Deductions</th>
                      <th className="py-2 px-2 text-right bg-blue-900/60 text-white">Net Wt (KG)</th>
                      <th className="py-2 px-2 text-right bg-blue-900/60 text-white">Bags</th>
                      <th className="py-2 px-2 text-right bg-blue-900/60 text-white">Rate/40KG</th>
                      <th className="py-2 px-2 text-right bg-blue-900/60 text-amber-200 font-bold">Purchase Value</th>
                      <th className="py-2 px-2 text-right bg-blue-900/60 text-white">Expenses</th>
                      <th className="py-2 px-2 text-right bg-blue-900/80 text-emerald-300 font-bold border-r border-slate-700">
                        Avg Purch Cost
                      </th>

                      {/* Sales Outward */}
                      <th className="py-2 px-2 text-right">First Wt (KG)</th>
                      <th className="py-2 px-2 text-right">Net Wt</th>
                      <th className="py-2 px-2 text-right">Bags</th>
                      <th className="py-2 px-2 text-right border-r border-slate-700">Sales Value</th>

                      {/* Closing Position */}
                      <th className="py-2 px-2 text-right bg-emerald-900/60 text-white font-bold">Closing First Wt</th>
                      <th className="py-2 px-2 text-right bg-emerald-900/60 text-white">Closing Bags</th>
                      <th className="py-2 px-2 text-right bg-emerald-900/80 text-amber-200 font-black">
                        Avg Cost/40KG
                      </th>
                      <th className="py-2 px-2 text-right bg-emerald-900/80 text-emerald-200 font-black">
                        Closing Value (PKR)
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredClosingStock.map((s, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 px-3 border-r border-slate-200">
                          <div className="font-bold text-slate-900">{s.itemName}</div>
                          <div className="font-urdu text-[11px] text-slate-500">{s.itemNameUrdu}</div>
                        </td>

                        {/* Opening */}
                        <td className="py-2.5 px-2 text-right font-mono tabular-nums">{s.openingFirstWeight.toLocaleString()}</td>
                        <td className="py-2.5 px-2 text-right font-mono tabular-nums">{s.openingBags}</td>
                        <td className="py-2.5 px-2 text-right font-mono tabular-nums">{formatPKR(s.openingValue)}</td>
                        <td className="py-2.5 px-2 text-right font-mono tabular-nums border-r border-slate-200 text-slate-700">
                          Rs. {s.openingAvgCostPer40Kg.toFixed(2)}
                        </td>

                        {/* Purchases in Columns */}
                        <td className="py-2.5 px-2 text-right font-mono tabular-nums bg-blue-50/20">{s.purchaseGrossWeight.toLocaleString()}</td>
                        <td className="py-2.5 px-2 text-right font-mono tabular-nums bg-blue-50/20">{s.purchaseTareWeight.toLocaleString()}</td>
                        <td className="py-2.5 px-2 text-right font-mono tabular-nums font-bold text-blue-900 bg-blue-50/40">
                          +{s.purchaseFirstWeight.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-2 text-right font-mono tabular-nums bg-blue-50/20 text-rose-700">
                          {s.purchaseDeductionsKg.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-2 text-right font-mono tabular-nums bg-blue-50/20 font-semibold">
                          {s.purchaseNetWeight.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-2 text-right font-mono tabular-nums bg-blue-50/20 font-bold text-blue-900">
                          +{s.purchaseBags}
                        </td>
                        <td className="py-2.5 px-2 text-right font-mono tabular-nums bg-blue-50/20">{s.purchaseAvgRatePer40Kg.toFixed(2)}</td>
                        <td className="py-2.5 px-2 text-right font-mono tabular-nums font-bold text-blue-950 bg-blue-50/50">
                          {formatPKR(s.purchaseBaseValue)}
                        </td>
                        <td className="py-2.5 px-2 text-right font-mono tabular-nums bg-blue-50/20 text-slate-600">
                          {formatPKR(s.purchaseExpenses)}
                        </td>
                        <td className="py-2.5 px-2 text-right font-mono tabular-nums font-bold text-emerald-800 bg-emerald-50/40 border-r border-slate-200">
                          Rs. {s.purchaseAvgCostPer40Kg.toFixed(2)}
                        </td>

                        {/* Sales */}
                        <td className="py-2.5 px-2 text-right font-mono tabular-nums text-rose-700">-{s.soldFirstWeight.toLocaleString()}</td>
                        <td className="py-2.5 px-2 text-right font-mono tabular-nums">{s.soldNetWeight.toLocaleString()}</td>
                        <td className="py-2.5 px-2 text-right font-mono tabular-nums text-rose-700">-{s.soldBags}</td>
                        <td className="py-2.5 px-2 text-right font-mono tabular-nums border-r border-slate-200 font-semibold">
                          {formatPKR(s.soldValue)}
                        </td>

                        {/* Closing */}
                        <td className="py-2.5 px-2 text-right font-mono tabular-nums font-extrabold text-slate-900 bg-slate-50">
                          {s.closingFirstWeight.toLocaleString()} KG
                        </td>
                        <td className="py-2.5 px-2 text-right font-mono tabular-nums font-bold text-slate-900 bg-slate-50">
                          {s.closingBags}
                        </td>
                        <td className="py-2.5 px-2 text-right font-mono tabular-nums font-black text-blue-900 bg-blue-50/60">
                          Rs. {s.avgCostPer40Kg.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-2 text-right font-mono tabular-nums font-black text-emerald-900 bg-emerald-50/70">
                          {formatPKR(s.closingValue)}
                        </td>
                      </tr>
                    ))}
                  </tbody>

                  {/* LOCKED POINT 15 & 25: YELLOW SUBTOTAL & GREEN GRAND TOTAL */}
                  <tfoot>
                    {/* SUBTOTAL ROW (YELLOW) */}
                    <tr className="bg-yellow-100/90 text-yellow-950 font-bold border-t-2 border-yellow-300 text-[11px]">
                      <td className="py-2.5 px-3 border-r border-yellow-200">SUBTOTAL / ذیلی میزان:</td>

                      {/* Opening */}
                      <td className="py-2.5 px-2 text-right font-mono tabular-nums">
                        {filteredClosingStock.reduce((a, b) => a + b.openingFirstWeight, 0).toLocaleString()}
                      </td>
                      <td className="py-2.5 px-2 text-right font-mono tabular-nums">
                        {filteredClosingStock.reduce((a, b) => a + b.openingBags, 0).toLocaleString()}
                      </td>
                      <td className="py-2.5 px-2 text-right font-mono tabular-nums">
                        {formatPKR(filteredClosingStock.reduce((a, b) => a + b.openingValue, 0))}
                      </td>
                      <td className="py-2.5 px-2 text-right border-r border-yellow-200"></td>

                      {/* Inwards */}
                      <td className="py-2.5 px-2 text-right font-mono tabular-nums">
                        {filteredClosingStock.reduce((a, b) => a + b.purchaseGrossWeight, 0).toLocaleString()}
                      </td>
                      <td className="py-2.5 px-2 text-right font-mono tabular-nums">
                        {filteredClosingStock.reduce((a, b) => a + b.purchaseTareWeight, 0).toLocaleString()}
                      </td>
                      <td className="py-2.5 px-2 text-right font-mono tabular-nums">
                        {filteredClosingStock.reduce((a, b) => a + b.purchaseFirstWeight, 0).toLocaleString()}
                      </td>
                      <td className="py-2.5 px-2 text-right font-mono tabular-nums">
                        {filteredClosingStock.reduce((a, b) => a + b.purchaseDeductionsKg, 0).toLocaleString()}
                      </td>
                      <td className="py-2.5 px-2 text-right font-mono tabular-nums">
                        {filteredClosingStock.reduce((a, b) => a + b.purchaseNetWeight, 0).toLocaleString()}
                      </td>
                      <td className="py-2.5 px-2 text-right font-mono tabular-nums">
                        {filteredClosingStock.reduce((a, b) => a + b.purchaseBags, 0).toLocaleString()}
                      </td>
                      <td className="py-2.5 px-2"></td>
                      <td className="py-2.5 px-2 text-right font-mono tabular-nums">
                        {formatPKR(filteredClosingStock.reduce((a, b) => a + b.purchaseBaseValue, 0))}
                      </td>
                      <td className="py-2.5 px-2 text-right font-mono tabular-nums">
                        {formatPKR(filteredClosingStock.reduce((a, b) => a + b.purchaseExpenses, 0))}
                      </td>
                      <td className="py-2.5 px-2 text-right font-mono tabular-nums border-r border-yellow-200"></td>

                      {/* Sales */}
                      <td className="py-2.5 px-2 text-right font-mono tabular-nums">
                        {filteredClosingStock.reduce((a, b) => a + b.soldFirstWeight, 0).toLocaleString()}
                      </td>
                      <td className="py-2.5 px-2 text-right font-mono tabular-nums">
                        {filteredClosingStock.reduce((a, b) => a + b.soldNetWeight, 0).toLocaleString()}
                      </td>
                      <td className="py-2.5 px-2 text-right font-mono tabular-nums">
                        {filteredClosingStock.reduce((a, b) => a + b.soldBags, 0).toLocaleString()}
                      </td>
                      <td className="py-2.5 px-2 text-right font-mono tabular-nums border-r border-yellow-200">
                        {formatPKR(filteredClosingStock.reduce((a, b) => a + b.soldValue, 0))}
                      </td>

                      {/* Closing */}
                      <td className="py-2.5 px-2 text-right font-mono tabular-nums">
                        {filteredClosingStock.reduce((a, b) => a + b.closingFirstWeight, 0).toLocaleString()} KG
                      </td>
                      <td className="py-2.5 px-2 text-right font-mono tabular-nums">
                        {filteredClosingStock.reduce((a, b) => a + b.closingBags, 0).toLocaleString()}
                      </td>
                      <td></td>
                      <td className="py-2.5 px-2 text-right font-mono tabular-nums">
                        {formatPKR(filteredClosingStock.reduce((a, b) => a + b.closingValue, 0))}
                      </td>
                    </tr>

                    {/* GRAND TOTAL ROW (GREEN BOLD 14PX) */}
                    <tr className="bg-emerald-100 text-emerald-950 font-black text-xs border-t border-emerald-300">
                      <td className="py-3 px-3 border-r border-emerald-200">
                        GRAND TOTAL / کل اسٹاک مالیت:
                      </td>

                      {/* Opening */}
                      <td className="py-3 px-2 text-right font-mono tabular-nums">
                        {filteredClosingStock.reduce((a, b) => a + b.openingFirstWeight, 0).toLocaleString()}
                      </td>
                      <td className="py-3 px-2 text-right font-mono tabular-nums">
                        {filteredClosingStock.reduce((a, b) => a + b.openingBags, 0).toLocaleString()}
                      </td>
                      <td className="py-3 px-2 text-right font-mono tabular-nums">
                        {formatPKR(filteredClosingStock.reduce((a, b) => a + b.openingValue, 0))}
                      </td>
                      <td className="py-3 px-2 border-r border-emerald-200"></td>

                      {/* Inwards */}
                      <td className="py-3 px-2 text-right font-mono tabular-nums">
                        {filteredClosingStock.reduce((a, b) => a + b.purchaseGrossWeight, 0).toLocaleString()}
                      </td>
                      <td className="py-3 px-2 text-right font-mono tabular-nums">
                        {filteredClosingStock.reduce((a, b) => a + b.purchaseTareWeight, 0).toLocaleString()}
                      </td>
                      <td className="py-3 px-2 text-right font-mono tabular-nums">
                        {filteredClosingStock.reduce((a, b) => a + b.purchaseFirstWeight, 0).toLocaleString()}
                      </td>
                      <td className="py-3 px-2 text-right font-mono tabular-nums">
                        {filteredClosingStock.reduce((a, b) => a + b.purchaseDeductionsKg, 0).toLocaleString()}
                      </td>
                      <td className="py-3 px-2 text-right font-mono tabular-nums">
                        {filteredClosingStock.reduce((a, b) => a + b.purchaseNetWeight, 0).toLocaleString()}
                      </td>
                      <td className="py-3 px-2 text-right font-mono tabular-nums">
                        {filteredClosingStock.reduce((a, b) => a + b.purchaseBags, 0).toLocaleString()}
                      </td>
                      <td className="py-3 px-2"></td>
                      <td className="py-3 px-2 text-right font-mono tabular-nums text-emerald-900">
                        {formatPKR(filteredClosingStock.reduce((a, b) => a + b.purchaseBaseValue, 0))}
                      </td>
                      <td className="py-3 px-2 text-right font-mono tabular-nums">
                        {formatPKR(filteredClosingStock.reduce((a, b) => a + b.purchaseExpenses, 0))}
                      </td>
                      <td className="py-3 px-2 text-right font-mono tabular-nums border-r border-emerald-200"></td>

                      {/* Sales */}
                      <td className="py-3 px-2 text-right font-mono tabular-nums">
                        {filteredClosingStock.reduce((a, b) => a + b.soldFirstWeight, 0).toLocaleString()}
                      </td>
                      <td className="py-3 px-2 text-right font-mono tabular-nums">
                        {filteredClosingStock.reduce((a, b) => a + b.soldNetWeight, 0).toLocaleString()}
                      </td>
                      <td className="py-3 px-2 text-right font-mono tabular-nums">
                        {filteredClosingStock.reduce((a, b) => a + b.soldBags, 0).toLocaleString()}
                      </td>
                      <td className="py-3 px-2 text-right font-mono tabular-nums border-r border-emerald-200">
                        {formatPKR(filteredClosingStock.reduce((a, b) => a + b.soldValue, 0))}
                      </td>

                      {/* Closing */}
                      <td className="py-3 px-2 text-right font-mono tabular-nums text-sm font-black text-slate-950">
                        {filteredClosingStock.reduce((a, b) => a + b.closingFirstWeight, 0).toLocaleString()} KG
                      </td>
                      <td className="py-3 px-2 text-right font-mono tabular-nums text-sm font-black text-slate-950">
                        {filteredClosingStock.reduce((a, b) => a + b.closingBags, 0).toLocaleString()}
                      </td>
                      <td></td>
                      <td className="py-3 px-2 text-right font-mono tabular-nums text-base font-black text-emerald-950">
                        {formatPKR(filteredClosingStock.reduce((a, b) => a + b.closingValue, 0))}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}

            {/* TAB 2: INWARD PURCHASE LOTS DETAILS (SHOWING WHO SUPPLIED WHAT AND THE AVERAGE COST PER LOT) */}
            {closingStockViewMode === 'purchase_lots' && (
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-700 flex items-center justify-between">
                  <span>Approved Inward Purchase Lots Contributing to Stock:</span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {closingStockPurchaseLots.length} Inward Lots
                  </span>
                </div>
                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-xs text-left border-collapse min-w-[1200px]">
                    <thead>
                      <tr className="bg-slate-900 text-white font-semibold text-[11px] uppercase">
                        <th className="py-3 px-3">Voucher #</th>
                        <th className="py-3 px-3">Date</th>
                        <th className="py-3 px-3">Purchased From (Party)</th>
                        <th className="py-3 px-3">Commodity</th>
                        <th className="py-3 px-3">Godown</th>
                        <th className="py-3 px-2 text-right">Gross Wt</th>
                        <th className="py-3 px-2 text-right">Tare Wt</th>
                        <th className="py-3 px-2 text-right font-bold text-blue-200">First Wt (KG)</th>
                        <th className="py-3 px-2 text-right">Deductions</th>
                        <th className="py-3 px-2 text-right">Net Wt (KG)</th>
                        <th className="py-3 px-2 text-right">Bags</th>
                        <th className="py-3 px-2 text-right">Rate/40KG</th>
                        <th className="py-3 px-2 text-right font-bold text-amber-200">Purchase Value</th>
                        <th className="py-3 px-2 text-right">Expenses</th>
                        <th className="py-3 px-2 text-right font-bold text-emerald-300">Total Landed</th>
                        <th className="py-3 px-2 text-right font-black text-amber-300">Avg Cost / 40KG</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {closingStockPurchaseLots.map(v => (
                        <tr key={v.id} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{v.voucherNo}</td>
                          <td className="py-2.5 px-3">{v.date}</td>
                          <td className="py-2.5 px-3">
                            <div className="font-semibold text-slate-800">{v.partyName}</div>
                            <div className="font-urdu text-[11px] text-slate-500">{v.partyNameUrdu}</div>
                          </td>
                          <td className="py-2.5 px-3">
                            <div>{v.itemName}</div>
                            <div className="font-urdu text-[11px] text-slate-500">{v.itemNameUrdu}</div>
                          </td>
                          <td className="py-2.5 px-3">{v.godownName}</td>
                          <td className="py-2.5 px-2 text-right font-mono tabular-nums">{v.grossWeight.toLocaleString()}</td>
                          <td className="py-2.5 px-2 text-right font-mono tabular-nums">{v.tareWeight.toLocaleString()}</td>
                          <td className="py-2.5 px-2 text-right font-mono tabular-nums font-bold text-blue-900 bg-blue-50/40">
                            {v.firstWeight.toLocaleString()} KG
                          </td>
                          <td className="py-2.5 px-2 text-right font-mono tabular-nums text-rose-700">
                            {(v.bardanaKg + v.moistureKg + v.otherDeductionsKg).toLocaleString()}
                          </td>
                          <td className="py-2.5 px-2 text-right font-mono tabular-nums font-semibold">
                            {v.netWeight.toLocaleString()} KG
                          </td>
                          <td className="py-2.5 px-2 text-right font-mono tabular-nums font-bold">{v.bags}</td>
                          <td className="py-2.5 px-2 text-right font-mono tabular-nums">{v.ratePer40Kg.toLocaleString()}</td>
                          <td className="py-2.5 px-2 text-right font-mono tabular-nums font-bold text-slate-900">
                            {formatPKR(v.baseAmount)}
                          </td>
                          <td className="py-2.5 px-2 text-right font-mono tabular-nums text-slate-600">
                            {formatPKR(v.totalExpenses)}
                          </td>
                          <td className="py-2.5 px-2 text-right font-mono tabular-nums font-bold text-emerald-900">
                            {formatPKR(v.totalAmount)}
                          </td>
                          <td className="py-2.5 px-2 text-right font-mono tabular-nums font-black text-blue-950 bg-blue-50/60">
                            Rs. {(v.avgCostPer40Kg || (v.firstWeight > 0 ? (v.baseAmount / v.firstWeight) * 40 : 0)).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

          </div>
        )}

        {/* ============================================================== */}
        {/* 2. DEDICATED PURCHASE REGISTER (WITH ALL DETAILED COLUMNS)     */}
        {/* ============================================================== */}
        {activeReport === 'purchase_register' && (
          <div className="space-y-3 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-blue-800" />
                  <span>Purchase Register (خریداری رجسٹر تفصیلی مع تمام کالمز)</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Complete weighbridge weight deductions, net weight, purchase value on net weight, and average purchase cost on first weight.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2.5 py-1 bg-blue-50 text-blue-800 rounded-lg border border-blue-200">
                  Total Slips: {purchaseVouchers.length}
                </span>
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-xs text-left border-collapse min-w-[1400px]">
                <thead>
                  <tr className="bg-slate-900 text-white font-semibold text-[10px] uppercase">
                    <th className="py-3 px-3">Voucher #</th>
                    <th className="py-3 px-3">Date</th>
                    <th className="py-3 px-3">Purchased From (Party)</th>
                    <th className="py-3 px-3">Commodity / جنس</th>
                    <th className="py-3 px-3">Godown</th>
                    <th className="py-3 px-2 text-right">Gross Wt</th>
                    <th className="py-3 px-2 text-right">Tare Wt</th>
                    <th className="py-3 px-2 text-right font-bold text-blue-200 bg-slate-800">First Wt (KG)</th>
                    <th className="py-3 px-2 text-right">Bardana</th>
                    <th className="py-3 px-2 text-right">Moisture</th>
                    <th className="py-3 px-2 text-right">Other Ded</th>
                    <th className="py-3 px-2 text-right text-rose-300">Total Ded</th>
                    <th className="py-3 px-2 text-right font-bold text-emerald-200">Net Wt (KG)</th>
                    <th className="py-3 px-2 text-right">Bags</th>
                    <th className="py-3 px-2 text-right">Rate/40KG</th>
                    <th className="py-3 px-2 text-right font-black text-amber-200 bg-slate-800">Purchase Value</th>
                    <th className="py-3 px-2 text-right">Expenses</th>
                    <th className="py-3 px-2 text-right font-bold text-emerald-200">Total Amount</th>
                    <th className="py-3 px-2 text-right font-black text-blue-300 bg-blue-950">
                      Avg Purchase Cost
                    </th>
                    <th className="py-3 px-2 text-right">Landed Cost</th>
                    <th className="py-3 px-2 text-center">Status</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 font-medium">
                  {purchaseVouchers.length === 0 ? (
                    <tr>
                      <td colSpan={21} className="py-12 text-center text-slate-400">
                        No purchase vouchers found matching the filter criteria.
                      </td>
                    </tr>
                  ) : (
                    purchaseVouchers.map(v => {
                      const totalDed = (v.bardanaKg || 0) + (v.moistureKg || 0) + (v.otherDeductionsKg || 0);
                      const avgPurchCost = v.avgCostPer40Kg || (v.firstWeight > 0 ? (v.baseAmount / v.firstWeight) * 40 : 0);
                      const landedCost = v.firstWeight > 0 ? (v.totalAmount / v.firstWeight) * 40 : 0;

                      return (
                        <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{v.voucherNo}</td>
                          <td className="py-2.5 px-3 whitespace-nowrap">{v.date}</td>
                          <td className="py-2.5 px-3">
                            <div className="font-semibold text-slate-800">{v.partyName}</div>
                            <div className="font-urdu text-[11px] text-slate-500">{v.partyNameUrdu}</div>
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="font-medium text-slate-900">{v.itemName}</div>
                            <div className="font-urdu text-[11px] text-slate-500">{v.itemNameUrdu}</div>
                          </td>
                          <td className="py-2.5 px-3">{v.godownName}</td>
                          <td className="py-2.5 px-2 text-right font-mono tabular-nums">{v.grossWeight.toLocaleString()}</td>
                          <td className="py-2.5 px-2 text-right font-mono tabular-nums">{v.tareWeight.toLocaleString()}</td>
                          <td className="py-2.5 px-2 text-right font-mono tabular-nums font-bold text-blue-900 bg-blue-50/50">
                            {v.firstWeight.toLocaleString()} KG
                          </td>
                          <td className="py-2.5 px-2 text-right font-mono tabular-nums text-slate-600">{v.bardanaKg}</td>
                          <td className="py-2.5 px-2 text-right font-mono tabular-nums text-slate-600">{v.moistureKg}</td>
                          <td className="py-2.5 px-2 text-right font-mono tabular-nums text-slate-600">{v.otherDeductionsKg}</td>
                          <td className="py-2.5 px-2 text-right font-mono tabular-nums text-rose-700 font-semibold">
                            {totalDed.toLocaleString()}
                          </td>
                          <td className="py-2.5 px-2 text-right font-mono tabular-nums font-bold text-slate-900">
                            {v.netWeight.toLocaleString()} KG
                          </td>
                          <td className="py-2.5 px-2 text-right font-mono tabular-nums font-bold">{v.bags}</td>
                          <td className="py-2.5 px-2 text-right font-mono tabular-nums">{v.ratePer40Kg.toLocaleString()}</td>
                          <td className="py-2.5 px-2 text-right font-mono tabular-nums font-bold text-slate-900 bg-amber-50/40">
                            {formatPKR(v.baseAmount)}
                          </td>
                          <td className="py-2.5 px-2 text-right font-mono tabular-nums text-slate-600">
                            {formatPKR(v.totalExpenses)}
                          </td>
                          <td className="py-2.5 px-2 text-right font-mono tabular-nums font-extrabold text-slate-900">
                            {formatPKR(v.totalAmount)}
                          </td>
                          <td className="py-2.5 px-2 text-right font-mono tabular-nums font-black text-blue-900 bg-blue-50/60">
                            Rs. {avgPurchCost.toFixed(2)}
                          </td>
                          <td className="py-2.5 px-2 text-right font-mono tabular-nums text-slate-700">
                            Rs. {landedCost.toFixed(2)}
                          </td>
                          <td className="py-2.5 px-2 text-center whitespace-nowrap">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                              v.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {v.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>

                {/* YELLOW SUBTOTAL & GREEN GRAND TOTAL */}
                <tfoot>
                  {/* SUBTOTAL */}
                  <tr className="bg-yellow-100/90 text-yellow-950 font-bold border-t-2 border-yellow-300 text-[11px]">
                    <td colSpan={5} className="py-2.5 px-3 text-right">SUBTOTAL / ذیلی میزان:</td>
                    <td className="py-2.5 px-2 text-right font-mono tabular-nums">
                      {purchaseVouchers.reduce((a, b) => a + (b.grossWeight || 0), 0).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-2 text-right font-mono tabular-nums">
                      {purchaseVouchers.reduce((a, b) => a + (b.tareWeight || 0), 0).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-2 text-right font-mono tabular-nums">
                      {purchaseVouchers.reduce((a, b) => a + (b.firstWeight || 0), 0).toLocaleString()}
                    </td>
                    <td colSpan={3}></td>
                    <td className="py-2.5 px-2 text-right font-mono tabular-nums">
                      {purchaseVouchers.reduce((a, b) => a + ((b.bardanaKg || 0) + (b.moistureKg || 0) + (b.otherDeductionsKg || 0)), 0).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-2 text-right font-mono tabular-nums">
                      {purchaseVouchers.reduce((a, b) => a + (b.netWeight || 0), 0).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-2 text-right font-mono tabular-nums">
                      {purchaseVouchers.reduce((a, b) => a + (b.bags || 0), 0).toLocaleString()}
                    </td>
                    <td></td>
                    <td className="py-2.5 px-2 text-right font-mono tabular-nums">
                      {formatPKR(purchaseVouchers.reduce((a, b) => a + (b.baseAmount || 0), 0))}
                    </td>
                    <td className="py-2.5 px-2 text-right font-mono tabular-nums">
                      {formatPKR(purchaseVouchers.reduce((a, b) => a + (b.totalExpenses || 0), 0))}
                    </td>
                    <td className="py-2.5 px-2 text-right font-mono tabular-nums">
                      {formatPKR(purchaseVouchers.reduce((a, b) => a + (b.totalAmount || 0), 0))}
                    </td>
                    <td className="py-2.5 px-2 text-right font-mono tabular-nums">
                      Rs. {(
                        purchaseVouchers.reduce((a, b) => a + (b.firstWeight || 0), 0) > 0
                          ? (purchaseVouchers.reduce((a, b) => a + (b.baseAmount || 0), 0) / purchaseVouchers.reduce((a, b) => a + (b.firstWeight || 0), 0)) * 40
                          : 0
                      ).toFixed(2)}
                    </td>
                    <td colSpan={2}></td>
                  </tr>

                  {/* GRAND TOTAL */}
                  <tr className="bg-emerald-100 text-emerald-950 font-black text-xs border-t border-emerald-300">
                    <td colSpan={5} className="py-3 px-3 text-right">GRAND TOTAL / کل میزان (PKR):</td>
                    <td className="py-3 px-2 text-right font-mono tabular-nums">
                      {purchaseVouchers.reduce((a, b) => a + (b.grossWeight || 0), 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-2 text-right font-mono tabular-nums">
                      {purchaseVouchers.reduce((a, b) => a + (b.tareWeight || 0), 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-2 text-right font-mono tabular-nums font-black text-slate-900">
                      {purchaseVouchers.reduce((a, b) => a + (b.firstWeight || 0), 0).toLocaleString()} KG
                    </td>
                    <td colSpan={3}></td>
                    <td className="py-3 px-2 text-right font-mono tabular-nums">
                      {purchaseVouchers.reduce((a, b) => a + ((b.bardanaKg || 0) + (b.moistureKg || 0) + (b.otherDeductionsKg || 0)), 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-2 text-right font-mono tabular-nums font-black text-slate-900">
                      {purchaseVouchers.reduce((a, b) => a + (b.netWeight || 0), 0).toLocaleString()} KG
                    </td>
                    <td className="py-3 px-2 text-right font-mono tabular-nums font-black text-slate-900">
                      {purchaseVouchers.reduce((a, b) => a + (b.bags || 0), 0).toLocaleString()}
                    </td>
                    <td></td>
                    <td className="py-3 px-2 text-right font-mono tabular-nums font-black text-slate-900">
                      {formatPKR(purchaseVouchers.reduce((a, b) => a + (b.baseAmount || 0), 0))}
                    </td>
                    <td className="py-3 px-2 text-right font-mono tabular-nums">
                      {formatPKR(purchaseVouchers.reduce((a, b) => a + (b.totalExpenses || 0), 0))}
                    </td>
                    <td className="py-3 px-2 text-right font-mono tabular-nums font-black text-emerald-900">
                      {formatPKR(purchaseVouchers.reduce((a, b) => a + (b.totalAmount || 0), 0))}
                    </td>
                    <td className="py-3 px-2 text-right font-mono tabular-nums text-sm font-black text-blue-950">
                      Rs. {(
                        purchaseVouchers.reduce((a, b) => a + (b.firstWeight || 0), 0) > 0
                          ? (purchaseVouchers.reduce((a, b) => a + (b.baseAmount || 0), 0) / purchaseVouchers.reduce((a, b) => a + (b.firstWeight || 0), 0)) * 40
                          : 0
                      ).toFixed(2)}
                    </td>
                    <td colSpan={2}></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* 3. BARBARA REGISTER (SEPARATE MASTER - STRICT ZERO WEIGHT IMPACT) */}
        {/* ============================================================== */}
        {activeReport === 'bardana_register' && (
          <div className="p-4 space-y-4">
            
            {/* KPI STATS CARDS */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[10px] font-bold uppercase text-slate-500">Opening Bags (ابتدائی)</span>
                <div className="text-xl font-mono font-black text-slate-900 mt-0.5">
                  {(selectedBardanaId === 'ALL'
                    ? bardanaMasters.reduce((a, b) => a + (b.openingBags || 0), 0)
                    : bardanaMasters.find(b => b.id === selectedBardanaId)?.openingBags || 0
                  ).toLocaleString()}
                </div>
                <div className="text-[10px] text-slate-500">Registered Opening Stock</div>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                <span className="text-[10px] font-bold uppercase text-emerald-700">Total Inward Received (+)</span>
                <div className="text-xl font-mono font-black text-emerald-950 mt-0.5">
                  +{bardanaRegisterEntries.reduce((a, b) => a + b.inwardBags, 0).toLocaleString()}
                </div>
                <div className="font-urdu text-[11px] text-emerald-800">موصول شدہ بوریاں (آمد)</div>
              </div>

              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl">
                <span className="text-[10px] font-bold uppercase text-rose-700">Total Outward Dispatched (-)</span>
                <div className="text-xl font-mono font-black text-rose-950 mt-0.5">
                  -{bardanaRegisterEntries.reduce((a, b) => a + b.outwardBags, 0).toLocaleString()}
                </div>
                <div className="font-urdu text-[11px] text-rose-800">خارج شدہ بوریاں (اخراج)</div>
              </div>

              <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl">
                <span className="text-[10px] font-bold uppercase text-purple-700">Closing In-Stock Balance</span>
                <div className="text-xl font-mono font-black text-purple-950 mt-0.5">
                  {(bardanaRegisterEntries.length > 0
                    ? bardanaRegisterEntries[bardanaRegisterEntries.length - 1].runningBalance
                    : (selectedBardanaId === 'ALL'
                        ? bardanaMasters.reduce((a, b) => a + (b.openingBags || 0), 0)
                        : bardanaMasters.find(b => b.id === selectedBardanaId)?.openingBags || 0)
                  ).toLocaleString()} Bags
                </div>
                <div className="font-urdu text-[11px] text-purple-800">موجودہ بقایا باردانہ</div>
              </div>
            </div>

            {/* MANDI MANDATE BANNER */}
            <div className="p-3 rounded-xl bg-purple-900 text-white flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Box className="w-5 h-5 text-purple-300 shrink-0" />
                <div>
                  <span className="font-bold uppercase tracking-wider text-purple-200">Strict Mandi Rule: </span>
                  <span>Barbara tracker is a separate master. Number of bags received or dispatched has <strong>NO impact on weight</strong>. Only noted as Received (+) or Minused (-) in this register.</span>
                </div>
              </div>
              <div className="font-urdu text-purple-200 shrink-0 text-right">
                صرف باردانہ تعداد رجسٹر میں نوٹ ہوتی ہے، وزن پر کوئی اثر نہیں ہوتا
              </div>
            </div>

            {/* TABLE */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white font-semibold text-[11px] uppercase">
                    <th className="py-3 px-3">Date</th>
                    <th className="py-3 px-3">Ref / Voucher #</th>
                    <th className="py-3 px-3">Movement Type</th>
                    <th className="py-3 px-3">Barbara Type</th>
                    <th className="py-3 px-3">Party Name</th>
                    <th className="py-3 px-3">Commodity</th>
                    <th className="py-3 px-3">Godown</th>
                    <th className="py-3 px-2 text-right text-emerald-300">Inward (+) Bags</th>
                    <th className="py-3 px-2 text-right text-rose-300">Outward (-) Bags</th>
                    <th className="py-3 px-2 text-right font-black text-amber-200 bg-slate-800">Balance Bags</th>
                    <th className="py-3 px-2 text-center">Status</th>
                    <th className="py-3 px-3">Remarks / تفصیل</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 font-medium">
                  {bardanaRegisterEntries.length === 0 ? (
                    <tr>
                      <td colSpan={12} className="py-10 text-center text-slate-400">
                        No Barbara movements found matching the selected filter criteria.
                      </td>
                    </tr>
                  ) : (
                    bardanaRegisterEntries.map(e => (
                      <tr key={e.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 px-3 whitespace-nowrap">{e.date}</td>
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{e.voucherNo}</td>
                        <td className="py-2.5 px-3">
                          <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                            e.isPositive ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}>
                            {e.movementType}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-medium text-slate-900">{e.bardanaName}</td>
                        <td className="py-2.5 px-3">
                          <div className="font-semibold text-slate-800">{e.partyName}</div>
                          {e.partyNameUrdu && <div className="font-urdu text-[11px] text-slate-500">{e.partyNameUrdu}</div>}
                        </td>
                        <td className="py-2.5 px-3 text-slate-700">{e.itemName || '-'}</td>
                        <td className="py-2.5 px-3 text-slate-600">{e.godownName || '-'}</td>
                        <td className="py-2.5 px-2 text-right font-mono tabular-nums font-bold text-emerald-700">
                          {e.inwardBags > 0 ? `+${e.inwardBags}` : '-'}
                        </td>
                        <td className="py-2.5 px-2 text-right font-mono tabular-nums font-bold text-rose-700">
                          {e.outwardBags > 0 ? `-${e.outwardBags}` : '-'}
                        </td>
                        <td className="py-2.5 px-2 text-right font-mono tabular-nums font-black text-purple-950 bg-purple-50/50">
                          {e.runningBalance.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-2 text-center">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            e.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {e.status}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-500 text-[11px] truncate max-w-xs">{e.remarks}</td>
                      </tr>
                    ))
                  )}
                </tbody>

                <tfoot>
                  {/* SUBTOTAL */}
                  <tr className="bg-yellow-100/90 text-yellow-950 font-bold border-t-2 border-yellow-300 text-[11px]">
                    <td colSpan={7} className="py-2.5 px-3 text-right">SUBTOTAL / ذیلی میزان:</td>
                    <td className="py-2.5 px-2 text-right font-mono tabular-nums font-bold text-emerald-900">
                      +{bardanaRegisterEntries.reduce((a, b) => a + b.inwardBags, 0).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-2 text-right font-mono tabular-nums font-bold text-rose-900">
                      -{bardanaRegisterEntries.reduce((a, b) => a + b.outwardBags, 0).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-2 text-right font-mono tabular-nums font-black text-purple-950">
                      {(bardanaRegisterEntries.length > 0 ? bardanaRegisterEntries[bardanaRegisterEntries.length - 1].runningBalance : 0).toLocaleString()}
                    </td>
                    <td colSpan={2}></td>
                  </tr>

                  {/* GRAND TOTAL */}
                  <tr className="bg-emerald-100 text-emerald-950 font-black text-xs border-t border-emerald-300">
                    <td colSpan={7} className="py-3 px-3 text-right">GRAND TOTAL / کل میزان باردانہ (بوریاں):</td>
                    <td className="py-3 px-2 text-right font-mono tabular-nums text-emerald-900">
                      +{bardanaRegisterEntries.reduce((a, b) => a + b.inwardBags, 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-2 text-right font-mono tabular-nums text-rose-900">
                      -{bardanaRegisterEntries.reduce((a, b) => a + b.outwardBags, 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-2 text-right font-mono tabular-nums text-sm font-black text-purple-950">
                      {(bardanaRegisterEntries.length > 0 ? bardanaRegisterEntries[bardanaRegisterEntries.length - 1].runningBalance : 0).toLocaleString()} Bags
                    </td>
                    <td colSpan={2}></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* 4. OTHER REGISTERS (SALES / TRANSFER / EXPENSE / DAYBOOK)       */}
        {/* ============================================================== */}
        {activeReport !== 'closing_stock' && activeReport !== 'purchase_register' && activeReport !== 'bardana_register' && activeReport !== 'party_info' && activeReport !== 'audit_trail' && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white font-semibold text-[11px] uppercase">
                  <th className="py-3 px-3">Voucher #</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Party Name</th>
                  <th className="py-3 px-3">Item</th>
                  <th className="py-3 px-3">Godown</th>
                  <th className="py-3 px-3 text-right">First Wt (KG)</th>
                  <th className="py-3 px-3 text-right">Bags</th>
                  <th className="py-3 px-3 text-right">Rate/40KG</th>
                  <th className="py-3 px-3 text-right">Expenses</th>
                  <th className="py-3 px-3 text-right">Total Amount (PKR)</th>
                  <th className="py-3 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredRegisterVouchers
                  .filter(v => {
                    if (activeReport === 'sales_register') return v.type === 'SALE';
                    if (activeReport === 'transfer_register') return v.type === 'TRANSFER';
                    if (activeReport === 'expense_register') return v.type === 'EXPENSE';
                    return true; // daybook shows all
                  })
                  .map(v => (
                    <tr key={v.id} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{v.voucherNo}</td>
                      <td className="py-2.5 px-3">{v.date}</td>
                      <td className="py-2.5 px-3">{v.partyName}</td>
                      <td className="py-2.5 px-3">{v.itemName}</td>
                      <td className="py-2.5 px-3">{v.godownName}</td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums">{v.firstWeight.toLocaleString()} KG</td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums">{v.bags}</td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums">{v.ratePer40Kg.toLocaleString()}</td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-600">{formatPKR(v.totalExpenses)}</td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums font-bold text-slate-900">{formatPKR(v.totalAmount)}</td>
                      <td className="py-2.5 px-3 text-center">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          v.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {v.status}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ============================================================== */}
        {/* 4. PARTY INFORMATION DIRECTORY (ONLY PARTY INFO REQUIRED)       */}
        {/* ============================================================== */}
        {activeReport === 'party_info' && (
          <div className="p-4 space-y-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row justify-between sm:items-center gap-3 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Party Directory</span>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-600" />
                  <span>Party Information (کاروباری پارٹیز و بیوپاریوں کی معلومات)</span>
                </h3>
                <div className="text-slate-500 font-urdu text-[11px] mt-0.5">
                  تمام رجسٹرڈ کاشتکار سپلائرز اور مل خریداروں کی رابطے کی معلومات اور بنیادی کوائف
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold font-mono">
                  {filteredPartiesList.length} Parties Listed
                </span>
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-2xs">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white text-[11px] uppercase tracking-wider">
                    <th className="py-3 px-3">Party Name / نام</th>
                    <th className="py-3 px-3">Category / Role</th>
                    <th className="py-3 px-3">Contact Phone</th>
                    <th className="py-3 px-3">WhatsApp</th>
                    <th className="py-3 px-3">Address & City</th>
                    <th className="py-3 px-3 text-right">Opening Balance (PKR)</th>
                    <th className="py-3 px-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium bg-white">
                  {filteredPartiesList.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-slate-400">
                        No party found matching your search criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredPartiesList.map(p => (
                      <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2.5 px-3">
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-slate-400" />
                            <span>{p.name}</span>
                          </div>
                          <div className="font-urdu text-[11px] text-slate-500 leading-tight">
                            {p.nameUrdu}
                          </div>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            p.type === 'Supplier'
                              ? 'bg-emerald-100 text-emerald-800'
                              : p.type === 'Customer'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-purple-100 text-purple-800'
                          }`}>
                            {p.type === 'Supplier' ? 'Farmer / Supplier (کاشتکار)' :
                             p.type === 'Customer' ? 'Mill / Buyer (خریدار)' : 'Both (دونوں)'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-700">
                          {p.phone ? (
                            <a
                              href={`tel:${p.phone}`}
                              className="text-emerald-700 hover:text-emerald-900 flex items-center gap-1 hover:underline"
                            >
                              <Phone className="w-3 h-3 text-emerald-600" />
                              <span>{p.phone}</span>
                            </a>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-slate-700">
                          {p.whatsapp || p.phone ? (
                            <a
                              href={`https://wa.me/${(p.whatsapp || p.phone || '').replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-emerald-700 hover:text-emerald-900 flex items-center gap-1 hover:underline"
                            >
                              <MessageSquare className="w-3 h-3 text-emerald-600" />
                              <span>{p.whatsapp || p.phone}</span>
                            </a>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">
                          <div className="flex items-center gap-1 truncate max-w-xs">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{p.address || 'Local Mandi'}</span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono tabular-nums font-bold text-slate-900">
                          {formatPKR(p.openingBalance)}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Active (فعال)
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

        {/* ============================================================== */}
        {/* 5. AUDIT TRAIL LOG                                             */}
        {/* ============================================================== */}
        {activeReport === 'audit_trail' && (
          <div className="p-4 space-y-3">
            <div className="text-xs font-bold text-slate-700 uppercase">
              System Audit Trail & Forensic Activity Log
            </div>
            <div className="space-y-2">
              {allAuditEntries.map((a, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{a.userName}</span>
                      <span className="font-mono text-[10px] bg-slate-200 px-1.5 py-0.5 rounded">{a.voucherNo}</span>
                      <span className="font-bold text-[10px] text-blue-700">{a.action}</span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">{a.timestamp}</span>
                  </div>
                  <div className="text-slate-700">{a.details}</div>
                  {a.deviceInfo && (
                    <div className="text-[10px] text-slate-400">Terminal: {a.deviceInfo}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
