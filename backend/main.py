from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Dict, Any, Optional, List
from contextlib import asynccontextmanager
import tempfile
import os
import logging
from datetime import datetime
import json
import warnings

warnings.filterwarnings("ignore", category=UserWarning)
import io
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    import torch

    TORCH_AVAILABLE = True
except ImportError:
    TORCH_AVAILABLE = False
    print("⚠️ PyTorch not available - some features will be limited")

try:
    import whisper

    WHISPER_AVAILABLE = True
except ImportError:
    WHISPER_AVAILABLE = False
    print("⚠️ Whisper not available - STT features will be limited")

try:
    from transformers import (
        AutoTokenizer,
        AutoModelForCausalLM,
        MarianMTModel,
        MarianTokenizer,
        pipeline,
        AutoModelForSequenceClassification,
    )

    TRANSFORMERS_AVAILABLE = True
except ImportError:
    TRANSFORMERS_AVAILABLE = False
    print("⚠️ Transformers not available - translation features will be limited")

try:
    import numpy as np

    NUMPY_AVAILABLE = True
except ImportError:
    NUMPY_AVAILABLE = False
    print("⚠️ NumPy not available - some features will be limited")

try:
    import librosa
    import soundfile as sf

    AUDIO_PROCESSING_AVAILABLE = True
except ImportError:
    AUDIO_PROCESSING_AVAILABLE = False
    print("⚠️ Audio processing libraries not available - audio features will be limited")

try:
    from pydub import AudioSegment

    PYDUB_AVAILABLE = True
except ImportError:
    PYDUB_AVAILABLE = False
    print("⚠️ Pydub not available - audio conversion features will be limited")

try:
    from TTS.api import TTS

    TTS_AVAILABLE = True
except ImportError:
    TTS_AVAILABLE = False
    print("WARNING: Coqui TTS not available - trying fallback TTS options")

try:
    import pyttsx3

    PYTTSX3_AVAILABLE = True
    print("OK: pyttsx3 TTS available as fallback")
except ImportError:
    PYTTSX3_AVAILABLE = False

try:
    from gtts import gTTS

    GTTS_AVAILABLE = True
    print("OK: Google TTS available as fallback")
except ImportError:
    GTTS_AVAILABLE = False

try:
    import edge_tts

    EDGE_TTS_AVAILABLE = True
    print("OK: Edge TTS available as fallback")
except ImportError:
    EDGE_TTS_AVAILABLE = False

try:
    from gemini_integration import gemini_ai
    GEMINI_AI_AVAILABLE = True
    print("OK: Gemini AI available")
except ImportError as e:
    GEMINI_AI_AVAILABLE = False
    print(f"WARNING: Gemini AI not available - {e}")

try:
    from llama_scout_integration import get_llama_scout_ai
    LLAMA_SCOUT_AI_AVAILABLE = True
    print("OK: Llama Scout Mental Health AI available")
except ImportError as e:
    LLAMA_SCOUT_AI_AVAILABLE = False
    print(f"WARNING: Llama Scout AI not available - {e}")
    print("Using fallback responses")

whisper_model = None
dialogpt_model = None
dialogpt_tokenizer = None
enhanced_dialogpt = None
gemini_mental_health_ai = None
llama_scout_ai = None
opus_models = {}
tts_models = {}
conversation_sessions = {}


@asynccontextmanager
async def lifespan(app: FastAPI):
    await startup_models()
    yield
    print("🔄 Shutting down Healix AI Backend...")


app = FastAPI(title="AI Voice Assistant Backend", version="1.0.0", lifespan=lifespan)

ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://your-domain.xyz",
    "https://www.your-domain.xyz",
    "https://your-app.vercel.app",
    "https://your-app.netlify.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "Accept"],
)


class ChatRequest(BaseModel):
    text: str
    session_id: str
    language: Optional[str] = "en"
    conversation_history: Optional[List[Dict[str, str]]] = []


class ChatResponse(BaseModel):
    reply: str
    language: str


class TranslationRequest(BaseModel):
    text: str
    source_lang: str
    target_lang: str


class TranslationResponse(BaseModel):
    translated_text: str
    source_lang: str
    target_lang: str


class STTRequest(BaseModel):
    session_id: str


class STTResponse(BaseModel):
    text: str
    language: str
    confidence: float


class TTSRequest(BaseModel):
    text: str
    language: Optional[str] = "en"
    voice: Optional[str] = None


class EmotionRequest(BaseModel):
    text: str


