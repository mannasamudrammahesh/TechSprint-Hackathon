"""
Railway deployment entry point
This file helps Railway detect the Python app
The actual app is in backend/main.py
"""
import sys
import os

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

# Import the actual app
from backend.main import app

# Export for uvicorn
__all__ = ['app']
