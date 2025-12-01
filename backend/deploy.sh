#!/bin/bash
# Deployment script for Render

echo "🚀 Starting Healix Backend Deployment..."

# Use minimal requirements to avoid numpy/pandas conflicts
echo "📦 Installing minimal dependencies..."
pip install -r requirements-minimal.txt

echo "🔧 Starting server..."
uvicorn main:app --host 0.0.0.0 --port $PORT