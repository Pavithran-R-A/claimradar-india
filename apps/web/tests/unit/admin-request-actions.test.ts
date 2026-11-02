import { beforeEach, describe, expect, it, vi } from "vitest";
import { getAdminDb } from "@/lib/admin-db";
import { getActionActor } from "@/app/admin/_lib/roles";
import { updateCustomerRequest } from "@/app/admin/customer-requests/actions";
import { resolveCorrection, resolveTakedown, updateClaimable } from "@/app/admin/editorial-actions";
import { readFileSync } from "node:fs";

vi.mock("@/lib/admin-db", () => ({ getAdminDb: vi.fn() }));
vi.mock("@/app/admin/_lib/roles", () => ({
  ADMINS_ONLY: [],
  EDITORIAL: [],
  LEGAL: [],
  getActionActor: vi.fn(),
  unauthorized: () => ({ error: "Unauthorized" }),
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

const actor = {
  id: "00000000-0000-4000-8000-000000000001",
  role: "admin",
} as never;
const customerRequestId = "00000000-0000-4000-8000-000000000002";
const takedownId = "00000000-0000-4000-8000-000000000003";
const claimableId = "00000000-0000-4000-8000-000000000004";
const correctionId = "00000000-0000-4000-8000-000000000005";
const rpc = vi.fn();

function form(fields: Record<string, string>): FormData {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
}

describe("atomic staff request actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getActionActor).mockResolvedValue(actor);
    rpc.mockResolvedValue({ data: { success: true }, error: null });
    vi.mocked(getAdminDb).mockReturnValue({ rpc } as never);
  });

  it("saves customer request state and audit through one database action", async () => {
    const result = await updateCustomerRequest(
      "correction",
      customerRequestId,
      { kind: "idle", message: "" },
      form({ status: "resolved", resolution: "Reviewed source documents." }),
    );

    expect(result).toEqual({ kind: "success", message: "Request saved." });
    expect(rpc).toHaveBeenCalledWith("triage_customer_request", {
      p_request_kind: "correction",
      p_request_id: customerRequestId,
      p_status: "resolved",
      p_resolution: "Reviewed source documents.",
      p_actor_id: "00000000-0000-4000-8000-000000000001",
    });
  });

  it("saves claimable content, snapshot and audit through one database action", async () => {
    const result = await updateClaimable(
      claimableId,
      form({
        public_title: "Updated public title",
        summary: "",
        status: "detected",
        procedural_status: "pending",
        affected_group: "",
        relief_description: "",
        action_required: "",
        official_claim_url: "",
        deadline: "",
        change_reason: "Verified against the official notice.",
      }),
    );

    expect(result).toEqual({ success: true });
    expect(rpc).toHaveBeenCalledWith("update_claimable_with_revision", {
      p_claimable_id: claimableId,
      p_updates: {
        public_title: "Updated public title",
        summary: null,
        status: "detected",
        procedural_status: "pending",
        affected_group: null,
        relief_description: null,
        action_required: null,
        official_claim_url: null,
        deadline: null,
      },
      p_change_reason: "Verified against the official notice.",
      p_actor_id: "00000000-0000-4000-8000-000000000001",
    });
  });

  it("saves takedown, archive, publication event and audit together", async () => {
    const result = await resolveTakedown(
      takedownId,
      form({
        decision: "granted",
        resolution: "The submitted order supports removal.",
      }),
    );

    expect(result).toEqual({ success: true });
    expect(rpc).toHaveBeenCalledWith("resolve_takedown_request", {
      p_takedown_id: takedownId,
      p_decision: "granted",
      p_resolution: "The submitted order supports removal.",
      p_actor_id: "00000000-0000-4000-8000-000000000001",
    });
  });

  it("records correction decisions without implying content edits", async () => {
    const result = await resolveCorrection(
      correctionId,
      form({ decision: "accepted", resolution: "Verified evidence; edit separately." }),
    );

    expect(result).toEqual({ success: true });
    expect(rpc).toHaveBeenCalledWith("resolve_correction_request", {
      p_correction_id: correctionId,
      p_decision: "accepted",
      p_resolution: "Verified evidence; edit separately.",
      p_actor_id: "00000000-0000-4000-8000-000000000001",
    });
  });

  it("keeps every write inside the service-role transaction functions", () => {
    const migration = readFileSync(
      new URL(
        "../../../../supabase/migrations/20261102130000_atomic_admin_request_actions.sql",
        import.meta.url,
      ),
      "utf8",
    );
    const takedownFunction =
      migration
        .split("CREATE OR REPLACE FUNCTION public.resolve_takedown_request")[1]
        ?.split("$$;")[0] ?? "";
    const customerFunction =
      migration
        .split("CREATE OR REPLACE FUNCTION public.triage_customer_request")[1]
        ?.split("$$;")[0] ?? "";
    const editFunction =
      migration
        .split("CREATE OR REPLACE FUNCTION public.update_claimable_with_revision")[1]
        ?.split("$$;")[0] ?? "";
    const correctionFunction =
      migration
        .split("CREATE OR REPLACE FUNCTION public.resolve_correction_request")[1]
        ?.split("$$;")[0] ?? "";

    expect(takedownFunction).toContain("FOR UPDATE");
    expect(takedownFunction).toContain("public.claimables");
    expect(takedownFunction).toContain("public.publication_events");
    expect(takedownFunction).toContain("public.takedown_requests");
    expect(takedownFunction).toContain("public.audit_logs");
    expect(takedownFunction).toContain("changes->'after'->>'resolution'");
    expect(migration).toContain("takedown_request_id uuid");
    expect(migration).toContain("publication_events_takedown_request_once");
    expect(customerFunction).toContain("public.user_correction_requests");
    expect(customerFunction).toContain("public.grievance_contacts");
    expect(customerFunction).toContain("public.audit_logs");
    expect(editFunction).toContain("FOR UPDATE");
    expect(editFunction).toContain("public.claim_versions");
    expect(editFunction).toContain("public.claimables");
    expect(editFunction).toContain("public.audit_logs");
    expect(editFunction).toContain("::public.claimable_status");
    expect(editFunction).toContain("::public.procedural_status");
    expect(correctionFunction).toContain("FOR UPDATE");
    expect(correctionFunction).toContain("public.correction_requests");
    expect(correctionFunction).toContain("public.audit_logs");
    expect(correctionFunction).not.toContain("public.publication_events");
    expect(migration).toContain("TO service_role");
    expect(migration).toContain("FROM authenticated");
  });
});
