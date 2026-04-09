#!/bin/bash

# Supabase Starter - Setup Script
# This script sets up your local development environment

set -e  # Exit on error

update_env_var() {
    local key="$1"
    local value="$2"

    if grep -q "^${key}=" .env.local; then
        sed -i.bak "s|^${key}=.*|${key}=${value}|" .env.local
        rm -f .env.local.bak
    else
        echo "${key}=${value}" >> .env.local
    fi
}

echo "🚀 Setting up Supabase Starter..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

echo "✅ Node.js is installed: $(node --version)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ npm is installed: $(npm --version)"

# Check if node_modules exists and dependencies are installed
echo ""
if [ -d "node_modules" ] && npm list > /dev/null 2>&1; then
    echo "✅ Dependencies are already installed"
else
    echo "📦 Installing dependencies..."
    npm install
    echo "✅ Dependencies installed successfully"
fi

# Check if Supabase CLI is available
if ! command -v supabase &> /dev/null; then
    echo ""
    echo "⚠️  Supabase CLI not found globally."
    echo "   Using npx supabase for Supabase operations..."
    SUPABASE_CMD="npx supabase"
else
    echo "✅ Supabase CLI is installed"
    SUPABASE_CMD="supabase"
fi

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo ""
    echo "📝 Creating .env.local..."
    cat > .env.local << 'EOF'
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
EOF
    echo "✅ .env.local created (credentials will be filled automatically)"
else
    echo "✅ .env.local already exists"
fi

echo ""
read -p "Use local or remote Supabase? [local/remote] (default: local) " SUPABASE_MODE
SUPABASE_MODE=${SUPABASE_MODE:-local}

if [[ "$SUPABASE_MODE" =~ ^[Rr]emote$ ]]; then
    echo ""
    echo "☁️  Configuring remote Supabase..."

    read -p "Enter your Supabase project ref: " PROJECT_REF
    if [ -z "$PROJECT_REF" ]; then
        echo "❌ Project ref is required for remote setup."
        exit 1
    fi

    echo ""
    echo "🔗 Linking Supabase CLI to project $PROJECT_REF..."
    $SUPABASE_CMD link --project-ref "$PROJECT_REF"

    echo ""
    read -p "Enter NEXT_PUBLIC_SUPABASE_URL (https://<project-ref>.supabase.co): " API_URL
    read -p "Enter NEXT_PUBLIC_SUPABASE_ANON_KEY: " ANON_KEY

    if [ -z "$API_URL" ] || [ -z "$ANON_KEY" ]; then
        echo "❌ Both NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are required."
        exit 1
    fi

    echo ""
    echo "📝 Updating .env.local..."
    update_env_var "NEXT_PUBLIC_SUPABASE_URL" "$API_URL"
    update_env_var "NEXT_PUBLIC_SUPABASE_ANON_KEY" "$ANON_KEY"
    echo "✅ .env.local updated with remote Supabase credentials"

    echo ""
    read -p "Push local migrations to remote now? (Y/n) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Nn]$ ]]; then
        echo "🗄️  Pushing migrations to remote database..."
        $SUPABASE_CMD db push
        echo "✅ Remote migrations applied"
    else
        echo "⏭️  Skipping migration push"
        echo "   Run '$SUPABASE_CMD db push' when ready"
    fi
else
    echo ""
    read -p "Do you want to start Supabase locally? (y/N) " -n 1 -r
    echo ""

    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo ""
        echo "🐳 Starting Supabase locally..."
        $SUPABASE_CMD start

        echo ""
        echo "✅ Supabase is running!"
        echo ""
        echo "🔑 Extracting credentials..."

        # Extract API URL and anon key from supabase status
        STATUS_OUTPUT=$($SUPABASE_CMD status 2>&1)

        # Extract Project URL specifically (avoid grabbing Studio/Mailpit URLs)
        API_URL=$(echo "$STATUS_OUTPUT" | grep "Project URL" | grep -o "http://[^[:space:]│]*" | head -1)
        if [ -z "$API_URL" ]; then
            API_URL=$(echo "$STATUS_OUTPUT" | grep -o "http://127\.0\.0\.1:[0-9]*" | head -1)
        fi

        # Extract Publishable key (look for sb_publishable_ pattern)
        ANON_KEY=$(echo "$STATUS_OUTPUT" | grep -o "sb_publishable_[-A-Za-z0-9_]*" | head -1)

        if [ -z "$API_URL" ] || [ -z "$ANON_KEY" ]; then
            echo "⚠️  Could not automatically extract credentials"
            echo "📋 Please manually copy and update .env.local:"
            echo ""
            echo "Add the following to .env.local:"
            echo "  NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321"
            echo "  NEXT_PUBLIC_SUPABASE_ANON_KEY=<Publishable key from below>"
            echo ""
            $SUPABASE_CMD status
        else
            echo "✅ Credentials extracted successfully"
            echo ""
            echo "📝 Updating .env.local..."
            update_env_var "NEXT_PUBLIC_SUPABASE_URL" "$API_URL"
            update_env_var "NEXT_PUBLIC_SUPABASE_ANON_KEY" "$ANON_KEY"
            echo "✅ .env.local updated with Supabase credentials!"
            echo ""
            echo "📋 Credentials:"
            echo "   API URL: $API_URL"
            echo "   Anon Key: ${ANON_KEY:0:20}..."
        fi

        # Run local database migrations if credentials were found
        if [ -n "$API_URL" ] && [ -n "$ANON_KEY" ]; then
            echo ""
            echo "🗄️  Applying pending database migrations to local database..."
            $SUPABASE_CMD migration up
            echo "✅ Pending local migrations applied!"
        else
            echo ""
            echo "⚠️  Skipping migrations until credentials are set in .env.local"
            echo "   Once you've added them, run: npx supabase migration up"
        fi
    fi
fi

echo ""
echo "✨ Setup complete!"
echo "📖 Next steps:"
echo "   1. Run 'npm run dev' to start the development server"
echo "   2. Visit http://localhost:3000"
echo "   3. Sign up for a new account to test authentication"
