import { FeatureShell } from "@/components/dashboard/FeatureShell";

export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function QuotesPage() {
  return (
    <FeatureShell
      title="Quotes"
      body="Customers will see only their own RFQs and status history through Supabase RLS."
    />
  );
}
