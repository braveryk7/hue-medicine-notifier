'use client';

import React, { useEffect, useState } from 'react';
import LightIcon from '../../../public/light.svg';
import Lightstrip from '../../../public/lightstrip.svg';
import { hueLightToRGBA } from './_lib/hueColorToRGBA';
import { getLightsInfo } from '../_actions/getLightsInfo';
import { Light, Lights } from '../types/HueLight';
import { Loading } from '../_components/Loading';
import Link from 'next/link';

export default function Admin() {
  const [isFirstRender, setIsFirstRender] = useState(true);
  const [lightsStatus, setLightsStatus] = useState<Lights | undefined>(undefined);

  useEffect(() => {
    const fetchLights = async () => {
      try {
        const status = await getLightsInfo();
        setLightsStatus(status);
      } catch (error) {
        console.error(error);
      }
    };

    fetchLights();

    if (isFirstRender && lightsStatus) {
      setIsFirstRender(false);
    }

    const intervalId = setInterval(fetchLights, 5000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div>
      {!lightsStatus && <Loading />}
      {!isFirstRender && (!lightsStatus || Object.keys(lightsStatus).length === 0) && <div>データがありません</div>}
      {lightsStatus && (
        <div className="mx-12 p-4 text-gray-600">
          <ul className="grid grid-cols-1 gap-4 text-sm md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {lightsStatus.data.map((light: Light) => {
              if (light.type === 'light') {
                const lightArcheType = light.metadata.archetype;

                const hueColor = hueLightToRGBA(light);
                const color = hueColor.rgba;
                const isStatus = light.on.on;
                const statusOffStyle = isStatus ? 'bg-gray-700' : 'bg-gray-700/60';
                const lightOnShadow = isStatus ? 'shadow-yellow-300' : '';

                return (
                  <li key={light.id} className="grid min-h-[134px]">
                    <Link
                      href={`/admin/lightInfo/${light.id}`}
                      prefetch={false}
                      className={`grid grid-cols-6 border-b-2 bg-gray-200 py-4 pb-2 shadow-md ${lightOnShadow}`}
                    >
                      <div className="col-span-2 flex flex-col items-center justify-center gap-2">
                        {(lightArcheType === 'sultan_bulb' || lightArcheType === 'candle_bulb') && (
                          <LightIcon
                            className={`size-14 justify-center rounded-full p-4 ${statusOffStyle}`}
                            style={{ color, opacity: isStatus ? 1 : 0.6 }}
                          />
                        )}
                        {lightArcheType === 'hue_lightstrip' && (
                          <Lightstrip
                            className={`size-14 justify-center rounded-full p-4 ${statusOffStyle}`}
                            style={{ color, opacity: isStatus ? 1 : 0.6 }}
                          />
                        )}
                      </div>
                      <div className="col-span-4">
                        <p className="mb-2 font-bold ">{light.metadata.name || 'Unknown'}</p>
                        <ul className="pl-2">
                          <li className="font-bold">{color && `${color} `}</li>
                          <li>{hueColor.x && hueColor.y && `xy(${hueColor.x}, ${hueColor.y})`}</li>
                          <li>{hueColor.brightness && `Brightness(${hueColor.brightness})`}</li>
                          <li>{hueColor.colorTemperature && `ColorTemperature(${hueColor.colorTemperature})`}</li>
                        </ul>
                      </div>
                      <div className="col-span-6 flex items-end justify-center py-2 text-center">
                        <p>{light.id}</p>
                      </div>
                    </Link>
                  </li>
                );
              }
              return null;
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
