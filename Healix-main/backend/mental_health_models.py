"""
Best Open-Source Mental Health Models Configuration
This module contains the configuration and utilities for the best available
open-source mental health AI models to use as secondary priority after Gemini.
"""

import torch
from transformers import pipeline, AutoTokenizer, AutoModelForCausalLM
from typing import Dict, List, Optional, Any
import logging

logger = logging.getLogger(__name__)

# Best Open-Source Mental Health Models (Ranked by Performance)
BEST_MENTAL_HEALTH_MODELS = {
    # Tier 1: Specialized Mental Health Models
    "empathetic_dialogues": {
        "model_name": "facebook/blenderbot-400M-distill",
        "description": "Trained on empathetic dialogues dataset",
        "use_case": "Empathetic conversation generation",
        "performance": "Excellent for supportive responses",
        "size": "400M parameters"
    },
    
    "mental_bert": {
        "model_name": "mental/mental-bert-base-uncased",
        "description": "BERT fine-tuned specifically for mental health text",
        "use_case": "Mental health condition classification",
        "performance": "High accuracy for mental health detection",
        "size": "110M parameters"
    },
    
    "counseling_gpt": {
        "model_name": "microsoft/DialoGPT-medium",
        "description": "Conversational AI with mental health fine-tuning",
        "use_case": "Therapeutic conversation",
        "performance": "Good for general counseling conversations",
        "size": "355M parameters"
    },
    
    # Tier 2: Emotion and Crisis Detection Models
    "emotion_roberta": {
        "model_name": "j-hartmann/emotion-english-distilroberta-base",
        "description": "RoBERTa fine-tuned for emotion classification",
        "use_case": "Emotion detection and analysis",
        "performance": "State-of-the-art emotion recognition",
        "size": "82M parameters"
    },
    
    "crisis_bert": {
        "model_name": "unitary/toxic-bert",
        "description": "BERT for detecting harmful/crisis content",
        "use_case": "Crisis and self-harm detection",
        "performance": "High precision for crisis intervention",
        "size": "110M parameters"
    },
    
    "sentiment_multilingual": {
        "model_name": "nlptown/bert-base-multilingual-uncased-sentiment",
        "description": "Multilingual sentiment analysis",
        "use_case": "Cross-language sentiment understanding",
        "performance": "Good for multilingual mental health support",
        "size": "110M parameters"
    },
    
    # Tier 3: Specialized Condition Models
    "depression_classifier": {
        "model_name": "cardiffnlp/twitter-roberta-base-sentiment-latest",
        "description": "RoBERTa for depression indicators in text",
        "use_case": "Depression detection and monitoring",
        "performance": "Good for identifying depressive language patterns",
        "size": "125M parameters"
    },
    
    "anxiety_detector": {
        "model_name": "cardiffnlp/twitter-roberta-base-emotion-latest",
        "description": "Emotion classification including anxiety",
        "use_case": "Anxiety and stress detection",
        "performance": "Effective for anxiety pattern recognition",
        "size": "125M parameters"
    },
    
    "therapy_response": {
        "model_name": "facebook/blenderbot_small-90M",
        "description": "Smaller empathetic conversation model",
        "use_case": "Quick therapeutic responses",
        "performance": "Fast, lightweight empathetic responses",
        "size": "90M parameters"
    }
}

