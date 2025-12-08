# Healix Deployment Guide

## Prerequisites

Before deploying, ensure you have:
- Supabase account and project
- Vercel account (or other hosting platform)
- Google Gemini API key
- Resend API key (for contact form)

## 1. Supabase Setup

### Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note your project URL and anon key

### Enable Email Authentication
1. Go to Authentication → Providers
2. Enable Email provider
3. Configure email templates (optional)
4. Disable email confirmation for testing (or configure SMTP)

### Create Required Tables

Run these SQL commands in Supabase SQL Editor:

```sql
-- User profiles table
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_user_id TEXT UNIQUE NOT NULL,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User settings table
CREATE TABLE user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_user_id TEXT UNIQUE NOT NULL,
  assistant_name TEXT DEFAULT 'Healix',
  user_name TEXT,
  voice_enabled BOOLEAN DEFAULT true,
  voice_language TEXT DEFAULT 'en-US',
  selected_voice TEXT DEFAULT 'warm-female',
  voice_speed DECIMAL DEFAULT 0.9,
  voice_pitch DECIMAL DEFAULT 1.1,
  voice_volume DECIMAL DEFAULT 0.8,
  gesture_enabled BOOLEAN DEFAULT false,
  auto_activate BOOLEAN DEFAULT false,
  wake_word TEXT DEFAULT 'healix',
  theme TEXT DEFAULT 'system',
  notifications BOOLEAN DEFAULT true,
  sound_effects BOOLEAN DEFAULT true,
  privacy_mode BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat sessions table
CREATE TABLE chat_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id TEXT UNIQUE NOT NULL,
  clerk_user_id TEXT,
  title TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat messages table
CREATE TABLE chat_messages (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES chat_sessions(session_id) ON DELETE CASCADE,
  clerk_user_id TEXT,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  timestamp BIGINT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activity log table
CREATE TABLE activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_user_id TEXT NOT NULL,
  activity_type TEXT NOT NULL,
  activity_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Mood entries table (optional - for future use)
CREATE TABLE mood_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_user_id TEXT NOT NULL,
  mood_score INTEGER NOT NULL,
  mood_label TEXT,
  emotions JSONB,
  notes TEXT,
  activities TEXT[],
  triggers TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Therapy sessions table (optional - for future use)
CREATE TABLE therapy_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clerk_user_id TEXT NOT NULL,
  session_type TEXT,
  duration_minutes INTEGER,
  topics TEXT[],
  insights JSONB,
  mood_before INTEGER,
  mood_after INTEGER,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_user_profiles_clerk_id ON user_profiles(clerk_user_id);
CREATE INDEX idx_user_settings_clerk_id ON user_settings(clerk_user_id);
CREATE INDEX idx_chat_messages_session ON chat_messages(session_id);
CREATE INDEX idx_chat_messages_user ON chat_messages(clerk_user_id);
CREATE INDEX idx_activity_log_user ON activity_log(clerk_user_id);
CREATE INDEX idx_activity_log_type ON activity_log(activity_type);
CREATE INDEX idx_activity_log_created ON activity_log(created_at DESC);
```

### Enable Row Level Security (RLS)

```sql
-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Policies for user_profiles
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid()::text = clerk_user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid()::text = clerk_user_id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid()::text = clerk_user_id);

-- Policies for user_settings
CREATE POLICY "Users can view own settings" ON user_settings
  FOR SELECT USING (auth.uid()::text = clerk_user_id);

CREATE POLICY "Users can update own settings" ON user_settings
  FOR UPDATE USING (auth.uid()::text = clerk_user_id);

CREATE POLICY "Users can insert own settings" ON user_settings
  FOR INSERT WITH CHECK (auth.uid()::text = clerk_user_id);

-- Policies for chat_sessions
CREATE POLICY "Users can view own sessions" ON chat_sessions
  FOR SELECT USING (auth.uid()::text = clerk_user_id);

CREATE POLICY "Users can insert own sessions" ON chat_sessions
  FOR INSERT WITH CHECK (auth.uid()::text = clerk_user_id);

-- Policies for chat_messages
CREATE POLICY "Users can view own messages" ON chat_messages
  FOR SELECT USING (auth.uid()::text = clerk_user_id);

CREATE POLICY "Users can insert own messages" ON chat_messages
  FOR INSERT WITH CHECK (auth.uid()::text = clerk_user_id);

CREATE POLICY "Users can delete own messages" ON chat_messages
  FOR DELETE USING (auth.uid()::text = clerk_user_id);

-- Policies for activity_log
CREATE POLICY "Users can view own activity" ON activity_log
  FOR SELECT USING (auth.uid()::text = clerk_user_id);

CREATE POLICY "Users can insert own activity" ON activity_log
  FOR INSERT WITH CHECK (auth.uid()::text = clerk_user_id);
```

