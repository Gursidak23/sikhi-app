import ShabadPageClient from './ShabadPageClient';

// Allow static export — all shabad IDs are handled client-side
export function generateStaticParams() {
  return [];
}

export default function ShabadPage() {
  return <ShabadPageClient />;
}
