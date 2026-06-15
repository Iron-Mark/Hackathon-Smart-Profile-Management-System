# Clerk Showcase Auth

Clerk is optional in this restored hackathon demo. The public GitHub Pages build works without Clerk, using seeded browser-local demo accounts.

## Configure

Create a Clerk application, copy the publishable key, and add it to `.env.local`:

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_or_pk_live_value_here
```

Then start the app:

```bash
npm run dev
```

The auth screens will show Clerk sign-in/sign-up controls. After a Clerk user signs in, the app creates a browser-local faculty demo profile and routes the visitor to `/faculty/dashboard`.

For GitHub Pages, add the same publishable key as a repository variable so the deploy workflow can expose it during the Vite build:

```bash
gh variable set VITE_CLERK_PUBLISHABLE_KEY --body "pk_test_or_pk_live_value_here" --repo Iron-Mark/Hackathon-Smart-Profile-Management-System
```

## Organizations

Enable Organizations in the Clerk Dashboard if you want the sidebar `OrganizationSwitcher` to show organization controls. The selected Organization is for showcase context only in this static app.

Admin authorization is intentionally not derived from Clerk Organization roles because this project has no trusted backend to enforce those claims. Use the seeded admin account for the admin review flow.

## Limitations

- Clerk authenticates the visitor identity only.
- Faculty profile data, uploads, submissions, audit logs, and approvals stay in browser-local demo storage.
- Data does not sync across devices or browsers.
- Do not upload sensitive real documents to the public showcase.
- Do not add `CLERK_SECRET_KEY` or other backend secrets to this Vite app.

## References

- React quickstart: https://clerk.com/docs/react/getting-started/quickstart
- Organizations: https://clerk.com/docs/guides/organizations/overview
- Components: https://clerk.com/docs/reference/components/overview
- Dashboard: https://dashboard.clerk.com/

For future Clerk-specific agent work:

```bash
npx skills add clerk/skills
```

Restart the agent after installing skills so they load.
