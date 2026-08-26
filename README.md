# 🌐 eSIM Activation & Management System (Telecom Simulation Sandbox)

A modern, full-stack **eSIM Provisioning and Management System** that simulates real-world carrier subscriber onboarding and remote GSMA SM-DP+ eSIM profile provisioning.

> [!NOTE]
> **DEMONSTRATION & PROJECT SYSTEM:**
> This system is built as a complete real-world simulation sandbox. All carrier integrations (Jio, Airtel, Vi, BSNL, Demo Telecom), SM-DP+ server endpoints, LPA codes (`LPA:1$smdp.telecom-demo.io$...`), OTPs, and payment gateways operate in mock/demo mode. It does not provision real commercial carrier eSIMs.

---

## 🚀 Key Features

### 1. 🔐 User Authentication & Session Management
- Registration (Name, Email, Mobile Number, Password)
- JWT Token Authentication with secure Bearer header interceptor
- Passwords hashed with `bcryptjs`
- Password reset flow with simulated recovery tokens
- **1-Click Demo Logins** for instant Subscriber and Administrator access

### 2. 📱 Device Management & 32-Digit EID Validator
- Register devices with device model, operating system (iOS / Android), and device type
- **Strict 32-digit EID Validation**: Checks for exact 32 hexadecimal/decimal digits, standard telecom GSMA prefixes (starting with `89`), and instant visual grouping (`8904 9032 0000 ...`)
- Optional 15-digit IMEI tracking

### 3. 📶 Comprehensive Telecom Plans Catalog
- Sample plans across **Jio, Airtel, Vi, BSNL**, and **Demo Telecom**
- Detailed allowances: Daily Data (1.5 GB/day, 2 GB/day, Unlimited 5G), Validity (28, 56, 84, 365 Days), Calling, SMS, and OTT perks (JioCinema, Disney+ Hotstar, Airtel Xstream)

### 4. ⚡ 7-Stage End-to-End eSIM Activation Wizard
1. **Device Selection / EID**: Pick registered hardware or input fresh 32-digit EID
2. **Carrier & Plan**: Choose operator and 5G data plan
3. **Mobile & OTP Verification**: 6-digit simulated OTP with 60s countdown timer, test OTP readout, and 3-attempt limit
4. **Payment Checkout**: Base price + 18% GST calculation + mock card/UPI checkout modal
5. **Mock SM-DP+ Provisioning**: Calls `POST /api/esim/request` and generates authentic LPA strings e.g. `LPA:1$smdp.telecom-demo.io$ACT-JIO-XXXX`
6. **QR Code Generator**: High-contrast QR code generated from LPA profile with PNG download and 1-click LPA copy
7. **Interactive Installation Guides**: Dedicated step-by-step guides for **Apple iOS (iPhone/iPad)** and **Android (Samsung/Pixel)**
8. **Real-Time Status Lifecycle**: `REQUEST CREATED` ➔ `OTP VERIFIED` ➔ `PAYMENT COMPLETED` ➔ `PROFILE GENERATED` ➔ `QR CODE READY` ➔ `INSTALLATION PENDING` ➔ `ACTIVATED`

### 5. 🛡️ Carrier Command Center (Admin Dashboard)
- **KPI Metrics**: Total Subscribers, Registered Devices, Total Requests, Pending vs Active vs Failed, Total Revenue Logged
- **Interactive Request Controller**: Fast-forward activation stages, Approve or Reject requests in real time
- **Subscribers Registry**: View user device counts and total activations
- **Payments Ledger**: View transaction IDs, GST breakdown, and payment methods
- **Audit Logs**: Telecom audit trail tracking every lifecycle transition

---

## 🛠️ Technology Stack

- **Frontend**: React 19, Vite, React Router v7, React Hot Toast, Lucide React, Canvas Confetti, Vanilla CSS Design System
- **Backend**: Node.js, Express.js, JWT, bcryptjs, QR Code Generator, UUID, Express Rate Limit
- **Database**: 
  - Self-contained file-backed JSON/SQLite database (runs instantly out-of-the-box with zero database configuration)
  - Universal SQL DDL and Seeds in `database/schema.sql` and `database/seeds.sql` for **PostgreSQL, MySQL, and Supabase**

---

## 📂 Project Structure

