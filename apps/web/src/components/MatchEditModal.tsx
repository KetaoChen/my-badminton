"use client";

import { useState } from "react";

import { Button } from "antd";
import { Modal } from "./Modal";
import { MatchEditForm } from "./match/MatchEditForm";
import { type Option } from "./home/types";
import { type EditableMatch } from "./match/types";

type Props = {
  match: EditableMatch;
  opponents: Option[];
  tournaments: Option[];
  action: (formData: FormData) => Promise<void>;
};

export function MatchEditModal({
  match,
  opponents,
  tournaments,
  action,
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>编辑比赛</Button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="编辑比赛信息"
      >
        <MatchEditForm
          match={match}
          opponents={opponents}
          tournaments={tournaments}
          action={action}
          onSubmitted={() => setOpen(false)}
        />
      </Modal>
    </>
  );
}
