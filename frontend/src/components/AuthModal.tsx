import React, { useState, useEffect } from 'react';
import { X, Sparkles, User, Lock, Mail, Building, Key, ShieldCheck, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

declare global {
  interface Window {
    google?: any;
  }
}

export const AuthModal: React.FC = () => {
  const { authModalOpen, authModalMode, closeAuthModal, login, register, verifyOtp } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(authModalMode);
  const [step, setStep] = useState<'auth' | 'otp'>('auth');
  
  // Registration / Login Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('Computer Science');
  const [role, setRole] = useState<'student' | 'organizer'>('student');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // OTP Verification State
  const [otpUserId, setOtpUserId] = useState('');
  const [otpEmail, setOtpEmail] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMsg, setResendMsg] = useState('');

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

  useEffect(() => {
    setMode(authModalMode);
    setStep('auth');
    setError('');
  }, [authModalMode, authModalOpen]);

  useEffect(() => {
    if (authModalOpen && step === 'auth' && googleClientId && window.google) {
      try {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleGoogleResponse
        });

        const btnDiv = document.getElementById('googleBtnContainer');
        if (btnDiv) {
          window.google.accounts.id.renderButton(btnDiv, {
            theme: 'outline',
            size: 'large',
            width: '320',
            text: 'continue_with'
          });
        }
      } catch (err) {
        console.error('Google ID initialize error', err);
      }
    }
  }, [authModalOpen, step, googleClientId]);

  if (!authModalOpen) return null;

  const handleGoogleResponse = async (response: any) => {
    setError('');
    setLoading(true);
    try {
      const base64Url = response.credential.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
      const payload = JSON.parse(jsonPayload);

      await api.loginWithGoogle({
        email: payload.email,
        name: payload.name,
        avatar: payload.picture,
        department: 'Computer Science'
      });

      window.location.reload();
    } catch (err: any) {
      setError(err.message || 'Google sign in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        try {
          await login(email, password);
        } catch (loginErr: any) {
          if (loginErr.message && loginErr.message.includes('not verified')) {
            // Unverified email requiring OTP
            const resData = await api.login(email, password).catch(err => err);
            if (resData.userId) {
              setOtpUserId(resData.userId);
              setOtpEmail(resData.email || email);
              setStep('otp');
              return;
            }
          }
          throw loginErr;
        }
      } else {
        const result = await register({ name, email, password, role, department });
        if (result && result.requiresOtp) {
          setOtpUserId(result.userId || '');
          setOtpEmail(result.email || email);
          setStep('otp');
          setError('');
          return;
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpInput || otpInput.trim().length !== 6) {
      setError('Please enter a valid 6-digit OTP code');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await verifyOtp(otpUserId, otpInput.trim());
      alert('🎉 Email verified successfully! Welcome to DiGi Campus (+150 XP Bonus Awarded)');
    } catch (err: any) {
      setError(err.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!otpUserId) return;
    setResendLoading(true);
    setResendMsg('');
    setError('');
    try {
      const res = await api.resendOtp(otpUserId);
      setResendMsg(res.message || 'New OTP sent to email');
      setTimeout(() => setResendMsg(''), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to resend OTP');
    } finally {
      setResendLoading(false);
    }
  };

  const handleDemoStudent = async () => {
    setError('');
    setEmail('alex.rivera@digicampus.edu');
    setPassword('password123');
    setLoading(true);
    try {
      await login('alex.rivera@digicampus.edu', 'password123');
    } catch (err: any) {
      try {
        await login('alex.rivera@campuspulse.edu', 'password123');
      } catch (innerErr: any) {
        setError(innerErr.message || 'Demo account error. Make sure backend server is running on http://localhost:5000');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAdmin = async () => {
    setError('');
    setEmail('mr.sankya@digicampus.edu');
    setPassword('Mr.sankya@123');
    setLoading(true);
    try {
      await login('mr.sankya@digicampus.edu', 'Mr.sankya@123');
    } catch (err: any) {
      try {
        await login('mr.sankya@campuspulse.edu', 'Mr.sankya@123');
      } catch (innerErr: any) {
        setError(innerErr.message || 'Demo account error. Make sure backend server is running on http://localhost:5000');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
      <div className="bg-white dark:bg-[#0f172a] text-slate-900 dark:text-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden relative max-h-[90vh] flex flex-col transition-colors">
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          aria-label="Close Auth Modal"
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Scrollable Container */}
        <div className="overflow-y-auto flex-1">
          {step === 'otp' ? (
            /* STEP 2: Email OTP Verification Screen */
            <div className="p-8 space-y-6 text-center animate-fade-in">
              <div className="w-16 h-16 rounded-3xl bg-blue-600/10 text-blue-600 border border-blue-200 dark:border-blue-800 flex items-center justify-center mx-auto shadow-md">
                <ShieldCheck className="w-8 h-8 animate-pulse text-blue-600 dark:text-blue-400" />
              </div>

              <div className="space-y-1">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white font-heading">
                  Verify Email OTP
                </h2>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Enter the 6-digit verification code sent to
                </p>
                <p className="text-xs font-black font-mono text-blue-600 dark:text-blue-400">
                  {otpEmail}
                </p>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-xs font-bold border border-rose-200 dark:border-rose-800">
                  {error}
                </div>
              )}

              {resendMsg && (
                <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800">
                  {resendMsg}
                </div>
              )}

              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <label className="block text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                    6-Digit Security Code
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    placeholder="123456"
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                    className="w-full py-3 px-4 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-2xl text-2xl font-black font-mono tracking-[10px] text-center text-slate-900 dark:text-white focus:outline-none focus:border-blue-600"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || otpInput.length !== 6}
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-lg hover:shadow-blue-500/25 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {loading ? 'Verifying OTP Code...' : 'Verify Email & Activate Account'}
                </button>
              </form>

              <div className="pt-2 flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={() => setStep('auth')}
                  className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-bold"
                >
                  ← Back to Sign In
                </button>

                <button
                  type="button"
                  disabled={resendLoading}
                  onClick={handleResendOtp}
                  className="text-blue-600 dark:text-blue-400 font-extrabold flex items-center gap-1 hover:underline cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${resendLoading ? 'animate-spin' : ''}`} />
                  <span>Resend Code</span>
                </button>
              </div>
            </div>
          ) : (
            /* STEP 1: Login / Register Form */
            <>
              {/* Modal Header */}
              <div className="p-6 pb-4 bg-gradient-to-b from-blue-50/80 to-white dark:from-slate-800/80 dark:to-[#0f172a] text-center border-b border-slate-100 dark:border-slate-800">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto mb-3 shadow-lg shadow-blue-600/30">
                  <Sparkles className="w-6 h-6 text-amber-300 fill-amber-300" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white font-heading">
                  {mode === 'login' ? 'Welcome Back!' : 'Join DiGi Campus'}
                </h2>
                <p className="text-xs font-medium text-slate-600 dark:text-slate-300 mt-1">
                  {mode === 'login' ? 'Sign in to access your event passes & RSVPs' : 'Create an account with email OTP verification'}
                </p>

                {/* High-Contrast Mode Switcher Pills */}
                <div className="flex bg-slate-200/80 dark:bg-slate-800 p-1.5 rounded-2xl mt-4 border border-slate-300/50 dark:border-slate-700/50">
                  <button
                    type="button"
                    onClick={() => { setMode('login'); setError(''); }}
                    className={`flex-1 py-2 text-xs font-black rounded-xl transition-all ${
                      mode === 'login'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => { setMode('register'); setError(''); }}
                    className={`flex-1 py-2 text-xs font-black rounded-xl transition-all ${
                      mode === 'register'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Register
                  </button>
                </div>
              </div>

              {/* Form Body */}
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {error && (
                  <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-xs font-bold border border-rose-200 dark:border-rose-800">
                    {error}
                  </div>
                )}

                {/* Official Google Sign-In Render Container */}
                <div className="flex flex-col items-center justify-center space-y-2">
                  <div id="googleBtnContainer" className="flex justify-center min-h-[44px]"></div>
                </div>

                <div className="flex items-center my-2">
                  <div className="flex-1 border-t border-slate-200 dark:border-slate-800" />
                  <span className="px-3 text-[10px] uppercase text-slate-500 dark:text-slate-400 font-extrabold tracking-wider">Or with Email</span>
                  <div className="flex-1 border-t border-slate-200 dark:border-slate-800" />
                </div>

                {mode === 'register' && (
                  <>
                    <div>
                      <label htmlFor="auth-name" className="block text-xs font-extrabold text-slate-900 dark:text-slate-200 mb-1">Full Name</label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          id="auth-name"
                          type="text"
                          required
                          placeholder="e.g. Mr. Sankya"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full pl-10 pr-3 py-2.5 bg-slate-100 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold focus:outline-none focus:border-blue-600 text-slate-900 dark:text-white placeholder-slate-400"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="auth-dept" className="block text-xs font-extrabold text-slate-900 dark:text-slate-200 mb-1">Department</label>
                      <div className="relative">
                        <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <select
                          id="auth-dept"
                          value={department}
                          onChange={(e) => setDepartment(e.target.value)}
                          className="w-full pl-10 pr-3 py-2.5 bg-slate-100 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold focus:outline-none focus:border-blue-600 text-slate-900 dark:text-white"
                        >
                          <option value="Computer Science">Computer Science & AI</option>
                          <option value="Information Technology">Information Technology</option>
                          <option value="Electronics & Telecom">Electronics & Telecom</option>
                          <option value="Mechanical Engineering">Mechanical Engineering</option>
                          <option value="Business & Management">Business & Management</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-extrabold text-slate-900 dark:text-slate-200 mb-1">Role</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setRole('student')}
                          className={`py-2 px-3 text-xs font-extrabold rounded-xl border transition-all ${
                            role === 'student'
                              ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 shadow-xs'
                              : 'border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          Student
                        </button>
                        <button
                          type="button"
                          onClick={() => setRole('organizer')}
                          className={`py-2 px-3 text-xs font-extrabold rounded-xl border transition-all ${
                            role === 'organizer'
                              ? 'border-blue-600 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 shadow-xs'
                              : 'border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                          }`}
                        >
                          Event Organizer
                        </button>
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label htmlFor="auth-email" className="block text-xs font-extrabold text-slate-900 dark:text-slate-200 mb-1">Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="auth-email"
                      type="email"
                      required
                      placeholder="mr.sankya@digicampus.edu"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 bg-slate-100 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold focus:outline-none focus:border-blue-600 text-slate-900 dark:text-white placeholder-slate-400"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="auth-password" className="block text-xs font-extrabold text-slate-900 dark:text-slate-200 mb-1">Password</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="auth-password"
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 bg-slate-100 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold focus:outline-none focus:border-blue-600 text-slate-900 dark:text-white placeholder-slate-400"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-lg hover:shadow-blue-500/25 transition-all disabled:opacity-50 mt-2 cursor-pointer"
                >
                  {loading ? 'Processing...' : mode === 'login' ? 'Sign In to Portal' : 'Send Email Verification OTP'}
                </button>
              </form>

              {/* Quick Demo Login Preset Buttons */}
              <div className="p-4 bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 text-center">
                <p className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-center gap-1">
                  <Key className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> Quick Demo Logins
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleDemoStudent}
                    disabled={loading}
                    className="py-2 px-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white hover:border-blue-600 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                  >
                    🎓 Student Demo
                  </button>
                  <button
                    type="button"
                    onClick={handleDemoAdmin}
                    disabled={loading}
                    className="py-2 px-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white hover:border-blue-600 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                  >
                    ⚡ Admin (Mr. Sankya)
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
