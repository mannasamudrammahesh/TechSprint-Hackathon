#!/usr/bin/env python3

"""
Test script for response formatting
"""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

from main import improve_response_formatting

def test_formatting():
    print("🧪 Testing Response Formatting")
    print("=" * 40)
    
    # Test case 1: Long response without breaks
    test1 = "This is a long response without breaks. Let's try a grounding technique. What has been bothering you lately?"
    result1 = improve_response_formatting(test1)
    print("Test 1 - Long response:")
    print("Original:", repr(test1))
    print("Formatted:", repr(result1))
    print()
    
    # Test case 2: Response with bullet points
    test2 = "Here are some techniques: • Take deep breaths • Count to 10 • Practice mindfulness What works best for you?"
    result2 = improve_response_formatting(test2)
    print("Test 2 - With bullet points:")
    print("Original:", repr(test2))
    print("Formatted:", repr(result2))
    print()
    
    # Test case 3: Already well formatted
    test3 = "I understand your concern.\n\nLet's work through this together.\n\nWhat specific aspect worries you most?"
    result3 = improve_response_formatting(test3)
    print("Test 3 - Already formatted:")
    print("Original:", repr(test3))
    print("Formatted:", repr(result3))
    print()

if __name__ == "__main__":
    test_formatting()