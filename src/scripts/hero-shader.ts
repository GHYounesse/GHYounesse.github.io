import { Renderer, Program, Mesh, Triangle } from "ogl";
import { hexToRgb, palettes, themeFromAttribute } from "./shader-palette";

const vertex = /* glsl */ `
  attribute vec2 position;
  attribute vec2 uv;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 0.0, 1.0);
  }
`;

// Domain-warped fractal noise, tinted by two accent colours, with a glow that follows the cursor.
const fragment = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform vec2 uRes;
  uniform vec2 uMouse;
  uniform vec3 uBg;
  uniform vec3 uA;
  uniform vec3 uB;
  uniform float uStrength;

  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    float a = hash(i), b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0)), d = hash(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x) + (d - b) * u.x * u.y;
  }
  float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 5; i++) { v += a * noise(p); p *= 2.0; a *= 0.5; }
    return v;
  }

  void main() {
    float aspect = uRes.x / uRes.y;
    vec2 p = (vUv - 0.5) * vec2(aspect, 1.0) * 2.2;
    vec2 m = (uMouse - 0.5) * vec2(aspect, 1.0) * 2.2;
    float t = uTime * 0.08;

    vec2 q = vec2(fbm(p + t), fbm(p + vec2(5.2, 1.3) - t));
    vec2 r = vec2(fbm(p + 3.0 * q + vec2(1.7, 9.2) + t * 1.5), fbm(p + 3.0 * q + vec2(8.3, 2.8) - t));
    float f = fbm(p + 3.0 * r);

    float d = length(p - m);
    float glow = exp(-d * d * 1.6);

    vec3 col = mix(uBg, uA, smoothstep(0.25, 0.95, f) * 0.9);
    col = mix(col, uB, smoothstep(0.35, 1.0, length(q)) * 0.6 * (1.0 - vUv.x * 0.3));
    col += uA * glow * 0.3;
    col = mix(uBg, col, uStrength);
    col *= 1.0 - 0.35 * length(vUv - 0.5); // vignette
    gl_FragColor = vec4(col, 1.0);
  }
`;

export function initHeroShader(canvas: HTMLCanvasElement, opts: { animate: boolean }) {
  const hero = canvas.parentElement as HTMLElement;
  const root = document.documentElement;

  let renderer: Renderer;
  try {
    renderer = new Renderer({
      canvas,
      alpha: false,
      antialias: false,
      dpr: Math.min(window.devicePixelRatio || 1, window.innerWidth < 700 ? 1 : 1.5),
    });
  } catch {
    // No WebGL: the CSS gradient fallback on .hero stays visible.
    canvas.remove();
    return;
  }

  const gl = renderer.gl;
  const program = new Program(gl, {
    vertex,
    fragment,
    uniforms: {
      uTime: { value: 0 },
      uRes: { value: [1, 1] },
      uMouse: { value: [0.7, 0.5] },
      uBg: { value: [0, 0, 0] },
      uA: { value: [0, 0, 0] },
      uB: { value: [0, 0, 0] },
      uStrength: { value: 1 },
    },
  });
  const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });

  const applyPalette = () => {
    const p = palettes[themeFromAttribute(root.getAttribute("data-theme"))];
    program.uniforms.uBg.value = hexToRgb(p.bg);
    program.uniforms.uA.value = hexToRgb(p.a);
    program.uniforms.uB.value = hexToRgb(p.b);
    program.uniforms.uStrength.value = p.strength;
  };
  applyPalette();

  const resize = () => {
    const { width, height } = hero.getBoundingClientRect();
    renderer.setSize(width, height);
    program.uniforms.uRes.value = [gl.canvas.width, gl.canvas.height];
  };
  resize();
  new ResizeObserver(resize).observe(hero);

  const draw = (t: number) => {
    program.uniforms.uTime.value = t;
    renderer.render({ scene: mesh });
  };
  draw(0);
  // The shader starts after the page has loaded, so it fades in over the CSS gradient behind it.
  canvas.classList.add("ready");

  // Theme changes swap the palette (and repaint once if we're not animating).
  new MutationObserver(() => {
    applyPalette();
    if (!opts.animate) draw(0);
  }).observe(root, { attributes: true, attributeFilter: ["data-theme"] });

  if (!opts.animate) return;

  // Cursor glow, eased toward the pointer.
  const target = [0.7, 0.5];
  const current = [0.7, 0.5];
  window.addEventListener(
    "pointermove",
    (e) => {
      const r = hero.getBoundingClientRect();
      target[0] = (e.clientX - r.left) / r.width;
      target[1] = 1 - (e.clientY - r.top) / r.height;
    },
    { passive: true },
  );

  // Only render while the hero is on screen and the tab is visible.
  let visible = true;
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
  }).observe(hero);

  const loop = (ms: number) => {
    requestAnimationFrame(loop);
    if (!visible || document.hidden) return;
    current[0] += (target[0] - current[0]) * 0.06;
    current[1] += (target[1] - current[1]) * 0.06;
    program.uniforms.uMouse.value = current;
    draw(ms * 0.001);
  };
  requestAnimationFrame(loop);
}
