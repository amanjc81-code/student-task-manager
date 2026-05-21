# Student Task Management System

A full-stack task management application with role-based access control. Admins create and manage tasks, students submit their work (GitHub link + ZIP file) for admin review — all updated in real-time via Socket.io.

## Default Credentials

| Role    | Email              | Password |
| ------- | ------------------ | -------- |
| Admin   | admin@test.com     | pass123  |
| Student | student@test.com   | pass123  |

> Use the **Register** page to create new student accounts. To promote a user to admin, set their email in `backend/scripts/seed.js` and run `node scripts/seed.js`.

---

## Project Flow

### 1. Authentication
- Users register/login with email and password.
- JWT token is stored in localStorage and sent with every API request.
- Two roles: **admin** (full access) and **student** (limited access).

### 2. Admin Panel (`/admin/dashboard`)
- **Dashboard** — overview with stat cards (Total, Pending, In Progress, Submitted, Completed).
- **Create Task** — assign a title, description, due date, and a student.
- **Edit / Delete** — modify or remove any task.
- **Review Submissions** — when a student submits, the task shows links (GitHub, Live Demo, ZIP download) with **Approve** (→ completed) and **Reject** (→ back to pending) buttons.
- **Timer** — start/pause/reset a work timer; click 📝 to save a time note.

### 3. Student Panel (`/student/dashboard`)
- **My Tasks** — lists only tasks assigned to the student, filterable by date tabs (Recently, Today, Upcoming, Later) and searchable.
- **Status Tracking** — update task status: Pending → In Progress.
- **Submit Work** — select **✓ Submit** from the dropdown → a modal opens to enter a GitHub link, deployed link, and/or upload a ZIP file (max 50MB, .zip/.rar/.7z).
- **After Submission** — status changes to "submitted" (purple badge, "⏳ Pending review") and the student can no longer edit. Waiting for admin to approve or reject.
- **Timer** — same start/pause/reset/note functionality as admin.

### 4. Real-Time Updates (Socket.io)
- When an admin creates/edits/deletes a task, the assigned student sees it instantly without a page refresh.
- When a student submits work, all admin panels update in real-time.
- When an admin approves or rejects, the student's dashboard updates immediately.

### 5. Tech Stack
- **Frontend** — React + Vite, Axios, Socket.io-client
- **Backend** — Node.js + Express, Socket.io, MongoDB + Mongoose
- **Auth** — JWT (jsonwebtoken) + bcryptjs
- **File Uploads** — Multer (stored in `backend/uploads/`)

## Prerequisites

- **Node.js** (v16 or higher) — [Download](https://nodejs.org/)
- **MongoDB** — must be installed and running on your PC
  - [Download MongoDB Community Server](https://www.mongodb.com/try/download/community)
  - After installation, MongoDB runs by default on `mongodb://localhost:27017`
  - Or use [MongoDB Atlas](https://www.mongodb.com/atlas) (cloud) — just update `MONGO_URI` in `.env`

## Getting Started

```bash
# 1. Backend setup
cd backend
cp .env.example .env                # edit MONGO_URI and JWT_SECRET if needed
npm install
npm start                           # starts on http://localhost:5000

# 2. Frontend setup (in a new terminal)
cd frontend
npm install
npm run dev                         # starts on http://localhost:5173

# 3. Open your browser and go to http://localhost:5173
```

> **Note:** MongoDB must be running **before** you start the backend. If MongoDB is not running, the server will fail to connect and throw an error.

### Environment Variables (`backend/.env`)

| Variable      | Description                        | Default Value                     |
| ------------- | ---------------------------------- | --------------------------------- |
| `MONGO_URI`   | MongoDB connection string          | `mongodb://localhost:27017/tasks` |
| `JWT_SECRET`  | Secret key for JWT signing         | `your_jwt_secret_key`            |
| `PORT`        | Backend server port                | `5000`                           |

### Seeding Default Users

```bash
cd backend
node scripts/seed.js                 # promotes a user to admin (set ADMIN_EMAIL inside the script)
node scripts/clean.js                # deletes all tasks but keeps all users
```
