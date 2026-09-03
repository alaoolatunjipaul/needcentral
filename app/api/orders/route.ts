import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-service";
import { createOrder, listOrdersByUserId } from "@/lib/orders-data";
import type { Order } from "@/types";

export async function GET() {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "You must be signed in." }, { status: 401 });
  }

  const orders = await listOrdersByUserId(session.id);
  return NextResponse.json({ orders });
}

export async function POST(request: NextRequest) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json(
      { error: "You must be signed in to save an order." },
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

  const order = body as Partial<Order> | null;
  if (
    !order ||
    typeof order !== "object" ||
    !Array.isArray(order.items) ||
    order.items.length === 0 ||
    typeof order.totalCents !== "number"
  ) {
    return NextResponse.json(
      { error: "Your order is empty or malformed." },
      { status: 400 }
    );
  }

  try {
    const saved = await createOrder(session.id, order as Order);
    return NextResponse.json({ order: saved }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Unable to save your order. Please try again." },
      { status: 500 }
    );
  }
}
