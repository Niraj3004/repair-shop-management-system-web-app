# WeFixIt - Repair Shop Management System

WeFixIt is a premium, full-stack device repair tracking and support platform. It features real-time messaging with WhatsApp-style read receipts, a persistent AI assistant, and a streamlined repair lifecycle. Clients can track bookings, manage invoices, and receive notifications, while admins oversee operations through a professional dashboard.

---

## 🚀 Key Features

*   **Real-time Support Chat**: Instant human-to-human messaging with **WhatsApp-style read receipts** (double blue ticks) and real-time unread badges.
*   **AI Assistant**: Persistent 24/7 AI support powered by **Google Gemini**, capable of answering questions about repairs, tracking, and payments with full conversation history.
*   **Repair Lifecycle Tracking**: Complete end-to-end management from booking/drop-off to diagnosis, repair, and completion.
*   **Digital Invoices**: Automated invoice generation, PDF downloads, and interactive payment verification via QR codes.
*   **Premium UI/UX**: Social-media-style chat interfaces, sleek dashboards using Shadcn UI, and modern animations for a professional feel.
*   **Notification Engine**: Real-time in-app alerts and status updates to keep clients informed at every step.
*   **Admin Power Tools**: Advanced dashboard for managing users, approving payments, and sending global notifications.

---

## 🛠️ Tech Stack

**Frontend:**
- **React** & **TypeScript**
- **Tailwind CSS** (Styling)
- **Shadcn UI** (Component Library)
- **TanStack Query** (Data Fetching)
- **Zustand** (State Management)
- **Socket.io-client** (Real-time updates)

**Backend:**
- **Node.js** & **Express**
- **TypeScript**
- **MongoDB** (Mongoose ODM)
- **Socket.io** (Bidirectional Communication)
- **JWT** (Authentication & Authorization)
- **Zod** (Schema Validation)

**Third-Party Services:**
- **Google Generative AI** (Gemini AI for Chatbot)
- **Cloudinary** (Image storage)
- **Nodemailer** (Email notifications)

---

## 📦 Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- MongoDB account (Atlas or Local)
- Google AI Studio API Key (for Gemini)

### 1. Clone & Configure
```bash
git clone https://github.com/Niraj3004/repair-shop-management-system-web-app.git
cd repair-shop-management-system-web-app
```

### 2. Backend Configuration
1. Navigate to the backend directory:
   ```bash
   cd backend
   npm install
   ```
2. Create a `.env` file and add the following:
   ```env
   PORT=4000
   MONGO_URI=your_mongodb_uri
   JWT_SECRET=your_secret_key
   GEMINI_API_KEY=your_gemini_key
   CLOUDINARY_CLOUD_NAME=name
   CLOUDINARY_API_KEY=key
   CLOUDINARY_API_SECRET=secret
   NODE_ENV=development
   ```
3. Seed the admin user and start the server:
   ```bash
   npm run seed
   npm run dev
   ```

### 3. Frontend Configuration
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   npm install
   ```
2. Create a `.env.local` file:
   ```env
   VITE_API_URL=http://localhost:4000/api
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

---

## 🛡️ License
Distributed under the MIT License. See `LICENSE` for more information.

---
Developed with ❤️ by [Niraj](https://github.com/Niraj3004)
