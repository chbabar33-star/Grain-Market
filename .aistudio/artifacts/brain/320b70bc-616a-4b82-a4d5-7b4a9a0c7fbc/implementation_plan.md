# Grain Market Software (غلہ منڈی سافٹ ویئر) - 26-Point Mandi ERP System

Production-ready, 100% offline-capable Grain Market ERP application designed for commission agents (*Arthi*), commodity traders, and grain stockists in Pakistan. Features comprehensive bilingual Urdu (Jameel Noori Nastaleeq) and English interfaces, precise First Weight costing math, godown and bag management, dual-style P&L reports, instant Action Centre, multi-business management, print templates with QR codes, and Google Sheets backup.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> Key architectural parameters confirmed from project specifications and initial configuration:

- **Primary Business Profile**: Pre-configured with **NAZAR SOON CORPORATION** (`نظر سون کارپوریشن`), with instant support for adding and switching across unlimited businesses (e.g., Ali Traders, Ahmed Grain Merchants) without logging out.
- **Language & Typography**: Dual bilingual default (English with Urdu Jameel Noori Nastaleeq script subtitles), featuring an instant header switcher between **Both (دونوں)**, **Urdu (اردو)**, and **English**.
- **Currency & Format**: Strictly locked to **PKR (Rs. / روپے)** with `0.00` decimal formatting, rates per 40KG (`Rs./40KG` or `روپے فی من`), and dual English + Urdu words generation (e.g. *Total Amount Rs. 1,25,000 - One Lac Twenty Five Thousand Rupees Only / کل رقم ایک لاکھ پچیس ہزار روپے*).
- **Offline First & Persistence**: Standalone offline client architecture storing all records in resilient local IndexedDB state with export/import capabilities, plus Google Sheets cloud sync via Google Workspace integration.

---

## 1. Overview & Core Concept

### What It Does
An all-in-one commodity market ERP catering to grain mandis (wheat, rice, maize, cotton, pulses, mustard, etc.). It automates:
- Weighbridge intake and deduction calculations (Gross, Tare, First Weight, Bardana, Moisture, Other Deductions, Net Weight).
- Costing and averages calculated strictly on **First Weight** ($Gross - Tare$).
- Item-wise direct and indirect expense allocations.
- Double-entry ledger accounting, Day Book, and Party Ledgers.
- 2 distinct Profit & Loss views: **QuickBooks Multi-Step Format** and **BUSY T-Account Format**.
- Centralized **Action Centre** with bulk approvals, soft-delete audit trail, WhatsApp slip dispatch, and A4/Thermal 80mm printing.

### Target Persona
Mandi commission shops (*Aarth*), grain stockists, godown managers, weighbridge operators, and accounting accountants managing hundreds of bags and metric tons daily.

---

## 2. User Experience & Visual Design

### Visual Identity & Theme
- **Aesthetic**: Utilitarian, dense high-productivity financial workstation inspired by high-end accounting software (QuickBooks & BUSY) combined with culturally authentic Pakistani Mandi aesthetics.
- **Color Palette (60-30-10 Rule)**:
  - *60% Neutral Canvas*: Slate-50 light workspace (`#F8FAFC`) with subtle crisp borders (`#E2E8F0`).
  - *30% Structural Surfaces*: Pure white cards and tables (`#FFFFFF`), charcoal headers (`#0F172A`), and accounting table accents (Light Yellow `#FEF9C3` for subtotals, Light Green `#DCFCE7` with bold text for grand totals).
  - *10% Accent Budget*: Deep Emerald Green (`#047857`) for positive financial outcomes, primary saves, and WhatsApp integrations; Rich Navy (`#1E3A8A`) for printing and navigation; Amber/Rose for approvals and deductions.
- **Typography**:
  - *Urdu*: Embedded `Jameel Noori Nastaleeq` and system Arabic/Nastaleeq fallback (`Noto Nastaliq Urdu`, `PakType Naskh`) with kasheeda baseline alignment.
  - *English & Numbers*: `Plus Jakarta Sans` for labels, paired strictly with `font-mono tabular-nums` for all weights, bag counts, rates, and rupee currency totals.

### Navigation & Top Bar Contract
The top header strictly follows the 3-zone contract:
- **Left (Brand & Business Switcher)**: `NAZAR SOON CORPORATION` wordmark with rapid business selector dropdown (`+ Add New Business`).
- **Center (Navigation Links & Modules)**: Dashboard, Action Centre, Purchase, Sales, Transfers, Reports, P&L, Masters, Settings.
- **Right (Actions & Utility)**: Language Toggle (`Both / اردو / EN`), Google Sheets Cloud Sync, Current Session / Role badge (`Admin`).

---

## 3. Detailed 26 Points Implementation Matrix

