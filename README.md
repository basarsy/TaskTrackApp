# TaskTrack App 🚀

A comprehensive task management application built with modern web technologies, featuring role-based access control, real-time notifications, and a beautiful user interface.

## 🌟 Features

### 🔐 Authentication & Authorization
- **JWT-based authentication** with secure token management
- **Role-based access control** (Admin/User roles)
- **Auto-logout** on token expiration
- **Secure password hashing** using ASP.NET Core Identity

### 📋 Task Management
- **Create, Read, Update, Delete** tasks with rich details
- **Priority levels** (Low, Medium, High) with color-coded badges
- **Task status tracking** (Completed/In Progress)
- **Auto-assignment** for regular users
- **Admin task assignment** to any team member
- **Duplicate task name prevention** per user
- **Rich task descriptions** and timestamps

### 👥 User Management (Admin Only)
- **Create and manage users** with password requirements
- **Role assignment** and updates
- **User deletion** with safety restrictions
- **Duplicate username prevention**
- **Interactive team member list** with clickable profiles

### 📊 Team Analytics
- **Individual user task views** with detailed statistics
- **Completion rate tracking** per user
- **Task distribution overview**
- **Priority and status visualization**

### 🔔 User Experience
- **Real-time toast notifications** for all actions
- **Success/error feedback** for operations
- **Auto-populated edit forms** with existing data
- **Responsive design** for all screen sizes
- **Modern UI** with Shadcn/ui components

## 🏗️ Architecture

### Backend Services
- **MainService** - Core API for tasks and users (Port: 5091)
- **WorkerService** - Background jobs and scheduled tasks (Port: 5092)

### Frontend
- **React Application** - Modern SPA with TypeScript (Port: 5093)

### Infrastructure
- **PostgreSQL** - Primary database
- **Docker & Docker Compose** - Containerized deployment
- **Nginx** - Frontend proxy in production

## 🛠️ Technology Stack

### Backend
- **.NET 8** - Modern C# framework
- **ASP.NET Core Web API** - RESTful API development
- **Entity Framework Core** - ORM for database operations
- **PostgreSQL** - Robust relational database
- **JWT Authentication** - Secure token-based auth
- **AutoMapper** - Object mapping
- **Hangfire** - Background job processing

### Frontend
- **React 18** - Modern UI library
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/ui** - Beautiful component library
- **React Router** - Client-side routing
- **Context API** - State management

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Nginx** - Web server and reverse proxy

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- .NET 8 SDK (for development)
- Node.js 20+ (for frontend development)

### Production Deployment
```bash
# Clone the repository
git clone <repository-url>
cd TaskTrackApp

# Start all services
docker compose up -d

# Access the application
# Frontend: http://localhost:5093
# Backend API: http://localhost:5091
# Worker Service: http://localhost:5092
```

### Development Setup
```bash
# Use the provided setup script
./setup-dev.sh

# Or manually:
# 1. Start backend services
docker compose up mainservice workerservice -d

# 2. Start frontend in development mode
cd FrontService
npm install
npm run dev
```

## 📡 API Documentation

### Authentication Endpoints
```
POST /api/auth/login          # User login
POST /api/auth/test           # Token validation
```

### User Management (Admin)
```
GET    /api/user/get          # Get all users
GET    /api/user/get/{id}     # Get specific user
POST   /api/user/create       # Create new user
PUT    /api/user/update/{id}  # Update user info
PATCH  /api/user/changeRole/{id} # Change user role
DELETE /api/user/delete/{id}  # Delete user
```

### Task Management
```
GET    /api/task/get                    # Get all tasks (Admin)
GET    /api/task/get/{id}              # Get specific task
GET    /api/task/gettasksbyuser/{id}   # Get user's tasks
POST   /api/task/create                # Create new task
PUT    /api/task/update/{id}           # Update task
PATCH  /api/task/changeStatus/{id}     # Toggle task completion
PATCH  /api/task/prio/{id}             # Change task priority
POST   /api/task/assign/{id}           # Assign task to user
DELETE /api/task/delete/{id}           # Delete task
```

## 👤 Default Users

| Username | Password | Role  | Description |
|----------|----------|-------|-------------|
| admin    | admin123 | Admin | Full system access |

*Additional users can be created through the admin panel*

## 🎯 User Roles & Permissions

### Admin Users
- ✅ View all tasks and users
- ✅ Create, edit, delete tasks for anyone
- ✅ Assign tasks to team members
- ✅ Manage user accounts and roles
- ✅ Access team analytics and reports

### Regular Users
- ✅ View and manage their own tasks
- ✅ Create tasks (auto-assigned to self)
- ✅ Update task priorities and status
- ❌ Cannot access user management
- ❌ Cannot view other users' tasks

## 🔧 Configuration

### Environment Variables
```bash
# Development
VITE_API_BASE_URL=http://localhost:5091/api

# Production
VITE_API_BASE_URL=/api
```

### Database Configuration
The application uses PostgreSQL with Entity Framework migrations. Database is automatically initialized with Docker Compose.

## 📱 Screenshots & Usage

### Dashboard View
- Task overview with statistics
- Filter by priority and status
- Create new tasks with priority selection

### Team Management (Admin)
- Interactive user list with role badges
- Click on team members to view their tasks
- User creation with role assignment

### Task Details
- Rich task descriptions with timestamps
- Priority color coding (High=Red, Medium=Yellow, Low=Green)
- Completion status tracking

## 🧪 Testing

### API Testing
```bash
# Use the provided test script
./test-api.sh

# Manual testing with curl
curl -X POST http://localhost:5091/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"userName":"admin","userPassword":"admin123"}'
```

## 🚦 Deployment Modes

### Development Mode
- Frontend: Vite dev server (hot reload)
- Backend: Docker containers
- Database: PostgreSQL in Docker

### Production Mode
- All services containerized
- Nginx proxy for frontend
- Optimized builds and caching

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
1. Check the console logs for detailed error messages
2. Verify all services are running with `docker compose ps`
3. Review the API documentation above
4. Check network connectivity between services

---

**Built with ❤️ using modern web technologies**
