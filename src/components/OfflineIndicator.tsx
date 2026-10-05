/**
 * Offline & Network Connectivity Indicator
 * Informs users in grain market yards when operating offline
 */

import React, { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { useOnlineStatus } from '../utils/usePWAInstall';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();
  const [showReconnected, setShowReconnected] = useState(false);
  const [hasBeenOffline, setHasBeenOffline] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setHasBeenOffline(true);
    } else if (hasBeenOffline && isOnline) {
      setShowReconnected(true);
      const timer = setTimeout(() => {
        setShowReconnected(false);
        setHasBeenOffline(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, hasBeenOffline]);

  if (!isOnline) {
    return (
      <div className="fixed bottom-16 sm:bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-amber-600 px-3.5 py-2 text-xs font-medium text-white shadow-xl animate-in slide-in-from-bottom duration-200">
        <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
        <WifiOff className="w-4 h-4 shrink-0" />
        <div>
          <span className="font-bold">Offline Mode Active</span> · <span className="font-urdu">آف لائن موڈ</span>
          <div className="text-[10px] text-amber-100">All weighbridge records & vouchers save to local storage</div>
        </div>
      </div>
    );
  }

  if (showReconnected) {
    return (
      <div className="fixed bottom-16 sm:bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-medium text-white shadow-xl animate-in slide-in-from-bottom duration-200">
        <Wifi className="w-4 h-4 shrink-0" />
        <div>
          <span className="font-bold">Back Online!</span> · <span className="font-urdu">انٹرنیٹ بحال ہو گیا</span>
        </div>
      </div>
    );
  }

  return null;
};
