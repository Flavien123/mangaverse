# Deployment Instructions

## Prerequisites
- Docker and Docker Compose installed on the target machine.
- Git (to clone the repository).

## Steps

1. **Clone the repository:**
   ```bash
   git clone <repository_url>
   cd manga
   ```

2. **Run the deployment script:**
   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   ```

   Or manually:
   ```bash
   docker compose up --build -d
   ```

3. **Access the application:**
   - Frontend: `http://localhost` (or your server's IP)
   - Backend API: `http://localhost:8000`

## Environment Variables
The application is configured via `docker-compose.yml`. You can modify the environment variables there if needed (e.g., database passwords, secret keys).

## Database
The application uses PostgreSQL. Data is persisted in a Docker volume named `manga_postgres_data`.
