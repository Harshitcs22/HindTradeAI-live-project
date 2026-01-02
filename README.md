# HindTrade AI - Global Trade Operating System

> Agent-Led Trade Network for Exporters, Importers, CAs & CHAs

HindTrade AI is a comprehensive trade management platform that connects exporters with global opportunities, provides AI-powered compliance agents, and facilitates connections with verified Chartered Accountants (CAs) and Custom House Agents (CHAs).

## 🚀 Features

- **AI Agents**: HS Code & Compliance, Logistics & Routing, Export Docs Copilot
- **Global Trade Opportunities**: Browse and unlock verified buyer leads
- **Expert Network**: Connect with verified CAs and CHAs
- **Digital Trade Cards**: Verified business profiles with trust scores
- **Real-time Updates**: Live notifications and profile synchronization
- **Inventory Management**: Manage your products and listings

## 🛠 Tech Stack

- **Frontend**: Plain HTML5, Tailwind CSS, Vanilla JavaScript
- **Backend**: Supabase (PostgreSQL + Auth + RLS + Realtime)
- **CDN Libraries**:
  - Supabase JS Client v2
  - Tailwind CSS
  - RemixIcon
  - Inter Font (Google Fonts)

## 📋 Prerequisites

- Python 3.x (for local development server)
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection (for CDN resources)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/Harshitcs22/HindTradeAI-live-project.git
cd HindTradeAI-live-project
```

### 2. Run Local Development Server

```bash
# Using Python 3
python3 -m http.server 8000

# OR using Python 2
python -m http.server 8000

