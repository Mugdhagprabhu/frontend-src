/** Clinical Cartography: decision-support is clearly isolated because the current backend has no ML prediction route published yet. */
import { apiRequest, isDemoMode } from "./api";
import { insights } from "./mockData";

export const insightsService = {
  async listInsights() { if (isDemoMode) return insights; return apiRequest<unknown[]>("insights", "/insights"); },
};
