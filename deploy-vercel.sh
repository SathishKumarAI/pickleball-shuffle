#!/bin/bash
# Deploy to Vercel (requires: npm i -g vercel)
# First time: vercel login
cd "$(dirname "$0")/app"

if ! command -v vercel &>/dev/null; then
    echo "Installing Vercel CLI..."
    npm i -g vercel
fi

vercel --prod
