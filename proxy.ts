import { NextRequest, NextResponse } from "next/server";
import { SITE_URL } from "@/lib/site";

// Defense-in-depth for the old "servermeup.co.uk" domain: if a request
// ever arrives here with that Host header (e.g. DNS for the old domain
// still points at this same deployment), permanently redirect to the
// equivalent selfservr.com URL, preserving the path and query string.
//
// This is a fallback, not the primary mechanism -- the correct place to
// redirect a genuinely separate domain is DNS/Cloudflare (see the README
// or deployment notes for the exact rule), since that avoids this
// deployment ever needing to see the request at all. This only helps if
// servermeup.co.uk's DNS happens to resolve here; it can't create a
// redirect loop, since the target (SITE_URL) is a different host than the
// one this check matches.
const OLD_HOSTS = new Set(["servermeup.co.uk", "www.servermeup.co.uk"]);

export function proxy(request: NextRequest) {
    const host = request.headers.get("host")?.toLowerCase() ?? "";

    if (OLD_HOSTS.has(host)) {
        const destination = new URL(
            `${request.nextUrl.pathname}${request.nextUrl.search}`,
            SITE_URL,
        );

        return NextResponse.redirect(destination, 301);
    }

    return NextResponse.next();
}

export const config = {
    // Skip static assets and Next internals -- no point redirecting those,
    // and it keeps this proxy cheap to run on every other request.
    matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
