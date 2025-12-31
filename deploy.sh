#!/bin/bash

# HK Vet Finder VPS Deployment Script
# Usage: ./deploy.sh

echo "🚀 Starting deployment..."

# Check if npm is installed
if ! command -v npm &> /dev/null
then
    echo "❌ Error: npm is not installed. Please install Node.js and npm first."
    exit 1
fi

# Check if pm2 is installed
if ! command -v pm2 &> /dev/null
then
    echo "⚠️ PM2 not found. Installing globally..."
    npm install -g pm2
fi

echo "📦 Installing dependencies..."
npm install --frozen-lockfile || npm install

echo "🏗️ Building the application..."
npm run build || { echo "❌ Build failed!"; exit 1; }

# Create logs directory if it doesn't exist (for ecosystem.config.js)
mkdir -p logs

echo "🔄 Restarting application with PM2..."
# If the app is already running, it will reload. If not, it will start.
pm2 startOrReload ecosystem.config.js --update-env

echo "💾 Saving PM2 process list..."
pm2 save

echo "✅ Deployment successful!"
echo "📡 App is running. Check status with: pm2 status"
echo "📝 View logs with: pm2 logs hk-vet-finder --lines 50"
