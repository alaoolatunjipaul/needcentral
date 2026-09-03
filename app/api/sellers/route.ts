import { NextResponse } from "next/server";
import { getSellerSummaries } from "@/lib/queries";

export async function GET() {
  const sellers = await getSellerSummaries();
  return NextResponse.json({ sellers });
}
