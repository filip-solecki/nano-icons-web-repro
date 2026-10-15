"use client";

import {useEffect, useRef, useState} from "react";

import {NanoIcon} from "../Icon";

type Row = {actual: string; case: string; expected: string};

const layerOf = (root: HTMLElement | null) =>
    root?.querySelector<HTMLElement>("span[aria-hidden]") ?? null;

export function Checks() {
    const sized = useRef<HTMLSpanElement>(null);
    const inherited = useRef<HTMLSpanElement>(null);
    const relabelled = useRef<HTMLSpanElement>(null);
    const hidden = useRef<HTMLSpanElement>(null);
    const [label, setLabel] = useState("First");
    const [accessible, setAccessible] = useState(true);
    const [rows, setRows] = useState<Row[]>([]);

    useEffect(() => {
        setLabel("Second");
        setAccessible(false);
    }, []);

    useEffect(() => {
        if (label !== "Second") {
            return;
        }
        const sizedIcon = sized.current?.firstElementChild as HTMLElement;
        const relabelledIcon = relabelled.current?.firstElementChild;
        const hiddenIcon = hidden.current?.firstElementChild;

        setRows([
            {
                case: "5a: width from className .size-64",
                expected: "64px",
                actual: getComputedStyle(sizedIcon).width,
            },
            {
                case: "5b: glyph font-size from className .size-64",
                expected: "64px",
                actual: getComputedStyle(layerOf(sizedIcon)!).fontSize,
            },
            {
                case: "5c: colour inherited from parent (color: red)",
                expected: "rgb(255, 0, 0)",
                actual: getComputedStyle(layerOf(inherited.current)!).color,
            },
            {
                case: "7a: aria-label after accessibilityLabel changes",
                expected: "Second",
                actual: relabelledIcon?.getAttribute("aria-label") ?? "(none)",
            },
            {
                case: "7b: aria-hidden after accessible becomes false",
                expected: "true",
                actual: hiddenIcon?.getAttribute("aria-hidden") ?? "(none)",
            },
        ]);
    }, [label]);

    return (
        <>
            <style>{`.size-64 { width: 64px; height: 64px; font-size: 64px; }`}</style>
            <p style={{display: "flex", gap: 12}}>
                <span ref={sized}>
                    <NanoIcon className="size-64" name="ic_star" />
                </span>
                <span ref={inherited} style={{color: "red"}}>
                    <NanoIcon name="ic_star" />
                </span>
                <span ref={relabelled}>
                    <NanoIcon accessibilityLabel={label} name="ic_circle" />
                </span>
                <span ref={hidden}>
                    <NanoIcon
                        accessibilityLabel="Hidden"
                        accessible={accessible}
                        name="ic_square"
                    />
                </span>
            </p>
            <table data-testid="checks">
                <thead>
                    <tr>
                        <th>Case</th>
                        <th>Expected</th>
                        <th>Actual</th>
                    </tr>
                </thead>
                <tbody>
                    {rows.map((row) => (
                        <tr key={row.case}>
                            <td>{row.case}</td>
                            <td>{row.expected}</td>
                            <td>{row.actual}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </>
    );
}
