# Specification

## Summary
**Goal:** Prevent backend-dependent actions from running before the backend actor is ready, replacing “Connection to the backend is not ready” failures with clear connecting/loading UI states.

**Planned changes:**
- Add a lightweight, reusable frontend “backend readiness” hook/helper to centralize readiness state derived from `useActor()` (e.g., connecting vs ready vs unavailable), without modifying immutable paths.
- Update the Projects page to disable primary backend-dependent actions (e.g., “New Project” / opening create dialog) while connecting, and show an inline English “connecting” message near the disabled controls.
- Update the Create Project dialog to block submit when backend isn’t ready, show an English toast/message instructing the user to wait, and avoid attempting any backend call in this state.
- Update the editor route (`/editor/$projectId`) to gate backend-dependent fetches/actions behind readiness and show an appropriate loading/connecting state until ready.

**User-visible outcome:** While the app is connecting, users see clear English feedback and disabled controls instead of encountering “Connection to the backend is not ready,” and backend-dependent screens/actions only become available once the backend actor is ready.