```
┌────────────────────────────────────────────────────────────────────────┐
│                        GRAIN MARKET ERP WORKFLOW                        │
├─────────────────────┬──────────────────────┬───────────────────────────┤
│ 1. WEIGHBRIDGE      │ 2. VOUCHER ENTRY     │ 3. ACTION CENTRE          │
│ • Gross Weight (KG) │ • Auto Voucher #     │ • Status: Pending/Approved│
│ • Tare Weight (KG)  │ • First Weight Cost  │ • Single/Bulk Approve     │
│ • First Weight Auto │ • Exp Allocation     │ • A4 Standard/Modern/80mm │
│ • Bardana/Moisture  │ • Bag Counts Live    │ • WhatsApp / Excel / Audit│
└──────────┬──────────┴──────────┬───────────┴─────────────┬─────────────┘
           │                     │                         │
           ▼                     ▼                         ▼
┌─────────────────────┬──────────────────────┬───────────────────────────┐
│ 4. CLOSING STOCK    │ 5. P&L ANALYSIS      │ 6. GOOGLE SHEETS BACKUP   │
│ • Closing F.Weight  │ • QuickBooks Style   │ • 1-Click Cloud Push      │
│ • Closing Bags      │ • BUSY T-Account     │ • Local JSON/Excel Export │
│ • Weighted Avg Rate │ • Item & Party Wise  │ • Complete Disaster Safe  │
└─────────────────────┴──────────────────────┴───────────────────────────┘
```

1. **Weight System**:
   - `Gross - Tare = First Weight` (Locked costing basis).
   - `Net Weight = First Weight - (Bardana KG + Moisture KG + Other KG)`.
   - Real-time calculation on typing with instant visual deduction breakdown.
2. **Purchase Entry**:
   - Auto Voucher No (`PUR-0001`), Date, Party (Eng+Urdu), Item (Eng+Urdu), Godown, Bags.
   - Costing: `Amount = (First Weight / 40) * Rate`.
   - Expenses section (Labour, Transport, Commission, Market Fee). Total = Purchase Amount + Expenses.
3. **Expense Master**:
   - Direct (Freight, Labour, Loading) vs Indirect (Shop Rent, Office Expenses). Default amounts and accounts.
4. **Formulas**:
   - Purchase Avg: `(Purchase Amount + Total Expenses) / First Weight * 40`.
   - Sales Avg: `Sales Value / First Weight * 40`.
5. **Closing Stock**:
   - `Closing First Wt = Opening + Purchased - Sold`.
   - `Closing Bags = Opening Bags + Purchased Bags - Sold Bags`.
   - `Closing Value = Opening Value + Purchased Value - Sold Value`.
   - `Closing Avg = Closing Value / Closing First Wt * 40`.
6. **Sales Entry**:
   - Auto Voucher No (`SAL-0001`), Party, Item, Godown, Bags, First Weight, Rate/40KG, Value, Sales Expense.
7. **P&L Engine**:
   - Profit calculation: `Sales Value - (Sold First Weight / 40 * Purchase Avg) - Sales Expenses`.
   - Drill-down modal to party ledger and stock transaction history.
8. **Masters**:
   - Items, Categories, Units, Expense Types, Deduction Types, Parties (Supplier/Customer/Both with opening balances), Godowns, Users.
9. **Bag Tracking**:
   - Pure physical count tracking per transaction, godown-wise balance.
10. **Godown Transfers**:
    - Transfer Slip No, From Godown, To Godown, First Weight, Bags, Expense, Status. Prevents cross-business transfer.
11. **Action Centre**:
    - Central control table with filters (Date, Item, Party, Godown, User, Status, Amount, Weight).
    - Row actions: Print (A4 Standard, A4 Modern, Thermal 80mm with QR), Edit, Soft-delete with reason, Approve, Cancel, Duplicate, Audit History, Excel Export, WhatsApp dispatch.
    - Bulk batch actions with multi-row checkboxes.
12. **Approval System**:
    - Default status is `Pending` (does not affect stock). Manager/Admin approval commits to stock ledger. Cancel reverses effects.
13. **User Rights Matrix & Session Management**:
    - Roles: Admin, Manager, Operator, Viewer.
    - Granular module matrix (Add, Edit, Delete, View, Print, Approve, Export).
    - Session tracking with user action audit log.
14. **Printing System**:
    - 3 distinct print engines: A4 Standard (Classic bordered), A4 Modern (Clean header), Thermal 80mm (Mandi receipt).
    - Includes QR code with voucher verification, bilingual table headers, and PKR words in English and Urdu.
15. **Reports Suite**:
    - Stock Ledger, Closing Stock Register, Purchase/Sales/Transfer/Expense Registers, Party Ledger (Debit/Credit/Balance), Day Book, Audit Trail.
    - Light Yellow subtotal rows, Light Green bold 14px grand total rows.
