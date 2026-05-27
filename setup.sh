#!/bin/bash
# Pickleball Shuffle — Local Setup
# Run as: bash setup.sh

set -e

echo "🏓 Setting up Pickleball Shuffle..."

cd "$(dirname "$0")/app"

echo "[1/3] Installing dependencies..."
npm install

echo "[2/3] Building production app..."
npm run build

echo "[3/3] Done!"
echo ""
echo "  Dev server:   npm run dev       → http://localhost:3000"
echo "  Production:   npm start         → http://localhost:3000"
echo ""
echo "  Deploy to Vercel: push to GitHub, import at vercel.com"
echo "  Set root directory to 'app' in Vercel settings."
