import { z } from "zod";

export const optionalUuid = z
  .string()
  .uuid()
  .or(z.literal(""))
  .or(z.null())
  .transform((v) => (v ? v : undefined))
  .optional();

export const checkboxBoolean = z
  .preprocess(
    (value) =>
      value === "on" || value === "true" || value === true ? true : false,
    z.boolean()
  )
  .optional();

export const matchFormSchema = z.object({
  title: z.string().trim().min(1, "Match title is required"),
  matchDate: z.string().trim().optional(),
  opponentId: optionalUuid,
  opponent: z.string().trim().optional(),
  trainingOpponent: checkboxBoolean,
  tournamentId: optionalUuid,
  tournamentName: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

export const opponentFormSchema = z.object({
  name: z.string().trim().min(1, "Opponent name is required"),
  notes: z.string().trim().optional(),
});

export const rallyPointReasons = [
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

export const rallyFormSchema = z.object({
  matchId: z.string().uuid(),
  result: z.enum(["win", "lose"]),
  pointReason: z.enum(rallyPointReasons),
  excludeFromScore: checkboxBoolean,
  tacticUsed: checkboxBoolean,
  serveScore: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v ? Number(v) : null)),
  notes: z.string().trim().optional(),
});

export const rallyDeleteSchema = z.object({
  matchId: z.string().uuid(),
  rallyId: z.string().uuid(),
});

export const rallyUpdateFormSchema = rallyFormSchema.extend({
  rallyId: z.string().uuid(),
});