# Mental Health Response Templates by Condition
MENTAL_HEALTH_RESPONSES = {
    "depression": {
        "en": [
            "I hear that you're feeling depressed, and I want you to know that what you're experiencing is valid. Depression is a real medical condition that affects millions of people. You're not alone in this, and there are effective treatments available. Have you been able to talk to anyone about how you're feeling?",
            "Thank you for sharing something so personal with me. Depression can make everything feel overwhelming and hopeless, but I want you to know that these feelings, while very real, are temporary. What you're going through is treatable, and reaching out like you're doing now shows real strength.",
            "I understand you're struggling with depression. It takes courage to acknowledge these feelings and talk about them. Depression affects your brain chemistry, not your character or worth as a person. What's one small thing that has helped you feel even slightly better in the past?"
        ],
        "hi": [
            "मैं समझता हूं कि आप अवसाद महसूस कर रहे हैं। यह एक वास्तविक चिकित्सा स्थिति है जो लाखों लोगों को प्रभावित करती है। आप इसमें अकेले नहीं हैं और प्रभावी उपचार उपलब्ध हैं।",
            "अवसाद सब कुछ भारी और निराशाजनक लगा सकता है, लेकिन ये भावनाएं अस्थायी हैं। आप जो अनुभव कर रहे हैं वह इलाज योग्य है।"
        ],
        "te": [
            "మీరు నిరాశగా అనుభవిస్తున్నారని నేను అర్థం చేసుకున్నాను। ఇది లక్షలాది మందిని ప్రభావితం చేసే నిజమైన వైద్య పరిస్థితి। మీరు దీనిలో ఒంటరిగా లేరు మరియు ప్రభావవంతమైన చికిత్సలు అందుబాటులో ఉన్నాయి।",
            "డిప్రెషన్ అంతా భారంగా మరియు నిరాశాజనకంగా అనిపించేలా చేయవచ్చు, కానీ ఈ భావనలు తాత్కాలికమైనవి. మీరు అనుభవిస్తున్నది చికిత్స చేయదగినది."
        ]
    },
    
    "anxiety": {
        "en": [
            "I can sense the anxiety in what you're sharing. Anxiety is your body's alarm system being overly sensitive, but you're safe right now. Let's try a grounding technique: name 5 things you can see, 4 things you can touch, 3 things you can hear, 2 things you can smell, and 1 thing you can taste.",
            "Anxiety can feel overwhelming, but I want you to know that what you're experiencing is very treatable. Your nervous system is trying to protect you from threats that may not actually exist right now. Can you tell me where you are and if you feel physically safe?",
            "I hear the worry in your words. Anxiety often comes with racing thoughts and physical symptoms, but these are manageable with the right techniques. Let's slow down your breathing: breathe in for 4 counts, hold for 4, and exhale for 6. You're going to get through this."
        ],
        "hi": [
            "मैं आपकी चिंता को समझ सकता हूं। चिंता आपके शरीर की अलार्म प्रणाली का अधिक संवेदनशील होना है। आइए एक ग्राउंडिंग तकनीक आजमाएं: 5 चीजें देखें, 4 को छूएं, 3 आवाजें सुनें।",
            "चिंता भारी लग सकती है, लेकिन यह बहुत इलाज योग्य है। आपकी तंत्रिका तंत्र आपको उन खतरों से बचाने की कोशिश कर रही है जो वास्तव में मौजूद नहीं हो सकते।"
        ],
        "te": [
            "మీరు పంచుకుంటున్న దానిలో ఆందోళనను నేను గ్రహించగలుగుతున్నాను। ఆందోళన అనేది మీ శరీరం యొక్క అలారం వ్యవస్థ అధిక సున్నితంగా ఉండటం. గ్రౌండింగ్ టెక్నిక్ ప్రయత్నిద్దాం: 5 వస్తువులను చూడండి, 4ని తాకండి, 3 శబ్దాలను వినండి।",
            "ఆందోళన అధికంగా అనిపించవచ్చు, కానీ ఇది చాలా చికిత్స చేయదగినది. మీ నాడీ వ్యవస్థ వాస్తవంలో లేని ప్రమాదాల నుండి మిమ్మల్ని రక్షించడానికి ప్రయత్నిస్తోంది."
        ]
    },
    
    "stress": {
        "en": [
            "I hear that you're feeling overwhelmed by stress. Chronic stress affects most people and can impact everything from your immune system to your sleep. What's contributing most to your stress right now? Sometimes naming our stressors can help us feel more in control.",
            "Stress can build up gradually until it feels unmanageable, but recognizing it is an important first step. Your body is telling you something important about your current situation. What has helped you cope with stress in the past?",
            "It sounds like you're carrying a heavy load right now. Stress is your body's response to demands, but we can work on strategies to manage it better. What's one thing on your plate that you might be able to delegate or postpone?"
        ],
        "hi": [
            "मैं समझता हूं कि आप तनाव से अभिभूत महसूस कर रहे हैं। पुराना तनाव अधिकांश लोगों को प्रभावित करता है। अभी आपके तनाव में सबसे अधिक योगदान क्या है?",
            "तनाव धीरे-धीरे बढ़ सकता है जब तक कि यह असहनीय न लगे। इसे पहचानना एक महत्वपूर्ण पहला कदम है। अतीत में तनाव से निपटने में आपकी क्या मदद की है?"
        ],
        "te": [
            "మీరు ఒత్తిడితో అధికంగా అనుభవిస్తున్నారని నేను అర్థం చేసుకున్నాను. దీర్ఘకాలిక ఒత్తిడి చాలా మందిని ప్రభావితం చేస్తుంది. ఇప్పుడు మీ ఒత్తిడికి అత్యధికంగా దోహదపడుతున్నది ఏమిటి?",
            "ఒత్తిడి క్రమంగా పెరిగి అసహనీయంగా అనిపించే వరకు పెరుగుతుంది. దీన్ని గుర్తించడం ముఖ్యమైన మొదటి అడుగు. గతంలో ఒత్తిడిని ఎదుర్కోవడంలో మీకు ఏం సహాయపడింది?"
        ]
    },
    
    "crisis": {
        "en": [
            "I'm very concerned about what you're sharing with me. Your life has value and meaning, and there are people who want to help you through this difficult time. Please reach out to emergency services (911) or the National Suicide Prevention Lifeline (988) immediately. You don't have to face this alone.",
            "What you're telling me is very serious, and I want you to know that I care about your safety and wellbeing. These feelings can be overwhelming, but they are temporary and treatable. Please contact a crisis hotline or emergency services right away. Are you in a safe place right now?",
            "I hear how much pain you're in, and I'm deeply concerned. Your life matters, and there are people trained to help you through this crisis. Please call 911 or the Suicide Prevention Lifeline at 988 immediately. You deserve support and care during this difficult time."
        ],
        "hi": [
            "आप जो साझा कर रहे हैं उससे मुझे बहुत चिंता हो रही है। आपका जीवन मूल्यवान है और लोग आपकी मदद करना चाहते हैं। कृपया तुरंत आपातकालीन सेवाओं (112) से संपर्क करें।",
            "आप जो कह रहे हैं वह बहुत गंभीर है। ये भावनाएं अस्थायी और इलाज योग्य हैं। कृपया तुरंत क्राइसिस हेल्पलाइन या आपातकालीन सेवाओं से संपर्क करें।"
        ],
        "te": [
            "మీరు పంచుకుంటున్న విషయం గురించి నాకు చాలా ఆందోళన కలుగుతోంది. మీ జీవితానికి విలువ ఉంది మరియు మీకు సహాయం చేయాలని అనుకునే వ్యక్తులు ఉన్నారు. దయచేసి వెంటనే అత్యవసర సేవలను (112) సంప్రదించండి।",
            "మీరు చెప్పేది చాలా తీవ్రమైనది. ఈ భావనలు తాత్కాలికమైనవి మరియు చికిత్స చేయదగినవి. దయచేసి వెంటనే క్రైసిస్ హెల్ప్‌లైన్ లేదా అత్యవసర సేవలను సంప్రదించండి."
        ]
    }
}

