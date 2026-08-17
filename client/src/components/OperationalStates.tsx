/** Clinical Cartography: loading and failure never collapse the command surface; their structure mirrors the operational module they replace. */
import { AlertCircle, RefreshCw } from "lucide-react";

export function PanelSkeleton({ lines = 4, className = "" }: { lines?: number; className?: string }) {
  return <div className={`surface-panel overflow-hidden p-5 ${className}`} aria-label="Loading operational data"><div className="h-3 w-24 animate-pulse rounded bg-slate-200" /><div className="mt-3 h-5 w-2/5 animate-pulse rounded bg-slate-200" /><div className="mt-6 space-y-3">{Array.from({ length: lines }).map((_, index) => <div key={index} className="h-3 animate-pulse rounded bg-slate-100" style={{ width: `${88 - index * 9}%` }} />)}</div></div>;
}

export function InlineError({ message = "Unable to load operational data.", retry }: { message?: string; retry?: () => void }) {
  return <div className="surface-panel flex min-h-[180px] flex-col items-center justify-center p-6 text-center"><div className="rounded-full bg-red-50 p-2.5 text-[#c53030]"><AlertCircle size={20} /></div><p className="mt-3 text-sm font-bold text-[#102a43]">Unable to load operational data.</p><p className="mt-1 max-w-xs text-xs leading-5 text-[#64748b]">{message}</p>{retry && <button onClick={retry} className="mt-4 inline-flex h-9 items-center gap-2 rounded-md border border-[#b9d4e5] px-3 text-xs font-bold text-[#1769aa] hover:bg-[#eaf5fc]"><RefreshCw size={14} />Retry</button>}</div>;
}
