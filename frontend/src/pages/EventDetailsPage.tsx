import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, ArrowLeft, CheckCircle2, Star, Download } from 'lucide-react';
import type { EventItem, Feedback } from '../services/api';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { TeamRegistrationModal } from '../components/TeamRegistrationModal';

interface EventDetailsPageProps {
  eventId: string;
  onBack: () => void;
  onOpenAuthModal: () => void;
}

export const EventDetailsPage: React.FC<EventDetailsPageProps> = ({ eventId, onBack, onOpenAuthModal }) => {
  const { user } = useAuth();
  const [event, setEvent] = useState<EventItem | null>(null);
  const [feedbackData, setFeedbackData] = useState<{ avgRating: number; totalCount: number; feedbacks: Feedback[] }>({ avgRating: 0, totalCount: 0, feedbacks: [] });
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [teamModalOpen, setTeamModalOpen] = useState(false);
  const [error, setError] = useState('');

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const [eventData, fbData] = await Promise.all([
        api.getEventById(eventId),
        api.getFeedback(eventId).catch(() => ({ avgRating: 0, totalCount: 0, feedbacks: [] }))
      ]);

      setEvent(eventData);
      setFeedbackData(fbData);

      if (user) {
        const myRegs = await api.getMyRegistrations();
        const found = myRegs.some(r => (r.eventId?._id || r.eventId) === eventId);
        setIsRegistered(found);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load event details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [eventId, user]);

  const handleRSVP = async () => {
    if (!user) {
      onOpenAuthModal();
      return;
    }

    try {
      setRegistering(true);
      setError('');
      await api.registerForEvent(eventId);
      setIsRegistered(true);
      alert('🎉 RSVP Confirmed! Your digital entry pass and QR code have been generated in your dashboard.');
      fetchDetails();
    } catch (err: any) {
      setError(err.message || 'RSVP failed');
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-xs text-[#737686]">Loading event details...</div>;
  }

  if (!event) {
    return (
      <div className="p-12 text-center space-y-4">
        <p className="text-sm font-bold text-[#ba1a1a]">Event not found</p>
        <button onClick={onBack} className="text-xs font-bold text-[#004ac6] hover:underline">← Back to Discover</button>
      </div>
    );
  }

  const isFull = event.registeredCount >= event.capacity;

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto">
      {/* Navigation Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="px-3.5 py-1.5 rounded-xl bg-white border border-[#c3c6d7] text-xs font-bold text-[#191b23] hover:border-[#004ac6] hover:text-[#004ac6] transition-all flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Discover
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => api.downloadGoogleCalendarICS(event)}
            className="px-3.5 py-1.5 rounded-xl bg-white border border-[#c3c6d7] text-xs font-bold text-[#191b23] hover:border-[#004ac6] hover:text-[#004ac6] transition-all flex items-center gap-1.5"
          >
            <Download className="w-4 h-4 text-[#004ac6]" /> Add to Google Calendar (.ics)
          </button>
        </div>
      </div>

      {/* Hero Banner Image */}
      <div className="relative h-64 sm:h-96 rounded-3xl overflow-hidden border border-[#e1e2ed] shadow-lg">
        <img
          src={event.bannerImage || event.image}
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-6 sm:p-10 text-white">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-[#004ac6] uppercase tracking-wider">
              {event.category}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-md">
              {event.department}
            </span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white max-w-3xl leading-tight">
            {event.title}
          </h1>
        </div>
      </div>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Description & Agenda */}
        <div className="lg:col-span-2 space-y-8">
          {/* Overview Card */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#e1e2ed] shadow-sm space-y-4">
            <h2 className="text-xl font-bold text-[#191b23]">About This Event</h2>
            <p className="text-sm text-[#434655] leading-relaxed whitespace-pre-line">
              {event.description}
            </p>
          </div>

          {/* Agenda Timeline */}
          {event.agenda && event.agenda.length > 0 && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#e1e2ed] shadow-sm space-y-6">
              <h2 className="text-xl font-bold text-[#191b23]">Schedule & Agenda</h2>
              <div className="space-y-4 relative border-l-2 border-[#eeefff] ml-3 pl-6">
                {event.agenda.map((ag, idx) => (
                  <div key={idx} className="relative">
                    <div className="absolute -left-[31px] top-1.5 w-3.5 h-3.5 rounded-full bg-[#004ac6] border-2 border-white" />
                    <span className="text-xs font-bold text-[#004ac6]">{ag.time}</span>
                    <h3 className="text-sm font-bold text-[#191b23] mt-0.5">{ag.title}</h3>
                    <p className="text-xs text-[#737686] mt-0.5">{ag.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Student Ratings & Feedback Section */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#e1e2ed] shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[#f3f3fe] pb-4">
              <div>
                <h2 className="text-xl font-bold text-[#191b23]">Student Feedback & Ratings</h2>
                <p className="text-xs text-[#737686]">{feedbackData.totalCount} Verified Reviews</p>
              </div>
              <div className="flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
                <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                <span className="text-lg font-black text-amber-900">{feedbackData.avgRating || '5.0'}</span>
              </div>
            </div>

            <div className="space-y-3">
              {feedbackData.feedbacks.length > 0 ? (
                feedbackData.feedbacks.map((fb) => (
                  <div key={fb._id} className="p-4 rounded-2xl bg-[#f3f3fe]/60 border border-[#e1e2ed] space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#191b23]">{fb.userName}</span>
                      <div className="flex text-amber-500 text-xs">
                        {'★'.repeat(fb.rating)}
                      </div>
                    </div>
                    <p className="text-xs text-[#434655]">{fb.comment}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-[#737686] italic">No reviews yet. Be the first to attend and rate!</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Event Info Card */}
        <div className="space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#e1e2ed] shadow-sm space-y-6 sticky top-24">
            <div className="space-y-4 text-xs text-[#434655]">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-[#004ac6] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-[#191b23] block text-sm">Date & Time</span>
                  <span>{new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
                  <span className="block text-[#737686]">{event.time}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#004ac6] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-[#191b23] block text-sm">Venue</span>
                  <span>{event.location}</span>
                  <span className="block text-[#737686]">{event.venue}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-[#004ac6] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-[#191b23] block text-sm">Seat Availability</span>
                  <span>{event.registeredCount} / {event.capacity} Confirmed</span>
                </div>
              </div>
            </div>

            {/* Price Tag */}
            <div className="p-4 rounded-2xl bg-[#eeefff] flex items-center justify-between">
              <span className="text-xs font-bold text-[#004ac6]">Ticket Price</span>
              <span className="text-xl font-black text-[#004ac6]">
                {event.price === 0 ? 'FREE ENTRY' : `$${event.price}`}
              </span>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-[#ffdad6] text-[#93000a] text-xs font-medium border border-[#ffb4ab]">
                {error}
              </div>
            )}

            {/* RSVP Button */}
            {isRegistered ? (
              <div className="p-3 rounded-2xl bg-emerald-100 text-emerald-900 text-center font-bold text-xs flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700" /> You Are Registered!
              </div>
            ) : (
              <div className="space-y-2">
                <button
                  onClick={handleRSVP}
                  disabled={isFull || registering}
                  className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm shadow-md hover:shadow-xl transition-all disabled:opacity-50 cursor-pointer"
                >
                  {registering ? 'Securing Pass...' : isFull ? 'Event Housefull' : 'Individual RSVP Pass'}
                </button>

                <button
                  onClick={() => {
                    if (!user) {
                      onOpenAuthModal();
                    } else {
                      setTeamModalOpen(true);
                    }
                  }}
                  disabled={isFull}
                  className="w-full py-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-blue-700 dark:text-blue-300 font-extrabold text-xs shadow-xs transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>Create / Join Team Pass (2-4 Members)</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Team Registration Modal */}
      <TeamRegistrationModal
        event={event}
        isOpen={teamModalOpen}
        onClose={() => setTeamModalOpen(false)}
        onSuccess={() => {
          setIsRegistered(true);
          fetchDetails();
        }}
      />
    </div>
  );
};
