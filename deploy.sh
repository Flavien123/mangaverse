#!/bin/bash

# Stop existing containers
echo "Stopping existing containers..."
docker compose down

# Build and start containers in detached mode
echo "Building and starting application..."
docker compose up --build -d

# Wait for services to be ready
echo "Waiting for services to start..."
sleep 10

# Check status
echo "Checking service status..."
docker compose ps

echo "Deployment complete! Application should be running on http://localhost"
