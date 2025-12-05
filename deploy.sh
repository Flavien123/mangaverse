#!/bin/bash

echo "Stopping existing containers..."
docker compose down

echo "Building and starting application..."
docker compose up --build -d

echo "Waiting for services to start..."
sleep 10

echo "Checking service status..."
docker compose ps

echo "Deployment complete! Application should be running on http://localhost"
