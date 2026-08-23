import Link from "next/link";
import { SITE_URL } from "@/lib/site";

export type BreadcrumbItem = {
    label: string;
    // Omit href for a crumb with no real landing page (e.g. "Guides",
    // "Config Generators" -- categories the burger menu expands into, not
    // pages of their own) and for the current page itself, which renders
    // as plain text rather than a link to itself.
    href?: string;
};

// A visible breadcrumb trail, shown above the page title on every page
// that's more than one level deep -- config generators, setup guides and
// compatibility pages all get linked directly from Google with zero
// context otherwise, so there was no way back to the parent page short of
// the burger menu. Also emits BreadcrumbList JSON-LD so the trail shows up
// in search results, not just on-page.
export default function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
    const allItems: BreadcrumbItem[] = [{ label: "Home", href: "/" }, ...items];

    const breadcrumbJsonLd = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: allItems.map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: item.label,
            ...(item.href ? { item: `${SITE_URL}${item.href}` } : {}),
        })),
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
            />

            <nav aria-label="Breadcrumb" className="mb-6 text-sm">
                <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
                    {allItems.map((item, index) => (
                        <li key={index} className="flex items-center gap-1.5">
                            {index > 0 && (
                                <span aria-hidden="true" className="text-slate-600">
                                    /
                                </span>
                            )}

                            {item.href ? (
                                <Link
                                    href={item.href}
                                    className="text-slate-400 hover:text-sky-400 hover:underline"
                                >
                                    {item.label}
                                </Link>
                            ) : (
                                <span
                                    className={
                                        index === allItems.length - 1
                                            ? "text-slate-200"
                                            : "text-slate-400"
                                    }
                                >
                                    {item.label}
                                </span>
                            )}
                        </li>
                    ))}
                </ol>
            </nav>
        </>
    );
}
