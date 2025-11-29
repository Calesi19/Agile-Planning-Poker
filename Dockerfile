# Multi-stage Dockerfile for Agile Planning Poker
# Stage 1: Build Frontend
FROM node:22-alpine AS frontend-build

WORKDIR /app/frontend

# Copy frontend package files
COPY frontend/poker/package*.json ./

# Install dependencies
RUN npm ci

# Copy frontend source
COPY frontend/poker/ ./

# Build frontend for production
# Use empty VITE_API_URL to make API calls relative to same origin
ENV VITE_API_URL=""
RUN npm run build

# Stage 2: Build Backend
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS backend-build

WORKDIR /app/backend

# Copy backend project file
COPY backend/Poker.Api/*.csproj ./

# Restore dependencies
RUN dotnet restore

# Copy backend source
COPY backend/Poker.Api/ ./

# Build backend
RUN dotnet publish -c Release -o /app/publish

# Stage 3: Runtime
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime

WORKDIR /app

# Copy published backend
COPY --from=backend-build /app/publish ./

# Copy built frontend to wwwroot
COPY --from=frontend-build /app/frontend/dist ./wwwroot

# Expose port (Fly.io will use this)
EXPOSE 8080

# Set environment variables
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production

# Run the application
ENTRYPOINT ["dotnet", "Poker.Api.dll"]
