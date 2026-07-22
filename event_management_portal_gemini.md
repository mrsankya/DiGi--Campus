# DiGi Campus - College Event Management Platform - Project Memory

## Project Overview
- **Project Name:** DiGi Campus (Enterprise College Event Management Platform)
- **Location:** `C:\Users\sanke\event management protal`
- **GitHub Repository:** `https://github.com/mrsankya/DiGi--Campus`
- **Database:** MongoDB Atlas (`mongodb+srv://<db_user>:<db_password>@<cluster>.mongodb.net/campuspulse`)
- **Cloudflare Pages Production URL:** `https://campuspulse-portal.pages.dev`
- **Render Production Backend API:** `https://digi-campus.onrender.com/api`

## Credentials & Configuration
- **Super Admin / Owner:** Mr. Sankya (`mr.sankya@digicampus.edu` / `mr.sankya@campuspulse.edu`)
- **MongoDB Atlas DB User:** `sanketbhende0_db_user`
- **Google OAuth Client ID:** Configured in `frontend/.env` (`VITE_GOOGLE_CLIENT_ID`) and `backend/.env` (`GOOGLE_CLIENT_ID`)
- **Google OAuth Client Secret:** Configured in `backend/.env` (`GOOGLE_CLIENT_SECRET`)
- **Resend Transactional Email API Key:** Configured in `backend/.env` (`RESEND_API_KEY`)

## Core Architecture & Features Completed
1. **GitHub Repository & Cloud Deployment**: Deployed to `https://github.com/mrsankya/DiGi--Campus` (Continuous deployment active for Cloudflare Pages & Render).
2. **Multi-Tier Roles & Immunity**: Super Admin, Event Coordinator, Student. Primary Owner immunity protection for `mr.sankya@...`.
3. **Live Camera Ticket QR Scanner & Verification**: `html5-qrcode` camera scanner modal with audio chime, ticket validation, auto-attendance marking, and certificate generation.
4. **DiGi Bot - AI Campus Assistant**: Floating AI assistant powered by backend route `POST /api/bot/chat` providing instant answers on events, dates, venues, passes, and certificates.
5. **Student Gamification & XP Leaderboard**: XP points (+150 join, +100 RSVP), level progression, unlockable achievement badges, and top 3 Gold/Silver/Bronze podium modal.
6. **Light & Dark Mode System**: 1-click Sun ☀️ / Moon 🌙 toggle in Navbar with global high-contrast CSS overrides for 100% sharp text readability.
7. **Data Export & Official Certificates**: CSV/Excel rosters, auto-generated PDF Certificates of Participation with official verified seal.
8. **Campus Bulletins & Announcements Modal**: Navbar notification bell 🔔 icon with animated indicator triggering an official campus announcements modal with categorized filters (`Urgent`, `Venue Update`, `General`).
9. **Event Favoriting / Bookmarking System**: 1-click Heart ❤️ toggle on event cards storing saved events in local persistence with quick access filter in search.
10. **Advanced Search & Multi-Criteria Filtering**: Multi-sorting (Popularity, Date, Free First), price filter (Free vs Paid), and saved event filter.
11. **Email Notification & Auth Rate Limiting**: Express email service (`backend/utils/emailService.js`) using Resend API to send automated Welcome emails on registration (+150 XP bonus notice), IST-formatted Sign-in Security Alert emails on login, RSVP ticket confirmation with QR passes, campus bulletins, and Rate Limiting (`express-rate-limit` capped at 25 auth requests / 15 minutes per IP).
12. **24/7 Render Keep-Alive & React Error Boundary**: React `ErrorBoundary.tsx` prevents blank screen crashes on cold starts or network failures; custom UI displays server status with 1-click page reload.
13. **Manual Cloudflare Pages Deployment**: Disconnected GitHub integration; manual deployment via `npx wrangler pages deploy dist --project-name campuspulse-portal`.
14. **Team Registration & Hackathon Teammate Finder**: Team creation with generated `TEAM-XXXX` codes, 1-click team code copy, team member roster view, and a dedicated **Teammate Matcher** board filtering requests by skills needed (React, Figma, AI/ML, Python, Node.js).
15. **AI Auto-Fill Event Text & WhatsApp Parser**: Backend route `POST /api/events/parse-text` extracts title, category, date, time, venue, organizer, department, capacity, and ticket price from raw WhatsApp messages / flyer text.
16. **Student Event Submission & Admin Approval Queue**: Students can submit campus events; submissions default to `Pending` and are managed by Admins in an **Approval Queue ⏳** tab with 1-click **Approve & Publish Live** or **Reject** actions.
17. **100% Free Email OTP Verification**: New registrations require a 6-digit email OTP (sent via Resend with 10-min expiration). Blocks fake account creation and awards +150 XP bonus upon verification.




