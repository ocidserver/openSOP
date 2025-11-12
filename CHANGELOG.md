# 📋 CHANGELOG - SOP Management System

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.1] - 2025-11-11

### 🔧 Fixed

**Backend Security & Maintenance:**

- Updated `multer` from `^1.4.5-lts.1` to `^2.0.0` (fixes security vulnerabilities in 1.x branch)
- Updated `supertest` from `^6.3.3` to `^7.1.3` (deprecated version fix)
- Backend: 0 vulnerabilities ✅

**Frontend Security & Maintenance:**

- Updated `vite` from `^5.0.8` to `^6.1.6` (fixes esbuild vulnerability GHSA-67mh-4wv8-2f99)
- Updated `@vitejs/plugin-vue` from `^4.5.2` to `^5.2.0` (compatibility with Vite 6.x)
- Updated `eslint` from `^8.56.0` to `^9.0.0` (unsupported version fix)
- Migrated to ESLint flat config format (`eslint.config.js`)
- Frontend: 0 vulnerabilities ✅

**Note:** All updates are backward compatible. No breaking changes in application code.

---

## [1.0.0] - 2025-11-11

### 🎉 Initial Release

#### ✨ Added

**Core Features:**

- Complete SOP management system for BPS
- User authentication and authorization (JWT-based)
- Role-based access control (ADMIN, MANAGER, REVIEWER, USER)
- CRUD operations for SOPs
- Version control for SOPs
- Category management system
- Department management
- Approval workflow system
- Audit logging for all operations
- Compliance tracking with read receipts
- Comment system for SOPs
- File attachment support
- Search and filter functionality
- Dashboard with statistics
- Reporting system (Inventory, Compliance)

**Backend:**

- RESTful API with Express.js
- PostgreSQL database with Prisma ORM
- JWT authentication middleware
- Input validation with Joi
- Error handling middleware
- File upload handling with Multer
- Logging with Winston
- Rate limiting
- CORS configuration
- Security headers with Helmet

**Frontend:**

- Vue.js 3 with Composition API
- Vuetify 3 Material Design UI
- Pinia state management
- Vue Router for navigation
- Responsive layout
- Login/authentication flow
- Dashboard with statistics
- SOP list and detail views
- User profile management
- Category management interface
- Department management interface
- Report views

**Infrastructure:**

- Docker support with docker-compose
- Nginx reverse proxy configuration
- PM2 process manager configuration
- PostgreSQL database setup
- File storage system
- SSL/HTTPS support
- Environment-based configuration

**Documentation:**

- Comprehensive README
- API documentation
- Deployment guide
- User manual (Indonesian)
- Architecture documentation
- Database schema documentation

#### 🔒 Security

- Password hashing with bcrypt
- JWT token authentication
- Role-based authorization
- Input validation and sanitization
- SQL injection prevention (Prisma)
- XSS protection
- Rate limiting
- CORS configuration
- Secure file upload handling

#### 🎨 Design

- Material Design (Vuetify)
- Responsive layout for mobile/tablet/desktop
- BPS brand color scheme
- Intuitive navigation
- Clean and professional UI

---

## [Unreleased]

### 🚀 Planned Features (Phase 2)

#### To Be Added

**Visual BPMN Editor:**

- [ ] Integrate BPMN.js editor
- [ ] Visual workflow designer
- [ ] Drag-and-drop interface
- [ ] BPMN diagram export

**Document Generator:**

- [ ] Auto-generate PDF from BPMN
- [ ] Custom PDF templates
- [ ] Word document export
- [ ] Template customization

**Advanced Features:**

- [ ] Full-text search with PostgreSQL FTS
- [ ] Advanced filtering and sorting
- [ ] Bulk operations
- [ ] Import/export SOPs
- [ ] Email notifications
- [ ] In-app notifications
- [ ] Real-time updates (WebSocket)
- [ ] Activity feeds
- [ ] Advanced analytics dashboard
- [ ] Custom report builder

**Enhancements:**

- [ ] Multi-language support
- [ ] Dark mode theme
- [ ] Mobile app (React Native)
- [ ] Offline support (PWA)
- [ ] Integration APIs
- [ ] Webhook support
- [ ] Advanced permission system
- [ ] Custom fields for SOPs
- [ ] Tags and labels
- [ ] Favorites and bookmarks

---

## Version History

### Version Naming Convention

`MAJOR.MINOR.PATCH`

- **MAJOR:** Incompatible API changes
- **MINOR:** Add functionality (backwards-compatible)
- **PATCH:** Bug fixes (backwards-compatible)

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on how to contribute to this project.

---

## Support

For questions or issues, contact:

- Email: support@bps.go.id
- Internal IT Support

---

**Maintained by:** BPS IT Team  
**Last Updated:** November 11, 2025
