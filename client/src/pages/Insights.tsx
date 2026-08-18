/** Clinical Cartography: AI assistance is presented as bounded decision support, with observable evidence, confidence, and an accountable action. */
import { useState } from "react";
import { ArrowRight, BrainCircuit, CheckCircle2, CircleGauge, Lightbulb, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { DetailDrawer } from "@/components/DetailDrawer";
import { InlineError, PanelSkeleton } from "@/components/OperationalStates";
import { PageHeader, SectionHeading, StatusBadge } from "@/components/OperationalPrimitives";
import { useOperationData } from "@/hooks/useOperationData";
import { insightsService } from "@/services/insightsService";
import { insights } from "@/services/mockData";

type Insight = (typeof insights)[number];
function insightStatus(status: string) { if (status === "Immediate action") return "critical"; if (status === "Recommended" || status === "Operational action") return "active"; return "info"; }

export default function Insights() {
  const [selected, setSelected] = useState<Insight | null>(null);
  const [applied, setApplied] = useState<string[]>([]);
  const { data, loading, error, retry } = useOperationData(async () => (await insightsService.listInsights()) as Insight[], []);
  const apply = (insight: Insight) => { setApplied((previous) => [...previous, insight.id]); toast.success("Recommended action queued.", { description: insight.action }); setSelected(null); };
  if (loading && !data) return <div className="page-enter"><PanelSkeleton lines={2} /><div className="mt-5"><PanelSkeleton lines={5} /></div></div>;
  if (error) return <InlineError message={error} retry={retry} />;
  return <div className="page-enter max-w-[1640px] text-white">
    <PageHeader eyebrow="Operations / Decision support" title="AI Insights" subtitle="Explainable, operational recommendations derived from inventory, consumption, expiry, and supply-route signals." action={<div className="inline-flex items-center gap-2 rounded border border-[#1b4356] bg-[#0e2938] px-3 py-2 text-[11px] font-bold uppercase tracking-[0.08em] text-[#38bdf8]"><ShieldCheck size={14} />Decision support</div>} />
    <section className="relative mb-5 overflow-hidden rounded-[10px] border border-[#223c47] bg-[#11232b] p-5 sm:p-7">
      <img src="/manus-storage/distrack-analytics-texture_c2d2cd15.jpg" alt="" className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-15" />
      <div className="relative grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded border border-[#223c47] bg-[#0d191f]/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-[#00f0a0]"><BrainCircuit size={13} />Model context</div>
          <h2 className="mt-4 max-w-2xl text-[24px] font-bold tracking-[-0.04em] text-white">Prioritize actions that protect care continuity.</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#cbd5e1]">Each recommendation is linked to a live operational signal and requires human review before a transfer, dispensing priority, or procurement action is executed.</p>
        </div>
        <div className="grid grid-cols-3 gap-3 border-t border-[#223c47] pt-5 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
          {[{ value: "4", label: "Active insights" }, { value: "89%", label: "Mean confidence" }, { value: "0", label: "Auto-executed" }].map((item) => (
            <div key={item.label}><p className="data-number text-xl font-bold text-[#00f0a0]">{item.value}</p><p className="mt-1 text-[10px] font-bold uppercase tracking-[0.08em] text-[#9bb3c1]">{item.label}</p></div>
          ))}
        </div>
      </div>
    </section>
    <section className="grid gap-4 xl:grid-cols-2">
      {(data ?? []).map((insight) => (
        <article key={insight.id} className="surface-panel surface-panel-hover relative overflow-hidden p-5 border border-[#223c47] bg-[#13242b]">
          <div className="absolute left-0 top-0 h-full w-1 bg-[#00f0a0]" />
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={insightStatus(insight.status)} label={insight.status} />
                <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#9bb3c1]">{insight.type}</span>
              </div>
              <h2 className="mt-3 text-[16px] font-bold tracking-[-0.02em] text-white">{insight.title}</h2>
              <p className="mt-1 text-xs font-semibold text-[#cbd5e1]">{insight.drug} · {insight.facility}</p>
            </div>
            <div className="text-right"><p className="data-number text-[24px] font-bold tracking-[-0.04em] text-[#00f0a0]">{insight.metric}</p><p className="mt-1 text-[9px] font-bold uppercase tracking-[0.1em] text-[#9bb3c1]">{insight.metricLabel}</p></div>
          </div>
          <p className="mt-4 border-t border-[#223c47] pt-4 text-[13px] leading-5 text-[#cbd5e1]">{insight.explanation}</p>
          <div className="mt-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#9bb3c1]"><CircleGauge size={14} className="text-[#00f0a0]" />{insight.confidence}% confidence</div>
            <button onClick={() => setSelected(insight)} className="inline-flex h-8 items-center gap-1 rounded px-2 text-[11px] font-bold text-[#00f0a0] hover:bg-[#1a323c]">Review rationale <ArrowRight size={13} /></button>
          </div>
          {applied.includes(insight.id) && <div className="mt-3 flex items-center gap-2 rounded border border-[#1e5344] bg-[#12362b] px-3 py-2 text-[11px] font-bold text-[#00f0a0]"><CheckCircle2 size={14} />Action queued for human confirmation</div>}
        </article>
      ))}
    </section>
    <DetailDrawer open={Boolean(selected)} onClose={() => setSelected(null)} title={selected?.title ?? "Decision support detail"} subtitle={selected ? `${selected.drug} · ${selected.facility}` : undefined}>
      {selected && <div className="space-y-6">
        <section className="rounded-lg border border-[#223c47] bg-[#0d191f] p-4">
          <div className="flex items-start justify-between gap-4">
            <div><p className="label-kicker text-[#00f0a0]">Recommended action</p><p className="mt-2 text-sm font-bold leading-6 text-white">{selected.action}</p></div>
            <div className="text-right"><p className="data-number text-2xl font-bold text-[#00f0a0]">{selected.confidence}%</p><p className="label-kicker mt-1 text-[#9bb3c1]">Confidence</p></div>
          </div>
        </section>
        <section>
          <SectionHeading label="Why this surfaced" title="Observed evidence" />
          <div className="mt-4 rounded-lg border border-[#223c47] bg-[#0d191f] p-4"><p className="text-sm leading-6 text-[#cbd5e1]">{selected.explanation}</p></div>
        </section>
        <section>
          <SectionHeading label="Control boundary" title="Human review remains required" />
          <div className="mt-4 flex gap-3 rounded-lg border border-[#223c47] bg-[#0d191f] p-4"><Lightbulb size={18} className="mt-0.5 shrink-0 text-[#00f0a0]" /><p className="text-xs leading-5 text-[#cbd5e1]">DIStrack prepares an operational recommendation. It does not automatically change stock, supply order, or shipment status.</p></div>
        </section>
        <div className="flex justify-end"><button onClick={() => apply(selected)} className="inline-flex h-10 items-center gap-2 rounded-md bg-[#00f0a0] px-3.5 text-xs font-bold text-[#091216] hover:bg-[#00d68f]"><CheckCircle2 size={15} />Queue for human review</button></div>
      </div>}
    </DetailDrawer>
  </div>;
}