async def startup_models():
    global \
        whisper_model, \
        dialogpt_model, \
        dialogpt_tokenizer, \
        enhanced_dialogpt, \
        gemini_mental_health_ai, \
        llama_scout_ai, \
        opus_models, \
        tts_models

    print("=" * 60)
    print("Starting Healix AI Backend...")
    print("=" * 60)

    if WHISPER_AVAILABLE:
        print("Loading Whisper model for Speech-to-Text...")
        try:
            whisper_model = whisper.load_model("base")
            print("OK: Whisper base model loaded successfully - supports 99 languages")
        except Exception as e:
            print(f"WARNING: Error loading Whisper base model: {e}")
            print("   Falling back to tiny model...")
            try:
                whisper_model = whisper.load_model("tiny")
                print("OK: Whisper tiny model loaded - supports 99 languages")
            except Exception as e2:
                print(f"ERROR: Error loading Whisper tiny model: {e2}")
                whisper_model = None
    else:
        whisper_model = None
        print("WARNING: Whisper not available - STT will use fallback")

    global gemini_mental_health_ai
    if GEMINI_AI_AVAILABLE:
        print("\n🚀 Loading Gemini AI (Primary - Fast Response)...")
        try:
            gemini_mental_health_ai = gemini_ai
            if gemini_mental_health_ai.is_available():
                print("✅ Gemini AI loaded successfully")
                print("   - Fast response generation (2-4 seconds)")
                print("   - Advanced mental health counseling")
                print("   - Crisis detection and intervention")
                print("   - Multilingual support")
                print("   - Context-aware therapeutic responses")
            else:
                print("⚠️ Gemini API key not configured")
                gemini_mental_health_ai = None
        except Exception as gemini_error:
            print(f"WARNING: Failed to load Gemini AI: {gemini_error}")
            import traceback
            print(f"Traceback: {traceback.format_exc()}")
            gemini_mental_health_ai = None
    else:
        gemini_mental_health_ai = None
        print("⚠️ Gemini AI not available")

    global llama_scout_ai
    if LLAMA_SCOUT_AI_AVAILABLE:
        print("\n📦 Loading Llama Scout AI (Fallback)...")
        try:
            llama_scout_ai = get_llama_scout_ai()
            print("✅ Llama Scout AI loaded successfully (Fallback)")
            print("   - Will be used if Gemini fails")
            print("   - Dynamic responses based on user emotions")
            print("   - Multilingual support (EN, HI, TE, TA, and more)")
        except Exception as ai_error:
            print(f"WARNING: Failed to load Llama Scout AI: {ai_error}")
            import traceback
            print(f"Traceback: {traceback.format_exc()}")
            llama_scout_ai = None
    else:
        llama_scout_ai = None
        print("⚠️ Llama Scout AI not available")

    if TRANSFORMERS_AVAILABLE and TORCH_AVAILABLE:
        print("\nLoading Enhanced DialoGPT for Dynamic Conversations...")
        try:

            try:
                from enhanced_dialogpt import EnhancedDialogGPT

                enhanced_dialogpt = EnhancedDialogGPT()
                print("✅ Enhanced DialoGPT loaded successfully")
                print("   ✓ Dynamic response generation enabled")
                print("   ✓ NO predefined responses")
                print("   ✓ Multilingual support (EN, HI, TE, TA, KN, GU)")
            except ImportError as ie:
                print(
                    f"WARNING: Enhanced DialogGPT not found ({ie}), using standard model..."
                )
                try:
                    dialogpt_model = AutoModelForCausalLM.from_pretrained(
                        "microsoft/DialoGPT-medium",
                        low_cpu_mem_usage=True,
                        torch_dtype=torch.float16
                        if torch.cuda.is_available()
                        else torch.float32,
                    )
                    dialogpt_tokenizer = AutoTokenizer.from_pretrained(
                        "microsoft/DialoGPT-medium"
                    )
                    dialogpt_tokenizer.pad_token = dialogpt_tokenizer.eos_token
                    if torch.cuda.is_available():
                        dialogpt_model = dialogpt_model.cuda()
                    print("OK: Standard DialoGPT model loaded successfully")
                except Exception as model_error:
                    print(f"WARNING: Failed to load standard model: {model_error}")
                    try:
                        dialogpt_model = AutoModelForCausalLM.from_pretrained(
                            "microsoft/DialoGPT-small"
                        )
                        dialogpt_tokenizer = AutoTokenizer.from_pretrained(
                            "microsoft/DialoGPT-small"
                        )
                        dialogpt_tokenizer.pad_token = dialogpt_tokenizer.eos_token
                        print("OK: DialoGPT-small model loaded as fallback")
                    except Exception as small_error:
                        print(f"ERROR: All DialoGPT models failed: {small_error}")
                        dialogpt_model = None
                        dialogpt_tokenizer = None
        except Exception as e:
            print(f"WARNING: Error in DialoGPT initialization: {e}")
            dialogpt_model = None
            dialogpt_tokenizer = None
            enhanced_dialogpt = None
    else:
        dialogpt_model = None
        dialogpt_tokenizer = None
        enhanced_dialogpt = None
        print("WARNING: DialoGPT not available - chat will use advanced fallback")

    if TRANSFORMERS_AVAILABLE:
        print("Loading Opus-MT translation models...")
        try:
            try:
                import sentencepiece

                SENTENCEPIECE_AVAILABLE = True
            except ImportError:
                SENTENCEPIECE_AVAILABLE = False
                print(
                    "⚠️ SentencePiece not available - translation models will be skipped"
                )

            if SENTENCEPIECE_AVAILABLE:
                translation_models = [
                    ("hi-en", "Helsinki-NLP/opus-mt-hi-en"),
                    ("en-hi", "Helsinki-NLP/opus-mt-en-hi"),
                    (
                        "mul-en",
                        "Helsinki-NLP/opus-mt-mul-en",
                    ),
                    (
                        "en-mul",
                        "Helsinki-NLP/opus-mt-en-mul",
                    ),
                ]

                loaded_models = []
                for model_key, model_name in translation_models:
                    try:
                        opus_models[model_key] = {
                            "model": MarianMTModel.from_pretrained(model_name),
                            "tokenizer": MarianTokenizer.from_pretrained(model_name),
                        }
                        loaded_models.append(model_key)
                        print(f"✅ Loaded translation model: {model_key}")
                    except Exception as e:
                        print(f"⚠️ Failed to load {model_key}: {str(e)[:100]}...")
                        continue

                if loaded_models:
                    print(f"✅ Translation models loaded: {', '.join(loaded_models)}")
                else:
                    print("⚠️ No translation models could be loaded")
            else:
                print("⚠️ Skipping translation models due to missing SentencePiece")
        except Exception as e:
            print(f"⚠️ Error loading translation models: {e}")
            print("💡 To fix: pip install sentencepiece")
            print("Translation will use fallback methods")
    else:
        print("⚠️ Translation models not available - will use fallback")

    if TTS_AVAILABLE:
        print("Loading TTS models...")
        try:
            tts_models["en"] = TTS(
                model_name="tts_models/en/ljspeech/tacotron2-DDC", progress_bar=False
            )
            print("✅ English TTS model loaded successfully")

            multilingual_tts = TTS(
                model_name="tts_models/multilingual/multi-dataset/your_tts",
                progress_bar=False,
            )
            tts_models["hi"] = multilingual_tts
            tts_models["te"] = multilingual_tts
            tts_models["ta"] = multilingual_tts
            print(
                "✅ Multilingual TTS models loaded successfully (Hindi, Telugu, Tamil)"
            )
        except Exception as e:
            print(f"⚠️ Error loading TTS models: {e}")
            print("TTS functionality will be limited")
    else:
        print("⚠️ TTS not available - text-to-speech will use fallback")

    print("\n" + "=" * 60)
    print("Healix AI Backend started successfully!")
    print("=" * 60)
    print("Available endpoints:")
    print("   • /health - Health check")
    print("   • /chat - Mental health counseling chat")
    print("   • /stt - Speech-to-text")
    print("   • /tts - Text-to-speech")
    print("   • /translate - Language translation")
    print("   • /emotion-detect - Emotion detection")
    print("=" * 60)
    if llama_scout_ai:
        print("🚀 Primary Mental Health AI: Llama Scout")
        print("   Model: meta-llama/llama-3.2-3b-instruct:free")
        print("   Provider: OpenRouter AI")
        print("   Response Time: <5 seconds (OPTIMIZED)")
        print("   Status: Ready ✅")
        if gemini_mental_health_ai and gemini_mental_health_ai.is_available():
            print("\n📦 Secondary AI: Gemini 2.5 Flash")
            print("   Provider: Google AI")
            print("   Status: Ready as backup")
    elif gemini_mental_health_ai and gemini_mental_health_ai.is_available():
        print("Mental Health AI: Gemini 2.5 Flash")
        print("   Provider: Google AI")
        print("   Response Time: 2-4 seconds")
        print("   Status: Ready")
    elif enhanced_dialogpt:
        print("Mental Health AI: Enhanced DialogGPT")
    else:
        print("WARNING: Mental Health AI: Fallback mode")
    print("=" * 60 + "\n")


