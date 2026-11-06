'use client';

import { Component, lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import {
  detectEnvironment,
  getQualityProfile,
  onFirstInteraction,
  shouldEnable3D,
  shouldWaitForInteraction,
} from './capabilities';
import styles from './HeroCanvas.module.css';

// Lazy so three / @react-three/fiber live in their own chunk, fetched only after idle.
const HeroScene = lazy(() => import('./HeroScene'));

class SceneBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onError();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/**
 * Decorative "Signal orb". Fills its positioned parent, aria-hidden.
 * Shows a pure-CSS orb immediately, then upgrades to WebGL after idle (on small / coarse-pointer
 * devices: after the first user interaction) when
 * WebGL2 is available and the user has not asked for reduced motion / data saving.
 *
 * With `photo` ({ src, alt }) a circular portrait is centred inside the orb (same offset as the orb),
 * under the WebGL layer so the glassy orb wraps around it. The portrait lives in normal DOM so it
 * paints with the page (no JS gating) and doubles as the focus of the CSS fallback orb.
 *
 * @param {{ className?: string, variant?: 'hero' | 'compact', photo?: { src: string, alt: string } }} props
 */
export default function HeroCanvas({ className = '', variant = 'hero', photo }) {
  const portraitRef = useRef(null);
  const [profile, setProfile] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Cheap early exit without probing WebGL.
    if (!shouldEnable3D({ ...detectEnvironment({ probeWebGL: false }) })) return undefined;

    let cancelled = false;
    let cancelIdle = () => {};
    let cancelInteraction = () => {};

    const start = () => {
      if (cancelled) return;
      const env = detectEnvironment();
      if (shouldEnable3D(env)) setProfile(getQualityProfile({ variant, small: env.small }));
    };

    const scheduleIdle = () => {
      if ('requestIdleCallback' in window) {
        const id = window.requestIdleCallback(start, { timeout: 2500 });
        cancelIdle = () => window.cancelIdleCallback(id);
      } else {
        const id = window.setTimeout(start, 1200);
        cancelIdle = () => window.clearTimeout(id);
      }
    };

    // Mobile / coarse pointer: keep the CSS orb until the user interacts, so
    // shader compile never lands inside the page-load main-thread window.
    if (shouldWaitForInteraction(detectEnvironment({ probeWebGL: false }))) {
      cancelInteraction = onFirstInteraction(scheduleIdle);
    } else {
      scheduleIdle();
    }

    return () => {
      cancelled = true;
      cancelInteraction();
      cancelIdle();
    };
  }, [variant]);

  // If the user turns on reduced motion while the scene is live, stop WebGL and restore the CSS orb.
  useEffect(() => {
    if (!window.matchMedia) return undefined;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (!mq.addEventListener) return undefined;
    const onChange = (e) => {
      if (!e.matches) return;
      setProfile(null);
      setReady(false);
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  // Subtle parallax: the portrait drifts against the pointer. Fine pointer + motion allowed only.
  useEffect(() => {
    if (!photo || !window.matchMedia) return undefined;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    let raf = 0;
    const onMove = (e) => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        const el = portraitRef.current;
        if (!el) return;
        const x = (e.clientX / window.innerWidth) * 2 - 1;
        const y = (e.clientY / window.innerHeight) * 2 - 1;
        el.style.transform = `translate3d(${(-x * 12).toFixed(1)}px, ${(-y * 8).toFixed(1)}px, 0)`;
      });
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, [photo]);

  const handleReady = useCallback(() => setReady(true), []);
  const handleFail = useCallback(() => {
    setProfile(null);
    setReady(false);
  }, []);

  return (
    <div
      aria-hidden={photo ? undefined : 'true'}
      className={`pointer-events-none absolute inset-0 ${className}`}
    >
      <div aria-hidden="true" className={styles.stage} data-hidden={ready ? 'true' : 'false'}>
        <div className={styles.orb} />
      </div>
      {photo && (
        <div className={styles.portraitStage}>
          <div className={styles.portrait} ref={portraitRef}>
            <div className={styles.portraitInner}>
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="(min-width: 768px) 400px, 190px"
                quality={78}
                loading="eager"
                className={styles.portraitImg}
              />
            </div>
            <div aria-hidden="true" className={styles.ring} data-hidden={ready ? 'true' : 'false'} />
          </div>
        </div>
      )}
      {profile && (
        <div aria-hidden="true" className={styles.scene} data-ready={ready ? 'true' : 'false'}>
          <SceneBoundary onError={handleFail}>
            <Suspense fallback={null}>
              <HeroScene profile={profile} onReady={handleReady} onFail={handleFail} />
            </Suspense>
          </SceneBoundary>
        </div>
      )}
    </div>
  );
}
