# External Monitoring Setup Guide

## ✅ What's Been Configured

### 1. Sentry Integration
- ✅ `@sentry/react` package installed
- ✅ Sentry configuration created in `src/lib/sentry.ts`
- ✅ Integrated into app entry point (`src/main.tsx`)
- ✅ Configured with performance monitoring and session replay
- ✅ Environment variables added to `.env`

**Features enabled:**
- Error tracking with stack traces
- Performance monitoring (100% of transactions)
- Session replay (10% of sessions, 100% on errors)
- User context tracking
- Automatic filtering of sensitive data

### 2. Health Check Endpoint
- ✅ Edge function created at `supabase/functions/health-check/index.ts`
- ✅ Checks Database, Auth, and Storage services
- ✅ Returns status codes (200 for healthy, 503 for down)
- ✅ Provides response times for each service

### 3. Status Page
- ✅ Public status page created at `/status`
- ✅ Real-time service monitoring
- ✅ Auto-refreshes every 30 seconds
- ✅ Shows individual service health and response times

---

## 🚀 Next Steps (Manual Configuration Required)

### Step 1: Configure Sentry

1. **Create Sentry Account**
   - Go to https://sentry.io
   - Sign up for free account
   - Create a new project (select React)

2. **Get Your DSN**
   - Copy your Sentry DSN from project settings
   - Add to `.env` file:
     ```
     VITE_SENTRY_DSN=https://your-dsn-here@sentry.io/your-project-id
     ```

3. **Verify Integration**
   - Deploy your app
   - Trigger a test error
   - Check Sentry dashboard for the error

### Step 2: Set Up UptimeRobot

1. **Create UptimeRobot Account**
   - Go to https://uptimerobot.com
   - Sign up for free account (up to 50 monitors)

2. **Add Monitors**
   Create monitors for these endpoints:

   **Main App**
   - URL: `https://your-app-domain.com/`
   - Type: HTTP(S)
   - Monitoring Interval: 5 minutes

   **Health Check**
   - URL: `https://utneaqmbyjwxaqrrarpc.supabase.co/functions/v1/health-check`
   - Type: HTTP(S)
   - Monitoring Interval: 1 minute
   - Expected Status: 200

   **Status Page**
   - URL: `https://your-app-domain.com/status`
   - Type: HTTP(S)
   - Monitoring Interval: 5 minutes

3. **Configure Alerts**
   - Go to My Settings → Alert Contacts
   - Add email addresses for alerts
   - Optional: Add SMS or webhook integrations

4. **Set Up Public Status Page** (Optional)
   - UptimeRobot offers free public status pages
   - Configure at Dashboard → Public Status Pages
   - Share URL with users

### Step 3: Test Everything

1. **Test Health Endpoint**
   ```bash
   curl https://utneaqmbyjwxaqrrarpc.supabase.co/functions/v1/health-check
   ```

2. **Test Sentry Error Tracking**
   - Visit your app
   - Open browser console and run:
     ```javascript
     throw new Error("Test Sentry integration");
     ```
   - Check Sentry dashboard for the error

3. **Verify Status Page**
   - Visit `/status` on your deployed app
   - Verify all services show as healthy

---

## 📊 Monitoring URLs

After deployment, you'll have:

1. **Health Check API**: `https://utneaqmbyjwxaqrrarpc.supabase.co/functions/v1/health-check`
2. **Public Status Page**: `https://your-app-domain.com/status`
3. **Sentry Dashboard**: `https://sentry.io/organizations/your-org/projects/your-project/`
4. **UptimeRobot Dashboard**: `https://uptimerobot.com/dashboard`

---

## 🎯 Expected Alerts

You'll receive alerts for:
- **Critical**: Service completely down (UptimeRobot + Sentry)
- **Warning**: Service degraded or slow response times (UptimeRobot)
- **Errors**: Application errors and crashes (Sentry)
- **Performance**: Slow page loads or API calls (Sentry Performance)

---

## 📈 What You Get

### Sentry Provides:
- Real-time error tracking
- Stack traces with source maps
- User impact analysis
- Performance metrics (LCP, FID, CLS)
- Session replays for debugging
- Release tracking

### UptimeRobot Provides:
- 99.9% uptime monitoring
- Instant downtime alerts
- Historical uptime data
- Multi-location checks
- Public status page
- Response time monitoring

### Status Page Provides:
- Real-time service health
- Individual service metrics
- Response time tracking
- Automatic health checks
- Public availability status

---

## 💡 Tips

1. **Start with Sentry** - Get error tracking set up first
2. **Configure UptimeRobot alerts** - Don't miss critical outages
3. **Share Status Page** - Give users transparency
4. **Review weekly** - Check Sentry and UptimeRobot dashboards
5. **Set up integrations** - Connect to Slack/Discord for team alerts

---

## 🔗 Quick Links

- [Sentry Documentation](https://docs.sentry.io/platforms/javascript/guides/react/)
- [UptimeRobot API Docs](https://uptimerobot.com/api/)
- [Status Page Best Practices](https://www.atlassian.com/incident-management/kpis/status-page)
