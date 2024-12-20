// registerPlan.ts (サーバー側関数)
'use server';

import prisma from '@/lib/prisma';
import { Plan, Prisma } from '@prisma/client';

type RegisterPlanResult = { success: true; plans: Plan[] } | { success: false; error: string };

export async function registerPlan(params: Prisma.PlanUncheckedCreateInput): Promise<RegisterPlanResult> {
  const { userId } = params;

  try {
    // プランの登録
    await prisma.plan.create({
      data: params,
    });

    // 最新のプラン一覧を取得
    const updatedPlans = await prisma.plan.findMany({
      where: { userId },
    });

    return { success: true, plans: updatedPlans };
  } catch (error) {
    console.error('プラン登録に失敗しました:', error);
    return { success: false, error: 'プラン登録に失敗しました' };
  }
}
