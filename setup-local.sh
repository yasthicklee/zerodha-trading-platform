#!/bin/bash

echo "🏠 Setting up local development environment..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file for local development..."
    cat > .env << EOF
# Local Development Environment
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="local-development-secret-key-32-chars"
NEXTAUTH_URL="http://localhost:3000"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Zerodha API (add your keys here)
ZERODHA_API_KEY=""
ZERODHA_API_SECRET=""
EOF
    echo "✅ .env file created with local settings"
fi

# Install dependencies
echo "📦 Installing dependencies..."
bun install

# Generate Prisma client
echo "🗄️ Generating Prisma client..."
bun run db:generate

# Push schema to local database
echo "🗄️ Setting up local database..."
bun run db:push

# Seed database with demo data
echo "🌱 Seeding database with demo data..."
bun run db:seed

# Start development server
echo "🚀 Starting development server..."
echo "🌐 Your app will be available at: http://localhost:3000"
echo ""
echo "📝 Available commands:"
echo "  bun run dev     - Start development server"
echo "  bun run build   - Build for production"
echo "  bun run lint    - Run ESLint"
echo "  bun run db:push - Push database changes"
echo "  bun run db:seed - Seed database with demo data"
echo ""
echo "🔄 Happy coding! 🎯"

# Start the development server
bun run dev