import { cpus, type Cpu } from "@/lib/cpus";

export function searchCpus(query: string): Cpu[] {
  const normalizedQuery = query.trim().toLowerCase();

  if (normalizedQuery.length < 2) {
    return [];
  }

  return cpus
    .filter((cpu) =>
      cpu.name.toLowerCase().includes(normalizedQuery),
    )
    .slice(0, 10);
}