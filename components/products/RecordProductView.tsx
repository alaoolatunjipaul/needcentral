"use client";

import { useEffect } from "react";
import { useRecentlyViewed } from "@/components/products/RecentlyViewedProvider";

/**
 * Invisible helper rendered on product pages: records the visit once per
 * mount so "Recently viewed" rails can pick it up client-side.
 */
export function RecordProductView({ productId }: { productId: string }) {
  const { recordProductView } = useRecentlyViewed();

  useEffect(() => {
    recordProductView(productId);
  }, [productId, recordProductView]);

  return null;
}
