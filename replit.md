# Shark Loterias 💵

## Overview

Shark Loterias is a hybrid lottery analysis application that provides intelligent analysis for all Brazilian federal lottery games (Mega-Sena, Lotofácil, Lotomania, Super Sete, +Milionária, Quina, Dupla Sena, etc.). The application features AI-powered analysis using OpenAI's GPT models, real-time data from official lottery sources, and advanced pattern recognition to help users make informed decisions about their lottery game strategies.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Library**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom cyberpunk/neon theme
- **State Management**: TanStack Query (React Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js for REST API endpoints
- **Build Tool**: ESBuild for production bundling
- **Development**: TSX for hot reloading during development

### Database Layer
- **ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL with Neon serverless configuration
- **Migrations**: Drizzle Kit for schema management
- **Connection**: Neon serverless with WebSocket support using ws library

### Authentication System
- **Provider**: Replit Auth using OpenID Connect
- **Session Management**: Express sessions with PostgreSQL store (connect-pg-simple)
- **Strategy**: Passport.js with OpenID Connect strategy
- **Security**: Session-based authentication with secure HTTP-only cookies

### AI Integration
- **Provider**: OpenAI GPT models for lottery analysis
- **Analysis Types**: Pattern recognition, number prediction, and strategy recommendations
- **Data Processing**: Frequency analysis and temperature mapping (hot/cold/warm numbers)
- **Caching**: Memoization for expensive AI operations

### API Architecture
- **Style**: RESTful API design
- **Data Fetching**: TanStack Query with custom query functions
- **Error Handling**: Centralized error middleware with structured responses
- **Validation**: Zod schemas for request/response validation

### Real-time Features
- **WebSocket Support**: For live lottery draw updates
- **Countdown Timers**: Real-time next draw countdowns
- **Live Data**: Integration with official lottery APIs for current results

## External Dependencies

### Core Dependencies
- **Database**: Neon PostgreSQL serverless database
- **Authentication**: Replit Auth service for user management
- **AI Service**: OpenAI API for intelligent lottery analysis
- **Official Data**: Brazilian Loterias Caixa API for real-time lottery data

### UI/UX Libraries
- **Component Library**: Radix UI for accessible, unstyled components
- **Icons**: Lucide React for consistent iconography
- **Animations**: Framer Motion for smooth animations and transitions
- **Styling**: Tailwind CSS with custom design system

### Development Tools
- **Type Safety**: TypeScript with strict configuration
- **Validation**: Zod for runtime type checking and schema validation
- **Code Quality**: ESLint and Prettier for code consistency
- **Build Optimization**: Vite with React plugin and runtime error overlay

### Third-party Integrations
- **Payment Processing**: Ready for integration with Brazilian payment providers
- **Analytics**: Prepared for integration with analytics services
- **Monitoring**: Error tracking and performance monitoring capabilities
- **CDN**: Google Fonts for typography (Inter, JetBrains Mono)

### Session and Storage
- **Session Store**: PostgreSQL-backed session storage
- **File Storage**: Local file system with support for cloud storage expansion
- **Caching**: In-memory caching with memoization for performance optimization

## Recent Changes

### October 04, 2025 - GitHub Import to Replit ✅

**Successfully imported and configured Shark Loterias in Replit environment!**

- ✅ **Database Connection**: PostgreSQL database automatically provisioned and connected
- ✅ **Workflow Configuration**: Development server configured on port 5000 with webview
- ✅ **Real Data Sync**: Successfully synced all 10 Brazilian lottery types from official Caixa API
- ✅ **API Endpoints**: All REST API endpoints operational and responding
- ✅ **Vite Configuration**: Frontend properly configured with allowedHosts for Replit proxy
- ✅ **Guest User**: Guest user automatically created for immediate dashboard access
- ✅ **Live Data**: Current lottery contests and prizes loaded from official sources

**Technical Setup:**
- Server running on `0.0.0.0:5000` with Express + Vite
- Database schema initialized with all tables (lottery_types, lottery_draws, users, etc.)
- Real-time data syncing from https://servicebus2.caixa.gov.br/portaldeloterias/api
- TypeScript compilation working with TSX for hot reload
- Deployment configured for Replit Autoscale with build and start scripts

**Current Lottery Data Loaded:**
1. Mega-Sena #2922 - R$ 12.000.000,00
2. Lotofácil #3503 - R$ 1.800.000,00
3. Quina #6843 - R$ 16.700.000,00
4. Lotomania #2831 - R$ 1.800.000,00
5. Dupla Sena #2868 - R$ 15.300.000,00
6. Super Sete #754 - R$ 1.900.000,00
7. +Milionária #290 - R$ 170.000.000,00
8. Timemania #2302 - R$ 30.500.000,00
9. Dia de Sorte (initialized)
10. Loteca #1213 - R$ 1.000.000,00

### September 04, 2025 - Dashboard Complete Overhaul ✅

**Shark Loterias Dashboard Completed Successfully!**

- ✅ **All Lottery Modalities**: Complete dashboard with all 8 Brazilian federal lottery types
- ✅ **Real-Time Data**: Integration with Caixa Econômica Federal API for live information
- ✅ **Next Draw Info**: Contest numbers, prize amounts, dates, and live countdowns
- ✅ **Time Countdown**: Real-time countdown timers for all lottery draws
- ✅ **Direct Access**: Removed login screen for immediate dashboard access
- ✅ **Responsive Menu**: Fixed navigation menu functionality (desktop + mobile)
- ✅ **Quick Actions**: Generate games and view heat maps directly from cards
- ✅ **Cyberpunk Theme**: Full implementation with neon colors and animations
- ✅ **Database Fixes**: Resolved SSL and connectivity issues
- ✅ **All Menus Working**: Navigation, mobile menu, and quick actions functional

**Lottery Modalities Implemented:**
1. **Mega-Sena** 💎 - R$ 50.000.000,00 estimated
2. **Lotofácil** ⭐ - R$ 1.500.000,00 estimated  
3. **Quina** 🪙 - R$ 800.000,00 estimated
4. **Lotomania** ♾️ - R$ 2.500.000,00 estimated
5. **Dupla Sena** 👑 - R$ 600.000,00 estimated
6. **Super Sete** 🚀 - R$ 3.000.000,00 estimated
7. **+Milionária** ➕ - R$ 10.000.000,00 estimated
8. **Timemania** 🎁 - R$ 2.000.000,00 estimated

**Technical Improvements:**
- All authentication barriers removed for direct access
- WebSocket connectivity issues resolved
- Database SSL configuration optimized
- Mobile responsiveness enhanced
- Real-time countdown implementation
- API integrations with official lottery data sources