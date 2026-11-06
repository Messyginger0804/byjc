/* Hand-written icons and bespoke mini visuals for the services bento. Server components, all decorative (aria-hidden). */

const ICON = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
  focusable: 'false',
  className: 'h-5 w-5',
};

export function IconLanding() {
  return (
    <svg viewBox="0 0 24 24" {...ICON}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18M9 21V9" />
    </svg>
  );
}
export function IconApp() {
  return (
    <svg viewBox="0 0 24 24" {...ICON}>
      <path d="M3 3v16a2 2 0 0 0 2 2h16" />
      <path d="M7 16v-5M12 16V8M17 16v-8" />
    </svg>
  );
}
export function IconCart() {
  return (
    <svg viewBox="0 0 24 24" {...ICON}>
      <circle cx="8" cy="21" r="1" />
      <circle cx="19" cy="21" r="1" />
      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
    </svg>
  );
}
export function IconServer() {
  return (
    <svg viewBox="0 0 24 24" {...ICON}>
      <rect x="2" y="2" width="20" height="8" rx="2" />
      <rect x="2" y="14" width="20" height="8" rx="2" />
      <path d="M6 6h.01M6 18h.01" />
    </svg>
  );
}
export function IconDevices() {
  return (
    <svg viewBox="0 0 24 24" {...ICON}>
      <path d="M18 8V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h8" />
      <path d="M10 19v-3.96 3.15M7 19h5" />
      <rect x="16" y="12" width="6" height="10" rx="1" />
    </svg>
  );
}

const Frame = ({ children, label }) => (
  <svg viewBox="0 0 240 130" className="svc-vis h-full w-full" aria-hidden="true" focusable="false" preserveAspectRatio="xMidYMid meet" data-vis={label}>
    {children}
  </svg>
);

const Grad = ({ id, a = 'var(--a)', b = 'var(--b)' }) => (
  <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" style={{ stopColor: a }} />
    <stop offset="1" style={{ stopColor: b }} />
  </linearGradient>
);

export function VisualLanding() {
  return (
    <Frame label="landing">
      <defs>
        <Grad id="svc-l1" />
        <Grad id="svc-l2" b="var(--c)" />
        <clipPath id="svc-lclip"><rect x="4" y="4" width="232" height="122" rx="12" /></clipPath>
      </defs>
      <rect x="4" y="4" width="232" height="122" rx="12" fill="var(--s)" stroke="var(--l)" />
      <circle cx="18" cy="16" r="2.5" fill="var(--l)" />
      <circle cx="28" cy="16" r="2.5" fill="var(--l)" />
      <circle cx="38" cy="16" r="2.5" fill="var(--l)" />
      <rect x="56" y="11" width="110" height="10" rx="5" fill="var(--f)" />
      <path d="M4 27.5h232" stroke="var(--l)" />
      <rect x="26" y="40" width="90" height="9" rx="4.5" fill="var(--a)" />
      <rect x="26" y="54" width="62" height="9" rx="4.5" fill="var(--a)" opacity="0.45" />
      <rect x="26" y="72" width="100" height="4" rx="2" fill="var(--l)" />
      <rect x="26" y="81" width="78" height="4" rx="2" fill="var(--l)" />
      <rect className="svc-cta" x="26" y="94" width="46" height="14" rx="7" fill="url(#svc-l1)" />
      <rect className="svc-ghost" x="78" y="94" width="34" height="14" rx="7" fill="none" stroke="var(--l)" />
      <g className="svc-float">
        <rect x="138" y="38" width="86" height="72" rx="10" fill="url(#svc-l1)" opacity="0.9" />
        <circle cx="198" cy="56" r="7" fill="url(#svc-l2)" />
        <path d="M138 100c14-22 26-26 38-10 8-10 16-14 30-6l18 16v10H148a10 10 0 0 1-10-10z" fill="#fff" opacity="0.25" />
      </g>
      <g clipPath="url(#svc-lclip)"><rect className="svc-sheen" x="-60" y="30" width="30" height="90" fill="#fff" opacity="0.18" transform="skewX(-20)" /></g>
    </Frame>
  );
}

