import { date, index, integer, jsonb, pgEnum, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const rallyResult = pgEnum("rally_result", ["win", "lose"]);
export const pointFor = pgEnum("point_for", ["self", "opponent"]);

export const opponents = pgTable("opponents", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const matches = pgTable("matches", {
  id: uuid("id").primaryKey().defaultRandom(),
  title: text("title").notNull(),
  matchDate: date("match_date"),
  opponent: text("opponent"),
  opponentId: uuid("opponent_id").references(() => opponents.id, {
    onDelete: "set null",
  }),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const rallies = pgTable(
  "rallies",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    matchId: uuid("match_id")
      .notNull()
      .references(() => matches.id, { onDelete: "cascade" }),
    sequence: integer("sequence"),
    result: rallyResult("result").notNull(),
    pointFor: pointFor("point_for").notNull(),
    pointReason: text("point_reason"),
    startScoreSelf: integer("start_score_self"),
    startScoreOpponent: integer("start_score_opponent"),
    endScoreSelf: integer("end_score_self"),
    endScoreOpponent: integer("end_score_opponent"),
    durationSeconds: integer("duration_seconds"),
    shotPattern: jsonb("shot_pattern").$type<Record<string, unknown> | null>(),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    matchIdx: index("rallies_match_id_idx").on(table.matchId),
  }),
);

