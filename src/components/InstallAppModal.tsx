/**
 * Download & Installation Centre Modal
 * Answers "How it will download" for Android, iPhone, and Desktop.
 * Provides 1-click install prompt, QR code to open on mobile,
 * step-by-step visual installation instructions, and offline capabilities.
 */

import React, { useState, useMemo } from 'react';
import {
  Download,
  Smartphone,
  Monitor,
  Apple,
  CheckCircle2,
  Copy,
  Check,
  Share2,
  HelpCircle,
  X,
  FolderArchive,
  FileCode,
  ExternalLink,
  WifiOff,
  HardDriveDownload,
  QrCode,
  AlertTriangle,
  MessageSquare,
  Layers
} from 'lucide-react';
import { usePWAInstall } from '../utils/usePWAInstall';
import { generateQRCodeSVG } from '../utils/qrCode';
import { useMandi } from '../context/MandiContext';
import {
  generateOfflineInstallerZip,
  generateSingleFileOfflineHtmlBlob,
  generateAndroidApkBlob,
  generateWpfDotNetSolutionZip,
  generateMauiDotNetSolutionZip
} from '../utils/offlineInstaller';

interface InstallAppModalProps {
  onClose: () => void;
  onOpenOfflineInstaller?: () => void;
}

export const InstallAppModal: React.FC<InstallAppModalProps> = ({ onClose, onOpenOfflineInstaller }) => {
  const { isInstallable, isInstalled, isStandalone, isIOS, isAndroid, isDesktop, install } = usePWAInstall();
  const { exportFullBackupFile, filteredVouchers, parties, items, appSettings, currentBusiness } = useMandi();
  const [activeTab, setActiveTab] = useState<'standalone_app' | 'auto' | 'android' | 'apk' | 'maui' | 'ios' | 'desktop' | 'offline' | 'installer'>('standalone_app');
  const [copied, setCopied] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [downloadingZip, setDownloadingZip] = useState(false);
  const [downloadingHtml, setDownloadingHtml] = useState(false);
  const [downloadingApk, setDownloadingApk] = useState(false);
  const [downloadingWpf, setDownloadingWpf] = useState(false);
  const [downloadingMaui, setDownloadingMaui] = useState(false);

  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://mandi-erp.app';

  const qrSvg = useMemo(() => {
    return generateQRCodeSVG(currentUrl, 140);
  }, [currentUrl]);

  const handleInstallClick = async () => {
    setInstalling(true);
    const success = await install();
    setInstalling(false);
    if (success) {
      setTimeout(() => onClose(), 1200);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareWhatsApp = () => {
    const text = `🌾 *${currentBusiness.name} - Mandi ERP Mobile App*\n\nاینڈرائڈ فون پر سافٹ ویئر انسٹال کرنے کے لیے یہ لنک کروم میں کھولیں اور 3 نقطوں (⋮) سے "Install App" پر کلک کریں (بغیر کسی پارسنگ ایرر کے):\n\n${currentUrl}`;
    if (typeof window !== 'undefined') {
      window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
    }
  };

  const handleDownloadZip = async () => {
    setDownloadingZip(true);
    try {
      const blob = await generateOfflineInstallerZip({
        vouchers: filteredVouchers,
        parties,
        items,
        appSettings,
        businessName: currentBusiness.name
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Mandi-ERP-Offline-Installer-${currentBusiness.name.replace(/\s+/g, '_')}.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading offline ZIP:', err);
    } finally {
      setDownloadingZip(false);
    }
  };

  const handleDownloadHtml = () => {
    setDownloadingHtml(true);
    try {
      const blob = generateSingleFileOfflineHtmlBlob({
        vouchers: filteredVouchers,
        parties,
        items,
        appSettings,
        businessName: currentBusiness.name
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Mandi-ERP-Offline-Standalone-${currentBusiness.name.replace(/\s+/g, '_')}.html`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error generating standalone html:', err);
    } finally {
      setDownloadingHtml(false);
    }
  };

  const handleDownloadApk = async () => {
    setDownloadingApk(true);
    try {
      const blob = await generateAndroidApkBlob({
        vouchers: filteredVouchers,
        parties,
        items,
        appSettings,
        businessName: currentBusiness.name
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Mandi-ERP-v2026-${currentBusiness.name.replace(/\s+/g, '_')}-mobile.apk`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error generating Android APK:', err);
    } finally {
      setDownloadingApk(false);
    }
  };

  const handleDownloadWpfSolution = async () => {
    setDownloadingWpf(true);
    try {
      const blob = await generateWpfDotNetSolutionZip({
        vouchers: filteredVouchers,
        parties,
        items,
        appSettings,
        businessName: currentBusiness.name
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Mandi-ERP-WPF-DotNet8-SQLite-${currentBusiness.name.replace(/\s+/g, '_')}.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error generating WPF .NET 8 solution:', err);
    } finally {
      setDownloadingWpf(false);
    }
  };

  const handleDownloadMauiSolution = async () => {
    setDownloadingMaui(true);
    try {
      const blob = await generateMauiDotNetSolutionZip({
        vouchers: filteredVouchers,
        parties,
        items,
        appSettings,
        businessName: currentBusiness.name
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `GrainMarket-NET-MAUI-8-Windows-Android-${currentBusiness.name.replace(/\s+/g, '_')}.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error generating .NET MAUI 8 solution:', err);
    } finally {
      setDownloadingMaui(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-emerald-950 text-white p-5 sm:p-6 relative border-b border-emerald-800">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-emerald-200 hover:text-white hover:bg-emerald-800 p-1.5 rounded-lg transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-emerald-800/80 border border-emerald-600 flex items-center justify-center shadow-inner shrink-0">
              <Download className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-extrabold tracking-tight">
                  Install ERP Mandi Stock Management System
                </h2>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold">
                  Standalone App
                </span>
              </div>
              <p className="text-xs text-emerald-200 font-urdu font-semibold">
                آزادانہ کمپیوٹر و موبائل ایپلی کیشن کے طور پر انسٹال کریں (کوئی گوگل ایکسٹینشن نہیں)
              </p>
            </div>
          </div>

          {/* EXPLICIT GUARANTEE: NOT A GOOGLE EXTENSION */}
          <div className="mt-3 p-3 bg-emerald-900/90 rounded-xl border border-emerald-600/60 flex items-start gap-2.5 text-xs text-emerald-100">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-white flex items-center gap-1.5">
                <span>100% Standalone Application — NOT a Google Chrome Extension</span>
              </div>
              <p className="text-[11px] text-emerald-200/90 leading-snug mt-0.5">
                This installs directly onto your Windows 7/8/10/11 desktop or Android phone as a self-contained program. Does NOT run as a browser extension, does NOT require Chrome Web Store, and works 100% offline with its own local database.
              </p>
            </div>
          </div>

          {/* Quick Install Banner if browser supports native prompt */}
          {isInstallable && !isStandalone && (
            <div className="mt-3 pt-3 border-t border-emerald-800/60 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Ready for 1-click desktop/mobile system installation!</span>
              </div>
              <button
                onClick={handleInstallClick}
                disabled={installing}
                className="w-full sm:w-auto px-5 py-2.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg transition transform active:scale-95 flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>{installing ? 'Installing...' : '1-Click Install Application (ایپ انسٹال کریں)'}</span>
              </button>
            </div>
          )}

          {isStandalone && (
            <div className="mt-3 p-2.5 bg-emerald-800/80 rounded-xl border border-emerald-600/60 flex items-center gap-2 text-xs text-emerald-200 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>ERP Mandi is currently running as an installed standalone desktop application!</span>
            </div>
          )}
        </div>

        {/* Platform Selection Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-3 sm:px-6 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('standalone_app')}
            className={`flex items-center gap-2 py-3 px-3.5 text-xs font-bold border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'standalone_app'
                ? 'border-emerald-600 text-emerald-950 bg-white font-extrabold shadow-2xs'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Monitor className="w-4 h-4 text-emerald-700" />
            <span>Install as Application</span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full font-bold">No Extension</span>
          </button>

          <button
            onClick={() => setActiveTab('maui')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'maui'
                ? 'border-emerald-600 text-emerald-800 bg-white font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4 text-emerald-600" />
            <span>.NET MAUI 8 (EXE + APK)</span>
            <span className="font-urdu text-[11px] text-emerald-700 font-bold">(ونڈوز اور اینڈرائڈ)</span>
          </button>

          <button
            onClick={() => setActiveTab('apk')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'apk'
                ? 'border-emerald-600 text-emerald-800 bg-white font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Smartphone className="w-4 h-4 text-emerald-600" />
            <span>Android APK (.apk)</span>
            <span className="font-urdu text-[11px] text-emerald-700 font-bold">(اے پی کے فائل)</span>
          </button>

          <button
            onClick={() => setActiveTab('android')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'android'
                ? 'border-emerald-600 text-emerald-800 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Smartphone className="w-4 h-4 text-emerald-600" />
            <span>Android 1-Click PWA</span>
            <span className="font-urdu text-[11px] text-slate-400">(موبائل انسٹال)</span>
          </button>

          <button
            onClick={() => setActiveTab('ios')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'ios'
                ? 'border-emerald-600 text-emerald-800 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Apple className="w-4 h-4 text-slate-800" />
            <span>iPhone / iPad</span>
            <span className="font-urdu text-[11px] text-slate-400">(آئی فون)</span>
          </button>

          <button
            onClick={() => setActiveTab('desktop')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'desktop'
                ? 'border-emerald-600 text-emerald-800 bg-white font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Monitor className="w-4 h-4 text-emerald-600" />
            <span>Windows 7 / 8 / 10 / 11 Desktop (.EXE)</span>
            <span className="font-urdu text-[11px] text-emerald-700 font-bold">(ونڈوز 7 سپورٹ)</span>
          </button>

          <button
            onClick={() => setActiveTab('offline')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'offline'
                ? 'border-emerald-600 text-emerald-800 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <WifiOff className="w-4 h-4 text-amber-600" />
            <span>Offline & Data</span>
            <span className="font-urdu text-[11px] text-slate-400">(آف لائن)</span>
          </button>

          <button
            onClick={() => setActiveTab('installer')}
            className={`flex items-center gap-2 py-3 px-3 text-xs font-semibold border-b-2 whitespace-nowrap transition-colors ${
              activeTab === 'installer'
                ? 'border-emerald-600 text-emerald-800 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FolderArchive className="w-4 h-4 text-emerald-700" />
            <span>Offline Installer (.ZIP)</span>
            <span className="font-urdu text-[11px] text-slate-400">(آف لائن پیکج)</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5 sm:p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          
          {/* STANDALONE APPLICATION (NOT A GOOGLE EXTENSION) HERO & ACTIONS */}
          {activeTab === 'standalone_app' && (
            <div className="space-y-5">
              {/* PRIMARY HERO CARD */}
              <div className="bg-gradient-to-br from-slate-950 via-emerald-950 to-slate-900 text-white p-5 rounded-2xl border border-emerald-700/60 shadow-xl space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-lg shrink-0">
                      <Monitor className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-base sm:text-lg text-white">
                          Standalone Application Installation
                        </h3>
                        <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold">
                          Zero Extension
                        </span>
                      </div>
                      <p className="text-xs text-emerald-300 font-urdu font-semibold">
                        یہ ایک مکمل انڈیپینڈنٹ سافٹ ویئر ایپلی کیشن کے طور پر انسٹال ہوتا ہے، کوئی گوگل یا براؤزر ایکسٹینشن نہیں ہے
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Unlike a Chrome extension, Mandi ERP installs directly onto your operating system as an <strong>independent native program</strong>. It has its own desktop shortcut icon, runs in its own window without browser address bars, and stores all vouchers in an offline local database with <strong>0% dependency on Google Cloud or Web Store</strong>.
                </p>

                {/* 1-CLICK DIRECT INSTALL TRIGGER */}
                <div className="pt-2">
                  <button
                    onClick={handleInstallClick}
                    disabled={installing}
                    className="w-full py-3.5 px-4 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-extrabold text-sm rounded-xl shadow-lg transition flex items-center justify-center gap-2.5 active:scale-95 animate-pulse"
                  >
                    <Download className="w-5 h-5 text-slate-950" />
                    <span>{installing ? 'Launching Application Installer...' : '🚀 1-Click Install as Desktop App (کمپیوٹر پر ایپ انسٹال کریں)'}</span>
                  </button>
                  <div className="text-[11px] text-center text-slate-400 mt-1.5">
                    Installs standalone window to your Windows Start Menu & Desktop (No Chrome extension needed)
                  </div>
                </div>
              </div>

              {/* 4 INSTALLATION OPTIONS CARDS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                
                {/* OPTION 1: WINDOWS 7/8/10/11 1-CLICK DESKTOP PACKAGE */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col justify-between hover:border-emerald-300 transition-all shadow-2xs">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Windows 7, 8, 10, 11</span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">Desktop App</span>
                    </div>
                    <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                      <FolderArchive className="w-4 h-4 text-emerald-700" />
                      <span>Windows Desktop ZIP</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-snug">
                      Includes 1-click batch launcher, silent desktop runner, and VBScript desktop shortcut creator. Works 100% offline on Windows 7!
                    </p>
                  </div>

                  <button
                    onClick={handleDownloadZip}
                    disabled={downloadingZip}
                    className="mt-3 w-full py-2.5 px-3 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-xs active:scale-95"
                  >
                    <FolderArchive className="w-3.5 h-3.5 text-emerald-300" />
                    <span>{downloadingZip ? 'Packaging...' : 'Download Windows ZIP'}</span>
                  </button>
                </div>

                {/* OPTION 2: STANDALONE APP WINDOW (PWA) */}
                <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 flex flex-col justify-between shadow-2xs">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">PC & Laptop</span>
                      <span className="text-[10px] bg-emerald-600 text-white font-bold px-1.5 py-0.5 rounded">1-Click Install</span>
                    </div>
                    <div className="font-bold text-emerald-950 text-sm flex items-center gap-1.5">
                      <Monitor className="w-4 h-4 text-emerald-700" />
                      <span>Dedicated App Window</span>
                    </div>
                    <p className="text-[11px] text-emerald-900/80 leading-snug">
                      Runs as an independent desktop window with taskbar icon. No address bar, no browser tabs, zero extensions.
                    </p>
                  </div>

                  <button
                    onClick={handleInstallClick}
                    className="mt-3 w-full py-2.5 px-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-xs active:scale-95"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-200" />
                    <span>Install App Window</span>
                  </button>
                </div>

                {/* OPTION 3: WINDOWS .EXE & .NET MAUI / WPF SOLUTION */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col justify-between hover:border-emerald-300 transition-all shadow-2xs">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Win 7/8/10/11</span>
                      <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-1.5 py-0.5 rounded">Native EXE</span>
                    </div>
                    <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                      <HardDriveDownload className="w-4 h-4 text-blue-700" />
                      <span>Windows .EXE & SQLite</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-snug">
                      Standalone Windows program with offline SQLite database, desktop icon, and direct raw thermal printing.
                    </p>
                  </div>

                  <button
                    onClick={handleDownloadWpfSolution}
                    disabled={downloadingWpf}
                    className="mt-3 w-full py-2.5 px-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-xs active:scale-95"
                  >
                    <HardDriveDownload className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{downloadingWpf ? 'Packaging...' : 'Download .EXE / Solution'}</span>
                  </button>
                </div>

                {/* OPTION 4: ANDROID STANDALONE APK */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col justify-between hover:border-emerald-300 transition-all shadow-2xs">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Android Mobile</span>
                      <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-1.5 py-0.5 rounded">APK / Mobile</span>
                    </div>
                    <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                      <Smartphone className="w-4 h-4 text-purple-700" />
                      <span>Android Standalone APK</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-snug">
                      Direct Android APK file and mobile QR install hub without Google Play Store or parsing errors.
                    </p>
                  </div>

                  <button
                    onClick={() => setActiveTab('apk')}
                    className="mt-3 w-full py-2.5 px-3 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-xs active:scale-95"
                  >
                    <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Open APK & QR Hub</span>
                  </button>
                </div>

              </div>

              {/* CLEAR COMPARISON TABLE: APPLICATION VS GOOGLE EXTENSION */}
              <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Why Mandi ERP is a Standalone Application (NOT a Google Extension):</span>
                  </span>
                  <span className="text-[10px] font-urdu text-slate-500 font-semibold">ایپلیکیشن بمقابلہ ایکسٹینشن</span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 text-[10px] uppercase font-bold">
                        <th className="py-2 px-3">System Feature</th>
                        <th className="py-2 px-3 text-emerald-800 font-bold bg-emerald-50">Mandi ERP Application (✓)</th>
                        <th className="py-2 px-3 text-rose-700">Google / Browser Extension (✗)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      <tr>
                        <td className="py-2.5 px-3 font-semibold text-slate-900">Program Execution</td>
                        <td className="py-2.5 px-3 text-emerald-900 font-bold bg-emerald-50/50">
                          Independent desktop window / native .EXE program
                        </td>
                        <td className="py-2.5 px-3 text-slate-500">
                          Runs inside Chrome browser toolbar
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-semibold text-slate-900">Desktop & Taskbar Shortcut</td>
                        <td className="py-2.5 px-3 text-emerald-900 font-bold bg-emerald-50/50">
                          Direct desktop icon & Windows Start Menu entry
                        </td>
                        <td className="py-2.5 px-3 text-slate-500">
                          None (hidden in browser puzzle icon)
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-semibold text-slate-900">Offline Mandi Operations</td>
                        <td className="py-2.5 px-3 text-emerald-900 font-bold bg-emerald-50/50">
                          100% Offline with local SQLite / browser vault
                        </td>
                        <td className="py-2.5 px-3 text-slate-500">
                          Requires active browser and online store
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-semibold text-slate-900">Thermal Printer Integration</td>
                        <td className="py-2.5 px-3 text-emerald-900 font-bold bg-emerald-50/50">
                          Direct WinSpool RAW ESC/POS printer driver support
                        </td>
                        <td className="py-2.5 px-3 text-slate-500">
                          Blocked by browser security sandbox
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2.5 px-3 font-semibold text-slate-900">Google Dependency</td>
                        <td className="py-2.5 px-3 text-emerald-900 font-bold bg-emerald-50/50">
                          Zero (No Google Web Store or account needed)
                        </td>
                        <td className="py-2.5 px-3 text-slate-500">
                          100% dependent on Google Web Store
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* .NET MAUI 8 DUAL NATIVE & AUTO-SYNC TAB */}
          {activeTab === 'maui' && (
            <div className="space-y-4">
              {/* HERO CARD */}
              <div className="bg-gradient-to-r from-slate-950 via-emerald-950 to-slate-900 text-white p-5 rounded-2xl border border-emerald-800 shadow-xl">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-emerald-600/80 border border-emerald-500 flex items-center justify-center shadow-inner shrink-0">
                      <Layers className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-white text-base">
                          .NET MAUI 8 Cross-Platform Solution
                        </h3>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/30">
                          Offline-First
                        </span>
                      </div>
                      <p className="text-xs text-emerald-300 font-urdu mt-0.5">
                        ایک ہی کوڈ سے ونڈوز GrainMarket.exe اور اینڈرائڈ com.grainmarket.apk
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleDownloadMauiSolution}
                    disabled={downloadingMaui}
                    className="w-full sm:w-auto px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2 active:scale-95 disabled:bg-slate-700"
                  >
                    <FolderArchive className="w-4 h-4" />
                    <span>{downloadingMaui ? 'Packaging MAUI Solution...' : 'Download .NET MAUI 8 (.ZIP)'}</span>
                  </button>
                </div>
              </div>

              {/* 1. THREE OUTPUTS (WINDOWS 7/8, WINDOWS 10/11, ANDROID) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
                  <div className="flex items-center gap-2">
                    <Monitor className="w-4 h-4 text-emerald-700" />
                    <span className="text-xs font-bold text-slate-900">Windows 7/8/10/11: Win7.exe</span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Older Mandi PCs (Pentium / Core 2 Duo) running Windows 7 SP1 (32-bit &amp; 64-bit). No Win10 required!
                  </p>
                  <div className="bg-slate-900 text-emerald-400 p-2 rounded-lg font-mono text-[10px] select-all overflow-x-auto">
                    build-windows7-x86-x64.bat (net48)
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
                  <div className="flex items-center gap-2">
                    <Monitor className="w-4 h-4 text-emerald-700" />
                    <span className="text-xs font-bold text-slate-900">Windows 10/11: GrainMarket.exe</span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Modern Desktop .exe, local SQLite per business, Master terminal node, Direct ESC/POS raw thermal printing.
                  </p>
                  <div className="bg-slate-900 text-emerald-400 p-2 rounded-lg font-mono text-[10px] select-all overflow-x-auto">
                    dotnet publish -f net8.0-windows10.0.19041.0
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-emerald-700" />
                    <span className="text-xs font-bold text-slate-900">Android: com.grainmarket.apk</span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Native Android APK, local SQLite, Slave node, QR code pairing, Bluetooth 3-inch thermal printing &amp; WhatsApp sharing.
                  </p>
                  <div className="bg-slate-900 text-emerald-400 p-2 rounded-lg font-mono text-[10px] select-all overflow-x-auto">
                    dotnet publish -f net8.0-android
                  </div>
                </div>
              </div>

              {/* 2. THREE-STEP OFFLINE-FIRST + AUTO-SYNC CYCLE */}
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 space-y-2">
                <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                  <span>Real Mandi Workflow (صبح، دوپہر، شام کا طریقہ کار)</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs text-slate-700 pt-1">
                  <div className="bg-white p-3 rounded-lg border border-emerald-100 shadow-2xs">
                    <div className="font-bold text-emerald-900">🌅 Morning in Mandi</div>
                    <div className="text-[11px] text-slate-600 mt-1">
                      No internet. Munshi enters 20 purchases on Android Mobile APK. Saved locally in SQLite + added to SyncQueue 🔴.
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-emerald-100 shadow-2xs">
                    <div className="font-bold text-emerald-900">☀️ Afternoon at Shop</div>
                    <div className="text-[11px] text-slate-600 mt-1">
                      Connects to shop WiFi. Connectivity plugin detects internet 🟢. Auto-Sync pushes 20 vouchers straight to Desktop EXE!
                    </div>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-emerald-100 shadow-2xs">
                    <div className="font-bold text-emerald-900">🌆 Evening Approval</div>
                    <div className="text-[11px] text-slate-600 mt-1">
                      Seth inspects & approves vouchers on Desktop Master. Status updates & syncs back to Munshi's mobile APK as Approved!
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. CORE ARCHITECTURE SPECIFICATIONS */}
              <div className="bg-white border border-slate-200 rounded-xl p-3.5 space-y-2 text-xs">
                <div className="font-bold text-slate-900">Database & Sync Architecture Details:</div>
                <ul className="space-y-1.5 text-[11px] text-slate-600">
                  <li className="flex items-start gap-1.5">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span><strong>Local SQLite per business</strong>: e.g. <code>AliTraders.db</code>, <code>NazarSoonCorp.db</code> with WAL mode.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span><strong>Universal Columns</strong>: Every table includes <code>Id, CreatedAt, UpdatedAt, IsSynced, DeviceId, IsDeleted</code>.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span><strong>Conflict Resolution</strong>: Last UpdatedAt wins (Desktop Master wins on exact timestamp tie).</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span><strong>Device Pairing</strong>: Desktop generates QR code with <code>BusinessId + SyncKey</code>. Maximum 1 Desktop + 3 Mobiles per business.</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span><strong>Direct Thermal Printing</strong>: Desktop uses Windows <code>winspool.drv</code> RAW ESC/POS spooling (0 browser popups). Mobile uses Bluetooth ESC/POS & WhatsApp PDF share.</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* ANDROID TAB */}
          {activeTab === 'android' && (
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                <h3 className="font-bold text-emerald-950 text-sm flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-emerald-700" />
                  <span>How to Download & Install on Android Mobile Phone:</span>
                </h3>
                <p className="text-xs text-emerald-800 font-urdu mt-0.5">
                  اینڈرائڈ موبائل (سام سنگ، شیاؤمی، ویوو، اوپو، انفینکس) پر ڈاؤن لوڈ کرنے کا آسان طریقہ
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/70 hover:bg-slate-50 transition-colors">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs mb-2">
                    1
                  </div>
                  <div className="font-bold text-slate-900">Open in Chrome or Edge</div>
                  <div className="font-urdu text-slate-500 text-[11px] mb-1">گوگل کروم یا ایج براؤزر میں کھولیں</div>
                  <p className="text-slate-600 text-[11px]">
                    Open this URL on your mobile phone browser (Chrome, Edge, or Samsung Internet).
                  </p>
                </div>

                <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/70 hover:bg-slate-50 transition-colors">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs mb-2">
                    2
                  </div>
                  <div className="font-bold text-slate-900">Tap Browser Menu (⋮) or Install Button</div>
                  <div className="font-urdu text-slate-500 text-[11px] mb-1">براؤزر کے 3 نقطوں پر کلک کریں</div>
                  <p className="text-slate-600 text-[11px]">
                    Tap the 3 dots in the top-right corner of Chrome, or tap the green "Install App" button.
                  </p>
                </div>

                <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/70 hover:bg-slate-50 transition-colors">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs mb-2">
                    3
                  </div>
                  <div className="font-bold text-slate-900">Select "Install App" or "Add to Home Screen"</div>
                  <div className="font-urdu text-slate-500 text-[11px] mb-1">"ایپ انسٹال کریں" یا "ہوم اسکرین پر شامل کریں" منتخب کریں</div>
                  <p className="text-slate-600 text-[11px]">
                    Choose <strong>Install App</strong> (یا Add to Home screen). A confirmation prompt will appear.
                  </p>
                </div>

                <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50/70 hover:bg-slate-50 transition-colors">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs mb-2">
                    4
                  </div>
                  <div className="font-bold text-slate-900">App Icon on Mobile Screen</div>
                  <div className="font-urdu text-slate-500 text-[11px] mb-1">موبائل اسکرین پر مکمل ایپ تیار ہے</div>
                  <p className="text-slate-600 text-[11px]">
                    The Mandi ERP icon appears on your phone desktop. Tap it to launch full-screen anytime, even without internet!
                  </p>
                </div>
              </div>

              {/* DIRECT ANDROID APK DOWNLOAD CARD */}
              <div className="p-4 bg-linear-to-r from-emerald-900 to-slate-900 rounded-2xl text-white space-y-3 shadow-md border border-emerald-700/50">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/30">
                      Direct APK File (.apk)
                    </span>
                    <h4 className="font-bold text-sm text-white mt-1 flex items-center gap-1.5">
                      <Smartphone className="w-4 h-4 text-emerald-400" />
                      <span>Download Android APK Application Package</span>
                    </h4>
                    <p className="text-[11px] text-emerald-200 font-urdu mt-0.5">
                      اینڈرائڈ موبائل فون کے لیے اے پی کے (APK) فائل براہ راست ڈاؤن لوڈ کریں
                    </p>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono shrink-0">v2026.2</span>
                </div>

                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Download the complete APK package directly to your phone. Includes offline data engine, weighbridge calculator, bilingual Nastaleeq fonts, and offline vouchers cache.
                </p>

                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  <button
                    onClick={handleDownloadApk}
                    disabled={downloadingApk}
                    className="flex-1 py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2 active:scale-95 disabled:bg-slate-700 disabled:text-slate-400"
                  >
                    <Download className="w-4 h-4" />
                    <span>
                      {downloadingApk ? 'Generating APK Package...' : 'Download Android APK (.apk)'}
                    </span>
                  </button>

                  <a
                    href={`https://www.pwabuilder.com/appimage?url=${encodeURIComponent(currentUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2.5 px-3 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition"
                    title="Generate Google Play Store Signed APK via PWABuilder Cloud"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Google Play APK</span>
                  </a>
                </div>
              </div>

              {isInstallable && (
                <div className="pt-2">
                  <button
                    onClick={handleInstallClick}
                    className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Trigger Android Install Dialog (اینڈرائڈ پر انسٹال کریں)</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* DEDICATED ANDROID APK & WEBAPK INSTALLATION TAB */}
          {activeTab === 'apk' && (
            <div className="space-y-4">
              
              {/* PARSING ERROR NOTICE & INSTANT FIX BANNER */}
              <div className="p-4 bg-amber-500/10 border-2 border-amber-500/60 rounded-2xl text-slate-900 space-y-2.5 shadow-xs">
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 font-bold flex items-center justify-center shrink-0 shadow-xs">
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-amber-950 text-sm flex items-center gap-1.5">
                      <span>Facing "Problem Parsing the Package"? Here is the 100% Fix:</span>
                    </h3>
                    <div className="text-xs text-amber-900 font-urdu mt-0.5 leading-relaxed font-semibold">
                      اینڈرائڈ پر پارسنگ ایرر (There was a problem parsing the package) کیوں آتا ہے اور اس کا ۱۰۰٪ حل:
                    </div>
                  </div>
                </div>

                <div className="text-xs text-amber-950 space-y-1.5 pl-1 leading-relaxed">
                  <p>
                    <strong>Why Android shows Parse Error:</strong> Modern Android phones (Samsung, Xiaomi, Vivo, Oppo, Infinix, Tecno) block raw uncompiled files downloaded through File Managers with a <em>"Parse Error"</em>.
                  </p>
                  <p className="bg-white/80 p-2.5 rounded-xl border border-amber-300 font-medium text-emerald-950 text-xs">
                    ✅ <strong>100% Guaranteed Solution:</strong> Use <strong>Method 1 (Official 1-Click Install)</strong> below! Android Chrome will build and install the official signed application directly onto your home screen with <strong>ZERO parse errors</strong> and 100% offline access.
                  </p>
                </div>
              </div>

              {/* METHOD 1: OFFICIAL 1-CLICK WEBAPK INSTALLATION (RECOMMENDED) */}
              <div className="bg-emerald-950 text-white rounded-2xl p-5 border border-emerald-800 shadow-md space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-mono text-xs font-bold shadow-xs">
                    ★ METHOD 1 (RECOMMENDED) — 100% NO PARSE ERROR
                  </span>
                  <span className="text-xs text-emerald-300 font-mono font-semibold">Official Android WebAPK</span>
                </div>

                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <Smartphone className="w-5 h-5 text-emerald-400" />
                    <span>Direct Android Mobile App Install (براہ راست موبائل ایپ انسٹال کریں)</span>
                  </h3>
                  <p className="text-xs text-emerald-200 font-urdu mt-1 leading-relaxed">
                    یہ آفیشل اینڈرائڈ طریقہ ہے جس میں کوئی پارسنگ ایرر نہیں آتا اور ایپ براہ راست موبائل پر انسٹال ہوتی ہے۔
                  </p>
                </div>

                {/* 1-Click Trigger Button */}
                <div className="pt-1">
                  {isInstallable ? (
                    <button
                      onClick={handleInstallClick}
                      disabled={installing}
                      className="w-full py-3.5 px-4 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-extrabold text-sm rounded-xl shadow-lg transition flex items-center justify-center gap-2 active:scale-95 animate-pulse"
                    >
                      <Download className="w-5 h-5" />
                      <span>{installing ? 'Launching Android Installer...' : '🚀 1-Click Install App on Android (ابھی انسٹال کریں)'}</span>
                    </button>
                  ) : (
                    <div className="p-3 bg-emerald-900/80 rounded-xl border border-emerald-700/60 flex items-center justify-between gap-2">
                      <span className="text-xs text-emerald-100">
                        To install without file download, follow the 3 quick steps below in Chrome:
                      </span>
                      <button
                        onClick={handleInstallClick}
                        className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs shrink-0 transition"
                      >
                        Try Install
                      </button>
                    </div>
                  )}
                </div>

                {/* 3 Pictorial Steps for Android Chrome */}
                <div className="space-y-2 pt-2 border-t border-emerald-800/80">
                  <div className="font-bold text-xs text-emerald-200">
                    3-Step Installation in Mobile Chrome (۳ آسان مراحل):
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs text-slate-900">
                    <div className="p-3 bg-white rounded-xl shadow-2xs space-y-1">
                      <div className="w-6 h-6 rounded-full bg-emerald-700 text-white font-bold text-xs flex items-center justify-center">1</div>
                      <div className="font-bold">Open in Chrome</div>
                      <div className="font-urdu text-[11px] text-slate-500">موبائل کروم میں کھولیں</div>
                      <p className="text-[11px] text-slate-600">
                        Open this link in <strong>Google Chrome</strong> on your Android phone.
                      </p>
                    </div>

                    <div className="p-3 bg-white rounded-xl shadow-2xs space-y-1">
                      <div className="w-6 h-6 rounded-full bg-emerald-700 text-white font-bold text-xs flex items-center justify-center">2</div>
                      <div className="font-bold">Tap Menu (⋮ 3 Dots)</div>
                      <div className="font-urdu text-[11px] text-slate-500">اوپر ۳ نقطوں پر کلک کریں</div>
                      <p className="text-[11px] text-slate-600">
                        Tap the <strong>3 vertical dots (⋮)</strong> in Chrome’s top right corner.
                      </p>
                    </div>

                    <div className="p-3 bg-white rounded-xl shadow-2xs space-y-1">
                      <div className="w-6 h-6 rounded-full bg-emerald-700 text-white font-bold text-xs flex items-center justify-center">3</div>
                      <div className="font-bold">Tap "Install App"</div>
                      <div className="font-urdu text-[11px] text-slate-500">"Install App" منتخب کریں</div>
                      <p className="text-[11px] text-slate-600">
                        Tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>. Complete!
                      </p>
                    </div>
                  </div>
                </div>

                {/* Instant Share Link to Mobile via WhatsApp */}
                <div className="pt-2 flex flex-col sm:flex-row gap-2 border-t border-emerald-800/80">
                  <button
                    onClick={handleShareWhatsApp}
                    className="flex-1 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center justify-center gap-2 active:scale-95"
                    title="Send link to your phone via WhatsApp"
                  >
                    <MessageSquare className="w-4 h-4 text-emerald-200" />
                    <span>Send Link to Mobile via WhatsApp (واٹس ایپ پر لنک بھیجیں)</span>
                  </button>

                  <button
                    onClick={handleCopyLink}
                    className="py-2.5 px-3 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl transition flex items-center justify-center gap-1.5"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4 text-slate-300" />}
                    <span>{copied ? 'Link Copied!' : 'Copy Phone Link'}</span>
                  </button>
                </div>
              </div>

              {/* METHOD 2: BUILD SIGNED GOOGLE PLAY APK OR DOWNLOAD RAW PACKAGE */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">
                    Method 2: Standalone .APK File Options
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">For Developers & Sideloaders</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* PWABuilder Signed APK */}
                  <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-2">
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <Smartphone className="w-4 h-4 text-blue-600" />
                      <span>Certified Signed APK (PWABuilder)</span>
                    </div>
                    <p className="text-[11px] text-slate-600">
                      Builds a signed Android binary APK or Google Play AAB bundle with certified Android Keystore to bypass all parse errors.
                    </p>
                    <a
                      href={`https://www.pwabuilder.com/appimage?url=${encodeURIComponent(currentUrl)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex w-full items-center justify-center gap-1.5 py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Build Signed APK via Cloud</span>
                    </a>
                  </div>

                  {/* Raw APK Download */}
                  <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-2">
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <Download className="w-4 h-4 text-emerald-600" />
                      <span>Raw Offline Package (.apk)</span>
                    </div>
                    <p className="text-[11px] text-slate-600">
                      Standalone ZIP-structured bundle containing offline database, vouchers, manifests, and runner scripts.
                    </p>
                    <button
                      onClick={handleDownloadApk}
                      disabled={downloadingApk}
                      className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-lg transition flex items-center justify-center gap-1.5 disabled:bg-slate-400"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>{downloadingApk ? 'Generating...' : 'Download Raw Package'}</span>
                    </button>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* IOS TAB */}
          {activeTab === 'ios' && (
            <div className="space-y-4">
              <div className="bg-slate-100 border border-slate-300 rounded-xl p-4">
                <h3 className="font-bold text-slate-950 text-sm flex items-center gap-2">
                  <Apple className="w-4 h-4 text-slate-800" />
                  <span>How to Download & Install on iPhone / iPad (iOS Safari):</span>
                </h3>
                <p className="text-xs text-slate-700 font-urdu mt-0.5">
                  ایپل آئی فون پر بغیر ایپ اسٹور کے براہ راست انسٹال کرنے کا طریقہ
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50">
                  <div className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-xs mb-2">
                    1
                  </div>
                  <div className="font-bold text-slate-900">Open in Safari</div>
                  <div className="font-urdu text-slate-500 text-[11px] mb-1">سفاری براؤزر میں کھولیں</div>
                  <p className="text-slate-600 text-[11px]">
                    Make sure this website is open in Apple <strong>Safari</strong> (not Chrome on iOS).
                  </p>
                </div>

                <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50">
                  <div className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-xs mb-2">
                    2
                  </div>
                  <div className="font-bold text-slate-900 flex items-center gap-1">
                    <span>Tap Share Button</span>
                    <Share2 className="w-3.5 h-3.5 text-blue-600" />
                  </div>
                  <div className="font-urdu text-slate-500 text-[11px] mb-1">شیئر کے نشان (مربع تیر) پر ٹیپ کریں</div>
                  <p className="text-slate-600 text-[11px]">
                    Tap the square icon with arrow pointing up (⎋) in Safari’s bottom navigation bar.
                  </p>
                </div>

                <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50">
                  <div className="w-6 h-6 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-xs mb-2">
                    3
                  </div>
                  <div className="font-bold text-slate-900">Tap "Add to Home Screen"</div>
                  <div className="font-urdu text-slate-500 text-[11px] mb-1">"ہوم اسکرین میں شامل کریں" دبائیں</div>
                  <p className="text-slate-600 text-[11px]">
                    Scroll down and tap <strong>Add to Home Screen</strong> [+] and confirm "Add".
                  </p>
                </div>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                <HelpCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Tip for iPhone Users:</strong> Once added to your home screen, the Mandi ERP will run full-screen just like an App Store app, saving local vouchers and weighing tickets even when disconnected.
                </div>
              </div>
            </div>
          )}

          {/* DESKTOP TAB */}
          {activeTab === 'desktop' && (
            <div className="space-y-4">
              {/* PRIMARY: WINDOWS 7 / 8 / 10 / 11 STANDALONE WPF + SQLITE .EXE */}
              <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white rounded-2xl p-4 sm:p-5 border border-emerald-700/80 shadow-md space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-mono text-[11px] font-bold shadow-xs">
                    Windows 7 SP1 / 8 / 10 / 11 Eligible (.EXE)
                  </span>
                  <span className="text-xs text-emerald-300 font-mono font-semibold">32-Bit (x86) &amp; 64-Bit (x64)</span>
                </div>

                <div>
                  <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                    <Monitor className="w-5 h-5 text-emerald-400 shrink-0" />
                    <span>Windows 7 SP1 to Windows 11 Desktop (.EXE)</span>
                  </h3>
                  <p className="text-xs text-emerald-200 font-urdu mt-1 leading-relaxed">
                    غلہ منڈی کے پرانے کمپیوٹرز (Core 2 Duo / Pentium / Core i3) اور ونڈوز 7 (32-بٹ و 64-بٹ) کے لیے 100% موزوں — بغیر کسی انٹرنیٹ، ویب سرور یا فائر بیس کے۔
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px]">
                  <div className="p-2 bg-emerald-900/40 rounded-lg border border-emerald-700/50">
                    <div className="font-bold text-emerald-300">Windows 7 SP1</div>
                    <div className="text-slate-300 text-[10px]">32-bit &amp; 64-bit native</div>
                  </div>
                  <div className="p-2 bg-emerald-900/40 rounded-lg border border-emerald-700/50">
                    <div className="font-bold text-emerald-300">100% Offline</div>
                    <div className="text-slate-300 text-[10px]">No cloud/Firebase</div>
                  </div>
                  <div className="p-2 bg-emerald-900/40 rounded-lg border border-emerald-700/50">
                    <div className="font-bold text-emerald-300">Local SQLite DB</div>
                    <div className="text-slate-300 text-[10px]">Per-business .db file</div>
                  </div>
                  <div className="p-2 bg-emerald-900/40 rounded-lg border border-emerald-700/50">
                    <div className="font-bold text-emerald-300">Direct Thermal</div>
                    <div className="text-slate-300 text-[10px]">WinSpool RAW ESC/POS</div>
                  </div>
                </div>

                {/* WINDOWS 7 COMPILER HIGHLIGHT */}
                <div className="p-3 bg-slate-900/80 rounded-xl border border-emerald-800/60 text-xs space-y-1.5">
                  <div className="font-bold text-emerald-400 flex items-center justify-between">
                    <span>Windows 7 Compatibility Engine:</span>
                    <span className="text-[10px] text-slate-400">Target: net48 / net8.0-windows</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Uses .NET Framework 4.8 / .NET 8 multi-targeting and raw <code>winspool.drv</code> Win32 P/Invoke. Double-click <code>build-windows7-x86-x64.bat</code> in the downloaded folder to produce <code>MandiERP-Win7.exe</code> instantly.
                  </p>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-2.5 border-t border-emerald-800/80">
                  <button
                    onClick={handleDownloadWpfSolution}
                    disabled={downloadingWpf}
                    className="flex-1 py-3 px-4 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2 active:scale-95 disabled:bg-slate-700"
                  >
                    <FolderArchive className="w-4 h-4 text-slate-950" />
                    <span>{downloadingWpf ? 'Packaging Windows 7 Solution...' : 'Download Windows 7 / 8 / 10 / 11 Package (.ZIP)'}</span>
                  </button>

                  {onOpenOfflineInstaller && (
                    <button
                      onClick={() => {
                        onClose();
                        onOpenOfflineInstaller();
                      }}
                      className="py-3 px-4 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl transition flex items-center justify-center gap-2"
                    >
                      <ExternalLink className="w-4 h-4 text-emerald-300" />
                      <span>Full Desktop &amp; USB Hub</span>
                    </button>
                  )}
                </div>
              </div>

              {/* SECONDARY: BROWSER / PWA APP SHORTCUT */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <Monitor className="w-3.5 h-3.5 text-blue-600" />
                    <span>Browser Desktop Web App (PWA Shortcut)</span>
                  </span>
                  <span className="text-[10px] text-slate-500 font-urdu">ایج یا گوگل کروم شارٹ کٹ</span>
                </div>
                <p className="text-slate-600 text-xs">
                  Runs directly inside Chrome or Microsoft Edge with offline cache and dedicated window.
                </p>

                {isInstallable && (
                  <button
                    onClick={handleInstallClick}
                    className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Install PWA on This Computer (کمپیوٹر پر انسٹال کریں)</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* OFFLINE & DATA TAB */}
          {activeTab === 'offline' && (
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                <h3 className="font-bold text-emerald-950 text-sm flex items-center gap-2">
                  <HardDriveDownload className="w-4 h-4 text-emerald-700" />
                  <span>Download Standalone Data & Offline Architecture:</span>
                </h3>
                <p className="text-xs text-emerald-800 font-urdu mt-0.5">
                  مکمل ڈیٹا کا آف لائن بیک اپ ڈاؤن لوڈ کریں اور بغیر انٹرنیٹ استعمال کریں
                </p>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Mandi ERP is built with <strong>Service Workers</strong> and an <strong>Offline-First Storage Engine</strong>. Whenever you record purchases, sales, or weighbridge tickets, all transactions are stored immediately in local device storage. You do not need continuous Wi-Fi or mobile data at the weigh station.
              </p>

              <div className="p-4 border border-slate-200 rounded-xl bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <div className="font-bold text-xs text-slate-900">Download Offline Installer Package (.ZIP)</div>
                  <div className="text-[11px] text-slate-500 font-urdu">
                    ونڈوز کمپیوٹر کے لیے 1-کلک انسٹالر پیکج مع run-mandi-windows.bat رنر
                  </div>
                </div>
                <button
                  onClick={handleDownloadZip}
                  disabled={downloadingZip}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs transition flex items-center gap-2 shrink-0"
                >
                  <FolderArchive className="w-4 h-4" />
                  <span>{downloadingZip ? 'Packaging ZIP...' : 'Download Installer ZIP'}</span>
                </button>
              </div>

              <div className="p-4 border border-slate-200 rounded-xl bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <div className="font-bold text-xs text-slate-900">Export Complete Mandi Database (.JSON)</div>
                  <div className="text-[11px] text-slate-500">
                    Download full offline snapshot containing all vouchers, accounts, and businesses to a file.
                  </div>
                </div>
                <button
                  onClick={exportFullBackupFile}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold shadow-xs transition flex items-center gap-2 shrink-0"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Data Backup File</span>
                </button>
              </div>
            </div>
          )}

          {/* OFFLINE INSTALLER TAB */}
          {activeTab === 'installer' && (
            <div className="space-y-4">
              <div className="bg-linear-to-r from-slate-900 to-emerald-950 text-white rounded-xl p-4 sm:p-5 shadow-sm">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600/80 flex items-center justify-center text-white shrink-0">
                    <FolderArchive className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white flex items-center gap-2">
                      <span>Offline Installer Package (آف لائن انسٹالر پیکج)</span>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono font-bold">
                        Zero Internet Needed
                      </span>
                    </h3>
                    <p className="text-xs text-emerald-200 font-urdu mt-0.5">
                      مکمل سافٹ ویئر انٹرنیٹ کے بغیر کسی بھی کمپیوٹر یا یو ایس بی (USB) پر چلائیں
                    </p>
                  </div>
                </div>

                <p className="text-xs text-slate-300 mt-3 leading-relaxed">
                  Download a complete, self-contained deployment bundle with 1-click batch script launcher for Windows (<code>run-mandi-windows.bat</code>), standalone index.html app, and local database backup. Perfect for remote grain market weighbridges!
                </p>

                <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap gap-2.5">
                  <button
                    onClick={handleDownloadZip}
                    disabled={downloadingZip}
                    className="flex-1 sm:flex-none px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-md active:scale-95"
                  >
                    <FolderArchive className="w-4 h-4" />
                    <span>{downloadingZip ? 'Packaging ZIP Bundle...' : 'Download Offline Installer ZIP'}</span>
                  </button>

                  <button
                    onClick={handleDownloadHtml}
                    disabled={downloadingHtml}
                    className="flex-1 sm:flex-none px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold border border-slate-700 transition flex items-center justify-center gap-2"
                  >
                    <FileCode className="w-4 h-4 text-emerald-400" />
                    <span>{downloadingHtml ? 'Generating...' : 'Download Single-File HTML'}</span>
                  </button>

                  {onOpenOfflineInstaller && (
                    <button
                      onClick={() => {
                        onClose();
                        onOpenOfflineInstaller();
                      }}
                      className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1.5"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-emerald-300" />
                      <span>Full Installer Guide & USB Setup</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Step By Step Instructions */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="border border-slate-200 rounded-xl p-3 bg-slate-50">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs mb-1.5">
                    1
                  </div>
                  <div className="font-bold text-slate-900">Extract ZIP on PC or USB</div>
                  <div className="text-[11px] font-urdu text-slate-500 mb-1">زپ فائل کو کسی بھی فولڈر میں کھولیں</div>
                  <p className="text-[11px] text-slate-600">
                    Extract to <code>C:\MandiERP</code> or your USB flash drive.
                  </p>
                </div>

                <div className="border border-slate-200 rounded-xl p-3 bg-slate-50">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs mb-1.5">
                    2
                  </div>
                  <div className="font-bold text-slate-900">Double Click .BAT File</div>
                  <div className="text-[11px] font-urdu text-slate-500 mb-1">run-mandi-windows.bat پر کلک کریں</div>
                  <p className="text-[11px] text-slate-600">
                    Double-click <code>run-mandi-windows.bat</code>. Launches instantly in app window mode.
                  </p>
                </div>

                <div className="border border-slate-200 rounded-xl p-3 bg-slate-50">
                  <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-xs mb-1.5">
                    3
                  </div>
                  <div className="font-bold text-slate-900">100% Offline Weighing</div>
                  <div className="text-[11px] font-urdu text-slate-500 mb-1">انٹرنیٹ کے بغیر تمام کھاتے اور پرچیاں</div>
                  <p className="text-[11px] text-slate-600">
                    Record weights, print invoices, and update Khatas with zero network connection.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* QR CODE & SEND TO PHONE SECTION */}
          <div className="border-t border-slate-200 pt-5">
            <div className="flex flex-col sm:flex-row items-center gap-5 bg-slate-50 rounded-xl p-4 border border-slate-200">
              <div className="bg-white p-2 rounded-xl shadow-xs border border-slate-200 shrink-0" dangerouslySetInnerHTML={{ __html: qrSvg }} />
              
              <div className="space-y-2 text-center sm:text-left flex-1">
                <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs font-bold text-slate-900">
                  <QrCode className="w-4 h-4 text-emerald-600" />
                  <span>Scan QR Code to Download on Mobile Phone</span>
                </div>
                <p className="text-[11px] text-slate-500 font-urdu leading-normal">
                  اپنے موبائل کے کیمرے سے یہ کیو آر کوڈ اسکین کریں اور فوری طور پر موبائل پر ایپ انسٹال کریں
                </p>
                <p className="text-[11px] text-slate-600">
                  Open your mobile camera, point it at this QR code, and tap the link to open and install the software on your phone.
                </p>

                <div className="flex flex-wrap items-center gap-2 pt-1 justify-center sm:justify-start">
                  <button
                    onClick={handleCopyLink}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg text-xs font-medium text-slate-700 transition"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Link Copied! (لنک کاپی ہو گیا)' : 'Copy App Link'}</span>
                  </button>
                  <span className="text-[10px] text-slate-400">Share with operators & commission agents</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3.5 flex items-center justify-between">
          <div className="text-[11px] text-slate-500">
            Version 2.0 · PWA Compatible · Cross-Platform Desktop & Mobile
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition"
          >
            Done (مکمل)
          </button>
        </div>

      </div>
    </div>
  );
};
