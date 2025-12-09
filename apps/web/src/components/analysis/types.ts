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

export type AnalysisMatch = {
  id: string;
  title: string;
  matchDate: string | null;
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

