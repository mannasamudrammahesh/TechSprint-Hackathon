"""
Enhanced Text-to-Speech Service with Multilingual Support
Uses gTTS (Google Text-to-Speech) for high-quality multilingual TTS
"""

from gtts import gTTS
from io import BytesIO
import base64
from typing import Optional
import logging

logger = logging.getLogger(__name__)

# Language mapping for better TTS quality
LANGUAGE_MAP = {
    'en-US': 'en',
    'en-GB': 'en',
    'en-AU': 'en',
    'en-IN': 'en',
    'hi-IN': 'hi',
    'te-IN': 'te',
    'ta-IN': 'ta',
    'kn-IN': 'kn',
    'ml-IN': 'ml',
    'gu-IN': 'gu',
    'mr-IN': 'mr',
    'bn-IN': 'bn',
    'pa-IN': 'pa',
    'es-ES': 'es',
    'fr-FR': 'fr',
    'de-DE': 'de',
    'it-IT': 'it',
    'pt-PT': 'pt',
    'ru-RU': 'ru',
    'ja-JP': 'ja',
    'ko-KR': 'ko',
    'zh-CN': 'zh-CN',
    'zh-TW': 'zh-TW',
    'ar-SA': 'ar',
}

class TTSService:
    """Text-to-Speech service using gTTS"""
    
    @staticmethod
    def text_to_speech(
        text: str,
        language: str = 'en',
        slow: bool = False
    ) -> Optional[bytes]:
        """
        Convert text to speech audio
        
        Args:
            text: Text to convert to speech
            language: Language code (e.g., 'en', 'hi', 'te')
            slow: Whether to speak slowly
            
        Returns:
            Audio bytes in MP3 format, or None if error
        """
        try:
            # Map language code to gTTS format
            gtts_lang = LANGUAGE_MAP.get(language, language.split('-')[0])
            
            # Create TTS object
            tts = gTTS(text=text, lang=gtts_lang, slow=slow)
            
            # Save to BytesIO buffer
            audio_buffer = BytesIO()
            tts.write_to_fp(audio_buffer)
            audio_buffer.seek(0)
            
            return audio_buffer.read()
            
        except Exception as e:
            logger.error(f"TTS error: {e}")
            return None
    
    @staticmethod
    def text_to_speech_base64(
        text: str,
        language: str = 'en',
        slow: bool = False
    ) -> Optional[str]:
        """
        Convert text to speech and return as base64 string
        
        Args:
            text: Text to convert to speech
            language: Language code
            slow: Whether to speak slowly
            
        Returns:
            Base64 encoded audio string, or None if error
        """
        audio_bytes = TTSService.text_to_speech(text, language, slow)
        if audio_bytes:
            return base64.b64encode(audio_bytes).decode('utf-8')
        return None
    
    @staticmethod
    def detect_language(text: str) -> str:
        """
        Detect language from text (basic detection)
        
        Args:
            text: Text to analyze
            
        Returns:
            Detected language code
        """
        # Check for Indian language scripts
        if any('\u0900' <= char <= '\u097F' for char in text):  # Devanagari (Hindi)
            return 'hi'
        elif any('\u0C00' <= char <= '\u0C7F' for char in text):  # Telugu
            return 'te'
        elif any('\u0B80' <= char <= '\u0BFF' for char in text):  # Tamil
            return 'ta'
        elif any('\u0C80' <= char <= '\u0CFF' for char in text):  # Kannada
            return 'kn'
        elif any('\u0D00' <= char <= '\u0D7F' for char in text):  # Malayalam
            return 'ml'
        elif any('\u0A80' <= char <= '\u0AFF' for char in text):  # Gujarati
            return 'gu'
        elif any('\u0980' <= char <= '\u09FF' for char in text):  # Bengali
            return 'bn'
        elif any('\u0A00' <= char <= '\u0A7F' for char in text):  # Punjabi
            return 'pa'
        elif any('\u0900' <= char <= '\u097F' for char in text):  # Marathi (Devanagari)
            return 'mr'
        else:
            return 'en'  # Default to English

# Singleton instance
tts_service = TTSService()
