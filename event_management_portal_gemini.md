# DiGi Campus - College Event Management Platform - Project Memory

## Project Overview
- **Project Name:** DiGi Campus (Enterprise College Event Management Platform)
- **Location:** `C:\Users\sanke\event management protal`
- **GitHub Repository:** `https://github.com/mrsankya/DiGi--Campus`
- **Database:** MongoDB Atlas (`mongodb+srv://<db_user>:<db_password>@<cluster>.mongodb.net/campuspulse`)
- **Cloudflare Pages Deployment:** `https://campuspulse-portal.pages.dev`

## Credentials & Configuration
- **Super Admin:** Mr. Sankya (`mr.sankya@digicampus.edu`)
- **MongoDB Atlas DB User:** `sanketbhende0_db_user`
- **Google OAuth Client ID:** Configured in `frontend/.env` (`VITE_GOOGLE_CLIENT_ID`) and `backend/.env` (`GOOGLE_CLIENT_ID`)
- **Google OAuth Client Secret:** Configured in `backend/.env` (`GOOGLE_CLIENT_SECRET`)

## Core Architecture & Features
1. **GitHub Repository**: Connected and pushed to `main` branch on `https://github.com/mrsankya/DiGi--Campus`.
2. **Multi-Tier Roles**: Super Admin, Event Coordinator, Student. Position titles (e.g. *Tech Lead*, *Cultural Head*).
3. **Data Export & Rosters**: CSV/Excel export, printable PDF rosters, attendance check-in.
4. **Official Certificates**: Auto-generated printable PDF Certificates of Participation with verified seal.
5. **Ratings & Feedback**: 5-star student event review system.
6. **User Profile Suite**: Editable student/admin profiles (Bio, Phone, Department, Year of Study, GitHub, LinkedIn).
7. **Google OAuth & Cloudflare Pages**: Google Identity Services integration & Cloudflare SPA deployment.
