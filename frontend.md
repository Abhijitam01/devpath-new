# Frontend Implementation Guide: StepForge

## Version: 1.0
## Date: May 25, 2025

---

## 1. Component Architecture

The frontend application will be built using React with TypeScript, following a component-based architecture. Components will be organized logically based on features and reusability. We will leverage functional components and hooks extensively. Styling will primarily use TailwindCSS utility classes, augmented by pre-built, accessible components from ShadCN UI. Next.js with the App Router will handle routing, server-side rendering (where beneficial), and API route handling (if needed for backend integration patterns like proxies or server actions, though direct API calls are assumed initially).

**Core Views/Pages:**

*   `src/app/page.tsx`: Landing Page
*   `src/app/(auth)/login/page.tsx`: Login Page
*   `src/app/(auth)/signup/page.tsx`: Signup Page
*   `src/app/(protected)/dashboard/page.tsx`: User Dashboard/Home
*   `src/app/(protected)/projects/page.tsx`: Project Discovery/List Page
*   `src/app/(protected)/projects/[projectId]/page.tsx`: Project Detail Page (Core building experience)
*   `src/app/(protected)/achievements/page.tsx`: Achievements Page
*   `src/app/(protected)/bookmarks/page.tsx`: Bookmarks Page

**Key Reusable Components (`src/components/ui/` for ShadCN overrides/extensions, `src/components/` for custom components):**

*   `Layout/`: Components related to overall page structure (Header, Sidebar, Footer - if any).
    *   `Header.tsx`: Contains site title/logo, navigation links, user avatar/auth status, theme toggle.
*   `Projects/`: Components specific to displaying projects.
    *   `ProjectCard.tsx`: Displays project thumbnail, title, description, tags, progress.
    *   `ProjectList.tsx`: Container for displaying multiple `ProjectCard` components.
    *   `ProjectFilterSort.tsx`: Controls for filtering and sorting projects.
*   `ProjectDetail/`: Components for the step-by-step building view.
    *   `ProjectOverview.tsx`: Displays project description, goal screenshot.
    *   `MilestoneList.tsx`: Container for `MilestoneItem` components.
    *   `MilestoneItem.tsx`: Displays a milestone title and contains `StepItem` components.
    *   `StepItem.tsx`: The core component for a single step. Displays task, goal screenshot (optional), hints, "Mark as done" checkbox. Manages state for completion and code visibility.
    *   `CodePreview.tsx`: Displays unlocked code snippets or full project code. Syntax highlighting needed.
    *   `NotesArea.tsx`: Textarea for users to write notes for a step or project.
*   `UI/`: Generic UI components (often based on ShadCN).
    *   `Button.tsx`, `Input.tsx`, `Checkbox.tsx`, `Dialog.tsx` (Modal), `Tabs.tsx`, `Progress.tsx`, `Card.tsx`.
    *   `ThemeToggle.tsx`: Component to switch between dark/light mode.
*   `Progress/`: Components related to tracking/displaying progress.
    *   `ProgressBar.tsx`: Visual representation of completion percentage.
    *   `StreakCounter.tsx`: Displays current streak.
    *   `AchievementCard.tsx`: Displays a single achievement/badge.
*   `Community/`: Components for comments and suggestions.
    *   `CommentSection.tsx`: Displays comments and input for new comments.
    *   `CommentItem.tsx`: Displays a single comment with upvote/downvote.
    *   `NewProjectSuggestionForm.tsx`.

**Component Relationships (Example: Project Detail Page):**

The `Project Detail Page` component (`src/app/(protected)/projects/[projectId]/page.tsx`) will orchestrate the main side-by-side layout. It will fetch project data and pass relevant parts down to child components:

