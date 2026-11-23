// `npm run dev:mock`: the dev server with the contact form pointed at the local mock Formspree service.
// Type "__fail__", "__slow__" or "__invalid__" in the message field to exercise the error and pending states.
import { astroBin, run } from "./lib/run.mjs";
import { startMock } from "../mocks/formspree-server.mjs";

const { url } = await startMock({ log: true });
console.log(`[mock-formspree] ${url}`);

const { code } = await run(process.execPath, [astroBin, "dev", ...process.argv.slice(2)], {
  env: { PUBLIC_FORM_ENDPOINT: `${url}/f/dev` },
});
process.exit(code);
