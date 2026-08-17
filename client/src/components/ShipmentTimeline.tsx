/** Clinical Cartography: shipment status is shown as a precise route of completed, current, and upcoming operational events. */
import { Check, MapPin } from "lucide-react";

type TimelineEvent = { status: string; location: string; occurred: string; complete: boolean; current?: boolean };
export function ShipmentTimeline({ events, compact = false }: { events: TimelineEvent[]; compact?: boolean }) {
  return <ol className={`relative ${compact ? "space-y-4" : "space-y-5"}`} aria-label="Shipment lifecycle">
    {events.map((event, index) => <li key={`${event.status}-${index}`} className="relative flex gap-3.5"><span className={`relative z-10 grid h-7 w-7 shrink-0 place-items-center rounded-full border ${event.current ? "border-[#1769aa] bg-[#1769aa] text-white ring-4 ring-[#dff0fa]" : event.complete ? "border-emerald-200 bg-emerald-50 text-[#16803c]" : "border-[#c8dce8] bg-white text-[#92a7b7]"}`}>{event.complete ? <Check size={14} strokeWidth={2.7} /> : <span className="h-1.5 w-1.5 rounded-full bg-current" />}</span>{index < events.length - 1 && <span className={`absolute left-[13px] top-7 h-[calc(100%+8px)] w-px ${event.complete ? "bg-[#9fceb4]" : "bg-[#d6e4ec]"}`} />}
      <div className="min-w-0 pb-1"><div className="flex flex-wrap items-center gap-x-2 gap-y-1"><p className={`text-[13px] font-bold ${event.current ? "text-[#0f5d9f]" : event.complete ? "text-[#102a43]" : "text-[#64748b]"}`}>{event.status}</p>{event.current && <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#1769aa]">Current</span>}</div><div className="mt-1 flex items-start gap-1.5 text-[11px] leading-4 text-[#64748b]"><MapPin size={12} className="mt-[1px] shrink-0 text-[#6c8ca2]" />{event.location}</div><p className="mt-1 text-[11px] text-[#8195a5]">{event.occurred}</p></div>
    </li>)}
  </ol>;
}
