/**
 * Grain Market Software (غلہ منڈی سافٹ ویئر)
 * Main Application Orchestrator & View Controller
 * Follows 100% of the 26 Locked Points
 */

import React, { useState } from 'react';
import { MandiProvider, useMandi } from './context/MandiContext';
import { Navbar, ActiveTab } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { ActionCentre } from './components/ActionCentre';
import { PurchaseEntry } from './components/PurchaseEntry';
import { SalesEntry } from './components/SalesEntry';
import { GodownTransfer } from './components/GodownTransfer';
import { Reports } from './components/Reports';
import { StockManagement } from './components/StockManagement';
import { ProfitAndLoss } from './components/ProfitAndLoss';
import { MonthClosingCentre } from './components/MonthClosingCentre';
import { Masters } from './components/Masters';
import { UserRights } from './components/UserRights';
import { PrintModal } from './components/PrintModal';
import { WhatsAppModal } from './components/WhatsAppModal';
import { GoogleSheetsModal } from './components/GoogleSheetsModal';
import { NewBusinessModal } from './components/NewBusinessModal';
import { SettingsCentre } from './components/SettingsCentre';
import { LoginPage } from './components/LoginPage';
import { InstallAppModal } from './components/InstallAppModal';
import { OfflineInstallerModal } from './components/OfflineInstallerModal';
import { MauiSyncModal } from './components/MauiSyncModal';
import { SyncConnectionBar } from './components/SyncConnectionBar';
import { OfflineIndicator } from './components/OfflineIndicator';
import { MobileBottomNav } from './components/MobileBottomNav';
import { MobileDrawer } from './components/MobileDrawer';
import { usePWAInstall } from './utils/usePWAInstall';
import { Voucher } from './types';
import { formatPKR } from './utils/numberToWords';
import { Smartphone } from 'lucide-react';

