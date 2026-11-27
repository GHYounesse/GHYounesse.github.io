/** True for CPU-rendered WebGL (SwiftShader, llvmpipe, "Software Renderer"): too slow for always-on effects. */
export function isSoftwareRenderer(rendererName: string): boolean {
  return /swiftshader|llvmpipe|software|basic render/i.test(rendererName);
}

/** The GPU name the browser reports for this context, or "" when it hides it. */
export function rendererName(gl: WebGLRenderingContext | WebGL2RenderingContext): string {
  const info = gl.getExtension("WEBGL_debug_renderer_info");
  return info ? String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL)) : "";
}
