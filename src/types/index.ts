/**
 * Grain Market Software - Core Types & Definitions
 * Locked to PKR Currency, First Weight Costing, Bilingual English + Urdu Nastaleeq
 */

export type LanguageMode = 'both' | 'urdu' | 'english';

export type UserRole = 'Admin' | 'Manager' | 'Operator' | 'Viewer';

export type VoucherType = 'PURCHASE' | 'SALE' | 'TRANSFER' | 'EXPENSE';

export type VoucherStatus = 'Pending' | 'Approved' | 'Cancelled';

export type ExpenseCategoryType = 'Direct' | 'Indirect';

export type AllocationMethod = 'weight_ratio' | 'amount_ratio' | 'manual';

export interface Business {
  id: string;
  name: string;
  nameUrdu: string;
  address: string;
  addressUrdu: string;
  phone: string;
  ntn: string;
  proprietor: string;
  proprietorUrdu: string;
  logoText?: string;
  isDefault?: boolean;
}

export interface Party {
  id: string;
  businessId: string;
  name: string;
  nameUrdu: string;
  phone: string;
  whatsapp: string;
  address: string;
  addressUrdu: string;
  type: 'Supplier' | 'Customer' | 'Both';
  openingBalance: number; // positive = receivable / debit, negative = payable / credit
  currentBalance: number;
  ntn?: string;
}

export interface Item {
  id: string;
  businessId: string;
  name: string;
  nameUrdu: string;
  category: string;
  unit: string; // '40KG (من)', 'KG', 'Bags'
  defaultRate: number; // Rs./40KG
  openingFirstWeight: number; // KG
  openingBags: number;
  openingValue: number; // PKR
  reorderLevelBags?: number;
}

export interface Godown {
  id: string;
  businessId: string;
  name: string;
  nameUrdu: string;
  location: string;
  capacityBags?: number;
}

export interface ExpenseMaster {
  id: string;
  businessId: string;
  name: string;
  nameUrdu: string;
  type: ExpenseCategoryType;
  defaultAmount: number;
  isDefaultApplicable?: boolean;
}

export interface BardanaMaster {
  id: string;
  businessId: string;
  name: string;
  nameUrdu: string;
  category: 'Jute' | 'PP' | 'Cotton' | 'Other';
  openingBags: number;
  remarks?: string;
}

export interface BardanaMovement {
  id: string;
  businessId: string;
  date: string;
  voucherNo: string;
  type: 'PURCHASE_INWARD' | 'SALE_OUTWARD' | 'MANUAL_ISSUE' | 'MANUAL_RETURN';
  partyId?: string;
  partyName?: string;
  partyNameUrdu?: string;
  godownId?: string;
  godownName?: string;
  bardanaId: string;
  bardanaName: string;
  bardanaNameUrdu?: string;
  inwardBags: number;
  outwardBags: number;
  balanceAfter?: number;
  remarks?: string;
}

export interface VoucherExpenseItem {
  expenseId: string;
  name: string;
  nameUrdu: string;
  amount: number;
  type: ExpenseCategoryType;
  allocatedAmount?: number;
}

export interface AuditEntry {
  timestamp: string;
  userId: string;
  userName: string;
  action: 'CREATE' | 'EDIT' | 'APPROVE' | 'CANCEL' | 'SOFT_DELETE' | 'PRINT' | 'EXPORT' | 'WHATSAPP';
  details: string;
  detailsUrdu?: string;
  deviceInfo?: string;
  changes?: {
    field: string;
    oldValue: any;
    newValue: any;
  }[];
}

export type DocumentAttachmentType = 
  | 'weight_slip'       // کانٹا پرچی / وزن کی رسید
  | 'expenses_bill'     // اخراجات / مزدوری / کرایہ کا بل
  | 'sales_bill'        // فروخت کا بل / خریدار کی پرچی
  | 'gate_pass'         // گیٹ پاس / بلٹی رسید
  | 'other';            // دیگر دستاویز

export interface DocumentAttachment {
  id: string;
  name: string;
  type: DocumentAttachmentType;
  fileType: string; // 'image/jpeg', 'image/png', 'application/pdf', etc.
  dataUrl: string; // base64 data url for 100% offline persistence and instant preview
  sizeBytes: number;
  uploadedAt: string;
  uploadedBy?: string;
  notes?: string;
}

export interface Voucher {
  id: string;
  voucherNo: string;
  businessId: string;
  type: VoucherType;
  date: string; // YYYY-MM-DD
  time: string;
  partyId: string;
  partyName: string;
  partyNameUrdu: string;
  partyPhone?: string;
  partyWhatsapp?: string;
  itemId: string;
  itemName: string;
  itemNameUrdu: string;
  godownId: string;
  godownName: string;
  toGodownId?: string; // For transfers
  toGodownName?: string;
  
  // Weight Breakdown (LOCKED SYSTEM)
  grossWeight: number; // KG
  tareWeight: number; // KG
  firstWeight: number; // KG = Gross - Tare (Costing basis)
  bardanaKg: number; // KG
  moistureKg: number; // KG
  otherDeductionsKg: number; // KG
  netWeight: number; // KG = FirstWeight - (Moisture + Other)
  bags: number; // Count only (Bardana Register Inward/Outward - no impact on weight)
  bardanaId?: string; // Selected Bardana Master Type
  bardanaName?: string;
  
