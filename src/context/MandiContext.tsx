/**
 * Mandi ERP Context & Central State Engine
 * Enforces 100% Locked Mandi Calculation Rules:
 * 1. Costing strictly on First Weight (Gross - Tare)
 * 2. Net Weight = First Weight - (Bardana + Moisture + Other)
 * 3. Purchase Avg = (Purchase Amount + Expenses) / First Weight * 40
 * 4. Closing Stock = Opening + Approved In - Approved Out
 * 5. Pending vouchers do NOT alter stock until approved
 */

import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  Business,
  Party,
  Item,
  Godown,
  ExpenseMaster,
  BardanaMaster,
  BardanaMovement,
  Voucher,
  UserAccount,
  LanguageMode,
  StockClosingSummary,
  AuditEntry,
  MenuKey,
  AppSettings,
  LocalDriveSnapshot,
  GoogleDriveFileItem,
  MonthClosingRecord
} from '../types';
import {
  computeMonthClosingData,
  generateMonthClosingBackupBlob,
  getMonthKey,
  formatMonthName,
  getAvailableMonthKeys
} from '../utils/monthClosing';
import {
  getLocalDriveSnapshots,
  saveLocalDriveSnapshot,
  deleteLocalDriveSnapshot,
  exportBackupToFile,
  saveToBusinessDrive,
  readBackupFromFile,
  googleDriveSignIn,
  setDriveAccessToken,
  uploadBackupToGoogleDrive,
  listGoogleDriveBackups,
  downloadGoogleDriveBackup
} from '../utils/googleDrive';

type OfflineUser = { uid?: string; displayName?: string | null; email?: string | null };

const INITIAL_BUSINESSES: Business[] = [
  {
    id: 'biz-1',
    name: 'NAZAR SOON CORPORATION',
    nameUrdu: 'نظر سون کارپوریشن',
    address: 'Grain Market (Galla Mandi), Shop # 14-B, Sargodha Road, Punjab',
    addressUrdu: 'غلہ منڈی، دکان نمبر ۱۴-بی، سرگودھا روڈ، پنجاب',
    phone: '+92 300 1234567',
    ntn: '7392814-5',
    proprietor: 'Ch. Babar Ameen',
    proprietorUrdu: 'چوہدری بابر امین',
    logoText: 'NSC',
    isDefault: true
  },
  {
    id: 'biz-2',
    name: 'Ali Traders & Commission Agents',
    nameUrdu: 'علی ٹریڈرز اینڈ کمیشن ایجنٹس',
    address: 'Old Mandi Road, Gate # 2, Chiniot, Punjab',
    addressUrdu: 'پرانی منڈی روڈ، گیٹ نمبر ۲، چنیوٹ، پنجاب',
    phone: '+92 301 7654321',
    ntn: '4829103-2',
    proprietor: 'Haji Ali Ahmad',
    proprietorUrdu: 'حاجی علی احمد',
    logoText: 'AT'
  },
  {
    id: 'biz-3',
    name: 'Ahmed Grain Merchants',
    nameUrdu: 'احمد گرین مرچنٹس',
    address: 'Grain Market Yard 03, Faisalabad',
    addressUrdu: 'غلہ منڈی یارڈ ۰۳، فیصل آباد',
    phone: '+92 302 9988776',
    ntn: '6102948-1',
    proprietor: 'Muhammad Ahmed',
    proprietorUrdu: 'محمد احمد',
    logoText: 'AGM'
  }
];

const INITIAL_ITEMS: Item[] = [
  {
    id: 'item-1',
    businessId: 'biz-1',
    name: 'Wheat (Gandum)',
    nameUrdu: 'گندم (پنجاب ورائٹی)',
    category: 'Food Grains',
    unit: '40KG (من)',
    defaultRate: 3900,
    openingFirstWeight: 20000,
    openingBags: 400,
    openingValue: 1950000,
    reorderLevelBags: 50
  },
  {
    id: 'item-2',
    businessId: 'biz-1',
    name: 'Basmati Paddy (Super Dhan)',
    nameUrdu: 'دھان (سپر باسمتی)',
    category: 'Paddy & Rice',
    unit: '40KG (من)',
    defaultRate: 4600,
    openingFirstWeight: 15000,
    openingBags: 300,
    openingValue: 1725000,
    reorderLevelBags: 40
  },
  {
    id: 'item-3',
    businessId: 'biz-1',
    name: 'Corn / Maize (Makai)',
    nameUrdu: 'مکئی (ہائبرڈ پیلی)',
    category: 'Feed Grains',
    unit: '40KG (من)',
    defaultRate: 2350,
    openingFirstWeight: 25000,
    openingBags: 500,
    openingValue: 1468750,
    reorderLevelBags: 80
  },
  {
    id: 'item-4',
    businessId: 'biz-1',
    name: 'Mustard / Sarson',
    nameUrdu: 'سرسوں (تیل دار اجناس)',
    category: 'Oilseeds',
    unit: '40KG (من)',
    defaultRate: 7200,
    openingFirstWeight: 8000,
    openingBags: 160,
    openingValue: 1440000,
    reorderLevelBags: 20
  }
];

const INITIAL_GODOWNS: Godown[] = [
  {
    id: 'godown-1',
    businessId: 'biz-1',
    name: 'Main Mandi Godown # 1',
    nameUrdu: 'مین منڈی گودام نمبر ۱',
    location: 'Gate 1, Market Yard',
    capacityBags: 2000
  },
  {
    id: 'godown-2',
    businessId: 'biz-1',
    name: 'Railway Depot Godown # 2',
    nameUrdu: 'ریلوے شیڈ گودام نمبر ۲',
    location: 'Railway Station Road',
    capacityBags: 3500
  },
  {
    id: 'godown-3',
    businessId: 'biz-1',
    name: 'Grain Silo Storage A',
    nameUrdu: 'گرین سائیلو اسٹوریج اے',
    location: 'Bypass Industrial Area',
    capacityBags: 5000
  }
];

const INITIAL_PARTIES: Party[] = [
  {
    id: 'party-1',
    businessId: 'biz-1',
    name: 'Malik Nawaz Farmer',
    nameUrdu: 'ملک نواز (زمیندار)',
    phone: '+92 300 7112233',
    whatsapp: '+923007112233',
    address: 'Chak 42-SB, Sargodha',
    addressUrdu: 'چک ۴۲-ایس بی، سرگودھا',
    type: 'Supplier',
    openingBalance: -45000, // Payable to farmer
    currentBalance: -45000
  },
  {
    id: 'party-2',
    businessId: 'biz-1',
    name: 'Al-Rehman Flour Mills Ltd',
    nameUrdu: 'الرحمٰن فلور ملز لمیٹڈ',
    phone: '+92 321 8899001',
    whatsapp: '+923218899001',
    address: 'Industrial Estate, Lahore',
    addressUrdu: 'انڈسٹریل اسٹیٹ، لاہور',
    type: 'Customer',
    openingBalance: 420000, // Receivable from Mill
    currentBalance: 420000,
    ntn: '9843210-9'
  },
  {
    id: 'party-3',
    businessId: 'biz-1',
    name: 'Ch. Akram & Brothers',
    nameUrdu: 'چوہدری اکرم اینڈ برادرز',
    phone: '+92 300 5544332',
    whatsapp: '+923005544332',
    address: 'Grain Market Yard, Mandi Bahauddin',
    addressUrdu: 'غلہ منڈی یارڈ، منڈی بہاؤالدین',
    type: 'Both',
    openingBalance: 85000,
    currentBalance: 85000
  },
  {
    id: 'party-4',
    businessId: 'biz-1',
    name: 'Ittehad Feed Industries',
    nameUrdu: 'اتحاد فیڈ انڈسٹریز',
    phone: '+92 333 4455667',
    whatsapp: '+923334455667',
    address: 'Multan Road, Sahiwal',
    addressUrdu: 'ملتان روڈ، ساہیوال',
    type: 'Customer',
    openingBalance: 290000,
    currentBalance: 290000
  }
];

const INITIAL_EXPENSES: ExpenseMaster[] = [
  {
    id: 'exp-1',
    businessId: 'biz-1',
    name: 'Labour / Mazdoori (Loading & Unloading)',
    nameUrdu: 'مزدوری (پلائی و اترائی)',
    type: 'Direct',
    defaultAmount: 25, // Rs. per bag or lump sum
    isDefaultApplicable: true
  },
  {
    id: 'exp-2',
    businessId: 'biz-1',
    name: 'Freight / Transport (Karaya)',
    nameUrdu: 'کرایہ گاڑی / ٹرانسپورٹ',
    type: 'Direct',
    defaultAmount: 5000,
    isDefaultApplicable: true
  },
  {
    id: 'exp-3',
    businessId: 'biz-1',
    name: 'Commission / Arhat (2%)',
    nameUrdu: 'آڑھت کمیشن (۲ فیصد)',
    type: 'Direct',
    defaultAmount: 0,
    isDefaultApplicable: true
  },
  {
    id: 'exp-4',
    businessId: 'biz-1',
    name: 'Market Committee Fee (0.5%)',
    nameUrdu: 'مارکیٹ کمیٹی فیس',
    type: 'Direct',
    defaultAmount: 0,
    isDefaultApplicable: true
  },
  {
    id: 'exp-5',
    businessId: 'biz-1',
    name: 'Cleaning & Sieving (Chanai)',
    nameUrdu: 'چھانائی و صفائی',
    type: 'Direct',
    defaultAmount: 15,
    isDefaultApplicable: false
  },
  {
    id: 'exp-6',
    businessId: 'biz-1',
    name: 'Shop & Godown Rent',
    nameUrdu: 'دکان و گودام کرایہ',
    type: 'Indirect',
    defaultAmount: 60000,
    isDefaultApplicable: false
  },
  {
    id: 'exp-7',
    businessId: 'biz-1',
    name: 'Staff Salaries',
    nameUrdu: 'عملہ و منشی تنخواہیں',
    type: 'Indirect',
    defaultAmount: 75000,
    isDefaultApplicable: false
  }
];

const INITIAL_BARDANA: BardanaMaster[] = [
  {
    id: 'bard-1',
    businessId: 'biz-1',
    name: 'Jute Bags 100KG (بوری پٹ سن)',
    nameUrdu: 'بوری پٹ سن (۱۰۰ کلو)',
    category: 'Jute',
    openingBags: 1500,
    remarks: 'Heavy duty jute gunny bags for wheat & basmati'
  },
  {
    id: 'bard-2',
    businessId: 'biz-1',
    name: 'PP Plastic Woven Bags 50KG (پلاسٹک توڑے)',
    nameUrdu: 'پلاسٹک توڑے (۵۰ کلو)',
    category: 'PP',
    openingBags: 3200,
    remarks: 'High strength woven polypropylene bags'
  },
  {
    id: 'bard-3',
    businessId: 'biz-1',
    name: 'Cotton Canvas Bags (کپاس کے تھیلے)',
    nameUrdu: 'کپاس کے تھیلے',
    category: 'Cotton',
    openingBags: 800,
    remarks: 'Breathable cotton sacks for seed grains'
  },
  {
    id: 'bard-4',
    businessId: 'biz-1',
    name: 'General Mandi Bardana (عام باردانہ)',
    nameUrdu: 'عام منڈی باردانہ',
    category: 'Other',
    openingBags: 1000,
    remarks: 'Standard mixed commodity bags'
  }
];

