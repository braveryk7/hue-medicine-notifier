import Color from 'colorjs.io';

// カラーモデル用に RGB を生成する関数
export const generateColorModelXy = (r: number, g: number, b: number, brightness: number): { x: number; y: number } => {
  // Color.js を使用して RGB を XYZ に変換
  const color = new Color('srgb', [r / 255, g / 255, b / 255]); // RGB を正規化
  const [X, Y_base, Z] = color.to('xyz').coords;

  // 明るさをスケール (0-1)
  const bri = Math.min(Math.max(brightness, 0), 100) / 100;

  // Y 値に明るさを反映
  const Y = Y_base * bri;

  // x, y を計算Phi
  const x = X / (X + Y + Z);
  const y = Y / (X + Y + Z);

  return { x: isNaN(x) ? 0 : x, y: isNaN(y) ? 0 : y }; // NaN 対策
};

export const generateColorModelToRGB = (
  r: number,
  g: number,
  b: number,
  brightness: number,
): { r: number; g: number; b: number } => {
  // 明るさを 0 ～ 1 の範囲に正規化
  const scaledBrightness = Math.min(Math.max(brightness, 0), 100) / 100;

  // ガラス越しの色（低輝度時のデフォルト色）
  const glassColor = { r: 240, g: 240, b: 240 }; // 白っぽい色

  // 各チャネルに明るさを適用 + ガラス越しの色を混ぜる
  const adjustedR = Math.round(r * scaledBrightness + glassColor.r * (1 - scaledBrightness));
  const adjustedG = Math.round(g * scaledBrightness + glassColor.g * (1 - scaledBrightness));
  const adjustedB = Math.round(b * scaledBrightness + glassColor.b * (1 - scaledBrightness));

  return { r: adjustedR, g: adjustedG, b: adjustedB };
};

// White モデル用に RGB を生成する関数
export const generateWhiteModelRGB = (brightness: number): { r: number; g: number; b: number } => {
  // 明るさをスケール (0～254 を 0～1 に正規化)
  const scaledBrightness = Math.min(Math.max(brightness, 0), 100) / 100;

  // 暖色系の色（高輝度時の色）
  const warmLight = { r: 255, g: 180, b: 120 }; // 暖かみのあるオレンジ色
  // ガラス部分の色（低輝度時の色）
  const glassColor = { r: 240, g: 220, b: 200 }; // ガラス越しの淡い色

  // 明るさに基づく線形補間
  const r = Math.round(warmLight.r * scaledBrightness + glassColor.r * (1 - scaledBrightness));
  const g = Math.round(warmLight.g * scaledBrightness + glassColor.g * (1 - scaledBrightness));
  const b = Math.round(warmLight.b * scaledBrightness + glassColor.b * (1 - scaledBrightness));

  return { r, g, b };
};
// WhiteAmbiance モデル用に RGB を生成する関数
export const generateWhiteAmbianceRGB = (ct: number, brightness: number) => {
  const kelvin = 1_000_000 / Math.min(Math.max(ct, 153), 500); // 色温度をケルビンに変換
  const { r, g, b } = kelvinToRgb(kelvin); // ケルビンから RGB に変換
  const scaledBrightness = Math.min(Math.max(brightness, 0), 100) / 100; // 明るさをスケール

  const adjustForBrightness = (rgb: number) => Math.round(rgb * scaledBrightness); // 明るさを適用
  const adjustForWhite = (rgb: number) => Math.round(rgb * scaledBrightness + 240 * (1 - scaledBrightness));

  const [brightnessR, brightnessG, brightnessB] = [r, g, b].map(adjustForBrightness);
  const [whiteR, whiteG, whiteB] = [r, g, b].map(adjustForWhite);

  return { r: brightnessR, g: brightnessG, b: brightnessB, whiteR, whiteG, whiteB };
};

// ケルビン値を RGB に変換する関数
const kelvinToRgb = (kelvin: number): { r: number; g: number; b: number } => {
  const temp = kelvin / 100;
  let red, green, blue;

  if (temp <= 66) {
    red = 255;
    green = Math.min(Math.max(99.4708025861 * Math.log(temp) - 161.1195681661, 0), 255);
    blue = temp <= 19 ? 0 : Math.min(Math.max(138.5177312231 * Math.log(temp - 10) - 305.0447927307, 0), 255);
  } else {
    red = Math.min(Math.max(329.698727446 * Math.pow(temp - 60, -0.1332047592), 0), 255);
    green = Math.min(Math.max(288.1221695283 * Math.pow(temp - 60, -0.0755148492), 0), 255);
    blue = 255;
  }

  return { r: Math.round(red), g: Math.round(green), b: Math.round(blue) };
};
