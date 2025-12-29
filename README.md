# RemindWell – Never Forget to Take Care of Yourself

[![Next.js 16](https://img.shields.io/badge/Next.js-16-000000?style=flat&logo=next.js&logoColor=white)](https://nextjs.org/)  [![React 19](https://img.shields.io/badge/React-19-149ECA?style=flat&logo=react&logoColor=white)](https://react.dev/)  [![TypeScript 5](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)  [![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?style=flat&logo=supabase&logoColor=white)](https://supabase.com/)  [![Groq AI](https://img.shields.io/badge/Groq_AI-000000?style=flat&logo=anthropic&logoColor=white)](https://groq.com/)  [![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat&logo=vercel&logoColor=white)](https://vercel.com/)  [![MIT License](https://img.shields.io/badge/License-MIT-yellow?style=flat)](LICENSE)

**RemindWell** is an AI-powered reminder and habit tracking application that helps you build healthier routines through smart, contextual notifications delivered via Telegram or email. Perfect for staying hydrated, taking breaks, stretching, and maintaining wellness habits.

> Build better habits, one reminder at a time. 💧

---

## Latest Updates

- **Free-Tier Deployment** – Runs on Vercel Hobby tier with EasyCron integration (no paid plan required)
- **AI-Powered Messages** – Groq LLaMA 3.1 70B generates unique, contextual reminders (no more boring "drink water")
- **Multi-Channel Delivery** – Send reminders via Telegram, email, or both simultaneously
- **Smart Scheduling** – Timezone-aware with active hours control and weekend skip options
- **Dashboard & Stats** – Track active reminders, paused habits, and daily notification counts

---

## Features

### Core Features

#### Smart Reminders
- Create custom reminders with emojis and personalized titles
- Set flexible intervals from 15 minutes to 24 hours
- Pause and resume reminders without losing your schedule
- Mark reminders inactive when no longer needed

#### AI Message Generation
- Powered by Groq's LLaMA 3.1 70B model
- Four message tones: Motivational, Friendly, Direct, Funny
- Contextual messages that consider time since last reminder
- Automatic fallback to title + emoji if AI service is unavailable

#### Multi-Channel Delivery
- **Telegram**: Instant bot messages to your mobile device
- **Email**: Beautifully formatted HTML emails via Resend
- **Both**: Redundant delivery for critical reminders

#### Flexible Scheduling
- **Timezone Support**: All reminders respect your local timezone
- **Active Hours**: Only receive reminders during specified hours (e.g., 9 AM - 5 PM)
- **Weekend Skip**: Automatically pause reminders on Saturdays and Sundays
- **Smart Calculation**: Next scheduled time accounts for all constraints

#### Dashboard & Stats
- Real-time stats: active reminders, paused count, today's sent notifications
- Reminder cards with quick actions (pause, edit, delete)
- Empty states with helpful guidance
- Responsive design for mobile and desktop

---

## Technical Highlights

### Architecture
- **Next.js 16 App Router** with React 19 and TypeScript
- **Serverless API Routes** for all backend operations
- **EasyCron Integration** for free-tier minute-level cron jobs
- **Row-Level Security** ensures users only see their own data
- **Optimistic Updates** for instant UI feedback

### Tech Stack

| Category | Technology |
|---------|------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| UI | Tailwind CSS + Radix UI |
| State | TanStack Query v5 + Zustand |
| Backend | Next.js API Routes |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (Email/Password) |
| AI | Groq SDK (LLaMA 3.1 70B) |
| Notifications | Telegram Bot API + Resend |
| Cron | EasyCron (free external service) |
| Deployment | Vercel (Hobby tier compatible) |

### Security & Performance
- JWT-based authentication with secure cookies
- Service role key for cron jobs only (bypasses RLS)
- Bearer token validation on cron endpoint
- Retry logic with exponential backoff for external APIs
- Database indexes on critical query paths
- Middleware-based route protection


---

## Project Structure

```
app/
├── app/
│   ├── page.tsx                      # Landing page
│   ├── auth/page.tsx                 # Sign in/Sign up
│   ├── dashboard/
│   │   ├── page.tsx                  # Main dashboard
│   │   ├── reminders/
│   │   │   ├── new/page.tsx          # Create reminder
│   │   │   └── [id]/page.tsx         # Edit reminder
│   │   └── settings/page.tsx         # User settings
│   └── api/
│       ├── reminders/                # Reminder CRUD
│       ├── user/                     # User profile
│       ├── stats/                    # Dashboard stats
│       ├── cron/check-reminders/     # Cron job handler (CRITICAL)
│       └── telegram/webhook/         # Telegram bot webhook
├── components/
│   ├── ui/                           # Radix UI components
│   ├── layout/                       # Header, footer, nav
│   └── reminder-*.tsx                # Reminder-specific components
├── hooks/
│   ├── use-reminders.ts              # Reminder CRUD operations
│   ├── use-user.ts                   # User profile management
│   └── use-stats.ts                  # Dashboard statistics
├── lib/
│   ├── external/
│   │   ├── groq.ts                   # AI message generation
│   │   ├── telegram.ts               # Telegram bot client
│   │   └── resend.ts                 # Email service client
│   ├── supabase/                     # Supabase clients
│   ├── scheduling.ts                 # Timezone-aware scheduling
│   └── retry.ts                      # Exponential backoff retry
├── supabase/migrations/              # Database schema & RLS
├── middleware.ts                     # Route protection
├── vercel.json                       # Vercel config (empty crons)
└── .env.local.example                # Environment template
```

---

## How It Works

### Cron Job Flow (Every Minute)

```
Every 1 minute:
  EasyCron (external service)
      ↓
  GET/POST /api/cron/check-reminders (with Bearer token)
      ↓
  Verify CRON_SECRET
      ↓
  Query reminders where next_scheduled_at <= now()
      ↓
  For each due reminder:
      ├─ Check active hours (user's timezone)
      ├─ Check weekend skip setting
      ├─ Generate AI message via Groq
      ├─ Send notification (Telegram/Email)
      ├─ Log to rw_notifications table
      └─ Calculate & update next_scheduled_at
      ↓
  Return { success, processed, failed, total }
```

### Notification Trigger Workflow

1. **EasyCron** makes HTTPS request to your Vercel deployment
2. **API Route** validates Bearer token from `CRON_SECRET`
3. **Database Query** fetches reminders with `next_scheduled_at <= now()` and `is_active = true` and `is_paused = false`
4. **Active Hours Check** ensures reminder is within user's specified time range
5. **Weekend Skip** skips reminder if enabled and today is Saturday/Sunday
6. **AI Generation** calls Groq API to create contextual message
7. **Multi-Channel Send** delivers via Telegram and/or Email
8. **Notification Logging** records success/failure in database
9. **Next Schedule** calculates future trigger time with timezone awareness
10. **Stats Update** increments daily notification count

### Telegram Linking Flow

```
User clicks "Connect Telegram"
    ↓
Shows t.me/[bot_username]
    ↓
User sends /start to bot
    ↓
Webhook receives update
    ↓
Updates telegram_chat_id in rw_users table
    ↓
Confirmation message sent
```

---

## Deployment

### Vercel Deployment

1. **Push to GitHub** (if not already)
2. **Import project in Vercel**
3. **Set environment variables** (copy from `.env.local`, update URLs)
4. **Deploy** (automatic)

### Critical: EasyCron Setup

Since Vercel Hobby tier only allows daily cron jobs, we use EasyCron (free) for every-minute triggers:

1. **Sign up** at https://www.easycron.com/ (no credit card required)
2. **Create cron job**:
   - Name: `RemindWell Check Reminders`
   - URL: `https://your-app.vercel.app/api/cron/check-reminders`
   - HTTP Method: `GET`
   - Cron Expression: `* * * * *` (every minute)
   - Timezone: UTC (recommended)

3. **Add Authorization header**:
   - Name: `Authorization`
   - Value: `Bearer <your-cron-secret>` (same as `CRON_SECRET` in Vercel env vars)

4. **Enable the job** and verify execution in EasyCron logs

---

## Contributing

Contributions are welcome!

**Guidelines**:
- Use TypeScript for all new code
- Follow existing code style
- Test thoroughly before submitting
- Write clear commit messages
- Update documentation as needed

**Pull Request Process**:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally
5. Submit PR with clear description

---

## Support

- **Bugs** → [Open an issue](https://github.com/akshadjaiswal/remind-well/issues)
- **Questions** → [Start a discussion](https://github.com/akshadjaiswal/remind-well/discussions)

---

<div align="center">

**Made with ❤️ by Akshad Jaiswal**

[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/akshadjaiswal)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/akshadsantoshjaiswal)
[![Twitter](https://img.shields.io/badge/Twitter-1DA1F2?style=for-the-badge&logo=twitter&logoColor=white)](https://x.com/akshad_999)

**⭐ Star this repo if you find it useful!**

</div>
