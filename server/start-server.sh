#!/bin/bash

# Load NVM
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Use Node 20
nvm use 20

# Start server
cd /Users/mohitsingh/Documents/AttendEase/Check-in-app/server
npm run dev