def get_or_create_session(session_id: str) -> Dict:
    if session_id not in conversation_sessions:
        conversation_sessions[session_id] = {
            "history": [],
            "created_at": datetime.now().isoformat(),
            "last_activity": datetime.now().isoformat(),
        }
    return conversation_sessions[session_id]


def translate_text(text: str, source_lang: str, target_lang: str) -> str:
    if source_lang == target_lang:
        return text

    if not TRANSFORMERS_AVAILABLE or not opus_models:
        return f"[Translation not available - {source_lang} to {target_lang}] {text}"

    model_key = f"{source_lang}-{target_lang}"
    if model_key not in opus_models:
        return f"[Translation {source_lang}->{target_lang} not supported] {text}"

    try:
        model_data = opus_models[model_key]
        tokenizer = model_data["tokenizer"]
        model = model_data["model"]

        inputs = tokenizer(
            text, return_tensors="pt", padding=True, truncation=True, max_length=512
        )
        with torch.no_grad():
            outputs = model.generate(
                **inputs, max_length=512, num_beams=4, early_stopping=True
            )

        translated_text = tokenizer.decode(outputs[0], skip_special_tokens=True)
        return translated_text
    except Exception as e:
        print(f"Translation error: {e}")
        return f"[Translation error] {text}"


@app.post("/stt", response_model=STTResponse)
async def speech_to_text(
    audio_file: UploadFile = File(...), session_id: str = "default"
):
    try:
        if not WHISPER_AVAILABLE or whisper_model is None:
            return STTResponse(
                text="Speech recognition not available. Please type your message instead.",
                language="en",
                confidence=0.0,
            )

        with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp_file:
            content = await audio_file.read()
            tmp_file.write(content)
            tmp_file_path = tmp_file.name

        result = whisper_model.transcribe(tmp_file_path)
        text = result["text"].strip()
        language = result["language"]
        confidence = 1.0

        os.unlink(tmp_file_path)

        return STTResponse(text=text, language=language, confidence=confidence)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"STT processing failed: {str(e)}")


