#!/bin/bash
# Start the Knowledge Shadows backend server

cd "$(dirname "$0")"
source venv/bin/activate
echo "🚀 Starting Knowledge Shadows Backend..."
echo "📍 API: http://localhost:8000"
echo "📚 Docs: http://localhost:8000/docs"
echo ""
uvicorn app.main:app --reload
