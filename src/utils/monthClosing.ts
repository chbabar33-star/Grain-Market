/**
 * Mandi ERP - Month Closing & Archive Engine (ماہانہ کلوزنگ انجن)
 * Isolates and preserves 100% of transactions, Khatas, stock, Bardana, and P&L month-wise.
 */

import {
  Voucher,
  Party,
  Item,
  ExpenseMaster,
  BardanaMaster,
  BardanaMovement,
  MonthClosingRecord,
  MonthClosingPartySummary,
  MonthClosingStockSummary,
  MonthClosingBardanaSummary,
  MonthClosingPnLSummary
} from '../types';

export const URDU_MONTH_NAMES: Record<string, string> = {
  '01': 'جنوری',
  '02': 'فروری',
  '03': 'مارچ',
  '04': 'اپریل',
  '05': 'مئی',
  '06': 'جون',
  '07': 'جولائی',
  '08': 'اگست',
  '09': 'ستمبر',
  '10': 'اکتوبر',
  '11': 'نومبر',
  '12': 'دسمبر'
};

export const ENGLISH_MONTH_NAMES: Record<string, string> = {
  '01': 'January',
  '02': 'February',
  '03': 'March',
  '04': 'April',
  '05': 'May',
  '06': 'June',
  '07': 'July',
  '08': 'August',
  '09': 'September',
  '10': 'October',
  '11': 'November',
  '12': 'December'
};

export function getMonthKey(dateStr?: string): string {
  if (!dateStr) {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    return `${y}-${m}`;
  }
  const parts = dateStr.split('-');
  if (parts.length >= 2) {
    return `${parts[0]}-${parts[1].padStart(2, '0')}`;
  }
  return dateStr.slice(0, 7);
}

export function formatPeriodDateRange(startDate: string, endDate: string): { en: string; urdu: string } {
  const parseParts = (dStr: string) => {
    const parts = dStr.split('-');
    const y = parts[0] || '2026';
    const m = (parts[1] || '01').padStart(2, '0');
    const d = (parts[2] || '01').padStart(2, '0');
    return { y, m, d };
  };

  const s = parseParts(startDate);
  const e = parseParts(endDate);

  const SHORT_EN: Record<string, string> = {
    '01': 'Jan', '02': 'Feb', '03': 'Mar', '04': 'Apr', '05': 'May', '06': 'Jun',
    '07': 'Jul', '08': 'Aug', '09': 'Sep', '10': 'Oct', '11': 'Nov', '12': 'Dec'
  };

  const toUrduNum = (str: string) => str.replace(/\d/g, digit => '۰۱۲۳۴۵۶۷۸۹'[parseInt(digit, 10)]);

  const en = `${s.d} ${SHORT_EN[s.m] || s.m} ${s.y} to ${e.d} ${SHORT_EN[e.m] || e.m} ${e.y}`;
  const urdu = `${toUrduNum(s.d)} ${URDU_MONTH_NAMES[s.m] || s.m} ${toUrduNum(s.y)} تا ${toUrduNum(e.d)} ${URDU_MONTH_NAMES[e.m] || e.m} ${toUrduNum(e.y)}`;

  return { en, urdu };
}

export function formatMonthName(monthKey: string): { en: string; urdu: string } {
  if (monthKey.includes('_to_')) {
    const [start, end] = monthKey.split('_to_');
    return formatPeriodDateRange(start, end);
  }

  const parts = monthKey.split('-');
  if (parts.length < 2) return { en: monthKey, urdu: monthKey };
  const [year, month] = parts;
  const enMonth = ENGLISH_MONTH_NAMES[month] || month;
  const urduMonth = URDU_MONTH_NAMES[month] || month;

  // Urdu numerals for year
  const urduYear = year
    ? year.replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[parseInt(d, 10)])
    : year;

  return {
    en: `${enMonth} ${year}`,
    urdu: `${urduMonth} ${urduYear}`
  };
}

