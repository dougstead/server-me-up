import cpuData from "@/data/cpus.json";

export type Cpu = {
  id: string;
  manufacturer: string;
  name: string;
  cores: number;
  threads: number;
};

export const cpus: Cpu[] = cpuData;