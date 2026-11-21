// Thin wrapper so `npm run dev|build|preview|typecheck` work from any Windows terminal (see lib/cwd.mjs).
import { astroBin, run } from "./lib/run.mjs";

const { code } = await run(process.execPath, [astroBin, ...process.argv.slice(2)]);
process.exit(code);
