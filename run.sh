#!/bin/bash

# Check if python is installed
if ! command -v python3 &> /dev/null; then
    echo "Python3 is required but not found. Please install it."
    exit 1
fi

# Check if node is installed
if ! command -v node &> /dev/null; then
    echo "Node.js is required but not found. Please install it."
    exit 1
fi

# Setup and run backend
echo "Setting up backend..."
cd backend
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi
source venv/bin/activate
echo "Installing requirements..."
./venv/bin/pip install -r requirements.txt
echo "Starting Flask backend on port 5000..."
./venv/bin/python app.py &
BACKEND_PID=$!

# Setup and run frontend
echo "Setting up frontend..."
cd ../frontend
npm install
echo "Starting React frontend on port 3000..."
npm start &
FRONTEND_PID=$!

# Handle script termination
trap 'echo "Stopping servers..."; kill $BACKEND_PID; kill $FRONTEND_PID; exit' INT

# Keep the script running
echo "ML Data Prep Assistant is running. Press Ctrl+C to stop."
wait 