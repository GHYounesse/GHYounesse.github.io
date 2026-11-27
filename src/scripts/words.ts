/** Splits a paragraph into one span per word (for the "words light up" effect) and returns the spans. */
export function splitWords(p: HTMLElement): HTMLElement[] {
  const text = p.textContent ?? "";
  p.setAttribute("aria-label", text);
  p.textContent = "";
  return text
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => {
      const span = document.createElement("span");
      span.className = "word";
      span.setAttribute("aria-hidden", "true");
      span.textContent = word + " ";
      p.appendChild(span);
      return span;
    });
}
