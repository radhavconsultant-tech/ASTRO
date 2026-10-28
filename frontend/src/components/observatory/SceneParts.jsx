import { useMemo, useRef, useEffect } from "react";
import { useFrame, useLoader, useThree } from "@react-three/fiber";
import { Html, Line } from "@react-three/drei";
import * as THREE from "three";
import { angDiff, PLANET_COLOR, SIGN_ABBR } from "@/lib/kp";

export const BODIES = {
  Sun: { tex: "sun.jpg", size: 3.4, geoSize: 1.5, geoR: 13 },
  Mercury: { tex: "mercury.jpg", size: 0.38, geoSize: 0.36, geoR: 9.5, au: 0.387 },
  Venus: { tex: "venus_surface.jpg", size: 0.62, geoSize: 0.5, geoR: 11, atmo: "#f5d7a1", au: 0.723 },
  Earth: { tex: "earth_daymap.jpg", size: 0.66, geoSize: 1.25, atmo: "#5ab4ff", au: 1 },
  Moon: { tex: "moon.jpg", size: 0.2, geoSize: 0.42, geoR: 6.5 },
  Mars: { tex: "mars.jpg", size: 0.48, geoSize: 0.44, geoR: 15, au: 1.524 },
  Jupiter: { tex: "jupiter.jpg", size: 1.6, geoSize: 0.9, geoR: 17, au: 5.203 },
  Saturn: { tex: "saturn.jpg", size: 1.35, geoSize: 0.75, geoR: 19, ring: true, au: 9.537 },
  Uranus: { tex: "uranus.jpg", size: 0.95, geoSize: 0.55, geoR: 20.6, atmo: "#9be7f0", au: 19.19 },
  Neptune: { tex: "neptune.jpg", size: 0.92, geoSize: 0.55, geoR: 22, atmo: "#5b7cfa", au: 30.07 },
  Rahu: { node: true, geoSize: 0.45, geoR: 24 },
  Ketu: { node: true, geoSize: 0.45, geoR: 24 },
};
export const BODY_NAMES = Object.keys(BODIES);
export const RING_R = 24;
export const helioR = (au) => 7 + Math.sqrt(au) * 8.5;
const ORIGIN = new THREE.Vector3();
const toXZ = (deg, r) => {
  const a = (deg * Math.PI) / 180;
  return [r * Math.cos(a), 0, -r * Math.sin(a)];
};

export function targetFor(name, view, sky) {
  const b = BODIES[name];
  const h = sky?.heliocentric || {};
  const g = sky?.geocentric_sidereal || {};
  if (view === "helio") {
    if (b.node) return { angle: 0, radius: RING_R, size: 0.0001, hidden: true };
    if (name === "Sun") return { angle: 0, radius: 0, size: b.size };
    if (name === "Moon") return { angle: h.Moon?.longitude ?? 0, radius: 1.7, size: b.size, parent: "Earth" };
    return { angle: h[name]?.longitude ?? 0, radius: helioR(h[name]?.distance_au ?? b.au), size: b.size };
  }
  if (name === "Earth") return { angle: 0, radius: 0, size: b.geoSize };
  return { angle: g[name]?.longitude ?? 0, radius: b.geoR, size: b.geoSize };
}

let glowTex;
const getGlow = () => {
  if (glowTex) return glowTex;
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const ctx = c.getContext("2d");
  const grd = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  grd.addColorStop(0, "rgba(255,220,150,1)");
  grd.addColorStop(0.25, "rgba(255,180,80,0.55)");
  grd.addColorStop(1, "rgba(255,140,40,0)");
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, 128, 128);
  glowTex = new THREE.CanvasTexture(c);
  return glowTex;
};

const SaturnRing = () => {
  const tex = useLoader(THREE.TextureLoader, "/textures/saturn_ring.png");
  const geo = useMemo(() => {
    const g = new THREE.RingGeometry(1.25, 2.3, 128);
    const pos = g.attributes.position;
    const uv = g.attributes.uv;
    const v = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      uv.setXY(i, (v.length() - 1.25) / 1.05, 1);
    }
    return g;
  }, []);
  return (
    <mesh geometry={geo} rotation={[-Math.PI / 2 + 0.47, 0, 0]}>
      <meshStandardMaterial map={tex} transparent side={THREE.DoubleSide} opacity={0.95} depthWrite={false} />
    </mesh>
  );
};

