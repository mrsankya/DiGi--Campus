import React from 'react';
import { X, Ticket as TicketIcon, CheckCircle2, Download } from 'lucide-react';
import type { Registration } from '../services/api';

interface TicketModalProps {
  registration: Registration | null;
  onClose: () => void;
}

export const TicketModal: React.FC<TicketModalProps> = ({ registration, onClose }) => {
  if (!registration) return null;

  const { eventId: event, ticketCode, qrCodeUrl } = registration;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl border border-[#e1e2ed] overflow-hidden relative text-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 text-white/80 hover:text-white bg-black/20 hover:bg-black/40 rounded-full transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Pass Banner */}
        <div className="bg-gradient-to-r from-[#004ac6] to-[#2563eb] p-6 text-white text-left relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center gap-2 text-xs font-semibold text-white/80 uppercase tracking-wider mb-2">
            <TicketIcon className="w-4 h-4" /> Official Event Pass
          </div>
          <h3 className="text-xl font-black leading-tight line-clamp-2">{event.title}</h3>
          <p className="text-xs text-white/80 mt-1">{event.organizer}</p>
        </div>

        {/* Ticket Content */}
        <div className="p-6 space-y-5">
          {/* QR Code Container */}
          <div className="bg-[#f3f3fe] p-4 rounded-2xl border border-[#e1e2ed] inline-block shadow-inner">
            <img
              src={qrCodeUrl || `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${ticketCode}`}
              alt="QR Code Pass"
              className="w-36 h-36 mx-auto rounded-lg"
            />
            <p className="text-xs font-mono font-bold text-[#004ac6] mt-2 tracking-widest">{ticketCode}</p>
          </div>

          {/* Event Meta Details */}
          <div className="text-left space-y-2 text-xs bg-[#faf8ff] p-3.5 rounded-xl border border-[#ededf9]">
            <div className="flex items-center justify-between">
              <span className="text-[#737686]">Date & Time:</span>
              <span className="font-bold text-[#191b23]">{new Date(event.date).toLocaleDateString()} • {event.time}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#737686]">Venue:</span>
              <span className="font-bold text-[#191b23] truncate max-w-[180px]">{event.location}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#737686]">Status:</span>
              <span className="font-bold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Confirmed
              </span>
            </div>
          </div>

          <p className="text-[11px] text-[#737686]">
            Show this QR code at the event entrance for fast check-in.
          </p>

          <button
            onClick={() => window.print()}
            className="w-full py-2.5 rounded-xl bg-[#eeefff] text-[#004ac6] hover:bg-[#004ac6] hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
          >
            <Download className="w-4 h-4" /> Download / Print Ticket Pass
          </button>
        </div>
      </div>
    </div>
  );
};
