"use client";

import Link from "next/link";
import { Button, Space } from "antd";

import { updateMatch } from "@/lib/actions";
import { DeleteMatchButton } from "../DeleteMatchButton";
import { MatchEditModal } from "../MatchEditModal";
import { type Match } from "./types";

type Props = {
  match: Match;
  opponents: { id: string; name: string }[];
  tournaments: { id: string; name: string }[];
};

export function MatchHeaderActions({ match, opponents, tournaments }: Props) {
  return (
    <Space>
      <MatchEditModal
        match={match}
        opponents={opponents}
        tournaments={tournaments}
        action={updateMatch.bind(null, match.id)}
      />
      <div className="hidden sm:block">
        <DeleteMatchButton matchId={match.id} />
      </div>
      <Button type="link">
        <Link href="/">返回列表</Link>
      </Button>
    </Space>
  );
}