const Surface = ({ name, meshRef }) => {
  const b = BODIES[name];
  const tex = useLoader(THREE.TextureLoader, `/textures/${b.tex}`);
  useEffect(() => { tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4; tex.needsUpdate = true; }, [tex]);
  return (
    <>
      <mesh ref={meshRef}>
        <sphereGeometry args={[1, 64, 64]} />
        {name === "Sun"
          ? <meshBasicMaterial map={tex} toneMapped={false} />
          : <meshStandardMaterial map={tex} roughness={0.9} metalness={0} />}
      </mesh>
      {b.atmo && (
        <mesh scale={1.09}>
          <sphereGeometry args={[1, 48, 48]} />
          <meshBasicMaterial color={b.atmo} transparent opacity={0.16} side={THREE.BackSide} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
      )}
      {name === "Sun" && (
        <sprite scale={4.2}>
          <spriteMaterial map={getGlow()} blending={THREE.AdditiveBlending} transparent depthWrite={false} opacity={0.9} />
        </sprite>
      )}
      {b.ring && <SaturnRing />}
    </>
  );
};

const NodeShape = ({ name }) => (
  <group>
    <mesh>
      <octahedronGeometry args={[1, 0]} />
      <meshBasicMaterial color={PLANET_COLOR[name]} wireframe />
    </mesh>
    <mesh scale={0.45}>
      <octahedronGeometry args={[1, 0]} />
      <meshBasicMaterial color={PLANET_COLOR[name]} transparent opacity={0.6} />
    </mesh>
  </group>
);

