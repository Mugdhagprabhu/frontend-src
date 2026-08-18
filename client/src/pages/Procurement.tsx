/** Clinical Cartography: procurement is a two-track workbench for requirements and supply orders, each with explicit accountable progression. */
import { useState } from "react";
import { CheckCircle2, ClipboardList, ExternalLink, FilePlus2, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { DetailDrawer } from "@/components/DetailDrawer";
import { InlineError, PanelSkeleton } from "@/components/OperationalStates";
import { PageHeader, SectionHeading, StatusBadge } from "@/components/OperationalPrimitives";
import { useOperationData } from "@/hooks/useOperationData";
import { procurementService } from "@/services/procurementService";
import { procurement } from "@/services/mockData";

type Indent = (typeof procurement.indents)[number];
type Order = (typeof procurement.orders)[number];
function procurementStatus(status: string) { if (status === "Completed") return "resolved" as const; if (status === "Approved" || status === "Confirmed" || status === "Ordered") return "active" as const; if (status === "Pending approval" || status === "Created") return "pending" as const; return "neutral" as const; }

export default function Procurement() {
  const [tab, setTab] = useState<"indents" | "orders">("indents");
  const [status, setStatus] = useState("All");
  const [selected, setSelected] = useState<Indent | Order | null>(null);
  const { data: indents, loading: indentsLoading, error: indentsError, retry: retryIndents } = useOperationData(async () => (await procurementService.listIndents(status)) as Indent[], [status]);
  const { data: orders, loading: ordersLoading, error: ordersError, retry: retryOrders } = useOperationData(async () => (await procurementService.listOrders(status)) as Order[], [status]);
  const activeData = tab === "indents" ? indents : orders;
  const loading = tab === "indents" ? indentsLoading : ordersLoading;
  const error = tab === "indents" ? indentsError : ordersError;
  const retry = tab === "indents" ? retryIndents : retryOrders;
  const statuses = tab === "indents" ? ["All", "Pending approval", "Approved", "Ordered", "Completed"] : ["All", "Created", "Confirmed"];
  const confirm = async (order: Order) => { await procurementService.updateOrderStatus(order.id, "confirmed"); toast.success("Supply order confirmed.", { description: `${order.id} is ready for shipment assignment.` }); await retryOrders(); };
  if (loading && !activeData) return <div className="page-enter"><PanelSkeleton lines={2} /><div className="mt-5"><PanelSkeleton lines={6} /></div></div>;
  if (error) return <InlineError message={error} retry={retry} />;
  return <div className="page-enter max-w-[1640px] text-white">
    <PageHeader eyebrow="Operations / Procurement" title="Procurement control" subtitle="Review facility requirements, approve supply orders, and keep acquisition activity traceable." action={<button onClick={() => toast.message("New indent entry is available once a live requirement service is configured.")} className="inline-flex h-10 items-center gap-2 rounded-md bg-[#00f0a0] px-3.5 text-xs font-bold text-[#091216] hover:bg-[#00d68f]"><FilePlus2 size={16} />Create indent</button>} />
    <section className="mb-5 grid gap-3 md:grid-cols-3">
      <article className="surface-panel p-4 border border-[#223c47] bg-[#13242b]"><p className="label-kicker text-[#00f0a0]">Pending approvals</p><p className="data-number mt-2 text-2xl font-bold text-[#fbbf24]">1</p><p className="mt-1 text-xs text-[#cbd5e1]">Emergency request from Mumbai</p></article>
      <article className="surface-panel p-4 border border-[#223c47] bg-[#13242b]"><p className="label-kicker text-[#00f0a0]">Active supply orders</p><p className="data-number mt-2 text-2xl font-bold text-white">3</p><p className="mt-1 text-xs text-[#cbd5e1]">Across 3 qualified vendors</p></article>
      <article className="surface-panel p-4 border border-[#223c47] bg-[#13242b]"><p className="label-kicker text-[#00f0a0]">Due this week</p><p className="data-number mt-2 text-2xl font-bold text-[#00f0a0]">2</p><p className="mt-1 text-xs text-[#cbd5e1]">Order delivery commitments</p></article>
    </section>
    <section className="surface-panel overflow-hidden border border-[#223c47] bg-[#13242b]">
      <div className="flex flex-col gap-4 border-b border-[#223c47] p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex rounded-md border border-[#223c47] bg-[#0d191f] p-1">
          <button onClick={() => { setTab("indents"); setStatus("All"); }} className={`inline-flex h-8 items-center gap-2 rounded px-3 text-xs font-bold ${tab === "indents" ? "bg-[#173b37] text-[#00f0a0] shadow-sm" : "text-[#cbd5e1] hover:text-white"}`}><ClipboardList size={14} />Indents</button>
          <button onClick={() => { setTab("orders"); setStatus("All"); }} className={`inline-flex h-8 items-center gap-2 rounded px-3 text-xs font-bold ${tab === "orders" ? "bg-[#173b37] text-[#00f0a0] shadow-sm" : "text-[#cbd5e1] hover:text-white"}`}><ShoppingCart size={14} />Supply orders</button>
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {statuses.map((item) => <button key={item} onClick={() => setStatus(item)} className={`h-8 whitespace-nowrap rounded-md border px-3 text-[11px] font-bold ${status === item ? "border-[#00f0a0] bg-[#173b37] text-[#00f0a0]" : "border-[#223c47] bg-[#0d191f] text-[#cbd5e1] hover:bg-[#1a323c] hover:text-white"}`}>{item}</button>)}
        </div>
      </div>
      <div className="overflow-x-auto scrollbar-thin">
        {tab === "indents" ? (
          <table className="w-full min-w-[850px] text-left">
            <thead className="bg-[#0d191f]">
              <tr className="border-b border-[#223c47] text-[10px] font-bold uppercase tracking-[0.1em] text-[#9bb3c1]">
                <th className="px-5 py-3.5">Indent</th><th className="px-4 py-3.5">Requesting facility</th><th className="px-4 py-3.5">Medicine & quantity</th><th className="px-4 py-3.5">Priority</th><th className="px-4 py-3.5">Status</th><th className="px-5 py-3.5 text-right"> </th>
              </tr>
            </thead>
            <tbody>
              {(indents ?? []).map((indent) => (
                <tr key={indent.id} className="border-b border-[#223c47] last:border-0 hover:bg-[#1a323c]">
                  <td className="px-5 py-4"><p className="font-mono text-[11px] font-bold text-[#00f0a0]">{indent.id}</p><p className="mt-1 text-[10px] text-[#9bb3c1]">Raised {indent.raised}</p></td>
                  <td className="px-4 py-4 text-[12px] font-semibold text-white">{indent.facility}</td>
                  <td className="px-4 py-4"><p className="text-[12px] font-bold text-white">{indent.drug}</p><p className="data-number mt-1 text-[11px] text-[#cbd5e1]">{indent.quantity.toLocaleString()} requested</p></td>
                  <td className="px-4 py-4"><StatusBadge status={indent.priority === "Emergency" ? "critical" : indent.priority === "Urgent" ? "warning" : "neutral"} label={indent.priority} /></td>
                  <td className="px-4 py-4"><StatusBadge status={procurementStatus(indent.status)} label={indent.status} /></td>
                  <td className="px-5 py-4 text-right"><button onClick={() => setSelected(indent)} className="inline-flex h-8 items-center gap-1 rounded px-2 text-[11px] font-bold text-[#00f0a0] hover:bg-[#173b37]">Review <ExternalLink size={13} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="w-full min-w-[870px] text-left">
            <thead className="bg-[#0d191f]">
              <tr className="border-b border-[#223c47] text-[10px] font-bold uppercase tracking-[0.1em] text-[#9bb3c1]">
                <th className="px-5 py-3.5">Supply order</th><th className="px-4 py-3.5">Vendor</th><th className="px-4 py-3.5">Fulfilment route</th><th className="px-4 py-3.5">Expected</th><th className="px-4 py-3.5">Status</th><th className="px-5 py-3.5 text-right"> </th>
              </tr>
            </thead>
            <tbody>
              {(orders ?? []).map((order) => (
                <tr key={order.id} className="border-b border-[#223c47] last:border-0 hover:bg-[#1a323c]">
                  <td className="px-5 py-4"><p className="font-mono text-[11px] font-bold text-[#00f0a0]">{order.id}</p><p className="mt-1 text-[11px] font-semibold text-white">{order.drug}</p><p className="data-number mt-1 text-[10px] text-[#9bb3c1]">{order.quantity.toLocaleString()} units</p></td>
                  <td className="px-4 py-4 text-[12px] font-semibold text-[#cbd5e1]">{order.vendor}</td>
                  <td className="px-4 py-4"><p className="text-[11px] font-semibold text-white">{order.destination}</p><p className="mt-1 text-[10px] text-[#9bb3c1]">Shipment: {order.shipment}</p></td>
                  <td className="px-4 py-4 text-[12px] font-semibold text-[#cbd5e1]">{order.expected}</td>
                  <td className="px-4 py-4"><StatusBadge status={procurementStatus(order.status)} label={order.status} /></td>
                  <td className="px-5 py-4 text-right"><button onClick={() => setSelected(order)} className="inline-flex h-8 items-center gap-1 rounded px-2 text-[11px] font-bold text-[#00f0a0] hover:bg-[#173b37]">Detail <ExternalLink size={13} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
    <DetailDrawer open={Boolean(selected)} onClose={() => setSelected(null)} title={selected && "facility" in selected ? selected.id : "Supply order"} subtitle={selected && "facility" in selected ? selected.facility : selected && "vendor" in selected ? selected.vendor : undefined}>
      {selected && ("facility" in selected ? (
        <div className="space-y-5">
          <section className="rounded-lg border border-[#223c47] bg-[#0d191f] p-4">
            <p className="label-kicker text-[#00f0a0]">Requirement</p>
            <p className="mt-2 text-lg font-bold text-white">{selected.drug}</p>
            <p className="data-number mt-1 text-sm font-semibold text-[#00f0a0]">{selected.quantity.toLocaleString()} units requested</p>
            <p className="mt-4 text-sm leading-6 text-[#cbd5e1]">Requested by {selected.facility}. Planned delivery date is {selected.expected}.</p>
          </section>
          <div className="flex justify-end gap-2">
            <button onClick={() => toast.message("Indent sent back for clarification.")} className="h-10 rounded-md border border-[#223c47] bg-[#0d191f] px-3 text-xs font-bold text-[#cbd5e1] hover:border-[#00f0a0] hover:text-white">Request clarification</button>
            <button onClick={() => { toast.success("Indent approved and ready for supply order creation."); setSelected(null); }} className="inline-flex h-10 items-center gap-2 rounded-md bg-[#00f0a0] px-3.5 text-xs font-bold text-[#091216] hover:bg-[#00d68f]"><CheckCircle2 size={15} />Approve indent</button>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          <section className="rounded-lg border border-[#223c47] bg-[#0d191f] p-4">
            <p className="label-kicker text-[#00f0a0]">Supply order details</p>
            <p className="mt-2 text-lg font-bold text-white">{selected.drug}</p>
            <p className="data-number mt-1 text-sm font-semibold text-[#00f0a0]">{selected.quantity.toLocaleString()} units · {selected.vendor}</p>
            <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-[#223c47] pt-4 text-xs">
              <div><dt className="label-kicker text-[#9bb3c1]">Destination</dt><dd className="mt-1.5 font-semibold text-white">{selected.destination}</dd></div>
              <div><dt className="label-kicker text-[#9bb3c1]">Expected arrival</dt><dd className="mt-1.5 font-semibold text-white">{selected.expected}</dd></div>
              <div><dt className="label-kicker text-[#9bb3c1]">Shipment</dt><dd className="mt-1.5 font-semibold text-white">{selected.shipment}</dd></div>
              <div><dt className="label-kicker text-[#9bb3c1]">Current status</dt><dd className="mt-1.5"><StatusBadge status={procurementStatus(selected.status)} label={selected.status} /></dd></div>
            </dl>
          </section>
          {selected.status === "Created" && (
            <div className="flex justify-end">
              <button onClick={() => void confirm(selected)} className="inline-flex h-10 items-center gap-2 rounded-md bg-[#00f0a0] px-3.5 text-xs font-bold text-[#091216] hover:bg-[#00d68f]"><CheckCircle2 size={15} />Confirm supply order</button>
            </div>
          )}
        </div>
      ))}
    </DetailDrawer>
  </div>;
}