/**
 * Mandi ERP - Complete Offline Installer Modal (آف لائن انسٹالر سینٹر)
 * Allows users to download:
 * 1. Offline Installer ZIP package with Windows .bat launcher & scripts
 * 2. Standalone Single-File .HTML application
 * 3. 1-Click PWA offline installation
 */

import React, { useState } from 'react';
import {
  Download,
  FolderArchive,
  Monitor,
  Smartphone,
  HardDrive,
  FileCode,
  CheckCircle2,
  X,
  Play,
  Copy,
  Check,
  Usb,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { useMandi } from '../context/MandiContext';
import {
  generateOfflineInstallerZip,
  generateSingleFileOfflineHtmlBlob,
  generateAndroidApkBlob,
  generateWpfDotNetSolutionZip,
  generateSqliteDumpSql
} from '../utils/offlineInstaller';
import { usePWAInstall } from '../utils/usePWAInstall';

interface OfflineInstallerModalProps {
  onClose: () => void;
}

export const OfflineInstallerModal: React.FC<OfflineInstallerModalProps> = ({ onClose }) => {
  const { filteredVouchers, parties, items, appSettings, currentBusiness } = useMandi();
  const { isInstallable, isStandalone, install } = usePWAInstall();

  const [activeTab, setActiveTab] = useState<'wpf' | 'windows' | 'standalone' | 'apk' | 'usb' | 'pwa'>('wpf');
  const [downloadingWpf, setDownloadingWpf] = useState(false);
  const [downloadingSql, setDownloadingSql] = useState(false);
  const [downloadingZip, setDownloadingZip] = useState(false);
  const [downloadingHtml, setDownloadingHtml] = useState(false);
  const [downloadingApk, setDownloadingApk] = useState(false);
  const [copied, setCopied] = useState(false);

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

  const handleDownloadSqliteDump = () => {
    setDownloadingSql(true);
    try {
      const sqlText = generateSqliteDumpSql({
        vouchers: filteredVouchers,
        parties,
        items,
        appSettings,
        businessName: currentBusiness.name
      });
      const blob = new Blob([sqlText], { type: 'application/sql' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Mandi_${currentBusiness.name.replace(/\s+/g, '_')}_SQLite_Seed.sql`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloadingSql(false);
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
      console.error('Error generating offline zip:', err);
      alert('Failed to generate offline ZIP package.');
    } finally {
      setDownloadingZip(false);
    }
  };

  const handleDownloadSingleHtml = () => {
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
      a.download = `Mandi-ERP-Standalone-Offline-${currentBusiness.name.replace(/\s+/g, '_')}.html`;
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
      console.error('Error generating APK package:', err);
    } finally {
      setDownloadingApk(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto">
        
        {/* MODAL HEADER */}
        <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white p-5 sm:p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-700/80 border border-emerald-500 flex items-center justify-center shadow-inner shrink-0">
              <HardDrive className="w-6 h-6 text-emerald-200" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold tracking-tight">
                  ERP Mandi Stock Management System — Standalone Application
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/30">
                  No Extension
                </span>
              </div>
              <p className="text-xs text-emerald-300 font-urdu mt-0.5">
                غلہ منڈی اسٹاک مینجمنٹ سسٹم - آزادانہ کمپیوٹر ایپلی کیشن (کوئی گوگل ایکسٹینشن نہیں)
              </p>
            </div>
          </div>

          <p className="text-xs text-slate-300 max-w-xl leading-relaxed mt-2.5">
            Installs directly onto Windows 7 / 8 / 10 / 11 and mobile devices as a standalone program. Operates 100% offline at grain market yards with no dependency on Google Chrome Web Store or browser extensions.
          </p>

          {/* PRIMARY DOWNLOAD BUTTONS */}
          <div className="mt-4 pt-4 border-t border-slate-800 flex flex-wrap items-center gap-3">
            <button
              onClick={handleDownloadWpfSolution}
              disabled={downloadingWpf}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2 active:scale-95 disabled:bg-slate-700"
              title="Download complete C# solution for Windows 7 SP1 (32-bit & 64-bit), Windows 8, 10, 11 with SQLite and compiler scripts"
            >
              <Monitor className="w-4 h-4 text-slate-950" />
              <span>{downloadingWpf ? 'Packaging Windows 7/8/10/11...' : 'Download Windows 7 / 8 / 10 / 11 (.ZIP)'}</span>
            </button>

            <button
              onClick={handleDownloadSqliteDump}
              disabled={downloadingSql}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 transition flex items-center justify-center gap-2"
              title="Download pure SQLite 3 database seed script"
            >
              <FileCode className="w-4 h-4 text-emerald-400" />
              <span>{downloadingSql ? 'Generating SQL...' : 'Download SQLite Database (.SQL)'}</span>
            </button>

            <button
              onClick={handleDownloadZip}
              disabled={downloadingZip}
              className="flex-1 sm:flex-none px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition flex items-center justify-center gap-2 active:scale-95"
            >
              <FolderArchive className="w-4 h-4 text-slate-400" />
              <span>{downloadingZip ? 'Packaging...' : 'Web Offline (.ZIP)'}</span>
            </button>

            <button
              onClick={handleDownloadSingleHtml}
              disabled={downloadingHtml}
              className="flex-1 sm:flex-none px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition flex items-center justify-center gap-2"
            >
              <FileCode className="w-4 h-4 text-slate-400" />
              <span>Single-File HTML</span>
            </button>
          </div>
        </div>

        {/* NAVIGATION TABS */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 sm:px-6 overflow-x-auto scrollbar-none text-xs">
          <button
            onClick={() => setActiveTab('wpf')}
            className={`py-3 px-3 font-semibold border-b-2 flex items-center gap-2 whitespace-nowrap transition ${
              activeTab === 'wpf'
                ? 'border-emerald-600 text-emerald-800 bg-white font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Monitor className="w-4 h-4 text-emerald-600" />
            <span>Windows 7 / 8 / 10 / 11 Desktop (.EXE)</span>
            <span className="font-urdu text-[11px] text-emerald-700 font-bold">(ونڈوز 7 سپورٹ)</span>
          </button>

          <button
            onClick={() => setActiveTab('windows')}
            className={`py-3 px-3 font-semibold border-b-2 flex items-center gap-2 whitespace-nowrap transition ${
              activeTab === 'windows'
                ? 'border-emerald-600 text-emerald-800 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Monitor className="w-4 h-4 text-blue-600" />
            <span>Windows Web Runner (.BAT)</span>
            <span className="font-urdu text-[11px] text-slate-400">(ونڈوز براؤزر)</span>
          </button>

          <button
            onClick={() => setActiveTab('usb')}
            className={`py-3 px-3 font-semibold border-b-2 flex items-center gap-2 whitespace-nowrap transition ${
              activeTab === 'usb'
                ? 'border-emerald-600 text-emerald-800 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Usb className="w-4 h-4 text-amber-600" />
            <span>USB Flash Drive Setup</span>
            <span className="font-urdu text-[11px] text-slate-400">(یو ایس بی پر چلائیں)</span>
          </button>

          <button
            onClick={() => setActiveTab('standalone')}
            className={`py-3 px-3 font-semibold border-b-2 flex items-center gap-2 whitespace-nowrap transition ${
              activeTab === 'standalone'
                ? 'border-emerald-600 text-emerald-800 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileCode className="w-4 h-4 text-emerald-600" />
            <span>Single File Standalone (.HTML)</span>
            <span className="font-urdu text-[11px] text-slate-400">(سنگل فائل)</span>
          </button>

          <button
            onClick={() => setActiveTab('pwa')}
            className={`py-3 px-3 font-semibold border-b-2 flex items-center gap-2 whitespace-nowrap transition ${
              activeTab === 'pwa'
                ? 'border-emerald-600 text-emerald-800 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Smartphone className="w-4 h-4 text-purple-600" />
            <span>Browser PWA Cache</span>
            <span className="font-urdu text-[11px] text-slate-400">(براؤزر کیشے)</span>
          </button>
        </div>

        {/* TAB BODY */}
        <div className="p-5 sm:p-6 space-y-4 max-h-[55vh] overflow-y-auto text-xs">
          
          {/* WINDOWS DESKTOP WPF (WINDOWS 7/8/10/11 + SQLITE) TAB */}
          {activeTab === 'wpf' && (
            <div className="space-y-4">
              <div className="bg-emerald-950 text-white rounded-2xl p-5 border border-emerald-800 shadow-md space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 font-mono text-xs font-bold shadow-xs">
                    Windows 7 SP1 / 8 / 10 / 11 Eligible (.EXE)
                  </span>
                  <span className="text-xs text-emerald-300 font-mono font-semibold">32-Bit (x86) &amp; 64-Bit (x64)</span>
                </div>

                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <Monitor className="w-5 h-5 text-emerald-400" />
                    <span>Mandi ERP Windows 7 to 11 Standalone (.EXE)</span>
                  </h3>
                  <p className="text-xs text-emerald-200 font-urdu mt-1 leading-relaxed">
                    غلہ منڈی کے پرانے کمپیوٹرز اور ونڈوز 7 (32-بٹ و 64-بٹ) کے لیے 100% موزوں — بغیر کسی انٹرنیٹ، ویب سرور یا فائر بیس کے۔
                  </p>
                </div>

                <div className="p-3 bg-slate-900/80 rounded-xl border border-emerald-800/60 text-xs space-y-1">
                  <div className="font-bold text-emerald-400 flex items-center justify-between">
                    <span>Windows 7 Compatibility:</span>
                    <span className="text-[10px] text-slate-400">Target: net48 / net8.0-windows</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Runs on Windows 7 SP1 with .NET Framework 4.8. Uses native <code>winspool.drv</code> raw thermal printing. Double-click <code>build-windows7-x86-x64.bat</code> to compile.
                  </p>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row gap-2.5 border-t border-emerald-800/80">
                  <button
                    onClick={handleDownloadWpfSolution}
                    disabled={downloadingWpf}
                    className="flex-1 py-3 px-4 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2 active:scale-95 disabled:bg-slate-700"
                  >
                    <FolderArchive className="w-4 h-4" />
                    <span>{downloadingWpf ? 'Packaging Windows 7 Solution...' : 'Download Windows 7 / 8 / 10 / 11 Solution (.ZIP)'}</span>
                  </button>

                  <button
                    onClick={handleDownloadSqliteDump}
                    disabled={downloadingSql}
                    className="py-3 px-4 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2"
                  >
                    <FileCode className="w-4 h-4 text-emerald-300" />
                    <span>{downloadingSql ? 'Generating SQL...' : 'Download SQLite Database (.SQL)'}</span>
                  </button>
                </div>
              </div>

              {/* 4 CORE ARCHITECTURAL PILLARS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-900">
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <span className="text-emerald-700 font-bold">1.</span>
                    <span>Zero Web Dependencies &amp; No Firebase</span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-urdu">مکمل آف لائن - بغیر کسی کلاؤڈ یا فائر بیس کے</div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Pure Windows C# WPF desktop code. Operates completely disconnected in grain market yards. Local PIN authentication, no Google extensions, and zero telemetry.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <span className="text-emerald-700 font-bold">2.</span>
                    <span>Single .EXE Executable File</span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-urdu">سنگل فائل (MandiERP.exe) - کاپی کریں اور چلائیں</div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Self-contained single binary containing the .NET 8 runtime and native SQLite engine. Double-click <strong>MandiERP.exe</strong> to run on any 64-bit Windows 10/11 PC.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <span className="text-emerald-700 font-bold">3.</span>
                    <span>Local SQLite File Per Business</span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-urdu">ہر فرم کے لیے علیحدہ لوکل SQLite ڈیٹا بیس فائل</div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Uses <code className="font-mono bg-slate-200 px-1 rounded text-[10px]">Microsoft.Data.Sqlite</code>. Each business saves to its own local file (<code className="font-mono text-[10px]">Data\Mandi_biz-1.db</code>) with high-speed WAL mode commits.
                  </p>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <span className="text-emerald-700 font-bold">4.</span>
                    <span>Direct Thermal Printer (No Browser Print)</span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-urdu">براہ راست تھرمل پرنٹر (ونڈوز سپولر ESC/POS)</div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    Uses Windows native <code className="font-mono bg-slate-200 px-1 rounded text-[10px]">winspool.drv</code> raw byte spooling. Sends raw ESC/POS commands directly to POS-80/TM-T88 with auto guillotine cut and zero browser dialog.
                  </p>
                </div>
              </div>

              {/* HOW TO COMPILE ON WINDOWS */}
              <div className="p-3.5 bg-slate-900 text-white rounded-xl space-y-2">
                <div className="font-bold text-xs text-emerald-300 flex items-center justify-between">
                  <span>How to Build Single .EXE on Windows (کمپائل کرنے کا طریقہ):</span>
                  <span className="text-[10px] font-mono text-slate-400">1-Click Compiler</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  1. Extract the downloaded ZIP to your computer (e.g. <code className="text-emerald-300 font-mono">C:\MandiWPF</code>).<br />
                  2. Double-click <strong className="text-emerald-400 font-mono">build-single-exe.bat</strong>.<br />
                  3. The standalone <strong className="text-white font-mono">MandiERP.exe</strong> is generated in <code className="text-emerald-300 font-mono">publish/MandiERP.exe</code> ready to run!
                </p>
              </div>
            </div>
          )}

          {/* WINDOWS TAB */}
          {activeTab === 'windows' && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <h3 className="font-bold text-blue-950 text-sm flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-blue-700" />
                  <span>How the Windows Offline Installer Works:</span>
                </h3>
                <p className="text-xs text-blue-800 font-urdu mt-0.5">
                  ونڈوز کمپیوٹر یا لیپ ٹاپ پر بغیر کسی سرور کے ایک کلک میں سافٹ ویئر چلائیں
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50 space-y-1.5">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                    1
                  </div>
                  <div className="font-bold text-slate-900">Download & Extract ZIP</div>
                  <div className="text-[11px] font-urdu text-slate-500">زپ فائل ڈاؤن لوڈ اور ان زپ کریں</div>
                  <p className="text-slate-600 text-[11px]">
                    Click the green <strong>"Download Offline Installer Package"</strong> button above and extract the files to any folder (e.g. <code>C:\MandiERP</code>).
                  </p>
                </div>

                <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50 space-y-1.5">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                    2
                  </div>
                  <div className="font-bold text-slate-900">Run "run-mandi-windows.bat"</div>
                  <div className="text-[11px] font-urdu text-slate-500">بیچ فائل پر ڈبل کلک کریں</div>
                  <p className="text-slate-600 text-[11px]">
                    Double-click the included <code>run-mandi-windows.bat</code> file. It launches a dedicated desktop application window without browser toolbars.
                  </p>
                </div>

                <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50 space-y-1.5">
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                    3
                  </div>
                  <div className="font-bold text-slate-900">Create Desktop Shortcut</div>
                  <div className="text-[11px] font-urdu text-slate-500">ڈیسک ٹاپ شارٹ کٹ بنائیں</div>
                  <p className="text-slate-600 text-[11px]">
                    Right-click <code>run-mandi-windows.bat</code> → <em>Send to → Desktop (create shortcut)</em> for instant 1-click terminal access!
                  </p>
                </div>
              </div>

              <div className="bg-slate-900 text-slate-200 rounded-xl p-3 font-mono text-[11px] flex items-center justify-between">
                <div>
                  <span className="text-emerald-400">Included in package:</span> index.html, run-mandi-windows.bat, run-mandi-mac-linux.sh, database backup
                </div>
                <button
                  onClick={handleDownloadZip}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-lg text-xs transition"
                >
                  Download .ZIP Now
                </button>
              </div>
            </div>
          )}

          {/* USB FLASH DRIVE TAB */}
          {activeTab === 'usb' && (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <h3 className="font-bold text-amber-950 text-sm flex items-center gap-2">
                  <Usb className="w-4 h-4 text-amber-700" />
                  <span>Portable USB Flash Drive Installation:</span>
                </h3>
                <p className="text-xs text-amber-800 font-urdu mt-0.5">
                  یو ایس بی پر سافٹ ویئر کاپی کر کے کسی بھی منڈی کمپیوٹر پر چلائیں
                </p>
              </div>

              <div className="space-y-2.5 text-slate-700 leading-relaxed text-xs">
                <p>
                  Because Mandi ERP requires <strong>zero installation of database servers, Python, or Node.js</strong>, you can copy the extracted offline folder directly onto a USB flash drive.
                </p>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Steps to Run from USB:</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1 text-slate-600 pl-1">
                    <li>Copy the extracted <code>Mandi-ERP</code> folder to your USB drive.</li>
                    <li>Plug the USB drive into any weighbridge computer at the grain market.</li>
                    <li>Open the USB folder and double-click <code>run-mandi-windows.bat</code>.</li>
                    <li>The system immediately starts with all your parties, rates, and vouchers!</li>
                  </ol>
                </div>
              </div>
            </div>
          )}

          {/* STANDALONE SINGLE FILE HTML TAB */}
          {activeTab === 'standalone' && (
            <div className="space-y-4">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                <h3 className="font-bold text-emerald-950 text-sm flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-emerald-700" />
                  <span>Single-File Offline Standalone App (.HTML):</span>
                </h3>
                <p className="text-xs text-emerald-800 font-urdu mt-0.5">
                  صرف ایک فائل جو بغیر انٹرنیٹ کسی بھی براؤزر میں ڈبل کلک کرنے سے کھل جاتی ہے
                </p>
              </div>

              <p className="text-slate-600 text-xs">
                This compiles your application and seed database into a single, standalone <code>.html</code> file. You can attach it to WhatsApp, email it to your business partners, or keep it on your phone. Double-clicking it opens the system instantly in Chrome, Edge, Safari, or Firefox without any internet or local server.
              </p>

              <div className="pt-2">
                <button
                  onClick={handleDownloadSingleHtml}
                  className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Standalone .HTML File (سنگل فائل ڈاؤن لوڈ کریں)</span>
                </button>
              </div>
            </div>
          )}

          {/* PWA BROWSER TAB */}
          {activeTab === 'pwa' && (
            <div className="space-y-4">
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                <h3 className="font-bold text-purple-950 text-sm flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-purple-700" />
                  <span>Browser PWA Cache & Offline Storage:</span>
                </h3>
                <p className="text-xs text-purple-800 font-urdu mt-0.5">
                  براؤزر سروس ورکر کیشے اور مکمل آف لائن محفوظ اسٹوریج
                </p>
              </div>

              <p className="text-slate-600 text-xs leading-relaxed">
                Mandi ERP registers a <strong>Workbox Service Worker</strong> in your browser. Even when you are disconnected from Wi-Fi or cellular data in the market yard, your browser serves the app from cache and writes all vouchers and weight slips to local encrypted storage.
              </p>

              {isInstallable && !isStandalone && (
                <div className="pt-2">
                  <button
                    onClick={install}
                    className="w-full py-3 bg-purple-700 hover:bg-purple-800 text-white rounded-xl font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Install PWA to Desktop / Phone Launcher</span>
                  </button>
                </div>
              )}
            </div>
          )}

        </div>

        {/* MODAL FOOTER */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3.5 flex items-center justify-between">
          <div className="text-[11px] text-slate-500 font-mono">
            {filteredVouchers.length} Vouchers · {parties.length} Parties · 100% Offline Compatible
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