export function Body({ name, view, sky, store, selected, hovered, setHovered, onSelect, reduced, showLabel, label, detail }) {
  const group = useRef();
  const mesh = useRef();
  const target = targetFor(name, view, sky);
  const st = useRef(null);
  if (!st.current) st.current = { angle: target.angle, radius: target.radius, size: target.size };

  useFrame((_, dt) => {
    const s = st.current;
    const k = reduced ? 1 : Math.min(1, dt * 3.2);
    s.angle += angDiff(s.angle, target.angle) * k;
    s.radius += (target.radius - s.radius) * k;
    s.size += (target.size - s.size) * k;
    const c = target.parent ? store.current.pos[target.parent] || ORIGIN : ORIGIN;
    const [x, , z] = toXZ(s.angle, s.radius);
    if (!group.current) return;
    group.current.position.set(c.x + x, 0, c.z + z);
    group.current.scale.setScalar(Math.max(s.size, 0.0001));
    store.current.pos[name].copy(group.current.position);
    store.current.size[name] = s.size;
    if (!reduced && mesh.current) mesh.current.rotation.y += dt * (name === "Sun" ? 0.03 : 0.18);
    if (!reduced && BODIES[name].node && group.current) group.current.rotation.y += dt * 0.6;
  });

  if (target.hidden) return null;
  const active = selected === name || hovered === name;
  return (
    <group ref={group}
      onClick={(e) => { e.stopPropagation(); onSelect(name); }}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(name); document.body.style.cursor = "pointer"; }}
      onPointerOut={() => { setHovered(null); document.body.style.cursor = ""; }}>
      {BODIES[name].node ? <NodeShape name={name} /> : <Surface name={name} meshRef={mesh} />}
      {(showLabel || active) && (
        <Html zIndexRange={[20, 0]} style={{ pointerEvents: "none" }}>
          <div className="planet-label-3d">
            <div className={`rounded-md border px-2 py-0.5 text-[11px] font-medium backdrop-blur-md ${active ? "border-amber-300/60 bg-[#0b0f19]/85 text-amber-100" : "border-white/10 bg-[#0b0f19]/60 text-slate-200"}`}>
              <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full align-middle" style={{ background: PLANET_COLOR[name] }} />
              {label}
              {active && detail && <div className="font-data mt-0.5 text-[10px] text-cyan-300">{detail}</div>}
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}

export const SunLight = ({ store }) => {
  const l = useRef();
  useFrame(() => { if (l.current) l.current.position.copy(store.current.pos.Sun); });
  return <pointLight ref={l} intensity={3.2} decay={0} distance={0} color="#fff3dd" />;
};

const circle = (r, n = 160) => Array.from({ length: n + 1 }, (_, i) => toXZ((i / n) * 360, r));

export const HelioOrbits = () => (
  <group>
    {BODY_NAMES.filter((n) => BODIES[n].au).map((n) => (
      <Line key={n} points={circle(helioR(BODIES[n].au))} color={n === "Earth" ? "#22D3EE" : "#D4AF37"} lineWidth={0.6} transparent opacity={n === "Earth" ? 0.35 : 0.18} />
    ))}
  </group>
);

export const ZodiacRing = ({ lang, tSign, natal, showNatal }) => (
  <group>
    <Line points={circle(RING_R)} color="#D4AF37" lineWidth={1} transparent opacity={0.5} />
    <Line points={circle(RING_R + 3)} color="#D4AF37" lineWidth={1} transparent opacity={0.35} />
    <Line points={circle(RING_R + 3.8)} color="#22D3EE" lineWidth={0.5} transparent opacity={0.25} />
    {Array.from({ length: 12 }, (_, i) => (
      <group key={i}>
        <Line points={[toXZ(i * 30, RING_R), toXZ(i * 30, RING_R + 3)]} color="#D4AF37" lineWidth={1} transparent opacity={0.55} />
        <Html position={toXZ(i * 30 + 15, RING_R + 1.5)} center zIndexRange={[10, 0]} style={{ pointerEvents: "none" }}>
          <div className="font-data whitespace-nowrap text-[11px] tracking-wider text-amber-200/90">{lang === "te" ? tSign(i) : SIGN_ABBR[i]}</div>
        </Html>
      </group>
    ))}
    {Array.from({ length: 27 }, (_, i) => (
      <Line key={`n${i}`} points={[toXZ((i * 40) / 3, RING_R + 3), toXZ((i * 40) / 3, RING_R + 3.8)]} color="#22D3EE" lineWidth={0.6} transparent opacity={0.5} />
    ))}
    {showNatal && natal.map((p) => (
      <group key={p.name} position={toXZ(p.longitude, RING_R + 5)}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <octahedronGeometry args={[0.32, 0]} />
          <meshBasicMaterial color="#E6C668" />
        </mesh>
        <Html center zIndexRange={[10, 0]} style={{ pointerEvents: "none" }}>
          <div className="font-data translate-y-3 whitespace-nowrap text-[10px] text-amber-300/80">{p.abbr}</div>
        </Html>
      </group>
    ))}
  </group>
);

export const SadeSatiOverlay = ({ path, signIdx }) => {
  const pts = useMemo(() => (path || []).map((p, i, a) => toXZ(p.lon, 16.5 + (5 * i) / Math.max(1, a.length - 1))), [path]);
  const colors = { rising: "#22D3EE", peak: "#E6C668", setting: "#F59E0B" };
  return (
    <group>
      {Object.entries(signIdx).map(([k, i]) => (
        <mesh key={k} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
          <ringGeometry args={[RING_R, RING_R + 3, 32, 1, (i * 30 * Math.PI) / 180, Math.PI / 6]} />
          <meshBasicMaterial color={colors[k]} transparent opacity={0.22} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
      ))}
      {pts.length > 1 && <Line points={pts} color="#F5C66B" lineWidth={1.6} transparent opacity={0.85} />}
    </group>
  );
};

export function CameraRig({ controls, store, selected, view, reduced, intro }) {
  const { camera } = useThree();
  const anim = useRef({ t: 0, active: true, slow: intro && !reduced });
  useEffect(() => {
    if (intro && !reduced) camera.position.set(0, 190, 300);
  }, [camera, intro, reduced]);
  useEffect(() => { anim.current = { t: 0, active: true, slow: anim.current.slow }; }, [selected, view]);

  useFrame((_, dt) => {
    const c = controls.current;
    if (!c) return;
    const focus = selected ? store.current.pos[selected] : null;
    const a = anim.current;
    if (a.active) {
      a.t += dt;
      const k = reduced ? 1 : Math.min(1, dt * (a.slow ? 1.1 : 2.4));
      let camGoal;
      if (focus) {
        const dist = (store.current.size[selected] || 1) * 7 + 5;
        const dir = camera.position.clone().sub(c.target).normalize();
        if (dir.y < 0.25) dir.y = 0.25;
        camGoal = focus.clone().add(dir.normalize().multiplyScalar(dist));
      } else {
        camGoal = view === "helio" ? new THREE.Vector3(0, 46, 74) : new THREE.Vector3(0, 46, 48);
      }
      c.target.lerp(focus || ORIGIN, k);
      camera.position.lerp(camGoal, k);
      if (a.t > (a.slow ? 3.6 : 2) || reduced) { a.active = false; a.slow = false; }
    } else if (focus) {
      const delta = focus.clone().sub(c.target);
      c.target.add(delta);
      camera.position.add(delta);
    }
    c.update();
  });
  return null;
}
