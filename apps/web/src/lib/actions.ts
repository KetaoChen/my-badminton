"use server";

import { db, schema } from "@my-badminton/db/client";
import { asc, desc, eq, sql, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

const optionalUuid = z
  .string()
  .uuid()
  .or(z.literal(""))
  .or(z.null())
  .transform((v) => (v ? v : undefined))
  .optional();

const checkboxBoolean = z
  .preprocess(
    (value) =>
      value === "on" || value === "true" || value === true ? true : false,
    z.boolean()
  )
  .optional();

const matchFormSchema = z.object({
  title: z.string().trim().min(1, "Match title is required"),
  matchDate: z.string().trim().optional(),
  opponentId: optionalUuid,
  opponent: z.string().trim().optional(),
  trainingOpponent: checkboxBoolean,
  tournamentId: optionalUuid,
  tournamentName: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

const opponentFormSchema = z.object({
  name: z.string().trim().min(1, "Opponent name is required"),
  notes: z.string().trim().optional(),
});

const rallyPointReasons = [
  "对手失误",
  "拉吊",
  "突击",
  "杀球",
  "网前",
  "防反",
  "假动作",
  "球不到位",
  "步伐不到位",
  "我方失误",
  "对手制胜球",
  "其他",
] as const;

const rallyFormSchema = z.object({
  matchId: z.string().uuid(),
  result: z.enum(["win", "lose"]),
  pointReason: z.enum(rallyPointReasons),
  excludeFromScore: checkboxBoolean,
  serveScore: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? Number(v) : null)),
  placementScore: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? Number(v) : null)),
  footworkScore: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? Number(v) : null)),
  tacticScore: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

const rallyDeleteSchema = z.object({
  matchId: z.string().uuid(),
  rallyId: z.string().uuid(),
});

const rallyUpdateFormSchema = rallyFormSchema.extend({
  rallyId: z.string().uuid(),
});

export async function listOpponents() {
  return db
    .select()
    .from(schema.opponents)
    .where(
      or(
        eq(schema.opponents.training, true),
        eq(schema.opponents.notes, "训练对手")
      )
    )
    .orderBy(desc(schema.opponents.createdAt));
}

export async function listTournaments() {
  return db
    .select()
    .from(schema.tournaments)
    .orderBy(desc(schema.tournaments.createdAt));
}

export async function createOpponent(formData: FormData): Promise<void> {
  const parsed = opponentFormSchema.safeParse({
    name: formData.get("name"),
    notes: formData.get("notes"),
  });

  if (!parsed.success) {
    console.error(parsed.error.flatten().formErrors);
    return;
  }

  const { name, notes } = parsed.data;

  await db.insert(schema.opponents).values({
    name,
    notes: notes || null,
  });

  revalidatePath("/");
}

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

export async function createRally(formData: FormData): Promise<void> {
  const parsed = rallyFormSchema.safeParse({
    matchId: formData.get("matchId"),
    result: formData.get("result"),
    pointReason: formData.get("pointReason"),
    excludeFromScore: formData.get("excludeFromScore"),
    serveScore: formData.get("serveScore"),
    placementScore: formData.get("placementScore"),
    footworkScore: formData.get("footworkScore"),
    tacticScore: formData.get("tacticScore"),
    notes: formData.get("notes"),
  });

  if (!parsed.success) {
    console.error(parsed.error.flatten().formErrors);
    return;
  }

  const data = parsed.data;

  const [current] = await db
    .select({
      maxSequence: sql<number>`coalesce(max(${schema.rallies.sequence}), 0)`,
    })
    .from(schema.rallies)
    .where(eq(schema.rallies.matchId, data.matchId));

  const sequence = (current?.maxSequence ?? 0) + 1;

  const [scoreAgg] = await db
    .select({
      wins: sql<number>`sum(case when ${schema.rallies.result} = 'win' and ${schema.rallies.excludeFromScore} = false then 1 else 0 end)`,
      losses: sql<number>`sum(case when ${schema.rallies.result} = 'lose' and ${schema.rallies.excludeFromScore} = false then 1 else 0 end)`,
    })
    .from(schema.rallies)
    .where(eq(schema.rallies.matchId, data.matchId));

  const prevSelf = Number(scoreAgg?.wins ?? 0);
  const prevOpp = Number(scoreAgg?.losses ?? 0);

  const startScoreSelf = prevSelf;
  const startScoreOpponent = prevOpp;
  const endScoreSelf =
    data.excludeFromScore || !data.result
      ? prevSelf
      : data.result === "win"
      ? prevSelf + 1
      : prevSelf;
  const endScoreOpponent =
    data.excludeFromScore || !data.result
      ? prevOpp
      : data.result === "lose"
      ? prevOpp + 1
      : prevOpp;
  const tacticScore = data.tacticScore ? Number(data.tacticScore) : null;

  await db.insert(schema.rallies).values({
    matchId: data.matchId,
    sequence,
    result: data.result,
    excludeFromScore: !!data.excludeFromScore,
    pointFor: data.result === "win" ? "self" : "opponent",
    pointReason: data.pointReason || null,
    startScoreSelf,
    startScoreOpponent,
    endScoreSelf,
    endScoreOpponent,
    serveScore: data.serveScore ?? null,
    placementScore: data.placementScore ?? null,
    footworkScore: data.footworkScore ?? null,
    tacticScore,
    notes: data.notes || null,
  });

  revalidatePath(`/matches/${data.matchId}`);
}

