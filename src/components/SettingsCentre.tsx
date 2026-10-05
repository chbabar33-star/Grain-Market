/**
 * Mandi ERP - Complete Settings Centre & Local Google Drive Storage (غلہ منڈی ترتیبات سینٹر)
 * Deep configuration suite for:
 * 1. Google Drive & Local Storage Vault
 * 2. General & Firm Profile
 * 3. Weighbridge & First Weight Costing Rules
 * 4. Bardana & Bag Inventory Controls
 * 5. Dual P&L & Commission Settings
 * 6. Invoice & Thermal Printing Customizer
 * 7. WhatsApp & SMS Communication Templates
 * 8. Security, PINs & Session Controls
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Settings,
  HardDrive,
  Cloud,
  CloudUpload,
  CloudDownload,
  Building2,
  Scale,
  Package,
  Calculator,
  Printer,
  MessageSquare,
  Shield,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Trash2,
  Upload,
  Download,
  Key,
  RefreshCw,
  LogOut,
  Folder,
  FileText,
  Clock,
  Check,
  Smartphone,
  FolderArchive
} from 'lucide-react';
import { useMandi } from '../context/MandiContext';
import { AppSettings, LocalDriveSnapshot, GoogleDriveFileItem } from '../types';
import { getStorageUsageEstimate } from '../utils/googleDrive';
import { usePWAInstall } from '../utils/usePWAInstall';
import { InstallAppModal } from './InstallAppModal';
import { OfflineInstallerModal } from './OfflineInstallerModal';
import { generateQRCodeSVG } from '../utils/qrCode';

type SettingsTab =
  | 'storage'
  | 'pwa'
  | 'general'
  | 'weighbridge'
  | 'bardana'
  | 'accounting'
  | 'printing'
  | 'whatsapp'
  | 'security';

export const SettingsCentre: React.FC = () => {

  const {
    currentBusiness,
    businesses,
    setCurrentBusinessId,
    appSettings,
    updateAppSettings,
    currentUser,
    users,
    logout,
    resetToDefaultData,
    localSnapshots,
    createLocalSnapshot,
    deleteLocalSnapshot,
    restoreSnapshot,
    exportFullBackupFile,
    importBackupFile,
    backupToBusinessDrive,
    updateAdminCredentials,
    googleDriveUser,
    connectGoogleDrive,
    disconnectGoogleDrive,
    backupToGoogleDrive,
    restoreFromGoogleDrive,
    googleDriveFiles,
    fetchGoogleDriveFiles,
    isDriveSyncing,
    bardanaMasters
  } = useMandi();

  const [activeTab, setActiveTab] = useState<SettingsTab>('storage');
  const [formState, setFormState] = useState<AppSettings>(appSettings);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');
  const [snapshotNote, setSnapshotNote] = useState('');
  const [importStatus, setImportStatus] = useState<string>('');
  const [storageUsage, setStorageUsage] = useState(getStorageUsageEstimate());

  // Password / PIN change state
  const [newPin, setNewPin] = useState(currentUser.pin || '1234');
  const [newPassword, setNewPassword] = useState(currentUser.password || 'admin');
  const [pinChangeMsg, setPinChangeMsg] = useState('');

  // PWA install state
  const { isInstallable, isInstalled, isStandalone, isIOS, isAndroid, isDesktop, install } = usePWAInstall();
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [showOfflineInstallerModal, setShowOfflineInstallerModal] = useState(false);
  const [pwaInstalling, setPwaInstalling] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setFormState(appSettings);
    setStorageUsage(getStorageUsageEstimate());
  }, [appSettings, localSnapshots]);

  useEffect(() => {
    if (googleDriveUser) {
      fetchGoogleDriveFiles();
    }
  }, [googleDriveUser]);

  const handleSaveSettings = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    updateAppSettings(formState);
    setSaveSuccessMsg('Settings updated successfully / ترتیبات کامیابی سے محفوظ ہو گئیں۔');
    setTimeout(() => setSaveSuccessMsg(''), 4000);
  };

  const handleCreateSnapshot = () => {
    const name = snapshotNote.trim() || undefined;
    createLocalSnapshot(name, false);
    setSnapshotNote('');
    setSaveSuccessMsg('New Local Storage Snapshot created successfully!');
    setStorageUsage(getStorageUsageEstimate());
    setTimeout(() => setSaveSuccessMsg(''), 4000);
  };

  const handleRestoreLocalSnapshot = (snap: LocalDriveSnapshot) => {
    if (window.confirm(`Restore Mandi database to snapshot from "${new Date(snap.timestamp).toLocaleString()}"? Current unsaved entries will be overwritten.`)) {
      const ok = restoreSnapshot(snap.data);
      if (ok) {
        alert('Database restored successfully from local snapshot.');
      } else {
        alert('Failed to restore snapshot.');
      }
    }
  };

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportStatus('Reading and restoring backup file...');
    const res = await importBackupFile(file);
    setImportStatus(res.message);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setTimeout(() => setImportStatus(''), 5000);
  };

  const handleBackupToBusinessDriveClick = async () => {
    const res = await backupToBusinessDrive();
    if (res.success) {
      setSaveSuccessMsg(res.message);
    } else {
      alert(res.message);
    }
    setTimeout(() => setSaveSuccessMsg(''), 5000);
  };

  const handleBackupToGoogleDriveClick = async () => {
    const res = await backupToGoogleDrive();
    if (res.success) {
      setSaveSuccessMsg(res.message);
    } else {
      alert(res.message);
    }
    setTimeout(() => setSaveSuccessMsg(''), 5000);
  };

  const handleRestoreFromGoogleDriveClick = async (file: GoogleDriveFileItem) => {
    if (window.confirm(`Download and restore Google Drive backup file "${file.name}"?`)) {
      const res = await restoreFromGoogleDrive(file.id);
      if (res.success) {
        alert(res.message);
      } else {
        alert(res.message);
      }
    }
  };

  const handleUpdatePin = () => {
    if (newPin.length < 4) {
      setPinChangeMsg('PIN must be at least 4 digits.');
      return;
    }
    if (currentUser.role === 'Admin') {
      const res = updateAdminCredentials(newPassword, newPin);
      setPinChangeMsg(res.message);
    } else {
      currentUser.pin = newPin;
      currentUser.password = newPassword;
      setPinChangeMsg('Security PIN & Password updated for this user.');
    }
    setTimeout(() => setPinChangeMsg(''), 4000);
  };

  const tabs: { id: SettingsTab; labelEn: string; labelUrdu: string; icon: React.ReactNode }[] = [
    { id: 'storage', labelEn: 'Drive & Local Storage', labelUrdu: 'گوگل ڈرائیو و اسٹوریج', icon: <HardDrive className="w-4 h-4 text-emerald-600" /> },
    { id: 'pwa', labelEn: 'App Download (PWA)', labelUrdu: 'موبائل ایپ و ڈاؤن لوڈ', icon: <Smartphone className="w-4 h-4 text-teal-600" /> },
    { id: 'general', labelEn: 'Firm Profile', labelUrdu: 'ادارے کی ترتیبات', icon: <Building2 className="w-4 h-4 text-sky-600" /> },
    { id: 'weighbridge', labelEn: 'Weighbridge & Costing', labelUrdu: 'کنڈا و لاگت کے اصول', icon: <Scale className="w-4 h-4 text-amber-600" /> },
    { id: 'bardana', labelEn: 'Bardana & Bags', labelUrdu: 'باردانہ و توڑے', icon: <Package className="w-4 h-4 text-purple-600" /> },
    { id: 'accounting', labelEn: 'P&L & Accounting', labelUrdu: 'نفع نقصان و کھاتہ جات', icon: <Calculator className="w-4 h-4 text-emerald-600" /> },
    { id: 'printing', labelEn: 'Invoices & Thermal', labelUrdu: 'پرنٹنگ و بل فارمیٹ', icon: <Printer className="w-4 h-4 text-indigo-600" /> },
    { id: 'whatsapp', labelEn: 'WhatsApp Templates', labelUrdu: 'واٹس ایپ پیغامات', icon: <MessageSquare className="w-4 h-4 text-green-600" /> },
    { id: 'security', labelEn: 'Security & Access', labelUrdu: 'سیکیورٹی و سیشنز', icon: <Shield className="w-4 h-4 text-rose-600" /> }
  ];

  return (
    <div className="space-y-6">
      {/* HEADER BAR */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Settings className="w-6 h-6 text-emerald-700 animate-spin-slow" />
            <span>Mandi Settings Centre</span>
            <span className="text-slate-300 font-light">|</span>
            <span className="font-urdu text-base text-slate-700">غلہ منڈی ترتیبات و ڈرائیو کنٹرول روم</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure Google Drive backup sync, local drive snapshots, weighbridge First Weight rules, thermal printer formatting, and security controls.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {saveSuccessMsg && (
            <div className="text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5 animate-in fade-in">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{saveSuccessMsg}</span>
            </div>
          )}
          <button
            onClick={() => handleSaveSettings()}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Save All Changes (محفوظ کریں)</span>
          </button>
        </div>
      </div>

      {/* TWO COLUMN WORKSPACE: NAVIGATION TABS + CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* LEFT NAV SIDEBAR */}
        <div className="lg:col-span-1 space-y-2">
          <div className="bg-white rounded-xl border border-slate-200 p-2 shadow-2xs space-y-1">
            <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Configuration Modules
            </div>
            {tabs.map(t => {
              const isActive = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-medium transition-all flex items-center justify-between ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-xs font-semibold'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {t.icon}
                    <span>{t.labelEn}</span>
                  </div>
                  <span className={`text-[11px] font-urdu leading-none ${isActive ? 'text-emerald-300' : 'text-slate-400'}`}>
                    {t.labelUrdu}
                  </span>
                </button>
              );
            })}
          </div>

          {/* ACTIVE BUSINESS QUICK INFO CARD */}
          <div className="bg-slate-900 text-white rounded-xl p-4 shadow-sm space-y-2.5 text-xs">
            <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-bold tracking-wider">
              <span>Active Firm / آڑھت</span>
              <span className="px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 text-[10px] font-mono">
                {currentBusiness.id}
              </span>
            </div>
            <div className="font-bold text-sm text-emerald-400">{currentBusiness.name}</div>
            <div className="font-urdu text-slate-300 text-xs">{currentBusiness.nameUrdu}</div>
            <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
              <div>Proprietor: <span className="text-white">{currentBusiness.proprietor}</span></div>
              <div>Phone: <span className="text-white font-mono">{currentBusiness.phone}</span></div>
              <div>NTN: <span className="text-white font-mono">{currentBusiness.ntn}</span></div>
            </div>
          </div>
        </div>

        {/* RIGHT MAIN PANEL */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* ========================================================================= */}
          {/* TAB 1: DRIVE & LOCAL STORAGE (DEEP STORAGE CENTRE) */}
          {/* ========================================================================= */}
          {activeTab === 'storage' && (
            <div className="space-y-6">

              {/* PRIMARY: BUSINESS-PROVIDED DRIVE & ZERO CLOUD DEPENDENCY CARD */}
              <div className="bg-linear-to-r from-emerald-950 to-slate-900 text-white rounded-xl border border-emerald-600/50 shadow-md p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-800/60 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-xs">
                      <HardDrive className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-white flex items-center gap-2">
                        <span>Business-Provided Drive & Local Storage (بزنس ڈرائیو و مقامی اسٹوریج)</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                          100% Zero Google Cloud Dependency
                        </span>
                      </h2>
                      <p className="text-xs text-emerald-200/80">
                        All business records, weighbridge slips, and ledgers reside on your business device and business-provided Google Drive folder.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleBackupToBusinessDriveClick}
                      className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition"
                    >
                      <HardDrive className="w-3.5 h-3.5 text-slate-950" />
                      <span>Backup to Business Drive (ڈرائیو پر محفوظ کریں)</span>
                    </button>
                    <button
                      onClick={exportFullBackupFile}
                      className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg text-xs flex items-center gap-1.5 border border-slate-700"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Export JSON File</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-emerald-200 mb-1">
                      Business Google Drive / Local Storage Folder Path
                    </label>
                    <input
                      type="text"
                      value={formState.businessDriveFolderPath || 'C:\\Google Drive\\Mandi_Backups'}
                      onChange={e => setFormState({ ...formState, businessDriveFolderPath: e.target.value })}
                      placeholder="e.g. C:\Google Drive\Mandi_Backups or D:\Mandi_Data"
                      className="w-full text-xs bg-slate-950/80 border border-emerald-500/40 rounded-lg p-2 font-mono text-white focus:ring-2 focus:ring-emerald-400"
                    />
                    <span className="text-[11px] text-emerald-300/70">
                      Files will save directly into this business-provided folder.
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-emerald-200 mb-1">
                      Storage Provider Mode
                    </label>
                    <div className="bg-slate-950/80 border border-emerald-500/40 rounded-lg p-2 text-xs font-mono text-emerald-300 flex items-center justify-between">
                      <span>Business-Provided Drive (100% On-Premise)</span>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    </div>
                    <span className="text-[11px] text-emerald-300/70">
                      Zero third-party website cloud server dependencies.
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between text-xs bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 text-slate-300 gap-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Last Saved to Business Drive:</span>
                    <strong className="text-white font-mono">{appSettings.lastLocalBackupTime || 'Ready'}</strong>
                  </div>
                  <div className="font-urdu text-emerald-300 text-xs">
                    بغیر کسی گوگل سرور کے تمام کھاتہ جات محفوظ
                  </div>
                </div>
              </div>
              
              {/* OPTIONAL GOOGLE DRIVE CLOUD SYNC CARD */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                      <Cloud className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <span>Google Drive Cloud Storage (گوگل ڈرائیو بیک اپ)</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-semibold">
                          Google Drive v3 API
                        </span>
                      </h2>
                      <p className="text-xs text-slate-500">
                        Automatic cloud backup repository stored securely in your private Google Drive account.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {googleDriveUser ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Connected: {googleDriveUser.email || appSettings.googleDriveConnectedEmail}</span>
                        </span>
                        <button
                          onClick={disconnectGoogleDrive}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
                        >
                          Disconnect
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={connectGoogleDrive}
                        className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs"
                      >
                        <CloudUpload className="w-4 h-4" />
                        <span>Connect Google Drive (گوگل ڈرائیو جوڑیں)</span>
                      </button>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Google Drive Folder Name
                    </label>
                    <input
                      type="text"
                      value={formState.googleDriveFolder}
                      onChange={e => setFormState({ ...formState, googleDriveFolder: e.target.value })}
                      placeholder="e.g. Mandi_ERP_Backups"
                      className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono"
                    />
                    <span className="text-[11px] text-slate-400">Created automatically in root Drive</span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Auto-Cloud Backup Trigger
                    </label>
                    <select
                      value={formState.autoCloudBackup}
                      onChange={e => setFormState({ ...formState, autoCloudBackup: e.target.value as any })}
                      className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2"
                    >
                      <option value="on_voucher">On Voucher Approval (فوری واؤچر منظوری پر)</option>
                      <option value="hourly">Hourly Auto Sync (ہر گھنٹے بعد)</option>
                      <option value="daily">Daily Midnight Sync (روزانہ رات ۱۲ بجے)</option>
                      <option value="manual">Manual Only (صرف دستی کلک پر)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Backup File Format
                    </label>
                    <select
                      value={formState.cloudBackupFormat}
                      onChange={e => setFormState({ ...formState, cloudBackupFormat: e.target.value as any })}
                      className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2"
                    >
                      <option value="json">Full JSON Database Archive (.json)</option>
                      <option value="excel">Excel Workbooks (.xlsx)</option>
                      <option value="both">Both JSON & Excel Workbooks</option>
                    </select>
                  </div>
                </div>

                {/* ACTION BAR: BACKUP NOW TO GOOGLE DRIVE */}
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-slate-700">Last Google Drive Sync:</span>
                    <span className="font-mono text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                      {appSettings.lastCloudBackupTime || 'Not synced yet'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleBackupToGoogleDriveClick}
                      disabled={isDriveSyncing || !googleDriveUser}
                      className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-xs"
                    >
                      {isDriveSyncing ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Uploading to Google Drive...</span>
                        </>
                      ) : (
                        <>
                          <CloudUpload className="w-3.5 h-3.5" />
                          <span>Backup Now to Google Drive (ابھی بیک اپ کریں)</span>
                        </>
                      )}
                    </button>
                    {googleDriveUser && (
                      <button
                        onClick={fetchGoogleDriveFiles}
                        className="p-1.5 text-slate-600 hover:text-slate-900 border border-slate-300 rounded-lg bg-white"
                        title="Refresh Drive Files list"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* LIST OF GOOGLE DRIVE BACKUPS */}
                <div className="space-y-2 pt-2">
                  <div className="text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span>Backups Stored in Google Drive ({googleDriveFiles.length})</span>
                    <span className="text-[11px] text-slate-500">Folder: /{formState.googleDriveFolder || 'Mandi_ERP_Backups'}</span>
                  </div>

                  {googleDriveFiles.length === 0 ? (
                    <div className="bg-slate-50 rounded-lg p-6 text-center text-xs text-slate-500 border border-dashed border-slate-200">
                      {googleDriveUser
                        ? 'No backups found in your Google Drive folder yet. Click "Backup Now to Google Drive" to create your first cloud archive.'
                        : 'Connect your Google Drive account above to view and synchronize cloud backup archives.'}
                    </div>
                  ) : (
                    <div className="border border-slate-200 rounded-lg overflow-hidden divide-y divide-slate-100 text-xs">
                      {googleDriveFiles.map(file => (
                        <div key={file.id} className="p-3 flex items-center justify-between hover:bg-slate-50 transition-colors">
                          <div className="flex items-center gap-2.5">
                            <Folder className="w-4 h-4 text-amber-500 shrink-0" />
                            <div>
                              <div className="font-semibold text-slate-900">{file.name}</div>
                              <div className="text-[11px] text-slate-500">
                                Size: {file.size} · Uploaded: {new Date(file.createdTime).toLocaleString()}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {file.webViewLink && (
                              <a
                                href={file.webViewLink}
                                target="_blank"
                                rel="noreferrer"
                                className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[11px] flex items-center gap-1 font-medium"
                              >
                                <ExternalLink className="w-3 h-3" />
                                <span>Open in Drive</span>
                              </a>
                            )}
                            <button
                              onClick={() => handleRestoreFromGoogleDriveClick(file)}
                              className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded text-[11px] font-bold flex items-center gap-1"
                            >
                              <CloudDownload className="w-3 h-3 text-emerald-700" />
                              <span>Restore (بحال کریں)</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* LOCAL STORAGE VAULT (BROWSER LOCAL DRIVE) */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                      <HardDrive className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        <span>Local Drive Storage Vault (لوکل ڈرائیو اسٹوریج)</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold">
                          Encrypted Offline Vault
                        </span>
                      </h2>
                      <p className="text-xs text-slate-500">
                        Local computer storage with instant snapshots, manual file exports (.json), and point-in-time recovery.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={exportFullBackupFile}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download .JSON File (فائل ڈاؤن لوڈ)</span>
                    </button>

                    <label className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-2xs">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Import .JSON File (فائل بحال)</span>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".json"
                        onChange={handleFileImport}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* STORAGE USAGE ESTIMATE BAR */}
                <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-700 font-semibold">
                    <span className="flex items-center gap-1.5">
                      <HardDrive className="w-3.5 h-3.5 text-emerald-600" />
                      Local Storage Consumption: {storageUsage.usedKb} KB / {storageUsage.totalKb} KB ({storageUsage.percentage}%)
                    </span>
                    <span className="text-slate-500 font-mono">{localSnapshots.length} Snapshots Saved</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        storageUsage.percentage > 80 ? 'bg-rose-500' : storageUsage.percentage > 50 ? 'bg-amber-500' : 'bg-emerald-600'
                      }`}
                      style={{ width: `${Math.max(5, storageUsage.percentage)}%` }}
                    ></div>
                  </div>
                </div>

                {importStatus && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800 font-medium">
                    {importStatus}
                  </div>
                )}

                {/* CREATE SNAPSHOT BAR */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <input
                    type="text"
                    value={snapshotNote}
                    onChange={e => setSnapshotNote(e.target.value)}
                    placeholder="Enter snapshot description / note (e.g. Before month-end closing)"
                    className="flex-1 text-xs bg-slate-50 border border-slate-300 rounded-lg p-2"
                  />
                  <button
                    onClick={handleCreateSnapshot}
                    className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Create Local Snapshot (نیا اسنیپ شاٹ بنائیں)</span>
                  </button>
                </div>

                {/* LIST OF LOCAL SNAPSHOTS */}
                <div className="space-y-2 pt-2">
                  <div className="text-xs font-bold text-slate-700 flex items-center justify-between">
                    <span>Local Recovery Snapshots History</span>
                    <span className="text-[11px] text-slate-500">Max limit: {formState.localMaxSnapshots || 10} snapshots</span>
                  </div>

                  {localSnapshots.length === 0 ? (
                    <div className="bg-slate-50 rounded-lg p-6 text-center text-xs text-slate-500 border border-dashed border-slate-200">
                      No local snapshots stored yet. Click "Create Local Snapshot" above to preserve a restore point.
                    </div>
                  ) : (
                    <div className="border border-slate-200 rounded-lg overflow-hidden divide-y divide-slate-100 text-xs">
                      {localSnapshots.map(snap => (
                        <div key={snap.id} className="p-3 flex items-center justify-between hover:bg-slate-50 transition-colors">
                          <div className="flex items-center gap-2.5">
                            <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                            <div>
                              <div className="font-semibold text-slate-900 flex items-center gap-2">
                                <span>{snap.name}</span>
                                {snap.isAutoSnapshot && (
                                  <span className="px-1.5 py-0.2 rounded bg-slate-200 text-slate-700 text-[10px]">
                                    Auto
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-500">
                                {new Date(snap.timestamp).toLocaleString()} · {snap.totalVouchers} Vouchers · {(snap.sizeBytes / 1024).toFixed(1)} KB · By {snap.createdByName}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleRestoreLocalSnapshot(snap)}
                              className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded text-[11px] font-bold"
                            >
                              Restore
                            </button>
                            <button
                              onClick={() => deleteLocalSnapshot(snap.id)}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded"
                              title="Delete snapshot"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* DANGER ZONE: FACTORY RESET */}
                <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-bold text-rose-700">Factory Reset Demo Records</div>
                    <div className="text-[11px] text-slate-500">
                      Wipes all custom changes and returns the system to clean demo seed data.
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (window.confirm('WARNING: Are you sure you want to reset all data to clean default demo records? All your custom vouchers and parties will be erased.')) {
                        resetToDefaultData();
                        alert('System reset to default demo records.');
                      }
                    }}
                    className="px-3 py-1.5 bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 rounded-lg text-xs font-bold flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset to Defaults (فیکٹری ری سیٹ)</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB: APP DOWNLOAD & MOBILE PWA (HOW IT WILL DOWNLOAD) */}
          {/* ========================================================================= */}
          {activeTab === 'pwa' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 sm:p-6 space-y-6">
              
              {/* TOP HERO BANNER */}
              <div className="bg-linear-to-r from-emerald-900 to-teal-900 text-white rounded-xl p-5 sm:p-6 shadow-md relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="space-y-1 max-w-xl">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-700/80 text-emerald-200 text-xs font-bold border border-emerald-500/30">
                        Progressive Web App (PWA)
                      </span>
                      {isStandalone ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-xs font-bold flex items-center gap-1">
                          <Check className="w-3 h-3" />
                          Running Native App
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-xs font-bold">
                          Ready to Install
                        </span>
                      )}
                    </div>
                    <h2 className="text-xl font-bold tracking-tight">
                      How Mandi ERP Downloads & Runs on Phone & PC
                    </h2>
                    <p className="text-xs text-emerald-200 font-urdu">
                      موبائل اور کمپیوٹر پر بغیر پلے اسٹور کے فوری ڈاؤن لوڈ اور مکمل آف لائن استعمال کا نظام
                    </p>
                    <p className="text-xs text-emerald-100 leading-relaxed pt-1">
                      Mandi ERP uses modern <strong>PWA technology</strong>. It installs directly from your browser to your phone's home screen or PC desktop in seconds. It requires no bulky app store downloads, takes 0MB phone storage, works 100% offline in grain market yards, and syncs automatically with Google Drive.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto shrink-0">
                    {isInstallable && !isStandalone && (
                      <button
                        onClick={async () => {
                          setPwaInstalling(true);
                          await install();
                          setPwaInstalling(false);
                        }}
                        disabled={pwaInstalling}
                        className="px-4 py-2.5 bg-emerald-400 hover:bg-emerald-300 text-slate-950 rounded-xl text-xs font-bold shadow-lg transition flex items-center justify-center gap-2 active:scale-95"
                      >
                        <Download className="w-4 h-4" />
                        <span>{pwaInstalling ? 'Installing...' : '1-Click Install Now (ابھی انسٹال کریں)'}</span>
                      </button>
                    )}
                    <button
                      onClick={() => setShowInstallModal(true)}
                      className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2"
                    >
                      <Smartphone className="w-4 h-4" />
                      <span>Full Install Guide (مکمل رہنمائی)</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* STATUS TILES */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70">
                  <div className="text-[11px] font-bold text-slate-500 uppercase">Installation Mode</div>
                  <div className="text-sm font-bold text-slate-900 mt-0.5 flex items-center gap-1.5">
                    {isStandalone ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Standalone Window</span>
                      </>
                    ) : (
                      <>
                        <Smartphone className="w-4 h-4 text-slate-500" />
                        <span>Browser Tab Mode</span>
                      </>
                    )}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1 font-urdu">
                    {isStandalone ? 'ایپ مکمل طور پر انسٹال ہے' : 'ہوم اسکرین پر انسٹال کرنے کے لیے تیار'}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70">
                  <div className="text-[11px] font-bold text-slate-500 uppercase">Offline Engine</div>
                  <div className="text-sm font-bold text-emerald-700 mt-0.5 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Workbox Service Worker</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1 font-urdu">
                    انٹرنیٹ کے بغیر آف لائن کام کرے گا
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70">
                  <div className="text-[11px] font-bold text-slate-500 uppercase">Local Storage Vault</div>
                  <div className="text-sm font-bold text-slate-900 mt-0.5 flex items-center gap-1.5">
                    <HardDrive className="w-4 h-4 text-emerald-600" />
                    <span>{storageUsage.usedKb} KB Used</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1 font-urdu">
                    مقامی محفوظ اسٹوریج
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70">
                  <div className="text-[11px] font-bold text-slate-500 uppercase">Detected Platform</div>
                  <div className="text-sm font-bold text-slate-900 mt-0.5 flex items-center gap-1.5">
                    <span className="capitalize">{isIOS ? 'Apple iOS' : isAndroid ? 'Android Phone' : isDesktop ? 'Desktop PC' : 'Mobile Web'}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1 font-urdu">
                    آپ کا موجودہ سسٹم
                  </div>
                </div>
              </div>

              {/* 3-COLUMN DOWNLOAD & INSTALLATION GUIDE */}
              <div>
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                  Step-by-Step Download & Setup Instructions (طریقہ کار)
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  {/* ANDROID */}
                  <div className="border border-slate-200 rounded-xl p-4 bg-emerald-50/30 space-y-2.5">
                    <div className="flex items-center gap-2 text-emerald-950 font-bold">
                      <Smartphone className="w-4 h-4 text-emerald-600" />
                      <span>Android Mobile Phone</span>
                    </div>
                    <div className="text-[11px] font-urdu text-emerald-800">
                      سام سنگ، شیاؤمی، ویوو، انفینکس پر انسٹالیشن
                    </div>
                    <ol className="list-decimal list-inside space-y-1.5 text-slate-600 text-[11px]">
                      <li>Open this URL in <strong>Google Chrome</strong> or Samsung Internet.</li>
                      <li>Tap the <strong>3 dots (⋮)</strong> menu in the top right.</li>
                      <li>Select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</li>
                      <li>Tap "Install" to place the Mandi ERP icon on your mobile phone screen.</li>
                    </ol>
                  </div>

                  {/* IPHONE */}
                  <div className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-2.5">
                    <div className="flex items-center gap-2 text-slate-950 font-bold">
                      <Smartphone className="w-4 h-4 text-slate-800" />
                      <span>Apple iPhone / iPad (iOS)</span>
                    </div>
                    <div className="text-[11px] font-urdu text-slate-700">
                      ایپل آئی فون پر بغیر ایپ اسٹور کے انسٹال کریں
                    </div>
                    <ol className="list-decimal list-inside space-y-1.5 text-slate-600 text-[11px]">
                      <li>Open this web address inside Apple <strong>Safari</strong>.</li>
                      <li>Tap the <strong>Share button (⎋)</strong> in Safari’s bottom toolbar.</li>
                      <li>Scroll down and tap <strong>"Add to Home Screen"</strong>.</li>
                      <li>Tap "Add" at the top right. It runs full screen like a native iOS app!</li>
                    </ol>
                  </div>

                  {/* DESKTOP */}
                  <div className="border border-slate-200 rounded-xl p-4 bg-blue-50/40 space-y-2.5">
                    <div className="flex items-center gap-2 text-blue-950 font-bold">
                      <HardDrive className="w-4 h-4 text-blue-600" />
                      <span>Windows PC & Mac Laptop</span>
                    </div>
                    <div className="text-[11px] font-urdu text-blue-800">
                      کمپیوٹر پر ڈیسک ٹاپ سافٹ ویئر کے طور پر چلائیں
                    </div>
                    <ol className="list-decimal list-inside space-y-1.5 text-slate-600 text-[11px]">
                      <li>Open in <strong>Google Chrome</strong> or <strong>Microsoft Edge</strong>.</li>
                      <li>Click the <strong>Install icon (⨁)</strong> on the right side of the address bar.</li>
                      <li>Confirm "Install". A dedicated desktop window opens immediately.</li>
                      <li>Pins to your Windows Taskbar or Mac Dock with keyboard shortcuts!</li>
                    </ol>
                  </div>
                </div>
              </div>

              {/* OFFLINE INSTALLER PACKAGE CARD */}
              <div className="bg-slate-900 text-white rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shrink-0">
                    <FolderArchive className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-2">
                      <span>Offline Installer & Standalone Bundle (.ZIP & .HTML)</span>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono font-bold">
                        Zero Internet
                      </span>
                    </div>
                    <div className="text-[11px] text-emerald-300 font-urdu mt-0.5">
                      ونڈوز 1-کلک رنر (run-mandi-windows.bat) اور یو ایس بی فلیش ڈرائیو سیٹ اپ
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setShowOfflineInstallerModal(true)}
                  className="w-full sm:w-auto px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs shrink-0"
                >
                  <FolderArchive className="w-4 h-4" />
                  <span>Open Offline Installer Tools</span>
                </button>
              </div>

              {/* OFFLINE DATA DOWNLOAD & QR SECTION */}
              <div className="border-t border-slate-200 pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-bold text-slate-900">Export Offline Mandi Database Backup</div>
                  <div className="text-[11px] text-slate-500 font-urdu">
                    اپنے تمام واؤچرز، کھاتہ جات اور سیٹنگز کی مکمل بیک اپ فائل (.json) ڈاؤن لوڈ کریں
                  </div>
                </div>
                <button
                  onClick={exportFullBackupFile}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow-xs shrink-0"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Standalone JSON Data</span>
                </button>
              </div>

            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: GENERAL & FIRM PROFILE */}
          {/* ========================================================================= */}
          {activeTab === 'general' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-sm font-bold text-slate-900">

                  Firm & Business Profile (ادارے کا پروفائل و قانونی معلومات)
                </h2>
                <p className="text-xs text-slate-500">
                  Business name, proprietor credentials, NTN, and Market Committee yard license numbers.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Firm Name (English)
                  </label>
                  <input
                    type="text"
                    value={currentBusiness.name}
                    onChange={e => {
                      currentBusiness.name = e.target.value;
                      handleSaveSettings();
                    }}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    فرم کا نام (اردو نستعلیق)
                  </label>
                  <input
                    type="text"
                    dir="rtl"
                    value={currentBusiness.nameUrdu}
                    onChange={e => {
                      currentBusiness.nameUrdu = e.target.value;
                      handleSaveSettings();
                    }}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 font-urdu text-right text-base text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Proprietor Name (English)
                  </label>
                  <input
                    type="text"
                    value={currentBusiness.proprietor}
                    onChange={e => {
                      currentBusiness.proprietor = e.target.value;
                      handleSaveSettings();
                    }}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    پروپرائیٹر / مالک کا نام (اردو)
                  </label>
                  <input
                    type="text"
                    dir="rtl"
                    value={currentBusiness.proprietorUrdu}
                    onChange={e => {
                      currentBusiness.proprietorUrdu = e.target.value;
                      handleSaveSettings();
                    }}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 font-urdu text-right text-base"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phone / Mobile (فون نمبر)
                  </label>
                  <input
                    type="text"
                    value={currentBusiness.phone}
                    onChange={e => {
                      currentBusiness.phone = e.target.value;
                      handleSaveSettings();
                    }}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    NTN / STRN (قومی ٹیکس نمبر)
                  </label>
                  <input
                    type="text"
                    value={currentBusiness.ntn}
                    onChange={e => {
                      currentBusiness.ntn = e.target.value;
                      handleSaveSettings();
                    }}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Market Yard License # (مارکیٹ کمیٹی لائسنس)
                  </label>
                  <input
                    type="text"
                    value={formState.marketYardLicenseNo}
                    onChange={e => setFormState({ ...formState, marketYardLicenseNo: e.target.value })}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Logo Initials / Monogram
                  </label>
                  <input
                    type="text"
                    maxLength={4}
                    value={currentBusiness.logoText || ''}
                    onChange={e => {
                      currentBusiness.logoText = e.target.value;
                      handleSaveSettings();
                    }}
                    placeholder="e.g. NSC"
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono uppercase"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Physical Mandi Address (غلہ منڈی کا پتہ)
                  </label>
                  <input
                    type="text"
                    value={currentBusiness.address}
                    onChange={e => {
                      currentBusiness.address = e.target.value;
                      handleSaveSettings();
                    }}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2"
                  />
                </div>
              </div>

              {/* REGIONAL & FISCAL SETTINGS */}
              <div className="border-t border-slate-100 pt-4 space-y-3">
                <h3 className="text-xs font-bold text-slate-800">
                  Regional & Fiscal Year Controls (علاقائی و مالیاتی سال)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Default Currency
                    </label>
                    <input
                      type="text"
                      disabled
                      value="PKR (Pakistani Rupee - Rs.)"
                      className="w-full text-xs bg-slate-100 border border-slate-200 rounded-lg p-2 text-slate-600 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Timezone
                    </label>
                    <input
                      type="text"
                      disabled
                      value="Asia/Karachi (PKT +05:00)"
                      className="w-full text-xs bg-slate-100 border border-slate-200 rounded-lg p-2 text-slate-600 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Fiscal Year Cycle
                    </label>
                    <select
                      value={formState.fiscalYearStart}
                      onChange={e => setFormState({ ...formState, fiscalYearStart: e.target.value })}
                      className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2"
                    >
                      <option value="07-01">July 1st to June 30th (Pakistan Standard)</option>
                      <option value="01-01">January 1st to December 31st (Calendar Year)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: WEIGHBRIDGE & FIRST WEIGHT COSTING */}
          {/* ========================================================================= */}
          {activeTab === 'weighbridge' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-sm font-bold text-slate-900">
                  Weighbridge & First Weight Costing Rules (کنڈا اول وزن اور لاگت کے اصول)
                </h2>
                <p className="text-xs text-slate-500">
                  Mandatory costing formula enforcement according to locked grain market accounting points.
                </p>
              </div>

              {/* FORMULA CALLOUT BANNER */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2 text-xs text-amber-900">
                <div className="font-bold flex items-center gap-1.5 text-amber-950">
                  <Scale className="w-4 h-4 text-amber-700" />
                  <span>Strict First-Weight Basis Formula (LOCKED IN SYSTEM):</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] font-mono bg-white/70 p-3 rounded-lg border border-amber-200">
                  <div>
                    <div className="font-bold text-slate-800">1. Net Weight:</div>
                    <code>Net Weight = First Weight - (BardanaKg + MoistureKg + OtherDeductionsKg)</code>
                  </div>
                  <div>
                    <div className="font-bold text-slate-800">2. Average Purchase Cost per 40-KG:</div>
                    <code>Average Cost = (Purchase Value / First Weight) * 40</code>
                  </div>
                </div>
                <div className="text-[11px] text-amber-800 font-urdu leading-relaxed">
                  اول وزن (First Weight) گروس وزن میں سے خالی گاڑی کا وزن منفی کرنے سے حاصل ہوتا ہے۔ باردانہ، نمی اور کٹوتیوں کے کلوگرام صرف نیٹ وزن پر اثر انداز ہوتے ہیں، اور اصل لاگت اول وزن پر ہی شمار کی جاتی ہے۔
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Standard Tare Allowance (KG)
                  </label>
                  <input
                    type="number"
                    value={formState.defaultTareAllowanceKg}
                    onChange={e => setFormState({ ...formState, defaultTareAllowanceKg: parseFloat(e.target.value) || 0 })}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono"
                  />
                  <span className="text-[11px] text-slate-400">Default tare tolerance for weighbridge calibration</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Default Moisture Deduction (KG per bag)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formState.moistureStandardDeductionKg}
                    onChange={e => setFormState({ ...formState, moistureStandardDeductionKg: parseFloat(e.target.value) || 0 })}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono"
                  />
                  <span className="text-[11px] text-slate-400">Standard moisture deduction on paddy/wheat when applicable</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Purchase Voucher Prefix
                  </label>
                  <input
                    type="text"
                    value={formState.purchaseVoucherPrefix}
                    onChange={e => setFormState({ ...formState, purchaseVoucherPrefix: e.target.value })}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Sales Voucher Prefix
                  </label>
                  <input
                    type="text"
                    value={formState.salesVoucherPrefix}
                    onChange={e => setFormState({ ...formState, salesVoucherPrefix: e.target.value })}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-2">
                <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formState.enforceFirstWeightRule}
                    onChange={e => setFormState({ ...formState, enforceFirstWeightRule: e.target.checked })}
                    className="rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                  />
                  <span className="font-semibold">Lock Costing strictly to First Weight (اول وزن لاگت کو سختی سے نافذ رکھیں)</span>
                </label>
                <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formState.autoRoundNetWeight}
                    onChange={e => setFormState({ ...formState, autoRoundNetWeight: e.target.checked })}
                    className="rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                  />
                  <span>Auto-round Net Weight calculations to whole kilograms (کلوگرام میں راؤنڈ آف)</span>
                </label>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: BARDANA & BAG INVENTORY */}
          {/* ========================================================================= */}
          {activeTab === 'bardana' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-sm font-bold text-slate-900">
                  Bardana & Bag Inventory Controls (باردانہ و توڑے ترتیبات)
                </h2>
                <p className="text-xs text-slate-500">
                  Settings for Jute & PP bags tracking, weight deductions, and physical movement registers.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Default Bardana Master Type
                  </label>
                  <select
                    value={formState.defaultBardanaId}
                    onChange={e => setFormState({ ...formState, defaultBardanaId: e.target.value })}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2"
                  >
                    {bardanaMasters.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.nameUrdu})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Standard Jute Bag Tare Weight (KG)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formState.standardJuteWeightKg}
                    onChange={e => setFormState({ ...formState, standardJuteWeightKg: parseFloat(e.target.value) || 1 })}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono"
                  />
                  <span className="text-[11px] text-slate-400">Usually 1.0 KG per jute bori</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Standard PP Plastic Woven Bag Weight (KG)
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    value={formState.standardPPWeightKg}
                    onChange={e => setFormState({ ...formState, standardPPWeightKg: parseFloat(e.target.value) || 0.5 })}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono"
                  />
                  <span className="text-[11px] text-slate-400">Usually 0.5 KG (500 grams) per plastic bag</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-2">
                <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formState.disallowNegativeBardanaStock}
                    onChange={e => setFormState({ ...formState, disallowNegativeBardanaStock: e.target.checked })}
                    className="rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                  />
                  <span>Disallow Negative Bardana Bag Stock on Outward Dispatches (منفی باردانہ اسٹاک پر پابندی)</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formState.warnOnBagDiscrepancy}
                    onChange={e => setFormState({ ...formState, warnOnBagDiscrepancy: e.target.checked })}
                    className="rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                  />
                  <span>Warn when bag count differs substantially from calculated weight (تعداد و وزن کے فرق پر الرٹ)</span>
                </label>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 5: P&L & ACCOUNTING */}
          {/* ========================================================================= */}
          {activeTab === 'accounting' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-sm font-bold text-slate-900">
                  Financial Accounting & Dual P&L Preferences (نفع نقصان و کھاتہ جات ترتیبات)
                </h2>
                <p className="text-xs text-slate-500">
                  Settings for QuickBooks vs. BUSY Mandi style dual reporting, commission percentages, and expense allocation.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Profit & Loss Display Format
                  </label>
                  <select
                    value={formState.dualPnlFormat}
                    onChange={e => setFormState({ ...formState, dualPnlFormat: e.target.value as any })}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2"
                  >
                    <option value="dual">Dual Side-by-Side (QuickBooks + BUSY Mandi Style)</option>
                    <option value="busy">BUSY Mandi Grain Trading Style Only</option>
                    <option value="quickbooks">Standard QuickBooks Corporate Format Only</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Default Commission / Arhat Rate (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formState.defaultCommissionRate}
                    onChange={e => setFormState({ ...formState, defaultCommissionRate: parseFloat(e.target.value) || 0 })}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono"
                  />
                  <span className="text-[11px] text-slate-400">Default Mandi commission (normally 2%)</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Market Committee Fee Rate (%)
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    value={formState.defaultMarketFeeRate}
                    onChange={e => setFormState({ ...formState, defaultMarketFeeRate: parseFloat(e.target.value) || 0 })}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 font-mono"
                  />
                  <span className="text-[11px] text-slate-400">Market Committee Cess (normally 0.5%)</span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Expense Allocation Method
                  </label>
                  <select
                    value={formState.defaultExpenseAllocation}
                    onChange={e => setFormState({ ...formState, defaultExpenseAllocation: e.target.value as any })}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2"
                  >
                    <option value="weight_ratio">By First-Weight Ratio (اول وزن کے تناسب سے)</option>
                    <option value="amount_ratio">By Total Amount Ratio (مالیت کے تناسب سے)</option>
                    <option value="manual">Manual Allocation (دستی تعین)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 6: PRINTING & THERMAL SLIPS */}
          {/* ========================================================================= */}
          {activeTab === 'printing' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-sm font-bold text-slate-900">
                  Invoice & Thermal Slip Customization (پرنٹنگ و بل ڈیزائن)
                </h2>
                <p className="text-xs text-slate-500">
                  Configure default print design templates, religious calligraphy headers, NTN inclusion, and signature blocks.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Default Voucher Print Design
                  </label>
                  <select
                    value={formState.defaultPrintDesign}
                    onChange={e => setFormState({ ...formState, defaultPrintDesign: e.target.value as any })}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2"
                  >
                    <option value="a4-standard">A4 Standard Classical Mandi Invoice</option>
                    <option value="a4-modern">A4 Modern Compact Dual Column</option>
                    <option value="thermal-80mm">Thermal 80mm POS Roll (تھرمل پرنٹر)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Custom Footer Print Note (English)
                  </label>
                  <input
                    type="text"
                    value={formState.customPrintNote}
                    onChange={e => setFormState({ ...formState, customPrintNote: e.target.value })}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    پرنٹ بل کے نیچے نوٹ (اردو نستعلیق)
                  </label>
                  <input
                    type="text"
                    dir="rtl"
                    value={formState.customPrintNoteUrdu}
                    onChange={e => setFormState({ ...formState, customPrintNoteUrdu: e.target.value })}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2 font-urdu text-right text-base"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formState.bismillahHeader}
                    onChange={e => setFormState({ ...formState, bismillahHeader: e.target.checked })}
                    className="rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                  />
                  <span>Include Bismillah Header (بِسْمِ اللَّهِ الرَّحْمٰنِ الرَّحِيمِ)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formState.jazaakAllahFooter}
                    onChange={e => setFormState({ ...formState, jazaakAllahFooter: e.target.checked })}
                    className="rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                  />
                  <span>Include Jazaak Allah Footer (جَزَاكُمُ اللَّهُ خَيْرًا)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formState.showNtnOnPrint}
                    onChange={e => setFormState({ ...formState, showNtnOnPrint: e.target.checked })}
                    className="rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                  />
                  <span>Display NTN & Tax Registration # on Invoices</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formState.showVehicleOnPrint}
                    onChange={e => setFormState({ ...formState, showVehicleOnPrint: e.target.checked })}
                    className="rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                  />
                  <span>Display Truck / Vehicle Number on Slips</span>
                </label>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 7: WHATSAPP TEMPLATES */}
          {/* ========================================================================= */}
          {activeTab === 'whatsapp' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-sm font-bold text-slate-900">
                  WhatsApp & SMS Communication Templates (واٹس ایپ پیغامات کے سانچے)
                </h2>
                <p className="text-xs text-slate-500">
                  Customize the automated WhatsApp messages sent directly to farmers, flour mills, and vehicle drivers.
                </p>
              </div>

              <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200 text-xs text-emerald-900 space-y-1">
                <span className="font-bold">Available Dynamic Placeholders:</span>
                <div className="flex flex-wrap gap-1.5 font-mono text-[10px] pt-1">
                  <span className="bg-white px-2 py-0.5 rounded border border-emerald-300">`{'{party_name}'}`</span>
                  <span className="bg-white px-2 py-0.5 rounded border border-emerald-300">`{'{item_name}'}`</span>
                  <span className="bg-white px-2 py-0.5 rounded border border-emerald-300">`{'{first_weight}'}`</span>
                  <span className="bg-white px-2 py-0.5 rounded border border-emerald-300">`{'{net_weight}'}`</span>
                  <span className="bg-white px-2 py-0.5 rounded border border-emerald-300">`{'{bags}'}`</span>
                  <span className="bg-white px-2 py-0.5 rounded border border-emerald-300">`{'{rate}'}`</span>
                  <span className="bg-white px-2 py-0.5 rounded border border-emerald-300">`{'{total_amount}'}`</span>
                  <span className="bg-white px-2 py-0.5 rounded border border-emerald-300">`{'{voucher_no}'}`</span>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Farmer Purchase Slip WhatsApp Message (خریداری پر زمیندار کو پیغام)
                  </label>
                  <textarea
                    rows={3}
                    dir="rtl"
                    value={formState.whatsappPurchaseTemplate}
                    onChange={e => setFormState({ ...formState, whatsappPurchaseTemplate: e.target.value })}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-urdu text-right text-sm leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Customer Sales Invoice WhatsApp Message (کسٹمر یا مل کو پیغام)
                  </label>
                  <textarea
                    rows={3}
                    dir="rtl"
                    value={formState.whatsappSalesTemplate}
                    onChange={e => setFormState({ ...formState, whatsappSalesTemplate: e.target.value })}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-urdu text-right text-sm leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Weighbridge Gate Pass Message (گیٹ پاس گاڑی ڈرائیور کے لیے)
                  </label>
                  <textarea
                    rows={2}
                    dir="rtl"
                    value={formState.whatsappGatePassTemplate}
                    onChange={e => setFormState({ ...formState, whatsappGatePassTemplate: e.target.value })}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-urdu text-right text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 8: SECURITY & ACCESS */}
          {/* ========================================================================= */}
          {activeTab === 'security' && (
            <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 space-y-4">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-sm font-bold text-slate-900">
                  Security, Sessions & Terminal Access (سیکیورٹی، پن کوڈ و سیشنز)
                </h2>
                <p className="text-xs text-slate-500">
                  Configure weighbridge terminal quick PINs, session durations, and force logout controls.
                </p>
              </div>

              {/* CURRENT USER CREDENTIALS UPDATE */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-900">
                    Change Security Credentials for: {currentUser.name} ({currentUser.role})
                  </span>
                  <span className="text-emerald-700 font-medium">{currentUser.email}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      New 4-Digit Terminal PIN (نیا چار ہندسی پن کوڈ)
                    </label>
                    <input
                      type="password"
                      maxLength={6}
                      value={newPin}
                      onChange={e => setNewPin(e.target.value)}
                      placeholder="e.g. 1234"
                      className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 font-mono font-bold tracking-widest text-center"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      New Login Password (نیا پاس ورڈ)
                    </label>
                    <input
                      type="text"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 font-mono"
                    />
                  </div>
                </div>

                {pinChangeMsg && (
                  <div className="text-xs bg-emerald-100 text-emerald-800 p-2 rounded font-medium">
                    {pinChangeMsg}
                  </div>
                )}

                <div className="flex justify-end pt-1">
                  <button
                    onClick={handleUpdatePin}
                    className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold"
                  >
                    Update My Credentials
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Terminal Inactivity Auto-Lock
                  </label>
                  <select
                    value={formState.sessionTimeoutMinutes}
                    onChange={e => setFormState({ ...formState, sessionTimeoutMinutes: parseInt(e.target.value, 10) })}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2"
                  >
                    <option value={15}>15 Minutes Inactivity</option>
                    <option value={30}>30 Minutes Inactivity</option>
                    <option value={60}>1 Hour Inactivity</option>
                    <option value={240}>4 Hours Inactivity</option>
                    <option value={0}>Never Auto-Lock (ہمیشہ کھلا رہے)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Action Trail Logging
                  </label>
                  <select
                    value={formState.enableAuditLogging ? 'true' : 'false'}
                    onChange={e => setFormState({ ...formState, enableAuditLogging: e.target.value === 'true' })}
                    className="w-full text-xs bg-slate-50 border border-slate-300 rounded-lg p-2"
                  >
                    <option value="true">Enabled (Track user, timestamp & terminal IP)</option>
                    <option value="false">Disabled</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formState.requirePinForDelete}
                    onChange={e => setFormState({ ...formState, requirePinForDelete: e.target.checked })}
                    className="rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                  />
                  <span className="font-semibold">Require PIN before soft-deleting any voucher (واؤچر ڈیلیٹ کرنے پر پن مانگیں)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formState.requirePinForVoucherApproval}
                    onChange={e => setFormState({ ...formState, requirePinForVoucherApproval: e.target.checked })}
                    className="rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                  />
                  <span>Prompt PIN for single-click voucher approval (واؤچر منظور کرنے پر تصدیق)</span>
                </label>
              </div>

              {/* LOGOUT BUTTON */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-900">Current Terminal Session</div>
                  <div className="text-[11px] text-slate-500">
                    Logged in as {currentUser.name} · Role: {currentUser.role}
                  </div>
                </div>

                <button
                  onClick={logout}
                  className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-2xs"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Lock Terminal / Logout (لاگ آؤٹ کریں)</span>
                </button>
              </div>
            </div>
          )}

        </div>
      </div>

      {showInstallModal && (
        <InstallAppModal
          onClose={() => setShowInstallModal(false)}
          onOpenOfflineInstaller={() => {
            setShowInstallModal(false);
            setShowOfflineInstallerModal(true);
          }}
        />
      )}

      {showOfflineInstallerModal && (
        <OfflineInstallerModal
          onClose={() => setShowOfflineInstallerModal(false)}
        />
      )}
    </div>
  );
};