const MandiAppContent: React.FC = () => {
  const { isAuthenticated } = useMandi();
  const { isInstallable, isStandalone } = usePWAInstall();
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [showOfflineInstallerModal, setShowOfflineInstallerModal] = useState(false);
  const [showMauiSyncModal, setShowMauiSyncModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);


  // Modals state
  const [printVoucher, setPrintVoucher] = useState<{
    voucher: Voucher;
    design: 'a4-standard' | 'a4-modern' | 'thermal-80mm';
  } | null>(null);

  const [whatsAppVoucher, setWhatsAppVoucher] = useState<Voucher | null>(null);
  const [showGoogleSheetsModal, setShowGoogleSheetsModal] = useState(false);
  const [showNewBusinessModal, setShowNewBusinessModal] = useState(false);

  // Drill-down Modal State
  const [drillDownData, setDrillDownData] = useState<{
    title: string;
    vouchers: Voucher[];
  } | null>(null);

  const handlePrintRequested = (voucher: Voucher, design: 'a4-standard' | 'a4-modern' | 'thermal-80mm' = 'a4-standard') => {
    setPrintVoucher({ voucher, design });
  };

  const handleWhatsAppRequested = (voucher: Voucher) => {
    setWhatsAppVoucher(voucher);
  };

  const handleDrillDown = (title: string, vouchers: Voucher[]) => {
    setDrillDownData({ title, vouchers });
  };

  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={() => setActiveTab('dashboard')} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* 3-ZONE NAVBAR */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenNewBusinessModal={() => setShowNewBusinessModal(true)}
        onOpenGoogleSheetsModal={() => setShowGoogleSheetsModal(true)}
        onOpenInstallModal={() => setShowInstallModal(true)}
        onOpenOfflineInstallerModal={() => setShowOfflineInstallerModal(true)}
        onOpenMauiSyncModal={() => setShowMauiSyncModal(true)}
      />

      {/* .NET MAUI 8 CONNECTION DETECTION & AUTO-SYNC STRIP */}
      <SyncConnectionBar
        onOpenMauiSyncModal={() => setShowMauiSyncModal(true)}
      />

      {/* Official Standalone App Install Prompt (NOT a Google Extension) */}
      {!isStandalone && (
        <div className="bg-emerald-950 text-white px-3 sm:px-6 py-2 border-b border-emerald-800 flex items-center justify-between text-xs shadow-2xs">
          <div className="flex items-center gap-2 truncate">
            <Smartphone className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-semibold truncate">
              ERP Mandi Stock Management System — Install as a Standalone Application (NO Google Extension Required!)
            </span>
            <span className="hidden md:inline text-emerald-300 font-urdu">
              (مکمل آزادانہ سافٹ ویئر ایپلیکیشن کے طور پر انسٹال کریں — کسی گوگل ایکسٹینشن کی ضرورت نہیں)
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowInstallModal(true)}
              className="px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs transition active:scale-95 shadow-xs"
            >
              Install Application (ایپ انسٹال کریں)
            </button>
          </div>
        </div>
      )}

      {/* MAIN VIEWPORT */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 pb-24 lg:pb-8">

        {activeTab === 'dashboard' && (
          <Dashboard
            onNavigateToActionCentre={() => setActiveTab('action_centre')}
            onNavigateToPurchase={() => setActiveTab('purchase')}
            onNavigateToSales={() => setActiveTab('sales')}
            onNavigateToMonthClosing={() => setActiveTab('month_closing')}
            onOpenInstallModal={() => setShowInstallModal(true)}
            onOpenMauiSyncModal={() => setShowMauiSyncModal(true)}
          />
        )}

        {activeTab === 'stock' && (
          <StockManagement
            onNavigateToPurchase={() => setActiveTab('purchase')}
            onNavigateToSales={() => setActiveTab('sales')}
            onNavigateToTransfer={() => setActiveTab('transfer')}
            onNavigateToReports={() => setActiveTab('reports')}
          />
        )}

        {activeTab === 'action_centre' && (
          <ActionCentre
            onPrintVoucher={(v, d) => handlePrintRequested(v, d)}
            onWhatsAppVoucher={handleWhatsAppRequested}
            onEditVoucher={v => {
              if (v.type === 'PURCHASE') setActiveTab('purchase');
              else if (v.type === 'SALE') setActiveTab('sales');
            }}
          />
        )}

        {activeTab === 'purchase' && (
          <PurchaseEntry
            onSuccess={v => {
              setActiveTab('action_centre');
            }}
            onClose={() => setActiveTab('action_centre')}
            onPrintRequested={handlePrintRequested}
            onWhatsAppRequested={handleWhatsAppRequested}
          />
        )}

        {activeTab === 'sales' && (
          <SalesEntry
            onSuccess={v => {
              setActiveTab('action_centre');
            }}
            onClose={() => setActiveTab('action_centre')}
            onPrintRequested={handlePrintRequested}
            onWhatsAppRequested={handleWhatsAppRequested}
          />
        )}

        {activeTab === 'transfer' && (
          <GodownTransfer
            onSuccess={v => {
              setActiveTab('action_centre');
            }}
            onClose={() => setActiveTab('action_centre')}
            onPrintRequested={handlePrintRequested}
          />
        )}

        {activeTab === 'reports' && <Reports />}

        {activeTab === 'pnl' && (
          <ProfitAndLoss
            onDrillDown={handleDrillDown}
            onPrint={() => window.print()}
          />
        )}

        {activeTab === 'month_closing' && <MonthClosingCentre />}

        {activeTab === 'masters' && <Masters />}

        {activeTab === 'users' && <UserRights />}

        {activeTab === 'settings' && <SettingsCentre />}
      </main>

      {/* FOOTER */}
      <footer className="no-print bg-white border-t border-slate-200 py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <div>
            Grain Market Software &copy; 2026 · Mandi Accounting ERP · Open Source Edition
          </div>
          <div className="flex items-center gap-4">
            <span className="font-urdu text-slate-600">غلہ منڈی کمپیوٹرائزڈ نظامِ حساب کتاب</span>
            <span>Currency: PKR (Rs.)</span>
          </div>
        </div>
      </footer>

      {/* MODALS */}
      {printVoucher && (
        <PrintModal
          voucher={printVoucher.voucher}
          initialDesign={printVoucher.design}
          onClose={() => setPrintVoucher(null)}
        />
      )}

      {whatsAppVoucher && (
        <WhatsAppModal
          voucher={whatsAppVoucher}
          onClose={() => setWhatsAppVoucher(null)}
        />
      )}

      {showGoogleSheetsModal && (
        <GoogleSheetsModal
          onClose={() => setShowGoogleSheetsModal(false)}
        />
      )}

      {showNewBusinessModal && (
        <NewBusinessModal
          onClose={() => setShowNewBusinessModal(false)}
        />
      )}

      {/* P&L DRILL DOWN MODAL */}
      {drillDownData && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Transaction Drill-Down: {drillDownData.title}
                </h3>
                <div className="text-xs text-slate-500">
                  {drillDownData.vouchers.length} underlying vouchers contributing to this financial total
                </div>
              </div>
              <button
                onClick={() => setDrillDownData(null)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                ✕
              </button>
            </div>

            <div className="overflow-y-auto flex-1 pr-1">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <th className="p-2">Voucher #</th>
                    <th className="p-2">Date</th>
                    <th className="p-2">Party</th>
                    <th className="p-2">Item</th>
                    <th className="p-2 text-right">First Wt</th>
                    <th className="p-2 text-right">Bags</th>
                    <th className="p-2 text-right">Amount (PKR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {drillDownData.vouchers.map(v => (
                    <tr key={v.id} className="hover:bg-slate-50">
                      <td className="p-2 font-mono font-bold text-slate-900">{v.voucherNo}</td>
                      <td className="p-2">{v.date}</td>
                      <td className="p-2">{v.partyName}</td>
                      <td className="p-2">{v.itemName}</td>
                      <td className="p-2 text-right font-mono tabular-nums">{v.firstWeight.toLocaleString()} KG</td>
                      <td className="p-2 text-right font-mono tabular-nums">{v.bags}</td>
                      <td className="p-2 text-right font-mono tabular-nums font-bold">{formatPKR(v.totalAmount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setDrillDownData(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800"
              >
                Close Drill-Down
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MOBILE BOTTOM NAVIGATION (Phones & Tablets) */}
      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenMenu={() => setMobileMenuOpen(true)}
        onOpenInstallModal={() => setShowInstallModal(true)}
        isInstallable={isInstallable}
        isStandalone={isStandalone}
      />

      {/* MOBILE SLIDE-OUT DRAWER */}
      <MobileDrawer
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenGoogleSheetsModal={() => setShowGoogleSheetsModal(true)}
        onOpenNewBusinessModal={() => setShowNewBusinessModal(true)}
        onOpenInstallModal={() => setShowInstallModal(true)}
        onOpenOfflineInstallerModal={() => setShowOfflineInstallerModal(true)}
        isInstallable={isInstallable}
        isStandalone={isStandalone}
      />

      {/* APP INSTALLATION & DOWNLOAD MODAL */}
      {showInstallModal && (
        <InstallAppModal
          onClose={() => setShowInstallModal(false)}
          onOpenOfflineInstaller={() => {
            setShowInstallModal(false);
            setShowOfflineInstallerModal(true);
          }}
        />
      )}

      {/* OFFLINE INSTALLER MODAL (.ZIP & STANDALONE HTML) */}
      {showOfflineInstallerModal && (
        <OfflineInstallerModal
          onClose={() => setShowOfflineInstallerModal(false)}
        />
      )}

      {/* .NET MAUI 8 DUAL NATIVE & AUTO-SYNC MODAL */}
      {showMauiSyncModal && (
        <MauiSyncModal
          onClose={() => setShowMauiSyncModal(false)}
        />
      )}

      {/* OFFLINE STATUS NOTIFICATION BADGE */}
      <OfflineIndicator />
    </div>
  );
};


export default function App() {
  return (
    <MandiProvider>
      <MandiAppContent />
    </MandiProvider>
  );
}
