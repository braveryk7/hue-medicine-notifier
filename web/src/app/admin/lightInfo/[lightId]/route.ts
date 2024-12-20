import { getLightInfo } from '@/app/_actions/getLightsInfo';
import { Lights } from '@/app/types/HueLight';
import { NextResponse, NextRequest } from 'next/server';

export async function GET(request: NextRequest, context: { params: Promise<{ lightId: string }> }) {
  try {
    // 非同期で params を取得
    const { lightId } = await context.params;
    const lightInfo: Lights = await getLightInfo(lightId);

    // lightInfo.data[0] が存在するかチェック
    if (!lightInfo || !lightInfo.data || lightInfo.data.length === 0) {
      return NextResponse.json({ error: 'Light not found' }, { status: 404 });
    }

    return NextResponse.json(lightInfo.data[0]);
  } catch (err: unknown) {
    console.error('Error fetching light info:', err);

    return NextResponse.json({ error: 'Failed to fetch light info' }, { status: 500 });
  }
}
