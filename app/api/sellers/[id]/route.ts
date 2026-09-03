import { NextResponse } from "next/server";
import { getSellerById, getSellerProducts, getSellerSummary } from "@/lib/queries";

interface SellerParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: SellerParams) {
  const { id } = await params;
  const seller = await getSellerById(id);

  if (!seller) {
    return NextResponse.json({ error: "Seller not found." }, { status: 404 });
  }

  const [summary, products] = await Promise.all([
    getSellerSummary(id),
    getSellerProducts(id),
  ]);

  return NextResponse.json({ seller, summary, products });
}
