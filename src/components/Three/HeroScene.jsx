'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { AdditiveBlending, MathUtils, NormalBlending, Vector2 } from 'three';
import {
  glowFragment,
  glowVertex,
  orbFragment,
  orbVertex,
  particleFragment,
  particleVertex,
} from './shaders';

const { damp, clamp, smoothstep } = MathUtils;
const ORB_RADIUS = 1.2;

// Small deterministic PRNG so geometry is stable across renders.
function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildHalo(count) {
  const rand = mulberry32(1187);
  const radius = new Float32Array(count);
  const angle = new Float32Array(count);
  const height = new Float32Array(count);
  const speed = new Float32Array(count);
  const seed = new Float32Array(count);
  const position = new Float32Array(count * 3); // required by three; real position is in the shader
  for (let i = 0; i < count; i++) {
    const r = 1.85 + Math.pow(rand(), 1.5) * 2.0;
    radius[i] = r;
    angle[i] = rand() * Math.PI * 2;
    height[i] = (rand() + rand() - 1) * 0.3 * (r - 1.4);
    speed[i] = (0.32 / Math.pow(r, 1.2)) * (0.7 + rand() * 0.6);
    seed[i] = rand();
  }
  return { radius, angle, height, speed, seed, position };
}

function Scene({ profile, inputs, onFirstFrame }) {
  const root = useRef(null);
  const halo = useRef(null);
  const orb = useRef(null);
  const orbMat = useRef(null);
  const partMat = useRef(null);
  const glowMat = useRef(null);
  // Orb offset (fraction of canvas width) comes from the --orb-offset CSS var so the WebGL orb
  // lines up with the CSS fallback orb; re-read whenever the canvas resizes.
  const offsetX = useRef(0);
  const size = useThree((st) => st.size);
  const canvasEl = useThree((st) => st.gl.domElement);
  useEffect(() => {
    offsetX.current = parseFloat(getComputedStyle(canvasEl).getPropertyValue('--orb-offset')) || 0;
  }, [canvasEl, size]);
  const sim = useRef({ t: 0, px: 0, py: 0, spin: 0, theme: 1, frames: 0, additive: true });

  const halo$ = useMemo(() => buildHalo(profile.particles), [profile.particles]);
  const orbUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uTheme: { value: 1 },
      uOpacity: { value: 1 },
      uRadius: { value: ORB_RADIUS },
      uDistort: { value: 1 },
      uPointer: { value: new Vector2() },
    }),
    [],
  );
  const partUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uTheme: { value: 1 },
      uOpacity: { value: 1 },
      uPx: { value: 1 },
      uSize: { value: profile.pointSize },
    }),
    [profile.pointSize],
  );
  const glowUniforms = useMemo(
    () => ({ uTime: { value: 0 }, uTheme: { value: 1 }, uOpacity: { value: 1 } }),
    [],
  );

  useFrame((state, rawDelta) => {
    const s = sim.current;
    const inp = inputs.current;
    const dt = Math.min(rawDelta, 0.05);
    s.t += dt;
    const t = s.t;

    // Pointer target; drift gently when there is no pointer (touch devices).
    const tx = inp.has ? inp.x : Math.sin(t * 0.27) * 0.45;
    const ty = inp.has ? inp.y : Math.cos(t * 0.21) * 0.3;
    s.px = damp(s.px, tx, 3, dt);
    s.py = damp(s.py, ty, 3, dt);
    s.theme = damp(s.theme, inp.dark ? 1 : 0, 2.5, dt);
    s.spin += dt * 0.12;

    // Scroll fade / drift as the hero leaves the viewport.
    const sc = clamp(window.scrollY / (window.innerHeight * 0.9), 0, 1);
    const fade = 1 - smoothstep(sc, 0.15, 1);
    const fit = Math.min(1, (state.viewport.width * (1 - 2 * offsetX.current)) / 3.4, state.viewport.height / 3.4);
    const k = fit * (1 - 0.2 * sc);
    const g = root.current;
    g.scale.setScalar(k);
    g.position.y = sc * 0.5;
    g.position.x = state.viewport.width * offsetX.current;

    const o = orb.current;
    o.rotation.y = s.spin + s.px * 0.35;
    o.rotation.x = 0.15 - s.py * 0.25;

    const h = halo.current;
    h.position.x = -s.px * 0.25;
    h.position.y = -s.py * 0.15;
    h.rotation.y = s.spin * 0.4;

    const px = state.gl.getPixelRatio();
    const ou = orbMat.current.uniforms;
    ou.uTime.value = t;
    ou.uTheme.value = s.theme;
    ou.uOpacity.value = fade;
    ou.uPointer.value.set(s.px, s.py);

    const pu = partMat.current.uniforms;
    pu.uTime.value = t;
    pu.uTheme.value = s.theme;
    pu.uOpacity.value = fade;
    pu.uPx.value = px;

    const gu = glowMat.current.uniforms;
    gu.uTime.value = t;
    gu.uTheme.value = s.theme;
    gu.uOpacity.value = fade;

    const wantAdditive = s.theme > 0.5;
    if (wantAdditive !== s.additive) {
      s.additive = wantAdditive;
      const blending = wantAdditive ? AdditiveBlending : NormalBlending;
      partMat.current.blending = blending;
      glowMat.current.blending = blending;
    }

    s.frames += 1;
    if (s.frames === 2) onFirstFrame();
  });

  return (
    <group ref={root}>
      <mesh position={[0, 0, -1.4]} renderOrder={-1} frustumCulled={false}>
        <planeGeometry args={[7, 7]} />
        <shaderMaterial
          ref={glowMat}
          uniforms={glowUniforms}
          vertexShader={glowVertex}
          fragmentShader={glowFragment}
          transparent
          depthWrite={false}
          depthTest={false}
          blending={AdditiveBlending}
        />
      </mesh>

      <mesh ref={orb} frustumCulled={false}>
        <icosahedronGeometry args={[ORB_RADIUS, profile.detail]} />
        <shaderMaterial
          ref={orbMat}
          uniforms={orbUniforms}
          vertexShader={orbVertex}
          fragmentShader={orbFragment}
          transparent
          depthWrite={false}
        />
      </mesh>

      <group ref={halo} rotation={[1.05, 0, -0.35]}>
        <points frustumCulled={false}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[halo$.position, 3]} />
            <bufferAttribute attach="attributes-aRadius" args={[halo$.radius, 1]} />
            <bufferAttribute attach="attributes-aAngle" args={[halo$.angle, 1]} />
            <bufferAttribute attach="attributes-aHeight" args={[halo$.height, 1]} />
            <bufferAttribute attach="attributes-aSpeed" args={[halo$.speed, 1]} />
            <bufferAttribute attach="attributes-aSeed" args={[halo$.seed, 1]} />
          </bufferGeometry>
          <shaderMaterial
            ref={partMat}
            uniforms={partUniforms}
            vertexShader={particleVertex}
            fragmentShader={particleFragment}
            transparent
            depthWrite={false}
            blending={AdditiveBlending}
          />
        </points>
      </group>
    </group>
  );
}

