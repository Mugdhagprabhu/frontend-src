/** Clinical Cartography: a lightweight, purposeful facility graph makes state-to-district supply routes legible and falls back to an accessible 2D map. */
import { useEffect, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Line, OrbitControls } from "@react-three/drei";
import { Vector3 } from "three";
import { Building2, Hospital, RotateCcw, Warehouse } from "lucide-react";
import { facilities, network } from "@/services/mockData";

type Facility = (typeof facilities)[number];
function tone(node: Facility) { return node.risk === "Elevated" ? "#c53030" : node.risk === "Watch" ? "#b7791f" : node.type.includes("Warehouse") ? "#1769aa" : "#66bde8"; }

function NetworkNode({ node, selected, onSelect }: { node: Facility; selected: boolean; onSelect: (node: Facility) => void }) {
  const color = tone(node);
  return <group position={[node.x, node.y, node.z]} onClick={(event) => { event.stopPropagation(); onSelect(node); }}><mesh><sphereGeometry args={[selected ? 0.22 : 0.16, 24, 24]} /><meshStandardMaterial color={color} emissive={color} emissiveIntensity={selected ? 0.48 : 0.22} /></mesh>{selected && <mesh><ringGeometry args={[0.28, 0.31, 32]} /><meshBasicMaterial color="#0b1f33" transparent opacity={0.7} /></mesh>}</group>;
}

function Graph({ selected, onSelect }: { selected: Facility | null; onSelect: (node: Facility) => void }) {
  const nodeById = useMemo(() => Object.fromEntries(network.nodes.map((node) => [node.id, node])), []);
  return <><ambientLight intensity={1.5} /><directionalLight position={[3, 4, 5]} intensity={1.2} />{network.edges.map(([from, to]) => { const a = nodeById[from]; const b = nodeById[to]; return <Line key={`${from}-${to}`} points={[new Vector3(a.x, a.y, a.z), new Vector3(b.x, b.y, b.z)]} color="#7bbdde" lineWidth={1.2} transparent opacity={0.7} />; })}{network.nodes.map((node) => <NetworkNode key={node.id} node={node} selected={selected?.id === node.id} onSelect={onSelect} />)}<OrbitControls enablePan enableZoom minDistance={4.5} maxDistance={9} target={[0, 0, 0]} /></>;
}

function Fallback({ selected, onSelect }: { selected: Facility | null; onSelect: (node: Facility) => void }) {
  const nodeIcon = (node: Facility) => node.type.includes("Warehouse") ? Warehouse : node.type.includes("Hospital") ? Hospital : Building2;
  return <div className="route-dots relative h-[320px] overflow-hidden rounded-lg border border-[#d5e5ee] bg-[#f5fbff] sm:h-[400px]">{network.edges.map(([from, to]) => { const a = facilities.find((node) => node.id === from)!; const b = facilities.find((node) => node.id === to)!; const ax = ((a.x + 2.3) / 4.8) * 100; const ay = ((1.45 - a.y) / 2.9) * 100; const bx = ((b.x + 2.3) / 4.8) * 100; const by = ((1.45 - b.y) / 2.9) * 100; const length = Math.hypot(bx - ax, by - ay); const angle = Math.atan2(by - ay, bx - ax) * (180 / Math.PI); return <span key={`${from}-${to}`} className="absolute h-px origin-left bg-[#71b9df]" style={{ left: `${ax}%`, top: `${ay}%`, width: `${length}%`, transform: `rotate(${angle}deg)` }} />; })}{facilities.map((node) => { const left = ((node.x + 2.3) / 4.8) * 100; const top = ((1.45 - node.y) / 2.9) * 100; const Icon = nodeIcon(node); const active = selected?.id === node.id; return <button key={node.id} onClick={() => onSelect(node)} className={`absolute -translate-x-1/2 -translate-y-1/2 text-left ${active ? "z-10" : "z-[1]"}`} style={{ left: `${left}%`, top: `${top}%` }}><span className={`grid h-9 w-9 place-items-center rounded-full border-2 border-white shadow-md ${node.risk === "Elevated" ? "bg-[#c53030]" : node.risk === "Watch" ? "bg-[#b7791f]" : node.type.includes("Warehouse") ? "bg-[#1769aa]" : "bg-[#66bde8]"}`}><Icon size={16} className="text-white" /></span><span className={`mt-1 block max-w-[90px] text-[9px] font-bold leading-3 ${active ? "text-[#0b4f88]" : "text-[#426076]"}`}>{node.code}</span></button>; })}</div>;
}

export default function SupplyChainScene({ onSelect }: { onSelect?: (node: Facility) => void }) {
  const [selected, setSelected] = useState<Facility | null>(facilities[1]);
  const [webgl, setWebgl] = useState(false);
  useEffect(() => { const compact = window.matchMedia("(max-width: 767px)").matches || window.matchMedia("(prefers-reduced-motion: reduce)").matches; const canvas = document.createElement("canvas"); setWebgl(!compact && Boolean(canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))); }, []);
  const handleSelect = (node: Facility) => { setSelected(node); onSelect?.(node); };
  return <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_210px]"><div className="relative h-[320px] overflow-hidden rounded-lg border border-[#d5e5ee] bg-[#f5fbff] sm:h-[400px]">{webgl ? <Canvas camera={{ position: [0, 0.1, 6.2], fov: 48 }}><Graph selected={selected} onSelect={handleSelect} /></Canvas> : <Fallback selected={selected} onSelect={handleSelect} />}<div className="pointer-events-none absolute left-4 top-4 rounded border border-[#cfe3ef] bg-white/90 px-3 py-2 backdrop-blur"><p className="label-kicker">Supply network</p><p className="mt-1 text-xs font-bold text-[#102a43]">5 monitored facilities</p></div><button onClick={() => setSelected(facilities[1])} className="absolute bottom-3 left-3 grid h-8 w-8 place-items-center rounded border border-[#cfe3ef] bg-white text-[#1769aa] shadow-sm hover:bg-[#eaf5fc]" aria-label="Reset network view"><RotateCcw size={14} /></button></div>
    <div className="rounded-lg border border-[#dce8f0] bg-white p-4"><p className="label-kicker">Selected node</p>{selected && <><p className="mt-2 text-[13px] font-bold leading-5 text-[#102a43]">{selected.name}</p><p className="mt-1 text-[11px] text-[#64748b]">{selected.code} · {selected.type}</p><dl className="mt-5 space-y-3 border-t border-[#e7f0f5] pt-4"><div><dt className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#748ca0]">Availability</dt><dd className="mt-1 text-lg font-bold text-[#0b4f88]">{selected.availability}%</dd></div><div><dt className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#748ca0]">Critical drugs</dt><dd className="mt-1 text-sm font-bold text-[#102a43]">{selected.criticalDrugs}</dd></div><div><dt className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#748ca0]">Shortage risk</dt><dd className="mt-1 text-sm font-bold text-[#102a43]">{selected.risk}</dd></div></dl></>}</div></div>;
}
