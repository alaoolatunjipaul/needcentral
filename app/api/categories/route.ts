import { NextResponse } from "next/server";
import { getAllCategories, getCategoryCounts } from "@/lib/queries";

export async function GET() {
  const [categories, counts] = await Promise.all([
    getAllCategories(),
    getCategoryCounts(),
  ]);

  return NextResponse.json({ categories, counts });
}
