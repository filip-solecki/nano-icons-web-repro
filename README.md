# nano-icons web repro

Minimal Next.js 16.3.1 (webpack, App Router) + react-native-web 0.21.2 app that
renders icons from react-native-nano-icons 1.0.0. It reproduces two issues in the
library's web renderer when it runs under Next.js in dev.

    bun install
    bun run icons                      # builds the font from icons-src/
    VARIANT=baseline bun run dev       # ReferenceError: __DEV__ is not defined
    VARIANT=define-dev bun run dev     # Cannot find module './devServerFont'
    VARIANT=baseline bun run build     # logs the ReferenceError during prerender

Open http://localhost:3000 once, then check the server log.

## What the variants mean

- `baseline`: nothing defines `__DEV__` (Next.js does not).
- `define-dev`: `DefinePlugin({__DEV__: dev})`, a common way to provide it. Then
  the web renderer's `require('./devServerFont')` is left untouched by webpack,
  because `lib/module` is ESM (`"type": "module"`), and Node cannot resolve it.

## Proposed library fix

`patches/react-native-nano-icons@1.0.0.patch` (applied by bun) guards every
`__DEV__` with `typeof __DEV__ !== 'undefined'` and loads `devServerFont.web.js`
with `import()` instead of `require`. With it all three commands run clean.

## Separate issue: SVG colours become `NaN`

The CLI parser expects `getAttribute()` to return `null` for a missing attribute.
`@xmldom/xmldom` 0.8 returns `""` (and `undefined` for a missing parent), so with
xmldom pinned to 0.8 (for example through `overrides`) every glyph is written with
the colour `rgba(0,0,0,NaN)`. To reproduce, add
`"overrides": {"@xmldom/xmldom": "0.8.12"}` to `package.json`, run `bun install`
and `bun run icons`, then look at `assets/ReproIcons.glyphmap.json`.
