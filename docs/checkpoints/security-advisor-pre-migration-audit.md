# Security Advisor Pre-Migration Audit Report

**Timestamp:** 2026-08-07T23:00:00Z  
**Staging Project:** `upvsfqufkywlpibbwrse`  
**State:** 0 ERRORS, 9 WARNINGS, 1 INFO

---

## 1. Authoritative Warnings Inventory

| Warning # | Warning Title                                         | Target Object                      | Current Definition File   | Planned Resolution in Migration 012                                                                                             |
| --------- | ----------------------------------------------------- | ---------------------------------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| 1         | Function Search Path Mutable                          | `public.set_updated_at()`          | `008_security_fixes.sql`  | Set `SECURITY INVOKER`, `SET search_path = ''`, qualify `pg_catalog.now()`                                                      |
| 2         | Function Search Path Mutable                          | `public.prevent_role_escalation()` | `008_security_fixes.sql`  | Set `SECURITY DEFINER`, `SET search_path = ''`, qualify `private.is_admin()`, `REVOKE EXECUTE FROM PUBLIC, anon, authenticated` |
| 3         | RLS Policy Always True                                | `public.takedown_requests`         | `006_rls_policies.sql`    | Replace `WITH CHECK (true)` with explicit column constraints (`status = 'new'`, name/email/reason non-empty)                    |
| 4         | Public Can Execute SECURITY DEFINER Function          | `public.handle_new_user()`         | `007_profile_trigger.sql` | Set `SET search_path = ''`, qualify `public.profiles`, `REVOKE EXECUTE FROM PUBLIC, anon, authenticated`                        |
| 5         | Public Can Execute SECURITY DEFINER Function          | `public.is_admin()`                | `008_security_fixes.sql`  | Recreate in `private.is_admin()` with `SET search_path = ''`, repoint RLS policies, drop `public.is_admin()`                    |
| 6         | Public Can Execute SECURITY DEFINER Function          | `public.is_staff()`                | `008_security_fixes.sql`  | Recreate in `private.is_staff()` with `SET search_path = ''`, repoint RLS policies, drop `public.is_staff()`                    |
| 7         | Signed-In Users Can Execute SECURITY DEFINER Function | `public.handle_new_user()`         | `007_profile_trigger.sql` | Resolved by `REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated`                              |
| 8         | Signed-In Users Can Execute SECURITY DEFINER Function | `public.is_admin()`                | `008_security_fixes.sql`  | Resolved by moving helper to `private.is_admin()` and revoking execution from `PUBLIC` and `anon`                               |
| 9         | Signed-In Users Can Execute SECURITY DEFINER Function | `public.is_staff()`                | `008_security_fixes.sql`  | Resolved by moving helper to `private.is_staff()` and revoking execution from `PUBLIC` and `anon`                               |

---

## 2. Impact Assessment

- **Trigger Integrity (`auth.users` -> `profiles`):** `handle_new_user()` trigger `on_auth_user_created` runs under database superuser/auth admin privileges. Revoking `EXECUTE` from `PUBLIC`, `anon`, and `authenticated` prevents malicious end-user RPC invocations while allowing the trigger to fire cleanly on signup.
- **RLS Policy Performance & Authorization:** Moving `is_admin()` and `is_staff()` to schema `private` removes them from the PostgREST public schema API while maintaining performance for authenticated RLS evaluation.
- **Takedown Requests Integrity:** Replacing `WITH CHECK (true)` enforces input validation on direct client submissions without breaking legitimate user takedown requests.
