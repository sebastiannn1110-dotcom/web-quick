import { FeatureShell } from "@/components/dashboard/FeatureShell";

export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function OrdersPage() {
  return (
    <FeatureShell
      title="Orders"
      body="Order tables are prepared for future checkout, but CHECKOUT_MODE remains rfq until payment approval and credentials exist."
    />
  );
}
