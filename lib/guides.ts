export type Guide = {
  id: string;
  title: string;
  href: string;
};

// Add new guide pages here as they're written; the burger menu's
// "Guides" submenu is generated from this list.
export const guides: Guide[] = [
  {
    id: "port-forwarding",
    title: "How to Set Up Port Forwarding",
    href: "/guides/port-forwarding",
  },
];
