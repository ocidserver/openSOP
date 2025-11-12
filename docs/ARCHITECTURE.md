# 🏛️ Architecture Guide - SOP Management System

## System Overview

SOP Management System (SOP-MS) adalah aplikasi full-stack berbasis web yang dibangun menggunakan arsitektur modern three-tier dengan separation of concerns yang jelas.

```
┌─────────────────────────────────────────────────────────┐
│                      CLIENT LAYER                        │
│  ┌────────────────────────────────────────────────┐    │
│  │  Vue.js 3 + Vuetify 3                          │    │
│  │  - Responsive UI                                │    │
│  │  - State Management (Pinia)                     │    │
│  │  - Routing (Vue Router)                         │    │
│  └────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
                           ↓ HTTP/HTTPS
┌─────────────────────────────────────────────────────────┐
│                   REVERSE PROXY LAYER                    │
│  ┌────────────────────────────────────────────────┐    │
│  │  Nginx                                          │    │
│  │  - Load Balancing                               │    │
│  │  - SSL Termination                              │    │
│  │  - Static File Serving                          │    │
│  │  - Rate Limiting                                │    │
│  └────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│                   APPLICATION LAYER                      │
│  ┌────────────────────────────────────────────────┐    │
│  │  Node.js + Express                              │    │
│  │  - RESTful API                                  │    │
│  │  - JWT Authentication                           │    │
│  │  - Business Logic                               │    │
│  │  - File Processing                              │    │
│  └────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│                     DATA LAYER                           │
│  ┌────────────────────────────────────────────────┐    │
│  │  PostgreSQL + Prisma ORM                        │    │
│  │  - Relational Database                          │    │
│  │  - Data Persistence                             │    │
│  │  - Transaction Management                       │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │  File Storage (Local)                           │    │
│  │  - SOP Documents                                │    │
│  │  - Attachments                                  │    │
│  │  - Generated Reports                            │    │
│  └────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

---

## Technology Stack

### Frontend

**Framework & Libraries:**

- **Vue.js 3** - Progressive JavaScript framework
- **Vuetify 3** - Material Design component framework
- **Pinia** - State management
- **Vue Router** - Client-side routing
- **Axios** - HTTP client
- **Chart.js** - Data visualization
- **date-fns** - Date manipulation

**Build Tools:**

- **Vite** - Fast build tool
- **ESLint** - Code linting

### Backend

**Framework & Libraries:**

- **Node.js 18+** - JavaScript runtime
- **Express** - Web application framework
- **Prisma ORM** - Database ORM
- **JWT (jsonwebtoken)** - Authentication
- **bcryptjs** - Password hashing
- **Joi** - Validation
- **Multer** - File upload handling
- **Winston** - Logging

### Database

- **PostgreSQL 14+** - Primary database
- **Prisma** - Database toolkit and ORM

### Infrastructure

- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Nginx** - Reverse proxy and load balancer
- **PM2** - Process manager (optional, for non-Docker)

---

## System Architecture Patterns

### 1. Layered Architecture

```
Presentation Layer (Frontend)
      ↓
API Layer (Express Routes)
      ↓
Business Logic Layer (Services)
      ↓
Data Access Layer (Prisma ORM)
      ↓
Database Layer (PostgreSQL)
```

### 2. RESTful API Design

- Resource-based URLs
- HTTP methods (GET, POST, PUT, DELETE)
- JSON request/response
- Stateless authentication (JWT)

### 3. MVC Pattern (Backend)

```
Controller → Service → Repository (Prisma) → Database
     ↓
Middleware (Auth, Validation, Error Handling)
```

---

## Database Schema Design

### Core Entities

1. **Users** - System users with roles
2. **Departments** - Organizational units
3. **Categories** - SOP categorization
4. **SOPDocuments** - Main SOP records
5. **SOPVersions** - Version history
6. **Attachments** - File attachments
7. **ApprovalWorkflows** - Approval processes
8. **AuditLogs** - System audit trail
9. **ReadReceipts** - Compliance tracking
10. **Comments** - User feedback

### Relationships

```
User ──┬─ CreatedBy ──→ SOPDocument
       ├─ BelongsTo ──→ Department
       └─ Has Many ──→ ReadReceipt

SOPDocument ──┬─ Has Many ──→ SOPVersion
              ├─ Has Many ──→ Attachment
              ├─ Has Many ──→ Comment
              ├─ BelongsTo ──→ Department
              └─ Has Many ──→ SOPCategory

Category ──→ Has Many ──→ SOPCategory
```

### Indexing Strategy

Key indexes for performance:

- `sop_documents(sopNumber)` - Unique lookup
- `sop_documents(status)` - Filtering
- `sop_documents(departmentId)` - Relationship
- `audit_logs(timestamp)` - Time-based queries
- `audit_logs(userId, action)` - User tracking

---

## Security Architecture

### Authentication Flow

```
1. User Login (POST /api/auth/login)
   ↓
2. Verify credentials (bcrypt)
   ↓
3. Generate JWT token
   ↓
4. Return token to client
   ↓
5. Client stores token (localStorage)
   ↓
6. Client sends token in Authorization header
   ↓
7. Server validates token (middleware)
   ↓
8. Grant/Deny access
```

### Authorization (RBAC)

**Role Hierarchy:**

```
ADMIN
  └─ Full system access
  └─ User management
  └─ System configuration

