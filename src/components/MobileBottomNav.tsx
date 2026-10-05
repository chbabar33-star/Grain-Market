/**
 * Mobile Bottom Navigation Bar
 * Optimized for one-handed thumb reach on smartphones (Android & iOS).
 * Visible only on mobile / small screens (lg:hidden).
 */

import React from 'react';
import {
  LayoutDashboard,
  Scale,
  Receipt,
  Zap,
  Menu,
  Download
} from 'lucide-react';
import { ActiveTab } from './Navbar';
import { useMandi } from '../context/MandiContext';

interface MobileBottomNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenMenu: () => void;
  onOpenInstallModal: () => void;
  isInstallable: boolean;
  isStandalone: boolean;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  onOpenMenu,
  onOpenInstallModal,
  isInstallable,
  isStandalone
}) => {
  const { todayMetrics, languageMode } = useMandi();

  const items = [
    {
      id: 'dashboard' as ActiveTab,
      labelEn: 'Dashboard',
      labelUrdu: 'ڈیش بورڈ',
      icon: LayoutDashboard
    },
    {
      id: 'purchase' as ActiveTab,
      labelEn: 'Purchase',
      labelUrdu: 'خریداری',
      icon: Scale
    },
    {
      id: 'sales' as ActiveTab,
      labelEn: 'Sales',
      labelUrdu: 'فروخت',
      icon: Receipt
    },
    {
      id: 'action_centre' as ActiveTab,
      labelEn: 'Action',
      labelUrdu: 'ایکشن',
      icon: Zap,
      badge: todayMetrics.pendingApprovalsCount
    }
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1 shadow-lg">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {items.map(item => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex-1 py-1.5 px-1 flex flex-col items-center justify-center relative rounded-xl transition-colors ${
                isActive
                  ? 'text-emerald-800 font-bold bg-emerald-50/80'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-700 stroke-[2.5]' : 'text-slate-500'}`} />
                {item.badge && item.badge > 0 ? (
                  <span className="absolute -top-1.5 -right-2 bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full min-w-4 text-center animate-pulse">
                    {item.badge}
                  </span>
                ) : null}
              </div>
              <span className="text-[10px] leading-tight mt-0.5 font-medium">
                {languageMode === 'urdu' ? item.labelUrdu : item.labelEn}
              </span>
            </button>
          );
        })}

        {/* More / All Modules Button */}
        <button
          onClick={onOpenMenu}
          className="flex-1 py-1.5 px-1 flex flex-col items-center justify-center relative rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
        >
          <div className="relative">
            <Menu className="w-5 h-5 text-slate-600" />
            {!isStandalone && (
              <span className="absolute -top-1 -right-1.5 w-2.5 h-2.5 rounded-full bg-emerald-600 ring-2 ring-white"></span>
            )}
          </div>
          <span className="text-[10px] leading-tight mt-0.5 font-medium">
            {languageMode === 'urdu' ? 'مینیو' : 'Menu'}
          </span>
        </button>
      </div>
    </nav>
  );
};