```
ProjectDetailPage
├── Layout/Header
├── UI/ProgressBar (top)
└── div (Side-by-Side Container)
    ├── div (Left Panel - Steps)
    │   ├── ProjectDetail/ProjectOverview
    │   └── ProjectDetail/MilestoneList
    │       └── MilestoneItem (repeated)
    │           └── StepItem (repeated)
    └── div (Right Panel - Notes/Code)
        ├── ProjectDetail/NotesArea
        └── ProjectDetail/CodePreview
```

This structure promotes reusability and separation of concerns. Each component is responsible for its own rendering and potentially local state, while global state (user, project data) is managed externally and passed down or accessed via context/hooks.

## 2. State Management

State management will be handled at different levels:

1.  **Component Local State:** Use `useState` and `useReducer` for managing UI state within a single component (e.g., input field values, modal open/closed status, loading states specific to a button click).
2.  **Global Client State:** For application-wide settings like the theme (dark/light mode), user authentication status, and potentially UI states that need to persist across routes or be accessed by disparate components, React Context API or a lightweight library like Zustand will be used. A `ThemeContext` and `AuthContext` are good candidates for Context. Zustand could manage other global non-server state.
3.  **Server State:** Data fetched from the backend API (projects list, project details, comments, user achievements) is inherently asynchronous and requires managing loading, error, and caching states. **TanStack Query (React Query)** is the recommended library for managing server state effectively. It provides hooks like `useQuery` for fetching data and `useMutation` for updating data, handling caching, background updates, and error retries automatically.

**Implementation Strategy:**

*   Wrap the application root with necessary Context Providers (`AuthProvider`, `ThemeProvider`).
*   Use TanStack Query's `QueryClientProvider` at the application root.
*   Define custom hooks using `useQuery` and `useMutation` for specific API calls (e.g., `useProjects`, `useProjectDetail(projectId)`, `useMarkStepDone(stepId)`). These hooks will abstract away the data fetching logic and provide loading/error states to components.
*   Components will consume these hooks to get data and trigger mutations, keeping components focused on rendering and user interaction.

**Example (Conceptual):**

```typescript
// hooks/useProjectDetail.ts
import { useQuery } from '@tanstack/react-query';
import { getProjectDetail } from '../api/projects'; // API function

export const useProjectDetail = (projectId: string) => {
  return useQuery({
    queryKey: ['project', projectId], // Unique key for caching
    queryFn: () => getProjectDetail(projectId), // Function to fetch data
    enabled: !!projectId, // Only fetch if projectId exists
  });
};

// components/ProjectDetail/ProjectDetailPage.tsx
import { useProjectDetail } from '../../hooks/useProjectDetail';
import { useParams } from 'next/navigation';
import LoadingSpinner from '../UI/LoadingSpinner';
import ErrorMessage from '../UI/ErrorMessage';
// ... import other components

const ProjectDetailPage = () => {
  const params = useParams();
  const projectId = params.projectId as string; // Assuming projectId is in the URL

  const { data: project, isLoading, isError, error } = useProjectDetail(projectId);

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <ErrorMessage message={error.message} />;
  if (!project) return <div>Project not found.</div>; // Handle 404 or empty data

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-4">{project.title}</h1>
      {/* Render other components passing down project data */}
      {/* <ProjectOverview data={project.overview} /> */}
      {/* <MilestoneList milestones={project.milestones} /> */}
      {/* ... side-by-side layout */}
    </div>
  );
};
```

## 3. UI Design

The UI will prioritize clarity, usability, and visual appeal, aligning with the clean, modern SaaS aesthetic using TailwindCSS and ShadCN UI.

**Key Design Principles:**

*   **Consistency:** Maintain consistent spacing, typography, color palette, and component styling throughout the application.
*   **Hierarchy:** Use visual cues (font sizes, weights, spacing, borders, background colors) to clearly indicate the relationship between elements and guide the user's eye.
*   **Feedback:** Provide clear feedback for user actions (e.g., button states on hover/active, loading indicators, success/error messages after form submission or marking a step).
*   **Responsiveness:** Ensure the application is usable and visually appealing across different screen sizes, though the primary step-by-step view might be optimized for larger screens with a collapsed mode for smaller ones.
*   **Accessibility:** Utilize ShadCN components known for accessibility and follow best practices (ARIA attributes, keyboard navigation support).

