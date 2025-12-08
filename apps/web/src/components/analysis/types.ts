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

export type ReasonShare = {
  reason: string;
  avgShare: number;
  matches: number;
};

