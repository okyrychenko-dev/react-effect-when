import { readFile, writeFile } from "node:fs/promises";
import { defineConfig } from "tsup";

const USE_CLIENT_DIRECTIVE = '"use client";\n';
const OUTPUT_FILES = ["dist/index.js", "dist/index.cjs"];

function prependSourceMapLine(sourceMap: unknown, file: string): unknown {
  if (
    typeof sourceMap !== "object" ||
    sourceMap === null ||
    !("mappings" in sourceMap) ||
    typeof sourceMap.mappings !== "string"
  ) {
    throw new TypeError(`Invalid source map emitted for ${file}`);
  }

  sourceMap.mappings = `;${sourceMap.mappings}`;

  return sourceMap;
}

async function prependUseClientDirective(file: string): Promise<void> {
  const contents = await readFile(file, "utf8");

  if (contents.startsWith(USE_CLIENT_DIRECTIVE)) {
    return;
  }

  await writeFile(file, USE_CLIENT_DIRECTIVE + contents);

  const sourceMapFile = `${file}.map`;
  const sourceMap: unknown = JSON.parse(await readFile(sourceMapFile, "utf8"));
  const shiftedSourceMap = prependSourceMapLine(sourceMap, sourceMapFile);

  await writeFile(sourceMapFile, `${JSON.stringify(shiftedSourceMap)}\n`);
}

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs", "esm"],
  dts: true,
  splitting: false,
  sourcemap: true,
  clean: true,
  external: ["react"],
  treeshake: true,
  minify: false,
  async onSuccess() {
    await Promise.all(OUTPUT_FILES.map(prependUseClientDirective));
  },
});
