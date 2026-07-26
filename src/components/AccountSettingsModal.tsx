import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, User, Mail, Shield, LogOut, Settings, Clock, CheckCircle2 } from 'lucide-react';
import { UserSession } from './GoogleAuthModal';

interface AccountSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserSession | null;
  onLogout: () => void;
}

export default function AccountSettingsModal({
  isOpen,
  onClose,
  user,
  onLogout
}: AccountSettingsModalProps) {
  if (!isOpen) return null;

  const formattedDate = user?.loggedInAt 
    ? new Date(user.loggedInAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : 'Active Session';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative w-full max-w-sm bg-[#0d0d10] border border-white/10 rounded-2xl p-6 shadow-2xl overflow-hidden text-gray-100"
        >
          {/* Top Brand Accent Bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-red/20 via-brand-red to-brand-red/20" />

          {/* Modal Header */}
          <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-brand-red/10 border border-brand-red/30 text-brand-red">
                <Settings className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-display font-bold text-sm text-white uppercase tracking-wider">Account Settings</h3>
                <p className="text-[10px] text-gray-400 font-mono">Manage profile & session</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Profile Card */}
          {user ? (
            <div className="space-y-4">
              <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-white/5 border border-white/10">
                <div className="w-12 h-12 rounded-full bg-brand-red text-white font-bold text-base flex items-center justify-center overflow-hidden border border-brand-red/40 shrink-0 shadow-[0_0_15px_rgba(255,0,0,0.3)]">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    user.name.charAt(0).toUpperCase()
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="text-sm font-semibold text-white truncate">{user.name}</h4>
                    <span className="p-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px]" title="Authenticated">
                      <CheckCircle2 className="w-3 h-3" />
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 truncate font-mono mt-0.5">{user.email}</p>
                </div>
              </div>

              {/* Account Metadata Details */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-black/40 border border-white/5 text-gray-300">
                  <span className="text-gray-400 flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5 text-brand-red" />
                    Auth Method
                  </span>
                  <span className="font-mono text-[11px] uppercase text-white bg-white/10 px-2 py-0.5 rounded border border-white/10">
                    {user.provider === 'google' ? 'Google OAuth 2.0' : 'Email & Password'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-black/40 border border-white/5 text-gray-300">
                  <span className="text-gray-400 flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    Session Started
                  </span>
                  <span className="font-mono text-[10px] text-gray-400">
                    {formattedDate}
                  </span>
                </div>
              </div>

              {/* Logout Action */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onLogout();
                  }}
                  className="w-full py-3 rounded-xl bg-red-600/20 hover:bg-red-600 border border-red-500/40 hover:border-red-500 text-red-200 hover:text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg active:scale-[0.99]"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out of Account</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center py-6 text-xs text-gray-400">
              No active session found. Please sign in.
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
