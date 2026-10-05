/**
 * Mobile Slide-Out Drawer Navigation
 * Gives complete mobile access to all 10 ERP modules, settings, multi-business switcher,
 * and direct PWA installation & download instructions.
 */

import React from 'react';
import {
  X,
  Building2,
  Globe,
  FileSpreadsheet,
  Settings,
  Shield,
  RotateCcw,
  LogOut,
  Download,
  ArrowRightLeft,
  BookOpen,
  PieChart,
  Layers,
  ChevronRight,
  Smartphone,
  CheckCircle2,
  ExternalLink,
  FolderArchive,
  CalendarCheck
} from 'lucide-react';
import { ActiveTab } from './Navbar';
import { useMandi } from '../context/MandiContext';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenGoogleSheetsModal: () => void;
  onOpenNewBusinessModal: () => void;
  onOpenInstallModal: () => void;
  onOpenOfflineInstallerModal?: () => void;
  isInstallable: boolean;
  isStandalone: boolean;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({
  isOpen,
  onClose,
  activeTab,
  setActiveTab,
  onOpenGoogleSheetsModal,
  onOpenNewBusinessModal,
  onOpenInstallModal,
  onOpenOfflineInstallerModal,
  isInstallable,
  isStandalone
}) => {
  const {
    businesses,
    currentBusiness,
    setCurrentBusinessId,
    languageMode,
    setLanguageMode,
    currentUser,
    logout,
    resetToDefaultData
  } = useMandi();

  if (!isOpen) return null;

  const cycleLanguage = () => {
    if (languageMode === 'both') setLanguageMode('urdu');
    else if (languageMode === 'urdu') setLanguageMode('english');
    else setLanguageMode('both');
  };

  const drawerLinks: { id: ActiveTab; labelEn: string; labelUrdu: string; icon: React.ElementType }[] = [
    { id: 'transfer', labelEn: 'Godown Transfer', labelUrdu: 'گودام منتقلی', icon: ArrowRightLeft },
    { id: 'reports', labelEn: 'Registers & Reports', labelUrdu: 'رجسٹرز و رپورٹس', icon: BookOpen },
    { id: 'pnl', labelEn: 'Profit & Loss Account', labelUrdu: 'نفع و نقصان کھاتہ', icon: PieChart },
    { id: 'month_closing', labelEn: 'Month Closing Centre', labelUrdu: 'ماہانہ کلوزنگ سینٹر', icon: CalendarCheck },
    { id: 'masters', labelEn: 'Masters & Commission', labelUrdu: 'آڑھت و کمیشن ماسٹرز', icon: Layers },
    { id: 'users', labelEn: 'Security & User Rights', labelUrdu: 'صارفین اور اختیارات', icon: Shield },
    { id: 'settings', labelEn: 'Settings & Cloud Storage', labelUrdu: 'ترتیبات و کلاؤڈ ڈرائیو', icon: Settings },
  ];

  return (
    <div className="fixed inset-0 z-50 lg:hidden flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="relative ml-auto w-full max-w-xs sm:max-w-sm bg-white h-full shadow-2xl flex flex-col z-10 overflow-y-auto animate-in slide-in-from-right duration-200">
        
        {/* Drawer Header */}
        <div className="p-4 bg-emerald-950 text-white flex items-center justify-between border-b border-emerald-900">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-emerald-800 text-white flex items-center justify-center font-bold text-sm">
              {currentBusiness.logoText || 'NSC'}
            </div>
            <div>
              <div className="text-sm font-bold truncate max-w-[190px]">{currentBusiness.name}</div>
              <div className="text-xs text-emerald-300 font-urdu truncate max-w-[190px]">{currentBusiness.nameUrdu}</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-emerald-300 hover:text-white hover:bg-emerald-900 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Card */}
        <div className="p-3 bg-emerald-900/40 border-b border-emerald-800/30 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs">
            <div className="w-7 h-7 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center text-xs">
              {currentUser.name.charAt(0)}
            </div>
            <div>
              <div className="font-bold text-slate-900 dark:text-white leading-tight">{currentUser.name}</div>
              <div className="text-[11px] text-emerald-700 font-medium">{currentUser.role}</div>
            </div>
          </div>
          <button
            onClick={cycleLanguage}
            className="px-2 py-1 bg-white border border-slate-200 rounded-md text-[11px] font-semibold text-slate-700 flex items-center gap-1 shadow-2xs"
          >
            <Globe className="w-3 h-3 text-emerald-600" />
            <span>{languageMode === 'both' ? 'Both' : languageMode === 'urdu' ? 'اردو' : 'EN'}</span>
          </button>
        </div>

        {/* PROMINENT MOBILE APK & PWA DOWNLOAD / INSTALL BANNER */}
        <div className="p-3 bg-linear-to-r from-emerald-950 to-slate-900 border-b border-emerald-800 text-white">
          <div className="flex items-start gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <Smartphone className="w-4 h-4 text-emerald-100" />
            </div>
            <div className="flex-1">
              <div className="text-xs font-bold text-white flex items-center justify-between">
                <span>Mobile APK & App</span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-1.5 py-0.2 rounded-full font-bold">.APK Ready</span>
              </div>
              <div className="text-[11px] text-emerald-200 font-urdu leading-tight mt-0.5">
                موبائل فون ایپلیکیشن اور اے پی کے فائل ڈاؤن لوڈ کریں
              </div>
              <div className="mt-2 flex flex-col gap-1.5">
                <button
                  onClick={() => {
                    onClose();
                    onOpenInstallModal();
                  }}
                  className="w-full py-1.5 px-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download APK & Install (اے پی کے)</span>
                </button>
                {onOpenOfflineInstallerModal && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenOfflineInstallerModal();
                    }}
                    className="w-full py-1 px-3 bg-white/10 hover:bg-white/20 text-slate-200 rounded-lg text-[11px] font-semibold transition flex items-center justify-center gap-1.5"
                  >
                    <FolderArchive className="w-3 h-3 text-emerald-400" />
                    <span>Offline Package (.ZIP / PC)</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modules List */}
        <div className="flex-1 p-3 space-y-1">
          <div className="px-2 py-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            All Business Modules / تمام شعبہ جات
          </div>

          {drawerLinks.map(link => {
            const isActive = activeTab === link.id;
            const Icon = link.icon;

            return (
              <button
                key={link.id}
                onClick={() => {
                  setActiveTab(link.id);
                  onClose();
                }}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                  isActive
                    ? 'bg-slate-900 text-white font-bold'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                  <div>
                    <div>{link.labelEn}</div>
                    <div className={`text-[10px] font-urdu ${isActive ? 'text-slate-300' : 'text-slate-500'}`}>
                      {link.labelUrdu}
                    </div>
                  </div>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </button>
            );
          })}

          <div className="border-t border-slate-100 my-2 pt-2"></div>

          {/* Quick Utilities */}
          <button
            onClick={() => {
              onClose();
              onOpenGoogleSheetsModal();
            }}
            className="w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between text-emerald-800 hover:bg-emerald-50 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <div>
                <div className="font-semibold">Google Sheets Cloud Backup</div>
                <div className="text-[10px] text-emerald-700 font-urdu">گوگل شیٹس کلاؤڈ بیک اپ</div>
              </div>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-emerald-600" />
          </button>

          <button
            onClick={() => {
              if (window.confirm('Reset all Mandi demo records to clean factory defaults?')) {
                resetToDefaultData();
                onClose();
              }
            }}
            className="w-full text-left px-3 py-2 rounded-xl text-xs flex items-center gap-2.5 text-amber-700 hover:bg-amber-50 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Demo Records (ڈیٹا ری سیٹ)</span>
          </button>
        </div>

        {/* Multi-business switcher & Logout */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 space-y-2">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">
            Active Firm Switcher
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {businesses.map(b => (
              <button
                key={b.id}
                onClick={() => {
                  setCurrentBusinessId(b.id);
                  onClose();
                }}
                className={`p-1.5 rounded-lg border text-left text-[11px] truncate transition-colors ${
                  b.id === currentBusiness.id
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-950 font-bold'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="truncate">{b.name}</div>
                <div className="text-[10px] text-slate-500 font-urdu truncate">{b.nameUrdu}</div>
              </button>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
            <button
              onClick={() => {
                onClose();
                logout();
              }}
              className="w-full py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Lock Terminal / Logout (لاگ آؤٹ کریں)</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
