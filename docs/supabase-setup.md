# Supabase Setup

The restored app runs in demo mode without Supabase. Use this guide only when connecting a real Supabase project.

## Apply Order

1. Create a Supabase project and enable email/password auth.
2. Run `supabase_schema.sql` in the SQL editor or through the Supabase CLI.
3. Create a private storage bucket named `pictures-and-documents`.
4. Run `supabase_rls_policies.sql`.
5. Confirm the `public` schema is exposed to the Data API for this project, or move these tables behind a dedicated exposed API schema before production.
6. Set `VITE_DEMO_MODE=false`, `VITE_SUPABASE_URL`, and `VITE_SUPABASE_ANON_KEY` in `.env.local`.

## Schema Notes

`supabase_schema.sql` is a minimum bootstrap inferred from the restored client code. It intentionally uses text IDs because the existing app stores `auth.users.id` as strings in `account_details.id`, then compares them with `auth.uid()::text` in RLS.

Expected tables:

- `account_details`: user role, name, email, optional avatar URL.
- `profile_details`: faculty profession, description, and moderation status.
- `educational_background`: faculty education rows.
- `work_experiences`: faculty work rows.
- `professional_development`: faculty development rows.
- `submissions`: uploaded credential metadata and approval status.
- `audit_logs`: basic audit trail events.

## RLS Notes

`supabase_rls_policies.sql` is rerunnable and includes `private.is_current_user_admin()` so admin users can review submissions, read faculty names, and view files in the shared storage bucket. The helper lives in a non-exposed `private` schema, while policies call it from the exposed `public` tables.

The policy file also grants table privileges to the `authenticated` role. Grants are intentionally narrow for role-bearing tables: browser clients can read and insert `account_details`, but they can only update the profile-safe `name` and `avatarUrl` columns. RLS then limits self-registration to `faculty` account rows, which prevents a signed-in user from changing their own `type` to `admin`.

For a quick real-backend demo, disable email confirmation or create a server-side signup/profile bootstrap. The restored browser signup flow inserts `account_details` and `profile_details` immediately after `auth.signUp`, so it expects an authenticated session.

Create the first admin by signing up normally, then update that row from a trusted SQL editor or server-side service role:

```sql
UPDATE public.account_details
SET type = 'admin'
WHERE email = 'admin@example.com';
```

Do not promote users to admin from browser code. The admin account creation dialog is useful in demo mode, but a production Supabase deployment should create or promote admins through trusted SQL, a server route, or an Edge Function using a service role key that is never exposed to the browser.

Browser audit log inserts are tied to the current authenticated user. Seed or system-level audit rows such as `SYSTEM` should be inserted from trusted SQL or server-side code, not from the public client.

## Production Admin Creation

The browser app should not create or promote administrator accounts in a real deployment. Admin role changes are authorization decisions, so keep them in trusted database or server-side code.

Recommended options:

- For a one-person demo backend, create the first admin in the Supabase SQL editor after the user signs up.
- For a maintained deployment, add a small server route or Supabase Edge Function that verifies the caller is already an admin, then creates/promotes the target account with the Supabase service role key.
- Store the service role key only in server-side environment variables. Never expose it through `VITE_*`, frontend code, GitHub Pages, or browser-accessible config.

Example one-time SQL promotion:

```sql
UPDATE public.account_details
SET type = 'admin'
WHERE email = 'admin@example.com'
  AND type = 'faculty';
```

Example server-side promotion flow:

1. Verify the caller with `supabase.auth.getUser()` on the server.
2. Check `public.account_details.type = 'admin'` for the caller.
3. Use a service-role Supabase client on the server to create the auth user or update the target `account_details` row.
4. Insert a server-side audit log row that records the admin actor and target email.

## Production Caveats

The restored browser app can call OpenAI directly for local testing, but production should proxy OpenAI requests through a server or edge function so private keys are never exposed to the browser.

The schema is intentionally small. Before production use, add stricter constraints, server-side audit logging, data-retention rules, and a migration workflow owned by the deployment environment.

Supabase changed defaults for new projects so tables in `public` may not be exposed to the Data API automatically. If client queries return missing-table or empty-access behavior after applying SQL, check the project API settings and role grants before weakening RLS.
