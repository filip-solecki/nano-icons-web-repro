#!/usr/bin/env bash
# Builds the icon font in a throwaway copy of this project with @xmldom/xmldom
# pinned to 0.8.12 and prints the layer colours the CLI wrote.
# FIX=1 also applies the proposed library fix (fix/*.patch).
set -euo pipefail

src="$(cd "$(dirname "$0")/.." && pwd)"
tmp="$(mktemp -d)"
trap 'rm -rf "$tmp"' EXIT

cp -R "$src/icons-src" "$src/.nanoicons.json" "$src/package.json" "$tmp/"
cd "$tmp"

patch_file="react-native-nano-icons@1.0.0.patch"
if [ "${FIX:-}" = "1" ]; then
  mkdir patches
  cp "$src/fix/$patch_file" "patches/$patch_file"
fi

node -e '
const fs = require("fs");
const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
pkg.overrides = {"@xmldom/xmldom": "0.8.12"};
delete pkg.patchedDependencies;
if (process.env.FIX === "1") {
  pkg.patchedDependencies = {"react-native-nano-icons@1.0.0": "patches/react-native-nano-icons@1.0.0.patch"};
}
fs.writeFileSync("package.json", JSON.stringify(pkg, null, 2));
'

bun install --silent
echo "xmldom: $(node -p 'require("@xmldom/xmldom/package.json").version')"
bun run icons
node -e '
const map = require("./assets/ReproIcons.glyphmap.json");
for (const [name, [, layers]] of Object.entries(map.i)) {
  console.log(name.padEnd(12), layers.map(([, colour]) => colour).join(" "));
}
'
