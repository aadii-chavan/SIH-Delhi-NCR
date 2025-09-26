#!/bin/bash

# Backend startup script for conda environment
echo "Starting Delhi-NCR Air Quality Backend..."

# Navigate to backend directory
cd "$(dirname "$0")"

# Activate conda environment
echo "Activating conda environment 'air'..."
conda activate air

# Check if environment is activated
if [[ "$CONDA_DEFAULT_ENV" != "air" ]]; then
    echo "Error: Failed to activate conda environment 'air'"
    echo "Please create the environment first with: conda create -n air python=3.12"
    exit 1
fi

# Install dependencies if needed
echo "Installing/updating dependencies..."
pip install -r requirements.txt

# Start the FastAPI server
echo "Starting FastAPI server on http://localhost:8000"
echo "API Documentation available at: http://localhost:8000/docs"
echo "Press Ctrl+C to stop the server"
echo ""

python main.py
