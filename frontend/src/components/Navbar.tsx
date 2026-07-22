import React, { useState } from 'react';
import { Calendar, Search, User as UserIcon, Ticket, LogOut, Sparkles, Shield, Trophy, Sun, Moon, Bell, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ProfileModal } from './ProfileModal';
import { LeaderboardModal } from './LeaderboardModal';
import { AnnouncementsModal } from './AnnouncementsModal';
import { TeammateFinderModal } from './TeammateFinderModal';
import type { EventItem } from '../services/api';

interface NavbarProps {
  currentTab: 'discovery' | 'search' | 'dashboard' | 'admin';
  setCurrentTab: (tab: 'discovery' | 'search' | 'dashboard' | 'admin') => void;
  openCreateModal?: () => void;
  onSearch: (query: string) => void;
  events?: EventItem[];
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab, onSearch, events = [] }) => {
  const { user, logout, openAuthModal, theme, toggleTheme } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);
  const [announcementsOpen, setAnnouncementsOpen] = useState(false);
  const [teammateFinderOpen, setTeammateFinderOpen] = useState(false);
  const isAdminOrCoordinator = user && (user.role === 'admin' || user.role === 'coordinator');

  return (
    <>
      {/* Top Navbar Header */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#090d16]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors shadow-xs">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          {/* Brand Logo */}
          <div 
            onClick={() => setCurrentTab('discovery')} 
            className="flex items-center gap-2 cursor-pointer group shrink-0"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300 fill-amber-300" />
            </div>
            <div>
              <span className="text-lg sm:text-xl font-extrabold font-heading text-slate-900 dark:text-white">
                DiGi Campus
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
                Portal
              </span>
            </div>
          </div>

          {/* Global Quick Search (Tablets & Desktops) */}
          <div className="hidden md:flex flex-1 max-w-md relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search events, workshops, clubs, venues..."
              onChange={(e) => onSearch(e.target.value)}
              onFocus={() => {
                if (currentTab !== 'search') setCurrentTab('search');
              }}
              className="w-full pl-10 pr-4 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-full text-xs focus:outline-none focus:border-blue-600 text-slate-900 dark:text-white placeholder-slate-500 transition-colors"
            />
          </div>

          {/* Top Desktop & Tablet Navigation */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setCurrentTab('discovery')}
              className={`hidden sm:flex px-3 py-2 rounded-xl text-xs font-bold transition-all items-center gap-1.5 ${
                currentTab === 'discovery' 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Discover</span>
            </button>

            <button
              onClick={() => setCurrentTab('search')}
              className={`hidden sm:flex px-3 py-2 rounded-xl text-xs font-bold transition-all items-center gap-1.5 ${
                currentTab === 'search' 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>Explore</span>
            </button>

            <button
              onClick={() => {
                if (!user) {
                  openAuthModal('login');
                } else {
                  setCurrentTab('dashboard');
                }
              }}
              className={`hidden sm:flex px-3 py-2 rounded-xl text-xs font-bold transition-all items-center gap-1.5 ${
                currentTab === 'dashboard' 
                  ? 'bg-blue-600 text-white shadow-md' 
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Ticket className="w-4 h-4" />
              <span>My Passes</span>
            </button>

            {/* Teammate Matcher Button */}
            <button
              onClick={() => setTeammateFinderOpen(true)}
              className="px-2.5 sm:px-3 py-2 rounded-xl text-xs font-extrabold text-blue-800 dark:text-blue-300 bg-blue-100 dark:bg-blue-950/60 hover:bg-blue-200 border border-blue-300 dark:border-blue-700 transition-all flex items-center gap-1.5 cursor-pointer"
              title="Find Hackathon Teammates"
            >
              <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span className="hidden md:inline">Team Matcher</span>
            </button>

            {/* Leaderboard XP Button */}
            <button
              onClick={() => setLeaderboardOpen(true)}
              className="px-2.5 sm:px-3 py-2 rounded-xl text-xs font-extrabold text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 hover:bg-amber-200 border border-amber-300 dark:border-amber-700 transition-all flex items-center gap-1.5"
            >
              <Trophy className="w-4 h-4 text-amber-600 fill-amber-400" />
              <span className="hidden md:inline">XP Ranks</span>
            </button>

            {/* Admin Console Button */}
            {isAdminOrCoordinator && (
              <button
                onClick={() => setCurrentTab('admin')}
                className={`px-2.5 sm:px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  currentTab === 'admin' 
                    ? 'bg-purple-600 text-white shadow-md' 
                    : 'bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 hover:bg-purple-200 border border-purple-300 dark:border-purple-800'
                }`}
              >
                <Shield className="w-4 h-4" />
                <span className="hidden md:inline">Admin</span>
              </button>
            )}

            {/* SLEEK SUN / MOON THEME TOGGLE BUTTON */}
            <button
              onClick={toggleTheme}
              title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
              className="p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-amber-300 hover:scale-105 active:scale-95 transition-all shadow-xs flex items-center justify-center font-bold"
            >
              {theme === 'light' ? (
                <Moon className="w-4 h-4 text-slate-800 fill-slate-800" />
              ) : (
                <Sun className="w-4 h-4 text-amber-400 fill-amber-400" />
              )}
            </button>

            {/* Campus Announcements Bell Button */}
            <button
              onClick={() => setAnnouncementsOpen(true)}
              title="Campus Bulletins & Notifications"
              className="relative p-2 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/80 hover:scale-105 active:scale-95 transition-all shadow-xs flex items-center justify-center gap-1.5 font-bold"
            >
              <Bell className="w-4 h-4 text-blue-600 dark:text-blue-400 fill-blue-400" />
              <span className="hidden lg:inline text-xs font-extrabold">Bulletins</span>
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse border border-white dark:border-slate-900" />
            </button>

            {/* User Profile / Auth Area */}
            {user ? (
              <div className="flex items-center gap-1.5 ml-1">
                <div 
                  onClick={() => setProfileOpen(true)}
                  className="flex items-center gap-2 cursor-pointer p-1 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
                >
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-8 h-8 rounded-xl object-cover border-2 border-blue-600 shadow-sm"
                  />
                  <div className="hidden lg:block text-left pr-1">
                    <span className="block text-xs font-extrabold text-slate-900 dark:text-white leading-tight line-clamp-1">{user.name}</span>
                    <span className="block text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase">{user.role}</span>
                  </div>
                </div>

                <button
                  onClick={logout}
                  title="Sign Out"
                  className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => openAuthModal('login')}
                className="ml-1 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <UserIcon className="w-4 h-4" />
                <span>Login</span>
              </button>
            )}
          </nav>
        </div>
      </header>

      {/* MOBILE BOTTOM NAVIGATION BAR (Phones <640px) */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#090d16]/95 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 sm:hidden flex items-center justify-around py-2 px-1 shadow-2xl transition-colors">
        <button
          onClick={() => setCurrentTab('discovery')}
          className={`flex flex-col items-center gap-1 p-1.5 rounded-xl transition-all ${
            currentTab === 'discovery' ? 'text-blue-600 dark:text-blue-400 font-black' : 'text-slate-500 dark:text-slate-400 font-medium'
          }`}
        >
          <Calendar className="w-5 h-5" />
          <span className="text-[10px]">Discover</span>
        </button>

        <button
          onClick={() => setCurrentTab('search')}
          className={`flex flex-col items-center gap-1 p-1.5 rounded-xl transition-all ${
            currentTab === 'search' ? 'text-blue-600 dark:text-blue-400 font-black' : 'text-slate-500 dark:text-slate-400 font-medium'
          }`}
        >
          <Search className="w-5 h-5" />
          <span className="text-[10px]">Explore</span>
        </button>

        <button
          onClick={() => {
            if (!user) openAuthModal('login');
            else setCurrentTab('dashboard');
          }}
          className={`flex flex-col items-center gap-1 p-1.5 rounded-xl transition-all ${
            currentTab === 'dashboard' ? 'text-blue-600 dark:text-blue-400 font-black' : 'text-slate-500 dark:text-slate-400 font-medium'
          }`}
        >
          <Ticket className="w-5 h-5" />
          <span className="text-[10px]">My Passes</span>
        </button>

        {isAdminOrCoordinator ? (
          <button
            onClick={() => setCurrentTab('admin')}
            className={`flex flex-col items-center gap-1 p-1.5 rounded-xl transition-all ${
              currentTab === 'admin' ? 'text-purple-600 dark:text-purple-400 font-black' : 'text-slate-500 dark:text-slate-400 font-medium'
            }`}
          >
            <Shield className="w-5 h-5" />
            <span className="text-[10px]">Admin</span>
          </button>
        ) : (
          <button
            onClick={() => setTeammateFinderOpen(true)}
            className="flex flex-col items-center gap-1 p-1.5 text-blue-600 dark:text-blue-400 font-bold"
          >
            <Users className="w-5 h-5" />
            <span className="text-[10px]">Teams</span>
          </button>
        )}

        {user ? (
          <button
            onClick={() => setProfileOpen(true)}
            className="flex flex-col items-center gap-1 p-1.5 text-slate-700 dark:text-slate-300 font-bold"
          >
            <img src={user.avatar} alt={user.name} className="w-5 h-5 rounded-full object-cover border border-blue-600" />
            <span className="text-[10px]">Profile</span>
          </button>
        ) : (
          <button
            onClick={() => openAuthModal('login')}
            className="flex flex-col items-center gap-1 p-1.5 text-blue-600 font-bold"
          >
            <UserIcon className="w-5 h-5" />
            <span className="text-[10px]">Login</span>
          </button>
        )}
      </div>

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

      {/* Campus Bulletins & Announcements Modal */}
      <AnnouncementsModal
        isOpen={announcementsOpen}
        onClose={() => setAnnouncementsOpen(false)}
      />

      {/* Teammate Matcher Board Modal */}
      <TeammateFinderModal
        isOpen={teammateFinderOpen}
        onClose={() => setTeammateFinderOpen(false)}
        events={events}
      />
    </>
  );
};