  ratePer40Kg: number; // PKR per 40KG
  baseAmount: number; // Purchase or Sales Value = (netWeight / 40) * ratePer40Kg
  expenses: VoucherExpenseItem[];
  totalExpenses: number;
  totalAmount: number; // Total Value (baseAmount + totalExpenses for purchase)
  
  avgCostPer40Kg: number; // Strictly: Average purchase or sales cost = purchase or sales value / first weight * 40
  costPer40Kg: number; // Average Cost/Rate = (baseAmount / firstWeight) * 40
  landedCostPer40Kg?: number; // Landed Cost with expenses = (totalAmount / firstWeight) * 40
  
  status: VoucherStatus;
  approvedBy?: string;
  approvedAt?: string;
  cancelledBy?: string;
  cancelledAt?: string;
  cancelReason?: string;
  isDeleted?: boolean;
  deleteReason?: string;
  deletedAt?: string;
  deletedBy?: string;
  
  vehicleNo?: string;
  biltyNo?: string;
  remarks?: string;
  auditTrail: AuditEntry[];
  attachments?: DocumentAttachment[];
}


export interface MenuRightItem {
  view: boolean;
  add: boolean;
  edit: boolean;
  delete: boolean;
  print: boolean;
  approve: boolean;
  export: boolean;
}

export type MenuKey = 
  | 'dashboard'
  | 'action_centre'
  | 'purchase'
  | 'sales'
  | 'transfer'
  | 'expense'
  | 'party'
  | 'item'
  | 'godown'
  | 'bardana'
  | 'reports'
  | 'pnl'
  | 'backup'
  | 'settings';

export interface UserAccount {
  id: string;
  name: string;
  username?: string; // 'admin', etc.
  mobile: string;
  email: string;
  role: UserRole;
  businessAccess: string[]; // business IDs
  isActive: boolean;
  avatarUrl?: string;
  pin?: string; // 4-digit quick PIN for weighbridge terminal & login
  password?: string; // Standard login password
  rights: Record<MenuKey, MenuRightItem>;
  lastLogin?: string;
  ipAddress?: string;
}

export interface AppSettings {
  // General & Business Profile
  marketYardLicenseNo: string;
  defaultCurrency: string;
  currencySymbol: string;
  dateFormat: string;
  fiscalYearStart: string;
  timezone: string;
  
  // Weighbridge & First Weight Costing Rules (LOCKED SYSTEM)
  enforceFirstWeightRule: boolean;
  defaultTareAllowanceKg: number;
  moistureStandardDeductionKg: number;
  autoRoundNetWeight: boolean;
  purchaseVoucherPrefix: string;
  salesVoucherPrefix: string;
  transferVoucherPrefix: string;
  bardanaVoucherPrefix: string;

  // Bardana & Bag Tracker Settings
  defaultBardanaId: string;
  standardJuteWeightKg: number;
  standardPPWeightKg: number;
  disallowNegativeBardanaStock: boolean;
  warnOnBagDiscrepancy: boolean;

  // Dual P&L & Financial Accounting
  defaultCommissionRate: number; // e.g. 2%
  defaultMarketFeeRate: number; // e.g. 0.5%
  defaultExpenseAllocation: AllocationMethod;
  dualPnlFormat: 'dual' | 'busy' | 'quickbooks';

  // Invoice & Thermal Printing Customization
  defaultPrintDesign: 'a4-standard' | 'a4-modern' | 'thermal-80mm';
  bismillahHeader: boolean;
  jazaakAllahFooter: boolean;
  showNtnOnPrint: boolean;
  showBiltyOnPrint: boolean;
  showVehicleOnPrint: boolean;
  showUrduVoucherTitle: boolean;
  customPrintNote: string;
  customPrintNoteUrdu: string;

  // Business-Provided Drive & Local Storage Vault (No Google Web Cloud Dependency)
  googleDriveEnabled: boolean;
  googleDriveFolder: string;
  businessDriveFolderPath?: string; // e.g. "C:\Google Drive\Mandi_Backups" or "D:\Mandi_Storage"
  businessStorageMode?: 'local_vault' | 'business_drive_folder' | 'hybrid';
  storageProviderName?: string; // e.g. "Business Provided Drive (100% Local / Self-Hosted)"
  autoCloudBackup: 'manual' | 'daily' | 'hourly' | 'on_voucher';
  lastCloudBackupTime?: string;
  lastLocalBackupTime?: string;
  cloudBackupFormat: 'json' | 'excel' | 'both';
  googleDriveConnectedEmail?: string;
  localMaxSnapshots: number;

  // Security, Sessions & Terminal Access
  sessionTimeoutMinutes: number;
  requirePinForVoucherApproval: boolean;
  requirePinForDelete: boolean;
  enableAuditLogging: boolean;

