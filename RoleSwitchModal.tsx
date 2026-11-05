import React, { useState } from 'react';
import { UserRole } from '../types';
import { Shield, ShieldAlert, KeyRound, Check, X, Lock } from 'lucide-react';

interface RoleSwitchModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRole: UserRole;
  onSelectRole: (role: UserRole) => void;
}

export const RoleSwitchModal: React.FC<RoleSwitchModalProps> = ({
  isOpen,
  onClose,
  currentRole,
  onSelectRole,
}) => {
  const [targetRole, setTargetRole] = useState<UserRole>(currentRole);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState(false);

  if (!isOpen) return null;

  const handleApply = () => {
    if (targetRole === 'admin') {
      // Default Admin PIN: 1234
      if (pin === '1234' || currentRole === 'admin') {
        onSelectRole('admin');
        onClose();
      } else {
        setPinError(true);
      }
    } else {
      onSelectRole('staff');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-sm flex flex-col shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
        <div className="p-4 bg-emerald-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield size={18} className="text-emerald-400" />
            <div>
              <h3 className="font-bold text-sm">User Role & Permissions</h3>
              <p className="text-[11px] text-emerald-300">
                Switch between Admin (Owner) and Staff mode
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-emerald-800 text-emerald-200"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-4 space-y-3.5 text-xs">
          {/* Role Choice Cards */}
          <div className="space-y-2">
            {/* Admin Option */}
            <div
              onClick={() => {
                setTargetRole('admin');
                setPinError(false);
              }}
              className={`p-3 rounded-xl border-2 transition-all cursor-pointer flex items-start gap-3 ${
                targetRole === 'admin'
                  ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/20'
                  : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300'
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                <Shield size={17} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-zinc-900 dark:text-zinc-100 text-xs">
                    Admin (Owner)
                  </span>
                  {targetRole === 'admin' && (
                    <span className="text-[10px] font-bold text-amber-600 bg-amber-100 dark:bg-amber-900/80 px-2 py-0.5 rounded-full">
                      Selected
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Full access: Daily net profit/loss, financial reports, raw material expense tracking, delete records, and Google Sheets sync settings.
                </p>
              </div>
            </div>

            {/* Staff Option */}
            <div
              onClick={() => {
                setTargetRole('staff');
                setPinError(false);
              }}
              className={`p-3 rounded-xl border-2 transition-all cursor-pointer flex items-start gap-3 ${
                targetRole === 'staff'
                  ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20'
                  : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300'
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                <ShieldAlert size={17} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-zinc-900 dark:text-zinc-100 text-xs">
                    Staff / Manager
                  </span>
                  {targetRole === 'staff' && (
                    <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-900/80 px-2 py-0.5 rounded-full">
                      Selected
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Limited access: Can add daily orders, view delivery addresses, mark delivered, and record cash collections. Sensitive profit & loss data is hidden.
                </p>
              </div>
            </div>
          </div>

          {/* Admin PIN Prompt */}
          {targetRole === 'admin' && currentRole !== 'admin' && (
            <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 space-y-1.5 animate-fadeIn">
              <div className="flex items-center justify-between">
                <label className="font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5 text-[11px]">
                  <KeyRound size={13} className="text-amber-500" />
                  <span>Enter Owner PIN (Default: 1234)</span>
                </label>
                <button
                  type="button"
                  onClick={() => setPin('1234')}
                  className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
                >
                  Quick Fill (1234)
                </button>
              </div>
              <input
                type="password"
                maxLength={6}
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  setPinError(false);
                }}
                placeholder="••••"
                className="w-full px-3 py-2 text-center text-sm font-mono tracking-widest rounded-xl border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:ring-2 focus:ring-amber-500"
              />
              {pinError && (
                <p className="text-[10px] text-rose-500 font-bold">
                  Incorrect PIN. Please use default PIN: 1234
                </p>
              )}
            </div>
          )}

          <div className="pt-2 flex justify-end gap-2">
            <button
              onClick={onClose}
              className="px-3 py-2 rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1.5 shadow-md active:scale-95"
            >
              <Check size={14} />
              <span>Apply {targetRole === 'admin' ? 'Admin' : 'Staff'} Mode</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
