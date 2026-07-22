import React, { useState, useEffect } from 'react';
import { X, Sparkles, User, Lock, Mail, Building, Key } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

declare global {
  interface Window {
    google?: any;
  }
}

export const AuthModal: React.FC = () => {
  const { authModalOpen, authModalMode, closeAuthModal, login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(authModalMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('Computer Science');
  const [role, setRole] = useState<'student' | 'organizer'>('student');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

  useEffect(() => {
    setMode(authModalMode);
  }, [authModalMode]);

  useEffect(() => {
    if (authModalOpen && googleClientId && window.google) {
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
  }, [authModalOpen, googleClientId]);

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
        await login(email, password);
      } else {
        await register({ name, email, password, role, department });
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during authentication');
    } finally {
      setLoading(false);
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
          {/* Modal Header */}
          <div className="p-6 pb-4 bg-gradient-to-b from-blue-50/80 to-white dark:from-slate-800/80 dark:to-[#0f172a] text-center border-b border-slate-100 dark:border-slate-800">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto mb-3 shadow-lg shadow-blue-600/30">
              <Sparkles className="w-6 h-6 text-amber-300 fill-amber-300" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white font-heading">
              {mode === 'login' ? 'Welcome Back!' : 'Join DiGi Campus'}
            </h2>
            <p className="text-xs font-medium text-slate-600 dark:text-slate-300 mt-1">
              {mode === 'login' ? 'Sign in to access your event passes & RSVPs' : 'Create an account to register & host campus events'}
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
              {loading ? 'Processing...' : mode === 'login' ? 'Sign In to Portal' : 'Create Account'}
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
        </div>
      </div>
    </div>
  );
};
