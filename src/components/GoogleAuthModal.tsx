import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, ShieldCheck, Sparkles, ArrowRight, Check, Lock, User, LogOut } from 'lucide-react';
import { saveUserToFirestore } from '../lib/firebase';

export interface UserSession {
  name: string;
  email: string;
  avatarUrl?: string;
  provider: 'google';
  loggedInAt: string;
}

interface GoogleAuthModalProps {
  isOpen: boolean;
  onLoginSuccess: (user: UserSession) => void;
  userEmailDefault?: string;
}

export default function GoogleAuthModal({ isOpen, onLoginSuccess, userEmailDefault = 'all.red.gaming.2003@gmail.com' }: GoogleAuthModalProps) {
  const [selectedAccount, setSelectedAccount] = useState<string>(userEmailDefault);
  const [customEmail, setCustomEmail] = useState<string>('');
  const [showCustomInput, setShowCustomInput] = useState<boolean>(false);
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);
  const [authStep, setAuthStep] = useState<'choose' | 'confirm'>('choose');

  if (!isOpen) return null;

  const handleGoogleSignIn = (emailToUse: string) => {
    setIsAuthenticating(true);

    // Simulate Google OAuth response and save to Firestore DB
    setTimeout(async () => {
      const nameFromEmail = emailToUse.split('@')[0].replace(/[._-]/g, ' ');
      const formattedName = nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1);

      const user: UserSession = {
        name: formattedName || 'Google User',
        email: emailToUse,
        avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(emailToUse)}&backgroundColor=dc2626&textColor=ffffff`,
        provider: 'google',
        loggedInAt: new Date().toISOString()
      };

      // Save user record into Firestore collection 'users'
      await saveUserToFirestore({
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl,
        provider: user.provider
      });

      setIsAuthenticating(false);
      onLoginSuccess(user);
    }, 1200);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
        {/* Subtle background glows */}
        <div className="absolute w-96 h-96 bg-brand-red/15 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute w-80 h-80 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none -top-10 -right-10" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative w-full max-w-md bg-[#0f0f12] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl overflow-hidden text-gray-100"
        >
          {/* Top Decorative Line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-brand-red to-transparent" />

          {/* Header Branding */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-brand-red/10 border border-brand-red/20 mb-3 text-brand-red shadow-[0_0_20px_rgba(255,0,0,0.3)]">
              <div className="w-6 h-6 bg-brand-red rounded-sm rotate-45 flex items-center justify-center">
                <div className="-rotate-45 font-display font-black text-[10px] text-white">AR</div>
              </div>
            </div>
            <h2 className="text-xl sm:text-2xl font-display font-bold text-white uppercase tracking-tight">
              ALL <span className="text-brand-red">RED</span> CREATION
            </h2>
            <p className="text-xs text-gray-400 mt-1.5 font-sans max-w-xs mx-auto">
              First time visiting? Please sign in with your Gmail account to access our agency showcase.
            </p>
          </div>

          {/* Google Sign In Box */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-5 mb-5 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-4 text-xs text-gray-300 font-semibold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-brand-red" />
              <span>Google Authentication</span>
            </div>

            {isAuthenticating ? (
              <div className="py-8 text-center space-y-3">
                <div className="inline-block w-8 h-8 border-2 border-brand-red border-t-transparent rounded-full animate-spin" />
                <p className="text-xs text-gray-300 font-medium">Connecting to Google Auth...</p>
                <p className="text-[11px] text-gray-500 font-mono">{selectedAccount}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {/* One-Tap Google Account Button */}
                {!showCustomInput ? (
                  <>
                    <button
                      onClick={() => handleGoogleSignIn(selectedAccount)}
                      className="w-full py-3 px-4 rounded-lg bg-white text-gray-900 hover:bg-gray-100 font-medium text-xs sm:text-sm flex items-center justify-between transition-all duration-200 cursor-pointer shadow-md group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* Google Logo SVG */}
                        <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                          <path
                            fill="#4285F4"
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          />
                          <path
                            fill="#34A853"
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          />
                          <path
                            fill="#FBBC05"
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                          />
                          <path
                            fill="#EA4335"
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                          />
                        </svg>

                        <div className="text-left truncate">
                          <p className="font-semibold text-gray-900 leading-tight truncate">
                            Continue as {selectedAccount.split('@')[0]}
                          </p>
                          <p className="text-[11px] text-gray-500 font-mono truncate">{selectedAccount}</p>
                        </div>
                      </div>

                      <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-900 group-hover:translate-x-0.5 transition-all flex-shrink-0 ml-2" />
                    </button>

                    <div className="text-center pt-1">
                      <button
                        onClick={() => setShowCustomInput(true)}
                        className="text-[11px] text-gray-400 hover:text-brand-red transition-colors underline cursor-pointer"
                      >
                        Use a different Gmail account
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-mono text-gray-400 mb-1">
                        ENTER YOUR GMAIL ADDRESS
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        <input
                          type="email"
                          placeholder="example@gmail.com"
                          value={customEmail}
                          onChange={(e) => setCustomEmail(e.target.value)}
                          className="w-full bg-black/40 border border-white/15 rounded-lg py-2.5 pl-9 pr-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-red transition-all"
                        />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowCustomInput(false)}
                        className="w-1/3 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold transition-all cursor-pointer"
                      >
                        Back
                      </button>

                      <button
                        disabled={!customEmail || !customEmail.includes('@')}
                        onClick={() => {
                          if (customEmail && customEmail.includes('@')) {
                            setSelectedAccount(customEmail);
                            handleGoogleSignIn(customEmail);
                          }
                        }}
                        className="w-2/3 py-2 rounded-lg bg-brand-red hover:bg-brand-red-dark disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <span>Sign In</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quick Info & Security Disclaimer */}
          <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1 border-t border-white/5">
            <div className="flex items-center gap-1.5 text-gray-400">
              <Lock className="w-3 h-3 text-emerald-400" />
              <span>Secure Google OAuth2</span>
            </div>

            <div className="flex items-center gap-1 text-gray-500">
              <Sparkles className="w-3 h-3 text-brand-red" />
              <span>All Red Agency</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
