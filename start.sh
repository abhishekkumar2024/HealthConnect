#!/bin/bash
# Install backend dependencies
cd backend && npm install --omit=dev

# Install frontend dependencies and build
cd ../frontend && npm install --omit=dev && npm run build

# Start backend
cd ../backend && npm start