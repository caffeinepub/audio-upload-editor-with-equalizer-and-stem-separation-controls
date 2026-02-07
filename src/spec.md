# Specification

## Summary
**Goal:** Eliminate the infinite “Connecting to the backend… Please wait.” state on initial load by fixing authorization for normal users and adding explicit, recoverable frontend connection states.

**Planned changes:**
- Update backend authorization so authenticated Internet Identity users can call standard user APIs (e.g., getCallerUserProfile, getAllProjects, createProject) without requiring any admin secret-token initialization, while keeping admin-only privileges restricted.
- Add a new frontend actor/connection hook (in a new file) that creates an actor for anonymous or authenticated identities, does not block on optional admin-secret initialization, exposes loading/ready/error states with a UI-safe error message, and provides a user-initiated retry mechanism.
- Update ProjectsPage and AudioEditorPage to replace the infinite connecting screen with an English error state and a Retry action when actor creation/initialization fails.
- Refactor frontend data/query hooks that depend on the backend actor to use the new connection hook, disabling queries until the actor is ready and surfacing connection errors separately from “connecting,” with recovery after retry.

**User-visible outcome:** After logging in and refreshing the page, users can connect to the backend and use Projects/Editor normally without needing any secret token; if connection setup fails, the app shows a clear English error with a Retry button instead of spinning forever.
