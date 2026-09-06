import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-service";
import { filterAndSortProducts, getAllCategories } from "@/lib/queries";
import { parseProductQuery } from "@/lib/data";
import { createListing } from "@/lib/sellers-data";
import type { CreateListingInput } from "@/lib/sellers-data";

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

export async function POST(request: NextRequest) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json(
      { error: "You must be signed in to create a listing." },
      { status: 401 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON." },
      { status: 400 }
    );
  }

  const input = body as Partial<CreateListingInput>;
  const result = await createListing(session.id, {
    name: input.name ?? "",
    category: input.category ?? ("" as never),
    priceCents: input.priceCents ?? 0,
    compareAtPriceCents: input.compareAtPriceCents,
    image: input.image ?? "",
    description: input.description ?? "",
    stock: input.stock ?? 0,
  });

  if (!result.ok) {
    const isForbidden = result.error.includes("don't have a seller store");
    return NextResponse.json(
      { error: result.error },
      { status: isForbidden ? 403 : 400 }
    );
  }

  return NextResponse.json({ product: result.product }, { status: 201 });
}
