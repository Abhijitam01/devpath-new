````markdown
# System Flow Document - StepForge

**Version:** 1.0
**Date:** May 25, 2025

## 1. Document Header

(Included above)

## 2. System Overview

The StepForge platform is a web-based application designed to guide users through building software projects step-by-step, emphasizing understanding over rote code copying. The system is primarily composed of a user-facing Frontend application, a Backend API, and a relational Database.

**Key Components:**

- **Frontend (UI Layer):** The user interface built with React, TypeScript, TailwindCSS, ShadCN (potentially Next.js). Handles user interaction, displays content, manages UI state, and communicates with the Backend API.
- **Backend (API Layer):** Handles business logic, data validation, authentication, authorization, and interaction with the database. Provides APIs for user management, project content, progress tracking, community features, and search/discovery.
- **Database (Persistence Layer):** Stores all application data, including user profiles, project content (milestones, steps, tasks, hints, code snippets), user progress, streaks, achievements, comments, and project metadata (tags, popularity).
- **Optional External Services:** (Future consideration) File storage (e.g., S3 compatible) for goal screenshots, potentially caching layers (e.g., Redis).

**High-Level Interaction Diagram:**

```mermaid
graph TD
    A[User] --> B{Frontend (Browser)};
    B --> C[Backend API];
    C --> D[(Database)];
    D --> C;
    C --> B;
```
````

**Component Responsibilities:**

- **Frontend:** Rendering UI, handling user input, displaying project steps, showing progress, managing client-side routing, fetching data from API, sending user actions (mark done, comment, etc.) to API.
- **Backend:** Authenticating users, authorizing actions, serving project content, updating user progress, managing streaks and achievements, handling community interactions, processing search queries, serving code snippets based on unlock status.
- **Database:** Storing structured application data, ensuring data integrity, providing efficient data retrieval and storage for backend operations.

## 3. User Workflows

This section outlines the primary user journeys through the StepForge platform.

**3.1. Core Learning Journey: Discover, Start, and Progress**

This is the central workflow for a user engaging with the platform's core purpose.

```mermaid
graph TD
    A[User] --> B{Sign Up / Log In};
    B --> C[Discover Projects];
    C --> D{Select Project};
    D --> E[View Project Overview];
    E --> F[Start First Milestone];
    F --> G[View Step Details];
    G --> H{Attempt Task};
    H -- Success --> I[Mark Step as Done];
    H -- Needs Help --> G; % View Hints/Retry
    I --> J{View Next Step / Milestone?};
    J -- Yes --> G;
    J -- No, Finished Milestone --> K[View Milestone Progress];
    K --> L{View Next Milestone?};
    L -- Yes --> F;
    L -- No, Finished Project --> M[View Project Progress];
    M --> N{Unlock Code (Optional)?};
    N --> O[View Code Snippets];
    O --> P[End Journey / Discover More];
    I --> Q[Update User Progress/Streaks];
    Q --> J;
```

**Workflow Description:**

1.  **Sign Up / Log In:** User authenticates to access personalized features and progress tracking.
2.  **Discover Projects:** User browses available projects via tags, search, or curated lists (Popular, Trending).
3.  **Select Project:** User chooses a project based on interest, tags, or difficulty.
4.  **View Project Overview:** User sees project goals, required technologies, and the list of milestones.
5.  **Start First Milestone:** User begins the first milestone of the project.
6.  **View Step Details:** User reads the task description for the current step. May view optional goal screenshots or hints.
7.  **Attempt Task:** User works on the task using their own development environment, _without_ direct code samples from the platform initially.
8.  **Mark Step as Done:** User confirms they have completed the task. This action triggers progress tracking updates.
9.  **Update User Progress/Streaks:** The system records the step completion, updates progress for the current project, and potentially updates streaks and achievements.
10. **View Next Step / Milestone?:** User is presented with the next step in the current milestone or prompted to move to the next milestone upon completion.
11. **View Milestone Progress:** User sees their progress within the completed milestone.
12. **View Next Milestone?:** User decides whether to continue to the next milestone or take a break.
13. **View Project Progress:** Upon completing all milestones, the user sees their overall project completion status.
14. **Unlock Code (Optional)?:** User has the option to view the platform's example code snippets for the project, either step-by-step or the full project code, typically available after they attempt/complete the steps.
15. **View Code Snippets:** User can review the code examples for comparison or learning _after_ their attempt.
16. **End Journey / Discover More:** User finishes the project and can explore other projects.

**3.2. Community Interaction Workflow:**

