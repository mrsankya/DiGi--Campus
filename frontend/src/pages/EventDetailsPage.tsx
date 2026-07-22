import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, ArrowLeft, CheckCircle2, Star, Download, MessageSquarePlus } from 'lucide-react';
import type { EventItem, FeedbackItem } from '../services/api';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { TeamRegistrationModal } from '../components/TeamRegistrationModal';
import { EventFeedbackModal } from '../components/EventFeedbackModal';

interface EventDetailsPageProps {
  eventId: string;
  onBack: () => void;
  onOpenAuthModal: () => void;
}

export const EventDetailsPage: React.FC<EventDetailsPageProps> = ({ eventId, onBack, onOpenAuthModal }) => {
  const { user } = useAuth();
  const [event, setEvent] = useState<EventItem | null>(null);
  const [reviews, setReviews] = useState<FeedbackItem[]>([]);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [totalReviews, setTotalReviews] = useState<number>(0);

  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [teamModalOpen, setTeamModalOpen] = useState(false);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [error, setError] = useState('');

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const [eventData, fbData] = await Promise.all([
        api.getEventById(eventId),
        api.getEventFeedback(eventId).catch(() => ({ reviews: [], averageRating: 0, totalReviews: 0 }))
      ]);

      setEvent(eventData);
      setReviews(fbData.reviews || []);
      setAverageRating(fbData.averageRating || 0);
      setTotalReviews(fbData.totalReviews || 0);

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
    return <div className="p-12 text-center text-xs text-slate-500 font-bold">Loading event details...</div>;
  }

  if (!event) {
    return (
      <div className="p-12 text-center space-y-4">
        <p className="text-sm font-bold text-rose-600">Event not found</p>
        <button onClick={onBack} className="text-xs font-bold text-blue-600 hover:underline">← Back to Discover</button>
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
          className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white hover:border-blue-600 hover:text-blue-600 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Discover
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => api.downloadGoogleCalendarICS(event)}
            className="px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white hover:border-blue-600 hover:text-blue-600 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Download className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Add to Calendar (.ics)
          </button>
        </div>
      </div>

      {/* Hero Banner Image */}
      <div className="relative h-64 sm:h-96 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl">
        <img
          src={event.bannerImage || event.image}
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent flex flex-col justify-end p-6 sm:p-10 text-white">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full text-xs font-black bg-blue-600 uppercase tracking-wider shadow-md">
              {event.category}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/20 backdrop-blur-md">
              {event.department}
            </span>
            {averageRating > 0 && (
              <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-500 text-white shadow-md flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-white" /> {averageRating.toFixed(1)} / 5.0 ({totalReviews})
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-white max-w-3xl leading-tight font-heading">
            {event.title}
          </h1>
        </div>
      </div>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Columns: Description, Agenda, Feedback */}
        <div className="lg:col-span-2 space-y-8">
          {/* Overview Card */}
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h2 className="text-xl font-black text-slate-900 dark:text-white font-heading">About This Event</h2>
            <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-line font-medium">
              {event.description}
            </p>
          </div>

          {/* Agenda Timeline */}
          {event.agenda && event.agenda.length > 0 && (
            <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
              <h2 className="text-xl font-black text-slate-900 dark:text-white font-heading">Schedule & Agenda</h2>
              <div className="space-y-4 relative border-l-2 border-blue-200 dark:border-blue-900 ml-3 pl-6">
                {event.agenda.map((ag, idx) => (
                  <div key={idx} className="relative">
                    <div className="absolute -left-[31px] top-1.5 w-3.5 h-3.5 rounded-full bg-blue-600 border-2 border-white dark:border-slate-900" />
                    <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400">{ag.time}</span>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">{ag.title}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{ag.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Student Ratings & Feedback Section */}
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white font-heading">Student Feedback & Ratings</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {totalReviews} Verified Student Review{totalReviews === 1 ? '' : 's'}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 bg-amber-50 dark:bg-amber-950/60 px-3.5 py-2 rounded-2xl border border-amber-200 dark:border-amber-800">
                  <Star className="w-5 h-5 text-amber-500 fill-amber-400" />
                  <span className="text-lg font-black text-amber-900 dark:text-amber-200">
                    {averageRating > 0 ? averageRating.toFixed(1) : 'New'}
                  </span>
                </div>

                <button
                  onClick={() => setFeedbackModalOpen(true)}
                  className="px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <MessageSquarePlus className="w-4 h-4" />
                  <span>Rate & Review (+25 XP)</span>
                </button>
              </div>
            </div>

            {/* Reviews list */}
            <div className="space-y-3">
              {reviews.length > 0 ? (
                reviews.map((fb) => (
                  <div key={fb._id} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img
                          src={fb.userAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                          alt={fb.userName}
                          className="w-7 h-7 rounded-full object-cover border border-slate-300 dark:border-slate-600"
                        />
                        <span className="text-xs font-extrabold text-slate-900 dark:text-white">{fb.userName}</span>
                      </div>
                      <div className="flex text-amber-400">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3.5 h-3.5 ${s <= fb.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-600'}`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium pl-9">
                      "{fb.comment}"
                    </p>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-xs text-slate-400 font-medium italic">
                  No reviews submitted yet. Click "Rate & Review" above to be the first!
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Event Specs & Actions Card */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-md space-y-6 sticky top-24">
            <div className="space-y-4 text-xs text-slate-700 dark:text-slate-300 font-medium">
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-extrabold text-slate-900 dark:text-white block text-sm">Date & Time</span>
                  <span>{new Date(event.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
                  <span className="block text-slate-500 dark:text-slate-400">{event.time}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-extrabold text-slate-900 dark:text-white block text-sm">Venue</span>
                  <span>{event.location}</span>
                  <span className="block text-slate-500 dark:text-slate-400">{event.venue}</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-extrabold text-slate-900 dark:text-white block text-sm">Seat Availability</span>
                  <span>{event.registeredCount} / {event.capacity} Confirmed</span>
                </div>
              </div>
            </div>

            {/* Price Tag */}
            <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center justify-between">
              <span className="text-xs font-black text-blue-900 dark:text-blue-200">Ticket Price</span>
              <span className="text-xl font-black text-blue-600 dark:text-blue-400">
                {event.price === 0 ? 'FREE ENTRY' : `$${event.price}`}
              </span>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-xs font-bold border border-rose-200 dark:border-rose-800">
                {error}
              </div>
            )}

            {/* RSVP Buttons */}
            {isRegistered ? (
              <div className="p-3.5 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300 text-center font-extrabold text-xs flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> You Are Registered!
              </div>
            ) : (
              <div className="space-y-3">
                <button
                  onClick={handleRSVP}
                  disabled={isFull || registering}
                  className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm shadow-lg hover:shadow-blue-500/25 transition-all disabled:opacity-50 cursor-pointer"
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

      {/* Event Feedback & Rating Modal */}
      <EventFeedbackModal
        event={event}
        isOpen={feedbackModalOpen}
        onClose={() => setFeedbackModalOpen(false)}
        onFeedbackSubmitted={() => fetchDetails()}
      />
    </div>
  );
};
