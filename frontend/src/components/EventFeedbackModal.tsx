import React, { useState, useEffect } from 'react';
import { X, Star, MessageSquare, Trash2, Sparkles, CheckCircle } from 'lucide-react';
import { api } from '../services/api';
import type { EventItem, FeedbackItem } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface EventFeedbackModalProps {
  event: EventItem | null;
  isOpen: boolean;
  onClose: () => void;
  onFeedbackSubmitted?: () => void;
}

export const EventFeedbackModal: React.FC<EventFeedbackModalProps> = ({ event, isOpen, onClose, onFeedbackSubmitted }) => {
  const { user } = useAuth();
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [comment, setComment] = useState('');
  const [reviews, setReviews] = useState<FeedbackItem[]>([]);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [totalReviews, setTotalReviews] = useState<number>(0);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const loadFeedback = async () => {
    if (!event) return;
    setLoading(true);
    try {
      const data = await api.getEventFeedback(event._id);
      setReviews(data.reviews || []);
      setAverageRating(data.averageRating || 0);
      setTotalReviews(data.totalReviews || 0);

      // Check if user already submitted a review
      if (user) {
        const myReview = data.reviews.find(r => r.userId === user.id || r.userId === user._id);
        if (myReview) {
          setRating(myReview.rating);
          setComment(myReview.comment);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && event) {
      loadFeedback();
      setError('');
      setSuccessMsg('');
    }
  }, [isOpen, event]);

  if (!isOpen || !event) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('Please sign in to submit an event review');
      return;
    }
    if (!comment.trim()) {
      setError('Please write a brief comment or feedback review');
      return;
    }

    setError('');
    setSubmitting(true);
    try {
      const res = await api.submitFeedback(event._id, rating, comment);
      setSuccessMsg('🎉 Thank you! Your review has been published (+25 XP Awarded!)');
      setAverageRating(res.averageRating);
      setTotalReviews(res.totalReviews);
      await loadFeedback();
      if (onFeedbackSubmitted) onFeedbackSubmitted();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    try {
      await api.deleteFeedback(reviewId);
      setComment('');
      setRating(5);
      await loadFeedback();
      if (onFeedbackSubmitted) onFeedbackSubmitted();
    } catch (err: any) {
      alert(err.message || 'Failed to delete review');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
      <div className="bg-white dark:bg-[#0f172a] text-slate-900 dark:text-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden relative max-h-[90vh] flex flex-col transition-colors">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-b from-amber-50/80 to-white dark:from-slate-800/80 dark:to-[#0f172a]">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500 text-white uppercase tracking-wider">
                Event Reviews & Ratings
              </span>
              <div className="flex items-center text-amber-500 font-extrabold text-xs">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 mr-1" />
                <span>{averageRating > 0 ? averageRating.toFixed(1) : 'New'}</span>
                <span className="text-slate-400 ml-1 font-normal">({totalReviews} reviews)</span>
              </div>
            </div>
            <h2 className="text-xl font-black text-slate-900 dark:text-white mt-1 font-heading">
              {event.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close Feedback Modal"
            className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-xs font-bold border border-rose-200 dark:border-rose-800">
              {error}
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-600" /> {successMsg}
            </div>
          )}

          {/* Write / Edit Review Form */}
          {user ? (
            <form onSubmit={handleSubmit} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5 uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-amber-500" /> Rate & Review Event (+25 XP)
                </h3>
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                  Posting as {user.name}
                </span>
              </div>

              {/* Star Rating Picker */}
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">Your Rating</label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const active = (hoverRating || rating) >= star;
                    return (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 rounded-lg hover:bg-amber-100 dark:hover:bg-amber-950/50 transition-colors focus:outline-none cursor-pointer"
                      >
                        <Star
                          className={`w-7 h-7 transition-all ${
                            active
                              ? 'fill-amber-400 text-amber-400 scale-110'
                              : 'text-slate-300 dark:text-slate-600'
                          }`}
                        />
                      </button>
                    );
                  })}
                  <span className="ml-2 text-xs font-extrabold text-amber-600 dark:text-amber-400">
                    {rating === 5 ? '⭐⭐⭐⭐⭐ Exceptional!' : rating === 4 ? '⭐⭐⭐⭐ Great Event' : rating === 3 ? '⭐⭐⭐ Good' : rating === 2 ? '⭐⭐ Fair' : '⭐ Needs Improvement'}
                  </span>
                </div>
              </div>

              {/* Comment Textarea */}
              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">Review Feedback & Highlights</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Share what you enjoyed, speaker highlights, workshop takeaways, or venue experience..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold focus:outline-none focus:border-amber-500 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs shadow-md transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  <Star className="w-4 h-4 fill-white" />
                  <span>{submitting ? 'Publishing...' : 'Publish Student Review'}</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-center space-y-1">
              <p className="text-xs font-extrabold text-amber-800 dark:text-amber-300">
                Want to rate and review this event?
              </p>
              <p className="text-[11px] text-amber-700 dark:text-amber-400">
                Please sign in to share your feedback and earn +25 XP Gamification Points!
              </p>
            </div>
          )}

          {/* Student Reviews Feed */}
          <div className="space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center justify-between">
              <span>Student Feedback ({reviews.length})</span>
              {reviews.length > 0 && (
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                  Avg Rating: {averageRating.toFixed(1)} / 5.0
                </span>
              )}
            </h3>

            {loading ? (
              <div className="py-8 text-center text-xs text-slate-400 font-bold">
                Loading reviews...
              </div>
            ) : reviews.length > 0 ? (
              <div className="space-y-3">
                {reviews.map((r) => {
                  const isMyReview = user && (r.userId === user.id || r.userId === user._id);
                  return (
                    <div
                      key={r._id}
                      className={`p-4 rounded-2xl border transition-all ${
                        isMyReview
                          ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800'
                          : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={r.userAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                            alt={r.userName}
                            className="w-8 h-8 rounded-full object-cover border border-slate-300 dark:border-slate-600"
                          />
                          <div>
                            <span className="text-xs font-extrabold text-slate-900 dark:text-white block">
                              {r.userName} {isMyReview && <span className="text-[10px] text-amber-600 font-mono">(You)</span>}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {new Date(r.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="flex items-center text-amber-400">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                className={`w-3.5 h-3.5 ${
                                  s <= r.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-600'
                                }`}
                              />
                            ))}
                          </div>

                          {(isMyReview || user?.role === 'admin') && (
                            <button
                              onClick={() => handleDeleteReview(r._id)}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded-md transition-colors"
                              title="Delete review"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium pl-10">
                        "{r.comment}"
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center bg-slate-50 dark:bg-slate-900/40 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                <MessageSquare className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-xs font-extrabold text-slate-700 dark:text-slate-300">No Reviews Yet</p>
                <p className="text-[11px] text-slate-400">Be the first student to review and rate this campus event!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
