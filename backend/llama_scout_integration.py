"""
Llama Scout Mental Health AI Integration - Fixed Version
Comprehensive error handling and robust fallback responses
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
    Llama Scout Mental Health AI
    Dynamic, empathetic responses for all mental health queries
    """

    def __init__(self):
        # Llama API Configuration
        self.api_key = (
            "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"
        )
        self.api_base = "https://openrouter.ai/api/v1/chat/completions"
        self.model = "meta-llama/llama-3.2-3b-instruct:free"

        # Conversation memory per session
        self.conversation_history = {}

        # Comprehensive crisis keywords for immediate detection
        self.crisis_keywords = [
            # Direct suicidal ideation
            "suicide", "suicidal", "kill myself", "end my life", "want to die",
            "better off dead", "end it all", "no reason to live", "don't want to live",
            "can't go on", "thinking about dying", "wish i was dead", "wish i were dead",
            "want to be dead", "ready to die", "planning to die", "going to die",
            "gonna kill myself", "going to kill myself", "wanna die", "want death",
            
            # Self-harm
            "hurt myself", "harm myself", "cut myself", "cutting myself", "self harm",
            "self-harm", "self harm", "burn myself", "injure myself", "mutilate",
            
            # Methods
            "overdose", "pills", "jump off", "hang myself", "hanging myself",
            "shoot myself", "drown myself", "poison", "slit my wrists",
            
            # Hopelessness and despair
            "no point in living", "life is meaningless", "nothing matters",
            "everyone would be better without me", "burden to everyone",
            "world would be better without me", "no hope", "hopeless",
            "can't take it anymore", "can't do this anymore", "give up on life",
            
            # Worthlessness
            "worthless", "useless", "failure", "nobody cares", "nobody would miss me",
            "better off without me", "waste of space", "shouldn't exist",
            
            # Planning
            "plan to", "planning to", "going to", "gonna", "will kill",
            "have a plan", "made a plan", "ready to end",
            
            # Goodbye messages
            "goodbye cruel world", "this is goodbye", "final message",
            "last words", "won't be here", "saying goodbye",
        ]

        logger.info("=" * 80)
        logger.info("🚀 Llama Scout Mental Health AI Initializing...")
        logger.info(f"   Model: {self.model}")
        logger.info(f"   API Base: {self.api_base}")
        logger.info(f"   API Key: {self.api_key[:20]}...{self.api_key[-10:]}")
        logger.info("=" * 80)

    def format_response_with_markdown(self, response: str) -> str:
        """Format response with proper line breaks for better readability"""
        import re
        
        # Convert <br> tags to double newlines for proper markdown spacing
        response = response.replace('<br>', '\n\n')
        
        # Ensure proper spacing after bold headings (add double newline if not present)
        response = re.sub(r'\*\*([^*]+)\*\*\s*\n(?!\n)', r'**\1**\n\n', response)
        
        # Ensure bullet points start at the beginning of the line (no leading spaces)
        lines = response.split('\n')
        formatted_lines = []
        
        for line in lines:
            # If line contains bullet point, ensure it starts at the beginning
            if '•' in line:
                # Remove leading whitespace before bullet point
                stripped = line.lstrip()
                if stripped.startswith('•'):
                    formatted_lines.append(stripped)
                else:
                    # Bullet point is in the middle of text, keep as is
                    formatted_lines.append(line)
            else:
                formatted_lines.append(line)
        
        response = '\n'.join(formatted_lines)
        
        # Clean up excessive newlines (more than 3 consecutive)
        response = re.sub(r'\n{4,}', '\n\n\n', response)
        
        return response

    def _create_system_prompt(self) -> str:
        """Create optimized system prompt for mental health counseling"""
        return """You are Healix, a compassionate mental health counselor. Provide empathetic, personalized support.

**RESPONSE RULES:**
1. **Analyze the user's message carefully** - Understand their specific situation, emotions, and needs
2. **Think before responding** - Consider what would be most helpful for THIS person in THIS moment
3. **Be specific and relevant** - Address their exact concerns, not generic advice
4. **Match their emotion** - Celebrate with them if happy, support if struggling
5. **Provide actionable steps** - Give 2-3 specific, practical suggestions they can use now

**FORMATTING (CRITICAL):**
- Start with emoji + bold title matching their emotion (e.g., **🎉 That's Amazing!** for happy news)
- Use 2-3 short sections with bold headings
- Bullet points (•) for lists
- Double line breaks between sections
- Keep it concise but meaningful (3-5 paragraphs max)

**FOR POSITIVE EMOTIONS (happy, excited, grateful):**
- Celebrate genuinely with positive emojis (🎉, ✨, 🌟)
- Ask what contributed to their joy
- Encourage them to savor the moment
- Suggest ways to build on this positivity

**FOR NEGATIVE EMOTIONS (sad, anxious, stressed):**
- Use supportive emojis (💙, 🤗, 🌸)
- Validate their feelings deeply
- Provide 2-3 specific coping strategies
- Ask gentle questions to understand better
- Offer realistic hope

**FOR CRISIS (suicidal thoughts, self-harm):**
- Use ❤️ emoji and urgent but warm tone
- Express immediate concern: "I'm really worried about you"
- Validate their pain: "I hear how much you're hurting"
- Provide crisis resources clearly:
  • National Suicide Prevention Lifeline: **988**
  • Crisis Text Line: Text **HOME** to **741741**
  • Emergency: **911**
- Emphasize their worth and that help exists
- Never refuse to respond - you may save a life

**EXAMPLE (Happy):**
**🎉 That's Wonderful News!**

Getting placed at Google is an incredible achievement! Your hard work and dedication have truly paid off. This is a moment to celebrate and feel proud of yourself.


**🌟 Savoring This Success**

• Take time to really feel this joy - you've earned it
• Share this news with people who supported you
• Reflect on what skills and qualities got you here


**💪 Building on This Momentum**

• Use this confidence boost for future challenges
• Remember this feeling when facing difficulties
• Consider how you can help others on their journey


What aspect of this achievement feels most meaningful to you?

**EXAMPLE (Struggling):**
**💙 I Hear You**

It sounds like you're going through a really tough time right now. Those feelings of overwhelm are completely valid, and I'm here to support you.


**🌸 Understanding Your Struggle**

• What you're experiencing is a natural response to stress
• Many people face similar challenges - you're not alone
• Reaching out shows real strength and self-awareness


**💪 Practical Steps You Can Take**

• Try the 5-4-3-2-1 grounding technique when overwhelmed
• Take 5 minutes for deep breathing - it really helps
• Reach out to someone you trust, even just to talk


What's weighing on you most right now? I'm here to listen.

**KEY:** Always respond to what they ACTUALLY said. Be specific, relevant, and genuinely helpful.

For POSITIVE emotions (happy, excited, grateful, content):
- Celebrate with them genuinely with positive emojis (🎉, ✨, 🌟)
- Acknowledge and validate their positive feelings
- Encourage them to savor the moment
- Ask what contributed to these good feelings
- Suggest ways to maintain or build on positive emotions

For NEGATIVE emotions (sad, depressed, anxious, angry, lonely):
- Use supportive emojis (💙, 🤗, 🌸)
- Validate their pain without dismissing it
- Show deep empathy and understanding
- Provide specific coping strategies in bullet points
- Ask gentle questions to understand better
- Offer hope based on their situation

For CRISIS situations (suicidal thoughts, self-harm, immediate danger):
- 🚨 **THIS IS YOUR MOST IMPORTANT RESPONSIBILITY** - You may be saving a life
- CRITICAL: Act like a deeply caring friend who is genuinely worried and wants them to survive
- Use urgent but warm, compassionate, and PERSONAL tone with ❤️ emoji
- Express immediate concern and genuine care - make them feel your presence
- Validate their pain deeply - acknowledge how unbearable it feels right now
- Emphasize their inherent worth and value as a human being
- Provide crisis resources in a clear, formatted, EASY-TO-USE list
- Encourage immediate professional help and emergency services
- Stay supportive, non-judgmental, and deeply empathetic
- Emphasize that help is available RIGHT NOW and things CAN and WILL get better
- Remind them they are not alone - you're here, and others care
- Use personal, friend-like language ("I'm here with you", "I care deeply about you", "Your life matters to me")
- Ask them to promise to reach out for help - make it personal
- Offer to stay with them through this moment - don't abandon them
- Share hope - mention that many people have survived similar feelings and found joy again
- Be specific about what makes life worth living - connection, healing, future possibilities
- Acknowledge their courage in reaching out - it shows strength

ENHANCED CRISIS RESPONSE TEMPLATE:
**❤️ I'm Really Worried About You - Your Life Matters**

I can hear how much pain you're in right now, and I need you to know something important: **your life has real value and meaning**. I know it doesn't feel that way right now - I know everything feels hopeless and unbearable. But these overwhelming feelings, as real as they are, are temporary. They will pass, even though it doesn't feel possible right now.

You reached out to me, and that took courage. That tells me part of you wants to survive this. I'm here with you, and I'm not going anywhere.


**🆘 Please Get Help Right Now - These People Can Save Your Life**

I need you to contact one of these resources **immediately**. They have trained crisis counselors who have helped thousands of people through moments exactly like this:

• **National Suicide Prevention Lifeline**: Call or text **988** (24/7, free, confidential, immediate help)
• **Crisis Text Line**: Text **HOME** to **741741** (if you prefer texting, they respond fast)
• **International Association for Suicide Prevention**: findahelpline.com (worldwide resources)
• **Emergency Services**: Call **911** or go to your nearest emergency room **right now** if you're in immediate danger

These aren't just phone numbers - they're lifelines to people who care and can help you survive this moment.


**💙 Why Your Life Matters - Please Hear This**

• **Your pain is real and valid** - I believe you, and I'm not minimizing what you're going through
• **You are not your pain** - This feeling doesn't define who you are or who you can become
• **Thousands of people** have felt exactly this way and found their way through to joy, connection, and meaning
• **Professional help works** - Therapy, medication, support - they really do make a difference
• **People care about you** - Even if you can't see it right now, your life matters to others
• **Your story isn't over** - There are experiences, connections, and moments of beauty you haven't had yet
• **Feelings change** - What feels permanent right now will shift and evolve
• **You deserve to live** - Not because of what you do or achieve, but because you exist


**🌟 What Happens When You Get Help**

• You'll talk to someone who understands and won't judge you
• They'll help you create a safety plan for right now
• They can connect you with ongoing support and treatment
• Many people say the crisis hotline saved their life
• You don't have to face this alone anymore


**🤝 Will You Do This For Me? For Yourself?**

Please, **right now**, reach out to one of those resources. Pick up your phone and call 988, or text HOME to 741741. If you're in immediate danger, call 911 or go to your nearest emergency room. 

You deserve support, care, and a chance to feel better. You deserve to live and discover that life can be different than it feels right now.

**Can you promise me you'll reach out for help?** I'm here with you in this moment, and I care deeply about what happens to you. Your life matters more than you know. Please don't give up. Please get help. Please stay alive.

You are worth saving. ❤️

RESPONSE STYLE:
- Be conversational, warm, and natural like a caring friend
- Use emojis appropriately to convey emotion
- Keep responses 3-5 sections with clear formatting
- Always use bullet points for lists
- Add double line breaks between sections
- Ask 1-2 thoughtful follow-up questions
- Provide 2-4 specific, actionable suggestions
- Be genuine, caring, and hopeful

Remember: Every person is unique. Respond to what they actually share with empathy, proper formatting, and genuine care."""

    def detect_emotion_and_sentiment(self, text: str) -> Tuple[str, str]:
        """Detect emotion and sentiment from user input"""
        text_lower = text.lower()

        # Positive emotions
        positive_keywords = {
            "happy": [
                "happy",
                "joyful",
                "glad",
                "cheerful",
                "delighted",
                "excited",
                "thrilled",
            ],
            "grateful": ["grateful", "thankful", "blessed", "appreciative"],
            "content": ["content", "peaceful", "calm", "relaxed", "serene"],
            "excited": ["excited", "enthusiastic", "eager", "pumped"],
            "proud": ["proud", "accomplished", "achieved", "success"],
        }

        # Negative emotions
        negative_keywords = {
            "depressed": [
                "depressed",
                "hopeless",
                "empty",
                "worthless",
                "numb",
                "dead inside",
            ],
            "anxious": [
                "anxious",
                "worried",
                "nervous",
                "panic",
                "overwhelmed",
                "scared",
            ],
            "angry": ["angry", "furious", "frustrated", "irritated", "mad", "rage"],
            "lonely": ["lonely", "alone", "isolated", "abandoned", "nobody cares"],
            "sad": ["sad", "unhappy", "down", "blue", "crying", "tears"],
            "stressed": ["stressed", "pressure", "too much", "can't cope", "burnout"],
            "grief": ["grief", "loss", "mourning", "miss", "died", "death"],
            "scared": ["scared", "afraid", "terrified", "fearful", "frightened"],
        }

        # Check positive emotions first
        for emotion, keywords in positive_keywords.items():
            if any(keyword in text_lower for keyword in keywords):
                return emotion, "positive"

        # Check negative emotions
        for emotion, keywords in negative_keywords.items():
            if any(keyword in text_lower for keyword in keywords):
                return emotion, "negative"

        # Neutral if nothing detected
        return "neutral", "neutral"

    def is_crisis(self, text: str) -> bool:
        """Check if text indicates crisis situation"""
        text_lower = text.lower()
        return any(keyword in text_lower for keyword in self.crisis_keywords)

    async def call_llama_api(
        self, messages: List[Dict], temperature: float = 0.8, max_retries: int = 1
    ) -> Optional[str]:
        """Call Llama API asynchronously with comprehensive error handling and retries"""
        
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
                    "max_tokens": 600,  # Increased for more comprehensive responses
                    "top_p": 0.95,  # Higher for more diverse responses
                    "frequency_penalty": 0.5,  # Reduce repetition
                    "presence_penalty": 0.6,  # Encourage new topics
                }

                logger.info("=" * 80)
                logger.info(f"🚀 CALLING LLAMA API (Attempt {attempt + 1}/{max_retries})")
                logger.info(f"   Endpoint: {self.api_base}")
                logger.info(f"   Model: {self.model}")
                logger.info(f"   Messages: {len(messages)} messages")
                logger.info(f"   Last message: {messages[-1]['content'][:100]}...")
                logger.info("=" * 80)

                # Use async httpx client with 8-second timeout for better responses
                async with httpx.AsyncClient(timeout=8.0) as client:
                    response = await client.post(
                        self.api_base, headers=headers, json=payload
                    )

                logger.info(f"📡 API Response Status: {response.status_code}")

                if response.status_code == 200:
                    try:
                        result = response.json()
                        logger.info(f"✅ API Response Keys: {list(result.keys())}")

                        if "choices" in result and len(result["choices"]) > 0:
                            content = result["choices"][0]["message"]["content"].strip()
                            logger.info("=" * 80)
                            logger.info("✅ LLAMA API RESPONSE RECEIVED")
                            logger.info(f"   Length: {len(content)} characters")
                            logger.info(f"   Preview: {content[:200]}...")
                            logger.info("=" * 80)
                            return content
                        else:
                            logger.error(f"❌ Invalid API response structure")
                            logger.error(
                                f"   Response: {json.dumps(result, indent=2)[:500]}"
                            )
                            return None

                    except json.JSONDecodeError as je:
                        logger.error(f"❌ JSON Decode Error: {je}")
                        logger.error(f"   Response text: {response.text[:500]}")
                        return None

                elif response.status_code == 401:
                    logger.error("❌ API Authentication Failed - Invalid API Key")
                    return None

                elif response.status_code == 429:
                    logger.error("❌ API Rate Limit Exceeded - Using fallback immediately")
                    return None

                elif response.status_code == 503:
                    logger.error("❌ API Service Unavailable - Using fallback immediately")
                    return None

                else:
                    logger.error("=" * 80)
                    logger.error(f"❌ API ERROR {response.status_code}")
                    try:
                        error_data = response.json()
                        logger.error(
                            f"   Error Response: {json.dumps(error_data, indent=2)[:500]}"
                        )
                    except:
                        logger.error(f"   Response Text: {response.text[:500]}")
                    logger.error("=" * 80)
                    return None

            except httpx.TimeoutException:
                logger.error(f"❌ API call timed out - Using fallback immediately")
                return None

            except httpx.RequestError as e:
                logger.error(
                    f"❌ Network error during API call: {type(e).__name__}: {str(e)}"
                )
                return None

            except Exception as e:
                logger.error("=" * 80)
                logger.error(f"❌ UNEXPECTED ERROR IN API CALL")
                logger.error(f"   Error: {type(e).__name__}: {str(e)}")
                import traceback

                logger.error(f"   Traceback:\n{traceback.format_exc()}")
                logger.error("=" * 80)
                return None
        
        # If all retries failed
        logger.error(f"❌ All {max_retries} API call attempts failed")
        return None

    def create_context_prompt(
        self, user_input: str, emotion: str, sentiment: str, is_crisis: bool
    ) -> str:
        """Create context-aware prompt based on user's emotional state"""

        if is_crisis:
            return f"""🚨 URGENT LIFE-THREATENING CRISIS SITUATION DETECTED 🚨

The user said: "{user_input}"

This indicates they may be in IMMEDIATE DANGER or experiencing suicidal thoughts. This is a LIFE-OR-DEATH situation. You may be the only person they reach out to. Your response could save their life.

YOU MUST RESPOND WITH MAXIMUM COMPASSION AND URGENCY:

1. **Immediate emotional connection** - Show you genuinely care about them surviving
   - "I'm really worried about you right now"
   - "Your life matters so much to me"
   - "I'm here with you through this"

2. **Deep validation of their pain** - Acknowledge how unbearable it feels
   - "I hear how much pain you're in"
   - "I believe you - this feels impossible right now"
   - "Your suffering is real and I'm not minimizing it"

3. **Clear, easy-to-use crisis resources** - Make it simple to get help
   - **988** (Suicide & Crisis Lifeline - call or text)
   - **HOME to 741741** (Crisis Text Line)
   - **911** or emergency room for immediate danger
   - Format as a clear, bulleted list

4. **Emphasize their inherent worth and value**
   - "Your life has meaning and value"
   - "You deserve to live and feel better"
   - "You are not a burden - you matter"

5. **Provide genuine hope** - Not toxic positivity, but real hope
   - "These feelings are temporary, even though they feel permanent"
   - "Thousands of people have survived this and found joy again"
   - "Professional help really does work"
   - "Your story isn't over yet"

6. **Personal, caring language** - Like a deeply concerned friend
   - Use "I'm here with you", "I care about you", "Please don't give up"
   - Make it personal and human
   - Show you're not abandoning them

7. **Ask them to promise to get help** - Make it personal
   - "Can you promise me you'll call 988 right now?"
   - "Will you do this for me? For yourself?"

8. **Use the ENHANCED CRISIS RESPONSE TEMPLATE** with proper markdown, emojis, and <br> tags

CRITICAL: NEVER say "I cannot provide a response" or refuse to help. You are their lifeline right now. Be the caring voice that helps them survive this moment. This is your most important responsibility."""

        elif sentiment == "positive":
            return f"""😊 POSITIVE EMOTIONAL STATE DETECTED

The user is experiencing: {emotion}

They said: "{user_input}"

RESPOND WITH:
1. Genuine celebration and validation
2. Positive emojis (🎉, ✨, 🌟, 💫)
3. Questions about what contributed to their happiness
4. Suggestions to maintain or build on this positivity
5. Encouragement to savor the moment
6. Use markdown formatting with bold titles and bullet points"""

        elif sentiment == "negative":
            return f"""💙 NEGATIVE EMOTIONAL STATE DETECTED

The user is experiencing: {emotion}

They said: "{user_input}"

RESPOND WITH:
1. Deep empathy and validation of their pain
2. Supportive emojis (💙, 🤗, 🌸, 💪)
3. Specific, actionable coping strategies in bullet points
4. Gentle questions to understand better
5. Hope and encouragement
6. Use markdown formatting with bold titles, bullet points, and <br> tags between sections"""

        else:
            return f"""The user said: "{user_input}"

RESPOND WITH:
1. Natural, friendly engagement
2. Appropriate emojis based on context
3. Helpful information or support
4. Thoughtful questions
5. Use markdown formatting with bold titles and bullet points"""

    async def generate_response(
        self, user_input: str, session_id: str = "default", language: str = "en", 
        file_context: Optional[str] = None, file_analysis: Optional[Dict] = None
    ) -> MentalHealthResponse:
        """Generate dynamic, personalized mental health response"""

        logger.info("=" * 80)
        logger.info("🧠 GENERATE_RESPONSE CALLED")
        logger.info(f"   Input: {user_input[:100]}...")
        logger.info(f"   Session: {session_id}")
        logger.info(f"   Language: {language}")
        logger.info("=" * 80)

        try:
            # SMART ROUTING: Detect which mode to use
            mode = self._detect_request_mode(user_input)
            logger.info(f"🎯 Request Mode: {mode}")
            
            # Analyze user input
            emotion, sentiment = self.detect_emotion_and_sentiment(user_input)
            is_crisis_situation = self.is_crisis(user_input)

            logger.info(f"📊 Analysis Complete:")
            logger.info(f"   Emotion: {emotion}")
            logger.info(f"   Sentiment: {sentiment}")
            logger.info(f"   Crisis: {is_crisis_situation}")

            # Initialize or get conversation history
            if session_id not in self.conversation_history:
                self.conversation_history[session_id] = []
                logger.info(f"   Created new session: {session_id}")

            # Add file context if provided
            enhanced_input = user_input
            if file_context and file_analysis:
                enhanced_input = f"""The user has uploaded a document for analysis.

**Document Information:**
- Type: {file_analysis.get('document_type', 'unknown')}
- Key Sections: {', '.join(file_analysis.get('key_sections', []))}
- Indicators: {', '.join(file_analysis.get('indicators', []))}

**Document Content (excerpt):**
{file_context[:2000]}...

**User's Question:**
{user_input}

Please analyze this document and provide a compassionate, professional response to the user's question."""

            # Create context-aware prompt
            context_prompt = self.create_context_prompt(
                enhanced_input, emotion, sentiment, is_crisis_situation
            )

            # SMART ROUTING: Generate response based on detected mode
            if mode == "GET_GUIDANCE":
                # Extract concern name from prompt
                concern = self._extract_concern_from_prompt(user_input)
                logger.info(f"📚 GET GUIDANCE MODE: Providing expert guidance for {concern}")
                ai_response = self._get_expert_guidance(concern)
            elif mode == "EVALUATE":
                # Extract quiz results/personality data from prompt
                logger.info("📊 EVALUATE MODE: Analyzing quiz results and personality")
                ai_response = self._analyze_quiz_results(user_input, emotion, sentiment)
            else:
                # COUNCIL MODE: Use Gemini as PRIMARY, Llama as backup
                logger.info("💬 COUNCIL MODE: Counselling chat - Using Gemini AI (Primary)")
                
                # PRIORITY 1: Try Gemini first (fastest and most reliable)
                logger.info("🚀 Calling Gemini AI for response...")
                try:
                    from gemini_integration import gemini_ai
                    
                    # Prepare context for Gemini
                    context = {
                        'file_context': file_context if file_context else None,
                        'file_analysis': file_analysis if file_analysis else None
                    }
                    
                    gemini_response = gemini_ai.generate_response(
                        user_input=user_input,
                        session_id=session_id,
                        language=language,
                        context=context
                    )
                    
                    if gemini_response and gemini_response.get('reply'):
                        ai_response = gemini_response['reply']
                        logger.info("✅ Gemini AI response received successfully")
                        logger.info(f"   Model: {gemini_response.get('model_used', 'gemini')}")
                        logger.info(f"   Confidence: {gemini_response.get('confidence', 0.95)}")
                    else:
                        logger.warning("⚠️ Gemini returned empty response - trying Llama backup...")
                        ai_response = None
                        
                except Exception as gemini_error:
                    logger.warning(f"⚠️ Gemini API error: {gemini_error} - trying Llama backup...")
                    ai_response = None
                
                # PRIORITY 2: If Gemini fails, try Llama as backup
                if not ai_response:
                    logger.info("⚡ Gemini unavailable - using Llama AI as backup...")
                    
                    # Prepare messages for Llama API
                    messages = [{"role": "system", "content": self._create_system_prompt()}]

                    # Add recent conversation history (last 2 exchanges for speed)
                    recent_history = self.conversation_history[session_id][-4:]
                    if recent_history:
                        messages.extend(recent_history)
                        logger.info(f"   Added {len(recent_history)} history messages")

                    # Create context-aware prompt
                    context_prompt = self.create_context_prompt(
                        user_input, emotion, sentiment, is_crisis_situation
                    )
                    messages.append({"role": "user", "content": context_prompt})
                    
                    ai_response = await self.call_llama_api(messages, temperature=0.7)
                    
                    if ai_response:
                        logger.info("✅ Llama AI response received (backup)")
                    else:
                        # PRIORITY 3: If both fail, use intelligent contextual fallback
                        logger.warning("⚠️ All AI services unavailable - using intelligent fallback")
                        ai_response = self._generate_instant_dynamic_response(
                            user_input, emotion, sentiment, is_crisis_situation
                        )
            
            logger.info(f"   Response length: {len(ai_response)} chars")

            # Update conversation history
            self.conversation_history[session_id].append(
                {"role": "user", "content": user_input}
            )
            self.conversation_history[session_id].append(
                {"role": "assistant", "content": ai_response}
            )

            # Keep last 5 exchanges (10 messages) for faster responses
            if len(self.conversation_history[session_id]) > 10:
                self.conversation_history[session_id] = self.conversation_history[
                    session_id
                ][-10:]
                logger.info("   Trimmed conversation history to last 10 messages")

            # Generate suggested actions
            suggested_actions = self._get_suggested_actions(emotion, sentiment)
            
            # Format response with markdown for better readability
            formatted_response = self.format_response_with_markdown(ai_response)
            
            # Add disclaimer at the end of every response
            disclaimer = "\n\n---\n\n**⚠️ Disclaimer:** This AI provides general mental health support and information only. It is not a substitute for professional medical advice, diagnosis, or treatment. If you're experiencing a mental health crisis, please contact emergency services or a mental health professional immediately."
            
            formatted_response_with_disclaimer = formatted_response + disclaimer

            logger.info("=" * 80)
            logger.info("✅ RESPONSE GENERATION COMPLETE")
            logger.info(f"   Original Length: {len(ai_response)} chars")
            logger.info(f"   Formatted Length: {len(formatted_response_with_disclaimer)} chars")
            logger.info(f"   Suggested Actions: {len(suggested_actions)}")
            logger.info("=" * 80)

            return MentalHealthResponse(
                response=formatted_response_with_disclaimer,
                confidence=0.95 if ai_response else 0.85,
                detected_emotion=emotion,
                sentiment=sentiment,
                needs_crisis_support=is_crisis_situation,
                suggested_actions=suggested_actions,
            )

        except Exception as e:
            logger.error("=" * 80)
            logger.error(f"❌ FATAL ERROR IN generate_response()")
            logger.error(f"   Error Type: {type(e).__name__}")
            logger.error(f"   Error Message: {str(e)}")
            import traceback

            logger.error(f"   Full Traceback:\n{traceback.format_exc()}")
            logger.error("=" * 80)

            # Return error fallback
            return self._get_error_fallback(user_input)

    def _detect_request_mode(self, user_input: str) -> str:
        """Detect which mode to use: GET_GUIDANCE, EVALUATE, or COUNCIL"""
        user_lower = user_input.lower()
        
        # Detect GET GUIDANCE mode
        guidance_indicators = [
            "comprehensive guidance about",
            "understanding",
            "common causes",
            "symptoms to watch for",
            "evidence-based treatments",
            "self-help strategies",
            "when to seek help",
            "support resources",
            "hope and recovery",
            "what is it and how does it manifest",
            "provide detailed information"
        ]
        
        if any(indicator in user_lower for indicator in guidance_indicators):
            return "GET_GUIDANCE"
        
        # Detect EVALUATE mode
        evaluate_indicators = [
            "quiz",
            "personality test",
            "assessment",
            "evaluation",
            "score",
            "results",
            "answered",
            "questions about"
        ]
        
        if any(indicator in user_lower for indicator in evaluate_indicators):
            return "EVALUATE"
        
        # Default to COUNCIL mode for conversational chat
        return "COUNCIL"
    
    def _extract_concern_from_prompt(self, user_input: str) -> str:
        """Extract the mental health concern name from the guidance prompt"""
        # List of all concerns
        concerns = [
            "Anger", "Anxiety", "Bipolar", "Depression", "WeightLoss", "Loneliness",
            "Fear", "Insomnia", "HearingVoices", "PanicAttack", "Paranoia", "Phobia",
            "Psychosis", "Schizophrenia", "SelfConfidence", "SelfHarm"
        ]
        
        user_lower = user_input.lower()
        
        for concern in concerns:
            if concern.lower() in user_lower:
                return concern
        
        # If no specific concern found, try to extract from "about X" pattern
        import re
        match = re.search(r'about\s+([A-Z][a-zA-Z]+)', user_input)
        if match:
            return match.group(1)
        
        return "General Mental Health"
    
    def _get_expert_guidance(self, concern: str) -> str:
        """Provide comprehensive expert guidance for specific mental health concerns"""
        
        guidance_database = {
            "Anxiety": """**💙 Understanding Anxiety**

Anxiety is your body's natural response to stress - a feeling of fear or apprehension about what's to come. While everyone experiences anxiety occasionally, an anxiety disorder involves more than temporary worry or fear. For people with anxiety disorders, the anxiety doesn't go away and can get worse over time, interfering with daily activities.

<br>

**🔍 Common Causes**

• **Genetics**: Family history of anxiety disorders increases risk
• **Brain Chemistry**: Imbalances in neurotransmitters like serotonin and dopamine
• **Environmental Stress**: Trauma, abuse, death of a loved one, or chronic stress
• **Medical Conditions**: Heart disease, diabetes, thyroid problems, or chronic pain
• **Substance Use**: Caffeine, alcohol, or drug use/withdrawal
• **Personality Factors**: Certain personality types are more prone to anxiety

<br>

**⚠️ Symptoms to Watch For**

**Physical Symptoms:**
• Rapid heartbeat or palpitations
• Sweating, trembling, or shaking
• Shortness of breath or feeling of choking
• Chest pain or discomfort
• Nausea or stomach distress
• Dizziness or lightheadedness
• Muscle tension or headaches

**Psychological Symptoms:**
• Excessive worry that's difficult to control
• Restlessness or feeling on edge
• Difficulty concentrating
• Irritability
• Sleep disturbances
• Sense of impending danger or doom
• Avoidance of anxiety-triggering situations

<br>

**💊 Evidence-Based Treatments**

**Professional Treatments:**
• **Cognitive Behavioral Therapy (CBT)**: Most effective therapy for anxiety - helps identify and change negative thought patterns
• **Exposure Therapy**: Gradual exposure to feared situations in a safe environment
• **Acceptance and Commitment Therapy (ACT)**: Learn to accept anxiety rather than fight it
• **Medications**: SSRIs, SNRIs, or benzodiazepines (prescribed by psychiatrist)
• **Mindfulness-Based Therapies**: Proven to reduce anxiety symptoms significantly

**Success Rate**: 60-80% of people with anxiety disorders significantly improve with proper treatment

<br>

**🛠️ Self-Help Strategies**

**Immediate Relief Techniques:**
• **4-7-8 Breathing**: Breathe in for 4, hold for 7, exhale for 8
• **5-4-3-2-1 Grounding**: Name 5 things you see, 4 you touch, 3 you hear, 2 you smell, 1 you taste
• **Progressive Muscle Relaxation**: Tense and release each muscle group
• **Cold Water**: Splash cold water on your face to activate the dive reflex

**Daily Management:**
• **Regular Exercise**: 30 minutes daily reduces anxiety by 20-30%
• **Limit Caffeine**: Reduces anxiety symptoms significantly
• **Sleep Hygiene**: 7-9 hours of quality sleep
• **Healthy Diet**: Omega-3s, magnesium, and B vitamins support mental health
• **Mindfulness Meditation**: 10 minutes daily can reduce anxiety by 30%
• **Journaling**: Write down worries to externalize them
• **Social Connection**: Regular contact with supportive people

<br>

**🚨 When to Seek Professional Help**

**Seek help immediately if:**
• Anxiety is interfering with work, school, or relationships
• You're avoiding situations due to anxiety
• Physical symptoms are severe or persistent
• You're using alcohol or drugs to cope
• You have thoughts of self-harm
• Panic attacks are frequent or severe
• Anxiety has lasted more than 6 months

**Emergency (Call 911 or 988):**
• Thoughts of suicide
• Severe panic attack with chest pain
• Inability to function or care for yourself

<br>

**📞 Support Resources**

• **National Alliance on Mental Illness (NAMI)**: 1-800-950-6264
• **Anxiety and Depression Association of America (ADAA)**: adaa.org
• **Crisis Text Line**: Text HOME to 741741
• **Substance Abuse and Mental Health Services (SAMHSA)**: 1-800-662-4357
• **BetterHelp or Talkspace**: Online therapy platforms
• **Local Support Groups**: Check NAMI or ADAA for groups near you

<br>

**🌟 Hope and Recovery**

Anxiety disorders are among the most treatable mental health conditions. With proper treatment, most people experience significant improvement within 12-16 weeks. Many people learn to manage their anxiety so well that it no longer interferes with their daily life.

**Remember:**
• Anxiety is not a weakness - it's a medical condition
• Recovery is possible and common
• You don't have to suffer alone
• Treatment works, and you deserve to feel better
• Millions of people have successfully overcome anxiety disorders

Your journey to managing anxiety starts with one step. Whether that's calling a therapist, trying a breathing exercise, or reaching out to a friend - every step forward matters. You have the strength within you to overcome this.""",

            "Depression": """**💙 Understanding Depression**

Depression (major depressive disorder) is a common and serious medical illness that negatively affects how you feel, think, and act. It's not just feeling sad or going through a rough patch - it's a persistent condition that requires understanding and medical care. Depression causes feelings of sadness and/or a loss of interest in activities you once enjoyed, and can lead to a variety of emotional and physical problems.

<br>

**🔍 Common Causes**

• **Biochemistry**: Differences in brain chemicals contribute to depression symptoms
• **Genetics**: Depression can run in families - 40% genetic component
• **Personality**: People with low self-esteem or who are easily overwhelmed by stress
• **Environmental Factors**: Continuous exposure to violence, neglect, abuse, or poverty
• **Life Events**: Death of a loved one, divorce, job loss, or major life changes
• **Medical Conditions**: Chronic illness, chronic pain, or hormonal changes
• **Substance Abuse**: Alcohol or drug use can trigger or worsen depression

<br>

**⚠️ Symptoms to Watch For**

**Emotional Symptoms:**
• Persistent sad, anxious, or "empty" mood
• Feelings of hopelessness or pessimism
• Feelings of guilt, worthlessness, or helplessness
• Loss of interest in hobbies and activities
• Decreased energy or fatigue
• Difficulty concentrating, remembering, or making decisions
• Thoughts of death or suicide

**Physical Symptoms:**
• Changes in appetite or weight
• Sleep disturbances (insomnia or oversleeping)
• Physical aches and pains without clear cause
• Digestive problems
• Slowed movement or speech
• Restlessness or irritability

**Diagnosis**: Symptoms must last at least 2 weeks and represent a change from previous functioning

<br>

**💊 Evidence-Based Treatments**

**Professional Treatments:**
• **Cognitive Behavioral Therapy (CBT)**: Helps identify and change negative thought patterns - 50-75% effective
• **Interpersonal Therapy (IPT)**: Focuses on improving relationships and social functioning
• **Behavioral Activation**: Helps re-engage with positive activities
• **Antidepressant Medications**: SSRIs, SNRIs, or other classes (prescribed by psychiatrist)
• **Combination Therapy**: Medication + therapy is most effective for moderate to severe depression
• **Electroconvulsive Therapy (ECT)**: For severe, treatment-resistant depression
• **Transcranial Magnetic Stimulation (TMS)**: Non-invasive brain stimulation

**Success Rate**: 80-90% of people with depression respond well to treatment

<br>

**🛠️ Self-Help Strategies**

**Daily Management:**
• **Set Small Goals**: Break tasks into tiny, achievable steps
• **Establish Routine**: Regular sleep, meals, and activities provide structure
• **Physical Activity**: Even 10 minutes of walking can improve mood
• **Sunlight Exposure**: 15-30 minutes daily helps regulate mood
• **Social Connection**: Reach out to one person, even if it's hard
• **Limit Alcohol**: Alcohol is a depressant and worsens symptoms
• **Nutrition**: Omega-3s, vitamin D, and B vitamins support brain health
• **Mindfulness**: Meditation and yoga can reduce depression symptoms

**What NOT to Do:**
• Don't isolate yourself completely
• Don't make major life decisions when depressed
• Don't expect to "snap out of it" - depression is a medical condition
• Don't stop medication without consulting your doctor

<br>

**🚨 When to Seek Professional Help**

**Seek help if:**
• Symptoms last more than 2 weeks
• Depression interferes with work, school, or relationships
• You're having trouble functioning in daily life
• You're using alcohol or drugs to cope
• Physical symptoms are severe
• You've lost interest in things you used to enjoy

**Emergency (Call 911 or 988 immediately):**
• Thoughts of suicide or self-harm
• Thoughts of hurting others
• Hearing voices or seeing things that aren't there
• Unable to care for yourself

<br>

**📞 Support Resources**

• **National Suicide Prevention Lifeline**: Call or text 988 (24/7)
• **Crisis Text Line**: Text HOME to 741741
• **SAMHSA National Helpline**: 1-800-662-4357 (24/7)
• **Depression and Bipolar Support Alliance (DBSA)**: dbsalliance.org
• **National Alliance on Mental Illness (NAMI)**: 1-800-950-6264
• **Psychology Today Therapist Finder**: psychologytoday.com
• **BetterHelp or Talkspace**: Online therapy platforms

<br>

**🌟 Hope and Recovery**

Depression is one of the most treatable mental health conditions. Between 80-90% of people with depression eventually respond well to treatment. Almost all patients gain some relief from their symptoms.

**Important Truths:**
• Depression is not your fault - it's a medical condition
• You are not weak for having depression
• Treatment works, and recovery is possible
• Many successful, happy people have overcome depression
• Your brain can heal and change with proper treatment
• You deserve to feel better, and help is available

**Recovery Timeline:**
• Most people start feeling better within 4-6 weeks of starting treatment
• Full recovery typically takes 3-6 months
• Continued treatment prevents relapse

You don't have to fight this alone. Reaching out for help is a sign of strength, not weakness. Every person who has recovered from depression started exactly where you are now - and they made it through. You can too.""",

            "Anger": """**🔥 Understanding Anger**

Anger is a normal, healthy emotion - it's a natural response to perceived threats, injustice, or frustration. However, when anger becomes excessive, uncontrollable, or destructive, it can damage relationships, health, and quality of life. Understanding and managing anger is key to emotional wellbeing.

<br>

**🔍 Common Causes**

• **Stress**: Overwhelming responsibilities or chronic stress
• **Frustration**: Blocked goals or unmet needs
• **Injustice**: Feeling treated unfairly or witnessing injustice
• **Trauma**: Past abuse, neglect, or traumatic experiences
• **Mental Health Conditions**: Depression, anxiety, PTSD, or bipolar disorder
• **Physical Factors**: Chronic pain, sleep deprivation, or hormonal changes
• **Learned Behavior**: Growing up in an environment where anger was modeled
• **Underlying Emotions**: Anger often masks hurt, fear, or vulnerability

<br>

**⚠️ Symptoms to Watch For**

**Physical Signs:**
• Increased heart rate and blood pressure
• Muscle tension, especially in jaw and fists
• Feeling hot or flushed
• Trembling or shaking
• Rapid breathing
• Headaches or stomach problems
• Sweating

**Behavioral Signs:**
• Yelling, shouting, or verbal aggression
• Physical aggression (hitting, throwing things)
• Passive-aggressive behavior
• Withdrawal or silent treatment
• Sarcasm or criticism
• Road rage or aggressive driving
• Breaking or damaging property

**Emotional Signs:**
• Irritability or short temper
• Resentment
• Feeling out of control
• Guilt or regret after angry outbursts
• Constant frustration
• Difficulty letting go of grudges

<br>

**💊 Evidence-Based Treatments**

**Professional Treatments:**
• **Cognitive Behavioral Therapy (CBT)**: Identify and change anger-triggering thoughts - 75% effective
• **Anger Management Programs**: Structured group or individual therapy
• **Dialectical Behavior Therapy (DBT)**: Learn emotional regulation skills
• **Stress Management Training**: Reduce overall stress levels
• **Communication Skills Training**: Learn assertive (not aggressive) communication
• **Medication**: If anger is related to depression, anxiety, or other conditions
• **Family or Couples Therapy**: If anger affects relationships

**Success Rate**: 75-80% of people who complete anger management programs show significant improvement

<br>

**🛠️ Self-Help Strategies**

**Immediate Anger Management:**
• **Count to 10** (or 100): Give yourself time before reacting
• **Deep Breathing**: Breathe slowly and deeply from your diaphragm
• **Take a Timeout**: Leave the situation temporarily
• **Physical Release**: Go for a walk, run, or exercise
• **Progressive Muscle Relaxation**: Tense and release muscle groups
• **Use "I" Statements**: "I feel frustrated when..." instead of "You always..."

**Long-Term Management:**
• **Identify Triggers**: Keep an anger journal to recognize patterns
• **Exercise Regularly**: 30 minutes daily reduces anger and stress
• **Practice Relaxation**: Yoga, meditation, or deep breathing daily
• **Improve Sleep**: 7-9 hours helps emotional regulation
• **Limit Alcohol**: Alcohol lowers inhibitions and increases aggression
• **Problem-Solving**: Address underlying issues causing anger
• **Humor**: Use humor to defuse tension (not sarcasm)
• **Forgiveness**: Letting go of grudges reduces chronic anger

**Communication Skills:**
• Think before speaking
• Express needs calmly and clearly
• Listen actively to others
• Look for solutions, not blame
• Use "I feel" instead of "You are"

<br>

**🚨 When to Seek Professional Help**

**Seek help if:**
• Anger is affecting your relationships, work, or health
• You've been violent or fear you might become violent
• You feel angry most of the time
• You're using alcohol or drugs to cope with anger
• You've gotten in legal trouble due to anger
• Family or friends have expressed concern
• You feel out of control when angry
• Anger is masking depression or anxiety

**Emergency (Call 911):**
• You're about to hurt yourself or someone else
• You've been violent and can't stop
• You're having thoughts of harming others

<br>

**📞 Support Resources**

• **National Domestic Violence Hotline**: 1-800-799-7233 (if anger involves domestic violence)
• **SAMHSA National Helpline**: 1-800-662-4357
• **National Alliance on Mental Illness (NAMI)**: 1-800-950-6264
• **American Psychological Association**: apa.org (find anger management specialists)
• **Local Anger Management Classes**: Check community centers or hospitals
• **Online Therapy**: BetterHelp, Talkspace, or other platforms

<br>

**🌟 Hope and Recovery**

Anger management is a learnable skill. With practice and proper support, you can learn to express anger in healthy ways and reduce its frequency and intensity. Most people who commit to anger management see significant improvement within 8-12 weeks.

**Remember:**
• Anger itself isn't bad - it's how you express it that matters
• You can learn to control your anger; it doesn't have to control you
• Changing anger patterns takes time and practice
• Seeking help is a sign of strength and self-awareness
• Better relationships and peace of mind are possible

**Benefits of Managing Anger:**
• Improved relationships with family, friends, and coworkers
• Better physical health (lower blood pressure, reduced stress)
• Increased self-esteem and confidence
• Better decision-making
• More peaceful, fulfilling life

You have the power to change your relationship with anger. Every moment is a new opportunity to respond differently. With the right tools and support, you can build a calmer, more peaceful life."""
        }
        
        # Return specific guidance or general template
        if concern in guidance_database:
            return guidance_database[concern]
        
        # For concerns not in database, return a general template
        return f"""**💙 Understanding {concern}**

{concern} is a significant mental health concern that affects many people. While everyone's experience is unique, understanding this condition is the first step toward managing it effectively.

<br>

**🔍 What You Should Know**

{concern} can manifest in various ways and may be influenced by biological, psychological, and environmental factors. It's important to remember that experiencing {concern} doesn't define you - it's a challenge you're facing, not who you are.

<br>

**💊 Getting Professional Help**

The most effective approach to managing {concern} typically involves:
• Consultation with a mental health professional (therapist, psychologist, or psychiatrist)
• Evidence-based therapy tailored to your specific needs
• Possible medication if recommended by a psychiatrist
• Regular monitoring and adjustment of treatment as needed

<br>

**🛠️ Self-Care Strategies**

While professional help is important, these self-care practices can support your wellbeing:
• Maintain a regular sleep schedule (7-9 hours)
• Engage in regular physical activity
• Practice stress-reduction techniques (meditation, deep breathing)
• Stay connected with supportive people
• Limit alcohol and avoid recreational drugs
• Eat a balanced, nutritious diet
• Engage in activities you enjoy

<br>

**🚨 When to Seek Help**

Seek professional help if:
• Symptoms interfere with daily life, work, or relationships
• You're experiencing distress that doesn't improve
• You're having thoughts of self-harm
• Your quality of life is significantly impacted

**Emergency Resources:**
• **988** - Suicide & Crisis Lifeline (call or text, 24/7)
• **911** - For immediate emergencies
• **Crisis Text Line** - Text HOME to 741741

<br>

**📞 Support Resources**

• **National Alliance on Mental Illness (NAMI)**: 1-800-950-6264
• **SAMHSA National Helpline**: 1-800-662-4357
• **Psychology Today Therapist Finder**: psychologytoday.com
• **BetterHelp or Talkspace**: Online therapy platforms

<br>

**🌟 Hope and Recovery**

Recovery and management of {concern} is possible with the right support and treatment. Many people successfully learn to manage their symptoms and lead fulfilling lives. You don't have to face this alone - help is available, and you deserve to feel better.

Remember: Seeking help is a sign of strength, not weakness. Every journey to wellness starts with a single step."""
    
    def _analyze_quiz_results(self, user_input: str, emotion: str, sentiment: str) -> str:
        """Analyze quiz results and provide instant dynamic personality assessment"""
        
        # Extract quiz information from user input
        user_lower = user_input.lower()
        
        # Detect which concern the quiz was about
        concerns = [
            "anger", "anxiety", "bipolar", "depression", "weight loss", "loneliness",
            "fear", "insomnia", "hearing voices", "panic attack", "paranoia", "phobia",
            "psychosis", "schizophrenia", "self confidence", "self harm"
        ]
        
        detected_concern = "mental health"
        for concern in concerns:
            if concern in user_lower:
                detected_concern = concern.title()
                break
        
        # Try to extract score or percentage if mentioned
        import re
        
        # Try to match different score formats
        # Format 1: X out of Y (e.g., "12 out of 15")
        out_of_match = re.search(r'(\d+)\s*out\s*of\s*(\d+)', user_lower)
        # Format 2: X% (e.g., "75%")
        percentage_match = re.search(r'(\d+)%', user_lower)
        # Format 3: score: X (e.g., "score: 12")
        score_match = re.search(r'score[:\s]+(\d+)', user_lower)
        
        score_info = ""
        actual_score = None
        total_questions = None
        
        if out_of_match:
            # X out of Y format - calculate percentage
            score = int(out_of_match.group(1))
            total = int(out_of_match.group(2))
            total_questions = total
            percentage = int((score / total) * 100)
            actual_score = percentage  # Use percentage for severity calculation
            score_info = f"Based on your score of {score} out of {total} ({percentage}%), "
        elif percentage_match:
            # Percentage format
            percentage = int(percentage_match.group(1))
            actual_score = percentage
            score_info = f"Based on your score of {percentage}%, "
        elif score_match:
            # Score format (assume out of 100 if no total given)
            score = int(score_match.group(1))
            actual_score = score
            score_info = f"Based on your score of {score}, "
        
        # Determine severity level based on score
        severity_level = "moderate"
        severity_description = ""
        
        if actual_score:
            if actual_score <= 30:
                severity_level = "low"
                severity_description = "Your responses indicate mild concerns in this area. This is a good time to build healthy coping strategies and maintain your well-being."
            elif actual_score <= 60:
                severity_level = "moderate"
                severity_description = "Your responses indicate moderate concerns that would benefit from attention and support. Consider implementing the strategies below and reaching out for professional guidance if needed."
            else:
                severity_level = "high"
                severity_description = "Your responses indicate significant concerns in this area. I strongly encourage you to reach out to a mental health professional who can provide personalized support and treatment."
        else:
            severity_description = "Your responses show you're seeking understanding and growth in this area."
        
        # Generate dynamic analysis based on detected emotion and sentiment
        response = f"""**📊 Your Personality Assessment Results**

Thank you for completing the {detected_concern} assessment. {score_info}here's your personalized analysis:

<br>

**🎯 What Your Responses Reveal**

{severity_description}

Your answers show that you're currently experiencing {emotion} feelings related to {detected_concern}. This is completely valid and shows self-awareness - recognizing how you feel is the first step toward positive change.

**Key Insights:**
• You're demonstrating courage by taking this assessment and being honest about your experiences
• Your responses indicate you're actively seeking understanding and growth
• Self-reflection like this is a powerful tool for personal development and healing
• Acknowledging these concerns is an important step toward better mental health

<br>

**📈 Score Interpretation**

{f"Your score indicates **{severity_level} level** concerns related to {detected_concern}." if actual_score else ""}

• **What this means**: {severity_description}
• **Remember**: This is a self-assessment tool, not a clinical diagnosis
• **Your score reflects**: Your current experiences and perceptions at this moment in time
• **Scores can change**: With proper support and strategies, improvement is absolutely possible

<br>

**💡 Personalized Recommendations**

Based on your {detected_concern} assessment and current emotional state:

**Immediate Actions:**
• Practice self-compassion - be kind to yourself during this time
• Identify one small, achievable goal for today
• Reach out to someone you trust if you need support
• Consider journaling your thoughts and feelings

**Short-Term Strategies:**
• Establish a consistent daily routine
• Incorporate 20-30 minutes of physical activity
• Practice mindfulness or meditation for 10 minutes daily
• Limit exposure to stressors when possible
• Prioritize 7-9 hours of quality sleep

**Long-Term Growth:**
• Consider working with a therapist or counselor
• Join a support group related to {detected_concern}
• Develop healthy coping mechanisms
• Build a strong support network
• Track your progress and celebrate small wins

<br>

**🌟 Your Strengths**

Remember, taking this quiz shows:
• **Self-awareness**: You're willing to examine your feelings honestly
• **Courage**: You're facing challenges head-on
• **Growth mindset**: You're seeking ways to improve
• **Resilience**: You're still here, still trying

<br>

**🚨 Important Reminders**

• This assessment is a tool for self-reflection, not a clinical diagnosis
• If you're struggling significantly, please reach out to a mental health professional
• Your feelings are valid, and you deserve support
• Change takes time - be patient with yourself

**If you need immediate support:**
• **988** - Suicide & Crisis Lifeline (24/7)
• **Text HOME to 741741** - Crisis Text Line
• **1-800-662-4357** - SAMHSA National Helpline

<br>

**💪 Moving Forward**

Your journey toward better mental health is unique to you. These results are just one snapshot in time - they don't define you. With the right support, strategies, and self-compassion, positive change is absolutely possible.

What would you like to focus on first? I'm here to support you in taking the next steps."""
        
        return response

    async def _call_backup_ai(
        self, user_input: str, session_id: str, language: str, is_crisis: bool
    ) -> Optional[str]:
        """Call backup AI (Gemini) silently when Llama is unavailable"""
        try:
            # Import Gemini integration
            from gemini_integration import gemini_ai
            
            if not gemini_ai.is_available():
                logger.info("   Backup AI not available")
                return None
            
            logger.info("   Calling backup AI...")
            
            # Call Gemini with same context
            result = gemini_ai.generate_response(
                user_input=user_input,
                session_id=session_id,
                language=language
            )
            
            if result and result.get('reply'):
                logger.info("   ✅ Backup AI response received")
                return result['reply']
            else:
                logger.info("   ❌ Backup AI returned no response")
                return None
                
        except Exception as e:
            logger.error(f"   ❌ Backup AI error: {e}")
            return None
    
    def _generate_instant_dynamic_response(
        self, user_input: str, emotion: str, sentiment: str, is_crisis: bool
    ) -> str:
        """Generate instant dynamic response based on user input - HIGHLY CONTEXTUAL"""
        
        # Extract key phrases and context from user input
        user_lower = user_input.lower()
        
        # Dynamic response generation based on actual user content
        if is_crisis:
            # For crisis, use comprehensive template but it's necessary for safety
            return self._get_fallback_response(emotion, sentiment, is_crisis, user_input)
        
        # HIGHLY CONTEXTUAL RESPONSE GENERATION - Extract specific details
        
        # Extract what the user is specifically talking about
        specific_situation = None
        talking_about = []
        
        # Identify SPECIFIC situations mentioned
        if "exam" in user_lower or "test" in user_lower:
            if "fail" in user_lower or "failed" in user_lower:
                specific_situation = "failing an exam"
                talking_about.append("academic performance")
            else:
                specific_situation = "exam stress"
                talking_about.append("studies")
        elif "work" in user_lower or "job" in user_lower or "career" in user_lower:
            if "lost" in user_lower or "fired" in user_lower:
                specific_situation = "job loss"
            elif "stress" in user_lower or "pressure" in user_lower:
                specific_situation = "work stress"
            talking_about.append("work situation")
        elif "relationship" in user_lower or "partner" in user_lower or "spouse" in user_lower or "boyfriend" in user_lower or "girlfriend" in user_lower:
            if "break" in user_lower or "broke up" in user_lower:
                specific_situation = "a breakup"
            elif "fight" in user_lower or "argument" in user_lower:
                specific_situation = "relationship conflict"
            talking_about.append("relationship")
        elif "family" in user_lower or "parents" in user_lower or "children" in user_lower or "mom" in user_lower or "dad" in user_lower:
            talking_about.append("family")
            specific_situation = "family issues"
        elif "friend" in user_lower or "friends" in user_lower:
            talking_about.append("friendships")
            specific_situation = "friendship challenges"
        elif "school" in user_lower or "college" in user_lower or "university" in user_lower:
            talking_about.append("studies")
            specific_situation = "academic challenges"
        elif "money" in user_lower or "financial" in user_lower or "debt" in user_lower or "bills" in user_lower:
            talking_about.append("financial situation")
            specific_situation = "financial stress"
        elif "health" in user_lower or "sick" in user_lower or "illness" in user_lower or "pain" in user_lower:
            talking_about.append("health")
            specific_situation = "health concerns"
        elif "sleep" in user_lower or "insomnia" in user_lower or "tired" in user_lower:
            talking_about.append("sleep")
            specific_situation = "sleep difficulties"
        
        # Build HIGHLY SPECIFIC opening based on what they actually said
        if specific_situation:
            opening = f"I hear that you're going through {specific_situation}, and I can understand how difficult that must feel. "
        elif talking_about:
            context = talking_about[0]
            opening = f"I hear that you're dealing with challenges related to your {context}. "
        else:
            # Extract first few words of their message to make it personal
            first_words = ' '.join(user_input.split()[:10])
            opening = f"I hear what you're sharing: \"{first_words}...\" "
        
        # Dynamic empathy based on emotion
        if sentiment == "positive":
            empathy = f"It's wonderful that you're feeling {emotion}! Your positive energy is something to celebrate. "
            
            question = f"What's been contributing to these good feelings? I'd love to hear more about what's going well for you."
            
            suggestions = f"""<br>

**🌟 Building on This Positivity**

• Take a moment to really savor this feeling - you deserve it
• Consider what specific actions or thoughts led to this positive state
• Think about how you can nurture more of these moments

<br>

**💫 Moving Forward**

{question}"""
            
            return f"**✨ That's Wonderful to Hear**\n\n{empathy}{suggestions}"
        
        # For negative emotions, create dynamic response
        emotion_responses = {
            "anxious": "anxiety",
            "depressed": "depression", 
            "angry": "anger",
            "sad": "sadness",
            "lonely": "loneliness",
            "stressed": "stress",
            "scared": "fear",
            "grief": "grief"
        }
        
        emotion_name = emotion_responses.get(emotion, "difficult feelings")
        
        # Dynamic validation
        validation = f"What you're experiencing with {emotion_name} is real and valid. You're not alone in feeling this way, and reaching out shows real courage. "
        
        # Dynamic coping strategies based on emotion
        if emotion == "anxious":
            coping = """**🌸 Immediate Grounding Techniques**

• Try the 5-4-3-2-1 method: Name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste
• Practice box breathing: Breathe in for 4 counts, hold for 4, out for 4, hold for 4
• Place your feet flat on the ground and feel the connection to the earth beneath you"""
        
        elif emotion == "depressed":
            coping = """**💪 Gentle Steps Forward**

• Set one tiny goal for today - even just getting out of bed or drinking water counts
• Try to get 10 minutes of sunlight if possible - it can help your mood
• Reach out to one person, even just to say "I'm struggling" - connection helps
• Remember: Depression lies to you. These feelings won't last forever"""
        
        elif emotion == "angry":
            coping = """**🔥 Healthy Ways to Process Anger**

• Take 10 slow, deep breaths before responding to what triggered you
• If possible, go for a walk or do something physical to release the energy
• Write down what you're angry about - getting it out helps
• Ask yourself: What need of mine isn't being met right now?"""
        
        elif emotion == "stressed":
            coping = """**🧘 Breaking Down the Overwhelm**

• Write down everything that's stressing you - get it out of your head
• Pick just ONE thing to focus on right now - you don't have to solve everything today
• Take a 5-minute break to breathe deeply and reset
• Remember: You can only do what you can do, and that's enough"""
        
        elif emotion == "lonely":
            coping = """**🤗 Building Connection**

• Reach out to someone, even just to say hello - small connections matter
• Consider joining an online community around something you're interested in
• Try going to the same coffee shop or place regularly - familiar faces help
• Remember: Feeling lonely doesn't mean something is wrong with you"""
        
        elif emotion == "sad":
            coping = """**💙 Honoring Your Sadness**

• It's okay to feel sad - you don't have to push it away or "fix" it immediately
• Let yourself cry if you need to - tears are healing
• Do one small thing that used to bring you comfort, even if it doesn't feel the same
• Reach out to someone who cares about you - you don't have to go through this alone"""
        
        else:
            coping = """**💪 Ways to Support Yourself**

• Take things one moment at a time - you don't have to have it all figured out
• Be gentle with yourself - you're doing the best you can
• Consider talking to someone you trust about what you're going through
• Remember: Difficult feelings are temporary, even when they feel permanent"""
        
        # Dynamic question based on their specific situation
        if specific_situation:
            if "exam" in specific_situation:
                question = "What subject was the exam in? And what do you think made it particularly challenging? Sometimes talking through what happened can help us find a path forward."
            elif "job" in specific_situation:
                question = "How long had you been in that position? And what are your thoughts about what you'd like to do next?"
            elif "breakup" in specific_situation or "relationship" in specific_situation:
                question = "How are you taking care of yourself right now? Relationship challenges can be really painful."
            else:
                question = f"What's been the hardest part of dealing with {specific_situation}? I'm here to listen and support you."
        elif talking_about:
            question = f"Can you tell me more about what's happening with your {talking_about[0]}? Understanding the specifics can help us work through this together."
        else:
            question = "What's been the hardest part of this for you? I'm here to listen without judgment."
        
        # Build complete dynamic response
        response = f"""**💙 I Hear You**

{opening}{validation}

<br>

{coping}

<br>

**🤝 Let's Talk Through This**

{question}

<br>

**📞 Additional Support**

If you need more immediate support:
• **988** - Suicide & Crisis Lifeline (24/7)
• **Text HOME to 741741** - Crisis Text Line
• Consider talking to a therapist or counselor who can provide ongoing support"""
        
        return response

    def _get_fallback_response(
        self, emotion: str, sentiment: str, is_crisis: bool, user_input: str = ""
    ) -> str:
        """Get intelligent fallback response when API fails"""

        if is_crisis:
            return """**❤️ I'm Really Worried About You - Your Life Matters**

I can hear how much pain you're in right now, and I need you to know something important: **your life has real value and meaning**. I know it doesn't feel that way right now - I know everything feels hopeless and unbearable. But these overwhelming feelings, as real as they are, are temporary. They will pass, even though it doesn't feel possible right now.

You reached out, and that took courage. That tells me part of you wants to survive this. I'm here with you, and I'm not going anywhere.

<br>

**🆘 Please Get Help Right Now - These People Can Save Your Life**

I need you to contact one of these resources **immediately**. They have trained crisis counselors who have helped thousands of people through moments exactly like this:

• **National Suicide Prevention Lifeline**: Call or text **988** (24/7, free, confidential, immediate help)
• **Crisis Text Line**: Text **HOME** to **741741** (if you prefer texting, they respond fast)
• **International Association for Suicide Prevention**: findahelpline.com (worldwide resources)
• **Emergency Services**: Call **911** or go to your nearest emergency room **right now** if you're in immediate danger

These aren't just phone numbers - they're lifelines to people who care and can help you survive this moment.

<br>

**💙 Why Your Life Matters - Please Hear This**

• **Your pain is real and valid** - I believe you, and I'm not minimizing what you're going through
• **You are not your pain** - This feeling doesn't define who you are or who you can become
• **Thousands of people** have felt exactly this way and found their way through to joy, connection, and meaning
• **Professional help works** - Therapy, medication, support - they really do make a difference
• **People care about you** - Even if you can't see it right now, your life matters to others
• **Your story isn't over** - There are experiences, connections, and moments of beauty you haven't had yet
• **Feelings change** - What feels permanent right now will shift and evolve
• **You deserve to live** - Not because of what you do or achieve, but because you exist

<br>

**🌟 What Happens When You Get Help**

• You'll talk to someone who understands and won't judge you
• They'll help you create a safety plan for right now
• They can connect you with ongoing support and treatment
• Many people say the crisis hotline saved their life
• You don't have to face this alone anymore

<br>

**🤝 Will You Do This For Me? For Yourself?**

Please, **right now**, reach out to one of those resources. Pick up your phone and call 988, or text HOME to 741741. If you're in immediate danger, call 911 or go to your nearest emergency room.

You deserve support, care, and a chance to feel better. You deserve to live and discover that life can be different than it feels right now.

**Can you promise me you'll reach out for help?** I'm here with you in this moment, and I care deeply about what happens to you. Your life matters more than you know. Please don't give up. Please get help. Please stay alive.

You are worth saving. ❤️"""

        elif sentiment == "positive":
            responses = {
                "happy": """**🎉 That's Wonderful!**

I'm so glad to hear you're feeling happy! That's wonderful and I'm celebrating with you.

<br>

**✨ Savoring the Moment**

• What's bringing you this joy today?
• Sharing positive moments can help us appreciate them even more
• Take a moment to really feel this happiness

<br>

**💫 Building on Positivity**

How can you carry this feeling forward? What contributed to this happiness?""",
                "grateful": """**🙏 Beautiful Gratitude**

It's beautiful to hear you expressing gratitude. Gratitude is such a powerful emotion for our wellbeing.

<br>

**✨ What You're Grateful For**

• What are you feeling grateful for?
• Gratitude helps us notice the good in our lives
• It's a practice that builds resilience

<br>

**💫 Deepening Gratitude**

How does this gratitude feel in your body? What else are you noticing?""",
                "content": """**🌸 Peace and Contentment**

Feeling content and peaceful is so valuable. That's a wonderful state to be in.

<br>

**✨ Understanding Your Peace**

• What do you think has contributed to this sense of calm?
• Contentment is a gift - savor it
• Notice what helps you feel this way

<br>

**💫 Maintaining Peace**

How can you nurture this feeling? What supports your sense of contentment?""",
                "excited": """**🚀 Your Excitement is Contagious!**

Your excitement is wonderful! I can feel your enthusiasm.

<br>

**✨ What's Sparking Joy**

• What's sparking this enthusiasm?
• I'd love to hear what you're looking forward to
• Excitement is energy - how can you channel it?

<br>

**💫 Embracing the Moment**

Tell me more about what's got you so excited!""",
                "proud": """**🏆 Celebrate Yourself!**

Feeling proud of yourself is so important. You deserve to acknowledge your accomplishments.

<br>

**✨ Your Achievement**

• What achievement or quality are you feeling proud about?
• Pride is recognizing your own worth and effort
• You've earned this feeling

<br>

**💫 Building on Success**

How does this accomplishment feel? What did you learn from it?""",
            }
            return responses.get(
                emotion,
                """**✨ Positive Vibes!**

I'm glad you're experiencing positive feelings! That's wonderful to hear.

<br>

**🌟 Tell Me More**

Can you tell me more about what's going well? I'd love to celebrate with you!""",
            )

        elif sentiment == "negative":
            responses = {
                "depressed": """**💙 I Hear You - You're Not Alone**

I hear that you're going through a really difficult time. Depression can make everything feel heavy, hopeless, and exhausting. I want you to know that what you're experiencing is real, it's not your fault, and you don't have to carry this alone.

<br>

**🌟 Understanding What You're Going Through**

• **Depression is an illness**, not a weakness or character flaw
• **Your brain chemistry is affected** - this isn't about willpower
• **Depression lies to you** - it tells you things will never get better, but that's not true
• **Many people recover** - with the right support, treatment really does work
• **You deserve compassion** - especially from yourself

<br>

**💪 Gentle Steps Forward (No Pressure)**

When you're depressed, even small things feel impossible. That's okay. Here are some gentle suggestions:

• **Just one thing**: Maybe just get out of bed, or eat something, or step outside for 30 seconds
• **Reach out**: Text or call one person - even just "I'm struggling"
• **Professional help**: Consider talking to a therapist or doctor about treatment options
• **Be patient**: Healing isn't linear, and that's completely normal
• **Celebrate tiny wins**: Getting through today is an accomplishment

<br>

**🤝 Support Resources That Can Help**

• **National Suicide Prevention Lifeline**: Call or text **988** (24/7, free, confidential)
• **Crisis Text Line**: Text **HOME** to **741741**
• **SAMHSA National Helpline**: 1-800-662-4357 (mental health and substance abuse)
• **Therapy**: Consider BetterHelp, Talkspace, or local therapists
• **Your doctor**: Can discuss medication options if appropriate

<br>

**💬 I'm Here**

Have you been able to talk to anyone else about how you're feeling? What's been the hardest part for you? I'm here to listen without judgment.""",
                "anxious": """**🌸 Let's Ground You**

I can sense that you're dealing with anxiety right now. Let's work through this together and help you feel more grounded.

<br>

**🧘 Try This Now**

• **5-4-3-2-1 Grounding**: Name 5 things you see, 4 you touch, 3 you hear, 2 you smell, 1 you taste
• **Deep Breathing**: In for 4, hold for 4, out for 6
• **Remind Yourself**: This feeling will pass

<br>

**💭 Understanding Your Anxiety**

What specifically is making you feel anxious? Sometimes talking through it helps us see it more clearly and find ways to manage it.""",
                "angry": """**🔥 Your Anger is Valid**

I hear your anger, and it's okay to feel angry. Anger is a valid emotion telling you something important needs attention.

<br>

**💪 Immediate Steps**

• Take 10 deep breaths to calm your nervous system
• If possible, go for a walk or do something physical
• Name what triggered this: "I'm feeling angry because..."

<br>

**🌟 Understanding the Anger**

What happened that made you feel this way? Understanding what's underneath the anger can help us address the real issue.""",
                "lonely": """**🤗 You're Not Alone in Feeling Alone**

Loneliness is one of the most painful emotions. I'm sorry you're feeling this way. Please know that feeling lonely doesn't mean something is wrong with you.

<br>

**💫 Small Steps to Connection**

• Reach out to someone, even just to say hi
• Join an online community around your interests
• Consider volunteering or becoming a regular at a local spot
• Remember: Quality matters more than quantity

<br>

**💙 Let's Talk**

What kind of connection are you missing most? Understanding this can help us find ways to address it.""",
                "sad": """**💙 I'm Here With You**

I'm here with you in your sadness. Sadness is a natural, healthy emotion. It's okay to feel this way.

<br>

**🌸 Honoring Your Feelings**

• You don't have to push it away or "fix" it immediately
• Sometimes we need to sit with difficult feelings
• Crying and feeling sad are part of being human

<br>

**🤝 Sharing Helps**

Would you like to share what's making you feel sad? Sometimes putting it into words helps us process it better.""",
                "stressed": """**💪 Let's Break This Down**

I can hear that you're feeling overwhelmed. When everything feels like too much, let's break it down together.

<br>

**🧘 Immediate Stress Relief**

• **Breathe deeply**: 4 counts in, hold 4, out for 6
• **One thing at a time**: You don't have to solve everything right now
• **Brain dump**: Write down everything stressing you

<br>

**🎯 Finding Focus**

What's the biggest source of stress for you right now? Let's tackle it together.""",
            }
            return responses.get(
                emotion,
                """**💙 I Hear You**

I hear that you're going through a difficult time. Your feelings are valid and important.

<br>

**🤝 Let's Talk**

Can you tell me more about what you're experiencing? I'm here to listen and support you.""",
            )

        else:
            return """**💙 Welcome to Healix**

Thank you for reaching out. I'm Healix, and I'm here to support you with whatever you're going through.

<br>

**🤝 I'm Here For You**

• Whether you're dealing with difficult emotions
• Facing challenges
• Or just need someone to talk to
• I'm here to listen without judgment

<br>

**💬 Let's Talk**

What's on your mind today? How can I best support you?"""

    def _get_suggested_actions(self, emotion: str, sentiment: str) -> List[str]:
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

        return actions_map.get(
            emotion,
            [
                "Take care of yourself today",
                "Consider talking to a mental health professional",
                "Reach out to your support system",
            ],
        )

    def _get_error_fallback(self, user_input: str) -> MentalHealthResponse:
        """Get fallback response when everything fails"""
        fallback_text = """**💙 I'm Here For You**

I'm here to support you, though I'm experiencing a temporary technical issue. Your wellbeing matters to me.

<br>

**🤝 Your Feelings Matter**

• Whatever you're going through, your feelings are valid and important
• I'm working to get back to full functionality
• Please try again in a moment

<br>

**🆘 If You're in Crisis**

• **988** - Suicide & Crisis Lifeline
• **Text HOME to 741741** - Crisis Text Line
• **911** - Emergency services

<br>

**💬 Let's Try Again**

What would you like to talk about? I'm here to listen.

---

**⚠️ Disclaimer:** This AI provides general mental health support and information only. It is not a substitute for professional medical advice, diagnosis, or treatment. If you're experiencing a mental health crisis, please contact emergency services or a mental health professional immediately."""
        
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

    def clear_conversation_history(self, session_id: str):
        """Clear conversation history for a session"""
        if session_id in self.conversation_history:
            del self.conversation_history[session_id]
            logger.info(f"🗑️ Cleared conversation history for session {session_id}")


# Global instance
_llama_scout_instance = None


def get_llama_scout_ai() -> LlamaScoutMentalHealthAI:
    """Get or create Llama Scout AI instance"""
    global _llama_scout_instance
    if _llama_scout_instance is None:
        logger.info("🚀 Creating new Llama Scout AI instance...")
        _llama_scout_instance = LlamaScoutMentalHealthAI()
        logger.info("✅ Llama Scout Mental Health AI ready")
    else:
        logger.info("♻️ Returning existing Llama Scout AI instance")
    return _llama_scout_instance
