import React, { useState, useEffect } from 'react';
import { X, Edit2, Globe, Link as LinkIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  // Form fields
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('');
  const [studentId, setStudentId] = useState('');
  const [phone, setPhone] = useState('');
  const [bio, setBio] = useState('');
  const [yearOfStudy, setYearOfStudy] = useState('3rd Year');
  const [avatar, setAvatar] = useState('');
  const [github, setGithub] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setDepartment(user.department || 'Computer Science');
      setStudentId(user.studentId || '');
      setPhone(user.phone || '');
      setBio(user.bio || '');
      setYearOfStudy(user.yearOfStudy || '3rd Year');
      setAvatar(user.avatar || '');
      setGithub(user.github || '');
      setLinkedin(user.linkedin || '');
    }
  }, [user, isOpen]);

  if (!isOpen || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.updateProfile({
        name,
        department,
        studentId,
        phone,
        bio,
        yearOfStudy,
        avatar,
        github,
        linkedin
      });

      // Reload window to update auth state cleanly
      window.location.reload();
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-[#e1e2ed] overflow-hidden relative max-h-[90vh] flex flex-col">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-[#004ac6] to-[#2563eb] p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-5">
            <div className="relative group">
              <img
                src={avatar || user.avatar}
                alt={user.name}
                className="w-20 h-20 rounded-2xl object-cover border-2 border-white/40 shadow-xl"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-black">{user.name}</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-white/20 uppercase tracking-wider">
                  {user.role}
                </span>
              </div>
              <p className="text-xs text-white/80 mt-0.5">{user.position || 'Student Member'} • {user.department}</p>
              <p className="text-[11px] text-white/70 font-mono mt-0.5">ID: {user.studentId}</p>
            </div>
          </div>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {error && (
            <div className="p-3 rounded-xl bg-[#ffdad6] text-[#93000a] text-xs font-medium border border-[#ffb4ab]">
              {error}
            </div>
          )}

          {!isEditing ? (
            /* VIEW MODE */
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-[#e1e2ed] pb-4">
                <h3 className="text-sm font-bold text-[#191b23]">Personal Profile Information</h3>
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-[#eeefff] text-[#004ac6] hover:bg-[#004ac6] hover:text-white text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Edit Profile
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-[#434655]">
                <div className="p-3.5 rounded-2xl bg-[#f3f3fe] space-y-1">
                  <span className="font-bold text-[#737686] text-[10px] uppercase block">Full Name</span>
                  <span className="font-bold text-[#191b23] text-sm">{user.name}</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#f3f3fe] space-y-1">
                  <span className="font-bold text-[#737686] text-[10px] uppercase block">Email Address</span>
                  <span className="font-bold text-[#191b23] text-sm">{user.email}</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#f3f3fe] space-y-1">
                  <span className="font-bold text-[#737686] text-[10px] uppercase block">Department</span>
                  <span className="font-bold text-[#191b23] text-sm">{user.department}</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#f3f3fe] space-y-1">
                  <span className="font-bold text-[#737686] text-[10px] uppercase block">Student ID / Roll No</span>
                  <span className="font-bold text-[#004ac6] font-mono text-sm">{user.studentId}</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#f3f3fe] space-y-1">
                  <span className="font-bold text-[#737686] text-[10px] uppercase block">Phone Number</span>
                  <span className="font-bold text-[#191b23] text-sm">{user.phone || 'Not provided'}</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#f3f3fe] space-y-1">
                  <span className="font-bold text-[#737686] text-[10px] uppercase block">Year of Study</span>
                  <span className="font-bold text-[#191b23] text-sm">{user.yearOfStudy || '3rd Year'}</span>
                </div>
              </div>

              {/* Bio */}
              <div className="p-4 rounded-2xl bg-[#f3f3fe] space-y-1">
                <span className="font-bold text-[#737686] text-[10px] uppercase block">Bio & Introduction</span>
                <p className="text-xs text-[#191b23] leading-relaxed">
                  {user.bio || 'No bio added yet. Click Edit Profile to introduce yourself!'}
                </p>
              </div>

              {/* Social Links */}
              <div className="flex items-center gap-3 pt-2">
                {user.github && (
                  <a
                    href={user.github}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-xs font-bold text-gray-800 flex items-center gap-1.5"
                  >
                    <Globe className="w-4 h-4" /> GitHub
                  </a>
                )}
                {user.linkedin && (
                  <a
                    href={user.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-xs font-bold text-blue-700 flex items-center gap-1.5"
                  >
                    <LinkIcon className="w-4 h-4" /> LinkedIn
                  </a>
                )}
              </div>
            </div>
          ) : (
            /* EDIT MODE FORM */
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center justify-between border-b border-[#e1e2ed] pb-3">
                <h3 className="text-sm font-bold text-[#191b23]">Edit Profile Details</h3>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="text-xs font-bold text-[#737686] hover:text-[#191b23]"
                >
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#191b23] mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 bg-[#f3f3fe] border border-transparent rounded-xl text-xs focus:outline-none focus:border-[#004ac6] text-[#191b23]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#191b23] mb-1">Department</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 bg-[#f3f3fe] border border-transparent rounded-xl text-xs focus:outline-none focus:border-[#004ac6] text-[#191b23]"
                  >
                    <option value="Computer Science & AI">Computer Science & AI</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Electronics & Telecom">Electronics & Telecom</option>
                    <option value="Mechanical Engineering">Mechanical Engineering</option>
                    <option value="Business & Management">Business & Management</option>
                    <option value="School of Engineering & Administration">School of Engineering & Administration</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#191b23] mb-1">Student ID / Roll No</label>
                  <input
                    type="text"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    className="w-full px-3 py-2 bg-[#f3f3fe] border border-transparent rounded-xl text-xs focus:outline-none focus:border-[#004ac6] text-[#191b23]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#191b23] mb-1">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+1 (555) 000-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-[#f3f3fe] border border-transparent rounded-xl text-xs focus:outline-none focus:border-[#004ac6] text-[#191b23]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#191b23] mb-1">Year of Study</label>
                  <select
                    value={yearOfStudy}
                    onChange={(e) => setYearOfStudy(e.target.value)}
                    className="w-full px-3 py-2 bg-[#f3f3fe] border border-transparent rounded-xl text-xs focus:outline-none focus:border-[#004ac6] text-[#191b23]"
                  >
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year (Senior)</option>
                    <option value="Postgraduate / Faculty">Postgraduate / Faculty</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#191b23] mb-1">Avatar Picture URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={avatar}
                  onChange={(e) => setAvatar(e.target.value)}
                  className="w-full px-3 py-2 bg-[#f3f3fe] border border-transparent rounded-xl text-xs focus:outline-none focus:border-[#004ac6] text-[#191b23]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#191b23] mb-1">Bio / Introduction</label>
                <textarea
                  rows={3}
                  placeholder="Tell campus members about your interests, technical skills, or student club roles..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full px-3 py-2 bg-[#f3f3fe] border border-transparent rounded-xl text-xs focus:outline-none focus:border-[#004ac6] text-[#191b23]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#191b23] mb-1">GitHub Profile URL</label>
                  <input
                    type="url"
                    placeholder="https://github.com/username"
                    value={github}
                    onChange={(e) => setGithub(e.target.value)}
                    className="w-full px-3 py-2 bg-[#f3f3fe] border border-transparent rounded-xl text-xs focus:outline-none focus:border-[#004ac6] text-[#191b23]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#191b23] mb-1">LinkedIn Profile URL</label>
                  <input
                    type="url"
                    placeholder="https://linkedin.com/in/username"
                    value={linkedin}
                    onChange={(e) => setLinkedin(e.target.value)}
                    className="w-full px-3 py-2 bg-[#f3f3fe] border border-transparent rounded-xl text-xs focus:outline-none focus:border-[#004ac6] text-[#191b23]"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-[#e1e2ed] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#434655] hover:bg-[#f3f3fe]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl bg-[#2563eb] hover:bg-[#004ac6] text-white text-xs font-bold shadow-md transition-all disabled:opacity-50"
                >
                  {loading ? 'Saving Profile...' : 'Save Profile Changes'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