const BARS = [26, 42, 34, 56, 46, 70, 62];
export function VisualApp() {
  const pts = BARS.map((h, i) => `${33 + i * 28},${100 - h - 8}`).join(' ');
  return (
    <Frame label="app">
      <defs>
        <Grad id="svc-a1" />
      </defs>
      <rect x="4" y="4" width="232" height="122" rx="12" fill="var(--s)" stroke="var(--l)" />
      <rect x="18" y="14" width="52" height="7" rx="3.5" fill="var(--l)" />
      <rect x="18" y="25" width="30" height="4" rx="2" fill="var(--f)" />
      <rect x="170" y="12" width="52" height="18" rx="9" fill="var(--f)" />
      <text x="196" y="24.5" textAnchor="middle" fontSize="9.5" fontWeight="600" fill="var(--a)" fontFamily="ui-monospace, monospace">+24%</text>
      <path d="M18 106h204" stroke="var(--l)" />
      {BARS.map((h, i) => (
        <rect
          key={i}
          className="svc-bar"
          style={{ '--d': `${i * 70}ms` }}
          x={24 + i * 28}
          y={106 - h}
          width="18"
          height={h}
          rx="4"
          fill={i === BARS.length - 1 ? 'url(#svc-a1)' : 'var(--a)'}
          opacity={i === BARS.length - 1 ? 1 : 0.28}
        />
      ))}
      <polyline className="svc-trend" points={pts} fill="none" stroke="var(--c)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" pathLength="100" />
      <circle className="svc-ping" cx="201" cy={100 - 70 - 8 + 0} r="3.5" fill="var(--c)" />
    </Frame>
  );
}

export function VisualShop() {
  return (
    <Frame label="shop">
      <defs>
        <Grad id="svc-s1" />
        <Grad id="svc-s2" b="var(--b)" a="var(--a)" />
      </defs>
      <rect x="14" y="10" width="92" height="110" rx="12" fill="var(--s)" stroke="var(--l)" />
      <rect x="22" y="18" width="76" height="56" rx="8" fill="url(#svc-s1)" opacity="0.9" />
      <circle cx="42" cy="36" r="6" fill="#fff" opacity="0.35" />
      <path d="M22 66l22-18 18 14 12-9 24 20v6H30a8 8 0 0 1-8-8z" fill="#fff" opacity="0.22" />
      <rect x="22" y="83" width="54" height="6" rx="3" fill="var(--l)" />
      <text x="22" y="109" fontSize="14" fontWeight="700" fill="var(--a)" fontFamily="ui-monospace, monospace">$48</text>
      <g className="svc-tag">
        <rect x="124" y="14" width="46" height="22" rx="6" fill="var(--c)" />
        <circle cx="132" cy="25" r="2.5" fill="var(--s)" />
        <text x="152" y="29" textAnchor="middle" fontSize="10" fontWeight="700" fill="#1b1b1b" fontFamily="ui-monospace, monospace">$48</text>
      </g>
      <g transform="translate(182 20) scale(2)" fill="none" stroke="var(--a)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="8" cy="21" r="1" />
        <circle cx="19" cy="21" r="1" />
        <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
      </g>
      <circle className="svc-drop" cx="213" cy="30" r="4" fill="url(#svc-s1)" />
      <g className="svc-pill">
        <rect x="124" y="82" width="100" height="28" rx="14" fill="url(#svc-s2)" />
        <text x="174" y="100" textAnchor="middle" fontSize="10.5" fontWeight="600" fill="#fff" fontFamily="ui-sans-serif, system-ui, sans-serif">Checkout</text>
      </g>
      <rect x="124" y="64" width="64" height="5" rx="2.5" fill="var(--l)" />
    </Frame>
  );
}

