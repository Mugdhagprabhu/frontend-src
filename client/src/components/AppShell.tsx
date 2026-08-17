/** Clinical Cartography: a dark navigation spine and narrow command bar frame a light, map-like operations canvas. */
import { useState, type ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { Bell, Building2, ChevronDown, ClipboardCheck, FileBarChart, Hospital, LayoutDashboard, Menu, PackageSearch, Search, Settings, ShieldCheck, Sparkles, Truck, UsersRound, X } from "lucide-react";
import { toast } from "sonner";
import { BrandMark } from "./BrandMark";

type NavItem = { href: string; label: string; icon: typeof LayoutDashboard; isFuture?: boolean };
const groups: { label: string; items: NavItem[] }[] = [
  { label: "Operations", items: [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/inventory", label: "Inventory", icon: PackageSearch },
    { href: "/procurement", label: "Procurement", icon: ClipboardCheck },
    { href: "/shipments", label: "Shipments", icon: Truck },
    { href: "/alerts", label: "Alerts", icon: Bell },
    { href: "/insights", label: "AI Insights", icon: Sparkles },
  ] },
  { label: "Management", items: [
    { href: "/facilities", label: "Facilities", icon: Hospital },
    { href: "/vendors", label: "Vendors", icon: UsersRound },
    { href: "/reports", label: "Reports", icon: FileBarChart },
  ] },
  { label: "System", items: [
    { href: "/audit", label: "Audit", icon: ShieldCheck },
    { href: "/settings", label: "Settings", icon: Settings },
  ] },
];

const facilities = ["Maharashtra State Medical Warehouse", "Mumbai District Hospital", "Pune Regional Medical Center"];

function Navigation({ onNavigate, compact = false }: { onNavigate?: () => void; compact?: boolean }) {
  const [location] = useLocation();
  return <nav className="scrollbar-thin flex-1 overflow-y-auto px-3 pb-4 pt-5" aria-label="Primary navigation">
    {groups.map((group) => <div key={group.label} className="mb-6">
      <p className="mb-2 px-3 text-[9px] font-bold uppercase tracking-[0.16em] text-slate-500">{group.label}</p>
      <div className="space-y-0.5">
        {group.items.map((item) => {
          const active = item.href === "/" ? location === "/" : location.startsWith(item.href);
          const Icon = item.icon;
          return <Link key={item.href} href={item.href} onClick={onNavigate} className={`group flex h-10 items-center gap-3 rounded-md px-3 text-[13px] font-medium ${active ? "bg-[#1a3955] text-white shadow-[inset_3px_0_0_#62b9e7]" : "text-slate-300 hover:bg-[#142f49] hover:text-white"}`}>
            <Icon size={17} strokeWidth={active ? 2.25 : 1.9} className={active ? "text-sky-300" : "text-slate-400 group-hover:text-sky-200"} />
            <span>{item.label}</span>
          </Link>;
        })}
      </div>
    </div>)}
    {!compact && <div className="mx-2 mt-1 border-t border-[#29465f] pt-5"><div className="rounded-md border border-[#29465f] bg-[#102b45] p-3.5"><div className="flex items-center gap-2 text-[11px] font-semibold text-sky-200"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />System synchronization normal</div><p className="mt-2 text-[11px] leading-4 text-slate-400">Last inventory event received 42 seconds ago.</p></div></div>}
  </nav>;
}

function SearchPalette({ onClose }: { onClose: () => void }) {
  const [, navigate] = useLocation();
  const [query, setQuery] = useState("");
  const results = groups.flatMap((group) => group.items).filter((item) => item.label.toLowerCase().includes(query.toLowerCase()));
  const choose = (href: string) => { navigate(href); onClose(); };
  return <div className="fixed inset-0 z-50 bg-[#071827]/50 p-4 backdrop-blur-[2px]" role="dialog" aria-modal="true" aria-label="Search DIStrack">
    <div className="mx-auto mt-[10vh] max-w-xl overflow-hidden rounded-xl border border-[#bed5e4] bg-white shadow-[0_20px_50px_rgba(11,31,51,0.26)]">
      <div className="flex items-center gap-3 border-b border-[#dce8f0] px-4 py-3"><Search size={18} className="text-[#1769aa]" /><input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => event.key === "Escape" && onClose()} placeholder="Search operations, inventory, shipments..." className="h-8 min-w-0 flex-1 border-0 bg-transparent text-sm text-[#102a43] outline-none placeholder:text-[#879bae]" /><kbd className="rounded border border-[#dce8f0] bg-[#f6fafd] px-1.5 py-0.5 text-[10px] text-[#64748b]">ESC</kbd></div>
      <div className="max-h-[340px] overflow-auto p-2">{results.length ? results.map((item) => { const Icon = item.icon; return <button key={item.href} onClick={() => choose(item.href)} className="flex w-full items-center gap-3 rounded-md px-3 py-3 text-left hover:bg-[#eaf5fc]"><Icon size={17} className="text-[#1769aa]" /><span className="flex-1 text-sm font-medium text-[#102a43]">{item.label}</span><span className="text-xs text-[#64748b]">Open</span></button>; }) : <p className="px-3 py-7 text-center text-sm text-[#64748b]">No operational area found.</p>}</div>
    </div>
  </div>;
}

