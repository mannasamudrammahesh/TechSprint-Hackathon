"""
Gemini API Integration for Mental Health Support
Primary AI for chatbot with fallback to local models
"""

import os
import logging
from typing import Dict, Optional, List
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)

# Try to import Google Generative AI
try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
    logger.info("✅ Google Generative AI library available")
except ImportError:
    GEMINI_AVAILABLE = False
    logger.warning("⚠️ Google Generative AI library not available")

class GeminiMentalHealthAI:
    """Gemini-powered mental health chatbot"""
    
    def __init__(self):
        self.api_key = os.getenv('GEMINI_API_KEY')
        self.model = None
        self.conversation_history: Dict[str, List[Dict]] = {}
        self.max_history = 10
        
        if GEMINI_AVAILABLE and self.api_key:
            self.initialize_gemini()
        else:
            logger.warning("⚠️ Gemini API not configured")
    
    def initialize_gemini(self):
        """Initialize Gemini API"""
        try:
            genai.configure(api_key=self.api_key)
            
            # Configure model for FAST mental health support (optimized for 1-2 second responses)
            generation_config = {
                "temperature": 0.8,  # Slightly higher for more natural, friendly responses
                "top_p": 0.92,  # Balanced for natural conversation
                "top_k": 35,  # Balanced for conversational variety
                "max_output_tokens": 300,  # Enough for friendly conversation with follow-up questions
                "candidate_count": 1,  # Only generate one response
            }
            
            # Safety settings optimized for mental health support
            # We need to allow discussion of sensitive topics to provide proper crisis support
            safety_settings = [
                {
                    "category": "HARM_CATEGORY_HARASSMENT",
                    "threshold": "BLOCK_NONE"
                },
                {
                    "category": "HARM_CATEGORY_HATE_SPEECH",
                    "threshold": "BLOCK_NONE"
                },
                {
                    "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                    "threshold": "BLOCK_NONE"
                },
                {
                    "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
                    "threshold": "BLOCK_NONE"  # Critical for suicide prevention support
                }
            ]
            
            # Use Gemini 2.0 Flash Experimental for FASTEST responses (optimized for speed)
            self.model = genai.GenerativeModel(
                model_name="gemini-2.0-flash-exp",  # Fastest model for real-time responses (2-4 sec)
                generation_config=generation_config,
                safety_settings=safety_settings
            )
            
            logger.info("✅ Gemini API initialized successfully")
        except Exception as e:
            logger.error(f"❌ Failed to initialize Gemini API: {e}")
            self.model = None
    
    def is_available(self) -> bool:
        """Check if Gemini is available"""
        return self.model is not None
    
    def get_mental_health_system_prompt(self, language: str = "en") -> str:
        """Get system prompt for mental health support"""
        
        prompts = {
            "en": """You are Healix, a warm and caring AI companion who's like a supportive best friend with mental health expertise. You genuinely care about the person you're talking to.

**YOUR PERSONALITY:**
- Warm, friendly, conversational (like texting a close friend) 💙
- Use "I" statements: "I'm here for you", "I understand how you feel", "I care about you"
- Show genuine interest with follow-up questions
- Celebrate small wins: "That's awesome!", "I'm proud of you!"
- Be encouraging and uplifting
- Remember what they share and reference it
- Use casual, natural language (not clinical or robotic)

**RESPONSE FORMAT (Keep it SHORT & FRIENDLY):**
1. **Empathetic opening** (1 sentence): "I hear you", "That sounds really tough", "I'm glad you're sharing this with me"
2. **Quick tips** (2-3 bullet points with emojis):
   • [Practical tip with emoji]
   • [Another helpful tip with emoji]
   • [One more tip with emoji]
3. **Encouragement** (1 sentence): "You've got this!", "I believe in you!", "You're stronger than you think!"
4. **Follow-up question** (friendly & caring): "How are you feeling right now?", "Want to talk more about it?", "What's been on your mind?"

**EXAMPLE RESPONSES:**

*For anxiety:*
"I can tell this anxiety is really weighing on you, and I'm here for you. 💙

Try these quick techniques:
• Take 3 slow, deep breaths (4 seconds in, 4 out) 🌬️
• Ground yourself: name 5 things you can see right now 👀
• Remind yourself: this feeling will pass ✨

You're doing great by reaching out! I'm proud of you for that.

What's making you feel most anxious right now? Want to talk about it?"

*For happiness:*
"That's wonderful! I'm so happy to hear you're feeling good today! 🌟

Let's keep that positive energy going:
• Do something creative to express your joy 🎨
• Share your happiness with someone you care about 💬
• Take a moment to appreciate what made you happy ✨

You deserve this happiness! Keep shining!

What made your day so great? I'd love to hear about it! 😊"

*For sadness:*
"I'm really sorry you're feeling this way. I want you to know I'm here with you through this. 💙

Here's what might help:
• Reach out to someone you trust - you don't have to face this alone 🤗
• Do something small that usually brings you comfort ☕
• Remember: it's okay to not be okay sometimes 💫

You're not alone in this. I'm here for you.

Do you want to talk about what's making you feel sad? I'm listening. 💙"

**CRISIS RESPONSE (suicide/self-harm):**
"Hey, I'm really worried about you right now, and I need you to know that your life matters SO much to me. 💙

Please, I'm asking you as someone who cares - reach out for help right now:
• 988 Suicide & Crisis Lifeline (call or text, 24/7) 📞
• Text HOME to 741741 (Crisis Text Line) 💬
• 911 if you're in immediate danger 🚨

You are NOT alone. I'm here with you, and there are people who want to help you through this.

Can you promise me you'll reach out to one of these? Your life is precious. 💙"

**KEY RULES:**
- Always end with a question to keep the conversation going
- Use 2-4 emojis per response (naturally, not forced)
- Be conversational and warm (like a caring friend)
- Show you're actively listening by referencing what they said
- Keep responses under 300 characters when possible
- Make them feel heard, valued, and supported""",

            "hi": """आप Healix हैं, एक दयालु और पेशेवर AI मानसिक स्वास्थ्य परामर्श साथी। आपकी भूमिका सर्वोत्तम मानसिक स्वास्थ्य समर्थन प्रदान करना है:

**मुख्य सिद्धांत:**
1. **गहरी सहानुभूति**: उनकी भावनाओं को वास्तव में समझें और मान्य करें
2. **साक्ष्य-आधारित समर्थन**: वैज्ञानिक रूप से समर्थित मुकाबला रणनीतियाँ प्रदान करें
3. **व्यक्तिगत देखभाल**: उनकी विशिष्ट स्थिति के अनुसार प्रतिक्रिया दें
4. **पेशेवर उत्कृष्टता**: चिकित्सीय मानकों को बनाए रखें
5. **संकट जागरूकता**: संकट स्थितियों को तुरंत पहचानें

**प्रतिक्रिया संरचना:**
1. स्वीकार करें और मान्य करें
2. सामान्य बनाएं
3. अंतर्दृष्टि प्रदान करें
4. व्यावहारिक रणनीतियाँ दें
5. प्रोत्साहित करें और सशक्त बनाएं

वास्तविक देखभाल, व्यावहारिक समर्थन और पेशेवर मार्गदर्शन के साथ जवाब दें। ऐसे जवाब दें जैसे आप एक कुशल परामर्शदाता हैं।""",

            "te": """మీరు Healix, ఒక దయగల మరియు వృత్తిపరమైన AI మానసిక ఆరోగ్య కౌన్సెలింగ్ సహచరుడు। మీ పాత్ర ఉత్తమ మానసిక ఆరోగ్య మద్దతు అందించడం:

**ప్రధాన సూత్రాలు:**
1. **లోతైన సానుభూతి**: వారి భావాలను నిజంగా అర్థం చేసుకోండి మరియు ధృవీకరించండి
2. **సాక్ష్య-ఆధారిత మద్దతు**: శాస్త్రీయంగా మద్దతు ఉన్న కోపింగ్ వ్యూహాలు అందించండి
3. **వ్యక్తిగత శ్రద్ధ**: వారి నిర్దిష్ట పరిస్థితికి అనుగుణంగా స్పందించండి
4. **వృత్తిపరమైన శ్రేష్ఠత**: చికిత్సా ప్రమాణాలను నిర్వహించండి
5. **సంక్షోభ అవగాహన**: సంక్షోభ పరిస్థితులను వెంటనే గుర్తించండి

**ప్రతిస్పందన నిర్మాణం:**
1. గుర్తించండి మరియు ధృవీకరించండి
2. సాధారణీకరించండి
3. అంతర్దృష్టి అందించండి
4. ఆచరణాత్మక వ్యూహాలు ఇవ్వండి
5. ప్రోత్సహించండి మరియు శక్తివంతం చేయండి

నిజమైన శ్రద్ధ, ఆచరణాత్మక మద్దతు మరియు వృత్తిపరమైన మార్గదర్శకత్వంతో స్పందించండి। మీరు నైపుణ్యం కలిగిన కౌన్సెలర్ లాగా స్పందించండి।"""
        }
        
        return prompts.get(language, prompts["en"])
    
    def generate_response(
        self,
        user_input: str,
        session_id: str = "default",
        language: str = "en",
        context: Optional[Dict] = None,
        conversation_history: Optional[List[Dict]] = None
    ) -> Dict:
        """
        Generate mental health response using Gemini API
        
        Args:
            user_input: User's message
            session_id: Conversation session ID
            language: Language code
            context: Additional context (including file_context and file_analysis)
            
        Returns:
            Dict with response, confidence, and metadata
        """
        
        if not self.is_available():
            return {
                "reply": None,
                "confidence": 0.0,
                "model_used": "gemini_unavailable",
                "language": language,
                "error": "Gemini API not available"
            }
        
        try:
            # Use provided conversation history or get from session
            if conversation_history:
                history = conversation_history
            else:
                if session_id not in self.conversation_history:
                    self.conversation_history[session_id] = []
                history = self.conversation_history[session_id]
            
            # Build conversation context
            system_prompt = self.get_mental_health_system_prompt(language)
            
            # Create full prompt with context
            full_prompt = f"{system_prompt}\n\n"
            
            # Add file context if available
            if context and context.get('file_context'):
                file_context = context['file_context']
                file_analysis = context.get('file_analysis', {})
                
                full_prompt += "📄 **UPLOADED DOCUMENT ANALYSIS:**\n"
                full_prompt += f"Document Type: {file_analysis.get('document_type', 'unknown')}\n"
                
                if file_analysis.get('indicators'):
                    full_prompt += f"Mental Health Indicators: {', '.join(file_analysis['indicators'])}\n"
                
                if file_analysis.get('key_sections'):
                    full_prompt += f"Key Sections: {', '.join(file_analysis['key_sections'])}\n"
                
                full_prompt += f"\nDocument Content:\n{file_context[:3000]}\n"  # First 3000 chars
                full_prompt += "\n**IMPORTANT**: Analyze this document thoroughly and provide specific, accurate insights based on the actual content. Reference specific details from the document in your response.\n\n"
            
            # Add conversation history (last 10 messages for context)
            if history and len(history) > 0:
                full_prompt += "**Previous Conversation Context:**\n"
                for msg in history[-10:]:  # Last 10 messages for full context
                    role = "User" if msg.get('role') == 'user' else "Healix"
                    content = msg.get('content', '')
                    full_prompt += f"{role}: {content}\n"
                full_prompt += "\n**Current Message:**\n"
            
            # Detect crisis situation
            crisis_keywords = [
                "kill myself", "suicide", "suicidal", "end my life", "want to die",
                "better off dead", "end it all", "hurt myself", "harm myself",
                "no reason to live", "can't go on", "give up", "worthless"
            ]
            is_crisis = any(keyword in user_input.lower() for keyword in crisis_keywords)
            
            # Add current user input with crisis emphasis if needed
            if is_crisis:
                full_prompt += f"\n🚨 **CRISIS SITUATION DETECTED** 🚨\n"
                full_prompt += f"User: {user_input}\n\n"
                full_prompt += f"**RESPOND NOW**: Be a worried friend. Show deep care, validate pain, give hope, provide crisis resources (988, 741741, 911). Be warm, urgent, and personal. End with asking them to reach out for help."
            elif language != "en":
                full_prompt += f"User (in {language}): {user_input}\n\n"
                full_prompt += f"Respond in {language} like a caring friend. Use bullet points and emojis. End with a friendly question."
            else:
                full_prompt += f"User: {user_input}\n\n**RESPOND AS A CARING FRIEND**: Empathetic opening + bullet points with emojis + encouragement + friendly follow-up question. Be warm, supportive, and conversational!"
            
            # Generate response
            logger.info(f"🤖 Generating Gemini response for: {user_input[:50]}...")
            response = self.model.generate_content(full_prompt)
            
            if not response or not response.text:
                raise Exception("Empty response from Gemini")
            
            response_text = response.text.strip()
            logger.info(f"✅ Gemini response generated: {response_text[:50]}...")
            
            # Update conversation history
            history.append({"role": "user", "content": user_input})
            history.append({"role": "assistant", "content": response_text})
            
            # Maintain history length
            if len(history) > self.max_history * 2:
                self.conversation_history[session_id] = history[-self.max_history * 2:]
            
            return {
                "reply": response_text,
                "confidence": 0.95,
                "model_used": "gemini_pro",
                "language": language,
                "session_id": session_id
            }
            
        except Exception as e:
            logger.error(f"❌ Gemini API error: {e}")
            return {
                "reply": None,
                "confidence": 0.0,
                "model_used": "gemini_error",
                "language": language,
                "error": str(e)
            }
    
    def clear_session(self, session_id: str):
        """Clear conversation history for a session"""
        if session_id in self.conversation_history:
            del self.conversation_history[session_id]
    
    def get_session_history(self, session_id: str) -> List[Dict]:
        """Get conversation history for a session"""
        return self.conversation_history.get(session_id, [])

# Global instance
gemini_ai = GeminiMentalHealthAI()