export function VisualBackend() {
  const mono = { fontFamily: 'ui-monospace, monospace' };
  return (
    <Frame label="backend">
      <rect x="10" y="40" width="50" height="44" rx="9" fill="var(--s)" stroke="var(--l)" />
      <path d="M10 52h50" stroke="var(--l)" />
      <circle cx="18" cy="46" r="1.6" fill="var(--l)" />
      <circle cx="24" cy="46" r="1.6" fill="var(--l)" />
      <rect x="18" y="60" width="26" height="4" rx="2" fill="var(--a)" opacity="0.5" />
      <rect x="18" y="69" width="34" height="4" rx="2" fill="var(--l)" />
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect x="96" y={26 + i * 25} width="48" height="20" rx="6" fill="var(--s)" stroke="var(--l)" />
          <circle className="svc-led" style={{ '--d': `${i * 400}ms` }} cx="106" cy={36 + i * 25} r="2.6" fill="var(--c)" />
          <rect x="114" y={34 + i * 25} width="22" height="4" rx="2" fill="var(--l)" />
        </g>
      ))}
      <path d="M180 42v42a22 8 0 0 0 44 0V42" fill="var(--s)" stroke="var(--l)" />
      <ellipse cx="202" cy="42" rx="22" ry="8" fill="var(--f)" stroke="var(--l)" />
      <path d="M180 56a22 8 0 0 0 44 0M180 70a22 8 0 0 0 44 0" fill="none" stroke="var(--l)" />
      <path className="svc-flow" d="M60 62H96" stroke="var(--a)" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 5" fill="none" />
      <path className="svc-flow" d="M144 62H180" stroke="var(--b)" strokeWidth="2" strokeLinecap="round" strokeDasharray="4 5" fill="none" />
      <circle className="svc-pulse svc-pulse-a" r="3.5" fill="var(--a)" />
      <circle className="svc-pulse svc-pulse-b" r="3.5" fill="var(--b)" />
      <text x="78" y="53" textAnchor="middle" fontSize="7.5" fill="var(--a)" style={mono}>GET</text>
      <text x="162" y="53" textAnchor="middle" fontSize="7.5" fill="var(--b)" style={mono}>SQL</text>
      <text x="120" y="118" textAnchor="middle" fontSize="8" fill="var(--a)" style={mono}>200 OK · 18ms</text>
    </Frame>
  );
}

export function VisualFrontend() {
  return (
    <Frame label="frontend">
      <defs>
        <Grad id="svc-f1" />
        <Grad id="svc-f2" a="var(--b)" b="var(--c)" />
      </defs>
      <g className="svc-dev svc-dev-desk">
        <rect x="10" y="12" width="150" height="98" rx="9" fill="var(--s)" stroke="var(--l)" />
        <path d="M10 26h150" stroke="var(--l)" />
        <circle cx="19" cy="19" r="2" fill="var(--l)" />
        <circle cx="26" cy="19" r="2" fill="var(--l)" />
        <rect x="18" y="34" width="28" height="68" rx="4" fill="var(--f)" />
        <rect x="54" y="34" width="98" height="30" rx="6" fill="url(#svc-f1)" opacity="0.85" />
        <rect x="54" y="72" width="46" height="30" rx="6" fill="var(--f)" />
        <rect x="106" y="72" width="46" height="30" rx="6" fill="var(--f)" />
      </g>
      <g className="svc-dev svc-dev-tab">
        <rect x="112" y="40" width="68" height="84" rx="9" fill="var(--s)" stroke="var(--l)" />
        <rect x="120" y="49" width="52" height="26" rx="5" fill="url(#svc-f2)" opacity="0.85" />
        <rect x="120" y="83" width="36" height="4" rx="2" fill="var(--l)" />
        <rect x="120" y="92" width="44" height="4" rx="2" fill="var(--l)" />
        <rect x="120" y="104" width="22" height="9" rx="4.5" fill="var(--a)" />
      </g>
      <g className="svc-dev svc-dev-phone">
        <rect x="186" y="54" width="42" height="70" rx="9" fill="var(--s)" stroke="var(--l)" strokeWidth="1.5" />
        <rect x="201" y="58" width="12" height="3" rx="1.5" fill="var(--l)" />
        <rect x="193" y="68" width="28" height="22" rx="5" fill="url(#svc-f1)" opacity="0.85" />
        <rect x="193" y="96" width="28" height="4" rx="2" fill="var(--l)" />
        <rect x="193" y="105" width="18" height="4" rx="2" fill="var(--l)" />
      </g>
    </Frame>
  );
}
