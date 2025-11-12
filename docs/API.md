# 📘 API Documentation - SOP Management System

## Base URL

**Development:** `http://localhost:3000/api`  
**Production:** `https://your-domain.com/api`

## Authentication

All protected endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

---

## 🔐 Authentication Endpoints

### POST /auth/login

Login to the system

**Request:**

```json
{
  "email": "admin@bps.go.id",
  "password": "admin123"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "username": "admin",
      "email": "admin@bps.go.id",
      "fullName": "Administrator System",
      "role": "ADMIN"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### POST /auth/register

Register a new user (Admin only)

**Request:**

```json
{
  "username": "newuser",
  "email": "user@bps.go.id",
  "password": "password123",
  "fullName": "New User",
  "role": "USER",
  "departmentId": "uuid"
}
```

### GET /auth/me

Get current user profile (Protected)

### POST /auth/change-password

Change user password (Protected)

---

## 📄 SOP Endpoints

### GET /sop

Get all SOPs with pagination and filters

**Query Parameters:**

- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `search` (string): Search by title, description, or SOP number
- `status` (string): Filter by status (DRAFT, APPROVED, etc.)
- `departmentId` (string): Filter by department
- `complexity` (string): Filter by complexity (SIMPLE, MODERATE, COMPLEX)
- `categoryId` (string): Filter by category

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "sopNumber": "SOP/BPS/2025/001",
      "title": "Prosedur Pengumpulan Data",
      "status": "APPROVED",
      "department": {...},
      "categories": [...]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5
  }
}
```

### GET /sop/:id

Get SOP by ID

### POST /sop

Create new SOP (Manager/Admin only)

**Request:**

```json
{
  "sopNumber": "SOP/BPS/2025/002",
  "title": "New SOP",
  "description": "Description",
  "departmentId": "uuid",
  "complexity": "MODERATE",
  "categoryIds": ["uuid1", "uuid2"]
}
```

### PUT /sop/:id

Update SOP (Manager/Admin only)

### DELETE /sop/:id

Archive SOP (Admin only)

### POST /sop/:id/comment

Add comment to SOP (Protected)

---

## 📁 Category Endpoints

### GET /categories

Get all categories

**Query Parameters:**

- `type` (string): Filter by category type

### GET /categories/:id

Get category by ID

### POST /categories

Create category (Manager/Admin only)

### PUT /categories/:id

Update category (Manager/Admin only)

### DELETE /categories/:id

Delete category (Admin only)

---

## 🏢 Department Endpoints

### GET /departments

Get all departments

### GET /departments/:id

Get department by ID

### POST /departments

Create department (Admin only)

### PUT /departments/:id

Update department (Admin only)

---

## 👥 User Endpoints

### GET /users

Get all users (Manager/Admin only)

**Query Parameters:**

- `page`, `limit`: Pagination
- `search`: Search by name, email, or username
- `role`: Filter by role
- `status`: Filter by status
- `departmentId`: Filter by department

### GET /users/:id

Get user by ID (Protected)

### PUT /users/:id

Update user (Admin or Self)

### DELETE /users/:id

Deactivate user (Admin only)

---

## ✅ Approval Endpoints

### GET /approvals/sop/:sopId

Get workflows for a SOP

### POST /approvals

Create approval workflow

**Request:**

```json
{
  "sopId": "uuid",
  "workflowName": "SOP Approval",
  "actions": [
    {
      "actionType": "REVIEW",
      "actorId": "reviewer-uuid"
    },
    {
      "actionType": "APPROVE",
      "actorId": "manager-uuid"
    }
  ]
}
```

### POST /approvals/:workflowId/action

Take approval action

**Request:**

```json
{
  "actionType": "APPROVE",
  "comments": "Approved by manager"
}
```

---

## 📊 Report Endpoints

### GET /reports/dashboard

Get dashboard statistics (Protected)

**Response:**

```json
{
  "success": true,
  "data": {
    "summary": {
      "totalSOPs": 120,
      "totalUsers": 45,
      "approvedSOPs": 100,
      "draftSOPs": 20
    },
    "sopsByStatus": [...],
    "sopsByDepartment": [...],
    "recentSOPs": [...],
    "recentActivities": [...]
  }
}
```

### GET /reports/inventory

Get SOP inventory report (Manager/Admin only)

### GET /reports/compliance

Get compliance report (Manager/Admin only)

**Query Parameters:**

- `departmentId`: Filter by department
- `startDate`: Start date for reporting period
- `endDate`: End date for reporting period

---

## 📝 Audit Log Endpoints

### GET /audit

Get audit logs (Manager/Admin only)

**Query Parameters:**

- `page`, `limit`: Pagination
- `action`: Filter by action type
- `entityType`: Filter by entity type
- `userId`: Filter by user
- `sopId`: Filter by SOP
- `startDate`, `endDate`: Date range

### GET /audit/entity/:entityType/:entityId

Get audit logs for specific entity

---

## 🚫 Error Responses

All endpoints may return error responses in this format:

```json
{
  "success": false,
  "message": "Error message here",
  "errors": [...]  // Optional validation errors
}
```

**Common HTTP Status Codes:**

- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate data)
- `500` - Internal Server Error

---

## 📌 Notes

1. All timestamps are in ISO 8601 format
2. All IDs use UUID v4 format
3. Date filtering accepts ISO date strings
4. File uploads use `multipart/form-data`
5. Maximum file upload size: 50MB

For more details, see the source code in `/backend/src/routes/`
