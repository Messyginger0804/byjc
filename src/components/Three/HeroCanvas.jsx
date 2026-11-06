'use client';

import { Component, lazy, Suspense, useCallback, useEffect, useState } from 'react';
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
 * @param {{ className?: string, variant?: 'hero' | 'compact' }} props
 */
export default function HeroCanvas({ className = '', variant = 'hero' }) {
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

  const handleReady = useCallback(() => setReady(true), []);
  const handleFail = useCallback(() => {
    setProfile(null);
    setReady(false);
  }, []);

  return (
    <div aria-hidden="true" className={`pointer-events-none absolute inset-0 ${className}`}>
      <div className={styles.stage} data-hidden={ready ? 'true' : 'false'}>
        <div className={styles.orb} />
      </div>
      {profile && (
        <div className={styles.scene} data-ready={ready ? 'true' : 'false'}>
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
