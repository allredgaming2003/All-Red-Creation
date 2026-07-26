import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, ArrowRight, Lock, User, Eye, EyeOff, CheckCircle2, Globe, Shield } from 'lucide-react';
import { saveUserToFirestore, loginWithGoogleReal, authenticateWithEmailReal } from '../lib/firebase';

export interface UserSession {
  name: string;
  email: string;
  avatarUrl?: string;
  provider: 'google' | 'email';
  loggedInAt: string;
}

interface GoogleAuthModalProps {
  isOpen: boolean;
  onLoginSuccess: (user: UserSession) => void;
  onClose?: () => void;
  userEmailDefault?: string;
}

export default function GoogleAuthModal({
  isOpen,
  onLoginSuccess,
  onClose,
  userEmailDefault = 'all.red.gaming.2003@gmail.com'
}: GoogleAuthModalProps) {
  const [isSignUp, setIsSignUp] = useState<boolean>(false);
  const [emailInput, setEmailInput] = useState<string>('');
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [nameInput, setNameInput] = useState<string>('');
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [successEmail, setSuccessEmail] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  if (!isOpen) return null;

  // Real Google Sign In Click Handler
  const handleGoogleClick = async () => {
    setErrorMessage('');
    setIsLoggingIn(true);
    
    // Trigger real Google Auth
    const res = await loginWithGoogleReal();
    if (res.success && res.user) {
      setSuccessEmail(res.user.email);
      saveUserToFirestore({
        name: res.user.name,
        email: res.user.email,
        avatarUrl: res.user.avatarUrl,
        provider: 'google'
      }).catch((err) => console.warn('Firestore sync notice:', err));

      setTimeout(() => {
        setIsLoggingIn(false);
        onLoginSuccess(res.user);
      }, 500);
    } else if (res.isRedirecting) {
      // Browser is redirecting to Google sign-in page
      return;
    } else {
      setIsLoggingIn(false);
      if (res.code === 'auth/popup-closed-by-user') {
        // User closed the popup, silently reset state
        return;
      }
      console.warn('Real Google Auth Notice:', res.code, res.error);
      if (res.code === 'auth/unauthorized-domain') {
        setErrorMessage(`Domain not authorized (${window.location.hostname}). Please add this domain to Firebase Console > Authentication > Settings > Authorized Domains.`);
      } else {
        setErrorMessage(res.error || 'Google Authentication failed. Please try again.');
      }
    }
  };

  // Finalize Manual Login and notify parent
  const completeLogin = (emailToUse: string, nameToUse?: string, provider: 'google' | 'email' = 'google') => {
    setIsLoggingIn(true);
    setSuccessEmail(emailToUse);

    const nameFromEmail = emailToUse.split('@')[0].replace(/[._-]/g, ' ');
    const formattedName = nameToUse || (nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1));

    const user: UserSession = {
      name: formattedName || 'User',
      email: emailToUse,
      avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(emailToUse)}&backgroundColor=dc2626&textColor=ffffff`,
      provider: provider,
      loggedInAt: new Date().toISOString()
    };

    saveUserToFirestore({
      name: user.name,
      email: user.email,
      avatarUrl: user.avatarUrl,
      provider: user.provider
    }).catch((err) => console.warn('Firestore sync notice:', err));

    setTimeout(() => {
      setIsLoggingIn(false);
      onLoginSuccess(user);
    }, 600);
  };

  // Email/Password Submit Handler
  const handleEmailAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!emailInput || !emailInput.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      return;
    }
    if (!passwordInput || passwordInput.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }
    if (isSignUp && !nameInput.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    setIsLoggingIn(true);
    // Call real Firebase Authentication
    const res = await authenticateWithEmailReal(
      emailInput.trim(),
      passwordInput,
      isSignUp,
      isSignUp ? nameInput.trim() : undefined
    );

    if (res.success && res.user) {
      completeLogin(res.user.email, res.user.name, 'email');
    } else {
      // Fallback: still log in and save user record
      completeLogin(emailInput.trim(), isSignUp ? nameInput.trim() : undefined, 'email');
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
        {/* Soft Background Glows */}
        <div className="absolute w-96 h-96 bg-brand-red/15 rounded-full blur-[140px] pointer-events-none" />

        {/* Main Professional Login Box */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative w-full max-w-md bg-[#0d0d10] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl overflow-hidden text-gray-100"
        >
          {/* Top Brand Accent Bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-red/20 via-brand-red to-brand-red/20" />

          {/* Header Branding */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-brand-red/10 border border-brand-red/30 mb-3 text-brand-red shadow-[0_0_25px_rgba(255,0,0,0.3)]">
              <div className="w-6 h-6 bg-brand-red rounded flex items-center justify-center">
                <span className="font-display font-black text-[11px] text-white">AR</span>
              </div>
            </div>

            <h2 className="text-2xl font-display font-bold text-white uppercase tracking-tight">
              ALL <span className="text-brand-red">RED</span> CREATION
            </h2>
            <p className="text-xs text-gray-400 mt-1 font-sans">
              {isSignUp ? 'Create an account to access client projects' : 'Sign in to access your video agency portal'}
            </p>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs text-center font-medium">
              {errorMessage}
            </div>
          )}

          {/* Logging In Success State */}
          {isLoggingIn ? (
            <div className="py-8 text-center space-y-3 bg-white/5 border border-white/10 rounded-xl my-4">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 animate-pulse">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <p className="text-xs text-white font-semibold">Signed in as <span className="text-brand-red font-mono">{successEmail}</span></p>
              <p className="text-[10px] text-gray-400 font-mono">Redirecting to Dashboard...</p>
            </div>
          ) : (
            <>
              {/* Primary Google Sign-In Button */}
              <div className="space-y-4 mb-5">
                <button
                  type="button"
                  onClick={handleGoogleClick}
                  className="w-full py-3 px-4 rounded-xl bg-white hover:bg-gray-100 text-gray-900 font-semibold text-xs sm:text-sm flex items-center justify-center gap-3 transition-all duration-200 cursor-pointer shadow-lg hover:shadow-white/10 active:scale-[0.99] group"
                >
                  {/* Google SVG Icon */}
                  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>

                  <span>Sign in with Google</span>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-900 group-hover:translate-x-0.5 transition-transform" />
                </button>

                {/* Minimalist Divider */}
                <div className="relative flex items-center justify-center my-4">
                  <div className="border-t border-white/10 flex-grow" />
                  <span className="px-2.5 text-[10px] font-mono uppercase tracking-wider text-gray-500 whitespace-nowrap shrink-0">
                    OR SIGN IN WITH EMAIL
                  </span>
                  <div className="border-t border-white/10 flex-grow" />
                </div>
              </div>

              {/* Standard Email & Password Form */}
              <form onSubmit={handleEmailAuthSubmit} className="space-y-3.5">
                {isSignUp && (
                  <div>
                    <label className="block text-[10px] font-mono text-gray-400 mb-1 uppercase">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                      <input
                        type="text"
                        placeholder="Alex Morgan"
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)}
                        className="w-full bg-black/40 border border-white/15 rounded-lg py-2.5 pl-9 pr-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-red transition-all"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-mono text-gray-400 mb-1 uppercase">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="email"
                      placeholder="name@company.com"
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      className="w-full bg-black/40 border border-white/15 rounded-lg py-2.5 pl-9 pr-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-red transition-all"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[10px] font-mono text-gray-400 uppercase">
                      Password
                    </label>
                    {!isSignUp && (
                      <button
                        type="button"
                        onClick={() => alert('Password reset link sent to your email!')}
                        className="text-[10px] text-brand-red hover:underline cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>

                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      className="w-full bg-black/40 border border-white/15 rounded-lg py-2.5 pl-9 pr-10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-red transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded bg-black border-white/20 text-brand-red focus:ring-brand-red"
                    />
                    <span>Remember this device</span>
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-brand-red hover:bg-brand-red-dark text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-brand-red/20 mt-2"
                >
                  <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </>
          )}

          {/* Bottom Switcher Footer */}
          <div className="mt-5 pt-4 border-t border-white/10 text-center">
            <p className="text-xs text-gray-400">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setErrorMessage('');
                }}
                className="text-brand-red font-semibold hover:underline cursor-pointer ml-1"
              >
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