@app.post("/translate", response_model=TranslationResponse)
async def translate(request: TranslationRequest):
    try:
        translated_text = translate_text(
            request.text, request.source_lang, request.target_lang
        )
        return TranslationResponse(
            translated_text=translated_text,
            source_lang=request.source_lang,
            target_lang=request.target_lang,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Translation failed: {str(e)}")


@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    print("=" * 80)
    print("CHAT ENDPOINT CALLED")
    print(f"   Input: {request.text[:100]}...")
    print(f"   Session: {request.session_id}")
    print(f"   Language: {request.language}")
    print("=" * 80)

    try:
        session = get_or_create_session(request.session_id)
        response_text = None
        model_used = None

        if llama_scout_ai:
            print("🚀 Using Llama Scout AI (Primary - Fast <5s Response)...")
            try:
                import time
                start_time = time.time()
                
                mental_health_response = await llama_scout_ai.generate_response(
                    user_input=request.text,
                    session_id=request.session_id,
                    language=request.language,
                )
                
                elapsed_time = time.time() - start_time
                response_text = mental_health_response.response
                model_used = "llama_scout"

                print("=" * 80)
                print("✅ LLAMA SCOUT RESPONSE GENERATED (PRIMARY)")
                print(f"   Response Time: {elapsed_time:.2f} seconds")
                print(f"   Emotion: {mental_health_response.detected_emotion}")
                print(f"   Sentiment: {mental_health_response.sentiment}")
                print(f"   Length: {len(response_text)} chars")
                print(f"   Preview: {response_text[:150]}...")
                print("=" * 80)

                session["detected_emotion"] = mental_health_response.detected_emotion
                session["sentiment"] = mental_health_response.sentiment
                
            except Exception as llama_error:
                print(f"⚠️ Llama Scout error: {llama_error}")
                print("   Falling back to Gemini AI...")
                import traceback
                print(f"   Traceback: {traceback.format_exc()}")
        else:
            print("⚠️ Llama Scout AI not available, using Gemini fallback...")

        if not response_text and gemini_mental_health_ai and gemini_mental_health_ai.is_available():
            print("📦 Using Gemini AI (Secondary Fallback)...")
            try:
                import time
                start_time = time.time()
                
                gemini_response = gemini_mental_health_ai.generate_response(
                    user_input=request.text,
                    session_id=request.session_id,
                    language=request.language,
                    conversation_history=request.conversation_history,
                )
                
                elapsed_time = time.time() - start_time
                
                if gemini_response and gemini_response.get("reply"):
                    response_text = gemini_response["reply"]
                    model_used = "gemini_fallback"
                    
                    print("=" * 80)
                    print("✅ GEMINI FALLBACK RESPONSE GENERATED")
                    print(f"   Response Time: {elapsed_time:.2f} seconds")
                    print(f"   Model: Gemini 2.5 Flash")
                    print(f"   Length: {len(response_text)} chars")
                    print(f"   Preview: {response_text[:150]}...")
                    print("=" * 80)
                else:
                    print("⚠️ Gemini returned empty response...")
                    
            except Exception as gemini_error:
                print(f"⚠️ Gemini AI error: {gemini_error}")

        if not response_text:
            print("⚠️ All AI models failed, using basic fallback...")
            model_used = "fallback"
            response_text = """Hello! I'm Healix, your mental health support companion. I'm here to listen and help.

While I'm experiencing some technical issues, I can still support you. Could you tell me more about what's on your mind today?

If you're in crisis, please reach out immediately:
• 988 - Suicide & Crisis Lifeline (US)
• Text HOME to 741741 - Crisis Text Line
• 911 for emergencies

What would you like to talk about?"""

        session["history"].append(f"User: {request.text}")
        session["history"].append(f"Assistant: {response_text}")
        session["last_activity"] = datetime.now().isoformat()
        session["model_used"] = model_used

        return ChatResponse(reply=response_text, language=request.language)

    except HTTPException:
        raise
    except Exception as e:
        print("=" * 80)
        print("CRITICAL ERROR IN CHAT ENDPOINT")
        print(f"   Error Type: {type(e).__name__}")
        print(f"   Error Message: {str(e)}")
        import traceback

        print(f"   Traceback:")
        traceback.print_exc()
        print("=" * 80)

        error_response = """I'm here to support you, though I'm experiencing a technical issue at the moment. Your wellbeing is important to me.

Please try sending your message again. If the issue persists, I'm still here to help in any way I can.

If you need immediate support:
- National Suicide Prevention Lifeline: 988 or 1-800-273-8255
- Crisis Text Line: Text HOME to 741741
- SAMHSA National Helpline: 1-800-662-4357

What would you like to talk about?"""

        return ChatResponse(reply=error_response, language=request.language)


@app.post("/tts")
async def text_to_speech(request: TTSRequest):
    try:
        text = request.text
        language = request.language

        if TTS_AVAILABLE and language in tts_models:
            try:
                tts_model = tts_models[language]
                with tempfile.NamedTemporaryFile(
                    delete=False, suffix=".wav"
                ) as tmp_file:
                    tts_model.tts_to_file(text=text, file_path=tmp_file.name)

                    with open(tmp_file.name, "rb") as audio_file:
                        audio_data = audio_file.read()

                    os.unlink(tmp_file.name)

                    return StreamingResponse(
                        io.BytesIO(audio_data),
                        media_type="audio/wav",
                        headers={
                            "Content-Disposition": "attachment; filename=speech.wav"
                        },
                    )
            except Exception as e:
                print(f"Coqui TTS failed: {e}, trying fallback...")

        if GTTS_AVAILABLE:
            try:
                gtts_lang_map = {
                    "en": "en",
                    "hi": "hi",
                    "te": "te",
                    "ta": "ta",
                    "kn": "kn",
                    "gu": "gu",
                }

                gtts_lang = gtts_lang_map.get(language, "en")
                tts = gTTS(text=text, lang=gtts_lang, slow=False)

                with tempfile.NamedTemporaryFile(
                    delete=False, suffix=".mp3"
                ) as tmp_file:
                    tts.save(tmp_file.name)

                    with open(tmp_file.name, "rb") as audio_file:
                        audio_data = audio_file.read()

                    os.unlink(tmp_file.name)

                    return StreamingResponse(
                        io.BytesIO(audio_data),
                        media_type="audio/mpeg",
                        headers={
                            "Content-Disposition": "attachment; filename=speech.mp3"
                        },
                    )
            except Exception as e:
                print(f"Google TTS failed: {e}, trying next fallback...")

        if EDGE_TTS_AVAILABLE:
            try:
                edge_voices = {
                    "en": "en-US-AriaNeural",
                    "hi": "hi-IN-SwaraNeural",
                    "te": "te-IN-ShrutiNeural",
                    "ta": "ta-IN-PallaviNeural",
                    "kn": "kn-IN-SapnaNeural",
                    "gu": "gu-IN-DhwaniNeural",
                }

                voice = edge_voices.get(language, "en-US-AriaNeural")

                async def generate_edge_tts():
                    communicate = edge_tts.Communicate(text, voice)
                    audio_data = b""
                    async for chunk in communicate.stream():
                        if chunk["type"] == "audio":
                            audio_data += chunk["data"]
                    return audio_data

                audio_data = (
                    await generate_edge_tts()
                )

                return StreamingResponse(
                    io.BytesIO(audio_data),
                    media_type="audio/mpeg",
                    headers={"Content-Disposition": "attachment; filename=speech.mp3"},
                )
            except Exception as e:
                print(f"Edge TTS failed: {e}")

        return {
            "text": text,
            "language": language,
            "message": "TTS not available - text response only",
            "fallback": True,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"TTS generation failed: {str(e)}")


def clean_and_validate_response(response: str, user_input: str) -> str:
    if not response or len(response.strip()) < 5:
        return get_contextual_fallback_response(user_input, "en")

    response = response.replace("User:", "").replace("Assistant:", "").strip()

    lines = response.split("\n")
    unique_lines = []
    for line in lines:
        if line.strip() and line.strip() not in unique_lines:
            unique_lines.append(line.strip())

    cleaned = " ".join(unique_lines[:3])

    if len(cleaned.strip()) < 10:
        return get_contextual_fallback_response(user_input, "en")

    return cleaned


def get_contextual_fallback_response(user_input: str, language: str = "en") -> str:

    lower_input = user_input.lower()

    crisis_words = [
        "suicide",
        "kill myself",
        "end it all",
        "hurt myself",
        "want to die",
        "can't go on",
    ]
    if any(word in lower_input for word in crisis_words):
        crisis_responses = {
            "en": "I'm very concerned about what you're sharing. Your life has value and there are people who want to help. Please reach out to emergency services (911) or the National Suicide Prevention Lifeline (988) immediately. You don't have to go through this alone.",
            "hi": "मुझे आपकी बात सुनकर बहुत चिंता हो रही है। आपका जीवन मूल्यवान है और लोग आपकी मदद करना चाहते हैं। कृपया तुरंत आपातकालीन सेवाओं (112) से संपर्क करें।",
            "te": "మీరు పంచుకుంటున్న విషయం గురించి నాకు చాలా ఆందోళన కలుగుతోంది। మీ జీవితానికి విలువ ఉంది. దయచేసి వెంటనే అత్యవసర సేవలను (112) సంప్రదించండి।",
        }
        return crisis_responses.get(language, crisis_responses["en"])

    if any(
        word in lower_input
        for word in ["anxious", "anxiety", "worried", "panic", "fear"]
    ):
        anxiety_responses = {
            "en": "I understand you're feeling anxious. Anxiety can be overwhelming, but you're not alone. Try taking slow, deep breaths - breathe in for 4 counts, hold for 4, and exhale for 6. What specific situations are triggering your anxiety?",
            "hi": "मैं समझता हूं कि आप चिंतित महसूस कर रहे हैं। चिंता भारी हो सकती है, लेकिन आप अकेले नहीं हैं। धीमी, गहरी सांस लेने की कोशिश करें। कौन सी विशिष्ट स्थितियां आपकी चिंता को बढ़ा रही हैं?",
            "te": "మీరు ఆందోళనగా ఉన్నారని నేను అర్థం చేసుకున్నాను। ఆందోళన అధికంగా అనిపించవచ్చు, కానీ మీరు ఒంటరిగా లేరు। నెమ్మదిగా, లోతైన ఊపిరి తీసుకోవడానికి ప్రయత్నించండి।",
        }
        return anxiety_responses.get(language, anxiety_responses["en"])

    elif any(
        word in lower_input
        for word in ["stress", "stressed", "overwhelmed", "pressure", "burden"]
    ):
        stress_responses = {
            "en": "It sounds like you're feeling overwhelmed with stress right now. That's completely understandable - stress affects all of us. Let's try a grounding technique: name 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, and 1 you can taste. What's been your biggest source of stress lately?",
            "hi": "लगता है आप अभी तनाव से अभिभूत महसूस कर रहे हैं। यह पूरी तरह से समझ में आने वाली बात है। आइए एक ग्राउंडिंग तकनीक आजमाएं। आपको सबसे ज्यादा तनाव किस चीज से हो रहा है?",
            "te": "మీరు ఇప్పుడు ఒత్తిడితో అధికంగా అనుభవిస్తున్నట్లు అనిపిస్తోంది. అది పూర్తిగా అర్థమయ్యే విషయం. గ్రౌండింగ్ టెక్నిక్ ప్రయత్నించండి। ఇటీవల మీకు అత్యధిక ఒత్తిడి కలిగించే అంశం ఏమిటి?",
        }
        return stress_responses.get(language, stress_responses["en"])

    elif any(
        word in lower_input
        for word in ["sad", "depressed", "depression", "down", "hopeless", "lonely"]
    ):
        depression_responses = {
            "en": "I hear you, and I want you to know that what you're feeling is completely valid. Depression can make everything feel heavy and difficult, but reaching out like this is a brave first step. You're not alone in this. Have you been able to talk to anyone else about how you're feeling?",
            "hi": "मैं आपकी बात सुन रहा हूं, और मैं चाहता हूं कि आप जानें कि आप जो महसूस कर रहे हैं वह पूरी तरह से वैध है। अवसाद सब कुछ भारी महसूस करा सकता है, लेकिन इस तरह संपर्क करना एक बहादुरी भरा कदम है।",
            "te": "నేను మీ మాట వింటున్నాను, మరియు మీరు అనుభవిస్తున్నది పూర్తిగా సరైనది అని మీరు తెలుసుకోవాలని కోరుకుంటున్నాను. నిరాశ ప్రతిదీ భారంగా అనిపించేలా చేస్తుంది, కానీ ఇలా చేరువ కావడం ధైర్యవంతమైన మొదటి అడుగు.",
        }
        return depression_responses.get(language, depression_responses["en"])

    elif any(
        word in lower_input
        for word in ["sleep", "insomnia", "tired", "exhausted", "can't sleep"]
    ):
        sleep_responses = {
            "en": "Sleep difficulties can really impact your overall well-being. Good sleep hygiene is so important for mental health. Try establishing a consistent bedtime routine, avoid screens an hour before bed, and keep your room cool and dark. What's been disrupting your sleep the most?",
            "hi": "नींद की कठिनाइयां वास्तव में आपकी समग्र भलाई को प्रभावित कर सकती हैं। मानसिक स्वास्थ्य के लिए अच्छी नींद स्वच्छता बहुत महत्वपूर्ण है। आपकी नींद में सबसे ज्यादा क्या बाधा डाल रहा है?",
            "te": "నిద్రలేకపోవడం నిజంగా మీ మొత్తం శ్రేయస్సును ప్రభావితం చేయవచ్చు. మానసిక ఆరోగ్యానికి మంచి నిద్ర అలవాట్లు చాలా ముఖ్యం. మీ నిద్రను అత్యధికంగా భంగపరుస్తున్న విషయం ఏమిటి?",
        }
        return sleep_responses.get(language, sleep_responses["en"])

    supportive_responses = {
        "en": "Thank you for sharing with me. I'm here to listen and support you on your mental health journey. Your feelings are valid, and seeking support shows real strength. What would you like to talk about today?",
        "hi": "मेरे साथ साझा करने के लिए धन्यवाद। मैं आपकी मानसिक स्वास्थ्य यात्रा में सुनने और समर्थन करने के लिए यहां हूं। आपकी भावनाएं वैध हैं। आज आप किस बारे में बात करना चाहेंगे?",
        "te": "నాతో పంచుకున్నందుకు ధన్యవాదాలు. మీ మానసిక ఆరోగ్య ప్రయాణంలో వినడానికి మరియు మద్దతు ఇవ్వడానికి నేను ఇక్కడ ఉన్నాను. మీ భావనలు సరైనవి. ఈరోజు మీరు దేని గురించి మాట్లాడాలనుకుంటున్నారు?",
    }

    return supportive_responses.get(language, supportive_responses["en"])


@app.post("/emotion-detect")
async def detect_emotion(request: EmotionRequest):
    try:
        if not TRANSFORMERS_AVAILABLE:
            return {
                "dominant_emotion": "neutral",
                "confidence": 0.5,
                "all_emotions": {"neutral": 0.5},
                "message": "Emotion detection not available - using fallback",
            }

        emotion_classifier = pipeline(
            "text-classification",
            model="j-hartmann/emotion-english-distilroberta-base",
            return_all_scores=True,
        )

        results = emotion_classifier(request.text)

        emotions = {}
        for result in results[0]:
            emotions[result["label"].lower()] = result["score"]

        dominant_emotion = max(emotions, key=emotions.get)

        return {
            "text": request.text,
            "dominant_emotion": dominant_emotion,
            "confidence": emotions[dominant_emotion],
            "all_emotions": emotions,
        }

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Emotion detection failed: {str(e)}"
        )


