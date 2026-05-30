# Brush Up — Luxury Salon Management System

> **🌐 Live Demo:** [https://brush-up-salon.onrender.com/](https://brush-up-salon.onrender.com/)

A premium, full-stack React application designed for a multi-branch salon network based in **Midsayap, Cotabato, Philippines**. The platform provides distinct interfaces for **Customers**, **Shop Admins**, and a **Super Admin** to manage bookings, services, reviews, and real-time operations across the entire Brush Up Salon network.

---

## 🚀 Key Features

### ☁️ Live Firebase Backend
- **Real-Time Data Sync:** All bookings, user accounts, salon data, and announcements are synchronized instantly across all devices via **Firestore `onSnapshot` listeners** — no page refresh needed.
- **Firebase Authentication:** User accounts are managed through Firebase Auth (Email/Password). Usernames are mapped to `@brushup.com` email addresses internally.
- **Automated Seed Migration:** On first load, the system bootstraps all default admin accounts into Firebase Auth and seeds salon data into Firestore.
- **Offline-First Caching:** A `localStorage` wrapper with an in-memory fallback ensures the app works even when Firebase is temporarily unreachable.
- **Firestore Security Rules:** Role-based access control (Super Admin, Admin, Customer) enforced at the database level with custom security rules.

### 👑 Three-Tier Role Architecture

#### 1. Customer Portal
- Browse **7 real partner salons**, each with detailed service menus, pricing tables, staff listings, and customer reviews.
- **Salon Detail Pages** with full-bleed hero images, service category filtering, staff selection, and an inline booking form.
- **Notification Banner** for upcoming scheduled visits and AI-generated reminders.
- **Review System** — rate completed appointments with a 5-star scale and optional comments.
- **Profile Management** — edit name, phone, avatar (base64 upload), and change password (with Firebase re-authentication).

#### 2. Shop Admin Dashboard
- **Booking Management** — view, approve, reject, and mark bookings as completed for the admin's assigned salon only.
- **Service Menu Editor** — add, remove, and update services and pricing in real-time.
- **Staff Management** — manage the salon's team roster.
- **Promotions** — set promotional banners visible to customers on the salon detail page.
- **Advanced Financial Reports** — Renders real-time statistics cards (Total Revenue, Period Revenue, Average Ticketing, Total Bookings) with an interactive **Timeframe Selector (Weekly, Monthly, Yearly)**. Displays horizontal progress bars for service sales distribution, and a custom neon glowing SVG trend area chart dynamically updated per interval.

#### 3. Super Admin Dashboard (Network HQ)
- **Network Analytics** — total revenue, completed/pending counts, customer totals, and per-branch revenue bars.
- **Salon Performance Leaderboard** — A premium multi-salon ranked comparison matrix presenting total revenue, completed bookings, top-performing services, weekly trend arrows, and active/inactive status badges (pulsing red warning dots for salons with zero bookings in 3+ days, gold highlighted borders for top-performing branches), complete with interactive sortable column headers.
- **All Transactions** — a unified view of every booking across the network with CSV export.
- **Salon Management** — register new salons with auto-provisioned Firebase Auth admin accounts (uses a secondary Firebase app to avoid signing out the current user). Remove salons and their admins.
- **Admin Access Control** — view all administrators, reset passwords, and revoke access.
- **Network Broadcasts** — publish info/warning/promo announcements visible across all dashboards.
- **System Audit Log** — timestamped, color-coded log of all login, logout, signup, salon creation/deletion, password reset, and broadcast actions (capped at 500 entries, immutable in Firestore).
- **Duplicate Cleanup** — utility to purge legacy username-keyed Firestore documents from pre-UID migration.

### 🤖 AI Chatbot (Context-Aware, Role-Adaptive)
A floating chatbot powered by **Groq (Llama 3.1 8B)** with **Gemini 2.0 Flash Lite** as a fallback:

| Role | Persona | Capabilities |
|------|---------|-------------|
| **Customer** | Salon Concierge | Recommend salons/services via clickable `salon:` deep links, auto-fill booking forms via `[BOOK_NOW]` commands, show availability widgets, and handle cancellations. |
| **Admin** | Operations AI | Daily schedule summaries, operational advice, customer dispute resolution, and upselling strategies. |
| **Super Admin** | Executive AI | Network-wide analytics, strategic advice, and the ability to **publish broadcasts** directly from the chat via `[BROADCAST]` commands. |

**Proactive Alert System:**
- Admin: real-time cancellation alerts, morning appointment reminders.
- Super Admin: 3-day zero-booking alerts for underperforming branches.
- Customer: 1-hour appointment reminders.

### 🔮 Oracle AI Predictive Financial Audit
A powerful executive analytics suite designed for network managers to assess per-branch business health and forecast operational longevity:
- **Interactive Risk Index Gauge:** Evaluates salon status on an enlarged 0-100% risk index with double-ring glowing indicators that engage a critical pulsing red warning loop if cash runways drop below safe thresholds.
- **Glassmorphic Financial Metrics:** Tracks Operational Cash Runway, Monthly Net Surplus/Deficit, and Break-Even Targets in real-time with status-aware color coding (emerald green for healthy surplus, neon red for operational deficit, white for neutral).
- **Oracle AI Turnaround Report:** Synthesizes overhead coefficients, roster utilization indexes, and transaction histories to compile detailed operational suggestions and predictive risk warnings, cleanly formatted as a markdown document inside a balanced, centered 2-column modal separated by an elegant gold vertical divider.

### 👑 Hardened System Security & Live Toasts
- **Client-Proof Compliance Logs:** Hardened Firestore database rules for `/auditLogs` to explicitly block all client-side writes, locking log creation strictly to secure, authorized system SDK servers to safeguard system logs from tampering.
- **Real-time Status Toasts:** Integrated snap listener hooks that instantly pop elegant, emoji-free toast notifications on customer dashboards when booking states transition to Approved or Rejected.

### 🎨 Premium UI/UX
- **Dark Theme** with gold accent typography (`Playfair Display` + `Montserrat` from Google Fonts).
- **Glassmorphism** cards with `backdrop-filter: blur()` and gradient overlays.
- **Framer Motion** animations — spring-based chatbot panel, fade-up content sections, and smooth message transitions.
- **Responsive Design** — CSS Grid/Flexbox layouts with `repeat(auto-fit, minmax())` patterns.
- **Custom Toast System** — auto-dismissing notifications for every user action.
- **Role-Based UI Theming** — chatbot appearance changes per role (gold concierge, green ops, blue terminal-style executive).

---

## 📁 Project Structure

```
brush-up-salon-master/
├── public/
│   ├── index.html               # Entry point with Google Fonts preconnect
│   ├── logo.png                 # Favicon
│   └── images/                  # Salon hero images (7 salons)
├── src/
│   ├── components/
│   │   ├── AdminDashboard.jsx       # Shop admin: bookings, services, staff, promos
│   │   ├── SuperAdminDashboard.jsx  # Network HQ: analytics, salons, admins, audits
│   │   ├── CustomerDashboard.jsx    # Client portal: browse salons, view bookings
│   │   ├── SalonDetailPage.jsx      # Full salon page: services, staff, reviews, booking
│   │   ├── AuthPage.jsx             # Dual login (Customer / Admin) with signup
│   │   ├── BookingModal.jsx         # Quick-book modal from customer dashboard
│   │   ├── Chatbot.jsx             # AI concierge with role-adaptive UI & alerts
│   │   ├── ProfileModal.jsx        # Profile editor + password change
│   │   ├── ReviewModal.jsx         # 5-star rating + comment form
│   │   ├── ForbiddenPage.jsx       # Role mismatch error screen
│   │   ├── BrushUpLogo.jsx         # SVG brand logo component
│   │   ├── Icons.jsx               # Custom SVG icon library
│   │   └── Toast.jsx               # Notification engine
│   ├── constants/
│   │   └── salonData.js            # Seed data for 7 partner salons (services, staff, pricing)
│   ├── utils/
│   │   ├── firebaseSync.js         # Real-time Firestore → localStorage bridge
│   │   └── storage.js              # CRUD layer, session, audit logs, admin seeding
│   ├── firebase.js                 # Firebase app config (Auth, Firestore, Storage)
│   ├── App.jsx                     # Root router, auth handlers, state management
│   ├── App.css                     # Global design system (43KB — variables, components, animations)
│   └── index.jsx                   # React DOM entry
├── firestore.rules                 # Firestore security rules (RBAC)
├── render.yaml                     # Render.com static site deployment config
├── package.json                    # Dependencies & scripts
└── .env                            # Environment variables (API keys)
```

---

## 🛠️ Setup Instructions

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm start
   ```

3. **Build for production:**
   ```bash
   npm run build
   ```

---

## 🌐 Deployment

The app is deployed as a **static site** on [Render](https://render.com) using the configuration in `render.yaml`:
- **Build Command:** `npm install && npm run build`
- **Publish Directory:** `./build`
- **SPA Routing:** All routes rewrite to `/index.html`
- **Environment Variables:** `REACT_APP_GEMINI_API_KEY` and `REACT_APP_GROQ_API_KEY` are set in Render's dashboard.

**Live URL:** [https://brush-up-salon.onrender.com/](https://brush-up-salon.onrender.com/)

---

## 🔑 Demo Credentials

You can create a new customer account directly on the signup page. To access the **Admin Dashboard**, use the pre-seeded partner accounts below.

### Super Admin (Full Network Access)
| Username | Password |
|----------|----------|
| `superadmin` | `admin123` |

### Shop Admins (Restricted to Their Salon)
| Salon | Username | Password |
|-------|----------|----------|
| Elegant Salon | `elegantadmin` | `admin123` |
| Karen Green | `kareenadmin` | `admin123` |
| Pretty Aspects | `prettyadmin` | `admin123` |
| Sir James Salon | `jamesadmin` | `admin123` |
| Palma Beauty Salon | `palmaadmin` | `admin123` |
| Babie & Co Salon And Spa | `babieadmin` | `admin123` |
| Cut & Curl Beauty Bar | `cutcurladmin` | `admin123` |

---

## ⚙️ Technology Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18 (Hooks, Context, State Management) |
| **Backend / Database** | Firebase (Firestore Database, Real-time Snapshot Listeners, Auth) |
| **AI / LLM** | Groq (Llama 3.1 8B) + Gemini 2.0 Flash Lite (fallback) |
| **Animations** | Framer Motion |
| **Markdown Rendering** | react-markdown |
| **Styling** | Vanilla CSS3 (CSS Variables, Flexbox/Grid, Keyframe Animations, Glassmorphism) |
| **Typography** | Playfair Display + Montserrat (Google Fonts) |
| **Security** | Firebase Auth (Email/Password), Firestore Security Rules (RBAC) |
| **Deployment** | Render.com (Static Site) |

---

## 📄 License

© 2026 Brush Up Salon & Beauty. All rights reserved.
