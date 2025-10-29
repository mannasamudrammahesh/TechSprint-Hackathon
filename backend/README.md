# 💙 Healix Backend - AI Mental Health API

Python FastAPI backend powering Healix's AI mental health counseling with Google Gemini and Llama Scout AI.

---

## 🚀 Quick Start

### Prerequisites

- Python 3.8 or higher
- pip package manager
- Google Gemini API key

### Installation

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your API keys:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   HOST=0.0.0.0
   PORT=3003
   ```

4. **Start the server**
   ```bash
   python main.py
   ```

5. **Verify it's running**
   ```
   http://localhost:3003/health
   ```

---

## 🏗️ Architecture

### AI System

**Primary AI: Google Gemini 2.0 Flash**
- Fast responses (2-3 seconds)
- Advanced natural language understanding
- Crisis detection and intervention
- Multilingual support

**Fallback AI: Llama Scout**
- Backup when Gemini is unavailable
- Emotion detection
- Sentiment analysis
- Context-aware responses

### Response Flow

```
User Message
    ↓
Emotion Detection
    ↓
Try Gemini AI (Primary)
    ↓
Success? → Return Response (2-3s)
    ↓
Failed? → Try Llama Scout (Fallback)
    ↓
Success? → Return Response (5-8s)
    ↓
Failed? → Intelligent Fallback Response
```

---

## 📋 API Endpoints

### Health Check
```bash
GET /health

Response:
{
  "status": "healthy",
  "gemini_available": true,
  "llama_available": true
}
```

### Chat (Main Endpoint)
```bash
POST /chat
Content-Type: application/json

{
  "text": "I'm feeling anxious",
  "session_id": "session-123",
  "language": "en",
  "conversation_history": []
}

Response:
{
  "reply": "I hear you; anxiety can be really tough...",
  "language": "en",
  "model_used": "gemini",
  "timestamp": "2025-01-29T10:30:00Z"
}
```

### Speech-to-Text
```bash
POST /stt
Content-Type: multipart/form-data

Form Data:
- audio_file: Audio file (WAV, MP3, etc.)
- session_id: Session identifier

Response:
{
  "text": "Transcribed text",
  "language": "en"
}
```

### Text-to-Speech
```bash
POST /tts
Content-Type: application/json

{
  "text": "Hello, how are you?",
  "language": "en",
  "session_id": "session-123"
}

Response: Audio file (WAV)
```

### Translation
```bash
POST /translate
Content-Type: application/json

{
  "text": "Hello world",
  "source_lang": "en",
  "target_lang": "hi"
}

Response:
{
  "translated_text": "नमस्ते दुनिया",
  "source_lang": "en",
  "target_lang": "hi"
}
```

### Emotion Detection
```bash
POST /emotion-detect
Content-Type: application/json

{
  "text": "I'm feeling really sad today"
}

Response:
{
  "emotion": "sad",
  "confidence": 0.92,
  "all_emotions": {
    "sad": 0.92,
    "neutral": 0.05,
    "happy": 0.03
  }
}
```

---

## 🌐 Supported Languages

- **English** (en)
- **Hindi** (hi)
- **Telugu** (te)
- **Tamil** (ta)
- **Kannada** (kn)
- **Gujarati** (gu)
- **Malayalam** (ml)
- **Marathi** (mr)
- **Bengali** (bn)
- **Punjabi** (pa)

---

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `GEMINI_API_KEY` | Google Gemini API key | - | Yes |
| `HOST` | Server host | 0.0.0.0 | No |
| `PORT` | Server port | 3003 | No |
| `DEBUG` | Debug mode | False | No |
| `DEFAULT_LANGUAGE` | Default language | en | No |
| `MAX_RESPONSE_LENGTH` | Max response chars | 500 | No |

### Gemini Configuration

The Gemini AI is optimized for fast, friendly responses:

```python
generation_config = {
    "temperature": 0.8,        # Natural conversation
    "top_p": 0.92,            # Balanced responses
    "top_k": 35,              # Token variety
    "max_output_tokens": 300, # Fast generation
}
```

---

## 📊 Performance

### Response Times

| Service | Development | Production |
|---------|-------------|------------|
| Gemini AI | 2-4 seconds | 2-3 seconds |
| Llama Scout | 5-8 seconds | 4-6 seconds |
| Speech-to-Text | 2-5 seconds | 2-4 seconds |
| Text-to-Speech | 2-4 seconds | 2-3 seconds |
| Translation | 1-2 seconds | 1 second |

### Resource Usage

- **Memory**: ~2-4 GB (with models loaded)
- **CPU**: Moderate (GPU optional)
- **Disk**: ~5 GB (for models)

---

## 🐛 Troubleshooting

### Common Issues

**1. Gemini API Error**
```bash
# Check your API key
echo $GEMINI_API_KEY

