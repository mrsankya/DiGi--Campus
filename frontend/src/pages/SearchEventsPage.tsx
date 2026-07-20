import React, { useState } from 'react';
import { Search, Filter, RefreshCw, Tag, Building } from 'lucide-react';
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

  const categories = ['All', 'Tech', 'Cultural', 'Sports', 'Academic', 'Workshop', 'Seminar'];
  const departments = ['All', 'Computer Science', 'Information Technology', 'Fine Arts & Music', 'Sports', 'Environmental Science'];

  const filteredEvents = events.filter((e) => {
    const matchesCategory = selectedCategory === 'All' || e.category === selectedCategory;
    const matchesDept = selectedDepartment === 'All' || e.department === selectedDepartment;
    const matchesSearch = searchQuery === '' ||
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.organizer.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesDept && matchesSearch;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-[#191b23]">Search & Discover Events</h1>
        <p className="text-xs text-[#434655] mt-1">Filter by department, category, or search keywords across campus</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Filter Sidebar */}
        <div className="lg:col-span-1 space-y-6 bg-white p-6 rounded-2xl border border-[#e1e2ed] h-fit">
          <div className="flex items-center justify-between border-b border-[#e1e2ed] pb-4">
            <h3 className="text-sm font-bold text-[#191b23] flex items-center gap-2">
              <Filter className="w-4 h-4 text-[#004ac6]" /> Filters
            </h3>
            <button
              onClick={() => {
                setSelectedCategory('All');
                setSelectedDepartment('All');
                setSearchQuery('');
              }}
              className="text-[11px] font-semibold text-[#004ac6] hover:underline flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" /> Reset
            </button>
          </div>

          {/* Search Input */}
          <div>
            <label className="block text-xs font-bold text-[#191b23] mb-1.5">Search Keywords</label>
            <div className="relative">
              <Search className="w-4 h-4 text-[#737686] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Title, venue, club..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-[#f3f3fe] border border-transparent rounded-xl text-xs focus:outline-none focus:border-[#004ac6] focus:bg-white text-[#191b23]"
              />
            </div>
          </div>

          {/* Categories */}
          <div>
            <label className="block text-xs font-bold text-[#191b23] mb-2 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-[#004ac6]" /> Category
            </label>
            <div className="space-y-1.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-colors flex items-center justify-between ${
                    selectedCategory === cat
                      ? 'bg-[#eeefff] text-[#004ac6] font-bold'
                      : 'text-[#434655] hover:bg-[#f3f3fe]'
                  }`}
                >
                  <span>{cat}</span>
                  {selectedCategory === cat && <span className="w-2 h-2 rounded-full bg-[#004ac6]" />}
                </button>
              ))}
            </div>
          </div>

          {/* Department Filter */}
          <div>
            <label className="block text-xs font-bold text-[#191b23] mb-1.5 flex items-center gap-1">
              <Building className="w-3.5 h-3.5 text-[#004ac6]" /> Department
            </label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full px-3 py-2 bg-[#f3f3fe] border border-transparent rounded-xl text-xs focus:outline-none focus:border-[#004ac6] text-[#191b23]"
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
            <p className="text-xs text-[#737686]">
              Showing <span className="font-bold text-[#191b23]">{filteredEvents.length}</span> events found
            </p>
          </div>

          {filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredEvents.map((event) => (
                <EventCard
                  key={event._id}
                  event={event}
                  onSelect={onSelectEvent}
                  onQuickRegister={onQuickRegister}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white p-12 rounded-2xl border border-[#e1e2ed] text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#f3f3fe] text-[#737686] flex items-center justify-center mx-auto">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-[#191b23]">No matching events found</h3>
              <p className="text-xs text-[#737686] max-w-sm mx-auto">
                Try clearing your search query or switching categories to browse other campus events.
              </p>
              <button
                onClick={() => {
                  setSelectedCategory('All');
                  setSelectedDepartment('All');
                  setSearchQuery('');
                }}
                className="px-4 py-2 rounded-xl bg-[#2563eb] text-white text-xs font-bold shadow-sm"
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
