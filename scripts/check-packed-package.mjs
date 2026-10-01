import { execFileSync } from "node:child_process";
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const PACKAGE_NAME = "@okyrychenko-dev/react-effect-when";
const USE_CLIENT_DIRECTIVE = '"use client";';
const repositoryRoot = new URL("../", import.meta.url);
const repositoryPath = fileURLToPath(repositoryRoot);
const temporaryRoot = mkdtempSync(join(tmpdir(), "react-effect-when-package-"));
const tarballPath = join(temporaryRoot, "react-effect-when.tgz");
const extractRoot = join(temporaryRoot, "extract");
const consumerRoot = join(temporaryRoot, "consumer");

function run(command, args) {
  execFileSync(command, args, {
    cwd: repositoryRoot,
    stdio: "inherit",
  });
}

function invariant(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function listFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? listFiles(path) : [relative(join(extractRoot, "package"), path)];
  });
}

function packageRootName(specifier) {
  const segments = specifier.split("/");
  return specifier.startsWith("@") ? `${segments[0]}/${segments[1]}` : segments[0];
}

function externalPackages(contents) {
  const specifiers = [
    ...contents.matchAll(/\bfrom\s+["']([^"']+)["']/gu),
    ...contents.matchAll(/\bimport\s+["']([^"']+)["']/gu),
    ...contents.matchAll(/\bimport\s*\(\s*["']([^"']+)["']/gu),
    ...contents.matchAll(/\brequire\(["']([^"']+)["']\)/gu),
  ]
    .map((match) => match[1])
    .filter((specifier) => !specifier.startsWith(".") && !specifier.startsWith("/"))
    .map(packageRootName);

  return [...new Set(specifiers)].sort();
}

function stringLeaves(value) {
  if (typeof value === "string") {
    return [value];
  }

  if (typeof value !== "object" || value === null) {
    return [];
  }

  return Object.values(value).flatMap(stringLeaves);
}

function assertExportTargets(manifest, packageRoot) {
  const exportPaths = [
    ...stringLeaves(manifest.exports),
    manifest.main,
    manifest.module,
    manifest.types,
  ];

  for (const exportPath of exportPaths) {
    invariant(existsSync(join(packageRoot, exportPath)), `Missing exported file: ${exportPath}`);
  }
}

try {
  run("pnpm", ["pack", "--out", tarballPath]);
  mkdirSync(extractRoot, { recursive: true });
  mkdirSync(consumerRoot, { recursive: true });
  run("tar", ["-xzf", tarballPath, "-C", extractRoot]);

  const packageRoot = join(extractRoot, "package");
  const expectedFiles = [
    "CHANGELOG.md",
    "LICENSE",
    "README.md",
    "dist/index.cjs",
    "dist/index.cjs.map",
    "dist/index.d.cts",
    "dist/index.d.ts",
    "dist/index.js",
    "dist/index.js.map",
    "package.json",
  ];
  const packedFiles = listFiles(packageRoot).sort();

  invariant(
    JSON.stringify(packedFiles) === JSON.stringify(expectedFiles),
    `Unexpected packed files:\n${packedFiles.join("\n")}`
  );

  const manifest = JSON.parse(readFileSync(join(packageRoot, "package.json"), "utf8"));

  invariant(manifest.sideEffects === false, "Published package must remain side-effect free");
  invariant(
    JSON.stringify(manifest.peerDependencies) === JSON.stringify({ react: "^18.0.0 || ^19.0.0" }),
    "React must be the only published peer dependency"
  );
  invariant(
    Object.keys(manifest.dependencies ?? {}).length === 0,
    "Published package must not declare runtime dependencies"
  );
  invariant(
    Object.keys(manifest.optionalDependencies ?? {}).length === 0,
    "Published package must not declare optional runtime dependencies"
  );
  invariant(
    manifest.peerDependenciesMeta?.react?.optional !== true,
    "React must remain a required peer dependency"
  );

  const declaredRuntimePackages = [
    ...Object.keys(manifest.dependencies ?? {}),
    ...Object.keys(manifest.optionalDependencies ?? {}),
    ...Object.keys(manifest.peerDependencies ?? {}),
  ].sort();
  const importedRuntimePackages = [
    ...new Set(
      ["dist/index.js", "dist/index.cjs"].flatMap((file) =>
        externalPackages(readFileSync(join(packageRoot, file), "utf8"))
      )
    ),
  ].sort();

  invariant(
    JSON.stringify(importedRuntimePackages) === JSON.stringify(declaredRuntimePackages),
    `Built imports ${JSON.stringify(importedRuntimePackages)} do not match declared runtime packages ${JSON.stringify(declaredRuntimePackages)}`
  );

  assertExportTargets(manifest, packageRoot);

  for (const file of ["dist/index.js", "dist/index.cjs"]) {
    invariant(
      readFileSync(join(packageRoot, file), "utf8").startsWith(USE_CLIENT_DIRECTIVE),
      `${file} must begin with ${USE_CLIENT_DIRECTIVE}`
    );
  }

  writeFileSync(
    join(consumerRoot, "package.json"),
    JSON.stringify({ private: true, type: "module" })
  );
  writeFileSync(
    join(consumerRoot, "esm.mjs"),
    `import { useEffectWhen, useEffectWhenMatch, matchPredicate, matchPredicateFor } from "${PACKAGE_NAME}";\nfor (const exported of [useEffectWhen, useEffectWhenMatch, matchPredicate, matchPredicateFor]) {\n  if (typeof exported !== "function") throw new Error("ESM matching export unavailable");\n}\n`
  );
  writeFileSync(
    join(consumerRoot, "cjs.cjs"),
    `const { useEffectWhen, useEffectWhenMatch, matchPredicate, matchPredicateFor } = require("${PACKAGE_NAME}");\nfor (const exported of [useEffectWhen, useEffectWhenMatch, matchPredicate, matchPredicateFor]) {\n  if (typeof exported !== "function") throw new Error("CommonJS matching export unavailable");\n}\n`
  );

  const typeConsumer = readFileSync(join(repositoryPath, "scripts/package-consumer.typecheck.ts"));
  writeFileSync(join(consumerRoot, "consumer.mts"), typeConsumer);
  writeFileSync(join(consumerRoot, "consumer.cts"), typeConsumer);

  const consumerModules = join(consumerRoot, "node_modules");
  const installedPackage = join(consumerModules, ...PACKAGE_NAME.split("/"));
  mkdirSync(dirname(installedPackage), { recursive: true });
  mkdirSync(join(consumerModules, "@types"), { recursive: true });
  cpSync(packageRoot, installedPackage, { recursive: true });

  for (const packageName of ["@types/react", "react"]) {
    const target = join(repositoryPath, "node_modules", packageName);
    const link = join(consumerModules, packageName);
    mkdirSync(join(link, ".."), { recursive: true });
    symlinkSync(target, link, "dir");
  }

  run("node", [join(consumerRoot, "esm.mjs")]);
  run("node", [join(consumerRoot, "cjs.cjs")]);
  execFileSync(
    join(repositoryPath, "node_modules/.bin/tsc"),
    [
      "--noEmit",
      "--strict",
      "--skipLibCheck",
      "--module",
      "NodeNext",
      "--moduleResolution",
      "NodeNext",
      "--target",
      "ES2020",
      "consumer.mts",
      "consumer.cts",
    ],
    { cwd: consumerRoot, stdio: "inherit" }
  );
} finally {
  rmSync(temporaryRoot, { force: true, recursive: true });
}