/**
 * Lazy-loaded WebGL scene. Mount only after HeroCanvas has decided 3D is allowed.
 * Props: profile (from getQualityProfile), onReady (first frame drawn), onFail.
 */
export default function HeroScene({ profile, onReady, onFail }) {
  const wrapRef = useRef(null);
  const inputs = useRef({ x: 0, y: 0, has: false, dark: true });
  const [active, setActive] = useState(true);
  const removeLost = useRef(null);
  const failed = useRef(false);

  // Never reveal the WebGL layer (hiding the CSS fallback) once a shader or context failure was reported.
  const fail = useCallback(() => {
    failed.current = true;
    onFail();
  }, [onFail]);
  const ready = useCallback(() => {
    if (!failed.current) onReady();
  }, [onReady]);

  useEffect(() => () => removeLost.current?.(), []);

  // Pointer (passive, window-level since the canvas is pointer-events-none).
  useEffect(() => {
    const onMove = (e) => {
      const inp = inputs.current;
      inp.x = (e.clientX / window.innerWidth) * 2 - 1;
      inp.y = -((e.clientY / window.innerHeight) * 2 - 1);
      inp.has = true;
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  // Theme: follow the `.dark` class on <html>.
  useEffect(() => {
    const root = document.documentElement;
    const sync = () => {
      inputs.current.dark = root.classList.contains('dark');
    };
    sync();
    const mo = new MutationObserver(sync);
    mo.observe(root, { attributes: true, attributeFilter: ['class'] });
    return () => mo.disconnect();
  }, []);

  // Pause when offscreen or when the tab is hidden.
  useEffect(() => {
    let onscreen = true;
    let tabVisible = !document.hidden;
    const update = () => setActive(onscreen && tabVisible);
    const io = new IntersectionObserver(([entry]) => {
      onscreen = entry.isIntersecting;
      update();
    });
    if (wrapRef.current) io.observe(wrapRef.current);
    const onVis = () => {
      tabVisible = !document.hidden;
      update();
    };
    document.addEventListener('visibilitychange', onVis);
    update();
    return () => {
      io.disconnect();
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  return (
    <div ref={wrapRef} className="absolute inset-0">
      <Canvas
        frameloop={active ? 'always' : 'never'}
        dpr={profile.dpr}
        camera={{ position: [0, 0, 5.2], fov: 40, near: 0.1, far: 30 }}
        gl={{
          alpha: true,
          antialias: profile.antialias,
          powerPreference: 'high-performance',
          stencil: false,
        }}
        flat
        resize={{ scroll: false }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
          // Shader compile/link errors do not throw; surface them so the CSS fallback stays.
          gl.debug.onShaderError = () => fail();
          const el = gl.domElement;
          const onLost = (e) => {
            e.preventDefault();
            fail();
          };
          el.addEventListener('webglcontextlost', onLost);
          removeLost.current = () => el.removeEventListener('webglcontextlost', onLost);
        }}
      >
        <Scene profile={profile} inputs={inputs} onFirstFrame={ready} />
      </Canvas>
    </div>
  );
}