```
sim-activation-portal/
├── backend/
│   ├── config/
│   │   └── db.js                 # Self-bootstrapping database & seed engine
│   ├── controllers/
│   │   ├── auth.controller.js     # User registration, login, forgot password
│   │   ├── device.controller.js   # Device registry & 32-digit EID validator
│   │   ├── plan.controller.js     # Telecom subscription plans
│   │   ├── otp.controller.js      # Simulated 6-digit OTP engine
│   │   ├── payment.controller.js  # Test payment processing with 18% GST
│   │   ├── esim.controller.js     # POST /api/esim/request & SM-DP+ profile generator
│   │   └── admin.controller.js    # Admin statistics, status updates, audit logs
│   ├── middleware/
│   │   ├── auth.middleware.js     # JWT verification
│   │   └── admin.middleware.js    # Admin role guard
│   ├── services/
│   │   ├── mockSmdpService.js     # GSMA SM-DP+ LPA string & QR code generator
│   │   └── otpService.js          # Simulated OTP manager with rate limits
│   ├── utils/
│   │   └── eidValidator.js        # 32-digit EID validation & formatting
│   ├── routes/                    # Modular Express routes
│   ├── server.js                  # Main Express backend server
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx          # Topbar with live SM-DP+ connection pulse
│   │   │   ├── Sidebar.jsx         # Telecom navigation sidebar
│   │   │   ├── DemoBanner.jsx      # Sticky demo disclaimer banner
│   │   │   ├── StatusTimeline.jsx  # 7-stage visual lifecycle stepper
│   │   │   ├── QRCodeViewer.jsx    # QR code display with download & copy
│   │   │   ├── InstallationGuide.jsx # Tabbed iOS & Android setup guides
│   │   │   └── PaymentModal.jsx    # Mock checkout with tax calculation
│   │   ├── context/
│   │   │   ├── AuthContext.jsx     # JWT session & user state
│   │   │   └── ActivationContext.jsx # Wizard multi-step persistence
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx     # High-tech showcase landing page
│   │   │   ├── Login.jsx           # Sign in with instant 1-click demo buttons
│   │   │   ├── Register.jsx        # Account registration
│   │   │   ├── ForgotPassword.jsx  # Password reset flow
│   │   │   ├── Dashboard.jsx       # User dashboard: Active eSIMs & metrics
│   │   │   ├── DeviceManagement.jsx# EID validator & device manager
│   │   │   ├── PlansPage.jsx       # Telecom plans catalog
│   │   │   ├── ActivationWizard.jsx# 7-stage activation lifecycle flow
│   │   │   ├── ActivationDetails.jsx# Single eSIM profile viewer & status controller
│   │   │   ├── Activations.jsx     # User activation history table
│   │   │   └── AdminDashboard.jsx  # Admin Command Center
│   │   ├── services/
│   │   │   └── api.js              # Centralized Axios client
│   │   ├── App.css                 # Dark telecom design system
│   │   ├── index.css               # Typography & color tokens
│   │   └── App.jsx
│   ├── package.json
│   └── vite.config.js
│
├── database/
│   ├── schema.sql                 # PostgreSQL / MySQL / Supabase DDL
│   └── seeds.sql                  # Initial seed data
└── README.md
```

---

## 🔑 Pre-Configured Demo Accounts

| Role | Email | Password | Access Level |
|---|---|---|---|
| **Subscriber / User** | `user@example.com` | `password123` | User Dashboard, Device Registry, Activate eSIM, QR Codes |
| **Telecom Administrator** | `admin@telecom.demo` | `admin123` | Admin Command Center, KPI metrics, Request Approvals/Rejections |

> You can also click the **Instant Demo Login** buttons on the login page for 1-click sign in.

---

## ⚡ Quick Start & Running Locally

### 1. Start the Backend Server

```bash
cd backend
npm install
npm start
```
* Backend runs at: `http://localhost:5000`
* Health Check: `http://localhost:5000/api/health`

### 2. Start the Frontend Application

```bash
cd frontend
npm install
npm run dev
```
* Frontend runs at: `http://localhost:5173`

---

## 📡 Key API Endpoints

### Authentication
- `POST /api/auth/register` - Create subscriber account
- `POST /api/auth/login` - Sign in (returns JWT token)
- `GET /api/auth/me` - Authenticated user profile
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Set new password

### Devices & EIDs
- `GET /api/devices/my-devices` - List registered devices
- `POST /api/devices/register` - Register device with 32-digit EID validation
- `DELETE /api/devices/:id` - Delete registered device
- `POST /api/devices/validate-eid` - Live EID validation

### Plans
- `GET /api/plans` - List plans (filter by `operator`, `popularOnly`, `minPrice`)
- `GET /api/plans/:id` - Plan details

### OTP Verification (Simulated)
- `POST /api/otp/send` - Generate 6-digit OTP (returns test OTP in dev mode)
- `POST /api/otp/verify` - Verify OTP with rate limit checks

### Payment (Mock Gateway)
- `POST /api/payment/calculate` - Base price + 18% GST calculation
- `POST /api/payment/process` - Process mock transaction

### eSIM Provisioning (SM-DP+ Mock Service)
- `POST /api/esim/request` - Core provisioning API: generates LPA string & QR code
- `GET /api/esim/my-requests` - User activation history
- `GET /api/esim/request/:id` - Request details with QR code & audit trail
- `POST /api/esim/request/:id/status` - Fast-forward/simulate status changes

### Admin Command Center
- `GET /api/admin/stats` - High-level KPIs
- `GET /api/admin/requests` - Filterable activation requests table
- `PUT /api/admin/requests/:id/status` - Approve / Reject / Change status
- `GET /api/admin/users` - All subscribers
- `GET /api/admin/devices` - All devices & EIDs
- `GET /api/admin/payments` - Payments ledger
- `GET /api/admin/logs` - Full audit trail
