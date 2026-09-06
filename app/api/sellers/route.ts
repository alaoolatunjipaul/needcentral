import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-service";
import { getSellerSummaries } from "@/lib/queries";
import { createSellerStore } from "@/lib/sellers-data";

export async function GET() {
  const sellers = await getSellerSummaries();
  return NextResponse.json({ sellers });
}

export async function POST(request: NextRequest) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json(
      { error: "You must be signed in to become a seller." },
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

  const input = body as { storeName?: string; location?: string; description?: string } | null;
  const result = await createSellerStore({
    userId: session.id,
    storeName: input?.storeName ?? "",
    location: input?.location ?? "",
    description: input?.description ?? "",
  });

  if (!result.ok) {
    const isConflict = result.error.includes("already have");
    return NextResponse.json(
      { error: result.error },
      { status: isConflict ? 409 : 400 }
    );
  }

  return NextResponse.json({ seller: result.seller }, { status: 201 });
}