export function getAvailableMonthKeys(vouchers: Voucher[]): string[] {
  const set = new Set<string>();
  
  // Current month
  set.add(getMonthKey());

  // All voucher months
  vouchers.forEach(v => {
    if (v.date) {
      set.add(getMonthKey(v.date));
    }
  });

  return Array.from(set).sort((a, b) => b.localeCompare(a));
}

export function getMonthDateRange(monthKey: string): { start: string; end: string } {
  if (monthKey.includes('_to_')) {
    const [start, end] = monthKey.split('_to_');
    return { start, end };
  }

  const [yearStr, monthStr] = monthKey.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);

  const start = `${yearStr}-${monthStr.padStart(2, '0')}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const end = `${yearStr}-${monthStr.padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

  return { start, end };
}

export function computeMonthClosingData(params: {
  monthKey: string;
  startDate?: string;
  endDate?: string;
  periodName?: string;
  periodNameUrdu?: string;
  closingType?: 'single_month' | 'custom_range';
  businessId: string;
  vouchers: Voucher[];
  parties: Party[];
  items: Item[];
  expenses: ExpenseMaster[];
  bardanaMasters: BardanaMaster[];
  bardanaMovements: BardanaMovement[];
  closedBy: string;
  notes?: string;
}): MonthClosingRecord {
  const {
    monthKey,
    startDate,
    endDate,
    periodName,
    periodNameUrdu,
    closingType,
    businessId,
    vouchers,
    parties,
    items,
    bardanaMasters,
    bardanaMovements,
    closedBy,
    notes
  } = params;

  // Determine date boundaries & display names
  let start: string;
  let end: string;
  let monthName: string;
  let monthNameUrdu: string;

  if (startDate && endDate) {
    start = startDate;
    end = endDate;
    const formatted = formatPeriodDateRange(start, end);
    monthName = periodName || formatted.en;
    monthNameUrdu = periodNameUrdu || formatted.urdu;
  } else if (monthKey.includes('_to_')) {
    const range = getMonthDateRange(monthKey);
    start = range.start;
    end = range.end;
    const formatted = formatPeriodDateRange(start, end);
    monthName = periodName || formatted.en;
    monthNameUrdu = periodNameUrdu || formatted.urdu;
  } else {
    const range = getMonthDateRange(monthKey);
    start = range.start;
    end = range.end;
    const formatted = formatMonthName(monthKey);
    monthName = periodName || formatted.en;
    monthNameUrdu = periodNameUrdu || formatted.urdu;
  }

  // 1. Filter vouchers belonging to this business and this period
  const monthVouchers = vouchers.filter(v => {
    if (v.businessId !== businessId || v.isDeleted) return false;
    if (startDate && endDate) {
      return v.date >= start && v.date <= end;
    }
    if (monthKey.includes('_to_')) {
      return v.date >= start && v.date <= end;
    }
    return v.date.startsWith(monthKey);
  });

  const approvedMonthVouchers = monthVouchers.filter(v => v.status === 'Approved');

  // 2. High-level metric sums
  let totalPurchaseWeightKg = 0;
  let totalPurchaseAmount = 0;
  let totalSalesWeightKg = 0;
  let totalSalesAmount = 0;
  let totalDirectExpenses = 0;
  let totalIndirectExpenses = 0;

  approvedMonthVouchers.forEach(v => {
    if (v.type === 'PURCHASE') {
      totalPurchaseWeightKg += v.firstWeight;
      totalPurchaseAmount += v.totalAmount;
      totalDirectExpenses += v.totalExpenses;
    } else if (v.type === 'SALE') {
      totalSalesWeightKg += v.firstWeight;
      totalSalesAmount += v.totalAmount;
      totalDirectExpenses += v.totalExpenses;
    } else if (v.type === 'EXPENSE') {
      totalIndirectExpenses += v.totalAmount;
    }
  });

  const totalExpensesAmount = totalDirectExpenses + totalIndirectExpenses;

  // 3. Party summaries for this month
  const partySummaries: MonthClosingPartySummary[] = parties.map(p => {
    let debits = 0;
    let credits = 0;

    approvedMonthVouchers
      .filter(v => v.partyId === p.id)
      .forEach(v => {
        if (v.type === 'PURCHASE') {
          // In Mandi system: We bought from party (Farmer/Beopari) -> Payable increases (Credit to party or Debit ledger)
          credits += v.baseAmount;
        } else if (v.type === 'SALE') {
          // We sold to customer/buyer -> Receivable increases (Debit to party)
          debits += v.totalAmount;
        }
      });

    const closingBalance = p.openingBalance + debits - credits;

    return {
      partyId: p.id,
      partyName: p.name,
      partyNameUrdu: p.nameUrdu,
      type: p.type,
      phone: p.phone,
      openingBalance: p.openingBalance,
      totalDebits: debits,
      totalCredits: credits,
      closingBalance
    };
  });

  // 4. Stock summaries for this month (First-Weight CostingBasis)
  const stockSummaries: MonthClosingStockSummary[] = items.map(item => {
    let purchasedFirstWeight = 0;
    let purchasedNetWeight = 0;
    let purchasedBags = 0;
    let purchasedValue = 0;

    let soldFirstWeight = 0;
    let soldNetWeight = 0;
    let soldBags = 0;
    let soldValue = 0;

    approvedMonthVouchers
      .filter(v => v.itemId === item.id)
      .forEach(v => {
        if (v.type === 'PURCHASE') {
          purchasedFirstWeight += v.firstWeight;
          purchasedNetWeight += v.netWeight;
          purchasedBags += v.bags;
          purchasedValue += v.baseAmount;
        } else if (v.type === 'SALE') {
          soldFirstWeight += v.firstWeight;
          soldNetWeight += v.netWeight;
          soldBags += v.bags;
          soldValue += v.baseAmount;
        }
      });

    const closingFirstWeight = item.openingFirstWeight + purchasedFirstWeight - soldFirstWeight;
    const closingBags = item.openingBags + purchasedBags - soldBags;

    const totalAvailableFirstWeight = item.openingFirstWeight + purchasedFirstWeight;
    const totalAvailableValue = item.openingValue + purchasedValue;
    const avgCostPer40Kg = totalAvailableFirstWeight > 0
      ? (totalAvailableValue / totalAvailableFirstWeight) * 40
      : item.defaultRate;

    const closingValue = Math.max(0, (closingFirstWeight / 40) * avgCostPer40Kg);

    return {
      itemId: item.id,
      itemName: item.name,
      itemNameUrdu: item.nameUrdu,
      openingFirstWeight: item.openingFirstWeight,
      openingBags: item.openingBags,
      openingValue: item.openingValue,
      purchasedFirstWeight,
      purchasedNetWeight,
      purchasedBags,
      purchasedValue,
      soldFirstWeight,
      soldNetWeight,
      soldBags,
      soldValue,
      closingFirstWeight,
      closingBags,
      closingValue,
      avgCostPer40Kg
    };
  });

  // 5. Bardana summaries
  const bardanaSummaries: MonthClosingBardanaSummary[] = bardanaMasters.map(b => {
    let inwardBags = 0;
    let outwardBags = 0;

    approvedMonthVouchers.forEach(v => {
      if (v.bardanaId === b.id) {
        if (v.type === 'PURCHASE') inwardBags += v.bags;
        else if (v.type === 'SALE') outwardBags += v.bags;
      }
    });

    bardanaMovements
      .filter(m => m.bardanaId === b.id && (startDate && endDate ? (m.date >= start && m.date <= end) : monthKey.includes('_to_') ? (m.date >= start && m.date <= end) : m.date.startsWith(monthKey)))
      .forEach(m => {
        inwardBags += m.inwardBags;
        outwardBags += m.outwardBags;
      });

    const closingBags = b.openingBags + inwardBags - outwardBags;

    return {
      bardanaId: b.id,
      bardanaName: b.name,
      bardanaNameUrdu: b.nameUrdu,
      openingBags: b.openingBags,
      inwardBags,
      outwardBags,
      closingBags
    };
  });

  // 6. PnL summary
  let costOfGoodsSold = 0;
  stockSummaries.forEach(s => {
    if (s.soldFirstWeight > 0) {
      costOfGoodsSold += (s.soldFirstWeight / 40) * s.avgCostPer40Kg;
    }
  });

  const grossTradingProfit = totalSalesAmount - costOfGoodsSold;
  const netProfit = grossTradingProfit - totalExpensesAmount;

  const pnlSummary: MonthClosingPnLSummary = {
    purchaseValue: totalPurchaseAmount,
    salesValue: totalSalesAmount,
    costOfGoodsSold,
    grossTradingProfit,
    totalDirectExpenses,
    totalIndirectExpenses,
    totalExpenses: totalExpensesAmount,
    netProfit
  };

  // Collect itemized expenses
  const expenseItemsMap: Record<string, { name: string; nameUrdu: string; amount: number; type: 'Direct' | 'Indirect' }> = {};
  approvedMonthVouchers.forEach(v => {
    (v.expenses || []).forEach(exp => {
      if (!expenseItemsMap[exp.expenseId]) {
        expenseItemsMap[exp.expenseId] = {
          name: exp.name,
          nameUrdu: exp.nameUrdu,
          amount: 0,
          type: exp.type
        };
      }
      expenseItemsMap[exp.expenseId].amount += exp.amount;
    });
  });

  const expenseItems = Object.entries(expenseItemsMap).map(([id, val]) => ({
    expenseId: id,
    name: val.name,
    nameUrdu: val.nameUrdu,
    amount: val.amount,
    type: val.type
  }));

  const determinedClosingType = closingType || ((startDate && endDate) || monthKey.includes('_to_') ? 'custom_range' : 'single_month');

  return {
    id: `mclose-${monthKey}-${businessId}`,
    businessId,
    monthKey,
    monthName,
    monthNameUrdu,
    startDate: start,
    endDate: end,
    closingType: determinedClosingType,
    closedAt: new Date().toISOString(),
    closedBy,
    isLocked: true,
    notes: notes?.trim() || undefined,
    totalVouchersCount: monthVouchers.length,
    totalPurchaseWeightKg,
    totalPurchaseAmount,
    totalSalesWeightKg,
    totalSalesAmount,
    totalExpensesAmount,
    netMandiProfit: netProfit,
    vouchers: monthVouchers,
    partySummaries,
    stockSummaries,
    bardanaSummaries,
    pnlSummary,
    expenses: expenseItems
  };
}

