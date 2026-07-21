import React, { useState } from 'react';
import { Search, Filter, RefreshCw, Tag, Building, Heart, ArrowUpDown, DollarSign } from 'lucide-react';
import { EventCard } from '../components/EventCard';
import type { EventItem } from '../services/api';

interface SearchEventsPageProps {
  events: EventItem[];
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onSelectEvent: (event: EventItem) => void;
  onQuickRegister: (event: EventItem) => void;
}

export const SearchEventsPage: React.FC<SearchEventsPageProps> = ({
  events,
  selectedCategory,
  setSelectedCategory,
  searchQuery,
  setSearchQuery,
  onSelectEvent,
  onQuickRegister
}) => {
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [savedOnly, setSavedOnly] = useState(false);
  const [priceFilter, setPriceFilter] = useState<'All' | 'Free' | 'Paid'>('All');
  const [sortBy, setSortBy] = useState<'date' | 'popularity' | 'price'>('popularity');

  const categories = ['All', 'Tech', 'Cultural', 'Sports', 'Academic', 'Workshop', 'Seminar'];
  const departments = ['All', 'Computer Science', 'Information Technology', 'Fine Arts & Music', 'Sports', 'Environmental Science'];

  const getSavedEventIds = (): string[] => {
    try {
      return JSON.parse(localStorage.getItem('digicampus_saved_events') || '[]');
    } catch {
      return [];
    }
  };

  const savedIds = getSavedEventIds();

  const filteredEvents = events
    .filter((e) => {
      const matchesCategory = selectedCategory === 'All' || e.category === selectedCategory;
      const matchesDept = selectedDepartment === 'All' || e.department === selectedDepartment;
      const matchesSearch = searchQuery === '' ||
        e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.organizer.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSaved = !savedOnly || savedIds.includes(e._id);
      const matchesPrice = priceFilter === 'All' || (priceFilter === 'Free' ? e.price === 0 : e.price > 0);

      return matchesCategory && matchesDept && matchesSearch && matchesSaved && matchesPrice;
    })
    .sort((a, b) => {
      if (sortBy === 'popularity') {
        return b.registeredCount - a.registeredCount;
      }
      if (sortBy === 'date') {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      }
      if (sortBy === 'price') {
        return a.price - b.price;
      }
      return 0;
    });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white font-heading">Search & Discover Events</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Filter by department, category, saved status, or search keywords across campus</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Filter Sidebar */}
        <div className="lg:col-span-1 space-y-6 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 h-fit shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Filter className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Filters
            </h3>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSelectedDepartment('All');
                setSearchQuery('');
                setSavedOnly(false);
                setPriceFilter('All');
                setSortBy('popularity');
              }}
              className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" /> Reset
            </button>
          </div>

          {/* Search Input */}
          <div>
            <label className="block text-xs font-bold text-slate-900 dark:text-white mb-1.5">Search Keywords</label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Title, venue, club..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:border-blue-600 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Saved Events Quick Filter */}
          <div>
            <button
              onClick={() => setSavedOnly(!savedOnly)}
              className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-between border ${
                savedOnly
                  ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Heart className={`w-4 h-4 ${savedOnly ? 'text-rose-500 fill-rose-500' : 'text-slate-400'}`} /> Saved Events Only
              </span>
              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-white dark:bg-slate-900">
                {savedIds.length}
              </span>
            </button>
          </div>

          {/* Sort By Dropdown */}
          <div>
            <label className="block text-xs font-bold text-slate-900 dark:text-white mb-1.5 flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> Sort Order
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:border-blue-600 text-slate-900 dark:text-white font-bold"
            >
              <option value="popularity">🔥 Most Popular (Highest RSVPs)</option>
              <option value="date">📅 Date (Earliest First)</option>
              <option value="price">💵 Price (Free First)</option>
            </select>
          </div>

          {/* Categories */}
          <div>
            <label className="block text-xs font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> Category
            </label>
            <div className="space-y-1.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-between ${
                    selectedCategory === cat
                      ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-extrabold border border-blue-300 dark:border-blue-800'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <span>{cat}</span>
                  {selectedCategory === cat && <span className="w-2 h-2 rounded-full bg-blue-600" />}
                </button>
              ))}
            </div>
          </div>

          {/* Price Filter */}
          <div>
            <label className="block text-xs font-bold text-slate-900 dark:text-white mb-1.5 flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> Entry Fee
            </label>
            <div className="grid grid-cols-3 gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              {(['All', 'Free', 'Paid'] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPriceFilter(p)}
                  className={`py-1 rounded-lg text-xs font-bold transition-all ${
                    priceFilter === p
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Department Filter */}
          <div>
            <label className="block text-xs font-bold text-slate-900 dark:text-white mb-1.5 flex items-center gap-1">
              <Building className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" /> Department
            </label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:border-blue-600 text-slate-900 dark:text-white font-bold"
            >
              {departments.map((dept) => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Right Event Results */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Showing <span className="font-extrabold text-slate-900 dark:text-white">{filteredEvents.length}</span> campus events found
            </p>
          </div>

          {filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
                <EventCard
                  key={event._id}
                  event={event}
                  onClick={() => onSelectEvent(event)}
                  onQuickRegister={onQuickRegister}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 p-12 rounded-3xl border border-slate-200 dark:border-slate-800 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">No matching events found</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Try clearing your search query or adjusting your filters to browse other campus events.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('All');
                  setSelectedDepartment('All');
                  setSearchQuery('');
                  setSavedOnly(false);
                  setPriceFilter('All');
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold shadow-md hover:bg-blue-700 transition-all"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

