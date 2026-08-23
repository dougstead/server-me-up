import { NextRequest, NextResponse } from "next/server";
import { searchCpus } from "@/lib/cpu-repository";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q") ?? "";

  return NextResponse.json(searchCpus(query));
}