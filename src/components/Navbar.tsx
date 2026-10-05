/**
 * Mandi ERP Navigation Bar
 * Follows Strict 3-Zone Top Bar Contract from Universal Frontend Constitution
 * Zone 1: Brand Wordmark + Multi-Business Switcher
 * Zone 2: Module Links with Single-Line Truncation Safety
 * Zone 3: Language Toggle (Both/Urdu/EN) + Cloud Sheets Status + User Profile
 */

import React, { useState } from 'react';
import {
  Building2,
  ChevronDown,
  Globe,
  PlusCircle,
  FileSpreadsheet,
  UserCheck,
  RotateCcw,
  Settings,
  LogOut,
  Download,
  FolderArchive,
  CalendarCheck,
  Smartphone,
  RefreshCw
} from 'lucide-react';
import { useMandi } from '../context/MandiContext';
import { LanguageMode } from '../types';

export type ActiveTab = 
  | 'dashboard'
  | 'stock'
  | 'action_centre'
  | 'purchase'
  | 'sales'
  | 'transfer'
  | 'reports'
  | 'pnl'
  | 'month_closing'
  | 'masters'
  | 'users'
  | 'settings'
  | 'cloud';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenNewBusinessModal: () => void;
  onOpenGoogleSheetsModal: () => void;
  onOpenInstallModal?: () => void;
  onOpenOfflineInstallerModal?: () => void;
  onOpenMauiSyncModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenNewBusinessModal,
  onOpenGoogleSheetsModal,
  onOpenInstallModal,
  onOpenOfflineInstallerModal,
  onOpenMauiSyncModal
}) => {
  const {
    businesses,
    currentBusiness,
    setCurrentBusinessId,
    languageMode,
    setLanguageMode,
    currentUser,
    users,
    switchUser,
    logout,
    todayMetrics,
    resetToDefaultData
  } = useMandi();

  const [bizDropdownOpen, setBizDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const cycleLanguage = () => {
    if (languageMode === 'both') setLanguageMode('urdu');
    else if (languageMode === 'urdu') setLanguageMode('english');
    else setLanguageMode('both');
  };

  const navLinks: { id: ActiveTab; labelEn: string; labelUrdu: string }[] = [
    { id: 'dashboard', labelEn: 'Dashboard', labelUrdu: 'ڈیش بورڈ' },
    { id: 'stock', labelEn: 'Stock Management', labelUrdu: 'اسٹاک مینجمنٹ' },
    { id: 'action_centre', labelEn: 'Action Centre', labelUrdu: 'ایکشن سینٹر' },
    { id: 'purchase', labelEn: 'Purchase', labelUrdu: 'خریداری' },
    { id: 'sales', labelEn: 'Sales', labelUrdu: 'فروخت' },
    { id: 'transfer', labelEn: 'Transfer', labelUrdu: 'گودام منتقلی' },
    { id: 'reports', labelEn: 'Reports', labelUrdu: 'رجسٹرز و رپورٹس' },
    { id: 'pnl', labelEn: 'P&L Account', labelUrdu: 'نفع و نقصان' },
    { id: 'month_closing', labelEn: 'Month Closing', labelUrdu: 'ماہانہ کلوزنگ' },
    { id: 'masters', labelEn: 'Masters', labelUrdu: 'ماسٹرز' },
    { id: 'users', labelEn: 'Security', labelUrdu: 'صارفین' },
    { id: 'settings', labelEn: 'Settings', labelUrdu: 'ترتیبات' }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* ZONE 1: BRAND TITLE & BUSINESS SWITCHER */}
          <div className="flex items-center gap-3 shrink-0 relative">
            <div className="relative">
              <button
                onClick={() => setBizDropdownOpen(!bizDropdownOpen)}
                className="flex items-center gap-2.5 text-left p-1.5 rounded-lg hover:bg-slate-100 transition-colors focus-visible:outline-2 focus-visible:outline-emerald-600"
              >
                <div className="w-9 h-9 rounded-lg bg-emerald-800 text-white flex items-center justify-center font-bold text-sm tracking-wider shadow-xs">
                  {currentBusiness.logoText || 'NSC'}
                </div>
                <div className="leading-tight">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-slate-900 truncate max-w-[180px] md:max-w-[240px]">
                      {currentBusiness.name}
                    </span>
                    <span className="hidden xl:inline text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded border border-emerald-300">
                      ERP Stock System
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 font-urdu truncate max-w-[180px] md:max-w-[240px]">
                    {currentBusiness.nameUrdu}
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
              </button>

              {/* Multi-Business Dropdown Menu */}
              {bizDropdownOpen && (
                <div className="absolute top-full left-0 mt-1.5 w-72 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Select Active Business / کاروبار منتخب کریں
                  </div>
                  {businesses.map(b => (
                    <button
                      key={b.id}
                      onClick={() => {
                        setCurrentBusinessId(b.id);
                        setBizDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 flex items-center justify-between text-xs transition-colors ${
                        b.id === currentBusiness.id ? 'bg-emerald-50 text-emerald-900 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div>
                        <div>{b.name}</div>
                        <div className="text-slate-500 font-urdu">{b.nameUrdu}</div>
                      </div>
                      {b.id === currentBusiness.id && (
                        <span className="text-emerald-700 text-xs font-bold">Active</span>
                      )}
                    </button>
                  ))}
                  <div className="border-t border-slate-100 my-1"></div>
                  <button
                    onClick={() => {
                      setBizDropdownOpen(false);
                      onOpenNewBusinessModal();
                    }}
                    className="w-full text-left px-3 py-2 flex items-center gap-2 text-xs font-medium text-emerald-700 hover:bg-emerald-50 transition-colors"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>+ Add New Business (نیا ادارہ شامل کریں)</span>
                  </button>
                </div>
              )}
            </div>

            {/* Pending Approvals Notice Tag */}
            {todayMetrics.pendingApprovalsCount > 0 && (
              <button
                onClick={() => setActiveTab('action_centre')}
                className="hidden xl:inline-flex items-center gap-1.5 text-xs text-amber-700 hover:text-amber-800 font-medium px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 transition-colors"
                title="Vouchers awaiting approval"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                <span>{todayMetrics.pendingApprovalsCount} Pending Approval</span>
              </button>
            )}
          </div>

          {/* ZONE 2: 4-9 CLEAN NAV LINKS */}
          <nav className="hidden lg:flex items-center gap-1 overflow-x-auto py-1">
            {navLinks.map(link => {
              const isActive = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => setActiveTab(link.id)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap flex flex-col items-center ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <span>{link.labelEn}</span>
                  {languageMode !== 'english' && (
                    <span className="text-[10px] opacity-80 font-urdu leading-none -mt-0.5">
                      {link.labelUrdu}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* ZONE 3: PRIMARY ACTIONS & UTILITY */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Language Switcher Button */}
            <button
              onClick={cycleLanguage}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
              title="Click to toggle language mode (Both / Urdu / English)"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-700" />
              <span className="font-semibold">
                {languageMode === 'both' ? 'Both (دونوں)' : languageMode === 'urdu' ? 'اردو' : 'English'}
              </span>
            </button>

            {/* Download & Install Standalone Desktop App (NOT a Google Extension) */}
            {onOpenInstallModal && (
              <button
                onClick={onOpenInstallModal}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs shrink-0 active:scale-95"
                title="Install ERP Mandi Stock Management as a Standalone Application on Windows/Phone (NOT a Google Extension)"
              >
                <Download className="w-3.5 h-3.5 text-emerald-200" />
                <span className="hidden sm:inline">Install Desktop App</span>
                <span className="sm:hidden font-urdu text-[11px]">ایپ انسٹال</span>
              </button>
            )}

            {/* .NET MAUI 8 Offline-First & Auto-Sync Hub Button */}
            {onOpenMauiSyncModal && (
              <button
                onClick={onOpenMauiSyncModal}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-950 to-slate-900 hover:from-emerald-900 hover:to-slate-800 text-white text-xs font-bold transition-all shadow-xs border border-emerald-700/60 shrink-0 active:scale-95"
                title=".NET MAUI 8 Dual Native (Windows EXE + Android APK) Offline & Auto-Sync Hub"
              >
                <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden lg:inline">MAUI 8 (EXE + APK)</span>
                <span className="lg:hidden">MAUI 8</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              </button>
            )}

            {/* Offline Installer Button */}
            {onOpenOfflineInstallerModal && (
              <button
                onClick={onOpenOfflineInstallerModal}
                className="hidden sm:flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white text-xs font-medium transition-all shadow-xs shrink-0 active:scale-95"
                title="Offline Installer Package (.ZIP & Standalone HTML) (آف لائن انسٹالر ڈاؤن لوڈ کریں)"
              >
                <FolderArchive className="w-3.5 h-3.5 text-emerald-400" />
                <span>Offline ZIP</span>
              </button>
            )}

            {/* Google Sheets Cloud Backup Button */}
            <button
              onClick={onOpenGoogleSheetsModal}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-medium hover:bg-emerald-100 transition-colors shadow-2xs"
              title="Backup and Sync to Google Sheets"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
              <span className="hidden sm:inline">Google Sheets</span>
            </button>

            {/* User Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className={`flex items-center gap-2 px-2 sm:px-2.5 py-1.5 rounded-lg border transition-colors text-xs text-left ${
                  currentUser.role === 'Admin' 
                    ? 'border-emerald-300 bg-emerald-50/70 hover:bg-emerald-100/70' 
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                  currentUser.role === 'Admin' ? 'bg-emerald-700 text-white' : 'bg-slate-200 text-slate-700'
                }`}>
                  {currentUser.role === 'Admin' ? 'A' : currentUser.name.charAt(0)}
                </div>
                <div className="hidden sm:block">
                  <div className="font-bold text-slate-900 leading-tight flex items-center gap-1">
                    <span className="truncate max-w-[110px]">{currentUser.name}</span>
                    {currentUser.role === 'Admin' && (
                      <span className="text-[9px] bg-emerald-700 text-white px-1 rounded font-bold">Admin</span>
                    )}
                  </div>
                  <div className="text-[10px] text-emerald-700 font-semibold">{currentUser.role}</div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

            {/* Direct Logout / Lock Screen Button */}
            <button
              onClick={() => logout()}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-colors shrink-0 shadow-2xs active:scale-95"
              title="Lock Terminal & Return to Login Screen (لاگ آؤٹ کریں)"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Log Out</span>
            </button>

              {userDropdownOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-60 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in">
                  <div className="px-3 py-1 text-xs text-slate-400 font-semibold uppercase">
                    Active Session & Role
                  </div>
                  <div className="px-3 py-1.5 border-b border-slate-100 mb-1">
                    <div className="font-medium text-slate-900 text-xs">{currentUser.name}</div>
                    <div className="text-[11px] text-slate-500">{currentUser.email}</div>
                    <div className="text-[11px] text-emerald-600 font-semibold">{currentUser.role} Permissions</div>
                  </div>
                  <div className="px-3 py-1 text-xs text-slate-400 font-semibold uppercase">
                    Switch User / صارف تبدیل کریں
                  </div>
                  {users.map(u => (
                    <button
                      key={u.id}
                      onClick={() => {
                        switchUser(u.id);
                        setUserDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between ${
                        u.id === currentUser.id ? 'bg-emerald-50 text-emerald-900 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>{u.name} ({u.role})</span>
                      {u.id === currentUser.id && <UserCheck className="w-3.5 h-3.5 text-emerald-600" />}
                    </button>
                  ))}
                  <div className="border-t border-slate-100 my-1"></div>
                  {onOpenInstallModal && (
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onOpenInstallModal();
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-emerald-800 hover:bg-emerald-50 flex items-center gap-2 font-medium"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Download Mobile & Desktop App</span>
                    </button>
                  )}
                  {onOpenOfflineInstallerModal && (
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onOpenOfflineInstallerModal();
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-slate-800 hover:bg-slate-100 flex items-center gap-2 font-medium"
                    >
                      <FolderArchive className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Offline Installer Package (.ZIP)</span>
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setActiveTab('month_closing');
                      setUserDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs text-emerald-800 hover:bg-emerald-50 flex items-center gap-2 font-medium"
                  >
                    <CalendarCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Month Closing Centre (ماہانہ کلوزنگ)</span>
                  </button>

                  <button
                    onClick={() => {
                      setActiveTab('settings');
                      setUserDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium"
                  >
                    <Settings className="w-3.5 h-3.5 text-slate-500" />
                    <span>Settings & Storage (ترتیبات)</span>
                  </button>

                  {onOpenInstallModal && (
                    <button
                      onClick={() => {
                        onOpenInstallModal();
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-emerald-800 font-semibold hover:bg-emerald-50 flex items-center gap-2"
                    >
                      <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Mobile APK & App (موبائل ایپ)</span>
                    </button>
                  )}

                  {onOpenMauiSyncModal && (
                    <button
                      onClick={() => {
                        onOpenMauiSyncModal();
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 text-xs text-emerald-900 font-bold hover:bg-emerald-50 flex items-center gap-2"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
                      <span>.NET MAUI 8 Auto-Sync Hub</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      if (window.confirm('Reset all Mandi demo records to clean factory defaults?')) {
                        resetToDefaultData();
                        setUserDropdownOpen(false);
                      }
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs text-amber-700 hover:bg-amber-50 flex items-center gap-2"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Demo Data (ڈیٹا ری سیٹ)</span>
                  </button>
                  <div className="border-t border-slate-100 my-1"></div>
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      logout();
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-semibold"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Lock / Logout (لاگ آؤٹ کریں)</span>
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Mobile Nav Scroller */}
        <div className="lg:hidden flex items-center gap-1 overflow-x-auto py-2 border-t border-slate-100 -mx-4 px-4 scrollbar-none">
          {navLinks.map(link => {
            const isActive = activeTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => setActiveTab(link.id)}
                className={`px-3 py-1 text-xs font-medium rounded-md whitespace-nowrap shrink-0 transition-colors ${
                  isActive
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {link.labelEn}
              </button>
            );
          })}
          {onOpenInstallModal && (
            <button
              onClick={onOpenInstallModal}
              className="px-2.5 py-1 text-xs font-bold rounded-md whitespace-nowrap shrink-0 transition-colors bg-emerald-100 text-emerald-800 hover:bg-emerald-200 flex items-center gap-1"
            >
              <Download className="w-3 h-3" />
              <span>Install App</span>
            </button>
          )}
          {onOpenOfflineInstallerModal && (
            <button
              onClick={onOpenOfflineInstallerModal}
              className="px-2.5 py-1 text-xs font-bold rounded-md whitespace-nowrap shrink-0 transition-colors bg-slate-800 text-white hover:bg-slate-900 flex items-center gap-1"
            >
              <FolderArchive className="w-3 h-3 text-emerald-400" />
              <span>Offline ZIP</span>
            </button>
          )}
        </div>

      </div>
    </header>
  );
};

