'use client';

import type { Plan, Task, User } from '@prisma/client';

import { useCallback, useEffect, useState } from 'react';
import { Toggle } from '@/app/_components/Toggle';
import { getTask, taskCompleted } from '../_actions/actions';
import { minutesToTime } from '@/app/_lib/minutesToTime';
import { Ruby } from '@/app/_components/Ruby';
import { Loading } from '@/app/_components/Loading';
import { TrainIcon } from './TrainIcon';
import { useKidsMode } from '@/app/_context/KidsModeContext';

export const TaskForm = ({ user, plans }: { user: User; plans: Plan[] }) => {
  const { id: userId, utcOffset } = user;
  const { isKidsMode } = useKidsMode();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [planList, setPlanList] = useState<Record<number, Plan>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  const fetchTasks = useCallback(async () => {
    try {
      const fetchedTasks = await getTask(userId);
      const sortedTasks = fetchedTasks.sort((a, b) => a.date - b.date);

      setTasks(sortedTasks);
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    }
  }, [userId]);

  useEffect(() => {
    if (tasks.length === 0) {
      fetchTasks();
    }
  }, [fetchTasks, tasks.length]);

  useEffect(() => {
    setPlanList(
      plans.reduce(
        (acc, plan) => {
          acc[plan.id] = plan;
          return acc;
        },
        {} as Record<number, Plan>,
      ),
    );
  }, [plans]);

  console.log('tasks:', tasks);

  const handleToggle = (taskId: number, isCompleted: boolean) => {
    setTasks((prevTasks) => prevTasks.map((task) => (task.id === taskId ? { ...task, isCompleted } : task)));
    taskCompleted(taskId, isCompleted);

    // 電車アニメーションをトリガー
    if (isCompleted) {
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 3000); // アニメーション終了後にリセット
    }
  };

  return (
    <>
      {isKidsMode && <TrainIcon isAnimating={isAnimating} />}
      {isLoading && <Loading />}
      {!isLoading &&
        (tasks.length > 0 ? (
          <form className="w-full">
            {tasks.map((task) => {
              const plan = planList[task.planId];
              return (
                <div key={task.id} className="flex items-center gap-2 p-2">
                  <Toggle id={task.id} isChecked={task.isCompleted} handleToggle={handleToggle} />
                  <span className="inline-block translate-y-[-0.1em]">
                    {`${minutesToTime(plan?.timeOfDay, utcOffset)} `}
                    {plan?.name}
                  </span>
                </div>
              );
            })}
          </form>
        ) : (
          <p>
            <Ruby kanji="登録" ruby="とうろく" />
            されたタスクがありません
          </p>
        ))}
    </>
  );
};
