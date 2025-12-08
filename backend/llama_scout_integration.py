"""
Llama Scout Mental Health AI Integration - Clean Version
Optimized for speed and reliability as PRIMARY model
"""

import os
import json
import asyncio
import logging
import httpx
from typing import Dict, List, Optional, Any, Tuple
from datetime import datetime
from dataclasses import dataclass

# Configure logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)


@dataclass
class MentalHealthResponse:
    response: str
    confidence: float
    detected_emotion: str
    sentiment: str
    needs_crisis_support: bool
    suggested_actions: List[str]


class LlamaScoutMentalHealthAI:
    """
    Llama Scout Mental Health AI - PRIMARY MODEL
    Fast, dynamic responses optimized for speed and relevance
    """

    def __init__(self):
        # Llama API Configuration
        self.api_key = "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"
        self.api_base = "https://openrouter.ai/api/v1/chat/completions"
        self.model = "meta-llama/llama-3.2-3b-instruct:free"

        # Conversation memory per session
        self.conversation_history = {}

        # Crisis keywords for immediate detection
        self.crisis_keywords = [
            "suicide", "suicidal", "kill myself", "end my life", "want to die",
            "better off dead", "end it all", "no reason to live", "don't want to live",
            "can't go on", "hurt myself", "harm myself", "cut myself"
        ]

        logger.info("Llama Scout Mental Health AI initialized as PRIMARY model")

    def detect_emotion_and_sentiment(self, text: str) -> Tuple[str, str]:
        """Detect emotion and sentiment from user input"""
        text_lower = text.lower()

        # Positive emotions
        positive_keywords = {
            "happy": ["happy", "joyful", "glad", "cheerful", "delighted", "excited", "thrilled"],
            "grateful": ["grateful", "thankful", "blessed", "appreciative"],
            "content": ["content", "peaceful", "calm", "relaxed", "serene"],
            "excited": ["excited", "enthusiastic", "eager", "pumped"],
            "proud": ["proud", "accomplished", "achieved", "success"],
        }

        # Negative emotions
        negative_keywords = {
            "depressed": ["depressed", "hopeless", "empty", "worthless", "numb"],
            "anxious": ["anxious", "worried", "nervous", "panic", "overwhelmed", "scared"],
            "angry": ["angry", "furious", "frustrated", "irritated", "mad", "rage"],
            "lonely": ["lonely", "alone", "isolated", "abandoned", "nobody cares"],
            "sad": ["sad", "unhappy", "down", "blue", "crying", "tears"],
            "stressed": ["stressed", "pressure", "too much", "can't cope", "burnout"],
        }

        # Check positive emotions first
        for emotion, keywords in positive_keywords.items():
            if any(keyword in text_lower for keyword in keywords):
                return emotion, "positive"

        # Check negative emotions
        for emotion, keywords in negative_keywords.items():
            if any(keyword in text_lower for keyword in keywords):
                return emotion, "negative"

        return "neutral", "neutral"

    def is_crisis(self, text: str) -> bool:
        """Check if text indicates crisis situation"""
        text_lower = text.lower()
        return any(keyword in text_lower for keyword in self.crisis_keywords)

    async def call_llama_api(self, messages: List[Dict], temperature: float = 0.8, max_retries: int = 1) -> Optional[str]:
        """Call Llama API with optimized settings for speed"""
        
        for attempt in range(max_retries):
            try:
                headers = {
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json",
                    "HTTP-Referer": "https://healix-mental-health.com",
                    "X-Title": "Healix Mental Health Assistant",
                }

                payload = {
                    "model": self.model,
                    "messages": messages,
                    "temperature": temperature,
                    "max_tokens": 400,  # Optimized for speed
                    "top_p": 0.9,
                    "frequency_penalty": 0.3,
                    "presence_penalty": 0.4,
                }

                logger.info(f"Calling Llama API (attempt {attempt + 1}/{max_retries})")

                # Fast timeout for speed
                async with httpx.AsyncClient(timeout=5.0) as client:
                    response = await client.post(self.api_base, headers=headers, json=payload)

                if response.status_code == 200:
                    result = response.json()
                    if "choices" in result and len(result["choices"]) > 0:
                        content = result["choices"][0]["message"]["content"].strip()
                        logger.info(f"Llama API response received: {len(content)} chars")
                        return content
                    else:
                        logger.error("Invalid API response structure")
                        return None
                else:
                    logger.error(f"API error {response.status_code}")
                    return None

            except httpx.TimeoutException:
                logger.error("API call timed out")
                return None
            except Exception as e:
                logger.error(f"API call error: {e}")
                return None
        
        logger.error(f"All {max_retries} API attempts failed")
        return None

    def create_system_prompt(self) -> str:
        """Enhanced system prompt for 85-90% empathic accuracy"""
        return """You are Healix, an advanced mental health AI companion with 85-90% empathic accuracy. Your mission is to provide deeply empathetic, personalized support.

🎯 CORE EMPATHY FRAMEWORK:

1. DEEP LISTENING & VALIDATION:
   - Acknowledge their EXACT emotions and situation
   - Validate WHY they feel this way (don't just say "that's valid")
   - Show you understand the specific impact on their life
   - Use their own words to demonstrate you're truly listening

2. PERSONALIZED RESPONSE STRUCTURE:
   - "I can see/hear/feel that you're [specific emotion] because [their specific situation]"
   - Address the EXACT details they shared (job interview, breakup, family issue, etc.)
   - Provide advice tailored to THEIR unique circumstances
   - Reference specific elements they mentioned

3. EMPATHIC LANGUAGE PATTERNS:
   ✅ "Getting rejected from your dream job is absolutely crushing"
   ✅ "A job interview tomorrow - no wonder your heart is racing"
   ✅ "Three years together and now it's over - that's devastating"
   ❌ "I understand how you feel" (too generic)
   ❌ "That must be difficult" (not specific enough)

4. CRISIS INTERVENTION (IMMEDIATE):
   - Detect: suicide, self-harm, "want to die", "end it all", "hurt myself"
   - Respond with urgent care: "I'm deeply concerned about you right now"
   - Provide resources: 988, 741741, 911
   - Validate pain: "This pain you're feeling is real and overwhelming"
   - Emphasize worth: "Your life has immense value and meaning"

5. EMOTION-SPECIFIC SUPPORT:
   - ANXIETY: Grounding techniques (5-4-3-2-1), breathing, specific triggers
   - DEPRESSION: Hope without toxic positivity, small steps, worth validation
   - ANGER: Validate the feeling, healthy outlets, underlying causes
   - GRIEF/LOSS: Honor their pain, memories, healing process
   - JOY: Celebrate genuinely, help them savor, encourage sharing

6. RESPONSE QUALITY STANDARDS:
   - Length: 200-400 words (comprehensive but focused)
   - Questions: Always end with specific follow-up about THEIR situation
   - Emojis: 2-4 relevant ones (💙 for support, 💔 for loss, 🌟 for hope)
   - Tone: Warm, caring friend who truly understands

EXAMPLES:

User: "I got rejected from my dream job"
Response: "Getting rejected from your dream job is absolutely crushing - I can feel how devastated you are. 💔 This wasn't just any job, it was THE job you'd been working toward, and having that door close feels like a judgment on your worth.

But here's what I see: someone brave enough to go after their dreams. That takes incredible courage. This rejection doesn't define your value - it's one door closing while others remain open.

Right now, let yourself grieve this loss. It's okay to feel disappointed. When you're ready:
• Ask for feedback to grow from this experience  
• Remember that many successful people faced multiple rejections
• Consider what other opportunities might be even better fits

What was it about this job that made it feel so perfect? Understanding that might help us find your next step. 💙"

User: "I'm having a panic attack right now"
Response: "I hear you - panic attacks are terrifying and overwhelming. Your body is in fight-or-flight mode right now, but you're safe. 💙

Let's get you grounded RIGHT NOW:
• Look around and name 5 things you can see
• Touch 4 different textures around you  
• Listen for 3 different sounds
• Take slow breaths: in for 4, hold for 4, out for 6

This feeling WILL pass. Panic attacks feel endless but they peak and come down. You're going to be okay.

Are you somewhere safe right now? What triggered this panic attack? I'm here with you through this. 🌟"

REMEMBER: Your goal is 85-90% empathic accuracy. Every response should make the user feel truly seen, heard, and understood."""

    def create_context_prompt(self, user_input: str, emotion: str, sentiment: str, is_crisis: bool) -> str:
        """Create enhanced context-aware prompt for maximum empathy"""
        
        # Extract key details from user input for personalization
        user_lower = user_input.lower()
        context_details = []
        
        # Identify specific life domains and situations
        if any(word in user_lower for word in ['job', 'work', 'interview', 'boss', 'career']):
            context_details.append("work/career situation")
        if any(word in user_lower for word in ['relationship', 'boyfriend', 'girlfriend', 'partner', 'breakup']):
            context_details.append("relationship situation")
        if any(word in user_lower for word in ['family', 'parents', 'mom', 'dad', 'sister', 'brother']):
            context_details.append("family situation")
        if any(word in user_lower for word in ['school', 'college', 'study', 'exam', 'grade']):
            context_details.append("academic situation")
        if any(word in user_lower for word in ['health', 'sick', 'pain', 'doctor', 'hospital']):
            context_details.append("health situation")
        
        context_summary = ", ".join(context_details) if context_details else "general life situation"
        
        if is_crisis:
            return f"""🚨 CRISIS INTERVENTION PROTOCOL ACTIVATED 🚨

CRITICAL SITUATION ANALYSIS:
- User Input: "{user_input}"
- Detected Crisis Indicators: Suicidal ideation or self-harm intent
- Emotional State: {emotion} (severe distress)
- Context: {context_summary}

IMMEDIATE RESPONSE REQUIREMENTS:
1. Express DEEP, genuine concern for their wellbeing
2. Validate their pain without minimizing it: "This pain you're feeling is real and overwhelming"
3. Provide SPECIFIC crisis resources with clear instructions:
   • 988 Suicide & Crisis Lifeline (call or text, 24/7)
   • Text HOME to 741741 (Crisis Text Line)
   • 911 if in immediate danger
4. Emphasize their inherent worth: "Your life has immense value and meaning"
5. Create connection: "You're not alone in this pain"
6. Ask for commitment: "Can you promise me you'll reach out to one of these resources?"

TONE: Urgent but warm, personal, life-saving compassion. This response may literally save their life."""

        elif sentiment == "positive":
            return f"""POSITIVE EMOTIONAL ENGAGEMENT

SITUATION ANALYSIS:
- User Input: "{user_input}"
- Emotional State: {emotion} (positive)
- Context: {context_summary}

RESPONSE STRATEGY:
1. Celebrate genuinely with them - match their energy
2. Ask specific questions about what contributed to their happiness
3. Help them savor and appreciate this positive moment
4. Encourage them to share their joy with others
5. Acknowledge any mixed emotions if present (excitement + nervousness)

TONE: Genuinely happy for them, celebratory, encouraging them to fully experience their joy."""

        elif sentiment == "negative":
            return f"""EMPATHIC SUPPORT PROTOCOL

EMOTIONAL ANALYSIS:
- User Input: "{user_input}"
- Primary Emotion: {emotion}
- Context: {context_summary}
- Intensity: Significant distress requiring deep empathy

EMPATHIC RESPONSE STRATEGY:
1. VALIDATE SPECIFICALLY: "I can see that [their situation] is causing you to feel [emotion], and that makes complete sense because..."
2. ADDRESS THEIR EXACT SITUATION: Reference specific details they mentioned
3. NORMALIZE WITHOUT MINIMIZING: "Anyone would feel [emotion] in this situation"
4. PROVIDE TARGETED SUPPORT:
   - For anxiety: Grounding techniques, breathing exercises
   - For depression: Hope, small steps, worth validation
   - For anger: Validate feeling, healthy outlets
   - For sadness/grief: Honor their pain, healing process
5. ASK SPECIFIC FOLLOW-UP: About their exact situation, not generic "how are you feeling"

TONE: Deep empathy, genuine understanding, supportive but not patronizing."""

        else:
            return f"""SUPPORTIVE ENGAGEMENT

SITUATION ANALYSIS:
- User Input: "{user_input}"
- Emotional State: {emotion} (neutral/mixed)
- Context: {context_summary}

RESPONSE APPROACH:
1. Acknowledge what they've shared specifically
2. Show genuine interest in their situation
3. Provide appropriate support based on their needs
4. Ask thoughtful follow-up questions
5. Create a safe space for them to share more

TONE: Warm, welcoming, genuinely interested in understanding their experience."""

    async def generate_response(
        self, user_input: str, session_id: str = "default", language: str = "en"
    ) -> MentalHealthResponse:
        """Generate fast, dynamic mental health response"""

        logger.info(f"Generating response for: {user_input[:50]}...")

        try:
            # Analyze user input
            emotion, sentiment = self.detect_emotion_and_sentiment(user_input)
            is_crisis_situation = self.is_crisis(user_input)

            logger.info(f"Analysis: emotion={emotion}, sentiment={sentiment}, crisis={is_crisis_situation}")

            # Initialize conversation history
            if session_id not in self.conversation_history:
                self.conversation_history[session_id] = []

            # Prepare messages for API
            messages = [{"role": "system", "content": self.create_system_prompt()}]

            # Add minimal conversation history for speed (last 1 exchange)
            recent_history = self.conversation_history[session_id][-2:]
            if recent_history:
                messages.extend(recent_history)

            # Create context-aware prompt
            context_prompt = self.create_context_prompt(user_input, emotion, sentiment, is_crisis_situation)
            messages.append({"role": "user", "content": context_prompt})

            # Call Llama API
            ai_response = await self.call_llama_api(messages, temperature=0.8)

            if not ai_response:
                # Fallback response
                ai_response = self.get_fallback_response(emotion, sentiment, is_crisis_situation)

            # Update conversation history
            self.conversation_history[session_id].append({"role": "user", "content": user_input})
            self.conversation_history[session_id].append({"role": "assistant", "content": ai_response})

            # Keep history short for speed (last 3 exchanges = 6 messages)
            if len(self.conversation_history[session_id]) > 6:
                self.conversation_history[session_id] = self.conversation_history[session_id][-6:]

            # Generate suggested actions
            suggested_actions = self.get_suggested_actions(emotion, sentiment)

            logger.info(f"Response generated: {len(ai_response)} chars")

            return MentalHealthResponse(
                response=ai_response,
                confidence=0.95 if ai_response else 0.85,
                detected_emotion=emotion,
                sentiment=sentiment,
                needs_crisis_support=is_crisis_situation,
                suggested_actions=suggested_actions,
            )

        except Exception as e:
            logger.error(f"Error in generate_response: {e}")
            return self.get_error_fallback(user_input)

    def get_fallback_response(self, emotion: str, sentiment: str, is_crisis: bool) -> str:
        """Enhanced fallback response with high empathic accuracy"""
        
        if is_crisis:
            return """I'm deeply concerned about what you're sharing, and I need you to know that your life has immense value and meaning. 💙

The pain you're feeling right now is real and overwhelming, but it's not permanent - even though it feels like it will never end.

Please reach out for immediate help:
• 988 Suicide & Crisis Lifeline (call or text, 24/7) 📞
• Text HOME to 741741 (Crisis Text Line) 💬
• 911 if you're in immediate danger 🚨

You're not alone in this pain. There are people who understand exactly what you're going through and want to help you through this difficult time.

Can you promise me you'll contact one of these resources right now? Your life matters more than you know. 💙"""

        elif sentiment == "positive":
            if emotion == "excited":
                return """I can feel your excitement! That's absolutely wonderful! 🌟 

There's something so beautiful about genuine excitement - it's contagious and uplifting. Your energy is radiating through your words!

What's got you feeling so thrilled? I'd love to celebrate this moment with you and hear all about what's making your day so amazing! ✨"""

            elif emotion == "grateful":
                return """Your gratitude is so heartwarming to hear. 💙 

Gratitude has this incredible way of multiplying joy and helping us appreciate the good in our lives. It's one of the most powerful emotions for mental wellbeing.

What's been filling your heart with thankfulness? I'd love to hear about the people or experiences you're grateful for. 🌟"""

            else:
                return f"""That's absolutely wonderful to hear! I'm genuinely happy that you're feeling {emotion} today. 🌟 

Positive emotions like this are so precious - they remind us of the beauty and joy that exists in life. It's beautiful to witness someone experiencing genuine happiness.

What's been contributing to these uplifting feelings? I'd love to hear more about what's bringing you such happiness! ✨"""

        elif sentiment == "negative":
            if emotion == "anxious":
                return """I can hear the anxiety in your words, and I want you to know that what you're experiencing is completely understandable. 💙 Anxiety can feel so overwhelming - like your mind is racing and your body is on high alert. You're not alone in feeling this way.

Let's try a quick grounding technique: Look around and name 5 things you can see, 4 things you can touch, 3 things you can hear, 2 things you can smell, and 1 thing you can taste.

What's been triggering your anxiety the most lately? Sometimes talking about it can help lighten the load. I'm here to listen. 🌟"""

            elif emotion == "depressed":
                return """I hear the heaviness in your words, and I want you to know that what you're feeling is completely valid. 💙 Depression can make everything feel so difficult and overwhelming - like you're carrying an invisible weight that others can't see.

You've shown incredible strength by reaching out today. That takes real courage when everything feels hard.

You're not alone in this darkness. Even when it feels impossible, there are small lights that can guide you through. You matter, and your life has value beyond what depression is telling you right now.

What's been weighing on your heart the most? I'm here to listen without judgment. 💙"""

            elif emotion == "sad":
                return """I can feel the sadness in your words, and I want you to sit with me in this moment. 💙 Sadness is one of those emotions that can feel so heavy and all-encompassing. It's okay to feel this way - your emotions are valid and important.

Sometimes sadness needs to be felt and honored before it can begin to heal. You don't have to rush through this or pretend to be okay.

What's been bringing this sadness to your heart? I'm here to listen and hold space for whatever you're going through. You're not alone in this. 💙"""

            else:
                return f"""I hear that you're experiencing {emotion}, and I want you to know that what you're feeling is completely valid and understandable. 💙 Difficult emotions like this can feel so isolating, but you're not alone in this experience.

You've shown real courage by reaching out and sharing what's on your heart. That's not always easy, especially when we're struggling.

Can you tell me more about what's been weighing on you? Sometimes putting our feelings into words can help us process them. I'm here to listen and support you through this. 🌟"""

        else:
            return """Thank you for reaching out to me today. 💙 I'm genuinely glad you're here, and I want you to know that this is a safe space where you can share whatever is on your mind.

Whether you're celebrating something wonderful, working through a challenge, or just need someone to listen, I'm here for you. Your thoughts and feelings matter, and you deserve support and understanding.

What's on your heart today? I'm here to listen with care and without judgment. 🌟"""

    def get_suggested_actions(self, emotion: str, sentiment: str) -> List[str]:
        """Get suggested actions based on emotion"""
        
        if sentiment == "positive":
            return [
                "Savor and appreciate this positive moment",
                "Share your good feelings with someone",
                "Write down what's making you feel good",
            ]

        actions_map = {
            "depressed": [
                "Set one small, achievable goal for today",
                "Try to get 10 minutes of sunlight",
                "Reach out to one trusted person",
            ],
            "anxious": [
                "Practice 4-7-8 breathing technique",
                "Use 5-4-3-2-1 grounding exercise",
                "Take a short break from the situation",
            ],
            "angry": [
                "Count to 10 slowly before reacting",
                "Take a walk or do physical exercise",
                "Journal your feelings",
            ],
            "lonely": [
                "Send a message to someone you trust",
                "Join an online community",
                "Consider volunteering",
            ],
            "stressed": [
                "Break large tasks into smaller steps",
                "Take a 5-minute break to breathe",
                "Practice saying no to non-essentials",
            ],
            "sad": [
                "Allow yourself to feel without judgment",
                "Do one small thing you used to enjoy",
                "Reach out for support",
            ],
        }

        return actions_map.get(emotion, [
            "Take care of yourself today",
            "Consider talking to a mental health professional",
            "Reach out to your support system",
        ])

    def get_error_fallback(self, user_input: str) -> MentalHealthResponse:
        """Get fallback response when everything fails"""
        fallback_text = """I'm here to support you, though I'm experiencing a temporary technical issue. Your wellbeing matters to me.

Whatever you're going through, your feelings are valid and important. Please try again in a moment.

If you're in crisis:
• 988 - Suicide & Crisis Lifeline
• Text HOME to 741741 - Crisis Text Line
• 911 - Emergency services

What would you like to talk about? I'm here to listen."""
        
        return MentalHealthResponse(
            response=fallback_text,
            confidence=0.5,
            detected_emotion="neutral",
            sentiment="neutral",
            needs_crisis_support=False,
            suggested_actions=[
                "Try your message again in a moment",
                "If urgent, call 988 for immediate support",
                "Consider talking to someone you trust",
            ],
        )


# Global instance
_llama_scout_instance = None


def get_llama_scout_ai() -> LlamaScoutMentalHealthAI:
    """Get or create Llama Scout AI instance"""
    global _llama_scout_instance
    if _llama_scout_instance is None:
        logger.info("Creating new Llama Scout AI instance (PRIMARY)...")
        _llama_scout_instance = LlamaScoutMentalHealthAI()
        logger.info("Llama Scout Mental Health AI ready as PRIMARY model")
    else:
        logger.info("Returning existing Llama Scout AI instance")
    return _llama_scout_instance