export async function updateRally(formData: FormData): Promise<void> {
  const parsed = rallyUpdateFormSchema.safeParse({
    rallyId: formData.get("rallyId"),
    matchId: formData.get("matchId"),
    result: formData.get("result"),
    pointReason: formData.get("pointReason"),
    excludeFromScore: formData.get("excludeFromScore"),
    serveScore: formData.get("serveScore"),
    placementScore: formData.get("placementScore"),
    footworkScore: formData.get("footworkScore"),
    tacticScore: formData.get("tacticScore"),
    notes: formData.get("notes"),
  });

  if (!parsed.success) {
    console.error(parsed.error.flatten().formErrors);
    return;
  }

  const data = parsed.data;
  const rallies = await db
    .select()
    .from(schema.rallies)
    .where(eq(schema.rallies.matchId, data.matchId))
    .orderBy(asc(schema.rallies.sequence), asc(schema.rallies.createdAt));

  const updatedRallies = rallies.map((r) =>
    r.id === data.rallyId
      ? {
          ...r,
          result: data.result,
          pointReason: data.pointReason,
          excludeFromScore: !!data.excludeFromScore,
          serveScore: data.serveScore ?? null,
          placementScore: data.placementScore ?? null,
          footworkScore: data.footworkScore ?? null,
          tacticScore: data.tacticScore ? Number(data.tacticScore) : null,
          notes: data.notes || null,
        }
      : r
  );

  let currentSelf = 0;
  let currentOpp = 0;

  for (let i = 0; i < updatedRallies.length; i++) {
    const r = updatedRallies[i];
    const result = r.result;

    const startScoreSelf = currentSelf;
    const startScoreOpponent = currentOpp;
    const endScoreSelf =
      r.excludeFromScore || !result
        ? currentSelf
        : result === "win"
        ? currentSelf + 1
        : currentSelf;
    const endScoreOpponent =
      r.excludeFromScore || !result
        ? currentOpp
        : result === "lose"
        ? currentOpp + 1
        : currentOpp;

    if (!r.excludeFromScore) {
      currentSelf = endScoreSelf;
      currentOpp = endScoreOpponent;
    }

    await db
      .update(schema.rallies)
      .set({
        sequence: i + 1,
        result,
        excludeFromScore: !!r.excludeFromScore,
        pointFor: result === "win" ? "self" : "opponent",
        pointReason: r.pointReason || null,
        startScoreSelf,
        startScoreOpponent,
        endScoreSelf,
        endScoreOpponent,
        serveScore: r.serveScore ?? null,
        placementScore: r.placementScore ?? null,
        footworkScore: r.footworkScore ?? null,
        tacticScore: r.tacticScore ?? null,
        notes: r.notes || null,
      })
      .where(eq(schema.rallies.id, r.id));
  }

  revalidatePath(`/matches/${data.matchId}`);
  revalidatePath("/");
}

export async function deleteRally(formData: FormData): Promise<void> {
  const parsed = rallyDeleteSchema.safeParse({
    matchId: formData.get("matchId"),
    rallyId: formData.get("rallyId"),
  });

  if (!parsed.success) {
    console.error(parsed.error.flatten().formErrors);
    return;
  }

  const { matchId, rallyId } = parsed.data;

  const ralliesList = await db
    .select()
    .from(schema.rallies)
    .where(eq(schema.rallies.matchId, matchId))
    .orderBy(asc(schema.rallies.sequence), asc(schema.rallies.createdAt));

  const remaining = ralliesList.filter((r) => r.id !== rallyId);

  let currentSelf = 0;
  let currentOpp = 0;

  for (let i = 0; i < remaining.length; i++) {
    const r = remaining[i];
    const result = r.result;
    const startScoreSelf = currentSelf;
    const startScoreOpponent = currentOpp;
    const endScoreSelf =
      r.excludeFromScore || !result
        ? currentSelf
        : result === "win"
        ? currentSelf + 1
        : currentSelf;
    const endScoreOpponent =
      r.excludeFromScore || !result
        ? currentOpp
        : result === "lose"
        ? currentOpp + 1
        : currentOpp;

    if (!r.excludeFromScore) {
      currentSelf = endScoreSelf;
      currentOpp = endScoreOpponent;
    }

    await db
      .update(schema.rallies)
      .set({
        sequence: i + 1,
        result,
        pointFor: result === "win" ? "self" : "opponent",
        pointReason: r.pointReason || null,
        startScoreSelf,
        startScoreOpponent,
        endScoreSelf,
        endScoreOpponent,
        serveScore: r.serveScore ?? null,
        placementScore: r.placementScore ?? null,
        footworkScore: r.footworkScore ?? null,
        tacticScore: r.tacticScore ?? null,
        excludeFromScore: !!r.excludeFromScore,
        notes: r.notes || null,
      })
      .where(eq(schema.rallies.id, r.id));
  }

  revalidatePath(`/matches/${matchId}`);
  revalidatePath("/");
}
