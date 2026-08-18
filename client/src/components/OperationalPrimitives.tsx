/** Clinical Cartography: reusable, compact operational primitives use rules, labels, and status language rather than decorative SaaS cards. */
import type { ReactNode } from "react";
import { AlertTriangle, CheckCircle2, CircleAlert, Info, MoreHorizontal } from "lucide-react";

export type OperationalStatus = "healthy" | "critical" | "warning" | "info" | "resolved" | "active" | "pending" | "neutral";

const statusConfig: Record<OperationalStatus, { label: string; Icon: typeof Info; className: string }> = {
  healthy: { label: "Healthy", Icon: CheckCircle2, className: "border-[#1e5344] bg-[#12362b] text-[#00f0a0]" },
  critical: { label: "Critical", Icon: CircleAlert, className: "border-[#622323] bg-[#3a1515] text-[#f87171]" },
  warning: { label: "Warning", Icon: AlertTriangle, className: "border-[#5c4217] bg-[#38260a] text-[#fbbf24]" },
  info: { label: "Information", Icon: Info, className: "border-[#1b4356] bg-[#0e2938] text-[#38bdf8]" },
  resolved: { label: "Resolved", Icon: CheckCircle2, className: "border-[#223c47] bg-[#1a323c] text-slate-300" },
  active: { label: "Active", Icon: CheckCircle2, className: "border-[#174e5e] bg-[#10303d] text-[#38bdf8]" },
  pending: { label: "Pending", Icon: MoreHorizontal, className: "border-[#223c47] bg-[#1a323c] text-[#9bb3c1]" },
  neutral: { label: "Recorded", Icon: Info, className: "border-[#223c47] bg-[#1a323c] text-[#9bb3c1]" },
};

export function StatusBadge({ status, label, className = "" }: { status: OperationalStatus | string; label?: string; className?: string }) {
  const { Icon, label: fallback, className: colors } = statusConfig[status as OperationalStatus] ?? statusConfig.neutral;
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded border px-2 py-1 text-[11px] font-semibold leading-none ${colors} ${className}`}>
      <Icon size={12} strokeWidth={2.2} />
      {label ?? fallback}
    </span>
  );
}

export function PageHeader({ eyebrow, title, subtitle, action }: { eyebrow?: string; title: string; subtitle: string; action?: ReactNode }) {
  return (
    <header className="mb-6 flex flex-col gap-4 border-b border-[#223c47] pb-5 sm:mb-7 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && <p className="label-kicker mb-2 text-[#00f0a0]">{eyebrow}</p>}
        <h1 className="text-[26px] font-bold tracking-[-0.035em] text-white sm:text-[30px]">{title}</h1>
        <p className="mt-1 text-[13px] font-medium text-[#9bb3c1] sm:text-sm">{subtitle}</p>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </header>
  );
}

export function SectionHeading({ label, title, detail, action }: { label?: string; title: string; detail?: string; action?: ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        {label && <p className="label-kicker mb-1.5 text-[#00f0a0]">{label}</p>}
        <h2 className="text-[15px] font-bold tracking-[-0.015em] text-white">{title}</h2>
        {detail && <p className="mt-1 text-xs text-[#9bb3c1]">{detail}</p>}
      </div>
      {action}
    </div>
  );
}

export function EmptyOperationalState({ icon, title, detail, action }: { icon: ReactNode; title: string; detail: string; action?: ReactNode }) {
  return (
    <div className="surface-panel flex min-h-[250px] flex-col items-center justify-center px-6 text-center">
      <div className="mb-4 rounded-full bg-[#173b37] p-3 text-[#00f0a0]">{icon}</div>
      <h2 className="text-base font-bold text-white">{title}</h2>
      <p className="mt-2 max-w-sm text-sm leading-6 text-[#9bb3c1]">{detail}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}