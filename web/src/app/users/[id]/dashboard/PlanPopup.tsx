import React, { useState } from 'react';
import Color from 'colorjs.io';

import type { Plan, User } from '@prisma/client';
import { minutesToTime } from '@/app/_lib/minutesToTime';
import { Ruby } from '@/app/_components/Ruby';

type PlanPopupProps = {
  plan: Plan;
  user: User;
  onClose: () => void;
  onActiveToggle: (planId: number, isActive: boolean) => void;
  planNote: string;
  onUpdateNote: (planId: number, note: string) => void;
  onDelete: (planId: number) => void;
};

export default function PlanPopup({
  plan,
  user,
  onClose,
  onActiveToggle,
  planNote,
  onUpdateNote,
  onDelete,
}: PlanPopupProps) {
  const [isActive, setIsActive] = useState(plan.isActive || false);

  const color = new Color(plan.rgb).toString({
    format: 'hex',
  });

  const handleActiveToggle = () => {
    const newIsActive = !isActive;
    setIsActive(newIsActive);
    onActiveToggle(plan.id, newIsActive);
  };

  const handleDelete = () => {
    onDelete(plan.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50" onClick={onClose}>
      <div className="mx-4 w-full max-w-md rounded-lg bg-white p-6 shadow-lg" onClick={(e) => e.stopPropagation()}>
        <div className="grid grid-cols-8">
          <h2 className="col-span-7 mb-2 text-xl font-bold">{plan.name}</h2>
          <div
            onClick={handleActiveToggle}
            className={`relative col-span-1 mt-1 h-5 w-10 cursor-pointer rounded-full ${
              isActive ? 'bg-green-500' : 'bg-gray-300'
            }`}
          >
            <div
              className={`absolute left-0.5 top-0.5 size-4 rounded-full bg-white transition-transform ${
                isActive ? 'translate-x-5' : ''
              }`}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 px-12 [&>*]:text-center md:[&>*]:leading-loose">
          <dd>
            <Ruby kanji="時間" ruby="じかん" />
          </dd>
          <dt>{minutesToTime(plan.timeOfDay, user.utcOffset)}</dt>
          <dd>
            <Ruby kanji="色" ruby="いろ" />
          </dd>
          <dt>
            <span
              style={{
                display: 'inline-block',
                width: '.8rem',
                height: '.8rem',
                backgroundColor: color,
                borderRadius: '4px',
                border: '1px solid #ccc',
                marginLeft: '0.2rem',
              }}
            ></span>
            {color}
          </dt>
        </div>
        <div className="mt-2">
          <textarea
            className="min-h-10 w-full border p-1"
            placeholder="メモ"
            value={planNote}
            onChange={(e) => onUpdateNote(plan.id, e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <button onClick={onClose} className="mt-4 rounded-lg bg-blue-500 px-4 py-2 text-white">
            <Ruby kanji="閉" ruby="と" />
            じる
          </button>
          <button
            onClick={handleDelete}
            className={`mt-4 rounded-lg px-4 py-2 text-white ${
              isActive ? 'cursor-not-allowed bg-gray-300' : 'cursor-pointer bg-red-500'
            }`}
            disabled={isActive ? true : false}
          >
            <Ruby kanji="完全" ruby="かんぜん" />に<Ruby kanji="削除" ruby="さくじょ" />
          </button>
        </div>
      </div>
    </div>
  );
}
