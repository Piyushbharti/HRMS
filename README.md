# HRMS Lite — Human Resource Management System

A full-stack HRMS portal for managing employees and tracking daily attendance.

🔗 **Live Demo:** [https://kaleidoscopic-melomakarona-33e0e1.netlify.app/](https://kaleidoscopic-melomakarona-33e0e1.netlify.app/)

---

## 📋 Project Overview

HRMS Lite is a lightweight Human Resource Management System that allows organizations to:

- **Manage Employees** — Add, view, search, filter, and delete employee records
- **Track Attendance** — Mark daily attendance (Present / Absent) per employee
- **Dashboard Overview** — See real-time stats: total employees, present today, absent today, attendance rate
- **Export Data** — Download attendance records as CSV

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, React Router v6 (HashRouter), Axios, React Toastify, React Icons |
| **Backend** | Django 4.2, Django REST Framework 3.15 |
| **Database** | PostgreSQL (Render managed DB) |
| **Auth / CORS** | django-cors-headers |
| **Production Server** | Gunicorn + WhiteNoise |
| **Hosting** | Render (backend + DB), GitHub Pages / local (frontend) |
| **Styling** | Vanilla CSS — custom design system (sidebar layout, Inter font, purple/indigo theme) |

---

## 🚀 Running Locally

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL (local instance) **or** a Render PostgreSQL URL

---

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/hrms.git
cd hrms
```

---

### 2. Backend Setup

```bash
cd backend
pip install -r requirements.txt
```

Create a `.env` file inside `backend/`:

```env
# For local PostgreSQL
DATABASE_URL=postgresql://postgres:YourPassword@127.0.0.1:5432/postgres

# Or for Render PostgreSQL (external URL)
# DATABASE_URL=postgresql://user:password@host.oregon-postgres.render.com/dbname

SECRET_KEY=your-secret-key-here
DEBUG=True
```

Apply migrations and create tables:

```bash
python manage.py migrate --run-syncdb
```

Start the development server:

```bash
python manage.py runserver 0.0.0.0:8000
```

Backend will be available at: `http://localhost:8000/api/`

---

### 3. Frontend Setup

```bash
cd ../frontend
npm install
npm start
```

Frontend will be available at: `http://localhost:3000`

> **Note:** The frontend is pre-configured to call `https://hrms-a3t7.onrender.com/api`.  
> To use your local backend instead, edit `frontend/src/services/api.js`:
> ```js
> const API_BASE_URL = 'http://localhost:8000/api';
> ```

---

### 4. API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/` | Health check |
| `GET` | `/api/employees/` | List all employees |
| `POST` | `/api/employees/` | Create employee |
| `GET` | `/api/employees/{id}/` | Get employee + attendance |
| `DELETE` | `/api/employees/{id}/` | Delete employee |
| `POST` | `/api/attendance/` | Mark attendance |
| `GET` | `/api/attendance/employee/{id}/` | Attendance by employee |
| `GET` | `/api/attendance/date/{date}/` | Attendance by date |

---

## ⚙️ Deploying to Render

### Backend
1. Create a **Web Service** on Render pointing to `backend/`
2. Set **Build Command:**
   ```
   pip install -r requirements.txt && python manage.py migrate --run-syncdb && python manage.py collectstatic --noinput
   ```
3. Set **Start Command:**
   ```
   gunicorn hrms_backend.wsgi:application --bind 0.0.0.0:$PORT --workers 2 --timeout 120
   ```
4. Add **Environment Variables** on Render:
   ```
   DATABASE_URL = <your Render internal PostgreSQL URL>
   SECRET_KEY   = <a long random string>
   DEBUG        = False
   ```

---

## ⚠️ Assumptions & Limitations

- **No authentication** — the system has no login/logout. All endpoints are publicly accessible. Suitable for internal/demo use only.
- **Single organization** — designed for one company; no multi-tenancy support.
- **Attendance is per-day** — one record per employee per date; duplicate entries are blocked.
- **Status values** — the PostgreSQL database stores attendance status as `PRESENT` / `ABSENT` (uppercase ENUM). The API normalizes input automatically so `Present`, `present`, and `PRESENT` all work.
- **Password containing `@`** — if your local PostgreSQL password contains `@`, URL-encode it as `%40` in `DATABASE_URL`.
- **Render cold starts** — the free-tier Render backend spins down after inactivity. First request may take ~30 seconds to respond.
- **No pagination** — all employees and attendance records are fetched in one request. May slow down with very large datasets.

---

## 📁 Project Structure

```
hrms/
├── backend/
│   ├── hrms_backend/       # Django project settings, URLs, WSGI
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── hrms/               # Django app — models, views, serializers
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── views.py
│   │   └── urls.py
│   ├── requirements.txt
│   ├── Procfile
│   ├── manage.py
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── components/     # AttendanceForm, AttendanceList, EmployeeForm, EmployeeList
    │   ├── pages/          # Dashboard, EmployeeManagement, AttendanceManagement
    │   ├── services/       # api.js (Axios client)
    │   ├── styles/         # App.css (unified design system)
    │   └── App.js
    └── package.json
```

---

## 📄 License

MIT License — free to use and modify.
