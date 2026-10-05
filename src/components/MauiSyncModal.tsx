/**
 * .NET MAUI 8 Offline-First & Auto-Sync Hub Modal
 * Showcases:
 * 1. Dual outputs from one codebase: Windows GrainMarket.exe + Android com.grainmarket.apk
 * 2. SQLite per business (e.g. AliTraders.db) with SyncQueue
 * 3. Central Sync Logic (Desktop Master ↔ Mobile Slave)
 * 4. Device Pairing QR Code (1 Desktop + 3 Mobiles max)
 * 5. Interactive Master-Slave Sync Simulator (Mandi Munshi Offline -> WiFi Connect -> Seth Desktop Approval)
 * 6. 1-Click Solution Exporter (.ZIP)
 */

import React, { useState } from 'react';
import {
  Download,
  FolderArchive,
  Monitor,
  Smartphone,
  Wifi,
  WifiOff,
  RefreshCw,
  QrCode,
  Database,
  CheckCircle2,
  Clock,
  Printer,
  X,
  Share2,
  Copy,
  Check,
  FileCode,
  ShieldCheck,
  Layers,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { useMandi } from '../context/MandiContext';
import { generateMauiDotNetSolutionZip, generateSqliteDumpSql } from '../utils/offlineInstaller';
import { generateQRCodeSVG } from '../utils/qrCode';

interface MauiSyncModalProps {
  onClose: () => void;
}

export const MauiSyncModal: React.FC<MauiSyncModalProps> = ({ onClose }) => {
  const { filteredVouchers, parties, items, appSettings, currentBusiness } = useMandi();

  const [activeTab, setActiveTab] = useState<'overview' | 'simulator' | 'pairing' | 'database' | 'printing'>('overview');
  const [downloadingZip, setDownloadingZip] = useState(false);
  const [downloadingSql, setDownloadingSql] = useState(false);
  const [copied, setCopied] = useState(false);

  // Simulator State
  const [simState, setSimState] = useState<'offline_mandi' | 'syncing' | 'synced_desktop' | 'approved_synced'>('offline_mandi');
  const [simToast, setSimToast] = useState<string>('Munshi in Mandi (No internet): Saved 20 vouchers in local SQLite 🔴');
  const [simQueueCount, setSimQueueCount] = useState<number>(20);

  const pairingPayload = JSON.stringify({
    BusinessId: currentBusiness.id || 'biz-1',
    BusinessName: currentBusiness.name || 'NAZAR SOON CORPORATION',
    SyncKey: 'MANDI-SYNC-' + (currentBusiness.id || 'biz-1').toUpperCase() + '-9988',
    MasterDeviceId: 'DESKTOP-MASTER-01',
    MaxMobiles: 3,
    Role: 'DesktopMaster',
    Timestamp: new Date().toISOString()
  }, null, 2);

  const qrSvg = generateQRCodeSVG(pairingPayload, 150);

  const handleDownloadMauiZip = async () => {
    setDownloadingZip(true);
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
      a.download = `GrainMarket-NET-MAUI-8-OfflineSync-${currentBusiness.name.replace(/\s+/g, '_')}.zip`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading MAUI zip:', err);
    } finally {
      setDownloadingZip(false);
    }
  };

  const handleDownloadSqlite = () => {
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
      a.download = `${currentBusiness.name.replace(/\s+/g, '')}_SQLite.sql`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloadingSql(false);
    }
  };

  const handleSimulateStep = (step: 'offline_mandi' | 'syncing' | 'synced_desktop' | 'approved_synced') => {
    setSimState(step);
    if (step === 'offline_mandi') {
      setSimQueueCount(20);
      setSimToast('🔴 Offline in Mandi: Munshi entered 20 purchases. Saved locally in SQLite + Added to SyncQueue.');
    } else if (step === 'syncing') {
      setSimToast('🟡 Reconnected to Shop WiFi: Auto-Sync triggered! Uploading SyncQueue to Cloud...');
      setTimeout(() => {
        setSimState('synced_desktop');
        setSimQueueCount(0);
        setSimToast('🟢 Online - Synced: 20 vouchers uploaded! Now visible on Desktop Master automatically.');
      }, 1200);
    } else if (step === 'synced_desktop') {
      setSimQueueCount(0);
      setSimToast('🟢 Online - Synced: Desktop and Mobile are in 100% sync.');
    } else if (step === 'approved_synced') {
      setSimToast('🟢 Approved by Seth on Desktop Master: Stock recalculated, approval pushed to Mobile Slave!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col max-h-[92vh]">
        
        {/* MODAL TOP HERO */}
        <div className="bg-gradient-to-r from-slate-950 via-emerald-950 to-slate-900 text-white p-5 sm:p-6 relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-600/80 border border-emerald-500 flex items-center justify-center shadow-inner shrink-0">
                <Layers className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg sm:text-xl font-bold tracking-tight">
                    .NET MAUI 8 - Offline-First + Auto-Sync
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono text-[10px] font-bold border border-emerald-500/30">
                    Dual Native Output
                  </span>
                </div>
                <p className="text-xs text-emerald-300 font-urdu mt-0.5">
                  ایک ہی کوڈ سے ونڈوز .EXE اور اینڈرائڈ .APK — 100% آف لائن اور خودکار سنکرونائزیشن
                </p>
              </div>
            </div>

            {/* LIVE SIMULATED CONNECTION INDICATOR */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-emerald-700/60 bg-emerald-900/50 text-xs">
              {simState === 'offline_mandi' ? (
                <>
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                  <span className="font-bold text-rose-300">🔴 Offline - Saved locally</span>
                </>
              ) : simState === 'syncing' ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                  <span className="font-bold text-amber-300">🟡 Online - Syncing...</span>
                </>
              ) : (
                <>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  <span className="font-bold text-emerald-300">🟢 Online - Synced</span>
                </>
              )}
            </div>
          </div>

          {/* PRIMARY DOWNLOAD BUTTONS */}
          <div className="mt-4 pt-4 border-t border-slate-800 flex flex-wrap items-center gap-2.5">
            <button
              onClick={handleDownloadMauiZip}
              disabled={downloadingZip}
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition flex items-center gap-2 active:scale-95 disabled:bg-slate-700"
            >
              <FolderArchive className="w-4 h-4" />
              <span>{downloadingZip ? 'Packaging MAUI Solution...' : 'Download .NET MAUI 8 Solution (.ZIP)'}</span>
            </button>

            <button
              onClick={handleDownloadSqlite}
              disabled={downloadingSql}
              className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs rounded-xl border border-slate-700 transition flex items-center gap-2"
            >
              <Database className="w-4 h-4 text-emerald-400" />
              <span>{downloadingSql ? 'Generating SQL...' : 'Download SQLite Seed (.SQL)'}</span>
            </button>

            <div className="text-[11px] text-slate-400 sm:ml-auto">
              Command: <code className="text-emerald-300 bg-slate-900 px-1.5 py-0.5 rounded font-mono">dotnet publish -f net8.0-windows / net8.0-android</code>
            </div>
          </div>
        </div>

        {/* TABS HEADER */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 sm:px-6 overflow-x-auto scrollbar-none text-xs shrink-0">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-3 font-semibold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition ${
              activeTab === 'overview'
                ? 'border-emerald-600 text-emerald-800 bg-white font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Monitor className="w-4 h-4 text-emerald-600" />
            <span>1. Architecture &amp; Dual Outputs</span>
          </button>

          <button
            onClick={() => setActiveTab('simulator')}
            className={`py-3 px-3 font-semibold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition ${
              activeTab === 'simulator'
                ? 'border-emerald-600 text-emerald-800 bg-white font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <RefreshCw className="w-4 h-4 text-amber-600" />
            <span>2. Auto-Sync Simulator</span>
            <span className="px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]">Live</span>
          </button>

          <button
            onClick={() => setActiveTab('pairing')}
            className={`py-3 px-3 font-semibold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition ${
              activeTab === 'pairing'
                ? 'border-emerald-600 text-emerald-800 bg-white font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <QrCode className="w-4 h-4 text-blue-600" />
            <span>3. Device Pairing (1 Master + 3 Mobiles)</span>
          </button>

          <button
            onClick={() => setActiveTab('database')}
            className={`py-3 px-3 font-semibold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition ${
              activeTab === 'database'
                ? 'border-emerald-600 text-emerald-800 bg-white font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Database className="w-4 h-4 text-indigo-600" />
            <span>4. SQLite &amp; SyncQueue Schema</span>
          </button>

          <button
            onClick={() => setActiveTab('printing')}
            className={`py-3 px-3 font-semibold border-b-2 flex items-center gap-1.5 whitespace-nowrap transition ${
              activeTab === 'printing'
                ? 'border-emerald-600 text-emerald-800 bg-white font-bold'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Printer className="w-4 h-4 text-slate-700" />
            <span>5. Direct Printing &amp; WhatsApp</span>
          </button>
        </div>

        {/* TAB BODY */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs flex-1">
          
          {/* TAB 1: OVERVIEW & TWO OUTPUTS */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* OUTPUT A: WINDOWS */}
                <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold font-mono text-[10px]">
                      TARGET: net8.0-windows10.0.19041.0
                    </span>
                    <span className="text-[10px] text-slate-500">MASTER NODE</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                      <Monitor className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-slate-900">Windows Standalone Desktop</div>
                      <code className="text-emerald-700 font-mono text-[11px] font-bold">GrainMarket.exe</code>
                    </div>
                  </div>

                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Runs offline on Windows 10/11 at the Mandi shop. Operates as the <strong>MASTER NODE</strong> with direct Windows thermal printing (winspool.drv RAW spooler), SQLite database, and approval rights.
                  </p>

                  <div className="p-2.5 bg-white rounded-xl border border-slate-200 font-mono text-[10px] text-slate-800 overflow-x-auto">
                    dotnet publish GrainMarket.csproj -f net8.0-windows10.0.19041.0 -c Release -p:WindowsPackageType=None -o ./publish/windows
                  </div>
                </div>

                {/* OUTPUT B: ANDROID */}
                <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold font-mono text-[10px]">
                      TARGET: net8.0-android
                    </span>
                    <span className="text-[10px] text-slate-500">SLAVE NODE</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                      <Smartphone className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-slate-900">Android Mobile Application</div>
                      <code className="text-emerald-700 font-mono text-[11px] font-bold">com.grainmarket.apk</code>
                    </div>
                  </div>

                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Runs offline on Munshi smartphones in the mandi yard. Records weighing tickets without internet, links to Desktop via QR scan, and automatically syncs when Wi-Fi is detected.
                  </p>

                  <div className="p-2.5 bg-white rounded-xl border border-slate-200 font-mono text-[10px] text-slate-800 overflow-x-auto">
                    dotnet publish GrainMarket.csproj -f net8.0-android -c Release -p:ApplicationId=com.grainmarket.app -o ./publish/android
                  </div>
                </div>
              </div>

              {/* WINDOWS 7 SP1 ELIGIBILITY CARD */}
              <div className="border border-emerald-300 bg-emerald-50/80 rounded-2xl p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Monitor className="w-5 h-5 text-emerald-800" />
                    <span className="font-bold text-sm text-emerald-950">Windows 7 SP1 Eligibility (32-Bit &amp; 64-Bit)</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-700 text-white font-mono text-[10px] font-bold">
                    net48 + winspool.drv
                  </span>
                </div>
                <p className="text-slate-700 text-[11px] leading-relaxed">
                  <strong>For Older Mandi PCs (غلہ منڈی کے پرانے کمپیوٹرز)</strong>: If your shop or weighbridge computer runs Windows 7 SP1 (Pentium, Core 2 Duo, Core i3), the included <code className="font-mono bg-white px-1.5 py-0.5 rounded border border-emerald-200">build-windows7-x86-x64.bat</code> script compiles a native standalone executable (<code className="font-mono text-emerald-800 font-bold">MandiERP-Win7.exe</code>) that runs directly on Windows 7 with zero runtime dependencies. It serves as the <strong>Desktop Master</strong> and automatically receives syncs from Munshi's Android phones!
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-0.5">
                  <div className="p-2 bg-white rounded-lg border border-emerald-200 font-mono text-[10px] text-slate-800 select-all overflow-x-auto">
                    dotnet publish MandiERP.csproj -f net48 -r win-x86 (Win 7 32-bit)
                  </div>
                  <div className="p-2 bg-white rounded-lg border border-emerald-200 font-mono text-[10px] text-slate-800 select-all overflow-x-auto">
                    dotnet publish MandiERP.csproj -f net48 -r win-x64 (Win 7 64-bit)
                  </div>
                </div>
              </div>

              {/* 3 CORE PILLARS */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <div className="font-bold text-emerald-950">1. Pure Offline-First</div>
                  <p className="text-emerald-800 text-[11px] mt-1">
                    Every ticket is immediately committed to local SQLite file (<code className="font-mono">{currentBusiness.name.replace(/\s+/g, '')}.db</code>). Zero network dependency at weighbridge.
                  </p>
                </div>

                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
                  <div className="font-bold text-blue-950">2. Auto-Sync Engine</div>
                  <p className="text-blue-800 text-[11px] mt-1">
                    MAUI Connectivity plugin detects network. 5-minute background timer + on-start check pushes SQLite <code className="font-mono">SyncQueue</code> to central cloud relay.
                  </p>
                </div>

                <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl">
                  <div className="font-bold text-purple-950">3. Conflict Resolution</div>
                  <p className="text-purple-800 text-[11px] mt-1">
                    Last <code className="font-mono">UpdatedAt</code> wins. In case of exact timestamp tie, Desktop Master has final authority. Stock automatically recalculated.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: INTERACTIVE SYNC SIMULATOR */}
          {activeTab === 'simulator' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-900 text-white rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 text-emerald-400" />
                    <span>Real-World Mandi Workflow Simulation</span>
                  </span>
                  <span className="text-[11px] font-mono text-emerald-300">
                    Queue Items: {simQueueCount}
                  </span>
                </div>

                {/* CURRENT LIVE SIMULATED TOAST */}
                <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold text-slate-200">Terminal Notification / Toast:</div>
                    <div className="text-emerald-300 font-mono text-[11px] mt-0.5">{simToast}</div>
                  </div>
                </div>

                {/* WORKFLOW TIMELINE BUTTONS */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2">
                  <button
                    onClick={() => handleSimulateStep('offline_mandi')}
                    className={`p-3 rounded-xl border text-left transition ${
                      simState === 'offline_mandi'
                        ? 'border-rose-500 bg-rose-950/60 text-white'
                        : 'border-slate-800 bg-slate-800/60 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs">1. Morning (Mandi)</span>
                      <span className="text-[10px] text-rose-400 font-bold">🔴 Offline</span>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-1">
                      Munshi records 20 vouchers on Mobile APK in yard with NO internet.
                    </p>
                  </button>

                  <button
                    onClick={() => handleSimulateStep('syncing')}
                    className={`p-3 rounded-xl border text-left transition ${
                      simState === 'syncing' || simState === 'synced_desktop'
                        ? 'border-amber-500 bg-amber-950/60 text-white'
                        : 'border-slate-800 bg-slate-800/60 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs">2. Afternoon (Shop)</span>
                      <span className="text-[10px] text-emerald-400 font-bold">🟢 Auto-Sync</span>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-1">
                      WiFi connects. Auto sync pushes 20 purchases to Desktop Master.
                    </p>
                  </button>

                  <button
                    onClick={() => handleSimulateStep('approved_synced')}
                    className={`p-3 rounded-xl border text-left transition ${
                      simState === 'approved_synced'
                        ? 'border-emerald-500 bg-emerald-950/60 text-white'
                        : 'border-slate-800 bg-slate-800/60 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs">3. Evening (Seth)</span>
                      <span className="text-[10px] text-blue-400 font-bold">✓ Approved</span>
                    </div>
                    <p className="text-[11px] text-slate-300 mt-1">
                      Seth approves on Desktop. Status syncs back to Munshi's mobile!
                    </p>
                  </button>
                </div>
              </div>

              {/* SIMULATOR DATA VERIFICATION TABLE */}
              <div className="border border-slate-200 rounded-xl p-3 bg-slate-50">
                <div className="font-bold text-slate-900 text-xs mb-2">Simulated Live Transaction Snapshot:</div>
                <div className="space-y-1.5 font-mono text-[11px] text-slate-700">
                  <div className="flex justify-between p-1.5 bg-white rounded border border-slate-200">
                    <span>PUR-2026-001 · Ch. Tariq Gujjar · Wheat 14,000 KG</span>
                    <span className={simState === 'approved_synced' ? 'text-emerald-700 font-bold' : 'text-amber-600'}>
                      {simState === 'approved_synced' ? '✓ Approved (Stock Committed)' : 'Pending (In Sync Queue)'}
                    </span>
                  </div>
                  <div className="flex justify-between p-1.5 bg-white rounded border border-slate-200">
                    <span>PUR-2026-002 · Mian Zahid Farooq · Rice 8,500 KG</span>
                    <span className={simState === 'approved_synced' ? 'text-emerald-700 font-bold' : 'text-amber-600'}>
                      {simState === 'approved_synced' ? '✓ Approved (Stock Committed)' : 'Pending (In Sync Queue)'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: DEVICE PAIRING */}
          {activeTab === 'pairing' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row items-center gap-5 bg-slate-50 border border-slate-200 rounded-2xl p-5">
                <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs shrink-0" dangerouslySetInnerHTML={{ __html: qrSvg }} />

                <div className="space-y-2 flex-1 text-center sm:text-left">
                  <div className="font-bold text-slate-900 text-sm flex items-center justify-center sm:justify-start gap-2">
                    <QrCode className="w-4 h-4 text-emerald-600" />
                    <span>Desktop Master Pairing QR Code</span>
                  </div>
                  <p className="text-slate-600 text-xs leading-relaxed">
                    Scan this QR code from the <strong>Grain Market Mobile APK</strong> on first install. The phone will instantly authenticate, bind to the master database, and establish local SQLite storage.
                  </p>

                  <div className="p-2.5 bg-white rounded-xl border border-slate-200 text-slate-700 font-mono text-[10px] space-y-1">
                    <div><strong>Business:</strong> {currentBusiness.name}</div>
                    <div><strong>SyncKey:</strong> MANDI-SYNC-{(currentBusiness.id || 'BIZ-1').toUpperCase()}-9988</div>
                    <div><strong>Role:</strong> DesktopMaster (1 Master + Max 3 Mobile Slaves)</div>
                  </div>

                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(pairingPayload);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Payload Copied!' : 'Copy Pairing JSON'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: DATABASE & SYNCQUEUE SCHEMA */}
          {activeTab === 'database' && (
            <div className="space-y-3">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                <div className="font-bold text-emerald-950 text-xs">Universal Sync Columns on Every Table:</div>
                <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 mt-2 font-mono text-[10px]">
                  <div className="p-1.5 bg-white rounded border border-emerald-200"><strong>Id:</strong> TEXT (GUID)</div>
                  <div className="p-1.5 bg-white rounded border border-emerald-200"><strong>CreatedAt:</strong> DATETIME</div>
                  <div className="p-1.5 bg-white rounded border border-emerald-200"><strong>UpdatedAt:</strong> DATETIME</div>
                  <div className="p-1.5 bg-white rounded border border-emerald-200"><strong>IsSynced:</strong> BOOLEAN</div>
                  <div className="p-1.5 bg-white rounded border border-emerald-200"><strong>DeviceId:</strong> TEXT</div>
                  <div className="p-1.5 bg-white rounded border border-emerald-200"><strong>IsDeleted:</strong> BOOLEAN</div>
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                <table className="w-full text-[11px] text-left">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="p-2.5">SQLite Table</th>
                      <th className="p-2.5">Sync Scope</th>
                      <th className="p-2.5">Conflict Resolution Rule</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-800">
                    <tr>
                      <td className="p-2 font-mono font-bold text-emerald-800">Purchases</td>
                      <td className="p-2">Tickets, weights, deductions, rates, status</td>
                      <td className="p-2">Last UpdatedAt wins (Desktop wins tie)</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-mono font-bold text-emerald-800">Sales</td>
                      <td className="p-2">Mill sales, outward weights, amounts</td>
                      <td className="p-2">Last UpdatedAt wins (Desktop wins tie)</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-mono font-bold text-emerald-800">Items &amp; Stock</td>
                      <td className="p-2">Commodities, rates, bag weights</td>
                      <td className="p-2">Recalculate closing stock &amp; weighted avg after sync</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-mono font-bold text-emerald-800">Parties</td>
                      <td className="p-2">Farmers, mills, phone, gate directory</td>
                      <td className="p-2">Party directory synced (no party ledgers)</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-mono font-bold text-emerald-800">SyncQueue</td>
                      <td className="p-2">Pending mutations waiting for connection</td>
                      <td className="p-2">Processed sequentially by QueueId</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: PRINTING & SHARING */}
          {activeTab === 'printing' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-2">
                  <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <Printer className="w-4 h-4 text-emerald-600" />
                    <span>Desktop: Direct WinSpool RAW Printing</span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Uses Windows native <code className="font-mono">winspool.drv</code> with <code className="font-mono">OpenPrinter</code> and <code className="font-mono">WritePrinter</code>. Sends raw ESC/POS binary byte commands directly to 80mm/58mm thermal printers.
                  </p>
                  <ul className="text-[11px] text-slate-600 list-disc list-inside space-y-1">
                    <li>Zero browser print dialog or preview</li>
                    <li>Automatic guillotine paper cut (<code className="font-mono">GS V</code>)</li>
                    <li>Buzzer / beep on ticket completion</li>
                  </ul>
                </div>

                <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-2">
                  <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-blue-600" />
                    <span>Mobile: Bluetooth &amp; WhatsApp Share</span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Munshi on Android phone can pair with any portable 3-inch Bluetooth thermal printer or dispatch instant formatted slips directly via WhatsApp.
                  </p>
                  <ul className="text-[11px] text-slate-600 list-disc list-inside space-y-1">
                    <li>Bluetooth SPP wireless printer support</li>
                    <li>1-Tap WhatsApp slip dispatch to farmer / driver</li>
                    <li>Formatted bilingual Urdu Nastaleeq details</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* MODAL FOOTER */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-3.5 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-slate-500">
            .NET MAUI 8 · Windows 10/11 x64 + Android 7.0+ · Pure Offline-First SQLite
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
