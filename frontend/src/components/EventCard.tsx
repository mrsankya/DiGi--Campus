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
    Tech: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
    Cultural: 'bg-purple-500/20 text-purple-400 border-purple-500/40',
    Sports: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
    Academic: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
    Workshop: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/40',
    Seminar: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40'
  };

  return (
    <div 
      onClick={onClick}
      className="group glass-card glass-card-hover rounded-3xl overflow-hidden flex flex-col cursor-pointer border border-white/10 relative"
    >
      {/* Image Banner */}
      <div className="relative h-52 w-full overflow-hidden bg-slate-900">
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/20 to-transparent" />
        
        {/* Category Pill */}
        <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider backdrop-blur-md border ${categoryColors[event.category] || 'bg-slate-800/80 text-white border-white/20'}`}>
          {event.category}
        </span>

        {/* Price Tag */}
        <span className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-black bg-black/60 backdrop-blur-md text-emerald-400 border border-emerald-500/30 shadow-md">
          {event.price === 0 ? 'FREE ENTRY' : `$${event.price}`}
        </span>

        {/* Date badge */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-slate-200 text-xs font-semibold bg-black/50 px-3 py-1 rounded-xl backdrop-blur-md border border-white/10">
          <Calendar className="w-3.5 h-3.5 text-sky-400" />
          <span>{formattedDate}</span>
          <span className="opacity-75">• {event.time}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h3 className="text-lg font-black text-white group-hover:text-sky-400 transition-colors line-clamp-2 leading-snug font-heading">
            {event.title}
          </h3>
          <p className="text-xs text-slate-300 mt-2 line-clamp-2 leading-relaxed font-normal">
            {event.description}
          </p>
        </div>

        {/* Seat Fill Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400">
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-indigo-400" /> {event.registeredCount} / {event.capacity} Registered
            </span>
            {spotsLeft > 0 ? (
              <span className="text-emerald-400 font-bold">{spotsLeft} seats left</span>
            ) : (
              <span className="text-rose-400 font-bold">Housefull</span>
            )}
          </div>
          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(fillPercentage, 100)}%` }}
            />
          </div>
        </div>

        {/* Location Specs */}
        <div className="flex items-center gap-1.5 text-xs text-slate-400 pt-2 border-t border-white/10">
          <MapPin className="w-3.5 h-3.5 text-purple-400 shrink-0" />
          <span className="truncate">{event.location}</span>
        </div>

        {/* Footer Actions */}
        <div className="pt-2 flex items-center justify-between gap-2">
          <span className="text-xs font-bold text-sky-400 flex items-center gap-1 group-hover:translate-x-1.5 transition-transform">
            View Pass Details <ArrowRight className="w-3.5 h-3.5" />
          </span>

          {onQuickRegister && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onQuickRegister(event);
              }}
              disabled={isFull}
              className={`px-4 py-2 rounded-xl text-xs font-black shadow-md transition-all flex items-center gap-1 ${
                isFull 
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-white/5' 
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-500/20 hover:scale-105 active:scale-95'
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
