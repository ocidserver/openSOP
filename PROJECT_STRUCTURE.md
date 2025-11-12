# 📂 Project Structure - SOP Management System

```
openSOP/
│
├── 📄 README.md                    # Project overview dan quick start
├── 📄 CHANGELOG.md                 # Version history
├── 📄 CONTRIBUTING.md              # Contribution guidelines
├── 📄 LICENSE                      # License information
├── 📄 .gitignore                   # Git ignore rules
├── 📄 .editorconfig                # Editor configuration
├── 📄 docker-compose.yml           # Docker orchestration
│
├── 📁 backend/                     # Backend Application (Node.js + Express)
│   ├── 📄 package.json             # Node dependencies
│   ├── 📄 .env.example             # Environment template
│   ├── 📄 Dockerfile               # Docker image config
│   ├── 📄 ecosystem.config.json    # PM2 configuration
│   ├── 📄 jsconfig.json            # JavaScript config
│   ├── 📄 jest.config.js           # Testing configuration
│   │
│   ├── 📁 src/                     # Source code
│   │   ├── 📄 server.js            # Application entry point
│   │   │
│   │   ├── 📁 config/              # Configuration files
│   │   │   └── (database, jwt, etc.)
│   │   │
│   │   ├── 📁 controllers/         # Route controllers
│   │   │   ├── 📄 sop.controller.js
│   │   │   ├── 📄 user.controller.js
│   │   │   └── (other controllers)
│   │   │
│   │   ├── 📁 middleware/          # Middleware functions
│   │   │   ├── 📄 auth.js          # Authentication
│   │   │   ├── 📄 validator.js     # Input validation
│   │   │   └── 📄 errorHandler.js  # Error handling
│   │   │
│   │   ├── 📁 routes/              # API routes
│   │   │   ├── 📄 auth.routes.js   # Auth endpoints
│   │   │   ├── 📄 sop.routes.js    # SOP endpoints
│   │   │   ├── 📄 user.routes.js   # User endpoints
│   │   │   ├── 📄 category.routes.js
│   │   │   ├── 📄 department.routes.js
│   │   │   ├── 📄 approval.routes.js
│   │   │   ├── 📄 audit.routes.js
│   │   │   └── 📄 report.routes.js
│   │   │
│   │   ├── 📁 services/            # Business logic
│   │   │   └── (service classes)
│   │   │
│   │   └── 📁 utils/               # Utility functions
│   │       └── 📄 logger.js        # Winston logger
│   │
│   ├── 📁 prisma/                  # Prisma ORM
│   │   ├── 📄 schema.prisma        # Database schema
│   │   └── 📄 seed.js              # Database seeding
│   │
│   ├── 📁 uploads/                 # File storage
│   │   └── 📄 .gitkeep
│   │
│   └── 📁 logs/                    # Application logs
│       └── 📄 .gitkeep
│
├── 📁 frontend/                    # Frontend Application (Vue.js 3)
│   ├── 📄 package.json             # Node dependencies
│   ├── 📄 .env.example             # Environment template
│   ├── 📄 vite.config.js           # Vite configuration
│   ├── 📄 index.html               # HTML entry point
│   ├── 📄 Dockerfile               # Docker image config
│   ├── 📄 nginx.conf               # Nginx config for frontend
│   ├── 📄 .eslintrc.json           # ESLint configuration
│   │
│   └── 📁 src/                     # Source code
│       ├── 📄 main.js              # Application entry
│       ├── 📄 App.vue              # Root component
│       │
│       ├── 📁 assets/              # Static assets
│       │   └── 📄 main.css         # Global styles
│       │
│       ├── 📁 components/          # Vue components
│       │   ├── 📁 common/          # Reusable components
│       │   ├── 📁 sop/             # SOP-specific components
│       │   └── 📁 layout/          # Layout components
│       │
│       ├── 📁 views/               # Page views
│       │   ├── 📄 Dashboard.vue    # Dashboard page
│       │   ├── 📄 NotFound.vue     # 404 page
│       │   │
│       │   ├── 📁 Auth/            # Authentication views
│       │   │   └── 📄 Login.vue
│       │   │
│       │   ├── 📁 SOP/             # SOP views
│       │   │   ├── 📄 SOPList.vue
│       │   │   ├── 📄 SOPDetail.vue
│       │   │   ├── 📄 SOPCreate.vue
│       │   │   └── 📄 SOPEdit.vue
│       │   │
│       │   ├── 📁 Categories/
│       │   │   └── 📄 CategoryList.vue
│       │   │
│       │   ├── 📁 Departments/
│       │   │   └── 📄 DepartmentList.vue
│       │   │
│       │   ├── 📁 Users/
│       │   │   └── 📄 UserList.vue
│       │   │
│       │   ├── 📁 Reports/
│       │   │   └── 📄 ReportList.vue
│       │   │
│       │   └── 📁 Profile/
│       │       └── 📄 UserProfile.vue
│       │
│       ├── 📁 layouts/             # Layout templates
│       │   └── 📄 DefaultLayout.vue
│       │
│       ├── 📁 router/              # Vue Router
│       │   └── 📄 index.js         # Route definitions
│       │
│       ├── 📁 stores/              # Pinia stores
│       │   ├── 📄 auth.js          # Auth state
│       │   └── 📄 sop.js           # SOP state
│       │
│       ├── 📁 services/            # API services
│       │   ├── 📄 api.js           # Axios instance
│       │   └── 📄 sopService.js    # API calls
│       │
│       └── 📁 plugins/             # Vue plugins
│           └── 📄 vuetify.js       # Vuetify config
│
├── 📁 nginx/                       # Nginx configuration
│   ├── 📄 nginx.conf               # Main Nginx config
│   │
│   └── 📁 ssl/                     # SSL certificates
│       └── 📄 README.md
│
├── 📁 docs/                        # Documentation
│   ├── 📄 API.md                   # API documentation
│   ├── 📄 DEPLOYMENT.md            # Deployment guide
│   ├── 📄 USER_MANUAL.md           # User manual (Indonesian)
│   ├── 📄 ARCHITECTURE.md          # Technical architecture
│   └── 📄 QUICKSTART.md            # Quick start guide
│
└── 📁 scripts/                     # Helper scripts
    └── 📄 README.md                # Scripts documentation

```

