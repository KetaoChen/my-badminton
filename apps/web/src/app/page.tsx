import { listMatches, listOpponents, listTournaments } from "@/lib/actions";
import { HomePageContent } from "@/components/HomePageContent";

export default async function Home() {
  const [matches, opponents, tournaments] = await Promise.all([
    listMatches(),
    listOpponents(),
    listTournaments(),
  ]);

  return <HomePageContent matches={matches} opponents={opponents} tournaments={tournaments} />;
}
