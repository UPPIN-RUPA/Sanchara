# Sanchara Implementation Tracker

This document tracks the active development milestones for Sanchara.

The roadmap is organized into phases:

- Phase 1 — Product Core (complete)
- Phase 2 — Frontend Architecture Stabilization (complete)
- Phase 3 — Identity and Assets (active)
- Phase 4 — Product Maturity
- Phase 5 — Future Expansion

Each milestone defines:

- goal
- key tasks
- likely files
- verification criteria
- definition of done

## Phase 3 — Identity and Assets

Phase 3 completion criteria:

- Auth smoke tests pass
- Auth hardening is complete
- Memory upload and storage are operational

### Milestone 3.1A — Auth Smoke-Test Gate
Status: complete

**Goal**

Validate the auth implementation at runtime and close Phase 3.1.

**Key tasks**

- Start backend with runtime dependencies installed
- Run signup, login, and bearer-token manual checks
- Verify `/auth/me`
- Verify protected event routes with a valid token
- Verify missing and invalid token rejection outside fallback mode
- Run focused auth pytest targets

**Likely files**

- [backend/tests/test_auth.py](/Users/rupa_uppin/Documents/New project/Sanchara/backend/tests/test_auth.py)
- [backend/app/api/v1/routes_auth.py](/Users/rupa_uppin/Documents/New project/Sanchara/backend/app/api/v1/routes_auth.py)
- [backend/app/api/dependencies.py](/Users/rupa_uppin/Documents/New project/Sanchara/backend/app/api/dependencies.py)
- [frontend/src/lib/api.ts](/Users/rupa_uppin/Documents/New project/Sanchara/frontend/src/lib/api.ts)

**Verification**

- `POST /api/v1/auth/signup` returns `201` with bearer token and user
- `POST /api/v1/auth/login` returns `200`
- Invalid login returns `401`
- `GET /api/v1/auth/me` succeeds with valid token
- `/auth/me` fails with missing or invalid token
- `GET /POST /api/v1/events` succeeds with valid token
- Protected routes reject missing or invalid token as expected
- `APP_ENV=test pytest tests/test_auth.py tests/test_events.py`

**Done when**

- All auth smoke checks pass at runtime
- No unexpected fallback behavior appears in normal authenticated flow

### Milestone 3.2 — Auth Hardening
Status: planned

**Goal**

Tighten session UX and remove leftover identity cleanup items.

**Key tasks**

- Remove display-only `userId` props if no longer needed
- Confirm logout clears token and user state fully
- Verify protected-route refresh behavior
- Verify invalid or expired token redirects to `/login`
- Tighten bootstrap and loading states if needed

**Likely files**

- [frontend/src/auth/AuthProvider.tsx](/Users/rupa_uppin/Documents/New project/Sanchara/frontend/src/auth/AuthProvider.tsx)
- [frontend/src/auth/ProtectedRoute.tsx](/Users/rupa_uppin/Documents/New project/Sanchara/frontend/src/auth/ProtectedRoute.tsx)
- [frontend/src/pages/AppWorkspace.tsx](/Users/rupa_uppin/Documents/New project/Sanchara/frontend/src/pages/AppWorkspace.tsx)
- [frontend/src/pages/DashboardPage.tsx](/Users/rupa_uppin/Documents/New project/Sanchara/frontend/src/pages/DashboardPage.tsx)
- [frontend/src/pages/LoginPage.tsx](/Users/rupa_uppin/Documents/New project/Sanchara/frontend/src/pages/LoginPage.tsx)

**Verification**

- Logout returns user to public auth flow
- Refresh on `/dashboard` or `/plans/:id` restores session correctly
- Invalid token causes clean redirect instead of broken page state
- `npm run build`

**Done when**

- Auth flow feels stable under refresh, logout, and invalid-token cases
- No leftover normal-path demo identity assumptions remain

### Milestone 3.3A — Memory Upload Backend
Status: planned

**Goal**

Add the first real asset pipeline for memories on the backend.

**Key tasks**

- Add storage configuration for local development
- Add a dedicated memory upload endpoint
- Validate file presence, MIME type, and max file size
- Save uploaded images to local filesystem storage
- Return a usable `asset_url` from the upload contract
- Keep memory model compatibility with uploaded assets
- Keep scope to images only for V1

**Likely files**

- [backend/app/api/v1/routes_memories.py](/Users/rupa_uppin/Documents/New project/Sanchara/backend/app/api/v1/routes_memories.py)
- [backend/app/api/v1/routes_uploads.py](/Users/rupa_uppin/Documents/New project/Sanchara/backend/app/api/v1/routes_uploads.py)
- [backend/app/services/memory_service.py](/Users/rupa_uppin/Documents/New project/Sanchara/backend/app/services/memory_service.py)
- [backend/app/services/storage_service.py](/Users/rupa_uppin/Documents/New project/Sanchara/backend/app/services/storage_service.py)
- [backend/app/models/memory.py](/Users/rupa_uppin/Documents/New project/Sanchara/backend/app/models/memory.py)
- [backend/app/core/config.py](/Users/rupa_uppin/Documents/New project/Sanchara/backend/app/core/config.py)
- [backend/app/main.py](/Users/rupa_uppin/Documents/New project/Sanchara/backend/app/main.py)