User engages with community features on a specific project.

- User views comments on a project or specific step.
- User adds a new comment.
- User upvotes/downvotes an existing comment.
- User suggests a new project idea.

## 4. Data Flows

This section describes the movement and transformation of key data within the system.

**4.1. Marking a Step as Done (Core Progress Update)**

This is a fundamental data flow showing how user action updates persistent state.

```mermaid
graph LR
    A[Frontend UI (User clicks "Mark Done")] --> B{API Request: POST /api/user/progress};
    B --> C[Backend API Endpoint];
    C --> D{Validate Request Data}; % User ID, Project ID, Step ID
    D -- Valid --> E[Update Database: UserProgress Table];
    E -- Success --> F[Check/Update Streaks/Achievements (Optional)];
    F -- Success --> G[Database Transaction Commit];
    G --> H[Backend API Response: Success];
    H --> I[Frontend UI (Update Progress Display)];
    D -- Invalid --> J[Backend API Response: Error (e.g., 400 Bad Request)];
    J --> I;
    E -- Error --> K[Backend API Response: Error (e.g., 500 Internal Server Error)];
    K --> I;
```

**Data Flow Description:**

1.  **Frontend UI Action:** The user clicks the "Mark as done" checkbox for a specific step in the UI.
2.  **API Request:** The Frontend sends a POST request to a Backend API endpoint (`/api/user/progress`) including the authenticated User ID, Project ID, and Step ID.
3.  **Backend API Endpoint:** The request hits the designated backend handler.
4.  **Validate Request Data:** The backend validates the incoming data (e.g., ensuring the user exists, the project and step IDs are valid, and potentially that the step is part of the project the user is currently working on).
5.  **Update Database:** If valid, the backend performs a database operation to record that the user has completed this specific step for this project. This might be inserting a new record or updating an existing one in a `UserProgress` table.
6.  **Check/Update Streaks/Achievements:** The backend logic may then check if this completion contributes to streaks or unlocks achievements, performing additional database updates if necessary.
7.  **Database Transaction Commit:** The database transaction is committed.
8.  **Backend API Response (Success):** If the database operation and subsequent logic are successful, the backend returns a success response (e.g., 200 OK) to the frontend.
9.  **Frontend UI Update:** The frontend receives the success response and updates the UI to reflect the step as done and potentially update progress bars, streak counters, etc.
10. **Backend API Response (Error):** If validation fails, the backend returns a client-side error response (e.g., 400 Bad Request).
11. **Backend API Response (Error):** If a server or database error occurs during the process, the backend returns a server-side error response (e.g., 500 Internal Server Error).

**4.2. Fetching Project Content**

Data flow when a user views a project.

- Frontend requests `/api/projects/{projectId}`.
- Backend retrieves project details, milestones, steps (excluding unlockable code initially), optional screenshots, and hints from the Database.
- Backend potentially retrieves aggregated data like popularity or comment counts.
- Backend sends structured project data (JSON) to the Frontend.
- Frontend renders the project overview, milestones, and the first active step.

**4.3. Fetching Unlockable Code**

Data flow when a user unlocks code.

- Frontend requests `/api/projects/{projectId}/code/{stepId}` (or `/api/projects/{projectId}/code/full`) after meeting unlock criteria (e.g., marking step done, completing project).
- Backend validates the unlock condition for the user and project/step.
- Backend retrieves the specific code snippet(s) from the Database.
- Backend sends the code snippet(s) (e.g., as formatted text or JSON) to the Frontend.
- Frontend displays the code snippet(s).

## 5. Error Handling

A robust error handling strategy is crucial for a good user and developer experience.

- **API Error Responses:** Standard HTTP status codes will be used (e.g., 200 OK, 201 Created, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 500 Internal Server Error). Error responses will include a consistent JSON structure containing an error code and a user-friendly message.
- **Frontend Error Display:** The UI will gracefully handle API errors. For critical errors (e.g., login failure, cannot load project), display clear error messages to the user. For non-critical issues (e.g., comment posting failure), potentially show a temporary notification.
- **Backend Logging:** Comprehensive server-side logging is essential for debugging and monitoring. Errors, warnings, and significant events will be logged (e.g., using Winston, Serilog).
- **Database Errors:** The backend will catch database exceptions and translate them into appropriate API error responses (e.g., a database constraint violation might result in a 400 Bad Request if due to invalid user input, or a 500 Internal Server Error for internal issues).
- **Input Validation:** Strict validation on both the frontend (for immediate feedback) and backend (for security and data integrity) is necessary for all user inputs (forms, API parameters).
- **Monitoring & Alerting:** Implement application performance monitoring (APM) and error tracking (e.g., Sentry, Datadog) to proactively identify and diagnose issues in production.
- **Graceful Degradation:** Where possible, the UI should remain partially functional even if certain components or APIs fail (e.g., if community comments fail to load, the project steps should still be viewable).

