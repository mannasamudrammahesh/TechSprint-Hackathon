# Healix - AI-Powered Mental Health Platform

Healix is a comprehensive mental health support platform that combines **Google Gemini AI counseling**, interactive therapy games, music therapy, and mental health resources to provide personalized, empathetic support for users 24/7.

## ✨ Features

- **🤖 AI Counseling** - Chat with an empathetic AI counselor powered by **Google Gemini 2.5 Flash**
- **🎮 Interactive Therapy Games** - Gamified mental health challenges with **MediaPipe AI** exercise detection
- **🐻 Animated Therapy Companion** - Interactive bear character with **Rive animations** for engaging feedback
- **🎵 Music Therapy** - Curated stress-relief music with voice controls
- **📚 Mental Health Guides** - Comprehensive resources for various mental health concerns
- **🗣️ Voice Assistant** - Hands-free navigation and interaction
- **📊 Activity Tracking** - Monitor your mental health journey with detailed analytics
- **🚨 Crisis Intervention** - Automatic crisis detection with immediate resource provision
- **🔐 Secure Authentication** - Powered by Supabase with privacy-first design

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Supabase account
- **Google Gemini API key** (Essential for AI counseling)
- Modern web browser with camera access (for therapy games)

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
- **Supabase URL and anon key** - For database and authentication
- **Google Gemini API key** - For AI counseling (Required)
- **Other API keys** - As needed for additional features

**Important:** The Gemini API key is essential for the AI counseling feature to work.

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
- **AI & ML:** 
  - **Google Gemini 2.5 Flash** - Primary AI counselor (100% response coverage)
  - **MediaPipe** - Real-time exercise detection and pose estimation
  - **Google Generative AI SDK** - Seamless API integration
- **Animations:** Rive (Interactive bear character)
- **Voice:** Web Speech API
- **Computer Vision:** MediaPipe for therapy exercise tracking

## 📁 Project Structure

```
Healix-main/
├── app/                    # Next.js app directory
│   ├── Home/              # Home page
│   ├── Chat/              # AI counseling (Gemini-powered)
│   ├── Therapy/           # Interactive therapy games
│   ├── music/             # Music therapy
│   ├── Guide-Eval/        # Mental health guides
│   ├── mindful-visualizer/ # Breathing exercises and meditation
│   ├── settings/          # User settings
│   └── api/               # API routes
├── components/            # React components
│   ├── BossBattleGame.tsx # Main therapy game component
│   └── ...                # Other UI components
├── contexts/              # React contexts
├── hooks/                 # Custom hooks
├── lib/                   # Utility functions
├── public/                # Static assets
│   └── rive/              # Bear animation files
├── backend/               # Python FastAPI backend
│   ├── main.py            # Main API server
│   ├── gemini_integration.py # Gemini API integration
│   └── ...                # Other backend files
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

### 🤖 AI Counseling (Powered by Google Gemini)
- **100% Gemini API Integration** - All counseling responses powered by Google's advanced AI
- **Empathetic Conversations** - Context-aware, therapeutic responses with 85-90% empathic accuracy
- **Crisis Detection** - Automatic identification of crisis situations with immediate intervention
- **Multi-language Support** - Counseling available in multiple languages
- **Session Management** - Enhanced conversation history and context retention
- **Real-time Emotion Analysis** - AI-powered emotion detection and response adaptation

### 🎮 Interactive Therapy Games
- **Boss Battle Format** - Gamified challenges against "Anxiety Shadow", "Depression Cloud", "Stress Demon"
- **MediaPipe AI Integration** - Real-time exercise detection using Google's computer vision
- **Breathing Detection** - AI-powered monitoring of breathing exercises and meditation
- **Movement Tracking** - Pose estimation for physical therapy exercises
- **Performance Scoring** - Real-time feedback with accuracy, reps, and performance metrics
- **Animated Feedback** - Interactive bear character providing encouragement and guidance

### 🎵 Music Therapy
- Curated stress-relief tracks
- Voice-controlled playback
- Category filtering
- Therapeutic benefits information

### 📚 Mental Health Guides
- 16+ mental health concerns covered
- Evidence-based information
- Self-assessment tools
- Coping strategies

### 🚨 Crisis Intervention System
- **Automatic Detection** - AI identifies crisis keywords and emotional patterns
- **Immediate Resources** - Instant access to crisis hotlines and emergency contacts
- **Safety Protocols** - Guided intervention with professional resource recommendations

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

- **Google Gemini** for advanced AI counseling capabilities
- **Google MediaPipe** for real-time exercise detection
- **Google AI Studio** for prompt engineering and optimization
- **Supabase** for backend infrastructure and authentication
- **Rive** for interactive animations and bear character
- **All open-source contributors** who made this project possible

## 🏆 Awards & Recognition

- **GDG on Campus TechSprint 2024** - Innovative use of Google AI technologies
- **Mental Health Innovation** - Combining AI counseling with gamified therapy

