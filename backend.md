# Backend Implementation Guide for StepForge

**Version:** 1.0
**Date:** May 25, 2024

This document outlines the backend implementation plan for StepForge, a platform designed to guide users through application building step-by-step, emphasizing understanding over code copying.

---

## 1. Project Structure

```
src/
├── config/                 # Configuration files
│   ├── database.ts        # Database configuration
│   ├── auth.ts           # JWT and auth configuration
│   └── app.ts            # Express app configuration
├── middleware/            # Custom middleware
│   ├── auth.ts           # Authentication middleware
│   ├── validation.ts     # Request validation middleware
│   └── error.ts          # Error handling middleware
├── models/               # Database models (TypeORM/Prisma)
│   ├── User.ts
│   ├── Project.ts
│   ├── Milestone.ts
│   └── Step.ts
├── controllers/          # Route controllers
│   ├── auth.ts
│   ├── projects.ts
│   ├── progress.ts
│   └── comments.ts
├── routes/              # API routes
│   ├── auth.ts
│   ├── projects.ts
│   ├── progress.ts
│   └── comments.ts
├── services/            # Business logic
│   ├── auth.ts
│   ├── project.ts
│   ├── progress.ts
│   └── streak.ts
├── utils/              # Utility functions
│   ├── logger.ts
│   ├── errors.ts
│   └── validators.ts
└── app.ts             # Application entry point
```

---

## 2. API Design

We will follow a RESTful API design pattern, primarily using JSON for request and response bodies. Endpoints will be prefixed with `/api/v1`.

| Resource          | Endpoint                                     | Method | Description                                                                               | Request Body (JSON)                                 | Response Body (JSON)                                                                                                         | Authentication                             |
| :---------------- | :------------------------------------------- | :----- | :---------------------------------------------------------------------------------------- | :-------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------- | :----------------------------------------- |
| **Auth**          | `/api/v1/auth/register`                      | POST   | Register a new user.                                                                      | `{ username, email, password }`                     | `{ success, user: { id, username, email }, token }` (or error)                                                               | Public                                     |
|                   | `/api/v1/auth/login`                         | POST   | Authenticate a user.                                                                      | `{ email, password }`                               | `{ success, user: { id, username, email }, token }` (or error)                                                               | Public                                     |
|                   | `/api/v1/auth/me`                            | GET    | Get authenticated user's profile.                                                         | None                                                | `{ id, username, email, streak_count, last_streak_date, ... }` (or error)                                                    | Required                                   |
| **Projects**      | `/api/v1/projects`                           | GET    | List projects (filterable, searchable, sortable).                                         | Query Params: `tag`, `search`, `difficulty`, `sort` | `{ success, projects: [{ id, name, description, tags, difficulty, thumbnail_url, ... }] }`                                   | Public (but user progress requires auth)   |
|                   | `/api/v1/projects/:projectId`                | GET    | Get details for a specific project, including milestones and steps.                       | None                                                | `{ success, project: { id, name, description, milestones: [...], ... }, user_progress: { status, steps_completed: [...] } }` | Optional (shows progress if authenticated) |
|                   | `/api/v1/projects`                           | POST   | Create a new project (Admin only).                                                        | `{ name, description, ... }`                        | `{ success, project: { ... } }`                                                                                              | Admin Required                             |
| **User Progress** | `/api/v1/progress/:projectId/start`          | POST   | Start a project for the current user.                                                     | None                                                | `{ success, user_project_progress: { ... } }`                                                                                | Required                                   |
|                   | `/api/v1/progress/:projectId`                | GET    | Get current user's progress on a specific project.                                        | None                                                | `{ success, user_project_progress: { status, completed_steps: [{ step_id, completed_at, code_unlocked }], ... } }`           | Required                                   |
|                   | `/api/v1/progress/steps/:stepId/complete`    | POST   | Mark a specific step as completed for the current user on their current project instance. | None                                                | `{ success, user_step_progress: { ... }, project_status_updated: boolean }`                                                  | Required                                   |
|                   | `/api/v1/progress/steps/:stepId/unlock-code` | POST   | Request to unlock the code for a completed step.                                          | None                                                | `{ success, code_sample: "..." }` (or error if not allowed)                                                                  | Required                                   |
| **Community**     | `/api/v1/projects/:projectId/comments`       | GET    | Get comments for a project.                                                               | Query Params: `limit`, `offset`                     | `{ success, comments: [{ id, user: { id, username }, content, created_at, upvotes, downvotes }] }`                           | Public                                     |
|                   | `/api/v1/projects/:projectId/comments`       | POST   | Add a comment to a project.                                                               | `{ content }`                                       | `{ success, comment: { ... } }`                                                                                              | Required                                   |
|                   | `/api/v1/comments/:commentId/upvote`         | POST   | Upvote a comment.                                                                         | None                                                | `{ success, upvotes: count, downvotes: count }`                                                                              | Required                                   |
|                   | `/api/v1/comments/:commentId/downvote`       | POST   | Downvote a comment.                                                                       | None                                                | `{ success, upvotes: count, downvotes: count }`                                                                              | Required                                   |
|                   | `/api/v1/suggestions`                        | POST   | Suggest a new project.                                                                    | `{ title, description }`                            | `{ success, suggestion: { ... } }`                                                                                           | Required                                   |

