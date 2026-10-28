import { Component, Suspense, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import * as THREE from "three";
import { Body, BODY_NAMES, CameraRig, HelioOrbits, SunLight, ZodiacRing } from "./SceneParts";
import { ABBR, KP_PLANETS, SIGNS } from "@/lib/kp";

class GLBoundary extends Component {
  constructor(p) { super(p); this.state = { failed: false }; }
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() {}
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}

export const hasWebGL = () => {
  try {
    const c = document.createElement("canvas");
    return !!(window.WebGLRenderingContext && (c.getContext("webgl2") || c.getContext("webgl")));
  } catch {
    return false;
  }
};

export default function ObservatoryScene({ view, sky, natal, showNatal, showLabels, selected, onSelect, reduced, active, intro, t, fallback }) {
  const controls = useRef();
  const store = useRef({ pos: Object.fromEntries(BODY_NAMES.map((n) => [n, new THREE.Vector3()])), size: {} });
  const [hovered, setHovered] = useState(null);
  const geo = sky?.geocentric_sidereal || {};
  const natalPts = (natal || []).filter((p) => KP_PLANETS.includes(p.name)).map((p) => ({ name: p.name, longitude: p.longitude, abbr: ABBR[p.name] }));

  return (
    <GLBoundary fallback={fallback}>
      <Canvas data-testid="observatory-canvas" dpr={[1, 2]} frameloop={active ? "always" : "never"}
        camera={{ position: [0, 46, 74], fov: 45, near: 0.1, far: 3000 }} gl={{ antialias: true }}
        onPointerMissed={() => onSelect(null)}>
        <color attach="background" args={["#05070d"]} />
        <ambientLight intensity={view === "geo" ? 0.55 : 0.12} />
        <Stars radius={400} depth={80} count={5000} factor={5} saturation={0} fade speed={reduced ? 0 : 0.4} />
        <SunLight store={store} />
        <Suspense fallback={null}>
          {BODY_NAMES.map((n) => {
            const g = geo[n];
            const detail = g ? `${g.dms} ${t(g.sign)} · ${g.nakshatra}${g.retrograde && !["Rahu", "Ketu"].includes(n) ? " · R" : ""}` : null;
            return (
              <Body key={n} name={n} view={view} sky={sky} store={store} selected={selected} hovered={hovered}
                setHovered={setHovered} onSelect={onSelect} reduced={reduced} showLabel={showLabels} label={t(n)} detail={detail} />
            );
          })}
        </Suspense>
        {view === "helio" && <HelioOrbits />}
        {view === "geo" && <ZodiacRing lang="en" tSign={(i) => t(SIGNS[i])} natal={natalPts} showNatal={showNatal} />}
        <OrbitControls ref={controls} makeDefault enableDamping dampingFactor={0.08} minDistance={3} maxDistance={260} />
        <CameraRig controls={controls} store={store} selected={selected} view={view} reduced={reduced} intro={intro} />
      </Canvas>
    </GLBoundary>
  );
}
