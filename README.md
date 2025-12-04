# 💙 Healix - AI-Powered Mental Health Platform

<div align="center">
  
  ### Your Compassionate AI Companion for Mental Well-being
  
  [![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org/)
  [![Python](https://img.shields.io/badge/Python-3.8+-blue)](https://www.python.org/)
  [![FastAPI](https://img.shields.io/badge/FastAPI-0.104-green)](https://fastapi.tiangolo.com/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
  [![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
  
</div>

---

## 🌟 About

Healix is a comprehensive mental health platform that combines cutting-edge AI technology with compassionate care. Powered by the LLaMA Scout model, Healix provides real-time mental health counseling, personalized support, and evidence-based resources to help you on your mental wellness journey.

### ✨ Key Features

- **🤖 AI Counselor** - Chat with Healix, powered by Gemini AI for fast, empathetic responses (2-3 seconds)
- **💬 Natural Conversations** - Interactive dialogue with follow-up questions and personalized advice
- **🎵 Music Therapy** - Curated playlists for relaxation, focus, and emotional well-being
- **📚 Mental Health Resources** - Comprehensive guides on anxiety, depression, stress, and more
- **🗣️ Voice Navigation** - Hands-free interaction with voice commands
- **🎯 Crisis Detection** - Immediate support and resources for crisis situations
- **🌍 Multilingual** - Support for 10+ languages including English, Hindi, Telugu, Tamil
- **📱 Fully Responsive** - Seamless experience across all devices
- **🔒 Secure & Private** - Your conversations are confidential

---

## 🚀 Quick Start

### Prerequisites

- **Frontend**: Node.js 18+, npm
- **Backend**: Python 3.8+, pip
- **Model Download**: LLaMA Scout Model ([Download here](https://huggingface.co/meta-llama/Llama-4-Scout-17B-16E-Instruct))


### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/mannasamudrammahesh/AIML-Sprint.git
   cd AIML-Sprint
   ```

2. **Set up Backend**
   ```bash
   cd backend
   pip install -r requirements.txt
   cp .env.example .env
    # Edit .env and set MODEL_TYPE=llama_scout (no API key needed)
   python main.py

   ```

3. **Set up Frontend** (in a new terminal)
   ```bash
   cd Healix-main
   npm install
   cp .env.example .env.local
   # Edit .env.local and add your environment variables
   npm run dev
   ```

4. **Open your browser**
   ```
   http://localhost:3000
   ```

---

## 📁 Project Structure

```
AIML-Sprint/
├── backend/                 # Python FastAPI backend
│   ├── main.py             # Main server file
│   ├── gemini_integration.py  # Fallback AI
│   ├── llama_scout_integration.py  # Primary AI
│   ├── requirements.txt    # Python dependencies
│   └── README.md           # Backend documentation
│
├── Healix-main/            # Next.js frontend
│   ├── app/                # Next.js 14 app directory
│   ├── components/         # React components
│   ├── lib/                # Utility functions
│   ├── public/             # Static assets
│   ├── package.json        # Node dependencies
│   └── README.md           # Frontend documentation
│
└── README.md               # This file
```

---

## 🎨 Features in Detail

### 💬 AI Counselor

- **Llama Scout**: Fast, intelligent responses in 2-3 seconds
- **Empathetic**: Validates feelings and provides emotional support
- **Interactive**: Asks follow-up questions to understand you better
- **Crisis-Aware**: Detects crisis situations and provides immediate resources
- **Personalized**: Adapts to your emotional state and needs

### 🎵 Music Therapy

- Curated playlists for different moods
- Categories: Relaxation, Focus, Sleep, Motivation
- Voice-controlled player
- Seamless integration with chat

### 📚 Mental Health Resources

Comprehensive guides on:
- Anxiety & Panic Attacks
- Depression & Sadness
- Stress Management
- Sleep Issues
- Self-Confidence
- Anger Management
- Loneliness
- And more...

### 🎯 Additional Features

- **Voice Navigation**: Control the app hands-free
- **Progress Tracking**: Monitor your mental health journey
- **Dark/Light Mode**: Comfortable viewing anytime
- **Animated Mascot**: Friendly bear provides visual feedback

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI**: Shadcn/ui
- **Animations**: Rive, Framer Motion
- **Auth**: Clerk

### Backend
- **Framework**: FastAPI
- **Language**: Python 3.8+
- **Primary AI**: Llama Scout
- **Fallback AI**:  Google Gemini 2.0 Flash
- **Speech**: Whisper (STT), TTS
- **Database**: Supabase (optional)

---

## 📊 Performance

| Metric | Development | Production |
|--------|-------------|------------|
| AI Response Time | 3-7 seconds | 2-3.5 seconds |
| Page Load | 1-2 seconds | 0.5-1 second |
| Chat Interface | Real-time | Real-time |
| Voice Recognition | 2-5 seconds | 2-4 seconds |

---

## 🌐 Deployment

### Frontend (Vercel)

```bash
cd Healix-main
vercel --prod
```

### Backend (Railway/Render)

1. Push code to GitHub
2. Connect your repository
3. Set environment variables
4. Deploy!

See detailed deployment guides in:
- [Frontend README](Healix-main/README.md)
- [Backend README](backend/README.md)

---

## 🔧 Configuration

### Backend Environment Variables

```env

HOST=0.0.0.0
PORT=3003
DEBUG=False
```

### Frontend Environment Variables

```env
BACKEND_URL=http://localhost:3003
NEXT_PUBLIC_BACKEND_URL=http://localhost:3003
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_clerk_secret
```

---

## 🧪 Testing

### Backend
```bash
cd backend
python main.py
```

### Frontend
```bash
cd Healix-main
npm run build
npm start
```

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript/Python best practices
- Write meaningful commit messages
- Test your changes thoroughly
- Update documentation as needed

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Authors

- **Muni Mahesh** - [@mannasamudrammahesh](https://github.com/mannasamudrammahesh)

---

## 🙏 Acknowledgments

- Llama Scout for powering intelligent responses
- Rive for beautiful animations
- Shadcn/ui for elegant UI components
- FastAPI for excellent backend framework
- The mental health community for inspiration

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/mannasamudrammahesh/AIML-Sprint/issues)
- **Discussions**: [GitHub Discussions](https://github.com/mannasamudrammahesh/AIML-Sprint/discussions)
- **Documentation**: See README files in `backend/` and `Healix-main/`

---

## 🌟 Star Us!

If you find Healix helpful, please consider giving us a star ⭐ on GitHub!

---

<div align="center">
  <p>Made with 💙 for mental health awareness</p>
  <p><strong>Healix - Your AI companion for mental well-being</strong></p>
  
  ### [Report Bug](https://github.com/mannasamudrammahesh/AIML-Sprint/issues) | [Request Feature](https://github.com/mannasamudrammahesh/AIML-Sprint/issues)
</div>
