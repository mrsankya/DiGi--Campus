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

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '269277017328-2arusrutp62kd4trujdgrmlse07mhs0c.apps.googleusercontent.com';

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
      // Decode JWT payload from Google credential
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-[#e1e2ed] overflow-hidden relative max-h-[90vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          aria-label="Close Auth Modal"
          className="absolute top-4 right-4 p-2 text-[#737686] hover:text-[#191b23] hover:bg-[#f3f3fe] rounded-full transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Scrollable Container */}
        <div className="overflow-y-auto flex-1">
          {/* Modal Header */}
          <div className="p-6 pb-4 bg-gradient-to-b from-[#eeefff] to-white text-center">
            <div className="w-12 h-12 rounded-2xl bg-[#004ac6] text-white flex items-center justify-center mx-auto mb-3 shadow-lg shadow-[#004ac6]/20">
              <Sparkles className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-black text-[#191b23]">
              {mode === 'login' ? 'Welcome Back!' : 'Join DiGi Campus'}
            </h2>
            <p className="text-xs text-[#434655] mt-1">
              {mode === 'login' ? 'Sign in to access your event passes & RSVPs' : 'Create an account to register & host campus events'}
            </p>

            {/* Mode Switcher */}
            <div className="flex bg-[#ededf9] p-1 rounded-xl mt-4">
              <button
                type="button"
                onClick={() => { setMode('login'); setError(''); }}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  mode === 'login' ? 'bg-white text-[#004ac6] shadow-sm' : 'text-[#737686]'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setMode('register'); setError(''); }}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  mode === 'register' ? 'bg-white text-[#004ac6] shadow-sm' : 'text-[#737686]'
                }`}
              >
                Register
              </button>
            </div>
          </div>

          {/* Form Body */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-[#ffdad6] text-[#93000a] text-xs font-medium border border-[#ffb4ab]">
                {error}
              </div>
            )}

            {/* Official Google Sign-In Render Container */}
            <div className="flex flex-col items-center justify-center space-y-2">
              <div id="googleBtnContainer" className="flex justify-center min-h-[44px]"></div>
            </div>

            <div className="flex items-center my-2">
              <div className="flex-1 border-t border-[#e1e2ed]" />
              <span className="px-2 text-[10px] uppercase text-[#737686] font-semibold">Or with Email</span>
              <div className="flex-1 border-t border-[#e1e2ed]" />
            </div>

            {mode === 'register' && (
              <>
                <div>
                  <label htmlFor="auth-name" className="block text-xs font-bold text-[#191b23] mb-1">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-[#737686] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      id="auth-name"
                      type="text"
                      required
                      placeholder="e.g. Mr. Sankya"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-[#f3f3fe] border border-transparent rounded-xl text-sm focus:outline-none focus:border-[#004ac6] focus:bg-white text-[#191b23]"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="auth-dept" className="block text-xs font-bold text-[#191b23] mb-1">Department</label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-[#737686] absolute left-3 top-1/2 -translate-y-1/2" />
                    <select
                      id="auth-dept"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-[#f3f3fe] border border-transparent rounded-xl text-sm focus:outline-none focus:border-[#004ac6] focus:bg-white text-[#191b23]"
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
                  <label className="block text-xs font-bold text-[#191b23] mb-1">Role</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRole('student')}
                      className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                        role === 'student' ? 'border-[#004ac6] bg-[#eeefff] text-[#004ac6]' : 'border-[#c3c6d7] text-[#434655]'
                      }`}
                    >
                      Student
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('organizer')}
                      className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                        role === 'organizer' ? 'border-[#004ac6] bg-[#eeefff] text-[#004ac6]' : 'border-[#c3c6d7] text-[#434655]'
                      }`}
                    >
                      Event Organizer
                    </button>
                  </div>
                </div>
              </>
            )}

            <div>
              <label htmlFor="auth-email" className="block text-xs font-bold text-[#191b23] mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#737686] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="auth-email"
                  type="email"
                  required
                  placeholder="mr.sankya@digicampus.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-[#f3f3fe] border border-transparent rounded-xl text-sm focus:outline-none focus:border-[#004ac6] focus:bg-white text-[#191b23]"
                />
              </div>
            </div>

            <div>
              <label htmlFor="auth-password" className="block text-xs font-bold text-[#191b23] mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#737686] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="auth-password"
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-[#f3f3fe] border border-transparent rounded-xl text-sm focus:outline-none focus:border-[#004ac6] focus:bg-white text-[#191b23]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-[#2563eb] hover:bg-[#004ac6] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-50 mt-2"
            >
              {loading ? 'Processing...' : mode === 'login' ? 'Sign In to Portal' : 'Create Account'}
            </button>
          </form>

          {/* Quick Demo Login Preset Buttons */}
          <div className="p-4 bg-[#f3f3fe] border-t border-[#e1e2ed] text-center">
            <p className="text-[11px] font-semibold text-[#737686] uppercase tracking-wider mb-2 flex items-center justify-center gap-1">
              <Key className="w-3 h-3 text-[#004ac6]" /> Quick Demo Logins
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleDemoStudent}
                disabled={loading}
                className="py-1.5 px-3 rounded-lg bg-white border border-[#c3c6d7] text-xs font-bold text-[#191b23] hover:border-[#004ac6] hover:text-[#004ac6] transition-colors"
              >
                🎓 Student Demo
              </button>
              <button
                type="button"
                onClick={handleDemoAdmin}
                disabled={loading}
                className="py-1.5 px-3 rounded-lg bg-white border border-[#c3c6d7] text-xs font-bold text-[#191b23] hover:border-[#004ac6] hover:text-[#004ac6] transition-colors"
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
