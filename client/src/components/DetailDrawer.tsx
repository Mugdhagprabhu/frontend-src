/** Dark Teal Cartography: Detail drawer slide-out with deep cyan panel background */
import type { ReactNode } from "react";
import { X } from "lucide-react";

export function DetailDrawer({ open, onClose, title, subtitle, children }: { open: boolean; onClose: () => void; title: string; subtitle?: string; children: ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <button onClick={onClose} aria-label="Close detail panel" className="absolute inset-0 bg-[#050c0f]/80 backdrop-blur-[2px]" />
      <aside className="scrollbar-thin absolute inset-y-0 right-0 flex w-full max-w-[560px] flex-col overflow-y-auto border-l border-[#223c47] bg-[#13242b] text-white shadow-[-14px_0_38px_rgba(0,0,0,0.6)] animate-in slide-in-from-right duration-300">
        <header className="sticky top-0 z-10 flex items-start justify-between border-b border-[#223c47] bg-[#0d191f]/95 px-5 py-5 backdrop-blur sm:px-7">
          <div>
            <p className="label-kicker mb-2 text-[#00f0a0]">Operational detail</p>
            <h2 className="text-xl font-bold tracking-[-0.025em] text-white">{title}</h2>
            {subtitle && <p className="mt-1 text-sm text-[#9bb3c1]">{subtitle}</p>}
          </div>
          <button 
            onClick={onClose} 
            aria-label="Close detail panel" 
            className="grid h-9 w-9 place-items-center rounded-md border border-[#223c47] bg-[#13242b] text-[#9bb3c1] hover:border-[#355c6d] hover:bg-[#1a323c] hover:text-white"
          >
            <X size={18} />
          </button>
        </header>
        <div className="flex-1 p-5 sm:p-7">{children}</div>
      </aside>
    </div>
  );
}