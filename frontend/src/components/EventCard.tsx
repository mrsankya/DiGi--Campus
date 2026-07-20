import React from 'react';
import { Calendar, MapPin, Users, ArrowRight } from 'lucide-react';
import type { EventItem } from '../services/api';

interface EventCardProps {
  event: EventItem;
  onSelect: (event: EventItem) => void;
  onQuickRegister?: (event: EventItem) => void;
}

export const EventCard: React.FC<EventCardProps> = ({ event, onSelect, onQuickRegister }) => {
  const formattedDate = new Date(event.date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const spotsLeft = event.capacity - event.registeredCount;
  const isFull = spotsLeft <= 0;

  const categoryColors: Record<string, string> = {
    Tech: 'bg-[#2563eb] text-white',
    Cultural: 'bg-[#bc4800] text-white',
    Sports: 'bg-[#16a34a] text-white',
    Academic: 'bg-[#7c3aed] text-white',
    Workshop: 'bg-[#0284c7] text-white',
    Seminar: 'bg-[#475569] text-white'
  };

  return (
    <div 
      onClick={() => onSelect(event)}
      className="group bg-white rounded-2xl border border-[#e1e2ed] overflow-hidden hover:shadow-xl hover:border-[#2563eb]/30 transition-all duration-300 flex flex-col cursor-pointer transform hover:-translate-y-1"
    >
      {/* Image Banner */}
      <div className="relative h-48 w-full overflow-hidden bg-[#ededf9]">
        <img
          src={event.image}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Category Pill */}
        <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold shadow-md ${categoryColors[event.category] || 'bg-gray-800 text-white'}`}>
          {event.category}
        </span>

        {/* Price Tag */}
        <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-semibold bg-white/90 backdrop-blur-md text-[#191b23] shadow-md">
          {event.price === 0 ? 'Free Entry' : `$${event.price}`}
        </span>

        {/* Date badge */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-white text-xs font-semibold">
          <Calendar className="w-3.5 h-3.5" />
          <span>{formattedDate}</span>
          <span className="opacity-75">• {event.time}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h3 className="text-lg font-bold text-[#191b23] group-hover:text-[#004ac6] transition-colors line-clamp-2 leading-snug">
            {event.title}
          </h3>
          <p className="text-xs text-[#434655] mt-1.5 line-clamp-2 leading-relaxed">
            {event.description}
          </p>
        </div>

        {/* Meta Specs */}
        <div className="space-y-2 text-xs text-[#737686] pt-2 border-t border-[#f3f3fe]">
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-[#004ac6] shrink-0" />
            <span className="truncate">{event.location}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-[#434655]">
              <Users className="w-3.5 h-3.5 text-[#737686]" />
              <span>{event.registeredCount} / {event.capacity} Attendees</span>
            </div>
            {spotsLeft > 0 ? (
              <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                {spotsLeft} seats left
              </span>
            ) : (
              <span className="text-[11px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                Housefull
              </span>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-2 flex items-center justify-between gap-2">
          <span className="text-xs font-medium text-[#004ac6] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
            Details & Agenda <ArrowRight className="w-3.5 h-3.5" />
          </span>

          {onQuickRegister && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onQuickRegister(event);
              }}
              disabled={isFull}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                isFull 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-[#2563eb] text-white hover:bg-[#004ac6] shadow-sm'
              }`}
            >
              {isFull ? 'Full' : 'RSVP'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
