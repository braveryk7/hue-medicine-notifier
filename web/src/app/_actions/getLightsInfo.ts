'use server';

import https from 'https';
import fs from 'fs';
import nodeFetch from 'node-fetch';
import { Lights } from '../types/HueLight';

const httpsAgent = () => {
  const bridgeIp = process.env.BRIDGE_IP;
  const bridgeId = process.env.BRIDGE_ID;
  const certPath = './cert/hue-bridge-cert.pem';

  if (!bridgeIp || !bridgeId) {
    throw new Error('環境変数が設定されていません');
  }

  return new https.Agent({
    ca: fs.readFileSync(certPath),
    rejectUnauthorized: true,
    checkServerIdentity: (hostname) => {
      if (hostname !== bridgeId) {
        throw new Error(`Hostname mismatch: expected "${bridgeId}" but got "${hostname}"`);
      }

      return undefined;
    },
    lookup: (hostname, options, callback) => {
      if (options?.all) {
        if (hostname === bridgeId) {
          return callback(null, [{ address: bridgeIp, family: 4 }]);
        }

        return callback(new Error(`Unknown hostname: ${hostname}`), []);
      } else {
        if (hostname === bridgeId) {
          return callback(null, bridgeIp, 4);
        }

        return callback(new Error(`Unknown hostname: ${hostname}`), '', 4);
      }
    },
  });
};

export const getLightsInfo = async (): Promise<Lights> => {
  const accessToken = process.env.ACCESS_TOKEN;
  const bridgeId = process.env.BRIDGE_ID;

  if (!accessToken) {
    throw new Error('環境変数が設定されていません');
  }

  const endPoint = `https://${bridgeId}/clip/v2/resource`;

  const response = await nodeFetch(endPoint, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'hue-application-key': accessToken,
    },
    agent: httpsAgent(),
  });

  if (!response.ok) {
    throw new Error(`HTTPエラー: ${response.status}`);
  }

  const data = (await response.json()) as Lights;

  return data;
};

export const getLightInfo = async (lightId: string): Promise<Lights> => {
  const accessToken = process.env.ACCESS_TOKEN;
  const bridgeId = process.env.BRIDGE_ID;

  if (!accessToken) {
    throw new Error('環境変数が設定されていません');
  }

  const endPoint = `https://${bridgeId}/clip/v2/resource/light/${lightId}`;

  const response = await nodeFetch(endPoint, {
    method: 'GET',
    headers: {
      'hue-application-key': accessToken,
      'Content-Type': 'application/json',
    },
    agent: httpsAgent(),
  });

  if (!response.ok) {
    throw new Error(`HTTPエラー: ${response.status}`);
  }

  const data = (await response.json()) as Lights;

  return data;
};
