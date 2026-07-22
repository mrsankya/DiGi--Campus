import React, { useState, useEffect } from 'react';
import { X, UserPlus, Search, Filter, Plus, Mail, Building, Sparkles, Trash2 } from 'lucide-react';
import type { TeammateListing, EventItem } from '../services/api';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface TeammateFinderModalProps {
  isOpen: boolean;
  onClose: () => void;
  events: EventItem[];
}

export const TeammateFinderModal: React.FC<TeammateFinderModalProps> = ({
  isOpen,
  onClose,
  events
}) => {
  const { user, openAuthModal } = useAuth();
  const [listings, setListings] = useState<TeammateListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEventId, setSelectedEventId] = useState<string>('all');
  const [searchSkill, setSearchSkill] = useState<string>('');
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Form State
  const [postEventId, setPostEventId] = useState<string>('');
  const [postTitle, setPostTitle] = useState<string>('');
  const [postSkills, setPostSkills] = useState<string>('');
  const [postDesc, setPostDesc] = useState<string>('');
  const [postContact, setPostContact] = useState<string>('');
  const [formError, setFormError] = useState<string>('');
  const [formLoading, setFormLoading] = useState(false);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const data = await api.getTeammateListings(selectedEventId !== 'all' ? selectedEventId : undefined);
      setListings(data);
    } catch (err) {
      console.error('Error fetching teammate listings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchListings();
      if (events.length > 0) setPostEventId(events[0]._id);
    }
  }, [isOpen, selectedEventId]);

  if (!isOpen) return null;

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openAuthModal('login');
      return;
    }
    setFormError('');
    setFormLoading(true);

    try {
      const skillsArray = postSkills.split(',').map(s => s.trim()).filter(Boolean);
      await api.createTeammateListing({
        eventId: postEventId,
        title: postTitle,
        skillsNeeded: skillsArray,
        description: postDesc,
        contactInfo: postContact
      });

      setShowCreateForm(false);
      setPostTitle('');
      setPostSkills('');
      setPostDesc('');
      setPostContact('');
      fetchListings();
    } catch (err: any) {
      setFormError(err.message || 'Failed to publish post');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeletePost = async (id: string) => {
    if (!confirm('Are you sure you want to close this teammate request?')) return;
    try {
      await api.deleteTeammateListing(id);
      fetchListings();
    } catch (err: any) {
      alert(err.message || 'Failed to close post');
    }
  };

  const filteredListings = listings.filter(l => {
    if (!searchSkill) return true;
    const searchLower = searchSkill.toLowerCase();
    return (
      l.title.toLowerCase().includes(searchLower) ||
      l.description.toLowerCase().includes(searchLower) ||
      l.skillsNeeded.some(s => s.toLowerCase().includes(searchLower))
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
      <div className="bg-white dark:bg-[#0f172a] text-slate-900 dark:text-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden relative max-h-[90vh] flex flex-col transition-colors">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close Teammate Finder"
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="p-6 pb-4 bg-gradient-to-b from-blue-50/80 to-white dark:from-slate-800/80 dark:to-[#0f172a] border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/20">
              <UserPlus className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-slate-900 dark:text-white font-heading">
                  Teammate Matcher
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                  Hackathon Board
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                Find teammates, form teams, and recruit developers & designers for campus events
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              if (!user) {
                openAuthModal('login');
              } else {
                setShowCreateForm(!showCreateForm);
              }
            }}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> {showCreateForm ? 'View All Posts' : 'Post Recruitment'}
          </button>
        </div>

        {/* Filter Toolbar */}
        {!showCreateForm && (
          <div className="p-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row gap-3">
            {/* Event Filter */}
            <div className="flex-1 relative">
              <Filter className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold focus:outline-none focus:border-blue-600 text-slate-900 dark:text-white"
              >
                <option value="all">All Campus Events</option>
                {events.map(ev => (
                  <option key={ev._id} value={ev._id}>{ev.title}</option>
                ))}
              </select>
            </div>

            {/* Skill / Role Search */}
            <div className="flex-1 relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search skills (e.g. React, Python, Figma, UI/UX)..."
                value={searchSkill}
                onChange={(e) => setSearchSkill(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold focus:outline-none focus:border-blue-600 text-slate-900 dark:text-white"
              />
            </div>
          </div>
        )}

        {/* Body Area */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {showCreateForm ? (
            /* Post Creation Form */
            <form onSubmit={handleCreatePost} className="space-y-4 animate-fade-in bg-slate-50 dark:bg-slate-900/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" /> Post Teammate Recruitment Request
              </h3>

              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-xs font-bold border border-rose-200 dark:border-rose-800">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs font-extrabold text-slate-900 dark:text-slate-200 mb-1">Target Campus Event *</label>
                <select
                  required
                  value={postEventId}
                  onChange={(e) => setPostEventId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold focus:outline-none focus:border-blue-600 text-slate-900 dark:text-white"
                >
                  {events.map(ev => (
                    <option key={ev._id} value={ev._id}>{ev.title} ({ev.category})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-900 dark:text-slate-200 mb-1">Listing Headline / Role Needed *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Looking for 1 Full-Stack React Developer & 1 UI/UX Designer"
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold focus:outline-none focus:border-blue-600 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-900 dark:text-slate-200 mb-1">Required Skills (Comma separated)</label>
                <input
                  type="text"
                  placeholder="React, TypeScript, Figma, Python, Node.js"
                  value={postSkills}
                  onChange={(e) => setPostSkills(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold focus:outline-none focus:border-blue-600 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-900 dark:text-slate-200 mb-1">Project Details & Requirements *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe your project idea, team goals, and expectations..."
                  value={postDesc}
                  onChange={(e) => setPostDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold focus:outline-none focus:border-blue-600 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-slate-900 dark:text-slate-200 mb-1">Contact Info / Social Handles *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Email: sanket@digicampus.edu | Discord: @sanket#1234 | Phone: 9876543210"
                  value={postContact}
                  onChange={(e) => setPostContact(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold focus:outline-none focus:border-blue-600 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={formLoading}
                  className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-md transition-all cursor-pointer"
                >
                  {formLoading ? 'Publishing...' : 'Publish Teammate Request'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-5 py-3 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-300 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : loading ? (
            <div className="p-12 text-center text-xs text-slate-500 dark:text-slate-400">Loading teammate requests...</div>
          ) : filteredListings.length > 0 ? (
            /* Listings Cards Feed */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredListings.map(post => (
                <div
                  key={post._id}
                  className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2.5">
                    {/* Event Tag */}
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 truncate max-w-[200px]">
                        {post.eventId?.title || 'Campus Hackathon'}
                      </span>
                      {user && (user._id === post.postedById?._id || user.id === post.postedById?._id) && (
                        <button
                          onClick={() => handleDeletePost(post._id)}
                          title="Close/Delete Listing"
                          className="p-1 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white line-clamp-2">
                      {post.title}
                    </h3>

                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                      {post.description}
                    </p>

                    {/* Skill Pills */}
                    {post.skillsNeeded && post.skillsNeeded.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {post.skillsNeeded.map((skill, sIdx) => (
                          <span
                            key={sIdx}
                            className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Poster Header Footer */}
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-700/80 space-y-2">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={post.postedById?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                        alt={post.postedById?.name}
                        className="w-7 h-7 rounded-full object-cover border border-blue-600"
                      />
                      <div className="text-left flex-1 min-w-0">
                        <span className="block text-xs font-bold text-slate-900 dark:text-white truncate">
                          {post.postedById?.name || 'Student Host'}
                        </span>
                        <span className="block text-[10px] text-slate-500 dark:text-slate-400 truncate flex items-center gap-1">
                          <Building className="w-3 h-3 text-slate-400" /> {post.postedById?.department || 'Computer Science'}
                        </span>
                      </div>
                    </div>

                    {/* Contact Pill */}
                    <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700/60 flex items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-1.5 font-mono text-[11px] text-blue-700 dark:text-blue-300 truncate">
                        <Mail className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{post.contactInfo}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-slate-50 dark:bg-slate-900/40 p-12 rounded-3xl border border-slate-200 dark:border-slate-800 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center mx-auto">
                <UserPlus className="w-7 h-7" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">No Open Teammate Requests</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Be the first to post a teammate recruitment request for upcoming campus hackathons and competitions!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