## 2. Environment Variables

### For Local Development (.env.local)
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google Gemini
GOOGLE_API_KEY=your_gemini_api_key
GEMINI_API_KEY=your_gemini_api_key

# Backend
NEXT_PUBLIC_BACKEND_URL=http://127.0.0.1:8000
BACKEND_URL=http://127.0.0.1:8000

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Email
RESEND_API_KEY=your_resend_api_key
CONTACT_EMAIL=your_email@example.com
```

### For Production (Vercel)
Add these environment variables in Vercel dashboard:

1. `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
2. `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key
3. `GOOGLE_API_KEY` - Your Google Gemini API key
4. `GEMINI_API_KEY` - Same as GOOGLE_API_KEY
5. `NEXT_PUBLIC_BACKEND_URL` - Your deployed backend URL
6. `BACKEND_URL` - Same as NEXT_PUBLIC_BACKEND_URL
7. `NEXT_PUBLIC_APP_URL` - Your Vercel app URL
8. `RESEND_API_KEY` - Your Resend API key
9. `CONTACT_EMAIL` - Your contact email

## 3. Deploy to Vercel

### Option 1: Deploy via GitHub
1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Add environment variables
6. Click "Deploy"

### Option 2: Deploy via Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

## 4. Post-Deployment Checklist

- [ ] Test user registration
- [ ] Test user login
- [ ] Test password reset
- [ ] Verify chat functionality
- [ ] Test music player
- [ ] Check activity tracking in Supabase
- [ ] Test contact form
- [ ] Verify all pages load correctly
- [ ] Check mobile responsiveness

## 5. Troubleshooting

### Authentication Not Working

**Issue:** Users can't sign up or sign in

**Solutions:**
1. Check Supabase email provider is enabled
2. Verify environment variables are set correctly
3. Check browser console for errors
4. Ensure Supabase URL and keys are correct
5. Disable email confirmation in Supabase (for testing)

### Database Errors

**Issue:** Data not saving to Supabase

**Solutions:**
1. Verify all tables are created
2. Check RLS policies are set correctly
3. Ensure user is authenticated
4. Check Supabase logs for errors

### API Errors

**Issue:** Backend API calls failing

**Solutions:**
1. Verify NEXT_PUBLIC_BACKEND_URL is correct
2. Check backend is deployed and running
3. Verify CORS settings on backend
4. Check API keys are valid

## 6. Monitoring

### Supabase Dashboard
- Monitor authentication activity
- Check database usage
- View API logs
- Monitor storage usage

### Vercel Dashboard
- Check deployment logs
- Monitor function execution
- View analytics
- Check error logs

## 7. Security Best Practices

1. **Never commit .env files** - Use .env.example as template
2. **Enable RLS** - Always use Row Level Security
3. **Validate inputs** - Sanitize all user inputs
4. **Use HTTPS** - Always use secure connections
5. **Rotate keys** - Regularly update API keys
6. **Monitor logs** - Check for suspicious activity

## 8. Backup Strategy

1. **Database Backups** - Supabase provides automatic backups
2. **Code Backups** - Use Git for version control
3. **Environment Variables** - Keep secure backup of .env files

## Support

For issues or questions:
- Check Supabase documentation: https://supabase.com/docs
- Check Vercel documentation: https://vercel.com/docs
- Review application logs in respective dashboards
