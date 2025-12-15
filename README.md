# Zerodha Trading Platform

A modern, feature-rich Next.js application for algorithmic trading with Zerodha API integration. This platform provides comprehensive portfolio management, basket trading, and automated strategy execution.

## 🚀 Features

### Core Functionality
- **Zerodha API Integration**: Complete OAuth implementation for secure account connection
- **Basket Trading**: Create and manage custom stock baskets for diversified trading
- **Algorithmic Strategies**: Pre-built and custom trading strategies including SuperTrend
- **Real-time Signals**: Automated signal generation and execution tracking
- **Portfolio Management**: Comprehensive portfolio tracking with P&L analysis

### Technical Features
- **Modern UI**: Built with Next.js 15, TypeScript, and shadcn/ui components
- **Responsive Design**: Mobile-first design with Tailwind CSS
- **State Management**: Zustand for efficient client-side state management
- **Database**: Prisma ORM with SQLite for local development
- **API Routes**: RESTful API design for all trading operations

### Trading Features
- **SuperTrend Strategy**: Advanced trend-following indicator implementation
- **Strategy Templates**: Reusable strategy templates for quick deployment
- **Signal Management**: Track and execute trading signals with strength indicators
- **Risk Management**: Configurable stop-loss and target percentages

## 🏗️ Architecture

### Frontend
- **Framework**: Next.js 15 with App Router
- **UI Library**: shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS with custom design system
- **State**: Zustand for global state management
- **Icons**: Lucide React for consistent iconography

### Backend
- **API Routes**: Next.js API routes for server-side logic
- **Database**: Prisma ORM with SQLite
- **Authentication**: NextAuth.js ready for user management
- **External APIs**: Zerodha Kite Connect integration

### Database Schema
- **Users**: User authentication and profile management
- **Zerodha Profiles**: Encrypted API credential storage
- **Trading Baskets**: User-defined stock portfolios
- **Strategy Templates**: Reusable strategy definitions
- **User Strategies**: Individual strategy configurations
- **Strategy Signals**: Generated trading signals and execution tracking

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- Bun (recommended) or npm/yarn
- Zerodha Kite Connect API credentials

### Setup
```bash
# Clone the repository
git clone <repository-url>
cd zerodha-trading-platform

# Install dependencies
bun install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Set up database
bun run db:push

# Seed database with demo data
bun run seed-database.ts

# Start development server
bun run dev
```

### Environment Variables
```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

## 🔧 Configuration

### Zerodha API Setup
1. Visit [Kite Connect](https://kite.trade/connect/)
2. Create a new app
3. Get API Key and API Secret
4. Add redirect URI: `http://localhost:3000/api/zerodha/callback`
5. Connect through the platform settings

### Database Setup
```bash
# Generate Prisma client
bun run db:generate

# Push schema to database
bun run db:push

# Reset database (if needed)
bun run db:reset
```

## 📊 Usage

### Connecting to Zerodha
1. Click "Settings" in the top navigation
2. Enter your API Key and API Secret
3. Follow the OAuth flow to authorize
4. Your account will be connected and ready for trading

### Creating Baskets
1. Navigate to "Baskets" tab
2. Click "Create Basket"
3. Add stocks with quantities and weights
4. Save the basket for strategy use

### Setting Up Strategies
1. Go to "Strategies" tab
2. Click "Create Strategy"
3. Select a basket and strategy template
4. Configure parameters (SuperTrend period, multiplier, etc.)
5. Set risk management (stop-loss, target)
6. Activate the strategy

### Monitoring Signals
1. Check "Signals" tab for real-time updates
2. View signal strength and execution status
3. Track performance over time
4. Execute signals manually if needed

## 🎯 Strategy Types

### SuperTrend Indicator
- **Description**: Trend-following indicator using ATR-based bands
- **Parameters**: Period, Multiplier, ATR Period
- **Signals**: Buy on trend change up, Sell on trend change down
- **Best for**: Trending markets with clear direction

### Moving Average Crossover
- **Description**: Classic MA crossover strategy
- **Parameters**: Short MA period, Long MA period
- **Signals**: Buy when short MA crosses above long MA
- **Best for**: Markets with clear momentum

