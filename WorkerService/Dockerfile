# Doğru base: ASP.NET Core runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
# (opsiyonel) Kendi portunu açık dinle
ENV ASPNETCORE_URLS=http://+:8080

# Build aşaması
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
COPY ["WorkerService/WorkerService.csproj", "WorkerService/"]
RUN dotnet restore "WorkerService/WorkerService.csproj"
COPY . .
WORKDIR "/src/WorkerService"
RUN dotnet build "WorkerService.csproj" -c $BUILD_CONFIGURATION -o /app/build

# Publish
FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "WorkerService.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

# Final
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "WorkerService.dll"]
