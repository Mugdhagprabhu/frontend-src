/** Clinical Cartography: procurement operations are separated by service ownership: indents are requirement-service; orders and vendors are supply-service. */
import { apiRequest, isDemoMode } from "./api";
import { procurement } from "./mockData";

export const procurementService = {
  async listIndents(status?: string) { if (isDemoMode) return procurement.indents.filter((item) => !status || status === "All" || item.status === status); return apiRequest<{ data: unknown[] }>("requirement", "/indents", { params: { status: status === "All" ? undefined : status, limit: 100 } }).then((result) => result.data); },
  async listOrders(status?: string) { if (isDemoMode) return procurement.orders.filter((item) => !status || status === "All" || item.status === status); return apiRequest<{ data: unknown[] }>("supply", "/supply-orders", { params: { status: status === "All" ? undefined : status, limit: 100 } }).then((result) => result.data); },
  async updateOrderStatus(id: string, status: "confirmed" | "cancelled") { if (isDemoMode) { const order = procurement.orders.find((item) => item.id === id); if (order) order.status = status === "confirmed" ? "Confirmed" : "Cancelled"; return order; } return apiRequest("supply", `/supply-orders/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }); },
};
