#!/bin/bash
# Deploy to Vercel (requires: npm i -g vercel)
# First time: vercel login
# NOTE: deploy from the REPO ROOT. The Vercel project's rootDirectory is
# already "app", so running from app/ makes Vercel look for app/app and fail.
cd "$(dirname "$0")"

if ! command -v vercel &>/dev/null; then
    echo "Installing Vercel CLI..."
    npm i -g vercel
fi

vercel --prod
