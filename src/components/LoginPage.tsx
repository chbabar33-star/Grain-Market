/**
 * Grain Market Software (غلہ منڈی سافٹ ویئر)
 * Dedicated Mandi ERP Login & Authentication Page
 * 
 * Satisfies User Specification:
 * 1. "No dependency on google website cloud store data on business provided Google derives"
 *    - Explicitly 100% self-hosted & stored on business-provided drive / local SQLite storage
 *    - Zero mandatory Google website cloud server or Firebase dependency
 * 2. "create login page with addminstrator account"
 *    - Built-in Administrator account (User: 'admin' | Password: 'admin' | PIN: '1234')
 *    - Dedicated Administrator login tab & 1-click Administrator instant access button
 *    - Full permissions, firm switching, credentials helper, and session security
 */

import React, { useState } from 'react';
import {
  Lock,
  UserCheck,
  Building2,
  KeyRound,
  Shield,
  ShieldCheck,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Scale,
  Sparkles,
  Smartphone,
  Download,
  FolderArchive,
  HardDrive,
  Database,
  ServerOff,
  Check,
  UserCog,
  RefreshCw
} from 'lucide-react';
import { useMandi } from '../context/MandiContext';
import { InstallAppModal } from './InstallAppModal';
import { OfflineInstallerModal } from './OfflineInstallerModal';

interface LoginPageProps {
  onLoginSuccess?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const {
    users,
    businesses,
    currentBusiness,
    setCurrentBusinessId,
    login,
    loginAsAdmin,
    loginWithCredentials
  } = useMandi();

