/** Dark Teal Cartography: Shipment timeline on dark surface */
import { Check, MapPin } from "lucide-react";

type TimelineEvent = { status: string; location: string; occurred: string; complete: boolean; current?: boolean };

export function ShipmentTimeline({ events, compact = false }: { events: TimelineEvent[]; compact?: boolean }) {
  return (
    <ol className={`relative ${compact ? "space-y-4" : "space-y-5"}`} aria-label="Shipment lifecycle">
      {events.map((event, index) => (
        <li key={`${event.status}-${index}`} className="relative flex gap-3.5">
          <span 
            className={`relative z-10 grid h-7 w-7 shrink-0 place-items-center rounded-full border ${
              event.current 
                ? "border-[#00f0a0] bg-[#00f0a0] text-[#091216] ring-4 ring-[#00f0a0]/20" 
                : event.complete 
                ? "border-[#1e5344] bg-[#12362b] text-[#00f0a0]" 
                : "border-[#223c47] bg-[#13242b] text-[#9bb3c1]"
            }`}
          >
            {event.complete ? <Check size={14} strokeWidth={2.7} /> : <span className="h-1.5 w-1.5 rounded-full bg-current" />}
          </span>
          {index < events.length - 1 && (
            <span className={`absolute left-[13px] top-7 h-[calc(100%+8px)] w-px ${event.complete ? "bg-[#1e5344]" : "bg-[#223c47]"}`} />
          )}
          <div className="min-w-0 pb-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <p className={`text-[13px] font-bold ${event.current ? "text-[#00f0a0]" : event.complete ? "text-white" : "text-[#9bb3c1]"}`}>
                {event.status}
              </p>
              {event.current && <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#00f0a0]">Current</span>}
            </div>
            <div className="mt-1 flex items-start gap-1.5 text-[11px] leading-4 text-[#9bb3c1]">
              <MapPin size={12} className="mt-[1px] shrink-0 text-[#7e9aa8]" />
              {event.location}
            </div>
            <p className="mt-1 text-[11px] text-[#6b8290]">{event.occurred}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}