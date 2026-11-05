import React, { useState, useEffect } from 'react';
import { UserRole, GoogleSheetsConfig } from '../types';
import { Shield, ShieldAlert, FileSpreadsheet, Smartphone, Monitor, Clock, Trash2, Download } from 'lucide-react';
import { getBangladeshDateTime } from '../utils/timeUtils';

interface HeaderProps {
  role: UserRole;
  onOpenRoleSwitch: () => void;
  sheetsConfig: GoogleSheetsConfig;
  onOpenSheetsSync: () => void;
  isDesktopWide: boolean;
  onToggleDesktopWide: () => void;
  onOpenDataManagement?: () => void;
  onOpenInstallModal?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  role,
  onOpenRoleSwitch,
  sheetsConfig,
  onOpenSheetsSync,
  isDesktopWide,
  onToggleDesktopWide,
  onOpenDataManagement,
  onOpenInstallModal,
}) => {
  const [bdDateTime, setBdDateTime] = useState(getBangladeshDateTime());

  useEffect(() => {
    const timer = setInterval(() => {
      setBdDateTime(getBangladeshDateTime());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-emerald-950/95 backdrop-blur-md text-white border-b border-emerald-900/50 px-3 sm:px-4 py-2 shadow-md">
      <div className="flex items-center justify-between max-w-5xl mx-auto">
        {/* Brand & Live Bangladesh Time */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-emerald-950 font-black text-lg shrink-0">
            🥥
          </div>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <h1 className="font-bold text-sm sm:text-base tracking-tight leading-none text-white">
                Dessert Boss
              </h1>
              <span className="text-[10px] uppercase font-semibold tracking-wider px-1.5 py-0.2 rounded bg-emerald-800 text-emerald-200">
                24 Hubs
              </span>
            </div>

            {/* Live Bangladesh Time & Date Display */}
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-300 font-medium leading-tight mt-0.5">
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-mono font-bold text-white tracking-wide text-[11px]">
                  {bdDateTime.timeStr}
                </span>
                <span className="text-[9.5px] px-1 py-0.2 rounded bg-emerald-900/80 text-emerald-300 font-semibold">
                  BST
                </span>
              </div>
              <span>•</span>
              <span className="text-[10.5px] text-emerald-200 truncate max-w-[150px] sm:max-w-none">
                {bdDateTime.bengaliDateStr}
              </span>
            </div>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          {/* Desktop Frame Toggle (visible on lg screens) */}
          <button
            onClick={onToggleDesktopWide}
            title={isDesktopWide ? "Switch to Mobile View" : "Expand to Wide Desktop View"}
            className="hidden md:flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-900/60 hover:bg-emerald-800/80 text-emerald-200 transition-colors"
          >
            {isDesktopWide ? <Smartphone size={15} /> : <Monitor size={15} />}
          </button>


          {/* Database Management / Delete Customization */}
          {onOpenDataManagement && (
            <button
              onClick={onOpenDataManagement}
              className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 text-xs font-medium text-rose-200 border border-rose-800/60 transition-all active:scale-95"
              title="ডেটাবেস ম্যানেজার ও ডিলিট অপশন (Data Customization & Delete)"
            >
              <Trash2 size={13} className="text-rose-400" />
              <span className="hidden sm:inline text-[11px] font-bold">মুছুন</span>
            </button>
          )}

          {/* Google Sheets Sync Pill */}
          <button
            onClick={onOpenSheetsSync}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-900/60 hover:bg-emerald-800/80 text-xs font-medium text-emerald-100 border border-emerald-700/50 transition-all active:scale-95"
            title="Google Sheets Database Status"
          >
            <FileSpreadsheet size={13} className="text-emerald-400" />
            <span className="hidden sm:inline">Sheets</span>
            <span className={`w-2 h-2 rounded-full ${sheetsConfig.status === 'connected' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
          </button>

          {/* Role Switcher Badge */}
          <button
            onClick={onOpenRoleSwitch}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide border transition-all active:scale-95 shadow-sm ${
              role === 'admin'
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 hover:bg-amber-500/30'
                : 'bg-emerald-800/60 border-emerald-600/40 text-emerald-100 hover:bg-emerald-800'
            }`}
            title="Click to switch role (Admin / Staff)"
          >
            {role === 'admin' ? (
              <>
                <Shield size={13} className="text-amber-400" />
                <span>Admin</span>
              </>
            ) : (
              <>
                <ShieldAlert size={13} className="text-emerald-300" />
                <span>Staff</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