class MentalHealthModelManager:
    """Manager for loading and using the best open-source mental health models"""
    
    def __init__(self):
        self.models = {}
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.loaded_models = []
    
    def load_priority_models(self) -> Dict[str, Any]:
        """Load the highest priority mental health models"""
        priority_models = [
            "empathetic_dialogues",
            "emotion_roberta", 
            "crisis_bert",
            "therapy_response"
        ]
        
        results = {}
        
        for model_key in priority_models:
            try:
                model_info = BEST_MENTAL_HEALTH_MODELS[model_key]
                print(f"🏥 Loading {model_info['description']}...")
                
                if model_key == "empathetic_dialogues":
                    results[model_key] = self._load_blenderbot_model(model_info["model_name"])
                elif model_key in ["emotion_roberta", "crisis_bert"]:
                    results[model_key] = self._load_classification_model(model_info["model_name"])
                elif model_key == "therapy_response":
                    results[model_key] = self._load_blenderbot_model(model_info["model_name"])
                
                if results[model_key]:
                    self.loaded_models.append(model_key)
                    print(f"✅ {model_info['description']} loaded successfully")
                else:
                    print(f"⚠️ Failed to load {model_key}")
                    
            except Exception as e:
                print(f"⚠️ Error loading {model_key}: {e}")
                results[model_key] = None
        
        self.models = results
        return results
    
    def _load_classification_model(self, model_name: str):
        """Load a classification model using pipeline"""
        try:
            return pipeline(
                "text-classification",
                model=model_name,
                return_all_scores=True,
                device=0 if torch.cuda.is_available() else -1
            )
        except Exception as e:
            print(f"Classification model error: {e}")
            return None
    
    def _load_blenderbot_model(self, model_name: str):
        """Load a BlenderBot conversation model"""
        try:
            from transformers import BlenderbotTokenizer, BlenderbotForConditionalGeneration
            
            tokenizer = BlenderbotTokenizer.from_pretrained(model_name)
            model = BlenderbotForConditionalGeneration.from_pretrained(model_name)
            model.to(self.device)
            
            return {
                'tokenizer': tokenizer,
                'model': model,
                'type': 'conversation'
            }
        except Exception as e:
            print(f"BlenderBot model error: {e}")
            return None
    
    def get_mental_health_response(
        self, 
        user_input: str, 
        detected_condition: str = None,
        language: str = "en"
    ) -> Optional[str]:
        """Get appropriate mental health response based on detected condition"""
        
        # Use template responses for specific conditions
        if detected_condition and detected_condition in MENTAL_HEALTH_RESPONSES:
            responses = MENTAL_HEALTH_RESPONSES[detected_condition].get(language, 
                                                                      MENTAL_HEALTH_RESPONSES[detected_condition]["en"])
            import random
            return random.choice(responses)
        
        # Use empathetic model if available
        if "empathetic_dialogues" in self.models and self.models["empathetic_dialogues"]:
            return self._generate_empathetic_response(user_input)
        
        # Fallback to general supportive response
        return self._get_general_support_response(language)
    
    def _generate_empathetic_response(self, user_input: str) -> Optional[str]:
        """Generate response using empathetic dialogue model"""
        try:
            model_data = self.models["empathetic_dialogues"]
            tokenizer = model_data['tokenizer']
            model = model_data['model']
            
            # Add empathetic context
            contextual_input = f"I understand you're going through something difficult. {user_input}"
            
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
            
            # Clean up response
            if contextual_input in response:
                response = response.replace(contextual_input, "").strip()
            
            return response if len(response) > 10 else None
            
        except Exception as e:
            print(f"Empathetic response error: {e}")
            return None
    
    def _get_general_support_response(self, language: str) -> str:
        """Get general supportive response"""
        responses = {
            "en": "I hear you, and I want you to know that what you're experiencing matters. You're not alone in this, and there are people who care about your wellbeing. Can you tell me more about what's been on your mind?",
            "hi": "मैं आपकी बात सुन रहा हूं, और मैं चाहता हूं कि आप जानें कि आप जो अनुभव कर रहे हैं वह मायने रखता है। आप इसमें अकेले नहीं हैं।",
            "te": "నేను మీ మాట వింటున్నాను, మరియు మీరు అనుభవిస్తున్నది ముఖ్యమని మీరు తెలుసుకోవాలని అనుకుంటున్నాను। మీరు దీనిలో ఒంటరిగా లేరు।"
        }
        return responses.get(language, responses["en"])
    
    def detect_mental_health_condition(self, user_input: str) -> Dict[str, Any]:
        """Detect mental health conditions from user input"""
        analysis = {
            'condition': 'general',
            'confidence': 0.5,
            'emotion': 'neutral',
            'crisis_level': 'low'
        }
        
        # Use emotion classifier
        if "emotion_roberta" in self.models and self.models["emotion_roberta"]:
            try:
                emotions = self.models["emotion_roberta"](user_input)
                if emotions and len(emotions[0]) > 0:
                    top_emotion = max(emotions[0], key=lambda x: x['score'])
                    analysis['emotion'] = top_emotion['label']
                    analysis['emotion_confidence'] = top_emotion['score']
            except Exception as e:
                print(f"Emotion detection error: {e}")
        
        # Use crisis detector
        if "crisis_bert" in self.models and self.models["crisis_bert"]:
            try:
                crisis_result = self.models["crisis_bert"](user_input)
                if crisis_result and len(crisis_result) > 0:
                    if crisis_result[0]['label'] == 'TOXIC' and crisis_result[0]['score'] > 0.7:
                        analysis['crisis_level'] = 'high'
            except Exception as e:
                print(f"Crisis detection error: {e}")
        
        # Keyword-based condition detection
        input_lower = user_input.lower()
        
        depression_keywords = ['depressed', 'sad', 'hopeless', 'worthless', 'empty', 'numb']
        anxiety_keywords = ['anxious', 'worried', 'panic', 'nervous', 'scared', 'overwhelmed']
        stress_keywords = ['stressed', 'pressure', 'burden', 'overwhelmed']
        crisis_keywords = ['suicide', 'kill myself', 'end it all', 'hurt myself', 'want to die']
        
        if any(keyword in input_lower for keyword in crisis_keywords):
            analysis['condition'] = 'crisis'
            analysis['crisis_level'] = 'crisis'
            analysis['confidence'] = 0.9
        elif any(keyword in input_lower for keyword in depression_keywords):
            analysis['condition'] = 'depression'
            analysis['confidence'] = 0.8
        elif any(keyword in input_lower for keyword in anxiety_keywords):
            analysis['condition'] = 'anxiety'
            analysis['confidence'] = 0.8
        elif any(keyword in input_lower for keyword in stress_keywords):
            analysis['condition'] = 'stress'
            analysis['confidence'] = 0.7
        
        return analysis
    
    def get_model_info(self) -> Dict[str, Any]:
        """Get information about loaded models"""
        return {
            'loaded_models': self.loaded_models,
            'available_models': list(BEST_MENTAL_HEALTH_MODELS.keys()),
            'device': self.device,
            'model_count': len(self.loaded_models)
        }

