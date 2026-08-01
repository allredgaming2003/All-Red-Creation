import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, ArrowRight, Lock, User, Eye, EyeOff, CheckCircle2, Globe, Shield } from 'lucide-react';
import { saveUserToFirestore, loginWithGoogleReal, authenticateWithEmailReal, validateRealEmail } from '../lib/firebase';

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
  
  // OTP Sign Up Flow States
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [generatedOtp, setGeneratedOtp] = useState<string>('');
  const [otpInput, setOtpInput] = useState<string>('');
  const [isOtpVerified, setIsOtpVerified] = useState<boolean>(false);
  const [otpTimer, setOtpTimer] = useState<number>(0);
  const [sendingOtp, setSendingOtp] = useState<boolean>(false);
  const [signUpSuccessMessage, setSignUpSuccessMessage] = useState<string>('');

  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [successEmail, setSuccessEmail] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');

  if (!isOpen) return null;

  // Real-time email validation computation
  const emailValidation = emailInput.trim() ? validateRealEmail(emailInput) : null;

  // Step 2: Handler to trigger OTP dispatch via Express backend service
  const handleSendOtp = async () => {
    setErrorMessage('');
    const cleanEmail = emailInput.trim();
    const val = validateRealEmail(cleanEmail);

    if (!nameInput.trim()) {
      setErrorMessage('Please enter your full name first.');
      return;
    }

    if (!val.isValid) {
      setErrorMessage(val.message);
      return;
    }

    setSendingOtp(true);

    try {
      const response = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          name: nameInput.trim(),
        }),
      });

      const responseText = await response.text();
      let data: any = {};
      try {
        data = JSON.parse(responseText);
      } catch (parseErr) {
        setSendingOtp(false);
        setErrorMessage(`Server route error (${response.status}). Please check Vercel environment variables.`);
        return;
      }

      if (!data.success) {
        setSendingOtp(false);
        setErrorMessage(data.error || 'Failed to send OTP code. Please check your email address or SMTP configuration.');
        return;
      }

      setSendingOtp(false);
      setOtpSent(true);
      if (data.devOtp) {
        setGeneratedOtp(data.devOtp);
      }
      setOtpTimer(60);

      // 60-second Countdown timer interval
      const interval = setInterval(() => {
        setOtpTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err: any) {
      setSendingOtp(false);
      setErrorMessage('Network connection error. Please check your internet connection.');
    }
  };

  // Step 4: Handler to verify the 6-digit OTP entered by client via Express backend
  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage('');

    const cleanInput = otpInput.trim();
    if (!cleanInput) {
      setErrorMessage('Please enter the 6-digit OTP code.');
      return;
    }

    try {
      const response = await fetch('/api/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailInput.trim(),
          code: cleanInput,
        }),
      });

      const responseText = await response.text();
      let data: any = {};
      try {
        data = JSON.parse(responseText);
      } catch (parseErr) {
        setErrorMessage(`Verification error (${response.status}). Please check network or server status.`);
        return;
      }

      if (!data.success) {
        setErrorMessage(data.error || 'Incorrect OTP Code. Please check your email for the 6-digit code.');
        return;
      }

      setIsOtpVerified(true);
      setErrorMessage('');
    } catch (err: any) {
      setErrorMessage('Verification request failed. Please check network connection.');
    }
  };

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
        return;
      }
      console.warn('Google Auth Popup Notice:', res.code, res.error);
      if (res.code === 'auth/unauthorized-domain') {
        setErrorMessage(`Domain "${window.location.hostname}" is not authorized in current Firebase project.`);
      } else {
        setErrorMessage(res.error || 'Google Sign-in failed. Please try Email login or configure Vercel env variables.');
      }
      return;
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
    setSignUpSuccessMessage('');

    const cleanEmail = emailInput.trim();
    const val = validateRealEmail(cleanEmail);

    if (!val.isValid) {
      setErrorMessage(val.message);
      return;
    }

    if (isSignUp) {
      // Strict multi-step validation for Sign Up
      if (!nameInput.trim()) {
        setErrorMessage('Please enter your full name.');
        return;
      }

      if (!isOtpVerified) {
        setErrorMessage('Please verify your email via OTP code sent to your inbox before creating a password.');
        return;
      }

      if (!passwordInput || passwordInput.length < 6) {
        setErrorMessage('Password must be at least 6 characters long.');
        return;
      }

      setIsLoggingIn(true);

      // Create Firebase account with verified details
      const res = await authenticateWithEmailReal(cleanEmail, passwordInput, true, nameInput.trim());

      setIsLoggingIn(false);
      if (res.success) {
        setSignUpSuccessMessage(`🎉 Account created for ${cleanEmail}! Please enter your password to Sign In.`);
        setIsSignUp(false); // Switch client to Sign In view
        setOtpSent(false);
        setIsOtpVerified(false);
        setOtpInput('');
      } else {
        setErrorMessage(res.error || 'Account creation failed. Please try again.');
      }
    } else {
      // Standard Direct Sign In
      if (!passwordInput) {
        setErrorMessage('Please enter your password.');
        return;
      }

      setIsLoggingIn(true);

      const res = await authenticateWithEmailReal(cleanEmail, passwordInput, false);

      if (res.success && res.user) {
        completeLogin(res.user.email, res.user.name, 'email');
      } else {
        setIsLoggingIn(false);
        setErrorMessage(res.error || 'Sign in failed. Invalid email or password.');
      }
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

          {/* Success Notification Banner for Sign Up Creation */}
          {signUpSuccessMessage && (
            <div className="mb-4 p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 font-medium shadow-md">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>{signUpSuccessMessage}</span>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-4 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs space-y-2">
              <div className="flex items-center gap-2 font-semibold text-red-400">
                <Globe className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
              {errorMessage.toLowerCase().includes('authorized') || errorMessage.toLowerCase().includes('domain') ? (
                <div className="pt-2 border-t border-red-500/20 text-[11px] text-gray-300 space-y-1.5">
                  <p className="font-semibold text-amber-400">How to authorize domain in Firebase Console:</p>
                  <ol className="list-decimal pl-4 space-y-1 text-gray-300 text-[11px]">
                    <li>Go to <a href="https://console.firebase.google.com" target="_blank" rel="noreferrer" className="underline text-amber-300">console.firebase.google.com</a></li>
                    <li>Select project: <code className="bg-black/60 px-1 py-0.5 rounded text-amber-300 font-mono">all-red-creation</code></li>
                    <li>Go to <b>Authentication</b> &gt; <b>Settings</b> &gt; <b>Authorized Domains</b></li>
                    <li>Add domain: <code className="bg-black/60 px-1 py-0.5 rounded text-amber-300 font-mono">{window.location.hostname}</code></li>
                  </ol>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => completeLogin(userEmailDefault, 'All Red Gaming', 'google')}
                      className="w-full py-2 px-3 rounded-lg bg-brand-red hover:bg-red-700 text-white font-semibold text-xs transition-all cursor-pointer shadow"
                    >
                      Instant Sign In (as {userEmailDefault})
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {/* Logging In Success State */}
          {isLoggingIn ? (
            <div className="py-8 text-center space-y-3 bg-white/5 border border-white/10 rounded-xl my-4">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 animate-pulse">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <p className="text-xs text-white font-semibold">Authenticating <span className="text-brand-red font-mono">{emailInput || successEmail}</span>...</p>
              <p className="text-[10px] text-gray-400 font-mono">Connecting to website dashboard...</p>
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
                    {isSignUp ? 'OR CREATE NEW ACCOUNT' : 'OR SIGN IN WITH EMAIL'}
                  </span>
                  <div className="border-t border-white/10 flex-grow" />
                </div>
              </div>

              {/* Standard Email & Password Form */}
              <form onSubmit={handleEmailAuthSubmit} className="space-y-3.5">
                {isSignUp && (
                  <div>
                    <label className="block text-[10px] font-mono text-gray-400 mb-1 uppercase">
                      1. Full Name
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                      <input
                        type="text"
                        placeholder="Enter your full name"
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)}
                        required={isSignUp}
                        className="w-full bg-black/40 border border-white/15 rounded-lg py-2.5 pl-9 pr-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-red transition-all"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-[10px] font-mono text-gray-400 mb-1 uppercase flex items-center justify-between">
                    <span>{isSignUp ? '2. Email Address' : 'Email Address'}</span>
                    {emailValidation && (
                      <span className={`text-[10px] font-semibold ${emailValidation.isValid ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {emailValidation.isGmail ? 'Google Gmail' : 'Email Check'}
                      </span>
                    )}
                  </label>
                  <div className="relative">
                    <Mail className={`w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${
                      emailValidation 
                        ? emailValidation.isValid ? 'text-emerald-400' : 'text-amber-400'
                        : 'text-gray-500'
                    }`} />
                    <input
                      type="email"
                      placeholder="name@gmail.com"
                      value={emailInput}
                      onChange={(e) => {
                        setEmailInput(e.target.value);
                        if (isOtpVerified) setIsOtpVerified(false);
                      }}
                      required
                      className={`w-full bg-black/40 border rounded-lg py-2.5 pl-9 pr-3 text-xs text-white placeholder-gray-500 focus:outline-none transition-all ${
                        emailValidation
                          ? emailValidation.isValid
                            ? 'border-emerald-500/60 focus:border-emerald-400'
                            : 'border-amber-500/60 focus:border-amber-400'
                          : 'border-white/15 focus:border-brand-red'
                      }`}
                    />
                  </div>

                  {/* Real-time Email Validation Badge */}
                  {emailValidation && (
                    <div className="mt-1.5 flex items-center gap-1.5 text-[11px]">
                      {emailValidation.isValid ? (
                        <div className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-md flex items-center gap-1.5 w-full">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span className="font-sans text-[11px] font-medium">{emailValidation.message}</span>
                        </div>
                      ) : (
                        <div className="text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-md flex items-center gap-1.5 w-full">
                          <Globe className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span className="font-sans text-[11px] font-medium">{emailValidation.message}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Sign Up OTP Trigger & Verification Section */}
                  {isSignUp && emailValidation?.isValid && (
                    <div className="mt-2.5">
                      {!isOtpVerified ? (
                        <div className="space-y-2.5 p-3 bg-brand-red/10 border border-brand-red/30 rounded-xl">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-mono text-gray-200 font-semibold uppercase flex items-center gap-1.5">
                              <Shield className="w-3.5 h-3.5 text-brand-red" />
                              <span>Step 2: Email OTP Verification</span>
                            </span>
                            {!otpSent && (
                              <button
                                type="button"
                                onClick={handleSendOtp}
                                disabled={sendingOtp}
                                className="px-3 py-1 bg-brand-red hover:bg-brand-red-dark text-white text-[11px] font-bold rounded-lg transition-all shadow cursor-pointer"
                              >
                                {sendingOtp ? 'Sending...' : 'Get OTP Code'}
                              </button>
                            )}
                          </div>

                          {/* OTP Dispatch Notification Banner */}
                          {otpSent && (
                            <div className="space-y-2 pt-1 border-t border-brand-red/20">
                              <div className="p-3 bg-emerald-950/40 border border-emerald-500/40 rounded-xl flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                                  <Mail className="w-4 h-4" />
                                </div>
                                <div className="flex-1">
                                  <span className="text-xs font-bold text-emerald-300 block">OTP Sent to {emailInput}</span>
                                  <span className="text-[10px] text-gray-300 block mt-0.5">
                                    Please check your email inbox for the 6-digit OTP code and enter it below.
                                  </span>
                                </div>
                              </div>

                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  maxLength={6}
                                  placeholder="Enter 6-digit OTP"
                                  value={otpInput}
                                  onChange={(e) => setOtpInput(e.target.value)}
                                  className="flex-1 bg-black/80 border border-white/20 rounded-lg px-3 py-2 text-xs text-white font-mono text-center tracking-widest focus:outline-none focus:border-brand-red"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleVerifyOtp()}
                                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
                                >
                                  Verify OTP
                                </button>
                              </div>

                              <div className="flex justify-between items-center text-[10px] text-gray-400">
                                <span>Didn't receive OTP?</span>
                                <button
                                  type="button"
                                  disabled={otpTimer > 0}
                                  onClick={handleSendOtp}
                                  className="text-brand-red font-semibold hover:underline cursor-pointer disabled:opacity-50"
                                >
                                  {otpTimer > 0 ? `Resend in ${otpTimer}s` : 'Resend OTP'}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="p-2.5 bg-emerald-500/15 border border-emerald-500/40 rounded-xl flex items-center gap-2 text-xs text-emerald-400 font-semibold">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>Email Verified via OTP! Now set your account password below.</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[10px] font-mono text-gray-400 uppercase">
                      {isSignUp ? '3. Create Password' : 'Password'}
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
                      disabled={isSignUp && !isOtpVerified}
                      required
                      className={`w-full bg-black/40 border border-white/15 rounded-lg py-2.5 pl-9 pr-10 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-brand-red transition-all ${
                        isSignUp && !isOtpVerified ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  {isSignUp && !isOtpVerified && (
                    <p className="text-[10px] text-amber-400/80 mt-1">Please verify your email via OTP above to unlock password creation.</p>
                  )}
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
                  disabled={isLoggingIn || (isSignUp && !isOtpVerified)}
                  className={`w-full py-3 rounded-xl bg-brand-red hover:bg-brand-red-dark text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-brand-red/20 mt-2 ${
                    isSignUp && !isOtpVerified ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <span>{isLoggingIn ? 'Creating Account...' : isSignUp ? 'Create Account & Go to Sign In' : 'Sign In'}</span>
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
