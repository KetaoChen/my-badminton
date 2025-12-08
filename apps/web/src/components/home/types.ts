export type Match = {
  id: string;
  title: string;
  matchDate: string | null;
  opponentName: string | null;
  wins: number | null;
  losses: number | null;
  notes: string | null;
  tournamentName: string | null;
};

export type Option = {
  id: string;
  name: string;
};

