"use server";

import { db, schema } from "@my-badminton/db/client";
import { desc, eq, inArray, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const optionalUuid = z
  .string()
  .uuid()
  .or(z.literal(""))
  .or(z.null())
  .transform((v) => (v ? v : undefined))
  .optional();

const matchFormSchema = z.object({
  title: z.string().trim().min(1, "Match title is required"),
  matchDate: z.string().trim().optional(),
  opponentId: optionalUuid,
  opponent: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

const opponentFormSchema = z.object({
  name: z.string().trim().min(1, "Opponent name is required"),
  notes: z.string().trim().optional(),
});

const rallyFormSchema = z.object({
  matchId: z.string().uuid(),
  result: z.enum(["win", "lose"]),
  pointReason: z.enum([
    "对手失误",
    "我方制胜球",
    "我方失误",
    "对手制胜球",
    "其他",
  ]),
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

export async function listOpponents() {
  return db
    .select()
    .from(schema.opponents)
    .orderBy(desc(schema.opponents.createdAt));
}

export async function createOpponent(formData: FormData) {
  const parsed = opponentFormSchema.safeParse({
    name: formData.get("name"),
    notes: formData.get("notes"),
  });

  if (!parsed.success) {
    return { ok: false, errors: parsed.error.flatten().fieldErrors };
  }

  const { name, notes } = parsed.data;

  await db.insert(schema.opponents).values({
    name,
    notes: notes || null,
  });

  revalidatePath("/");
  return { ok: true };
}

export async function listMatches() {
  const rows = await db
    .select({
      match: schema.matches,
      opponent: schema.opponents,
    })
    .from(schema.matches)
    .leftJoin(
      schema.opponents,
      eq(schema.opponents.id, schema.matches.opponentId)
    )
    .orderBy(desc(schema.matches.createdAt));

  return rows.map((row) => ({
    ...row.match,
    opponentName: row.opponent?.name ?? row.match.opponent ?? null,
  }));
}

export async function getMatchWithRallies(matchId: string) {
  const [row] = await db
    .select({
      match: schema.matches,
      opponent: schema.opponents,
    })
    .from(schema.matches)
    .leftJoin(
      schema.opponents,
      eq(schema.opponents.id, schema.matches.opponentId)
    )
    .where(eq(schema.matches.id, matchId));

  if (!row) {
    return null;
  }

  const match = {
    ...row.match,
    opponentName: row.opponent?.name ?? row.match.opponent ?? null,
  };

  const rallyList = await db
    .select()
    .from(schema.rallies)
    .where(eq(schema.rallies.matchId, matchId))
    .orderBy(schema.rallies.sequence, desc(schema.rallies.createdAt));

  return { match, rallies: rallyList };
}

export async function getDashboardSummary() {
  const [{ rallyCount, winCount, loseCount }] =
    (await db
      .select({
        rallyCount: sql<number>`count(*)`,
        winCount: sql<number>`sum(case when ${schema.rallies.result} = 'win' then 1 else 0 end)`,
        loseCount: sql<number>`sum(case when ${schema.rallies.result} = 'lose' then 1 else 0 end)`,
      })
      .from(schema.rallies)) ?? [];

  const [{ matchCount }] =
    (await db
      .select({ matchCount: sql<number>`count(*)` })
      .from(schema.matches)) ?? [];

  const recentMatchesRows = await db
    .select({
      match: schema.matches,
      opponent: schema.opponents,
    })
    .from(schema.matches)
    .leftJoin(
      schema.opponents,
      eq(schema.opponents.id, schema.matches.opponentId)
    )
    .orderBy(desc(schema.matches.matchDate ?? schema.matches.createdAt))
    .limit(5);

  const recentIds = recentMatchesRows.map((row) => row.match.id);

  const recentAggregates =
    recentIds.length === 0
      ? []
      : await db
          .select({
            matchId: schema.rallies.matchId,
            wins: sql<number>`sum(case when ${schema.rallies.result} = 'win' then 1 else 0 end)`,
            losses: sql<number>`sum(case when ${schema.rallies.result} = 'lose' then 1 else 0 end)`,
            total: sql<number>`count(*)`,
          })
          .from(schema.rallies)
          .where(inArray(schema.rallies.matchId, recentIds))
          .groupBy(schema.rallies.matchId);

  const aggMap = new Map<
    string,
    { wins: number; losses: number; total: number }
  >();
  for (const agg of recentAggregates) {
    aggMap.set(agg.matchId, {
      wins: Number(agg.wins ?? 0),
      losses: Number(agg.losses ?? 0),
      total: Number(agg.total ?? 0),
    });
  }

  const recent = recentMatchesRows.map((row) => {
    const stats = aggMap.get(row.match.id) ?? { wins: 0, losses: 0, total: 0 };
    return {
      id: row.match.id,
      title: row.match.title,
      matchDate: row.match.matchDate,
      createdAt: row.match.createdAt,
      opponentName: row.opponent?.name ?? row.match.opponent ?? null,
      ...stats,
      winRate:
        stats.total === 0
          ? 0
          : Math.round((stats.wins / stats.total) * 1000) / 10,
    };
  });

  const topReasons = await db
    .select({
      reason: schema.rallies.pointReason,
      wins: sql<number>`sum(case when ${schema.rallies.result} = 'win' then 1 else 0 end)`,
      losses: sql<number>`sum(case when ${schema.rallies.result} = 'lose' then 1 else 0 end)`,
      total: sql<number>`count(*)`,
    })
    .from(schema.rallies)
    .groupBy(schema.rallies.pointReason)
    .orderBy(desc(sql<number>`count(*)`))
    .limit(5);

  const totalRallies = Number(rallyCount ?? 0);
  const wins = Number(winCount ?? 0);
  const losses = Number(loseCount ?? 0);
  const winRate =
    totalRallies === 0 ? 0 : Math.round((wins / totalRallies) * 1000) / 10;

  return {
    matchCount: Number(matchCount ?? 0),
    rallyCount: totalRallies,
    wins,
    losses,
    winRate,
    recent,
    topReasons: topReasons.map((item) => ({
      reason: item.reason ?? "未填写",
      wins: Number(item.wins ?? 0),
      losses: Number(item.losses ?? 0),
      total: Number(item.total ?? 0),
    })),
  };
}

export async function createMatch(formData: FormData) {
  const parsed = matchFormSchema.safeParse({
    title: formData.get("title"),
    matchDate: formData.get("matchDate"),
    opponentId: formData.get("opponentId"),
    opponent: formData.get("opponent"),
    notes: formData.get("notes"),
  });

  if (!parsed.success) {
    console.error(parsed.error.flatten().formErrors);
    return { ok: false, errors: parsed.error.flatten().fieldErrors };
  }

  const { title, matchDate, opponent, opponentId, notes } = parsed.data;

  await db.insert(schema.matches).values({
    title,
    opponentId: opponentId || null,
    opponent: opponent || null,
    notes: notes || null,
    matchDate: matchDate || null,
  });

  revalidatePath("/");
  return { ok: true };
}

export async function updateMatch(matchId: string, formData: FormData) {
  const parsed = matchFormSchema.safeParse({
    title: formData.get("title"),
    matchDate: formData.get("matchDate"),
    opponentId: formData.get("opponentId"),
    opponent: formData.get("opponent"),
    notes: formData.get("notes"),
  });

  if (!parsed.success) {
    console.error(parsed.error.flatten().formErrors);
    return { ok: false, errors: parsed.error.flatten().fieldErrors };
  }

  const { title, matchDate, opponent, opponentId, notes } = parsed.data;

  await db
    .update(schema.matches)
    .set({
      title,
      opponentId: opponentId || null,
      opponent: opponent || null,
      notes: notes || null,
      matchDate: matchDate || null,
    })
    .where(eq(schema.matches.id, matchId));

  revalidatePath(`/matches/${matchId}`);
  revalidatePath("/");
  return { ok: true };
}

export async function createRally(formData: FormData) {
  const parsed = rallyFormSchema.safeParse({
    matchId: formData.get("matchId"),
    result: formData.get("result"),
    pointReason: formData.get("pointReason"),
    serveScore: formData.get("serveScore"),
    placementScore: formData.get("placementScore"),
    footworkScore: formData.get("footworkScore"),
    tacticScore: formData.get("tacticScore"),
    notes: formData.get("notes"),
  });

  if (!parsed.success) {
    console.error(parsed.error.flatten().formErrors);
    return { ok: false, errors: parsed.error.flatten().fieldErrors };
  }

  const data = parsed.data;

  let sequence: number | undefined = undefined;

  if (sequence === undefined) {
    const [current] = await db
      .select({
        maxSequence: sql<number>`coalesce(max(${schema.rallies.sequence}), 0)`,
      })
      .from(schema.rallies)
      .where(eq(schema.rallies.matchId, data.matchId));

    sequence = (current?.maxSequence ?? 0) + 1;
  }

  const [last] = await db
    .select()
    .from(schema.rallies)
    .where(eq(schema.rallies.matchId, data.matchId))
    .orderBy(desc(schema.rallies.sequence))
    .limit(1);

  const prevSelf =
    last?.endScoreSelf ?? last?.startScoreSelf ?? last?.endScoreSelf ?? 0;
  const prevOpp =
    last?.endScoreOpponent ??
    last?.startScoreOpponent ??
    last?.endScoreOpponent ??
    0;

  const startScoreSelf = prevSelf;
  const startScoreOpponent = prevOpp;
  const endScoreSelf = data.result === "win" ? prevSelf + 1 : prevSelf;
  const endScoreOpponent = data.result === "lose" ? prevOpp + 1 : prevOpp;
  const tacticScore = data.tacticScore ? Number(data.tacticScore) : null;

  await db.insert(schema.rallies).values({
    matchId: data.matchId,
    sequence,
    result: data.result,
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
  return { ok: true };
}
