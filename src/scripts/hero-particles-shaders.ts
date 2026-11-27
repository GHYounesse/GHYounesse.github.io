/** GLSL for the hero particle layer. Kept apart from the setup code in hero-particles.ts. */
// Every particle's motion is computed in the vertex shader from a few random seeds, so the CPU
// only uploads the pointer. Particles drift on a slow noise field and are pushed away from the
// cursor with a soft falloff; the push is scaled by how fast the pointer is moving.
export const vertex = /* glsl */ `
  attribute vec3 position; // home position in 0..1 hero space, z = depth layer
  attribute vec4 seed;
  uniform float uTime;
  uniform vec2 uRes;
  uniform vec2 uMouse;
  uniform float uPush;
  uniform float uDpr;
  varying float vAlpha;
  varying float vMix;

  void main() {
    float t = uTime * (0.05 + seed.w * 0.08);
    vec2 p = position.xy;
    p += 0.035 * vec2(sin(t * 6.28 + seed.x * 40.0), cos(t * 6.28 + seed.y * 40.0));

    float aspect = uRes.x / uRes.y;
    vec2 d = (p - uMouse) * vec2(aspect, 1.0);
    float dist = length(d);
    float falloff = exp(-dist * dist * 22.0);
    p += normalize(d + 1e-4) * falloff * (0.05 + uPush * 0.22) / vec2(aspect, 1.0);

    gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
    gl_PointSize = (1.2 + seed.z * 2.6 + falloff * 3.0) * uDpr * (0.6 + position.z * 0.8);
    vAlpha = 0.25 + seed.z * 0.55 + falloff * 0.4;
    vMix = seed.x;
  }
`;

export const fragment = /* glsl */ `
  precision mediump float;
  uniform vec3 uA;
  uniform vec3 uB;
  varying float vAlpha;
  varying float vMix;
  void main() {
    float r = length(gl_PointCoord - 0.5) * 2.0;
    float a = (1.0 - smoothstep(0.0, 1.0, r)) * vAlpha;
    gl_FragColor = vec4(mix(uA, uB, vMix), a);
  }
`;