---

## 3. Implementation Details

### 3.1 Authentication Middleware

```typescript
// src/middleware/auth.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config/auth";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ error: "Authentication required" });
    }

    const decoded = jwt.verify(token, config.jwtSecret) as {
      id: string;
      role: string;
    };

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid token" });
  }
};

export const adminMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
};
```

### 3.2 Request Validation Middleware

```typescript
// src/middleware/validation.ts
import { Request, Response, NextFunction } from "express";
import { body, validationResult } from "express-validator";

export const validateRegistration = [
  body("email").isEmail().normalizeEmail(),
  body("password").isLength({ min: 6 }),
  body("username").isLength({ min: 3 }),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

export const validateProject = [
  body("name").notEmpty(),
  body("description").notEmpty(),
  body("difficulty").isIn(["beginner", "intermediate", "advanced"]),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];
```

### 3.3 Error Handling Middleware

```typescript
// src/middleware/error.ts
import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger";

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: "error",
      message: err.message,
    });
  }

  logger.error("Unhandled error:", err);
  return res.status(500).json({
    status: "error",
    message: "Internal server error",
  });
};
```

### 3.4 Database Models (TypeORM Example)

```typescript
// src/models/User.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  username: string;

  @Column()
  passwordHash: string;

  @Column({ default: 0 })
  streakCount: number;

  @Column({ nullable: true })
  lastStreakDate: Date;

  @Column({ default: "user" })
  role: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

// src/models/Project.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from "typeorm";
import { Milestone } from "./Milestone";

@Entity("projects")
export class Project {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column("text")
  description: string;

  @Column("text", { nullable: true })
  longDescription: string;

  @Column()
  difficulty: string;

  @Column({ nullable: true })
  thumbnailUrl: string;

  @OneToMany(() => Milestone, (milestone) => milestone.project)
  milestones: Milestone[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### 3.5 Controllers

```typescript
// src/controllers/auth.ts
import { Request, Response } from "express";
import { AuthService } from "../services/auth";
import { AppError } from "../middleware/error";

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  register = async (req: Request, res: Response) => {
    try {
      const { email, password, username } = req.body;
      const result = await this.authService.register(email, password, username);
      res.status(201).json(result);
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  };

  login = async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;
      const result = await this.authService.login(email, password);
      res.json(result);
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  };
}

// src/controllers/projects.ts
import { Request, Response } from "express";
import { ProjectService } from "../services/project";
import { AppError } from "../middleware/error";
import { AuthRequest } from "../middleware/auth";

export class ProjectController {
  private projectService: ProjectService;

  constructor() {
    this.projectService = new ProjectService();
  }

  getProjects = async (req: Request, res: Response) => {
    try {
      const { tag, search, difficulty, sort } = req.query;
      const projects = await this.projectService.getProjects({
        tag: tag as string,
        search: search as string,
        difficulty: difficulty as string,
        sort: sort as string,
      });
      res.json({ success: true, projects });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  };

  getProject = async (req: Request, res: Response) => {
    try {
      const { projectId } = req.params;
      const project = await this.projectService.getProject(projectId);
      res.json({ success: true, project });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ error: error.message });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  };
}
```

### 3.6 Routes

```typescript
// src/routes/auth.ts
import { Router } from "express";
import { AuthController } from "../controllers/auth";
import { validateRegistration } from "../middleware/validation";

const router = Router();
const authController = new AuthController();

router.post("/register", validateRegistration, authController.register);
router.post("/login", authController.login);

export default router;

// src/routes/projects.ts
import { Router } from "express";
import { ProjectController } from "../controllers/projects";
import { authMiddleware, adminMiddleware } from "../middleware/auth";
import { validateProject } from "../middleware/validation";

const router = Router();
const projectController = new ProjectController();

router.get("/", projectController.getProjects);
router.get("/:projectId", projectController.getProject);
router.post(
  "/",
  [authMiddleware, adminMiddleware, validateProject],
  projectController.createProject
);

export default router;
```

### 3.7 Application Entry Point

```typescript
// src/app.ts
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { errorHandler } from "./middleware/error";
import authRoutes from "./routes/auth";
import projectRoutes from "./routes/projects";
import progressRoutes from "./routes/progress";
import commentRoutes from "./routes/comments";

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/projects", projectRoutes);
app.use("/api/v1/progress", progressRoutes);
app.use("/api/v1/comments", commentRoutes);

// Error handling
app.use(errorHandler);

