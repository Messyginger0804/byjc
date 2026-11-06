// GLSL as template strings (no loaders, no remote assets, CSP friendly).
// Brand colors are authored in sRGB and written straight to the framebuffer.

const hex = (h) => {
  const n = parseInt(h.slice(1), 16);
  const f = (v) => (v / 255).toFixed(4);
  return `vec3(${f((n >> 16) & 255)}, ${f((n >> 8) & 255)}, ${f(n & 255)})`;
};

const BRAND = `
const vec3 C_BLUE   = ${hex('#3568bd')};
const vec3 C_BRIGHT = ${hex('#6b9bff')};
const vec3 C_VIOLET = ${hex('#8b5cf6')};
const vec3 C_AMBER  = ${hex('#ffdb4d')};
const vec3 C_CORAL  = ${hex('#ff7a59')};
const vec3 C_DEEP   = ${hex('#0b1030')};

// Thin-film style palette: blue -> violet -> (rare) coral -> amber, ping-pong
// so it never wraps through a muddy amber/blue blend.
vec3 filmPalette(float x, float lightMode) {
  float tri = abs(fract(x) * 2.0 - 1.0);
  tri = pow(tri, 1.35) * 3.0;
  vec3 b = mix(C_BRIGHT, C_BLUE, lightMode * 0.7);
  vec3 c;
  if (tri < 1.0) {
    c = mix(b, C_VIOLET, smoothstep(0.0, 1.0, tri));
  } else if (tri < 2.0) {
    c = mix(C_VIOLET, C_CORAL, smoothstep(1.0, 2.0, tri));
  } else {
    c = mix(C_CORAL, C_AMBER, smoothstep(2.0, 3.0, tri));
  }
  return c;
}
`;

const SIMPLEX = `
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
            i.z + vec4(0.0, i1.z, i2.z, 1.0))
          + i.y + vec4(0.0, i1.y, i2.y, 1.0))
          + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}
`;

export const orbVertex = `
uniform float uTime;
uniform vec2 uPointer;
uniform float uRadius;
uniform float uDistort;

varying vec3 vNormal;
varying vec3 vViewPos;
varying float vNoise;

${SIMPLEX}

// Domain-warped displacement field on the unit sphere, roughly in [-1, 1].
float field(vec3 d) {
  vec3 p = d * 1.25 + vec3(0.0, uTime * 0.12, uTime * 0.05);
  float q = snoise(p + vec3(3.1, 1.7, 8.3));
  float n = snoise(p + vec3(q * 0.9, -q * 0.6, q * 0.75));
  float fine = snoise(p * 2.2 - vec3(q * 0.5) + vec3(0.0, -uTime * 0.18, 0.0));
  return n * 0.78 + fine * 0.22;
}

void main() {
  vec3 n0 = normalize(position);

  // Pointer proximity in view space: surface facing the cursor swells more.
  vec3 vn0 = normalize(normalMatrix * n0);
  vec3 toPointer = normalize(vec3(uPointer * 1.1, 0.65));
  float near = smoothstep(0.15, 1.0, dot(vn0, toPointer));
  float amp = (0.15 + 0.24 * near) * uDistort;

  // Finite-difference normal from two tangent neighbours.
  vec3 up = abs(n0.y) < 0.99 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0);
  vec3 t = normalize(cross(up, n0));
  vec3 b = cross(n0, t);
  const float e = 0.03;
  vec3 d1 = normalize(n0 + t * e);
  vec3 d2 = normalize(n0 + b * e);

  float f0 = field(n0);
  float f1 = field(d1);
  float f2 = field(d2);

  vec3 p0 = n0 * uRadius * (1.0 + amp * f0);
  vec3 p1 = d1 * uRadius * (1.0 + amp * f1);
  vec3 p2 = d2 * uRadius * (1.0 + amp * f2);
  vec3 nrm = normalize(cross(p1 - p0, p2 - p0));

  vec4 mv = modelViewMatrix * vec4(p0, 1.0);
  vViewPos = mv.xyz;
  vNormal = normalize(normalMatrix * nrm);
  vNoise = f0;
  gl_Position = projectionMatrix * mv;
}
`;