# OR using npm (if package.json installed)
npm run dev
```

### 3. Open in Browser

Navigate to:
- Login Page: http://localhost:8000/index.html
- Dashboard: http://localhost:8000/dashboard.html (requires login)
- Landing Page: http://localhost:8000/landing.html

## 🔐 Authentication

### Default Test Credentials

If you have test data in your Supabase instance:
- User ID: `cc7900ae-240d-46b5-87de-309ff478f7a2`
- Profile: Harshit Singh / Velox Exports

## Authentication Setup

### Login Flow
- Visit: https://hindtradeai.vercel.app/auth.html
- Existing users: Enter email + password
- New users: Click "Sign Up" tab

### Signup Flow
- Fill form: email, password, name, company, phone, city, state, business category
- Auto-creates profile in user_profiles table
- Auto-redirects to dashboard after 2 seconds
- Default values: role='exporter', status='active', trust_score=0, credits=100

### Database
- Table: user_profiles (with RLS policies enabled)
- Primary Key: id (UUID, refs auth.users)
- Auth: Supabase Auth (auto-managed)
- RLS Policies: Users can insert, read, and update their own profiles

### Sign Up

1. Go to http://localhost:8000/auth.html or https://hindtradeai.vercel.app/auth.html
2. Click "Register" tab
3. Select role: Exporter, CA, or CHA
4. Fill in:
   - Full Name
   - Company Name
   - Phone
   - City
   - State
   - Business Category
   - Email
   - Password (min 6 characters)
5. Create account and auto-redirect to dashboard

### Login

1. Enter your email and password
2. Click "Login to Dashboard"
3. Redirects to dashboard on success

### Password Reset

1. Click "Forgot password?" on login page
2. Enter your email address
3. Check email for reset link

## 🗄 Supabase Configuration

### Connection Details

The app connects to Supabase with these credentials (configured in `assets/js/supabase-config.js`):

```javascript
SUPABASE_URL: https://fgzlekquexmtnzrhjswd.supabase.co
ANON_KEY: (included in config file)
```

### Database Tables

The application uses these Supabase tables:

1. **user_profiles** - User profile data
   - Basic info: full_name, email, company_name, location
   - Verification: trust_score, ca_verified, shipments_completed
   - Credits system: credits field
   
2. **trade_opportunities** - Global and local trade listings

3. **inventory** - User product catalog

4. **agents** - AI agent configurations

5. **experts** - CA and CHA directory

### Row Level Security (RLS)

Ensure RLS policies are configured in Supabase to:
- Allow users to read/update their own profiles
- Allow authenticated users to read opportunities
- Protect sensitive data appropriately

## 📁 Project Structure

```
HindTradeAI-live-project/
├── index.html              # Login/Signup page (entry point)
├── dashboard.html          # Main dashboard (requires auth)
├── landing.html            # Marketing landing page
├── auth.html              # Alternative auth page (legacy)
├── assets/
│   ├── js/
│   │   ├── supabase-config.js  # Supabase client & htAPI wrapper
│   │   ├── dashboard.js        # Dashboard-specific logic (legacy)
│   │   ├── auth-logic.js       # Auth helpers (legacy)
│   │   └── main.js            # Global utilities
│   ├── css/
│   │   └── style.css          # Custom styles (if any)
│   └── images/                # Static images
├── package.json           # Project metadata
├── .gitignore            # Git ignore rules
└── README.md            # This file
```

## 🎯 Core Functionality

### htAPI Wrapper

The `htAPI` object (in `supabase-config.js`) provides these methods:

**Authentication:**
- `getCurrentSession()` - Get current user session
- `signIn(email, password)` - Login user
- `signUp(email, password, metadata)` - Register new user
- `signOut()` - Logout user
- `resetPassword(email)` - Send password reset email

**Profile Management:**
- `getUserProfile(userId)` - Fetch user profile with safe defaults
- `updateUserProfile(userId, updates)` - Update profile fields
- `createUserProfile(userId, data)` - Create new profile

**Data Access:**
- `getOpportunities(filters)` - Fetch trade opportunities
- `getInventory(userId)` - Fetch user's inventory
- `getAgents(filters)` - Fetch AI agents
- `getExperts(category)` - Fetch CAs/CHAs (optional category: 'CA' or 'CHA')

**Real-time:**
- `setupProfileListener(userId, callback)` - Listen to profile changes
- `setupOpportunitiesListener(callback)` - Listen to opportunity updates

## 🚢 Deployment

### Deploy to Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Follow prompts
4. Access your live URL

### Deploy to Netlify

1. Drag & drop your project folder to https://app.netlify.com/drop
2. Or connect GitHub repo for auto-deploys
3. No build command needed (static site)

### Deploy to GitHub Pages

```bash
# In your repo settings, enable GitHub Pages
# Set source to main branch / root folder
# Access at: https://yourusername.github.io/HindTradeAI-live-project
```

## 🔧 Configuration

### Changing Supabase Instance

Edit `assets/js/supabase-config.js`:

```javascript
const SUPABASE_URL = 'YOUR_PROJECT_URL';
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY';
```

⚠️ **Never commit your service_role key to git!**

### Adding Features

All core dashboard logic is in `dashboard.html` within `<script>` tags:
- `getDashboardHTML()` - Dashboard page content
- `getOpportunitiesHTML()` - Opportunities page
- `getInventoryHTML()` - Inventory page
- `getAgentsHTML()` - AI Agents page
- `getExpertsHTML()` - Experts directory

## 📊 Database Setup (Optional)

If you need to initialize additional database fields, run this SQL in Supabase SQL Editor:

```sql
-- Ensure user_profiles has all needed columns
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS credits INTEGER DEFAULT 100,
ADD COLUMN IF NOT EXISTS trust_score INTEGER DEFAULT 50,
ADD COLUMN IF NOT EXISTS initials VARCHAR(2),
ADD COLUMN IF NOT EXISTS shipments_completed INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS net_worth BIGINT DEFAULT 0,
ADD COLUMN IF NOT EXISTS ca_verified BOOLEAN DEFAULT false;

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_trade_opportunities_status ON trade_opportunities(status);
CREATE INDEX IF NOT EXISTS idx_inventory_user_id ON inventory(user_id);
```

## 🐛 Troubleshooting

### Login not working

1. Check browser console for errors
2. Verify Supabase credentials in `supabase-config.js`
3. Check Supabase Auth settings (email confirmations, etc.)
4. Ensure user exists in database

### Dashboard not loading data

1. Check console for API errors
2. Verify user_profiles table has data for logged-in user
3. Check RLS policies allow reading data
4. Ensure tables exist in Supabase

### Real-time updates not working

1. Enable Realtime in Supabase dashboard for your tables
2. Check browser console for subscription errors
3. Verify RLS policies allow reading

## 🤝 Contributing

This is a live project. To contribute:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

Proprietary - All rights reserved

## 📞 Support

For issues or questions:
- GitHub Issues: https://github.com/Harshitcs22/HindTradeAI-live-project/issues
- Email: (contact email if available)

## 🎉 Acknowledgments

- Supabase for backend infrastructure
- Tailwind CSS for styling
- RemixIcon for icons
- All contributors and testers

---

**Built with ❤️ for the global trade community**
