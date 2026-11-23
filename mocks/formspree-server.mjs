// Local stand-in for the Formspree endpoint, so the contact form can be developed and tested offline.
//
//   POST /f/<id>        records the submission (multipart or urlencoded) and answers like Formspree does
//   GET  /__requests    the submissions received so far (for assertions)
//   DELETE /__requests  clears them
//   GET  /health        readiness probe
//
// Behaviour is driven by the message text so tests can pick a path without extra setup:
//   "__fail__"  -> 500 {"error": "..."}      "__slow__" -> answers after 1.5 s      "__invalid__" -> 422
import { createServer } from "node:http";
import { pathToFileURL } from "node:url";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Accept, Content-Type",
};

function parseFields(contentType = "", body) {
  const fields = {};
  const boundary = /boundary=(?:"([^"]+)"|([^;]+))/i.exec(contentType);
  if (boundary) {
    const marker = `--${boundary[1] ?? boundary[2]}`;
    for (const part of body.split(marker)) {
      const match = /name="([^"]+)"\r\n\r\n([\s\S]*?)\r\n$/.exec(part);
      if (match) fields[match[1]] = match[2];
    }
  } else if (contentType.includes("application/x-www-form-urlencoded")) {
    for (const [key, value] of new URLSearchParams(body)) fields[key] = value;
  }
  return fields;
}

export function startMock({ port = 4010, host = "127.0.0.1", log = false } = {}) {
  const received = [];

  const server = createServer((req, res) => {
    const send = (status, payload) => {
      res.writeHead(status, { "Content-Type": "application/json", ...CORS });
      res.end(JSON.stringify(payload));
    };
    const url = new URL(req.url ?? "/", `http://${req.headers.host}`);

    if (req.method === "OPTIONS") return send(204, {});
    if (url.pathname === "/health") return send(200, { ok: true });
    if (url.pathname === "/__requests") {
      if (req.method === "DELETE") received.length = 0;
      return send(200, received);
    }

    if (req.method === "POST" && /^\/f\/[^/]+$/.test(url.pathname)) {
      let body = "";
      req.setEncoding("utf8");
      req.on("data", (chunk) => (body += chunk));
      req.on("end", () => {
        const fields = parseFields(req.headers["content-type"], body);
        received.push({ path: url.pathname, accept: req.headers.accept ?? "", fields });
        if (log) console.log(`[mock-formspree] ${url.pathname}`, fields);

        const message = fields.message ?? "";
        const reply = () => {
          if (message.includes("__fail__")) return send(500, { error: "Mock server failure" });
          if (message.includes("__invalid__") || !fields.email) return send(422, { error: "Invalid submission" });
          return send(200, { ok: true, next: "/thanks" });
        };
        if (message.includes("__slow__")) setTimeout(reply, 1500);
        else reply();
      });
      return;
    }

    send(404, { error: "Not found" });
  });

  return new Promise((resolve) => {
    server.listen(port, host, () => resolve({ server, received, url: `http://${host}:${port}` }));
  });
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const port = Number(process.env.MOCK_PORT ?? 4010);
  const { url } = await startMock({ port, log: true });
  console.log(`[mock-formspree] listening on ${url}  (POST ${url}/f/<id>)`);
}
