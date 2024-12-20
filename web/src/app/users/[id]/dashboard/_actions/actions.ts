'use server';

import prisma from '@/lib/prisma';
import { Plan, Task, User } from '@prisma/client';

export async function toggleActivePlan(planId: number, isActive: boolean) {
  try {
    const updatedPlan = await prisma.plan.update({
      where: { id: planId },
      data: { isActive },
    });
    return updatedPlan;
  } catch (error) {
    console.error('Failed to update plan:', error);
    throw new Error("Failed to update the plan's isDeleted status");
  }
}

export const updateNote = async (planId: number, note: string) => {
  try {
    await prisma.plan.update({
      where: { id: planId },
      data: { note },
    });
  } catch (error) {
    console.error('Failed to update plan:', error);
    throw new Error('Failed to update the plan');
  }
};

export async function deletePlan(planId: number): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.plan.delete({
      where: { id: planId },
    });
    return { success: true };
  } catch (error) {
    console.error('プラン削除に失敗しました:', error);
    return { success: false, error: 'プラン削除に失敗しました' };
  }
}

export const taskCompleted = async (taskId: number, isCompleted: boolean) => {
  try {
    await prisma.task.update({
      where: { id: taskId },
      data: {
        isCompleted,
        completedAt: new Date(),
      },
    });

    if (!isCompleted) {
      await prisma.task.update({
        where: { id: taskId },
        data: {
          completedAt: null,
        },
      });
    }

    return { success: true };
  } catch (error) {
    console.error('タスクステータス更新に失敗しました:', error);
    throw new Error('Failed to update the task');
  }
};

export const fetchLogs = async (userId: number): Promise<Task[]> => {
  try {
    const logs = await prisma.task.findMany({
      where: {
        plan: { userId },
      },
      orderBy: { completedAt: 'desc' },
    });

    return logs;
  } catch (error) {
    console.error('ログ取得に失敗しました:', error);
    throw new Error('Failed to fetch logs');
  }
};

export const getTask = async (userId: number) => {
  // 現在の日時
  const now = new Date();

  // JST基準の日付を取得
  const jstOffset = 9 * 60 * 60 * 1000; // JSTはUTC+9時間（ミリ秒）
  const jstNow = new Date(now.getTime() + jstOffset);

  // JST基準の0時を UTC タイムスタンプに変換
  const utcStartTimestamp =
    Math.floor(Date.UTC(jstNow.getUTCFullYear(), jstNow.getUTCMonth(), jstNow.getUTCDate(), 0, 0, 0) / 1000) -
    9 * 60 * 60;

  // JST基準の翌日の0時を UTC タイムスタンプに変換
  const utcEndTimestamp = utcStartTimestamp + 24 * 60 * 60 - 1;

  const tasks = await prisma.task.findMany({
    where: {
      date: {
        gte: utcStartTimestamp, // JST 0時の UTC タイムスタンプ
        lt: utcEndTimestamp, // JST 翌日0時の UTC タイムスタンプ
      },
      plan: {
        userId,
      },
    },
  });

  return tasks;
};

export const getUser = async (id: number): Promise<User | undefined> => {
  const user = await prisma.user.findUnique({
    where: { id },
  });

  return user ?? undefined;
};

export const getPlans = async (id: number): Promise<Plan[] | undefined> => {
  const plans = await prisma.plan.findMany({
    where: { userId: id },
  });

  return plans ?? undefined;
};
