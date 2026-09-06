import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-service";
import {
  assembleOrder,
  MAX_ORDER_ITEMS,
  MAX_ITEM_QUANTITY,
  type AssembleOrderInput,
} from "@/lib/order-assembly";
import { createOrder, listOrdersByUserId } from "@/lib/orders-data";
import type { Address, DeliveryOptionId } from "@/types";

const DELIVERY_OPTION_IDS: DeliveryOptionId[] = [
  "standard",
  "express",
  "pickup",
];

/**
 * Whitelists the fields a client may send when creating an order. Every
 * financial field (prices, line totals, subtotal, shipping, discount, total,
 * payment state, status) is intentionally rejected or ignored — the shared
 * assembler derives all of them from the catalogue server-side.
 */
function parseCreateOrderInput(body: unknown):
  | { ok: true; input: AssembleOrderInput }
  | { ok: false; error: string; status: 400 } {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { ok: false, error: "Your order is empty or malformed.", status: 400 };
  }

  const record = body as Record<string, unknown>;
  const allowedTopLevel = new Set([
    "email",
    "items",
    "deliveryOptionId",
    "shippingAddress",
    "pickupStationId",
    "couponCode",
  ]);

  for (const key of Object.keys(record)) {
    if (!allowedTopLevel.has(key)) {
      return {
        ok: false,
        error: `Unsupported field: ${key}`,
        status: 400,
      };
    }
  }

  // items
  if (!Array.isArray(record.items) || record.items.length === 0) {
    return { ok: false, error: "Your order is empty or malformed.", status: 400 };
  }
  if (record.items.length > MAX_ORDER_ITEMS) {
    return { ok: false, error: "Your order has too many items.", status: 400 };
  }

  const items: Array<{ productId: string; quantity: number }> = [];
  for (const raw of record.items) {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
      return { ok: false, error: "Your order is empty or malformed.", status: 400 };
    }
    const item = raw as Record<string, unknown>;
    const allowedItem = new Set(["productId", "quantity"]);
    for (const key of Object.keys(item)) {
      if (!allowedItem.has(key)) {
        return { ok: false, error: `Unsupported item field: ${key}`, status: 400 };
      }
    }
    if (typeof item.productId !== "string" || item.productId.trim() === "") {
      return { ok: false, error: "Your order is empty or malformed.", status: 400 };
    }
    const quantity = Number(item.quantity);
    if (
      !Number.isFinite(quantity) ||
      !Number.isInteger(quantity) ||
      quantity <= 0 ||
      quantity > MAX_ITEM_QUANTITY
    ) {
      return { ok: false, error: "One of your item quantities is invalid.", status: 400 };
    }
    items.push({ productId: item.productId, quantity });
  }

  // deliveryOptionId
  if (
    typeof record.deliveryOptionId !== "string" ||
    !DELIVERY_OPTION_IDS.includes(record.deliveryOptionId as DeliveryOptionId)
  ) {
    return { ok: false, error: "Please choose a valid delivery option.", status: 400 };
  }
  const deliveryOptionId = record.deliveryOptionId as DeliveryOptionId;

  // optional fields
  const email =
    typeof record.email === "string" ? record.email.trim() : "";
  const shippingAddress = parseShippingAddress(record.shippingAddress);
  if (record.shippingAddress !== undefined && shippingAddress === undefined) {
    return { ok: false, error: "Your shipping address is invalid.", status: 400 };
  }
  const pickupStationId =
    typeof record.pickupStationId === "string"
      ? record.pickupStationId
      : undefined;
  const couponCode =
    typeof record.couponCode === "string" ? record.couponCode : undefined;

  return { ok: true, input: { email, items, deliveryOptionId, shippingAddress, pickupStationId, couponCode } };
}

function parseShippingAddress(value: unknown): Address | undefined {
  if (value === undefined) return undefined;
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const record = value as Record<string, unknown>;
  const allowed = new Set([
    "fullName",
    "street",
    "city",
    "state",
    "postalCode",
    "country",
  ]);
  for (const key of Object.keys(record)) {
    if (!allowed.has(key)) return undefined;
  }
  const str = (v: unknown): string => (typeof v === "string" ? v : "");
  return {
    fullName: str(record.fullName),
    street: str(record.street),
    city: str(record.city),
    state: str(record.state) || undefined,
    postalCode: str(record.postalCode),
    country: str(record.country),
  };
}

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

  const parsed = parseCreateOrderInput(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: parsed.error }, { status: parsed.status });
  }

  try {
    // The assembler recomputes every price and total from the catalogue and
    // forces status "pending" — client-supplied financial data is never used.
    const assembled = await assembleOrder(parsed.input);
    if (!assembled.ok) {
      return NextResponse.json(
        { error: assembled.error },
        { status: 400 }
      );
    }

    const saved = await createOrder(session.id, assembled.order);
    return NextResponse.json({ order: saved }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Unable to save your order. Please try again." },
      { status: 500 }
    );
  }
}
