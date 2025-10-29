# Healix - AI-Powered Mental Health Platform

Healix is a comprehensive mental health support platform that combines AI counseling, interactive therapy, music therapy, and mental health resources to provide personalized support for users.

## ✨ Features

- **AI Counseling** - Chat with an AI counselor powered by Google Gemini
- **Interactive Therapy** - Gamified therapy exercises with real-time feedback
- **Music Therapy** - Curated stress-relief music with voice controls
- **Mental Health Guides** - Comprehensive resources for various mental health concerns
- **Voice Assistant** - Hands-free navigation and interaction
- **Activity Tracking** - Monitor your mental health journey
- **Secure Authentication** - Powered by Supabase

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- Google Gemini API key

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/mannasamudrammahesh/AIML-Sprint.git
cd Healix-main
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env.local
```

Edit `.env.local` with your credentials:
- Supabase URL and anon key
- Google Gemini API key
- Other API keys as needed

4. **Run the development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📚 Documentation

- **[Deployment Guide](./DEPLOYMENT.md)** - Complete deployment instructions
- **[Activity Tracking](./ACTIVITY_TRACKING.md)** - User activity tracking documentation

## 🛠️ Tech Stack

- **Frontend:** Next.js 14, React, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes, Python (FastAPI)
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **AI:** Google Gemini, DialogGPT
- **Animations:** Rive
- **Voice:** Web Speech API

## 📁 Project Structure

```
Healix-main/
├── app/                    # Next.js app directory
│   ├── Home/              # Home page
│   ├── Chat/              # AI counseling
│   ├── Therapy/           # Interactive therapy
│   ├── music/             # Music therapy
│   ├── Guide-Eval/        # Mental health guides
│   ├── settings/          # User settings
│   └── api/               # API routes
├── components/            # React components
├── contexts/              # React contexts
├── hooks/                 # Custom hooks
├── lib/                   # Utility functions
├── public/                # Static assets
└── styles/                # CSS modules

```

## 🔐 Authentication

Healix uses Supabase Authentication with email/password. Users can:
- Sign up with email and password
- Sign in to access personalized features
- Reset password via email
- Manage profile and settings

## 📊 Activity Tracking

Healix tracks user activities to provide insights and personalized recommendations:
- Page views
- Music interactions
- Therapy sessions
- Mental health resource usage
- Settings changes

All data is stored securely in Supabase and associated with the user's account.

## 🎨 Key Features

### AI Counseling
- Real-time chat with AI counselor
- Context-aware responses
- Emotion detection
- Chat history storage

### Interactive Therapy
- Gamified therapy exercises
- Real-time exercise detection
- Progress tracking
- Reward system

### Music Therapy
- Curated stress-relief tracks
- Voice-controlled playback
- Category filtering
- Therapeutic benefits information

### Mental Health Guides
- 16+ mental health concerns covered
- Evidence-based information
- Self-assessment tools
- Coping strategies

## 🚀 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/mannasamudrammahesh/AIML-Sprint)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

Developed by Team Healix for AIML Sprint

## 📧 Contact

For support or inquiries, please contact: help.healix@gmail.com

## 🙏 Acknowledgments

- Google Gemini for AI capabilities
- Supabase for backend infrastructure
- Rive for animations
- All open-source contributors
