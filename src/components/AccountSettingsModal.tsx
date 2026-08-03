import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  User, 
  Mail, 
  LogOut, 
  Settings, 
  CheckCircle2, 
  Bell, 
  Sparkles, 
  Save, 
  RefreshCw, 
  Phone, 
  Building
} from 'lucide-react';
import { UserSession } from './GoogleAuthModal';
import { saveUserToFirestore } from '../lib/firebase';

interface AccountSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserSession | null;
  onLogout: () => void;
  onUpdateUser?: (updatedUser: UserSession) => void;
}

type TabType = 'profile' | 'notifications';

export default function AccountSettingsModal({
  isOpen,
  onClose,
  user,
  onLogout,
  onUpdateUser
}: AccountSettingsModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  
  // Profile edit fields
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [organization, setOrganization] = useState<string>('All Red Media');
  const [role, setRole] = useState<string>('Content Creator & Producer');
  const [avatarSeed, setAvatarSeed] = useState<number>(0);

  // Notification toggles
  const [notifyLeads, setNotifyLeads] = useState<boolean>(true);
  const [notifyProjects, setNotifyProjects] = useState<boolean>(true);
  const [notifyMarketing, setNotifyMarketing] = useState<boolean>(false);
  const [soundEffects, setSoundEffects] = useState<boolean>(true);

  // Save states
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [showSuccessToast, setShowSuccessToast] = useState<boolean>(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
    }
  }, [user]);

  if (!isOpen) return null;

  const handleAvatarRefresh = () => {
    setAvatarSeed(prev => prev + 1);
  };

  const currentAvatarUrl = user?.avatarUrl && avatarSeed === 0
    ? user.avatarUrl
    : `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name || 'user')}&backgroundColor=dc2626&textColor=ffffff&r=${avatarSeed}`;

  const handleSaveProfile = async () => {
    if (!user) return;
    setIsSaving(true);

    const updatedUserSession: UserSession = {
      ...user,
      name: name.trim() || user.name,
      avatarUrl: currentAvatarUrl
    };

    // Save to Firestore background sync
    try {
      await saveUserToFirestore({
        name: updatedUserSession.name,
        email: updatedUserSession.email,
        avatarUrl: updatedUserSession.avatarUrl,
        provider: updatedUserSession.provider
      });
    } catch (e) {
      console.warn('Firestore user update notice:', e);
    }

    if (onUpdateUser) {
      onUpdateUser(updatedUserSession);
    }

    setTimeout(() => {
      setIsSaving(false);
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
    }, 400);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative w-full max-w-xl bg-[#0d0d12] border border-white/10 rounded-2xl shadow-2xl overflow-hidden text-gray-100 flex flex-col max-h-[90vh]"
        >
          {/* Top Brand Accent Bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-red/20 via-brand-red to-brand-red/20" />

          {/* Modal Header */}
          <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-white/10 shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-brand-red/10 border border-brand-red/30 text-brand-red shadow-[0_0_12px_rgba(255,0,0,0.2)]">
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-base text-white uppercase tracking-wider">Account Settings</h3>
                <p className="text-xs text-gray-400 font-mono">Profile & preferences</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Toast Notification */}
          {showSuccessToast && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="mx-6 mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Account settings updated successfully!</span>
              </div>
              <span className="font-mono text-[10px] uppercase bg-emerald-500/20 px-2 py-0.5 rounded">Saved</span>
            </motion.div>
          )}

          {user ? (
            <div className="flex flex-col flex-1 overflow-hidden">
              {/* Profile Card Header Banner */}
              <div className="px-6 pt-4 pb-2 bg-gradient-to-b from-white/[0.03] to-transparent shrink-0">
                <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="relative group">
                    <div className="w-14 h-14 rounded-full bg-brand-red text-white font-bold text-lg flex items-center justify-center overflow-hidden border-2 border-brand-red/60 shrink-0 shadow-[0_0_20px_rgba(255,0,0,0.35)]">
                      <img src={currentAvatarUrl} alt={name} className="w-full h-full object-cover" />
                    </div>
                    <button
                      type="button"
                      onClick={handleAvatarRefresh}
                      title="Randomize Avatar Pattern"
                      className="absolute -bottom-1 -right-1 p-1 rounded-full bg-black/90 border border-white/20 text-gray-300 hover:text-brand-red transition-all cursor-pointer shadow"
                    >
                      <RefreshCw className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-semibold text-white truncate">{name || user.name}</h4>
                    </div>
                    <p className="text-xs text-gray-400 font-mono truncate mt-0.5">{user.email}</p>
                  </div>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex items-center gap-1 px-6 border-b border-white/10 overflow-x-auto shrink-0 scrollbar-none py-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('profile')}
                  className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
                    activeTab === 'profile'
                      ? 'bg-brand-red text-white shadow-md shadow-brand-red/20'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Profile Info</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('notifications')}
                  className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all whitespace-nowrap cursor-pointer ${
                    activeTab === 'notifications'
                      ? 'bg-brand-red text-white shadow-md shadow-brand-red/20'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>Preferences</span>
                </button>
              </div>

              {/* Tab Content Body */}
              <div className="p-6 overflow-y-auto space-y-4 flex-1 scrollbar-thin scrollbar-thumb-white/10">
                
                {/* TAB 1: PROFILE INFO */}
                {activeTab === 'profile' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[11px] font-mono text-gray-400 uppercase tracking-wider mb-1.5">
                        Display Name
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Your Full Name"
                          className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-gray-400 uppercase tracking-wider mb-1.5">
                        Email Address (Primary Account)
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
                        <input
                          type="email"
                          disabled
                          value={user.email}
                          className="w-full bg-white/[0.02] border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-xs text-gray-400 cursor-not-allowed font-mono"
                        />
                      </div>
                      <p className="text-[10px] text-gray-500 mt-1 font-mono">Email is locked to your verified authentication handle.</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-mono text-gray-400 uppercase tracking-wider mb-1.5">
                          Professional Role / Title
                        </label>
                        <div className="relative">
                          <Sparkles className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
                          <input
                            type="text"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            placeholder="Creator, Manager, etc."
                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-red transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-mono text-gray-400 uppercase tracking-wider mb-1.5">
                          Organization / Studio
                        </label>
                        <div className="relative">
                          <Building className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
                          <input
                            type="text"
                            value={organization}
                            onChange={(e) => setOrganization(e.target.value)}
                            placeholder="Agency Name"
                            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-3 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-red transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-mono text-gray-400 uppercase tracking-wider mb-1.5">
                        Contact Phone Number
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-gray-500 absolute left-3.5 top-3" />
                        <input
                          type="text"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="Enter your phone number"
                          className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-red transition-all"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: PREFERENCES & NOTIFICATIONS */}
                {activeTab === 'notifications' && (
                  <div className="space-y-3">
                    <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between gap-3">
                      <div>
                        <h5 className="text-xs font-semibold text-white">New Lead & Inquiry Alerts</h5>
                        <p className="text-[11px] text-gray-400 mt-0.5">Receive instant email when a client submits a project quote</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setNotifyLeads(!notifyLeads)}
                        className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                          notifyLeads ? 'bg-brand-red' : 'bg-white/20'
                        }`}
                      >
                        <span className={`block w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                          notifyLeads ? 'left-6' : 'left-1'
                        }`} />
                      </button>
                    </div>

                    <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between gap-3">
                      <div>
                        <h5 className="text-xs font-semibold text-white">Project Status Updates</h5>
                        <p className="text-[11px] text-gray-400 mt-0.5">Notifications when video edits or media rendering finishes</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setNotifyProjects(!notifyProjects)}
                        className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                          notifyProjects ? 'bg-brand-red' : 'bg-white/20'
                        }`}
                      >
                        <span className={`block w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                          notifyProjects ? 'left-6' : 'left-1'
                        }`} />
                      </button>
                    </div>

                    <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between gap-3">
                      <div>
                        <h5 className="text-xs font-semibold text-white">Interface Audio Effects</h5>
                        <p className="text-[11px] text-gray-400 mt-0.5">Play subtle audio feedback on button interactions</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSoundEffects(!soundEffects)}
                        className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                          soundEffects ? 'bg-brand-red' : 'bg-white/20'
                        }`}
                      >
                        <span className={`block w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                          soundEffects ? 'left-6' : 'left-1'
                        }`} />
                      </button>
                    </div>

                    <div className="p-3.5 rounded-xl bg-black/40 border border-white/5 flex items-center justify-between gap-3">
                      <div>
                        <h5 className="text-xs font-semibold text-white">Agency Newsletter & Feature Releases</h5>
                        <p className="text-[11px] text-gray-400 mt-0.5">Monthly product updates and video production tips</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setNotifyMarketing(!notifyMarketing)}
                        className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                          notifyMarketing ? 'bg-brand-red' : 'bg-white/20'
                        }`}
                      >
                        <span className={`block w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${
                          notifyMarketing ? 'left-6' : 'left-1'
                        }`} />
                      </button>
                    </div>
                  </div>
                )}

              </div>

              {/* Bottom Footer Action Controls */}
              <div className="px-6 py-4 bg-black/60 border-t border-white/10 flex items-center justify-between gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onLogout();
                  }}
                  className="px-4 py-2.5 rounded-xl bg-red-600/10 hover:bg-red-600/20 border border-red-500/30 text-red-400 hover:text-red-200 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Log Out</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 text-xs font-semibold transition-all cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="px-5 py-2.5 rounded-xl bg-brand-red hover:bg-red-600 disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-brand-red/30 active:scale-[0.99]"
                  >
                    {isSaving ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Save Settings</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-gray-400">
              No active user session detected. Please sign in to access settings.
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