### RSI Mean Reversion
- **Description**: RSI-based overbought/oversold strategy
- **Parameters**: RSI period, Overbought level, Oversold level
- **Signals**: Buy when oversold, Sell when overbought
- **Best for**: Range-bound markets

## 🔒 Security

### API Security
- **Encryption**: All API secrets encrypted at rest
- **OAuth Flow**: Secure 3-legged OAuth implementation
- **Token Management**: Secure access token storage and refresh
- **HTTPS**: All API communications over HTTPS

### Data Protection
- **Input Validation**: Comprehensive input sanitization
- **SQL Injection**: Protected by Prisma ORM
- **XSS Prevention**: React's built-in XSS protection
- **CSRF Protection**: Next.js CSRF middleware

## 📈 Performance

### Frontend Optimizations
- **Code Splitting**: Automatic route-based code splitting
- **Image Optimization**: Next.js Image component usage
- **Bundle Analysis**: Optimized dependencies and imports
- **Caching**: Strategic caching of API responses

### Backend Optimizations
- **Database Indexing**: Optimized query performance
- **Connection Pooling**: Efficient database connections
- **API Caching**: Cached responses for frequent requests
- **Lazy Loading**: On-demand data fetching

## 🛠️ Development

### Project Structure
```
src/
├── app/                 # Next.js app router
│   ├── api/            # API routes
│   ├── page.tsx         # Main dashboard
│   └── layout.tsx       # Root layout
├── components/          # Reusable components
│   ├── ui/             # shadcn/ui components
│   └── zerodha-connection-dialog.tsx
├── lib/                # Utility libraries
│   ├── db.ts           # Prisma client
│   ├── store.ts        # Zustand store
│   ├── zerodha-api.ts # Zerodha API client
│   └── strategies/     # Trading strategies
└── hooks/              # Custom React hooks
```

### Available Scripts
```bash
# Development
bun run dev              # Start development server
bun run lint             # Run ESLint
bun run build            # Build for production

# Database
bun run db:push          # Push schema to database
bun run db:generate      # Generate Prisma client
bun run db:reset         # Reset database

# Production
bun run start            # Start production server
```

## 🧪 Testing

### Running Tests
```bash
# Run unit tests
bun run test

# Run integration tests
bun run test:integration

# Run E2E tests
bun run test:e2e
```

### Test Coverage
- Unit tests for utility functions
- Integration tests for API routes
- E2E tests for user workflows
- Performance tests for API endpoints

## 📚 API Documentation

### Authentication
```typescript
POST /api/zerodha/connect
GET  /api/zerodha/callback
```

### Baskets
```typescript
GET    /api/baskets
POST   /api/baskets
PUT    /api/baskets/[id]
DELETE /api/baskets/[id]
```

### Strategies
```typescript
GET    /api/strategies
POST   /api/strategies
PUT    /api/strategies/[id]
POST   /api/strategies/[id]/execute
```

### Signals
```typescript
GET    /api/signals
POST   /api/signals
PUT    /api/signals/[id]
```

## 🚀 Deployment

### Production Build
```bash
# Build application
bun run build

# Start production server
bun run start
```

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Environment Setup
- **Production URL**: Update NEXTAUTH_URL
- **Database**: Configure production database
- **API Keys**: Use production Zerodha API keys
- **SSL**: Enable HTTPS for production

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create feature branch
3. Make changes with tests
4. Run linting and tests
5. Submit pull request

### Code Standards
- **TypeScript**: Strict typing required
- **ESLint**: Follow configured rules
- **Prettier**: Consistent formatting
- **Testing**: Maintain test coverage

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

### Common Issues
- **API Connection**: Check Zerodha API credentials
- **Database**: Verify database URL and permissions
- **Build**: Clear node_modules and reinstall

### Getting Help
- **Documentation**: Check this README and inline comments
- **Issues**: Create GitHub issue with details
- **Community**: Join discussions for questions

## 🔄 Updates

### Version History
- **v1.0.0**: Initial release with core features
- **v1.1.0**: Added SuperTrend strategy
- **v1.2.0**: Enhanced UI and performance

### Roadmap
- **Mobile App**: React Native companion app
- **More Strategies**: Additional technical indicators
- **Advanced Analytics**: Enhanced performance metrics
- **Multi-Exchange**: Support for other brokers

---

**Built with ❤️ for the Indian trading community**