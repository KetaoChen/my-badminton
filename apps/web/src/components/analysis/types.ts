import dayjs from "dayjs";

export type Filters = {
  tournamentOnly: boolean;
  opponentId?: string;
  tournamentId?: string;
  startDate?: string;
  endDate?: string;
};

export type Option = { id: string; name: string };

export type FilterFormValues = {
  opponentId?: string;
  tournamentId?: string;
  tournamentOnly?: boolean;
  dateRange?: [dayjs.Dayjs, dayjs.Dayjs];
};

export type Analysis = Awaited<
  ReturnType<typeof import("@/lib/analysis").getAnalysis>
>;

export type AbilitySeriesPoint = {
  id: string;
  title: string;
  matchDate: string | null;
  opponentName: string;
  serve: number | null;
  tactic: number;
  error: number;
};

export type ReasonSeriesPoint = { label: string; value: number };
export type ReasonSeries = {
  label: string;
  color: string;
  points: ReasonSeriesPoint[];
};

export type AggregatedStats = {
  matchCount: number;
  matchWins: number;
  matchLosses: number;
  rallyCount: number;
  wins: number;
  losses: number;
  winRate: number;
  winReasonShares: ReasonShare[];
  loseReasonShares: ReasonShare[];
  winReasonSeries: ReasonSeries[];
  loseReasonSeries: ReasonSeries[];
  abilities: {
    serve: number;
    tactic: number;
    error: number;
  };
  abilityTimeSeries: AbilitySeriesPoint[];
};

export type AnalysisMatch = {
  id: string;
  title: string;
  matchDate: string | null;
  matchNumber?: number | null;
  opponentName: string;
  wins: number;
  losses: number;
  total: number;
  winTotal: number;
  loseTotal: number;
  winReasons: Record<string, number>;
  loseReasons: Record<string, number>;
  serveSum: number;
  serveCount: number;
  tacticSum: number;
  tacticCount: number;
  errorCount: number;
};

export type ReasonShare = {
  reason: string;
  avgShare: number;
  matches: number;
};