16. **Dashboard**:
    - KPI cards (Today Purchase F.Weight, Bags, Amount; Sales F.Weight, Bags, Amount; Today Expense; Today Profit; Stock Value & Bags; Pending Approvals).
    - Monthly profit bar chart and item stock distribution. Top 5 items, recent vouchers, low stock alerts.
17. **Item-Wise Expense Allocation**:
    - Multi-item allocation by First Weight ratio, by Amount ratio, or manual adjustment.
18. **Multi-Business Architecture**:
    - Unlimited business profiles with isolated parties, godowns, vouchers, closing stock, and settings.
19. **WhatsApp Integration**:
    - Auto-composed bilingual WhatsApp messages with formatted slips and direct `https://wa.me/` sending.
20. **PKR Currency & Number Formatting**:
    - Subtotal/Grand totals formatted as `Rs. 50,000.00` with numbers-to-words algorithm in Urdu and English.
21. **Excel Generation & Export**:
    - Instant client-side spreadsheet export with bilingual headers, formatted columns, yellow subtotals, and green grand totals.
22. **QuickBooks & BUSY P&L Styles**:
    - Toggle between QuickBooks multi-step vertical breakdown and BUSY horizontal T-format account.
23. **Google Sheets Sync**:
    - Integrated cloud sync for automated backup of vouchers and closing stock.

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                          SYSTEM ARCHITECTURE                           │
├────────────────────────────────────────────────────────────────────────┤
│                           React 19 + Vite                              │
│                                                                        │
│  ┌───────────────────┐  ┌───────────────────┐  ┌───────────────────┐  │
│  │   Top Navigation  │  │  Language Engine  │  │  Business Manager │  │
│  │  (3-Zone Header)  │  │  (Urdu + English) │  │  (Multi-Profile)  │  │
│  └─────────┬─────────┘  └─────────┬─────────┘  └─────────┬─────────┘  │
│            └──────────────────────┼──────────────────────┘            │
│                                   ▼                                    │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                     App Views & Workspaces                       │  │
│  │ • Dashboard  • Purchase Entry  • Sales Entry  • Godown Transfer │  │
│  │ • Action Centre  • QuickBooks & BUSY P&L  • Reports & Daybook    │  │
│  │ • Masters (Items, Parties, Godowns)  • User Rights & Sessions    │  │
│  │ • Print Engine (A4 Standard, A4 Modern, 80mm Thermal + QR)       │  │
│  └────────────────────────────────┬─────────────────────────────────┘  │
│                                   ▼                                    │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                   State & Offline Storage Layer                  │  │
│  │ • IndexedDB & LocalStorage Engine (Zero Network Dependency)      │  │
│  │ • Excel Export Engine (XLSX Format with Stylized Headers)        │  │
│  │ • Google Sheets Cloud Sync Integration                          │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

### Data Entities
- `Business`: ID, name (Eng+Urdu), address, phone, NTN, logo.
- `Party`: ID, businessId, name (Eng+Urdu), phone/WhatsApp, address, type (Supplier/Customer/Both), openingBalance.
- `Item`: ID, businessId, name (Eng+Urdu), category, unit, defaultRate, openingFirstWeight, openingValue, openingBags.
- `Godown`: ID, businessId, name (Eng+Urdu), location.
- `Voucher`: ID, voucherNo, businessId, type (Purchase/Sale/Transfer), date, partyId, itemId, godownId, grossWeight, tareWeight, firstWeight, bardanaKg, moistureKg, otherDeductionsKg, netWeight, bags, ratePer40Kg, baseAmount, expenses (array of allocations), totalAmount, status (Pending/Approved/Cancelled), auditLog.
- `ExpenseMaster`: ID, businessId, name (Eng+Urdu), type (Direct/Indirect), defaultAmount.
- `User`: ID, name, mobile, email, role (Admin/Manager/Operator/Viewer), businessAccess, menuRights.

---

## 5. Verification Plan

1. **Math & Formula Auditing**:
   - Verify `First Weight = Gross - Tare`.
   - Verify `Amount = (First Weight / 40) * Rate`.
   - Verify `Net Weight = First Weight - Deductions`.
   - Verify `Purchase Avg = (Amount + Expenses) / First Weight * 40`.
2. **Stock & Approval State Transitions**:
   - Verify that vouchers in `Pending` state do not modify stock ledger or closing balances.
   - Verify that clicking `Approve` in Action Centre immediately updates Godown and Item closing stock and bags.
3. **Dual P&L Accuracy**:
   - Verify QuickBooks multi-step statement matches BUSY T-Account Net Profit down to the rupee.
4. **Print & Layout Testing**:
   - Verify print previews for A4 Standard, A4 Modern, and Thermal 80mm receipts render crisp Urdu typography, QR code, and bilingual labels.
5. **Excel & Sheets Export**:
   - Verify table exports include subtotal and grand total styling with accurate PKR currency formats.
