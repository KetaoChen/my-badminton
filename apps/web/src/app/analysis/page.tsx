import { getAnalysis, getAnalysisFilters } from "@/lib/analysis";
import { AnalysisContent } from "@/components/AnalysisContent";

type PageProps = {
  searchParams: Promise<{
    tournamentOnly?: string;
    opponentId?: string;
    tournamentId?: string;
    startDate?: string;
    endDate?: string;
  }>;
};

export default async function AnalysisPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const filters = {
    tournamentOnly: params.tournamentOnly === "on",
    opponentId: params.opponentId || undefined,
    tournamentId: params.tournamentId || undefined,
    startDate: params.startDate || undefined,
    endDate: params.endDate || undefined,
  };

  const { opponents, tournaments } = await getAnalysisFilters();
  const analysis = await getAnalysis(filters);

  return (
    <AnalysisContent
      filters={filters}
      opponents={opponents}
      tournaments={tournaments}
      analysis={analysis}
    />
  );
}
