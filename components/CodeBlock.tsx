"use client";

import { useState } from "react";

// A <pre> block with a copy-to-clipboard button. Used anywhere on the site
// that shows a literal command, script or config file the reader is meant
// to copy verbatim -- selecting text out of a <pre> by hand is fiddly on
// mobile especially, so this makes "copy/pasteable" actually mean
// one-click, not "select carefully and hope you got the whole thing".
export default function CodeBlock({
    code,
    className = "",
}: {
    code: string;
    className?: string;
}) {
    const [copied, setCopied] = useState(false);

    async function handleCopy() {
        try {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            // Clipboard API can be unavailable (insecure context, denied
            // permission, unsupported browser) -- fail quietly. The text is
            // still there to select by hand, so this isn't a dead end.
        }
    }

    return (
        <div className={`group relative ${className}`}>
            <pre className="overflow-x-auto rounded-lg bg-slate-900 p-4 pr-16 text-sm text-slate-200">
                {code}
            </pre>

            <button
                type="button"
                onClick={handleCopy}
                className="absolute right-2 top-2 rounded-md border border-slate-700 bg-slate-800 px-2 py-1 text-xs font-medium text-slate-300 opacity-80 hover:border-sky-500 hover:text-white hover:opacity-100"
            >
                {copied ? "Copied!" : "Copy"}
            </button>
        </div>
    );
}
