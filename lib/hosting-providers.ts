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
];