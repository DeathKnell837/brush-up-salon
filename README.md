# Brush Up — Luxury Salon Management System

A premium, full-stack React application designed for high-end salon networks. This platform provides distinct interfaces for customers to book appointments and for salon administrators to manage their incoming schedules.

## 🚀 Key Features

### Live Firebase Backend (New!)
- **Real-Time Data Sync:** All bookings, user accounts, and salon services are synchronized instantly across all devices without needing to refresh the page.
- **Automated Migration:** The system seamlessly bootstraps local storage data up to the cloud.
- **Firebase Firestore:** Replaces the initial localStorage architecture with a robust, production-ready NoSQL cloud database.
- **Security:** Passwords are mathematically hashed (SHA-256) before transmission.

### 👑 Dual-Role Architecture
- **Customer Portal:** A beautiful, glassmorphic interface where clients can browse 9 luxury partner salons, explore unique services, and book appointments. Includes a "Notification Banner" for upcoming scheduled visits.
- **Admin Dashboard:** A dedicated management suite where salon managers can review pending bookings, approve or reject them, mark them as "Completed", and fully customize their salon's details and service menus.

### 🎨 Premium UI/UX
- **Modern Aesthetics:** Elegant gold-on-dark typography, animated background orbs, and seamless Framer-style CSS transitions.
- **Smart Routing:** Admins are explicitly blocked from accessing the customer portal to ensure strict role separation.
- **Responsive Alerts:** Custom-built Toast notification system provides instant feedback for every action.

## 📁 Project Structure

```
salon/
├── public/
├── src/
│   ├── components/
│   │   ├── AdminDashboard.jsx    # Salon management & scheduling
│   │   ├── CustomerDashboard.jsx # Client booking & exploration
│   │   ├── AuthPage.jsx          # Secure login/signup portal
│   │   ├── BookingModal.jsx      # Interactive scheduling tool
│   │   └── Toast.jsx             # Notification engine
│   ├── utils/
│   │   ├── firebaseSync.js       # Real-time Firestore bridging logic
│   │   └── storage.js            # Offline-first caching layer
│   ├── firebase.js               # Firebase configuration
│   ├── App.jsx                   # Main application router
│   └── App.css                   # Global styling architecture
```

## 🛠️ Setup Instructions

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm start
   ```

## 🔑 Demo Credentials

You can create a new customer account directly on the signup page. To access the **Admin Dashboard**, use any of the pre-seeded partner accounts. 

### Super Admin (Full Access to all Salons)
* **Username:** `superadmin` | **Password:** `admin123`

### Shop Admins (Restricted to their own Salon)
* **Elegant Salon:** `elegantadmin` | `admin123`
* **Karen Green:** `kareenadmin` | `admin123`
* **Pretty Aspects:** `prettyadmin` | `admin123`
* **Sir James:** `jamesadmin` | `admin123`
* **Palma:** `palmaadmin` | `admin123`
* **Babie & Co:** `babieadmin` | `admin123`
* **Cut & Curl:** `cutcurladmin` | `admin123`

## ⚙️ Technologies Used
* **React 18** (Hooks, Context, State Management)
* **Firebase** (Firestore Database, Real-time Snapshot Listeners)
* **Vanilla CSS3** (CSS Variables, Flexbox/Grid, Keyframe Animations)
* **Web Crypto API** (SHA-256 Hashing)
