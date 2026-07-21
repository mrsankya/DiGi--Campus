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
1. **GitHub Repository & Cloud Deployment**: Continuous deployment configured (Git & remote deployment updates paused per user preference).
2. **Multi-Tier Roles & Immunity**: Super Admin, Event Coordinator, Student. Primary Owner immunity protection for `mr.sankya@...`.
3. **Live Camera Ticket QR Scanner & Verification**: `html5-qrcode` camera scanner modal with audio chime, ticket validation, auto-attendance marking, and certificate generation.
4. **DiGi Bot - AI Campus Assistant**: Floating AI assistant powered by backend route `POST /api/bot/chat` providing instant answers on events, dates, venues, passes, and certificates.
5. **Student Gamification & XP Leaderboard**: XP points (+150 join, +100 RSVP), level progression, unlockable achievement badges, and top 3 Gold/Silver/Bronze podium modal.
6. **Light & Dark Mode System**: 1-click Sun ☀️ / Moon 🌙 toggle in Navbar with global high-contrast CSS overrides for 100% sharp text readability.
7. **Data Export & Official Certificates**: CSV/Excel rosters, auto-generated PDF Certificates of Participation with official verified seal.
8. **Campus Bulletins & Announcements Modal**: Navbar notification bell 🔔 icon with animated indicator triggering an official campus announcements modal with categorized filters (`Urgent`, `Venue Update`, `General`).
9. **Event Favoriting / Bookmarking System**: 1-click Heart ❤️ toggle on event cards storing saved events in local persistence with quick access filter in search.
10. **Advanced Search & Multi-Criteria Filtering**: Multi-sorting (Popularity, Date, Free First), price filter (Free vs Paid), and saved event filter.
11. **Email Notification & Auth Rate Limiting**: Express email service (`backend/utils/emailService.js`) using Resend API to send automated Welcome emails on registration (+150 XP bonus notice), Login Security Alert emails on sign in, RSVP ticket confirmation with QR passes, campus bulletins, and strict Rate Limiting (`express-rate-limit` capped at 5 auth requests / 15 minutes per IP).
