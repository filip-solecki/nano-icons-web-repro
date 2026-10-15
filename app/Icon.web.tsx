"use client";

import {createNanoIconSet} from "react-native-nano-icons";

import glyphMap from "../assets/ReproIcons.glyphmap.json";
import fontUrl from "../assets/ReproIcons.ttf";

// The web renderer only draws glyphs of a font the page already provides, so
// the app registers the bundled TTF itself. The glyphmap stores the family with
// a content hash suffix, while the rendered spans use the unsuffixed name.
if (typeof document !== "undefined" && typeof FontFace !== "undefined") {
    const family = glyphMap.m.f.replace(/-[0-9a-f]{8}$/, "");
    const face = new FontFace(family, `url(${fontUrl})`);

    face.load()
        .then(() => document.fonts.add(face))
        .catch(() => undefined);
}

export const NanoIcon = createNanoIconSet(glyphMap);

export type IconName = "ic_circle" | "ic_opacity" | "ic_square" | "ic_star";

export const Icon = ({name, size = 32}: {name: IconName; size?: number}) => (
    <NanoIcon name={name} size={size} color="#013369" />
);
