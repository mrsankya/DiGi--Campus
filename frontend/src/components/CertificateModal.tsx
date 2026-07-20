import React from 'react';
import { X, Award, Printer, Sparkles } from 'lucide-react';
import type { Registration } from '../services/api';

interface CertificateModalProps {
  registration: Registration | null;
  onClose: () => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({ registration, onClose }) => {
  if (!registration) return null;

  const { eventId: event, userId: user } = registration;
  const issueDate = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border-4 border-[#004ac6]/20 overflow-hidden relative my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[#737686] hover:text-[#191b23] hover:bg-[#f3f3fe] rounded-full transition-colors z-20 print:hidden"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Certificate Frame Body */}
        <div id="certificate-print-area" className="p-8 sm:p-12 text-center space-y-6 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-sky-50 via-white to-indigo-50/30 relative">
          {/* Decorative Corner Frames */}
          <div className="border-4 border-[#004ac6] p-6 sm:p-10 rounded-2xl relative">
            <div className="absolute top-2 left-2 w-8 h-8 border-t-2 border-l-2 border-[#004ac6]" />
            <div className="absolute top-2 right-2 w-8 h-8 border-t-2 border-r-2 border-[#004ac6]" />
            <div className="absolute bottom-2 left-2 w-8 h-8 border-b-2 border-l-2 border-[#004ac6]" />
            <div className="absolute bottom-2 right-2 w-8 h-8 border-b-2 border-r-2 border-[#004ac6]" />

            {/* Emblem Header */}
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#004ac6] to-[#2563eb] text-white flex items-center justify-center mx-auto mb-4 shadow-xl">
              <Award className="w-9 h-9 text-amber-300" />
            </div>

            <span className="text-xs font-extrabold uppercase tracking-widest text-[#004ac6] block">
              DiGi Campus • Official Academic Certificate
            </span>

            <h1 className="text-3xl sm:text-5xl font-black text-[#191b23] font-serif tracking-tight mt-2">
              Certificate of Participation
            </h1>

            <p className="text-xs sm:text-sm text-[#434655] font-serif italic mt-4">
              This is to proudly certify that
            </p>

            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#004ac6] border-b-2 border-[#004ac6]/30 inline-block px-8 py-2 mt-2 font-serif">
              {user?.name || 'Student Participant'}
            </h2>

            <p className="text-xs sm:text-sm text-[#434655] max-w-xl mx-auto leading-relaxed mt-4">
              has successfully registered, attended, and actively participated in the official campus event
            </p>

            <h3 className="text-xl sm:text-2xl font-bold text-[#191b23] mt-2">
              "{event?.title}"
            </h3>

            <p className="text-xs text-[#737686] mt-2">
              Organized by <span className="font-semibold text-[#191b23]">{event?.organizer}</span> on {new Date(event?.date).toLocaleDateString()}
            </p>

            {/* Seal & Signatures */}
            <div className="pt-8 mt-8 border-t border-[#e1e2ed] grid grid-cols-2 sm:grid-cols-3 gap-4 items-center text-xs">
              <div className="text-left">
                <p className="font-bold text-[#191b23]">Mr. Sankya</p>
                <p className="text-[11px] text-[#737686]">Super Admin & Convener</p>
              </div>

              <div className="hidden sm:block">
                <div className="w-16 h-16 rounded-full bg-amber-400/20 border-2 border-amber-500 text-amber-700 flex flex-col items-center justify-center mx-auto shadow-inner">
                  <Sparkles className="w-5 h-5 text-amber-600" />
                  <span className="text-[9px] font-black uppercase tracking-tighter">Verified</span>
                </div>
              </div>

              <div className="text-right">
                <p className="font-bold text-[#191b23]">{issueDate}</p>
                <p className="text-[11px] text-[#737686]">Date of Issuance</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Print Actions */}
        <div className="p-4 bg-[#f3f3fe] border-t border-[#e1e2ed] flex justify-end gap-3 print:hidden">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-[#434655] hover:bg-white transition-colors"
          >
            Close
          </button>
          <button
            onClick={() => window.print()}
            className="px-5 py-2 rounded-xl bg-[#2563eb] text-white hover:bg-[#004ac6] text-xs font-bold shadow-md flex items-center gap-1.5 transition-all"
          >
            <Printer className="w-4 h-4" /> Download / Print Official Certificate
          </button>
        </div>
      </div>
    </div>
  );
};
