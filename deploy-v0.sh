#!/bin/bash

# NST Ask Platform - V0 Deployment Script
echo "🚀 Deploying NST Ask Platform to V0..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the project
echo "🔨 Building project..."
npm run build

# Deploy to Vercel
echo "🌐 Deploying to Vercel..."
vercel --prod

echo "✅ Deployment complete!"
echo "🔗 Your app is now live on Vercel"
echo "📱 You can now use this with V0 for UI generation"

# Instructions for V0 integration
echo ""
echo "🎨 V0 Integration Instructions:"
echo "1. Go to https://v0.dev"
echo "2. Create a new project"
echo "3. Import this repository"
echo "4. Use the components in the /components folder"
echo "5. Customize the UI using V0's AI-powered interface"
echo ""
echo "📁 Available Components:"
echo "- LoginPage.jsx - Authentication with mentor directory"
echo "- Dashboard.jsx - Main dashboard with doubt management"
echo "- Profile.jsx - User profile with XP system"
echo ""
echo "🎯 Features ready for V0:"
echo "- Responsive design with Tailwind CSS"
echo "- Modern gradient UI components"
echo "- Interactive elements and animations"
echo "- Media upload functionality"
echo "- XP system and gamification"
echo "- Real-time updates"
