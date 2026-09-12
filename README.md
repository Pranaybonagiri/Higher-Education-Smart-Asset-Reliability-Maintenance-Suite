# Higher Education Smart Asset Reliability & Maintenance Suite (HE-SARMS)

An AI-powered, enterprise-grade Predictive Maintenance & Complete Lifecycle Asset Suite developed specifically for Universities and Higher Education Institutions.

Built with the **MERN Stack** (MongoDB, Express.js, React.js with Vite, Node.js) and powered by **Google Gemini AI**.

---

## Live Development Servers

- **Frontend Application**: [http://localhost:5173](http://localhost:5173)
- **Backend REST API**: [http://localhost:5000](http://localhost:5000)
- **API Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 1-Click Evaluation Credentials

You can instantly switch personas using the 1-click buttons on the Login page or the role selector in the top navbar:

| Role | Email | Password | Persona & Authority |
|---|---|---|---|
| **Maintenance Admin** | `admin@campus.edu` | `Password123!` | Dr. Marcus Vance &bull; Full Campus Authority & System Settings |
| **Technician** | `tech@campus.edu` | `Password123!` | Elena Rostova &bull; Work Order Execution & Field Checklists |
| **Operations Manager** | `ops@campus.edu` | `Password123!` | Devon Bradley &bull; AI Recommendation Review & Verification Sign-off |
| **Vendor / Contractor** | `vendor@campus.edu` | `Password123!` | Klaus Lindqvist &bull; Siemens Precision Mechanical Systems |
| **Academic Dept Head** | `depthead@campus.edu` | `Password123!` | Prof. Alistair Chen &bull; Research Lab & Lecture Protection |

---

## Project Structure

```
nxtproject/
├── server/                    # Node.js + Express + Mongoose Backend
│   ├── src/
│   │   ├── config/db.js       # Auto-fallback embedded MongoDB connection
│   │   ├── models/            # User, Asset, Telemetry, WorkOrder, AIRecommendation, AuditLog, Notification, SystemSetting
│   │   ├── middleware/        # JWT auth, requireRole RBAC, audit logger, error handler
│   │   ├── services/          # Google Gemini AI integration & RCM physics engine
│   │   ├── controllers/       # Modular controllers for all 12 modules
│   │   ├── routes/            # REST API endpoints
│   │   ├── seed.js            # Rich university data seeder
│   │   └── server.js          # Express app entry
│   ├── .env                   # Protected environment variables (Gemini API key)
│   └── package.json
│
└── client/                    # Vite + React 18 + Tailwind CSS Frontend
    ├── src/
    │   ├── components/        # Navbar (with live alerts & role switcher), Sidebar
    │   ├── context/           # AuthContext with demo logins & RBAC
    │   ├── pages/             # All 12 required responsive pages
    │   ├── services/api.js    # Axios client with interceptors
    │   ├── App.jsx            # Routing & protected layout
    │   └── main.jsx
    ├── tailwind.config.js
    ├── vite.config.js
    └── package.json
```

---

## How to Run Locally

### Backend:
```bash
cd server
npm install
npm start
```
*Note: If `MONGODB_URI` is not set in `.env`, the server automatically spins up an embedded in-memory MongoDB instance with zero configuration required!*

### Frontend:
```bash
cd client
npm install
npm run dev
```

---

## Key Features

1. **Complete 12-Page University Suite**:
   - Secure Login (JWT, remember me, forgot password)
   - Asset Registry & Health Dashboard (Classrooms, Bio Labs, Libraries, Hostels, Devices, IT Systems)
   - Asset Detail & Sensor Trends (Interactive Recharts time series, ISO 10816 thresholds)
   - Maintenance Calendar & Technician Queue (Interactive inspection checklist with meter readings & Gemini note summarizer)
   - Maintenance Planning Board (5-stage Kanban with closure verification diffs)
   - AI Failure Risk & RUL (Degradation curve, contributing factors, low confidence state)
   - AI Recommendations (Human-in-the-loop Approve, Reject with reason, Override)
   - Reliability & Model Drift (Accuracy, precision, recall, sensor drift, technician calibration)
   - Reports & Analytics (Academic downtime impact, MTBF/MTTR, real CSV export & printable PDF)
   - Notification Center (Real-time dropdown + dedicated management page)
   - User & Role Management (Least-privilege RBAC matrix)
   - Audit Logs & System Settings (Append-only immutable ledger with JSON diffs)

2. **Security & AI Safety**:
   - Google Gemini API key securely kept on the backend.
   - Append-only immutable audit trail capturing actor, timestamp, outcome, previous state, and new state.
   - Academic quiet window freeze protecting classrooms and libraries during exams.