  // Communication & WhatsApp Gateway Templates
  whatsappPurchaseTemplate: string;
  whatsappSalesTemplate: string;
  whatsappGatePassTemplate: string;
}

export interface LocalDriveSnapshot {
  id: string;
  timestamp: string;
  name: string;
  sizeBytes: number;
  totalVouchers: number;
  totalWeightKg: number;
  businessId: string;
  businessName: string;
  createdByName: string;
  isAutoSnapshot?: boolean;
  data: string; // JSON string payload
}

export interface GoogleDriveFileItem {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  createdTime: string;
  modifiedTime: string;
  webViewLink?: string;
}


export interface StockClosingSummary {
  itemId: string;
  itemName: string;
  itemNameUrdu: string;
  
  // Opening Details
  openingFirstWeight: number;
  openingBags: number;
  openingValue: number;
  openingAvgCostPer40Kg: number;

  // Purchased Details (Full Purchase Columns)
  purchaseGrossWeight: number;
  purchaseTareWeight: number;
  purchaseFirstWeight: number;
  purchaseBardanaKg: number;
  purchaseMoistureKg: number;
  purchaseOtherDeductionsKg: number;
  purchaseDeductionsKg: number;
  purchaseNetWeight: number;
  purchaseBags: number;
  purchaseAvgRatePer40Kg: number;
  purchaseBaseValue: number; // Purchase Value on Net Weight = (Net Wt / 40) * Rate
  purchaseExpenses: number;
  purchaseTotalAmount: number; // Purchase Value + Expenses
  purchaseAvgCostPer40Kg: number; // Strictly: Average Purchase Cost = (Purchase Value / First Weight) * 40
  purchaseLandedCostPer40Kg: number; // Landed Cost = (Total Amount / First Weight) * 40

  // Sold Details
  soldFirstWeight: number;
  soldNetWeight: number;
  soldBags: number;
  soldValue: number;
  soldAvgRatePer40Kg: number;

  // Closing Details
  closingFirstWeight: number;
  closingBags: number;
  closingValue: number;
  avgCostPer40Kg: number; // Closing Weighted Avg Purchase Cost = (Opening Value + Purchase Value) / (Opening First Wt + Purchase First Wt) * 40
}

export interface MonthClosingPartySummary {
  partyId: string;
  partyName: string;
  partyNameUrdu: string;
  type: 'Supplier' | 'Customer' | 'Both';
  phone?: string;
  openingBalance: number; // PKR at start of this month
  totalDebits: number;    // Purchases or payments in this month
  totalCredits: number;   // Sales or receipts in this month
  closingBalance: number; // Final balance carried forward to next month
}

export interface MonthClosingStockSummary {
  itemId: string;
  itemName: string;
  itemNameUrdu: string;
  openingFirstWeight: number; // KG
  openingBags: number;
  openingValue: number;       // PKR
  purchasedFirstWeight: number;
  purchasedNetWeight: number;
  purchasedBags: number;
  purchasedValue: number;
  soldFirstWeight: number;
  soldNetWeight: number;
  soldBags: number;
  soldValue: number;
  closingFirstWeight: number; // KG
  closingBags: number;
  closingValue: number;       // PKR strictly on First-Weight weighted avg cost
  avgCostPer40Kg: number;     // Rs./40KG
}

export interface MonthClosingBardanaSummary {
  bardanaId: string;
  bardanaName: string;
  bardanaNameUrdu?: string;
  openingBags: number;
  inwardBags: number;
  outwardBags: number;
  closingBags: number;
}

export interface MonthClosingPnLSummary {
  purchaseValue: number;
  salesValue: number;
  costOfGoodsSold: number;
  grossTradingProfit: number;
  totalDirectExpenses: number;
  totalIndirectExpenses: number;
  totalExpenses: number;
  netProfit: number;
}

export interface MonthClosingRecord {
  id: string;
  businessId: string;
  monthKey: string;           // e.g. "2026-09"
  monthName: string;          // e.g. "September 2026"
  monthNameUrdu: string;      // e.g. "ستمبر ۲۰۲۶"
  startDate: string;          // "2026-09-01" or "2026-08-01"
  endDate: string;            // "2026-09-30"
  closingType?: 'single_month' | 'custom_range'; // single month or multi-month range like 01 Aug 2026 to 30 Sep 2026
  closedAt: string;           // ISO string
  closedBy: string;           // User Name / ID
  isLocked: boolean;          // true = vouchers locked against modification
  notes?: string;
  
  // High-level metrics for rapid KPI cards
  totalVouchersCount: number;
  totalPurchaseWeightKg: number;
  totalPurchaseAmount: number;
  totalSalesWeightKg: number;
  totalSalesAmount: number;
  totalExpensesAmount: number;
  netMandiProfit: number;
  
  // Isolated Month-Wise Data Stores
  vouchers: Voucher[];
  partySummaries: MonthClosingPartySummary[];
  stockSummaries: MonthClosingStockSummary[];
  bardanaSummaries: MonthClosingBardanaSummary[];
  pnlSummary: MonthClosingPnLSummary;
  expenses: VoucherExpenseItem[];
}
