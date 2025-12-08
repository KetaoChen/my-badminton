"use server";

import { db, schema } from "@my-badminton/db/client";
import { desc, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { matchFormSchema } from "./schemas";

export async function listMatches() {
  const rows = await db
    .select({
      match: schema.matches,
      opponent: schema.opponents,
      tournament: schema.tournaments,
    })
    .from(schema.matches)
    .leftJoin(
      schema.opponents,
      eq(schema.opponents.id, schema.matches.opponentId)
    )
    .leftJoin(
      schema.tournaments,
      eq(schema.tournaments.id, schema.matches.tournamentId)
    )
    .orderBy(desc(schema.matches.createdAt));

  const stats = await db
    .select({
      matchId: schema.rallies.matchId,
      wins: sql<number>`sum(case when ${schema.rallies.result} = 'win' then 1 else 0 end)`,
      losses: sql<number>`sum(case when ${schema.rallies.result} = 'lose' then 1 else 0 end)`,
      total: sql<number>`count(*)`,
    })
    .from(schema.rallies)
    .where(eq(schema.rallies.excludeFromScore, false))
    .groupBy(schema.rallies.matchId);

  const statsMap = new Map<
    string,
    { wins: number; losses: number; total: number }
  >();
  for (const s of stats) {
    statsMap.set(s.matchId, {
      wins: Number(s.wins ?? 0),
      losses: Number(s.losses ?? 0),
      total: Number(s.total ?? 0),
    });
  }

  return rows.map((row) => {
    const agg = statsMap.get(row.match.id) ?? { wins: 0, losses: 0, total: 0 };
    return {
      ...row.match,
      opponentName: row.opponent?.name ?? row.match.opponent ?? null,
      tournamentName: row.tournament?.name ?? null,
      wins: agg.wins,
      losses: agg.losses,
      total: agg.total,
      winRate:
        agg.total === 0 ? 0 : Math.round((agg.wins / agg.total) * 1000) / 10,
    };
  });
}

export async function getMatchWithRallies(matchId: string) {
  const [row] = await db
    .select({
      match: schema.matches,
      opponent: schema.opponents,
      tournament: schema.tournaments,
    })
    .from(schema.matches)
    .leftJoin(
      schema.opponents,
      eq(schema.opponents.id, schema.matches.opponentId)
    )
    .leftJoin(
      schema.tournaments,
      eq(schema.tournaments.id, schema.matches.tournamentId)
    )
    .where(eq(schema.matches.id, matchId));

  if (!row) {
    return null;
  }

  const match = {
    ...row.match,
    opponentName: row.opponent?.name ?? row.match.opponent ?? null,
    tournamentName: row.tournament?.name ?? null,
  };

  const rallyList = await db
    .select()
    .from(schema.rallies)
    .where(eq(schema.rallies.matchId, matchId))
    .orderBy(schema.rallies.sequence, desc(schema.rallies.createdAt));

  return { match, rallies: rallyList };
}

export async function createMatch(formData: FormData): Promise<void> {
  const parsed = matchFormSchema.safeParse({
    title: formData.get("title"),
    matchDate: formData.get("matchDate"),
    opponentId: formData.get("opponentId"),
    opponent: formData.get("opponent"),
    trainingOpponent: formData.get("trainingOpponent"),
    tournamentId: formData.get("tournamentId"),
    tournamentName: formData.get("tournamentName"),
    notes: formData.get("notes"),
  });

  if (!parsed.success) {
    console.error(parsed.error.flatten().formErrors);
    return;
  }

  const {
    title,
    matchDate,
    opponent,
    opponentId,
    trainingOpponent,
    tournamentId,
    tournamentName,
    notes,
  } = parsed.data;

  let finalOpponentId = opponentId || null;
  let finalTournamentId = tournamentId || null;

  if (!opponentId && opponent) {
    const [inserted] = await db
      .insert(schema.opponents)
      .values({
        name: opponent,
        notes: trainingOpponent ? "训练对手" : null,
        training: !!trainingOpponent,
      })
      .returning({ id: schema.opponents.id });
    finalOpponentId = inserted?.id ?? null;
  }

  if ((tournamentId || tournamentName) && !tournamentId) {
    const [insertedTournament] = await db
      .insert(schema.tournaments)
      .values({
        name: tournamentName || "未命名赛事",
      })
      .returning({ id: schema.tournaments.id });
    finalTournamentId = insertedTournament?.id ?? null;
  }

  await db.insert(schema.matches).values({
    title,
    opponentId: finalOpponentId,
    opponent: opponent || null,
    tournamentId: finalTournamentId,
    notes: notes || null,
    matchDate: matchDate || null,
  });

  revalidatePath("/");
}

export async function deleteMatch(matchId: string): Promise<void> {
  await db.delete(schema.matches).where(eq(schema.matches.id, matchId));
  revalidatePath("/");
  redirect("/");
}

export async function updateMatch(
  matchId: string,
  formData: FormData
): Promise<void> {
  const parsed = matchFormSchema.safeParse({
    title: formData.get("title"),
    matchDate: formData.get("matchDate"),
    opponentId: formData.get("opponentId"),
    opponent: formData.get("opponent"),
    tournamentId: formData.get("tournamentId"),
    tournamentName: formData.get("tournamentName"),
    notes: formData.get("notes"),
  });

  if (!parsed.success) {
    console.error(parsed.error.flatten().formErrors);
    return;
  }

  const {
    title,
    matchDate,
    opponent,
    opponentId,
    tournamentId,
    tournamentName,
    notes,
  } = parsed.data;

  let finalTournamentId = tournamentId || null;

  if ((tournamentId || tournamentName) && !tournamentId) {
    const [insertedTournament] = await db
      .insert(schema.tournaments)
      .values({
        name: tournamentName || "未命名赛事",
      })
      .returning({ id: schema.tournaments.id });
    finalTournamentId = insertedTournament?.id ?? null;
  }

  await db
    .update(schema.matches)
    .set({
      title,
      opponentId: opponentId || null,
      opponent: opponent || null,
      tournamentId: finalTournamentId,
      notes: notes || null,
      matchDate: matchDate || null,
    })
    .where(eq(schema.matches.id, matchId));

  revalidatePath(`/matches/${matchId}`);
  revalidatePath("/");
}