---

## 📊 Statistics

### Backend

- **Total Routes:** 8 modules (auth, sop, user, category, department, approval, audit, report)
- **Middleware:** 3 (auth, validator, errorHandler)
- **Database Models:** 11 (User, Department, Category, SOPDocument, etc.)

### Frontend

- **Components:** Layout + 9 page views
- **Stores:** 2 (auth, sop)
- **Routes:** 11 routes with authentication guards

### Documentation

- **Total Docs:** 6 comprehensive guides
- **Languages:** English + Indonesian (User Manual)

---

## 🎯 Key Features Implemented

✅ User Authentication & Authorization (JWT + RBAC)  
✅ SOP CRUD Operations  
✅ Version Control System  
✅ Category & Department Management  
✅ Approval Workflow System  
✅ Audit Logging  
✅ Compliance Tracking (Read Receipts)  
✅ Comment System  
✅ File Attachments  
✅ Search & Filtering  
✅ Dashboard & Statistics  
✅ Reporting System  
✅ Docker Support  
✅ Comprehensive Documentation

---

## 🚀 Technology Summary

| Layer          | Technology           | Purpose                          |
| -------------- | -------------------- | -------------------------------- |
| **Frontend**   | Vue.js 3 + Vuetify 3 | User interface                   |
| **State**      | Pinia                | State management                 |
| **Routing**    | Vue Router           | Client-side routing              |
| **Backend**    | Node.js + Express    | REST API server                  |
| **Database**   | PostgreSQL + Prisma  | Data persistence                 |
| **Auth**       | JWT                  | Authentication                   |
| **Validation** | Joi                  | Input validation                 |
| **Logging**    | Winston              | Application logging              |
| **Deployment** | Docker + Nginx       | Containerization & reverse proxy |
| **Process**    | PM2                  | Process management               |

---

## 📈 Database Schema Overview

**Core Tables:**

1. `users` - User accounts (8 fields + relations)
2. `departments` - Organizational units (7 fields)
3. `categories` - SOP categorization (11 fields)
4. `sop_documents` - Main SOP records (24 fields)
5. `sop_versions` - Version history (14 fields)
6. `attachments` - File attachments (9 fields)
7. `approval_workflows` - Approval processes (8 fields)
8. `approval_actions` - Approval steps (8 fields)
9. `read_receipts` - Compliance tracking (6 fields)
10. `comments` - User feedback (8 fields)
11. `audit_logs` - System audit trail (11 fields)

**Total Relations:** 20+ foreign keys and associations

---

## 🔐 Security Features

- Password hashing (bcrypt)
- JWT token authentication
- Role-based access control (4 roles)
- Input validation on all endpoints
- SQL injection prevention (Prisma ORM)
- XSS protection
- CORS configuration
- Rate limiting
- Security headers (Helmet.js)
- File upload validation
- Audit logging

---

## 📦 Package Overview

### Backend Dependencies (Main)

- express (^4.18.2)
- @prisma/client (^5.7.0)
- jsonwebtoken (^9.0.2)
- bcryptjs (^2.4.3)
- joi (^17.11.0)
- winston (^3.11.0)

### Frontend Dependencies (Main)

- vue (^3.3.11)
- vuetify (^3.4.9)
- pinia (^2.1.7)
- vue-router (^4.2.5)
- axios (^1.6.2)
- chart.js (^4.4.1)

---

## 🎓 Learning Resources

**For Developers:**

- Vue.js 3: https://vuejs.org/
- Vuetify 3: https://vuetifyjs.com/
- Express: https://expressjs.com/
- Prisma: https://prisma.io/
- JWT: https://jwt.io/

**Internal Documentation:**

- [Quick Start Guide](docs/QUICKSTART.md)
- [API Documentation](docs/API.md)
- [Architecture Guide](docs/ARCHITECTURE.md)

---

_This structure represents the complete SOP Management System v1.0.0_  
_Last Updated: November 2025_
