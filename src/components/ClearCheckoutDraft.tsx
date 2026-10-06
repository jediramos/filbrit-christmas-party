"use client";

import { useEffect } from "react";
import { CHECKOUT_DRAFT_KEY } from "@/lib/order";

export function ClearCheckoutDraft() {
  useEffect(() => {
    try {
      window.sessionStorage.removeItem(CHECKOUT_DRAFT_KEY);
    } catch {
      // Storage unavailable; nothing to clear.
    }
  }, []);
  return null;
}
