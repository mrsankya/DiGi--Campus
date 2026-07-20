import React, { useState } from 'react';
import { X } from 'lucide-react';
import { api } from '../services/api';
import type { EventItem } from '../services/api';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEventCreated: (event: EventItem) => void;
}

export const CreateEventModal: React.FC<CreateEventModalProps> = ({ isOpen, onClose, onEventCreated }) => {
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

  if (!isOpen) return null;

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

      onEventCreated(created);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-[#e1e2ed] overflow-hidden relative max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-[#e1e2ed] flex items-center justify-between bg-[#f3f3fe]">
          <div>
            <h2 className="text-xl font-bold text-[#191b23]">Host New Campus Event</h2>
            <p className="text-xs text-[#737686]">Publish an event to the campus discovery portal</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#737686] hover:text-[#191b23] hover:bg-white rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 rounded-xl bg-[#ffdad6] text-[#93000a] text-xs font-medium border border-[#ffb4ab]">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-[#191b23] mb-1">Event Title *</label>
            <input
              type="text"
              required
              placeholder="e.g. Annual AI & Robotics Hackathon 2026"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-[#f3f3fe] border border-transparent rounded-xl text-sm focus:outline-none focus:border-[#004ac6] focus:bg-white text-[#191b23]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#191b23] mb-1">Description *</label>
            <textarea
              required
              rows={3}
              placeholder="Provide event overview, schedule highlights, rules, or eligibility..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-[#f3f3fe] border border-transparent rounded-xl text-sm focus:outline-none focus:border-[#004ac6] focus:bg-white text-[#191b23]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#191b23] mb-1">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 bg-[#f3f3fe] border border-transparent rounded-xl text-sm focus:outline-none focus:border-[#004ac6] focus:bg-white text-[#191b23]"
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
              <label className="block text-xs font-bold text-[#191b23] mb-1">Department</label>
              <input
                type="text"
                placeholder="e.g. Computer Science"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 bg-[#f3f3fe] border border-transparent rounded-xl text-sm focus:outline-none focus:border-[#004ac6] focus:bg-white text-[#191b23]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#191b23] mb-1">Event Date *</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 bg-[#f3f3fe] border border-transparent rounded-xl text-sm focus:outline-none focus:border-[#004ac6] focus:bg-white text-[#191b23]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#191b23] mb-1">Time Slot *</label>
              <input
                type="text"
                required
                placeholder="e.g. 10:00 AM - 04:00 PM"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 bg-[#f3f3fe] border border-transparent rounded-xl text-sm focus:outline-none focus:border-[#004ac6] focus:bg-white text-[#191b23]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#191b23] mb-1">Venue Name / Hall *</label>
              <input
                type="text"
                required
                placeholder="e.g. Auditorium Hall B"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3 py-2 bg-[#f3f3fe] border border-transparent rounded-xl text-sm focus:outline-none focus:border-[#004ac6] focus:bg-white text-[#191b23]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#191b23] mb-1">Organizer Club / Body *</label>
              <input
                type="text"
                required
                placeholder="e.g. AI Student Chapter"
                value={organizer}
                onChange={(e) => setOrganizer(e.target.value)}
                className="w-full px-3 py-2 bg-[#f3f3fe] border border-transparent rounded-xl text-sm focus:outline-none focus:border-[#004ac6] focus:bg-white text-[#191b23]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#191b23] mb-1">Capacity</label>
              <input
                type="number"
                min="1"
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
                className="w-full px-3 py-2 bg-[#f3f3fe] border border-transparent rounded-xl text-sm focus:outline-none focus:border-[#004ac6] focus:bg-white text-[#191b23]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#191b23] mb-1">Price ($)</label>
              <input
                type="number"
                min="0"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full px-3 py-2 bg-[#f3f3fe] border border-transparent rounded-xl text-sm focus:outline-none focus:border-[#004ac6] focus:bg-white text-[#191b23]"
              />
            </div>

            <div className="flex items-center pt-6">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#191b23]">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="w-4 h-4 rounded text-[#004ac6] focus:ring-[#004ac6]"
                />
                <span>Feature in Hero Feed</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#191b23] mb-1">Banner Image URL</label>
            <input
              type="url"
              placeholder="https://images.unsplash.com/photo-..."
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className="w-full px-3 py-2 bg-[#f3f3fe] border border-transparent rounded-xl text-sm focus:outline-none focus:border-[#004ac6] focus:bg-white text-[#191b23]"
            />
          </div>

          <div className="pt-4 border-t border-[#e1e2ed] flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-semibold text-[#434655] hover:bg-[#f3f3fe] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-[#2563eb] hover:bg-[#004ac6] text-white text-sm font-bold shadow-md transition-all disabled:opacity-50"
            >
              {loading ? 'Publishing...' : 'Publish Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
