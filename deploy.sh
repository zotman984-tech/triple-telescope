#!/bin/bash

# Deployment script for Vercel
# Run this script to deploy the latest changes

echo "🚀 Starting deployment to Vercel..."

# Add all changes
git add src/app/products/all/page.tsx

# Commit changes
git commit -m "Add URL-based tabs and pagination"

# Check if we have a remote
if ! git remote get-url origin &> /dev/null; then
    echo "⚠️  No git remote 'origin' found."
    echo "Please add your GitHub repository URL:"
    echo "git remote add origin YOUR_GITHUB_REPO_URL"
    exit 1
fi

# Push to main branch
git push origin main

echo "✅ Deployment triggered! Check Vercel dashboard for status."
