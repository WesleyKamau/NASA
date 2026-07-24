import IdentityOG from "@/components/og/IdentityOG";
import { OG_PAGES, OG_HOME } from "@/lib/og/pages";

export default async function OGPreview({
  searchParams,
}: {
  searchParams: Promise<{ slug?: string }>;
}) {
  const { slug } = await searchParams;
  const page = OG_PAGES.find((p) => p.slug === slug) ?? OG_HOME;

  return <IdentityOG message={page.message} />;
}
