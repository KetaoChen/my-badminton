"use server";

import { db, schema } from "@my-badminton/db/client";
import { desc, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const matchFormSchema = z.object({
  title: z.string().trim().min(1, "Match title is required"),
  matchDate: z.string().trim().optional(),
  opponent: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

const rallyFormSchema = z.object({
  matchId: z.string().uuid(),
  sequence: z.string().trim().optional(),
  result: z.enum(["win", "lose"]),
  pointReason: z.string().trim().optional(),
  startScoreSelf: z.string().trim().optional(),
  startScoreOpponent: z.string().trim().optional(),
  endScoreSelf: z.string().trim().optional(),
  endScoreOpponent: z.string().trim().optional(),
  durationSeconds: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

export async function listMatches() {
  return db
    .select()
    .from(schema.matches)
    .orderBy(desc(schema.matches.createdAt));
}

export async function getMatchWithRallies(matchId: string) {
  const [match] = await db
    .select()
    .from(schema.matches)
    .where(eq(schema.matches.id, matchId));

  if (!match) {
    return null;
  }

  const rallyList = await db
    .select()
    .from(schema.rallies)
    .where(eq(schema.rallies.matchId, matchId))
    .orderBy(schema.rallies.sequence, desc(schema.rallies.createdAt));

  return { match, rallies: rallyList };
}

export async function createMatch(formData: FormData) {
  const parsed = matchFormSchema.safeParse({
    title: formData.get("title"),
    matchDate: formData.get("matchDate"),
    opponent: formData.get("opponent"),
    notes: formData.get("notes"),
  });

  if (!parsed.success) {
    console.error(parsed.error.flatten().formErrors);
    return { ok: false, errors: parsed.error.flatten().fieldErrors };
  }

  const { title, matchDate, opponent, notes } = parsed.data;

  await db.insert(schema.matches).values({
    title,
    opponent: opponent || null,
    notes: notes || null,
    matchDate: matchDate ? new Date(matchDate) : null,
  });

  revalidatePath("/");
  return { ok: true };
}

export async function createRally(formData: FormData) {
  const parsed = rallyFormSchema.safeParse({
    matchId: formData.get("matchId"),
    sequence: formData.get("sequence"),
    result: formData.get("result"),
    pointReason: formData.get("pointReason"),
    startScoreSelf: formData.get("startScoreSelf"),
    startScoreOpponent: formData.get("startScoreOpponent"),
    endScoreSelf: formData.get("endScoreSelf"),
    endScoreOpponent: formData.get("endScoreOpponent"),
    durationSeconds: formData.get("durationSeconds"),
    notes: formData.get("notes"),
  });

  if (!parsed.success) {
    console.error(parsed.error.flatten().formErrors);
    return { ok: false, errors: parsed.error.flatten().fieldErrors };
  }

  const data = parsed.data;

  const sequenceInput = data.sequence ? Number(data.sequence) : undefined;
  const startScoreSelf = data.startScoreSelf
    ? Number(data.startScoreSelf)
    : null;
  const startScoreOpponent = data.startScoreOpponent
    ? Number(data.startScoreOpponent)
    : null;
  const endScoreSelf = data.endScoreSelf ? Number(data.endScoreSelf) : null;
  const endScoreOpponent = data.endScoreOpponent
    ? Number(data.endScoreOpponent)
    : null;
  const durationSeconds = data.durationSeconds
    ? Number(data.durationSeconds)
    : null;

  let sequence = Number.isFinite(sequenceInput) ? sequenceInput : undefined;

  if (!sequence) {
    const [current] = await db
      .select({
        maxSequence: sql<number>`coalesce(max(${schema.rallies.sequence}), 0)`,
      })
      .from(schema.rallies)
      .where(eq(schema.rallies.matchId, data.matchId));

    sequence = (current?.maxSequence ?? 0) + 1;
  }

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
    durationSeconds,
    notes: data.notes || null,
  });

  revalidatePath(`/matches/${data.matchId}`);
  return { ok: true };
}
