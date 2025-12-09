import {
  boolean,
  date,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const rallyResult = pgEnum("rally_result", ["win", "lose"]);
export const pointFor = pgEnum("point_for", ["self", "opponent"]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  username: text("username").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const opponents = pgTable(
  "opponents",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    training: boolean("training").notNull().default(false),
    notes: text("notes"),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    userIdx: index("opponents_user_id_idx").on(table.userId),
  })
);

export const tournaments = pgTable(
  "tournaments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    notes: text("notes"),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    userIdx: index("tournaments_user_id_idx").on(table.userId),
  })
);

export const matches = pgTable(
  "matches",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    matchDate: date("match_date"),
    opponent: text("opponent"),
    opponentId: uuid("opponent_id").references(() => opponents.id, {
      onDelete: "set null",
    }),
    tournamentId: uuid("tournament_id").references(() => tournaments.id, {
      onDelete: "set null",
    }),
    matchNumber: integer("match_number"),
    notes: text("notes"),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    userIdx: index("matches_user_id_idx").on(table.userId),
  })
);

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
    excludeFromScore: boolean("exclude_from_score").notNull().default(false),
    startScoreSelf: integer("start_score_self"),
    startScoreOpponent: integer("start_score_opponent"),
    endScoreSelf: integer("end_score_self"),
    endScoreOpponent: integer("end_score_opponent"),
    serveScore: integer("serve_score"),
    notes: text("notes"),
    tacticUsed: boolean("tactic_used").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    matchIdx: index("rallies_match_id_idx").on(table.matchId),
  })
);
