# 🏥 ProHealth — Smart Telemedicine & Appointment Management System

> A full-stack telemedicine web application that connects patients and doctors through real-time video consultations, smart appointment scheduling, live notifications, and digital prescriptions — all in one platform.

---

## 🌐 Live Demo

🔗 **[https://telemedicine-frontend-three.vercel.app](https://telemedicine-frontend-three.vercel.app)**

> **Demo Credentials**
>
> | Role    | Email              | Password  |
> |---------|--------------------|-----------|
> | Patient | patient@test.com   | test123   |
> | Doctor  | doctor@test.com    | test123   |
> | Admin   | admin@test.com     | test123   |

---

## 📸 Screenshots

<img width="1581" height="768" alt="image" src="https://github.com/user-attachments/assets/b25026c8-c2a1-40d7-a1e5-d25ecdb8fd60" />
<img width="1318" height="780" alt="image" src="https://github.com/user-attachments/assets/79a01818-050b-40bc-96a6-6b9c48740c89" />
<img width="1323" height="657" alt="image" src="https://github.com/user-attachments/assets/a341361f-6cfe-4414-b117-2ed4e1872cb2" />
<img width="1584" height="655" alt="image" src="https://github.com/user-attachments/assets/2198baac-9a7f-4c9a-87e2-b0e1c582f05c" />





---

## ✨ Features

### 👤 Authentication & Authorization
- Secure **JWT-based** login & signup
- **Role-based access control** for three user types: Patient, Doctor, and Admin
- Email verification on registration via **Nodemailer**

### 📅 Appointment Management
- Patients can **search doctors** by specialty and availability
- Book, reschedule, or cancel appointments
- **Paginated** appointment history for both patients and doctors

### 🎥 Video Consultations
- **WebRTC-powered** peer-to-peer video calls directly in the browser
- No third-party software required — works seamlessly from the app

### 🔔 Real-Time Notifications (SSE)
- **Server-Sent Events (SSE)** notify doctors and patients instantly when appointment status changes (confirmed, cancelled, rescheduled)
- Live updates without page refresh

### 💬 Real-Time Chat
- **Socket.io** powered in-app messaging between patients and doctors

### 📋 Digital Prescriptions
- Doctors can **write prescriptions** after consultations
- Patients can **view and download** their prescriptions as PDF

### 📊 Admin Dashboard
- Visual analytics using **Chart.js** (appointments, users, activity trends)
- Manage doctors, patients, and platform-wide appointments

### 🖼️ File Uploads
- Profile pictures and medical documents uploaded via **Cloudinary**

### 🔍 Search & Filters
- Search doctors by name, specialty, or availability
- Filter appointments by date, status, and doctor

---

## 🛠️ Tech Stack

| Layer       | Technology                          |
|-------------|--------------------------------------|
| Frontend    | React.js, Tailwind CSS, React Router |
| Backend     | Node.js, Express.js                  |
| Database    | MongoDB, Mongoose                    |
| Real-Time   | Socket.io (chat), SSE (notifications), WebRTC (video) |
| Auth        | JWT, bcrypt                          |
| File Upload | Cloudinary                           |
| Email       | Nodemailer                           |
| Charts      | Chart.js                             |
| Deployment  | Vercel (Frontend), Render (Backend)  |

---

## ⚙️ Challenges Solved

### 🎥 WebRTC Video Calls in Browser
Implementing peer-to-peer video without a third-party SDK required handling ICE candidate negotiation and signaling manually using Socket.io — built entirely from scratch.

### 🔔 SSE-Based Live Appointment Notifications
Used Server-Sent Events to push real-time appointment status changes (confirmed/cancelled/rescheduled) to the correct patient or doctor without requiring WebSocket overhead or polling.

### 🔐 Role-Based Access Control (RBAC)
Designed and enforced three separate access layers — Patient, Doctor, and Admin — with protected routes on both frontend (React) and backend (Express middleware), ensuring no cross-role data leaks.

### ☁️ Optimized File Uploads with Cloudinary
Configured Cloudinary with file type validation and size limits to handle secure profile and document uploads efficiently at scale.

### 📱 Responsive Medical UI
Designed a clean, professional, and fully responsive interface suited for healthcare workflows — balancing simplicity for patients and data density for doctors and admins.

---

## 🚀 Installation & Local Setup

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- Cloudinary account
- Gmail account (for Nodemailer)

### 1. Clone the Repositories

```bash
# Frontend
git clone https://github.com/TahaY291/telemedicine-frontend
cd telemedicine-frontend
npm install
npm run dev

# Backend
git clone https://github.com/TahaY291/Telemedicine-backend
cd Telemedicine-backend
npm install
npm start

# Admin Panel
git clone https://github.com/TahaY291/telemedicine-admin
cd telemedicine-admin
npm install
npm run dev
```

### 2. Environment Variables

Create a `.env` file in the **frontend** root:

```env
VITE_BACKEND_URL=your backend url
```

> ⚠️ **Never commit your `.env` file.** Add it to `.gitignore`.

---

## 🔭 Future Improvements

- 🤖 **AI Diagnosis Suggestions** — Symptom checker using an AI model to suggest possible conditions before booking
- 📱 **Mobile App** — React Native version for iOS and Android
- 💊 **Pharmacy Integration** — Allow patients to order prescribed medicines directly
- 🌍 **Multi-language Support** — Urdu and other regional languages

---

## 📁 Repositories

| Part         | Repository Link                                                                 |
|--------------|---------------------------------------------------------------------------------|
| 🖥️ Frontend  | [telemedicine-frontend](https://github.com/TahaY291/telemedicine-frontend)      |
| ⚙️ Backend   | [Telemedicine-backend](https://github.com/TahaY291/Telemedicine-backend)        |
| 🛡️ Admin     | [telemedicine-admin](https://github.com/TahaY291/telemedicine-admin)            |

---

## 📄 License

This project was developed as a Final Year Project (FYP). Feel free to explore and learn from the code.
