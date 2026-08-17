/** Clinical Cartography: shipment timelines call only supply-service routes and preserve their documented event model. */
import { apiRequest, isDemoMode } from "./api";
import { shipments } from "./mockData";

export const shipmentService = {
  async listShipments(status?: string) { if (isDemoMode) return shipments.filter((item) => !status || status === "All" || item.status === status); return apiRequest<{ data: unknown[] }>("supply", "/shipments", { params: { status: status === "All" ? undefined : status, limit: 100 } }).then((result) => result.data); },
  async getShipment(id: string) { if (isDemoMode) return shipments.find((item) => item.id === id || item.trackingNumber === id) ?? null; return apiRequest<unknown>("supply", `/shipments/${id}`); },
  async updateShipmentStatus(id: string, status: string, location?: string, notes?: string) { if (isDemoMode) { const shipment = shipments.find((item) => item.id === id); if (shipment) shipment.status = status; return shipment; } return apiRequest("supply", `/shipments/${id}/status`, { method: "PATCH", body: JSON.stringify({ status, location, notes }) }); },
};
