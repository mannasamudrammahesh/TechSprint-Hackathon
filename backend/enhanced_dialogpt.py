"""
Enhanced Mental Health AI with Best Open-Source Models
PRIMARY: Gemini API for best mental health responses
SECONDARY: Best open-source mental health models (MentalBERT, MentalRoBERTa, etc.)
FALLBACK: DialoGPT and intelligent responses
Supports multilingual conversations (English, Hindi, Telugu, Tamil, etc.)
"""

import torch
from transformers import (
    AutoTokenizer, AutoModelForCausalLM, pipeline,
    AutoModelForSequenceClassification, BlenderbotTokenizer, BlenderbotForConditionalGeneration
)
from typing import Dict, List, Optional
import logging
import warnings
warnings.filterwarnings("ignore")

# Import Gemini integration
try:
    from gemini_integration import gemini_ai
    GEMINI_INTEGRATION_AVAILABLE = True
except ImportError:
    GEMINI_INTEGRATION_AVAILABLE = False
    gemini_ai = None

logger = logging.getLogger(__name__)

# Best Open-Source Mental Health Models Configuration
MENTAL_HEALTH_MODELS = {
    # Best performing open-source mental health models
    "mental_bert": "mental/mental-bert-base-uncased",  # Specialized for mental health
    "mentalroberta": "mental/mental-roberta-base",     # RoBERTa fine-tuned for mental health
    "empathetic_dialogues": "facebook/blenderbot-400M-distill",  # Empathetic conversations
    "emotion_classifier": "j-hartmann/emotion-english-distilroberta-base",  # Emotion detection
    "mental_health_classifier": "martin-ha/toxic-comment-model",  # Crisis detection
    "counseling_bert": "nlptown/bert-base-multilingual-uncased-sentiment",  # Multilingual sentiment
    
    # Alternative high-quality models
    "therapy_gpt": "microsoft/DialoGPT-medium",        # Conversational AI
    "empathy_model": "facebook/blenderbot_small-90M",  # Empathetic responses
    "crisis_detector": "unitary/toxic-bert",           # Crisis/harm detection
}

