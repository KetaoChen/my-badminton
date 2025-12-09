"use client";

import { Checkbox, Tag } from "antd";

import { type AnalysisMatch } from "./types";

type Props = {
  matches: AnalysisMatch[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
};

export function MatchSelector({ matches, selectedIds, onChange }: Props) {
  const allSelected = selectedIds.length === matches.length;

  const toggleAll = (checked: boolean) => {
    if (checked) {
      onChange(matches.map((m) => m.id));
    } else {
      onChange([]);
    }
  };

  const toggleOne = (id: string, checked: boolean) => {
    if (checked) {
      onChange([...new Set([...selectedIds, id])]);
    } else {
      onChange(selectedIds.filter((x) => x !== id));
    }
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-slate-900">比赛列表</p>
          <p className="text-xs text-slate-500">已筛选 {matches.length} 场</p>
        </div>
        <Checkbox
          checked={allSelected}
          indeterminate={!allSelected && selectedIds.length > 0}
          onChange={(e) => toggleAll(e.target.checked)}
        >
          全选
        </Checkbox>
      </div>
      <div className="max-h-80 overflow-auto divide-y divide-slate-100">
        {matches.length === 0 ? (
          <div className="px-6 py-4 text-sm text-slate-500">筛选结果无比赛</div>
        ) : (
          matches.map((m) => {
            const checked = selectedIds.includes(m.id);
            const win = m.wins > m.losses;
            const draw = m.wins === m.losses;
            return (
              <button
                type="button"
                key={m.id}
                className="flex w-full items-center gap-3 bg-white px-6 py-3 text-left hover:bg-slate-50 focus:outline-none"
                onClick={() => toggleOne(m.id, !checked)}
              >
                <Checkbox
                  checked={checked}
                  onChange={(e) => {
                    e.stopPropagation();
                    toggleOne(m.id, e.target.checked);
                  }}
                />
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-900">
                      {m.matchDate ?? "无日期"} · {m.title}
                    </span>
                    <Tag color={win ? "green" : draw ? "default" : "red"}>
                      {win ? "胜" : draw ? "平" : "负"}
                    </Tag>
                  </div>
                  <div className="text-xs text-slate-600">
                    对手：{m.opponentName} · 得失分：{m.wins}-{m.losses}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
