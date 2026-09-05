import "server-only";

// Stage #5 static shipment tracking numbers. NeedCentral generates a
// deterministic-looking number from the order id — there is no carrier or
// logistics-provider integration this stage, so the number is purely cosmetic
// (persisted on "shipped" and displayed to the buyer).

function hash(value: string): number {
  let hashVal = 5381;
  for (let i = 0; i < value.length; i += 1) {
    hashVal = (hashVal * 33) ^ value.charCodeAt(i);
  }
  return hashVal >>> 0;
}

const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

/**
 * Returns a stable, human-friendly tracking number derived from the order id,
 * e.g. "NC5XQ7-KW29-H4M". Stable so re-advancing produces the same number.
 */
export function generateTrackingNumber(orderId: string): string {
  const seed = hash(`needcentral-tracking:${orderId}`);
  const part = (offset: number, length: number): string => {
    let n = seed + offset;
    let out = "";
    for (let i = 0; i < length; i += 1) {
      out += ALPHABET[n % ALPHABET.length];
      n = (n * 31 + 7) >>> 0;
    }
    return out;
  };
  return `NC${part(1, 5)}-${part(2, 4)}-${part(3, 3)}`;
}