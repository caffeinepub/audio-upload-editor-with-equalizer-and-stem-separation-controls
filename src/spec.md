# Specification

## Summary
**Goal:** Fix project creation failures by correcting backend authorization for authenticated Internet Identity users (including after refresh) and surface specific, actionable backend errors in the UI.

**Planned changes:**
- Update backend authorization to allow any authenticated (non-anonymous) Internet Identity principal to call user-level APIs (e.g., createProject, getAllProjects, getProject, profile read/write, and project CRUD) without any admin secret token initialization, including immediately after a hard refresh.
- Ensure backend rejects anonymous callers for user-level APIs with clear English “login required” errors.
- Improve frontend error extraction/parsing so Create Project failures show specific English toasts (login required, duplicate name, or connectivity/actor issues) instead of the generic fallback message.

**User-visible outcome:** Logged-in users can create and view projects reliably (even after a page refresh) without any admin initialization, and when an operation fails the app shows a clear English message explaining what to do next.
