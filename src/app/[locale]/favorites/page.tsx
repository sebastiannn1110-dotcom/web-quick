import { FeatureShell } from "@/components/dashboard/FeatureShell";

export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default function FavoritesPage() {
  return (
    <FeatureShell
      title="Favorites"
      body="Authenticated customers can save published products and revisit them for RFQ or comparison."
    />
  );
}
