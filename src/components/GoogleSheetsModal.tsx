/**
 * Mandi ERP - Google Sheets Cloud Sync Modal
 * Integrates Google Workspace Google Sheets API for automated cloud backup
 * Follows workspace-integration skill: explicit confirmation before creating/updating sheets
 */

import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  CloudUpload,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  X,
  Lock,
  LogOut,
  RefreshCw
} from 'lucide-react';
import { useMandi } from '../context/MandiContext';
import {
  initWorkspaceAuth,
  googleSignIn,
  logoutGoogle,
  createMandiBackupSpreadsheet
} from '../utils/googleSheets';
import { User } from 'firebase/auth';

interface GoogleSheetsModalProps {
  onClose: () => void;
}

export const GoogleSheetsModal: React.FC<GoogleSheetsModalProps> = ({ onClose }) => {
  const { currentBusiness, filteredVouchers, stockSummary } = useMandi();

  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string>('');
  const [sheetUrl, setSheetUrl] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const unsubscribe = initWorkspaceAuth(
      (u, tok) => {
        setUser(u);
        setToken(tok);
      },
      () => {
        setUser(null);
        setToken(null);
      }
    );
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const handleLogin = async () => {
    setLoading(true);
    setSyncStatus('');
    try {
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        setToken(res.accessToken);
      }
    } catch (err: any) {
      alert(`Google sign in failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logoutGoogle();
    setUser(null);
    setToken(null);
    setSheetUrl(null);
  };

  const executeSync = async () => {
    setShowConfirm(false);
    setLoading(true);
    setSyncStatus('Exporting vouchers and closing stock to Google Sheets...');
    try {
      const result = await createMandiBackupSpreadsheet(
        currentBusiness,
        filteredVouchers,
        stockSummary
      );
      setSheetUrl(result.spreadsheetUrl);
      setSyncStatus('Backup spreadsheet successfully generated in your Google Drive!');
    } catch (err: any) {
      alert(`Google Sheets export error: ${err.message}`);
      setSyncStatus('Export failed. Please verify spreadsheet permissions.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
        
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
              <FileSpreadsheet className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Google Sheets Cloud Backup
              </h2>
              <div className="text-xs text-slate-500 font-urdu">
                گوگل شیٹس پر منڈی ریکارڈز کی کلاؤڈ محفوظ منتقلی
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* AUTH STATE & USER INFO */}
        {!user ? (
          <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 text-center space-y-3">
            <p className="text-xs text-slate-600">
              Connect your Google Workspace account with permission from the app's users to create and sync real-time Mandi spreadsheets directly into your Google Drive.
            </p>

            <button
              onClick={handleLogin}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold shadow-xs transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
              <span>{loading ? 'Connecting...' : 'Sign in with Google'}</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold">
                  {user.displayName?.charAt(0) || 'G'}
                </div>
                <div>
                  <div className="font-bold text-slate-900">{user.displayName || user.email}</div>
                  <div className="text-[11px] text-slate-500">{user.email}</div>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Disconnect</span>
              </button>
            </div>

            {/* SYNC SCOPE SUMMARY */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1.5">
              <div className="font-bold text-slate-900">What will be backed up:</div>
              <ul className="list-disc list-inside space-y-0.5 text-slate-600">
                <li>Active Business: <strong>{currentBusiness.name}</strong></li>
                <li>{filteredVouchers.length} Total Vouchers (Purchase, Sales, Transfers)</li>
                <li>Item Closing Stock balances and weighted average rates</li>
              </ul>
            </div>

            {/* SYNC STATUS & LINK */}
            {syncStatus && (
              <div className="p-3 bg-blue-50 text-blue-900 rounded-xl text-xs font-medium flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span>{syncStatus}</span>
              </div>
            )}

            {sheetUrl && (
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between text-xs">
                <span className="font-bold text-emerald-900">Spreadsheet Ready:</span>
                <a
                  href={sheetUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 underline"
                >
                  <span>Open in Google Sheets</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}

            {/* CONFIRMATION DIALOG (MANDATORY PER WORKSPACE SKILL) */}
            {showConfirm ? (
              <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-xl space-y-3 animate-in fade-in">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Confirm Cloud Export</span>
                </div>
                <p className="text-xs text-amber-800">
                  Are you sure you want to export {filteredVouchers.length} vouchers and stock records to a new Google Spreadsheet in your Google Drive?
                </p>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    onClick={() => setShowConfirm(false)}
                    className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={executeSync}
                    className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold"
                  >
                    Yes, Export to Drive
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setShowConfirm(true)}
                  disabled={loading}
                  className="flex items-center gap-2 px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-md transition-colors"
                >
                  <CloudUpload className="w-4 h-4" />
                  <span>{loading ? 'Creating Sheet...' : 'Export to Google Sheets Now'}</span>
                </button>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