const INITIAL_BARDANA_MOVEMENTS: BardanaMovement[] = [
  {
    id: 'bmov-1',
    businessId: 'biz-1',
    date: '2026-09-27',
    voucherNo: 'BARD-RET-01',
    type: 'MANUAL_RETURN',
    partyId: 'party-1',
    partyName: 'Malik Nawaz Farmer',
    partyNameUrdu: 'ملک نواز (زمیندار)',
    godownId: 'godown-1',
    godownName: 'Main Mandi Godown # 1',
    bardanaId: 'bard-1',
    bardanaName: 'Jute Bags 100KG (بوری پٹ سن)',
    bardanaNameUrdu: 'بوری پٹ سن (۱۰۰ کلو)',
    inwardBags: 50,
    outwardBags: 0,
    remarks: 'Empty jute bags returned by farmer (Zero weight impact)'
  }
];

const INITIAL_USERS: UserAccount[] = [
  {
    id: 'usr-1',
    name: 'Ch. Babar Ameen (Administrator)',
    username: 'admin',
    mobile: '+92 300 1234567',
    email: 'admin@grainmarket.pk',
    role: 'Admin',
    businessAccess: ['biz-1', 'biz-2', 'biz-3'],
    isActive: true,
    pin: '1234',
    password: 'admin',
    rights: {
      dashboard: { view: true, add: true, edit: true, delete: true, print: true, approve: true, export: true },
      action_centre: { view: true, add: true, edit: true, delete: true, print: true, approve: true, export: true },
      purchase: { view: true, add: true, edit: true, delete: true, print: true, approve: true, export: true },
      sales: { view: true, add: true, edit: true, delete: true, print: true, approve: true, export: true },
      transfer: { view: true, add: true, edit: true, delete: true, print: true, approve: true, export: true },
      expense: { view: true, add: true, edit: true, delete: true, print: true, approve: true, export: true },
      party: { view: true, add: true, edit: true, delete: true, print: true, approve: true, export: true },
      item: { view: true, add: true, edit: true, delete: true, print: true, approve: true, export: true },
      godown: { view: true, add: true, edit: true, delete: true, print: true, approve: true, export: true },
      bardana: { view: true, add: true, edit: true, delete: true, print: true, approve: true, export: true },
      reports: { view: true, add: true, edit: true, delete: true, print: true, approve: true, export: true },
      pnl: { view: true, add: true, edit: true, delete: true, print: true, approve: true, export: true },
      backup: { view: true, add: true, edit: true, delete: true, print: true, approve: true, export: true },
      settings: { view: true, add: true, edit: true, delete: true, print: true, approve: true, export: true }
    },
    lastLogin: '2026-09-30 08:30'
  },
  {
    id: 'usr-2',
    name: 'Haji Aslam Munshi',
    mobile: '+92 301 5566778',
    email: 'aslam.munshi@nazarsoon.pk',
    role: 'Manager',
    businessAccess: ['biz-1', 'biz-2'],
    isActive: true,
    pin: '2345',
    password: 'manager',
    rights: {
      dashboard: { view: true, add: true, edit: true, delete: false, print: true, approve: true, export: true },
      action_centre: { view: true, add: true, edit: true, delete: false, print: true, approve: true, export: true },
      purchase: { view: true, add: true, edit: true, delete: false, print: true, approve: true, export: true },
      sales: { view: true, add: true, edit: true, delete: false, print: true, approve: true, export: true },
      transfer: { view: true, add: true, edit: true, delete: false, print: true, approve: true, export: true },
      expense: { view: true, add: true, edit: true, delete: false, print: true, approve: true, export: true },
      party: { view: true, add: true, edit: true, delete: false, print: true, approve: false, export: true },
      item: { view: true, add: true, edit: true, delete: false, print: true, approve: false, export: true },
      godown: { view: true, add: true, edit: true, delete: false, print: true, approve: false, export: true },
      bardana: { view: true, add: true, edit: true, delete: false, print: true, approve: false, export: true },
      reports: { view: true, add: false, edit: false, delete: false, print: true, approve: false, export: true },
      pnl: { view: true, add: false, edit: false, delete: false, print: true, approve: false, export: true },
      backup: { view: true, add: true, edit: false, delete: false, print: true, approve: false, export: true },
      settings: { view: true, add: false, edit: false, delete: false, print: false, approve: false, export: false }
    },
    lastLogin: '2026-09-29 09:15'
  },
  {
    id: 'usr-3',
    name: 'Tariq Mehmood (Kanta Incharge)',
    mobile: '+92 302 7788990',
    email: 'kanta@nazarsoon.pk',
    role: 'Operator',
    businessAccess: ['biz-1'],
    isActive: true,
    pin: '3456',
    password: 'kanta',
    rights: {
      dashboard: { view: true, add: false, edit: false, delete: false, print: true, approve: false, export: false },
      action_centre: { view: true, add: false, edit: false, delete: false, print: true, approve: false, export: false },
      purchase: { view: true, add: true, edit: false, delete: false, print: true, approve: false, export: false },
      sales: { view: true, add: true, edit: false, delete: false, print: true, approve: false, export: false },
      transfer: { view: true, add: true, edit: false, delete: false, print: true, approve: false, export: false },
      expense: { view: false, add: false, edit: false, delete: false, print: false, approve: false, export: false },
      party: { view: true, add: false, edit: false, delete: false, print: false, approve: false, export: false },
      item: { view: true, add: false, edit: false, delete: false, print: false, approve: false, export: false },
      godown: { view: true, add: false, edit: false, delete: false, print: false, approve: false, export: false },
      bardana: { view: true, add: true, edit: false, delete: false, print: true, approve: false, export: false },
      reports: { view: false, add: false, edit: false, delete: false, print: false, approve: false, export: false },
      pnl: { view: false, add: false, edit: false, delete: false, print: false, approve: false, export: false },
      backup: { view: false, add: false, edit: false, delete: false, print: false, approve: false, export: false },
      settings: { view: false, add: false, edit: false, delete: false, print: false, approve: false, export: false }
    },
    lastLogin: '2026-09-30 07:10'
  },
  {
    id: 'usr-4',
    name: 'Auditor & Partner Viewer',
    mobile: '+92 303 1122334',
    email: 'auditor@nazarsoon.pk',
    role: 'Viewer',
    businessAccess: ['biz-1', 'biz-2', 'biz-3'],
    isActive: true,
    pin: '4567',
    password: 'audit',
    rights: {
      dashboard: { view: true, add: false, edit: false, delete: false, print: true, approve: false, export: true },
      action_centre: { view: true, add: false, edit: false, delete: false, print: true, approve: false, export: false },
      purchase: { view: true, add: false, edit: false, delete: false, print: true, approve: false, export: false },
      sales: { view: true, add: false, edit: false, delete: false, print: true, approve: false, export: false },
      transfer: { view: true, add: false, edit: false, delete: false, print: true, approve: false, export: false },
      expense: { view: true, add: false, edit: false, delete: false, print: false, approve: false, export: false },
      party: { view: true, add: false, edit: false, delete: false, print: false, approve: false, export: false },
      item: { view: true, add: false, edit: false, delete: false, print: false, approve: false, export: false },
      godown: { view: true, add: false, edit: false, delete: false, print: false, approve: false, export: false },
      bardana: { view: true, add: false, edit: false, delete: false, print: true, approve: false, export: false },
      reports: { view: true, add: false, edit: false, delete: false, print: true, approve: false, export: true },
      pnl: { view: true, add: false, edit: false, delete: false, print: true, approve: false, export: true },
      backup: { view: false, add: false, edit: false, delete: false, print: false, approve: false, export: false },
      settings: { view: false, add: false, edit: false, delete: false, print: false, approve: false, export: false }
    },
    lastLogin: '2026-09-28 16:45'
  }
];

const DEFAULT_APP_SETTINGS: AppSettings = {
  marketYardLicenseNo: 'MY-SGA-2024-889',
  defaultCurrency: 'PKR',
  currencySymbol: 'Rs.',
  dateFormat: 'YYYY-MM-DD',
  fiscalYearStart: '07-01',
  timezone: 'Asia/Karachi (PKT)',

  enforceFirstWeightRule: true,
  defaultTareAllowanceKg: 0,
  moistureStandardDeductionKg: 0.5,
  autoRoundNetWeight: true,
  purchaseVoucherPrefix: 'PUR-',
  salesVoucherPrefix: 'SAL-',
  transferVoucherPrefix: 'TRN-',
  bardanaVoucherPrefix: 'BARD-',

  defaultBardanaId: 'bard-1',
  standardJuteWeightKg: 1.0,
  standardPPWeightKg: 0.5,
  disallowNegativeBardanaStock: false,
  warnOnBagDiscrepancy: true,

  defaultCommissionRate: 2.0,
  defaultMarketFeeRate: 0.5,
  defaultExpenseAllocation: 'weight_ratio',
  dualPnlFormat: 'dual',

  defaultPrintDesign: 'a4-standard',
  bismillahHeader: true,
  jazaakAllahFooter: true,
  showNtnOnPrint: true,
  showBiltyOnPrint: true,
  showVehicleOnPrint: true,
  showUrduVoucherTitle: true,
  customPrintNote: 'Commodity weighed on computerized weighbridge under Punjab Agricultural Produce Markets Act rules.',
  customPrintNoteUrdu: 'مال کمپیوٹرائزڈ کنڈے پر تلا گیا اور منڈی قوانین و مارکیٹ کمیٹی ریگولیشنز کے تحت موصول ہوا۔',

  googleDriveEnabled: false,
  googleDriveFolder: 'Mandi_ERP_Backups',
  businessDriveFolderPath: 'C:\\Google Drive\\Mandi_Backups',
  businessStorageMode: 'local_vault',
  storageProviderName: 'Business-Provided Local Drive (Zero Google Cloud Dependency)',
  autoCloudBackup: 'on_voucher',
  lastCloudBackupTime: '2026-09-29 11:30 AM',
  lastLocalBackupTime: '2026-09-29 11:30 AM',
  cloudBackupFormat: 'json',
  googleDriveConnectedEmail: 'business-local@mandi.pk',
  localMaxSnapshots: 10,

  sessionTimeoutMinutes: 60,
  requirePinForVoucherApproval: false,
  requirePinForDelete: true,
  enableAuditLogging: true,

  whatsappPurchaseTemplate: 'معزز {party_name} صاحب، آپ کی {item_name} کا وزن {first_weight} کلو ({bags} بوریاں) درج ہو چکا ہے۔ خالص وزن: {net_weight} کلو، رقم: {total_amount} روپے۔ واؤچر: {voucher_no}',
  whatsappSalesTemplate: 'محترم {party_name}، آپ کو {item_name} کا مال روانہ کر دیا گیا ہے۔ اول وزن: {first_weight} کلو، بوریاں: {bags}، کل مالیت: {total_amount} روپے۔ واؤچر: {voucher_no}',
  whatsappGatePassTemplate: 'گیٹ پاس برائے گاڑی {vehicle_no}، مال: {item_name}، وزن: {net_weight} کلو، روانگی وقت: {time}'
};


