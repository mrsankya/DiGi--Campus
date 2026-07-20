import React from 'react';
import { Sparkles, Calendar, MapPin, ArrowRight, Zap, Trophy, Music, Laptop, BookOpen, Flame, Star, Compass } from 'lucide-react';
import type { EventItem } from '../services/api';
import { EventCard } from '../components/EventCard';

interface EventDiscoveryPageProps {
  events: EventItem[];
  onSelectEvent: (event: EventItem) => void;
  onExploreCategory: (category: string) => void;
  onQuickRegister: (event: EventItem) => void;
}

export const EventDiscoveryPage: React.FC<EventDiscoveryPageProps> = ({
  events,
  onSelectEvent,
  onExploreCategory,
  onQuickRegister
}) => {
  const featuredEvent = events.find(e => e.isFeatured) || events[0];
  const upcomingEvents = events.filter(e => e._id !== featuredEvent?._id).slice(0, 6);

  const categories = [
    { name: 'Tech', icon: Laptop, color: 'from-blue-500/20 to-cyan-500/20 text-blue-400 border-blue-500/30', count: '12 Events' },
    { name: 'Cultural', icon: Music, color: 'from-purple-500/20 to-pink-500/20 text-purple-400 border-purple-500/30', count: '8 Events' },
    { name: 'Sports', icon: Trophy, color: 'from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30', count: '15 Events' },
    { name: 'Academic', icon: BookOpen, color: 'from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30', count: '10 Events' },
    { name: 'Workshop', icon: Zap, color: 'from-indigo-500/20 to-blue-500/20 text-indigo-400 border-indigo-500/30', count: '6 Events' }
  ];

  return (
    <div className="space-y-12 animate-fade-in">
      {/* Hero Banner Section (Glassmorphism & Radial Glow) */}
      {featuredEvent && (
        <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#090d16] text-white border border-indigo-500/30 shadow-2xl group">
          {/* Glowing Radial Background Accents */}
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600/30 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-600/30 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
          
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 p-8 sm:p-14 items-center">
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold uppercase tracking-wider text-sky-300 shadow-inner">
                <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300 animate-spin" style={{ animationDuration: '6s' }} />
                <span>Featured Campus Fest</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-none font-heading shimmer-text">
                {featuredEvent.title}
              </h1>

              <p className="text-slate-300 text-sm sm:text-base line-clamp-3 leading-relaxed max-w-2xl font-normal">
                {featuredEvent.description}
              </p>

              <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm font-semibold text-slate-200 pt-2">
                <div className="flex items-center gap-2 bg-white/10 border border-white/10 px-4 py-2 rounded-2xl backdrop-blur-md shadow-sm">
                  <Calendar className="w-4 h-4 text-sky-400" />
                  <span>{new Date(featuredEvent.date).toLocaleDateString()} • {featuredEvent.time}</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 border border-white/10 px-4 py-2 rounded-2xl backdrop-blur-md shadow-sm">
                  <MapPin className="w-4 h-4 text-purple-400" />
                  <span>{featuredEvent.location}</span>
                </div>
              </div>

              <div className="pt-4 flex flex-wrap items-center gap-4">
                <button
                  onClick={() => onQuickRegister(featuredEvent)}
                  className="px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-sm shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-105 active:scale-95 transition-all flex items-center gap-2.5"
                >
                  <Flame className="w-5 h-5 fill-amber-400 text-amber-400" /> Claim Pass & Register Now
                </button>

                <button
                  onClick={() => onSelectEvent(featuredEvent)}
                  className="px-6 py-4 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-sm backdrop-blur-md hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                >
                  <span>View Details</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl group-hover:scale-[1.02] transition-transform duration-500">
                <img
                  src={featuredEvent.image}
                  alt={featuredEvent.title}
                  className="w-full h-72 sm:h-96 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                
                <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-200">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span>Registered: <strong className="text-white">{featuredEvent.registeredCount} / {featuredEvent.capacity}</strong></span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase">
                    {featuredEvent.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Category Pills Header */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-indigo-400" />
            <h2 className="text-xl sm:text-2xl font-black text-white font-heading">Explore Event Categories</h2>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.name}
                onClick={() => onExploreCategory(cat.name)}
                className={`p-4 rounded-2xl bg-gradient-to-br ${cat.color} border backdrop-blur-md text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group relative overflow-hidden`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10 group-hover:scale-110 transition-transform">
                    <Icon className="w-5 h-5" />
                  </div>
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </div>
                <h3 className="font-extrabold text-sm text-white font-heading">{cat.name}</h3>
                <span className="text-[11px] text-slate-400 font-medium">{cat.count}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Upcoming Events Grid Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-white font-heading">Upcoming Campus Events</h2>
            <p className="text-xs text-slate-400 mt-0.5">Discover, RSVP, and participate in upcoming campus competitions</p>
          </div>

          <button
            onClick={() => onExploreCategory('')}
            className="text-xs font-extrabold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
          >
            <span>View All ({events.length})</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {upcomingEvents.map((event) => (
            <EventCard
              key={event._id}
              event={event}
              onClick={() => onSelectEvent(event)}
              onQuickRegister={() => onQuickRegister(event)}
            />
          ))}
        </div>
      </section>
    </div>
  );
};
