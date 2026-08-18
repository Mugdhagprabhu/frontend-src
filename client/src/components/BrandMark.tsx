/** Dark Teal Cartography: High-contrast brand lockup with emerald mint accent */
export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3" aria-label="DIStrack home">
      <img
        src="/manus-storage/distrack-route-mark_bcf7af0b.png"
        alt=""
        className="h-10 w-10 shrink-0 rounded-[9px] bg-[#16272e] border border-[#223c47] object-contain p-1.5 shadow-[0_3px_10px_rgba(0,0,0,0.3)]"
      />
      {!compact && (
        <div className="leading-none">
          <div className="text-[19px] font-bold tracking-[-0.04em] text-white">
            <span className="text-white">DIS</span>
            <span className="text-[#00f0a0]">track</span>
          </div>
          <div className="mt-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-[#9bb3c1]">
            Operations Command
          </div>
        </div>
      )}
    </div>
  );
}