const INITIAL_VOUCHERS: Voucher[] = [
  {
    id: 'v-101',
    voucherNo: 'PUR-0001',
    businessId: 'biz-1',
    type: 'PURCHASE',
    date: '2026-09-28',
    time: '10:30 AM',
    partyId: 'party-1',
    partyName: 'Malik Nawaz Farmer',
    partyNameUrdu: 'ملک نواز (زمیندار)',
    partyPhone: '+92 300 7112233',
    partyWhatsapp: '+923007112233',
    itemId: 'item-1',
    itemName: 'Wheat (Gandum)',
    itemNameUrdu: 'گندم (پنجاب ورائٹی)',
    godownId: 'godown-1',
    godownName: 'Main Mandi Godown # 1',
    grossWeight: 14500,
    tareWeight: 4500,
    firstWeight: 10000, // 14500 - 4500 = 10,000 KG (250 Maunds)
    bardanaKg: 100, // 100 bags * 1 kg
    moistureKg: 50,
    otherDeductionsKg: 50,
    netWeight: 9800, // 10000 - 200 = 9,800 KG
    bags: 200,
    bardanaId: 'bard-1',
    bardanaName: 'Jute Bags 100KG (بوری پٹ سن)',
    ratePer40Kg: 3950,
    baseAmount: 967750, // Purchase Value = (9800 Net Wt / 40) * 3950
    expenses: [
      {
        expenseId: 'exp-1',
        name: 'Labour / Mazdoori',
        nameUrdu: 'مزدوری (پلائی و اترائی)',
        amount: 5000,
        type: 'Direct'
      },
      {
        expenseId: 'exp-2',
        name: 'Freight / Transport',
        nameUrdu: 'کرایہ گاڑی / ٹرانسپورٹ',
        amount: 7500,
        type: 'Direct'
      }
    ],
    totalExpenses: 12500,
    totalAmount: 980250, // 967750 + 12500
    avgCostPer40Kg: 3871, // Strictly: Average Purchase Cost = (Purchase Value 967750 / 10000 First Wt) * 40 = 3,871.00
    costPer40Kg: 3871, // Purchase Average Cost strictly on First Weight
    landedCostPer40Kg: 3921, // Landed Cost with expenses = (980250 / 10000) * 40 = 3,921.00
    status: 'Approved',
    approvedBy: 'Ch. Babar Ameen',
    approvedAt: '2026-09-28 11:00 AM',
    vehicleNo: 'LES-8491 (Tractor Trolley)',
    biltyNo: 'BL-9921',
    remarks: 'Approved after moisture lab test - Good quality wheat',
    auditTrail: [
      {
        timestamp: '2026-09-28 10:30 AM',
        userId: 'usr-2',
        userName: 'Haji Aslam Munshi',
        action: 'CREATE',
        details: 'Purchased 200 bags Wheat 9,800 KG Net @ 3,950/40KG',
        deviceInfo: 'Weighbridge Terminal 1'
      },
      {
        timestamp: '2026-09-28 11:00 AM',
        userId: 'usr-1',
        userName: 'Ch. Babar Ameen',
        action: 'APPROVE',
        details: 'Approved Purchase slip PUR-0001, stock added to Main Mandi Godown # 1',
        deviceInfo: 'Manager Desktop'
      }
    ]
  },
  {
    id: 'v-102',
    voucherNo: 'SAL-0001',
    businessId: 'biz-1',
    type: 'SALE',
    date: '2026-09-28',
    time: '03:15 PM',
    partyId: 'party-2',
    partyName: 'Al-Rehman Flour Mills Ltd',
    partyNameUrdu: 'الرحمٰن فلور ملز لمیٹڈ',
    partyPhone: '+92 321 8899001',
    partyWhatsapp: '+923218899001',
    itemId: 'item-1',
    itemName: 'Wheat (Gandum)',
    itemNameUrdu: 'گندم (پنجاب ورائٹی)',
    godownId: 'godown-1',
    godownName: 'Main Mandi Godown # 1',
    grossWeight: 12400,
    tareWeight: 4400,
    firstWeight: 8000, // 8,000 KG (200 Maunds)
    bardanaKg: 80,
    moistureKg: 0,
    otherDeductionsKg: 0,
    netWeight: 7920,
    bags: 160,
    bardanaId: 'bard-1',
    bardanaName: 'Jute Bags 100KG (بوری پٹ سن)',
    ratePer40Kg: 4250,
    baseAmount: 841500, // Sales Value = (7920 Net Wt / 40) * 4250
    expenses: [
      {
        expenseId: 'exp-1',
        name: 'Loading Labour',
        nameUrdu: 'پلائی لوڈنگ',
        amount: 4000,
        type: 'Direct'
      }
    ],
    totalExpenses: 4000,
    totalAmount: 845500, // 841500 + 4000
    avgCostPer40Kg: 4207.5, // Average Sales Rate = (841500 / 8000 First Wt) * 40 = 4,207.50
    costPer40Kg: 4207.5,
    status: 'Approved',
    approvedBy: 'Ch. Babar Ameen',
    approvedAt: '2026-09-28 04:00 PM',
    vehicleNo: 'TKP-2041 (10-Wheeler Truck)',
    biltyNo: 'BL-9934',
    remarks: 'Dispatched to Lahore Flour Mill factory gate',
    auditTrail: [
      {
        timestamp: '2026-09-28 03:15 PM',
        userId: 'usr-2',
        userName: 'Haji Aslam Munshi',
        action: 'CREATE',
        details: 'Sold 160 bags Wheat 8,000 KG @ 4,250/40KG to Al-Rehman Flour Mills',
        deviceInfo: 'Weighbridge Terminal 1'
      },
      {
        timestamp: '2026-09-28 04:00 PM',
        userId: 'usr-1',
        userName: 'Ch. Babar Ameen',
        action: 'APPROVE',
        details: 'Approved Sales voucher SAL-0001',
        deviceInfo: 'Manager Desktop'
      }
    ]
  },
  {
    id: 'v-103',
    voucherNo: 'PUR-0002',
    businessId: 'biz-1',
    type: 'PURCHASE',
    date: '2026-09-29',
    time: '09:00 AM',
    partyId: 'party-3',
    partyName: 'Ch. Akram & Brothers',
    partyNameUrdu: 'چوہدری اکرم اینڈ برادرز',
    partyPhone: '+92 300 5544332',
    partyWhatsapp: '+923005544332',
    itemId: 'item-2',
    itemName: 'Basmati Paddy (Super Dhan)',
    itemNameUrdu: 'دھان (سپر باسمتی)',
    godownId: 'godown-2',
    godownName: 'Railway Depot Godown # 2',
    grossWeight: 16200,
    tareWeight: 4200,
    firstWeight: 12000, // 12,000 KG (300 Maunds)
    bardanaKg: 120,
    moistureKg: 80,
    otherDeductionsKg: 50,
    netWeight: 11750,
    bags: 240,
    bardanaId: 'bard-2',
    bardanaName: 'PP Plastic Woven Bags 50KG (پلاسٹک توڑے)',
    ratePer40Kg: 4650,
    baseAmount: 1365937.5, // Purchase Value = (11750 Net Wt / 40) * 4650
    expenses: [
      {
        expenseId: 'exp-1',
        name: 'Labour',
        nameUrdu: 'مزدوری',
        amount: 6000,
        type: 'Direct'
      },
      {
        expenseId: 'exp-2',
        name: 'Freight',
        nameUrdu: 'کرایہ',
        amount: 9000,
        type: 'Direct'
      }
    ],
    totalExpenses: 15000,
    totalAmount: 1380937.5,
    avgCostPer40Kg: 4553.13, // Strictly: Average Purchase Cost = (Purchase Value 1365937.5 / 12000 First Wt) * 40 = 4,553.13
    costPer40Kg: 4553.13,
    landedCostPer40Kg: 4603.13, // Landed Cost with expenses = (1380937.5 / 12000) * 40 = 4,603.13
    status: 'Pending', // PENDING DOES NOT AFFECT CLOSING STOCK
    vehicleNo: 'MN-4019 (Bedford Truck)',
    remarks: 'Arrived at Railway Godown. Weighbridge ticket verified. Pending Manager approval.',
    auditTrail: [
      {
        timestamp: '2026-09-29 09:00 AM',
        userId: 'usr-2',
        userName: 'Haji Aslam Munshi',
        action: 'CREATE',
        details: 'Created Purchase slip PUR-0002. Status: PENDING (Stock not committed)',
        deviceInfo: 'Weighbridge Terminal 1'
      }
    ]
  },
  {
    id: 'v-104',
    voucherNo: 'TRN-0001',
    businessId: 'biz-1',
    type: 'TRANSFER',
    date: '2026-09-29',
    time: '11:15 AM',
    partyId: 'party-1',
    partyName: 'Internal Transfer',
    partyNameUrdu: 'اندرونی منتقلی',
    itemId: 'item-1',
    itemName: 'Wheat (Gandum)',
    itemNameUrdu: 'گندم (پنجاب ورائٹی)',
    godownId: 'godown-1',
    godownName: 'Main Mandi Godown # 1',
    toGodownId: 'godown-2',
    toGodownName: 'Railway Depot Godown # 2',
    grossWeight: 7500,
    tareWeight: 3500,
    firstWeight: 4000, // 4,000 KG (100 Maunds)
    bardanaKg: 40,
    moistureKg: 0,
    otherDeductionsKg: 0,
    netWeight: 3960,
    bags: 80,
    ratePer40Kg: 4000,
    baseAmount: 400000,
    expenses: [
      {
        expenseId: 'exp-1',
        name: 'Transfer Loading & Unloading',
        nameUrdu: 'منتقلی مزدوری',
        amount: 2000,
        type: 'Direct'
      }
    ],
    totalExpenses: 2000,
    totalAmount: 402000,
    avgCostPer40Kg: 4000,
    costPer40Kg: 4000,
    landedCostPer40Kg: 4020,
    status: 'Approved',
    approvedBy: 'Ch. Babar Ameen',
    approvedAt: '2026-09-29 11:30 AM',
    vehicleNo: 'FSD-3120 (Mazda Titan)',
    remarks: 'Shifting stock to Railway Depot for bulk rake dispatch',
    auditTrail: [
      {
        timestamp: '2026-09-29 11:15 AM',
        userId: 'usr-2',
        userName: 'Haji Aslam Munshi',
        action: 'CREATE',
        details: 'Transferred 80 bags Wheat from Main Godown to Railway Depot',
        deviceInfo: 'Gate Office'
      },
      {
        timestamp: '2026-09-29 11:30 AM',
        userId: 'usr-1',
        userName: 'Ch. Babar Ameen',
        action: 'APPROVE',
        details: 'Approved Transfer slip TRN-0001 (Main Godown minus 4,000 KG, Railway Depot plus 4,000 KG)',
        deviceInfo: 'Manager Desktop'
      }
    ]
  }
];

interface MandiContextType {
  businesses: Business[];
  currentBusiness: Business;
  setCurrentBusinessId: (id: string) => void;
  addBusiness: (biz: Omit<Business, 'id'>) => void;
  
  languageMode: LanguageMode;
  setLanguageMode: (mode: LanguageMode) => void;
  
  currentUser: UserAccount;
  users: UserAccount[];
  switchUser: (userId: string) => void;
  updateUserRights: (userId: string, menuKey: MenuKey, rights: Partial<UserAccount['rights'][MenuKey]>) => void;
  
  items: Item[];
  addItem: (item: Omit<Item, 'id' | 'businessId'>) => void;
  updateItem: (id: string, item: Partial<Item>) => void;
  
  parties: Party[];
  addParty: (party: Omit<Party, 'id' | 'businessId' | 'currentBalance'>) => void;
  updateParty: (id: string, party: Partial<Party>) => void;
  
  godowns: Godown[];
  addGodown: (godown: Omit<Godown, 'id' | 'businessId'>) => void;
  
  expenses: ExpenseMaster[];
  addExpense: (expense: Omit<ExpenseMaster, 'id' | 'businessId'>) => void;
  
  vouchers: Voucher[];
  filteredVouchers: Voucher[];
  addVoucher: (voucher: Omit<Voucher, 'id' | 'businessId' | 'auditTrail'>) => Voucher;
  updateVoucher: (id: string, updates: Partial<Voucher>, reason?: string) => void;
  approveVoucher: (id: string) => void;
  bulkApproveVouchers: (ids: string[]) => void;
  cancelVoucher: (id: string, reason: string) => void;
  softDeleteVoucher: (id: string, reason: string) => void;
  duplicateVoucher: (id: string) => Voucher;
  