**Verification**

- Valid image upload returns a usable `asset_url`
- Invalid file type is rejected cleanly
- Oversized file is rejected cleanly
- Uploaded file is reachable by the returned URL in local development
- Memory create and update can persist the uploaded `asset_url`

**Done when**

- Backend can accept, store, and expose one image-backed memory asset reliably
- Memory records can reference that asset without extra migration work

### Milestone 3.3B — Memory Upload Frontend
Status: planned

**Goal**

Make memory creation and editing support real uploaded assets in the main product flow.

**Key tasks**

- Add file picker to `MemoryEditor`
- Add image preview before memory save
- Upload image on file selection
- Track upload loading, success, and error state separately from memory save state
- Persist returned `asset_url` into memory create and edit flows
- Support replacing an existing image while editing a memory
- Render uploaded assets in memory cards and detail views
- Preserve existing memory edit and delete behavior

**Likely files**

- [frontend/src/components/events/MemoryEditor.tsx](/Users/rupa_uppin/Documents/New project/Sanchara/frontend/src/components/events/MemoryEditor.tsx)
- [frontend/src/components/events/EventMemories.tsx](/Users/rupa_uppin/Documents/New project/Sanchara/frontend/src/components/events/EventMemories.tsx)
- [frontend/src/lib/api.ts](/Users/rupa_uppin/Documents/New project/Sanchara/frontend/src/lib/api.ts)
- [frontend/src/pages/EventDetailPage.tsx](/Users/rupa_uppin/Documents/New project/Sanchara/frontend/src/pages/EventDetailPage.tsx)
- [frontend/src/components/events/AddMemoryForm.tsx](/Users/rupa_uppin/Documents/New project/Sanchara/frontend/src/components/events/AddMemoryForm.tsx)

**Verification**

- User can select an image from the memory editor
- Preview appears before memory save
- Upload completes and returns a usable asset reference
- Memory save succeeds with uploaded `asset_url`
- Saved memory renders its image on revisit
- Editing a memory can replace the image cleanly
- Existing memory delete flow still works
- `npm run build`

**Done when**

- Memories are no longer metadata-only in the main detail-page workflow
- Users can upload, preview, save, revisit, and replace one image per memory cleanly

## Phase 4 — Product Maturity

Phase 4 completion criteria:

- Search is materially more useful and structured
- Archive browsing is richer and more narrative
- Savings becomes deeper than a summary-only surface

### Milestone 4.1 — Search Maturity
Status: planned

**Goal**

Deepen search into a stronger route-owned workflow.

**Key tasks**

- Group results by type
- Add richer filters
- Optionally move query state into URL params
- Extend search coverage to memories and years

**Likely files**

- [frontend/src/hooks/useSearchData.ts](/Users/rupa_uppin/Documents/New project/Sanchara/frontend/src/hooks/useSearchData.ts)
- [frontend/src/pages/SearchPage.tsx](/Users/rupa_uppin/Documents/New project/Sanchara/frontend/src/pages/SearchPage.tsx)

**Verification**

- Search results are more structured and navigable
- Refresh preserves search state if query params are added

**Done when**

- Search feels like a real retrieval surface, not just client-side filtering

### Milestone 4.2 — Archive Maturity
Status: planned

**Goal**

Make archive feel like completed chapters, not just filtered plans.

**Key tasks**

- Add grouping by year or category
- Add completion reflections or chapter summaries
- Improve archive browsing

**Likely files**

- [frontend/src/hooks/useArchiveData.ts](/Users/rupa_uppin/Documents/New project/Sanchara/frontend/src/hooks/useArchiveData.ts)
- [frontend/src/pages/ArchivePage.tsx](/Users/rupa_uppin/Documents/New project/Sanchara/frontend/src/pages/ArchivePage.tsx)

**Verification**

- Archive is easier to browse and more meaningful narratively

**Done when**

- Completed plans feel preserved, not merely hidden

### Milestone 4.3 — Savings Depth
Status: planned

**Goal**

Expand savings from summary into a richer readiness workflow.

**Key tasks**

- Add contribution history
- Add better per-plan savings detail
- Add simple forecast or projection if useful

**Likely files**

- [frontend/src/hooks/useSavingsData.ts](/Users/rupa_uppin/Documents/New project/Sanchara/frontend/src/hooks/useSavingsData.ts)
- [frontend/src/pages/SavingsPage.tsx](/Users/rupa_uppin/Documents/New project/Sanchara/frontend/src/pages/SavingsPage.tsx)
- [frontend/src/components/events/SavingsEditor.tsx](/Users/rupa_uppin/Documents/New project/Sanchara/frontend/src/components/events/SavingsEditor.tsx)

**Verification**

- Savings page is materially more useful than a summary board

**Done when**

- Users can understand not just totals, but progress over time

## Phase 5 — Future Expansion

Phase 5 completion criteria:

- Optional shared access is possible without weakening the single-user core
- Expansion features remain additive rather than destabilizing

### Milestone 5.1 — Sharing and Collaboration
Status: planned

**Goal**

Introduce optional shared or read-only plan access later.

**Key tasks**

- Define ownership and access model
- Add invite and read-only flows
- Avoid disrupting single-user depth

**Done when**

- Sharing exists without weakening the single-user core
