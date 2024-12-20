import { Ruby } from '@/app/_components/Ruby';
import { useKidsMode } from '@/app/_context/KidsModeContext';
import {
  BrightnessSelectorProps,
  ColorModelProps,
  DisplayRangeValueProps,
  FormPartsWrapperProps,
  WhiteAmbianceModelProps,
  WhiteModelProps,
} from '@/app/types/Form';
import React, { ChangeEvent } from 'react';

const FormPartsWrapper = ({ children }: FormPartsWrapperProps) => {
  return <div className="grid grid-cols-6 gap-4 md:gap-0 md:[&_label]:leading-loose">{children}</div>;
};

const DisplayRangeValue = ({ value }: DisplayRangeValueProps) => {
  return value ? <span className="my-auto ml-4 text-sm">{value}%</span> : null;
};

const BrightnessSelector = ({ brightness, setBrightness }: BrightnessSelectorProps) => {
  return (
    <FormPartsWrapper>
      <label className="col-span-2 text-center">
        <Ruby kanji="明" ruby="あか" />
        るさ
      </label>
      <input
        type="range"
        min="1"
        max="100"
        value={brightness}
        onChange={(e) => setBrightness(Number(e.target.value))}
      />
      <DisplayRangeValue value={brightness} />
    </FormPartsWrapper>
  );
};

export const ColorModel = ({ color, setColor, brightness, setBrightness }: ColorModelProps) => {
  const { isKidsMode } = useKidsMode();

  const colors = {
    red: { name: '赤', kidsModeName: 'あか', rgb: '#FF0000' },
    green: { name: '緑', kidsModeName: 'みどり', rgb: '#00FF00' },
    blue: { name: '青', kidsModeName: 'あお', rgb: '#0000FF' },
    cyan: { name: 'シアン', kidsModeName: undefined, rgb: '#00FFFF' },
    magenta: { name: 'マゼンタ', kidsModeName: undefined, rgb: '#FF00FF' },
    yellow: { name: '黄色', kidsModeName: 'きいろ', rgb: '#FFFF00' },
    pink: { name: 'ピンク', kidsModeName: undefined, rgb: '#FFB6C1' },
    orange: { name: 'オレンジ', kidsModeName: undefined, rgb: '#FFA500' },
    lightBlue: { name: 'ライトブルー', kidsModeName: undefined, rgb: '#ADD8E6' },
    purple: { name: 'パープル', kidsModeName: undefined, rgb: '#800080' },
    turquoise: { name: 'ターコイズ', kidsModeName: undefined, rgb: '#40E0D0' },
    gold: { name: 'ゴールド', kidsModeName: undefined, rgb: '#FFD700' },
    lime: { name: 'ライム', kidsModeName: undefined, rgb: '#32CD32' },
    deepPink: { name: 'ディープピンク', kidsModeName: undefined, rgb: '#FF1493' },
    royalBlue: { name: 'ロイヤルブルー', kidsModeName: undefined, rgb: '#4169E1' },
    scarlet: { name: 'スカーレット', kidsModeName: undefined, rgb: '#FF2400' },
    warmWhite: { name: 'ウォームホワイト', kidsModeName: undefined, rgb: '#FFD2B3' },
    coolWhite: { name: 'クールホワイト', kidsModeName: undefined, rgb: '#E0FFFF' },
    candleLight: { name: 'キャンドルライト', kidsModeName: undefined, rgb: '#FFB199' },
    mintGreen: { name: 'ミントグリーン', kidsModeName: undefined, rgb: '#98FF98' },
  } as const;

  return (
    <>
      <div className="grid grid-cols-6 gap-4 md:gap-0 md:[&_label]:leading-loose">
        <label className="col-span-2 text-center">
          <Ruby kanji="色" ruby="いろ" />
        </label>
        <select
          id="color-select"
          name="color"
          value={color}
          onChange={(e: ChangeEvent<HTMLSelectElement>) => setColor(e.target.value)}
          className={'col-span-2 rounded-md border-gray-300 shadow-sm md:pl-2'}
        >
          {Object.entries(colors).map(([key, value]) => (
            <option key={key} value={value.rgb}>
              {isKidsMode ? (value.kidsModeName ? value.kidsModeName : value.name) : value.name}
            </option>
          ))}
        </select>
      </div>
      <BrightnessSelector brightness={brightness} setBrightness={setBrightness} />
    </>
  );
};

export const WhiteAmbianceModel = ({ ct, setCt, brightness, setBrightness }: WhiteAmbianceModelProps) => {
  return (
    <>
      <div className="grid grid-cols-6 gap-4 md:gap-0 md:[&_label]:leading-loose">
        <label className="col-span-2 text-center">
          <Ruby kanji="色温度" ruby="いろおんど" />
        </label>
        <input type="range" min="153" max="500" value={ct} onChange={(e) => setCt(Number(e.target.value))} />
        <DisplayRangeValue value={ct} />
      </div>
      <BrightnessSelector brightness={brightness} setBrightness={setBrightness} />
    </>
  );
};

export const WhiteModel = ({ brightness, setBrightness }: WhiteModelProps) => {
  return <BrightnessSelector brightness={brightness} setBrightness={setBrightness} />;
};

export const DisplayRgb = ({ rgb }: { rgb: string }) => {
  return (
    <output className="mx-6 block h-2 rounded-full border border-gray-400" style={{ backgroundColor: rgb }}></output>
  );
};
