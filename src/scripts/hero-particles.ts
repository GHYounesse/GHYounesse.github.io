import { Renderer, Program, Mesh, Geometry } from "ogl";
import { vertex, fragment } from "./hero-particles-shaders";
import { isSoftwareRenderer, rendererName } from "./gpu";
import { hexToRgb, palettes, themeFromAttribute } from "./shader-palette";

export function initHeroParticles(hero: HTMLElement) {
  const canvas = document.createElement("canvas");
  canvas.className = "hero-particles";
  canvas.setAttribute("aria-hidden", "true");
  hero.insertBefore(canvas, hero.querySelector(".hero-copy"));

  const root = document.documentElement;
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

  let renderer: Renderer;
  try {
    renderer = new Renderer({ canvas, alpha: true, premultipliedAlpha: false, antialias: false, dpr });
  } catch {
    canvas.remove();
    return;
  }
  const gl = renderer.gl;
  if (isSoftwareRenderer(rendererName(gl))) {
    // No real GPU: thousands of blended points would starve the main thread, so skip the layer.
    canvas.remove();
    return;
  }
  gl.clearColor(0, 0, 0, 0);

  const count = window.innerWidth < 1100 ? 1400 : 3200;
  const position = new Float32Array(count * 3);
  const seed = new Float32Array(count * 4);
  for (let i = 0; i < count; i++) {
    position.set([Math.random(), Math.random(), Math.random()], i * 3);
    seed.set([Math.random(), Math.random(), Math.random(), Math.random()], i * 4);
  }

  const program = new Program(gl, {
    vertex,
    fragment,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    uniforms: {
      uTime: { value: 0 },
      uRes: { value: [1, 1] },
      uMouse: { value: [0.5, 0.5] },
      uPush: { value: 0 },
      uDpr: { value: renderer.dpr },
      uA: { value: [1, 1, 1] },
      uB: { value: [1, 1, 1] },
    },
  });
  program.setBlendFunc(gl.SRC_ALPHA, gl.ONE);
  const mesh = new Mesh(gl, {
    mode: gl.POINTS,
    geometry: new Geometry(gl, { position: { size: 3, data: position }, seed: { size: 4, data: seed } }),
    program,
  });

  const applyPalette = () => {
    const p = palettes[themeFromAttribute(root.getAttribute("data-theme"))];
    program.uniforms.uA.value = hexToRgb(p.a);
    program.uniforms.uB.value = hexToRgb(p.b);
  };
  applyPalette();
  new MutationObserver(applyPalette).observe(root, { attributes: true, attributeFilter: ["data-theme"] });

  const resize = () => {
    const { width, height } = hero.getBoundingClientRect();
    renderer.setSize(width, height);
    program.uniforms.uRes.value = [width, height];
  };
  resize();
  new ResizeObserver(resize).observe(hero);

  const target = [0.5, 0.5];
  const mouse = [0.5, 0.5];
  let push = 0;
  window.addEventListener(
    "pointermove",
    (e) => {
      const r = hero.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = 1 - (e.clientY - r.top) / r.height;
      push = Math.min(1, push + Math.hypot(x - target[0], y - target[1]) * 6);
      target[0] = x;
      target[1] = y;
    },
    { passive: true },
  );

  let visible = true;
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
  }).observe(hero);

  canvas.classList.add("ready");
  const loop = (ms: number) => {
    requestAnimationFrame(loop);
    if (!visible || document.hidden) return;
    mouse[0] += (target[0] - mouse[0]) * 0.12;
    mouse[1] += (target[1] - mouse[1]) * 0.12;
    push *= 0.92;
    program.uniforms.uMouse.value = mouse;
    program.uniforms.uPush.value = push;
    program.uniforms.uTime.value = ms * 0.001;
    renderer.render({ scene: mesh });
  };
  requestAnimationFrame(loop);
}
