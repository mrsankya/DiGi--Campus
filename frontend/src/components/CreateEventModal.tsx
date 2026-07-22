import React, { useState } from 'react';
import { X, Sparkles, MessageSquare, Check, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import type { EventItem } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEventCreated: (event: EventItem) => void;
}

export const CreateEventModal: React.FC<CreateEventModalProps> = ({ isOpen, onClose, onEventCreated }) => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<EventItem['category']>('Tech');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('10:00 AM - 04:00 PM');
  const [location, setLocation] = useState('');
  const [organizer, setOrganizer] = useState('Student Council');
  const [department, setDepartment] = useState('Computer Science');
  const [image, setImage] = useState('');
  const [capacity, setCapacity] = useState(100);
  const [price, setPrice] = useState(0);
  const [isFeatured, setIsFeatured] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // AI Paste Extractor State
  const [showAiPaste, setShowAiPaste] = useState(false);
  const [rawText, setRawText] = useState('');
  const [aiParsing, setAiParsing] = useState(false);
  const [aiSuccessMsg, setAiSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleAiParse = async () => {
    if (!rawText.trim()) return;
    setAiParsing(true);
    setError('');
    try {
      const parsed = await api.parseEventText(rawText);
      if (parsed.title) setTitle(parsed.title);
      if (parsed.description) setDescription(parsed.description);
      if (parsed.category) setCategory(parsed.category as any);
      if (parsed.date) setDate(parsed.date);
      if (parsed.time) setTime(parsed.time);
      if (parsed.location) setLocation(parsed.location);
      if (parsed.organizer) setOrganizer(parsed.organizer);
      if (parsed.department) setDepartment(parsed.department);
      if (parsed.capacity) setCapacity(parsed.capacity);
      if (parsed.price !== undefined) setPrice(parsed.price);

      setAiSuccessMsg('✨ Event details auto-filled from WhatsApp message successfully!');
      setShowAiPaste(false);
      setTimeout(() => setAiSuccessMsg(''), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to parse event text');
    } finally {
      setAiParsing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const defaultImage = image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800';
      const created = await api.createEvent({
        title,
        description,
        category,
        date: date ? new Date(date).toISOString() : new Date().toISOString(),
        time,
        location,
        venue: location || 'Main Campus Center',
        organizer,
        department,
        image: defaultImage,
        capacity: Number(capacity),
        price: Number(price),
        isFeatured
      });

      if (user?.role === 'student' || created.approvalStatus === 'Pending') {
        alert('🎉 Event submitted successfully! It has been placed in the Admin Approval Queue and will go live once reviewed.');
      } else {
        alert('✨ Event published live to Campus Discovery!');
      }

      onEventCreated(created);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  const isStudent = user?.role === 'student';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
      <div className="bg-white dark:bg-[#0f172a] text-slate-900 dark:text-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden relative max-h-[90vh] flex flex-col transition-colors">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-b from-blue-50/80 to-white dark:from-slate-800/80 dark:to-[#0f172a]">
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white font-heading">
              {isStudent ? 'Submit Campus Event for Approval' : 'Host New Campus Event'}
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              {isStudent ? 'Propose an event for admin review and publication' : 'Publish an event to the campus discovery portal'}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close Modal"
            className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-xs font-bold border border-rose-200 dark:border-rose-800">
              {error}
            </div>
          )}

          {aiSuccessMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-600" /> {aiSuccessMsg}
            </div>
          )}

          {isStudent && (
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 text-[11px] text-amber-800 dark:text-amber-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-extrabold block">Admin Verification Required</span>
                <span>Student-submitted events will be reviewed by Campus Admins before becoming visible to all students.</span>
              </div>
            </div>
          )}

          {/* AI WhatsApp Message & Flier Text Auto-Fill Box */}
          <div className="p-4 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-xs font-extrabold text-blue-900 dark:text-blue-200">
                  AI Auto-Fill from WhatsApp / Flier Text
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowAiPaste(!showAiPaste)}
                className="px-3 py-1 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[11px] transition-all flex items-center gap-1 cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>{showAiPaste ? 'Hide AI Box' : 'Paste WhatsApp Message'}</span>
              </button>
            </div>

            {showAiPaste && (
              <div className="space-y-2 animate-fade-in pt-1">
                <textarea
                  rows={4}
                  placeholder="Paste raw WhatsApp message or flyer text here (e.g. '🔥 AI Hackathon 2026! Date: 15 August 2026 at Auditorium Hall B. Organized by CSE Dept...')"
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  className="w-full p-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono focus:outline-none focus:border-blue-600 text-slate-900 dark:text-white"
                />
                <button
                  type="button"
                  disabled={aiParsing || !rawText.trim()}
                  onClick={handleAiParse}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>{aiParsing ? 'AI Extracting Event Info...' : 'Extract & Auto-Fill Form Fields'}</span>
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-900 dark:text-slate-200 mb-1">Event Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Annual AI & Robotics Hackathon 2026"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold focus:outline-none focus:border-blue-600 text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-900 dark:text-slate-200 mb-1">Description *</label>
            <textarea
              required
              rows={3}
              placeholder="Provide event overview, schedule highlights, rules, or eligibility..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold focus:outline-none focus:border-blue-600 text-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-extrabold text-slate-900 dark:text-slate-200 mb-1">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold focus:outline-none focus:border-blue-600 text-slate-900 dark:text-white"
              >
                <option value="Tech">Tech</option>
                <option value="Cultural">Cultural</option>
                <option value="Sports">Sports</option>
                <option value="Academic">Academic</option>
                <option value="Workshop">Workshop</option>
                <option value="Seminar">Seminar</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-900 dark:text-slate-200 mb-1">Department</label>
              <input
                type="text"
                placeholder="e.g. Computer Science"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold focus:outline-none focus:border-blue-600 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-extrabold text-slate-900 dark:text-slate-200 mb-1">Event Date *</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold focus:outline-none focus:border-blue-600 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-900 dark:text-slate-200 mb-1">Time Slot *</label>
              <input
                type="text"
                required
                placeholder="e.g. 10:00 AM - 04:00 PM"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold focus:outline-none focus:border-blue-600 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-extrabold text-slate-900 dark:text-slate-200 mb-1">Venue Name / Hall *</label>
              <input
                type="text"
                required
                placeholder="e.g. Auditorium Hall B"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold focus:outline-none focus:border-blue-600 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-900 dark:text-slate-200 mb-1">Organizer Club / Body *</label>
              <input
                type="text"
                required
                placeholder="e.g. AI Student Chapter"
                value={organizer}
                onChange={(e) => setOrganizer(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold focus:outline-none focus:border-blue-600 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-extrabold text-slate-900 dark:text-slate-200 mb-1">Capacity</label>
              <input
                type="number"
                min="1"
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold focus:outline-none focus:border-blue-600 text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-900 dark:text-slate-200 mb-1">Ticket Price (₹)</label>
              <input
                type="number"
                min="0"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold focus:outline-none focus:border-blue-600 text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex items-center pt-6">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-extrabold text-slate-900 dark:text-slate-200">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-600"
                />
                <span>Feature in Hero Feed</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-extrabold text-slate-900 dark:text-slate-200 mb-1">Banner Image URL</label>
            <input
              type="url"
              placeholder="https://images.unsplash.com/photo-..."
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold focus:outline-none focus:border-blue-600 text-slate-900 dark:text-white"
            />
          </div>

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black shadow-md hover:shadow-lg transition-all disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Submitting...' : isStudent ? 'Submit for Admin Approval' : 'Publish Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
