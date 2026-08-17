/** Clinical Cartography: all backend traffic passes through this explicit gateway-aware client so views never embed fetch calls. */
const env = import.meta.env;
export const isDemoMode = env.VITE_USE_MOCK_DATA !== "false" && !env.VITE_API_URL;

type ServiceName = "inventory" | "consumption" | "requirement" | "supply" | "insights";
const roots: Record<ServiceName, string> = {
  inventory: env.VITE_INVENTORY_API_URL || env.VITE_API_URL || "",
  consumption: env.VITE_CONSUMPTION_API_URL || env.VITE_API_URL || "",
  requirement: env.VITE_REQUIREMENT_API_URL || env.VITE_API_URL || "",
  supply: env.VITE_SUPPLY_API_URL || env.VITE_API_URL || "",
  insights: env.VITE_INSIGHTS_API_URL || env.VITE_API_URL || "",
};

export class ApiError extends Error { constructor(message: string, public status?: number) { super(message); this.name = "ApiError"; } }

function createUrl(service: ServiceName, path: string, params?: Record<string, string | number | boolean | undefined>) {
  const root = roots[service].replace(/\/$/, "");
  if (!root) throw new ApiError("No API URL has been configured. Set VITE_API_URL or enable demo mode.");
  const url = new URL(`${root}/api/v1${path}`, window.location.origin);
  Object.entries(params ?? {}).forEach(([key, value]) => { if (value !== undefined && value !== "") url.searchParams.set(key, String(value)); });
  return url.toString();
}

export async function apiRequest<T>(service: ServiceName, path: string, options: RequestInit & { params?: Record<string, string | number | boolean | undefined> } = {}): Promise<T> {
  const { params, headers, ...requestOptions } = options;
  const response = await fetch(createUrl(service, path, params), {
    ...requestOptions,
    headers: { "Content-Type": "application/json", ...(env.VITE_IDENTITY_USER_ID ? { "x-user-id": env.VITE_IDENTITY_USER_ID, "x-user-role": env.VITE_IDENTITY_ROLE || "government", "x-facility-id": env.VITE_IDENTITY_FACILITY_ID || "" } : {}), ...headers },
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok || payload?.success === false) throw new ApiError(payload?.message || "Unable to load operational data.", response.status);
  return (payload?.data ?? payload) as T;
}

export function apiConfigLabel() { return isDemoMode ? "Demo data" : "Live data"; }
