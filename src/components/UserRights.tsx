/**
 * Mandi ERP - User Rights Matrix & Security (Point 13 & 20)
 * Unlimited Users, Roles (Admin, Manager, Operator, Viewer), Granular Menu-wise Tickbox Rights
 * Session Management, Force Logout, and Action History Logging
 */

import React, { useState } from 'react';
import {
  ShieldCheck,
  UserPlus,
  KeyRound,
  CheckCircle2,
  XCircle,
  Clock,
  Laptop
} from 'lucide-react';
import { useMandi } from '../context/MandiContext';
import { UserAccount, MenuKey, UserRole } from '../types';

export const UserRights: React.FC = () => {
  const { users, currentUser, updateUserRights } = useMandi();
  const [selectedUserId, setSelectedUserId] = useState<string>(users[0]?.id || '');

  const selectedUser = users.find(u => u.id === selectedUserId) || users[0];

  const menuModules: { key: MenuKey; labelEn: string; labelUrdu: string }[] = [
    { key: 'dashboard', labelEn: 'Dashboard', labelUrdu: 'ڈیش بورڈ' },
    { key: 'action_centre', labelEn: 'Action Centre', labelUrdu: 'ایکشن سینٹر' },
    { key: 'purchase', labelEn: 'Purchase Entry', labelUrdu: 'خریداری انٹری' },
    { key: 'sales', labelEn: 'Sales Entry', labelUrdu: 'فروخت انٹری' },
    { key: 'transfer', labelEn: 'Godown Transfer', labelUrdu: 'گودام منتقلی' },
    { key: 'reports', labelEn: 'Reports Suite', labelUrdu: 'کھاتہ جات و رپورٹس' },
    { key: 'pnl', labelEn: 'P&L Statement', labelUrdu: 'نفع و نقصان' },
    { key: 'party', labelEn: 'Parties Master', labelUrdu: 'پارٹی ماسٹر' },
    { key: 'item', labelEn: 'Items Master', labelUrdu: 'جنس ماسٹر' },
    { key: 'godown', labelEn: 'Godowns Master', labelUrdu: 'گودام ماسٹر' },
    { key: 'backup', labelEn: 'Google Drive / Sheets', labelUrdu: 'بیک اپ' },
    { key: 'settings', labelEn: 'System Settings', labelUrdu: 'سیٹنگز' }
  ];

  const toggleRight = (menuKey: MenuKey, permission: 'view' | 'add' | 'edit' | 'delete' | 'print' | 'approve' | 'export') => {
    if (currentUser.role !== 'Admin') {
      alert('Only Admin can modify user permission rights.');
      return;
    }
    const currentVal = selectedUser.rights[menuKey]?.[permission] || false;
    updateUserRights(selectedUser.id, menuKey, { [permission]: !currentVal });
  };

  return (
    <div className="space-y-4">
      {/* HEADER */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-700" />
            <span>User Rights Matrix & Security</span>
            <span className="text-slate-400 font-normal">|</span>
            <span className="font-urdu text-base text-slate-700">صارفین کے اختیارات و سیکیورٹی</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Role-Based Access Control (RBAC): Configure granular Add, Edit, Delete, Print, Approve, and Export rights per menu.
          </p>
        </div>

        <div className="text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
          Logged in as: <strong className="text-slate-900">{currentUser.name}</strong> ({currentUser.role})
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* USERS LIST SIDEBAR */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
          <div className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
            Mandi Users ({users.length})
          </div>

          <div className="space-y-1.5">
            {users.map(u => (
              <button
                key={u.id}
                onClick={() => setSelectedUserId(u.id)}
                className={`w-full text-left p-2.5 rounded-xl text-xs transition-colors flex items-center justify-between ${
                  u.id === selectedUser.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div>
                  <div className="font-bold">{u.name}</div>
                  <div className="text-[10px] opacity-75">{u.mobile} · {u.role}</div>
                </div>
                <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
              </button>
            ))}
          </div>

          {/* Active Session Info */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1 pt-3">
            <div className="font-bold text-slate-800 flex items-center gap-1.5">
              <Laptop className="w-3.5 h-3.5 text-slate-500" />
              <span>Session Tracking</span>
            </div>
            <div className="text-[11px] text-slate-500">
              Terminal: Desktop Workstation
            </div>
            <div className="text-[11px] text-slate-500">
              Last Login: {selectedUser.lastLogin || '2026-09-29 10:00'}
            </div>
          </div>
        </div>

        {/* RIGHTS MATRIX TABLE */}
        <div className="lg:col-span-3 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Permission Rights for: <span className="text-emerald-800">{selectedUser.name}</span> ({selectedUser.role})
              </h2>
              <div className="text-xs text-slate-500 font-urdu">
                ہر مینو کے علیحدہ اختیارات منتخب کریں
              </div>
            </div>

            <div className="text-xs text-slate-500 font-mono">
              Role: <strong className="text-slate-900">{selectedUser.role}</strong>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white text-[11px] uppercase">
                  <th className="py-2.5 px-3">Menu Module</th>
                  <th className="py-2.5 px-2 text-center">View (دیکھیں)</th>
                  <th className="py-2.5 px-2 text-center">Add (درج کریں)</th>
                  <th className="py-2.5 px-2 text-center">Edit (تبدیل کریں)</th>
                  <th className="py-2.5 px-2 text-center">Delete (حذف کریں)</th>
                  <th className="py-2.5 px-2 text-center">Print (پرنٹ)</th>
                  <th className="py-2.5 px-2 text-center">Approve (منظوری)</th>
                  <th className="py-2.5 px-2 text-center">Export (ایکسل)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {menuModules.map(m => {
                  const r = selectedUser.rights[m.key] || {
                    view: false, add: false, edit: false, delete: false, print: false, approve: false, export: false
                  };

                  return (
                    <tr key={m.key} className="hover:bg-slate-50">
                      <td className="py-2.5 px-3">
                        <div className="font-bold text-slate-900">{m.labelEn}</div>
                        <div className="font-urdu text-[11px] text-slate-500">{m.labelUrdu}</div>
                      </td>

                      {(['view', 'add', 'edit', 'delete', 'print', 'approve', 'export'] as const).map(p => (
                        <td key={p} className="py-2.5 px-2 text-center">
                          <input
                            type="checkbox"
                            checked={r[p] || false}
                            onChange={() => toggleRight(m.key, p)}
                            className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                          />
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
