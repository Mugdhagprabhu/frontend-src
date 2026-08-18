/** Clinical Cartography: inventory is a searchable, FEFO-aware ledger where exception color is reserved for stock and expiry risk. */
import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import { ArrowDownToLine, ArrowUpRight, ChevronRight, ClipboardCheck, PackagePlus, Search, SlidersHorizontal, X } from "lucide-react";
import { toast } from "sonner";
import { DetailDrawer } from "@/components/DetailDrawer";
import { InlineError, PanelSkeleton } from "@/components/OperationalStates";
import { PageHeader, SectionHeading, StatusBadge } from "@/components/OperationalPrimitives";
import { useOperationData } from "@/hooks/useOperationData";
import { inventoryService } from "@/services/inventoryService";
import { drugs } from "@/services/mockData";

type Drug = (typeof drugs)[number];
const categories = ["All", "Analgesic", "Antibiotic", "Endocrinology", "Fluid Therapy"];

function StockBar({ percentage, health }: { percentage: number; health: string }) {
  return <div className="flex items-center gap-2"><div className="h-1.5 w-20 overflow-hidden rounded-full bg-[#1e353f]"><div className={`h-full rounded-full ${health === "critical" ? "bg-[#f87171]" : health === "warning" ? "bg-[#fbbf24]" : "bg-[#00f0a0]"}`} style={{ width: `${percentage}%` }} /></div><span className="data-number text-[10px] font-bold text-[#9bb3c1]">{percentage}%</span></div>;
}