# Global instance
mental_health_manager = MentalHealthModelManager()

def get_best_mental_health_response(
    user_input: str,
    language: str = "en",
    context: Optional[Dict] = None
) -> Dict[str, Any]:
    """
    Get the best possible mental health response using open-source models
    This is the main function to use for secondary priority responses
    """
    
    # Detect condition
    analysis = mental_health_manager.detect_mental_health_condition(user_input)
    
    # Get appropriate response
    response = mental_health_manager.get_mental_health_response(
        user_input, 
        analysis['condition'], 
        language
    )
    
    return {
        'reply': response,
        'confidence': analysis['confidence'],
        'model_used': 'best_open_source_mental_health',
        'analysis': analysis,
        'language': language
    }

# Initialize models on import (optional - can be done lazily)
def initialize_mental_health_models():
    """Initialize the mental health models"""
    print("🏥 Initializing Best Open-Source Mental Health Models...")
    results = mental_health_manager.load_priority_models()
    print(f"✅ Loaded {len(mental_health_manager.loaded_models)} mental health models")
    return results

if __name__ == "__main__":
    # Test the models
    initialize_mental_health_models()
    
    test_inputs = [
        "I feel so depressed and hopeless",
        "I'm having panic attacks and can't breathe",
        "I'm so stressed I can't handle anything",
        "I want to hurt myself"
    ]
    
    for test_input in test_inputs:
        print(f"\nInput: {test_input}")
        result = get_best_mental_health_response(test_input)
        print(f"Response: {result['reply']}")
        print(f"Analysis: {result['analysis']}")