#!/usr/bin/env python3
"""
Setup script for Gemini API key
"""

import os
from dotenv import load_dotenv, set_key

def setup_gemini_api():
    """Setup Gemini API key"""
    
    print("🔑 Gemini API Key Setup")
    print("=" * 50)
    print("To get a Gemini API key:")
    print("1. Go to https://makersuite.google.com/app/apikey")
    print("2. Sign in with your Google account")
    print("3. Click 'Create API Key'")
    print("4. Copy the generated key")
    print("=" * 50)
    
    # For testing purposes, let's use a placeholder that will work with our fallback
    # In production, you would get a real API key from Google
    
    api_key = input("Enter your Gemini API key (or press Enter to use fallback mode): ").strip()
    
    if not api_key:
        print("⚠️ No API key provided. Using fallback mode.")
        api_key = "FALLBACK_MODE"
    
    # Update .env file
    env_path = ".env"
    if os.path.exists(env_path):
        set_key(env_path, "GEMINI_API_KEY", api_key)
        print(f"✅ Updated {env_path} with new API key")
    else:
        with open(env_path, 'w') as f:
            f.write(f"GEMINI_API_KEY={api_key}\n")
        print(f"✅ Created {env_path} with API key")
    
    print("\n🔄 Please restart the backend server to apply changes.")

if __name__ == "__main__":
    setup_gemini_api()