'use client';

import { useEffect, useState, useTransition, FormEvent } from 'react';
import { registerUser } from '@/app/_actions/registerUser';
import { getLightsInfo } from '../_actions/getLightsInfo';
import { Light } from '../types/HueLight';
import { TimeZoneSelector } from '../_components/TimeZoneSelector';
import moment from 'moment-timezone';

const Register = () => {
  const [lightsData, setLightsData] = useState<{ [key: string]: Light } | undefined>(undefined);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [selectedLightId, setSelectedLightId] = useState('');
  const [selectedTimeZoneOffset, setSelectedTimeZoneOffset] = useState({
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    offSet: moment.tz(Intl.DateTimeFormat().resolvedOptions().timeZone).utcOffset(),
  });
  const [isPending, startTransition] = useTransition();

  const lightType = (lightData: Light, isJapanese: boolean = false) => {
    const currentLight = lightData;

    if (!currentLight.color && !currentLight.color_temperature) {
      return isJapanese ? 'ホワイト' : 'white';
    }

    if (!currentLight.color?.xy && currentLight.color_temperature) {
      return isJapanese ? 'ホワイトアンビアンス' : 'whiteAmbiance';
    }

    return isJapanese ? 'カラー' : 'color';
  };

  const fetchLight = async () => {
    try {
      const response = await getLightsInfo();

      const typeLightLists = response.data.filter((light) => light.type === 'light');
      const lightList = typeLightLists.reduce((acc: { [key: string]: Light }, light: Light) => {
        if (light.type === 'light') {
          acc[light.id] = light;
        }

        return acc;
      }, {});

      const firstLightId = Object.keys(lightList)[0];

      setLightsData(lightList);

      if (firstLightId) {
        setSelectedLightId(firstLightId);
      }
    } catch (error) {
      console.error('データ更新時のエラー:', error);
    }
  };

  useEffect(() => {
    fetchLight();
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage('');

    startTransition(async () => {
      if (lightsData) {
        const lightId = selectedLightId;
        const result = await registerUser(
          name,
          lightId,
          lightType(lightsData[selectedLightId]),
          selectedTimeZoneOffset.offSet,
        );

        if (result.success && result.user) {
          setMessage(`ユーザー: ${result.user.name} が登録されました`);
          setName('');
        } else {
          setMessage(result.error || 'ユーザー登録に失敗しました');
        }
      }
    });
  };

  return (
    <div className="flex flex-col items-center justify-center py-2">
      <h1 className="text-2xl font-bold">新規ユーザー登録</h1>
      <form
        className="
          mt-4 w-full p-4 text-sm [&_div]:my-4 [&_div]:grid
          [&_div]:grid-cols-8 [&_div_label]:col-span-2 [&_div_label]:flex
          [&_div_label]:items-center [&_div_label]:justify-center [&_div_label]:text-center
        "
        onSubmit={handleSubmit}
      >
        <div>
          <label htmlFor="userName">ユーザー名</label>
          <input
            id="userName"
            type="text"
            placeholder="ユーザー名"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="col-span-6 rounded border p-2"
            required
          />
        </div>
        <div>
          <label htmlFor="light">ライト</label>
          <select
            id="light"
            className="col-span-6 rounded border p-2"
            onChange={(e) => setSelectedLightId(e.target.value)}
            value={selectedLightId}
          >
            {lightsData &&
              Object.values(lightsData).map((light) => (
                <option key={light.id} value={light.id}>
                  {`${light.metadata?.name} - ${lightType(light, true)}`}
                </option>
              ))}
          </select>
        </div>
        <TimeZoneSelector
          selectedTimeZoneOffset={selectedTimeZoneOffset}
          setSelectedTimeZoneOffset={setSelectedTimeZoneOffset}
        />
        <button type="submit" className="col-span-6 mt-2 w-16 rounded bg-blue-500 py-2 text-white" disabled={isPending}>
          {isPending ? '登録中...' : '登録'}
        </button>
      </form>
      {lightsData && selectedLightId && !lightsData[selectedLightId].color?.xy && (
        <div className="m-4 bg-red-200 p-4 text-center text-black">
          <p>このライトは色調変更はできません。</p>
        </div>
      )}
      {message && <p className="mt-4 text-red-500">{message}</p>}
    </div>
  );
};

export default Register;
