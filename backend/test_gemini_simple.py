#!/usr/bin/env python3
"""
Simple Gemini API test
"""

import os
import google.generativeai as genai

# Set API key
os.environ['GEMINI_API_KEY'] = 'AIzaSyCJnMGm-wucmrTQDJDqF_uy_kEvU865v1k'
genai.configure(api_key=os.getenv('GEMINI_API_KEY'))

# Simple system prompt
system_prompt = """You are Healix, a compassionate mental health companion. 
Provide empathetic, supportive responses to help users with their mental health concerns.
Keep responses warm, understanding, and helpful."""

# Create model with minimal safety settings
model = genai.GenerativeModel(
    model_name="gemini-2.5-flash",
    generation_config={
        "temperature": 0.7,
        "max_output_tokens": 300,
    }
)

def test_response(user_input):
    try:
        prompt = f"{system_prompt}\n\nUser: {user_input}\n\nHealix:"
        response = model.generate_content(prompt)
        return response.text if response.text else "No response generated"
    except Exception as e:
        return f"Error: {e}"

# Test cases
test_cases = [
    "Hello, how are you?",
    "I feel anxious about my job interview tomorrow",
    "I'm feeling really happy today!",
    "I've been feeling sad lately"
]

print("Testing Gemini API with simple prompts:")
print("=" * 50)

for i, test_case in enumerate(test_cases, 1):
    print(f"\nTest {i}: {test_case}")
    result = test_response(test_case)
    print(f"Response: {result[:200]}...")
    print("-" * 30)