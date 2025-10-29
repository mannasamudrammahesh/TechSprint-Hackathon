// Enhanced DialogGPT implementation for Healix AI Mental Health Platform
// Provides contextually appropriate mental health responses

interface ChatResponse {
  text: string;
  confidence: number;
  detectedEmotion?: string;
  urgencyLevel?: "low" | "medium" | "high" | "crisis";
  modelUsed?: string;
}

interface ConversationContext {
  topic: string;
  emotionalState: string;
  urgency: string;
  personalContext: string[];
  conversationFlow: string;
  interactionMode: "voice_assistant" | "council_chat" | "general";
}

// Voice Assistant Responses (Short, conversational)
const VOICE_ASSISTANT_RESPONSES = {
  depression: {
    en: [
      "I hear that you're feeling down. That's really tough. Have you been able to get outside today or talk to someone you trust?",
      "Depression can make everything feel heavy. You're brave for reaching out. What's one small thing that usually makes you feel a bit better?",
      "I'm sorry you're struggling with this. You don't have to face this alone. Is there someone in your life you can reach out to today?",
    ],
    hi: [
      "मैं समझता हूं कि आप उदास महसूस कर रहे हैं। यह बहुत कठिन है। क्या आप किसी भरोसेमंद व्यक्ति से बात कर सकते हैं?",
      "अवसाद सब कुछ भारी लगाता है। आपने संपर्क किया यह बहादुरी है। कोई छोटी सी बात है जो आपको बेहतर महसूस कराती है?",
    ],
    te: [
      "మీరు నిరాశగా ఉన్నారని నేను అర్థం చేసుకున్నాను। అది చాలా కష్టం. మీరు నమ్మకమైన ఎవరితోనైనా మాట్లాడగలరా?",
      "డిప్రెషన్ అంతా భారంగా అనిపించేలా చేస్తుంది. మీరు చేరుకున్నందుకు ధైర్యం చూపించారు. మీకు కొంచెం మంచి అనిపించే చిన్న విషయం ఏమైనా ఉందా?",
    ],
  },
  anxiety: {
    en: [
      "Anxiety can feel overwhelming. Let's slow down your breathing - breathe in for 4, hold for 4, out for 6. Are you somewhere safe right now?",
      "I can hear you're anxious. Try naming 3 things you can see around you. This can help ground you in the present moment.",
      "Anxiety is your body's alarm system being too sensitive. You're safe right now. What usually helps calm you down?",
    ],
    hi: [
      "चिंता बहुत भारी लग सकती है। आइए सांस धीमी करें - 4 तक सांस लें, 4 तक रोकें, 6 तक छोड़ें। क्या आप सुरक्षित जगह पर हैं?",
      "मैं समझता हूं आप चिंतित हैं। अपने आसपास 3 चीजों को देखकर नाम लें। यह आपको शांत करने में मदद करेगा।",
    ],
    te: [
      "ఆందోళన చాలా అధికంగా అనిపించవచ్చు. మన శ్వాసను మందగించుకుందాం - 4 వరకు ఊపిరి పీల్చండి, 4 పాటు పట్టుకోండి, 6 పాటు వదలండి. మీరు ఇప్పుడు సురక్షితమైన చోట ఉన్నారా?",
      "మీరు ఆందోళనలో ఉన్నారని నేను అర్థం చేసుకున్నాను. మీ చుట్టూ కనిపించే 3 వస్తువుల పేర్లను చెప్పండి. ఇది మిమ్మల్ని ప్రశాంతపరచడంలో సహాయపడుతుంది।",
    ],
  },
  stress: {
    en: [
      "Sounds like you're carrying a lot right now. What's the most urgent thing on your plate today?",
      "Stress builds up over time. What's one thing you could let go of or ask for help with?",
      "I hear you're overwhelmed. Sometimes we need to pause and breathe. What would help you feel lighter right now?",
    ],
    hi: [
      "लगता है आप पर बहुत दबाव है। आज सबसे जरूरी काम क्या है?",
      "तनाव समय के साथ बढ़ता है। कोई एक चीज है जिसे आप छोड़ सकें या मदद मांग सकें?",
    ],
    te: [
      "మీరు ఇప్పుడు చాలా భారం మోస్తున్నట్లు అనిపిస్తోంది. ఈ రోజు అత్యంత అవసరమైన పని ఏమిటి?",
      "ఒత్తిడి కాలక్రమేణా పెరుగుతుంది. మీరు వదులుకోవచ్చు లేదా సహాయం అడగవచ్చు అనేది ఏదైనా ఉందా?",
    ],
  },
};

