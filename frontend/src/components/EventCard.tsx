import React from 'react';
import { Calendar, MapPin, Users, ArrowRight } from 'lucide-react';
import type { EventItem } from '../services/api';

interface EventCardProps {
  event: EventItem;
  onClick: () => void;
  onQuickRegister?: (event: EventItem) => void;
}

export const EventCard: React.FC<EventCardProps> = ({ event, onClick, onQuickRegister }) => {
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
      className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden flex flex-col cursor-pointer hover:shadow-xl hover:border-blue-500/50 transition-all duration-300 transform hover:-translate-y-1"
    >
      {/* Image Banner */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-100 dark:bg-slate-950">
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Category Pill */}
        <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-md ${categoryColors[event.category] || 'bg-slate-800 text-white'}`}>
          {event.category}
        </span>

        {/* Price Tag */}
        <span className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-black bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-md border border-slate-200 dark:border-slate-800">
          {event.price === 0 ? 'FREE ENTRY' : `$${event.price}`}
        </span>

        {/* Date badge */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-white text-xs font-semibold bg-black/60 px-3 py-1 rounded-xl backdrop-blur-md">
          <Calendar className="w-3.5 h-3.5 text-sky-400" />
          <span>{formattedDate}</span>
          <span className="opacity-75">• {event.time}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 leading-snug font-heading">
            {event.title}
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 line-clamp-2 leading-relaxed font-normal">
            {event.description}
          </p>
        </div>

        {/* Seat Fill Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> {event.registeredCount} / {event.capacity} Registered
            </span>
            {spotsLeft > 0 ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">{spotsLeft} seats left</span>
            ) : (
              <span className="text-rose-600 dark:text-rose-400 font-bold">Housefull</span>
            )}
          </div>
          <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(fillPercentage, 100)}%` }}
            />
          </div>
        </div>

        {/* Location Specs */}
        <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
          <MapPin className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
          <span className="truncate">{event.location}</span>
        </div>

        {/* Footer Actions */}
        <div className="pt-2 flex items-center justify-between gap-2">
          <span className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            View Details <ArrowRight className="w-3.5 h-3.5" />
          </span>

          {onQuickRegister && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onQuickRegister(event);
              }}
              disabled={isFull}
              className={`px-4 py-2 rounded-xl text-xs font-bold shadow-sm transition-all ${
                isFull 
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
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
