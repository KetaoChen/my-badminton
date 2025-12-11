export type Match = {
  id: string;
  title: string;
  matchDate: string | null;
  matchNumber?: number | null;
  opponentId: string | null;
  opponent: string | null;
  opponentName: string | null;
  tournamentId: string | null;
  tournamentName: string | null;
  notes: string | null;
};

export type Rally = {
  id: string;
  sequence: number | null;
  result: "win" | "lose";
  pointReason: string | null;
  tacticUsed: boolean | null;
  serveScore: number | null;
  notes: string | null;
  excludeFromScore?: boolean | null;
  startScoreSelf?: number | null;
  startScoreOpponent?: number | null;
  endScoreSelf?: number | null;
  endScoreOpponent?: number | null;
};

export type ReasonCount = {
  wins: number;
  losses: number;
};

export type Summary = {
  total: number;
  wins: number;
  losses: number;
  winRate: number;
  serveAvg: number | null;
  tacticUsed: number;
};

export type EditableMatch = {
  id: string;
  title: string;
  matchDate: string | null;
  matchNumber?: number | null;
  opponentId: string | null;
  opponent: string | null;
  opponentName?: string | null;
  tournamentId: string | null;
  tournamentName?: string | null;
  notes: string | null;
};

