
#!/bin/bash

echo "🚀 Starting deployment process..."

# Check if required environment variables are set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL environment variable is required"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Build the application
echo "🔨 Building application..."
npm run build

# Run database migrations (if needed)
echo "🗄️ Running database migrations..."
npm run db:push || echo "⚠️ Database migrations skipped or failed"

# Start the application
echo "✅ Starting application..."
npm start