export default app;
```

---

## 4. Security

- **Authentication:** Use JSON Web Tokens (JWT).
  - On login/registration, generate a token containing user ID and potentially roles. Sign the token with a strong secret key.
  - Send the token back to the client.
  - Client stores token (e.g., in `localStorage` or `HttpOnly` cookies).
  - For subsequent requests requiring authentication, client sends the token in the `Authorization: Bearer <token>` header.
  - Backend middleware verifies the token's signature and expiration, extracting the user ID to identify the authenticated user.
- **Authorization:**
  - Implement middleware/guards to protect routes based on authentication status (`@auth_required`) or user roles (`@role_required('admin')`).
  - **User-Specific Data Access:** Ensure users can only access or modify their _own_ progress data, bookmarks, or comments (unless they are admins). For example, when marking a step complete, verify the `user_project_progress` belongs to the authenticated user.
  - Admin Role: Define routes/actions accessible only by administrators (e.g., creating/editing projects, reviewing suggestions).
- **Password Security:** Store only salted and hashed passwords (e.g., using bcrypt) in the database. Never store plain text passwords.
- **Input Validation:** Sanitize and validate all user inputs on the backend to prevent SQL injection, XSS, and other vulnerabilities. Use libraries appropriate for the chosen framework/language.
- **Rate Limiting:** Implement rate limiting on authentication endpoints (`/auth/register`, `/auth/login`) to prevent brute-force attacks. Consider rate limiting on comment posting or project suggestions.
- **HTTPS:** All communication between the client and backend _must_ use HTTPS to protect data in transit.
- **CORS:** Configure Cross-Origin Resource Sharing (CORS) policies to specify which frontend origins are allowed to access the API.
- **Sensitive Data:** Be mindful of what data is returned to the client. Avoid exposing internal IDs unnecessarily (use UUIDs but still limit exposure where possible), password hashes, etc.

---

## 5. Performance

- **Database Indexing:** Create indices on columns frequently used in WHERE clauses, JOIN conditions, and ORDER BY clauses.
  - `users`: `email` (unique), `username` (unique)
  - `projects`: `slug` (unique), indices on `name`, `description`, `difficulty` for search/filtering. `created_at` for sorting.
  - `project_tags`: `project_id`, `tag_name`
  - `milestones`: `project_id`, `order_index`
  - `steps`: `milestone_id`, `order_index`
  - `user_project_progress`: `user_id`, `project_id` (unique index), `status`
  - `user_step_progress`: `user_project_progress_id`, `step_id` (unique index), `is_completed`
  - `comments`: `project_id`, `created_at`, `upvotes`
  - `project_suggestions`: `status`, `created_at`
  - `user_bookmarks`: `user_id`, `project_id` (unique index)
- **Optimize Database Queries:**
  - Avoid N+1 queries when fetching related data (e.g., fetch a project _and_ its milestones _and_ steps in a single query using joins where possible, or by fetching related data in batches).
  - Select only the columns needed.
  - Use efficient JOINs.
- **Caching:**
  - Implement a caching layer (e.g., using Redis) for frequently accessed read-heavy data that doesn't change often (e.g., project details, lists of popular projects, project overview metadata).
  - Cache user session data derived from JWTs.
- **Pagination:** Implement pagination for lists of projects and comments to avoid loading excessive data at once.
- **Asynchronous Processing:** Utilize the non-blocking I/O capabilities of Node.js. For any potentially blocking or long-running tasks (unlikely in this MVP, but for future features like complex reporting or notifications), consider offloading them to a message queue and worker processes.
- **CDN:** Use a Content Delivery Network (CDN) for serving static assets like screenshots, user avatars, etc.
- **Connection Pooling:** Use database connection pooling to manage connections efficiently and avoid the overhead of establishing a new connection for every request.

---

## 6. Testing

- **Unit Tests:** Test individual functions and methods in isolation.
  - Use Jest as the testing framework.
  - Mock external dependencies (database, external services).
  - Test edge cases and error conditions.
- **Integration Tests:** Test the interaction between components.
  - Test API endpoints using Supertest.
  - Test database operations with a test database.
  - Test authentication and authorization flows.
- **End-to-End Tests:** Test the complete application flow.
  - Use Cypress or Playwright for browser-based testing.
  - Test critical user journeys.
- **Performance Tests:** Test the application under load.
  - Use tools like k6 or Artillery.
  - Test response times and resource usage.
- **Security Tests:** Test for common vulnerabilities.
  - Use tools like OWASP ZAP.
  - Test authentication and authorization.
  - Test input validation and sanitization.

---

## 7. Deployment

- **Environment Setup:**
  - Use environment variables for configuration.
  - Use different configurations for development, staging, and production.
- **Containerization:**
  - Use Docker for containerization.
  - Create separate containers for the application and database.
  - Use Docker Compose for local development.
- **CI/CD:**
  - Use GitHub Actions for continuous integration and deployment.
  - Run tests on every push.
  - Deploy to staging on merge to main.
  - Deploy to production on release.
- **Monitoring:**
  - Use tools like Sentry for error tracking.
  - Use tools like Datadog for performance monitoring.
  - Set up alerts for critical errors and performance issues.
- **Logging:**
  - Use Winston for logging.
  - Log to a centralized logging service.
  - Set up log rotation and retention policies.
- **Backup:**
  - Set up regular database backups.
  - Test backup and restore procedures.
- **Scaling:**
  - Use horizontal scaling for the application.
  - Use a managed database service for the database.
  - Use a CDN for static assets.

```

```
