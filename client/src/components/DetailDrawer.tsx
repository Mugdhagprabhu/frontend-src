/** Clinical Cartography: detail drawers add depth beside the active operational question instead of interrupting work with page changes. */
import type { ReactNode } from "react";
import { X } from "lucide-react";

export function DetailDrawer({ open, onClose, title, subtitle, children }: { open: boolean; onClose: () => void; title: string; subtitle?: string; children: ReactNode }) {
  if (!open) return null;
  return <div className="fixed inset-0 z-50"><button onClick={onClose} aria-label="Close detail panel" className="absolute inset-0 bg-[#071827]/40 backdrop-blur-[1px]" /><aside className="scrollbar-thin absolute inset-y-0 right-0 flex w-full max-w-[560px] flex-col overflow-y-auto border-l border-[#c9dce8] bg-[#f9fcfe] shadow-[-14px_0_38px_rgba(11,31,51,0.17)] animate-in slide-in-from-right duration-300"><header className="sticky top-0 z-10 flex items-start justify-between border-b border-[#dce8f0] bg-white/95 px-5 py-5 backdrop-blur sm:px-7"><div><p className="label-kicker mb-2">Operational detail</p><h2 className="text-xl font-bold tracking-[-0.025em] text-[#0b1f33]">{title}</h2>{subtitle && <p className="mt-1 text-sm text-[#64748b]">{subtitle}</p>}</div><button onClick={onClose} aria-label="Close detail panel" className="grid h-9 w-9 place-items-center rounded-md border border-[#dce8f0] text-[#64748b] hover:bg-[#f2f8fc] hover:text-[#102a43]"><X size={18} /></button></header><div className="flex-1 p-5 sm:p-7">{children}</div></aside></div>;
}
