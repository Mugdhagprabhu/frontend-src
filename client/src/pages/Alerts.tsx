/** Clinical Cartography: alerts form a real worklist, with severity, lifecycle state, recommendations, and accountable acknowledgment or resolution. */
import { useMemo, useState } from "react";
import { Check, CircleAlert, Filter, Lightbulb, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { DetailDrawer } from "@/components/DetailDrawer";
import { InlineError, PanelSkeleton } from "@/components/OperationalStates";
import { EmptyOperationalState, PageHeader, SectionHeading, StatusBadge } from "@/components/OperationalPrimitives";
import { useOperationData } from "@/hooks/useOperationData";
import { inventoryService } from "@/services/inventoryService";
import { alerts } from "@/services/mockData";

type Alert = (typeof alerts)[number];
function alertTone(alert: Alert) { return alert.severity === "Critical" ? "critical" : alert.severity === "Warning" ? "warning" : "info"; }

export default function Alerts() {
  const [severity, setSeverity] = useState("All");
  const [state, setState] = useState("All");
  const [type, setType] = useState("All");
  const [selected, setSelected] = useState<Alert | null>(null);
  const { data, loading, error, retry } = useOperationData(async () => (await inventoryService.listAlerts({ severity, status: state, type })) as Alert[], [severity, state, type]);
  const counts = useMemo(() => ({ critical: (data ?? []).filter((item) => item.severity === "Critical" && item.state !== "Resolved").length, open: (data ?? []).filter((item) => item.state === "Open").length, resolved: (data ?? []).filter((item) => item.state === "Resolved").length }), [data]);
  const update = async (status: "acknowledged" | "resolved") => { if (!selected) return; await inventoryService.updateAlertStatus(selected.id, status); toast.success(status === "resolved" ? "Alert resolved." : "Alert acknowledged.", { description: `${selected.type} alert for ${selected.drug} has been updated.` }); setSelected(null); await retry(); };
  if (loading && !data) return <div className="page-enter"><PanelSkeleton lines={2} /><div className="mt-5"><PanelSkeleton lines={6} /></div></div>;
  if (error) return <InlineError message={error} retry={retry} />;
  return <div className="page-enter max-w-[1640px] text-white">
    <PageHeader eyebrow="Operations / Alert center" title="Operational alerts" subtitle="Prioritize availability risks, near-expiry batches, route delays, and anomalous consumption signals." action={<button onClick={() => toast.message("Alert policy configuration is tied to the live inventory service.")} className="inline-flex h-10 items-center gap-2 rounded-md border border-[#223c47] bg-[#0d191f] px-3.5 text-xs font-bold text-[#00f0a0] hover:border-[#00f0a0] hover:bg-[#1a323c]"><ShieldCheck size={16} />Alert policy</button>} />
    <section className="mb-5 grid gap-3 md:grid-cols-3">
      <article className="surface-panel p-4 border border-[#223c47] bg-[#13242b]"><p className="label-kicker text-[#00f0a0]">Critical, unresolved</p><p className="data-number mt-2 text-2xl font-bold text-[#f87171]">{counts.critical}</p><p className="mt-1 text-xs text-[#cbd5e1]">Demand immediate coordination</p></article>
      <article className="surface-panel p-4 border border-[#223c47] bg-[#13242b]"><p className="label-kicker text-[#00f0a0]">Open worklist</p><p className="data-number mt-2 text-2xl font-bold text-[#fbbf24]">{counts.open}</p><p className="mt-1 text-xs text-[#cbd5e1]">Awaiting acknowledgment or action</p></article>
      <article className="surface-panel p-4 border border-[#223c47] bg-[#13242b]"><p className="label-kicker text-[#00f0a0]">Resolved in view</p><p className="data-number mt-2 text-2xl font-bold text-[#00f0a0]">{counts.resolved}</p><p className="mt-1 text-xs text-[#cbd5e1]">Retained for audit clarity</p></article>
    </section>
    <section className="surface-panel route-ledger overflow-hidden border border-[#223c47] bg-[#13242b]">
      <div className="flex flex-col gap-4 border-b border-[#223c47] p-4 sm:p-5 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-center gap-2"><Filter size={16} className="text-[#00f0a0]" /><p className="text-[12px] font-bold text-white">Filter worklist</p></div>
        <div className="flex flex-wrap gap-2">
          {[[severity, setSeverity, ["All", "Critical", "Warning", "Info"]], [state, setState, ["All", "Open", "Acknowledged", "Resolved"]], [type, setType, ["All", "Stockout", "Low stock", "Near expiry", "Delayed shipment", "Abnormal consumption"]]].map(([value, setter, options], index) => (
            <select key={index} value={value as string} onChange={(event) => (setter as (value: string) => void)(event.target.value)} className="h-9 rounded-md border border-[#223c47] bg-[#0d191f] px-3 text-[11px] font-bold text-white outline-none focus:border-[#00f0a0]">
              {(options as string[]).map((option) => <option key={option} value={option} className="bg-[#13242b] text-white">{option}</option>)}
            </select>
          ))}
        </div>
      </div>
      <div className="divide-y divide-[#223c47]">
        {(data ?? []).map((alert) => (
          <button key={alert.id} onClick={() => setSelected(alert)} className="group flex w-full gap-3 px-5 py-4 text-left transition-colors duration-150 hover:bg-[#1a323c] sm:gap-4 sm:px-6">
            <span className={`mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-md border ${alert.severity === "Critical" ? "border-[#622323] bg-[#3a1515] text-[#f87171]" : alert.severity === "Warning" ? "border-[#5c4217] bg-[#38260a] text-[#fbbf24]" : "border-[#1b4356] bg-[#0e2938] text-[#38bdf8]"}`}><CircleAlert size={18} /></span>
            <span className="min-w-0 flex-1">
              <span className="flex flex-wrap items-center gap-2">
                <StatusBadge status={alertTone(alert)} label={alert.severity} />
                <StatusBadge status={alert.state === "Resolved" ? "resolved" : alert.state === "Acknowledged" ? "active" : "pending"} label={alert.state} />
                <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#9bb3c1]">{alert.type}</span>
              </span>
              <span className="mt-2 block text-[13px] font-bold text-white">{alert.drug} <span className="font-medium text-[#9bb3c1]">· {alert.facility}</span></span>
              <span className="mt-1 block text-xs leading-5 text-[#cbd5e1]">{alert.message}</span>
              <span className="mt-2 block text-[10px] font-semibold text-[#9bb3c1]">Raised {alert.time}</span>
            </span>
            <span className="hidden h-8 items-center rounded-md border border-[#223c47] bg-[#0d191f] px-2.5 text-[11px] font-bold text-[#00f0a0] group-hover:border-[#00f0a0] group-hover:bg-[#173b37] sm:flex">Review</span>
          </button>
        ))}
      </div>
      {!(data ?? []).length && <EmptyOperationalState icon={<Check size={22} />} title="No alerts match these filters" detail="Adjust severity, lifecycle, or alert type to return to the operational worklist." />}
    </section>
    <DetailDrawer open={Boolean(selected)} onClose={() => setSelected(null)} title={selected?.type ?? "Alert detail"} subtitle={selected ? `${selected.drug} · ${selected.facility}` : undefined}>
      {selected && <div className="space-y-6">
        <section className={`rounded-lg border p-4 ${selected.severity === "Critical" ? "border-[#622323] bg-[#3a1515]" : selected.severity === "Warning" ? "border-[#5c4217] bg-[#38260a]" : "border-[#1b4356] bg-[#0e2938]"}`}>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={alertTone(selected)} label={selected.severity} />
            <StatusBadge status={selected.state === "Resolved" ? "resolved" : selected.state === "Acknowledged" ? "active" : "pending"} label={selected.state} />
          </div>
          <p className="mt-4 text-sm font-bold leading-6 text-white">{selected.message}</p>
          <p className="mt-2 text-xs text-[#cbd5e1]">Raised {selected.time} · Policy type: {selected.type}</p>
        </section>
        <section className="rounded-lg border border-[#223c47] bg-[#0d191f] p-4">
          <div className="flex items-center gap-2"><Lightbulb size={16} className="text-[#00f0a0]" /><p className="text-xs font-bold text-[#00f0a0]">Recommended next action</p></div>
          <p className="mt-3 text-sm leading-6 text-[#cbd5e1]">{selected.recommendation}</p>
        </section>
        <section>
          <SectionHeading label="Lifecycle" title="Alert handling" />
          <div className="mt-4 grid grid-cols-3 gap-2 text-center text-[10px] font-bold">
            <div className="rounded border border-[#223c47] bg-[#1a323c] px-2 py-3 text-[#00f0a0]">Detected</div>
            <div className={`rounded border px-2 py-3 ${selected.state === "Acknowledged" || selected.state === "Resolved" ? "border-[#1b4356] bg-[#0e2938] text-[#38bdf8]" : "border-[#223c47] bg-[#0d191f] text-[#9bb3c1]"}`}>Acknowledged</div>
            <div className={`rounded border px-2 py-3 ${selected.state === "Resolved" ? "border-[#1e5344] bg-[#12362b] text-[#00f0a0]" : "border-[#223c47] bg-[#0d191f] text-[#9bb3c1]"}`}>Resolved</div>
          </div>
        </section>
        {selected.state !== "Resolved" && (
          <div className="flex flex-wrap justify-end gap-2">
            {selected.state === "Open" && <button onClick={() => void update("acknowledged")} className="h-10 rounded-md border border-[#223c47] bg-[#0d191f] px-3.5 text-xs font-bold text-white hover:border-[#00f0a0] hover:bg-[#1a323c]">Acknowledge</button>}
            <button onClick={() => void update("resolved")} className="inline-flex h-10 items-center gap-2 rounded-md bg-[#00f0a0] px-3.5 text-xs font-bold text-[#091216] hover:bg-[#00d68f]"><Check size={15} />Mark resolved</button>
          </div>
        )}
      </div>}
    </DetailDrawer>
  </div>;
}