export default function Inventory() {
  const [, navigate] = useLocation();
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Drug | null>(null);
  const [adjustOpen, setAdjustOpen] = useState(false);
  const { data, loading, error, retry } = useOperationData(async () => (await inventoryService.listDrugs({ category, search })) as Drug[], [category, search]);
  const criticalCount = useMemo(() => (data ?? []).filter((drug) => drug.health === "critical").length, [data]);
  if (loading && !data) return <div className="page-enter"><PanelSkeleton lines={2} /><div className="mt-5"><PanelSkeleton lines={7} /></div></div>;
  if (error) return <InlineError message={error} retry={retry} />;
  return <div className="page-enter max-w-[1640px] text-white">
    <PageHeader eyebrow="Operations / Inventory" title="Inventory ledger" subtitle="Batch-level stock, expiry posture, and immediate availability across the active facility." action={<button onClick={() => setAdjustOpen(true)} className="inline-flex h-10 items-center gap-2 rounded-md bg-[#00f0a0] px-3.5 text-xs font-bold text-[#091216] shadow-sm hover:bg-[#00d68f]"><PackagePlus size={16} />Record stock count</button>} />
    <section className="mb-5 grid gap-3 md:grid-cols-3">
      <article className="surface-panel p-4 border border-[#223c47] bg-[#13242b]"><p className="label-kicker text-[#00f0a0]">Tracked medicines</p><p className="data-number mt-2 text-2xl font-bold tracking-[-0.04em] text-white">{data?.length ?? 0}</p><p className="mt-1 text-xs text-[#cbd5e1]">Across 4 therapeutic categories</p></article>
      <article className="surface-panel p-4 border border-[#223c47] bg-[#13242b]"><p className="label-kicker text-[#00f0a0]">Critical availability</p><p className="data-number mt-2 text-2xl font-bold tracking-[-0.04em] text-[#f87171]">{criticalCount}</p><p className="mt-1 text-xs text-[#cbd5e1]">Require same-day review</p></article>
      <article className="surface-panel p-4 border border-[#223c47] bg-[#13242b]"><p className="label-kicker text-[#00f0a0]">FEFO priorities</p><p className="data-number mt-2 text-2xl font-bold tracking-[-0.04em] text-[#fbbf24]">3</p><p className="mt-1 text-xs text-[#cbd5e1]">Batches with expiry under 45 days</p></article>
    </section>
    <section className="surface-panel route-ledger overflow-hidden border border-[#223c47] bg-[#13242b]">
      <div className="flex flex-col gap-4 border-b border-[#223c47] p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative min-w-0 flex-1 lg:max-w-md">
          <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9bb3c1]" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search medicine name or SKU" className="h-10 w-full rounded-md border border-[#223c47] bg-[#0d191f] pl-9 pr-3 text-sm text-white outline-none placeholder:text-[#9bb3c1] focus:border-[#00f0a0]" />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 lg:pb-0">
          {categories.map((item) => (
            <button key={item} onClick={() => setCategory(item)} className={`h-9 whitespace-nowrap rounded-md border px-3 text-[11px] font-bold ${category === item ? "border-[#00f0a0] bg-[#173b37] text-[#00f0a0]" : "border-[#223c47] bg-[#0d191f] text-[#cbd5e1] hover:bg-[#1a323c] hover:text-white"}`}>{item}</button>
          ))}
          <button onClick={() => toast.message("Advanced filters will be applied to the inventory service query.")} className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-[#223c47] bg-[#0d191f] text-[#9bb3c1] hover:border-[#00f0a0] hover:text-white" aria-label="More inventory filters"><SlidersHorizontal size={16} /></button>
        </div>
      </div>
      <div className="overflow-x-auto scrollbar-thin">
        <table className="w-full min-w-[920px] text-left">
          <thead className="bg-[#0d191f]">
            <tr className="border-b border-[#223c47] text-[10px] font-bold uppercase tracking-[0.1em] text-[#9bb3c1]">
              <th className="px-5 py-3.5">Medicine</th><th className="px-4 py-3.5">Available stock</th><th className="px-4 py-3.5">Batch coverage</th><th className="px-4 py-3.5">Nearest expiry</th><th className="px-4 py-3.5">Storage</th><th className="px-4 py-3.5">FEFO priority</th><th className="px-5 py-3.5 text-right"> </th>
            </tr>
          </thead>
          <tbody>
            {(data ?? []).map((drug) => (
              <tr key={drug.id} className="border-b border-[#223c47] last:border-0 hover:bg-[#1a323c]">
                <td className="px-5 py-4"><button onClick={() => setSelected(drug)} className="text-left"><p className="text-[13px] font-bold text-white hover:text-[#00f0a0]">{drug.name}</p><p className="mt-1 text-[11px] font-medium text-[#9bb3c1]">{drug.category} · {drug.sku}</p></button></td>
                <td className="px-4 py-4"><p className="data-number text-[13px] font-bold text-white">{drug.currentStock.toLocaleString()} <span className="font-medium text-[#9bb3c1]">{drug.unit}</span></p><p className={`mt-1 text-[10px] font-semibold ${drug.trend < 0 ? "text-[#fbbf24]" : "text-[#00f0a0]"}`}>{drug.trend > 0 ? "+" : ""}{drug.trend}% vs. 7-day avg.</p></td>
                <td className="px-4 py-4"><p className="data-number text-[12px] font-bold text-white">{drug.batchCount} active batches</p><div className="mt-2"><StockBar percentage={drug.stockPercent} health={drug.health} /></div></td>
                <td className="px-4 py-4"><p className={`data-number text-[12px] font-bold ${drug.expiryDays < 15 ? "text-[#f87171]" : drug.expiryDays < 50 ? "text-[#fbbf24]" : "text-white"}`}>{drug.nearestExpiry}</p><p className="mt-1 text-[10px] text-[#9bb3c1]">{drug.expiryDays} days remaining</p></td>
                <td className="px-4 py-4 text-[12px] font-medium text-[#cbd5e1]">{drug.storage}</td>
                <td className="px-4 py-4"><StatusBadge status={drug.fefo.includes("Immediate") ? "critical" : drug.fefo.includes("High") ? "warning" : "healthy"} label={drug.fefo} /></td>
                <td className="px-5 py-4 text-right"><button onClick={() => setSelected(drug)} className="inline-flex h-8 items-center gap-1 rounded px-2 text-[11px] font-bold text-[#00f0a0] hover:bg-[#173b37]">Detail <ChevronRight size={14} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
    <DetailDrawer open={Boolean(selected)} onClose={() => setSelected(null)} title={selected?.name ?? "Medicine detail"} subtitle={selected ? `${selected.category} · ${selected.sku}` : undefined}>
      {selected && <div className="space-y-6">
        <section className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[{ label: "Available stock", value: `${selected.currentStock.toLocaleString()}`, detail: selected.unit }, { label: "Reorder level", value: selected.reorderLevel.toLocaleString(), detail: "units" }, { label: "Nearest expiry", value: `${selected.expiryDays} days`, detail: selected.nearestExpiry }, { label: "Storage band", value: selected.storage, detail: "required" }].map((item) => (
            <div key={item.label} className="rounded-md border border-[#223c47] bg-[#0d191f] p-3"><p className="label-kicker text-[#00f0a0]">{item.label}</p><p className="data-number mt-2 text-[15px] font-bold text-white">{item.value}</p><p className="mt-1 text-[10px] text-[#9bb3c1]">{item.detail}</p></div>
          ))}
        </section>
        <section>
          <SectionHeading label="Batch ledger" title="Available batches" detail="Issued in first-expiry-first-out order." />
          <div className="mt-3 overflow-hidden rounded-md border border-[#223c47] bg-[#0d191f]">
            {selected.batches.map((batch, index) => (
              <div key={batch.batchNo} className={`p-4 ${index ? "border-t border-[#223c47]" : ""}`}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div><p className="font-mono text-[11px] font-bold text-[#00f0a0]">{batch.batchNo}</p><p className="mt-1 text-xs font-medium text-[#cbd5e1]">{batch.manufacturer}</p></div>
                  <StatusBadge status={batch.status === "Near expiry" ? "critical" : batch.status === "High priority" ? "warning" : "healthy"} label={batch.status} />
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-[11px]">
                  <div><p className="label-kicker text-[#9bb3c1]">Manufactured</p><p className="mt-1 text-[#cbd5e1]">{batch.manufacturingDate}</p></div>
                  <div><p className="label-kicker text-[#9bb3c1]">Expires</p><p className="mt-1 text-[#cbd5e1]">{batch.expiryDate}</p></div>
                  <div><p className="label-kicker text-[#9bb3c1]">Quantity</p><p className="data-number mt-1 font-bold text-white">{batch.quantity.toLocaleString()}</p></div>
                </div>
              </div>
            ))}
          </div>
        </section>
        <section>
          <SectionHeading label="Recent ledger" title="Stock movements" />
          <div className="mt-3 space-y-3">
            {selected.movements.map((movement) => (
              <div key={`${movement.date}-${movement.reference}`} className="flex items-start gap-3 rounded-md border border-[#223c47] bg-[#0d191f] p-3">
                <span className={`mt-0.5 grid h-7 w-7 place-items-center rounded ${movement.type.includes("Consumption") || movement.type.includes("out") ? "bg-[#38260a] text-[#fbbf24]" : "bg-[#12362b] text-[#00f0a0]"}`}>{movement.type.includes("Consumption") || movement.type.includes("out") ? <ArrowUpRight size={15} /> : <ArrowDownToLine size={15} />}</span>
                <div className="min-w-0 flex-1"><p className="text-xs font-bold text-white">{movement.type} <span className="data-number text-[#00f0a0]">{movement.quantity}</span></p><p className="mt-1 text-[11px] text-[#cbd5e1]">{movement.reference}</p></div>
                <time className="data-number text-[10px] text-[#9bb3c1]">{movement.date}</time>
              </div>
            ))}
          </div>
        </section>
        <button onClick={() => { setSelected(null); navigate("/alerts"); }} className="inline-flex h-10 items-center gap-2 rounded-md border border-[#223c47] bg-[#0d191f] px-3.5 text-xs font-bold text-[#00f0a0] hover:border-[#00f0a0] hover:bg-[#1a323c]"><ClipboardCheck size={15} />Review related alerts</button>
      </div>}
    </DetailDrawer>
    {adjustOpen && (
      <div className="fixed inset-0 z-50 grid place-items-center bg-[#050c0f]/80 p-4 backdrop-blur-[2px]">
        <form onSubmit={(event) => { event.preventDefault(); setAdjustOpen(false); toast.success("Stock count recorded in the local operational ledger.", { description: "Connect VITE_INVENTORY_API_URL to persist this adjustment." }); }} className="w-full max-w-md rounded-xl border border-[#223c47] bg-[#13242b] p-5 shadow-2xl">
          <div className="flex items-start justify-between">
            <div><p className="label-kicker text-[#00f0a0]">Inventory action</p><h2 className="mt-2 text-lg font-bold text-white">Record stock count</h2></div>
            <button type="button" onClick={() => setAdjustOpen(false)} className="rounded p-1.5 text-[#9bb3c1] hover:bg-[#1a323c] hover:text-white"><X size={18} /></button>
          </div>
          <p className="mt-3 text-sm leading-5 text-[#cbd5e1]">This action creates an inventory-count adjustment when a live inventory service is configured.</p>
          <label className="mt-5 block text-xs font-bold text-[#9bb3c1]">Medicine
            <select required className="mt-1.5 h-10 w-full rounded-md border border-[#223c47] bg-[#0d191f] px-3 text-sm text-white outline-none focus:border-[#00f0a0]">
              <option value="" className="bg-[#13242b] text-white">Select medicine</option>
              {drugs.map((drug) => <option key={drug.id} value={drug.id} className="bg-[#13242b] text-white">{drug.name}</option>)}
            </select>
          </label>
          <label className="mt-4 block text-xs font-bold text-[#9bb3c1]">Counted quantity
            <input required min="0" type="number" placeholder="0" className="mt-1.5 h-10 w-full rounded-md border border-[#223c47] bg-[#0d191f] px-3 text-sm text-white outline-none placeholder:text-[#9bb3c1] focus:border-[#00f0a0]" />
          </label>
          <div className="mt-6 flex justify-end gap-2">
            <button type="button" onClick={() => setAdjustOpen(false)} className="h-10 rounded-md px-3 text-xs font-bold text-[#cbd5e1] hover:bg-[#1a323c] hover:text-white">Cancel</button>
            <button className="h-10 rounded-md bg-[#00f0a0] px-3.5 text-xs font-bold text-[#091216] hover:bg-[#00d68f]">Save count</button>
          </div>
        </form>
      </div>
    )}
  </div>;
}