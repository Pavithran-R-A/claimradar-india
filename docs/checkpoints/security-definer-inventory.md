# Application SECURITY DEFINER Function Inventory

**Timestamp:** 2026-08-07T23:00:15Z  
**Scope:** Application-owned functions across public and private schemas

---

## 1. Inventory & Hardening Matrix

| Function Signature          | Schema    | Purpose                                                            | Elevated Privilege Required?                                        | `search_path` Hardened | Public EXECUTE Revoked          |
| --------------------------- | --------- | ------------------------------------------------------------------ | ------------------------------------------------------------------- | ---------------------- | ------------------------------- |
| `handle_new_user()`         | `public`  | Trigger on `auth.users` insertion -> creates `public.profiles` row | **Yes** (Auth admin user needs permissions to insert to `profiles`) | `SET search_path = ''` | ✅ **REVOKED**                  |
| `prevent_role_escalation()` | `public`  | Trigger on `profiles` update -> blocks role changes by non-admins  | **Yes** (Evaluates admin status on profile updates)                 | `SET search_path = ''` | ✅ **REVOKED**                  |
| `is_admin()`                | `private` | RLS helper checking if `auth.uid()` has `admin` role               | **Yes** (Queries `profiles` under RLS)                              | `SET search_path = ''` | ✅ **REVOKED FROM PUBLIC/ANON** |
| `is_staff()`                | `private` | RLS helper checking if `auth.uid()` has staff role                 | **Yes** (Queries `profiles` under RLS)                              | `SET search_path = ''` | ✅ **REVOKED FROM PUBLIC/ANON** |
| `set_updated_at()`          | `public`  | Trigger updating `updated_at = now()`                              | **No** (Converted to `SECURITY INVOKER`)                            | `SET search_path = ''` | N/A (`SECURITY INVOKER`)        |

---

## 2. Security Design Principles Applied

1. **Non-Exposed Authorization Schema:** Authorization helpers `is_admin()` and `is_staff()` are housed in schema `private`, which is not exposed over PostgREST HTTP RPC.
2. **Explicit Search Path:** Every function specifies `SET search_path = ''` to prevent search_path manipulation attacks (CVE-style schema hijacking).
3. **Fully-Qualified References:** All SQL statements within functions explicitly schema-qualify tables (`public.profiles`) and system functions (`pg_catalog.now()`, `auth.uid()`).
4. **Least Privilege Execution Grants:** Direct `EXECUTE` privileges are revoked from `PUBLIC`, `anon`, and `authenticated` where direct API invocation is unnecessary.
