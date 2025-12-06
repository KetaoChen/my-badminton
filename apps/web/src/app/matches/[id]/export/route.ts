import { NextResponse } from "next/server";

import { getMatchWithRallies } from "@/lib/actions";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const data = await getMatchWithRallies(params.id);

  if (!data) {
    return NextResponse.json({ error: "Match not found" }, { status: 404 });
  }

  const rows: string[] = [];
  rows.push(`"Match","${data.match.title.replace(/"/g, '""')}"`);
  rows.push(`"Date","${data.match.matchDate ?? ""}"`);
  rows.push(`"Opponent","${data.match.opponentName ?? ""}"`);
  rows.push("");
  rows.push(
    [
      "Sequence",
      "Result",
      "Reason",
      "StartScoreSelf",
      "StartScoreOpponent",
      "EndScoreSelf",
      "EndScoreOpponent",
      "DurationSeconds",
      "Notes",
    ]
      .map((h) => `"${h}"`)
      .join(","),
  );

  for (const rally of data.rallies) {
    const cells = [
      rally.sequence ?? "",
      rally.result,
      rally.pointReason ?? "",
      rally.startScoreSelf ?? "",
      rally.startScoreOpponent ?? "",
      rally.endScoreSelf ?? "",
      rally.endScoreOpponent ?? "",
      rally.durationSeconds ?? "",
      rally.notes ?? "",
    ].map((value) => `"${String(value).replace(/"/g, '""')}"`);

    rows.push(cells.join(","));
  }

  const csv = rows.join("\n");

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="match-${params.id}.csv"`,
    },
  });
}

