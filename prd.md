```markdown
# Product Requirements Document: StepForge

**Version:** 1.0
**Date:** May 25, 2025
**Product Name:** StepForge

## 1. Document Header

*   **Document Title:** StepForge Product Requirements Document
*   **Version:** 1.0
*   **Date:** May 25, 2025
*   **Author:** [Your Name/Team Name]
*   **Status:** Draft

## 2. Executive Summary

StepForge is a platform designed to revolutionize how aspiring and intermediate developers learn app development by actively guiding them through building real-world projects. Unlike traditional tutorials that often encourage passive copy-pasting, StepForge provides clear, actionable tasks and milestones, challenging users to think critically and implement solutions themselves. Code samples are available as a reference *after* the user has attempted the step. The platform features a modern, intuitive UI, gamified elements to boost motivation, and a community layer for support and collaboration, directly addressing the "tutorial hell" problem and fostering genuine understanding and skill development.

## 3. Product Vision

*   **Purpose:** To empower developers to move beyond passive learning by providing a structured, engaging, and effective way to build real-world applications from scratch, step-by-step. We aim to cultivate problem-solving skills and deep understanding, not just syntax memorization.
*   **Target Users:**
    *   **Beginner Developers:** Individuals with basic programming knowledge who struggle to build their first complete applications or connect theoretical concepts to practical projects.
    *   **Intermediate Developers:** Developers looking to learn new technologies, frameworks, or architectural patterns by applying them in a project context.
    *   **Career Changers:** Those transitioning into tech roles who need practical, portfolio-ready projects to showcase their skills.
*   **Business Goals (MVP):**
    *   Launch a functional platform demonstrating the core "learn by doing, unlock code later" mechanic.
    *   Attract an initial user base interested in active learning.
    *   Validate the core concept and user engagement with the unique approach.
    *   Gather feedback to inform future development.
*   **Platform Philosophy:**
    *   **No Copy-Paste:** Tasks and instructions guide implementation; direct code is hidden initially.
    *   **Learn by Building:** Focus is on active problem-solving and coding, not passive consumption.
    *   **Code as Reference:** Unlock code samples *after* attempting a step or milestone to confirm understanding and debug.
    *   **Engaging Experience:** Beautiful, modern UI/UX and gamification features keep users motivated and organized.

## 4. User Personas

**Persona 1: Aspiring Alex (The Beginner)**

*   **Profile:** 22 years old, recent computer science graduate or bootcamp attendee, knows basic syntax (e.g., HTML, CSS, JavaScript fundamentals), but struggles to build anything from scratch. Gets easily overwhelmed by complex project setups or cryptic errors. Spends hours watching tutorials but feels stuck when trying to replicate or apply concepts.
*   **Goals:** Build a complete, functional application to demonstrate skills for job applications. Gain confidence in independent coding. Understand *why* code works, not just *how* to type it. Escape the cycle of starting projects and never finishing.
*   **Pain Points:** Overwhelmed by choices (tech stack, project ideas). Tutorials often gloss over setup or complex parts. Gets stuck on errors and doesn't know how to debug effectively. Copy-pasting doesn't build real understanding. Lack of motivation when progress is slow or invisible.

**Persona 2: Skill-Up Sam (The Intermediate)**

*   **Profile:** 28 years old, 2-3 years experience as a junior developer, comfortable with one or two tech stacks. Wants to learn a new framework (e.g., React to Next.js, add TypeScript, learn backend basics) or build a more advanced type of application (e.g., a real-time app, a simple e-commerce site, integrating an API). Finds basic tutorials too slow or simplistic.
*   **Goals:** Learn a new technology deeply by building a non-trivial project. Add diverse projects to their portfolio. Understand best practices and architectural patterns in a practical context. Stay motivated by seeing tangible progress on challenging projects.
*   **Pain Points:** Finding projects that are the right level of challenge. Tutorials for new tech often assume prior knowledge or skip important details. Needs structure but doesn't want hand-holding for simple parts. Wants to confirm their implementation approach against a proven one (using the code unlock).

## 5. Feature Specifications

### 5.1 User System

*   **Feature:** User Authentication (Sign up, Login)
    *   **Description:** Allows users to create an account and log in to access personalized features and track progress.
    *   **User Stories:**
        *   As a new user, I want to sign up with my email and password so I can access the platform.
        *   As a returning user, I want to log in with my credentials so I can resume my learning progress.
        *   As a user, I want to reset my password if I forget it.
    *   **Acceptance Criteria:**
        *   Users can successfully sign up with a valid email and password.
        *   Users can successfully log in with their registered credentials.
        *   The system provides clear error messages for invalid signup/login attempts (e.g., email already exists, incorrect password, invalid email format).
        *   Users can initiate a password reset process via their registered email.
        *   User session persists across browser sessions until logged out.
    *   **Edge Cases:**
        *   User tries to sign up with an email already in use.
        *   User enters invalid characters or format for email/password.
        *   Network issues during signup or login.
        *   User attempts to access protected pages without being logged in (should be redirected to login).

*   **Feature:** Track Progress per Project
    *   **Description:** Allows users to see how many steps and milestones they have completed within each project they are following.
    *   **User Stories:**
        *   As a user, I want to see which projects I'm currently working on.
        *   As a user, I want to see my completion percentage for each project.
        *   As a user, I want to see a list of milestones and steps and which ones I have marked as done within a project.
    *   **Acceptance Criteria:**
        *   The user dashboard or profile displays a list of projects the user is currently following.
        *   Each project card/entry shows a visual indicator (e.g., progress bar, percentage) of completion based on steps marked as done.
        *   Within a specific project view, completed milestones and steps are clearly marked.
        *   Progress state is saved persistently for the logged-in user.
    *   **Edge Cases:**
        *   User marks steps as done offline (requires syncing strategy - deferred for MVP, assume online).
        *   Project structure changes after a user starts (complex, deferred - assume static structure for MVP projects).
        *   User has not started any projects (dashboard should be empty or suggest projects).

*   **Feature:** Streaks, Achievements, and Bookmarks (Basic Streak & Bookmark for MVP)
    *   **Description:** Gamification (streaks) and utility (bookmarks) to motivate and help users organize. Focus on daily streak for MVP. Bookmarks for saving specific steps.
    *   **User Stories:**
        *   As a user, I want to see how many consecutive days I've completed at least one step to stay motivated.
        *   As a user, I want to bookmark specific steps or projects so I can easily find them again later.
    *   **Acceptance Criteria:**
        *   A daily streak counter is displayed on the user's dashboard or profile.
        *   The streak increments if the user marks at least one step as done in any project on a given day (based on server time).
        *   The streak resets to 0 if a full day passes without completing any steps.
        *   Users can click an icon on a step or project to bookmark it.
        *   A list of bookmarked steps/projects is accessible from the user's profile or a dedicated page.
        *   Clicking a bookmark navigates the user to the bookmarked item.
    *   **Edge Cases:**
        *   User completes steps exactly at the day boundary (define server time).
        *   User completes multiple steps in a day (streak still increments by 1).
        *   User bookmarks an item that is later removed (handle broken links gracefully - deferred, assume static projects for MVP).
        *   User bookmarks a step within a project they are no longer following (should still be accessible if the project exists).

### 5.2 Project Flow

*   **Feature:** Project Structure View
    *   **Description:** Display projects broken down into Overview, Milestones, and Steps.
    *   **User Stories:**
        *   As a user, I want to see an overview of the project before I start.
        *   As a user, I want to see a list of milestones for a project so I can understand its major phases.
        *   As a user, I want to see a list of steps under each milestone so I can see the individual tasks.
        *   As a user, I want to navigate between the project overview, milestones, and individual steps easily.
    *   **Acceptance Criteria:**
        *   Each project page clearly displays the project overview content.
        *   A list of milestones is visible, ideally in a persistent navigation structure (like the left sidebar).
        *   Clicking or selecting a milestone reveals the steps associated with it.
        *   Steps are listed sequentially under their respective milestones.
        *   Navigation elements (sidebar, links) allow users to jump directly to specific milestones or steps.
    *   **Edge Cases:**
        *   A project has no overview, no milestones, or no steps (system should handle gracefully, perhaps display a "Coming Soon" or error). Assume valid project data for MVP.
        *   Very long lists of milestones or steps (ensure UI is scrollable).

*   **Feature:** Step Details View & Mark as Done
    *   **Description:** Display the content for a single step (task description, goal screenshot, hints) and allow users to mark it as completed.
    *   **User Stories:**
        *   As a user, I want to read the detailed task description for the current step.
        *   As a user, I want to see an optional screenshot of the expected outcome for the step.
        *   As a user, I want to access optional hints if I get stuck.
        *   As a user, I want to mark a step as done once I have completed it in my own development environment.
    *   **Acceptance Criteria:**
        *   The main content area displays the task description for the currently selected step.
        *   If available, a goal screenshot is displayed prominently for the step.
        *   If available, hints are accessible via a toggle, button, or separate section, and their content is displayed when requested.
        *   A "Mark as Done" checkbox or button is clearly visible for the current step.
        *   Clicking "Mark as Done" toggles the step's completion status for the logged-in user.
        *   Marking a step as done updates the user's progress tracker and saves the state persistently.
        *   The "Mark as Done" status is reflected when the user revisits the step or project.
    *   **Edge Cases:**
        *   Step has no screenshot or no hints (sections should be hidden or display "None available").
        *   User clicks "Mark as Done" repeatedly (state should only toggle).
        *   Network error prevents saving the "done" state (provide user feedback, retry mechanism - retry deferred for MVP).

*   **Feature:** Unlock Code Preview (Per Step)
    *   **Description:** Allow users to view the reference code for a specific step *after* they have made an attempt.
    *   **User Stories:**
        *   As a user, I want the code for a step to be hidden initially so I'm encouraged to try it myself.
        *   As a user, I want to be able to unlock the code for a step if I get stuck or want to compare my solution.
        *   As a user, I want the unlocked code to be easily viewable and copyable (once unlocked).
    *   **Acceptance Criteria:**
        *   Code snippets associated with a step are hidden by default when the user first views the step.
        *   A clear button or action ("Unlock Code", "Show Code") is available.
        *   Clicking the "Unlock Code" button reveals the code snippet for that specific step.
        *   Once unlocked, the code remains visible for that step for the duration of the session (persistence beyond session deferred for MVP).
        *   The revealed code is syntax-highlighted and easily readable.
        *   A "Copy to Clipboard" button is available next to the unlocked code snippet.
        *   The "Unlock Code" button state changes or disappears once the code is unlocked for the session.
    *   **Edge Cases:**
        *   A step has no associated code snippet (Unlock button should not appear).
        *   User navigates away and comes back (code might be hidden again for MVP, requiring re-unlock - persistence is V1.1).
        *   Very large code snippets (ensure scrollability).

### 5.3 Community

*   **Feature:** Comment Section per Project (Basic)
    *   **Description:** Allow users to post comments and see comments from others related to a specific project.
    *   **User Stories:**
        *   As a user, I want to read comments from other users about a project to see common issues or tips.
        *   As a user, I want to post a comment to ask questions or share my experience about a project.
    *   **Acceptance Criteria:**
        *   A comment section is available on each project page.
        *   Users can see a chronological list of comments posted for that project.
        *   Authenticated users can submit new comments via a text area and a "Post" button.
        *   Each comment displays the author's username/avatar and the time it was posted.
        *   New comments appear in the list after submission without requiring a page reload.
        *   Basic validation prevents posting empty comments.
    *   **Edge Cases:**
        *   User tries to post a comment when not logged in (prompt login).
        *   Long comments (ensure wrapping/scrollability).
        *   Many comments (pagination or "Load More" - deferred for MVP, show recent N).
        *   Spam or offensive content (moderation strategy - deferred for MVP, rely on reporting if implemented, or basic filtering).

*   **Feature:** Upvote/Downvote Comments (Deferred for MVP)
    *   **Description:** Allow users to vote on comments to highlight helpful ones.
    *   **User Stories:**
        *   As a user, I want to upvote comments that I find helpful.
        *   As a user, I want to downvote comments that are not helpful or are irrelevant.
    *   **Acceptance Criteria:** (Deferred for MVP)
        *   Upvote/downvote buttons visible next to each comment.
        *   Vote counts are displayed.
        *   Users can vote once per comment per vote type.
        *   Voting updates the count in real-time.
    *   **Edge Cases:** (Deferred for MVP)
        *   User tries to vote multiple times.
        *   User tries to vote on their own comment.

*   **Feature:** Suggest New Project Ideas (Basic)
    *   **Description:** Provide a simple way for users to suggest ideas for new projects to be added to the platform.
    *   **User Stories:**
        *   As a user, I want to suggest a project idea I'd like to see on the platform.
    *   **Acceptance Criteria:**
        *   A link or button directs users to a "Suggest Project" page or modal.
        *   A form is available with a text area for the project description.
        *   A "Submit" button sends the suggestion.
        *   A confirmation message is displayed upon successful submission.
        *   Basic validation prevents empty submissions.
    *   **Edge Cases:**
        *   User submits duplicate ideas (backend handling needed, not critical for MVP submission).
        *   Very long suggestions (limit character count).

### 5.4 Discover Projects

*   **Feature:** Project Listing & Filtering by Tags
    *   **Description:** Display available projects and allow users to filter them based on tags.
    *   **User Stories:**
        *   As a user, I want to see a list of available projects.
        *   As a user, I want to filter projects by tags (e.g., 'frontend', 'React', 'beginner') to find projects relevant to my interests or skill level.
    *   **Acceptance Criteria:**
        *   A dedicated page displays all available projects as cards or list items.
        *   Each project entry shows the project name, a brief description, and its associated tags.
        *   A list or set of clickable tags is available on the project listing page.
        *   Clicking one or more tags filters the displayed projects to show only those matching *all* selected tags (AND logic for MVP simplicity).
        *   Deselecting a tag removes that filter.
        *   If no projects match the selected tags, a "No projects found" message is displayed.
    *   **Edge Cases:**
        *   Project has no tags (should still be listed unless filtered specifically by a tag it doesn't have).
        *   Large number of projects (pagination - deferred for MVP, simple scroll).
        *   Large number of tags (UI needs to handle this gracefully).

*   **Feature:** Search Projects
    *   **Description:** Allow users to search for projects by name or keywords in the description.
    *   **User Stories:**
        *   As a user, I want to search for projects based on keywords so I can quickly find something specific.
    *   **Acceptance Criteria:**
        *   A search bar is available on the project listing page.
        *   Typing in the search bar and submitting (e.g., pressing Enter or clicking a search icon) filters the project list.
        *   Search matches should include project names and descriptions (basic keyword match for MVP).
        *   Search results update the displayed project list.
        *   If no projects match the search term, a "No projects found" message is displayed.
        *   Clearing the search bar reverts to the full project list.
    *   **Edge Cases:**
        *   Search with special characters.
        *   Search for very common or very rare terms.
        *   Search while tags are already filtered (search applies to the *already filtered* list or the *full* list? Assume full list, then apply tag filters if any, for MVP).

*   **Feature:** Popular, Trending, New Sorting (Basic "New" sort for MVP)
    *   **Description:** Provide options to sort projects. Focus on "Newest" for MVP.
    *   **User Stories:**
        *   As a user, I want to see the most recently added projects.
    *   **Acceptance Criteria:**
        *   A sorting option is available on the project listing page.
        *   Selecting "Newest" sorts projects by their creation date in descending order.
    *   **Edge Cases:**
        *   Projects with the same creation date (stable sort).
        *   Sorting while filters are active (sort applies to the filtered list).

### 5.5 UI/UX

*   **Feature:** Dark/Light Mode Toggle
    *   **Description:** Allow users to switch between a dark and light visual theme.
    *   **User Stories:**
        *   As a user, I want to switch between dark and light mode based on my preference or time of day.
        *   As a user, I want the platform to remember my preferred mode for future visits.
    *   **Acceptance Criteria:**
        *   A visible toggle or setting allows users to switch themes.
        *   All core UI elements and pages adapt correctly to the selected theme.
        *   The user's theme preference is saved locally (e.g., using localStorage) or on the server (preferred for consistency across devices).
        *   The site loads with the user's preferred theme on subsequent visits.
    *   **Edge Cases:**
        *   Images or embedded content that don't adapt well to theme changes.
        *   Performance impact of theme switching (should be minimal).

*   **Feature:** Project Cards/Thumbnails
    *   **Description:** Display projects attractively on the discovery page using cards with relevant information and optional thumbnails.
    *   **User Stories:**
        *   As a user, I want project listings to be visually appealing and informative at a glance.
    *   **Acceptance Criteria:**
        *   Each project on the listing page is represented by a distinct card.
        *   Project cards display the project name, a short description, and relevant tags.
        *   If available, a thumbnail image is displayed on the card.
        *   Clicking the card or a button on the card navigates to the project's detail page.
    *   **Edge Cases:**
        *   Projects with no thumbnail image (use a placeholder).
        *   Long project names or descriptions that overflow the card.

*   **Feature:** Side-by-Side Project Layout
    *   **Description:** The main project view presents steps/milestones on the left and user-specific content (notes, code preview) on the right.
    *   **User Stories:**
        *   As a user, I want to easily see the project steps while having space for my own notes or the code preview alongside.
    *   **Acceptance Criteria:**
        *   On screens of sufficient width (e.g., tablet and desktop), the layout is split into two main vertical panels.
        *   The left panel contains the project navigation (milestones, steps list).
        *   The right panel contains the content for the currently selected step (task description, hints, screenshot, code preview area) and potentially a user notes area (deferred for MVP).
        *   The layout is responsive and stacks panels vertically on smaller screens (mobile).
    *   **Edge Cases:**
        *   Very wide or very narrow screens.
        *   Content in either panel is excessively long and requires significant scrolling.

*   **Feature:** Progress Tracker Visualization
    *   **Description:** A visual element (e.g., progress bar) that shows the user's completion progress within the current project.
    *   **User Stories:**
        *   As a user, I want to see my progress within a project at a glance to stay motivated.
    *   **Acceptance Criteria:**
        *   A progress bar or similar visual indicator is displayed prominently on the project view page (e.g., at the top).
        *   The tracker accurately reflects the percentage or count of steps marked as done out of the total steps in the project.
        *   The tracker updates visually in real-time when a step is marked as done or undone.
    *   **Edge Cases:**
        *   Project with zero steps (tracker should show 0%).
        *   Calculation precision issues for the percentage.

*   **Feature:** General UI Polish & Libraries Integration
    *   **Description:** Implement the UI using React/TypeScript, style with TailwindCSS/ShadCN components, potentially use Next.js, and incorporate subtle animations with Framer Motion.
    *   **User Stories:**
        *   As a user, I want the platform to feel modern, fast, and polished.
        *   As a developer contributing, I want to use a modern, efficient frontend stack.
    *   **Acceptance Criteria:**
        *   The application is built using React/TypeScript.
        *   Styling primarily uses TailwindCSS utility classes.
        *   Common UI components leverage ShadCN.
        *   If Next.js is used, routing and data fetching benefit from its features (e.g., App Router).
        *   Basic page transitions, element reveals, or hover effects use Framer Motion (start simple for MVP).
        *   The overall UI is clean, consistent, and adheres to modern design principles.
        *   The application is performant with smooth scrolling and navigation.
    *   **Edge Cases:**
        *   Library compatibility issues.
        *   Performance bottlenecks due to overly complex animations or inefficient component rendering.
        *   Ensuring accessibility standards are met (WCAG AA - deferred for MVP, but kept in mind).

## 6. Technical Requirements

*   **API Needs:**
    *   `POST /api/auth/signup`: Register new user.
    *   `POST /api/auth/login`: Authenticate user.
    *   `GET /api/auth/me`: Get current user details.
    *   `POST /api/auth/forgot-password`: Initiate password reset.
    *   `GET /api/projects`: Get list of all projects (with summary data: id, name, description, tags, thumbnail, total steps).
    *   `GET /api/projects/:projectId`: Get detailed data for a single project (overview, milestones, steps, hints, screenshots, code snippets per step).
    *   `GET /api/users/:userId/projects`: Get list of projects user is following with progress data.
    *   `GET /api/users/:userId/progress/:projectId`: Get user's progress (completed steps) for a specific project.
    *   `POST /api/users/:userId/progress/:stepId`: Mark a step as done/undone.
    *   `GET /api/users/:userId/streak`: Get user's current streak count.
    *   `POST /api/users/:userId/streak/check-in`: Increment streak if applicable (called on daily first step completion).
    *   `POST /api/users/:userId/bookmarks`: Add/remove bookmark (project or step).
    *   `GET /api/users/:userId/bookmarks`: Get list of user's bookmarks.
    *   `GET /api/projects/:projectId/comments`: Get comments for a project.
    *   `POST /api/projects/:projectId/comments`: Post a new comment.
    *   `GET /api/tags`: Get list of all available tags.
    *   `GET /api/projects/search?q=...`: Search projects.
    *   `GET /api/projects/filter?tags=...`: Filter projects by tags.
    *   `GET /api/projects/sort?by=...`: Sort projects (initially just 'newest').
    *   `POST /api/project-suggestions`: Submit a new project idea.

*   **Data Storage Requirements:**
    *   **Users Table:** User ID (PK), email (unique), password hash, registration date, last login date, theme preference (light/dark), (potentially profile info: name, avatar URL - deferred).
    *   **Projects Table:** Project ID (PK), name, short description, full overview content, creation date, (optional thumbnail URL).
    *   **Milestones Table:** Milestone ID (PK), Project ID (FK), name, order index.
    *   **Steps Table:** Step ID (PK), Milestone ID (FK), task description (markdown/rich text), order index, (optional goal screenshot URL), (optional hints - stored as text or JSON array), (optional code snippet - stored as text, associated with language).
    *   **ProjectTags Table:** Project ID (FK), Tag ID (FK) - many-to-many relationship table.
    *   **Tags Table:** Tag ID (PK), name (unique).
    *   **UserProgress Table:** User ID (FK), Step ID (FK), completed (boolean), completion timestamp (index for streak calculation).
    *   **UserStreaks Table:** User ID (FK, PK), current streak count, last completed date.
    *   **Bookmarks Table:** Bookmark ID (PK), User ID (FK), item type ('project' or 'step'), item ID (FK to Projects or Steps table).
    *   **Comments Table:** Comment ID (PK), User ID (FK), Project ID (FK), content (text), timestamp.
    *   **ProjectSuggestions Table:** Suggestion ID (PK), User ID (FK, optional), content (text), timestamp.
    *   **Database Choice:** A relational database like PostgreSQL is suitable due to the structured nature of projects, steps, and relationships (FKs).
    *   **File Storage:** Need storage for user avatars (deferred) and project screenshots (e.g., S3 or equivalent).

*   **Technology Stack (Frontend):**
    *   React + TypeScript
    *   Next.js (Optional for MVP, but recommended for routing, server-side rendering potential, API routes)
    *   TailwindCSS + ShadCN UI components
    *   Framer Motion (Subtle animations)
    *   State Management: React Context or a small library like Zustand/Jotai for client-side state; server state managed via React Query or SWR.
    *   Forms: React Hook Form or similar.
    *   Authentication: NextAuth.js (if using Next.js) or custom integration with backend auth.

*   **Technology Stack (Backend):**
    *   Choice of language/framework (e.g., Node.js/Express, Python/FastAPI/Django, Go).
    *   Database: PostgreSQL (or similar RDBMS).
    *   ORM/Query Builder (e.g., Prisma, TypeORM, Knex.js).
    *   Authentication: Secure password hashing (bcrypt), JWTs or session management.
    *   Deployment: Vercel/Netlify (frontend), Render/Heroku/AWS (backend/database).

## 7. Implementation Roadmap (MVP Focus)

This roadmap outlines the priority of features for the Minimum Viable Product (MVP). Features are grouped into phases.

**Phase 1: Core Foundation (Authentication, Project View, Basic Progress)**

*   **Features:**
    *   User Sign up/Login
    *   User Authentication state management (logged in/out)
    *   Project Listing Page (basic list with name/description)
    *   Project Detail Page (Overview, Milestones, Steps list view)
    *   Mark Step as Done/Undone functionality
    *   Persist user progress for completed steps
    *   Basic Progress Tracker visualization (e.g., percentage number or simple bar)
    *   Side-by-Side Project Layout (for larger screens, stack on mobile)
    *   Implement using React/TypeScript, initial TailwindCSS setup, basic ShadCN components.
*   **Goal:** Enable users to sign up, browse projects, view their structure, mark steps as done, and see their basic progress. *The absolute minimum to test the project following concept.*

**Phase 2: The Core Learning Mechanic & Discoverability**

*   **Features:**
    *   Implement Unlock Code Preview per Step (hide code initially, reveal on button click - session-based persistence).
    *   Display Task Description, Goal Screenshot, and Hints within Step View.
    *   Project Cards with Thumbnails on listing page.
    *   Basic Project Filtering by Tags.
    *   Basic Project Search by name/description.
    *   "Newest" Project Sorting.
    *   Implement Dark/Light Mode Toggle (persistence via localStorage or user settings).
*   **Goal:** Introduce the core "code unlock" mechanism, making the platform's unique value proposition functional. Improve project discovery so users can find relevant content. Add a key UI personalization feature.

**Phase 3: Initial Gamification & Community & Polish**

*   **Features:**
    *   Basic Daily Streak Tracking (increment on first step completion of the day, reset if day missed). Display streak count.
    *   Basic Comment Section per Project (flat list, posting, display author/timestamp).
    *   Basic Project Suggestion Submission Form.
    *   Implement Bookmarking for Steps. Display bookmarks list.
    *   Refine UI/UX using more ShadCN components.
    *   Add initial subtle Framer Motion animations (e.g., page transitions, element fades).
*   **Goal:** Add initial engagement features (streaks, comments) and utility (bookmarks, suggestions) to encourage return visits and community interaction. Polish the overall look and feel.

**Phase 4: Post-MVP Enhancements (V1.1+)**

*   **Features:**
    *   Upvote/Downvote Comments.
    *   Achievements/Badges system (more complex logic).
    *   Progress tracking visualization improvements (more detailed, per-milestone).
    *   Code Unlock persistence across sessions/logins.
    *   More advanced search and filtering options (e.g., AND/OR logic, filter by difficulty).
    *   "Popular" and "Trending" sorting algorithms.
    *   User profile pages (view streak, achievements, bookmarks, completed projects).
    *   User notes area within the side-by-side view.
    *   Social login options (Google, GitHub).
    *   Email notifications (e.g., streak reminders - optional).
    *   Backend infrastructure scaling and monitoring.
    *   Admin panel for content management (adding/editing projects).
    *   Reporting mechanism for inappropriate comments/suggestions.

This roadmap allows for a functional MVP to be launched relatively quickly, focusing on the core value proposition, and provides a clear path for future iterations based on user feedback and engagement metrics.
```
