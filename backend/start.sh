#!/bin/bash
# Render startup script for Healix Backend

echo "🚀 Starting Healix AI Backend..."
echo "📦 Port: $PORT"

# Start uvicorn with the FastAPI app
exec uvicorn main:app --host 0.0.0.0 --port ${PORT:-10000} --log-level info
