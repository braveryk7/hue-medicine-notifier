// src/app/_actions/registerUser.ts
'use server';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import prisma from '../../lib/prisma';

export async function registerUser(name: string, lightId: string, lightType: string, utcOffset: number) {
  try {
    const newUser = await prisma.user.create({
      data: { name, lightId, lightType, utcOffset },
    });

    return { success: true, user: newUser };
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError && error.code === 'P2002') {
      return { success: false, error: 'ユーザー名が既に使われています' };
    }

    return { success: false, error: 'ユーザー登録に失敗しました' };
  }
}