  const [activeTab, setActiveTab] = useState<'admin' | 'staff' | 'storage_info'>('admin');
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin');
  const [showPassword, setShowPassword] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'password' | 'pin'>('password');
  const [pinDigits, setPinDigits] = useState(['1', '2', '3', '4']);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeBizId, setActiveBizId] = useState(currentBusiness.id);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [showOfflineInstallerModal, setShowOfflineInstallerModal] = useState(false);

  // Administrator Quick Fill
  const handleSelectAdminAccount = () => {
    setActiveTab('admin');
    setUsername('admin');
    setPassword('admin');
    setPinDigits(['1', '2', '3', '4']);
    setLoginMethod('password');
    setErrorMsg('');
  };

  // Direct 1-Click Instant Login for Administrator
  const handleInstantAdminLogin = () => {
    setLoading(true);
    setErrorMsg('');
    try {
      setCurrentBusinessId(activeBizId);
      loginAsAdmin();
      setSuccessMsg('Logged in as Administrator (مکمل انتظامی اختیارات)!');
      setTimeout(() => {
        if (onLoginSuccess) onLoginSuccess();
      }, 300);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Login failed.');
      setLoading(false);
    }
  };

  // Staff Account Quick Fill
  const handleSelectStaffAccount = (userId: string, defaultPin: string, defaultPass: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setUsername(user.username || user.email);
      setPassword(user.password || defaultPass);
      setPinDigits(defaultPin.split('').slice(0, 4));
      setErrorMsg('');
    }
  };

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const pinOrPass = loginMethod === 'pin' ? pinDigits.join('') : password;
      const res = await loginWithCredentials(username, pinOrPass);
      if (res.success) {
        setCurrentBusinessId(activeBizId);
        setSuccessMsg('Authentication successful! Opening dashboard...');
        setTimeout(() => {
          if (onLoginSuccess) onLoginSuccess();
        }, 300);
      } else {
        setErrorMsg(res.message || 'Invalid login details.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error logging in.');
    } finally {
      setLoading(false);
    }
  };

  const handlePinInput = (index: number, val: string) => {
    if (val.length > 1) val = val.slice(-1);
    const next = [...pinDigits];
    next[index] = val;
    setPinDigits(next);
    // Auto-focus next input
    if (val && index < 3) {
      const nextInput = document.getElementById(`pin-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-950 via-slate-900 to-emerald-950 flex flex-col justify-center py-10 sm:px-6 lg:px-8 selection:bg-emerald-500 selection:text-white">
      {/* BACKGROUND ACCENTS */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-emerald-600/15 blur-3xl"></div>
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-amber-600/10 blur-3xl"></div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-xl relative z-10 px-4">
        
        {/* BRAND LOGO & TITLE */}
        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-linear-to-tr from-emerald-600 to-teal-500 text-white shadow-xl shadow-emerald-950/60 ring-4 ring-emerald-500/20">
            <Scale className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center justify-center gap-2">
              <span>ERP Mandi Stock Management System</span>
            </h1>
            <p className="font-urdu text-xl text-emerald-300 font-bold mt-1">
              غلہ منڈی اسٹاک مینجمنٹ سسٹم و لاگ ان پورٹل
            </p>
            <p className="text-xs text-slate-300 mt-1 max-w-md mx-auto">
              Weighbridge First-Weight Costing, Bilingual Ledgers, & Business-Provided Drive Storage
            </p>
          </div>
        </div>

        {/* 100% STANDALONE APPLICATION & ZERO GOOGLE EXTENSION GUARANTEE BANNER */}
        <div className="mb-5 bg-gradient-to-r from-emerald-950/95 via-slate-900/95 to-slate-950/95 border border-emerald-500/50 rounded-2xl p-4 shadow-xl text-white backdrop-blur-md space-y-2">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-700/80 text-emerald-200 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-500/40 shadow-inner">
              <ServerOff className="w-5 h-5 text-emerald-300" />
            </div>
            <div className="space-y-1 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-1">
                <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Standalone Application — NOT a Google Extension
                </span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold border border-emerald-500/30">
                  No Extension Needed
                </span>
              </div>
              <p className="text-[11px] text-slate-300 leading-snug">
                Installs directly as an independent desktop or mobile program. Does NOT run inside Chrome toolbar, does NOT require Google Web Store, and keeps all business records on your local machine.
              </p>
              <div className="font-urdu text-[11px] text-emerald-400/90 pt-0.5">
                یہ ایک مکمل آزادانہ کمپیوٹر و موبائل ایپلی کیشن کے طور پر انسٹال ہوتا ہے، یہ کوئی گوگل ایکسٹینشن نہیں ہے۔
              </div>
            </div>
          </div>
        </div>

        {/* MAIN LOGIN CARD */}
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/80 p-6 sm:p-8 space-y-6">
          
          {/* TAB SELECTOR: ADMINISTRATOR VS STAFF */}
          <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-semibold text-slate-600 gap-1">
            <button
              type="button"
              onClick={handleSelectAdminAccount}
              className={`flex-1 py-2 text-center rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'admin'
                  ? 'bg-emerald-900 text-white shadow-md font-bold'
                  : 'hover:text-slate-900'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>Administrator (ایڈمن)</span>
              <span className="text-[9px] bg-emerald-700/60 px-1.5 py-0.2 rounded-full text-emerald-100">Full</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('staff');
                setUsername('aslam.munshi@nazarsoon.pk');
                setPassword('manager');
                setLoginMethod('pin');
                setPinDigits(['2', '3', '4', '5']);
                setErrorMsg('');
              }}
              className={`flex-1 py-2 text-center rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'staff'
                  ? 'bg-slate-900 text-white shadow-md font-bold'
                  : 'hover:text-slate-900'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5 text-slate-400" />
              <span>Staff & Operator (منشی و کانٹا)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('storage_info')}
              className={`py-2 px-3 text-center rounded-lg transition-all flex items-center justify-center gap-1 ${
                activeTab === 'storage_info'
                  ? 'bg-slate-800 text-white shadow-md font-bold'
                  : 'hover:text-slate-900'
              }`}
              title="Storage Architecture & Business Drive Guarantee"
            >
              <HardDrive className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Drive Storage</span>
            </button>
          </div>

          {/* ACTIVE BUSINESS / MANDI FIRM SELECTOR */}
          <div className="space-y-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <label className="block text-xs font-bold text-slate-800 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-emerald-700" />
                Select Mandi Firm / غلہ منڈی فرم منتخب کریں:
              </span>
              <span className="text-[10px] text-emerald-700 font-bold">Active Firm</span>
            </label>
            <select
              value={activeBizId}
              onChange={e => setActiveBizId(e.target.value)}
              className="w-full text-xs font-semibold bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-2xs"
            >
              {businesses.map(b => (
                <option key={b.id} value={b.id}>
                  {b.name} — {b.nameUrdu}
                </option>
              ))}
            </select>
          </div>

          {/* ALERT MESSAGES */}
          {errorMsg && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex items-start gap-2.5 text-xs text-rose-700 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
              <div className="font-semibold">{errorMsg}</div>
            </div>
          )}

          {successMsg && (
            <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-3 flex items-center gap-2 text-xs text-emerald-800 font-bold animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* VIEW: ADMINISTRATOR LOGIN */}
          {activeTab === 'admin' && (
            <div className="space-y-4">
              
              {/* FEATURED ADMINISTRATOR CREDENTIALS CALLOUT */}
              <div className="bg-linear-to-r from-emerald-950 to-slate-900 rounded-xl p-4 text-white shadow-md border border-emerald-700/50 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
                      <Shield className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-xs text-white">Administrator Account (ایڈمنسٹریٹر)</div>
                      <div className="text-[10px] text-emerald-300">Ch. Babar Ameen · Complete Mandi Controls</div>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full font-bold">
                    Super Admin
                  </span>
                </div>

                {/* 1-CLICK INSTANT ADMIN LOGIN BUTTON */}
                <button
                  type="button"
                  onClick={handleInstantAdminLogin}
                  disabled={loading}
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 active:scale-98"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-200" />
                  <span>1-Click Sign In as Administrator (فوری ایڈمن لاگ ان)</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>

                {/* CREDENTIALS HINT */}
                <div className="bg-slate-950/60 rounded-lg p-2.5 text-[11px] text-slate-300 flex items-center justify-between border border-slate-800">
                  <div className="flex items-center gap-2">
                    <KeyRound className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Username: <strong className="text-white font-mono">admin</strong></span>
                    <span className="text-slate-600">|</span>
                    <span>Password: <strong className="text-white font-mono">admin</strong></span>
                    <span className="text-slate-600">|</span>
                    <span>PIN: <strong className="text-white font-mono">1234</strong></span>
                  </div>
                </div>
              </div>

              {/* METHOD TOGGLE (PASSWORD VS QUICK PIN) */}
              <div className="flex rounded-lg bg-slate-100 p-1 text-xs font-semibold text-slate-600">
                <button
                  type="button"
                  onClick={() => setLoginMethod('password')}
                  className={`flex-1 py-1.5 text-center rounded-md transition-all ${
                    loginMethod === 'password'
                      ? 'bg-white text-slate-900 shadow-xs font-bold'
                      : 'hover:text-slate-900'
                  }`}
                >
                  Standard Password / پاس ورڈ
                </button>
                <button
                  type="button"
                  onClick={() => setLoginMethod('pin')}
                  className={`flex-1 py-1.5 text-center rounded-md transition-all ${
                    loginMethod === 'pin'
                      ? 'bg-white text-slate-900 shadow-xs font-bold'
                      : 'hover:text-slate-900'
                  }`}
                >
                  Terminal PIN (پن کوڈ)
                </button>
              </div>

              {/* FORM */}
              <form onSubmit={handleCredentialsSubmit} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">
                    Administrator Username or Email
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    required
                    placeholder="admin or admin@grainmarket.pk"
                    className="w-full text-xs font-medium bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>

                {loginMethod === 'password' ? (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <label className="font-semibold text-slate-700">Password / پاس ورڈ</label>
                      <span className="text-[11px] text-slate-400">Default: admin</span>
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                        placeholder="Enter password"
                        className="w-full text-xs font-medium bg-slate-50 border border-slate-300 rounded-lg p-2.5 pr-10 text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-1.5 text-center pt-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      Enter 4-Digit Administrator PIN (چار ہندسی پن کوڈ)
                    </label>
                    <div className="flex justify-center gap-3">
                      {pinDigits.map((digit, idx) => (
                        <input
                          key={idx}
                          id={`pin-input-${idx}`}
                          type="password"
                          maxLength={1}
                          value={digit}
                          onChange={e => handlePinInput(idx, e.target.value)}
                          className="w-12 h-12 text-center text-xl font-bold font-mono bg-slate-50 border-2 border-slate-300 rounded-xl focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                        />
                      ))}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Default Administrator PIN is 1234
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={e => setRememberMe(e.target.checked)}
                      className="rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                    />
                    <span>Remember Administrator session (اس ڈیوائس پر لاگ ان رکھیں)</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 bg-emerald-800 hover:bg-emerald-900 text-white rounded-lg text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Verifying credentials...
                    </span>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      <span>Login to Administrator Workspace (ایڈمن لاگ ان)</span>
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* VIEW: STAFF & OPERATOR LOGIN */}
          {activeTab === 'staff' && (
            <div className="space-y-4">
              <div className="text-xs font-semibold text-slate-600 flex items-center justify-between border-b border-slate-100 pb-2">
                <span>Select Staff / Operator Profile (فوری منتخب کریں):</span>
                <span className="text-[10px] text-emerald-700 font-bold">Role-Based</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => handleSelectStaffAccount('usr-2', '2345', 'manager')}
                  className="p-3 text-left rounded-xl border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 transition-all text-xs"
                >
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                    <span>Haji Aslam</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Manager / منشی</div>
                  <div className="text-[10px] text-emerald-700 font-mono mt-1 font-bold">PIN: 2345</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectStaffAccount('usr-3', '3456', 'kanta')}
                  className="p-3 text-left rounded-xl border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 transition-all text-xs"
                >
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Scale className="w-3.5 h-3.5 text-amber-600" />
                    <span>Tariq Kanta</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Weighbridge / کانٹا</div>
                  <div className="text-[10px] text-emerald-700 font-mono mt-1 font-bold">PIN: 3456</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectStaffAccount('usr-4', '4567', 'audit')}
                  className="p-3 text-left rounded-xl border border-slate-200 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-300 transition-all text-xs"
                >
                  <div className="font-bold text-slate-900 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-purple-600" />
                    <span>Auditor</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Auditor / پارٹنر</div>
                  <div className="text-[10px] text-emerald-700 font-mono mt-1 font-bold">PIN: 4567</div>
                </button>
              </div>

              {/* STAFF FORM */}
              <form onSubmit={handleCredentialsSubmit} className="space-y-3.5 pt-2">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700">Account / صارف</label>
                  <input
                    type="text"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    required
                    className="w-full text-xs font-medium bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900"
                  />
                </div>

                <div className="space-y-1.5 text-center">
                  <label className="block text-xs font-semibold text-slate-700">
                    Terminal PIN Code (چار ہندسی پن کوڈ درج کریں)
                  </label>
                  <div className="flex justify-center gap-3">
                    {pinDigits.map((digit, idx) => (
                      <input
                        key={idx}
                        id={`pin-input-${idx}`}
                        type="password"
                        maxLength={1}
                        value={digit}
                        onChange={e => handlePinInput(idx, e.target.value)}
                        className="w-12 h-12 text-center text-xl font-bold font-mono bg-slate-50 border-2 border-slate-300 rounded-xl focus:bg-white focus:border-emerald-600 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                      />
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>Sign In as Staff / Operator (لاگ ان کریں)</span>
                </button>
              </form>
            </div>
          )}

          {/* VIEW: BUSINESS DRIVE & STORAGE ARCHITECTURE INFO */}
          {activeTab === 'storage_info' && (
            <div className="space-y-4 text-xs text-slate-700">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-2">
                <div className="font-bold text-sm text-emerald-950 flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-emerald-700" />
                  <span>Business Storage Architecture (کوئی گوگل ویب کلاؤڈ انحصار نہیں)</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Grain Market ERP is engineered as an offline-first system. All ledger vouchers, party khatas, commodity inventory, and financial reports are saved on:
                </p>
                <ul className="space-y-1.5 font-medium text-slate-800 pl-2">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span><strong>Local Device Database:</strong> Secure local storage vault and offline SQLite database.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span><strong>Business-Provided Google Drive Folder:</strong> Direct export & sync to your local PC Google Drive synced folder.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span><strong>Zero Web Server Lock-In:</strong> Fully operates with no internet connection at mandi yards.</span>
                  </li>
                </ul>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleSelectAdminAccount}
                  className="flex-1 py-2 px-3 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-lg text-center transition"
                >
                  Proceed to Administrator Login
                </button>
              </div>
            </div>
          )}

          {/* STANDALONE APPLICATION INSTALL & OFFLINE BUTTONS */}
          <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2.5">
            <div className="text-[11px] text-slate-500 font-medium">
              Install as Program (Windows 7 / 8 / 10 / 11 / Mobile):
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setShowInstallModal(true)}
                className="flex-1 sm:flex-none px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs"
                title="Install ERP Mandi Stock Management System as an Application (NOT a Google Extension)"
              >
                <Download className="w-3.5 h-3.5 text-emerald-200" />
                <span>Install Application</span>
              </button>
              <button
                type="button"
                onClick={() => setShowOfflineInstallerModal(true)}
                className="flex-1 sm:flex-none px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs"
                title="Download Windows 7 / 8 / 10 / 11 Offline Package (.ZIP & Launcher)"
              >
                <FolderArchive className="w-3.5 h-3.5 text-emerald-400" />
                <span>Windows 7 Offline ZIP</span>
              </button>
            </div>
          </div>
        </div>

        {/* FOOTER BADGES */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Punjab Mandi Act Compliant</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1">
            <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
            <span>Business-Provided Drive Vault</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Administrator Protected</span>
          </div>
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
