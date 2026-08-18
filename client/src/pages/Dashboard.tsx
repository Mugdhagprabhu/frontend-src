/** Clinical Cartography: high-contrast dark dashboard prioritizing availability and real-time operational signals. */
import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import anime from "animejs";
import { Activity, ArrowRight, ChevronRight, CircleAlert, Network, X } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PageHeader, SectionHeading, StatusBadge } from "@/components/OperationalPrimitives";
import { InlineError, PanelSkeleton } from "@/components/OperationalStates";
import { apiConfigLabel, isDemoMode } from "@/services/api";
import { dashboardSnapshot } from "@/services/mockData";
import { useOperationData } from "@/hooks/useOperationData";

const SupplyChainScene = lazy(() => import("@/components/SupplyChainScene"));

function AnimatedNumber({ value, suffix }: { value: number; suffix?: string }) {
  const spanRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const counterObj = { val: 0 };
    const isInt = Number.isInteger(value);

    const animation = anime({
      targets: counterObj,
      val: value,
      round: isInt ? 1 : 10,
      duration: 750,
      easing: "easeOutCubic",
      update: () => {
        if (spanRef.current) {
          spanRef.current.innerText = `${isInt ? Math.round(counterObj.val) : counterObj.val.toFixed(1)}${suffix ?? ""}`;
        }
      }
    });

    return () => {
      animation.pause();
    };
  }, [value, suffix]);

  return <span ref={spanRef} className="data-number">{Number.isInteger(value) ? value : value.toFixed(1)}{suffix}</span>;
}

