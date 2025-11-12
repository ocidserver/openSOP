# 🤝 Contributing to SOP Management System

Thank you for your interest in contributing to the SOP Management System! This document provides guidelines for contributing to the project.

---

## 📋 Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Workflow](#development-workflow)
4. [Coding Standards](#coding-standards)
5. [Commit Messages](#commit-messages)
6. [Pull Request Process](#pull-request-process)
7. [Testing](#testing)
8. [Documentation](#documentation)

---

## 📜 Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inspiring environment for all contributors, regardless of background or identity.

### Expected Behavior

- Be respectful and inclusive
- Accept constructive criticism gracefully
- Focus on what is best for the organization
- Show empathy towards other contributors

### Unacceptable Behavior

- Harassment or discrimination
- Trolling or insulting comments
- Public or private harassment
- Publishing others' private information

---

## 🚀 Getting Started

### Prerequisites

Before contributing, ensure you have:

- Node.js 18+ installed
- PostgreSQL 14+ installed
- Git installed
- Code editor (VS Code recommended)
- Basic knowledge of:
  - JavaScript/TypeScript
  - Vue.js 3
  - Node.js/Express
  - PostgreSQL/Prisma

### Setting Up Development Environment

1. **Clone the repository:**

   ```bash
   git clone <repository-url>
   cd openSOP
   ```

2. **Install backend dependencies:**

   ```bash
   cd backend
   npm install
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Setup database:**

   ```bash
   npx prisma generate
   npx prisma migrate dev
   npx prisma db seed
   ```

4. **Install frontend dependencies:**

   ```bash
   cd ../frontend
   npm install
   cp .env.example .env
   ```

5. **Start development servers:**

   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev

   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

---

## 🔄 Development Workflow

### Branch Strategy

We follow **Git Flow** branching model:

```
main (production)
  ↓
develop (development)
  ↓
feature/feature-name (new features)
fix/bug-name (bug fixes)
hotfix/critical-fix (urgent fixes)
```

### Creating a Feature Branch

```bash
# Update develop branch
git checkout develop
git pull origin develop

# Create feature branch
git checkout -b feature/your-feature-name

# Work on your feature
# ... make changes ...

# Commit changes
git add .
git commit -m "feat: add new feature"

# Push to remote
git push origin feature/your-feature-name
```

---

## 💻 Coding Standards

### JavaScript/Vue.js

**Style Guide:**

- Follow [Vue.js Style Guide](https://vuejs.org/style-guide/)
- Use ESLint configuration provided
- Use Composition API over Options API
- Use `<script setup>` syntax

**Example:**

```vue
<template>
  <div class="component-name">
    <h1>{{ title }}</h1>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

const title = ref("Hello World");
const computedValue = computed(() => title.value.toUpperCase());
</script>

<style scoped>
.component-name {
  padding: 20px;
}
</style>
```

### Node.js/Express

**Guidelines:**

- Use async/await over callbacks
- Handle errors properly with try-catch
- Use middleware for cross-cutting concerns
- Follow RESTful API conventions
- Validate all inputs

**Example:**

```javascript
const { asyncHandler } = require("../middleware/errorHandler");

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const data = await service.getData();

    res.json({
      success: true,
      data,
    });
  })
);
```

### Database (Prisma)

**Guidelines:**

- Use transactions for multiple operations
- Include relevant relations
- Use pagination for large datasets
- Index frequently queried fields

**Example:**

```javascript
const result = await prisma.$transaction(async (tx) => {
  const record = await tx.model.create({ data });
  await tx.auditLog.create({ data: logData });
  return record;
});
```

---

## 📝 Commit Messages

### Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding tests
- `chore`: Maintenance tasks

### Examples

```bash
# Feature
feat(sop): add version control functionality

# Bug fix
fix(auth): correct token expiration handling

# Documentation
docs(api): update API documentation

# Multiple lines
feat(approval): implement approval workflow

- Add workflow model
- Create approval routes
- Implement email notifications

Closes #123
```

---

## 🔀 Pull Request Process

### Before Submitting

1. **Update your branch:**

   ```bash
   git checkout develop
   git pull origin develop
   git checkout your-branch
   git rebase develop
   ```

2. **Test your changes:**

   ```bash
   npm run test
   npm run lint
   ```

3. **Update documentation if needed**

### Submitting Pull Request

1. **Push your branch:**

   ```bash
   git push origin your-branch
   ```

2. **Create Pull Request on GitHub/GitLab**

3. **Fill in PR template:**

   ```markdown
   ## Description

   Brief description of changes

   ## Type of Change

   - [ ] Bug fix
   - [ ] New feature
   - [ ] Breaking change
   - [ ] Documentation update

   ## Testing

   How has this been tested?

   ## Checklist

   - [ ] Code follows style guidelines
   - [ ] Self-reviewed code
   - [ ] Commented complex code
   - [ ] Updated documentation
   - [ ] No new warnings
   - [ ] Added tests
   - [ ] All tests pass
   ```

4. **Wait for review**

### Review Process

- At least one reviewer approval required
- Address all review comments
- Update PR based on feedback
- Once approved, maintainer will merge

---

## 🧪 Testing

### Backend Testing

```bash
cd backend
npm run test
```

**Write tests for:**

- API endpoints
- Business logic
- Utility functions
- Middleware

**Example:**

```javascript
describe("SOP Controller", () => {
  it("should create new SOP", async () => {
    const response = await request(app)
      .post("/api/sop")
      .send(mockData)
      .expect(201);

    expect(response.body.success).toBe(true);
  });
});
```

### Frontend Testing

```bash
cd frontend
npm run test
```

---

## 📚 Documentation

### When to Update Documentation

- Adding new features
- Changing API endpoints
- Modifying configuration
- Fixing bugs that affect usage

### Documentation Files

- `README.md` - Project overview
- `docs/API.md` - API documentation
- `docs/DEPLOYMENT.md` - Deployment guide
- `docs/USER_MANUAL.md` - User manual
- `docs/ARCHITECTURE.md` - Technical architecture
- `CHANGELOG.md` - Version history

### API Documentation Format

```markdown
### POST /api/endpoint

Description of endpoint

**Request:**
\`\`\`json
{
"field": "value"
}
\`\`\`

**Response:**
\`\`\`json
{
"success": true,
"data": {}
}
\`\`\`
```

---

## 🐛 Reporting Bugs

### Before Reporting

1. Search existing issues
2. Verify bug still exists in latest version
3. Gather relevant information

### Bug Report Template

```markdown
**Describe the bug**
A clear description of the bug

**To Reproduce**
Steps to reproduce:

1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What you expected to happen

**Screenshots**
If applicable, add screenshots

**Environment:**

- OS: [e.g., Windows 10]
- Browser: [e.g., Chrome 96]
- Version: [e.g., 1.0.0]

**Additional context**
Any other relevant information
```

---

## 💡 Feature Requests

### Feature Request Template

```markdown
**Is your feature request related to a problem?**
Clear description of the problem

**Describe the solution you'd like**
What you want to happen

**Describe alternatives you've considered**
Alternative solutions or features

**Additional context**
Any other information
```

---

## 📞 Contact

**Development Team:**

- Email: dev@bps.go.id
- Internal Slack/Teams channel

**Project Maintainer:**

- BPS IT Team

---

## 📄 License

This project is internal to Badan Pusat Statistik (BPS). All contributions must comply with BPS policies and guidelines.

---

**Thank you for contributing to make SOP-MS better! 🎉**