**Layout Considerations:**

*   **Overall Structure:** A fixed Header bar is likely beneficial for navigation and quick access to key features (search, profile, theme toggle). The main content area beneath the header will contain page-specific layouts.
*   **Project Discovery (`/projects`):** A grid or list of `ProjectCard` components. Filtering and sorting controls at the top or in a sidebar.
*   **Project Detail (`/projects/[projectId]`):** The core side-by-side layout is crucial.
    *   **Left Panel:** Fixed or sticky, containing the project overview, milestone list, and step items. Users can scroll this panel to navigate steps. Needs clear visual separation between steps and milestones. Progress bar could be integrated here or at the top.
    *   **Right Panel:** Scrollable area for user notes and the unlocked code preview. Can use tabs or collapsible sections to switch between notes and code.
    *   **Responsiveness:** On smaller screens, this might collapse into a single-column view where steps are followed by notes/code, or use a tabbed interface.
*   **Navigation:** Use `next/navigation` for client-side routing. Add active states to navigation links.

**Styling & Libraries:**

*   **TailwindCSS:** Used for utility-first styling. Apply classes directly in JSX or use `@apply` for creating custom classes if needed (sparingly). Configure the `tailwind.config.js` for custom colors, typography, spacing based on the chosen palette.
*   **ShadCN UI:** Integrate components like `Button`, `Input`, `Card`, `Checkbox`, `Dialog`, `Tabs`, `Progress`, `Accordion` (for hints/milestones), `ScrollArea`. Customize their appearance via Tailwind configuration and component props.
*   **Dark/Light Mode:** Implement theme switching using `next-themes` or a simple Context API based on user preference or system settings. Update Tailwind config to handle dark mode variants (`dark:` prefix).
*   **Icons:** Use a library like `react-icons` or `@radix-ui/react-icons`.

**Animations (Framer Motion):**

