import React from 'react';
import { Sparkles, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-[#e1e2ed] mt-16 py-12 text-[#434655]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#004ac6] text-white flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold text-[#191b23]">DiGi Campus</span>
            </div>
            <p className="text-xs text-[#737686] leading-relaxed">
              The official centralized event management, discovery, and ticketing portal for campus activities, workshops, fests, and sports.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-bold text-[#191b23] uppercase tracking-wider mb-3">Event Categories</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-[#004ac6] transition-colors">Technical & Hackathons</a></li>
              <li><a href="#" className="hover:text-[#004ac6] transition-colors">Cultural & Music Fests</a></li>
              <li><a href="#" className="hover:text-[#004ac6] transition-colors">Sports & Championships</a></li>
              <li><a href="#" className="hover:text-[#004ac6] transition-colors">Academic Seminars</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold text-[#191b23] uppercase tracking-wider mb-3">Quick Resources</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-[#004ac6] transition-colors">Host an Event</a></li>
              <li><a href="#" className="hover:text-[#004ac6] transition-colors">Venue Availability</a></li>
              <li><a href="#" className="hover:text-[#004ac6] transition-colors">Student Guidelines</a></li>
              <li><a href="#" className="hover:text-[#004ac6] transition-colors">Support & Helpdesk</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold text-[#191b23] uppercase tracking-wider mb-3">Campus Office</h4>
            <p className="text-xs text-[#737686] leading-relaxed mb-2">
              Student Affairs & Cultural Council,<br />
              Block B, Main Administration Building,<br />
              Campus Road, University City.
            </p>
            <p className="text-xs font-medium text-[#004ac6]">events@digicampus.edu</p>
          </div>
        </div>

        <div className="pt-8 border-t border-[#ededf9] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#737686]">
          <p>© 2026 DiGi Campus Portal. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Designed for students with <Heart className="w-3.5 h-3.5 fill-[#ba1a1a] text-[#ba1a1a]" />
          </p>
        </div>
      </div>
    </footer>
  );
};
