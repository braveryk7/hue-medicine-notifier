'use client';

import { useState, useEffect } from 'react';
import PlanPopup from './PlanPopup';
import { deletePlan, toggleActivePlan, updateNote } from './_actions/actions';

import type { Plan, User } from '@prisma/client';
import { minutesToTime } from '@/app/_lib/minutesToTime';
import { Ruby } from '@/app/_components/Ruby';

type PlanListProps = {
  plans: Plan[];
  user: User;
};

export default function PlanList({ plans: initialPlans, user }: PlanListProps) {
  const [plans, setPlans] = useState(initialPlans);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  const { utcOffset } = user;

  useEffect(() => {
    setPlans(initialPlans);
  }, [initialPlans]);

  const handleCardClick = (plan: Plan) => {
    setSelectedPlan(plan);
  };

  const closePopup = () => {
    setSelectedPlan(null);
  };

  const handleActiveToggle = async (planId: number, isActive: boolean) => {
    setPlans((prevPlans) => prevPlans.map((plan) => (plan.id === planId ? { ...plan, isActive } : plan)));
    try {
      await toggleActivePlan(planId, isActive);
    } catch (error) {
      console.error('Failed to update delete status:', error);
    }
  };

  const handlePlanNote = async (planId: number, note: string) => {
    if (selectedPlan) {
      setSelectedPlan({ ...selectedPlan, note });
    }
    setPlans((prevPlans) => prevPlans.map((plan) => (plan.id === planId ? { ...plan, note } : plan)));
    await updateNote(planId, note);
  };

  const plansCondition = () => {
    const activePlans: Plan[] = [];
    const deletedPlans: Plan[] = [];

    plans.forEach((plan) => {
      if (plan.isActive) activePlans.push(plan);
      else deletedPlans.push(plan);
    });

    return { activePlans, deletedPlans };
  };

  return (
    <div className="rounded-lg border bg-gray-50 p-4 md:col-span-2 md:pb-8">
      <h2 className="mb-4 text-center text-lg">
        <Ruby kanji="登録" ruby="とうろく" />
        <Ruby kanji="済" ruby="ず" />
        みプラン
      </h2>
      {plans.length === 0 ? (
        <p>
          プランは
          <Ruby kanji="登録" ruby="とうろく" />
          されていません。
        </p>
      ) : (
        <div className="mt-8">
          <h3 className="pb-4 text-lg">
            <Ruby kanji="有効" ruby="ゆうこう" />
            なプラン
          </h3>
          <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {plansCondition().activePlans.map(
              (plan) =>
                plan.isActive && (
                  <li
                    key={plan.id}
                    role="button"
                    onClick={() => handleCardClick(plan)}
                    className="
                      flex cursor-pointer flex-col justify-between rounded-lg 
                      border border-gray-200 bg-white p-4 shadow-lg
                    "
                  >
                    <h2 className="text-lg font-semibold">{plan.name}</h2>
                    <p className="text-gray-700">{minutesToTime(plan.timeOfDay, utcOffset)}</p>
                  </li>
                ),
            )}
          </ul>
        </div>
      )}
      <div className="mt-8">
        <h3 className="pb-4 text-lg">
          <Ruby kanji="無効" ruby="むこう" />
          なプラン
        </h3>
        {plansCondition().deletedPlans.length > 0 && (
          <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            {plansCondition().deletedPlans.map((plan) => (
              <li
                key={plan.id}
                onClick={() => handleCardClick(plan)}
                className="
                  flex cursor-pointer flex-col justify-between rounded-lg 
                  border border-gray-200 bg-white p-4 opacity-50 shadow-lg
                "
              >
                <h2 className="text-lg font-semibold">{plan.name}</h2>
                <p className="text-gray-700">{minutesToTime(plan.timeOfDay, utcOffset)}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      {selectedPlan && (
        <PlanPopup
          plan={selectedPlan}
          user={user}
          onClose={closePopup}
          onActiveToggle={handleActiveToggle}
          planNote={selectedPlan.note || ''}
          onUpdateNote={handlePlanNote}
          onDelete={async (planId) => {
            const result = await deletePlan(planId);
            if (result.success) {
              setPlans((prevPlans) => prevPlans.filter((plan) => plan.id !== planId));
            }
          }}
        />
      )}
    </div>
  );
}
