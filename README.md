# nano-icons web repro

Minimal Next.js 16.3.1 (webpack, App Router) + react-native-web 0.21.2 app that
renders icons from react-native-nano-icons 1.0.0. It reproduces the issues we hit
when the library's web renderer and CLI run in this kind of setup, and carries a
proposed fix for issues 1 to 4.

    bun install
    bun run icons          # builds the font from icons-src/

## Issues

| # | Issue | Command | Without the fix |
|---|-------|---------|-----------------|
| 1 | `__DEV__` is read as a bare global in the web renderer | `VARIANT=baseline bun run dev` | `ReferenceError: __DEV__ is not defined` in the server log |
| 2 | `require('./devServerFont')` inside an ESM file | `VARIANT=define-dev bun run dev` | `Cannot find module './devServerFont'` in the server log |
| 3 | Same as 1, in a production build | `VARIANT=baseline bun run build` | build succeeds but logs the `ReferenceError` while prerendering |
| 4 | The CLI parser assumes `getAttribute()` returns `null` for a missing attribute | `bun run icons:xmldom-0.8` | every layer colour is `rgba(0,0,0,NaN)` |
| 5 | Size and colour are inline styles, so CSS cannot set them | `bun run dev`, open `/web` | `.size-64` gives `12px`; a `color: red` parent gives `rgb(0, 0, 0)` |
| 6 | The web renderer needs `react-native` to build | `VARIANT=no-rn bun run build` | `Failed to compile`, import trace `lib/module/loadDynamicFont.js` |
| 7 | `memo` ignores accessibility props | `bun run dev`, open `/web` | after the label changes to `Second`, `aria-label` stays `First`; `aria-hidden` never appears |

For 1 to 3, open http://localhost:3000 once and read the server log. For 5 and 7
the `/web` page prints expected and actual values.

- **1 and 3**: nothing defines `__DEV__`, and Next.js does not.
- **2**: `__DEV__` is defined as a boolean (`DefinePlugin`), so the web renderer takes
  its dev-only branch. `lib/module` is ESM (`"type": "module"`), so webpack leaves
  that `require` untouched and Node cannot resolve it.
- **4**: `@xmldom/xmldom` 0.8 returns `""` for a missing attribute and `undefined`
  for a missing parent element, while 0.9 returns `null`. The library asks for
  `^0.9.10`, but a project can end up on 0.8, for example through `overrides`. The
  script builds the font in a throwaway copy of this project with
  `@xmldom/xmldom` pinned to 0.8.12 and prints the colours. On 0.9 (the default
  install here) `bun run icons` gives `black` and `rgba(0,0,0,0.5)` for
  `ic_opacity`.

The parser also loops over parent elements with `while (current !== null)`. That
only shows once the attribute check is fixed, so both have to change together.

- **5**: the renderer writes `width`, `height` and `font-size` from the `size`
  prop, and each layer's `color` from the glyphmap, as inline styles. A class
  cannot override them, so CSS cannot size an icon (including responsive sizes)
  or colour it through `currentColor`.
- **6**: `createNanoIconsSet.web.js` imports `loadDynamicFont.js`, which imports
  `Image` and `Platform` from `react-native`. Without the alias webpack parses the
  real `react-native` (installed here as a peer) and fails on its Flow syntax; a
  project without it fails with `Can't resolve 'react-native'`. With the alias,
  tree-shaking removes that code: the shipped JS is the same as with a two-line
  stub (269,502 vs 269,499 bytes gzipped).
- **7**: the `memo` comparator checks only `name`, `size`, `style`, `className`,
  `tintMode` and `color`. A change to `accessibilityLabel`, `accessible`,
  `accessibilityRole` or `testID` alone never reaches the DOM.

There is no proposed fix for 5 to 7 yet.

## Proposed fix

`fix/react-native-nano-icons@1.0.0.patch` guards every `__DEV__` with
`typeof __DEV__ !== 'undefined'`, loads `devServerFont.web.js` with `import()`
instead of `require`, and reads attributes through `hasAttribute` with
`while (current)` in the parser.

    bun run fix:on         # applies it with bun patch
    bun run icons:xmldom-0.8:fixed
    bun run fix:off        # back to the published package

With the fix on, commands 1 to 3 run without errors and `icons:xmldom-0.8:fixed`
prints `black` and `rgba(0,0,0,0.5)`.

## Note

`glyphMap.m.f` carries a build hash (for example `ReproIcons-32c8d6dd`), and the
README says that on web the family is the name without it. `app/Icon.web.tsx`
registers the font under the plain name; registering `glyphMap.m.f` as is leaves
the icons as empty boxes.
