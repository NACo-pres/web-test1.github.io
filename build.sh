#!/bin/bash

# Exit if any command fails
set -e

echo "🔧 Installing client dependencies..."
cd client
npm install
npm run build
cd ..

echo "🔧 Installing server dependencies..."
cd server
npm install
cd ..

echo "📦 Copying build to server..."
cp -r client/dist/* server/public/


echo "✅ Build completed."
