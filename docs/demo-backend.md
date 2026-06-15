# Demo Backend

This restored showcase uses a browser-local demo backend only. It is designed for GitHub Pages, portfolio review, and hackathon demonstration, not production persistence.

Clerk can be enabled as an optional identity showcase by setting `VITE_CLERK_PUBLISHABLE_KEY`, but Clerk does not replace the demo backend. Clerk-authenticated visitors are mapped into a browser-local faculty demo profile.

## What It Stores

- Seeded faculty and admin demo accounts.
- Browser-local registrations created from the public Register screen.
- Profile details, submissions, audit logs, and uploaded-file metadata.
- Small uploaded-file previews when the file can be safely stored as browser-local data.

The data is stored in the visitor's browser storage under `smart-profile-demo-state-v1`. It does not sync across browsers, devices, or users.

## What It Does Not Do

- It does not require a hosted identity provider.
- It does not upload documents to a hosted storage bucket.
- It does not provide production authorization or tamper-proof audit logs.
- It does not retain reviewer data after browser storage is cleared or reset.

## Optional Clerk Auth

When `VITE_CLERK_PUBLISHABLE_KEY` is present, the login and register screens show Clerk sign-in/sign-up actions and the app sidebar shows Clerk user and Organization controls. After Clerk sign-in, the app creates or updates a local faculty account in this browser and continues to use browser-local profile, submission, upload, and approval data.

Clerk Organizations are shown for reviewer context only. Admin access is not granted from browser-side Organization state; the seeded admin account remains the supported admin path.

## Reset Behavior

Use **Reset demo data** on the auth screens or **Clear demo data** in the authenticated sidebar to restore the seeded showcase state.

## Optional AI Behavior

`VITE_OPENAI_API_KEY` is optional for local experimentation. When it is missing, document classification and bio drafting use deterministic demo fallbacks so the public demo remains usable without private credentials.
