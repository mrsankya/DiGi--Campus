import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, ArrowRight, Heart, Star } from 'lucide-react';
import type { EventItem } from '../services/api';

interface EventCardProps {
  event: EventItem;
  onClick: () => void;
  onQuickRegister?: (event: EventItem) => void;
}

export const EventCard: React.FC<EventCardProps> = ({ event, onClick, onQuickRegister }) => {
  const [isSaved, setIsSaved] = useState<boolean>(false);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('digicampus_saved_events') || '[]');
      setIsSaved(saved.includes(event._id));
    } catch (e) {
      setIsSaved(false);
    }
  }, [event._id]);

  const toggleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const saved: string[] = JSON.parse(localStorage.getItem('digicampus_saved_events') || '[]');
      let updated: string[];
      if (saved.includes(event._id)) {
        updated = saved.filter(id => id !== event._id);
        setIsSaved(false);
      } else {
        updated = [...saved, event._id];
        setIsSaved(true);
      }
      localStorage.setItem('digicampus_saved_events', JSON.stringify(updated));
    } catch (err) {
      console.error(err);
    }
  };

  const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const spotsLeft = event.capacity - event.registeredCount;
  const isFull = spotsLeft <= 0;
  const fillPercentage = Math.round((event.registeredCount / event.capacity) * 100);

  const categoryColors: Record<string, string> = {
    Tech: 'bg-blue-600 text-white',
    Cultural: 'bg-purple-600 text-white',
    Sports: 'bg-emerald-600 text-white',
    Academic: 'bg-amber-600 text-white',
    Workshop: 'bg-indigo-600 text-white',
    Seminar: 'bg-cyan-600 text-white'
  };

  return (
    <div 
      onClick={onClick}
      className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden flex flex-col cursor-pointer hover:shadow-xl hover:border-blue-500 transition-all duration-300 transform hover:-translate-y-1"
    >
      {/* Image Banner */}
      <div className="relative h-52 w-full overflow-hidden bg-slate-200 dark:bg-slate-950">
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        
        {/* Category Pill & Rating Badge */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span className={`px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider shadow-md ${categoryColors[event.category] || 'bg-slate-800 text-white'}`}>
            {event.category}
          </span>
          {event.averageRating !== undefined && event.averageRating > 0 && (
            <span className="px-2.5 py-1 rounded-full text-xs font-black bg-amber-500 text-white shadow-md flex items-center gap-1">
              <Star className="w-3 h-3 fill-white text-white" />
              <span>{event.averageRating.toFixed(1)}</span>
              {event.totalReviews && event.totalReviews > 0 && (
                <span className="text-[10px] opacity-90">({event.totalReviews})</span>
              )}
            </span>
          )}
        </div>

        {/* Price Tag & Heart Bookmark */}
        <div className="absolute top-3 right-3 flex items-center gap-2">
          <button
            onClick={toggleSave}
            title={isSaved ? 'Remove from Saved' : 'Save Event'}
            className="p-1.5 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-md text-white transition-all hover:scale-110"
          >
            <Heart className={`w-4 h-4 ${isSaved ? 'text-rose-500 fill-rose-500' : 'text-white'}`} />
          </button>
          <span className="px-3 py-1.5 rounded-full text-xs font-black bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-md border border-slate-200 dark:border-slate-800">
            {event.price === 0 ? 'FREE ENTRY' : `$${event.price}`}
          </span>
        </div>

        {/* Date badge */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-white text-xs font-bold bg-black/75 px-3 py-1.5 rounded-xl backdrop-blur-md">
          <Calendar className="w-4 h-4 text-sky-400" />
          <span>{formattedDate}</span>
          <span className="opacity-90">• {event.time}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h3 className="text-xl font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 leading-snug font-heading">
            {event.title}
          </h3>
          <p className="text-sm text-slate-700 dark:text-slate-200 mt-2.5 line-clamp-2 leading-relaxed font-medium">
            {event.description}
          </p>
        </div>

        {/* Seat Fill Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-extrabold text-slate-800 dark:text-slate-200">
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" /> {event.registeredCount} / {event.capacity} Registered
            </span>
            {spotsLeft > 0 ? (
              <span className="text-emerald-700 dark:text-emerald-400 font-black px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950">{spotsLeft} seats left</span>
            ) : (
              <span className="text-rose-700 dark:text-rose-400 font-black px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950">Housefull</span>
            )}
          </div>
          <div className="w-full h-2.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(fillPercentage, 100)}%` }}
            />
          </div>
        </div>

        {/* Location Specs */}
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 pt-3 border-t border-slate-200 dark:border-slate-800">
          <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
          <span className="truncate">{event.location}</span>
        </div>

        {/* Footer Actions */}
        <div className="pt-2 flex items-center justify-between gap-2">
          <span className="text-xs font-black text-blue-600 dark:text-blue-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            View Details <ArrowRight className="w-4 h-4" />
          </span>

          {onQuickRegister && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onQuickRegister(event);
              }}
              disabled={isFull}
              className={`px-4 py-2 rounded-xl text-xs font-black shadow-md transition-all ${
                isFull 
                  ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20 hover:scale-105'
              }`}
            >
              {isFull ? 'Full' : 'RSVP Now'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
