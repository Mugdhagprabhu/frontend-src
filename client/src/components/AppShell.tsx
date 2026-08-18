/** High-Contrast Cartography Layout */
import { useEffect, useState, type ReactNode } from "react";
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
      <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-[#9bb3c1]">{group.label}</p>
      <div className="space-y-0.5">
        {group.items.map((item) => {
          const active = item.href === "/" ? location === "/" : location.startsWith(item.href);
          const Icon = item.icon;
          return <Link 
            key={item.href} 
            href={item.href} 
            onClick={onNavigate} 
            className={`group flex h-10 items-center gap-3 rounded-md px-3 text-[13px] font-semibold transition-all ${
              active 
                ? "bg-[#173b37] text-[#00f0a0] shadow-[inset_3px_0_0_#00f0a0]" 
                : "text-slate-200 hover:bg-[#16272e] hover:text-white"
            }`}
          >
            <Icon size={17} strokeWidth={active ? 2.3 : 1.9} className={active ? "text-[#00f0a0]" : "text-slate-400 group-hover:text-white"} />
            <span>{item.label}</span>
          </Link>;
        })}
      </div>
    </div>)}
    {!compact && (
      <div className="mx-2 mt-1 border-t border-[#223c47] pt-5">
        <div className="rounded-md border border-[#223c47] bg-[#13242b] p-3.5">
          <div className="flex items-center gap-2 text-[11px] font-bold text-[#00f0a0]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#00f0a0]" />System synchronization normal
          </div>
          <p className="mt-2 text-[11px] leading-4 text-[#9bb3c1]">Last inventory event received 42 seconds ago.</p>
        </div>
      </div>
    )}
  </nav>;
}

function SearchPalette({ onClose }: { onClose: () => void }) {
  const [, navigate] = useLocation();
  const [query, setQuery] = useState("");
  const results = groups.flatMap((group) => group.items).filter((item) => item.label.toLowerCase().includes(query.toLowerCase()));
  const choose = (href: string) => { navigate(href); onClose(); };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return <div className="fixed inset-0 z-50 bg-[#050c0f]/80 p-4 backdrop-blur-[3px]" role="dialog" aria-modal="true" aria-label="Search DIStrack">
    <button className="absolute inset-0 h-full w-full cursor-default" aria-label="Close search" onClick={onClose} />
    <div className="relative mx-auto mt-[10vh] max-w-xl overflow-hidden rounded-xl border border-[#223c47] bg-[#13242b] shadow-[0_25px_60px_rgba(0,0,0,0.6)]">
      <div className="flex items-center gap-3 border-b border-[#223c47] px-4 py-3">
        <Search size={18} className="text-[#00f0a0]" />
        <input 
          autoFocus 
          value={query} 
          onChange={(event) => setQuery(event.target.value)} 
          onKeyDown={(event) => event.key === "Escape" && onClose()} 
          placeholder="Search operations, inventory, shipments..." 
          className="h-8 min-w-0 flex-1 border-0 bg-transparent text-sm text-white font-medium outline-none placeholder:text-[#9bb3c1]" 
        />
        <button 
          type="button" 
          onClick={onClose} 
          aria-label="Close search" 
          className="rounded border border-[#223c47] bg-[#0d191f] px-1.5 py-0.5 text-[10px] font-semibold text-[#9bb3c1] hover:border-[#355c6d] hover:text-[#00f0a0]"
        >
          ESC
        </button>
      </div>
      <div className="max-h-[340px] overflow-auto p-2">
        {results.length ? results.map((item) => { 
          const Icon = item.icon; 
          return <button key={item.href} onClick={() => choose(item.href)} className="flex w-full items-center gap-3 rounded-md px-3 py-3 text-left hover:bg-[#1a323c]">
            <Icon size={17} className="text-[#00f0a0]" />
            <span className="flex-1 text-sm font-semibold text-white">{item.label}</span>
            <span className="text-xs font-medium text-[#9bb3c1]">Open</span>
          </button>; 
        }) : <p className="px-3 py-7 text-center text-sm font-medium text-[#9bb3c1]">No operational area found.</p>}
      </div>
    </div>
  </div>;
}

