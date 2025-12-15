#!/bin/bash

echo "🚀 Deploying Zerodha Trading Platform to Vercel..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Install dependencies
echo "📦 Installing dependencies..."
bun install

# Generate Prisma client
echo "🗄️ Generating Prisma client..."
bun run db:generate

# Build the application
echo "🔨 Building application..."
bun run build

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel --prod

echo "✅ Deployment complete!"
echo "🌐 Your app is now live at: https://your-app-name.vercel.app"
echo ""
echo "📝 Next steps:"
echo "1. Set up environment variables in Vercel dashboard"
echo "2. Configure your PostgreSQL database"
echo "3. Add your Zerodha API credentials"
echo "4. Test the deployed application"