MANAGER
  └─ SOP CRUD operations
  └─ Approval workflows
  └─ Department management

REVIEWER
  └─ Review SOPs
  └─ Add comments

USER
  └─ Read approved SOPs
  └─ Add comments
```

### Security Measures

1. **Password Security**

   - bcrypt hashing (10 rounds)
   - Minimum 6 characters
   - No plain text storage

2. **JWT Security**

   - HS256 algorithm
   - Expiration: 7 days
   - Signed with secret key

3. **API Security**

   - Rate limiting (100 req/15min)
   - CORS configuration
   - Helmet.js security headers
   - Input validation (Joi)

4. **File Upload Security**

   - Size limit: 50MB
   - Type validation
   - Secure storage path

5. **Database Security**
   - Parameterized queries (Prisma)
   - Connection pooling
   - SQL injection prevention

---

## Data Flow Diagrams

### SOP Creation Flow

```
User (Manager) → Frontend Form
     ↓
POST /api/sop
     ↓
Auth Middleware → Validation Middleware
     ↓
SOP Controller
     ↓
SOP Service (Business Logic)
     ↓
Prisma Transaction:
  1. Create SOPDocument
  2. Create SOPVersion
  3. Link Categories
  4. Create AuditLog
     ↓
Return Response → Frontend Updates UI
```

### Approval Workflow

```
Manager creates SOP (DRAFT)
     ↓
Manager submits for review (IN_REVIEW)
     ↓
Reviewer reviews and comments
     ↓
Reviewer approves → Status: IN_APPROVAL
     ↓
Manager/Admin approves → Status: APPROVED
     ↓
SOP becomes active and visible to all
```

---

## Performance Considerations

### Caching Strategy

1. **Static Assets**

   - Nginx caching (1 year for assets)
   - Browser caching headers

2. **API Responses**
   - Consider Redis for frequently accessed data
   - Cache department/category lists

### Database Optimization

1. **Indexing** - Critical fields indexed
2. **Query Optimization** - Use Prisma includes wisely
3. **Connection Pooling** - Prisma connection pool
4. **Pagination** - Implement on large datasets

### File Storage

- Local file system for on-premise
- Organized by year/month structure
- File hash for duplicate detection

---

## Scalability

### Horizontal Scaling

```
Load Balancer (Nginx)
     ↓
┌─────┬─────┬─────┐
│ API │ API │ API │ (Multiple instances)
└─────┴─────┴─────┘
     ↓
PostgreSQL (Single instance or clustered)
```

### Vertical Scaling

- Increase server resources
- Optimize database queries
- Add read replicas

---

## Monitoring & Logging

### Application Logging

**Winston Logger Levels:**

- `error` - Error events
- `warn` - Warning events
- `info` - Informational messages
- `debug` - Debug information

**Log Locations:**

- `backend/logs/combined.log` - All logs
- `backend/logs/error.log` - Error logs only

### Audit Trail

All critical operations logged in `audit_logs` table:

- User actions (CREATE, UPDATE, DELETE)
- SOP status changes
- Approval actions
- Login/logout events

---

## Deployment Architecture

### Docker Compose Setup

```yaml
Services:
  - postgres (Database)
  - backend (API Server)
  - frontend (Vue.js Dev Server or Nginx)
  - nginx (Reverse Proxy)

Networks:
  - sop-network (Internal bridge network)

Volumes:
  - postgres_data (Database persistence)
  - backend/uploads (File storage)
  - backend/logs (Log files)
```

---

## API Design Principles

### RESTful Conventions

- **GET** - Retrieve resources
- **POST** - Create resources
- **PUT** - Update resources
- **DELETE** - Remove resources

### Response Format

**Success:**

```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "pagination": { ... }
}
```

**Error:**

```json
{
  "success": false,
  "message": "Error message",
  "errors": [ ... ]
}
```

---

## Future Enhancements

### Phase 2 Features

1. **BPMN Editor Integration**

   - Visual workflow designer
   - BPMN.js or similar library

2. **Document Generator**

   - Auto-generate PDF from BPMN
   - PDF templates with organization branding

3. **Advanced Search**

   - Full-text search (PostgreSQL FTS)
   - Elasticsearch integration

4. **Notifications**

   - Email notifications
   - In-app notifications
   - WebSocket for real-time updates

5. **Analytics Dashboard**
   - Advanced charts
   - Compliance metrics
   - Trend analysis

---

## Development Guidelines

### Code Structure

```
backend/
├── src/
│   ├── config/         # Configuration files
│   ├── controllers/    # Route controllers
│   ├── middleware/     # Middleware functions
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   ├── utils/          # Helper functions
│   └── server.js       # Entry point
└── prisma/
    ├── schema.prisma   # Database schema
    └── seed.js         # Database seeding

frontend/
├── src/
│   ├── assets/         # Static assets
│   ├── components/     # Vue components
│   ├── views/          # Page views
│   ├── router/         # Routing config
│   ├── stores/         # Pinia stores
│   ├── services/       # API services
│   ├── plugins/        # Vue plugins
│   └── App.vue         # Root component
```

### Coding Standards

- Use ESLint for code quality
- Follow Vue.js Style Guide
- Use async/await over callbacks
- Implement error handling
- Write meaningful commit messages

---

**For technical questions or clarifications, contact the development team.**

**Version:** 1.0.0  
**Last Updated:** November 2025