# Verify it's set in .env
cat .env | grep GEMINI_API_KEY
```

**2. Port Already in Use**
```bash
# Change port in .env
PORT=3004

# Or kill existing process
lsof -ti:3003 | xargs kill -9
```

**3. Model Loading Errors**
```bash
# Clear cache and reinstall
pip cache purge
pip install -r requirements.txt --force-reinstall
```

**4. Memory Issues**
```bash
# Reduce model size or use CPU only
export CUDA_VISIBLE_DEVICES=""
```

---

## 🚀 Deployment

### Production Server (Gunicorn)

```bash
# Install gunicorn
pip install gunicorn

# Run with multiple workers
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:3003
```

### Docker

```bash
# Build image
docker build -t healix-backend .

# Run container
docker run -p 3003:3003 --env-file .env healix-backend
```

### Railway/Render

1. Push code to GitHub
2. Connect your repository
3. Set environment variables
4. Deploy!

---

## 📈 Monitoring

### Health Check

```bash
curl http://localhost:3003/health
```

### API Documentation

Interactive docs available at:
- Swagger UI: `http://localhost:3003/docs`
- ReDoc: `http://localhost:3003/redoc`

### Logs

The server logs all requests and responses:
```
✅ GEMINI RESPONSE GENERATED SUCCESSFULLY
   Response Time: 2.18 seconds
   Model: Gemini 2.5 Flash
   Length: 242 chars
```

---

## 🔒 Security

- API keys stored in environment variables
- CORS enabled for frontend communication
- Input validation on all endpoints
- Rate limiting (recommended for production)
- Session management for user privacy

---

## 🧪 Testing

```bash
# Test Gemini integration
python -c "from gemini_integration import gemini_ai; print(gemini_ai.is_available())"

# Test full server
curl -X POST http://localhost:3003/chat \
  -H "Content-Type: application/json" \
  -d '{"text":"Hello","session_id":"test","language":"en"}'
```

---

## 📦 Dependencies

### Core
- **FastAPI** - Web framework
- **Uvicorn** - ASGI server
- **google-generativeai** - Gemini AI
- **openai** - Llama Scout integration

### AI/ML
- **transformers** - NLP models
- **torch** - PyTorch
- **whisper** - Speech-to-text
- **TTS** - Text-to-speech

### Utilities
- **python-dotenv** - Environment variables
- **httpx** - HTTP client
- **pydantic** - Data validation

See [requirements.txt](requirements.txt) for complete list.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

## 📄 License

MIT License - see [LICENSE](../LICENSE) file for details.

---

## 🙏 Acknowledgments

- Google Gemini AI for powering intelligent responses
- Llama Scout for reliable fallback support
- FastAPI for excellent web framework
- The mental health community for guidance

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/mannasamudrammahesh/AIML-Sprint/issues)
- **Discussions**: [GitHub Discussions](https://github.com/mannasamudrammahesh/AIML-Sprint/discussions)

---

<div align="center">
  <p>Made with 💙 for mental health support</p>
  <p><strong>Healix Backend - Powering compassionate AI counseling</strong></p>
</div>
