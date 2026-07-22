import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';
import { CreateEventModal } from './components/CreateEventModal';
import { DiGiBotModal } from './components/DiGiBotModal';
import { EventDiscoveryPage } from './pages/EventDiscoveryPage';
import { SearchEventsPage } from './pages/SearchEventsPage';
import { EventDetailsPage } from './pages/EventDetailsPage';
import { StudentDashboardPage } from './pages/StudentDashboardPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import type { EventItem } from './services/api';
import { api } from './services/api';

const INITIAL_DEFAULT_EVENTS: EventItem[] = [
  {
    _id: 'default-1',
    title: 'DiGi Hackathon 2026: AI & Cloud Innovation Summit',
    description: 'The flagship 36-hour inter-college hackathon with AI workshops, cash prizes, and Cloudflare mentorship!',
    category: 'Tech',
    date: '2026-08-15',
    time: '09:00 AM',
    location: 'Main Auditorium & Innovation Lab',
    venue: 'Campus Tech Hub',
    organizer: 'Computer Science Department & Coding Club',
    department: 'CSE',
    image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=1200',
    capacity: 250,
    registeredCount: 184,
    price: 0,
    isFeatured: true,
    status: 'Upcoming'
  },
  {
    _id: 'default-2',
    title: 'TechnoVerse 2026: National Tech Symposium',
    description: 'Join top engineering students across the state for project expos, paper presentations, and robotics battles.',
    category: 'Tech',
    date: '2026-08-20',
    time: '10:00 AM',
    location: 'Seminar Hall B',
    venue: 'Engineering Block',
    organizer: 'IEEE Student Branch',
    department: 'ECE',
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800',
    capacity: 150,
    registeredCount: 92,
    price: 0,
    isFeatured: false,
    status: 'Upcoming'
  },
  {
    _id: 'default-3',
    title: 'Sanskriti 2026: Annual Cultural & Music Festival',
    description: 'Experience live band performances, dance competitions, fashion shows, and food stalls at the biggest campus fest.',
    category: 'Cultural',
    date: '2026-09-05',
    time: '04:00 PM',
    location: 'Open Air Theatre (OAT)',
    venue: 'Campus Grounds',
    organizer: 'Cultural Student Council',
    department: 'General',
    image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=800',
    capacity: 500,
    registeredCount: 340,
    price: 0,
    isFeatured: false,
    status: 'Upcoming'
  }
];

export function AppContent() {
  const { openAuthModal, user } = useAuth();
  const [currentTab, setCurrentTab] = useState<'discovery' | 'search' | 'dashboard' | 'admin'>('discovery');
  const [events, setEvents] = useState<EventItem[]>(INITIAL_DEFAULT_EVENTS);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const fetchEvents = async () => {
    try {
      const data = await api.getEvents();
      if (data && data.length > 0) {
        setEvents(data);
      }
    } catch (err) {
      console.error('Failed to fetch events from API, keeping fallback events', err);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [refreshTrigger]);

  const handleSelectEvent = (event: EventItem) => {
    setSelectedEventId(event._id);
  };

  const handleBack = () => {
    setSelectedEventId(null);
  };

  const triggerRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleExploreCategory = (category: string) => {
    setSelectedCategory(category);
    setCurrentTab('search');
  };

  const handleQuickRegister = async (event: EventItem) => {
    if (!user) {
      openAuthModal('login');
      return;
    }
    try {
      await api.registerForEvent(event._id);
      alert(`🎉 Registered successfully for ${event.title}! Your QR ticket is now ready in My Passes.`);
      triggerRefresh();
    } catch (err: any) {
      alert(err.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={(tab) => {
          setCurrentTab(tab);
          setSelectedEventId(null);
        }}
        openCreateModal={() => setCreateModalOpen(true)}
        onSearch={(q) => {
          setSearchQuery(q);
          if (currentTab !== 'search') setCurrentTab('search');
        }}
        events={events}
      />

      {/* Main Page Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {selectedEventId ? (
          <EventDetailsPage
            eventId={selectedEventId}
            onBack={handleBack}
            onOpenAuthModal={() => openAuthModal('login')}
          />
        ) : currentTab === 'discovery' ? (
          <EventDiscoveryPage
            events={events}
            onSelectEvent={handleSelectEvent}
            onExploreCategory={handleExploreCategory}
            onQuickRegister={handleQuickRegister}
            key={refreshTrigger}
          />
        ) : currentTab === 'search' ? (
          <SearchEventsPage
            events={events}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onSelectEvent={handleSelectEvent}
            onQuickRegister={handleQuickRegister}
            key={refreshTrigger}
          />
        ) : currentTab === 'dashboard' ? (
          <StudentDashboardPage
            onSelectEvent={handleSelectEvent}
            key={refreshTrigger}
          />
        ) : (
          <AdminDashboardPage
            onEventCreatedOrUpdated={triggerRefresh}
            onOpenCreateModal={() => setCreateModalOpen(true)}
            key={refreshTrigger}
          />
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* Modals & Floating AI Assistant */}
      <AuthModal />
      <CreateEventModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onEventCreated={triggerRefresh}
      />
      <DiGiBotModal />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
