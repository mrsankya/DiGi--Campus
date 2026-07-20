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
    { name: 'Tech', icon: Laptop, badgeBg: 'bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-200 border-blue-300 dark:border-blue-800', count: '12 Events' },
    { name: 'Cultural', icon: Music, badgeBg: 'bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-200 border-purple-300 dark:border-purple-800', count: '8 Events' },
    { name: 'Sports', icon: Trophy, badgeBg: 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 border-emerald-300 dark:border-emerald-800', count: '15 Events' },
    { name: 'Academic', icon: BookOpen, badgeBg: 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200 border-amber-300 dark:border-amber-800', count: '10 Events' },
    { name: 'Workshop', icon: Zap, badgeBg: 'bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-200 border-indigo-300 dark:border-indigo-800', count: '6 Events' }
  ];

  return (
    <div className="space-y-12 animate-fade-in">
      {/* Hero Banner Section (Solid Deep High-Contrast Banner) */}
      {featuredEvent && (
        <section className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white shadow-xl">
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 sm:p-12 items-center">
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-xs font-black uppercase tracking-wider text-white shadow-inner">
                <Sparkles className="w-4 h-4 text-amber-300 fill-amber-300" />
                <span>Featured Campus Fest</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight font-heading text-white">
                {featuredEvent.title}
              </h1>

              <p className="text-white text-base sm:text-lg line-clamp-3 leading-relaxed max-w-2xl font-medium">
                {featuredEvent.description}
              </p>

              <div className="flex flex-wrap items-center gap-3 text-sm font-extrabold text-white pt-1">
                <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-xl border border-white/30">
                  <Calendar className="w-4 h-4 text-sky-200" />
                  <span>{new Date(featuredEvent.date).toLocaleDateString()} • {featuredEvent.time}</span>
                </div>
                <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-xl border border-white/30">
                  <MapPin className="w-4 h-4 text-amber-200" />
                  <span>{featuredEvent.location}</span>
                </div>
              </div>

              <div className="pt-2 flex flex-wrap items-center gap-4">
                <button
                  onClick={() => onQuickRegister(featuredEvent)}
                  className="px-7 py-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                >
                  <Flame className="w-5 h-5 fill-slate-950 text-slate-950" /> Register & Claim Pass Now
                </button>

                <button
                  onClick={() => onSelectEvent(featuredEvent)}
                  className="px-6 py-4 rounded-xl bg-white/15 hover:bg-white/25 border border-white/30 text-white font-black text-sm hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                >
                  <span>View Details</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden border-2 border-white/30 shadow-2xl">
                <img
                  src={featuredEvent.image}
                  alt={featuredEvent.title}
                  className="w-full h-72 sm:h-88 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                
                <div className="absolute bottom-4 left-4 right-4 p-3.5 rounded-xl bg-slate-950/90 backdrop-blur-md border border-white/20 text-xs font-bold flex items-center justify-between text-white">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span>Registered: <strong className="text-white text-sm">{featuredEvent.registeredCount} / {featuredEvent.capacity}</strong></span>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-500 text-white text-xs font-black uppercase shadow-sm">
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
            <Compass className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-heading">Explore Event Categories</h2>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.name}
                onClick={() => onExploreCategory(cat.name)}
                className={`p-5 rounded-2xl ${cat.badgeBg} border text-left transition-all duration-200 hover:-translate-y-1 hover:shadow-md group relative overflow-hidden`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 flex items-center justify-center border border-slate-300 dark:border-slate-800 shadow-sm group-hover:scale-110 transition-transform">
                    <Icon className="w-5 h-5" />
                  </div>
                  <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </div>
                <h3 className="font-black text-base font-heading">{cat.name}</h3>
                <span className="text-xs font-extrabold opacity-90">{cat.count}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Upcoming Events Grid Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-heading">Upcoming Campus Events</h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 font-medium">Discover, RSVP, and participate in upcoming campus competitions</p>
          </div>

          <button
            onClick={() => onExploreCategory('')}
            className="text-sm font-black text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 transition-colors"
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
