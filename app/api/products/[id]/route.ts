import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-service";
import { getProductById } from "@/lib/queries";
import {
  deleteListing,
  setListingStatus,
  updateListing,
} from "@/lib/sellers-data";
import type { UpdateListingInput } from "@/lib/sellers-data";

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

export async function PATCH(request: NextRequest, { params }: ProductParams) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json(
      { error: "You must be signed in to edit a listing." },
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

  const input = body as Partial<UpdateListingInput> & {
    listingStatus?: "active" | "unpublished";
  };

  // Support { listingStatus } for publish/unpublish and the rest for edits.
  if (input.listingStatus === "active" || input.listingStatus === "unpublished") {
    const result = await setListingStatus(session.id, id, input.listingStatus);
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 403 });
    }
    return NextResponse.json({ product: result.product });
  }

  const result = await updateListing(session.id, id, input);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 403 });
  }

  return NextResponse.json({ product: result.product });
}

export async function DELETE(_request: Request, { params }: ProductParams) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json(
      { error: "You must be signed in to delete a listing." },
      { status: 401 }
    );
  }

  const { id } = await params;
  const result = await deleteListing(session.id, id);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 403 });
  }

  return NextResponse.json({ ok: true });
}
