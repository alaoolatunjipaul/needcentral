import { NextResponse } from "next/server";
import { getProductById } from "@/lib/queries";

interface ProductParams {
  params: Promise<{ id: string }>;
}

export async function GET(_request: Request, { params }: ProductParams) {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }

  return NextResponse.json(product);
}