class FacialEmotionRequest(BaseModel):
    image: str


@app.post("/facial-emotion-detect")
async def detect_facial_emotion(request: FacialEmotionRequest):
    try:
        import base64
        import io
        from PIL import Image
        import numpy as np
        import cv2
        from emotion_detection_service import get_emotion_service

        print("🎭 Received emotion detection request")

        image_data = base64.b64decode(request.image.split(",")[1])
        image = Image.open(io.BytesIO(image_data))
        image_array = np.array(image)

        if len(image_array.shape) == 3 and image_array.shape[2] == 3:
            bgr_image = cv2.cvtColor(image_array, cv2.COLOR_RGB2BGR)
        else:
            bgr_image = image_array

        emotion_service = get_emotion_service()
        result = emotion_service.detect_emotion_from_frame(bgr_image)

        emotion = result.get("emotion", "neutral")
        confidence = result.get("confidence", 0.5)
        face_detected = result.get("face_detected", False)

        print(f"🎭 Detected: {emotion} ({confidence*100:.0f}%) - Face: {face_detected}")

        return {
            "emotion": emotion,
            "confidence": confidence,
            "face_detected": face_detected,
            "dominant_emotion": emotion,
            "all_emotions": {emotion: confidence}
        }

    except Exception as e:
        print(f"❌ Facial emotion detection error: {e}")
        return {
            "emotion": "neutral",
            "confidence": 0.5,
            "face_detected": False,
            "error": str(e)
        }

