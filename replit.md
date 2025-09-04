# SHARK LOTO 💵

## Overview

SHARK LOTO is a hybrid lottery analysis application that provides intelligent analysis for all Brazilian federal lottery games (Mega-Sena, Lotofácil, Lotomania, Super Sete, +Milionária, Quina, Dupla Sena, etc.). The application features AI-powered analysis using OpenAI's GPT models, real-time data from official lottery sources, and advanced pattern recognition to help users make informed decisions about their lottery game strategies.

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