/** Clinical Cartography: reusable, compact operational primitives use rules, labels, and status language rather than decorative SaaS cards. */
import type { ReactNode } from "react";
import { AlertTriangle, CheckCircle2, CircleAlert, Info, MoreHorizontal } from "lucide-react";

export type OperationalStatus = "healthy" | "critical" | "warning" | "info" | "resolved" | "active" | "pending" | "neutral";

const statusConfig: Record<OperationalStatus, { label: string; Icon: typeof Info; className: string }> = {
  healthy: { label: "Healthy", Icon: CheckCircle2, className: "border-emerald-200 bg-emerald-50 text-emerald-800" },
  critical: { label: "Critical", Icon: CircleAlert, className: "border-red-200 bg-red-50 text-red-800" },
  warning: { label: "Warning", Icon: AlertTriangle, className: "border-amber-200 bg-amber-50 text-amber-800" },
  info: { label: "Information", Icon: Info, className: "border-sky-200 bg-sky-50 text-sky-800" },
  resolved: { label: "Resolved", Icon: CheckCircle2, className: "border-slate-200 bg-slate-50 text-slate-700" },
  active: { label: "Active", Icon: CheckCircle2, className: "border-blue-200 bg-blue-50 text-blue-800" },
  pending: { label: "Pending", Icon: MoreHorizontal, className: "border-slate-200 bg-slate-50 text-slate-700" },
  neutral: { label: "Recorded", Icon: Info, className: "border-slate-200 bg-slate-50 text-slate-700" },
};

export function StatusBadge({ status, label, className = "" }: { status: OperationalStatus | string; label?: string; className?: string }) {
  const { Icon, label: fallback, className: colors } = statusConfig[status as OperationalStatus] ?? statusConfig.neutral;
  return <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded border px-2 py-1 text-[11px] font-semibold leading-none ${colors} ${className}`}><Icon size={12} strokeWidth={2.2} />{label ?? fallback}</span>;
}

export function PageHeader({ eyebrow, title, subtitle, action }: { eyebrow?: string; title: string; subtitle: string; action?: ReactNode }) {
  return (
    <header className="mb-6 flex flex-col gap-4 border-b border-[#dce8f0] pb-5 sm:mb-7 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && <p className="label-kicker mb-2">{eyebrow}</p>}
        <h1 className="text-[26px] font-bold tracking-[-0.035em] text-[#0b1f33] sm:text-[30px]">{title}</h1>
        <p className="mt-1 text-[13px] font-medium text-[#64748b] sm:text-sm">{subtitle}</p>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </header>
  );
}

export function SectionHeading({ label, title, detail, action }: { label?: string; title: string; detail?: string; action?: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        {label && <p className="label-kicker mb-1.5">{label}</p>}
        <h2 className="text-[15px] font-bold tracking-[-0.015em] text-[#102a43]">{title}</h2>
        {detail && <p className="mt-1 text-xs text-[#64748b]">{detail}</p>}
      </div>
      {action}
    </div>
  );
}

export function EmptyOperationalState({ icon, title, detail, action }: { icon: ReactNode; title: string; detail: string; action?: ReactNode }) {
  return <div className="surface-panel flex min-h-[250px] flex-col items-center justify-center px-6 text-center"><div className="mb-4 rounded-full bg-[#eaf5fc] p-3 text-[#1769aa]">{icon}</div><h2 className="text-base font-bold text-[#102a43]">{title}</h2><p className="mt-2 max-w-sm text-sm leading-6 text-[#64748b]">{detail}</p>{action && <div className="mt-5">{action}</div>}</div>;
}
