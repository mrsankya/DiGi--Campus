export interface User {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  role: 'student' | 'coordinator' | 'admin';
  position?: string;
  department: string;
  studentId: string;
  avatar: string;
  phone?: string;
  bio?: string;
  yearOfStudy?: string;
  github?: string;
  linkedin?: string;
  status?: 'active' | 'deactivated';
}

export interface AgendaItem {
  _id?: string;
  time: string;
  title: string;
  description: string;
}

export interface Speaker {
  _id?: string;
  name: string;
  role: string;
  company: string;
  avatar: string;
}

export interface EventItem {
  _id: string;
  title: string;
  description: string;
  category: 'Tech' | 'Cultural' | 'Sports' | 'Academic' | 'Workshop' | 'Seminar';
  date: string;
  time: string;
  location: string;
  venue: string;
  organizer: string;
  department: string;
  image: string;
  bannerImage?: string;
  capacity: number;
  registeredCount: number;
  price: number;
  isFeatured: boolean;
  status: 'Upcoming' | 'Ongoing' | 'Completed' | 'Cancelled';
  agenda?: AgendaItem[];
  speakers?: Speaker[];
}

export interface Registration {
  _id: string;
  eventId: EventItem;
  userId: User;
  ticketCode: string;
  qrCodeUrl: string;
  status: 'registered' | 'attended' | 'cancelled' | 'rejected';
  attendanceStatus?: 'Pending' | 'Present' | 'Absent';
  certificateIssued?: boolean;
  registeredAt: string;
}

export interface Announcement {
  _id: string;
  title: string;
  content: string;
  category: 'Urgent' | 'General' | 'Venue Update' | 'Registration';
  authorName: string;
  createdAt: string;
}

export interface Feedback {
  _id: string;
  eventId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  createdAt: string;
}

// Resolution for API Base URL
const getApiBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    return 'http://localhost:5000/api';
  }
  return '/api';
};

const API_BASE = getApiBaseUrl();

const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('campuspulse_token');
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

// Safe JSON parser to prevent 'Unexpected end of JSON input'
async function parseResponse(res: Response) {
  const text = await res.text();
  let data: any = {};
  if (text) {
    try {
      data = JSON.parse(text);
    } catch (e) {
      data = { message: text || 'Non-JSON response received' };
    }
  }
  if (!res.ok) {
    throw new Error(data.message || `Server returned status ${res.status}`);
  }
  return data;
}