export default function Dashboard() {
  const [, navigate] = useLocation();
  const { data, loading, error, retry } = useOperationData(async () => dashboardSnapshot, []);
  const [networkOpen, setNetworkOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);
  const consumptionPanelRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (loading || !data || !containerRef.current) return;

    const ctx = containerRef.current;

    anime({
      targets: ctx.querySelectorAll(".kpi-card"),
      translateY: [16, 0],
      scale: [0.97, 1],
      opacity: [0, 1],
      delay: anime.stagger(60),
      duration: 600,
      easing: "easeOutBack"
    });

    anime({
      targets: ctx.querySelectorAll(".section-panel"),
      translateY: [18, 0],
      opacity: [0, 1],
      delay: anime.stagger(80, { start: 200 }),
      duration: 600,
      easing: "easeOutQuart"
    });

    anime({
      targets: ctx.querySelectorAll(".alert-item-anim"),
      translateX: [-12, 0],
      opacity: [0, 1],
      delay: anime.stagger(70, { start: 300 }),
      duration: 500,
      easing: "easeOutCubic"
    });

    anime({
      targets: ctx.querySelectorAll(".alert-icon-anim"),
      scale: [0.6, 1],
      opacity: [0, 1],
      delay: anime.stagger(70, { start: 380 }),
      duration: 400,
      easing: "easeOutBack"
    });

    anime({
      targets: ctx.querySelectorAll(".activity-item-anim"),
      translateX: [12, 0],
      opacity: [0, 1],
      delay: anime.stagger(50, { start: 350 }),
      duration: 450,
      easing: "easeOutCubic"
    });

    const dotPulse = anime({
      targets: ctx.querySelectorAll(".pulse-critical"),
      scale: [1, 1.45],
      opacity: [1, 0.45],
      direction: "alternate",
      loop: true,
      easing: "easeInOutSine",
      duration: 900
    });

    return () => {
      dotPulse.pause();
    };
  }, [loading, data]);

  useEffect(() => {
    const panel = consumptionPanelRef.current;
    if (loading || !data || !panel || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const stagedItems = Array.from(panel.querySelectorAll<HTMLElement>("[data-signal-stage]"));
    const tracePaths = Array.from(panel.querySelectorAll<SVGPathElement>(".recharts-area-curve"));
    const fillPaths = Array.from(panel.querySelectorAll<SVGPathElement>(".recharts-area-area"));

    tracePaths.forEach((path) => {
      const length = path.getTotalLength();
      path.style.strokeDasharray = `${length}`;
      path.style.strokeDashoffset = `${length}`;
    });

    const signalTimeline = anime.timeline({ easing: "easeOutQuart", autoplay: true });
    signalTimeline
      .add({ targets: stagedItems, translateY: [12, 0], opacity: [0, 1], delay: anime.stagger(90), duration: 620 })
      .add({ targets: tracePaths, strokeDashoffset: [anime.setDashoffset, 0], opacity: [0.2, 1], delay: anime.stagger(120), duration: 920 }, "-=450")
      .add({ targets: fillPaths, opacity: [0, 1], duration: 380 }, "-=520");

    return () => { signalTimeline.pause(); anime.remove([...stagedItems, ...tracePaths, ...fillPaths]); };
  }, [loading, data]);

  useEffect(() => {
    if (networkOpen && modalRef.current) {
      anime({
        targets: modalRef.current,
        scale: [0.94, 1],
        opacity: [0, 1],
        duration: 350,
        easing: "easeOutCubic"
      });
    }
  }, [networkOpen]);

  const closeNetworkModal = () => {
    if (modalRef.current) {
      anime({
        targets: modalRef.current,
        scale: [1, 0.94],
        opacity: [1, 0],
        duration: 200,
        easing: "easeInCubic",
        complete: () => setNetworkOpen(false)
      });
    } else {
      setNetworkOpen(false);
    }
  };

  if (loading) return <div className="page-enter"><PanelSkeleton className="mb-5" lines={2} /><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">{Array.from({ length: 5 }).map((_, index) => <PanelSkeleton key={index} lines={2} />)}</div></div>;
  if (error || !data) return <InlineError message={error ?? undefined} retry={retry} />;

  return (
    <div ref={containerRef} className="page-enter max-w-[1640px] text-white">
      <style>{`
        .pulse-critical::after {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: 9999px;
          background: inherit;
          animation: distrack-pulse-ring 1.8s ease-out infinite;
          pointer-events: none;
        }
        @keyframes distrack-pulse-ring {
          0% { opacity: 0.55; transform: scale(1); }
          100% { opacity: 0; transform: scale(2.6); }
        }
        .route-banner-img {
          animation: distrack-kenburns 22s ease-in-out infinite alternate;
        }
        @keyframes distrack-kenburns {
          from { transform: scale(1); }
          to { transform: scale(1.08); }
        }
        .kpi-card {
          transition: transform 200ms ease, box-shadow 200ms ease;
        }
        .kpi-card:hover {
          box-shadow: 0 10px 24px rgba(0, 240, 160, 0.12);
        }
      `}</style>
      <PageHeader 
        eyebrow="National operations" 
        title="Operations overview" 
        subtitle="Medicine availability and supply activity across the Maharashtra network." 
        action={
          <div className={`inline-flex items-center gap-2 rounded border px-3 py-2 text-[11px] font-bold uppercase tracking-[0.08em] ${isDemoMode ? "border-[#1b4356] bg-[#0e2938] text-[#38bdf8]" : "border-[#1e5344] bg-[#12362b] text-[#00f0a0]"}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${isDemoMode ? "bg-[#38bdf8]" : "bg-[#00f0a0]"}`} />
            {apiConfigLabel()}
          </div>
        } 
      />
      
      <section className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5" aria-label="Key performance indicators">
        {data.metrics.map((metric) => (
          <article key={metric.label} className="kpi-card surface-panel surface-panel-hover min-h-[126px] p-4 transition-transform duration-200 hover:-translate-y-0.5 border border-[#223c47] bg-[#13242b]">
            <p className="label-kicker text-[#00f0a0]">{metric.label}</p>
            <div className="mt-3 flex items-end justify-between gap-2">
              <p className={`data-number text-[28px] font-bold tracking-[-0.045em] ${metric.tone === "critical" ? "text-[#f87171]" : metric.tone === "warning" ? "text-[#fbbf24]" : metric.tone === "healthy" ? "text-[#00f0a0]" : "text-white"}`}>
                <AnimatedNumber value={metric.value} suffix={metric.suffix} />
              </p>
              <span className={`relative mb-1 h-2 w-2 rounded-full ${metric.tone === "critical" ? "bg-[#f87171] pulse-critical" : metric.tone === "warning" ? "bg-[#fbbf24]" : metric.tone === "healthy" ? "bg-[#00f0a0]" : "bg-[#38bdf8]"}`} />
            </div>
            <p className="mt-2 border-t border-[#223c47] pt-2 text-[11px] font-medium text-[#cbd5e1]">{metric.detail}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.35fr)_minmax(330px,.65fr)]">
        <article ref={consumptionPanelRef} className="section-panel surface-panel relative overflow-hidden p-5 sm:p-6 border border-[#223c47] bg-[#13242b]">
          <span aria-hidden="true" className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-[#00f0a0] to-transparent" />
          <div data-signal-stage>
            <SectionHeading
            label="Consumption signal" 
            title="Seven-day medicine consumption" 
            detail="Observed volume compared with demand baseline, in thousands of units." 
            action={
              <button onClick={() => navigate("/insights")} className="group hidden items-center gap-1 text-xs font-bold text-[#00f0a0] hover:text-[#38bdf8] sm:flex">
                View forecast <ArrowRight size={14} className="transition-transform duration-150 group-hover:translate-x-1" />
              </button>
            } 
            />
          </div>
          <div data-signal-stage className="mt-5 h-[270px] sm:h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.consumptionTrend} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="observedFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00f0a0" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#00f0a0" stopOpacity={0.01} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke="#1e353f" strokeDasharray="3 4" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: "#9bb3c1", fontSize: 11 }} dy={8} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: "#9bb3c1", fontSize: 10 }} tickFormatter={(value) => `${value}k`} />
                <Tooltip 
                  cursor={{ stroke: "#00f0a0", strokeWidth: 1 }} 
                  contentStyle={{ border: "1px solid #223c47", backgroundColor: "#0d191f", borderRadius: "8px", boxShadow: "0 10px 25px rgba(0,0,0,0.5)", fontSize: 12, color: "#ffffff" }} 
                  labelStyle={{ color: "#ffffff", fontWeight: 700 }} 
                />
                <Area type="monotone" dataKey="forecast" stroke="#9bb3c1" strokeWidth={1.5} strokeDasharray="4 4" fill="none" name="Baseline" isAnimationActive={false} />
                <Area type="monotone" dataKey="observed" stroke="#00f0a0" strokeWidth={2.4} fill="url(#observedFill)" name="Observed" isAnimationActive={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div data-signal-stage className="mt-3 flex flex-wrap gap-x-5 gap-y-2 border-t border-[#223c47] pt-3 text-[11px] font-medium text-[#cbd5e1]">
            <span className="inline-flex items-center gap-2"><i className="h-2 w-2 rounded-full bg-[#00f0a0]" />Observed consumption</span>
            <span className="inline-flex items-center gap-2"><i className="h-px w-3 border-t-2 border-dashed border-[#9bb3c1]" />Demand baseline</span>
            <span className="ml-auto text-[#9bb3c1]">Daily refresh · 06:00 IST</span>
          </div>
        </article>

        <article className="section-panel surface-panel overflow-hidden border border-[#223c47] bg-[#13242b]">
          <div className="border-b border-[#223c47] p-5 sm:p-6">
            <SectionHeading 
              label="Attention queue" 
              title="Operational alerts" 
              detail="Items needing action or verification." 
              action={<button onClick={() => navigate("/alerts")} className="text-xs font-bold text-[#00f0a0] hover:text-[#38bdf8]">View all</button>} 
            />
          </div>
          <div>
            {data.operationalAlerts.map((alert, index) => (
              <button 
                key={alert.id} 
                onClick={() => navigate(alert.id === "alert-shipment" ? "/shipments" : alert.id === "alert-para" ? "/inventory" : "/alerts")} 
                className={`alert-item-anim group w-full px-5 py-4 text-left transition-colors duration-150 hover:bg-[#1a323c] sm:px-6 ${index > 0 ? "border-t border-[#223c47]" : ""}`}
              >
                <div className="flex items-start gap-3">
                  <span className={`alert-icon-anim mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded border transition-transform duration-150 group-hover:scale-105 ${alert.severity === "critical" ? "border-[#622323] bg-[#3a1515] text-[#f87171]" : "border-[#5c4217] bg-[#38260a] text-[#fbbf24]"}`}>
                    <CircleAlert size={15} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={alert.severity} label={alert.severity === "critical" ? "Critical" : "Warning"} />
                      <span className="text-[12px] font-bold text-white">{alert.drug}</span>
                    </span>
                    <span className="mt-1.5 block text-[11px] font-medium text-[#cbd5e1]">{alert.facility}</span>
                    <span className="mt-1 block text-xs text-[#9bb3c1]">{alert.message}</span>
                    <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-[#00f0a0] group-hover:text-[#38bdf8]">
                      {alert.action} <ChevronRight size={13} className="transition-transform duration-150 group-hover:translate-x-1" />
                    </span>
                  </span>
                </div>
              </button>
            ))}
          </div>
          <button 
            onClick={() => navigate("/alerts")} 
            className="flex w-full items-center justify-center gap-2 border-t border-[#223c47] bg-[#0d191f] py-3 text-xs font-bold text-[#00f0a0] transition-colors duration-150 hover:bg-[#16272e]"
          >
            <Activity size={14} />Open alert worklist
          </button>
        </article>
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.12fr)_minmax(310px,.88fr)]">
        <article className="section-panel relative min-h-[270px] overflow-hidden rounded-[10px] border border-[#223c47] bg-[#11232b] p-5 text-white sm:p-6">
          <img src="/manus-storage/distrack-shipment-route_53ac9077.jpg" alt="Medicine shipment route between distribution facility and district hospital" className="route-banner-img absolute inset-0 h-full w-full object-cover opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#071318]/95 via-[#071318]/80 to-[#071318]/25" />
          <div className="relative flex h-full flex-col">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#00f0a0]">Route in focus</p>
                <h2 className="mt-2 text-xl font-bold tracking-[-0.025em] text-white">Ceftriaxone delivery is in transit</h2>
              </div>
              <StatusBadge status="warning" label="6h delayed" className="border-[#5c4217] bg-[#38260a] text-[#fbbf24]" />
            </div>
            <p className="mt-3 max-w-md text-sm leading-6 text-[#cbd5e1]">SH-MH-20476 is carrying 1,200 vials from the state warehouse to Nashik District Hospital.</p>
            <div className="mt-auto flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-[#223c47] pt-4 text-[11px] font-medium text-slate-200">
              <span><span className="text-[#00f0a0] font-semibold">Current location</span><br /><span className="text-white">Kasara Ghat checkpoint</span></span>
              <span><span className="text-[#00f0a0] font-semibold">Revised ETA</span><br /><span className="text-white">Today, 18:30</span></span>
              <button 
                onClick={() => navigate("/shipments")} 
                className="group ml-auto inline-flex h-9 items-center gap-2 rounded border border-[#223c47] bg-[#13242b]/80 px-3 text-xs font-bold text-white transition-all duration-150 hover:border-[#00f0a0] hover:bg-[#1a323c]"
              >
                Track shipment <ArrowRight size={14} className="transition-transform duration-150 group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        </article>

        <article className="section-panel surface-panel relative overflow-hidden p-5 sm:p-6 border border-[#223c47] bg-[#13242b]">
          <img src="/manus-storage/distrack-analytics-texture_c2d2cd15.jpg" alt="" className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-[0.08]" />
          <div className="relative">
            <SectionHeading label="Decision support" title="Redistribution action recommended" detail="Highest confidence operational recommendation." />
            <div className="mt-5 flex items-start justify-between gap-5">
              <div>
                <p className="text-[13px] font-bold text-white">Insulin Glargine</p>
                <p className="mt-1 text-xs text-[#cbd5e1]">Mumbai District Hospital</p>
              </div>
              <div className="text-right">
                <p className="data-number text-2xl font-bold tracking-[-0.04em] text-[#00f0a0]">92%</p>
                <p className="label-kicker mt-1 text-[#9bb3c1]">Confidence</p>
              </div>
            </div>
            <p className="mt-4 border-l-2 border-[#00f0a0] pl-3 text-[13px] leading-5 text-[#cbd5e1]">Transfer 320 pens from Pune Regional Medical Center to protect four days of projected service.</p>
            <button 
              onClick={() => navigate("/insights")} 
              className="group mt-5 inline-flex items-center gap-2 text-xs font-bold text-[#00f0a0] hover:text-[#38bdf8]"
            >
              Review recommendation <ArrowRight size={14} className="transition-transform duration-150 group-hover:translate-x-1" />
            </button>
          </div>
        </article>
      </section>

      <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.12fr)_minmax(310px,.88fr)]">
        <article className="section-panel surface-panel overflow-hidden border border-[#223c47] bg-[#13242b]">
          <div className="flex items-center justify-between border-b border-[#223c47] p-5 sm:p-6">
            <div>
              <p className="label-kicker text-[#00f0a0]">Network visibility</p>
              <h2 className="mt-1.5 text-[15px] font-bold text-white">Maharashtra supply network</h2>
            </div>
            <button 
              onClick={() => setNetworkOpen(true)} 
              className="inline-flex h-9 items-center gap-2 rounded-md border border-[#223c47] bg-[#0d191f] px-3 text-xs font-bold text-[#00f0a0] transition-colors duration-150 hover:border-[#00f0a0] hover:bg-[#1a323c]"
            >
              <Network size={15} />Explore network
            </button>
          </div>
          <div className="relative min-h-[190px] overflow-hidden">
            <img src="/manus-storage/distrack-national-network_c8046537.jpg" alt="Abstract regional medicine supply network map" className="absolute inset-0 h-full w-full object-cover opacity-35" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0d191f]/95 via-[#0d191f]/80 to-transparent" />
            <div className="relative max-w-[370px] p-5 sm:p-6">
              <p className="text-[13px] font-bold text-white">118 facilities are currently within threshold.</p>
              <p className="mt-2 text-xs leading-5 text-[#cbd5e1]">Three facilities require direct coordination. Route activity is concentrated between Mumbai, Nashik, and Pune this afternoon.</p>
              <div className="mt-5 flex h-2 overflow-hidden rounded-full bg-[#1e353f]">
                {data.availability.states.map((state) => (
                  <span key={state.label} style={{ width: `${(state.value / 126) * 100}%`, backgroundColor: state.color }} />
                ))}
              </div>
              <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[10px] font-semibold text-[#9bb3c1]">
                {data.availability.states.map((state) => (
                  <span key={state.label}>{state.value} {state.label.toLowerCase()}</span>
                ))}
              </div>
            </div>
          </div>
        </article>

        <article className="section-panel surface-panel overflow-hidden border border-[#223c47] bg-[#13242b]">
          <div className="flex items-center justify-between border-b border-[#223c47] p-5 sm:p-6">
            <div>
              <p className="label-kicker text-[#00f0a0]">Live ledger</p>
              <h2 className="mt-1.5 text-[15px] font-bold text-white">Network activity</h2>
            </div>
            <button onClick={() => navigate("/audit")} className="text-xs font-bold text-[#00f0a0] hover:text-[#38bdf8]">Audit trail</button>
          </div>
          <div>
            {data.activity.map((item, index) => (
              <div 
                key={`${item.time}-${item.action}`} 
                className={`activity-item-anim flex gap-3 px-5 py-3.5 transition-colors duration-150 hover:bg-[#1a323c] sm:px-6 ${index ? "border-t border-[#223c47]" : ""}`}
              >
                <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${item.kind === "alert" ? "bg-[#f87171]" : item.kind === "receipt" ? "bg-[#00f0a0]" : item.kind === "transfer" ? "bg-[#38bdf8]" : "bg-[#00f0a0]"}`} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="text-[12px] font-bold text-white">{item.action}</p>
                    <time className="data-number whitespace-nowrap text-[10px] font-medium text-[#9bb3c1]">{item.time}</time>
                  </div>
                  <p className="mt-1 text-[11px] leading-4 text-[#cbd5e1]">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      {networkOpen && (
        <div className="fixed inset-0 z-50 bg-[#050c0f]/80 p-3 backdrop-blur-[2px] sm:p-8">
          <div ref={modalRef} className="mx-auto flex h-full max-w-6xl flex-col overflow-auto rounded-xl border border-[#223c47] bg-[#13242b] shadow-2xl">
            <header className="flex items-start justify-between border-b border-[#223c47] bg-[#0d191f] px-5 py-5 sm:px-7">
              <div>
                <p className="label-kicker text-[#00f0a0]">Interactive visualization</p>
                <h2 className="mt-2 text-xl font-bold tracking-[-0.025em] text-white">State to facility supply network</h2>
                <p className="mt-1 text-sm text-[#cbd5e1]">Select a facility node to review its current availability and shortage exposure.</p>
              </div>
              <button 
                onClick={closeNetworkModal} 
                aria-label="Close network visualization" 
                className="grid h-9 w-9 place-items-center rounded-md border border-[#223c47] bg-[#13242b] text-[#9bb3c1] transition-colors duration-150 hover:border-[#00f0a0] hover:text-white"
              >
                <X size={18} />
              </button>
            </header>
            <div className="flex-1 p-4 sm:p-7">
              <Suspense fallback={<PanelSkeleton className="h-full" lines={5} />}>
                <SupplyChainScene />
              </Suspense>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
