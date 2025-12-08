"use server";

import { db, schema } from "@my-badminton/db/client";
import { asc, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

import { requireAuth } from "@/lib/auth";
import {
  rallyDeleteSchema,
  rallyFormSchema,
  rallyUpdateFormSchema,
} from "./schemas";

export async function createRally(formData: FormData): Promise<void> {
  const userId = await requireAuth();
  const parsed = rallyFormSchema.safeParse({
    matchId: formData.get("matchId"),
    result: formData.get("result"),
    pointReason: formData.get("pointReason"),
    excludeFromScore: formData.get("excludeFromScore"),
    tacticUsed: formData.get("tacticUsed"),
    serveScore: formData.get("serveScore"),
    notes: formData.get("notes"),
  });

  if (!parsed.success) {
    console.error(parsed.error.flatten().formErrors);
    return;
  }

  const data = parsed.data;
  const [matchOwner] =
    (await db
      .select({ userId: schema.matches.userId })
      .from(schema.matches)
      .where(eq(schema.matches.id, data.matchId))
      .limit(1)) ?? [];
  if (!matchOwner || matchOwner.userId !== userId) {
    throw new Error("Unauthorized");
  }

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
  await db.insert(schema.rallies).values({
    matchId: data.matchId,
    sequence,
    result: data.result,
    excludeFromScore: !!data.excludeFromScore,
    pointFor: data.result === "win" ? "self" : "opponent",
    pointReason: data.pointReason || null,
    tacticUsed: !!data.tacticUsed,
    startScoreSelf,
    startScoreOpponent,
    endScoreSelf,
    endScoreOpponent,
    serveScore: data.serveScore ?? null,
    notes: data.notes || null,
  });

  revalidatePath(`/matches/${data.matchId}`);
}

export async function updateRally(formData: FormData): Promise<void> {
  const userId = await requireAuth();
  const parsed = rallyUpdateFormSchema.safeParse({
    rallyId: formData.get("rallyId"),
    matchId: formData.get("matchId"),
    result: formData.get("result"),
    pointReason: formData.get("pointReason"),
    excludeFromScore: formData.get("excludeFromScore"),
    tacticUsed: formData.get("tacticUsed"),
    serveScore: formData.get("serveScore"),
    notes: formData.get("notes"),
  });

  if (!parsed.success) {
    console.error(parsed.error.flatten().formErrors);
    return;
  }

  const data = parsed.data;
  const [matchOwner] =
    (await db
      .select({ userId: schema.matches.userId })
      .from(schema.matches)
      .where(eq(schema.matches.id, data.matchId))
      .limit(1)) ?? [];
  if (!matchOwner || matchOwner.userId !== userId) {
    throw new Error("Unauthorized");
  }
  const ralliesList = await db
    .select()
    .from(schema.rallies)
    .where(eq(schema.rallies.matchId, data.matchId))
    .orderBy(asc(schema.rallies.sequence), asc(schema.rallies.createdAt));

  const updatedRallies = ralliesList.map((r) =>
    r.id === data.rallyId
      ? {
          ...r,
          result: data.result,
          pointReason: data.pointReason,
          excludeFromScore: !!data.excludeFromScore,
          tacticUsed: !!data.tacticUsed,
          serveScore: data.serveScore ?? null,
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
        tacticUsed: !!r.tacticUsed,
        startScoreSelf,
        startScoreOpponent,
        endScoreSelf,
        endScoreOpponent,
        serveScore: r.serveScore ?? null,
        notes: r.notes || null,
      })
      .where(eq(schema.rallies.id, r.id));
  }

  revalidatePath(`/matches/${data.matchId}`);
  revalidatePath("/");
}

export async function deleteRally(formData: FormData): Promise<void> {
  const userId = await requireAuth();
  const parsed = rallyDeleteSchema.safeParse({
    matchId: formData.get("matchId"),
    rallyId: formData.get("rallyId"),
  });

  if (!parsed.success) {
    console.error(parsed.error.flatten().formErrors);
    return;
  }

  const { matchId, rallyId } = parsed.data;
  const [matchOwner] =
    (await db
      .select({ userId: schema.matches.userId })
      .from(schema.matches)
      .where(eq(schema.matches.id, matchId))
      .limit(1)) ?? [];
  if (!matchOwner || matchOwner.userId !== userId) {
    throw new Error("Unauthorized");
  }

  // 先删除，再重新拉取剩余回合并重排序号/比分
  await db.delete(schema.rallies).where(eq(schema.rallies.id, rallyId));

  const ralliesList = await db
    .select()
    .from(schema.rallies)
    .where(eq(schema.rallies.matchId, matchId))
    .orderBy(asc(schema.rallies.sequence), asc(schema.rallies.createdAt));

  const remaining = ralliesList;

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
        tacticUsed: !!r.tacticUsed,
        excludeFromScore: !!r.excludeFromScore,
        notes: r.notes || null,
      })
      .where(eq(schema.rallies.id, r.id));
  }

  revalidatePath(`/matches/${matchId}`);
  revalidatePath("/");
}
