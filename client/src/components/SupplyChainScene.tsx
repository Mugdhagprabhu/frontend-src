/** Dark Teal Cartography: Supply Chain network graph on dark teal canvas */
import { useEffect, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Line, OrbitControls } from "@react-three/drei";
import { Vector3 } from "three";
import { Building2, Hospital, RotateCcw, Warehouse } from "lucide-react";
import { facilities, network } from "@/services/mockData";

type Facility = (typeof facilities)[number];
function tone(node: Facility) {
  return node.risk === "Elevated" ? "#f87171" : node.risk === "Watch" ? "#fbbf24" : node.type.includes("Warehouse") ? "#00f0a0" : "#38bdf8";
}

function NetworkNode({ node, selected, onSelect }: { node: Facility; selected: boolean; onSelect: (node: Facility) => void }) {
  const color = tone(node);
  return (
    <group position={[node.x, node.y, node.z]} onClick={(event) => { event.stopPropagation(); onSelect(node); }}>
      <mesh>
        <sphereGeometry args={[selected ? 0.22 : 0.16, 24, 24]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={selected ? 0.6 : 0.25} />
      </mesh>
      {selected && (
        <mesh>
          <ringGeometry args={[0.28, 0.31, 32]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.8} />
        </mesh>
      )}
    </group>
  );
}

function Graph({ selected, onSelect }: { selected: Facility | null; onSelect: (node: Facility) => void }) {
  const nodeById = useMemo(() => Object.fromEntries(network.nodes.map((node) => [node.id, node])), []);
  return (
    <>
      <ambientLight intensity={1.5} />
      <directionalLight position={[3, 4, 5]} intensity={1.2} />
      {network.edges.map(([from, to]) => {
        const a = nodeById[from];
        const b = nodeById[to];
        return <Line key={`${from}-${to}`} points={[new Vector3(a.x, a.y, a.z), new Vector3(b.x, b.y, b.z)]} color="#223c47" lineWidth={1.5} transparent opacity={0.85} />;
      })}
      {network.nodes.map((node) => (
        <NetworkNode key={node.id} node={node} selected={selected?.id === node.id} onSelect={onSelect} />
      ))}
      <OrbitControls enablePan enableZoom minDistance={4.5} maxDistance={9} target={[0, 0, 0]} />
    </>
  );
}

function Fallback({ selected, onSelect }: { selected: Facility | null; onSelect: (node: Facility) => void }) {
  const nodeIcon = (node: Facility) => node.type.includes("Warehouse") ? Warehouse : node.type.includes("Hospital") ? Hospital : Building2;
  return (
    <div className="route-dots relative h-[320px] overflow-hidden rounded-lg border border-[#223c47] bg-[#0e1a1f] sm:h-[400px]">
      {network.edges.map(([from, to]) => {
        const a = facilities.find((node) => node.id === from)!;
        const b = facilities.find((node) => node.id === to)!;
        const ax = ((a.x + 2.3) / 4.8) * 100;
        const ay = ((1.45 - a.y) / 2.9) * 100;
        const bx = ((b.x + 2.3) / 4.8) * 100;
        const by = ((1.45 - b.y) / 2.9) * 100;
        const length = Math.hypot(bx - ax, by - ay);
        const angle = Math.atan2(by - ay, bx - ax) * (180 / Math.PI);
        return <span key={`${from}-${to}`} className="absolute h-px origin-left bg-[#223c47]" style={{ left: `${ax}%`, top: `${ay}%`, width: `${length}%`, transform: `rotate(${angle}deg)` }} />;
      })}
      {facilities.map((node) => {
        const left = ((node.x + 2.3) / 4.8) * 100;
        const top = ((1.45 - node.y) / 2.9) * 100;
        const Icon = nodeIcon(node);
        const active = selected?.id === node.id;
        return (
          <button key={node.id} onClick={() => onSelect(node)} className={`absolute -translate-x-1/2 -translate-y-1/2 text-left ${active ? "z-10" : "z-[1]"}`} style={{ left: `${left}%`, top: `${top}%` }}>
            <span className={`grid h-9 w-9 place-items-center rounded-full border-2 ${active ? "border-[#00f0a0]" : "border-[#223c47]"} shadow-md ${node.risk === "Elevated" ? "bg-[#f87171]" : node.risk === "Watch" ? "bg-[#fbbf24]" : node.type.includes("Warehouse") ? "bg-[#00f0a0] text-[#091216]" : "bg-[#38bdf8] text-[#091216]"}`}>
              <Icon size={16} className={node.type.includes("Warehouse") || !node.type.includes("Hospital") ? "text-[#091216]" : "text-white"} />
            </span>
            <span className={`mt-1 block max-w-[90px] text-[9px] font-bold leading-3 ${active ? "text-[#00f0a0]" : "text-[#9bb3c1]"}`}>
              {node.code}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export default function SupplyChainScene({ onSelect }: { onSelect?: (node: Facility) => void }) {
  const [selected, setSelected] = useState<Facility | null>(facilities[1]);
  const [webgl, setWebgl] = useState(false);

  useEffect(() => {
    const compact = window.matchMedia("(max-width: 767px)").matches || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const canvas = document.createElement("canvas");
    setWebgl(!compact && Boolean(canvas.getContext("webgl") || canvas.getContext("experimental-webgl")));
  }, []);

  const handleSelect = (node: Facility) => { setSelected(node); onSelect?.(node); };

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_210px]">
      <div className="relative h-[320px] overflow-hidden rounded-lg border border-[#223c47] bg-[#0e1a1f] sm:h-[400px]">
        {webgl ? <Canvas camera={{ position: [0, 0.1, 6.2], fov: 48 }}><Graph selected={selected} onSelect={handleSelect} /></Canvas> : <Fallback selected={selected} onSelect={handleSelect} />}
        <div className="pointer-events-none absolute left-4 top-4 rounded border border-[#223c47] bg-[#13242b]/90 px-3 py-2 backdrop-blur">
          <p className="label-kicker text-[#00f0a0]">Supply network</p>
          <p className="mt-1 text-xs font-bold text-white">5 monitored facilities</p>
        </div>
        <button onClick={() => setSelected(facilities[1])} className="absolute bottom-3 left-3 grid h-8 w-8 place-items-center rounded border border-[#223c47] bg-[#13242b] text-[#00f0a0] shadow-sm hover:border-[#00f0a0] hover:bg-[#173b37]" aria-label="Reset network view">
          <RotateCcw size={14} />
        </button>
      </div>
      <div className="rounded-lg border border-[#223c47] bg-[#13242b] p-4 text-white">
        <p className="label-kicker text-[#00f0a0]">Selected node</p>
        {selected && (
          <>
            <p className="mt-2 text-[13px] font-bold leading-5 text-white">{selected.name}</p>
            <p className="mt-1 text-[11px] text-[#9bb3c1]">{selected.code} · {selected.type}</p>
            <dl className="mt-5 space-y-3 border-t border-[#223c47] pt-4">
              <div>
                <dt className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#9bb3c1]">Availability</dt>
                <dd className="mt-1 text-lg font-bold text-[#00f0a0]">{selected.availability}%</dd>
              </div>
              <div>
                <dt className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#9bb3c1]">Critical drugs</dt>
                <dd className="mt-1 text-sm font-bold text-white">{selected.criticalDrugs}</dd>
              </div>
              <div>
                <dt className="text-[10px] font-semibold uppercase tracking-[0.1em] text-[#9bb3c1]">Shortage risk</dt>
                <dd className="mt-1 text-sm font-bold text-white">{selected.risk}</dd>
              </div>
            </dl>
          </>
        )}
      </div>
    </div>
  );
}