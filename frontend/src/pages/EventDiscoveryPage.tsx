import React from 'react';
import { Sparkles, Calendar, MapPin, ArrowRight, Zap, Trophy, Music, Laptop, BookOpen } from 'lucide-react';
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
    { name: 'Tech', icon: Laptop, color: 'bg-blue-500/10 text-blue-600', count: '12 Events' },
    { name: 'Cultural', icon: Music, color: 'bg-orange-500/10 text-orange-600', count: '8 Events' },
    { name: 'Sports', icon: Trophy, color: 'bg-emerald-500/10 text-emerald-600', count: '15 Events' },
    { name: 'Academic', icon: BookOpen, color: 'bg-purple-500/10 text-purple-600', count: '10 Events' },
    { name: 'Workshop', icon: Zap, color: 'bg-cyan-500/10 text-cyan-600', count: '6 Events' }
  ];

  return (
    <div className="space-y-12">
      {/* Hero Banner Section */}
      {featuredEvent && (
        <section className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#004ac6] via-[#2563eb] to-[#0053db] text-white shadow-2xl">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent pointer-events-none" />
          
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 sm:p-12 items-center">
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider text-white">
                <Sparkles className="w-3.5 h-3.5" /> Featured Campus Event
              </div>

              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
                {featuredEvent.title}
              </h1>

              <p className="text-white/90 text-xs sm:text-base line-clamp-3 leading-relaxed max-w-2xl font-light">
                {featuredEvent.description}
              </p>

              <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm font-semibold text-white/90 pt-1">
                <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl backdrop-blur-sm">
                  <Calendar className="w-4 h-4 text-sky-300" />
                  <span>{new Date(featuredEvent.date).toLocaleDateString()} • {featuredEvent.time}</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl backdrop-blur-sm">
                  <MapPin className="w-4 h-4 text-sky-300" />
                  <span>{featuredEvent.location}</span>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-2">
                <button
                  onClick={() => onSelectEvent(featuredEvent)}
                  className="px-6 py-3 rounded-xl bg-white text-[#004ac6] hover:bg-sky-50 font-extrabold text-sm shadow-lg transition-all hover:scale-105 flex items-center gap-2"
                >
                  Explore Event & RSVP <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Responsive Poster Image (Visible on Mobile & Desktop) */}
            <div className="lg:col-span-5 block">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20 transform lg:rotate-2 hover:rotate-0 transition-transform duration-500 max-h-64 lg:max-h-80">
                <img
                  src={featuredEvent.image}
                  alt={featuredEvent.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Category Pills Bar */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-[#191b23]">Browse by Category</h2>
          <span className="text-xs text-[#737686]">Select a category to filter</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.name}
                onClick={() => onExploreCategory(cat.name)}
                className="bg-white p-4 rounded-2xl border border-[#e1e2ed] hover:border-[#004ac6] hover:shadow-lg transition-all cursor-pointer group text-center space-y-2"
              >
                <div className={`w-12 h-12 rounded-xl mx-auto flex items-center justify-center ${cat.color} group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold text-[#191b23] group-hover:text-[#004ac6] transition-colors">{cat.name}</h3>
                <p className="text-[11px] text-[#737686]">{cat.count}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Trending & Upcoming Events Grid */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-extrabold text-[#191b23]">Upcoming Events</h2>
            <p className="text-xs text-[#434655] mt-1">Check out what is happening around campus this month</p>
          </div>

          <button
            onClick={() => onExploreCategory('All')}
            className="text-xs font-bold text-[#004ac6] hover:underline flex items-center gap-1"
          >
            View All ({events.length}) <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {upcomingEvents.map((event) => (
            <EventCard
              key={event._id}
              event={event}
              onSelect={onSelectEvent}
              onQuickRegister={onQuickRegister}
            />
          ))}
        </div>
      </section>
    </div>
  );
};