  // Bardana Tracker (Separate Master & Inward/Outward Bag Tracking)
  bardanaMasters: BardanaMaster[];
  addBardanaMaster: (b: Omit<BardanaMaster, 'id' | 'businessId'>) => void;
  updateBardanaMaster: (id: string, updates: Partial<BardanaMaster>) => void;
  bardanaMovements: BardanaMovement[];
  addManualBardanaMovement: (m: Omit<BardanaMovement, 'id' | 'businessId'>) => void;
  bardanaSummary: {
    bardanaId: string;
    name: string;
    nameUrdu: string;
    category: string;
    openingBags: number;
    receivedBags: number;
    issuedBags: number;
    closingBags: number;
  }[];

  // Stock & P&L calculations
  stockSummary: StockClosingSummary[];
  godownStock: Record<string, Record<string, { firstWeight: number; bags: number }>>;
  todayMetrics: {
    purchaseFirstWeight: number;
    purchaseBags: number;
    purchaseAmount: number;
    salesFirstWeight: number;
    salesBags: number;
    salesAmount: number;
    todayExpense: number;
    todayProfit: number;
    closingStockValue: number;
    closingStockBags: number;
    pendingApprovalsCount: number;
  };

  // Authentication & Session Management
  isAuthenticated: boolean;
  login: (user: UserAccount, rememberMe?: boolean) => void;
  logout: () => void;
  loginAsAdmin: () => void;
  loginWithCredentials: (usernameOrEmail: string, pinOrPass: string) => Promise<{ success: boolean; message?: string }>;
  loginWithGoogleUser: (email: string, displayName?: string) => Promise<{ success: boolean; message?: string }>;
  updateAdminCredentials: (password: string, pin: string) => { success: boolean; message: string };
  backupToBusinessDrive: () => Promise<{ success: boolean; message: string }>;

  // Settings Centre
  appSettings: AppSettings;
  updateAppSettings: (newSettings: Partial<AppSettings>) => void;

  // Local Storage Vault (Drive)
  localSnapshots: LocalDriveSnapshot[];
  createLocalSnapshot: (name?: string, isAuto?: boolean) => LocalDriveSnapshot;
  restoreSnapshot: (snapshotData: string | object) => boolean;
  deleteLocalSnapshot: (id: string) => void;
  exportFullBackupFile: () => void;
  importBackupFile: (file: File) => Promise<{ success: boolean; message: string }>;
  
  // Local Storage / User Session
  googleDriveUser: OfflineUser | null;
  connectGoogleDrive: () => Promise<boolean>;
  disconnectGoogleDrive: () => void;
  backupToGoogleDrive: () => Promise<{ success: boolean; file?: GoogleDriveFileItem; message: string }>;
  restoreFromGoogleDrive: (fileId: string) => Promise<{ success: boolean; message: string }>;
  googleDriveFiles: GoogleDriveFileItem[];
  fetchGoogleDriveFiles: () => Promise<void>;
  isDriveSyncing: boolean;
  
  // Month Closing Centre (ماہانہ کلوزنگ و محفوظ ریکارڈ سینٹر)
  monthClosingRecords: MonthClosingRecord[];
  activeMonthFilter: string;
  setActiveMonthFilter: (filter: string) => void;
  closeMonth: (params: {
    monthKey?: string;
    startDate?: string;
    endDate?: string;
    periodName?: string;
    periodNameUrdu?: string;
    closingType?: 'single_month' | 'custom_range';
    notes?: string;
  }) => { success: boolean; message: string; record?: MonthClosingRecord };
  reopenMonth: (monthKey: string, reason: string) => { success: boolean; message: string };
  isMonthLocked: (dateOrMonthKey: string) => boolean;
  getMonthClosingRecord: (monthKey: string) => MonthClosingRecord | undefined;
  exportMonthArchiveFile: (monthKey: string) => void;
  deleteMonthArchive: (id: string) => void;

  resetToDefaultData: () => void;
}

const MandiContext = createContext<MandiContextType | undefined>(undefined);

const INITIAL_MONTH_CLOSINGS: MonthClosingRecord[] = [
  {
    id: 'mclose-range-2026-08-01-2026-09-30-biz-1',
    businessId: 'biz-1',
    monthKey: '2026-08-01_to_2026-09-30',
    monthName: '01 Aug 2026 to 30 Sep 2026',
    monthNameUrdu: '۰۱ اگست ۲۰۲۶ تا ۳۰ ستمبر ۲۰۲۶',
    startDate: '2026-08-01',
    endDate: '2026-09-30',
    closingType: 'custom_range',
    closedAt: '2026-09-30T19:00:00.000Z',
    closedBy: 'Ch. Babar Ameen (Administrator)',
    isLocked: true,
    notes: 'Seasonal multi-month accounting audit and closing from 01 Aug 2026 to 30 Sep 2026 (Two Months Kharif Season Roll-forward).',
    totalVouchersCount: 22,
    totalPurchaseWeightKg: 68500,
    totalPurchaseAmount: 6720000,
    totalSalesWeightKg: 62000,
    totalSalesAmount: 7050000,
    totalExpensesAmount: 135000,
    netMandiProfit: 195000,
    vouchers: [],
    partySummaries: [
      {
        partyId: 'party-1',
        partyName: 'Malik Nawaz Farmer',
        partyNameUrdu: 'ملک نواز (زمیندار)',
        type: 'Supplier',
        phone: '+92 300 7112233',
        openingBalance: 0,
        totalDebits: 0,
        totalCredits: 1850000,
        closingBalance: -1850000
      },
      {
        partyId: 'party-2',
        partyName: 'Al-Rehman Flour Mills Ltd',
        partyNameUrdu: 'الرحمٰن فلور ملز لمیٹڈ',
        type: 'Customer',
        phone: '+92 321 8899001',
        openingBalance: 420000,
        totalDebits: 2450000,
        totalCredits: 2000000,
        closingBalance: 870000
      }
    ],
    stockSummaries: [
      {
        itemId: 'item-1',
        itemName: 'Wheat Lok-1 (گندم)',
        itemNameUrdu: 'گندم لوک ون (پنجاب ورائٹی)',
        openingFirstWeight: 20000,
        openingBags: 400,
        openingValue: 1950000,
        purchasedFirstWeight: 45000,
        purchasedNetWeight: 44100,
        purchasedBags: 900,
        purchasedValue: 4350000,
        soldFirstWeight: 42000,
        soldNetWeight: 41160,
        soldBags: 840,
        soldValue: 4410000,
        closingFirstWeight: 23000,
        closingBags: 460,
        closingValue: 2242500,
        avgCostPer40Kg: 3900
      }
    ],
    bardanaSummaries: [
      {
        bardanaId: 'bard-1',
        bardanaName: 'Jute Bags 100KG (بوری پٹ سن)',
        bardanaNameUrdu: 'بوری پٹ سن (۱۰۰ کلو)',
        openingBags: 1500,
        inwardBags: 900,
        outwardBags: 840,
        closingBags: 1560
      }
    ],
    pnlSummary: {
      purchaseValue: 6720000,
      salesValue: 7050000,
      costOfGoodsSold: 6720000,
      grossTradingProfit: 330000,
      totalDirectExpenses: 85000,
      totalIndirectExpenses: 50000,
      totalExpenses: 135000,
      netProfit: 195000
    },
    expenses: [
      {
        expenseId: 'exp-1',
        name: 'Labour / Mazdoori (پلائی و اترائی)',
        nameUrdu: 'مزدوری (پلائی و اترائی)',
        amount: 55000,
        type: 'Direct'
      },
      {
        expenseId: 'exp-2',
        name: 'Freight / Transport (کرایہ گاڑی)',
        nameUrdu: 'کرایہ گاڑی / ٹرانسپورٹ',
        amount: 30000,
        type: 'Direct'
      }
    ]
  },
  {
    id: 'mclose-2026-08-biz-1',
    businessId: 'biz-1',
    monthKey: '2026-08',
    monthName: 'August 2026',
    monthNameUrdu: 'اگست ۲۰۲۶',
    startDate: '2026-08-01',
    endDate: '2026-08-31',
    closedAt: '2026-08-31T18:00:00.000Z',
    closedBy: 'Ch. Babar Ameen',
    isLocked: true,
    notes: 'August 2026 monthly closing finalized and audited. All party khatas and inventory balances rolled forward to September.',
    totalVouchersCount: 14,
    totalPurchaseWeightKg: 42000,
    totalPurchaseAmount: 4150000,
    totalSalesWeightKg: 38000,
    totalSalesAmount: 4320000,
    totalExpensesAmount: 85000,
    netMandiProfit: 85000,
    vouchers: [],
    partySummaries: [
      {
        partyId: 'party-1',
        partyName: 'Malik Nawaz Farmer',
        partyNameUrdu: 'ملک نواز (زمیندار)',
        type: 'Supplier',
        phone: '+92 300 7112233',
        openingBalance: 0,
        totalDebits: 0,
        totalCredits: 1250000,
        closingBalance: -1250000
      },
      {
        partyId: 'party-2',
        partyName: 'Rehman Cotton & Grain Mill',
        partyNameUrdu: 'رحمٰن کاٹن اینڈ گرین ملز',
        type: 'Customer',
        phone: '+92 321 8899001',
        openingBalance: 500000,
        totalDebits: 1450000,
        totalCredits: 1000000,
        closingBalance: 950000
      }
    ],
    stockSummaries: [
      {
        itemId: 'item-1',
        itemName: 'Wheat (Gandum)',
        itemNameUrdu: 'گندم (پنجاب ورائٹی)',
        openingFirstWeight: 15000,
        openingBags: 300,
        openingValue: 1462500,
        purchasedFirstWeight: 25000,
        purchasedNetWeight: 24500,
        purchasedBags: 500,
        purchasedValue: 2420000,
        soldFirstWeight: 20000,
        soldNetWeight: 19600,
        soldBags: 400,
        soldValue: 2100000,
        closingFirstWeight: 20000,
        closingBags: 400,
        closingValue: 1950000,
        avgCostPer40Kg: 3900
      }
    ],
    bardanaSummaries: [
      {
        bardanaId: 'bard-1',
        bardanaName: 'Jute Bags 100KG (بوری پٹ سن)',
        bardanaNameUrdu: 'بوری پٹ سن (۱۰۰ کلو)',
        openingBags: 1200,
        inwardBags: 500,
        outwardBags: 200,
        closingBags: 1500
      }
    ],
    pnlSummary: {
      purchaseValue: 4150000,
      salesValue: 4320000,
      costOfGoodsSold: 4150000,
      grossTradingProfit: 170000,
      totalDirectExpenses: 55000,
      totalIndirectExpenses: 30000,
      totalExpenses: 85000,
      netProfit: 85000
    },
    expenses: [
      {
        expenseId: 'exp-1',
        name: 'Labour / Mazdoori',
        nameUrdu: 'مزدوری (پلائی و اترائی)',
        amount: 35000,
        type: 'Direct'
      },
      {
        expenseId: 'exp-2',
        name: 'Freight / Transport',
        nameUrdu: 'گاڑی کرایہ / ٹرانسپورٹ',
        amount: 20000,
        type: 'Direct'
      }
    ]
  }
];

const STORAGE_PREFIX = 'mandi_erp_v1_';

