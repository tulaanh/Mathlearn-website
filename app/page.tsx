import HomeTabs from "@/components/HomeTabs";
import { getChapters } from "@/lib/chapters";

export default async function HomePage() {
  const chapters = await getChapters();
  return <HomeTabs chapters={chapters} />;
}
