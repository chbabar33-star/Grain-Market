/**
 * Mandi ERP - Masters Management (Point 8 & Barbara Tracker Master)
 * 1. Items (with Opening First Weight, Bags & Value)
 * 2. Parties (Farmer Suppliers & Mill/Trader Customers)
 * 3. Godowns (Warehouses & Bag Capacities)
 * 4. Expenses (Direct & Indirect Expense Heads)
 * 5. Barbara Tracker Master (Separate Master - Zero Weight Impact, Inward/Outward Bag Registry)
 */

import React, { useState } from 'react';
import {
  Package,
  Users,
  Warehouse,
  Receipt,
  Plus,
  Box,
  Layers,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useMandi } from '../context/MandiContext';
import { Item, Party, Godown, ExpenseMaster, BardanaMaster } from '../types';
import { formatPKR } from '../utils/numberToWords';

export const Masters: React.FC = () => {
  const {
    currentBusiness,
    items,
    addItem,
    parties,
    addParty,
    godowns,
    addGodown,
    expenses,
    addExpense,
    bardanaMasters,
    addBardanaMaster,
    bardanaSummary,
    bardanaMovements,
    addManualBardanaMovement,
    vouchers
  } = useMandi();

  const [activeMasterTab, setActiveMasterTab] = useState<'items' | 'parties' | 'godowns' | 'expenses' | 'bardana'>('items');

  // New Item State
  const [showItemModal, setShowItemModal] = useState(false);
  const [newItem, setNewItem] = useState({
    name: '',
    nameUrdu: '',
    category: 'Grains',
    unit: '40KG (من)',
    defaultRate: 3800,
    openingFirstWeight: 0,
    openingBags: 0,
    openingValue: 0
  });

  // New Party State
  const [showPartyModal, setShowPartyModal] = useState(false);
  const [newParty, setNewParty] = useState({
    name: '',
    nameUrdu: '',
    phone: '',
    whatsapp: '',
    address: '',
    addressUrdu: '',
    type: 'Supplier' as 'Supplier' | 'Customer' | 'Both',
    openingBalance: 0
  });

  // New Godown State
  const [showGodownModal, setShowGodownModal] = useState(false);
  const [newGodown, setNewGodown] = useState({
    name: '',
    nameUrdu: '',
    location: '',
    capacityBags: 2000
  });

  // New Expense State
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [newExpense, setNewExpense] = useState({
    name: '',
    nameUrdu: '',
    type: 'Direct' as 'Direct' | 'Indirect',
    defaultAmount: 20
  });

  // New Barbara Master State
  const [showBardanaModal, setShowBardanaModal] = useState(false);
  const [newBardana, setNewBardana] = useState({
    name: '',
    nameUrdu: '',
    category: 'Jute' as 'Jute' | 'PP' | 'Cotton' | 'Other',
    openingBags: 1000,
    remarks: ''
  });

  // Manual Bag Movement Modal State
  const [showMovementModal, setShowMovementModal] = useState(false);
  const [newMovement, setNewMovement] = useState({
    type: 'MANUAL_RETURN' as 'MANUAL_RETURN' | 'MANUAL_ISSUE',
    bardanaId: bardanaMasters[0]?.id || '',
    partyId: parties[0]?.id || '',
    godownId: godowns[0]?.id || '',
    bags: 100,
    remarks: ''
  });

  // Handlers
  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name.trim()) return;
    addItem(newItem);
    setShowItemModal(false);
    setNewItem({
      name: '',
      nameUrdu: '',
      category: 'Grains',
      unit: '40KG (من)',
      defaultRate: 3800,
      openingFirstWeight: 0,
      openingBags: 0,
      openingValue: 0
    });
  };

  const handleCreateParty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newParty.name.trim()) return;
    addParty(newParty);
    setShowPartyModal(false);
    setNewParty({
      name: '',
      nameUrdu: '',
      phone: '',
      whatsapp: '',
      address: '',
      addressUrdu: '',
      type: 'Supplier',
      openingBalance: 0
    });
  };

  const handleCreateGodown = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGodown.name.trim()) return;
    addGodown(newGodown);
    setShowGodownModal(false);
    setNewGodown({
      name: '',
      nameUrdu: '',
      location: '',
      capacityBags: 2000
    });
  };

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpense.name.trim()) return;
    addExpense(newExpense);
    setShowExpenseModal(false);
    setNewExpense({
      name: '',
      nameUrdu: '',
      type: 'Direct',
      defaultAmount: 20
    });
  };

  const handleCreateBardana = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBardana.name.trim()) return;
    addBardanaMaster(newBardana);
    setShowBardanaModal(false);
    setNewBardana({
      name: '',
      nameUrdu: '',
      category: 'Jute',
      openingBags: 1000,
      remarks: ''
    });
  };

  const handleRecordMovement = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMovement.bags <= 0) return;
    const selectedB = bardanaMasters.find(b => b.id === newMovement.bardanaId) || bardanaMasters[0];
    const selectedP = parties.find(p => p.id === newMovement.partyId);
    const selectedG = godowns.find(g => g.id === newMovement.godownId);

    addManualBardanaMovement({
      date: new Date().toISOString().slice(0, 10),
      voucherNo: `BMOV-${Math.floor(1000 + Math.random() * 9000)}`,
      type: newMovement.type,
      partyId: selectedP?.id,
      partyName: selectedP?.name,
      partyNameUrdu: selectedP?.nameUrdu,
      godownId: selectedG?.id,
      godownName: selectedG?.name,
      bardanaId: selectedB?.id || 'bard-1',
      bardanaName: selectedB?.name || 'Standard Bardana',
      bardanaNameUrdu: selectedB?.nameUrdu,
      inwardBags: newMovement.type === 'MANUAL_RETURN' ? newMovement.bags : 0,
      outwardBags: newMovement.type === 'MANUAL_ISSUE' ? newMovement.bags : 0,
      remarks: newMovement.remarks || (newMovement.type === 'MANUAL_RETURN' ? 'Manual Return from Party' : 'Manual Issue to Party')
    });

    setShowMovementModal(false);
    setNewMovement({
      type: 'MANUAL_RETURN',
      bardanaId: bardanaMasters[0]?.id || '',
      partyId: parties[0]?.id || '',
      godownId: godowns[0]?.id || '',
      bags: 100,
      remarks: ''
    });
  };

  // Aggregated Barbara Stats
  const totalBardanaOpening = bardanaSummary.reduce((a, b) => a + (b.openingBags || 0), 0);
  const totalBardanaReceived = bardanaSummary.reduce((a, b) => a + (b.receivedBags || 0), 0);
  const totalBardanaIssued = bardanaSummary.reduce((a, b) => a + (b.issuedBags || 0), 0);
  const totalBardanaClosing = bardanaSummary.reduce((a, b) => a + (b.closingBags || 0), 0);

  return (
    <div className="space-y-4">
      {/* HEADER */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Mandi Masters Database</span>
            <span className="text-slate-400 font-normal">|</span>
            <span className="font-urdu text-base text-slate-700">بنیادی ڈیٹا و کھاتے</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure commodities, farmer/trader parties, godowns, expenses, and separate Barbara (Bardana) bag masters for {currentBusiness.name}.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {activeMasterTab === 'items' && (
            <button
              onClick={() => setShowItemModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Item (نئی جنس)</span>
            </button>
          )}
          {activeMasterTab === 'parties' && (
            <button
              onClick={() => setShowPartyModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Party (نیا کھاتہ دار)</span>
            </button>
          )}
          {activeMasterTab === 'godowns' && (
            <button
              onClick={() => setShowGodownModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Godown (نیا گودام)</span>
            </button>
          )}
          {activeMasterTab === 'expenses' && (
            <button
              onClick={() => setShowExpenseModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>+ Add Expense (نیا خرچہ)</span>
            </button>
          )}
          {activeMasterTab === 'bardana' && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowMovementModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-purple-100 hover:bg-purple-200 text-purple-900 rounded-lg text-xs font-bold transition-colors shadow-2xs"
              >
                <ArrowDownLeft className="w-4 h-4 text-purple-700" />
                <span>+ Bag Movement (آمد / اخراج)</span>
              </button>
              <button
                onClick={() => setShowBardanaModal(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-purple-900 hover:bg-purple-800 text-white rounded-lg text-xs font-bold shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add Barbara Master (نیا باردانہ ماسٹر)</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* MASTER SELECTOR TABS */}
      <div className="flex flex-wrap items-center p-1 bg-white rounded-xl border border-slate-200 shadow-2xs w-fit gap-1">
        <button
          onClick={() => setActiveMasterTab('items')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-colors ${
            activeMasterTab === 'items' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Items / اجناس ({items.length})</span>
        </button>

        <button
          onClick={() => setActiveMasterTab('parties')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-colors ${
            activeMasterTab === 'parties' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Parties / پارٹیاں ({parties.length})</span>
        </button>

        <button
          onClick={() => setActiveMasterTab('godowns')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-colors ${
            activeMasterTab === 'godowns' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Warehouse className="w-4 h-4" />
          <span>Godowns / گودام ({godowns.length})</span>
        </button>

        <button
          onClick={() => setActiveMasterTab('expenses')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-colors ${
            activeMasterTab === 'expenses' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Expenses / اخراجات ({expenses.length})</span>
        </button>

        <button
          onClick={() => setActiveMasterTab('bardana')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-colors ${
            activeMasterTab === 'bardana' ? 'bg-purple-900 text-white shadow-xs' : 'text-purple-700 hover:bg-purple-50'
          }`}
        >
          <Box className="w-4 h-4 text-purple-400" />
          <span>Barbara Tracker / باردانہ ماسٹر ({bardanaMasters.length})</span>
        </button>
      </div>

      {/* TAB CONTENT TABLES */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        
        {/* ============================================================== */}
        {/* 1. ITEMS MASTER                                                */}
        {/* ============================================================== */}
        {activeMasterTab === 'items' && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white font-semibold text-[11px] uppercase">
                  <th className="py-3 px-3">Item Name</th>
                  <th className="py-3 px-3">Urdu Name</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Unit</th>
                  <th className="py-3 px-3 text-right">Default Rate (PKR)</th>
                  <th className="py-3 px-3 text-right">Opening First Wt</th>
                  <th className="py-3 px-3 text-right">Opening Bags</th>
                  <th className="py-3 px-3 text-right">Opening Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {items.map(i => (
                  <tr key={i.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-bold text-slate-900">{i.name}</td>
                    <td className="py-2.5 px-3 font-urdu text-sm text-slate-700">{i.nameUrdu}</td>
                    <td className="py-2.5 px-3">{i.category}</td>
                    <td className="py-2.5 px-3 font-mono">{i.unit}</td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums">{i.defaultRate.toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums">{i.openingFirstWeight.toLocaleString()} KG</td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums">{i.openingBags.toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums font-bold text-slate-900">{formatPKR(i.openingValue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ============================================================== */}
        {/* 2. PARTIES MASTER                                              */}
        {/* ============================================================== */}
        {activeMasterTab === 'parties' && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white font-semibold text-[11px] uppercase">
                  <th className="py-3 px-3">Party Name</th>
                  <th className="py-3 px-3">Urdu Name</th>
                  <th className="py-3 px-3">Type</th>
                  <th className="py-3 px-3">Phone / WhatsApp</th>
                  <th className="py-3 px-3">Address</th>
                  <th className="py-3 px-3 text-right">Opening Balance</th>
                  <th className="py-3 px-3 text-right">Current Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {parties.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-bold text-slate-900">{p.name}</td>
                    <td className="py-2.5 px-3 font-urdu text-sm text-slate-700">{p.nameUrdu}</td>
                    <td className="py-2.5 px-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        p.type === 'Supplier' ? 'bg-blue-100 text-blue-800' :
                        p.type === 'Customer' ? 'bg-emerald-100 text-emerald-800' : 'bg-purple-100 text-purple-800'
                      }`}>
                        {p.type}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">{p.phone}</td>
                    <td className="py-2.5 px-3 text-slate-600 truncate max-w-xs">{p.address}</td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums">{formatPKR(p.openingBalance)}</td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums font-bold text-slate-900">{formatPKR(p.currentBalance)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ============================================================== */}
        {/* 3. GODOWNS MASTER                                             */}
        {/* ============================================================== */}
        {activeMasterTab === 'godowns' && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white font-semibold text-[11px] uppercase">
                  <th className="py-3 px-3">Godown Name</th>
                  <th className="py-3 px-3">Urdu Name</th>
                  <th className="py-3 px-3">Location / Yard</th>
                  <th className="py-3 px-3 text-right">Capacity (Bags)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {godowns.map(g => (
                  <tr key={g.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-bold text-slate-900">{g.name}</td>
                    <td className="py-2.5 px-3 font-urdu text-sm text-slate-700">{g.nameUrdu}</td>
                    <td className="py-2.5 px-3 text-slate-600">{g.location}</td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums">{g.capacityBags?.toLocaleString() || 2000} Bags</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ============================================================== */}
        {/* 4. EXPENSES MASTER                                             */}
        {/* ============================================================== */}
        {activeMasterTab === 'expenses' && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white font-semibold text-[11px] uppercase">
                  <th className="py-3 px-3">Expense Head</th>
                  <th className="py-3 px-3">Urdu Head</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3 text-right">Default Amount / Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {expenses.map(e => (
                  <tr key={e.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-bold text-slate-900">{e.name}</td>
                    <td className="py-2.5 px-3 font-urdu text-sm text-slate-700">{e.nameUrdu}</td>
                    <td className="py-2.5 px-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        e.type === 'Direct' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-800'
                      }`}>
                        {e.type} Expense
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums font-bold">
                      {formatPKR(e.defaultAmount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ============================================================== */}
        {/* 5. BARBARA TRACKER MASTER (SEPARATE MASTER & BAG REGISTRY)    */}
        {/* ============================================================== */}
        {activeMasterTab === 'bardana' && (
          <div className="p-4 space-y-4">
            
            {/* KPI STATS CARDS */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-xl">
                <span className="text-[10px] font-bold uppercase text-purple-700">Barbara Master Types</span>
                <div className="text-xl font-mono font-black text-purple-950 mt-0.5">
                  {bardanaMasters.length} Types
                </div>
                <div className="font-urdu text-[11px] text-purple-800">کل اقسام باردانہ</div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="text-[10px] font-bold uppercase text-slate-500">Opening Bags (ابتدائی)</span>
                <div className="text-xl font-mono font-black text-slate-900 mt-0.5">
                  {totalBardanaOpening.toLocaleString()}
                </div>
                <div className="text-[10px] text-slate-500">Registered Opening Stock</div>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                <span className="text-[10px] font-bold uppercase text-emerald-700">Received (+) [Purchase]</span>
                <div className="text-xl font-mono font-black text-emerald-950 mt-0.5">
                  +{totalBardanaReceived.toLocaleString()}
                </div>
                <div className="font-urdu text-[11px] text-emerald-800">کل موصولہ بوریاں</div>
              </div>

              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl">
                <span className="text-[10px] font-bold uppercase text-rose-700">Issued (-) [Sales Outward]</span>
                <div className="text-xl font-mono font-black text-rose-950 mt-0.5">
                  -{totalBardanaIssued.toLocaleString()}
                </div>
                <div className="font-urdu text-[11px] text-rose-800">کل خارج شدہ بوریاں</div>
              </div>
            </div>

            {/* STRICT USER MANDI RULE BANNER */}
            <div className="p-3.5 rounded-xl bg-purple-900 text-white flex items-start gap-3 shadow-xs">
              <div className="p-2 rounded-lg bg-white/10 text-purple-200 shrink-0">
                <Box className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="text-xs font-bold uppercase tracking-wider text-purple-200 flex items-center gap-2">
                  <span>Strict Mandi Master Rule: Zero Weight Impact</span>
                  <span className="px-2 py-0.5 rounded-full bg-purple-800 text-[10px] text-purple-100 font-normal">
                    Separate Master
                  </span>
                </div>
                <p className="text-xs text-purple-100 leading-relaxed">
                  Barbara tracker is a separate master. While making a purchase entry, only the number of bags received is noted — these figures have <strong>NO impact on weight</strong>, they are only recorded in the Barbara register. In sales entries, the number of bags going out is <strong>minused in the Barbara register</strong>.
                </p>
                <div className="font-urdu text-xs text-purple-200 pt-0.5">
                  باردانہ ٹریکر ایک مکمل علیحدہ ماسٹر ہے۔ خریداری اندراج میں موصولہ بوریوں کی تعداد نوٹ ہوتی ہے جس کا وزن پر کوئی اثر نہیں ہوتا۔ فروخت اندراج میں خارج شدہ بوریوں کی تعداد باردانہ رجسٹر میں منفی (Minus) ہوتی ہے۔
                </div>
              </div>
            </div>

            {/* BARBARA MASTERS TABLE */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4 text-purple-700" />
                  <span>Barbara Master Definitions & Inventory Stock</span>
                </h3>
                <span className="font-urdu text-xs text-slate-600">باردانہ اقسام و موجودہ اسٹاک پوزیشن</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-900 text-white font-semibold text-[11px] uppercase">
                      <th className="py-3 px-3">Barbara Name / قسم</th>
                      <th className="py-3 px-3">Urdu Name</th>
                      <th className="py-3 px-3">Category</th>
                      <th className="py-3 px-3 text-right">Opening Bags</th>
                      <th className="py-3 px-3 text-right text-emerald-300">Purch Received (+)</th>
                      <th className="py-3 px-3 text-right text-rose-300">Sales Issued (-)</th>
                      <th className="py-3 px-3 text-right font-black text-amber-200 bg-slate-800">In-Stock Balance</th>
                      <th className="py-3 px-3">Remarks / تفصیل</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {bardanaSummary.map(b => (
                      <tr key={b.bardanaId} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-bold text-slate-900">{b.name}</td>
                        <td className="py-2.5 px-3 font-urdu text-sm text-slate-700">{b.nameUrdu}</td>
                        <td className="py-2.5 px-3">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            b.category === 'Jute' ? 'bg-amber-100 text-amber-800' :
                            b.category === 'PP' ? 'bg-blue-100 text-blue-800' :
                            b.category === 'Cotton' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'
                          }`}>
                            {b.category}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono tabular-nums">{b.openingBags.toLocaleString()}</td>
                        <td className="py-2.5 px-3 text-right font-mono tabular-nums font-bold text-emerald-700">+{b.receivedBags.toLocaleString()}</td>
                        <td className="py-2.5 px-3 text-right font-mono tabular-nums font-bold text-rose-700">-{b.issuedBags.toLocaleString()}</td>
                        <td className="py-2.5 px-3 text-right font-mono tabular-nums font-black text-purple-950 bg-purple-50/50 text-sm">
                          {b.closingBags.toLocaleString()} Bags
                        </td>
                        <td className="py-2.5 px-3 text-slate-500 text-[11px]">
                          {bardanaMasters.find(m => m.id === b.bardanaId)?.remarks || 'Standard mandi bag master'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-purple-100 font-black text-purple-950 text-xs border-t border-purple-200">
                      <td colSpan={3} className="py-2.5 px-3 text-right">TOTAL INVENTORY (کل میزان):</td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums">{totalBardanaOpening.toLocaleString()}</td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-emerald-800">+{totalBardanaReceived.toLocaleString()}</td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-rose-800">-{totalBardanaIssued.toLocaleString()}</td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-sm font-black text-purple-950">
                        {totalBardanaClosing.toLocaleString()} Bags
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* MANUAL MOVEMENTS / AUDIT TABLE */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <ArrowDownLeft className="w-4 h-4 text-purple-700" />
                  <span>Recent Barbara Manual & Voucher Log</span>
                </h3>
                <span className="font-urdu text-xs text-slate-600">آمد و اخراج باردانہ ریکارڈ</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-900 text-white font-semibold text-[11px] uppercase">
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Ref / Voucher #</th>
                      <th className="py-2.5 px-3">Movement Type</th>
                      <th className="py-2.5 px-3">Barbara Type</th>
                      <th className="py-2.5 px-3">Party Name</th>
                      <th className="py-2.5 px-3">Godown</th>
                      <th className="py-2.5 px-3 text-right text-emerald-300">Inward (+)</th>
                      <th className="py-2.5 px-3 text-right text-rose-300">Outward (-)</th>
                      <th className="py-2.5 px-3">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {bardanaMovements.map(m => (
                      <tr key={m.id} className="hover:bg-slate-50">
                        <td className="py-2 px-3 whitespace-nowrap">{m.date}</td>
                        <td className="py-2 px-3 font-mono font-bold text-slate-900">{m.voucherNo}</td>
                        <td className="py-2 px-3">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            m.type === 'PURCHASE_INWARD' || m.type === 'MANUAL_RETURN'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}>
                            {m.type === 'PURCHASE_INWARD' ? 'Purchase Inward (+)' :
                             m.type === 'SALE_OUTWARD' ? 'Sales Outward (-)' :
                             m.type === 'MANUAL_RETURN' ? 'Manual Return (+)' : 'Manual Issue (-)'}
                          </span>
                        </td>
                        <td className="py-2 px-3">{m.bardanaName}</td>
                        <td className="py-2 px-3">{m.partyName || '-'}</td>
                        <td className="py-2 px-3">{m.godownName || '-'}</td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-emerald-700">
                          {m.inwardBags > 0 ? `+${m.inwardBags}` : '-'}
                        </td>
                        <td className="py-2 px-3 text-right font-mono font-bold text-rose-700">
                          {m.outwardBags > 0 ? `-${m.outwardBags}` : '-'}
                        </td>
                        <td className="py-2 px-3 text-slate-500 text-[11px]">{m.remarks}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* ============================================================== */}
      {/* MODALS                                                         */}
      {/* ============================================================== */}

      {/* CREATE ITEM MODAL */}
      {showItemModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleCreateItem} className="bg-white rounded-2xl max-w-md w-full p-6 space-y-3 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900">Add New Commodity / نئی جنس</h3>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Item Name (English)</label>
              <input
                type="text"
                required
                placeholder="e.g. Canola Seed"
                value={newItem.name}
                onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Urdu Name (اردو نام)</label>
              <input
                type="text"
                required
                placeholder="مثال: کینولا بیج"
                value={newItem.nameUrdu}
                onChange={e => setNewItem({ ...newItem, nameUrdu: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-urdu"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Default Rate / 40KG</label>
                <input
                  type="number"
                  value={newItem.defaultRate}
                  onChange={e => setNewItem({ ...newItem, defaultRate: Number(e.target.value) || 0 })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Opening First Wt (KG)</label>
                <input
                  type="number"
                  value={newItem.openingFirstWeight}
                  onChange={e => setNewItem({ ...newItem, openingFirstWeight: Number(e.target.value) || 0 })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Opening Bags</label>
                <input
                  type="number"
                  value={newItem.openingBags}
                  onChange={e => setNewItem({ ...newItem, openingBags: Number(e.target.value) || 0 })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Opening Value (PKR)</label>
                <input
                  type="number"
                  value={newItem.openingValue}
                  onChange={e => setNewItem({ ...newItem, openingValue: Number(e.target.value) || 0 })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowItemModal(false)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold"
              >
                Save Item
              </button>
            </div>
          </form>
        </div>
      )}

      {/* CREATE PARTY MODAL */}
      {showPartyModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleCreateParty} className="bg-white rounded-2xl max-w-md w-full p-6 space-y-3 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900">Add New Party / نیا کھاتہ دار</h3>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Party Name (English)</label>
              <input
                type="text"
                required
                placeholder="e.g. Mian Nawaz & Sons"
                value={newParty.name}
                onChange={e => setNewParty({ ...newParty, name: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Urdu Name (اردو نام)</label>
              <input
                type="text"
                required
                placeholder="مثال: میاں نواز اینڈ سنز"
                value={newParty.nameUrdu}
                onChange={e => setNewParty({ ...newParty, nameUrdu: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-urdu"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Mobile / WhatsApp</label>
                <input
                  type="text"
                  placeholder="+92 300 0000000"
                  value={newParty.phone}
                  onChange={e => setNewParty({ ...newParty, phone: e.target.value, whatsapp: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Party Type</label>
                <select
                  value={newParty.type}
                  onChange={e => setNewParty({ ...newParty, type: e.target.value as any })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                >
                  <option value="Supplier">Supplier / زمیندار</option>
                  <option value="Customer">Customer / مل یا بیوپاری</option>
                  <option value="Both">Both (دونوں)</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Opening Balance (PKR)</label>
              <input
                type="number"
                value={newParty.openingBalance}
                onChange={e => setNewParty({ ...newParty, openingBalance: Number(e.target.value) || 0 })}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowPartyModal(false)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold"
              >
                Save Party
              </button>
            </div>
          </form>
        </div>
      )}

      {/* CREATE GODOWN MODAL */}
      {showGodownModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleCreateGodown} className="bg-white rounded-2xl max-w-md w-full p-6 space-y-3 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900">Add New Godown / نیا گودام</h3>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Godown Name (English)</label>
              <input
                type="text"
                required
                placeholder="e.g. Railway Shed Godown # 3"
                value={newGodown.name}
                onChange={e => setNewGodown({ ...newGodown, name: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Urdu Name (اردو نام)</label>
              <input
                type="text"
                required
                placeholder="مثال: ریلوے شیڈ گودام ۳"
                value={newGodown.nameUrdu}
                onChange={e => setNewGodown({ ...newGodown, nameUrdu: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-urdu"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Location / Yard</label>
              <input
                type="text"
                placeholder="e.g. Near Platform 2, Mandi Yard"
                value={newGodown.location}
                onChange={e => setNewGodown({ ...newGodown, location: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Storage Capacity (Bags)</label>
              <input
                type="number"
                value={newGodown.capacityBags}
                onChange={e => setNewGodown({ ...newGodown, capacityBags: Number(e.target.value) || 0 })}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowGodownModal(false)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold"
              >
                Save Godown
              </button>
            </div>
          </form>
        </div>
      )}

      {/* CREATE EXPENSE MODAL */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleCreateExpense} className="bg-white rounded-2xl max-w-md w-full p-6 space-y-3 shadow-2xl">
            <h3 className="text-base font-bold text-slate-900">Add New Expense / نیا خرچہ</h3>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Expense Head (English)</label>
              <input
                type="text"
                required
                placeholder="e.g. Weighbridge Fee"
                value={newExpense.name}
                onChange={e => setNewExpense({ ...newExpense, name: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Urdu Head (اردو نام)</label>
              <input
                type="text"
                required
                placeholder="مثال: کانٹا پرچی فیس"
                value={newExpense.nameUrdu}
                onChange={e => setNewExpense({ ...newExpense, nameUrdu: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-urdu"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={newExpense.type}
                  onChange={e => setNewExpense({ ...newExpense, type: e.target.value as any })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                >
                  <option value="Direct">Direct (براہ راست)</option>
                  <option value="Indirect">Indirect (بالواسطہ)</option>
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Default Amount / Rate</label>
                <input
                  type="number"
                  value={newExpense.defaultAmount}
                  onChange={e => setNewExpense({ ...newExpense, defaultAmount: Number(e.target.value) || 0 })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowExpenseModal(false)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold"
              >
                Save Expense
              </button>
            </div>
          </form>
        </div>
      )}

      {/* CREATE BARBARA MASTER MODAL */}
      {showBardanaModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleCreateBardana} className="bg-white rounded-2xl max-w-md w-full p-6 space-y-3 shadow-2xl">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <span className="p-1.5 rounded-lg bg-purple-100 text-purple-800">
                <Box className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-base font-bold text-slate-900">Add New Barbara Master</h3>
                <div className="font-urdu text-xs text-slate-500">نیا باردانہ ماسٹر ریکارڈ</div>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Bag Master Name (English)</label>
              <input
                type="text"
                required
                placeholder="e.g. Jute Gunny Bags 100KG"
                value={newBardana.name}
                onChange={e => setNewBardana({ ...newBardana, name: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Urdu Name (اردو نام)</label>
              <input
                type="text"
                required
                placeholder="مثال: بوری پٹ سن ۱۰۰ کلو"
                value={newBardana.nameUrdu}
                onChange={e => setNewBardana({ ...newBardana, nameUrdu: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-urdu"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Category / قسم</label>
                <select
                  value={newBardana.category}
                  onChange={e => setNewBardana({ ...newBardana, category: e.target.value as any })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                >
                  <option value="Jute">Jute (پٹ سن)</option>
                  <option value="PP">PP Plastic (پلاسٹک)</option>
                  <option value="Cotton">Cotton (کپاس / سوتی)</option>
                  <option value="Other">Other (دیگر)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Opening Stock (Bags)</label>
                <input
                  type="number"
                  value={newBardana.openingBags}
                  onChange={e => setNewBardana({ ...newBardana, openingBags: Number(e.target.value) || 0 })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Remarks / تفصیل</label>
              <input
                type="text"
                placeholder="Weight capacity, grain compatibility..."
                value={newBardana.remarks}
                onChange={e => setNewBardana({ ...newBardana, remarks: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
            </div>

            <div className="p-2.5 rounded-lg bg-purple-50 text-[11px] text-purple-900 border border-purple-200 space-y-0.5">
              <div className="font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-purple-700" />
                <span>Zero Weight Impact Master</span>
              </div>
              <p className="text-[10px] text-purple-700">
                Number of bags received or issued will only update the Barbara Register and have no effect on weight.
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowBardanaModal(false)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-purple-900 hover:bg-purple-800 text-white rounded-lg text-xs font-semibold"
              >
                Save Barbara Master
              </button>
            </div>
          </form>
        </div>
      )}

      {/* RECORD MANUAL BAG MOVEMENT MODAL */}
      {showMovementModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <form onSubmit={handleRecordMovement} className="bg-white rounded-2xl max-w-md w-full p-6 space-y-3 shadow-2xl">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <span className="p-1.5 rounded-lg bg-purple-100 text-purple-800">
                <ArrowDownLeft className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-base font-bold text-slate-900">Record Barbara Movement</h3>
                <div className="font-urdu text-xs text-slate-500">باردانہ دستی آمد یا اخراج اندراج</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Movement Type</label>
                <select
                  value={newMovement.type}
                  onChange={e => setNewMovement({ ...newMovement, type: e.target.value as any })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold"
                >
                  <option value="MANUAL_RETURN">Inward / Return (+) آمد</option>
                  <option value="MANUAL_ISSUE">Outward / Issue (-) اخراج</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">No. of Bags (بوریاں)</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={newMovement.bags}
                  onChange={e => setNewMovement({ ...newMovement, bags: Number(e.target.value) || 0 })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Barbara Master Type</label>
              <select
                value={newMovement.bardanaId}
                onChange={e => setNewMovement({ ...newMovement, bardanaId: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              >
                {bardanaMasters.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.nameUrdu})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Party (Optional)</label>
                <select
                  value={newMovement.partyId}
                  onChange={e => setNewMovement({ ...newMovement, partyId: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-urdu"
                >
                  <option value="">None / عام منڈی</option>
                  {parties.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Godown (Optional)</label>
                <select
                  value={newMovement.godownId}
                  onChange={e => setNewMovement({ ...newMovement, godownId: e.target.value })}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-urdu"
                >
                  <option value="">None</option>
                  {godowns.map(g => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Remarks / تفصیل</label>
              <input
                type="text"
                placeholder="e.g. Empty bags returned from mill gate"
                value={newMovement.remarks}
                onChange={e => setNewMovement({ ...newMovement, remarks: e.target.value })}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowMovementModal(false)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-purple-900 hover:bg-purple-800 text-white rounded-lg text-xs font-semibold"
              >
                Record Bag Movement
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
};
