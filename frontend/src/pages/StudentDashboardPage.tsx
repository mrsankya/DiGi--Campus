import React, { useState, useEffect } from 'react';
import { Ticket, Calendar, MapPin, QrCode, Trash2, Building, Award, Star, X, Edit2 } from 'lucide-react';
import type { Registration } from '../services/api';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { TicketModal } from '../components/TicketModal';
import { CertificateModal } from '../components/CertificateModal';
import { ProfileModal } from '../components/ProfileModal';

interface StudentDashboardPageProps {
  onSelectEvent: (event: any) => void;
}

export const StudentDashboardPage: React.FC<StudentDashboardPageProps> = ({ onSelectEvent }) => {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<Registration | null>(null);
  const [selectedCertificate, setSelectedCertificate] = useState<Registration | null>(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  // Feedback State
  const [feedbackEventId, setFeedbackEventId] = useState<string | null>(null);
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState<string>('');

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const data = await api.getMyRegistrations();
      setRegistrations(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const handleCancel = async (id: string) => {
    if (!confirm('Are you sure you want to cancel your event registration?')) return;
    try {
      await api.cancelRegistration(id);
      fetchRegistrations();
    } catch (err: any) {
      alert(err.message || 'Failed to cancel registration');
    }
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackEventId || !comment) return;
    try {
      await api.submitFeedback(feedbackEventId, rating, comment);
      alert('Thank you! Your feedback has been submitted.');
      setFeedbackEventId(null);
      setComment('');
    } catch (err: any) {
      alert(err.message || 'Failed to submit feedback');
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Student Profile Header Banner */}
      <div className="bg-gradient-to-r from-[#004ac6] to-[#2563eb] rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <img
            src={user.avatar}
            alt={user.name}
            className="w-20 h-20 rounded-2xl object-cover border-2 border-white/40 shadow-lg cursor-pointer hover:opacity-90 transition-opacity"
            onClick={() => setProfileModalOpen(true)}
          />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black">{user.name}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/20 uppercase tracking-wider">
                {user.role} ({user.position || 'Student'})
              </span>
              <button
                onClick={() => setProfileModalOpen(true)}
                className="p-1 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                title="Edit Profile Details"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-white/80 flex items-center gap-2">
              <Building className="w-3.5 h-3.5" /> {user.department} • ID: {user.studentId}
            </p>
            <p className="text-xs text-white/70">{user.email} {user.phone ? `• ${user.phone}` : ''}</p>
          </div>
        </div>

        {/* Stats Pills */}
        <div className="flex items-center gap-4 bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/20">
          <div className="text-center px-4">
            <span className="text-2xl font-black text-white">{registrations.length}</span>
            <p className="text-[11px] text-white/80 font-medium">Active Passes</p>
          </div>
          <div className="h-8 w-px bg-white/20" />
          <div className="text-center px-4">
            <span className="text-2xl font-black text-emerald-300">100%</span>
            <p className="text-[11px] text-white/80 font-medium">RSVP Status</p>
          </div>
        </div>
      </div>

      {/* Registrations List Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-extrabold text-[#191b23]">My Event Passes & Certificates</h2>
            <p className="text-xs text-[#737686]">View confirmed passes, QR passes, and auto-generated certificates</p>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-xs text-[#737686]">Loading your tickets...</div>
        ) : registrations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {registrations.map((reg) => {
              const event = reg.eventId;
              if (!event) return null;

              return (
                <div
                  key={reg._id}
                  className="bg-white rounded-2xl border border-[#e1e2ed] p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
                >
                  <div className="flex gap-4">
                    <img
                      src={event.image}
                      alt={event.title}
                      className="w-24 h-24 rounded-xl object-cover shrink-0"
                    />
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#eeefff] text-[#004ac6]">
                        {event.category}
                      </span>
                      <h3
                        onClick={() => onSelectEvent(event)}
                        className="text-base font-bold text-[#191b23] hover:text-[#004ac6] cursor-pointer truncate"
                      >
                        {event.title}
                      </h3>
                      
                      <div className="text-xs text-[#737686] space-y-0.5">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-[#004ac6]" />
                          <span>{new Date(event.date).toLocaleDateString()} • {event.time}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-[#004ac6]" />
                          <span className="truncate">{event.location}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-[#f3f3fe] flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[11px] font-mono text-[#004ac6] font-bold">
                      Pass ID: {reg.ticketCode}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedCertificate(reg)}
                        className="px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold flex items-center gap-1 shadow-sm"
                      >
                        <Award className="w-3.5 h-3.5" /> Certificate
                      </button>

                      <button
                        onClick={() => setFeedbackEventId(event._id)}
                        className="px-2.5 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white text-xs font-bold flex items-center gap-1 transition-colors"
                      >
                        <Star className="w-3.5 h-3.5" /> Rate Event
                      </button>

                      <button
                        onClick={() => setSelectedTicket(reg)}
                        className="px-3 py-1.5 rounded-lg bg-[#2563eb] text-white text-xs font-bold hover:bg-[#004ac6] flex items-center gap-1.5 shadow-sm"
                      >
                        <QrCode className="w-3.5 h-3.5" /> QR Pass
                      </button>

                      <button
                        onClick={() => handleCancel(reg._id)}
                        title="Cancel Registration"
                        className="p-1.5 text-[#737686] hover:text-[#ba1a1a] hover:bg-[#ffdad6]/40 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white p-12 rounded-3xl border border-[#e1e2ed] text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#f3f3fe] text-[#004ac6] flex items-center justify-center mx-auto">
              <Ticket className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-[#191b23]">No Active Event Passes</h3>
            <p className="text-xs text-[#737686] max-w-sm mx-auto">
              You have not registered for any upcoming events yet. Explore the campus feed and RSVP for events!
            </p>
          </div>
        )}
      </div>

      {/* Ticket Modal */}
      <TicketModal
        registration={selectedTicket}
        onClose={() => setSelectedTicket(null)}
      />

      {/* Certificate Modal */}
      <CertificateModal
        registration={selectedCertificate}
        onClose={() => setSelectedCertificate(null)}
      />

      {/* Profile Modal */}
      <ProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
      />

      {/* Feedback Rating Modal */}
      {feedbackEventId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <form onSubmit={handleFeedbackSubmit} className="bg-white p-6 rounded-3xl w-full max-w-md space-y-4 relative">
            <button type="button" onClick={() => setFeedbackEventId(null)} className="absolute top-4 right-4 p-1 text-[#737686]">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-base font-bold text-[#191b23] flex items-center gap-2">
              <Star className="w-5 h-5 text-amber-500 fill-amber-500" /> Rate & Review Event
            </h3>
            
            <div>
              <label className="block text-xs font-bold text-[#191b23] mb-1">Your Rating</label>
              <div className="flex gap-2 text-2xl">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={star <= rating ? 'text-amber-500' : 'text-gray-300'}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#191b23] mb-1">Feedback Comment *</label>
              <textarea
                required
                rows={3}
                placeholder="Share your experience, speaker quality, or organization..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full px-3 py-2 bg-[#f3f3fe] border border-transparent rounded-xl text-xs focus:outline-none focus:border-[#004ac6] text-[#191b23]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-[#2563eb] text-white font-bold text-xs shadow-md"
            >
              Submit Feedback
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