*   Add subtle animations to enhance the user experience:
    *   Page transitions (e.g., fade or slide when navigating).
    *   Element reveals (e.g., animating the code preview when it's unlocked).
    *   Hover effects on interactive elements like `ProjectCard` or buttons.
    *   Animations for progress updates or achievement unlocks.

**User Interactions:**

*   Clicking "Mark as done" checkbox on a step updates progress and potentially triggers UI changes (e.g., step styling changes, progress bar updates).
*   Clicking "Unlock Code" reveals the `CodePreview` section. This might involve a confirmation or a visual transition.
*   Commenting and suggesting projects via forms.
*   Smooth scrolling to steps when navigating via a potential mini-map or progress indicator.

## 4. API Integration

The frontend will interact with a backend API to fetch and update data. Assuming a RESTful API design.

**Key API Endpoints (Conceptual):**

*   `GET /api/auth/me`: Get current user profile.
*   `POST /api/auth/login`: User login.
*   `POST /api/auth/signup`: User signup.
*   `GET /api/projects`: Get a list of all projects (with filtering/sorting parameters).
*   `GET /api/projects/:projectId`: Get details for a specific project (overview, milestones, steps, current user progress).
*   `POST /api/projects/:projectId/steps/:stepId/complete`: Mark a step as completed for the current user.
*   `POST /api/projects/:projectId/steps/:stepId/unlock-code`: Request to unlock code for a step. (Backend logic determines eligibility).
*   `GET /api/projects/:projectId/comments`: Get comments for a project.
*   `POST /api/projects/:projectId/comments`: Post a new comment.
*   `POST /api/comments/:commentId/upvote`: Upvote a comment.
*   `POST /api/comments/:commentId/downvote`: Downvote a comment.
*   `GET /api/users/:userId/achievements`: Get user achievements/badges.
*   `GET /api/users/:userId/progress`: Get user progress across all projects or a specific project.
*   `POST /api/suggestions/projects`: Suggest a new project idea.

**Implementation Details:**

*   **HTTP Client:** Use `axios` for making API requests. It provides features like request/response interceptors which are useful for adding auth tokens or handling errors globally.
*   **Authentication:** Implement token-based authentication (e.g., JWT). Store tokens securely (e.g., in HTTP-only cookies managed by the backend, or in `localStorage`/`sessionStorage` and attach to requests via an `axios` interceptor - handle security implications carefully). Use the `AuthContext` to manage the user's authentication state in the frontend.
*   **Data Fetching & Caching:** As mentioned in State Management, **TanStack Query** will manage the lifecycle of server data. Use `useQuery` for GET requests and `useMutation` for POST, PUT, DELETE requests.
*   **Error Handling:** Implement robust error handling using TanStack Query's `onError` callbacks and `isError`/`error` states. Display user-friendly error messages. Use `axios` interceptors for global error handling (e.g., redirecting to login on 401 Unauthorized).
*   **Loading States:** Use TanStack Query's `isLoading`/`isFetching` states to show loading indicators to the user.
*   **API Service Layer:** Create a dedicated service file (e.g., `src/api/projects.ts`, `src/api/auth.ts`) using `axios` instances to abstract API calls away from components. This makes the code cleaner and easier to maintain/test.

**Example using Axios and TanStack Query:**

```typescript
// api/projects.ts
import axiosInstance from './axiosInstance'; // Configured axios instance

export const getProjectDetail = async (projectId: string) => {
  const response = await axiosInstance.get(`/projects/${projectId}`);
  return response.data; // Assuming backend returns data directly
};

export const markStepComplete = async (projectId: string, stepId: string) => {
  const response = await axiosInstance.post(`/projects/${projectId}/steps/${stepId}/complete`);
  return response.data;
};

// hooks/useMarkStepDone.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { markStepComplete } from '../api/projects';

export const useMarkStepDone = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, stepId }: { projectId: string; stepId: string }) =>
      markStepComplete(projectId, stepId),
    onSuccess: (data, variables) => {
      // Invalidate project detail query to refetch updated progress
      queryClient.invalidateQueries({ queryKey: ['project', variables.projectId] });
      // Optionally update local cache more optimistically if needed
      // queryClient.setQueryData(['project', variables.projectId], (oldData) => { ... update old data ... });
    },
    onError: (error) => {
      console.error('Failed to mark step done:', error);
      // Show user a notification
    },
  });
};
```

## 5. Testing Approach

A multi-layered testing strategy will be employed to ensure the application is robust and reliable.

1.  **Unit Tests:** Test individual functions, hooks, and small, isolated components.
    *   **Focus:** Logic correctness (e.g., utility functions, custom hooks' logic, pure components rendering correctly with props).
    *   **Tools:** Jest (test runner/assertions), React Testing Library (for component testing, focusing on user interactions and output).
    *   **Examples:** Testing a function that calculates project progress, testing a hook that manages local state, testing a simple Button component renders correctly.

2.  **Integration Tests:** Test how multiple components or modules interact.
    *   **Focus:** The integration points – components rendering children correctly, components interacting with context or hooks, testing a small slice of functionality (e.g., a form submission flow without hitting the real API).
    *   **Tools:** Jest, React Testing Library. Use mocking libraries (Jest's built-in mocking, `msw` for API mocking) to isolate the frontend during these tests.
    *   **Examples:** Testing if clicking the "Mark as done" checkbox calls the correct mutation hook, testing if data fetched via `useQuery` is displayed correctly in a component, testing navigation works as expected.

3.  **End-to-End (E2E) Tests:** Test complete user flows through the application in a real browser environment.
    *   **Focus:** Critical user paths (e.g., User signup -> Login -> Browse projects -> Start a project -> Mark a step complete -> View achievements). Ensures the application works as a whole from the user's perspective.
    *   **Tools:** Cypress or Playwright. These provide APIs to interact with the application like a user (clicking, typing, waiting for elements).
    *   **Examples:** Write tests like "A user can successfully sign up, log in, navigate to a project, and mark the first step as complete."

**Implementation:**

*   Configure Jest and React Testing Library.
*   Write tests alongside the code for components, hooks, and utilities. Place test files (`*.test.tsx` or `*.spec.tsx`) in the same directory as the code they test or in a dedicated `__tests__` directory.
*   Set up an API mocking strategy (e.g., `msw`) for integration tests involving data fetching.
*   Choose and configure an E2E testing framework (Cypress or Playwright). Write tests for key user journeys.
*   Integrate tests into the CI/CD pipeline (e.g., GitHub Actions, GitLab CI) to automatically run tests on code pushes/pull requests.
*   Aim for good test coverage, prioritizing critical logic and user-facing interactions.

## 6. Code Examples

Here are code examples for key components and patterns discussed.

**Example 1: Project Card Component (`src/components/Projects/ProjectCard.tsx`)**

Demonstrates using TypeScript props, TailwindCSS for styling, and basic rendering.

```typescript
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface ProjectCardProps {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  tags: string[];
  progress: number; // Percentage 0-100
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  id,
  title,
  description,
  thumbnailUrl,
  tags,
  progress,
}) => {
  return (
    <Link href={`/projects/${id}`} passHref>
      {/* Using a div inside Link for styling, ShadCN Card component */}
      <Card className="h-full flex flex-col hover:shadow-lg transition-shadow duration-200">
        {/* Optional: Add a visual wrapper if Card itself is not the link */}
        <div className="relative w-full aspect-video rounded-t-md overflow-hidden">
          <Image src={thumbnailUrl} alt={`${title} thumbnail`} fill style={{ objectFit: 'cover' }} />
        </div>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription className="line-clamp-2">{description}</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow">
          <div className="flex flex-wrap gap-1 mb-3">
            {tags.map(tag => (
              <Badge key={tag} variant="secondary">{tag}</Badge>
            ))}
          </div>
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">Progress: {progress}%</div>
            <Progress value={progress} aria-label={`${progress}% project progress`} />
          </div>
        </CardContent>
        {/* <CardFooter>Optional footer content</CardFooter> */}
      </Card>
    </Link>
  );
};

export default ProjectCard;
```

**Example 2: Step Item Component (`src/components/ProjectDetail/StepItem.tsx`)**

Illustrates handling completion state, conditional rendering (hints, code preview), and potentially triggering a mutation to mark as done. Uses ShadCN components.

```typescript
import React, { useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import CodePreview from './CodePreview'; // Assume this component exists
import { useMarkStepDone } from '@/hooks/useMarkStepDone'; // Custom hook for mutation
import { ProjectStep } from '@/types'; // Assume types are defined

interface StepItemProps {
  projectId: string;
  step: ProjectStep; // step data from API
  isCompleted: boolean; // User's completion status for this step
}

const StepItem: React.FC<StepItemProps> = ({ projectId, step, isCompleted }) => {
  const [isCodeUnlocked, setIsCodeUnlocked] = useState(false);
  const markDoneMutation = useMarkStepDone();

  const handleMarkDone = (checked: boolean) => {
    // Only allow marking as done, not un-doing via checkbox for simplicity
    if (checked && !isCompleted) {
      markDoneMutation.mutate({ projectId, stepId: step.id });
    }
    // If allowing un-doing, add logic here to call a different mutation
  };

  const handleUnlockCode = () => {
    // In a real app, this might trigger a backend check/mutation
    // and only set true if allowed (e.g., user attempted, or isCompleted)
    setIsCodeUnlocked(true);
  };

  return (
    <div className={`border-b py-4 ${isCompleted ? 'opacity-70' : ''}`}>
      <div className="flex items-start space-x-3">
        <Checkbox
          id={`step-${step.id}`}
          checked={isCompleted}
          onCheckedChange={handleMarkDone}
          disabled={markDoneMutation.isLoading || isCompleted} // Prevent multiple clicks / already done
          className="mt-1"
        />
        <div className="flex-grow space-y-2">
          <label
            htmlFor={`step-${step.id}`}
            className={`text-lg font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${isCompleted ? 'line-through' : ''}`}
          >
            {step.title}
          </label>
          <p className="text-sm text-muted-foreground">{step.description}</p>

          {step.goalScreenshotUrl && (
            <div className="mt-4">
              {/* Assuming GoalScreenshot is a simple display component */}
              {/* <GoalScreenshot url={step.goalScreenshotUrl} title={step.title} /> */}
              <img src={step.goalScreenshotUrl} alt={`${step.title} Goal`} className="max-w-full h-auto rounded-md border" />
            </div>
          )}

          {step.hints && step.hints.length > 0 && (
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="hints">
                <AccordionTrigger className="text-sm">Hints</AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  <ul className="list-disc list-inside">
                    {step.hints.map((hint, index) => (
                      <li key={index}>{hint}</li>
                    ))}
                  </ul>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}

          {!isCodeUnlocked && step.hasCode && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleUnlockCode}
              // Disabled logic could be added based on user attempts/progress
            >
              Unlock Code
            </Button>
          )}

          {isCodeUnlocked && step.code && (
             <CodePreview code={step.code} language={step.codeLanguage || 'typescript'} />
          )}
        </div>
      </div>
      {markDoneMutation.isLoading && <div className="text-sm text-blue-500">Updating progress...</div>}
      {markDoneMutation.isError && <div className="text-sm text-red-500">Failed to mark step done.</div>}
    </div>
  );
};

export default StepItem;
```

**Example 3: Using TanStack Query Hook (`src/hooks/useProjectDetail.ts` - already shown conceptually in State Management)**

This demonstrates fetching data using `useQuery`.

```typescript
// hooks/useProjectDetail.ts (Already shown)
import { useQuery } from '@tanstack/react-query';
import { getProjectDetail } from '../api/projects'; // API function
import { Project } from '@/types'; // Assume types are defined

// Assuming getProjectDetail fetches data matching the Project type
export const useProjectDetail = (projectId: string) => {
  return useQuery<Project, Error>({
    queryKey: ['project', projectId],
    queryFn: () => getProjectDetail(projectId),
    enabled: !!projectId,
  });
};
```

**Example 4: Basic Component Test (`src/components/UI/Button.test.tsx`)**

Using React Testing Library to test a simple ShadCN button integration.

```typescript
import { render, screen } from '@testing-library/react';
import { Button } from '@/components/ui/button';
import '@testing-library/jest-dom'; // For jest-dom matchers

describe('Button', () => {
  it('renders the button with text content', () => {
    render(<Button>Click Me</Button>);
    const buttonElement = screen.getByText(/Click Me/i);
    expect(buttonElement).toBeInTheDocument();
  });

  it('renders the button with a specific variant', () => {
    const { container } = render(<Button variant="secondary">Secondary Button</Button>);
    // This checks if the secondary variant class is applied.
    // Actual class name might vary based on shadcn/ui implementation details
    // or tailwind config, so inspect output HTML or target aria roles if class is unstable.
    // For shadcn default, 'bg-secondary' might be present.
    expect(container.firstChild).toHaveClass('bg-secondary');
  });

  it('calls onClick handler when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Clickable</Button>);
    const buttonElement = screen.getByText(/Clickable/i);
    buttonElement.click(); // Simulate click
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled Button</Button>);
    const buttonElement = screen.getByText(/Disabled Button/i);
    expect(buttonElement).toBeDisabled();
  });
});
```
