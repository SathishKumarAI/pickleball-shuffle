#!/bin/bash
# Start Pickleball Shuffle production server
cd "$(dirname "$0")/app" && npm run build && npm start
