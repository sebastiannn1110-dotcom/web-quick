import { FeatureShell } from "@/components/dashboard/FeatureShell";

export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function CartPage() {
  return (
    <FeatureShell
      title="B2B cart"
      body="The cart is prepared for CHECKOUT_MODE=rfq. Prices and MOQ are revalidated on the server before creating an RFQ."
    />
  );
}