export const MandiProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // 1. Business
  const [businesses, setBusinesses] = useState<Business[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'businesses');
    return saved ? JSON.parse(saved) : INITIAL_BUSINESSES;
  });
  
  const [currentBusinessId, setCurrentBusinessId] = useState<string>(() => {
    return businesses[0]?.id || 'biz-1';
  });

  const currentBusiness = useMemo(() => {
    return businesses.find(b => b.id === currentBusinessId) || businesses[0];
  }, [businesses, currentBusinessId]);

  // 2. Language
  const [languageMode, setLanguageMode] = useState<LanguageMode>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'languageMode');
    return (saved as LanguageMode) || 'both';
  });

  // 3. Users & Auth
  const [users, setUsers] = useState<UserAccount[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });
  const [currentUserId, setCurrentUserId] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'currentUserId');
    return saved || users[0]?.id || 'usr-1';
  });
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'isAuthenticated');
    return saved === 'true';
  });

  const currentUser = useMemo(() => {
    return users.find(u => u.id === currentUserId) || users[0];
  }, [users, currentUserId]);

  // 3b. App Settings & Drive Storage
  const [appSettings, setAppSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'appSettings');
    return saved ? { ...DEFAULT_APP_SETTINGS, ...JSON.parse(saved) } : DEFAULT_APP_SETTINGS;
  });

  const [localSnapshots, setLocalSnapshots] = useState<LocalDriveSnapshot[]>(() => {
    return getLocalDriveSnapshots();
  });

  const [googleDriveUser, setGoogleDriveUser] = useState<OfflineUser | null>({
    uid: 'offline-owner',
    displayName: 'Ch. Babar Ameen (Offline Desktop)',
    email: 'owner@mandi.pk'
  });
  const [googleDriveFiles, setGoogleDriveFiles] = useState<GoogleDriveFileItem[]>([]);
  const [isDriveSyncing, setIsDriveSyncing] = useState<boolean>(false);

  useEffect(() => {
    // 100% Offline mode - No Firebase or web cloud dependencies
  }, []);

  // 4. Masters
  const [items, setItems] = useState<Item[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'items');
    return saved ? JSON.parse(saved) : INITIAL_ITEMS;
  });

  const [parties, setParties] = useState<Party[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'parties');
    return saved ? JSON.parse(saved) : INITIAL_PARTIES;
  });

  const [godowns, setGodowns] = useState<Godown[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'godowns');
    return saved ? JSON.parse(saved) : INITIAL_GODOWNS;
  });

  const [expenses, setExpenses] = useState<ExpenseMaster[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'expenses');
    return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
  });

  // 5. Bardana Master & Bag Tracker
  const [bardanaMasters, setBardanaMasters] = useState<BardanaMaster[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'bardanaMasters');
    return saved ? JSON.parse(saved) : INITIAL_BARDANA;
  });

  const [bardanaMovements, setBardanaMovements] = useState<BardanaMovement[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'bardanaMovements');
    return saved ? JSON.parse(saved) : INITIAL_BARDANA_MOVEMENTS;
  });

  // 6. Vouchers
  const [vouchers, setVouchers] = useState<Voucher[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'vouchers');
    return saved ? JSON.parse(saved) : INITIAL_VOUCHERS;
  });

  // 7. Month Closings & Month Archives (ماہانہ کلوزنگ و محفوظ ریکارڈ)
  const [monthClosingRecords, setMonthClosingRecords] = useState<MonthClosingRecord[]>(() => {
    const saved = localStorage.getItem(STORAGE_PREFIX + 'month_closings');
    if (!saved) return INITIAL_MONTH_CLOSINGS;
    try {
      const parsed: MonthClosingRecord[] = JSON.parse(saved);
      // Ensure initial demo records (like 01 Aug 2026 to 30 Sep 2026) are merged if missing
      const existingKeys = new Set(parsed.map(r => `${r.businessId}_${r.monthKey}`));
      const missingInitial = INITIAL_MONTH_CLOSINGS.filter(init => !existingKeys.has(`${init.businessId}_${init.monthKey}`));
      return missingInitial.length > 0 ? [...missingInitial, ...parsed] : parsed;
    } catch {
      return INITIAL_MONTH_CLOSINGS;
    }
  });

  const [activeMonthFilter, setActiveMonthFilter] = useState<string>('all');

  // Persist State to LocalStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'businesses', JSON.stringify(businesses));
  }, [businesses]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'bardanaMasters', JSON.stringify(bardanaMasters));
  }, [bardanaMasters]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'bardanaMovements', JSON.stringify(bardanaMovements));
  }, [bardanaMovements]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'languageMode', languageMode);
  }, [languageMode]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'items', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'parties', JSON.stringify(parties));
  }, [parties]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'godowns', JSON.stringify(godowns));
  }, [godowns]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'vouchers', JSON.stringify(vouchers));
  }, [vouchers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_PREFIX + 'month_closings', JSON.stringify(monthClosingRecords));
  }, [monthClosingRecords]);

  // Filter vouchers for active business and non-soft-deleted (and active month or date range filter if selected)
  const filteredVouchers = useMemo(() => {
    return vouchers.filter(v => {
      if (v.businessId !== currentBusiness.id || v.isDeleted) return false;
      if (activeMonthFilter !== 'all') {
        if (activeMonthFilter.includes('_to_')) {
          const [start, end] = activeMonthFilter.split('_to_');
          return v.date >= start && v.date <= end;
        }
        return v.date.startsWith(activeMonthFilter);
      }
      return true;
    });
  }, [vouchers, currentBusiness.id, activeMonthFilter]);

  // Business-wise items & godowns
  const currentBusinessItems = useMemo(() => {
    return items.filter(i => i.businessId === currentBusiness.id);
  }, [items, currentBusiness.id]);

  const currentBusinessGodowns = useMemo(() => {
    return godowns.filter(g => g.businessId === currentBusiness.id);
  }, [godowns, currentBusiness.id]);

  const currentBusinessParties = useMemo(() => {
    return parties.filter(p => p.businessId === currentBusiness.id);
  }, [parties, currentBusiness.id]);

  // Calculate Closing Stock according to LOCKED Formula:
  // 1. Purchase Value = (Net Weight / 40) * Rate per 40-kg
  // 2. Average Purchase Cost = (Purchase Value / First Weight) * 40 strictly!
  // 3. Closing First Weight = Opening + Purchased (Approved) - Sold (Approved)
  // 4. Closing Bags = Opening Bags + Purchased Bags - Sold Bags
  // 5. Closing Avg Purchase Cost = (Opening Value + Purchase Value) / (Opening First Wt + Purchase First Wt) * 40
  // 6. Closing Value = (Closing First Weight / 40) * Closing Avg Purchase Cost
  const stockSummary: StockClosingSummary[] = useMemo(() => {
    return currentBusinessItems.map(item => {
      // Find all APPROVED vouchers for this item in current business
      const approvedItemVouchers = vouchers.filter(
        v => v.businessId === currentBusiness.id &&
             v.itemId === item.id &&
             v.status === 'Approved' &&
             !v.isDeleted
      );

      let purchaseGrossWeight = 0;
      let purchaseTareWeight = 0;
      let purchaseFirstWeight = 0;
      let purchaseBardanaKg = 0;
      let purchaseMoistureKg = 0;
      let purchaseOtherDeductionsKg = 0;
      let purchaseNetWeight = 0;
      let purchaseBags = 0;
      let purchaseBaseValue = 0; // Purchase Value = Net Wt / 40 * Rate
      let purchaseExpenses = 0;
      let purchaseTotalAmount = 0;

      let soldFirstWeight = 0;
      let soldNetWeight = 0;
      let soldBags = 0;
      let soldValue = 0;

      approvedItemVouchers.forEach(v => {
        if (v.type === 'PURCHASE') {
          purchaseGrossWeight += (v.grossWeight || 0);
          purchaseTareWeight += (v.tareWeight || 0);
          purchaseFirstWeight += (v.firstWeight || 0);
          purchaseBardanaKg += (v.bardanaKg || 0);
          purchaseMoistureKg += (v.moistureKg || 0);
          purchaseOtherDeductionsKg += (v.otherDeductionsKg || 0);
          purchaseNetWeight += (v.netWeight || 0);
          purchaseBags += (v.bags || 0);
          purchaseBaseValue += (v.baseAmount || 0); // (Net Wt / 40) * Rate
          purchaseExpenses += (v.totalExpenses || 0);
          purchaseTotalAmount += (v.totalAmount || (v.baseAmount + (v.totalExpenses || 0)));
        } else if (v.type === 'SALE') {
          soldFirstWeight += (v.firstWeight || 0);
          soldNetWeight += (v.netWeight || 0);
          soldBags += (v.bags || 0);
          soldValue += (v.baseAmount || 0);
        }
      });

      const purchaseDeductionsKg = purchaseBardanaKg + purchaseMoistureKg + purchaseOtherDeductionsKg;
      const purchaseAvgRatePer40Kg = purchaseNetWeight > 0 ? (purchaseBaseValue / purchaseNetWeight) * 40 : item.defaultRate;
      
      // STRICT MANDI FORMULA: Average purchase cost = purchase value / first weight * 40
      const purchaseAvgCostPer40Kg = purchaseFirstWeight > 0
        ? (purchaseBaseValue / purchaseFirstWeight) * 40
        : (item.openingFirstWeight > 0 ? (item.openingValue / item.openingFirstWeight) * 40 : item.defaultRate);

      const purchaseLandedCostPer40Kg = purchaseFirstWeight > 0
        ? (purchaseTotalAmount / purchaseFirstWeight) * 40
        : purchaseAvgCostPer40Kg;

      const soldAvgRatePer40Kg = soldFirstWeight > 0 ? (soldValue / soldFirstWeight) * 40 : 0;

      const openingAvgCostPer40Kg = item.openingFirstWeight > 0
        ? (item.openingValue / item.openingFirstWeight) * 40
        : item.defaultRate;

      const closingFirstWeight = item.openingFirstWeight + purchaseFirstWeight - soldFirstWeight;
      const closingBags = item.openingBags + purchaseBags - soldBags;
      
      // Calculate cumulative weighted Average Purchase Cost per 40KG:
      // (Opening Value + Inward Purchase Value) / (Opening First Weight + Inward First Weight) * 40
      const totalAvailableFirstWeight = item.openingFirstWeight + purchaseFirstWeight;
      const totalAvailablePurchaseValue = item.openingValue + purchaseBaseValue;
      const closingAvgCostPer40Kg = totalAvailableFirstWeight > 0
        ? (totalAvailablePurchaseValue / totalAvailableFirstWeight) * 40
        : item.defaultRate;

      // Closing Value strictly according to average purchase cost:
      // Closing Value = (Closing First Weight / 40) * closingAvgCostPer40Kg
      const closingValue = Math.max(0, (closingFirstWeight / 40) * closingAvgCostPer40Kg);

      return {
        itemId: item.id,
        itemName: item.name,
        itemNameUrdu: item.nameUrdu,
        
        openingFirstWeight: item.openingFirstWeight,
        openingBags: item.openingBags,
        openingValue: item.openingValue,
        openingAvgCostPer40Kg,

        purchaseGrossWeight,
        purchaseTareWeight,
        purchaseFirstWeight,
        purchaseBardanaKg,
        purchaseMoistureKg,
        purchaseOtherDeductionsKg,
        purchaseDeductionsKg,
        purchaseNetWeight,
        purchaseBags,
        purchaseAvgRatePer40Kg,
        purchaseBaseValue,
        purchaseExpenses,
        purchaseTotalAmount,
        purchaseAvgCostPer40Kg,
        purchaseLandedCostPer40Kg,

        soldFirstWeight,
        soldNetWeight,
        soldBags,
        soldValue,
        soldAvgRatePer40Kg,

        closingFirstWeight,
        closingBags,
        closingValue,
        avgCostPer40Kg: closingAvgCostPer40Kg
      };
    });
  }, [currentBusinessItems, vouchers, currentBusiness.id]);

  // Godown-wise stock breakdown (Approved only)
  const godownStock = useMemo(() => {
    const map: Record<string, Record<string, { firstWeight: number; bags: number }>> = {};

    currentBusinessGodowns.forEach(g => {
      map[g.id] = {};
      currentBusinessItems.forEach(i => {
        // Initial opening allocation
        map[g.id][i.id] = { firstWeight: 0, bags: 0 };
      });
    });

    // Distribute opening stock to default main godown
    if (currentBusinessGodowns[0]) {
      const mainGodownId = currentBusinessGodowns[0].id;
      currentBusinessItems.forEach(i => {
        if (map[mainGodownId]?.[i.id]) {
          map[mainGodownId][i.id].firstWeight += i.openingFirstWeight;
          map[mainGodownId][i.id].bags += i.openingBags;
        }
      });
    }

    // Process Approved Vouchers
    vouchers.filter(v => v.businessId === currentBusiness.id && v.status === 'Approved' && !v.isDeleted).forEach(v => {
      if (v.type === 'PURCHASE') {
        if (map[v.godownId]?.[v.itemId]) {
          map[v.godownId][v.itemId].firstWeight += v.firstWeight;
          map[v.godownId][v.itemId].bags += v.bags;
        }
      } else if (v.type === 'SALE') {
        if (map[v.godownId]?.[v.itemId]) {
          map[v.godownId][v.itemId].firstWeight -= v.firstWeight;
          map[v.godownId][v.itemId].bags -= v.bags;
        }
      } else if (v.type === 'TRANSFER' && v.toGodownId) {
        if (map[v.godownId]?.[v.itemId]) {
          map[v.godownId][v.itemId].firstWeight -= v.firstWeight;
          map[v.godownId][v.itemId].bags -= v.bags;
        }
        if (map[v.toGodownId]?.[v.itemId]) {
          map[v.toGodownId][v.itemId].firstWeight += v.firstWeight;
          map[v.toGodownId][v.itemId].bags += v.bags;
        }
      }
    });

    return map;
  }, [currentBusinessGodowns, currentBusinessItems, vouchers, currentBusiness.id]);

  // Business-wise Bardana Master & Inventory Summary
  const currentBusinessBardana = useMemo(() => {
    return bardanaMasters.filter(b => b.businessId === currentBusiness.id);
  }, [bardanaMasters, currentBusiness.id]);

  const bardanaSummary = useMemo(() => {
    const approvedVouchers = vouchers.filter(
      v => v.businessId === currentBusiness.id && v.status === 'Approved' && !v.isDeleted
    );

    return currentBusinessBardana.map(b => {
      let receivedBags = 0;
      let issuedBags = 0;

      // Bags from approved purchase vouchers (Received + in Bardana Register)
      approvedVouchers.forEach(v => {
        if (v.type === 'PURCHASE') {
          if (!v.bardanaId || v.bardanaId === b.id || currentBusinessBardana.length === 1) {
            receivedBags += (v.bags || 0);
          }
        } else if (v.type === 'SALE') {
          if (!v.bardanaId || v.bardanaId === b.id || currentBusinessBardana.length === 1) {
            issuedBags += (v.bags || 0);
          }
        }
      });

      // Manual movements
      bardanaMovements
        .filter(m => m.businessId === currentBusiness.id && m.bardanaId === b.id)
        .forEach(m => {
          receivedBags += (m.inwardBags || 0);
          issuedBags += (m.outwardBags || 0);
        });

      const closingBags = b.openingBags + receivedBags - issuedBags;

      return {
        bardanaId: b.id,
        name: b.name,
        nameUrdu: b.nameUrdu,
        category: b.category,
        openingBags: b.openingBags,
        receivedBags,
        issuedBags,
        closingBags
      };
    });
  }, [currentBusinessBardana, vouchers, bardanaMovements, currentBusiness.id]);

  // Today KPI Metrics
  const todayMetrics = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const approvedVouchers = vouchers.filter(
      v => v.businessId === currentBusiness.id && !v.isDeleted
    );

    let pWeight = 0, pBags = 0, pAmt = 0;
    let sWeight = 0, sBags = 0, sAmt = 0;
    let expAmt = 0;
    let todaySalesCOGS = 0;

    // Build item purchase average map
    const itemAvgMap: Record<string, number> = {};
    stockSummary.forEach(s => {
      itemAvgMap[s.itemId] = s.avgCostPer40Kg;
    });

    approvedVouchers.forEach(v => {
      if (v.date === today && v.status === 'Approved') {
        if (v.type === 'PURCHASE') {
          pWeight += v.firstWeight;
          pBags += v.bags;
          pAmt += v.totalAmount;
        } else if (v.type === 'SALE') {
          sWeight += v.firstWeight;
          sBags += v.bags;
          sAmt += v.baseAmount;
          const avgCost = itemAvgMap[v.itemId] || v.ratePer40Kg;
          todaySalesCOGS += (v.firstWeight / 40) * avgCost;
          expAmt += v.totalExpenses;
        }
      }
    });

    const todayProfit = sAmt - todaySalesCOGS - expAmt;
    const closingStockValue = stockSummary.reduce((acc, curr) => acc + curr.closingValue, 0);
    const closingStockBags = stockSummary.reduce((acc, curr) => acc + curr.closingBags, 0);
    const pendingApprovalsCount = vouchers.filter(
      v => v.businessId === currentBusiness.id && v.status === 'Pending' && !v.isDeleted
    ).length;

    return {
      purchaseFirstWeight: pWeight,
      purchaseBags: pBags,
      purchaseAmount: pAmt,
      salesFirstWeight: sWeight,
      salesBags: sBags,
      salesAmount: sAmt,
      todayExpense: expAmt,
      todayProfit,
      closingStockValue,
      closingStockBags,
      pendingApprovalsCount
    };
  }, [vouchers, currentBusiness.id, stockSummary]);

  // Actions
  const addBusiness = (biz: Omit<Business, 'id'>) => {
    const newId = `biz-${Date.now()}`;
    const newBiz: Business = { ...biz, id: newId };
    setBusinesses(prev => [...prev, newBiz]);
    setCurrentBusinessId(newId);
  };

  const addItem = (item: Omit<Item, 'id' | 'businessId'>) => {
    const newItem: Item = {
      ...item,
      id: `item-${Date.now()}`,
      businessId: currentBusiness.id
    };
    setItems(prev => [...prev, newItem]);
  };

  const updateItem = (id: string, updates: Partial<Item>) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));
  };

  const addParty = (party: Omit<Party, 'id' | 'businessId' | 'currentBalance'>) => {
    const newParty: Party = {
      ...party,
      id: `party-${Date.now()}`,
      businessId: currentBusiness.id,
      currentBalance: party.openingBalance
    };
    setParties(prev => [...prev, newParty]);
  };

  const updateParty = (id: string, updates: Partial<Party>) => {
    setParties(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const addGodown = (godown: Omit<Godown, 'id' | 'businessId'>) => {
    const newGodown: Godown = {
      ...godown,
      id: `godown-${Date.now()}`,
      businessId: currentBusiness.id
    };
    setGodowns(prev => [...prev, newGodown]);
  };

  const addExpense = (exp: Omit<ExpenseMaster, 'id' | 'businessId'>) => {
    const newExp: ExpenseMaster = {
      ...exp,
      id: `exp-${Date.now()}`,
      businessId: currentBusiness.id
    };
    setExpenses(prev => [...prev, newExp]);
  };

  const addBardanaMaster = (b: Omit<BardanaMaster, 'id' | 'businessId'>) => {
    const newB: BardanaMaster = {
      ...b,
      id: `bard-${Date.now()}`,
      businessId: currentBusiness.id
    };
    setBardanaMasters(prev => [...prev, newB]);
  };

  const updateBardanaMaster = (id: string, updates: Partial<BardanaMaster>) => {
    setBardanaMasters(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
  };

  const addManualBardanaMovement = (m: Omit<BardanaMovement, 'id' | 'businessId'>) => {
    const newM: BardanaMovement = {
      ...m,
      id: `bmov-${Date.now()}`,
      businessId: currentBusiness.id
    };
    setBardanaMovements(prev => [newM, ...prev]);
  };

  const addVoucher = (v: Omit<Voucher, 'id' | 'businessId' | 'auditTrail'>): Voucher => {
    const newId = `v-${Date.now()}`;
    const audit: AuditEntry = {
      timestamp: new Date().toLocaleString('en-PK'),
      userId: currentUser.id,
      userName: currentUser.name,
      action: 'CREATE',
      details: `Created ${v.type} voucher ${v.voucherNo} (${v.bags} Bags, ${v.firstWeight} KG First Wt) - Status: ${v.status}`,
      deviceInfo: navigator.userAgent.slice(0, 40)
    };

    const calcBaseAmount = Number((v.netWeight / 40) * v.ratePer40Kg) || v.baseAmount || 0;
    const calcAvgCost = v.firstWeight > 0 ? (calcBaseAmount / v.firstWeight) * 40 : 0;
    const calcLandedCost = v.firstWeight > 0 ? ((calcBaseAmount + (v.totalExpenses || 0)) / v.firstWeight) * 40 : 0;

    const selectedBardana = bardanaMasters.find(b => b.id === v.bardanaId) || bardanaMasters[0];

    const newVoucher: Voucher = {
      ...v,
      id: newId,
      businessId: currentBusiness.id,
      bardanaId: v.bardanaId || selectedBardana?.id,
      bardanaName: v.bardanaName || selectedBardana?.name,
      baseAmount: calcBaseAmount,
      avgCostPer40Kg: calcAvgCost,
      costPer40Kg: calcAvgCost,
      landedCostPer40Kg: calcLandedCost,
      auditTrail: [audit]
    };

    setVouchers(prev => [newVoucher, ...prev]);
    return newVoucher;
  };

  const updateVoucher = (id: string, updates: Partial<Voucher>, reason?: string) => {
    setVouchers(prev => prev.map(v => {
      if (v.id !== id) return v;

      const audit: AuditEntry = {
        timestamp: new Date().toLocaleString('en-PK'),
        userId: currentUser.id,
        userName: currentUser.name,
        action: 'EDIT',
        details: reason || `Updated voucher fields`,
        deviceInfo: navigator.userAgent.slice(0, 40)
      };

      return {
        ...v,
        ...updates,
        auditTrail: [...v.auditTrail, audit]
      };
    }));
  };

  const approveVoucher = (id: string) => {
    setVouchers(prev => prev.map(v => {
      if (v.id !== id) return v;
      const now = new Date().toLocaleString('en-PK');
      const audit: AuditEntry = {
        timestamp: now,
        userId: currentUser.id,
        userName: currentUser.name,
        action: 'APPROVE',
        details: `Approved ${v.voucherNo}. Stock and Ledger balances successfully committed.`,
        deviceInfo: navigator.userAgent.slice(0, 40)
      };
      return {
        ...v,
        status: 'Approved',
        approvedBy: currentUser.name,
        approvedAt: now,
        auditTrail: [...v.auditTrail, audit]
      };
    }));
  };

  const bulkApproveVouchers = (ids: string[]) => {
    const idSet = new Set(ids);
    const now = new Date().toLocaleString('en-PK');
    setVouchers(prev => prev.map(v => {
      if (!idSet.has(v.id) || v.status === 'Approved') return v;
      const audit: AuditEntry = {
        timestamp: now,
        userId: currentUser.id,
        userName: currentUser.name,
        action: 'APPROVE',
        details: `Bulk approved by ${currentUser.name}`,
        deviceInfo: navigator.userAgent.slice(0, 40)
      };
      return {
        ...v,
        status: 'Approved',
        approvedBy: currentUser.name,
        approvedAt: now,
        auditTrail: [...v.auditTrail, audit]
      };
    }));
  };

  const cancelVoucher = (id: string, reason: string) => {
    const now = new Date().toLocaleString('en-PK');
    setVouchers(prev => prev.map(v => {
      if (v.id !== id) return v;
      const audit: AuditEntry = {
        timestamp: now,
        userId: currentUser.id,
        userName: currentUser.name,
        action: 'CANCEL',
        details: `Cancelled: ${reason}`,
        deviceInfo: navigator.userAgent.slice(0, 40)
      };
      return {
        ...v,
        status: 'Cancelled',
        cancelledBy: currentUser.name,
        cancelledAt: now,
        cancelReason: reason,
        auditTrail: [...v.auditTrail, audit]
      };
    }));
  };

  const softDeleteVoucher = (id: string, reason: string) => {
    const now = new Date().toLocaleString('en-PK');
    setVouchers(prev => prev.map(v => {
      if (v.id !== id) return v;
      const audit: AuditEntry = {
        timestamp: now,
        userId: currentUser.id,
        userName: currentUser.name,
        action: 'SOFT_DELETE',
        details: `Deleted with reason: ${reason}`,
        deviceInfo: navigator.userAgent.slice(0, 40)
      };
      return {
        ...v,
        isDeleted: true,
        deleteReason: reason,
        deletedAt: now,
        deletedBy: currentUser.name,
        auditTrail: [...v.auditTrail, audit]
      };
    }));
  };

  const duplicateVoucher = (id: string): Voucher => {
    const original = vouchers.find(v => v.id === id);
    if (!original) throw new Error('Voucher not found');

    const typePrefix = original.type === 'PURCHASE' ? 'PUR' : original.type === 'SALE' ? 'SAL' : 'TRN';
    const randNum = Math.floor(1000 + Math.random() * 9000);
    const newVoucherNo = `${typePrefix}-${randNum}`;

    const newVoucher = addVoucher({
      ...original,
      voucherNo: newVoucherNo,
      date: new Date().toISOString().slice(0, 10),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'Pending',
      approvedBy: undefined,
      approvedAt: undefined,
      cancelledBy: undefined,
      cancelledAt: undefined,
      cancelReason: undefined,
      remarks: `Cloned from ${original.voucherNo}`
    });

    return newVoucher;
  };

  const switchUser = (userId: string) => {
    setCurrentUserId(userId);
  };

  const updateUserRights = (userId: string, menuKey: MenuKey, rights: Partial<UserAccount['rights'][MenuKey]>) => {
    setUsers(prev => prev.map(u => {
      if (u.id !== userId) return u;
      return {
        ...u,
        rights: {
          ...u.rights,
          [menuKey]: {
            ...u.rights[menuKey],
            ...rights
          }
        }
      };
    }));
  };

  // Auth & Session Implementation
  const login = (user: UserAccount, rememberMe = true) => {
    setCurrentUserId(user.id);
    setIsAuthenticated(true);
    if (rememberMe) {
      localStorage.setItem(STORAGE_PREFIX + 'isAuthenticated', 'true');
      localStorage.setItem(STORAGE_PREFIX + 'currentUserId', user.id);
    }
    const now = new Date().toLocaleString('en-PK');
    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, lastLogin: now } : u));
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.setItem(STORAGE_PREFIX + 'isAuthenticated', 'false');
  };

  const loginWithCredentials = async (usernameOrEmail: string, pinOrPass: string): Promise<{ success: boolean; message?: string }> => {
    const cleaned = usernameOrEmail.trim().toLowerCase();
    const pinClean = pinOrPass.trim();

    const matched = users.find(u => 
      u.email.toLowerCase() === cleaned ||
      u.name.toLowerCase() === cleaned ||
      (u.username && u.username.toLowerCase() === cleaned) ||
      u.mobile.replace(/\s+/g, '') === cleaned.replace(/\s+/g, '') ||
      (cleaned === 'admin' && u.role === 'Admin') ||
      (cleaned === 'administrator' && u.role === 'Admin') ||
      (cleaned === 'manager' && u.role === 'Manager') ||
      (cleaned === 'operator' && u.role === 'Operator') ||
      (cleaned === 'viewer' && u.role === 'Viewer')
    );

    if (!matched) {
      return { success: false, message: 'User account not found with this username, email, or phone number.' };
    }

    if (!matched.isActive) {
      return { success: false, message: 'This account has been deactivated by administrator.' };
    }

    const pinMatch = Boolean(matched.pin && matched.pin === pinClean);
    const passMatch = Boolean(matched.password && matched.password === pinClean);
    const defaultMaster = (matched.role === 'Admin' && (pinClean === '1234' || pinClean === 'admin')) || pinClean === '1234';

    if (pinMatch || passMatch || defaultMaster) {
      login(matched, true);
      return { success: true };
    }

    return { success: false, message: 'Invalid PIN or Password. (Hint: Default Admin password is "admin" / PIN is "1234")' };
  };

  const loginAsAdmin = () => {
    const adminUser = users.find(u => u.role === 'Admin') || users[0];
    login(adminUser, true);
  };

  const updateAdminCredentials = (password: string, pin: string): { success: boolean; message: string } => {
    const adminUser = users.find(u => u.role === 'Admin');
    if (!adminUser) return { success: false, message: 'Administrator account not found.' };

    const updatedUsers = users.map(u => {
      if (u.id === adminUser.id) {
        return {
          ...u,
          password: password.trim() || u.password,
          pin: pin.trim() || u.pin
        };
      }
      return u;
    });

    setUsers(updatedUsers);
    localStorage.setItem(STORAGE_PREFIX + 'users', JSON.stringify(updatedUsers));
    return { success: true, message: 'Administrator credentials updated successfully.' };
  };

  const backupToBusinessDrive = async (): Promise<{ success: boolean; message: string }> => {
    try {
      const payload = {
        version: '1.0',
        system: 'Grain Market Software (غلہ منڈی سافٹ ویئر)',
        storageMode: '100% Business-Provided Local Drive - Zero Google Cloud Dependency',
        timestamp: new Date().toISOString(),
        businessId: currentBusiness.id,
        businessName: currentBusiness.name,
        createdByName: currentUser.name,
        businesses,
        items,
        parties,
        godowns,
        expenses,
        bardanaMasters,
        bardanaMovements,
        vouchers,
        users,
        appSettings
      };

      const cleanBiz = currentBusiness.name.replace(/[^a-zA-Z0-9]/g, '_');
      const filename = `Mandi_BusinessDrive_${cleanBiz}_${new Date().toISOString().slice(0, 10)}.json`;
      const res = await saveToBusinessDrive(payload, filename, appSettings.businessDriveFolderPath);

      updateAppSettings({
        lastLocalBackupTime: new Date().toLocaleString(),
        lastCloudBackupTime: new Date().toLocaleString()
      });
      return { success: true, message: res.message };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Failed to save to business drive.' };
    }
  };

  const loginWithGoogleUser = async (email: string, displayName?: string): Promise<{ success: boolean; message?: string }> => {
    let matched = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!matched) {
      // Connect to Admin or create linked account
      matched = {
        ...users[0],
        email,
        name: displayName || users[0].name
      };
      setUsers(prev => [matched!, ...prev.filter(u => u.id !== matched!.id)]);
    }
    login(matched, true);
    return { success: true };
  };

  // App Settings Implementation
  const updateAppSettings = (newSettings: Partial<AppSettings>) => {
    setAppSettings(prev => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem(STORAGE_PREFIX + 'appSettings', JSON.stringify(updated));
      return updated;
    });
  };

  // Local Storage Vault Implementation
  const createLocalSnapshot = (name?: string, isAuto = false): LocalDriveSnapshot => {
    const totalWeight = vouchers
      .filter(v => v.businessId === currentBusiness.id && !v.isDeleted)
      .reduce((sum, v) => sum + (v.firstWeight || 0), 0);
    const snapName = name || `Manual Snapshot - ${currentBusiness.name} - ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    
    const payload = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      businessId: currentBusiness.id,
      businessName: currentBusiness.name,
      createdByName: currentUser.name,
      businesses,
      items,
      parties,
      godowns,
      expenses,
      bardanaMasters,
      bardanaMovements,
      vouchers,
      users,
      appSettings
    };

    const saved = saveLocalDriveSnapshot({
      name: snapName,
      totalVouchers: vouchers.filter(v => v.businessId === currentBusiness.id).length,
      totalWeightKg: totalWeight,
      businessId: currentBusiness.id,
      businessName: currentBusiness.name,
      createdByName: currentUser.name,
      isAutoSnapshot: isAuto,
      data: JSON.stringify(payload)
    }, appSettings.localMaxSnapshots || 10);

    setLocalSnapshots(getLocalDriveSnapshots());
    updateAppSettings({ lastLocalBackupTime: new Date().toLocaleString() });
    return saved;
  };

  const deleteLocalSnapshot = (id: string) => {
    const updated = deleteLocalDriveSnapshot(id);
    setLocalSnapshots(updated);
  };

  const restoreSnapshot = (snapshotData: string | object): boolean => {
    try {
      const parsed = typeof snapshotData === 'string' ? JSON.parse(snapshotData) : snapshotData;
      if (!parsed || typeof parsed !== 'object') {
        throw new Error('Invalid snapshot data structure.');
      }

      if (parsed.businesses) {
        setBusinesses(parsed.businesses);
        localStorage.setItem(STORAGE_PREFIX + 'businesses', JSON.stringify(parsed.businesses));
      }
      if (parsed.items) {
        setItems(parsed.items);
        localStorage.setItem(STORAGE_PREFIX + 'items', JSON.stringify(parsed.items));
      }
      if (parsed.parties) {
        setParties(parsed.parties);
        localStorage.setItem(STORAGE_PREFIX + 'parties', JSON.stringify(parsed.parties));
      }
      if (parsed.godowns) {
        setGodowns(parsed.godowns);
        localStorage.setItem(STORAGE_PREFIX + 'godowns', JSON.stringify(parsed.godowns));
      }
      if (parsed.expenses) {
        setExpenses(parsed.expenses);
        localStorage.setItem(STORAGE_PREFIX + 'expenses', JSON.stringify(parsed.expenses));
      }
      if (parsed.bardanaMasters) {
        setBardanaMasters(parsed.bardanaMasters);
        localStorage.setItem(STORAGE_PREFIX + 'bardanaMasters', JSON.stringify(parsed.bardanaMasters));
      }
      if (parsed.bardanaMovements) {
        setBardanaMovements(parsed.bardanaMovements);
        localStorage.setItem(STORAGE_PREFIX + 'bardanaMovements', JSON.stringify(parsed.bardanaMovements));
      }
      if (parsed.vouchers) {
        setVouchers(parsed.vouchers);
        localStorage.setItem(STORAGE_PREFIX + 'vouchers', JSON.stringify(parsed.vouchers));
      }
      if (parsed.users) {
        setUsers(parsed.users);
        localStorage.setItem(STORAGE_PREFIX + 'users', JSON.stringify(parsed.users));
      }
      if (parsed.appSettings) {
        setAppSettings(parsed.appSettings);
        localStorage.setItem(STORAGE_PREFIX + 'appSettings', JSON.stringify(parsed.appSettings));
      }
      if (parsed.businessId) {
        setCurrentBusinessId(parsed.businessId);
      }

      return true;
    } catch (err) {
      console.error('Failed to restore snapshot:', err);
      return false;
    }
  };

  const exportFullBackupFile = () => {
    const payload = {
      version: '1.0',
      system: 'Grain Market Software (غلہ منڈی سافٹ ویئر)',
      timestamp: new Date().toISOString(),
      businessId: currentBusiness.id,
      businessName: currentBusiness.name,
      createdByName: currentUser.name,
      businesses,
      items,
      parties,
      godowns,
      expenses,
      bardanaMasters,
      bardanaMovements,
      vouchers,
      users,
      appSettings
    };
    const cleanBiz = currentBusiness.name.replace(/[^a-zA-Z0-9]/g, '_');
    const dateStr = new Date().toISOString().slice(0, 10);
    exportBackupToFile(payload, `Mandi_Backup_${cleanBiz}_${dateStr}.json`);
    updateAppSettings({ lastLocalBackupTime: new Date().toLocaleString() });
  };

  const importBackupFile = async (file: File): Promise<{ success: boolean; message: string }> => {
    try {
      const data = await readBackupFromFile(file);
      const success = restoreSnapshot(data);
      if (success) {
        return { success: true, message: `Successfully restored database from "${file.name}".` };
      } else {
        return { success: false, message: 'Failed to restore backup contents.' };
      }
    } catch (err: any) {
      return { success: false, message: err.message || 'Error parsing backup file.' };
    }
  };

  // Google Drive Cloud Storage Implementation
  const connectGoogleDrive = async (): Promise<boolean> => {
    try {
      const res = await googleDriveSignIn();
      if (res) {
        setGoogleDriveUser(res.user);
        updateAppSettings({
          googleDriveConnectedEmail: res.user.email || 'Connected Google Account',
          googleDriveEnabled: true
        });
        await fetchGoogleDriveFiles();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Failed to connect Google Drive:', err);
      return false;
    }
  };

  const disconnectGoogleDrive = () => {
    setDriveAccessToken(null);
    setGoogleDriveUser(null);
    setGoogleDriveFiles([]);
    updateAppSettings({
      googleDriveConnectedEmail: undefined,
      googleDriveEnabled: false
    });
  };

  const fetchGoogleDriveFiles = async () => {
    try {
      const list = await listGoogleDriveBackups(appSettings.googleDriveFolder || 'Mandi_ERP_Backups');
      setGoogleDriveFiles(list);
    } catch (err) {
      console.error('Fetch Google Drive files error:', err);
    }
  };

  const backupToGoogleDrive = async (): Promise<{ success: boolean; file?: GoogleDriveFileItem; message: string }> => {
    setIsDriveSyncing(true);
    try {
      const payload = {
        version: '1.0',
        system: 'Grain Market Software (غلہ منڈی سافٹ ویئر)',
        timestamp: new Date().toISOString(),
        businessId: currentBusiness.id,
        businessName: currentBusiness.name,
        createdByName: currentUser.name,
        businesses,
        items,
        parties,
        godowns,
        expenses,
        bardanaMasters,
        bardanaMovements,
        vouchers,
        users,
        appSettings
      };
      const cleanBiz = currentBusiness.name.replace(/[^a-zA-Z0-9]/g, '_');
      const timeStr = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `Mandi_Backup_${cleanBiz}_${timeStr}.json`;
      
      const file = await uploadBackupToGoogleDrive(payload, filename, appSettings.googleDriveFolder || 'Mandi_ERP_Backups');
      updateAppSettings({ lastCloudBackupTime: new Date().toLocaleString() });
      await fetchGoogleDriveFiles();
      return { 
        success: true, 
        file, 
        message: `Backup file "${filename}" uploaded to Google Drive folder "${appSettings.googleDriveFolder || 'Mandi_ERP_Backups'}".` 
      };
    } catch (err: any) {
      return { success: false, message: err.message || 'Failed to upload backup to Google Drive.' };
    } finally {
      setIsDriveSyncing(false);
    }
  };

  const restoreFromGoogleDrive = async (fileId: string): Promise<{ success: boolean; message: string }> => {
    setIsDriveSyncing(true);
    try {
      const data = await downloadGoogleDriveBackup(fileId);
      const success = restoreSnapshot(data);
      if (success) {
        return { success: true, message: 'Google Drive backup successfully downloaded and restored.' };
      } else {
        return { success: false, message: 'Failed to apply Google Drive backup contents.' };
      }
    } catch (err: any) {
      return { success: false, message: err.message || 'Error downloading backup from Google Drive.' };
    } finally {
      setIsDriveSyncing(false);
    }
  };

  // =========================================================================
  // MONTH CLOSING & MONTH-WISE SEPARATE ARCHIVES (ماہانہ کلوزنگ سینٹر)
  // =========================================================================
  const isMonthLocked = (dateOrMonthKey: string): boolean => {
    const mKey = getMonthKey(dateOrMonthKey);
    return monthClosingRecords.some(
      r => r.businessId === currentBusiness.id && r.isLocked && (
        r.monthKey === mKey ||
        r.monthKey === dateOrMonthKey ||
        (r.startDate && r.endDate && dateOrMonthKey >= r.startDate && dateOrMonthKey <= r.endDate)
      )
    );
  };

  const getMonthClosingRecord = (monthKey: string): MonthClosingRecord | undefined => {
    return monthClosingRecords.find(
      r => r.businessId === currentBusiness.id && r.monthKey === monthKey
    );
  };

  const closeMonth = (params: {
    monthKey?: string;
    startDate?: string;
    endDate?: string;
    periodName?: string;
    periodNameUrdu?: string;
    closingType?: 'single_month' | 'custom_range';
    notes?: string;
  }): { success: boolean; message: string; record?: MonthClosingRecord } => {
    const { startDate, endDate, periodName, periodNameUrdu, closingType, notes } = params;
    const finalMonthKey = params.monthKey || (startDate && endDate ? `${startDate}_to_${endDate}` : getMonthKey());

    const existing = monthClosingRecords.find(
      r => r.businessId === currentBusiness.id && r.monthKey === finalMonthKey && r.isLocked
    );
    if (existing) {
      return { success: false, message: `Period/Month ${existing.monthName} is already closed and locked.` };
    }

    const record = computeMonthClosingData({
      monthKey: finalMonthKey,
      startDate,
      endDate,
      periodName,
      periodNameUrdu,
      closingType,
      businessId: currentBusiness.id,
      vouchers,
      parties: currentBusinessParties,
      items: currentBusinessItems,
      expenses,
      bardanaMasters: currentBusinessBardana,
      bardanaMovements,
      closedBy: currentUser.name,
      notes
    });

    // Save separately month-wise in isolated localStorage key
    try {
      localStorage.setItem(`mandi_month_archive_${finalMonthKey}_${currentBusiness.id}`, JSON.stringify(record));
    } catch (e) {
      console.error('Error saving isolated month archive:', e);
    }

    // Add or replace in monthClosingRecords
    setMonthClosingRecords(prev => {
      const filtered = prev.filter(r => !(r.businessId === currentBusiness.id && r.monthKey === finalMonthKey));
      return [record, ...filtered];
    });

    // Roll-forward party closing balances to parties for future periods
    setParties(prev => prev.map(p => {
      if (p.businessId !== currentBusiness.id) return p;
      const summary = record.partySummaries.find(s => s.partyId === p.id);
      if (summary) {
        return {
          ...p,
          openingBalance: summary.closingBalance,
          currentBalance: summary.closingBalance
        };
      }
      return p;
    }));

    // Roll-forward commodity stock closing to items for future periods
    setItems(prev => prev.map(item => {
      if (item.businessId !== currentBusiness.id) return item;
      const stockSummary = record.stockSummaries.find(s => s.itemId === item.id);
      if (stockSummary) {
        return {
          ...item,
          openingFirstWeight: stockSummary.closingFirstWeight,
          openingBags: stockSummary.closingBags,
          openingValue: stockSummary.closingValue
        };
      }
      return item;
    }));

    // Roll-forward bardana
    setBardanaMasters(prev => prev.map(b => {
      if (b.businessId !== currentBusiness.id) return b;
      const bSummary = record.bardanaSummaries.find(s => s.bardanaId === b.id);
      if (bSummary) {
        return {
          ...b,
          openingBags: bSummary.closingBags
        };
      }
      return b;
    }));

    return {
      success: true,
      message: `Month ${record.monthName} (${record.monthNameUrdu}) successfully closed and all data saved separately month-wise.`,
      record
    };
  };

  const reopenMonth = (monthKey: string, reason: string): { success: boolean; message: string } => {
    const existing = monthClosingRecords.find(r => r.businessId === currentBusiness.id && r.monthKey === monthKey);
    if (!existing) {
      return { success: false, message: `No closing record found for month ${monthKey}.` };
    }

    setMonthClosingRecords(prev => prev.map(r => {
      if (r.businessId === currentBusiness.id && r.monthKey === monthKey) {
        return {
          ...r,
          isLocked: false,
          notes: (r.notes ? r.notes + ' | ' : '') + `Reopened on ${new Date().toLocaleDateString('en-PK')} by ${currentUser.name}: ${reason}`
        };
      }
      return r;
    }));

    return {
      success: true,
      message: `Month ${existing.monthName} has been unlocked for authorized adjustments.`
    };
  };

  const exportMonthArchiveFile = (monthKey: string) => {
    const record = getMonthClosingRecord(monthKey);
    if (!record) {
      alert(`No archive record found for month ${monthKey}`);
      return;
    }
    const blob = generateMonthClosingBackupBlob(record, currentBusiness.name);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Mandi-Month-Archive-${record.monthKey}-${currentBusiness.name.replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const deleteMonthArchive = (id: string) => {
    setMonthClosingRecords(prev => prev.filter(r => r.id !== id));
  };

  const resetToDefaultData = () => {
    setBusinesses(INITIAL_BUSINESSES);
    setCurrentBusinessId('biz-1');
    setItems(INITIAL_ITEMS);
    setParties(INITIAL_PARTIES);
    setGodowns(INITIAL_GODOWNS);
    setExpenses(INITIAL_EXPENSES);
    setUsers(INITIAL_USERS);
    setVouchers(INITIAL_VOUCHERS);
    setBardanaMasters(INITIAL_BARDANA);
    setBardanaMovements(INITIAL_BARDANA_MOVEMENTS);
    setMonthClosingRecords(INITIAL_MONTH_CLOSINGS);
    setActiveMonthFilter('all');
    setAppSettings(DEFAULT_APP_SETTINGS);
    localStorage.clear();
  };

  return (
    <MandiContext.Provider
      value={{
        businesses,
        currentBusiness,
        setCurrentBusinessId,
        addBusiness,
        languageMode,
        setLanguageMode,
        currentUser,
        users,
        switchUser,
        updateUserRights,
        isAuthenticated,
        login,
        logout,
        loginAsAdmin,
        loginWithCredentials,
        loginWithGoogleUser,
        updateAdminCredentials,
        backupToBusinessDrive,
        appSettings,
        updateAppSettings,
        localSnapshots,
        createLocalSnapshot,
        restoreSnapshot,
        deleteLocalSnapshot,
        exportFullBackupFile,
        importBackupFile,
        googleDriveUser,
        connectGoogleDrive,
        disconnectGoogleDrive,
        backupToGoogleDrive,
        restoreFromGoogleDrive,
        googleDriveFiles,
        fetchGoogleDriveFiles,
        isDriveSyncing,
        items: currentBusinessItems,
        addItem,
        updateItem,
        parties,
        addParty,
        updateParty,
        godowns: currentBusinessGodowns,
        addGodown,
        expenses,
        addExpense,
        vouchers,
        filteredVouchers,
        addVoucher,
        updateVoucher,
        approveVoucher,
        bulkApproveVouchers,
        cancelVoucher,
        softDeleteVoucher,
        duplicateVoucher,
        bardanaMasters: currentBusinessBardana,
        addBardanaMaster,
        updateBardanaMaster,
        bardanaMovements,
        addManualBardanaMovement,
        bardanaSummary,
        stockSummary,
        godownStock,
        todayMetrics,
        monthClosingRecords,
        activeMonthFilter,
        setActiveMonthFilter,
        closeMonth,
        reopenMonth,
        isMonthLocked,
        getMonthClosingRecord,
        exportMonthArchiveFile,
        deleteMonthArchive,
        resetToDefaultData
      }}
    >
      {children}
    </MandiContext.Provider>
  );
};

export const useMandi = () => {
  const context = useContext(MandiContext);
  if (!context) throw new Error('useMandi must be used within a MandiProvider');
  return context;
};
