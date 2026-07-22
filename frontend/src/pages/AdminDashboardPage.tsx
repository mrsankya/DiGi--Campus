import React, { useState, useEffect } from 'react';
import { BarChart3, Calendar, Edit, Trash2, PlusCircle, Shield, Megaphone, Lock, Crown, QrCode, Clock, Check, XCircle } from 'lucide-react';
import { api } from '../services/api';
import type { EventItem, User, Announcement } from '../services/api';
import { EditEventModal } from '../components/EditEventModal';
import { ParticipantRosterModal } from '../components/ParticipantRosterModal';
import { QRScannerModal } from '../components/QRScannerModal';

interface AdminDashboardPageProps {
  onEventCreatedOrUpdated: () => void;
  onOpenCreateModal: () => void;
}

export const AdminDashboardPage: React.FC<AdminDashboardPageProps> = ({ onEventCreatedOrUpdated, onOpenCreateModal }) => {
  const [activeTab, setActiveTab] = useState<'analytics' | 'events' | 'users' | 'announcements' | 'approvals'>('analytics');
  
  // State
  const [analytics, setAnalytics] = useState<any>(null);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [pendingEvents, setPendingEvents] = useState<EventItem[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  // Modals
  const [selectedEditEvent, setSelectedEditEvent] = useState<EventItem | null>(null);
  const [selectedRosterEvent, setSelectedRosterEvent] = useState<EventItem | null>(null);
  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false);
  const [resetPasswordUserId, setResetPasswordUserId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');

  // Announcement Form
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annCategory, setAnnCategory] = useState<'Urgent' | 'General' | 'Venue Update'>('General');

  // Filter
  const [eventStatusFilter, setEventStatusFilter] = useState('All');

  const ROOT_SUPER_ADMIN_EMAILS = ['mr.sankya@digicampus.edu', 'mr.sankya@campuspulse.edu'];

  const loadAdminData = async () => {
    try {
      const [analyticsData, eventsData, pendingData, usersData, announcementsData] = await Promise.all([
        api.getAnalytics().catch(() => null),
        api.getEvents(),
        api.getPendingEvents().catch(() => []),
        api.getAllUsers().catch(() => []),
        api.getAnnouncements().catch(() => [])
      ]);

      setAnalytics(analyticsData);
      setEvents(eventsData);
      setPendingEvents(pendingData);
      setUsers(usersData);
      setAnnouncements(announcementsData);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleDeleteEvent = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) return;
    try {
      await api.deleteEvent(id);
      await loadAdminData();
      onEventCreatedOrUpdated();
    } catch (err: any) {
      alert(err.message || 'Failed to delete event');
    }
  };

  const handleUpdateRole = async (userId: string, role: string, position: string) => {
    try {
      await api.updateUserRole(userId, role, position);
      await loadAdminData();
      alert('User role & position updated successfully!');
    } catch (err: any) {
      alert(err.message || 'Failed to update user role');
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: string) => {
    try {
      const nextStatus = currentStatus === 'deactivated' ? 'active' : 'deactivated';
      await api.toggleUserStatus(userId, nextStatus);
      await loadAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to toggle status');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetPasswordUserId || !newPassword) return;
    try {
      const res = await api.adminResetPassword(resetPasswordUserId, newPassword);
      alert(res.message || 'Password reset successfully');
      setResetPasswordUserId(null);
      setNewPassword('');
    } catch (err: any) {
      alert(err.message || 'Failed to reset password');
    }
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle || !annContent) return;
    try {
      await api.createAnnouncement({ title: annTitle, content: annContent, category: annCategory });
      setAnnTitle('');
      setAnnContent('');
      await loadAdminData();
      alert('Campus Announcement posted!');
    } catch (err: any) {
      alert(err.message || 'Failed to post announcement');
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    try {
      await api.deleteAnnouncement(id);
      await loadAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete announcement');
    }
  };

  const handleApprovalAction = async (eventId: string, approvalStatus: 'Approved' | 'Rejected') => {
    try {
      await api.updateEventApproval(eventId, approvalStatus);
      alert(`Event ${approvalStatus === 'Approved' ? 'approved & published live!' : 'rejected.'}`);
      await loadAdminData();
      onEventCreatedOrUpdated();
    } catch (err: any) {
      alert(err.message || 'Failed to update event approval status');
    }
  };

  const filteredEvents = events.filter(e => {
    if (eventStatusFilter === 'All') return true;
    return e.status === eventStatusFilter;
  });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e1e2ed] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-[#004ac6] text-white uppercase tracking-wider">
              Management Suite
            </span>
            <span className="text-xs font-semibold text-[#737686]">Super Admin Control</span>
          </div>
          <h1 className="text-3xl font-black text-[#191b23] mt-1">Admin & Coordinator Console</h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsQrScannerOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition-all"
          >
            <QrCode className="w-4 h-4" /> 📷 Live Ticket QR Scanner
          </button>
          <button
            onClick={onOpenCreateModal}
            className="px-4 py-2.5 rounded-xl bg-[#2563eb] hover:bg-[#004ac6] text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition-all"
          >
            <PlusCircle className="w-4 h-4" /> Host New Event
          </button>
        </div>
      </div>

      {/* Console Tabs */}
      <div className="flex border-b border-[#e1e2ed] gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`pb-3 px-4 text-xs font-extrabold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'analytics' ? 'border-[#004ac6] text-[#004ac6]' : 'border-transparent text-[#737686] hover:text-[#191b23]'
          }`}
        >
          <BarChart3 className="w-4 h-4" /> Analytics & Insights
        </button>
        <button
          onClick={() => setActiveTab('events')}
          className={`pb-3 px-4 text-xs font-extrabold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'events' ? 'border-[#004ac6] text-[#004ac6]' : 'border-transparent text-[#737686] hover:text-[#191b23]'
          }`}
        >
          <Calendar className="w-4 h-4" /> Event Manager ({events.length})
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`pb-3 px-4 text-xs font-extrabold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'users' ? 'border-[#004ac6] text-[#004ac6]' : 'border-transparent text-[#737686] hover:text-[#191b23]'
          }`}
        >
          <Shield className="w-4 h-4" /> Users & Coordinators ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('announcements')}
          className={`pb-3 px-4 text-xs font-extrabold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'announcements' ? 'border-[#004ac6] text-[#004ac6]' : 'border-transparent text-[#737686] hover:text-[#191b23]'
          }`}
        >
          <Megaphone className="w-4 h-4" /> Bulletins ({announcements.length})
        </button>
        <button
          onClick={() => setActiveTab('approvals')}
          className={`pb-3 px-4 text-xs font-extrabold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'approvals' ? 'border-amber-500 text-amber-600 dark:text-amber-400' : 'border-transparent text-[#737686] hover:text-[#191b23]'
          }`}
        >
          <Clock className="w-4 h-4 text-amber-500" /> Approval Queue ({pendingEvents.length})
          {pendingEvents.length > 0 && (
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
          )}
        </button>
      </div>

      {/* Tab 1: Analytics & Insights */}
      {activeTab === 'analytics' && (
        <div className="space-y-8">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-[#e1e2ed] shadow-sm space-y-2">
              <span className="text-xs font-semibold text-[#737686] uppercase">Total Events</span>
              <p className="text-3xl font-black text-[#191b23]">{analytics?.totalEvents || events.length}</p>
              <p className="text-[11px] text-[#004ac6] font-medium">{analytics?.upcomingEvents || 0} Upcoming • {analytics?.completedEvents || 0} Completed</p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-[#e1e2ed] shadow-sm space-y-2">
              <span className="text-xs font-semibold text-[#737686] uppercase">Total RSVPs / Passes</span>
              <p className="text-3xl font-black text-[#2563eb]">{analytics?.totalRegistrations || 0}</p>
              <p className="text-[11px] text-emerald-600 font-medium">100% Verified RSVPs</p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-[#e1e2ed] shadow-sm space-y-2">
              <span className="text-xs font-semibold text-[#737686] uppercase">Active Campus Users</span>
              <p className="text-3xl font-black text-[#191b23]">{analytics?.totalUsers || users.length}</p>
              <p className="text-[11px] text-[#737686]">Students & Faculty Coordinators</p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-[#e1e2ed] shadow-sm space-y-2">
              <span className="text-xs font-semibold text-[#737686] uppercase">Participation Rate</span>
              <p className="text-3xl font-black text-emerald-600">84.2%</p>
              <p className="text-[11px] text-[#737686]">Average seat fill ratio</p>
            </div>
          </div>

          {/* Popular Events Ranking */}
          <div className="bg-white p-6 rounded-3xl border border-[#e1e2ed] shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-[#191b23]">Popular Events & Seat Allocation</h3>
            <div className="space-y-4">
              {events.slice(0, 5).map((ev) => {
                const percentage = Math.round((ev.registeredCount / ev.capacity) * 100);
                return (
                  <div key={ev._id} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-bold text-[#191b23]">
                      <span>{ev.title} ({ev.category})</span>
                      <span>{ev.registeredCount} / {ev.capacity} Seats ({percentage}%)</span>
                    </div>
                    <div className="w-full h-3 rounded-full bg-[#f3f3fe] overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#004ac6] to-[#2563eb] rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Event Manager */}
      {activeTab === 'events' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#191b23]">Filter Status:</span>
              {['All', 'Upcoming', 'Ongoing', 'Completed', 'Cancelled'].map((st) => (
                <button
                  key={st}
                  onClick={() => setEventStatusFilter(st)}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold transition-colors ${
                    eventStatusFilter === st ? 'bg-[#004ac6] text-white' : 'bg-white border text-[#434655]'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-[#e1e2ed] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#e1e2ed] text-[#737686] font-bold uppercase tracking-wider bg-[#faf8ff]">
                    <th className="py-3 px-4">Event Title</th>
                    <th className="py-3 px-4">Category & Dept</th>
                    <th className="py-3 px-4">Date & Time</th>
                    <th className="py-3 px-4">Capacity</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f3f3fe]">
                  {filteredEvents.map((ev) => (
                    <tr key={ev._id} className="hover:bg-[#f3f3fe]/50 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-[#191b23]">
                        <div className="flex items-center gap-3">
                          <img src={ev.image} alt={ev.title} className="w-10 h-10 rounded-xl object-cover" />
                          <div>
                            <div className="line-clamp-1">{ev.title}</div>
                            <div className="text-[10px] text-[#737686] font-normal">{ev.location}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-[#434655]">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#eeefff] text-[#004ac6]">
                          {ev.category}
                        </span>
                        <div className="text-[10px] text-[#737686] mt-0.5">{ev.department}</div>
                      </td>
                      <td className="py-3.5 px-4 text-[#434655]">
                        <div>{new Date(ev.date).toLocaleDateString()}</div>
                        <div className="text-[10px] text-[#737686]">{ev.time}</div>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-[#191b23]">
                        {ev.registeredCount} / {ev.capacity}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          ev.status === 'Upcoming' ? 'bg-blue-100 text-blue-800' :
                          ev.status === 'Ongoing' ? 'bg-emerald-100 text-emerald-800' :
                          ev.status === 'Completed' ? 'bg-gray-100 text-gray-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {ev.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedRosterEvent(ev)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white font-bold text-[11px] transition-colors"
                          >
                            Roster
                          </button>
                          <button
                            onClick={() => setSelectedEditEvent(ev)}
                            className="p-1.5 text-[#737686] hover:text-[#004ac6] hover:bg-[#eeefff] rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteEvent(ev._id)}
                            className="p-1.5 text-[#737686] hover:text-[#ba1a1a] hover:bg-[#ffdad6]/40 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Users & Coordinators Control */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-[#e1e2ed] overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#e1e2ed] text-[#737686] font-bold uppercase tracking-wider bg-[#faf8ff]">
                    <th className="py-3 px-4">User</th>
                    <th className="py-3 px-4">Role & Position</th>
                    <th className="py-3 px-4">Department & Student ID</th>
                    <th className="py-3 px-4">Account Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f3f3fe]">
                  {users.map((u) => {
                    const isRootSuperAdmin = ROOT_SUPER_ADMIN_EMAILS.includes(u.email.toLowerCase());

                    return (
                      <tr key={u._id || u.id} className="hover:bg-[#f3f3fe]/50 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-[#191b23]">
                          <div className="flex items-center gap-3">
                            <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-full object-cover border" />
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span>{u.name}</span>
                                {isRootSuperAdmin && (
                                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-amber-400/20 text-amber-800 border border-amber-300 flex items-center gap-1">
                                    <Crown className="w-3 h-3 text-amber-600 fill-amber-500" /> Primary Owner
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-[#737686] font-normal">{u.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          {isRootSuperAdmin ? (
                            <div className="flex items-center gap-1 px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-lg text-amber-900 font-extrabold text-xs w-fit">
                              <Lock className="w-3 h-3 text-amber-600" /> Primary Super Admin
                            </div>
                          ) : (
                            <select
                              value={u.role}
                              onChange={(e) => handleUpdateRole(u._id || u.id!, e.target.value, u.position || '')}
                              className="px-2 py-1 bg-[#f3f3fe] border border-[#c3c6d7] rounded-lg text-xs font-bold text-[#004ac6]"
                            >
                              <option value="student">Student</option>
                              <option value="coordinator">Event Coordinator</option>
                              <option value="admin">Admin / Organizer</option>
                            </select>
                          )}
                          <div className="text-[10px] text-[#737686] mt-0.5">{u.position || 'Student Member'}</div>
                        </td>
                        <td className="py-3.5 px-4 text-[#434655]">
                          <div>{u.department}</div>
                          <div className="text-[10px] text-[#737686] font-mono">{u.studentId}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            u.status === 'deactivated' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {u.status || 'active'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          {isRootSuperAdmin ? (
                            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-1 rounded-md border border-amber-200">
                              Protected Owner Account
                            </span>
                          ) : (
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setResetPasswordUserId(u._id || u.id!)}
                                className="px-2.5 py-1 rounded-lg bg-[#eeefff] text-[#004ac6] hover:bg-[#004ac6] hover:text-white font-bold text-[11px] transition-colors"
                              >
                                Reset Password
                              </button>
                              <button
                                onClick={() => handleToggleUserStatus(u._id || u.id!, u.status || 'active')}
                                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors ${
                                  u.status === 'deactivated'
                                    ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white'
                                    : 'bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white'
                                }`}
                              >
                                {u.status === 'deactivated' ? 'Activate' : 'Deactivate'}
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Campus Announcements */}
      {activeTab === 'announcements' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Post Form */}
          <form onSubmit={handleCreateAnnouncement} className="lg:col-span-1 bg-white p-6 rounded-3xl border border-[#e1e2ed] space-y-4 h-fit">
            <h3 className="text-base font-bold text-[#191b23] flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-[#004ac6]" /> Post Campus Bulletin
            </h3>

            <div>
              <label className="block text-xs font-bold text-[#191b23] mb-1">Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. Registrations Open for Annual Fest 2026"
                value={annTitle}
                onChange={(e) => setAnnTitle(e.target.value)}
                className="w-full px-3 py-2 bg-[#f3f3fe] border border-transparent rounded-xl text-xs focus:outline-none focus:border-[#004ac6] text-[#191b23]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#191b23] mb-1">Category</label>
              <select
                value={annCategory}
                onChange={(e) => setAnnCategory(e.target.value as any)}
                className="w-full px-3 py-2 bg-[#f3f3fe] border border-transparent rounded-xl text-xs focus:outline-none focus:border-[#004ac6] text-[#191b23]"
              >
                <option value="Urgent">Urgent Notice</option>
                <option value="General">General Announcement</option>
                <option value="Venue Update">Venue Update</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#191b23] mb-1">Content *</label>
              <textarea
                required
                rows={4}
                placeholder="Write announcement message for all students..."
                value={annContent}
                onChange={(e) => setAnnContent(e.target.value)}
                className="w-full px-3 py-2 bg-[#f3f3fe] border border-transparent rounded-xl text-xs focus:outline-none focus:border-[#004ac6] text-[#191b23]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-[#2563eb] hover:bg-[#004ac6] text-white text-xs font-bold shadow-md transition-all"
            >
              Post Announcement
            </button>
          </form>

          {/* Bulletin List */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-base font-bold text-[#191b23]">Active Announcements</h3>
            {announcements.map((a) => (
              <div key={a._id} className="bg-white p-5 rounded-2xl border border-[#e1e2ed] space-y-2 relative">
                <div className="flex items-center justify-between">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    a.category === 'Urgent' ? 'bg-rose-100 text-rose-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {a.category}
                  </span>
                  <button
                    onClick={() => handleDeleteAnnouncement(a._id)}
                    className="p-1 text-[#737686] hover:text-[#ba1a1a] rounded-md"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <h4 className="text-sm font-bold text-[#191b23]">{a.title}</h4>
                <p className="text-xs text-[#434655]">{a.content}</p>
                <p className="text-[10px] text-[#737686]">{a.authorName} • {new Date(a.createdAt).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Event Approval Queue */}
      {activeTab === 'approvals' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-500" /> Student Event Approval Queue
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Review and approve student-submitted events before publishing them live to the campus feed.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
              {pendingEvents.length} Pending Submission{pendingEvents.length === 1 ? '' : 's'}
            </span>
          </div>

          {pendingEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pendingEvents.map(event => (
                <div
                  key={event._id}
                  className="bg-white dark:bg-slate-800/90 rounded-3xl border border-amber-300/80 dark:border-amber-700/80 p-6 shadow-md flex flex-col justify-between space-y-4 relative overflow-hidden"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 uppercase">
                        Pending Review
                      </span>
                      <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                        Submitted by: {(event.createdById as any)?.name || 'Student'}
                      </span>
                    </div>

                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white">{event.title}</h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 leading-relaxed">{event.description}</p>

                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-700">
                      <div><span className="font-bold text-slate-900 dark:text-white">Date:</span> {new Date(event.date).toLocaleDateString()}</div>
                      <div><span className="font-bold text-slate-900 dark:text-white">Time:</span> {event.time}</div>
                      <div><span className="font-bold text-slate-900 dark:text-white">Venue:</span> {event.location}</div>
                      <div><span className="font-bold text-slate-900 dark:text-white">Organizer:</span> {event.organizer}</div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex items-center gap-3">
                    <button
                      onClick={() => handleApprovalAction(event._id, 'Approved')}
                      className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Check className="w-4 h-4" /> Approve & Publish Live
                    </button>
                    <button
                      onClick={() => handleApprovalAction(event._id, 'Rejected')}
                      className="px-4 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 font-extrabold text-xs border border-rose-200 dark:border-rose-800 hover:bg-rose-600 hover:text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <XCircle className="w-4 h-4" /> Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-slate-50 dark:bg-slate-900/40 p-12 rounded-3xl border border-slate-200 dark:border-slate-800 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mx-auto">
                <Check className="w-7 h-7" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Approval Queue is Clear</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                All student-submitted events have been reviewed. New student event submissions will appear here for admin approval.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Edit Event Modal */}
      <EditEventModal
        event={selectedEditEvent}
        isOpen={!!selectedEditEvent}
        onClose={() => setSelectedEditEvent(null)}
        onEventUpdated={async () => {
          await loadAdminData();
          onEventCreatedOrUpdated();
        }}
      />

      {/* Participant Roster Modal */}
      <ParticipantRosterModal
        event={selectedRosterEvent}
        isOpen={!!selectedRosterEvent}
        onClose={() => setSelectedRosterEvent(null)}
      />

      {/* Reset Password Modal */}
      {resetPasswordUserId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <form onSubmit={handleResetPassword} className="bg-white p-6 rounded-3xl w-full max-w-sm space-y-4">
            <h3 className="text-base font-bold text-[#191b23]">Reset User Password</h3>
            <input
              type="password"
              required
              placeholder="Enter new password..."
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 bg-[#f3f3fe] border border-transparent rounded-xl text-sm focus:outline-none focus:border-[#004ac6] text-[#191b23]"
            />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setResetPasswordUserId(null)} className="px-3 py-1.5 text-xs font-bold text-[#737686]">Cancel</button>
              <button type="submit" className="px-4 py-1.5 rounded-xl bg-[#004ac6] text-white text-xs font-bold">Update Password</button>
            </div>
          </form>
        </div>
      )}
      {/* Live QR Code Scanner Modal */}
      <QRScannerModal
        isOpen={isQrScannerOpen}
        onClose={() => setIsQrScannerOpen(false)}
        onCheckInSuccess={() => loadAdminData()}
      />
    </div>
  );
};