// Council Chat Responses (Detailed, therapeutic)
const COUNCIL_CHAT_RESPONSES = {
  depression: {
    en: [
      "I hear that you're feeling depressed, and I want you to know that what you're experiencing is valid and you're not alone. Depression can make everything feel overwhelming and hopeless, but there are ways through this. Have you been feeling this way for a while now?\n\nWhat you're going through is a real medical condition, not a personal failing. Many effective treatments exist, including therapy, medication, and lifestyle changes. The fact that you're reaching out shows real strength.",
      "Thank you for trusting me with something so deeply personal. Depression affects millions of people worldwide, and it's completely treatable with the right support. What you're feeling - whether it's persistent sadness, loss of interest, or feelings of worthlessness - these are recognized symptoms that we can address.\n\nHave you been able to maintain your daily routines like eating and sleeping? Depression often affects these basic needs, and understanding how it's impacting you can help us think about supportive strategies.",
    ],
    hi: [
      "मैं समझता हूं कि आप उदास महसूस कर रहे हैं। आपकी भावनाएं मान्य हैं और आप अकेले नहीं हैं। अवसाद एक वास्तविक चिकित्सा स्थिति है, कोई व्यक्तिगत कमजोरी नहीं। क्या आप कुछ समय से ऐसा महसूस कर रहे हैं?\n\nअवसाद का इलाज संभव है। चिकित्सा, दवा और जीवनशैली में बदलाव से मदद मिल सकती है। आपका यहां आना साहस का प्रमाण है।",
    ],
    te: [
      "మీరు నిరాశగా అనుభవిస్తున్నారని నేను అర్థం చేసుకున్నాను. మీరు అనుభవిస్తున్నది చెల్లుబాటు అవుతుంది మరియు మీరు ఒంటరిగా లేరు. డిప్రెషన్ అనేది నిజమైన వైద్య పరిస్థితి, వ్యక్తిగత వైఫల్యం కాదు। మీరు ఎంతకాలంగా ఈ విధంగా అనుభవిస్తున్నారు?\n\nడిప్రెషన్ చికిత్స చేయవచ్చు. థెరపీ, మందులు మరియు జీవనశైలి మార్పుల ద్వారా సహాయం అందుబాటులో ఉంది। మీరు ఇక్కడకు రావడం నిజమైన ధైర్యాన్ని చూపిస్తుంది.",
    ],
  },
  anxiety: {
    en: [
      "I can sense the anxiety in your words, and I want you to know that anxiety is one of the most treatable mental health conditions. What you're experiencing - racing thoughts, physical symptoms like rapid heartbeat, or overwhelming worry - these are your body's natural alarm system responding to perceived threats.\n\nLet's start with grounding you in the present moment. Are you in a safe place right now? Try this technique: look around and name 5 things you can see, 4 things you can touch, 3 things you can hear, 2 things you can smell, and 1 thing you can taste.",
      "Thank you for sharing your anxiety with me. Your nervous system is working overtime, trying to protect you from threats that may not actually exist in your current environment. This is completely treatable with the right strategies.\n\nAnxiety often comes with 'what if' thoughts and physical symptoms. What specific situations or thoughts tend to trigger your anxiety most? Understanding your triggers can be really helpful in developing coping strategies.",
    ],
    hi: [
      "मैं आपकी चिंता को समझता हूं। चिंता सबसे अधिक इलाज योग्य मानसिक स्वास्थ्य स्थितियों में से एक है। आपके तेज़ विचार, दिल की धड़कन या अत्यधिक चिंता - यह आपके शरीर की प्राकृतिक अलार्म प्रणाली है।\n\nआइए वर्तमान क्षण में खुद को केंद्रित करें। क्या आप सुरक्षित जगह पर हैं? इस तकनीक को आजमाएं: 5 चीजें देखें, 4 को छूएं, 3 आवाजें सुनें।",
    ],
    te: [
      "మీ మాటల్లో ఆందోళన ఉందని నేను గ్రహించగలుగుతున్నాను. ఆందోళన అత్యంత చికిత్స చేయదగిన మానసిక ఆరోగ్య పరిస్థితుల్లో ఒకటి. మీరు అనుభవిస్తున్న వేగవంతమైన ఆలోచనలు, గుండె వేగంగా కొట్టుకోవడం - ఇది మీ శరీరం యొక్క సహజ అలారం వ్యవస్థ.\n\nప్రస్తుత క్షణంలో మిమ్మల్ని కేంద్రీకరించడంతో మొదలుపెట్టండి. మీరు ఇప్పుడు సురక్షితమైన స్థలంలో ఉన్నారా? ఈ పద్ధతిని ప్రయత్నించండి: 5 వస్తువులను చూడండి, 4ని తాకండి, 3 శబ్దాలను వినండి.",
    ],
  },
  stress: {
    en: [
      "I hear that you're feeling overwhelmed by stress. Chronic stress affects the vast majority of people and can impact everything from your immune system to your sleep patterns and mental clarity. Your body is designed to handle acute stress, but not the chronic pressure that modern life often presents.\n\nCan you help me understand what's contributing most to your stress right now? Is it work-related pressure, relationship issues, financial concerns, or perhaps a combination? Sometimes organizing and naming our stressors can help us feel more in control and identify which ones we can address first.",
      "Stress can build up gradually until it feels overwhelming, and recognizing it is an important first step. What you're experiencing is your body and mind telling you something important about your current situation.\n\nLet's think about stress management strategies. What has helped you cope with stress in the past? Sometimes we can't remove all stressors, but we can change how we respond to them.",
    ],
    hi: [
      "मैं समझता हूं कि आप तनाव से अभिभूत महसूस कर रहे हैं। पुराना तनाव अधिकांश लोगों को प्रभावित करता है और यह आपकी प्रतिरक्षा प्रणाली से लेकर नींद और मानसिक स्पष्टता तक सब कुछ प्रभावित कर सकता है।\n\nक्या आप मुझे समझाने में मदद कर सकते हैं कि अभी आपके तनाव में सबसे अधिक योगदान क्या है? काम का दबाव, रिश्ते की समस्याएं, या वित्तीय चिंताएं? कभी-कभी तनावों को व्यवस्थित करना और नाम देना हमें अधिक नियंत्रण महसूस कराने में मदद करता है।",
    ],
    te: [
      "మీరు ఒత్తిడితో అధికంగా అనుభవిస్తున్నారని నేను అర్థం చేసుకున్నాను. దీర్ఘకాలిక ఒత్తిడి చాలా మందిని ప్రభావితం చేస్తుంది మరియు మీ రోగనిరోధక వ్యవస్థ నుండి మీ నిద్ర విధానాలు మరియు మానసిక స్పష్టత వరకు ప్రతిదీ ప్రభావితం చేయవచ్చు.\n\nమీ ఒత్తిడికి ఇప్పుడు అత్యధికంగా దోహదపడుతున్న విషయం ఏమిటో అర్థం చేసుకోవడంలో మీరు నాకు సహాయపడగలరా? పని ఒత్తిడి, సంబంధాల సమస్యలు, ఆర్థిక ఆందోళనలు? కొన్నిసార్లు మన ఒత్తిడులను నిర్వహించడం మరియు పేరు పెట్టడం మనకు మరింత నియంత్రణ అనుభవించడంలో సహాయపడుతుంది.",
    ],
  },
};

