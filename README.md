# 🚀 CivicTrack – Smart Civic Issue Reporting & Admin Management System

A **real-time, geo-mapped community issue management platform** that empowers citizens to report local civic problems and enables authorities to track, verify, and resolve them efficiently.

CivicTrack is built as a **full-stack MERN application** with a **premium Glassmorphism UI**, **interactive maps**, and **Socket.IO–powered real-time updates**, making it ideal for **smart cities, campuses, residential societies, and municipalities**.

---

## 🌍 Problem Statement

Civic issues like damaged roads, garbage overflow, water leaks, and faulty street lights often go:
- Unreported
- Untracked
- Unresolved for long periods

Existing systems lack **transparency**, **real-time tracking**, and **citizen engagement**.

---

## 💡 Solution – CivicTrack

CivicTrack bridges the gap between **citizens** and **authorities** by providing:
- Map-based issue reporting
- Real-time status updates
- Admin verification & control
- Community participation through upvotes and comments

---

## ✨ Key Features

### 👤 Citizen Features
- 🗺️ **Map-Based Issue Reporting**
  - Report issues directly on an interactive map
  - Automatic latitude & longitude capture
- 📸 **Image Upload as Proof**
- 🔄 **Realtime Issue Status Tracking**
  - `Pending → Under Review → In Progress → Resolved`
- 👍 **Upvote & Comment System**
- 📊 **Personal Dashboard**
  - Total issues reported
  - Resolved vs pending stats
- 🔔 **Realtime Notifications**
  - Live updates via Socket.IO when admins take action

---

### 🛠️ Admin Features
- 🧑‍💼 **Admin Control Center**
- 📈 **Premium Admin Dashboard**
  - Total Issues
  - Pending
  - Pending Verification
  - In Progress
  - Resolved
- ✅ **Proof Verification**
  - Validate images uploaded by citizens
- 🔄 **Issue Status Management**
- 🗑️ **Delete / Moderate Issues**
- ⚡ **Realtime Monitoring**
  - All changes reflected instantly using WebSockets

---

## 🖥️ Tech Stack

### 🔹 Frontend
- **React.js**
- **Context API** (State Management)
- **Custom CSS (Glassmorphism UI)**
- **Socket.IO Client**
- **Leaflet / Mapbox** (Map-based reporting)

### 🔹 Backend
- **Node.js**
- **Express.js**
- **Socket.IO**
- **JWT Authentication**
- **Multer** (Image Upload)

### 🔹 Database
- **MongoDB**
- **Mongoose ODM**

### 🔹 Realtime
- **WebSockets (Socket.IO)**

---

## 🧱 Architecture Overview

```text
Client (React)
   │
   ├── REST APIs (Express + JWT)
   │
   ├── Realtime Events (Socket.IO)
   │
   └── Map Services (Leaflet / Mapbox)
        │
Backend (Node.js + Express)
        │
MongoDB (Mongoose)

🔐 Authentication Flow

JWT-based Login & Signup

Protected routes for Admin

Secure API access using tokens

📈 Future Enhancements

📍 Radius-based issue visibility (3–5 km)

🤖 AI-based issue classification

📱 PWA & Mobile App

🏛️ Role-based admins (Ward / Zone level)

📊 Advanced analytics & heatmaps

🏆 Use Cases

Smart Cities

College & University Campuses

Residential Societies

Corporate Campuses

Government & Municipal Bodies

🤝 Contributing

Contributions are welcome!
Feel free to fork the repo, raise issues, and submit pull requests.

⭐ Show Your Support

If you like this project, give it a ⭐ on GitHub — it helps a lot!