export function generateMonthClosingBackupBlob(record: MonthClosingRecord, businessName: string): Blob {
  const payload = {
    archiveType: 'MANDI_MONTH_CLOSING_ARCHIVE',
    version: '2026.2',
    businessName,
    businessId: record.businessId,
    monthKey: record.monthKey,
    monthName: record.monthName,
    monthNameUrdu: record.monthNameUrdu,
    period: {
      startDate: record.startDate,
      endDate: record.endDate
    },
    meta: {
      closedAt: record.closedAt,
      closedBy: record.closedBy,
      isLocked: record.isLocked,
      notes: record.notes
    },
    kpiMetrics: {
      totalVouchers: record.totalVouchersCount,
      purchaseWeightKg: record.totalPurchaseWeightKg,
      purchaseAmountPKR: record.totalPurchaseAmount,
      salesWeightKg: record.totalSalesWeightKg,
      salesAmountPKR: record.totalSalesAmount,
      totalExpensesPKR: record.totalExpensesAmount,
      netProfitPKR: record.netMandiProfit
    },
    data: {
      vouchers: record.vouchers,
      partyLedgers: record.partySummaries,
      inventoryClosingStock: record.stockSummaries,
      bardanaBagsClosing: record.bardanaSummaries,
      profitAndLoss: record.pnlSummary,
      expensesBreakdown: record.expenses
    }
  };

  return new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json;charset=utf-8'
  });
}