export const orbFragment = `
uniform float uTime;
uniform float uTheme;   // 0 = light, 1 = dark
uniform float uOpacity;

varying vec3 vNormal;
varying vec3 vViewPos;
varying float vNoise;

${BRAND}

void main() {
  vec3 N = normalize(vNormal);
  vec3 V = normalize(-vViewPos);
  float ndv = clamp(dot(N, V), 0.0, 1.0);
  float fres = pow(1.0 - ndv, 2.4);

  vec3 L = normalize(vec3(-0.5, 0.7, 0.6));
  float diff = clamp(dot(N, L) * 0.5 + 0.5, 0.0, 1.0);
  vec3 H = normalize(L + V);
  float spec = pow(max(dot(N, H), 0.0), 70.0);

  // Hue is driven by view angle + surface noise, like interference in a thin film.
  float film = ndv * 1.1 + vNoise * 0.55 + uTime * 0.04 + N.y * 0.25;

  // Dark: luminous glass on ink.
  vec3 fd = filmPalette(film, 0.0);
  vec3 core = mix(C_DEEP, C_BLUE, diff * 0.75 + 0.1);
  vec3 dark = core * (0.55 + 0.6 * diff);
  dark = mix(dark, fd, 0.28 + 0.55 * fres);
  dark += fd * pow(1.0 - ndv, 4.0) * 0.55;
  dark += C_BRIGHT * pow(ndv, 3.0) * 0.14;
  dark += vec3(1.0) * spec * 0.65;

  // Light: soft pastel iridescence with deeper edges so it reads on paper.
  vec3 fl = filmPalette(film, 1.0);
  vec3 pastel = mix(vec3(1.0), fl, 0.5);
  vec3 lite = mix(pastel * (0.82 + 0.22 * diff), fl * 0.92, fres * 0.65);
  lite += vec3(1.0) * spec * 0.5;

  vec3 col = clamp(mix(lite, dark, uTheme), 0.0, 1.0);
  gl_FragColor = vec4(col, uOpacity);
}
`;

export const particleVertex = `
uniform float uTime;
uniform float uPx;
uniform float uSize;

attribute float aRadius;
attribute float aAngle;
attribute float aHeight;
attribute float aSpeed;
attribute float aSeed;

varying float vSeed;
varying float vTwinkle;
varying float vFade;

void main() {
  float a = aAngle + uTime * aSpeed;
  float y = aHeight + sin(uTime * 0.4 + aSeed * 6.2831) * 0.06;
  vec3 pos = vec3(cos(a) * aRadius, y, sin(a) * aRadius);

  vec4 mv = modelViewMatrix * vec4(pos, 1.0);
  gl_Position = projectionMatrix * mv;

  float size = (0.45 + aSeed * 1.1);
  gl_PointSize = max(1.0, size * uSize * uPx * (5.0 / -mv.z));

  vSeed = aSeed;
  vTwinkle = 0.65 + 0.35 * sin(uTime * (0.6 + aSeed * 1.4) + aSeed * 40.0);
  vFade = smoothstep(4.4, 1.9, aRadius) * 0.6 + 0.4;
}
`;

export const particleFragment = `
uniform float uTheme;
uniform float uOpacity;

varying float vSeed;
varying float vTwinkle;
varying float vFade;

${BRAND}

void main() {
  float d = length(gl_PointCoord - 0.5) * 2.0;
  float soft = 1.0 - smoothstep(0.0, 1.0, d);
  soft *= soft;
  if (soft < 0.01) discard;

  vec3 dark = filmPalette(vSeed * 0.9 + 0.05, 0.0);
  dark = mix(dark, vec3(1.0), 0.25 * (1.0 - d));
  vec3 lite = mix(C_BLUE, C_VIOLET, vSeed);

  vec3 col = mix(lite, dark, uTheme);
  float alpha = soft * vTwinkle * vFade * mix(0.9, 0.85, uTheme) * uOpacity;
  gl_FragColor = vec4(col, alpha);
}
`;

export const glowVertex = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const glowFragment = `
uniform float uTime;
uniform float uTheme;
uniform float uOpacity;
varying vec2 vUv;

${BRAND}

void main() {
  vec2 p = vUv - 0.5;
  float r = length(p) * 2.0;
  float falloff = pow(clamp(1.0 - r, 0.0, 1.0), 2.4);
  float swirl = 0.5 + 0.5 * sin(atan(p.y, p.x) * 2.0 + uTime * 0.25);
  vec3 dark = mix(C_BLUE, C_VIOLET, swirl * 0.8);
  dark = mix(dark, C_AMBER, smoothstep(0.55, 1.0, swirl) * 0.18);
  vec3 lite = mix(C_BRIGHT, C_VIOLET, swirl);
  vec3 col = mix(lite, dark, uTheme);
  float alpha = falloff * mix(0.22, 0.4, uTheme) * uOpacity;
  gl_FragColor = vec4(col, alpha);
}
`;
