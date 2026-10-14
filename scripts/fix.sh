#!/usr/bin/env bash
# Turns the proposed library fix (fix/*.patch) on or off for this project.
set -euo pipefail

root="$(cd "$(dirname "$0")/.." && pwd)"
cd "$root"
patch_file="react-native-nano-icons@1.0.0.patch"

case "${1:-}" in
  on)
    mkdir -p patches
    cp "fix/$patch_file" "patches/$patch_file"
    node -e '
const fs = require("fs");
const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
pkg.patchedDependencies = {"react-native-nano-icons@1.0.0": "patches/'"$patch_file"'"};
fs.writeFileSync("package.json", JSON.stringify(pkg, null, 2) + "\n");
'
    ;;
  off)
    rm -rf patches
    node -e '
const fs = require("fs");
const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
delete pkg.patchedDependencies;
fs.writeFileSync("package.json", JSON.stringify(pkg, null, 2) + "\n");
'
    ;;
  *)
    echo "usage: scripts/fix.sh on|off" >&2
    exit 1
    ;;
esac

rm -rf node_modules/react-native-nano-icons
bun install --silent
echo "fix: $1"
