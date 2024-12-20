'use client';

import { useEffect, useState } from 'react';
import Shinkansen from '../../../../../../public/shinkansen.svg';
import Train from '../../../../../../public/train.svg';

type TrainIconProps = {
  isAnimating: boolean;
};

export const TrainIcon = ({ isAnimating }: TrainIconProps) => {
  const [shinkansenColor, setShinkansenColor] = useState('');
  const [trainColor, setTrainColor] = useState('');
  const [selectedTrain, setSelectedTrain] = useState<'Shinkansen' | 'Train'>('Shinkansen');

  useEffect(() => {
    const shinkansenColors: string[] = [
      '#007D40', // はやぶさ
      '#FFCC00', // ドクターイエロー
      '#0088CC', // のぞみ
      '#E60012', // こまち
      '#F8C300', // つばさ
      '#009BDB', // ひかり
      '#C724B1', // みずほ・さくら
      '#FFFFFF', // あさま
    ];
    const trainColors = [
      '#9acd32', // 山手線
      '#ff4500', // 中央線快速
      '#ffd700', // 中央・総武線各停
      '#1e90ff', // 京浜東北線
      '#008000', // 埼京線）
      '#ff8c00', // 湘南新宿ライン
      '#00008b', // 横須賀線
      '#ff7f50', // 東海道線
      '#8b0000', // 武蔵野線
      '#ff0000', // 京葉線
      '#006400', // 常磐線
      '#4682b4', // 総武快速線
      '#ff1493', // 京王線
      '#9400d3', // 東武アーバンパークライン
    ];

    const randomShinkansenColorIndex = Math.floor(Math.random() * shinkansenColors.length);
    const randomTrainColorIndex = Math.floor(Math.random() * trainColors.length);

    setShinkansenColor(shinkansenColors[randomShinkansenColorIndex]);
    setTrainColor(trainColors[randomTrainColorIndex]);

    const trainTypes = ['Shinkansen', 'Train'] as const;
    const randomTrainIndex = Math.floor(Math.random() * trainTypes.length);
    setSelectedTrain(trainTypes[randomTrainIndex]);
  }, [isAnimating]);

  return (
    <div
      className={`fixed left-0 top-1/2 h-auto w-60 -translate-y-1/2 overflow-visible ${
        isAnimating ? 'animate-trainMove' : 'hidden'
      }`}
      style={{ zIndex: 9999 }}
    >
      {selectedTrain === 'Shinkansen' ? (
        <Shinkansen className="size-full max-h-full max-w-full" style={{ fill: shinkansenColor }} />
      ) : (
        <Train className="size-full max-h-full max-w-full" style={{ fill: trainColor }} />
      )}
    </div>
  );
};
