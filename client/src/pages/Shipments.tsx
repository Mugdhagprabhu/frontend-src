/** Clinical Cartography: shipment tracking is an event route, showing what has happened, where responsibility now sits, and what comes next. */
import { useState } from "react";
import { MapPin, PackageCheck, Route } from "lucide-react";
import { toast } from "sonner";
import { DetailDrawer } from "@/components/DetailDrawer";
import { InlineError, PanelSkeleton } from "@/components/OperationalStates";
import { PageHeader, SectionHeading, StatusBadge } from "@/components/OperationalPrimitives";
import { ShipmentTimeline } from "@/components/ShipmentTimeline";
import { useOperationData } from "@/hooks/useOperationData";
import { shipmentService } from "@/services/shipmentService";
import { shipments } from "@/services/mockData";

type Shipment = (typeof shipments)[number];
function shipmentTone(status: string) { return status === "Delivered" ? "resolved" : status === "In transit" ? "warning" : "active"; }

export default function Shipments() {
  const [filter, setFilter] = useState("All");
  const [selected, setSelected] = useState<Shipment | null>(null);
  const { data, loading, error, retry } = useOperationData(async () => (await shipmentService.listShipments(filter)) as Shipment[], [filter]);
  const receive = async (shipment: Shipment) => { await shipmentService.updateShipmentStatus(shipment.id, "Received", shipment.destination, "Receipt confirmed by facility operations."); toast.success("Shipment receipt confirmed.", { description: `${shipment.trackingNumber} has been added to the receiving ledger.` }); await retry(); setSelected(null); };
  if (loading && !data) return <div className="page-enter"><PanelSkeleton lines={2} /><div className="mt-5"><PanelSkeleton lines={6} /></div></div>;
  if (error) return <InlineError message={error} retry={retry} />;
  return <div className="page-enter max-w-[1640px] text-white">
    <PageHeader eyebrow="Operations / Shipments" title="Shipment visibility" subtitle="Follow every procurement delivery from requirement approval through confirmed receipt." action={<button onClick={() => toast.message("Shipment creation is initiated from a confirmed supply order.")} className="inline-flex h-10 items-center gap-2 rounded-md border border-[#223c47] bg-[#0d191f] px-3.5 text-xs font-bold text-[#00f0a0] hover:border-[#00f0a0] hover:bg-[#1a323c]"><PackageCheck size={16} />Receive a delivery</button>} />
    <section className="mb-5 grid gap-3 md:grid-cols-3">
      <article className="surface-panel p-4 border border-[#223c47] bg-[#13242b]"><p className="label-kicker text-[#00f0a0]">In motion</p><p className="data-number mt-2 text-2xl font-bold text-white">2</p><p className="mt-1 text-xs text-[#cbd5e1]">Shipments on active routes</p></article>
      <article className="surface-panel p-4 border border-[#223c47] bg-[#13242b]"><p className="label-kicker text-[#00f0a0]">ETA within 24h</p><p className="data-number mt-2 text-2xl font-bold text-[#fbbf24]">2</p><p className="mt-1 text-xs text-[#cbd5e1]">One is behind plan</p></article>
      <article className="surface-panel p-4 border border-[#223c47] bg-[#13242b]"><p className="label-kicker text-[#00f0a0]">Received this week</p><p className="data-number mt-2 text-2xl font-bold text-[#00f0a0]">14</p><p className="mt-1 text-xs text-[#cbd5e1]">Across monitored facilities</p></article>
    </section>
    <section className="surface-panel route-ledger overflow-hidden border border-[#223c47] bg-[#13242b]">
      <div className="flex flex-col gap-4 border-b border-[#223c47] p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
        <div><p className="label-kicker text-[#00f0a0]">Route register</p><h2 className="mt-1.5 text-[15px] font-bold text-white">Active and recent shipments</h2></div>
        <div className="flex gap-2 overflow-x-auto">{["All", "In transit", "Dispatched", "Delivered"].map((item) => <button key={item} onClick={() => setFilter(item)} className={`h-8 whitespace-nowrap rounded-md border px-3 text-[11px] font-bold ${filter === item ? "border-[#00f0a0] bg-[#173b37] text-[#00f0a0]" : "border-[#223c47] bg-[#0d191f] text-[#cbd5e1] hover:bg-[#1a323c] hover:text-white"}`}>{item}</button>)}</div>
      </div>
      <div className="divide-y divide-[#223c47]">
        {(data ?? []).map((shipment) => (
          <button key={shipment.id} onClick={() => setSelected(shipment)} className="group grid w-full gap-3 px-5 py-4 text-left transition-colors duration-150 hover:bg-[#1a323c] sm:grid-cols-[minmax(0,1.1fr)_minmax(185px,.95fr)_minmax(180px,.9fr)_auto] sm:items-center sm:gap-5 sm:px-6">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2"><p className="font-mono text-[11px] font-bold text-[#00f0a0]">{shipment.trackingNumber}</p><StatusBadge status={shipmentTone(shipment.status)} label={shipment.status} /></div>
              <p className="mt-1.5 text-[13px] font-bold text-white">{shipment.drug}</p>
              <p className="mt-1 text-[11px] text-[#9bb3c1]">{shipment.quantity} · {shipment.vendor}</p>
            </div>
            <div className="hidden min-w-0 sm:block">
              <p className="label-kicker text-[#9bb3c1]">Delivery route</p>
              <p className="mt-1.5 truncate text-[12px] font-semibold text-white">{shipment.origin}</p>
              <p className="mt-0.5 flex items-center gap-1 truncate text-[11px] text-[#cbd5e1]"><MapPin size={11} className="text-[#00f0a0]" />{shipment.destination}</p>
            </div>
            <div className="min-w-0">
              <div className="flex items-center justify-between gap-3"><p className="label-kicker text-[#9bb3c1]">Lifecycle</p><p className={`text-[10px] font-bold ${shipment.delay.includes("later") ? "text-[#fbbf24]" : "text-[#00f0a0]"}`}>{shipment.delay}</p></div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#1e353f]"><div className={`h-full rounded-full ${shipment.status === "Delivered" ? "bg-[#00f0a0]" : shipment.delay.includes("later") ? "bg-[#fbbf24]" : "bg-[#00f0a0]"}`} style={{ width: `${shipment.progress}%` }} /></div>
              <p className="mt-1.5 text-[11px] font-medium text-[#cbd5e1]">ETA: {shipment.eta}</p>
            </div>
            <span className="hidden rounded-md border border-[#223c47] bg-[#0d191f] p-2 text-[#00f0a0] group-hover:border-[#00f0a0] group-hover:bg-[#173b37] sm:grid"><Route size={15} /></span>
          </button>
        ))}
      </div>
    </section>
    <DetailDrawer open={Boolean(selected)} onClose={() => setSelected(null)} title={selected?.trackingNumber ?? "Shipment detail"} subtitle={selected ? `${selected.drug} · ${selected.quantity}` : undefined}>
      {selected && <div className="space-y-6">
        <section className="overflow-hidden rounded-lg border border-[#223c47] bg-[#11232b] text-white">
          <img src="/manus-storage/distrack-shipment-route_53ac9077.jpg" alt="Medical delivery route" className="h-[150px] w-full object-cover opacity-50" />
          <div className="-mt-14 relative bg-gradient-to-b from-transparent via-[#0d191f]/90 to-[#0d191f] px-4 pb-4 pt-10">
            <div className="flex items-center justify-between gap-3">
              <div><p className="text-[10px] font-bold uppercase tracking-[0.13em] text-[#00f0a0]">Current route</p><p className="mt-1 text-sm font-bold text-white">{selected.origin} → {selected.destination}</p></div>
              <StatusBadge status={shipmentTone(selected.status)} label={selected.status} />
            </div>
          </div>
        </section>
        <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[{ label: "Supply order", value: selected.supplyOrder }, { label: "Quantity", value: selected.quantity }, { label: "ETA", value: selected.eta }, { label: "Route status", value: selected.delay }].map((item) => (
            <div key={item.label} className="rounded-md border border-[#223c47] bg-[#0d191f] p-3"><p className="label-kicker text-[#00f0a0]">{item.label}</p><p className="mt-2 text-[12px] font-bold leading-5 text-white">{item.value}</p></div>
          ))}
        </section>
        <section>
          <SectionHeading label="Shipment timeline" title="Six-stage route lifecycle" detail="Recorded operational events and expected hand-offs." />
          <div className="mt-5"><ShipmentTimeline events={selected.events} /></div>
        </section>
        {selected.status === "Delivered" && (
          <div className="flex justify-end">
            <button onClick={() => void receive(selected)} className="inline-flex h-10 items-center gap-2 rounded-md bg-[#00f0a0] px-3.5 text-xs font-bold text-[#091216] hover:bg-[#00d68f]"><PackageCheck size={15} />Confirm receipt</button>
          </div>
        )}
      </div>}
    </DetailDrawer>
  </div>;
}