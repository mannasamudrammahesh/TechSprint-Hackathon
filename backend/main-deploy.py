from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Dict, Any, Optional, List
from contextlib import asynccontextmanager
import tempfile
import os
import logging
from datetime import datetime
import json
import warnings

warnings.filterwarnings("ignore", category=UserWarning)
import io
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Lightweight imports for deployment
TORCH_AVAILABLE = False
WHISPER_AVAILABLE = False
TRANSFORMERS_AVAILABLE = False

print("🚀 Starting in deployment mode - using lightweight dependencies")

# Import only essential components
try:
    from llama_scout_integration import get_llama_scout_ai
    LLAMA_SCOUT_AVAILABLE = True
    print("✅ Llama Scout integration loaded")
except ImportError as e:
    LLAMA_SCOUT_AVAILABLE = False
    print(f"⚠️ Llama Scout not available: {e}")

# Continue with the rest of your main.py content...
# (I'll need to see more of the file to complete this)