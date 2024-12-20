'use client';

import React, { Dispatch, ReactNode, SetStateAction, useEffect } from 'react';
import { ChangeEvent, useState, useTransition } from 'react';
import Color from 'colorjs.io';
import { registerPlan } from '../../../_actions/registerPlan';
import { useRouter } from 'next/navigation';
import { ColorModel, DisplayRgb, WhiteAmbianceModel, WhiteModel } from './components/FormParts';
import {
  generateColorModelToRGB,
  generateColorModelXy,
  generateWhiteAmbianceRGB,
  generateWhiteModelRGB,
} from '@/app/_lib/hueLightToRGB';
import { LightType } from '@/app/types/HueLight';
import { Ruby } from '@/app/_components/Ruby';
import { useKidsMode } from '@/app/_context/KidsModeContext';
import { Plan } from '@prisma/client';

type PlanFormProps = {
  userId: number;
  lightType: LightType;
  setPlansData: Dispatch<SetStateAction<Plan[] | undefined>>;
};

export default function PlanForm({ userId, lightType, setPlansData }: PlanFormProps) {
  const basicColor = '#FF0000';

  const { isKidsMode } = useKidsMode();

  const [planName, setPlanName] = useState('');
  const [timeOfDay, setTimeOfDay] = useState('');
  const [color, setColor] = useState(basicColor);
  const [colorTemperature, setColorTemperature] = useState(326);
  const [brightness, setBrightness] = useState(50);
  const [rgb, setRgb] = useState('rgb(247, 201, 161)');
  const [whiteRgb, setWhiteRgb] = useState('');
  const [xy, setXy] = useState({ x: 0, y: 0 });
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    const updateState: Record<LightType, () => void> = {
      color: () => {
        const convertedRgb = new Color(color).to('srgb').coords.map((value) => Math.round(value * 255));
        const [r, g, b] = convertedRgb;
        const rgbColor = generateColorModelToRGB(r, g, b, brightness);
        const { x, y } = generateColorModelXy(r, g, b, brightness);
        const newRgb = `rgb(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b})`;

        setRgb(newRgb);
        setWhiteRgb(newRgb);
        setXy({ x, y });
      },
      whiteAmbiance: () => {
        const rgbColor = generateWhiteAmbianceRGB(colorTemperature, brightness);
        setRgb(`rgb(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b})`);
        setWhiteRgb(`rgb(${rgbColor.whiteR}, ${rgbColor.whiteG}, ${rgbColor.whiteB})`);
      },
      white: () => {
        const rgbColor = generateWhiteModelRGB(brightness);
        setRgb(`rgb(${rgbColor.r}, ${rgbColor.g}, ${rgbColor.b})`);
        setWhiteRgb(rgb);
      },
    };

    updateState[lightType]();
  }, [lightType, color, setColor, colorTemperature, brightness]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const [hours, minutes] = timeOfDay.split(':').map(Number);
    const timeOfDayInMinutes = hours * 60 + minutes - 9 * 60;

    const generateLightTypeValue = () => {
      if (lightType === 'color') {
        return {
          xyX: xy.x,
          xyY: xy.y,
        };
      }

      if (lightType === 'whiteAmbiance') {
        return {
          colorTemperature,
        };
      }

      return {};
    };

    startTransition(async () => {
      const result = await registerPlan({
        userId,
        name: planName,
        timeOfDay: timeOfDayInMinutes,
        brightness,
        rgb,
        ...generateLightTypeValue(),
      });

      if (result.success) {
        setMessage(`プランが${isKidsMode ? 'とうろく' : '登録'}されました`);
        setPlanName('');
        setTimeOfDay('');
        setColor(basicColor);
        setPlansData(result.plans);
        router.refresh();
      } else {
        setMessage(
          result.error || `プラン${isKidsMode ? 'とうろく' : '登録'}に${isKidsMode ? 'しっぱい' : '失敗'}しました`,
        );
      }
    });
  };

  type FormConfig = {
    isInput: boolean;
    header: ReactNode;
    type: string;
    name: string;
    value: string;
    onChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    required: boolean;
    style: string;
    placeholder?: string;
  };

  const forms: Record<string, FormConfig> = {
    planName: {
      isInput: true,
      header: (
        <>
          プラン
          <Ruby kanji="名" ruby="めい" />
        </>
      ),
      type: 'text',
      name: 'planName',
      value: planName,
      onChange: (e) => setPlanName(e.target.value),
      required: true,
      style: 'col-span-3',
      placeholder: isKidsMode ? 'あさのおくすり' : '朝のおくすり',
    },
    timeOfDay: {
      isInput: true,
      header: <Ruby kanji="時間" ruby="じかん" />,
      type: 'time',
      name: 'timeOfDay',
      value: timeOfDay,
      onChange: (e) => setTimeOfDay(e.target.value),
      required: true,
      style: 'col-span-2',
    },
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-2">
        {Object.values(forms).map((form) => (
          <div key={form.name} className="grid grid-cols-6 gap-4 md:gap-0 md:[&_label]:leading-loose">
            <label className="col-span-2 text-center">{form.header}</label>
            <input
              type={form.type}
              name={form.name}
              value={form.value}
              onChange={(e: ChangeEvent<HTMLInputElement>) => form.onChange(e)}
              className={`rounded-md border-gray-300 shadow-sm md:pl-2 ${form.style}`}
              required={form.required}
              placeholder={form.placeholder}
            />
          </div>
        ))}
        {lightType === 'color' && (
          <ColorModel color={color} setColor={setColor} brightness={brightness} setBrightness={setBrightness} />
        )}
        {lightType === 'whiteAmbiance' && (
          <WhiteAmbianceModel
            ct={colorTemperature}
            setCt={setColorTemperature}
            brightness={brightness}
            setBrightness={setBrightness}
          />
        )}
        {lightType === 'white' && <WhiteModel brightness={brightness} setBrightness={setBrightness} />}
        <DisplayRgb rgb={whiteRgb} />
        <div className="text-center">
          <button
            type="submit"
            className="mt-4 rounded-lg bg-blue-500 px-12 py-2 text-white hover:bg-blue-600"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Ruby kanji="登録中" ruby="とうろくちゅう" />
                ...
              </>
            ) : (
              <Ruby kanji="登録" ruby="とうろく" />
            )}
          </button>
          <p className="text-green-500">{message || '\u00A0'}</p>
        </div>
      </form>
    </>
  );
}
