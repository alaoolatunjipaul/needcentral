import { NextRequest, NextResponse } from "next/server";
import { filterAndSortProducts, getAllCategories } from "@/lib/queries";
import { parseProductQuery } from "@/lib/data";

export async function GET(request: NextRequest) {
  const searchParams = Object.fromEntries(request.nextUrl.searchParams);
  const query = parseProductQuery(searchParams);
  const { items, total } = await filterAndSortProducts(query);
  const categories = await getAllCategories();

  return NextResponse.json({
    items,
    total,
    categories,
  });
}
