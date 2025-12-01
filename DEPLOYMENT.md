# Healix Backend Deployment Guide

## Issue Fixed
The deployment was failing due to numpy/pandas binary compatibility issues. This has been resolved by:

1. **Minimal Dependencies**: Created `requirements-minimal.txt` that avoids problematic ML libraries
2. **API-Based Approach**: Using external APIs (Gemini, OpenAI) instead of local ML models
3. **Deployment Configuration**: Added proper Render configuration

## Deployment Steps

### Option 1: Use Render.yaml (Recommended)
1. Push the code with the new `render.yaml` file
2. Render will automatically use the configuration

### Option 2: Manual Configuration
1. **Build Command**: `cd backend && pip install -r requirements-minimal.txt`
2. **Start Command**: `cd backend && uvicorn main:app --host 0.0.0.0 --port $PORT`
3. **Python Version**: 3.11.9

### Option 3: Use Deploy Script
1. **Build Command**: `cd backend && chmod +x deploy.sh && ./deploy.sh`
2. **Start Command**: Will be handled by the script

## Environment Variables
Make sure to set these in Render:
- `GEMINI_API_KEY`: Your Google Gemini API key
- `OPENAI_API_KEY`: Your OpenAI API key (if using)
- Any other API keys your app needs

## What Changed
- Disabled heavy ML libraries (PyTorch, Transformers, Whisper) for deployment
- Using API-based alternatives for AI functionality
- Minimal requirements file to avoid dependency conflicts
- Proper health check endpoint for Render port detection

## Testing
The app should now deploy successfully without the numpy/pandas compatibility error.