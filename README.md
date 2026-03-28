# GSTFlow Pro 🇮🇳

**Production-grade GST Management System for Indian businesses**

Built with React 18 + Vite 5, Three.js r160, MongoDB Atlas, and MCP integrations for Gmail, Google Calendar, and Canva.

---

## 🚀 Quick Start

### 1. Configure Environment

Edit the `.env` file in the project root:

```env
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/gst_management_db
JWT_SECRET=your_super_secret_key
PORT=5000
VITE_API_URL=http://localhost:5000/api
VITE_MY_STATE=Tamil Nadu
VITE_MY_GSTIN=33AABCS1234L1ZF
```

### 2. Start Backend (Express + MongoDB)

```bash
cd server
npm install       # already done if you ran install:all
npm run dev       # nodemon server.js → http://localhost:5000
```

### 3. Start Frontend (React + Vite)

```bash
cd client
npm install       # already done
npm run dev       # Vite → http://localhost:5173
```

---

## 📁 Project Structure

```
gstflow-pro/
├── client/                  # React 18 + Vite 5 frontend
│   └── src/
│       ├── three/           # 5 Three.js scenes
│       ├── components/      # Layout + feature components
│       ├── pages/           # 8 pages
│       ├── hooks/           # useInvoices, useGST, useMCP
│       ├── store/           # Zustand global state
│       ├── utils/           # GST calculator, GSTIN validator
│       └── api/             # Axios config
└── server/                  # Express + MongoDB backend
    ├── models/              # 4 Mongoose models
    ├── routes/              # 6 route files (incl. MCP proxy)
    ├── controllers/         # Auth, Invoice, Party, Product, Report
    ├── middleware/           # JWT auth + error handler
    └── utils/               # gstEngine.js
```

---

## ✨ Features

| Feature | Details |
|---------|---------|
| 🧾 **Invoices** | Sales & Purchase with live GST calc (CGST/SGST/IGST) |
| 🏢 **Parties** | Customer & Vendor management with GSTIN validation |
| 📦 **Products** | Product catalog with HSN codes & GST rates |
| 📊 **Dashboard** | Live stats, animated counters, Recharts area chart |
| 📈 **Reports** | GSTR-1, GSTR-3B, HSN-wise summary (MongoDB aggregations) |
| 🌐 **3D Globe** | State-wise GST visualization on rotating globe |
| ✨ **3D Hero** | Floating ₹ + 2000-particle India map + torus knot |
| 🌊 **Tax Flow** | GLSL shader tube animation for input→output GST |
| 💥 **Particles** | Burst animation on every invoice save |
| 📧 **Gmail MCP** | Send invoice emails + GST due date alerts |
| 📅 **Calendar MCP** | Sync GSTR-1/3B due dates to Google Calendar |
| 🎨 **Canva MCP** | Generate invoice designs + GST report infographics |

---

## 🎨 Design System

- **Primary color**: `#0a0f1e` (dark background)
- **Accent green**: `#00d4aa` (sales, positive)
- **Accent blue**: `#0077ff` (primary actions)
- **Accent amber**: `#f59e0b` (purchases, warnings)
- **Fonts**: Sora (UI) + Space Mono (numbers, GSTIN)

---

## 🔐 GST Logic

- **Intra-state** (party.state === MY_STATE): CGST = SGST = gstRate/2
- **Inter-state**: IGST = gstRate
- **Net payable**: Output GST − Input Tax Credit (ITC)
- **GSTIN regex**: `/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/`
- **GST Rates**: 0%, 5%, 12%, 18%, 28%

---

## 📡 MCP Integrations

- **Gmail**: `POST /api/mcp/gmail/send`
- **Calendar Sync**: `POST /api/mcp/calendar/sync`
- **Calendar Event**: `POST /api/mcp/calendar/event`
- **Canva Design**: `POST /api/mcp/canva/design`
- **Canva Report**: `POST /api/mcp/canva/report`

---


