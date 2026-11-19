/** Terminal mode: prints a short boot log at the top of the hero window. */

const copy = document.querySelector<HTMLElement>(".hero-copy");

if (copy) {
  const fr = document.documentElement.lang === "fr";
  const lines = fr
    ? ["chargement du profil…", "montage de /projets", "connexion au réseau…", "prêt."]
    : ["loading profile…", "mounting /projects", "connecting to the network…", "ready."];

  const list = document.createElement("ul");
  list.className = "boot-log";
  list.setAttribute("aria-hidden", "true"); // decorative; the real content follows

  lines.forEach((text, i) => {
    const li = document.createElement("li");
    li.style.setProperty("--n", String(i));
    const ok = document.createElement("span");
    ok.className = "ok";
    ok.textContent = "OK";
    li.append("[ ", ok, " ] ", text);
    list.appendChild(li);
  });

  copy.prepend(list);
}