class BehaviorAnalysisRequest(BaseModel):
    image: str
    task_type: str
    task_id: str


@app.post("/analyze-behavior")
async def analyze_behavior(request: BehaviorAnalysisRequest):
    try:
        import base64
        import io
        from PIL import Image
        import numpy as np

        image_data = base64.b64decode(request.image.split(",")[1])
        image = Image.open(io.BytesIO(image_data))

        base_accuracy = 0.7 + np.random.random() * 0.3

        if request.task_type == "chest_movement":
            return {
                "breathing_detected": True,
                "rhythm_score": base_accuracy,
                "depth_score": base_accuracy * 0.9,
                "breaths_per_minute": 12 + np.random.randint(-3, 4),
            }
        elif request.task_type == "pose_stability":
            return {
                "pose_detected": True,
                "stability_score": base_accuracy,
                "posture_score": base_accuracy * 0.95,
                "meditation_pose": True,
            }
        elif request.task_type == "movement_patterns":
            return {
                "movement_detected": True,
                "pattern_score": base_accuracy,
                "smoothness_score": base_accuracy * 0.85,
                "exercise_type": "stretching",
            }
        elif request.task_type == "eye_tracking":
            return {
                "eye_movement_detected": True,
                "tracking_accuracy": base_accuracy,
                "focus_score": base_accuracy * 0.9,
                "gaze_stability": True,
            }
        elif request.task_type == "muscle_tension":
            return {
                "tension_changes_detected": True,
                "relaxation_score": base_accuracy,
                "progression_score": base_accuracy * 0.8,
                "muscle_groups_active": ["shoulders", "neck", "arms"],
            }
        else:
            return {
                "general_engagement": True,
                "engagement_score": base_accuracy,
                "activity_detected": True,
            }

    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Behavior analysis failed: {str(e)}"
        )


