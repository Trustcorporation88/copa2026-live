import esbuild from "esbuild";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const pkg = require("./package.json");

// Bundle workspace packages (TypeScript sources). Keep npm deps external for pino/express.
const external = Object.keys(pkg.dependencies ?? {}).filter(
  (name) => !name.startsWith("@workspace/"),
);

await esbuild.build({
  entryPoints: ["src/index.ts"],
  bundle: true,
  platform: "node",
  target: "node20",
  format: "esm",
  outfile: "dist/index.mjs",
  packages: "bundle",
  external,
  sourcemap: true,
});
