import React, { useState } from 'react';
import { Calendar, Search, User as UserIcon, Ticket, LogOut, Sparkles, Shield, Trophy } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ProfileModal } from './ProfileModal';
import { LeaderboardModal } from './LeaderboardModal';

interface NavbarProps {
  currentTab: 'discovery' | 'search' | 'dashboard' | 'admin';
  setCurrentTab: (tab: 'discovery' | 'search' | 'dashboard' | 'admin') => void;
  openCreateModal?: () => void;
  onSearch: (query: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab, onSearch }) => {
  const { user, logout, openAuthModal } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);
  const isAdminOrCoordinator = user && (user.role === 'admin' || user.role === 'coordinator');

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#090d16]/80 backdrop-blur-xl border-b border-white/10 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <div 
            onClick={() => setCurrentTab('discovery')} 
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:scale-110 transition-transform duration-300 border border-white/20">
              <Sparkles className="w-5 h-5 text-amber-300 fill-amber-300 animate-pulse" />
            </div>
            <div>
              <span className="text-2xl font-black tracking-tight font-heading bg-gradient-to-r from-white via-sky-200 to-indigo-300 bg-clip-text text-transparent">
                DiGi Campus
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/20 text-sky-400 border border-blue-500/30">
                Portal
              </span>
            </div>
          </div>

          {/* Global Quick Search */}
          <div className="hidden md:flex flex-1 max-w-md relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search events, workshops, clubs, venues..."
              onChange={(e) => onSearch(e.target.value)}
              onFocus={() => {
                if (currentTab !== 'search') setCurrentTab('search');
              }}
              className="w-full pl-10 pr-4 py-2 bg-slate-900/80 border border-white/10 rounded-2xl text-xs focus:outline-none focus:border-blue-500 focus:bg-slate-900 transition-all text-white placeholder-slate-400 shadow-inner"
            />
          </div>

          {/* Nav Links */}
          <nav className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => setCurrentTab('discovery')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                currentTab === 'discovery' 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 scale-105' 
                  : 'text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Discover</span>
            </button>

            <button
              onClick={() => setCurrentTab('search')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                currentTab === 'search' 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 scale-105' 
                  : 'text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Search className="w-4 h-4" />
              <span className="hidden sm:inline">Explore</span>
            </button>

            <button
              onClick={() => {
                if (!user) {
                  openAuthModal('login');
                } else {
                  setCurrentTab('dashboard');
                }
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                currentTab === 'dashboard' 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 scale-105' 
                  : 'text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Ticket className="w-4 h-4" />
              <span className="hidden sm:inline">My Passes</span>
            </button>

            {/* Leaderboard XP Button */}
            <button
              onClick={() => setLeaderboardOpen(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-black text-amber-300 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 transition-all flex items-center gap-1.5 hover:scale-105 active:scale-95 shadow-sm"
            >
              <Trophy className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span className="hidden sm:inline">XP Ranks</span>
            </button>

            {/* Admin & Coordinator Console Button */}
            {isAdminOrCoordinator && (
              <button
                onClick={() => setCurrentTab('admin')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  currentTab === 'admin' 
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30 scale-105' 
                    : 'bg-purple-500/20 text-purple-300 hover:bg-purple-600 hover:text-white border border-purple-500/30'
                }`}
              >
                <Shield className="w-4 h-4" />
                <span className="hidden sm:inline">Admin Console</span>
              </button>
            )}

            {/* User Profile / Auth Area */}
            {user ? (
              <div className="flex items-center gap-2 ml-1">
                <div 
                  onClick={() => setProfileOpen(true)}
                  className="flex items-center gap-2 cursor-pointer p-1 rounded-2xl hover:bg-white/10 transition-colors group"
                >
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-8 h-8 rounded-xl object-cover border-2 border-blue-500/50 group-hover:border-blue-400 transition-colors shadow-md"
                  />
                  <div className="hidden lg:block text-left pr-1">
                    <span className="block text-xs font-extrabold text-white leading-tight line-clamp-1">{user.name}</span>
                    <span className="block text-[10px] text-sky-400 font-semibold uppercase">{user.role}</span>
                  </div>
                </div>

                <button
                  onClick={logout}
                  title="Sign Out"
                  className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => openAuthModal('login')}
                className="ml-1 px-4 py-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-blue-500/25 transition-all flex items-center gap-1.5 hover:scale-105 active:scale-95"
              >
                <UserIcon className="w-4 h-4" />
                <span>Login</span>
              </button>
            )}
          </nav>
        </div>
      </header>

      {/* User Profile Modal */}
      <ProfileModal
        isOpen={profileOpen}
        onClose={() => setProfileOpen(false)}
      />

      {/* Campus Leaderboard XP Modal */}
      <LeaderboardModal
        isOpen={leaderboardOpen}
        onClose={() => setLeaderboardOpen(false)}
      />
    </>
  );
};
