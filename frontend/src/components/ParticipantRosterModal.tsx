import React, { useState, useEffect } from 'react';
import { X, Download, Printer, CheckCircle2, XCircle, Search, QrCode } from 'lucide-react';
import { api } from '../services/api';
import type { EventItem, Registration } from '../services/api';
import { QRScannerModal } from './QRScannerModal';

interface ParticipantRosterModalProps {
  event: EventItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ParticipantRosterModal: React.FC<ParticipantRosterModalProps> = ({ event, isOpen, onClose }) => {
  const [participants, setParticipants] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false);

  const fetchRoster = async () => {
    if (!event) return;
    try {
      setLoading(true);
      const data = await api.getEventParticipants(event._id);
      setParticipants(data.participants || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && event) {
      fetchRoster();
    }
  }, [isOpen, event]);

  if (!isOpen || !event) return null;

  const handleAttendance = async (regId: string, attendanceStatus: 'Present' | 'Absent') => {
    try {
      await api.updateAttendance(regId, attendanceStatus);
      fetchRoster();
    } catch (err: any) {
      alert(err.message || 'Failed to update attendance');
    }
  };

  const filteredParticipants = participants.filter(p => {
    const name = p.userId?.name || '';
    const email = p.userId?.email || '';
    const studentId = p.userId?.studentId || '';
    const ticketCode = p.ticketCode || '';
    const q = search.toLowerCase();
    return name.toLowerCase().includes(q) || email.toLowerCase().includes(q) || studentId.toLowerCase().includes(q) || ticketCode.toLowerCase().includes(q);
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-[#e1e2ed] overflow-hidden relative max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-[#e1e2ed] flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#f3f3fe]">
          <div>
            <span className="text-[11px] font-bold text-[#004ac6] uppercase tracking-wider">Participant Roster & Attendance</span>
            <h2 className="text-xl font-black text-[#191b23]">{event.title}</h2>
            <p className="text-xs text-[#737686]">{participants.length} Registered Students • {event.location}</p>
          </div>

          <div className="flex items-center gap-2 print:hidden">
            <button
              onClick={() => setIsQrScannerOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-sm flex items-center gap-1.5 transition-all"
            >
              <QrCode className="w-4 h-4" /> Live QR Scanner
            </button>
            <button
              onClick={() => api.exportParticipantsCSV(event.title, participants)}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm flex items-center gap-1.5 transition-all"
            >
              <Download className="w-4 h-4" /> Export CSV / Excel
            </button>
            <button
              onClick={() => window.print()}
              className="px-3 py-2 rounded-xl bg-[#2563eb] hover:bg-[#004ac6] text-white text-xs font-bold shadow-sm flex items-center gap-1.5 transition-all"
            >
              <Printer className="w-4 h-4" /> Print PDF Roster
            </button>
            <button
              onClick={onClose}
              className="p-2 text-[#737686] hover:text-[#191b23] hover:bg-white rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="p-4 border-b border-[#e1e2ed] bg-white flex items-center justify-between gap-4 print:hidden">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#737686] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by student name, ID, or ticket code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-[#f3f3fe] border border-transparent rounded-xl text-xs focus:outline-none focus:border-[#004ac6] text-[#191b23]"
            />
          </div>
          <span className="text-xs text-[#737686]">
            Present: <strong className="text-emerald-600">{participants.filter(p => p.attendanceStatus === 'Present').length}</strong> / {participants.length}
          </span>
        </div>

        {/* Table Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {loading ? (
            <div className="py-12 text-center text-xs text-[#737686]">Loading participant records...</div>
          ) : filteredParticipants.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#e1e2ed] text-[#737686] font-bold uppercase tracking-wider bg-[#faf8ff]">
                    <th className="py-3 px-3">Student Name</th>
                    <th className="py-3 px-3">Department & ID</th>
                    <th className="py-3 px-3">Pass Ticket Code</th>
                    <th className="py-3 px-3">Attendance</th>
                    <th className="py-3 px-3 text-right print:hidden">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f3f3fe]">
                  {filteredParticipants.map((p) => (
                    <tr key={p._id} className="hover:bg-[#f3f3fe]/50 transition-colors">
                      <td className="py-3 px-3 font-bold text-[#191b23]">
                        <div className="flex items-center gap-2">
                          <img
                            src={p.userId?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                            alt={p.userId?.name}
                            className="w-7 h-7 rounded-full object-cover border"
                          />
                          <div>
                            <div>{p.userId?.name || 'Student Participant'}</div>
                            <div className="text-[10px] text-[#737686] font-normal">{p.userId?.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-[#434655]">
                        <div>{p.userId?.department || 'General'}</div>
                        <div className="text-[10px] text-[#737686] font-mono">{p.userId?.studentId}</div>
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-[#004ac6]">
                        {p.ticketCode}
                      </td>
                      <td className="py-3 px-3">
                        {p.attendanceStatus === 'Present' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 flex items-center gap-1 w-fit">
                            <CheckCircle2 className="w-3 h-3" /> Present
                          </span>
                        ) : p.attendanceStatus === 'Absent' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 flex items-center gap-1 w-fit">
                            <XCircle className="w-3 h-3" /> Absent
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 w-fit">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right print:hidden">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleAttendance(p._id, 'Present')}
                            title="Mark Present"
                            className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white font-bold text-[11px] transition-colors"
                          >
                            Mark Present
                          </button>
                          <button
                            onClick={() => handleAttendance(p._id, 'Absent')}
                            title="Mark Absent"
                            className="px-2 py-1 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white font-bold text-[11px] transition-colors"
                          >
                            Mark Absent
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-[#737686]">No registered participants found.</div>
          )}
        </div>
      </div>

      {/* QR Scanner Modal */}
      <QRScannerModal
        isOpen={isQrScannerOpen}
        onClose={() => setIsQrScannerOpen(false)}
        onCheckInSuccess={() => fetchRoster()}
      />
    </div>
  );
};