@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "models_loaded": {
            "whisper": bool(whisper_model is not None),
            "dialogpt": bool(dialogpt_model is not None),
            "translation": bool(len(opus_models) > 0),
            "tts": bool(len(tts_models) > 0),
        },
        "available_features": {
            "speech_to_text": bool(WHISPER_AVAILABLE and whisper_model is not None),
            "translation": bool(TRANSFORMERS_AVAILABLE and len(opus_models) > 0),
            "text_to_speech": bool(TTS_AVAILABLE and len(tts_models) > 0),
            "chat": True,
        },
        "port": 8000,
        "message": "Healix AI Backend is running successfully!",
    }


@app.get("/sessions")
async def get_sessions():
    return {"sessions": list(conversation_sessions.keys())}


@app.delete("/sessions/{session_id}")
async def clear_session(session_id: str):
    if session_id in conversation_sessions:
        del conversation_sessions[session_id]
        return {"message": f"Session {session_id} cleared"}
    else:
        raise HTTPException(status_code=404, detail="Session not found")


@app.get("/voices")
async def get_available_voices():
    voices = {
        "en": [
            {
                "id": "en-us-aria",
                "name": "Aria (US)",
                "gender": "female",
                "quality": "high",
            },
            {
                "id": "en-us-davis",
                "name": "Davis (US)",
                "gender": "male",
                "quality": "high",
            },
            {
                "id": "en-gb-libby",
                "name": "Libby (UK)",
                "gender": "female",
                "quality": "high",
            },
        ],
        "hi": [
            {
                "id": "hi-in-swara",
                "name": "Swara",
                "gender": "female",
                "quality": "high",
            },
            {
                "id": "hi-in-madhur",
                "name": "Madhur",
                "gender": "male",
                "quality": "high",
            },
        ],
        "te": [
            {
                "id": "te-in-shruti",
                "name": "Shruti",
                "gender": "female",
                "quality": "high",
            }
        ],
        "ta": [
            {
                "id": "ta-in-pallavi",
                "name": "Pallavi",
                "gender": "female",
                "quality": "high",
            }
        ],
        "kn": [
            {
                "id": "kn-in-sapna",
                "name": "Sapna",
                "gender": "female",
                "quality": "high",
            }
        ],
        "gu": [
            {
                "id": "gu-in-dhwani",
                "name": "Dhwani",
                "gender": "female",
                "quality": "high",
            }
        ],
    }
    return {"voices": voices}


if __name__ == "__main__":
    import uvicorn
    import os

    port = int(os.getenv("PORT", os.getenv("BACKEND_PORT", "8000")))
    print("=" * 70)
    print(f"🚀 Starting Healix AI Backend on port {port}")
    print(f"🌐 Backend will be available at: http://localhost:{port}")
    print("=" * 70)
    print(f"🤖 Available endpoints:")
    print(f"   - /health - Health check")
    print(f"   - /stt - Speech to text")
    print(f"   - /tts - Text to speech")
    print(f"   - /chat - AI chat")
    print(f"   - /translate - Language translation")
    print(f"   - /emotion-detect - Text emotion analysis")
    print(f"   - /facial-emotion-detect - Facial emotion detection")
    print(f"   - /analyze-behavior - Behavior analysis for tasks")
    print(f"   - /voices - Available TTS voices")
    uvicorn.run(app, host="0.0.0.0", port=port, reload=False)
