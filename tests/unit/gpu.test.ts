import { describe, expect, it } from "vitest";
import { isSoftwareRenderer } from "../../src/scripts/gpu";

describe("isSoftwareRenderer", () => {
  it("flags CPU renderers", () => {
    expect(isSoftwareRenderer("ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero)), SwiftShader driver)")).toBe(
      true,
    );
    expect(isSoftwareRenderer("llvmpipe (LLVM 15.0.7, 256 bits)")).toBe(true);
    expect(isSoftwareRenderer("Microsoft Basic Render Driver")).toBe(true);
  });
  it("lets real GPUs and unknown names through", () => {
    expect(isSoftwareRenderer("ANGLE (NVIDIA, NVIDIA GeForce RTX 3060 Direct3D11 vs_5_0 ps_5_0)")).toBe(false);
    expect(isSoftwareRenderer("Apple M2")).toBe(false);
    expect(isSoftwareRenderer("")).toBe(false);
  });
});
