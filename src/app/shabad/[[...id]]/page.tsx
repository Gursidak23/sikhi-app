import ShabadPageClient from './ShabadPageClient';

// Allow static export — returns empty array so no pages are pre-rendered,
// but the catch-all route still generates a fallback shell
export async function generateStaticParams() {
  return [{}];
}

export default function ShabadPage() {
  return <ShabadPageClient />;
}
