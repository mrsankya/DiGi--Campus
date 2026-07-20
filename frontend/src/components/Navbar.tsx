import React, { useState } from 'react';
import { Calendar, Search, User as UserIcon, PlusCircle, Ticket, LogOut, Sparkles, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ProfileModal } from './ProfileModal';

interface NavbarProps {
  currentTab: 'discovery' | 'search' | 'dashboard' | 'admin';
  setCurrentTab: (tab: 'discovery' | 'search' | 'dashboard' | 'admin') => void;
  openCreateModal: () => void;
  onSearch: (query: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab, openCreateModal, onSearch }) => {
  const { user, logout, openAuthModal } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const isAdminOrCoordinator = user && (user.role === 'admin' || user.role === 'coordinator');

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-[#e1e2ed]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <div 
            onClick={() => setCurrentTab('discovery')} 
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#004ac6] to-[#2563eb] text-white flex items-center justify-center shadow-md shadow-[#004ac6]/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-[#004ac6] to-[#2563eb] bg-clip-text text-transparent">
                DiGi Campus
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-[#f3f3fe] text-[#004ac6]">
                Portal
              </span>
            </div>
          </div>

          {/* Global Quick Search */}
          <div className="hidden md:flex flex-1 max-w-md relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#737686]" />
            <input
              type="text"
              placeholder="Search events, workshops, clubs, venues..."
              onChange={(e) => onSearch(e.target.value)}
              onFocus={() => {
                if (currentTab !== 'search') setCurrentTab('search');
              }}
              className="w-full pl-10 pr-4 py-2 bg-[#f3f3fe] border border-transparent rounded-full text-sm focus:outline-none focus:border-[#004ac6] focus:bg-white transition-all text-[#191b23] placeholder-[#737686]"
            />
          </div>

          {/* Nav Links */}
          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setCurrentTab('discovery')}
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                currentTab === 'discovery' 
                  ? 'bg-[#eeefff] text-[#004ac6]' 
                  : 'text-[#434655] hover:bg-[#f3f3fe]'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span className="hidden sm:inline">Discover</span>
            </button>

            <button
              onClick={() => setCurrentTab('search')}
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                currentTab === 'search' 
                  ? 'bg-[#eeefff] text-[#004ac6]' 
                  : 'text-[#434655] hover:bg-[#f3f3fe]'
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
              className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                currentTab === 'dashboard' 
                  ? 'bg-[#eeefff] text-[#004ac6]' 
                  : 'text-[#434655] hover:bg-[#f3f3fe]'
              }`}
            >
              <Ticket className="w-4 h-4" />
              <span className="hidden sm:inline">My Passes</span>
            </button>

            {/* Admin & Coordinator Console Button */}
            {isAdminOrCoordinator && (
              <button
                onClick={() => setCurrentTab('admin')}
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                  currentTab === 'admin' 
                    ? 'bg-[#004ac6] text-white' 
                    : 'bg-[#eeefff] text-[#004ac6] hover:bg-[#004ac6] hover:text-white'
                }`}
              >
                <Shield className="w-4 h-4" />
                <span className="hidden sm:inline">Admin Console</span>
              </button>
            )}

            {/* Create Event Button */}
            <button
              onClick={() => {
                if (!user) {
                  openAuthModal('login');
                } else {
                  openCreateModal();
                }
              }}
              className="px-3.5 py-2 rounded-lg bg-[#2563eb] hover:bg-[#004ac6] text-white text-sm font-semibold flex items-center gap-1.5 shadow-sm transition-all hover:shadow-md"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Host Event</span>
            </button>

            {/* User Menu */}
            {user ? (
              <div className="flex items-center gap-2 ml-2 pl-2 border-l border-[#e1e2ed]">
                <button
                  onClick={() => setProfileOpen(true)}
                  title="View Profile & Settings"
                  className="flex items-center gap-2 p-1 hover:bg-[#f3f3fe] rounded-full transition-colors group"
                >
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover border-2 border-[#004ac6] group-hover:scale-105 transition-transform"
                  />
                  <span className="hidden md:inline text-xs font-bold text-[#191b23] max-w-[100px] truncate">
                    {user.name.split(' ')[0]}
                  </span>
                </button>
                <button
                  onClick={logout}
                  title="Logout"
                  className="p-1.5 text-[#737686] hover:text-[#ba1a1a] hover:bg-[#ffdad6]/40 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => openAuthModal('login')}
                className="ml-1 px-3 py-2 rounded-lg border border-[#c3c6d7] text-sm font-semibold text-[#191b23] hover:bg-[#f3f3fe] transition-colors flex items-center gap-1"
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
    </>
  );
};
