#!/bin/bash

# Build the client and server for Vercel deployment
echo "Building client..."
npm run build

# Handle database migrations if needed
if [ "$VERCEL_ENV" = "production" ]; then
  echo "Running database migrations..."
  npm run db:push
fi

echo "Build completed successfully!"