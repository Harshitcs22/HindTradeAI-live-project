# HindTrade AI - Export Platform MVP

A production-ready MVP for India's export intelligence platform. Complete flow: User signup → Exporter profile → Admin verification → Trade card issuance.

## Tech Stack

- **Frontend**: React 19 + Vite
- **Styling**: Tailwind CSS 4
- **Backend**: Supabase (Auth, Database, Storage)
- **Routing**: React Router v7

## Quick Start

### 1. Install Dependencies

```bash
cd hindtrade-react
npm install
```

### 2. Configure Supabase

Create a `.env` file in the `hindtrade-react` folder:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 3. Setup Database

Run the SQL schema in your Supabase SQL Editor:

```bash
# Open supabase-schema.sql and run in Supabase Dashboard → SQL Editor
```

This creates:
- `exporters` - Exporter company profiles
- `verification_requests` - Pending/approved/rejected verifications
- `trade_cards` - Issued trade cards with unique IDs
- `providers` - CA directory (seeded with 3 sample CAs)

### 4. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:5173`

## User Flow

```
1. Sign Up (/auth)
   └─→ Dashboard (/dashboard)
       └─→ Complete Exporter Profile
           └─→ Submit for Verification
               └─→ Admin Approves (/admin)
                   └─→ Trade Card Issued
                       └─→ Public Card (/trade-card/[id])
```

## Routes

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/auth` | Login/Signup |
| `/dashboard` | User dashboard with profile, verification status, trade card |
| `/admin` | Admin panel for verification management |
| `/trade-card/:id` | Public trade card page (shareable) |

## Features

- ✅ **Supabase Auth** - Email/password authentication
- ✅ **Exporter Profile** - Company details, GST, IEC code
- ✅ **Verification System** - Pending → Approved/Rejected workflow
- ✅ **Trade Card** - Unique ID, QR code, public shareable page
- ✅ **CA Directory** - Real data from providers table
- ✅ **Admin Panel** - Approve/reject verification requests

## Admin Setup

To make a user an admin, run in Supabase SQL Editor:

```sql
UPDATE user_profiles 
SET role = 'admin' 
WHERE email = 'admin@example.com';
```

## Deployment

### Vercel

1. Connect your GitHub repo to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy

### Build

```bash
npm run build
```

## Project Structure

```
hindtrade-react/
├── src/
│   ├── components/
│   │   └── ExporterProfileForm.jsx
│   ├── config/
│   │   └── supabase.js
│   ├── pages/
│   │   ├── Admin.jsx
│   │   ├── Auth.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Index.jsx
│   │   ├── Landing.jsx
│   │   └── TradeCard.jsx
│   ├── App.jsx
│   ├── index.css
│   └── main.jsx
├── supabase-schema.sql
├── .env.example
└── package.json
```

## License

MIT
