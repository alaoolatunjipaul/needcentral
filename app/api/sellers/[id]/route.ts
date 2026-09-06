import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-service";
import { getSellerById, getSellerProducts, getSellerSummary } from "@/lib/queries";
import { getSellerByUserId, updateSellerStore } from "@/lib/sellers-data";

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

export async function PATCH(request: NextRequest, { params }: SellerParams) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json(
      { error: "You must be signed in to edit a store." },
      { status: 401 }
    );
  }

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Request body must be valid JSON." },
      { status: 400 }
    );
  }

  // The requested seller must exist, then ownership is checked BEFORE any
  // mutation: a rejected request must leave the database untouched.
  const target = await getSellerById(id);
  if (!target) {
    return NextResponse.json({ error: "Seller not found." }, { status: 404 });
  }

  const ownSeller = await getSellerByUserId(session.id);
  if (!ownSeller) {
    return NextResponse.json(
      { error: "You don't have a seller store yet." },
      { status: 403 }
    );
  }

  if (ownSeller.id !== id) {
    return NextResponse.json(
      { error: "You can only manage your own store." },
      { status: 403 }
    );
  }

  const input = body as { name?: string; location?: string; description?: string } | null;
  const result = await updateSellerStore(session.id, {
    name: input?.name,
    location: input?.location,
    description: input?.description,
  });

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 400 });
  }

  return NextResponse.json({ seller: result.seller });
}