## 6. Security Flows

Securing user data and application logic is paramount.

**6.1. Authentication Flow (Example: Email/Password)**

```mermaid
graph LR
    A[User] --> B{Frontend: Submit Login Form};
    B --> C{API Request: POST /api/auth/login};
    C --> D[Backend API Endpoint];
    D --> E{Validate Credentials (Email, Hashed Password Check)};
    E -- Valid --> F[Generate Authentication Token (e.g., JWT)];
    F --> G[Store Token (e.g., HTTP Only Cookie, Local Storage)];
    G --> H[Backend API Response: Success (include user info)];
    H --> I[Frontend: Redirect to Dashboard/Home];
    E -- Invalid --> J[Backend API Response: Error (e.g., 401 Unauthorized)];
    J --> B; % Show login error message
```

**Security Considerations for Authentication:**

- **Password Hashing:** Store password hashes using a strong, slow hashing algorithm (e.g., bcrypt).
- **HTTPS:** All communication between Frontend and Backend must use HTTPS to prevent eavesdropping.
- **Token Management:** Use secure methods for storing and transmitting tokens (e.g., HTTP-only cookies for session-based, or local storage with careful handling for JWTs). Set appropriate expiry times.
- **Rate Limiting:** Implement rate limiting on login attempts to mitigate brute-force attacks.

**6.2. Authorization Flow (Accessing User-Specific Data)**

This flow describes how the backend ensures users only access or modify data they are permitted to.

```mermaid
graph LR
    A[User] --> B{Frontend: Request User Progress Data};
    B --> C{API Request: GET /api/user/{userId}/progress};
    C --> D[Backend API Endpoint (Requires Authentication)];
    D --> E{Extract User Identity from Auth Token};
    E --> F{Check Authorization Policy};
    F -- Is authenticated user requesting THEIR progress? --> G[Proceed with Request Processing];
    G --> H[Retrieve Data from Database];
    H --> I[Backend API Response: Progress Data];
    I --> J[Frontend: Display Data];
    F -- Not Authorized --> K[Backend API Response: Error (e.g., 403 Forbidden)];
    K --> J; % Display access denied message
```

**Security Considerations for Authorization:**

- **Backend Validation:** Never trust the client-side (`userId` in the URL or request body must _always_ be verified against the authenticated user making the request on the backend).
- **Role-Based Access Control (RBAC):** Although simple roles (user, potential admin for content) are sufficient now, design the system to support more granular permissions if needed later.
- **Data Filtering:** Ensure database queries only return data the requesting user is authorized to see (e.g., `SELECT * FROM UserProgress WHERE userId = :authenticatedUserId`).

**General Security Practices:**

- **Input Sanitization and Validation:** Prevent injection attacks (SQL, XSS) by sanitizing and validating all user inputs on the backend.
- **Secure Dependencies:** Regularly update libraries and frameworks to patch known vulnerabilities.
- **Environment Variables:** Store sensitive configuration (database credentials, API keys) securely using environment variables, not directly in code.
- **Least Privilege:** Backend services and database users should only have permissions necessary for their function.
- **Auditing:** Implement logging for security-sensitive events (e.g., login attempts, access denied).
- **Regular Security Reviews:** Periodically review code and infrastructure for potential security vulnerabilities.

## User Journey Flow (Mermaid Diagram)

```mermaid
graph TD
    A[User] --> B{Sign Up / Log In}
    B --> C[Discover Projects]
    C --> D{Select Project}
    D --> E[View Project Overview]
    E --> F[Start First Milestone]
    F --> G[View Step Details]
    G --> H{Attempt Task}
    H -- Success --> I[Mark Step as Done]
    H -- Needs Help --> G
    I --> J{View Next Step / Milestone?}
    J -- Yes --> G
    J -- No, Finished Milestone --> K[View Milestone Progress]
    K --> L{View Next Milestone?}
    L -- Yes --> F
    L -- No, Finished Project --> M[View Project Progress]
    M --> N{Unlock Code (Optional)?}
    N --> O[View Code Snippets]
    O --> P[End Journey / Discover More]
    I --> Q[Update User Progress/Streaks]
    Q --> J
```
