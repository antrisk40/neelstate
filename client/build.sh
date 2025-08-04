#!/bin/bash

# Exit on any error
set -e

echo "Starting build process..."

# Clean previous build
echo "Cleaning previous build..."
rm -rf dist

# Install dependencies
echo "Installing dependencies..."
npm install

# Build the application
echo "Building application..."
npm run build

# Check if build was successful
if [ -d "dist" ]; then
    echo "Build successful! Build output:"
    ls -la dist/
    echo "Build completed successfully!"
else
    echo "Build failed! dist directory not found."
    exit 1
fi 