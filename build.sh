#!/bin/bash

echo "Installing client dependencies..."
cd client
npm install
npm run build
cd ..

echo "Installing server dependencies..."
cd server
npm install
cd ..

echo "Copying build to server..."
mkdir -p server/public
cp -r client/dist/* server/public/