export const api = {
  // Auth & Profile
  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await parseResponse(res);
    localStorage.setItem('campuspulse_token', data.token);
    return data;
  },

  async register(userData: { name: string; email: string; password: string; role?: string; department?: string; studentId?: string }): Promise<{ token: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    const data = await parseResponse(res);
    localStorage.setItem('campuspulse_token', data.token);
    return data;
  },

  async loginWithGoogle(googleData: { email: string; name: string; avatar?: string; role?: string; department?: string }): Promise<{ token: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(googleData)
    });
    const data = await parseResponse(res);
    localStorage.setItem('campuspulse_token', data.token);
    return data;
  },

  async getMe(): Promise<User> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders()
    });
    return await parseResponse(res);
  },

  async updateProfile(profileData: Partial<User>): Promise<User> {
    const res = await fetch(`${API_BASE}/auth/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(profileData)
    });
    return await parseResponse(res);
  },

  logout() {
    localStorage.removeItem('campuspulse_token');
  },

  // Events
  async getEvents(filters?: { category?: string; search?: string; featured?: boolean; department?: string; status?: string }): Promise<EventItem[]> {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.department) params.append('department', filters.department);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.featured) params.append('featured', 'true');

    const res = await fetch(`${API_BASE}/events?${params.toString()}`);
    return await parseResponse(res);
  },

  async getEventById(id: string): Promise<EventItem> {
    const res = await fetch(`${API_BASE}/events/${id}`);
    return await parseResponse(res);
  },

  async createEvent(eventData: Partial<EventItem>): Promise<EventItem> {
    const res = await fetch(`${API_BASE}/events`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(eventData)
    });
    return await parseResponse(res);
  },

  async updateEvent(id: string, eventData: Partial<EventItem>): Promise<EventItem> {
    const res = await fetch(`${API_BASE}/events/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(eventData)
    });
    return await parseResponse(res);
  },

  async deleteEvent(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/events/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    await parseResponse(res);
  },

  // Registrations
  async registerForEvent(eventId: string): Promise<Registration> {
    const res = await fetch(`${API_BASE}/registrations`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ eventId })
    });
    return await parseResponse(res);
  },

  async getMyRegistrations(): Promise<Registration[]> {
    const res = await fetch(`${API_BASE}/registrations/my`, {
      headers: getAuthHeaders()
    });
    return await parseResponse(res);
  },

  async cancelRegistration(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/registrations/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    await parseResponse(res);
  },

  // Admin & Analytics
  async scanQrTicket(ticketCode: string): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/scan-qr`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ ticketCode })
    });
    return await parseResponse(res);
  },

  async getAnalytics() {
    const res = await fetch(`${API_BASE}/admin/analytics`, {
      headers: getAuthHeaders()
    });
    return await parseResponse(res);
  },

  async getEventParticipants(eventId: string): Promise<{ event: EventItem; participants: Registration[] }> {
    const res = await fetch(`${API_BASE}/admin/events/${eventId}/participants`, {
      headers: getAuthHeaders()
    });
    return await parseResponse(res);
  },

  async updateAttendance(registrationId: string, attendanceStatus: 'Present' | 'Absent' | 'Pending', status?: string) {
    const res = await fetch(`${API_BASE}/admin/registrations/${registrationId}/attendance`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ attendanceStatus, status })
    });
    return await parseResponse(res);
  },

  async getAllUsers(): Promise<User[]> {
    const res = await fetch(`${API_BASE}/admin/users`, {
      headers: getAuthHeaders()
    });
    return await parseResponse(res);
  },

  async updateUserRole(userId: string, role: string, position?: string): Promise<User> {
    const res = await fetch(`${API_BASE}/admin/users/${userId}/role`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ role, position })
    });
    return await parseResponse(res);
  },

  async toggleUserStatus(userId: string, status: 'active' | 'deactivated'): Promise<User> {
    const res = await fetch(`${API_BASE}/admin/users/${userId}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status })
    });
    return await parseResponse(res);
  },

  async adminResetPassword(userId: string, newPassword: string): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/admin/users/${userId}/reset-password`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ newPassword })
    });
    return await parseResponse(res);
  },

  // Announcements
  async chatWithBot(message: string): Promise<{ reply: string }> {
    const res = await fetch(`${API_BASE}/bot/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });
    return await parseResponse(res);
  },

  async getAnnouncements(): Promise<Announcement[]> {
    const res = await fetch(`${API_BASE}/announcements`);
    return await parseResponse(res);
  },

  async createAnnouncement(announcementData: { title: string; content: string; category?: string }): Promise<Announcement> {
    const res = await fetch(`${API_BASE}/announcements`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(announcementData)
    });
    return await parseResponse(res);
  },

  async deleteAnnouncement(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/announcements/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    await parseResponse(res);
  },

  // Feedback
  async getFeedback(eventId: string): Promise<{ avgRating: number; totalCount: number; feedbacks: Feedback[] }> {
    const res = await fetch(`${API_BASE}/feedback/event/${eventId}`);
    return await parseResponse(res);
  },

  async submitFeedback(eventId: string, rating: number, comment: string): Promise<Feedback> {
    const res = await fetch(`${API_BASE}/feedback`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ eventId, rating, comment })
    });
    return await parseResponse(res);
  },

  // Export CSV Helper
  exportParticipantsCSV(eventTitle: string, participants: Registration[]) {
    const headers = ['Student Name', 'Email', 'Student ID', 'Department', 'Ticket Code', 'Attendance Status', 'Registration Date'];
    const rows = participants.map(p => [
      `"${p.userId?.name || 'Student'}"`,
      `"${p.userId?.email || ''}"`,
      `"${p.userId?.studentId || ''}"`,
      `"${p.userId?.department || ''}"`,
      `"${p.ticketCode}"`,
      `"${p.attendanceStatus || 'Pending'}"`,
      `"${new Date(p.registeredAt).toLocaleDateString()}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${eventTitle.replace(/[^a-zA-Z0-9]/g, '_')}_Participants.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  // Export Google Calendar .ics file
  downloadGoogleCalendarICS(event: EventItem) {
    const startDate = new Date(event.date).toISOString().replace(/-|:|\.\d+/g, '');
    const icsData = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//DiGi Campus//College Event Portal//EN
BEGIN:VEVENT
SUMMARY:${event.title}
DESCRIPTION:${event.description.replace(/\n/g, ' ')}
LOCATION:${event.location}
DTSTART:${startDate}
DTEND:${startDate}
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${event.title.replace(/[^a-zA-Z0-9]/g, '_')}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};