export function AppShell({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [facilityOpen, setFacilityOpen] = useState(false);
  const [facility, setFacility] = useState(facilities[0]);
  const [, navigate] = useLocation();

  return <div className="min-h-screen bg-[#0b161b] text-white">
    <aside className="command-spine fixed inset-y-0 left-0 z-30 w-[248px] flex-col bg-[#0d191f] border-r border-[#223c47]">
      <Link href="/" className="block border-b border-[#223c47] px-5 py-[22px]"><BrandMark /></Link>
      <Navigation />
      <div className="border-t border-[#223c47] px-5 py-4 text-[10px] font-semibold text-[#9bb3c1]">
        DIStrack v1.0 <span className="ml-1 text-slate-600">|</span> Secure session
      </div>
    </aside>
    {mobileOpen && (
      <div className="fixed inset-0 z-50 lg:hidden">
        <button className="absolute inset-0 bg-[#050c0f]/80" aria-label="Close navigation" onClick={() => setMobileOpen(false)} />
        <aside className="relative flex h-full w-[285px] flex-col bg-[#0d191f] shadow-2xl">
          <div className="flex items-center justify-between border-b border-[#223c47] px-5 py-5">
            <BrandMark />
            <button aria-label="Close navigation" onClick={() => setMobileOpen(false)} className="rounded p-2 text-slate-300 hover:bg-[#1a323c] hover:text-white">
              <X size={19} />
            </button>
          </div>
          <Navigation onNavigate={() => setMobileOpen(false)} compact />
        </aside>
      </div>
    )}
    <div className="min-h-screen lg:pl-[248px]">
      <header className="sticky top-0 z-20 flex h-[68px] items-center gap-3 border-b border-[#223c47] bg-[#0b161b]/95 px-4 backdrop-blur-sm sm:px-6 xl:px-8">
        <button className="grid h-10 w-10 place-items-center rounded-md border border-[#223c47] text-[#00f0a0] hover:bg-[#13242b] lg:hidden" aria-label="Open navigation" onClick={() => setMobileOpen(true)}>
          <Menu size={20} />
        </button>
        <div className="relative hidden min-w-0 md:block">
          <button onClick={() => setFacilityOpen((open) => !open)} className="flex min-w-0 items-center gap-2 rounded-md px-2.5 py-2 text-left hover:bg-[#13242b]">
            <Building2 size={17} className="shrink-0 text-[#00f0a0]" />
            <span className="max-w-[220px] truncate text-[13px] font-bold text-white">{facility}</span>
            <ChevronDown size={15} className="text-[#9bb3c1]" />
          </button>
          {facilityOpen && (
            <div className="absolute left-0 top-[46px] z-30 w-[290px] overflow-hidden rounded-lg border border-[#223c47] bg-[#13242b] p-1.5 shadow-[0_12px_30px_rgba(0,0,0,0.5)]">
              {facilities.map((name) => (
                <button 
                  key={name} 
                  onClick={() => { setFacility(name); setFacilityOpen(false); toast.success("Active facility changed.", { description: name }); }} 
                  className={`w-full rounded px-3 py-2.5 text-left text-xs font-semibold ${facility === name ? "bg-[#173b37] text-[#00f0a0]" : "text-slate-200 hover:bg-[#1a323c] hover:text-white"}`}
                >
                  {name}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <button onClick={() => setSearchOpen(true)} className="flex h-10 items-center gap-2 rounded-md border border-[#223c47] bg-[#0d191f] px-3 text-[#9bb3c1] hover:border-[#355c6d] hover:text-white" aria-label="Search DIStrack">
            <Search size={17} />
            <span className="hidden text-[13px] font-medium sm:inline">Search</span>
            <kbd className="ml-4 hidden rounded border border-[#223c47] bg-[#13242b] px-1.5 py-0.5 text-[10px] font-bold text-slate-300 sm:inline">⌘ K</kbd>
          </button>
          <button onClick={() => navigate("/alerts")} className="relative grid h-10 w-10 place-items-center rounded-md border border-[#223c47] bg-[#0d191f] text-slate-300 hover:border-[#355c6d] hover:bg-[#13242b] hover:text-white" aria-label="Open operational alerts">
            <Bell size={18} />
            <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-[#f87171] ring-2 ring-[#0d191f]" />
          </button>
          <div className="hidden h-8 w-px bg-[#223c47] sm:block" />
          <button onClick={() => toast.message("Signed in as State Operations Admin.")} className="hidden items-center gap-2 rounded-md py-1 pr-1 text-left hover:bg-[#13242b] sm:flex">
            <div className="grid h-8 w-8 place-items-center rounded-md bg-[#173b37] text-[11px] font-bold text-[#00f0a0]">AS</div>
            <div className="pr-1">
              <p className="text-[12px] font-bold leading-4 text-white">A. Sharma</p>
              <p className="text-[10px] font-semibold leading-3 text-[#9bb3c1]">State Operations</p>
            </div>
          </button>
        </div>
      </header>
      <main className="app-canvas min-h-[calc(100vh-68px)] px-4 py-5 sm:px-6 sm:py-7 xl:px-8 xl:py-8">{children}</main>
    </div>
    {searchOpen && <SearchPalette onClose={() => setSearchOpen(false)} />}
  </div>;
}