export type HostingProvider = {
  id: string;
  name: string;
  websiteUrl: string;
};

export const hostingProviders: HostingProvider[] = [
  {
    id: "scalacube",
    name: "ScalaCube",
    websiteUrl: "https://scalacube.com",
  },
  {
    id: "gtxgaming",
    name: "GTXGaming",
    websiteUrl: "https://www.gtxgaming.co.uk",
  },
];