class DialogGPTChat {
  private conversationHistory: string[] = [];
  private maxHistoryLength = 10;
  private backendUrl: string =
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";
  private sessionId: string = "";

  constructor() {
    this.sessionId = this.generateSessionId();
  }

  private generateSessionId(): string {
    return (
      "session_" + Math.random().toString(36).substr(2, 9) + "_" + Date.now()
    );
  }

  private analyzeUserInput(
    input: string,
    interactionMode: "voice_assistant" | "council_chat" = "council_chat",
  ): ConversationContext {
    const lowerInput = input.toLowerCase().trim();

    const emotionalState = this.detectEmotionalState(lowerInput);
    const topic = this.identifyTopicDynamically(lowerInput);
    const urgency = this.assessUrgencyLevel(lowerInput);
    const personalContext = this.extractPersonalContext(lowerInput);
    const conversationFlow = this.analyzeConversationFlow(input);

    return {
      topic,
      emotionalState,
      urgency,
      personalContext,
      conversationFlow,
      interactionMode,
    };
  }

  private detectEmotionalState(input: string): string {
    const emotionIndicators = {
      crisis:
        /\b(suicide|kill myself|end it all|hurt myself|can't go on|want to die|better off dead)\b/i,
      depression:
        /\b(depressed|sad|down|hopeless|empty|lonely|worthless|numb)\b/i,
      anxiety:
        /\b(anxious|worried|nervous|panic|scared|stress|overwhelmed|racing thoughts)\b/i,
      anger: /\b(angry|mad|frustrated|irritated|furious|rage)\b/i,
      confusion: /\b(confused|lost|don't know|uncertain|unclear|mixed up)\b/i,
      hope: /\b(better|improving|hopeful|positive|optimistic|progress)\b/i,
    };

    for (const [emotion, pattern] of Object.entries(emotionIndicators)) {
      if (pattern.test(input)) {
        return emotion;
      }
    }

    return "neutral";
  }

  private identifyTopicDynamically(input: string): string {
    const topicPatterns = {
      depression:
        /\b(depressed|depression|sad|down|hopeless|empty|lonely|worthless)\b/i,
      anxiety:
        /\b(anxious|anxiety|panic|worried|nervous|fear|scared|stress)\b/i,
      stress:
        /\b(stressed|stress|overwhelmed|pressure|burden|too much|burned out)\b/i,
      sleep: /\b(sleep|insomnia|tired|exhausted|can't sleep|nightmares)\b/i,
      relationships:
        /\b(relationship|partner|family|friend|marriage|divorce|breakup)\b/i,
      work: /\b(work|job|career|boss|colleague|workplace|unemployment)\b/i,
      health: /\b(health|medical|doctor|symptoms|illness|pain|medication)\b/i,
      crisis: /\b(suicide|self harm|hurt myself|end it all|can't go on)\b/i,
    };

    for (const [topic, pattern] of Object.entries(topicPatterns)) {
      if (pattern.test(input)) {
        return topic;
      }
    }

    return "general";
  }

  private assessUrgencyLevel(input: string): string {
    const crisisKeywords =
      /\b(suicide|kill myself|end it all|hurt myself|can't go on|want to die)\b/i;
    const highUrgencyKeywords =
      /\b(emergency|crisis|urgent|immediate|can't cope|breaking down|can't take it)\b/i;
    const mediumUrgencyKeywords =
      /\b(help|support|struggling|difficult|hard time|overwhelmed)\b/i;

    if (crisisKeywords.test(input)) return "crisis";
    if (highUrgencyKeywords.test(input)) return "high";
    if (mediumUrgencyKeywords.test(input)) return "medium";

    return "low";
  }

  private extractPersonalContext(input: string): string[] {
    const context: string[] = [];

    if (/\b(I am|I'm|I feel|I think|I have|my)\b/i.test(input)) {
      context.push("personal_experience");
    }

    if (/\b(today|yesterday|recently|lately|this week)\b/i.test(input)) {
      context.push("recent_experience");
    }

    if (/\b(always|never|usually|often|sometimes)\b/i.test(input)) {
      context.push("pattern_behavior");
    }

    return context;
  }

  private analyzeConversationFlow(input: string): string {
    const historyLength = this.conversationHistory.length;

    if (historyLength === 0) return "initial_contact";
    if (historyLength < 3) return "early_conversation";
    if (historyLength < 6) return "developing_rapport";

    return "established_conversation";
  }

  public async generateResponse(
    input: string,
    language: string = "en",
    interactionMode: "voice_assistant" | "council_chat" = "council_chat",
  ): Promise<ChatResponse> {
    try {
      console.log(`🧠 Generating ${interactionMode} response for: "${input}"`);

      const context = this.analyzeUserInput(input, interactionMode);
      this.conversationHistory.push(`User: ${input}`);

      // Handle crisis situations first
      if (context.urgency === "crisis") {
        const crisisResponse = this.getCrisisResponse(language);
        return {
          text: crisisResponse,
          confidence: 0.95,
          detectedEmotion: "crisis",
          urgencyLevel: "crisis",
          modelUsed: "crisis_intervention",
        };
      }

      // Generate appropriate response based on interaction mode
      let response: string;
      let modelUsed: string = "contextual_mental_health";

      if (interactionMode === "voice_assistant") {
        response = this.generateVoiceAssistantResponse(
          input,
          context,
          language,
        );
        modelUsed = "voice_assistant";
      } else {
        response = this.generateCouncilChatResponse(input, context, language);
        modelUsed = "council_chat";
      }

      // If no specific response generated, try backend or fallback
      if (!response || response.length < 20) {
        try {
          response = await this.tryBackendResponse(input, context, language);
          modelUsed = "backend_dialogpt";
        } catch (error) {
          response = this.generateGenericSupportResponse(context, language);
          modelUsed = "fallback_support";
        }
      }

      this.conversationHistory.push(`Assistant: ${response}`);

      // Maintain history length
      if (this.conversationHistory.length > this.maxHistoryLength * 2) {
        this.conversationHistory = this.conversationHistory.slice(
          -this.maxHistoryLength * 2,
        );
      }

      return {
        text: response,
        confidence: 0.85,
        detectedEmotion: context.emotionalState,
        urgencyLevel: context.urgency as any,
        modelUsed,
      };
    } catch (error) {
      console.error("DialogGPT Error:", error);
      return {
        text: "I'm here to support you, though I'm experiencing some technical difficulties right now. Your feelings and experiences matter, and I want to help in whatever way I can.",
        confidence: 0.5,
        modelUsed: "error_fallback",
      };
    }
  }

  private generateVoiceAssistantResponse(
    input: string,
    context: ConversationContext,
    language: string,
  ): string {
    const emotionalState = context.emotionalState;

    // Check if we have specific voice responses for this emotional state
    if (emotionalState in VOICE_ASSISTANT_RESPONSES) {
      const responses =
        VOICE_ASSISTANT_RESPONSES[
          emotionalState as keyof typeof VOICE_ASSISTANT_RESPONSES
        ];
      const langResponses =
        responses[language as keyof typeof responses] || responses.en;
      return langResponses[Math.floor(Math.random() * langResponses.length)];
    }

    // Fallback voice responses
    const fallbackResponses = {
      en: [
        "I hear you. Can you tell me more about what's going on?",
        "That sounds challenging. What would help you feel better right now?",
        "I'm here to listen. What's been on your mind lately?",
      ],
      hi: [
        "मैं आपकी बात सुन रहा हूं। और बताइए कि क्या हो रहा है?",
        "यह चुनौतीपूर्ण लगता है। अभी आपको बेहतर महसूस करने में क्या मदद मिलेगी?",
      ],
      te: [
        "నేను మీ మాట వింటున్నాను. ఏం జరుగుతుందో మరింత చెప్పగలరా?",
        "అది సవాలుగా అనిపిస్తోంది. ఇప్పుడు మీకు మంచి అనిపించడానికి ఏం సహాయపడుతుంది?",
      ],
    };

    const responses =
      fallbackResponses[language as keyof typeof fallbackResponses] ||
      fallbackResponses.en;
    return responses[Math.floor(Math.random() * responses.length)];
  }

  private generateCouncilChatResponse(
    input: string,
    context: ConversationContext,
    language: string,
  ): string {
    const emotionalState = context.emotionalState;

    // Check if we have specific council responses for this emotional state
    if (emotionalState in COUNCIL_CHAT_RESPONSES) {
      const responses =
        COUNCIL_CHAT_RESPONSES[
          emotionalState as keyof typeof COUNCIL_CHAT_RESPONSES
        ];
      const langResponses =
        responses[language as keyof typeof responses] || responses.en;
      return langResponses[Math.floor(Math.random() * langResponses.length)];
    }

    // Fallback council responses (more detailed than voice)
    const fallbackResponses = {
      en: [
        "Thank you for sharing this with me. Your feelings and experiences are completely valid, and I want you to know that you're not alone in whatever you're going through.\n\nMany people struggle with similar challenges, and reaching out for support - like you're doing right now - is actually a sign of strength, not weakness. It takes courage to be vulnerable and open about what's affecting your mental health.\n\nCan you tell me more about what's been happening? Sometimes talking through the details can help us better understand what you're experiencing and think about ways to support you through this.",
        "I hear you, and I want to acknowledge how difficult it can be to put your feelings into words and share them with someone. What you're experiencing matters, and your mental health and wellbeing are important.\n\nEveryone's journey with mental health is unique, but you don't have to navigate this alone. There are resources, strategies, and people who can help support you through whatever challenges you're facing.\n\nWhat feels most important for you to talk about right now? Is there a particular aspect of what you're going through that's weighing on you most heavily?",
      ],
      hi: [
        "आपने जो मेरे साथ साझा किया है उसके लिए धन्यवाद। आपकी भावनाएं और अनुभव पूरी तरह से मान्य हैं, और मैं चाहता हूं कि आप जानें कि आप जो भी कुछ झेल रहे हैं उसमें आप अकेले नहीं हैं।\n\nकई लोग समान चुनौतियों से जूझते हैं, और सहायता के लिए पहुंचना - जैसा कि आप अभी कर रहे हैं - वास्तव में ताकत का संकेत है, कमजोरी का नहीं।\n\nक्या आप मुझे और बता सकते हैं कि क्या हो रहा है? कभी-कभी विवरण के बारे में बात करने से हमें बेहतर समझ में आता है कि आप क्या अनुभव कर रहे हैं।",
      ],
      te: [
        "దీన్ని నాతో పంచుకున్నందుకు ధన్యవాదాలు. మీ భావనలు మరియు అనుభవాలు పూర్తిగా చెల్లుబాటు అవుతాయి, మరియు మీరు ఏమి అనుభవిస్తున్నారో దానిలో మీరు ఒంటరిగా లేరని మీరు తెలుసుకోవాలని అనుకుంటున్నాను।\n\nచాలా మంది వ్యక్తులు ఇలాంటి సవాళ్లతో పోరాడుతున్నారు, మరియు మద్దతు కోసం చేరుకోవడం - మీరు ఇప్పుడు చేస్తున్నట్లుగా - నిజానికి బలం యొక్క సంకేతం, బలహీనత కాదు।\n\nఏం జరుగుతుందో మరింత చెప్పగలరా? కొన్నిసార్లు వివరాల గురించి మాట్లాడటం మీరు ఏమి అనుభవిస్తున్నారో బాగా అర్థం చేసుకోవడంలో సహాయపడుతుంది.",
      ],
    };

    const responses =
      fallbackResponses[language as keyof typeof fallbackResponses] ||
      fallbackResponses.en;
    return responses[Math.floor(Math.random() * responses.length)];
  }

  private async tryBackendResponse(
    input: string,
    context: ConversationContext,
    language: string,
  ): Promise<string> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(`${this.backendUrl}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: input,
          language: language,
          session_id: this.sessionId,
          conversation_history: this.conversationHistory.slice(-6),
          context: {
            ...context,
            mental_health_mode: true,
          },
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        if (data.reply && data.reply.length > 10) {
          return data.reply.trim();
        }
      }
      throw new Error("Invalid backend response");
    } catch (error: any) {
      clearTimeout(timeoutId);
      console.warn("Backend not available:", error.message);
      throw error;
    }
  }

  private getCrisisResponse(language: string): string {
    const crisisResponses: Record<string, string> = {
      en: "I'm very concerned about what you're sharing. Your life has value and there are people who want to help you. Please reach out to emergency services (911) or the National Suicide Prevention Lifeline (988) immediately. You don't have to go through this alone. Are you in a safe place right now?",
      hi: "मुझे आपकी बात सुनकर बहुत चिंता हो रही है। आपका जीवन मूल्यवान है और लोग आपकी मदद करना चाहते हैं। कृपया तुरंत आपातकालीन सेवाओं (112) या मानसिक स्वास्थ्य हेल्पलाइन से संपर्क करें। आप अकेले नहीं हैं।",
      te: "మీరు పంచుకుంటున్న విషయం గురించి నాకు చాలా ఆందోళన కలుగుతోంది। మీ జీవితానికి విలువ ఉంది మరియు మీకు సహాయం చేయాలని అనుకునే వ్యక్తులు ఉన్నారు। దయచేసి వెంటనే అత్యవసర సేవలను (112) లేదా మానసిక ఆరోగ్య హెల్ప్‌లైన్‌ను సంప్రదించండి।",
    };
    return crisisResponses[language] || crisisResponses["en"];
  }

  private generateGenericSupportResponse(
    context: ConversationContext,
    language: string,
  ): string {
    const supportiveResponses: Record<string, string[]> = {
      en: [
        "I'm here to listen and support you. Your feelings and experiences are valid, and you don't have to face this alone. Can you tell me more about what's been going on?",
        "Thank you for reaching out and sharing this with me. It takes courage to talk about mental health, and I want you to know that I'm here to help. What's been weighing on your mind?",
        "I hear you, and I want you to know that what you're going through matters. You're not alone in this, and there are people and resources that can help support you. What would feel most helpful to talk about right now?",
      ],
      hi: [
        "मैं आपकी बात सुनने और आपका समर्थन करने के लिए यहां हूं। आपकी भावनाएं और अनुभव मान्य हैं, और आपको इसका सामना अकेले नहीं करना है। क्या आप मुझे बता सकते हैं कि क्या हो रहा है?",
        "संपर्क करने और मेरे साथ साझा करने के लिए धन्यवाद। मानसिक स्वास्थ्य के बारे में बात करने में साहस चाहिए। आपके मन में क्या भार है?",
      ],
      te: [
        "నేను వినడానికి మరియు మీకు మద్దతు ఇవ్వడానికి ఇక్కడ ఉన్నాను। మీ భావనలు మరియు అనుభవాలు చెల్లుబాటు అవుతాయి, మరియు మీరు దీన్ని ఒంటరిగా ఎదుర్కోవాల్సిన అవసరం లేదు। ఏం జరుగుతుందో మరింత చెప్పగలరా?",
        "చేరుకున్నందుకు మరియు దీన్ని నాతో పంచుకున్నందుకు ధన్యవాదాలు। మానసిక ఆరోగ్యం గురించి మాట్లాడటానికి ధైర్యం అవసరం. మీ మనసులో ఏమి భారంగా ఉంది?",
      ],
    };

    const responses = supportiveResponses[language] || supportiveResponses.en;
    return responses[Math.floor(Math.random() * responses.length)];
  }
}

// Export singleton instance
export const dialogGPTChat = new DialogGPTChat();
export default dialogGPTChat;

// Export the main function for API routes
export async function generateMentalHealthResponse(
  userPrompt: string,
  language: string = "en",
  context: string = "general",
): Promise<string> {
  try {
    const interactionMode =
      context === "voice_assistant" ? "voice_assistant" : "council_chat";
    const response = await dialogGPTChat.generateResponse(
      userPrompt,
      language,
      interactionMode,
    );
    return response.text;
  } catch (error) {
    console.error("Error generating mental health response:", error);
    return "I'm here to support you. Could you tell me more about what's on your mind?";
  }
}