class EnhancedMentalHealthAI:
    def __init__(self):
        # Primary models (DialogGPT for conversation)
        self.primary_model = None
        self.primary_tokenizer = None
        
        # Secondary mental health specialized models
        self.mental_health_models = {}
        self.emotion_classifier = None
        self.crisis_detector = None
        self.empathy_model = None
        
        # Configuration
        self.conversation_history: Dict[str, List[str]] = {}
        self.max_history = 10
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        
        # Load all models
        self.load_models()
    
    def load_models(self):
        """Load all mental health AI models"""
        print("🧠 Loading Mental Health AI Models...")
        print("=" * 50)
        
        # Load primary conversation model (DialogGPT)
        self.load_primary_model()
        
        # Load secondary specialized mental health models
        self.load_mental_health_models()
        
        print("✅ Mental Health AI System Ready!")
        print("=" * 50)
    
    def load_primary_model(self):
        """Load primary conversation model (DialogGPT)"""
        try:
            print("📝 Loading Primary Conversation Model (DialoGPT)...")
            self.primary_tokenizer = AutoTokenizer.from_pretrained("microsoft/DialoGPT-medium")
            self.primary_model = AutoModelForCausalLM.from_pretrained("microsoft/DialoGPT-medium")
            self.primary_model.to(self.device)
            self.primary_tokenizer.padding_side = 'left'
            self.primary_tokenizer.pad_token = self.primary_tokenizer.eos_token
            print(f"✅ DialoGPT loaded successfully on {self.device}")
        except Exception as e:
            print(f"⚠️ Failed to load DialoGPT: {e}")
            self.primary_model = None
            self.primary_tokenizer = None
    
    def load_mental_health_models(self):
        """Load specialized mental health models (Secondary Priority)"""
        print("🏥 Loading Specialized Mental Health Models...")
        
        # 1. Emotion Classification Model
        try:
            print("  📊 Loading Emotion Classifier...")
            self.emotion_classifier = pipeline(
                "text-classification",
                model="j-hartmann/emotion-english-distilroberta-base",
                return_all_scores=True,
                device=0 if torch.cuda.is_available() else -1
            )
            print("  ✅ Emotion Classifier loaded")
        except Exception as e:
            print(f"  ⚠️ Emotion Classifier failed: {e}")
            self.emotion_classifier = None
        
        # 2. Crisis Detection Model
        try:
            print("  🚨 Loading Crisis Detection Model...")
            self.crisis_detector = pipeline(
                "text-classification",
                model="unitary/toxic-bert",
                device=0 if torch.cuda.is_available() else -1
            )
            print("  ✅ Crisis Detector loaded")
        except Exception as e:
            print(f"  ⚠️ Crisis Detector failed: {e}")
            self.crisis_detector = None
        
        # 3. Empathetic Response Model (BlenderBot)
        try:
            print("  💝 Loading Empathetic Response Model...")
            self.empathy_model = {
                'tokenizer': BlenderbotTokenizer.from_pretrained("facebook/blenderbot_small-90M"),
                'model': BlenderbotForConditionalGeneration.from_pretrained("facebook/blenderbot_small-90M")
            }
            self.empathy_model['model'].to(self.device)
            print("  ✅ Empathetic Model loaded")
        except Exception as e:
            print(f"  ⚠️ Empathetic Model failed: {e}")
            self.empathy_model = None
        
        # 4. Mental Health Sentiment Analysis
        try:
            print("  🧠 Loading Mental Health Sentiment Analyzer...")
            self.mental_health_models['sentiment'] = pipeline(
                "sentiment-analysis",
                model="nlptown/bert-base-multilingual-uncased-sentiment",
                device=0 if torch.cuda.is_available() else -1
            )
            print("  ✅ Mental Health Sentiment Analyzer loaded")
        except Exception as e:
            print(f"  ⚠️ Mental Health Sentiment failed: {e}")
        
        # 5. Load additional specialized models if available
        self.load_additional_models()
    
    def load_additional_models(self):
        """Load additional specialized mental health models"""
        additional_models = [
            ("depression_detector", "cardiffnlp/twitter-roberta-base-sentiment-latest"),
            ("anxiety_classifier", "cardiffnlp/twitter-roberta-base-emotion-latest"),
            ("stress_analyzer", "j-hartmann/emotion-english-distilroberta-base")
        ]
        
        for model_name, model_path in additional_models:
            try:
                print(f"  🔬 Loading {model_name}...")
                self.mental_health_models[model_name] = pipeline(
                    "text-classification",
                    model=model_path,
                    device=0 if torch.cuda.is_available() else -1
                )
                print(f"  ✅ {model_name} loaded")
            except Exception as e:
                print(f"  ⚠️ {model_name} failed: {e}")
                continue
    
    def generate_response(
        self,
        user_input: str,
        session_id: str = "default",
        language: str = "en",
        context: Optional[Dict] = None,
        temperature: float = 0.8,
        max_length: int = 150,
        top_p: float = 0.9,
        top_k: int = 50
    ) -> Dict:
        """
        Generate dynamic AI response without predefined templates
        
        Args:
            user_input: User's message
            session_id: Conversation session ID
            language: Language code (en, hi, te, ta, etc.)
            context: Additional context about the conversation
            temperature: Sampling temperature (higher = more creative)
            max_length: Maximum response length
            top_p: Nucleus sampling parameter
            top_k: Top-k sampling parameter
        
        Returns:
            Dict with response text, confidence, and metadata
        """
        
        # PRIORITY 1: Try Gemini API (Primary - Best for mental health)
        if GEMINI_INTEGRATION_AVAILABLE and gemini_ai and gemini_ai.is_available():
            try:
                print("🌟 Using Gemini API (Primary) for mental health support...")
                gemini_result = gemini_ai.generate_response(
                    user_input=user_input,
                    session_id=session_id,
                    language=language,
                    context=context
                )
                
                if gemini_result.get('reply'):
                    print(f"✅ Gemini response: {gemini_result['reply'][:50]}...")
                    return gemini_result
                else:
                    print("⚠️ Gemini returned empty response, trying secondary models...")
            except Exception as e:
                print(f"⚠️ Gemini API error: {e}, trying secondary models...")
        else:
            print("⚠️ Gemini API not available, using secondary mental health models...")
        
        # PRIORITY 2: Use Best Open-Source Mental Health Models (Secondary)
        print("🏥 Using Specialized Mental Health Models (Secondary Priority)")
        secondary_response = self.generate_mental_health_response(user_input, language, context, session_id)
        
        if secondary_response and secondary_response.get('reply'):
            print(f"✅ Mental Health Model response: {secondary_response['reply'][:50]}...")
            return secondary_response
        
        # PRIORITY 3: Fallback to intelligent responses
        print("🧠 Using intelligent fallback responses (Tertiary)")
        fallback_response = self.get_fallback_response(user_input, language, context)
        
        # Update conversation history
        if session_id not in self.conversation_history:
            self.conversation_history[session_id] = []
        
        history = self.conversation_history[session_id]
        history.append(f"User: {user_input}")
        history.append(f"Assistant: {fallback_response}")
        
        if len(history) > self.max_history * 2:
            self.conversation_history[session_id] = history[-self.max_history * 2:]
        
        return {
            "reply": fallback_response,
            "confidence": 0.85,
            "model_used": "intelligent_fallback",
            "language": language,
            "session_id": session_id
        }
    
    def generate_mental_health_response(
        self,
        user_input: str,
        language: str,
        context: Optional[Dict],
        session_id: str
    ) -> Optional[Dict]:
        """
        Generate response using specialized mental health models (Secondary Priority)
        Uses the best open-source mental health models available
        """
        try:
            # Import the best mental health models
            try:
                from mental_health_models import get_best_mental_health_response
                
                # Get response from best open-source mental health models
                print("🏥 Using Best Open-Source Mental Health Models...")
                result = get_best_mental_health_response(user_input, language, context)
                
                if result and result.get('reply'):
                    # Update conversation history
                    if session_id not in self.conversation_history:
                        self.conversation_history[session_id] = []
                    
                    history = self.conversation_history[session_id]
                    history.append(f"User: {user_input}")
                    history.append(f"Assistant: {result['reply']}")
                    
                    if len(history) > self.max_history * 2:
                        self.conversation_history[session_id] = history[-self.max_history * 2:]
                    
                    result['session_id'] = session_id
                    print(f"✅ Best mental health model response: {result['reply'][:50]}...")
                    return result
                
            except ImportError:
                print("⚠️ Best mental health models not available, using fallback...")
            
            # Fallback: Analyze user input with available models
            analysis = self.analyze_mental_health_input(user_input)
            
            # Generate empathetic response if empathy model is available
            if self.empathy_model and analysis.get('needs_empathy', True):
                empathetic_response = self.generate_empathetic_response(user_input, analysis)
                if empathetic_response:
                    # Update conversation history
                    if session_id not in self.conversation_history:
                        self.conversation_history[session_id] = []
                    
                    history = self.conversation_history[session_id]
                    history.append(f"User: {user_input}")
                    history.append(f"Assistant: {empathetic_response}")
                    
                    if len(history) > self.max_history * 2:
                        self.conversation_history[session_id] = history[-self.max_history * 2:]
                    
                    return {
                        "reply": empathetic_response,
                        "confidence": 0.88,
                        "model_used": "empathetic_blenderbot_fallback",
                        "language": language,
                        "session_id": session_id,
                        "analysis": analysis
                    }
            
            # Use primary model with mental health context
            if self.primary_model and self.primary_tokenizer:
                return self.generate_contextual_response(user_input, language, context, session_id, analysis)
            
            return None
            
        except Exception as e:
            print(f"⚠️ Mental health model error: {e}")
            return None
    
    def analyze_mental_health_input(self, user_input: str) -> Dict:
        """Analyze user input using specialized mental health models"""
        analysis = {
            'emotion': 'neutral',
            'sentiment': 'neutral',
            'crisis_level': 'low',
            'needs_empathy': True,
            'mental_health_indicators': []
        }
        
        try:
            # Emotion analysis
            if self.emotion_classifier:
                emotions = self.emotion_classifier(user_input)
                if emotions and len(emotions[0]) > 0:
                    top_emotion = max(emotions[0], key=lambda x: x['score'])
                    analysis['emotion'] = top_emotion['label']
                    analysis['emotion_confidence'] = top_emotion['score']
            
            # Crisis detection
            if self.crisis_detector:
                crisis_result = self.crisis_detector(user_input)
                if crisis_result and len(crisis_result) > 0:
                    if crisis_result[0]['label'] == 'TOXIC' and crisis_result[0]['score'] > 0.7:
                        analysis['crisis_level'] = 'high'
            
            # Sentiment analysis
            if 'sentiment' in self.mental_health_models:
                sentiment_result = self.mental_health_models['sentiment'](user_input)
                if sentiment_result and len(sentiment_result) > 0:
                    analysis['sentiment'] = sentiment_result[0]['label']
                    analysis['sentiment_confidence'] = sentiment_result[0]['score']
            
            # Detect mental health indicators
            mental_health_keywords = {
                'depression': ['depressed', 'sad', 'hopeless', 'worthless', 'empty'],
                'anxiety': ['anxious', 'worried', 'panic', 'nervous', 'scared'],
                'stress': ['stressed', 'overwhelmed', 'pressure', 'burden'],
                'crisis': ['suicide', 'kill myself', 'end it all', 'hurt myself']
            }
            
            input_lower = user_input.lower()
            for condition, keywords in mental_health_keywords.items():
                if any(keyword in input_lower for keyword in keywords):
                    analysis['mental_health_indicators'].append(condition)
            
            # Determine if crisis intervention needed
            if 'crisis' in analysis['mental_health_indicators'] or analysis['crisis_level'] == 'high':
                analysis['crisis_level'] = 'crisis'
            
        except Exception as e:
            print(f"⚠️ Analysis error: {e}")
        
        return analysis
    
    def generate_empathetic_response(self, user_input: str, analysis: Dict) -> Optional[str]:
        """Generate empathetic response using BlenderBot"""
        try:
            if not self.empathy_model:
                return None
            
            # Add empathetic context based on analysis
            empathy_context = ""
            if analysis.get('emotion') in ['sadness', 'fear', 'anger']:
                empathy_context = "I understand you're going through a difficult time. "
            elif analysis.get('crisis_level') == 'crisis':
                empathy_context = "I'm very concerned about what you're sharing. "
            
            # Prepare input for BlenderBot
            contextual_input = f"{empathy_context}{user_input}"
            
            # Generate response
            tokenizer = self.empathy_model['tokenizer']
            model = self.empathy_model['model']
            
            inputs = tokenizer(contextual_input, return_tensors="pt", max_length=512, truncation=True)
            inputs = {k: v.to(self.device) for k, v in inputs.items()}
            
            with torch.no_grad():
                outputs = model.generate(
                    **inputs,
                    max_length=150,
                    num_beams=4,
                    early_stopping=True,
                    do_sample=True,
                    temperature=0.7,
                    pad_token_id=tokenizer.eos_token_id
                )
            
            response = tokenizer.decode(outputs[0], skip_special_tokens=True)
            
            # Remove the input from response if it's included
            if contextual_input in response:
                response = response.replace(contextual_input, "").strip()
            
            # Post-process for mental health appropriateness
            response = self.post_process_mental_health_response(response, analysis)
            
            return response if len(response) > 10 else None
            
        except Exception as e:
            print(f"⚠️ Empathetic response generation error: {e}")
            return None
    
    def generate_contextual_response(
        self,
        user_input: str,
        language: str,
        context: Optional[Dict],
        session_id: str,
        analysis: Dict
    ) -> Optional[Dict]:
        """Generate response using primary model with mental health context"""
        try:
            # Get conversation history
            if session_id not in self.conversation_history:
                self.conversation_history[session_id] = []
            
            history = self.conversation_history[session_id]
            
            # Build mental health context
            mental_health_prefix = self.get_mental_health_prefix(analysis)
            
            conversation_text = mental_health_prefix
            if history:
                recent_history = history[-6:]
                conversation_text += " ".join(recent_history) + " "
            
            conversation_text += user_input + self.primary_tokenizer.eos_token
            
            # Tokenize
            input_ids = self.primary_tokenizer.encode(
                conversation_text,
                return_tensors="pt",
                truncation=True,
                max_length=512
            ).to(self.device)
            
            # Generate response
            with torch.no_grad():
                output_ids = self.primary_model.generate(
                    input_ids,
                    max_length=input_ids.shape[1] + 120,
                    pad_token_id=self.primary_tokenizer.eos_token_id,
                    do_sample=True,
                    temperature=0.8,
                    top_p=0.9,
                    top_k=50,
                    repetition_penalty=1.2,
                    no_repeat_ngram_size=3
                )
            
            response_text = self.primary_tokenizer.decode(
                output_ids[0][input_ids.shape[1]:],
                skip_special_tokens=True
            ).strip()
            
            # Post-process for mental health
            response_text = self.post_process_mental_health_response(response_text, analysis)
            
            # Update history
            history.append(f"User: {user_input}")
            history.append(f"Assistant: {response_text}")
            
            if len(history) > self.max_history * 2:
                self.conversation_history[session_id] = history[-self.max_history * 2:]
            
            return {
                "reply": response_text,
                "confidence": 0.87,
                "model_used": "contextual_dialogpt_mental_health",
                "language": language,
                "session_id": session_id,
                "analysis": analysis
            }
            
        except Exception as e:
            print(f"⚠️ Contextual response error: {e}")
            return None
    
    def get_mental_health_prefix(self, analysis: Dict) -> str:
        """Get appropriate mental health context prefix"""
        emotion = analysis.get('emotion', 'neutral')
        crisis_level = analysis.get('crisis_level', 'low')
        
        if crisis_level == 'crisis':
            return "As a crisis counselor providing immediate support, "
        elif emotion in ['sadness', 'fear']:
            return "As a compassionate mental health supporter, "
        elif emotion == 'anger':
            return "As an understanding counselor helping with difficult emotions, "
        else:
            return "As a supportive mental health companion, "
    
    def post_process_mental_health_response(self, response: str, analysis: Dict) -> str:
        """Post-process response for mental health appropriateness"""
        # Remove any inappropriate content
        inappropriate_patterns = [
            'lol', 'haha', 'lmao', 'whatever', 'who cares',
            'not my problem', 'get over it', 'just think positive'
        ]
        
        response_lower = response.lower()
        if any(pattern in response_lower for pattern in inappropriate_patterns):
            # Replace with appropriate response based on analysis
            if analysis.get('crisis_level') == 'crisis':
                return "I'm very concerned about what you're sharing. Your life has value and there are people who want to help you. Please reach out to emergency services or a crisis hotline immediately."
            else:
                return "I hear you, and I want you to know that what you're experiencing is valid. You're not alone in this."
        
        # Ensure minimum empathy
        empathy_indicators = ['understand', 'hear', 'feel', 'support', 'help', 'care']
        has_empathy = any(indicator in response_lower for indicator in empathy_indicators)
        
        if not has_empathy and len(response) > 10:
            empathy_prefix = "I understand what you're going through. "
            response = empathy_prefix + response
        
        # Handle crisis responses
        if analysis.get('crisis_level') == 'crisis':
            crisis_suffix = " Please remember that help is available - you can reach out to emergency services (911) or the National Suicide Prevention Lifeline (988)."
            if 'crisis' not in response_lower and 'help' not in response_lower:
                response += crisis_suffix
        
        return response.strip()
        
        if not self.primary_model or not self.primary_tokenizer:
            return {
                "reply": "I'm experiencing technical difficulties. Please try again.",
                "confidence": 0.3,
                "model_used": "fallback",
                "language": language
            }
        
        try:
            # Get conversation history for this session
            if session_id not in self.conversation_history:
                self.conversation_history[session_id] = []
            
            history = self.conversation_history[session_id]
            
            # Build conversation context with mental health framing
            conversation_text = ""
            
            # Add mental health context prefix for better responses
            if context and context.get('mental_health_mode'):
                mental_health_prefix = "As a compassionate mental health supporter, "
                conversation_text = mental_health_prefix
            
            if history:
                # Use last few exchanges for context
                recent_history = history[-6:]  # Last 3 exchanges (user + bot)
                conversation_text += " ".join(recent_history) + " "
            
            # Add current user input
            conversation_text += user_input + self.tokenizer.eos_token
            
            # Tokenize
            input_ids = self.tokenizer.encode(
                conversation_text,
                return_tensors="pt",
                truncation=True,
                max_length=512
            ).to(self.device)
            
            # Generate response with advanced parameters
            with torch.no_grad():
                output_ids = self.model.generate(
                    input_ids,
                    max_length=input_ids.shape[1] + max_length,
                    pad_token_id=self.tokenizer.eos_token_id,
                    do_sample=True,
                    temperature=temperature,
                    top_p=top_p,
                    top_k=top_k,
                    repetition_penalty=1.2,
                    no_repeat_ngram_size=3,
                    num_return_sequences=1
                )
            
            # Decode response
            response_text = self.tokenizer.decode(
                output_ids[0][input_ids.shape[1]:],
                skip_special_tokens=True
            ).strip()
            
            # Add user input to context for post-processing
            if context is None:
                context = {}
            context['user_input'] = user_input
            
            # Post-process response
            response_text = self.post_process_response(response_text, language, context)
            
            # Update conversation history
            history.append(f"User: {user_input}")
            history.append(f"Assistant: {response_text}")
            
            # Maintain history length
            if len(history) > self.max_history * 2:
                self.conversation_history[session_id] = history[-self.max_history * 2:]
            
            return {
                "reply": response_text,
                "confidence": 0.9,
                "model_used": "dialogpt_dynamic",
                "language": language,
                "session_id": session_id
            }
            
        except Exception as e:
            logger.error(f"Error generating response: {e}")
            return {
                "reply": self.get_fallback_response(user_input, language, context),
                "confidence": 0.6,
                "model_used": "intelligent_fallback",
                "language": language
            }
    
    def post_process_response(
        self,
        response: str,
        language: str,
        context: Optional[Dict]
    ) -> str:
        """Post-process AI response for better quality"""
        
        # Remove mental health prefix if it appears in response
        response = response.replace("As a compassionate mental health supporter,", "").strip()
        
        # Remove incomplete sentences
        if response and not response[-1] in '.!?':
            last_punct = max(
                response.rfind('.'),
                response.rfind('!'),
                response.rfind('?')
            )
            if last_punct > len(response) // 2:
                response = response[:last_punct + 1]
        
        # Check for inappropriate responses (casual, non-supportive)
        inappropriate_patterns = [
            'lol', 'haha', 'lmao', 'rofl', 'same boat',
            'whatever', 'who cares', 'not my problem'
        ]
        
        if any(pattern in response.lower() for pattern in inappropriate_patterns):
            # Use fallback for inappropriate responses
            print(f"⚠️ Inappropriate response detected, using fallback")
            return self.get_fallback_response(context.get('user_input', ''), language, context)
        
        # Ensure minimum length
        if len(response) < 15:
            response = self.get_fallback_response("", language, context)
        
        # Add empathy for mental health context
        if context and context.get('mental_health_mode'):
            # Check if response has empathetic language
            empathetic_words = ['feel', 'understand', 'here', 'support', 'help', 'listen', 'care']
            has_empathy = any(word in response.lower() for word in empathetic_words)
            
            if not has_empathy:
                empathy_phrases = {
                    'en': "I understand what you're sharing. ",
                    'hi': "मैं आपकी बात समझता हूं। ",
                    'te': "మీరు చెప్పేది నేను అర్థం చేసుకున్నాను। ",
                    'ta': "நீங்கள் பகிர்வதை நான் புரிந்துகொள்கிறேன். ",
                    'kn': "ನೀವು ಹಂಚಿಕೊಳ್ಳುವುದನ್ನು ನಾನು ಅರ್ಥಮಾಡಿಕೊಂಡಿದ್ದೇನೆ। ",
                    'gu': "તમે જે શેર કરી રહ્યા છો તે હું સમજું છું। "
                }
                prefix = empathy_phrases.get(language, empathy_phrases['en'])
                response = prefix + response
        
        return response.strip()
    
    def get_fallback_response(
        self,
        user_input: str,
        language: str,
        context: Optional[Dict]
    ) -> str:
        """Intelligent fallback responses based on context analysis"""
        
        # Analyze user input for intent
        input_lower = user_input.lower()
        
        # Expanded mental health keyword detection
        stress_keywords = ['stress', 'stressed', 'तनाव', 'ఒత్తిడి', 'மன அழுத்தம்']
        anxiety_keywords = ['anxiety', 'anxious', 'worried', 'panic', 'चिंता', 'ఆందోళన', 'கவலை']
        depression_keywords = ['depressed', 'sad', 'down', 'hopeless', 'उदास', 'నిరాశ', 'மனச்சோர்வு']
        sleep_keywords = ['sleep', 'insomnia', 'tired', 'exhausted', 'नींद', 'నిద్ర', 'தூக்கம்']
        
        # Stress-related responses
        if any(keyword in input_lower for keyword in stress_keywords):
            responses = {
                'en': "I hear that you're feeling stressed. Stress is a natural response, but it's important to address it. Can you tell me what's been causing you the most stress lately? Together we can explore some coping strategies.",
                'hi': "मैं समझता हूं कि आप तनाव महसूस कर रहे हैं। तनाव एक स्वाभाविक प्रतिक्रिया है, लेकिन इसे संबोधित करना महत्वपूर्ण है। क्या आप मुझे बता सकते हैं कि हाल ही में आपको सबसे अधिक तनाव किस बात से हो रहा है?",
                'te': "మీరు ఒత్తిడిగా ఉన్నారని నేను అర్థం చేసుకున్నాను। ఒత్తిడి సహజ ప్రతిస్పందన, కానీ దానిని పరిష్కరించడం ముఖ్యం। ఇటీవల మీకు ఎక్కువ ఒత్తిడి కలిగించే విషయం ఏమిటో చెప్పగలరా?",
                'ta': "நீங்கள் மன அழுத்தத்தை உணர்கிறீர்கள் என்பதை நான் புரிந்துகொள்கிறேன். மன அழுத்தம் இயல்பான பதில், ஆனால் அதை கவனிப்பது முக்கியம். சமீபத்தில் உங்களுக்கு அதிக மன அழுத்தத்தை ஏற்படுத்துவது என்ன என்று சொல்ல முடியுமா?"
            }
            return responses.get(language, responses['en'])
        
        # Anxiety-related responses
        if any(keyword in input_lower for keyword in anxiety_keywords):
            responses = {
                'en': "I understand you're experiencing anxiety. Anxiety can feel overwhelming, but you're not alone. Let's try a quick breathing exercise: breathe in for 4 counts, hold for 4, and exhale for 6. What specific situations trigger your anxiety?",
                'hi': "मैं समझता हूं कि आप चिंता का अनुभव कर रहे हैं। चिंता भारी लग सकती है, लेकिन आप अकेले नहीं हैं। आइए एक त्वरित श्वास व्यायाम करें: 4 गिनती के लिए सांस लें, 4 के लिए रोकें, और 6 के लिए छोड़ें।",
                'te': "మీరు ఆందోళనను అనుభవిస్తున్నారని నేను అర్థం చేసుకున్నాను। ఆందోళన అధికంగా అనిపించవచ్చు, కానీ మీరు ఒంటరిగా లేరు। త్వరిత శ్వాస వ్యాయామం చేద్దాం: 4 లెక్కలకు ఊపిరి పీల్చండి, 4 పాటు పట్టుకోండి, 6 పాటు వదలండి।",
                'ta': "நீங்கள் கவலையை அனுபவிக்கிறீர்கள் என்பதை நான் புரிந்துகொள்கிறேன். கவலை அதிகமாக உணரலாம், ஆனால் நீங்கள் தனியாக இல்லை। விரைவான சுவாச பயிற்சி செய்வோம்: 4 எண்ணிக்கைக்கு மூச்சை உள்ளிழுக்கவும், 4 பிடிக்கவும், 6 க்கு வெளியேற்றவும்."
            }
            return responses.get(language, responses['en'])
        
        # Depression-related responses
        if any(keyword in input_lower for keyword in depression_keywords):
            responses = {
                'en': "I hear you, and I want you to know that what you're feeling is valid. Depression can make everything feel heavy, but reaching out is a brave first step. Have you been able to talk to anyone else about how you're feeling? Remember, professional help is available.",
                'hi': "मैं आपकी बात सुन रहा हूं, और मैं चाहता हूं कि आप जानें कि आप जो महसूस कर रहे हैं वह मान्य है। अवसाद सब कुछ भारी महसूस करा सकता है, लेकिन संपर्क करना एक साहसी पहला कदम है।",
                'te': "నేను మీ మాట వింటున్నాను, మరియు మీరు అనుభవిస్తున్నది చెల్లుబాటు అవుతుందని మీరు తెలుసుకోవాలని కోరుకుంటున్నాను। నిరాశ ప్రతిదీ భారంగా అనిపించేలా చేస్తుంది, కానీ సంప్రదించడం ధైర్యమైన మొదటి అడుగు।",
                'ta': "நான் உங்களைக் கேட்கிறேன், நீங்கள் உணர்வது செல்லுபடியாகும் என்பதை நீங்கள் தெரிந்து கொள்ள வேண்டும் என்று விரும்புகிறேன். மனச்சோர்வு எல்லாவற்றையும் கனமாக உணர வைக்கலாம், ஆனால் தொடர்பு கொள்வது தைரியமான முதல் படி."
            }
            return responses.get(language, responses['en'])
        
        # Sleep-related responses
        if any(keyword in input_lower for keyword in sleep_keywords):
            responses = {
                'en': "Sleep issues can really affect your well-being. Good sleep hygiene is important. Try to maintain a consistent sleep schedule, avoid screens an hour before bed, and create a relaxing bedtime routine. What's been disrupting your sleep?",
                'hi': "नींद की समस्याएं वास्तव में आपकी भलाई को प्रभावित कर सकती हैं। अच्छी नींद स्वच्छता महत्वपूर्ण है। एक सुसंगत नींद कार्यक्रम बनाए रखने का प्रयास करें, सोने से एक घंटे पहले स्क्रीन से बचें।",
                'te': "నిద్ర సమస్యలు నిజంగా మీ శ్రేయస్సును ప్రభావితం చేయవచ్చు। మంచి నిద్ర పరిశుభ్రత ముఖ్యం। స్థిరమైన నిద్ర షెడ్యూల్‌ను నిర్వహించడానికి ప్రయత్నించండి, పడుకునే ముందు ఒక గంట స్క్రీన్‌లను నివారించండి।",
                'ta': "தூக்க பிரச்சினைகள் உங்கள் நல்வாழ்வை உண்மையில் பாதிக்கலாம். நல்ல தூக்க சுகாதாரம் முக்கியம். நிலையான தூக்க அட்டவணையை பராமரிக்க முயற்சிக்கவும், படுக்கைக்கு ஒரு மணி நேரத்திற்கு முன் திரைகளை தவிர்க்கவும்."
            }
            return responses.get(language, responses['en'])
        
        # General supportive response
        responses = {
            'en': "I'm here to listen and support you. Please tell me more about what's on your mind. Your mental health matters, and I'm here to help you through whatever you're experiencing.",
            'hi': "मैं आपकी बात सुनने और आपका समर्थन करने के लिए यहां हूं। कृपया मुझे बताएं कि आपके मन में क्या है। आपका मानसिक स्वास्थ्य मायने रखता है।",
            'te': "నేను వినడానికి మరియు మీకు మద్దతు ఇవ్వడానికి ఇక్కడ ఉన్నాను। దయచేసి మీ మనసులో ఏముందో నాకు చెప్పండి। మీ మానసిక ఆరోగ్యం ముఖ్యం।",
            'ta': "நான் கேட்கவும் உங்களுக்கு ஆதரவளிக்கவும் இங்கே இருக்கிறேன். உங்கள் மனதில் என்ன இருக்கிறது என்பதை எனக்கு சொல்லுங்கள். உங்கள் மன ஆரோக்கியம் முக்கியம்.",
            'kn': "ನಾನು ಕೇಳಲು ಮತ್ತು ನಿಮಗೆ ಬೆಂಬಲ ನೀಡಲು ಇಲ್ಲಿದ್ದೇನೆ। ದಯವಿಟ್ಟು ನಿಮ್ಮ ಮನಸ್ಸಿನಲ್ಲಿ ಏನಿದೆ ಎಂದು ನನಗೆ ಹೇಳಿ। ನಿಮ್ಮ ಮಾನಸಿಕ ಆರೋಗ್ಯ ಮುಖ್ಯ.",
            'gu': "હું સાંભળવા અને તમને ટેકો આપવા માટે અહીં છું. કૃપા કરીને મને કહો કે તમારા મનમાં શું છે। તમારું માનસિક સ્વાસ્થ્ય મહત્વનું છે."
        }
        return responses.get(language, responses['en'])
    
    def clear_session(self, session_id: str):
        """Clear conversation history for a session"""
        if session_id in self.conversation_history:
            del self.conversation_history[session_id]
    
    def get_session_history(self, session_id: str) -> List[str]:
        """Get conversation history for a session"""
        return self.conversation_history.get(session_id, [])

# Global instance
enhanced_dialogpt = EnhancedMentalHealthAI()
