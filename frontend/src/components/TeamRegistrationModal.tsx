import React, { useState } from 'react';
import { X, Users, UserPlus, Copy, Check, ShieldCheck, Sparkles } from 'lucide-react';
import type { EventItem, Team } from '../services/api';
import { api } from '../services/api';

interface TeamRegistrationModalProps {
  event: EventItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const TeamRegistrationModal: React.FC<TeamRegistrationModalProps> = ({
  event,
  isOpen,
  onClose,
  onSuccess
}) => {
  const [tab, setTab] = useState<'create' | 'join'>('create');
  const [teamName, setTeamName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [maxMembers, setMaxMembers] = useState(4);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdTeam, setCreatedTeam] = useState<Team | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen || !event) return null;

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const team = await api.createTeam(teamName, event._id, maxMembers);
      setCreatedTeam(team);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to create team');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const team = await api.joinTeam(joinCode);
      setCreatedTeam(team);
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to join team');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (createdTeam) {
      navigator.clipboard.writeText(createdTeam.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDone = () => {
    setCreatedTeam(null);
    setTeamName('');
    setJoinCode('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
      <div className="bg-white dark:bg-[#0f172a] text-slate-900 dark:text-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden relative max-h-[90vh] flex flex-col transition-colors">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close Team Modal"
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="p-6 pb-4 bg-gradient-to-b from-blue-50/80 to-white dark:from-slate-800/80 dark:to-[#0f172a] border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/30">
              <Users className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                Team Registration
              </span>
              <h2 className="text-xl font-black text-slate-900 dark:text-white font-heading truncate max-w-xs sm:max-w-sm mt-0.5">
                {event.title}
              </h2>
            </div>
          </div>

          {!createdTeam && (
            <div className="flex bg-slate-200/80 dark:bg-slate-800 p-1.5 rounded-2xl mt-4 border border-slate-300/50 dark:border-slate-700/50">
              <button
                type="button"
                onClick={() => { setTab('create'); setError(''); }}
                className={`flex-1 py-2 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  tab === 'create'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Users className="w-3.5 h-3.5" /> Create New Team
              </button>
              <button
                type="button"
                onClick={() => { setTab('join'); setError(''); }}
                className={`flex-1 py-2 text-xs font-black rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  tab === 'join'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" /> Join Existing Team
              </button>
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-xs font-bold border border-rose-200 dark:border-rose-800">
              {error}
            </div>
          )}

          {createdTeam ? (
            /* Success / Team Confirmation Screen */
            <div className="text-center space-y-6 animate-fade-in py-2">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 flex items-center justify-center mx-auto">
                <ShieldCheck className="w-8 h-8 animate-pulse" />
              </div>

              <div className="space-y-1">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white">{createdTeam.name}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Team Pass successfully created for {event.title}!</p>
              </div>

              {/* Team Code Share Box */}
              <div className="p-4 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-center space-y-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-700 dark:text-blue-300">
                  Share Team Code With Teammates
                </span>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-2xl font-black font-mono tracking-widest text-slate-900 dark:text-white">
                    {createdTeam.code}
                  </span>
                  <button
                    onClick={handleCopyCode}
                    className="p-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                    <span>{copied ? 'Copied!' : 'Copy Code'}</span>
                  </button>
                </div>
              </div>

              {/* Team Members List */}
              <div className="text-left space-y-2">
                <h4 className="text-xs font-extrabold text-slate-900 dark:text-slate-200 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Team Roster ({createdTeam.members.length}/{createdTeam.maxMembers})
                </h4>
                <div className="space-y-2">
                  {createdTeam.members.map((member, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-3">
                        <img
                          src={member.userId.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                          alt={member.userId.name}
                          className="w-8 h-8 rounded-full object-cover border border-blue-600"
                        />
                        <div>
                          <p className="text-xs font-extrabold text-slate-900 dark:text-white">{member.userId.name}</p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400">{member.userId.department}</p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                        {member.role}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={handleDone}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-lg transition-all cursor-pointer"
              >
                Go to My Event Passes
              </button>
            </div>
          ) : tab === 'create' ? (
            /* Create Team Form */
            <form onSubmit={handleCreateTeam} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-900 dark:text-slate-200 mb-1">
                  Team Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cyber Squad Alpha"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold focus:outline-none focus:border-blue-600 text-slate-900 dark:text-white placeholder-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-900 dark:text-slate-200 mb-1">
                  Maximum Team Members
                </label>
                <select
                  value={maxMembers}
                  onChange={(e) => setMaxMembers(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold focus:outline-none focus:border-blue-600 text-slate-900 dark:text-white"
                >
                  <option value={2}>2 Members</option>
                  <option value={3}>3 Members</option>
                  <option value={4}>4 Members (Standard Hackathon)</option>
                  <option value={5}>5 Members</option>
                </select>
              </div>

              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 text-[11px] text-amber-800 dark:text-amber-300 space-y-1">
                <p className="font-extrabold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" /> Team Leader Perks:
                </p>
                <p className="text-[10px] text-slate-600 dark:text-slate-300">
                  Creating a team generates a unique Team Code (`TEAM-XXXX`). Share this code with your teammates so they can join your team ticket roster!
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-lg hover:shadow-blue-500/25 transition-all disabled:opacity-50 cursor-pointer"
              >
                {loading ? 'Creating Team...' : 'Create Team & Generate Pass'}
              </button>
            </form>
          ) : (
            /* Join Team Form */
            <form onSubmit={handleJoinTeam} className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold text-slate-900 dark:text-slate-200 mb-1">
                  Enter 8-Character Team Code *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. TEAM-4921"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  className="w-full px-3.5 py-3 bg-slate-100 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-black font-mono tracking-widest uppercase focus:outline-none focus:border-blue-600 text-slate-900 dark:text-white placeholder-slate-400 text-center"
                />
              </div>

              <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center">
                Ask your Team Leader for the 8-character code (`TEAM-XXXX`) to attach yourself to their event registration.
              </p>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-lg hover:shadow-blue-500/25 transition-all disabled:opacity-50 cursor-pointer"
              >
                {loading ? 'Joining Team...' : 'Join Team Roster'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
