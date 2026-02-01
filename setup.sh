#!/bin/bash

# ============================================================
# ਸਿੱਖੀ ਵਿੱਦਿਆ | Sikhi Vidhya Platform Setup Script
# ============================================================
# This script sets up the development environment for the
# Sikh knowledge and learning platform.
# ============================================================

set -e

echo ""
echo "  ੴ ਸਤਿ ਨਾਮੁ"
echo "  ਸਿੱਖੀ ਵਿੱਦਿਆ - Sikhi Vidhya Platform"
echo "  ================================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_step() {
  echo -e "${BLUE}→${NC} $1"
}

print_success() {
  echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
  echo -e "${YELLOW}!${NC} $1"
}

print_error() {
  echo -e "${RED}✗${NC} $1"
}

# Check for Node.js
print_step "Checking for Node.js..."
if ! command -v node &> /dev/null; then
  print_error "Node.js is not installed. Please install Node.js 18+ first."
  echo "  Visit: https://nodejs.org/"
  exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
  print_error "Node.js version 18 or higher is required. Current: $(node -v)"
  exit 1
fi
print_success "Node.js $(node -v) detected"

# Check for npm
print_step "Checking for npm..."
if ! command -v npm &> /dev/null; then
  print_error "npm is not installed."
  exit 1
fi
print_success "npm $(npm -v) detected"

# Install dependencies
print_step "Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
  print_success "Dependencies installed successfully"
else
  print_error "Failed to install dependencies"
  exit 1
fi

# Check for .env file
print_step "Checking environment configuration..."
if [ ! -f ".env" ]; then
  print_warning ".env file not found. Creating from .env.example..."
  if [ -f ".env.example" ]; then
    cp .env.example .env
    print_success ".env file created"
    echo ""
    print_warning "IMPORTANT: Please edit .env and set your DATABASE_URL"
    echo "  Example: DATABASE_URL=\"postgresql://user:password@localhost:5432/sikhi_vidhya\""
    echo ""
    read -p "Press Enter after updating .env, or Ctrl+C to exit and update manually..."
  else
    print_error ".env.example not found"
    exit 1
  fi
else
  print_success ".env file exists"
fi

# Generate Prisma client
print_step "Generating Prisma client..."
npx prisma generate

if [ $? -eq 0 ]; then
  print_success "Prisma client generated"
else
  print_error "Failed to generate Prisma client"
  exit 1
fi

# Push database schema
print_step "Pushing database schema..."
echo "  (This will create tables in your database)"
npx prisma db push

if [ $? -eq 0 ]; then
  print_success "Database schema pushed"
else
  print_error "Failed to push database schema. Check your DATABASE_URL in .env"
  exit 1
fi

# Seed the database
print_step "Seeding database with authoritative sources..."
npx prisma db seed

if [ $? -eq 0 ]; then
  print_success "Database seeded with sources, eras, raags, and Guru Sahibaan"
else
  print_warning "Database seeding failed (may already be seeded)"
fi

echo ""
echo "  ================================================"
echo "  ${GREEN}✓ Setup Complete!${NC}"
echo "  ================================================"
echo ""
echo "  To start the development server, run:"
echo ""
echo "    ${BLUE}npm run dev${NC}"
echo ""
echo "  Then open: http://localhost:3000"
echo ""
echo "  ਵਾਹਿਗੁਰੂ ਜੀ ਕਾ ਖਾਲਸਾ, ਵਾਹਿਗੁਰੂ ਜੀ ਕੀ ਫਤਿਹ"
echo ""
