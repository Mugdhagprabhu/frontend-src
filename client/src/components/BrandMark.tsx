/** Clinical Cartography: the mark is a compact, high-contrast route junction that anchors the institutional navigation spine. */
export function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3" aria-label="DIStrack home">
      <img
        src="/manus-storage/distrack-route-mark_bcf7af0b.png"
        alt=""
        className="h-10 w-10 shrink-0 rounded-[9px] bg-white object-contain p-1.5 shadow-[0_3px_10px_rgba(0,0,0,0.18)]"
      />
      {!compact && (
        <div className="leading-none">
          <div className="text-[19px] font-bold tracking-[-0.04em] text-white"><span className="text-white">DIS</span><span className="text-sky-300">track</span></div>
          <div className="mt-1 text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-400">Operations Command</div>
        </div>
      )}
    </div>
  );
}
