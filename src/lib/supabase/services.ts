import type {
  UserProfile,
  ProjectResult,
  ReferralContext,
} from "@/store/useAppStore";
export async function request<T>(url: string, body?: unknown): Promise<T> {
  const res = await fetch(url, {
    method: body === undefined ? "GET" : "POST",
    headers: { "Content-Type": "application/json" },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    signal: AbortSignal.timeout(15000),
    cache: "no-store",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed. Please retry.");
  return data as T;
}
export type RegistrationResponse = {
  userId: string;
  builderNumber: number;
  mode: "LIVE" | "SIMULATION";
};
export const registerUser = (
  data: Partial<UserProfile> & { email: string; phone: string },
  referralContext: ReferralContext,
  projectResult: ProjectResult,
) =>
  request<RegistrationResponse>("/api/register", {
    data,
    referralContext,
    projectResult,
    consent: true,
  });
export const createSquad = (
  _userId: string,
  projectName: string,
  role = "BUILDER",
) =>
  request<{ id: string; code: string }>("/api/squads", { projectName, role });
export const joinSquad = (code: string, _userId: string, naturalRole: string) =>
  request<{
    squad: { id: string; code: string };
    assignedRole: string;
    success: boolean;
  }>(`/api/squads/${encodeURIComponent(code)}/join`, { naturalRole });
