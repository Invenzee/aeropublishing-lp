import { Suspense } from "react";
import { Checkout } from "@/components/Checkout";

export default function CheckoutPage() {
  return (
    <Suspense fallback={<main className="page"><div className="wrap">Loading checkout…</div></main>}>
      <Checkout />
    </Suspense>
  );
}