export function AppShell({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [facilityOpen, setFacilityOpen] = useState(false);
  const [facility, setFacility] = useState(facilities[0]);
  const [, navigate] = useLocation();
  return <div className="min-h-screen bg-[#f6fafd] text-[#102a43]">
    <aside className="command-spine fixed inset-y-0 left-0 z-30 w-[248px] flex-col"><Link href="/" className="block border-b border-[#29465f] px-5 py-[22px]"><BrandMark /></Link><Navigation /><div className="border-t border-[#29465f] px-5 py-4 text-[10px] font-medium text-slate-500">DIStrack v1.0 <span className="ml-1 text-slate-600">|</span> Secure session</div></aside>
    {mobileOpen && <div className="fixed inset-0 z-50 lg:hidden"><button className="absolute inset-0 bg-[#071827]/50" aria-label="Close navigation" onClick={() => setMobileOpen(false)} /><aside className="relative flex h-full w-[285px] flex-col bg-[#0b1f33] shadow-2xl"><div className="flex items-center justify-between border-b border-[#29465f] px-5 py-5"><BrandMark /><button aria-label="Close navigation" onClick={() => setMobileOpen(false)} className="rounded p-2 text-slate-300 hover:bg-[#1a3955] hover:text-white"><X size={19} /></button></div><Navigation onNavigate={() => setMobileOpen(false)} compact /></aside></div>}
    <div className="min-h-screen lg:pl-[248px]">
      <header className="sticky top-0 z-20 flex h-[68px] items-center gap-3 border-b border-[#dce8f0] bg-white/95 px-4 backdrop-blur-sm sm:px-6 xl:px-8">
        <button className="grid h-10 w-10 place-items-center rounded-md border border-[#dce8f0] text-[#1769aa] hover:bg-[#eaf5fc] lg:hidden" aria-label="Open navigation" onClick={() => setMobileOpen(true)}><Menu size={20} /></button>
        <div className="relative hidden min-w-0 md:block"><button onClick={() => setFacilityOpen((open) => !open)} className="flex min-w-0 items-center gap-2 rounded-md px-2 py-2 text-left hover:bg-[#f2f8fc]"><Building2 size={17} className="shrink-0 text-[#1769aa]" /><span className="max-w-[220px] truncate text-[13px] font-semibold text-[#102a43]">{facility}</span><ChevronDown size={15} className="text-[#64748b]" /></button>{facilityOpen && <div className="absolute left-0 top-[46px] z-30 w-[290px] overflow-hidden rounded-lg border border-[#dce8f0] bg-white p-1.5 shadow-[0_12px_30px_rgba(11,31,51,0.12)]">{facilities.map((name) => <button key={name} onClick={() => { setFacility(name); setFacilityOpen(false); toast.success("Active facility changed.", { description: name }); }} className={`w-full rounded px-3 py-2.5 text-left text-xs font-medium ${facility === name ? "bg-[#eaf5fc] text-[#0f5d9f]" : "text-[#334e68] hover:bg-[#f6fafd]"}`}>{name}</button>)}</div>}</div>
        <div className="ml-auto flex items-center gap-2 sm:gap-3"><button onClick={() => setSearchOpen(true)} className="flex h-10 items-center gap-2 rounded-md border border-[#dce8f0] px-3 text-[#64748b] hover:border-[#b9d4e5] hover:bg-[#f6fafd]" aria-label="Search DIStrack"><Search size={17} /><span className="hidden text-[13px] sm:inline">Search</span><kbd className="ml-4 hidden rounded border border-[#dce8f0] bg-[#f6fafd] px-1.5 py-0.5 text-[10px] sm:inline">⌘ K</kbd></button><button onClick={() => navigate("/alerts")} className="relative grid h-10 w-10 place-items-center rounded-md border border-[#dce8f0] text-[#4a657a] hover:border-[#b9d4e5] hover:bg-[#f6fafd]" aria-label="Open operational alerts"><Bell size={18} /><span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[#c53030] ring-2 ring-white" /></button><div className="hidden h-8 w-px bg-[#dce8f0] sm:block" /><button onClick={() => toast.message("Signed in as State Operations Admin.")} className="hidden items-center gap-2 rounded-md py-1 pr-1 text-left hover:bg-[#f6fafd] sm:flex"><div className="grid h-8 w-8 place-items-center rounded-md bg-[#eaf5fc] text-[11px] font-bold text-[#1769aa]">AS</div><div className="pr-1"><p className="text-[12px] font-bold leading-4 text-[#102a43]">A. Sharma</p><p className="text-[10px] font-medium leading-3 text-[#64748b]">State Operations</p></div></button></div>
      </header>
      <main className="app-canvas min-h-[calc(100vh-68px)] px-4 py-5 sm:px-6 sm:py-7 xl:px-8 xl:py-8">{children}</main>
    </div>
    {searchOpen && <SearchPalette onClose={() => setSearchOpen(false)} />}
  </div>;
}
